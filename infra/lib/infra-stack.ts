import * as cdk from "aws-cdk-lib";
import {
  aws_s3 as s3,
  aws_s3_deployment as s3Deploy,
  aws_cloudfront as cloudfront,
  aws_route53 as route53,
  aws_certificatemanager as acm,
  aws_cloudfront_origins,
  aws_route53_targets as route53_targets,
} from "aws-cdk-lib";

export class InfraStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // バケット作成
    const bucket = new s3.Bucket(this, "CreateBucket", {
      bucketName: "signed-cookie-sampledayo-bucket",
      removalPolicy: cdk.RemovalPolicy.DESTROY, // CDKスタックが削除されたときにバケットを削除する（オプション）
    });

    // バケットに静的ファイルを配置
    new s3Deploy.BucketDeployment(this, "BucketUpload", {
      sources: [s3Deploy.Source.asset("./bucket")],
      destinationBucket: bucket,
    });

    // CloudFrontからS3にアクセスするためのIdentityを作成
    const oai = new cloudfront.OriginAccessIdentity(this, "CreateOai");

    const publicKey: string = `-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAi5wY3xf8UORlHN/HtY4U
    zdZq0kZUrQvnClsayASPJDFSbcsn9ZdKvOip7muPw9g2pDqaWqWQwp3uhf+ZGBzU
    2rCPawvkNe+dDITOsD2WxKk7YBtf72UMDBKMB3xmI/pF3UXF0E16mvdpigttjIxU
    nBANfDHHpN1vsTw80ITKKAiS4irfBIFQM6kk5OQSRzyF2D/5NF+6rz7UQVhxWIHF
    JbNmYG9RQigxD4uk1ANGKInok9/OKf6eO2mimtafb7lQRMqdo3vFCZFIXdsNTlSy
    A+LnHmE9JNsGJp3uEwu+qIQ5oN2jf5DLVZOii5xXm+ewYswLxrTZHBQwFRGW4fpY
    4wIDAQAB
    -----END PUBLIC KEY-----`;
    const pubKey = new cloudfront.PublicKey(this, "MyPubKey", {
      encodedKey: publicKey,
    });
    console.log(pubKey.publicKeyId);

    const keyGroup = new cloudfront.KeyGroup(this, "MyKeyGroup", {
      items: [pubKey],
    });

    // CloudFrontディストリビューションを作成
    const distribution2 = new cloudfront.Distribution(this, "CreateCfDist", {
      defaultRootObject: "index.html",
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      // デフォルトのべヘイビアはパスパターンを変えられない。
      defaultBehavior: {
        origin: new aws_cloudfront_origins.S3Origin(bucket, {
          originAccessIdentity: oai,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        trustedKeyGroups: [keyGroup],
      },
    });
  }
}
