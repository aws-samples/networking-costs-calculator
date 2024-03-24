import boto3
import json
import pprint
import os

pricing = boto3.client('pricing', region_name='us-east-1')
dynamodb = boto3.client('dynamodb')
s3 = boto3.resource("s3")

def lambda_handler(event, context):
    getTgwPrices()
    getDTPrices("InterRegion Outbound")
    getDTPrices("IntraRegion")
    getDxPrices()
    getDtoInternetPrices()
    getClientVpnPrices('ClientVPNEndpoints')
    getClientVpnPrices('ClientVPNConnections')
    getNatGatewayPrices('Hourly charge for NAT Gateways')
    getNatGatewayPrices('Charge for per GB data processed by NatGateways')
    getLBPrices('Load Balancer-Network')
    getLBPrices('Load Balancer-Application')
    getLBPrices('Load Balancer-Gateway')
    getLBEndpointPrices('VpcEndpoint') #Load Balancer endpoits and VPC Endpoints
    getR53DNSqPrices('DNS Query')
    getR53DNSqPrices('DNS Domain Names')
    getNFPrices('AWS Firewall')
    getDXPrices('Dedicated')

    return {
        'statusCode': 200,
        'body': json.dumps('Executed successfully!')
    }

def getDtoInternetPrices():
    serviceCode = 'AWSDataTransfer'
    nexttoken = "START"
    filters = [{'Type' :'TERM_MATCH', 'Field':'transferType', 'Value': 'AWS Outbound'}]
    while nexttoken != "":
        args = {"ServiceCode": serviceCode, "Filters": filters, "MaxResults": 100}
        if nexttoken != "START":
            args["NextToken"] = nexttoken
        response = pricing.get_products(**args)
        nexttoken =  response.get ('NextToken',"")
        for price in response['PriceList']:
            price_obj = json.loads(price)
            od = price_obj['terms']['OnDemand']
            key = list(od.keys())[0]
            p = od[key] #first OnDemand Object
            try:
                pricePerUnit = getHighestPriceFromDimensions(p)
                price_id = "DTO_Internet--" + price_obj['product']['attributes']['fromLocation']
                dynamodb.put_item(TableName=os.environ['pricing_table'], Item={
                    'pricing_id': {'S': price_id},
                    'pricePerUnit': {'N':pricePerUnit}
                })
            except Exception:
                pass

            
def getHighestPriceFromDimensions(p):
    pdims = list(p['priceDimensions'].keys())
    max = 0.0
    for pdim in pdims:
        price = float(p['priceDimensions'][pdim]['pricePerUnit']['USD'])
        if price>max:
            max = price
    return str(max)
    
def getDxPrices():
    serviceCode = 'AWSDirectConnect'
    nexttoken = "START"
    ### First step - get data transfer prices:
    filters = [
                {'Type' :'TERM_MATCH', 'Field':'productFamily', 'Value': 'Data Transfer'}
            ]
    while nexttoken != "":
        args = {"ServiceCode": serviceCode, "Filters": filters, "MaxResults": 100}
        if nexttoken != "START":
            args["NextToken"] = nexttoken
        response = pricing.get_products(**args)        
        nexttoken =  response.get ('NextToken',"")
        for price in response['PriceList']:
            try:
                price_obj = json.loads(price)
                getOnDemandPriceDx(price_obj)
            except Exception:
                pass

    ### Second step - create the PoP list and save to S3:
    ALL_POPS_DICT = dict()
    filters = [ {'Type' :'TERM_MATCH', 'Field':'operation', 'Value': 'CreateDirectConnectPort'} ]
    nexttoken = "START"
    while nexttoken != "":
        args = {"ServiceCode": serviceCode, "Filters": filters, "MaxResults": 100}
        if nexttoken != "START":
            args["NextToken"] = nexttoken
        response = pricing.get_products(**args)        
        nexttoken =  response.get ('NextToken',"")
        for price in response['PriceList']:
            price_obj = json.loads(price)
            ALL_POPS_DICT[price_obj['product']['attributes']['directConnectLocation']] = {"pop": price_obj['product']['attributes']['directConnectLocation'], "region":  price_obj['product']['attributes']['location']}
    
    #Save POPs to S3:
    string = json.dumps(list(ALL_POPS_DICT.values()))
    #print(string)
    encoded_string = string.encode("utf-8")
    bucket_name = os.environ['netcalc_bucket']
    file_name = "distinct_pops.json"
    s3_path = "netcalc/" + file_name
    s3.Bucket(bucket_name).put_object(Key=s3_path, Body=encoded_string)



def getOnDemandPriceDx(price_obj):
    od = price_obj['terms']['OnDemand']
    key = list(od.keys())[0]
    p = od[key] #first OnDemand Object
    pricePerUnit = getHighestPriceFromDimensions(p)
    price_id = None
    if price_obj['product']['attributes']['transferType'].startswith("InterRegion Outbound"):
        price_id = ("DX_DT_InterRegion--" +
                    price_obj['product']['attributes']['fromLocation'] + "---" + 
                    price_obj['product']['attributes']['toLocation']); 
    elif price_obj['product']['attributes']['transferType'].startswith("IntraRegion Outbound"):
        price_id = ("DX_DT_IntraRegion--" +
                    price_obj['product']['attributes']['fromLocation'] + "---" + 
                    price_obj['product']['attributes']['toLocation']); 
    if price_id:
        dynamodb.put_item(TableName=os.environ['pricing_table'], Item={
            'pricing_id': {'S': price_id},
            'pricePerUnit': {'N':pricePerUnit}
        })        

def getDTPrices(filter):
    serviceCode = 'AmazonEC2'
    nexttoken = "START"
    filters = [
                {'Type' :'TERM_MATCH', 'Field':'transferType', 'Value':filter}
                ]
    pp = pprint.PrettyPrinter(indent=1, width=300)
    
    while nexttoken != "":
        args = {"ServiceCode": serviceCode, "Filters": filters, "MaxResults": 100}
        if nexttoken != "START":
            args["NextToken"] = nexttoken
        response = pricing.get_products(**args)        
        nexttoken =  response.get ('NextToken',"")
        for price in response['PriceList']:
            price_obj = json.loads(price)
            getOnDemandPrice(price_obj, "DT")


def getTgwPrices():
    serviceCode = 'AmazonVPC'
    nexttoken = "START"
    filters = [
                {'Type' :'TERM_MATCH', 'Field':'group', 'Value':'AWSTransitGateway'}
                ]
    pp = pprint.PrettyPrinter(indent=1, width=300)
    
    while nexttoken != "":
        args = {"ServiceCode": serviceCode, "Filters": filters, "MaxResults": 100}
        if nexttoken != "START":
            args["NextToken"] = nexttoken
        response = pricing.get_products(**args)        
        nexttoken =  response.get ('NextToken',"")
        for price in response['PriceList']:
            try:
                price_obj = json.loads(price)
                if price_obj['product']['attributes']['groupDescription'].lower().startswith("hourly"):
                    getOnDemandPrice(price_obj, "att")
                elif "per GB".lower() in price_obj['product']['attributes']['groupDescription'].lower():
                    getOnDemandPrice(price_obj, "pergb")    
            except Exception:
                pass

    ### Second step - get the price for Site-to-Site VPN Connection hour
    filters = [
                {'Type' :'TERM_MATCH', 'Field':'endpointType', 'Value':'IPsec'}
                ]
    pp = pprint.PrettyPrinter(indent=1, width=300)
    
    nexttoken = "START"
    while nexttoken != "":
        args = {"ServiceCode": serviceCode, "Filters": filters, "MaxResults": 100}
        if nexttoken != "START":
            args["NextToken"] = nexttoken
        response = pricing.get_products(**args)        
        nexttoken =  response.get ('NextToken',"")
        for price in response['PriceList']:
            try:
                price_obj = json.loads(price)
                if price_obj['product']['attributes']['operation'].lower().startswith("createvpnconnection"):
                    getOnDemandPrice(price_obj, "vpnh")
                
            except Exception:
                pass




def getOnDemandPrice(price_obj, code):
    pp = pprint.PrettyPrinter(indent=1, width=300)
    od = price_obj['terms']['OnDemand']
    key = list(od.keys())[0]
    p = od[key] #first OnDemand Object
    pd_key = list(p['priceDimensions'].keys())[0]
    #print(p['priceDimensions'][pd_key]['pricePerUnit'].get('USD'))
    pricePerUnit = p['priceDimensions'][pd_key]['pricePerUnit'].get('USD')
    if(pricePerUnit is None):
        pricePerUnit = p['priceDimensions'][pd_key]['pricePerUnit'].get('CNY')
    #print(price_obj['product']['attributes']['groupDescription'] + ', ' + price_obj['product']['attributes']['location'] + ': ' + pricePerUnit + ' USD')
    groupDescription = ""
    if "groupDescription" in price_obj['product']['attributes']:
        groupDescription = price_obj['product']['attributes']['groupDescription'];
    
    if not groupDescription and ("transferType" in price_obj['product']['attributes']) and price_obj['product']['attributes']['transferType'].startswith("InterRegion"):
        price_id = ("DT_InterRegion--" +
                    price_obj['product']['attributes']['fromLocation'] + "---" + 
                    price_obj['product']['attributes']['toLocation']); 
    elif not groupDescription and ("transferType" in price_obj['product']['attributes']) and price_obj['product']['attributes']['transferType'].startswith("IntraRegion"):
        price_id = ("DT_IntraRegion--" +
                    price_obj['product']['attributes']['fromLocation'] + "---" + 
                    price_obj['product']['attributes']['toLocation']); 
    else:
        attachment_code = code + "_vpc"
        if "Site-to-Site VPN".lower() in groupDescription.lower():
            attachment_code = code + "_vpn"
        elif "Direct Connect Gateway".lower() in groupDescription.lower():
            attachment_code = code + "_dx"
        elif "Client VPN connections".lower() in groupDescription.lower():
            #print('Connections')
            attachment_code = code + "_cvpn"
        elif "Client VPN Endpoints".lower() in groupDescription.lower():
            #print('Endpoints')
            attachment_code = code + "_endp_cvpn"
        elif "Hourly charge for NAT Gateways".lower() in groupDescription.lower():
            attachment_code = code + "_natg"
        elif "Charge for per GB data processed by NatGateways".lower() in groupDescription.lower():
            attachment_code = code + "_natg"
        elif "hourly usage by Network Load Balancer".lower() in groupDescription.lower():
            attachment_code = code + "_nlb"
        elif "hourly usage by Application Load Balancer".lower() in groupDescription.lower():
            attachment_code = code + "_alb"
        elif "Used Application load balancer capacity units-hr".lower() in groupDescription.lower():
            attachment_code = code + "_alb"
        elif "Used Network load balancer capacity units-hr".lower() in groupDescription.lower():
            attachment_code = code + "_nlb"
        elif "Used Gateway Load Balancer capacity units-hr".lower() in groupDescription.lower():
            attachment_code = code + "_glb"
        elif "hourly usage by Gateway Load Balancer".lower() in groupDescription.lower():
            attachment_code = code + "_glb"
        elif "AWS Gateway Load Balancer VPC Endpoint".lower() in groupDescription.lower():
            attachment_code = code + "_glb"
        elif "Hourly charge for VPC Endpoints".lower() in groupDescription.lower():
            attachment_code = code +'_vpce'
        price_id = attachment_code + "--" + price_obj['product']['attributes']['location']
    
    #print(price_id + " " + pricePerUnit)
    dynamodb.put_item(TableName=os.environ['pricing_table'], Item={
        'pricing_id': {'S': price_id},
        'pricePerUnit': {'N':pricePerUnit}
    })

def getClientVpnPrices(usageType):
    serviceCode = 'AmazonVPC'
    nexttoken = "START"
    filters = [
                {'Type' :'TERM_MATCH', 'Field':'group', 'Value':'AWSClientVPN'},
                {'Type' :'TERM_MATCH', 'Field':'operation', 'Value':usageType }
                ]
    pp = pprint.PrettyPrinter(indent=1, width=300)
    
    while nexttoken != "":
        args = {"ServiceCode": serviceCode, "Filters": filters, "MaxResults": 100}
        if nexttoken != "START":
            args["NextToken"] = nexttoken
        response = pricing.get_products(**args)        
        nexttoken =  response.get ('NextToken',"")
        for price in response['PriceList']:
            price_obj = json.loads(price)
            if price_obj['product']['attributes']['groupDescription'].lower().startswith("hourly"):
                getOnDemandPrice(price_obj, "att")
            elif "per GB".lower() in price_obj['product']['attributes']['groupDescription'].lower():
                getOnDemandPrice(price_obj, "pergb")    
                
def getNatGatewayPrices(usageType):
    serviceCode = 'AmazonEC2'
    nexttoken = "START"
    filters = [
                {'Type' :'TERM_MATCH', 'Field':'productFamily', 'Value':'NAT Gateway'},
                {'Type' :'TERM_MATCH', 'Field':'groupDescription', 'Value':usageType}
                ]
    pp = pprint.PrettyPrinter(indent=1, width=300)
    
    while nexttoken != "":
        args = {"ServiceCode": serviceCode, "Filters": filters, "MaxResults": 100}
        if nexttoken != "START":
            args["NextToken"] = nexttoken
        response = pricing.get_products(**args)        
        nexttoken =  response.get ('NextToken',"")
        for price in response['PriceList']:
            price_obj = json.loads(price)
            if price_obj['product']['attributes']['groupDescription'].lower().startswith("hourly"):
                getOnDemandPrice(price_obj, "att")
            elif "per GB".lower() in price_obj['product']['attributes']['groupDescription'].lower():
                getOnDemandPrice(price_obj, "pergb")   

def getLBEndpointPrices(usageType):
    serviceCode = 'AmazonVPC'
    nexttoken = "START"
    filters = [
                {'Type' :'TERM_MATCH', 'Field':'productFamily', 'Value':usageType},
                ]
    pp = pprint.PrettyPrinter(indent=1, width=300)
    
    while nexttoken != "":
        args = {"ServiceCode": serviceCode, "Filters": filters, "MaxResults": 100}
        if nexttoken != "START":
            args["NextToken"] = nexttoken
        response = pricing.get_products(**args)        
        nexttoken =  response.get ('NextToken',"")
        for price in response['PriceList']:
            price_obj = json.loads(price)
            if price_obj['product']['attributes']['groupDescription'].lower().startswith("hourly charge for"):
                test = 1
                #getOnDemandPrice(price_obj, "att")
            elif "per GB data processed by VPC Endpoints".lower() in price_obj['product']['attributes']['groupDescription'].lower():
                getOnDemandVPCEndpointPrices(price_obj, "pergb_vpce")
            elif " GB data processed by AWS Gateway".lower() in price_obj['product']['attributes']['groupDescription'].lower():
                test = 2
                #getOnDemandPrice(price_obj, "pergb")   
                
def getLBPrices(usageType):
    serviceCode = 'AWSELB'
    nexttoken = "START"
    filters = [
                {'Type' :'TERM_MATCH', 'Field':'productFamily', 'Value':usageType},
                ]
    pp = pprint.PrettyPrinter(indent=1, width=300)
    
    while nexttoken != "":
        args = {"ServiceCode": serviceCode, "Filters": filters, "MaxResults": 100}
        if nexttoken != "START":
            args["NextToken"] = nexttoken
        response = pricing.get_products(**args)        
        nexttoken =  response.get ('NextToken',"")
        for price in response['PriceList']:
            price_obj = json.loads(price)
            if price_obj['product']['attributes']['groupDescription'].lower().startswith("loadbalancer hourly"):
                getOnDemandPrice(price_obj, "att")
            elif "Load Balancer capacity units-hr".lower() in price_obj['product']['attributes']['groupDescription'].lower():
                getOnDemandPrice(price_obj, "plcu")
            elif "per GB".lower() in price_obj['product']['attributes']['groupDescription'].lower():
                getOnDemandPrice(price_obj, "pergb")                   
                
def getOnDemandVPCEndpointPrices(price_obj, code):
    
    pp = pprint.PrettyPrinter(indent=1, width=300)
    od = price_obj['terms']['OnDemand']
    key = list(od.keys())[0]
    p = od[key] #first OnDemand Object
    pd_key = list(p['priceDimensions'].keys())
    
    for pricing in pd_key:
        pricePerUnit = p['priceDimensions'][pricing]['pricePerUnit'].get('USD')
        if(pricePerUnit is None):
            pricePerUnit = p['priceDimensions'][pricing]['pricePerUnit'].get('CNY')
        #print(price_obj['product']['attributes']['groupDescription'] + ', ' + price_obj['product']['attributes']['location'] + ': ' + pricePerUnit + ' USD')
        
        groupDescription = p['priceDimensions'][pricing]['description'];
        attachment_code = ""
        if "upto 1 PB monthly data processed by VPC Endpoints".lower() in groupDescription.lower():
            attachment_code = code + "_lm1" # ol stand for Over Limit
        elif "more than 1 PB and less than 5 PB monthly data processed by VPC Endpoints".lower() in groupDescription.lower():
            attachment_code = code + "_lm2" #ul stands for Under Limit
        if "more than 5 PB monthly data processed by VPC Endpoints".lower() in groupDescription.lower():
            attachment_code = code + "_lm3" # ol stand for Over Limit
        
        if attachment_code!="":
            price_id = attachment_code + "--" + price_obj['product']['attributes']['location']        
            #print(price_id + " " + pricePerUnit)
            dynamodb.put_item(TableName=os.environ['pricing_table'], Item={
                'pricing_id': {'S': price_id},
                'pricePerUnit': {'N':pricePerUnit}
            })
                

def getOnDemandPriceR53DNSq(price_obj, code):
    pp = pprint.PrettyPrinter(indent=1, width=300)
    od = price_obj['terms']['OnDemand']
    key = list(od.keys())[0]
    p = od[key] #first OnDemand Object
    pd_key = list(p['priceDimensions'].keys())
    
    for pricing in pd_key:
        pricePerUnit = p['priceDimensions'][pricing]['pricePerUnit'].get('USD')
        if(pricePerUnit is None):
            pricePerUnit = p['priceDimensions'][pricing]['pricePerUnit'].get('CNY')
        #print(price_obj['product']['attributes']['groupDescription'] + ', ' + price_obj['product']['attributes']['location'] + ': ' + pricePerUnit + ' USD')
        
        groupDescription = p['priceDimensions'][pricing]['description'];
        
        attachment_code = ""
        if "resolver queries over 1 Billion queries".lower() in groupDescription.lower():
            attachment_code = code + "_ol" # ol stand for Over Limit
        elif "resolver queries for the first 1 Billion queries".lower() in groupDescription.lower():
            attachment_code = code + "_ul" #ul stands for Under Limit
        if "firewall over 1 Billion queries".lower() in groupDescription.lower():
            attachment_code = code + "_ol" # ol stand for Over Limit
        elif "firewall for the first 1 Billion queries".lower() in groupDescription.lower():
            attachment_code = code + "_ul" #ul stands for Under Limit
        elif "Resolver Network Interface".lower() in groupDescription.lower():
            attachment_code = code + "_endp" # endp stand for ENDPoint
        elif "per DomainName stored within domain lists".lower() in groupDescription.lower():
            attachment_code = code + "_pdmn" #pdmn stands for PerDoMainName
        
        if attachment_code!="":
            price_id = attachment_code + "--" + price_obj['product']['attributes']['location']
            #print(price_id + " " + pricePerUnit)
            dynamodb.put_item(TableName=os.environ['pricing_table'], Item={
                'pricing_id': {'S': price_id},
                'pricePerUnit': {'N':pricePerUnit}
            })
    
def getR53DNSqPrices(usageType):
    serviceCode = 'AmazonRoute53'
    nexttoken = "START"
    filters = [
                {'Type' :'TERM_MATCH', 'Field':'productFamily', 'Value':usageType},
                ]
    pp = pprint.PrettyPrinter(indent=1, width=300)
    
    while nexttoken != "":
        args = {"ServiceCode": serviceCode, "Filters": filters, "MaxResults": 100}
        if nexttoken != "START":
            args["NextToken"] = nexttoken
        response = pricing.get_products(**args)        
        nexttoken =  response.get ('NextToken',"")
        #print(response['PriceList'])
        for price in response['PriceList']:
            price_obj = json.loads(price)
            #print(price_obj)
            try:
                if "Queries".lower() in price_obj['product']['attributes']['description'].lower():
                    #print(price_obj)
                    getOnDemandPriceR53DNSq(price_obj, "dnsr")
                if "Endpoint".lower() in price_obj['product']['attributes']['description'].lower():
                    #print(price_obj)
                    getOnDemandPriceR53DNSq(price_obj, "att_dnsr")
                if "DNS Firewall".lower() in price_obj['product']['attributes']['description'].lower():
                    getOnDemandPriceR53DNSq(price_obj, "dnsfw")
                
            except:
                test = 1

def getOnDemandPriceNF(price_obj, code):
    pp = pprint.PrettyPrinter(indent=1, width=300)
    od = price_obj['terms']['OnDemand']
    key = list(od.keys())[0]
    p = od[key] #first OnDemand Object
    pd_key = list(p['priceDimensions'].keys())
    
    for pricing in pd_key:
        pricePerUnit = p['priceDimensions'][pricing]['pricePerUnit'].get('USD')
        if(pricePerUnit is None):
            pricePerUnit = p['priceDimensions'][pricing]['pricePerUnit'].get('CNY')
        #print(price_obj['product']['attributes']['groupDescription'] + ', ' + price_obj['product']['attributes']['location'] + ': ' + pricePerUnit + ' USD')
        
        groupDescription = p['priceDimensions'][pricing]['description']
        
        attachment_code = ""
        if "per endpoint hour for AWS Network Firewall".lower() in groupDescription.lower():
            attachment_code = code + "_nwfw" #
        elif "per GB processed by AWS Network Firewall".lower() in groupDescription.lower():
            attachment_code = code + "_nwfw"
        
        if attachment_code!="":
            price_id = attachment_code + "--" + price_obj['product']['attributes']['location']        
            #print(price_id + " " + pricePerUnit)
            dynamodb.put_item(TableName=os.environ['pricing_table'], Item={
                'pricing_id': {'S': price_id},
                'pricePerUnit': {'N':pricePerUnit}
            })
        
def getNFPrices(usageType):
    serviceCode = 'AWSNetworkFirewall'
    nexttoken = "START"
    filters = [
                {'Type' :'TERM_MATCH', 'Field':'productFamily', 'Value':usageType},
                ]
    pp = pprint.PrettyPrinter(indent=1, width=300)
    
    while nexttoken != "":
        args = {"ServiceCode": serviceCode, "Filters": filters, "MaxResults": 100}
        if nexttoken != "START":
            args["NextToken"] = nexttoken
        response = pricing.get_products(**args)        
        nexttoken =  response.get ('NextToken',"")
        #print(response['PriceList'])
        for price in response['PriceList']:
            price_obj = json.loads(price)
            #print(price_obj)
            try:
                if "Throughput".lower() in price_obj['product']['attributes']['subcategory'].lower():
                    #print(price_obj)
                    getOnDemandPriceNF(price_obj, "pergb")
                if "Endpoint".lower() in price_obj['product']['attributes']['subcategory'].lower():
                    #print(price_obj)
                    getOnDemandPriceNF(price_obj, "att_endp")

                
            except:
                test = 1
                
                
def getOnDemandPriceDX(price_obj, code):
    pp = pprint.PrettyPrinter(indent=1, width=300)
    od = price_obj['terms']['OnDemand']
    key = list(od.keys())[0]
    p = od[key] #first OnDemand Object
    pd_key = list(p['priceDimensions'].keys())
    
    for pricing in pd_key:
        pricePerUnit = p['priceDimensions'][pricing]['pricePerUnit'].get('USD')
        if(pricePerUnit is None):
            pricePerUnit = p['priceDimensions'][pricing]['pricePerUnit'].get('CNY')
        #print("dx_d_" + price_obj['product']['attributes']['capacity'] + "--" + price_obj['product']['attributes']['directConnectLocation'] + ' :' + pricePerUnit + ' USD')
        
        price_id = "dx_d_" + price_obj['product']['attributes']['capacity'] + "--" + price_obj['product']['attributes']['directConnectLocation']
        
        #print(price_id + " " + pricePerUnit)
        dynamodb.put_item(TableName=os.environ['pricing_table'], Item={
            'pricing_id': {'S': price_id},
            'pricePerUnit': {'N':pricePerUnit}
        })
        
def getDXPrices(usageType): # gets prices for dedicated DX connections
    serviceCode = 'AWSDirectConnect'
    nexttoken = "START"
    filters = [
                {'Type' :'TERM_MATCH', 'Field':'connectionType', 'Value':usageType},
                ]
    pp = pprint.PrettyPrinter(indent=1, width=300)
    
    while nexttoken != "":
        args = {"ServiceCode": serviceCode, "Filters": filters, "MaxResults": 100}
        if nexttoken != "START":
            args["NextToken"] = nexttoken
        response = pricing.get_products(**args)        
        nexttoken =  response.get ('NextToken',"")
        #print(response['PriceList'])
        for price in response['PriceList']:
            price_obj = json.loads(price)
            #print(price_obj)  
            getOnDemandPriceDX(price_obj, "dx")

#add a python main function as entry for python debugging
#if __name__ == "__main__":
#    lambda_handler(None, None)