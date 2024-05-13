import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

// SSMクライアントのインスタンスを作成
const client = new SSMClient(); // 適切なリージョンを設定

async function getParameter(parameterName: string): Promise<string> {
  const command = new GetParameterCommand({
    Name: parameterName,
    WithDecryption: false, // 暗号化された値を復号する場合はtrue
  });

  try {
    const { Parameter } = await client.send(command);
    return Parameter?.Value ?? ""; // パラメータの値を返す
  } catch (error) {
    console.error("Error retrieving parameter:", error);
    throw error;
  }
}

const parameterName = "signed-cookie-pub";
getParameter(parameterName)
  .then((value) => {
    console.log("Parameter Value:", value);
  })
  .catch((error) => {
    console.error("Failed to get parameter:", error);
  });
