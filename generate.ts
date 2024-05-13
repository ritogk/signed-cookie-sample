import { getSignedCookies } from "@aws-sdk/cloudfront-signer";

import * as fs from "fs";

const cloudfrontDistributionDomain = "https://d1ufgkk53fjk8u.cloudfront.net";
// ワイルドカードで複数のファイルを見られるようにした
const s3ObjectKey = "*";
const url = `${cloudfrontDistributionDomain}/${s3ObjectKey}`;
// Private Keyをopensslで生成したものを使用するようにした
const privateKey = fs.readFileSync("./private_key_base64", {
  encoding: "utf-8",
});
const keyPairId = "K1QOTCNUEB4GMO";
const dateLessThan = "2025-01-01";
const dateGreaterThan = "2000-01-01";
const decode = Buffer.from(privateKey, "base64").toString("utf-8");

const cookies = getSignedCookies({
  url,
  keyPairId,
  dateLessThan,
  dateGreaterThan,
  privateKey: decode,
});

const command = `curl -H 'Cookie: CloudFront-Policy=${cookies["CloudFront-Policy"]};CloudFront-Signature=${cookies["CloudFront-Signature"]};CloudFront-Key-Pair-Id=${keyPairId}' ${cloudfrontDistributionDomain}/dog.jpg --output dog.jpg`;
console.log(command);
