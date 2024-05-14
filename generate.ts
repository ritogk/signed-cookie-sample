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
const decode = Buffer.from(privateKey, "base64").toString("utf-8");
console.log(decode);

const policy = {
  Statement: [
    // {
    //   Resource: `${cloudfrontDistributionDomain}/dog.jpg`,
    //   Condition: {
    //     DateLessThan: {
    //       "AWS:EpochTime": new Date("2025-01-01").getTime() / 1000,
    //     },
    //   },
    // },
    {
      Resource: `${cloudfrontDistributionDomain}/sample/sample/dog2.png`,
      Condition: {
        DateLessThan: {
          "AWS:EpochTime": new Date("2025-01-01").getTime() / 1000,
        },
      },
    },
  ],
};

const policyString = JSON.stringify(policy);

const cookies = getSignedCookies({
  keyPairId,
  privateKey: decode,
  policy: policyString,
});

const command = `curl -H 'Cookie: CloudFront-Policy=${cookies["CloudFront-Policy"]};CloudFront-Signature=${cookies["CloudFront-Signature"]};CloudFront-Key-Pair-Id=${keyPairId}' ${cloudfrontDistributionDomain}/sample/sample/dog2.png --output dog2.png`;
console.log(command);
