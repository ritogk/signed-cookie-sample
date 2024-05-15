#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AllowListStack } from "../lib/allow-list-stack";
import { LambdaEdgeStack } from "../lib/lambda-edge-stack";

const app = new cdk.App();
const lambdaEdgeStack = new LambdaEdgeStack(app, "LambdaEdgeStack", {
  env: {
    region: "us-east-1",
  },
});
const stack = new AllowListStack(app, "AllowListStack", {
  env: {
    region: "ap-northeast-1",
  },
  edgeFunctionVersion: lambdaEdgeStack.edgeFunctionVersion,
  crossRegionReferences: true,
});
