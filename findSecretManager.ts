import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

// Secrets Managerクライアントのインスタンスを作成
const client = new SecretsManagerClient();

async function getSecret(secretName: string): Promise<string> {
  const command = new GetSecretValueCommand({ SecretId: secretName });

  try {
    const response = await client.send(command);
    // Secrets Managerは、秘密が文字列またはJSON文字列として保存されている可能性があります
    if ("SecretString" in response) {
      return response.SecretString ?? "";
    }
    throw new Error("Secret binary is not handled in this example.");
  } catch (error) {
    console.error("Error retrieving secret:", error);
    throw error;
  }
}

// 使用例
const secretName = "signed-cookie-secret";
getSecret(secretName)
  .then((secretValue) => {
    console.log(secretValue);
  })
  .catch((error) => {
    console.error("Failed to get secret:", error);
  });
