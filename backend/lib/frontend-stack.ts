import * as cdk from 'aws-cdk-lib';


import * as s3 from "aws-cdk-lib/aws-s3";
import {
  CloudFrontToS3,
  CloudFrontToS3Props,
} from "@aws-solutions-constructs/aws-cloudfront-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import path = require('path');

interface FrontendStackProps extends cdk.StackProps {
  readonly apiUrl: string;
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const code = `function handler(event) {
      var response = event.response;
      var headers = response.headers;
  
      // Set HTTP security headers
      // Since JavaScript doesn't allow for hyphens in variable names, we use the dict["key"] notation 
      headers['strict-transport-security'] = { value: 'max-age=63072000; includeSubdomains; preload'}; 
      headers['content-security-policy'] = { value: "default-src 'self' https://cognito-identity.${this.region}.amazonaws.com ${props.apiUrl} img-src 'self' data:;font-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'"}; 
      headers['x-content-type-options'] = { value: 'nosniff'}; 
      headers['x-frame-options'] = {value: 'DENY'}; 
      headers['x-xss-protection'] = {value: '1; mode=block'}; 
  
      // Return the response to viewers 
      return response;
    }`;

    const security_headers = new cloudfront.Function(this, "SecurityHeaders", {
      code: cloudfront.FunctionCode.fromInline(code),
    });

    const CfS3Props: CloudFrontToS3Props = {
      insertHttpSecurityHeaders: false,
      cloudFrontDistributionProps: {
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: "/",
            ttl: cdk.Duration.seconds(10),
          },
        ],
        defaultBehavior: {
          functionAssociations: [
            {
              eventType: cloudfront.FunctionEventType.VIEWER_RESPONSE,
              function: security_headers,
            },
          ],
        },
      },
    };

    const cfS3 = new CloudFrontToS3(this, "CfToS3", CfS3Props);

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../frontend/build'))],
      destinationBucket: cfS3.s3Bucket!,
    });

    new cdk.CfnOutput(this, 'frontendUrl', {
      value: 'https://' + cfS3.cloudFrontWebDistribution.domainName,
      exportName: 'NetCalcFrontendUrl',
    });

  }
}
