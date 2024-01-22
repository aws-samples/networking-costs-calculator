# Welcome to the AWS Networking Costs Calculator Project

This project is a self-hosted calculator to help you estimate AWS networking costs.

## Architecture
The calculator has two main components:
* A serverless backend part, that uses the AWS Price List Query APIs to get the updated prices for the relevant networking services. These prices are cached in a DynamoDB table.
* A ReactJS frontend web application, that is the user interface for estimating the costs for various networking services (runs on your local computer).
![Architecture](frontend/public/img/arch.png?raw=true "Architecture")

## Pre-requisites
* A linux-based OS (no Windows deployment script yet)
* NodeJS (version 18 or later) and NPM.
[Node](http://nodejs.org/) and [NPM](https://npmjs.org/) are really easy to install.
To make sure you have them available on your machine,
try running the following command.

```sh
$ npm -v && node -v
7.24.2
v18.16.1
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

## How to deploy
Run the deployment script from the project's root directory:

```sh
$ ./deploy.sh
```

## How to destroy

```sh
$ cd backend
$ cdk destroy
```

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License <a name="License"></a>

This library is licensed under the MIT-0 License. See the LICENSE file.

