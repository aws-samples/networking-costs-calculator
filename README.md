# Welcome to the Networking Costs Calculator Project

This project is a self-hosted calculator to help you estimate AWS networking costs.

## How to use
![Screenshot](frontend/public/img/calc-screenshot.jpg?raw=true "Screenshot")

* Deploy the application using the deployment script (see [How to deploy](#how-to-deploy)). If already deployed, start the web application (`npm start` from the frontend directory)
* Select the AWS Region of interest from the top right dropdown list
* Select the services of interest and see their recurring monthly costs estimation
* Add inputs about data transfer, and see their cost estimation

## Architecture
The calculator has two main components:
* A serverless backend part, that uses the AWS Price List Query APIs to get the updated prices for the relevant networking services. These prices are cached in a DynamoDB table.
* A ReactJS frontend web application, that is the user interface for estimating the costs for various networking services (hosted with S3 and CloudFront).
  
![Architecture](frontend/public/img/fig2_arc.png?raw=true "Architecture")

## Pre-requisites
* A Windows or Linux based OS (use `.\deploy.ps1` for Windows and `./deploy.sh` for Linux)
* NodeJS (version 18 or later) and NPM (version 7.2 or later)
[Node](http://nodejs.org/) and [NPM](https://npmjs.org/) are really easy to install.
To make sure you have them available on your machine,
try running the following command.

```sh
$ npm -v && node -v
10.5.0
v18.18.2
```
* The AWS CDK installed (you can install with `npm install -g aws-cdk`).
```sh
$ cdk --version
2.162.1 (build 10aa526)
```
* If you have never used the AWS CDK in the current account and Region, run bootstrapping with npx cdk bootstrap.
```sh
npx cdk bootstrap aws://123456789012/us-east-1
```
* An AWS Account to run the backend resources, and the AWS CLI (v2) installed and configured.
To make sure the AWS CLI is installed and configured on your machine,
try running the following command. You should get the default user - make sure it has permissions to deploy the backend reosurces.

```sh
$ aws sts get-caller-identity
{
    "UserId": "AIDxxxxxxxxxxxxxxBSBT",
    "Account": "7xxxxxxxxxx2",
    "Arn": "arn:aws:iam::7xxxxxxxxxx2:user/xxxxxxx"
}
```

## How to deploy - Linux OS (Bash)
Run the deployment script from the project's root directory:

```sh
$ ./deploy.sh
```

## How to deploy - Windows OS (PowerShell)
Run the deployment PowerShell script from the project's root directory:

```powershell
$ .\deploy.ps1
```

## How to destroy

```sh
$ cd backend
$ cdk destroy --all
```

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License <a name="License"></a>

This library is licensed under the MIT-0 License. See the LICENSE file.

