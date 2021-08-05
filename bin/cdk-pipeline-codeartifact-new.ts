#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkPipelineCodeartifactNewStack } from '../lib/cdk-pipeline-codeartifact-new-stack';

const app = new cdk.App();
new CdkPipelineCodeartifactNewStack(app, 'CdkPipelineCodeartifactNewStack');
