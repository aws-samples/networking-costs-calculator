import React from 'react';
import Check from './Check';
import "react-widgets/styles.css";
import DropdownList from 'react-widgets/DropdownList';
//import Combobox from 'react-widgets/lib/Combobox';
import { Input } from 'reactstrap';
import TransferTableRow from './TransferTableRow'
import * as queries from '../graphql/queries';
import { generateClient } from 'aws-amplify/api';

//ignore the "duplicate display" warnings
/* eslint no-dupe-keys: 0 */  // --> OFF


const graphqlClient = generateClient();

export default class Calc extends React.Component {

    //data_sources = ['VPC A', 'VPC B', 'Direct Connect', 'VPN'];
    data_volumes = ['10 GB', '1 TB'];

    constructor(props){
        super(props);
        this.state = {
            currentSource: '',
            currentDest: '',
            currentVolume: 10,
            currentUnit: 'GB',
            cvpn_endpoints:1,
            cvpn_connections:1,
            cvpn_connection_hours:1,
            is_dt_to_disabled: false,
            r53_cost_outbound:0,
            r53_dns_outbound_queries:0,
            r53_outbound_endp:2,
            r53_cost_inbound:0,
            r53_dns_inbound_queries:0,
            r53_inbound_endp:2,
            dnsfw_queries:1,
            dnsfw_dm:1,
            nwfw_endpoints:1,
            nwfw_usage:30,
            nwfw_usage_type:'days',
            alb_lcu:1,
            nlb_lcu:1,
            glb_lcu:1,
            albs:1,
            nlbs:1,
            glb_azs:1,
            glb_endp:1,
            vpce_az : 1,
            vpce_endp:1,
            natg_count:1,
            vpn_count: 1,
            tgw_attachments:3,
            dx_dedicated:{
                '1G': 0.0,
                '10G' :0.0,
                '100G': 0.0
            },
            dx_options : [],
            dx_port_cap: '1G',
            dx_ports:1,
            transfers: [],
            pops: [{"pop": "Loading...", "region": "Loading.."}],
            defaultPop: "Loading...",
            ntag_with_nwfw_usage : false

        };
    }

    componentDidMount = () => {
        this.loadDistinctPops();
    }

    regionChange = () => {
        this.processPops(this.state.pops);
    }

    createSizedArray = (min, max) => {
        let array = []

        for (let i = min; i < max + 1; i++) {
            array.push(i);
            
        }
        return array;
    }

    processPops = (pops) => {
        if (!pops) return;
        for (var i=0; i<pops.length; i++){
            let pop = pops[i];
            //("PARENT STATE REGION:", this.props.parentState.region, pop.region, pop.pop)
            if (pop.region===this.props.parentState.region){

                this.popChange(pop, false)
                this.setState( {defaultPop: pop.pop});
                
                break;
            }
        }
    }

    loadDistinctPops = () => {
        graphqlClient.graphql({
            query: queries.distinctPops,
            }).then( (data) => {
                //console.log(data);
                this.setState( {pops: data.data.distinctPops})
                this.processPops(data.data.distinctPops);
            });
    }

    addDataTransfer = (e) => {
        if (!this.state.currentVolume || !this.state.currentUnit) return false;
       
        switch(this.state.currentSource){
            case "Direct Connect":
                this.props.parentState.transfers.push(
                    {
                        source: this.state.currentSource,
                        dest: "Processed",
                        volume: this.state.currentVolume,
                        unit: this.state.currentUnit,
                    });
                break;
            case "VPN":
                this.props.parentState.transfers.push(
                    {
                        source: this.state.currentSource,
                        dest: "Processed",
                        volume: this.state.currentVolume,
                        unit: this.state.currentUnit,
                    });
                break;
            case "NAT Gateway":
                this.props.parentState.transfers.push(
                    {
                        source: this.state.currentSource,
                        dest: "Internet",
                        volume: this.state.currentVolume,
                        unit: this.state.currentUnit,
                        factorIn: true
                    });


                break;
            case "Network Firewall":
                this.props.parentState.transfers.push(
                    {
                        source: this.state.currentSource,
                        dest: "Processed",
                        volume: this.state.currentVolume,
                        unit: this.state.currentUnit,
                    });
                break;
            case "GWLB Endpoint":
                this.props.parentState.transfers.push(
                    {
                        source: this.state.currentSource,
                        dest: "Processed",
                        volume: this.state.currentVolume,
                        unit: this.state.currentUnit,
                    });
                break;
            case "TGW Attachment":
                this.props.parentState.transfers.push(
                    {
                        source: this.state.currentSource,
                        dest: "Processed",
                        volume: this.state.currentVolume,
                        unit: this.state.currentUnit,
                    });
                break;
            case "VPC Endpoint":
                this.props.parentState.transfers.push(
                    {
                        source: this.state.currentSource,
                        dest: "Processed",
                        volume: this.state.currentVolume,
                        unit: this.state.currentUnit,
                    });
                break;

            default:
                this.props.parentState.transfers.push(
                    {
                        source: this.state.currentSource,
                        dest: this.state.currentDest,
                        volume: this.state.currentVolume,
                        unit: this.state.currentUnit,
                    });
                break;

        }

        
        if(this.state.currentSource === "NAT Gateway" || this.state.currentSource === "Network Firewall") {

        let totalNATG =  parseInt(this.getTotalDataTransferFromService("NAT Gateway"))
        let totalANF = parseInt(this.getTotalDataTransferFromService("Network Firewall"))

            if((this.props.parentState.nwfw || this.props.parentState.nwfw_c) && this.props.parentState.natg && totalANF !== 0){
                

                let tempTransfer = []
        this.props.parentState.transfers.forEach( (element) => {
            if(element.source !== "NAT Gateway") tempTransfer.push(element);;
        })

        this.props.parentState.transfers = tempTransfer;
        

        //for(let transfer in this.props.parentState.transfers){
        //    if(this.props.parentState.transfers[transfer].source === "NAT Gateway") this.props.parentState.transfers.splice(transfer,1)
        //}
                
                let difference = totalANF - totalNATG;
    
                if(difference === 0){ // both processing volumes are the same
                    
                    this.props.parentState.transfers.push(
                        {
                            source: "NAT Gateway",
                            dest: "Internet",
                            volume: totalANF,
                            unit: this.state.currentUnit,
                            factorIn: false
                        });
                }else if(difference > 0 && totalNATG !== 0){ // natg volume higher than anf volume
                    
                    this.props.parentState.transfers.push(
                        {
                            source: "NAT Gateway",
                            dest: "Internet",
                            volume: totalNATG,
                            unit: this.state.currentUnit,
                            factorIn: false
                        });
    
                    
                }else if (difference < 0 && totalANF !== 0){ // natg volume less than anf volume
                    
                    this.props.parentState.transfers.push(
                        {
                            source: "NAT Gateway",
                            dest: "Internet",
                            volume: totalANF,
                            unit: this.state.currentUnit,
                            factorIn: false
                        });
                        this.props.parentState.transfers.push(
                            {
                                source: "NAT Gateway",
                                dest: "Internet",
                                volume: Math.abs(difference),
                                unit: this.state.currentUnit,
                                factorIn: true
                            });
                    
                }
    
    
            }

        }
        
        this.setState({transfers: this.props.parentState.transfers});
        //send event for analytics
        /*Analytics.record({
            name: 'addDataTransfer', 
            attributes: { 
                source: this.state.currentSource,
                dest: this.state.currentDest,
                volume: this.state.currentVolume.toString(),
                unit: this.state.currentUnit,
            }
        });*/
        return true;
    }

    removeTransfer = (i) =>{
        let x = this.state.transfers;
        x.splice(i-1,1);
        this.setState({transfers: x});
    }


    getAttMonthly = (p, tot, count) => { //calculates the monthly costs for a given service
        //takes in a price p
        //total costs object tot
        // count int that multiplies the costs by, example, number of endpoints on a vpc
        
        let anfMatchedHours = 0;

        if((this.props.parentState.nwfw || this.props.parentState.nwfw_c) && this.props.parentState.natg){

            
            if(this.state.nwfw_usage_type === 'hours'){


                if(this.state.natg_count >= this.state.nwfw_endpoints){

                    anfMatchedHours = this.state.nwfw_usage

                }else if(this.state.natg_count < this.state.nwfw_endpoints){

                    anfMatchedHours = this.state.nwfw_usage * this.state.nwfw_endpoints

                }

            }else if(this.state.nwfw_usage_type === 'days'){

                if(this.state.natg_count >= this.state.nwfw_endpoints){

                    anfMatchedHours = 24 * this.state.nwfw_usage

                }else if(this.state.natg_count < this.state.nwfw_endpoints){

                    anfMatchedHours = 24 * this.state.nwfw_usage * this.state.nwfw_endpoints

                }
            }

            


            
            
        }


        let res = Math.round(p * (730 - anfMatchedHours) * 100) / 100.0; // assumes service is at 100% utilization

        console.log("count " + count + " res " + res);

        if(count){res = res * count}
        
        if(count === 0) {res = 0}
        tot.tot += res;

        if(res < 0) {res = 0}
        return res.toFixed(2);
    }

    getCvpnAttMonthly = (price, tot) => {
        let res = (price * 22); // assuming 22 days per month, default value at AWS Online Pricing Calculator
        tot.tot += res
        return res.toFixed(2)
    
    }
    getNWFWMonthly = (price, tot) => {
        let res = price.toFixed(3)
        tot.tot += parseFloat(res)
        return res
    
    }
    getMonthlyLCUPricesforLB = (lb_type, tot) =>{
        let res = 0;
        switch(lb_type){
            case 'nlb':
                res = this.state.nlb_lcu * this.props.parentState.prices.nlb_plcu;
                break;
            case 'alb':
                res = this.state.alb_lcu * this.props.parentState.prices.alb_plcu;
                break;
            case 'glb':
                res = this.state.glb_lcu * this.props.parentState.prices.glb_plcu;
                break;
            default:
                break;
        }
        res = res * 730
        tot.tot += parseFloat(res)
        return res
    }

    normalizeToGb = (t) => {
        
        if (t.unit==='MB') {
            //console.log(t.volume / 1024 / 1024);
            return t.volume / 1024 / 1024;
        }
        else if (t.unit==='TB') {
            //console.log(t.volume * 1024);
            return t.volume * 1024
        }
        else if (t.unit==='PB') {
            //console.log(t.volume * 1024 * 1024);
            return t.volume * 1024 * 1024
        }
        else {
            //console.log(t.volume);
            return t.volume
        };
    }

    getTransferCosts = (t, pergb_price) => {
        return Math.round(this.normalizeToGb(t) * pergb_price * 1000) / 1000.0;
    }

    getTransferCostsWithLimit = (t, pergb_price, limit) => { 
        // t, pricing object
        // pergb_price, array of the cost per unit of the limit
        // limit, array of limit units, 
        // Example: VPC Privatelink Pricing Tiers -> 0-1PB @ 0.01/GB | 1-4PB @ 0.006/GB | 5+PB @ 0.004/GB
        // this function would be called with getTransferCostsWithLimit(t,[0.01, 0.006, 0.004], [1,4,5])

        let cost = 0;

        let volume = this.normalizeToGb(t)
           
    for (let i = 0; i < limit.length; i++) {
        
        
        if(volume - this.normalizeToGb(limit[i]) > 0){
            if(i === limit.length -1){
                
                let price = volume * pergb_price[i]
                cost += price
            }else{
                volume = volume - this.normalizeToGb(limit[i])
                let price = pergb_price[i] * this.normalizeToGb(limit[i])
                cost += price
                          
            }

        }else if(volume - this.normalizeToGb(limit[i]) < 0){
            let price = volume * pergb_price[i]
            cost += price
            
            break
        }
        else if (volume - this.normalizeToGb(limit[i]) === 0){
            console.log("last " + volume)
            let price = volume * pergb_price[i]
            cost += price
    }
        
        
        
    }
        console.log(cost)
        return cost;
    }

    getTransferDetails = (t) => {
        var res = {};
        
        console.log(t);
        if(t.source === 'Direct Connect' && t.dest === 'Processed'){
            res.cost = this.getTransferCosts(t, this.props.parentState.prices.dx_dto);
            res.comments = "N/A"
            res.payingAccount = "Networking Account"
        }
        if(t.source === 'VPN' && t.dest === 'Processed'){
            res.cost = this.getTransferCosts(t, this.props.parentState.prices.vpn_dto);
            res.comments = "N/A"
            res.payingAccount = "Networking Account"
        }
        if(t.source === 'VPC Endpoint' && t.dest === 'Processed'){
            res.cost = this.getTransferCostsWithLimit(t, this.props.parentState.prices.pergb_vpce, [{volume: 1, unit: "PB"}, {volume: 4, unit: "PB"}, {volume: 5, unit: "PB"}]);
            res.comments = "For 1 Endpoint"
            res.payingAccount = "Endpoint Owner"
        }
        if(t.source === 'TGW Attachment' && t.dest === 'Processed'){
            res.cost = this.getTransferCosts(t, this.props.parentState.prices.pergb_vpc);
            res.comments = "For "+ this.state.tgw_attachments +" Attachment(s)"
            res.payingAccount = "Attachment Owner"
        }
        if(t.source === 'NAT Gateway' && t.dest === 'Internet'){
            console.log(t.factorIn);
            res.cost = t.factorIn? this.getTransferCosts(t, this.props.parentState.prices.pergb_natg) : this.getTransferCosts(t,0);
            res.comments = t.factorIn? "N/A" : "Matched ANF Usage"
            res.payingAccount = (this.props.parentState.nwfw)? "Account A": (this.props.parentState.nwfw_c && this.props.parentState.natg)? "Networking Account" :"Account A"
        }
        if(t.source === 'Network Firewall' && t.dest === 'Processed'){
            res.cost = this.getTransferCosts(t, this.props.parentState.prices.pergb_nwfw);
            res.comments = "N/A"
            res.payingAccount =  (this.props.parentState.nwfw)? "Account A & B" : (this.props.parentState.nwfw_c && this.props.parentState.natg)? "Networking Account" :"Account A"
        }
        if(t.source === 'GWLB Endpoint' && t.dest === 'Processed'){
            res.cost = this.getTransferCosts(t, this.props.parentState.prices.pergb_glb);
            res.comments = "N/A"
            res.payingAccount = "Endpoint Owner"
        }
    
        // The calculator no longer supports data transfer cost calculations, the code below can be commented out if you wish to add back this feature
        // if ( (t.source==='VPC A' || t.source==='VPC B' || t.source==='VPC D' || t.source==='VPC D') || (t.source==='VPC D' || t.dest==='VPC D')){ //VPCs or Peering
        //     res.payingAccount = 'Account ' + t.source.split(' ')[1];
        //     if (t.source === t.dest) {
        //         res.comments = 'Same VPC...';
        //         res.cost = 0.0;
        //     } else {
        //         let inter_region = t.source==='VPC D' || t.dest==='VPC D';
        //         if (!inter_region && (t.source==='VPC D' || t.dest==='VPC D')) { //this means VPC peering
        //             if (t.dest!=='VPC B' && t.dest!=='VPC D') { //target has to be one of those VPCs!
        //                 res.payingAccount = 'N/A';
        //                 res.comments = 'N/A';
        //                 res.cost = 0.0;        
        //                 already_decided = true;
        //             } else if (t.source!=='VPC B' && t.source!=='VPC D') { //source also has to be one of those VPCs!
        //                 res.payingAccount = 'N/A';
        //                 res.comments = 'N/A';
        //                 res.cost = 0.0;        
        //                 already_decided = true;
        //             } else { //calculate peering pricing
        //                 res.payingAccount = 'Account ' + t.source.split(' ')[1] + ' for Tx';
        //                 res.payingAccount += ' + Account ' + t.dest.split(' ')[1] + ' for Rx';
        //                 res.comments = 'Tx: {this.props.parentState.currency}' + this.props.parentState.prices.dt_az + '/GB (DT AZ)';
        //                 res.comments += ' + Rx: {this.props.parentState.currency}' + this.props.parentState.prices.dt_az + '/GB (DT AZ)';
        //                 res.cost = this.getTransferCosts(t, this.props.parentState.prices.dt_az*2);
        //             }
        //         } else if (inter_region) { //this means inter-region!
        //             if (t.source==='VPC D' || t.dest==='VPC D') { //source or target can't be the peered VPC
        //                 res.payingAccount = 'N/A';
        //                 res.comments = 'N/A';
        //                 res.cost = 0.0;        
        //             } else { //calculate inter-region pricing
        //                 res.payingAccount = 'Account ' + t.source.split(' ')[1];
        //                 let p = this.props.parentState.prices.dt_az_current; //assume main region --> second region. next IF checks if to set the other way around
        //                 if (t.source==='VPC D') p = this.props.parentState.prices.dt_az_back;
        //                 res.comments = '{this.props.parentState.currency}' + this.props.parentState.prices.pergb_vpc + '/GB (TGW)'; //TGW processing costs
        //                 res.comments += ' + {this.props.parentState.currency}' + p + '/GB (Inter-Region DT)';
        //                 res.cost = this.getTransferCosts(t, (this.props.parentState.prices.pergb_vpc+p));
        //                 if (t.dest==='Direct Connect'){
        //                     res.payingAccount += ' (IR DT)';
        //                     res.payingAccount += ', Neworking Account (DX DTO)';
        //                     res.comments += ' + {this.props.parentState.currency}' + this.props.parentState.prices.dx_dto + '/GB (DX DTO)';
        //                     res.cost += this.getTransferCosts(t, this.props.parentState.prices.dx_dto);
        //                 } else if (t.dest==='VPN'){
        //                     res.payingAccount += ' (IR DT)';
        //                     res.payingAccount += ', Neworking Account (DTO)';
        //                     res.comments += ' + {this.props.parentState.currency}' + this.props.parentState.prices.vpn_dto + '/GB (DTO)';
        //                     res.cost += this.getTransferCosts(t, this.props.parentState.prices.vpn_dto);
        //                 }
        //             }
        //         } else {
        //             if (!already_decided){
        //                 if (t.dest==='Direct Connect'){
        //                     res.comments = '{this.props.parentState.currency}' + this.props.parentState.prices.pergb_dx + '/GB (TGW)';
        //                     res.comments += ' + {this.props.parentState.currency}' + this.props.parentState.prices.dx_dto + '/GB (DX DTO)';
        //                     res.cost = this.getTransferCosts(t, this.props.parentState.prices.pergb_dx + this.props.parentState.prices.dx_dto);
        //                 } else if (t.dest==='VPN'){
        //                     res.comments = '{this.props.parentState.currency}' + this.props.parentState.prices.pergb_vpn + '/GB (TGW)';
        //                     res.comments += ' + {this.props.parentState.currency}' + this.props.parentState.prices.vpn_dto + '/GB (DTO)';
        //                     res.cost = this.getTransferCosts(t, this.props.parentState.prices.pergb_dx + this.props.parentState.prices.vpn_dto);
        //                 } else {
        //                     res.comments = '{this.props.parentState.currency}' + this.props.parentState.prices.pergb_vpc + '/GB (TGW)';
        //                     res.cost = this.getTransferCosts(t, this.props.parentState.prices.pergb_vpc);
        //                 }
        //             }
        //         }
        //     }
        // } else if (!already_decided && (t.source==='Direct Connect' )){
        //     res.payingAccount = 'Neworking Account';
        //     if (t.source === t.dest) {
        //         res.comments = 'N/A';
        //         res.cost = 0.0;
        //     } else {
        //         let costpergb = this.props.parentState.prices.pergb_dx;
        //         if (t.source==='VPN') costpergb = this.props.parentState.prices.pergb_vpn;
        //         if (t.dest.startsWith('VPC')){
        //             res.comments = '{this.props.parentState.currency}' + costpergb + '/GB (TGW)';
        //             res.cost = this.getTransferCosts(t, costpergb);
        //             if (t.dest==='VPC D'){ //add inter-region costs
        //                 let p = this.props.parentState.prices.dt_az_current; //from main region to second region
        //                 res.comments = '{this.props.parentState.currency}' + costpergb + '/GB (TGW1)'; //change to TGW1 for better clarity
        //                 res.comments += ' + {this.props.parentState.currency}' + p + '/GB (Inter-Region DT)';
        //                 res.cost += this.getTransferCosts(t, p);
        //             }
        //         } else if (t.dest==='VPN'){
        //             res.comments = '{this.props.parentState.currency}' + costpergb + '/GB (TGW)';
        //             res.comments += ' + {this.props.parentState.currency}' + this.props.parentState.prices.vpn_dto + '/GB (DTO)';
        //             costpergb = costpergb + this.props.parentState.prices.vpn_dto;
        //             res.cost = this.getTransferCosts(t, costpergb);
        //         } else {
        //             res.comments = 'N/A';
        //             res.cost = 0;
        //         }
        //     }
        // }
        res.cost = Math.round(res.cost * 1000) / 1000.0;
        return res;
    }

    popChange = (newPop, updatestate) => {
        //console.log(newPop);
        //whenever a pop changes, we need to update the DTO for our DX
        let requested_ids = [];
        requested_ids.push ("DX_DT_InterRegion--" + this.props.parentState.region + '---' + newPop.pop);
        requested_ids.push ("DX_DT_IntraRegion--" + this.props.parentState.region + '---' + newPop.pop);

        requested_ids.push ("dx_d_1G--" + newPop.pop);
        requested_ids.push ("dx_d_10G--" + newPop.pop);
        requested_ids.push ("dx_d_100G--" + newPop.pop);
        
        //console.log("dx_d_1G--" + newPop.pop);

        graphqlClient.graphql({query: queries.bulkPrices,
            variables: 
            {
                ids: requested_ids
            }}).then( (prices)=> {
                //console.log(prices);
                let dx_d_prices = this.state.dx_dedicated;
                let dx_d_options = []

                let dx_dto_price = prices.data.bulkPrices[0];
                if (prices.data.bulkPrices[1]){
                    dx_dto_price = prices.data.bulkPrices[1];
                }
                if (dx_dto_price){
                    this.props.popChange(dx_dto_price.pricePerUnit);
                } else {
                    //alert('Price not found for this PoP! Defaulting to 0.02 DX DTO')
                    this.props.popChange(0.02);
                }
                if(prices.data.bulkPrices[2]){
                    dx_d_prices['1G'] = prices.data.bulkPrices[2].pricePerUnit;
                    dx_d_options.push('1G');
                }
                if(prices.data.bulkPrices[3]){
                    dx_d_prices['10G'] = prices.data.bulkPrices[3].pricePerUnit;
                    dx_d_options.push('10G');
                }
                if(prices.data.bulkPrices[4]){
                    dx_d_prices['100G'] = prices.data.bulkPrices[4].pricePerUnit;
                    dx_d_options.push('100G');
                }
               
                this.setState({
                    dx_dedicated : dx_d_prices,
                    dx_options : dx_d_options
                })

                //console.log(this.state.dx_options);
                //console.log(this.state.dx_dedicated);
            });
        if (updatestate) this.setState( {defaultPop: newPop});


    }

    controlDataTransferCostFrom = (value) => {
         
        switch(value){
            default:
                this.setState({is_dt_to_disabled: false})
                this.setState({currentDest: ""})
                this.setState({currentSource: value})
        }
        
    }
    calculateR53DndQueryCost = (mode, total) =>{
        
        let total_cost = 0;
        let queries = 0;
        let limit = 1000;
        let ul_price = 0; // price under the limit
        let ol_price = 0;
        let units = 1000000;

        switch(mode){
            case "ie":
                queries = this.state.r53_dns_inbound_queries;
                ul_price = this.props.parentState.prices.dnsr_ul;
                ol_price = this.props.parentState.prices.dnsr_ol;
                break;
            case "oe":
                queries = this.state.r53_dns_outbound_queries;
                ul_price = this.props.parentState.prices.dnsr_ul;
                ol_price = this.props.parentState.prices.dnsr_ol;
                break;
            case "dnsfw":
                queries = this.state.dnsfw_queries;
                ul_price = this.props.parentState.prices.dnsfw_ul;
                ol_price = this.props.parentState.prices.dnsfw_ol;
                break;
            default:
                break;


        }

        if(queries < limit){
            total_cost = queries * units * ul_price;
        }else{
            total_cost = (limit * units * ul_price)  + ((queries - limit) * units * ol_price)
        }
        
        if(mode === 'dnsfw') total.tot += parseFloat(total_cost);

        return total_cost.toFixed(2);

    }
    calculateR53DomainNames = (total) =>{
        let res = this.state.dnsfw_dm * this.props.parentState.prices.dnsfw_pdmn
        total.tot += parseFloat(res);
        return res.toFixed(3)
    }

    setServicePropertyValue = (e, property_name, limit) => {
        //takes and event "e" from a input
        // property_name is the state prperty you want to modify the value of
        // limit is maximum value allowed to be entered
        
            const re = /^[0-9\b]+$/;
            let obj = {}
            
            if(e.target.value === ''){
                obj[property_name] = parseInt("0")
                
            }
            if (re.test(e.target.value)) {
                let value = parseInt(e.target.value)
                obj[property_name] = value
                
            }
            
            if(limit){
                if(obj[property_name] <= limit){
                    this.setState(obj);
                }
            }else{
                this.setState(obj);
            }
            
        
        
    }

    getDataTransfersFromService(fromService){
        let existingTransfers = []
        this.props.parentState.transfers.forEach( (element) => {
            if(element.source === fromService) existingTransfers.push(element);
        })

        return existingTransfers

    }

    getTotalDataTransferFromService(fromService){
        console.log("getting transfers");
        let allTransfers = this.getDataTransfersFromService(fromService);

        let totalDataTransfer = 0;
        allTransfers.forEach( (dataTransfer) => {

            totalDataTransfer += parseInt(dataTransfer.volume)
        
        })

        return totalDataTransfer
    }

    calculateNatgDiscount(){


    }

    render(){
        let tgwatt_row_num = 1;
        let transfer_row_num = 1;
        let data_sources_from = [];
        //let data_sources_to = []; // some services only support data traferred out, like NAT Gateway, this is needed to not have one sided service show in the "To" dropdown
        //if(this.props.parentState.tgw) data_sources_from.push('VPC A');
        //if(this.props.parentState.tgw) data_sources_from.push('VPC B');
        //if (this.props.parentState.peering) data_sources_from.push('VPC D');
        if (this.props.parentState.dx) data_sources_from.push('Direct Connect');
        if (this.props.parentState.vpn) data_sources_from.push('VPN');
        //if (this.props.parentState.interRegion) data_sources_from.push('VPC D');
        //data_sources_to = [...data_sources_from];
        if (this.props.parentState.natg) data_sources_from.push('NAT Gateway')
        if (this.props.parentState.tgw) data_sources_from.push('TGW Attachment')
        if (this.props.parentState.glb_c ||this.props.parentState.glb_d) data_sources_from.push('GWLB Endpoint')
        if (this.props.parentState.nwfw || this.props.parentState.nwfw_c ) data_sources_from.push('Network Firewall')
        if (this.props.parentState.vpce_c || this.props.parentState.vpce_d ) data_sources_from.push('VPC Endpoint')
        // if all services support data transfer To and From it, copy data_sources_from to data_sources_to
        //console.log('TV:',this.state.transfers_remove_button_visibility);
        var att_tot = {tot: 0};
        var transfer_tot = 0;

        return (
            <div style={{
                width: '490px', display: 'inline-block',
                padding: '10px', backgroundColor: '#efefef',
                marginLeft: '2px', border: '1px solid #aaa',
                overflow: 'scroll'
            }}>

                <div id="services" className="card" style={{height:'430px'}}>

                    <div style={{display:'grid'}}>
                    
                        <div style={{display:'grid'}}>
                            <span className='card-title'>VPC</span>
                            <div>
                                <Check title="VPN" serviceCode="vpn" onChange={this.props.toggleServices} checked={this.props.parentState.vpn} disableService={this.props.parentState.disabled_services} />
                                <Check title="Transit Gateway" serviceCode="tgw" onChange={this.props.toggleServices} checked={this.props.parentState.tgw} disableService={this.props.parentState.disabled_services}/>
                                <Check title="Client VPN" serviceCode="cvpn" onChange={this.props.toggleServices} checked={this.props.parentState.cvpn} disableService={this.props.parentState.disabled_services}/>
                                <Check title="Nat Gateway" serviceCode="natg" onChange={this.props.toggleServices} checked={this.props.parentState.natg} disableService={this.props.parentState.disabled_services}/>
                                <Check title="VPC Peering" serviceCode="peering" onChange={this.props.toggleServices} checked={this.props.parentState.peering} disableService={this.props.parentState.disabled_services}/>  
                                <Check title="Network Firewall : Distributed" serviceCode="nwfw" onChange={this.props.toggleServices} checked={this.props.parentState.nwfw} disableService={this.props.parentState.disabled_services}/>
                                <Check title="Network Firewall : Centralized" serviceCode="nwfw_c" onChange={this.props.toggleServices} checked={this.props.parentState.nwfw_c} disableService={this.props.parentState.disabled_services}/> 
                                <Check title="VPC Endpoint : Distributed" serviceCode="vpce_d" onChange={this.props.toggleServices} checked={this.props.parentState.vpce_d} disableService={this.props.parentState.disabled_services}/>
                                <Check title="VPC Endpoint : Centralized" serviceCode="vpce_c" onChange={this.props.toggleServices} checked={this.props.parentState.vpce_c} disableService={this.props.parentState.disabled_services}/>                                  
                            </div>
                        </div>

                        <div style={{display:'grid'}}>
                            <span className='card-title'> Load Balancers </span>
                            <div>
                                <Check title="Application LB" serviceCode="alb" onChange={this.props.toggleServices} checked={this.props.parentState.alb} disableService={this.props.parentState.disabled_services}/>
                                <Check title="Network LB" serviceCode="nlb" onChange={this.props.toggleServices} checked={this.props.parentState.nlb} disableService={this.props.parentState.disabled_services}/>
                                <Check title="Gateway LB : Centralized" serviceCode="glb_c" onChange={this.props.toggleServices} checked={this.props.parentState.glb_c} disableService={this.props.parentState.disabled_services}/>
                                <Check title="Gateway LB : Distributed" serviceCode="glb_d" onChange={this.props.toggleServices} checked={this.props.parentState.glb_d} disableService={this.props.parentState.disabled_services}/>

                            </div>
                        </div>

                        <div style={{display:'grid'}}>
                            <span className='card-title' >Route 53</span>
                            <div>
                                <Check title="Route 53 DNS Firewall" serviceCode="dnsfw" onChange={this.props.toggleServices} checked={this.props.parentState.dnsfw} disableService={this.props.parentState.disabled_services}/>
                                <Check title="Route 53 Resolver Inbound" serviceCode="r53res_inbound" onChange={this.props.toggleServices} checked={this.props.parentState.r53res_inbound} disableService={this.props.parentState.disabled_services}/>
                                <Check title="Route 53 Resolver Outbound" serviceCode="r53res_outbound" onChange={this.props.toggleServices} checked={this.props.parentState.r53res_outbound} disableService={this.props.parentState.disabled_services}/>
                                
                            </div>
                        </div>
                        
                        <div style={{display:'grid'}}>
                            <span className='card-title' >Others</span>
                            <div>
                                <Check title="Direct Connect" serviceCode="dx" onChange={this.props.toggleServices} checked={this.props.parentState.dx} disableService={this.props.parentState.disabled_services}/>
                                <Check title="Inter Region" serviceCode="interRegion" onChange={this.props.interRegionChange} checked={this.props.parentState.interRegion} disableService={this.props.parentState.disabled_services} defaultPricing={this.props.parentState.using_default_pricng}/>
                            </div>
                        </div>

                    </div>
                    

                    <div style={{clear: 'left'}}>
                    </div>

                    {this.props.parentState.dx && 
                        <div style={{ float: "left", display: 'inline-block', marginLeft: 8 }}>
                            <div style={{display: 'inline-block', color: '#555', fontSize: '14px'}}>
                                DX PoP:
                            </div>
                            <div style={{display: 'inline-block', width: '220px', marginLeft: 4}}>
                            <DropdownList
                                    data={this.state.pops}
                                    style={{fontSize: '12px', display: 'inline-block', display: '-moz-inline-stack'}}
                                    //valueField="pop"
                                    dataKey="pop"
                                    defaultValue={this.state.defaultPop}
                                    value={this.state.defaultPop}
                                    textField="pop"
                                    groupBy="region"
                                    onChange={ (value,metadata) => {
                                        this.popChange(value, true);
                                    } }
                                    />
                            </div>
                        </div>
                    }

                </div>
                
                {       
                // User input cards
                }
                {this.props.parentState.dx && 
                    <div className="card" style={{height: '100px'}}>
                        <div className="card-title">
                            Direct Connect - Dedicated
                        </div>
                        
                        <div style={{gridAutoFlow:"column", display:'grid', gap:"10px"}}>

                            <div style={{flex:'column'}}>
                            <div>Port Capacity</div>
                            <DropdownList
                                data={this.state.dx_options}
                                defaultValue={this.state.dx_port_cap}
                                style={{fontSize: '10px', display: 'inline-block', display: '-moz-inline-stack'}}
                                onChange={ value => this.setState({dx_port_cap: value}) }
                                />

                            </div>

                            <div style={{flex:'column'}}>
                            <div>Number of Ports</div>
                                <input
                                type="text"
                                value={this.state.dx_ports}
                                onChange={(e) => {
                                    this.setServicePropertyValue(e, 'dx_ports', 36500)

                                }}
                                
                                />
                            </div>
                        </div>
                    
                </div>}

                {(this.props.parentState.dnsfw) && 
                    <div className="card" style={{height: '100px'}}>
                        <div className="card-title">
                            Route 53 DNS Firewall
                        </div>
                        
                        <div style={{gridTemplateColumns:"auto auto", display:'grid', gap:"10px", marginBottom:'15px'}}>
                            <div>Domain Names</div>
                            <div>DNS Queries</div>
                        
                            <div>
                            <input
                                type="text"
                                value={this.state.dnsfw_dm}
                                onChange={(e) => {
                                    this.setServicePropertyValue(e, 'dnsfw_dm')
                                }}
                                
                                />
                            </div>
                            <div>
                                <input
                                type="text"
                                value={this.state.dnsfw_queries}
                                onChange={(e) => {
                                    this.setServicePropertyValue(e, 'dnsfw_queries')
                                }}
                                
                                />
                                <span> million per month</span>
                            </div>


                        </div>
                    
                </div>}

                {(this.props.parentState.vpn) && 
                    <div className="card" style={{height: '80px'}}>
                        <div className="card-title">
                            VPN                        
                        </div>
                        
                        <div style={{gridAutoFlow:'column', display:'grid', gap:"10px", marginBottom:'15px'}}>

                            <div style={{flex:'column'}}>
                                <div>Number of VPN Connections</div>

                                <input
                                    type="text"
                                    value={this.state.vpn_count}
                                    onChange={(e) => {
                                        this.setServicePropertyValue(e, 'vpn_count')
                                    }}
                                
                                />
                                    
                                
                            </div>


                        </div>
                    
                    </div>
                }

                {(this.props.parentState.tgw) && 
                    <div className="card" style={{height: '80px'}}>
                        <div className="card-title">
                            Transit Gateway                     
                        </div>
                        
                        <div style={{gridAutoFlow:'column', display:'grid', gap:"10px", marginBottom:'15px'}}>

                            <div style={{flex:'column'}}>
                                <div>Number of Attachments</div>

                                <input
                                    type="text"
                                    value={this.state.tgw_attachments}
                                    disabled={true}
                                    onChange={(e) => {
                                        this.setServicePropertyValue(e, 'tgw_attachments')
                                    }}
                                
                                />
                                    
                                
                            </div>


                        </div>
                    
                    </div>
                }
                {(this.props.parentState.natg) && 
                    <div className="card" style={{height: '80px'}}>
                        <div className="card-title">
                            NAT Gateway                         
                        </div>
                        
                        <div style={{gridAutoFlow:'column', display:'grid', gap:"10px", marginBottom:'15px'}}>

                            <div style={{flex:'column'}}>
                                <div>Number of NAT Gateways</div>

                                <input
                                    type="text"
                                    value={this.state.natg_count}
                                    onChange={(e) => {
                                        this.setServicePropertyValue(e, 'natg_count')

                                    }}
                                
                                />
                                    
                                
                            </div>


                        </div>
                    
                    </div>
                }
                {(this.props.parentState.vpce_d || this.props.parentState.vpce_c) && 
                    <div className="card" style={{height: '80px'}}>
                        <div className="card-title">
                            VPC Endpoints                            
                        </div>
                        
                        <div style={{gridAutoFlow:'column', display:'grid', gap:"10px", marginBottom:'15px'}}>

                            <div style={{flex:'column'}}>
                                <div>AZs Deployed at</div>

                                <input
                                    type="number"
                                    value={this.state.vpce_az}
                                    onChange={(e) => {
                                        if(this.state.vpce_endp < e.target.value){
                                            this.setServicePropertyValue(e, 'vpce_endp')
                                        }
                                        this.setServicePropertyValue(e, 'vpce_az')
                                    }}
                                
                                />
                                    
                                
                            </div>

                            <div style={{flex:'column'}}>
                                <div>VPC Endpoints</div>

                                <input
                                    type="number"
                                    value={this.state.vpce_endp}
                                    onChange={(e) => {
                                        if(e.target.value < this.state.vpce_az){
                                            console.log("Must be greater than AZ deployed at");
                                        }else{
                                            this.setServicePropertyValue(e, 'vpce_endp')
                                        }
                                    }}
                                
                                />
                                    
                                
                            </div>


                        </div>
                    
                    </div>
                }
                {(this.props.parentState.glb_c || this.props.parentState.glb_d) && 
                    <div className="card" style={{height: '80px'}}>
                        <div className="card-title">
                            Gateway Load Balancer                            
                        </div>
                        
                        <div style={{gridAutoFlow:'column', display:'grid', gap:"10px", marginBottom:'15px'}}>

                            <div style={{flex:'column'}}>
                                <div>AZs Deployed at</div>

                                <input
                                    type="text"
                                    value={this.state.glb_azs}
                                    onChange={(e) => {
                                        this.setServicePropertyValue(e, 'glb_azs')
                                    }}
                                
                                />
                                    
                                
                            </div>

                            <div style={{flex:'column'}}>
                                <div>GWLB Endpoints</div>

                                <input
                                    type="text"
                                    value={this.state.glb_endp}
                                    onChange={(e) => {
                                        this.setServicePropertyValue(e, 'glb,endp')
                                    }}
                                
                                />
                                    
                                
                            </div>

                           <div style={{flex:'column'}}>
                                <div>GWLB LCUs
                                    <span style={{float:'right'}}>
                                       <a target="_blank" rel="noreferrer" href='https://aws.amazon.com/elasticloadbalancing/pricing/#LCU_Details'>Info</a>
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    value={this.state.glb_lcu}
                                    onChange={(e) => {
                                        this.setServicePropertyValue(e, 'glb_lcu')
                                    }}
                                
                                />
                                    
                                
                            </div>

                        </div>
                    
                    </div>
                }

                {(this.props.parentState.alb) && 
                    <div className="card" style={{height: '80px'}}>
                        <div className="card-title">
                            Application Load Balancer                           
                        </div>
                        
                        <div style={{gridAutoFlow:'column', display:'grid', gap:"10px", marginBottom:'15px'}}>

                            <div style={{flex:'column'}}>

                                <div>Number of ALBs</div>

                                <input
                                    type="text"
                                    value={this.state.albs}
                                    onChange={(e) => { 
                                        this.setServicePropertyValue(e, 'albs')
                                    }}
                                    
                                />

                            </div>

                            <div style={{flex:'column'}}>

                                <div>ALB LCUs
                                    <span style={{float:'right'}}>
                                        <a target="_blank" rel="noreferrer" href='https://aws.amazon.com/elasticloadbalancing/pricing/#LCU_Details'>Info</a>
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    value={this.state.alb_lcu}
                                    onChange={(e) => {
                                        this.setServicePropertyValue(e,'alb_lcu')

                                    }}
                                    
                                />

                            </div>


                        </div>
                    
                    </div>
                }

                {(this.props.parentState.nlb) && 
                    <div className="card" style={{height: '80px'}}>
                        <div className="card-title">
                            Network Load Balancer                            
                        </div>
                        
                        <div style={{gridAutoFlow:'column', display:'grid', gap:"10px", marginBottom:'15px'}}>

                            <div style={{flex:'column'}}>

                                <div>Number of NLBs</div>

                                <input
                                    type="text"
                                    value={this.state.nlbs}
                                    onChange={(e) => {
                                        this.setServicePropertyValue(e,'nlbs')

                                    }}
                                    
                                />

                            </div>

                            <div style={{flex:'column'}}>

                                <div>NLB LCUs
                                    <span style={{float:'right'}}>
                                        <a target="_blank" rel="noreferrer" href='https://aws.amazon.com/elasticloadbalancing/pricing/'>Info</a>
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    value={this.state.nlb_lcu}
                                    onChange={(e) => {
                                        this.setServicePropertyValue(e, 'nlb_lcu')
                                    }}
                                    
                                />

                            </div>


                        </div>
                    
                    </div>
                }

                {(this.props.parentState.r53res_outbound) && 
                    <div className="card" style={{height: '110px'}}>
                        <div className="card-title">
                            Route 53 Resolver Outbound
                        </div>
                        
                        <div style={{gridTemplateColumns:"auto auto", display:'grid', gap:"10px", marginBottom:'15px'}}>
                        <div>ENI</div>
                        <div>DNS Queries</div>
                        
                            <div>
                            <DropdownList
                                data={this.createSizedArray(2,24)}
                                defaultValue={this.state.r53_outbound_endp}
                                style={{fontSize: '10px', display: 'inline-block', display: '-moz-inline-stack'}}
                                onChange={ value => this.setState({r53_outbound_endp: value}) }
                                />
                            </div>
                            <div>
                                <input
                                type="text"
                                value={this.state.r53_dns_outbound_queries}
                                onChange={(e) => {
                                    this.setServicePropertyValue(e, 'r53_dns_outbound_queries')
                                }}
                                
                                />
                                <span> million per month</span>
                            </div>


                        </div>

                        <div>
                                <span>
                                    Total DNS Queries Cost: {this.props.parentState.currency}{this.calculateR53DndQueryCost("oe")}
                                </span>
                            </div>
                    
                </div>
                }

                {(this.props.parentState.r53res_inbound) && 
                    <div className="card" style={{height: '110px'}}>
                        <div className="card-title">
                            Route 53 Resolver Inbound
                        </div>
                        
                        <div style={{gridTemplateColumns:"auto auto", display:'grid', gap:"10px", marginBottom:'15px'}}>
                        <div>ENI</div>
                        <div>DNS Queries</div>
                        
                            <div>
                            <DropdownList
                                data={this.createSizedArray(2,24)}
                                defaultValue={this.state.r53_inbound_endp}
                                style={{fontSize: '10px', display: 'inline-block', display: '-moz-inline-stack'}}
                                onChange={ value => this.setState({r53_inbound_endp: value}) }
                                />
                            </div>
                            <div>
                                <input
                                type="text"
                                value={this.state.r53_dns_inbound_queries}
                                onChange={(e) => {
                                    this.setServicePropertyValue(e, 'r53_dns_inbound_queries')
                                }}
                                
                                />
                                <span> million per month</span>
                            </div>


                        </div>

                        <div>
                                <span>
                                    Total DNS Queries Cost: {this.props.parentState.currency}{this.calculateR53DndQueryCost("ie")}
                                </span>
                            </div>
                    
                </div>}

                {this.props.parentState.cvpn && 
                    <div className="card" style={{height: '100px'}}>
                        <div className="card-title">
                            Client VPN 
                        </div>
                        
                        <div style={{gridAutoFlow:"column", display:'grid', gap:"10px"}}>

                            <div style={{flex:'column'}}>
                            <div>Endpoints</div>
                            <DropdownList
                                data={this.createSizedArray(1,5)}
                                defaultValue={this.state.cvpn_endpoints}
                                style={{fontSize: '10px', display: 'inline-block', display: '-moz-inline-stack'}}
                                onChange={ value => this.setState({cvpn_endpoints: value}) }
                                />

                            </div>

                            <div style={{flex:'column'}}>
                            <div>Connections</div>
                                <input
                                type="text"
                                value={this.state.cvpn_connections}
                                onChange={(e) => {
                                    this.setServicePropertyValue(e, 'cvpn_connections', 36500)

                                }}
                                
                                />
                            </div>

                            <div style={{flex:'column'}}>
                            <div>Average Duration (hr) / day</div>
                            <input
                                type="text"
                                value={this.state.cvpn_connection_hours}
                                onChange={(e) => {
                                    this.setServicePropertyValue(e, 'cvpn_connection_hours', 24)

                                }}
                                />
                            </div>
                        </div>
                    
                </div>}

                {(this.props.parentState.nwfw || this.props.parentState.nwfw_c) && 
                    <div className="card" style={{height: '100px'}}>
                        <div className="card-title">
                            Network Firewall Usage
                        </div>
                        
                        <div style={{gridTemplateColumns:"auto auto auto", display:'grid', gap:"10px"}}>
                        <div>Endpoints</div>
                        <div>Usage per Endpoint</div>
                        <div></div>
                            <div>
                            <DropdownList
                                data={this.createSizedArray(1,100)}
                                defaultValue={this.state.nwfw_endpoints}
                                style={{fontSize: '10px', display: 'inline-block', display: '-moz-inline-stack'}}
                                onChange={ value => this.setState({nwfw_endpoints: value}) }
                                />
                            </div>
                            <div style={{display:'grid', gridAutoFlow:'column', gap:'10px'}}>
                                <input
                                type="text"
                                value={this.state.nwfw_usage}
                                onChange={(e) => {
                                    this.setServicePropertyValue(e,'nwfw_usage')
                                }}
                                
                                />
                                <DropdownList
                                    data={['hours', 'days']}
                                    defaultValue={this.state.nwfw_usage_type}
                                    style={{fontSize: '10px', display: 'inline-block', display: '-moz-inline-stack'}}
                                    onChange={ value => this.setState({nwfw_usage_type: value}) }
                                />
                            </div>

                        </div>
                    
                </div>}
                

                <div id="recurring-costs" className="card" style={{height: '206px'}}>
                    <div className="card-title">
                        Recurring Costs
                    </div>

                    <div className="tableContainer">
                        <table className="minimalistBlack">
                            <thead>
                                <tr>
                                    <th style={{width: '10px'}}>#</th>
                                    <th style={{width: '50px'}}>Service</th>
                                    <th style={{width: '232px'}}>Billed Acc.</th>
                                    <th style={{width: '50px'}}>Hourly</th>
                                    <th style={{width: '50px'}}>Monthly</th>
                                </tr>
                            </thead>
                            <tbody style={{height: '132px'}}>
                                {(this.props.parentState.tgw) && 
                                    <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>TGW Attachment</td>
                                    <td>Attachment Owner</td>
                                    <td>{this.props.parentState.currency}{this.props.parentState.prices.att_vpc}/h</td>
                                    <td>{this.props.parentState.currency}{this.getAttMonthly(this.props.parentState.prices.att_vpc, att_tot, 1/*this.state.tgw_attachments*/)}</td>
                                </tr>
                                
                                }
                                {this.props.parentState.dx && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>DX</td>
                                    <td>Networking Account </td>
                                    <td>{this.props.parentState.currency}{this.state.dx_dedicated[this.state.dx_port_cap]}/h</td>
                                    <td>{this.props.parentState.currency}{this.getAttMonthly(this.state.dx_dedicated[this.state.dx_port_cap], att_tot, this.state.dx_ports)}</td>
                                </tr>
                                }
                                {this.props.parentState.vpn && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>VPN</td>
                                    <td>TGW Owner (Networking Account)</td>
                                    <td>{this.props.parentState.currency}{this.props.parentState.prices.vpnh_vpc}/h</td>
                                    <td>{this.props.parentState.currency}{this.getAttMonthly(this.props.parentState.prices.vpnh_vpc , att_tot, this.state.vpn_count) }</td>
                                </tr>
                                }
                                {this.props.parentState.cvpn && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>C VPN</td>
                                    <td>Account A - Endpoints</td>
                                    <td>{this.props.parentState.currency}{this.props.parentState.prices.att_endp_cvpn}/h</td>
                                    <td>{this.props.parentState.currency}{this.getAttMonthly(this.props.parentState.prices.att_endp_cvpn * this.state.cvpn_endpoints, att_tot)}</td>
                                </tr>
                                }
                                {this.props.parentState.dnsfw && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>DNS FW</td>
                                    <td>Account A - DNS Queries</td>
                                    <td>--</td>
                                    <td>{this.props.parentState.currency}{this.calculateR53DndQueryCost("dnsfw", att_tot)}</td>
                                </tr>
                                }
                                {this.props.parentState.dnsfw && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>DNS FW</td>
                                    <td>Account A - Domain Names</td>
                                    <td>--</td>
                                    <td>{this.props.parentState.currency}{this.calculateR53DomainNames(att_tot)}</td>
                                </tr>
                                }
                                {(this.props.parentState.r53res_outbound) && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>R53 RES</td>
                                    <td>Networking Account - Outbound Endpoints</td>
                                    <td>{this.props.parentState.currency}{this.props.parentState.prices.att_dnsr_endp}/h</td>
                                    <td>{this.props.parentState.currency}{this.getAttMonthly(this.props.parentState.prices.att_dnsr_endp * this.state.r53_outbound_endp, att_tot)}</td>
                                </tr>
                                }
                                {(this.props.parentState.r53res_inbound) && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>R53 RES</td>
                                    <td>Networking Account - Inbound Endpoints</td>
                                    <td>{this.props.parentState.currency}{this.props.parentState.prices.att_dnsr_endp}/h</td>
                                    <td>{this.props.parentState.currency}{this.getAttMonthly(this.props.parentState.prices.att_dnsr_endp * this.state.r53_inbound_endp, att_tot)}</td>
                                </tr>
                                }
                                {(this.props.parentState.nwfw || this.props.parentState.nwfw_c) && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>NWFW</td>
                                    <td>Account A & B {this.props.parentState.nwfw_c? '& Networking ': ''} - Endpoints</td>
                                    <td>{this.props.parentState.currency}{this.props.parentState.prices.att_nwfw}/h</td>
                                    <td>{this.props.parentState.currency}{this.getNWFWMonthly(this.props.parentState.prices.att_nwfw * this.state.nwfw_endpoints * ((this.state.nwfw_usage_type === 'hours'? (this.state.nwfw_usage) : (this.state.nwfw_usage * 24 ))), att_tot)}</td>
                                </tr>
                                }
                                {this.props.parentState.cvpn && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>C VPN</td>
                                    <td>Account A - Connections</td>
                                    <td>{this.props.parentState.currency}{this.props.parentState.prices.att_cvpn}/h</td>
                                    <td>{this.props.parentState.currency}{this.getCvpnAttMonthly(this.props.parentState.prices.att_cvpn * this.state.cvpn_connection_hours * this.state.cvpn_connections, att_tot)}</td>
                                </tr>
                                }
                                {(this.props.parentState.glb_c || this.props.parentState.glb_d) && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>GWLB</td>
                                    <td>Networking Account</td>
                                    <td>{this.props.parentState.currency}{this.props.parentState.prices.att_glb}/h</td>
                                    <td>{this.props.parentState.currency}{(this.getAttMonthly(this.props.parentState.prices.att_glb, att_tot, this.state.glb_azs))}</td>
                                </tr>
                                }
                                {(this.props.parentState.glb_c || this.props.parentState.glb_d)&& 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>GWLB</td>
                                    <td>Networking Account - LCUs</td>
                                    <td>${this.props.parentState.prices.glb_plcu}/h</td>
                                    <td>{this.props.parentState.currency}{this.getMonthlyLCUPricesforLB('glb',att_tot)}</td>
                                </tr>
                                }
                                {(this.props.parentState.glb_c || this.props.parentState.glb_d)&& 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>GWLB</td>
                                    <td>Endpoint Owner</td>
                                    <td>{this.props.parentState.currency}{this.props.parentState.prices.att_endp_glb}/h</td>
                                    <td>{this.props.parentState.currency}{(this.getAttMonthly(this.props.parentState.prices.att_endp_glb, att_tot) * this.state.glb_endp)}</td>
                                </tr>
                                }
                                {(this.props.parentState.vpce_c || this.props.parentState.vpce_d) && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>VPCE</td>

                                    
                                    <td>{ (this.props.parentState.vpce_c) ? "Networking Account" : "Account A & B" }</td>
                                    <td>{this.props.parentState.currency}{this.props.parentState.prices.att_vpce}/h</td>
                                    <td>{this.props.parentState.currency}{(this.getAttMonthly(this.props.parentState.prices.att_vpce, att_tot, this.state.vpce_az * this.state.vpce_endp))}</td>
                                </tr>
                                }
                                {this.props.parentState.nlb && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>NLB</td>
                                    <td>Account A</td>
                                    <td>{this.props.parentState.currency}{this.props.parentState.prices.att_nlb}/h</td>
                                    <td>{this.props.parentState.currency}{(this.getAttMonthly(this.props.parentState.prices.att_nlb, att_tot, this.state.nlbs))}</td>
                                </tr>
                                }
                                {this.props.parentState.nlb && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>NLB</td>
                                    <td>Account A - LCUs</td>
                                    <td>${this.props.parentState.prices.nlb_plcu}/h</td>
                                    <td>{this.props.parentState.currency}{this.getMonthlyLCUPricesforLB('nlb',att_tot)}</td>
                                </tr>
                                }
                                
                                {this.props.parentState.alb && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>ALB</td>
                                    <td>Account A</td>
                                    <td>{this.props.parentState.currency}{this.props.parentState.prices.att_nlb}/h</td>
                                    <td>{this.props.parentState.currency}{(this.getAttMonthly(this.props.parentState.prices.att_nlb, att_tot, this.state.albs))}</td>
                                </tr>
                                }
                                {this.props.parentState.alb && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>ALB</td>
                                    <td>Account A - LCUs</td>
                                    <td>${this.props.parentState.prices.alb_plcu}/h</td>
                                    <td>{this.props.parentState.currency}{this.getMonthlyLCUPricesforLB('alb',att_tot)}</td>
                                </tr>
                                }
                                {this.props.parentState.natg && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>NAT G</td>
                                    <td>
                                    {(this.props.parentState.natg && this.props.parentState.nwfw_c) ? "Networking Account" : "Account A" }
                                    { ((this.state.natg_count - this.state.nwfw_endpoints) === 0  && (this.props.parentState.nwfw_c || this.props.parentState.nwfw_c)) ? "- Matches ANF Usage" : ""}
                                    </td> 
                                    {console.log(this.state.natg_count - this.state.nwfw_endpoints)}

                                    { <td>{this.props.parentState.currency}{this.props.parentState.prices.att_natg}/h</td>}

                                    <td> {console.log("here")} {this.props.parentState.currency} {this.getAttMonthly(this.props.parentState.prices.att_natg , att_tot, this.state.natg_count)} </td>
                                
                                    
                                </tr>
                                }
                                {this.props.parentState.interRegion && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>I.R. Peering</td>
                                    <td>TGW (1) Owner (Networking Account)</td>
                                    <td>{this.props.parentState.currency}{this.props.parentState.prices.att_vpc}/h</td>
                                    <td>{this.props.parentState.currency}{this.getAttMonthly(this.props.parentState.prices.att_vpc, att_tot)}</td>
                                </tr>
                                }
                                {this.props.parentState.interRegion && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>I.R. Peering</td>
                                    <td>TGW (2) Owner (Networking Account)</td>
                                    <td>{this.props.parentState.currency}{this.props.parentState.prices.att_vpc}/h</td>
                                    <td>{this.props.parentState.currency}{this.getAttMonthly(this.props.parentState.prices.att_vpc, att_tot)}</td>
                                </tr>
                                }
                                {this.props.parentState.interRegion && 
                                <tr>
                                    <td>{tgwatt_row_num++}</td>
                                    <td>VPC E</td>
                                    <td>Account E</td>
                                    <td>{this.props.parentState.currency}{this.props.parentState.prices.att_vpc}/h</td>
                                    <td>{this.props.parentState.currency}{this.getAttMonthly(this.props.parentState.prices.att_vpc, att_tot)}</td>
                                </tr>
                                }                                
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={5} style={{paddingLeft: '10px'}}>Total recurring: {this.props.parentState.currency}{(Math.round(att_tot.tot*1000)/1000.0).toFixed(2)}/m</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

            
                {<div className="card" style={{height: '300px'}}>
                    <div className="card-title">
                        Data Processing Costs
                    </div>

                    <div className="" style={{padding: 0, fontSize: '14px', display:'grid', gridAutoFlow:'column'}}>
                        <div style={{display:'grid', gridAutoFlow:'column', alignItems:'center'}}> 
                        <div className="inline" style={{marginLeft: 10}}>Service:</div>
                        
                        <div className="inline" style={{width: '100px', marginLeft: 4, marginRight: 10}}>
                            <DropdownList
                                data={data_sources_from}
                                value={this.state.currentSource}
                                defaultValue={""}
                                style={{fontSize: '12px', display: 'inline-block', display: '-moz-inline-stack'}}
                                onChange={ value => this.controlDataTransferCostFrom(value) }
                                />
                        </div>
                        </div>

                        <div style={{display:'grid', gridAutoFlow:'column', alignItems:'center'}}>
                        <div className="inline" style={{}}>Volume:</div>


                        <div style={{display:'grid', gridAutoFlow:'column', alignItems:'center'}}> 
                                <div> 
                                    <Input
                                        type="number"
                                        value={this.state.currentVolume}
                                        onChange={ (e) => {
                                            this.setState( {currentVolume: e.target.value} )
                                        }}
                                        style={{width: 40, height: 20,
                                            borderRadius: '4px', color: '#555', padding: '0.4em', border: '#ccc 1px solid'}}
                                    />   
                                </div>
                                <div> 
                                <Input type="radio" name="unit" value="GB" defaultChecked onChange={(e)=>{
                                            if (e.target.checked) this.setState({currentUnit: 'GB'})
                                        }} />GB
                                </div>
                                <div>
                                <Input type="radio" name="unit" value="TB" onChange={(e)=>{
                                            if (e.target.checked) this.setState({currentUnit: 'TB'})
                                        }}/>TB 
                                </div>
                                <div>
                                <Input type="radio" name="unit" value="PB" onChange={(e)=>{
                                            if (e.target.checked) this.setState({currentUnit: 'PB'})
                                        }}/>PB
                                </div>

                        </div>

                            
                        {/*<Combobox
                                data={this.data_volumes}
                                defaultValue={"10 GB"}
                                style={{fontSize: '12px', display: 'inline-block'}}
                                onChange={ (value,metadata) => {
                                    if ( (value.split(' ').length-1) !== 1) {
                                        this.value = metadata.lastValue;
                                    }
                                    this.setState({currentVolume: value.split(' ')[0]});
                                    this.setState({currentUnit: value.split(' ')[1]});
                                } }
                            />*/}
                        </div>

                        <div className="inline" style={{marginLeft: 5}}>
                            <button style={{padding: 6, borderRadius: 5}} onClick={this.addDataTransfer}>
                                Add
                            </button>
                        </div>
                    </div>

                    { (this.state.transfers.length>0) && 
                    <div>
                        <div className="tableContainer">
                            <table className="minimalistBlack">
                                <thead>
                                    <tr>
                                        <th style={{width: '10px'}}>#</th>
                                        <th style={{width: '160px'}}>Transfer</th>
                                        <th style={{width: '70px'}}>Billed Acc.</th>
                                        <th style={{width: '150px'}}>Comments</th>
                                        <th style={{width: '50px'}}>Cost</th>
                                        <th style={{width: '12px'}}></th>
                                    </tr>
                                </thead>
                                <tbody style={{height: '180px'}}>
                                    {this.state.transfers.map( (t,i) => {
                                        //if (!this.props.parentState.dx ) return "";
                                        //if (!this.props.parentState.vpn && (t.source==='VPN' || t.dest==='VPN')) return "";
                                        let is_peering = (t.source==='VPC D' || t.dest==='VPC D');
                                        //if (!this.props.parentState.peering && is_peering) return "";
                                        let transfer_details = this.getTransferDetails(t);
                                        
                                        if(t.source === "TGW Attachment"){
                                            transfer_tot += transfer_details.cost * this.state.tgw_attachments;
                                        }else{
                                            transfer_tot += transfer_details.cost;
                                        }
                                        
                                        return (
                                            <TransferTableRow key={transfer_row_num} transfer_row_num={transfer_row_num++}
                                                is_peering={is_peering} t={t} transfer_details={transfer_details}
                                                remove_transfer_function={this.removeTransfer} />
                                        )
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={5} style={{paddingLeft: '10px'}}>Total transfer: {this.props.parentState.currency}{Math.round(transfer_tot*1000)/1000.0}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    }

                </div>}     



            </div>

        )
    }

}
