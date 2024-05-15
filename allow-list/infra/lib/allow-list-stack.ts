import * as cdk from "aws-cdk-lib";
import {
  aws_s3 as s3,
  aws_s3_deployment as s3Deploy,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins,
  aws_lambda as lambda,
  aws_iam as iam,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { getParameter } from "../core/parameter-store";

interface CloudFrontStackProps extends cdk.StackProps {
  edgeFunctionVersion: lambda.Version;
}

export class AllowListStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CloudFrontStackProps) {
    super(scope, id, props);

    // バケット作成
    const bucket = new s3.Bucket(this, "CreateBucket", {
      bucketName: "rito-cloudfront-test-allow-list-bucket",
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
      // デフォルトのべヘイビアはパスパターンを変えられない。
      defaultBehavior: {
        origin: new aws_cloudfront_origins.S3Origin(bucket, {
          originAccessIdentity: oai,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        edgeLambdas: [
          {
            functionVersion: props.edgeFunctionVersion,
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
          },
        ],
      },
    });
  }
}
