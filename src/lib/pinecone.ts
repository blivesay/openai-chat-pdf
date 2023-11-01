import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
// PDFLoader creates one document per page number by default
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

let pinecone: Pinecone | null = null;

export const getPinecone = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
    });
  }
  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // download and read pdf
  console.log("Downloading pdf into file system");
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("Could not download from S3");
  }
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];
  console.log("PDFLoader loaded", file_name);
  const documents = await Promise.all(
    pages.map((page) => prepareDocument(page))
  );
  const flatDocuments = documents.flat();
  const fileKeyClean = convertToAscii(fileKey);
  const vectors = await Promise.all(
    flatDocuments.map((document) => embedDocument(document, fileKeyClean))
  );
  console.log("created vectors with OpenAI");
  const client = await getPinecone();
  const pineconeIndex = await client.index("pdf-index");
  console.log("inserting vectors into pinecone");
  await pineconeIndex.upsert(vectors);
  return documents[0];
}

async function embedDocument(doc: Document, fileKeyClean: string) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: truncateStringByBytes(doc.pageContent, 30000),
        pageNumber: doc.metadata.pageNumber,
        S3fileKey: fileKeyClean,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent: origPageContent, metadata } = page;
  //remove line breaks
  const pageContent = origPageContent.replace(/\n/g, "");
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        // modified tutorial to add text metadata in function "embedDocument" rather than here. This ensures the text is of the "chunk" relevant to the embedding. In tutorial (at least my experience) the text was of the entire document passed to function "prepareDocument."
      },
    }),
  ]);
  return docs;
}
