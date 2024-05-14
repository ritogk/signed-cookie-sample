#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InfraStack } from "../lib/infra-stack";

const app = new cdk.App();

const infraStack = new InfraStack(app, "SignedCookieSampleInfraStack", {
  env: {
    region: "ap-northeast-1",
  },
});
infraStack.run();
