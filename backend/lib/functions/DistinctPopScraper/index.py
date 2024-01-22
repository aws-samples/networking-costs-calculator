import boto3
import json
import os

s3 = boto3.client("s3")

def lambda_handler(event, context):
    data = s3.get_object(Bucket=os.environ['netcalc_bucket'], Key='netcalc/distinct_pops.json')
    contents = data['Body'].read().decode("utf-8")
    return json.loads(contents)