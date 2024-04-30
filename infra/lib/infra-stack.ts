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

    // CloudFrontディストリビューションを作成
    const distribution2 = new cloudfront.Distribution(this, "CreateCfDist", {
      defaultRootObject: "index.html",
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      defaultBehavior: {
        origin: new aws_cloudfront_origins.S3Origin(bucket, {
          originAccessIdentity: oai,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });
  }
}
