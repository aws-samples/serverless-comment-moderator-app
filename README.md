# Serverless Comment Moderator App

This is an AWS serverless application that uses [AWS Lambda](https://aws.amazon.com/lambda/), [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) and [AWS Comprehend](https://aws.amazon.com/comprehend/) to automatically release positive comments on a [Disqus](https://disqus.com/) forum. The application is scheduled to run every 15 minutes. 

This repo contains a [Serverless Application Model](https://aws.amazon.com/serverless/sam/) (SAM) template that can build and configure all the services automatically in your AWS account. You can deploy the application through the [Serverless Application Repository](https://aws.amazon.com/serverless/serverlessrepo/) from the AWS console or using the [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) on your local machine.

This application is written in Node.js 12.x.

## How it works

* This application creates an [Amazon CloudWatchs Events]( https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/WhatIsCloudWatchEvents.html) rule to trigger the disqusPoller function every 15 minutes.
* The disqusPoller function searches the Disqus forum for unapproved comments (those held in Pending status). The function uses [AWS Comprehend](https://aws.amazon.com/comprehend/) to analyze the sentiment of each comment and stores the results in a DynamoDB table.
* The DynamoDB table invokes the disqusProcessor function when new items are added.
* The disqusProcessor function will check the positive sentiment of the comment - if the score is higher than 0.8 (the range is 0 to 1), the function will use the Disqus API to release the comment.

## Repository file tree

```bash
├── README.MD                   <-- This file
├── disqusPoller                <-- Polling Lambda function
│   └── app.js                  <-- Lambda function code
│   └── package.json            <-- NodeJS dependencies and scripts
├── disqusProcessor             <-- Processing Lambda function
│   └── app.js                  <-- Lambda function code
│   └── package.json            <-- NodeJS dependencies and scripts
├── template.yaml               <-- SAM template
```

## Installation with the Serverless Application Repository

1. [Create an AWS account](https://portal.aws.amazon.com/gp/aws/developer/registration/index.html) if you do not already have one and login.
1. Go to the app's page on the [Serverless Application Repository](https://serverlessrepo.aws.amazon.com/applications/) and click "Deploy".
1. In the Application Settings card, provide an Application name for your reference (this defaults to ‘comment-moderator’).
1. You will also need to provide the required app parameters from Disqus and click "Deploy". These parameters enable the application to authenticate with Disqus and access your forum:
* This application requires an API Key, API Secret and Access Token from Disqus - see https://disqus.com/api/applications/ for information on how to register an application.
* Your registered Disqus application will need "Read, Write, Manage Forums" permissions.

## Manual installation

1. Clone this repo to your local machine using the [git clone command](https://git-scm.com/docs/git-clone).
2. Ensure the SAM CLI is installed on your machine – see https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html.
3.  Open a command prompt or terminal window in the same directory. Create an S3 bucket for the deployment (by replacing the last parameter with a unique bucket name):
```bash
aws s3 mb s3://yourbucketname
```
4. [Package the application](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-package.html):
```bash
sam package --output-template-file packaged.yaml --s3-bucket yourbucketname
```
5. [Deploy the application](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html)
```bash
sam deploy --template-file packaged.yaml --stack-name comment-moderator --capabilities CAPABILITY_IAM --region us-east-1
```
Note that this gives SAM permission to create the necessary IAM roles. If you want to deploy the application in a region other than us-east-1, update the region parameter as needed

## Using this application

The application will run automatically every 15 minutes, processing new unreleased comments in the Disqus forum you specify (you do not need to interact with the application to cause execution).

==============================================

Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.

SPDX-License-Identifier: MIT-0
