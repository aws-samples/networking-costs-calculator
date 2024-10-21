# Navigate to the backend directory and deploy the backend stack
Set-Location -Path "backend"
npm install
New-Item -Path "../frontend/build" -ItemType Directory -Force
cdk deploy NetCalcBackendStack --require-approval never

# Retrieve the outputs from the CloudFormation stack
$NETCALC_API_URL = (aws cloudformation describe-stacks --stack-name NetCalcBackendStack --query "Stacks[0].Outputs[?OutputKey=='apiUrl'].OutputValue" --output text)
$NETCALC_CIDP_ID = (aws cloudformation describe-stacks --stack-name NetCalcBackendStack --query "Stacks[0].Outputs[?OutputKey=='identityPoolId'].OutputValue" --output text)
$NETCALC_SCRAPER_LAMBDA = (aws cloudformation describe-stacks --stack-name NetCalcBackendStack --query "Stacks[0].Outputs[?OutputKey=='pricingScraperLambda'].OutputValue" --output text)
$NETCALC_REGION = $NETCALC_CIDP_ID.Split(":")[0]

# Invoke the scraper Lambda function to populate pricing data
Write-Host "`n`n****************************************************************************"
Write-Host "Invoking the pricing scraper Lambda function for the first time, this may take a few minutes, please wait..."
aws lambda invoke --function-name $NETCALC_SCRAPER_LAMBDA --cli-read-timeout 0 --cli-binary-format raw-in-base64-out tmpresponse.json
Remove-Item tmpresponse.json

# Generate the aws-exports.js file for the frontend
@"
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
"@ | Out-File -FilePath "../frontend/src/aws-exports.js" -Encoding UTF8

# Navigate to the frontend directory, install dependencies, and build the app
Set-Location -Path "../frontend"
npm install
npm run build

# Deploy the frontend stack
Set-Location -Path "../backend"
Remove-Item -Recurse -Force cdk.out
cdk deploy NetCalcFrontendStack --require-approval never
$NETCALC_FRONTEND_URL = (aws cloudformation describe-stacks --stack-name NetCalcFrontendStack --query "Stacks[0].Outputs[?OutputKey=='frontendUrl'].OutputValue" --output text)

Write-Host "**********************************************************************************************************"
Write-Host "The NetCalc app is deployed and the frontend URL can be accessed from $NETCALC_FRONTEND_URL"
