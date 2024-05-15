import dayjs from "dayjs";
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
  return request;
};
