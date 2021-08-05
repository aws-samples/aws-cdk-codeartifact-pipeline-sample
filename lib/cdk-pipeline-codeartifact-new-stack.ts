import * as cdk from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as codecommit from '@aws-cdk/aws-codecommit';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as iam from '@aws-cdk/aws-iam';
import * as cfn_inc from '@aws-cdk/cloudformation-include';

export class CdkPipelineCodeartifactNewStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    

// Create CodeArtifact Domain/Repositories

    const cfnTemplate = new cfn_inc.CfnInclude(this, 'CodeArtifactCfn', {
      templateFile: 'lib/ca-template.yaml',
    });

// Create CodeCommit Repository

    const repo = new codecommit.Repository(this, "ca-pipeline-repository", {
      repositoryName: "ca-pipeline-repository",
      description: "ca-pipeline-repository"
    });

    const buildRole = new iam.Role(this, 'JarBuild_CA_Role', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
    });
    
    buildRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: ['*'],
    }));


    // CODEBUILD - project

    const project = new codebuild.Project(this, 'JarBuild_CodeArtifact', {
      projectName: 'JarBuild_CodeArtifact',
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_2,
        privileged: true
      },
      environmentVariables: {
        'Account_Id': {
          value: `${cdk.Aws.ACCOUNT_ID}`
        }
      },      
      role: buildRole,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          pre_build: {
            commands: [
              'pip install --upgrade pip',
              'pip install awscli',
              'pip install requests',
              'pip install boto3',
              'pip install jq',
              'export CODEARTIFACT_AUTH_TOKEN=`aws codeartifact get-authorization-token --domain cdkpipelines-codeartifact --domain-owner $Account_Id --query authorizationToken --output text`',
            ],
          },
          build: {
            commands: [
              'cp settings.xml /root/.m2/settings.xml',
              'cp pom.xml /root/.m2/pom.xml',
              'mvn -X -f pom.xml clean compile',
              'mvn -X -s settings.xml clean package deploy',
         
            ],
          },
          post_build: {
            commands: [
              'bash -c "if [ /"$CODEBUILD_BUILD_SUCCEEDING/" == /"0/" ]; then exit 1; fi"',
              'echo Build completed on `date`',
            ]
          }
        },
        artifacts: {
          files: [
            '*',
          ],
        },
        cache: {
          paths: [
            "'/root/.m2/**/*'.",
          ],
        },
      })
    });


        // CODEBUILD - project

        const deployproject = new codebuild.Project(this, 'JarDeploy_Lambda_Function', {
          projectName: 'JarDeploy_Lambda_Function',
          role: buildRole,
          environment: {
            buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_2,
            privileged: true
          },
          environmentVariables: {
            'Account_Id': {
              value: `${cdk.Aws.ACCOUNT_ID}`
            }
          },          
          buildSpec: codebuild.BuildSpec.fromObject({
            version: "0.2",
            phases: {
              pre_build: {
                commands: [
                  'echo "Check if the JAR file exists on the CodeArtifact Repository"',
                  'aws codeartifact list-package-versions \
                  --domain cdkpipelines-codeartifact \
                  --repository cdkpipelines-codeartifact-repository \
                  --namespace JavaEvents --format maven --package JavaEvents',
                ]
              },
              build: {
                commands: [
                  'echo "Lambda Deploy Stage"',
                  'echo "List the Latest SNAPSHOT Package code"',
                  'ListLatestArtifact=$(aws codeartifact list-package-version-assets --domain cdkpipelines-codeartifact --domain-owner $Account_Id --repository cdkpipelines-codeartifact-repository --namespace JavaEvents --format maven --package JavaEvents --package-version "1.0-SNAPSHOT"| jq -r ".assets[].name"|grep jar)',  
                  'aws codeartifact get-package-version-asset --domain cdkpipelines-codeartifact --repository cdkpipelines-codeartifact-repository --format maven --package JavaEvents --package-version 1.0-SNAPSHOT --namespace JavaEvents --asset $ListLatestArtifact demooutput',
                ]
              },
              post_build: {
                commands: [
                  'bash -c "if [ /"$CODEBUILD_BUILD_SUCCEEDING/" == /"0/" ]; then exit 1; fi"',
                  'aws lambda update-function-code --function-name codeartifact-test-function --zip-file fileb://demooutput'
                ]
              }
            },
          })
        });
    
// Create CodePipeline    

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();
    const deployOutput = new codepipeline.Artifact();

    const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: 'Source_CodeCommit',
      repository: repo,
      branch: 'main',
      output: sourceOutput
    });

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild',
      project: project,
      input: sourceOutput,
      outputs: [buildOutput], 
    });

    const manualApprovalAction = new codepipeline_actions.ManualApprovalAction({
      actionName: 'Approve',
    });

    const deployAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild',
      project: deployproject,
      input: buildOutput,
      outputs: [deployOutput], 
    });

    new codepipeline.Pipeline(this, 'codeartifact-pipeline', {
      stages: [
        {
          stageName: 'Source_CodeCommit',
          actions: [sourceAction],
        },
        {
          stageName: 'Build_JAR_CodeArtifact',
          actions: [buildAction],
        },
        {
          stageName: 'Manual_Approval',
          actions: [manualApprovalAction],
        },
        {
          stageName: 'Deploy-to-Lambda',
          actions: [deployAction],
        }
      ]
    });


  }
}
