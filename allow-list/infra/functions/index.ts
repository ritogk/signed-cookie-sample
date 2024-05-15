import dayjs from "dayjs";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

export const handler = async (event: any): Promise<any> => {
  console.log("Lambda@Edge function triggered");
  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
  console.log("現在の日時:", now);
  const region = process.env.AWS_REGION;
  console.log(`This function is running in region: ${region}`);
  const request = event.Records[0].cf.request;
  if (request.uri === "/dog-sample.jpg") {
    return {
      status: "403",
      statusDescription: "Forbidden",
      body: "Access denied",
      headers: {
        "content-type": [
          {
            key: "Content-Type",
            value: "text/plain",
          },
        ],
      },
    };
  }

  const parameterName = "/cloudfront/edge/public-key";
  const client = new SSMClient(); // 適切なリージョンを設定
  const command = new GetParameterCommand({
    Name: parameterName,
    WithDecryption: false, // 暗号化された値を復号する場合はtrue
  });

  try {
    const { Parameter } = await client.send(command);
    console.log(Parameter?.Value ?? "");
  } catch (error) {
    console.error("Error retrieving parameter:", error);
    throw error;
  }
  return request;
};
