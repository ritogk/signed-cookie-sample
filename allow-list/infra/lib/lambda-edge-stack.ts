import * as cdk from "aws-cdk-lib";
import {
  aws_s3 as s3,
  aws_s3_deployment as s3Deploy,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambdaNodeJs,
  aws_iam as iam,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
// import { getParameter } from "../core/parameter-store";

export class LambdaEdgeStack extends cdk.Stack {
  public edgeFunctionVersion: lambda.Version;
  public edgeFunction: cdk.aws_lambda_nodejs.NodejsFunction;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Lambda@Edgeの関数を作成
    const edgeFunction = new lambdaNodeJs.NodejsFunction(this, "EdgeFunction", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_16_X, // Node.js 16.x ランタイムを使用
      handler: "handler", // ハンドラー関数名
      entry: path.join(__dirname, "..", "functions", "index.ts"), // エントリーファイルのパス
      bundling: {
        externalModules: ["aws-sdk"], // 'aws-sdk'はLambda環境にデフォルトで含まれている
      },
      role: new iam.Role(this, "EdgeLambdaRole", {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
          ),
        ],
      }),
    });

    const parameterStorePolicy = new iam.PolicyStatement({
      actions: ["ssm:GetParameter", "ssm:GetParameters"],
      resources: [
        "arn:aws:ssm:ap-northeast-1:788594208758:parameter/cloudfront/edge/public-key",
      ],
    });
    edgeFunction.addToRolePolicy(parameterStorePolicy);

    // currentVersionを使うと、変更があった時に勝手にバージョンを上げてくれる。
    this.edgeFunctionVersion = edgeFunction.currentVersion;
    // const uniqueVersionId = `${new Date().getTime()}`;
    // this.edgeFunctionVersion = new lambda.Version(
    //   this,
    //   `EdgeLambdaVersion-${uniqueVersionId}`,
    //   {
    //     lambda: edgeFunction,
    //   }
    // );
  }
}
