# AWS-CDK-CODEARTIFACT-PIPELINE-SAMPLE

## Overview

Developing and deploying applications rapidly to users requires a working pipeline that accepts the user code (usually via a Git repository). AWS CodeArtifact was announced in 2020. It’s a secure and scalable artifact management product that easily integrates with other AWS products and services. CodeArtifact allows you to publish, store, and view packages, list package dependencies, and share your application’s packages.

This repository wil help build a simple DevOps pipeline for a sample JAVA application (JAR file) to be built with Maven. The Pipeline is built on a sample Java application called [**java-events**](https://github.com/awsdocs/aws-lambda-developer-guide/tree/main/sample-apps/java-events). You can find numerous sample applications on GitHub [here](https://github.com/awsdocs/aws-lambda-developer-guide/tree/main/sample-apps).

## Prerequisites

This solution is built on AWS CDK. Please go through below webpages to setup initial CDK Toolkit and other important tools -

1. https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html#getting_started_prerequisites

2. https://intro-to-cdk.workshop.aws/

3. https://cdkworkshop.com/

4. https://cdkworkshop.com/15-prerequisites.html


## Setup

Clone the GitHub repository as follows:
```
git clone https://github.com/aws-samples/aws-cdk-codeartifact-pipeline-sample.git
```
## Deploy the Pipeline

The AWS CDK code requires the following packages in order to build the CI/CD pipeline:
```
@aws-cdk/core

@aws-cdk/aws-codepipeline

@aws-cdk/aws-codepipeline-actions

@aws-cdk/aws-codecommit

@aws-cdk/aws-codebuild

@aws-cdk/aws-iam

@aws-cdk/cloudformation-include
```
## Install the required AWS CDK packages as below:
```
npm i @aws-cdk/core @aws-cdk/aws-codepipeline @aws-cdk/aws-codepipeline-actions @aws-cdk/aws-codecommit @aws-cdk/aws-codebuild @aws-cdk/pipelines @aws-cdk/aws-iam @ @aws-cdk/cloudformation-include
```
## Compile the AWS CDK code:
```
npm run build
```
## Deploy the AWS CDK code:
```
cdk synth
cdk deploy
```


## Security
See CONTRIBUTING.md for more information.

## Code Of Conduct
See CODE_OF_CONDUCT.md for more information.

## License
This project is licensed under the MIT-0 License.