import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  try {
    //remove line breaks
    const newText1 = text.replace(/^\s*[\r\n]/gm, " ");
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: newText1,
    });
    const result = await response.json();
    return result.data[0].embedding as number[];
  } catch (error) {
    console.log("error OpenAIApi", error);
    throw error;
  }
}
