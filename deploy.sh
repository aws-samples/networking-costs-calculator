#!/bin/bash

#deploy backend with cdk
cd backend
npm install
mkdir -p ../frontend/build
cdk deploy NetCalcBackendStack --require-approval never

#get the outputs from the stack
export NETCALC_API_URL=`aws cloudformation describe-stacks --stack-name NetCalcBackendStack --query "Stacks[0].Outputs[?OutputKey=='apiUrl'].OutputValue" --output text`
export NETCALC_CIDP_ID=`aws cloudformation describe-stacks --stack-name NetCalcBackendStack --query "Stacks[0].Outputs[?OutputKey=='identityPoolId'].OutputValue" --output text`
export NETCALC_SCRAPER_LAMBDA=`aws cloudformation describe-stacks --stack-name NetCalcBackendStack --query "Stacks[0].Outputs[?OutputKey=='pricingScraperLambda'].OutputValue" --output text`
arrIN=(${NETCALC_CIDP_ID//:/ })
export NETCALC_REGION=${arrIN[0]}

#run the scraper lambda function for the first time to populate the pricing data
echo -e '\n\n****************************************************************************\nInvoking the pricing scraper Lambda function for the first time, this make take a few minutes, please wait...\n'
aws lambda invoke --function-name $NETCALC_SCRAPER_LAMBDA --cli-read-timeout 0 --cli-binary-format raw-in-base64-out tmpresponse.json
rm -f tmpresponse.json

#generate the frontend aws-exports.js file
cat <<EOF > ../frontend/src/aws-exports.js
// WARNING: DO NOT EDIT. This file is automatically generated and may be overwritten.
const awsconfig = {
    "aws_project_region": "$NETCALC_REGION",
    "aws_cognito_identity_pool_id": "$NETCALC_CIDP_ID",
    "aws_cognito_region": "$NETCALC_REGION",
    "aws_appsync_graphqlEndpoint": "$NETCALC_API_URL",
    "aws_appsync_region": "$NETCALC_REGION",
    "aws_appsync_authenticationType": "AWS_IAM",
    "API": {
        "NetCalcAPI": {
            "endpoint": "$NETCALC_API_URL",
            "authMode": "iam"
        }
    }
};

export default awsconfig;
EOF

#install the frontend dependencies and build the react the app
cd ../frontend
npm install
npm run build

#deploy the frontend
cd ../backend
rm -rf cdk.out
cdk deploy NetCalcFrontendStack --require-approval never
export NETCALC_FRONTEND_URL=`aws cloudformation describe-stacks --stack-name NetCalcFrontendStack --query "Stacks[0].Outputs[?OutputKey=='frontendUrl'].OutputValue" --output text`

echo "**********************************************************************************************************"
echo The NetCalc app is deployed and the frontend URL can be accessed from $NETCALC_FRONTEND_URL