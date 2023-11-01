import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

export async function downloadFromS3(file_key: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      },
      region: "us-east-1",
    });
    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
    };
    const getObj = new GetObjectCommand(params);

    try {
      const obj = await s3.send(getObj);
      // Create directory path
      const directoryPath = path.join(__dirname, "tmp");
      // Create the directory if it doesn't exist
      fs.mkdirSync(directoryPath, { recursive: true });
      // name downloaded file
      const file_name = path.join(
        directoryPath,
        `user${Date.now().toString()}.pdf`
      );

      if (obj.Body instanceof require("stream").Readable) {
        const file = fs.createWriteStream(file_name);
        file.on("open", function () {
          // @ts-ignore
          obj.Body?.pipe(file).on("finish", () => {
            return resolve(file_name);
          });
        });
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  });
}
