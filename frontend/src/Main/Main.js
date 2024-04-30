import * as React from 'react';
import './main.css';
import 'react-widgets/styles.css';

import { ArcherContainer, ArcherElement } from 'react-archer';
import Block from './Block.js'
import Calc from '../Calc/Calc.js'
import DropdownList from 'react-widgets/DropdownList';
import { generateClient } from 'aws-amplify/api';
import * as queries from '../graphql/queries';
import Modal from 'react-modal';
import { Alert } from 'reactstrap';

//ignore the "duplicate display" warnings
/* eslint no-dupe-keys: 0 */  // --> OFF

const graphqlClient = generateClient();

export default class Main extends React.Component {

    regions = [
        { continent: 'US East', region:'N. Virginia', code: 'US East (N. Virginia)'},
        { continent: 'US East', region:'Ohio', code: 'US East (Ohio)'},
        { continent: 'US West', region:'Oregon', code: 'US West (Oregon)'},
        { continent: 'US West', region:'Northern California', code: 'US West (N. California)'},
        { continent: 'AWS GovCloud', region:'US-East (GovCloud)', code: 'AWS GovCloud (US-East)'},
        { continent: 'AWS GovCloud', region:'US-West (GovCloud)', code: 'AWS GovCloud (US-West)'},
        { continent: 'Canada', region:'Canada Central', code: 'Canada (Central)'},
        { continent: 'Canada', region:'Canada West', code: 'Canada West (Calgary)'},
        { continent: 'South America', region:'São Paulo', code: 'South America (Sao Paulo)'},
        { continent: 'EU', region:'Ireland', code: 'EU (Ireland)'},
        { continent: 'EU', region:'London', code: 'EU (London)'},
        { continent: 'EU', region:'Frankfurt', code: 'EU (Frankfurt)'},
        { continent: 'EU', region:'Milan', code: 'EU (Milan)'},
        { continent: 'EU', region:'Stockholm', code: 'EU (Stockholm)'},
        { continent: 'EU', region:'Paris', code: 'EU (Paris)'},
        { continent: 'EU', region:'Zurich', code: 'EU (Zurich)'},
        { continent: 'EU', region:'Spain', code: 'EU (Spain)'},
        { continent: 'Africa', region:'Cape Town', code: 'Cape Town'},
        { continent: 'Middle East', region:'Bahrain', code: 'Middle East (Bahrain)'},
        { continent: 'Middle East', region:'UAE', code: 'Middle East (UAE)'},
        { continent: 'Middle East', region:'Israel', code: 'Israel (Tel Aviv)'},
        { continent: 'Asia Pacific', region:'Hong Kong', code: 'Asia Pacific (Hong Kong)'},
        { continent: 'Asia Pacific', region:'Hyderabad', code: 'Asia Pacific (Hyderabad)'},
        { continent: 'Asia Pacific', region:'Mumbai', code: 'Asia Pacific (Mumbai)'},
        { continent: 'Asia Pacific', region:'Tokyo', code: 'Asia Pacific (Tokyo)'},
        { continent: 'Asia Pacific', region:'Singapore', code: 'Asia Pacific (Singapore)'},
        { continent: 'Asia Pacific', region:'Seoul', code: 'Asia Pacific (Seoul)'},
        { continent: 'Asia Pacific', region:'Sydney', code: 'Asia Pacific (Sydney)'},
        { continent: 'Asia Pacific', region:'Melbourne', code: 'Asia Pacific (Melbourne)'},
        { continent: 'Asia Pacific', region:'Osaka', code: 'Asia Pacific (Osaka-Local)'},
        { continent: 'Asia Pacific', region:'Jakarta', code: 'Asia Pacific (Jakarta)'},
        { continent: 'China', region:'Beijing', code: 'China (Beijing)'},
        { continent: 'China', region:'Ningxia', code: 'China (Ningxia)'}
        
    ]

    noPeerRegions = ['Beijing', 'Ningxia']

    constructor(props) {
        super(props);
        
        //refs
        this.secondRegionNetworkingAccount = React.createRef();
        this.calculatorRef = React.createRef();
        this.diagram = React.createRef();

        this.state = {
          region: "US East (N. Virginia)",
          currency:'$',
          preloader_active: true,
          dx: false, // Direct Connect
          vpn: false, // Site to Site VPN
          cvpn: false, // Client VPN
          natg: false, // Nat Gateway
          alb: false, // Application Load Balancer
          nlb: false, // Netowrk Load Balancer
          glb_c:false, // Gateway Load Balance : Centralized
          glb_d:false, // Getaway Load Balancer : Distribute
          tgw: false, // Transit Gateway
          r53res_inbound:false, // Route 53 Resolver Inbound
          r53res_outbound:false, // Route 53 Resolver Outbound 
          dnsfw: false, // Route 53 DNS Firewall
          nwfw:false, // Network Firewall : Distributed
          nwfw_c: false, // Network Firewall : Centralized
          peering: false, // VPC Peering
          interRegion: false, // Inter Regions
          vpce_c: false, // VPC Endpoint: Centralized
          vpce_d : false, // VPC Endpoint Distributed
          vpca:false,
          vpcb: false,
          vpcc: false,
          vpcd:false,
          transfers: [],
          modalOpen: false,
          peeredRegion: "US East (N. Virginia)",
          prices: { // tracks pricing for each service: 
            // dt = data transfer, endp = endpoint, dto = data transfer out
            // att = price per hour, pergb = data processing costs
            // ul = under limit, ol = over limit, pdmn = per domain name
            // plcu = per LCU
              att_vpc: 0.99, // doubles as TGW attachment cost
              att_vpn: 0.99,
              att_cvpn: 0.99,
              att_endp_cvpn: 0.99, // price per hours for a single Client VPN Endpoint
              att_dx: 0.99,
              att_natg: 0.99,
              att_nlb:0.99,
              att_alb:0.99,
              att_glb:0.99,
              att_dnsr_endp:0.99,
              att_nwfw:0.99,
              att_endp_glb:0.99,
              pergb_natg: 0.99,
              pergb_vpc: 0.99, // doubles as TGW data processing cost
              pergb_vpn: 0.99,
              pergb_cvpn: 0.99,
              pergb_vpce: 0.01,
              pergb_dx: 0.99,
              pergb_nwfw:0.99,
              pergb_glb:0.99,
              dt_az: 0.99,
              dx_dto: 0.99,
              vpn_dto: 0.99,
              dt_az_current: 0.99,
              dt_az_back: 0.99,
              dnsr_ul:0.99,
              dnsr_ol:0.99,
              dnsfw_ul:0.99,
              dnsfw_ol:0.99,
              dnsfw_pdmn:0.99,
              nlb_plcu:0.99,
              alb_plcu:0.99,
              glb_plcu:0.99,
              att_vpce:0.99,
              vpnh_vpc:0.99,
              pergb_vpce:[0.99,0.99,0.99] // data processing costs for VPC Endpoint, has 3 different limits <1 PB (first index), 1 to 4 PB(second index) and >4 PB (thrid index).
          },
          supported_services: [],
          disabled_services : [], // tracks services that should be disabled, add or remove to this list when turning on a service
          not_supported : [], // tracks services that will be disabled, add to this list when one or more pricing details for a service are not avaiable from the API
          required_services: [],
          using_default_pricng : false,
          calc_disabled: false,
        };
    }

    componentDidMount() {
        this.loadRegionPrices(this.state.region);
    }


    afterOpenModal() {
        
    }
    
    closeModal = (e) =>{
        this.setState( { modalOpen: false});
    }
    openModal = (e) => {
        this.setState( { modalOpen: true});
    }

    loadRegionPrices = async (region_str) => {

        //TEMP - for offline
        if (false){
            this.setState({
                preloader_active: false
            });
            return;
        }

        this.setState({preloader_active: true, region: region_str, interRegion: false});

        let requested_ids = [];
        requested_ids.push ("att_vpc--" + region_str);
        requested_ids.push ("att_vpn--" + region_str);
        requested_ids.push ("att_dx--" + region_str);
        requested_ids.push ("pergb_vpc--" + region_str);
        requested_ids.push ("pergb_vpn--" + region_str);
        requested_ids.push ("pergb_dx--" + region_str);
        requested_ids.push ("DT_IntraRegion--" + region_str + "---" + region_str);
        requested_ids.push ("DTO_Internet--" + region_str);
        requested_ids.push("att_cvpn--" + region_str);
        requested_ids.push("att_endp_cvpn--" + region_str);
        requested_ids.push("att_natg--" + region_str);
        requested_ids.push("pergb_natg--" + region_str);
        requested_ids.push("att_nlb--" + region_str);
        requested_ids.push("att_alb--" + region_str);
        requested_ids.push("dnsr_ul--" + region_str);
        requested_ids.push("dnsr_ol--" + region_str);
        requested_ids.push("att_dnsr_endp--" + region_str);
        requested_ids.push("dnsfw_ul--" + region_str);
        requested_ids.push("dnsfw_ol--" + region_str);
        requested_ids.push("dnsfw_pdmn--" + region_str);
        requested_ids.push("plcu_nlb--" + region_str);
        requested_ids.push("plcu_alb--" + region_str);
        requested_ids.push("att_endp_nwfw--" + region_str);
        requested_ids.push("pergb_nwfw--" + region_str);
        requested_ids.push("att_glb--" + region_str);
        requested_ids.push("plcu_glb--" + region_str);
        requested_ids.push("att_endp_glb--" + region_str);
        requested_ids.push("pergb_glb--" + region_str);
        requested_ids.push("att_vpce--" + region_str);
        requested_ids.push("pergb_vpce_lm1--" + region_str);
        requested_ids.push("pergb_vpce_lm2--" + region_str);
        requested_ids.push("pergb_vpce_lm3--" + region_str); // pushes the IDs of the documents to be trieved from the database
        requested_ids.push("vpnh_vpc--" + region_str);

        const prices = await graphqlClient.graphql({query: queries.bulkPrices,
            variables:
            {
                ids: requested_ids
            }});
        console.log(prices);
        
        this.setState({ // updates the current pricing states with the values retrived from the database
            preloader_active: false,
            prices: {
                ...this.state.prices,
                att_vpc: prices.data.bulkPrices[0] ? prices.data.bulkPrices[0].pricePerUnit : 0.99,
                att_vpn: prices.data.bulkPrices[1] ? prices.data.bulkPrices[1].pricePerUnit : this.EnableOrDisableServices(['vpn'], true, true), // same price as TGW attachment per hour cost
                att_dx: prices.data.bulkPrices[2] ? prices.data.bulkPrices[2].pricePerUnit : this.EnableOrDisableServices(['dx'], true, true),
                pergb_vpc: prices.data.bulkPrices[3] ? prices.data.bulkPrices[3].pricePerUnit : 0.99,
                pergb_vpn: prices.data.bulkPrices[4] ? prices.data.bulkPrices[4].pricePerUnit : this.EnableOrDisableServices(['vpn'], true, true), // same prices as TGW data processing cost
                pergb_dx: prices.data.bulkPrices[5] ? prices.data.bulkPrices[5].pricePerUnit : this.EnableOrDisableServices(['dx'], true, true),
                dt_az: prices.data.bulkPrices[6] ? prices.data.bulkPrices[6].pricePerUnit : this.EnableOrDisableServices(['peering'], true, true),
                vpn_dto: prices.data.bulkPrices[7] ? prices.data.bulkPrices[7].pricePerUnit : this.EnableOrDisableServices(['vpn'], true, true),
                att_cvpn: prices.data.bulkPrices[8] ? prices.data.bulkPrices[8].pricePerUnit : this.EnableOrDisableServices(['cvpn'], true, true),
                att_endp_cvpn: prices.data.bulkPrices[9] ? prices.data.bulkPrices[9].pricePerUnit : this.EnableOrDisableServices(['cvpn'], true, true),
                att_natg: prices.data.bulkPrices[10] ? prices.data.bulkPrices[10].pricePerUnit : this.EnableOrDisableServices(['natg'], true, true),
                pergb_natg: prices.data.bulkPrices[11] ? prices.data.bulkPrices[11].pricePerUnit : this.EnableOrDisableServices(['natg'], true, true),
                att_nlb: prices.data.bulkPrices[12] ? prices.data.bulkPrices[12].pricePerUnit : this.EnableOrDisableServices(['nlb'], true, true),
                att_alb: prices.data.bulkPrices[13] ? prices.data.bulkPrices[13].pricePerUnit : this.EnableOrDisableServices(['nlb'], true, true),
                dnsr_ul: prices.data.bulkPrices[14] ? prices.data.bulkPrices[14].pricePerUnit : this.EnableOrDisableServices(['r53res_inbound', 'r53res_outbound'], true, true),
                dnsr_ol: prices.data.bulkPrices[15] ? prices.data.bulkPrices[15].pricePerUnit : this.EnableOrDisableServices(['r53res_inbound', 'r53res_outbound'], true, true),
                att_dnsr_endp: prices.data.bulkPrices[16] ? prices.data.bulkPrices[16].pricePerUnit : this.EnableOrDisableServices(['r53res_inbound', 'r53res_outbound'], true, true),

                dnsfw_ul: prices.data.bulkPrices[17] ? prices.data.bulkPrices[17].pricePerUnit : this.EnableOrDisableServices(['dnsfw'], true, true),
                dnsfw_ol: prices.data.bulkPrices[18] ? prices.data.bulkPrices[18].pricePerUnit : this.EnableOrDisableServices(['dnsfw'], true, true),
                dnsfw_pdmn: prices.data.bulkPrices[19] ? prices.data.bulkPrices[19].pricePerUnit : this.EnableOrDisableServices(['dnsfw'], true, true),

                nlb_plcu: prices.data.bulkPrices[20] ? prices.data.bulkPrices[20].pricePerUnit : this.EnableOrDisableServices(['nlb'], true, true),
                alb_plcu: prices.data.bulkPrices[21] ? prices.data.bulkPrices[21].pricePerUnit : this.EnableOrDisableServices(['alb'], true, true),

                att_nwfw: prices.data.bulkPrices[22] ? prices.data.bulkPrices[22].pricePerUnit : this.EnableOrDisableServices(['nwfw-c', 'nwfw'], true, true),
                pergb_nwfw:prices.data.bulkPrices[23] ? prices.data.bulkPrices[23].pricePerUnit : this.EnableOrDisableServices(['nwfw-c', 'nwfw'], true, true),

                att_glb: prices.data.bulkPrices[24] ? prices.data.bulkPrices[24].pricePerUnit : this.EnableOrDisableServices(['glb-c', 'glb-d'], true, true),
                glb_plcu: prices.data.bulkPrices[25] ? prices.data.bulkPrices[25].pricePerUnit : this.EnableOrDisableServices(['glb-c', 'glb-d'], true, true),

                att_endp_glb: prices.data.bulkPrices[26] ? prices.data.bulkPrices[26].pricePerUnit : this.EnableOrDisableServices(['glb'], true, true),
                pergb_glb: prices.data.bulkPrices[27] ? prices.data.bulkPrices[27].pricePerUnit : this.EnableOrDisableServices(['glb'], true, true),

                att_vpce: prices.data.bulkPrices[28] ? prices.data.bulkPrices[28].pricePerUnit : this.EnableOrDisableServices(['vpce-d', 'vpce-c'], true, true),
                pergb_vpce : [
                    prices.data.bulkPrices[29] ? prices.data.bulkPrices[29].pricePerUnit : this.EnableOrDisableServices(['vpce-d', 'vpce-c'], true, true),
                    prices.data.bulkPrices[30] ? prices.data.bulkPrices[30].pricePerUnit : this.EnableOrDisableServices(['vpce-d', 'vpce-c'], true, true),
                    prices.data.bulkPrices[31] ? prices.data.bulkPrices[31].pricePerUnit : this.EnableOrDisableServices(['vpce-d', 'vpce-c'], true, true)
                ],

                vpnh_vpc: prices.data.bulkPrices[32] ? prices.data.bulkPrices[32].pricePerUnit : this.EnableOrDisableServices(['vpn'], false, false),
                
            }
        }, () => {
            //console.log((prices?.data?.bulkPrices[0])?.pricePerUnit === 0.99);
            if (this.state.prices.att_vpc === 0.99 && this.state.prices.pergb_vpc === 0.99){
                alert('There was an error retrieving the pricess from the server. Please refresh or check your deployment.')
                this.setState({calc_disabled: true});
            } else {
                //finally - notify our calculator component about the region change
                //console.log(this.state.prices);
                this.calculatorRef.current.regionChange();
            }
        })
    }


    removeFromArray = (serviceCode) => {
        const index = this.state.disabled_services.indexOf(serviceCode);
        if (index > -1) { 
            this.state.disabled_services.splice(index, 1)
        }
    }

    EnableOrDisableServices = (listOfServices, disable, is_not_supported) => {
        // use this function if you want to either, temporarely disable a non compatible services or permamently disable a service from being turned on
        // liatOfServices : string array of services to be enabled or disabled
        // disable : boolean, if true service will be added to the global disabled list, if false, service will be removed and user will be able to check the service box
        // is_not_supporte : boolean, if true the service will be disabled no matter what

        if(is_not_supported){ 
            listOfServices.forEach(element => {
                if(this.state.not_supported.indexOf(element) === -1){ //if service is not in this array already
                    this.state.not_supported.push(element)
                }
            
            });
            
        }

        if(disable){

            listOfServices.forEach(element => {
                if(true){ // add service to the array
                    this.state.disabled_services.push(element)
                    //console.log(element + ' OFF');
                    let updateObj = {}
                    let propertyName = element.replace("-","_")
                    updateObj[propertyName] = false;
                    //console.log(updateObj);
                    this.setState(updateObj)
                    //this.toggleServices(false, element)
                }
            
            });
            

        }else{
            listOfServices.forEach(element => {
                if(this.state.not_supported.indexOf(element) === -1){ // if service already in array, remove it
                    this.removeFromArray(element)  
                }
                
            });
            //this.setState()
        }
        this.setState()
    }
    
    toggleServices = (checked, service, e ) => { // controls which service should be turned on on off, add extra logic to disabled/enable other services

        let should_tgw =  true //&& //&& this.state.tgw) || checked  //&& (checked && this.state[service]);
        
        //should_tgw = true;   
        
        switch(service){
            case 'cvpn':
                this.setState({cvpn : checked});
                break;
            case 'dx':
                if(this.state.r53res_inbound || this.state.r53res_outbound){
                    this.EnableOrDisableServices(['vpn'], checked)
                }
                this.EnableOrDisableServices(['tgw'], checked)
                this.setState({dx: checked, tgw: should_tgw});
                break;
            case 'vpn':
                //checked? this.state.required_services.push('tgw') : this.removeFromArray('tgw')

                if(this.state.r53res_inbound || this.state.r53res_outbound){
                    this.EnableOrDisableServices(['dx'], checked)
                }
                this.EnableOrDisableServices(['tgw'], checked)

                this.setState({vpn: checked, tgw: should_tgw});
            
                break;
            case 'peering':
                this.setState({peering: checked});
                break;
            case 'natg':
                this.setState({natg: checked});
                break;
            case 'nlb':
                this.setState({nlb: checked});
                break;
            case 'alb':
                this.setState({alb: checked});
                break;
            case 'r53res':
                this.setState({r53res: checked});
                break;
            case "r53res_inbound":
                if(!checked && !this.state.r53res_outbound){
                    this.EnableOrDisableServices(['dx','vpn'], checked)
                }
                this.EnableOrDisableServices(['tgw'], checked)
                this.setState({r53res_inbound: checked, tgw: should_tgw})
                break;
            case "r53res_outbound":
                if(!checked && !this.state.r53res_inbound){
                    this.EnableOrDisableServices(['dx','vpn'], checked)
                }
                this.EnableOrDisableServices(['tgw'], checked)
                this.setState({r53res_outbound: checked, tgw: should_tgw})
                break;
            case 'nwfw':
                this.setState({nwfw: checked})
                break;
            case 'nwfw_c':
                this.EnableOrDisableServices(['tgw', 'natg'], checked)
                this.setState({nwfw_c: checked, tgw: should_tgw , natg:checked})
                break;
            case 'dnsfw':
                this.setState({dnsfw: checked});
                break;
            case 'glb_c':
                if(!this.state.glb_d){
                    this.EnableOrDisableServices(['nwfw_c', 'nwfw','dx', 'vpn', 'r53res_outbound', 'r53res_inbound', 'interRegion', 'glb_d', 'vpce_d'], checked)
                }
                this.EnableOrDisableServices(['tgw'], checked)
                this.setState({glb_c: checked, tgw: should_tgw});
                break;
            case 'glb_d':
                if(!this.state.glb_c){
                    this.EnableOrDisableServices(['nwfw_c', 'nwfw','dx', 'vpn', 'r53res_outbound', 'r53res_inbound', 'glb_c', 'interRegion', 'vpce_d', 'tgw'], checked)
                }
                this.setState({glb_d: checked});
                break;   
            case 'vpce_d':
                if(checked === false){
                    this.EnableOrDisableServices(['tgw'], false)
                }
                this.EnableOrDisableServices(['vpn', 'natg', 'nwfw', 'glb_d', 'dx', 'r53res_outbound', 'r53res_inbound', 'glb_c', 'interRegion', 'vpce_c'],checked)
                this.setState({vpce_d: checked, tgw: checked})
                break;
            case 'vpce_c':
                this.EnableOrDisableServices(['vpce_d'],checked)
                this.EnableOrDisableServices(['tgw'], checked)
                this.setState({vpce_c: checked, tgw: should_tgw})
                break;
            case 'tgw':
                this.setState({tgw: checked})
                break;
            default:
                break;
        }

        
    }
    
    interRegionChange = (checked, e) => {
        if (checked) {
            this.openModal();
            
        } else {
            this.EnableOrDisableServices(['tgw'], false)
            this.setState({interRegion: false, tgw : false});
        }
    }

    popChange = (dx_dto_price) => {
        this.setState({
            prices: {
                ...this.state.prices,
                dx_dto: dx_dto_price
            }
        });
    }
 
    getNiceRegionName = (region_code) => {
        let r = null;
        for (var i=0; i<this.regions.length; i++){
            if (this.regions[i].code===region_code){
                r = this.regions[i];
                break;
            }
        }
        if (region_code && r) return r.region; else return region_code;
    }

    shouldShowServiceElement = (element) => {  // delegates which elements in the diagram are going to be shown/hidden based on logic
        // add logic to hide/show a element, names can be anything you want, just add a new case to the switch
        let turn_on = false;
        
        switch(element){
            case 'client':
                turn_on = this.state.cvpn;
                break;
            case 'internet':
                turn_on = (this.state.natg || this.state.nwfw || this.state.glb_d);
                break;
            case 'AccA-TopRow':
                turn_on = this.state.cvpn
                break;
            case 'cvpn':
                turn_on = this.state.cvpn;
                break;
            case 'VpcA-TopRow':
                turn_on = (this.state.nwfw || this.state.glb_d);
                break;
            case 'eni':
                turn_on = this.state.cvpn;
                break;
            case 'nwfwe':
                turn_on = this.state.nwfw;
                break;
            case 'natg':
                turn_on = (this.state.natg && (!this.state.nwfw && !this.state.glb_d) && !this.state.nwfw_c);
                break;
            case 'natg3':
                turn_on = this.state.nwfw_c; 
                break;
            case 'glb-endp-a':
                turn_on = this.state.glb_d;
                break;
            case 'natg2':
                turn_on = (this.state.natg && (this.state.nwfw || this.state.glb_d))
                break;
            case 'ec2':
                turn_on = (this.state.natg || 
                        this.state.alb || 
                        this.state.nlb || 
                        this.state.cvpn || 
                        this.state.r53res_inbound ||
                        this.state.r53res_outbound ||
                        this.state.nwfw ||
                        this.state.nwfw_c ||
                        this.state.dx ||
                        this.state.vpn ||
                        this.state.glb_d ||
                        this.state.glb_c ||
                        this.state.peering ||
                        this.state.vpce_d ||
                        this.state.vpce_c ||
                        this.state.tgw );
                break;
            case 'phza':
                turn_on = this.state.r53res_inbound;
                break;
            case 'nlb':
                turn_on = this.state.nlb;
                break;
            case 'alb':
                turn_on = this.state.alb;
                break;
            case 'dnsfw':
                turn_on = this.state.dnsfw;
                break;
            case 'AccB':
                turn_on = (this.state.dx || 
                        this.state.vpn ||
                        this.state.peering ||
                        this.state.interRegion ||
                        this.state.r53res_inbound ||
                        this.state.r53res_outbound ||
                        this.state.nwfw ||
                        this.state.nwfw_c ||
                        this.state.glb_d ||
                        this.state.glb_c ||
                        this.state.vpce_d ||
                        this.state.vpce_c ||
                        this.state.tgw);
                break;
            case 'AccB-TopRow':
                turn_on = false;
                break;
            case 'VpcB-TopRow':
                turn_on = (this.state.nwfw || this.state.glb_d);
                break;
            case 'nwfw-b':
                turn_on = this.state.nwfw;
                break;
            case 'glb-endp-b':
                turn_on = this.state.glb_d;
                break;
            case 'phzb':
                turn_on = this.state.r53res_inbound;
                break;
            case 'AccD':
                turn_on = this.state.peering;
                break;
            case 'NetAcc':
                turn_on = (this.state.dx ||
                        this.state.vpn ||
                        this.state.interRegion ||
                        this.state.r53res_inbound ||
                        this.state.r53res_outbound ||
                        this.state.nwfw_c ||
                        this.state.glb_c ||
                        this.state.glb_d ||
                        this.state.vpce_c ||
                        this.state.tgw );
                break;
            case 'AppVpc':
                turn_on = (this.state.glb_c || this.state.glb_d);
                break;
            case 'glb-endp-n':
                turn_on = this.state.glb_c;
                break;
            case 'tgw':
                turn_on = this.state.tgw;
                //turn_on = (this.state.dx ||
                //    this.state.vpn ||
                //    this.state.nwfw_c ||
                //    this.state.glb_c ||
                //    this.state.interRegion ||
                //    this.state.r53res_inbound ||
                //    this.state.r53res_outbound ||
                //    this.state.vpce_c);
            
                break;
            case 'dx':
                turn_on = this.state.dx;
                break;
            case 'vpn':
                turn_on = this.state.vpn;
                break;
            case 'NetAcc-Right': // also shows VPC C
                turn_on = (this.state.r53res_inbound || this.state.r53res_outbound || this.state.nwfw_c || this.state.vpce_c);
                break;
            case 'endp-oe':
                turn_on = this.state.r53res_outbound;
                break;
            case 'endp-ie':
                turn_on = this.state.r53res_inbound;
                break;
            case 'phzc':
                turn_on = this.state.r53res_inbound;
                break;
            case 'nwfw-c':
                turn_on = this.state.nwfw_c;
                break;
            case 'OnPrem':
                turn_on = (this.state.dx || this.state.vpn || this.state.r53res_inbound || this.state.r53res_outbound);
                break;
            case 'rt1':
                turn_on = this.state.dx;
                break;
            case 'rt2':
                turn_on = this.state.vpn;
                break;
            case 'cdns':
                turn_on = (this.state.r53res_inbound || this.state.r53res_outbound);
                break;
            case '3rd-party-vpc':
                turn_on = this.state.vpce_d;
                break;
            case 'vpc-endp-a':
                turn_on = this.state.vpce_d;
                break;
            case 'vpc-endp-b':
                turn_on = this.state.vpce_d;
                break;
            case 'vpc-endp-c':
                turn_on = this.state.vpce_c;
                break;
            case '3vpc2':
                turn_on = this.state.vpce_c;
                break;
            default:
                break;
            
        }
        return turn_on
    }

    render() {
        
        
        return (

            <LoadingOverlay active={this.state.preloader_active} text='Retrieving updated prices...' spinner >

            { this.state.calc_disabled &&
                <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', color: '#534095',
                    textAlign: 'center', verticalAlign: 'middle', lineHeight: '400px', fontSize: '16px', fontWeight: '500',
                    backgroundColor: 'rgba(220, 220, 220, 0.6)', zIndex: 100}}>
                    
                    Price retrieval failed, please refresh or check your deployment.

                </div>
            }


                <div style={{position: 'relative'}}>
                    {/* Region Selection Area */}
                    <div style={{position: "absolute", top: -40, right: 0}}>
                        
                        <div style={{display: 'inline-block', color: '#555', fontSize: '14px'}}>
                            Region:
                        </div>

                        <div style={{display: 'inline-block', width: '140px', marginLeft: 4}}>

                            <DropdownList
                                data={this.regions}
                                defaultValue={"US East (N. Virginia)"}
                                style={{fontSize: '12px', display: 'inline-block', display: '-moz-inline-stack'}}
                                //valueField="code"
                                dataKey="code"
                                textField="region"
                                groupBy="continent"
                                onChange={ (value,metadata) => {
                                    //console.log(value);
                                    this.loadRegionPrices (value.code);
                                    //console.log((value.continent === "China")? '¥' : '$');
                                    this.setState({ not_supported: [], disabled_services: [], currency: (value.continent === "China")? '¥' : '$'})
                                    
                                } }
                            />

                        </div>

                    </div>
                    {/* End of Region Selection Area */}
                    <div className="MainArea">

                        {/* Diagram and Options View*/} 
                        <div style={{display:'grid', gridAutoFlow:"column",}}>
                            
                             {/* Diagram Display Box*/}
                            <div className="inline" style={{overflowY: 'scroll', overflowX : 'scroll', width:'770px'}}>
                                
                                 {/* Main Diagram */}
                                <div id="diagram" style={{display:"flex"}}>

                                    <ArcherContainer ref={this.diagram} strokeColor='#714ab0' noCurves={false} strokeWidth='2' endShape={ {arrow: { arrowLength: 5}}}  >

                                         {/* Main Gird */}
                                        <div style={{display:'grid', gridTemplateColumns:'auto auto auto', gap:'20px', alignItems:'center',padding:'20px'}}>

                                             {/* Client and Internet Area */}
                                            <div style={{ display:'flex', justifyContent:'space-around', maxWidth: "700px", gridColumn:'1 / span 2'}}>
                                                
                                                { this.shouldShowServiceElement('client') &&
                                                    <Block src="client" height="50"
                                                    icon='small' 
                                                    style={{width: '120px'}}
                                                    title={<div><span>Client</span></div>}
                                                    titlePaddingTop="15"
                                                    globalMarginTop="0"
                                                    archer_id="mb"
                                                    relations={{                                                
                                                        b8: [{
                                                            targetId: 't8-cvpn',
                                                            targetAnchor: 'top',
                                                            sourceAnchor: 'bottom',
                                                            style: {},
                                                            label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                        }],
                                                    }}
                                                    />                         
                                                }
                                                
                                                { this.shouldShowServiceElement('internet') &&
                                                    <Block src="internet" height="50"
                                                        icon='small' 
                                                        style={{width: '120px'}}
                                                        title={<div><span>Internet</span></div>}
                                                        titlePaddingTop="15"
                                                        globalMarginTop="0"
                                                        archer_id="net"
                                                        relations={{
                                                            b2: (!this.state.nwfw && !this.state.natg)? [{
                                                                targetId: 't8-igw',
                                                                targetAnchor: 'top',
                                                                sourceAnchor: 'bottom',
                                                                style: {},
                                                                label: <div className="arrowLabel whitebg"></div>
                                                                //label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                            }] : [],
                                                            b8: (this.state.glb_d)? [{
                                                                targetId: 't9-igw-b',
                                                                targetAnchor: 'top',
                                                                sourceAnchor: 'bottom',
                                                                style: {},
                                                                label: <div className="arrowLabel whitebg"></div>
                                                                //label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                            }] : [],
                                                        }}
                                                    />                         
                                                }
                                            </div>  
                                            {/* End of Client and Internet Area */}  
                                            
                                             {/* Main Region Area */}
                                            <div id='region' style={{gridColumn:'1 / span 2', border: "1px dashed #387EB5",position: 'relative', display:'grid',paddingTop: '32px', paddingBottom: '8px',}}>

                                                <div className="icon">
                                                    <img src={'img/region.svg'} style={{height: '32px'}} alt="region" /> 
                                                </div>

                                                <div style={{position: 'absolute', top: 4, left: 40, color: '#387EB5'}}>
                                                    {this.getNiceRegionName(this.state.region)}
                                                </div>
                                                <div style={{display:'flex',justifyContent:'center'}}>

                                                    { this.shouldShowServiceElement('3rd-party-vpc') &&
                                                        <Block src="NONE" height="70"
                                                        icon='small' 
                                                        style={{width: '260px'}}
                                                        title={<div>
                                                                <span>Private Link Supportod Services</span>
                                                                <span>3rd Party VPC</span>
                                                                <span>Service Provider VPC</span>
                                                            </div>}
                                                        titlePaddingTop="6"
                                                        globalMarginTop="0"
                                                        archer_id="3vpc1"
                                                        relations={{}}
                                                        />                         
                                                    }
                                                    
                                                </div>
                                                {/*  Account Areas */}
                                                <div className="diagramRow" style={{display:'grid', gap:'10px',gridTemplateColumns:this.state.peering? 'auto auto auto' : 'auto auto' , padding:'20px', }}>

                                                
                                                    {/* Account A */}
                                                    <div id="accountA" className="baseElement" style={{padding:'10px',display:'grid', gridTemplateColumns:'auto', rowGap:'20px', alignItems:'start'}}>

                                                        <div className="icon"><img src={'img/cloud.svg'} alt="cloud" /> </div>

                                                        <div className="cloudTitle" style={{fontWeight: 'bold', gridColumn:'1 / span 1'}}>Account A</div>

                                                        {/*  Account A Top Row*/}
                                                        {  this.shouldShowServiceElement('AccA-TopRow') &&

                                                            <div style={{display:'flex', justifyContent:'space-around',gridColumn:'1 / span 1'}}>

                                                                { this.shouldShowServiceElement('cvpn') && 
                                                                    <Block src="CVPN" height="50" 
                                                                        title={<div><span>Client VPN</span></div>}
                                                                        style={{width: '150px'}}
                                                                        titlePaddingTop="15"
                                                                        globalMarginTop="8"
                                                                        archer_id="cvpn"
                                                                        relations={{                                                
                                                                            b8: [{
                                                                                targetId: 't5-eni',
                                                                                targetAnchor: 'top',
                                                                                sourceAnchor: 'bottom',
                                                                                style: {},
                                                                                label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}>${this.state.prices.att_endp_cvpn}/hr per Endpoint</div>
                                                                                //label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                            }],
                                                                        }}
                                                                    />
                                                                }

                                                            </div>

                                                        }
                                                        {/*  End of Account A Top Row */} 

                                                        {/* Account A Bottom Row*/}
                                                        <ArcherElement id="vpcaa"
                                                            relations={((this.state.dx || this.state.vpn || this.state.interRegion || this.state.r53res_inbound || this.state.r53res_outbound || this.state.tgw ) ^ (this.state.nwfw_c || this.state.vpce_c) && !this.state.glb_c)? [ 
                                                                {
                                                                targetId:'t4-tgw',
                                                                targetAnchor: 'top',
                                                                sourceAnchor: 'bottom', 
                                                                label: <div className="arrowLabel whitebg" style={{}}>To TGW, ${this.state.prices.pergb_vpc}/GB</div>
                                                                },
                                                            ] : []
                                                            }>

                                                            {/*  VPC A */}
                                                            <div className="vpcBlock" style={{paddingBottom:'10px'}}>

                                                                <div className="icon">
                                                                    <img src={'img/vpc.svg'} style={{height: '32px'}} alt="region" /> 
                                                                </div>

                                                                <div style={{position: 'absolute', top: 4, left: 40, color: '#1e8901'}}>
                                                                    {this.state.nwfw? "Protected " : "" }VPC A
                                                                </div>

                                                                {/*  VPC A Body */}
                                                                <div style={{display: 'grid', gap:"10px", gridAutoFlow:'column'}}>
                                                                    
                                                                    {/*  VPC A Top Row */}
                                                                    { this.shouldShowServiceElement('VpcA-TopRow') && 
                                                                        <div style={{display:'flex', justifyContent: this.state.cvpn? 'flex-end' : 'space-around', gridRow:'1 / span 1', gridColumn:'1 / span 2'}}>

                                                                            <Block src="IGW" height="50" 
                                                                                title={<div><span>IGW*</span></div>}
                                                                                style={{width: '100px'}}
                                                                                titlePaddingTop="15"
                                                                                globalMarginTop="8"
                                                                                archer_id="igw"
                                                                                relations={{                                                
                                                                                    t8: (this.state.nwfw && !this.state.glb_d)? [{
                                                                                        targetId: 'b2-net',
                                                                                        targetAnchor: 'bottom',
                                                                                        sourceAnchor: 'top',
                                                                                        style: {},
                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px', color:'#AF2623'}}>${this.state.prices.pergb_nwfw}/GB DTO</div>
                                                                                        //label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                    }] : [],
                                                                                    t2: (this.state.natg && this.state.glb_d)? [{
                                                                                        targetId: 'b2-net',
                                                                                        targetAnchor: 'bottom',
                                                                                        sourceAnchor: 'top',
                                                                                        style: {},
                                                                                        label: <div className="arrowLabel whitebg"></div>
                                                                                        //label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                    }] : [],
                                                                                    b2: (this.state.glb_d && !this.state.natg)? [{
                                                                                        targetId: 't2-glb-endp-a',
                                                                                        targetAnchor: 'top',
                                                                                        sourceAnchor: 'bottom',
                                                                                        style: {},
                                                                                        label: <div className="arrowLabel whitebg"></div>
                                                                                        //label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                    }] : [],

                                                                                }}
                                                                            />
                                                                            

                                                                        </div>

                                                                    }
                                                                    {/*  End of VPC A Top Row */} 

                                                                    {/*  VPC A Right Side */}
                                                                    <div> 

                                                                        {/*  VPC A AZ1 */}
                                                                        <div className="inline azBlock" style={{display:'flex', minWidth:'200px'}} >

                                                                            <div style={{position: 'absolute', top: 4, left: 40, color: '#387EB5'}}>
                                                                                Availability Zone 1
                                                                            </div>

                                                                            {/*  VPC A AZ1 Body */}
                                                                            <div style={{ display:"grid", gridTemplateColums:"auto auto", gap:'10px', flex:'auto'}}>

                                                                                {/*  VPC A AZ1 Body Top Row */}
                                                                                <div style={{gridRow: "1 / span 2", display:"grid", justifyContent:'space-around', gridAutoFlow:'column', gap:'10px', padding:'10px'}}>
                                                                                        
                                                                                        { this.shouldShowServiceElement('eni') &&
                                                                                            <Block src="ENI" height="50" 
                                                                                                icon='small'
                                                                                                style={{width: '100px'}}
                                                                                                title={<div><span>ENI</span></div>}
                                                                                                titlePaddingTop="15"
                                                                                                globalMarginTop="8"
                                                                                                archer_id="eni"
                                                                                                relations={{
                                                                                                    b2: ((this.state.natg && !this.state.nwfw) || (!this.state.natg && this.state.nwfw) || (this.state.cvpn && !this.state.nwfw && !this.state.natg))?[{
                                                                                                        targetId: 't3-ec2',
                                                                                                        targetAnchor: 'top',
                                                                                                        sourceAnchor: 'bottom',
                                                                                                        style: {},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                    }] : [],
                                                                                                    b1: (this.state.natg && this.state.nwfw)?[{
                                                                                                        targetId: 'l8-ec2',
                                                                                                        targetAnchor: 'left',
                                                                                                        sourceAnchor: 'bottom',
                                                                                                        style: {},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                    }] :[]
                                                                                                }}
                                                                                            />
                                                                                        }                                                                                

                                                                                        { this.shouldShowServiceElement('nwfwe') &&
                                                                                            <Block src="NFWE" height="50" 
                                                                                                icon='small'
                                                                                                style={{width: '120px'}}
                                                                                                title={<div><span>NFW</span></div>}
                                                                                                titlePaddingTop="10"
                                                                                                iconLabel= { "$" + this.state.prices.pergb_nwfw +"/GB DP"}
                                                                                                globalMarginTop=""
                                                                                                archer_id="nfwe"
                                                                                                relations={{
                                                                                                    t8: [{
                                                                                                        targetId: 'b2-igw',
                                                                                                        targetAnchor: 'bottom',
                                                                                                        sourceAnchor: 'top',
                                                                                                        style: {strokeColor: '#AF2623'},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '0px'}}> </div>
                                                                                                    }]
                                                                                                }}
                                                                                            />
                                                                                        }
                                                                                        

                                                                                        { this.shouldShowServiceElement('natg') &&
                                                                                            <Block src="NATG" height="50"
                                                                                                icon='small' 
                                                                                                style={{width: '150px'}}
                                                                                                title={<div><span>NAT Gateway</span></div>}
                                                                                                titlePaddingTop="15"
                                                                                                globalMarginTop="8"
                                                                                                archer_id="natg"
                                                                                                relations={{                                                
                                                                                                    t8: [{
                                                                                                        targetId: this.state.nwfw? 'b8-igw' : 'b8-net' ,
                                                                                                        targetAnchor: 'bottom',
                                                                                                        sourceAnchor: 'top',
                                                                                                        style: {},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                    }],
                                                                                                    b2: this.state.glb_d? [{
                                                                                                        targetId: 't2-glb-endp-a' ,
                                                                                                        targetAnchor: 'top',
                                                                                                        sourceAnchor: 'bottom',
                                                                                                        style: {},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                    }] : [],

                                                                                                }}
                                                                                            />
                                                                                        }

                                                                                        { this.shouldShowServiceElement('vpc-endp-a') &&
                                                                                            <Block src="ENDP" height="50" 
                                                                                                icon='small'
                                                                                                style={{width: '100px'}}
                                                                                                title={<div><span>VPC E</span></div>}
                                                                                                titlePaddingTop="15"
                                                                                                globalMarginTop="8"
                                                                                                archer_id="vpc-endp-a"
                                                                                                relations={{
                                                                                                    t5: [{
                                                                                                        targetId: 'b4-3vpc1',
                                                                                                        targetAnchor: 'bottom',
                                                                                                        sourceAnchor: 'top',
                                                                                                        style: {},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                    }],
                                                                                                }}
                                                                                                    
                                                                                            />
                                                                                        }
                                                                                        
                                                                                </div>
                                                                                {/*  End of VPC A AZ1 Body Top Row */}

                                                                                {/*  VPC A AZ1 Body Middle Row */}
                                                                                <div style={{gridRow: "1 span 2", display:'flex', justifyContent: this.state.glb_d? 'left' : 'center', paddingLeft: this.state.glb_d? '10px':'', paddingRight: this.state.glb_d? '10px':'', gap:'20px', }}>

                                                                                    { this.shouldShowServiceElement('glb-endp-a') &&
                                                                                        <Block src="ENDP" height="50" 
                                                                                            icon='small'
                                                                                            style={{width: '105px'}}
                                                                                            title={<div><span>GLWBE</span></div>}
                                                                                            titlePaddingTop="15"
                                                                                            globalMarginTop="0"
                                                                                            archer_id="glb-endp-a"
                                                                                            relations={{
                                                                                                b2: [ {
                                                                                                    targetId: 'l6-glb',
                                                                                                    targetAnchor: 'left',
                                                                                                    sourceAnchor: 'bottom',
                                                                                                    style: {strokeColor: '#AF2623'},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                }],
                                                                                                t2: (this.state.natg && this.state.glb_d)?[{
                                                                                                    targetId: 'b2-igw',
                                                                                                    targetAnchor: 'bottom',
                                                                                                    sourceAnchor: 'top',
                                                                                                    style: {strokeColor: '#AF2623'},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                },] : [],
                                                                                                r4: (!this.state.natg)?[{
                                                                                                    targetId: 't2-ec2',
                                                                                                    targetAnchor: 'top',
                                                                                                    sourceAnchor: 'right',
                                                                                                    style: {strokeColor: '#AF2623'},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                },] : []
                                                                                            }}
                                                                                        />
                                                                                    }

                                                                                    { this.shouldShowServiceElement('natg2') &&
                                                                                        <Block src="NATG" height="50"
                                                                                            icon='small' 
                                                                                            style={{width: '150px'}}
                                                                                            title={<div><span>NAT Gateway</span></div>}
                                                                                            titlePaddingTop="15"
                                                                                            globalMarginTop={this.state.glb_d? '20' : '0'}
                                                                                            archer_id="natg2"
                                                                                            relations={{                                                
                                                                                                t2: this.state.nwfw? [ {
                                                                                                    targetId: 'b8-nfwe' ,
                                                                                                    targetAnchor: 'bottom',
                                                                                                    sourceAnchor: 'top',
                                                                                                    style: {strokeColor: '#AF2623'},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                }] : [],
                                                                                                l8: this.state.glb_d? [ {
                                                                                                    targetId: 'r2-glb-endp-a' ,
                                                                                                    targetAnchor: 'right',
                                                                                                    sourceAnchor: 'left',
                                                                                                    style: {strokeColor: '#AF2623'},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                }]: []
                                                                                            }}
                                                                                        />
                                                                                    }
                                                                                </div>
                                                                                {/*  End of VPC A AZ1 Body Middle Row */}

                                                                                {/*  VPC A AZ1 Body Bottom Row */}
                                                                                <div style={{gridRow: "1 span 2", display:'flex', justifyContent:this.state.glb_d? 'right' : 'center', paddingRight:this.state.glb_d? '25px' : '', width:this.state.glb_d? '245px': ''}}>

                                                                                    { this.shouldShowServiceElement('ec2') &&
                                                                                        <Block src="EC2" height="50" 
                                                                                            icon='small' 
                                                                                            style={{width: '150px'}}
                                                                                            title={<div><span>EC2 Instance*</span></div>}
                                                                                            titlePaddingTop="15"
                                                                                            globalMarginTop={this.state.natg? "40": "0"}
                                                                                            archer_id="ec2"
                                                                                            relations={{
                                                                                                t7: ((this.state.natg && !this.state.nwfw)) && (this.state.cvpn )? [{
                                                                                                    targetId: this.state.glb_d? 'b8-natg2' :'b8-natg',
                                                                                                    targetAnchor: 'bottom',
                                                                                                    sourceAnchor: 'top',
                                                                                                    style: {},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}>${this.state.prices.pergb_natg}/GB</div>
                                                                                                }] : [],
                                                                                                t5: ((this.state.vpce_d))? [{
                                                                                                    targetId: 'b5-vpc-endp-a',
                                                                                                    targetAnchor: 'bottom',
                                                                                                    sourceAnchor: 'top',
                                                                                                    style: {},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                }] : [],
                                                                                                b5: this.state.r53res_outbound? [{
                                                                                                    targetId: 't2-endp-oe',
                                                                                                    targetAnchor: 'top',
                                                                                                    sourceAnchor: 'bottom',
                                                                                                    style: {},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                }] : [],
                                                                                                b2: (this.state.nwfw_c || this.state.glb_c || this.state.vpce_c)? [{ // this arrow connects to the bottom of AZ1 and not the EC2 Block
                                                                                                    targetId: 't3-tgw',
                                                                                                    targetAnchor: 'top',
                                                                                                    sourceAnchor: 'bottom',
                                                                                                    style:  this.state.nwfw_c? {strokeColor:'#AF2623'} : {} ,
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px',  color: (this.state.nwfw_c)? "#AF2623" : ""  }}>To TGW, ${this.state.prices.pergb_dx}</div>
                                                                                                }]:[],
                                                                                                t2: (this.state.natg && (!this.state.cvpn && !this.state.nwfw ))? [{
                                                                                                    targetId: this.state.glb_d? 'b8-natg2': 'b8-natg',
                                                                                                    targetAnchor: 'bottom',
                                                                                                    sourceAnchor: 'top',
                                                                                                    style: {},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                }] : [],
                                                                                                t8: (this.state.nwfw )? [{
                                                                                                    targetId: this.state.natg? 'b8-natg2' : 'b8-nfwe',
                                                                                                    targetAnchor: 'bottom',
                                                                                                    sourceAnchor: 'top',
                                                                                                    style: {strokeColor: '#AF2623'},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                }] : [],
                                                                        
                                                                                            }}
                                                                                        />
                                                                                        
                                                                                    }
                                                                                    
                                                                                </div>
                                                                                {/*  End of VPC A AZ1 Body Bottom Row */}

                                                                            </div>
                                                                            {/*  End of VPC A AZ1 Body */}
                                                                            
                                                                            
                                                                        </div>
                                                                        {/*  End of VPC A AZ1 */}

                                                                    </div>
                                                                    {/*  End of VPC A Right Side */}
                                                                    
                                                                    {/*  VPC A Left Side */}
                                                                    <div style={{gridColumn: "1"}}>

                                                                        {this.shouldShowServiceElement('phza') &&
                                                                            <Block src="PHZ" height="50"
                                                                                icon='small'  
                                                                                title={<div><span>PHZ</span></div>}
                                                                                style={{width: '100px'}}
                                                                                titlePaddingTop="15"
                                                                                globalMarginTop="8"
                                                                                archer_id="phza"
                                                                                relations={{                                                
                                                                                    r5: [{
                                                                                        targetId: 't3-phzc',
                                                                                        targetAnchor: 'top',
                                                                                        sourceAnchor: 'right',
                                                                                        style: {strokeDasharray: '5,5', strokeColor: '#5787d0' },
                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                    }],
                                                                                    
                                                                                }}
                                                                            />
                                                                        }

                                                                        { this.shouldShowServiceElement('nlb') && 
                                                                            <Block src="NLB" height="50"
                                                                                icon='small'  
                                                                                title={<div><span>NLB</span></div>}
                                                                                style={{width: '100px'}}
                                                                                titlePaddingTop="15"
                                                                                globalMarginTop="8"
                                                                                archer_id="nlb"
                                                                                relations={{                                                
                                                                                    r2: [{
                                                                                        targetId: 'l2-ec2',
                                                                                        targetAnchor: 'left',
                                                                                        sourceAnchor: 'right',
                                                                                        style: {},
                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                    }],
                                                                                    
                                                                                }}
                                                                            />
                                                                        }

                                                                        { this.shouldShowServiceElement('alb') && 
                                                                            <Block src="ALB" height="50" 
                                                                                icon='small' 
                                                                                title={<div><span>ALB</span></div>}
                                                                                style={{width: '100px'}}
                                                                                titlePaddingTop="15"
                                                                                globalMarginTop="8"
                                                                                archer_id="alb"
                                                                                relations= {
                                                                                    this.state.nlb? 
                                                                                    {                                                
                                                                                        r8: [{
                                                                                            targetId: 'l8-ec2',
                                                                                            targetAnchor: 'left',
                                                                                            sourceAnchor: 'right',
                                                                                            style: {},
                                                                                            label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                        }],
                                                                                        
                                                                                    }:
                                                                                    {                                                
                                                                                        r2: [{
                                                                                            targetId: 'l2-ec2',
                                                                                            targetAnchor: 'left',
                                                                                            sourceAnchor: 'right',
                                                                                            style: {},
                                                                                            label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                        }],
                                                                                        
                                                                                    }
                                                                                }
                                                                            />
                                                                        } 
                                                                        
                                                                        { this.shouldShowServiceElement('dnsfw') && 
                                                                            <Block src="DNSFW" height="50" 
                                                                                icon='small'
                                                                                title={<div><span>DNS Firewall</span></div>}
                                                                                style={{width: '150px'}}
                                                                                titlePaddingTop="15"
                                                                                globalMarginTop="8"
                                                                                archer_id="dnsfw"
                                                                                relations={[]}
                                                                            />
                                                                        }

                                                                    </div>
                                                                    {/*  End of VPC A Left Side */}

                                                                </div>
                                                                {/*  End of VPC A Body */}

                                                            </div>
                                                            {/*  VPC A */}

                                                        </ArcherElement>
                                                        {/*  End Of Account A Bottom Row */}
                                                                
                                                        
                                                    </div>
                                                    {/*  End of Account A */}

                                                    {/* Account B */}
                                                    { this.shouldShowServiceElement("AccB") &&
                                                        <div id="accountB" className="baseElement" style={{padding:'10px',display:'grid', gridTemplateColumns:'auto', rowGap:'20px', flex:'wrap', alignItems:'start'}}>

                                                            <div className="icon"><img src={'img/cloud.svg'} alt="cloud" /> </div>

                                                            <div className="cloudTitle" style={{fontWeight: 'bold', gridColumn:'1 / span 1'}}>Account B</div>

                                                            {/*  Account B Top Row*/}
                                                            { this.shouldShowServiceElement('AccB-TopRow') && 
                                                                <div style={{display:'flex',justifyContent:'space-around',gridColumn:'1 / span 1'}}>

                                                                </div>
                                                            }
                                                            {/*  End of Account B Top Row*/} 

                                                            {/*  Account B Bottom Row*/}
                                                            <ArcherElement id="vpcb"
                                                                relations={(this.state.peering)? [ 
                                                                    {
                                                                    targetId:'l2-vpcd',
                                                                    targetAnchor: 'left',
                                                                    sourceAnchor: 'right', 
                                                                    style: { strokeColor: '#5787d0' },
                                                                    label: <div className="arrowLabel peeringArrow whitebg" style={{position: 'relative', top: '5px', right:'5px'}}>${this.state.prices.dt_az}/GB DT Inter-AZ</div>
                                                                    },
                                                                ] : []
                                                            }>

                                                                {/*  VPC B */}
                                                                <div className="vpcBlock" style={{paddingBottom:'10px'}}>

                                                                    <div className="icon">
                                                                        <img src={'img/vpc.svg'} style={{height: '32px'}} alt="region" /> 
                                                                    </div>

                                                                    <div style={{position: 'absolute', top: 4, left: 40, color: '#1e8901'}}>
                                                                        {this.state.nwfw? "Protected " : "" } VPC B
                                                                    </div>

                                                                    {/*  VPC B Body */}
                                                                    <div style={{display: 'grid', gap:"10px", gridAutoFlow:'column'}}>

                                                                        {/*  VPC B Top Row */}
                                                                        { this.shouldShowServiceElement('VpcB-TopRow') && 

                                                                            <div style={{display:'flex', justifyContent: 'space-around', gridRow:'1 / span 1', gridColumn:'1 / span 2'}}>

                                                                                
                                                                                <Block src="IGW" height="50" 
                                                                                    title={<div><span>IGW*</span></div>}
                                                                                    style={{width: '100px'}}
                                                                                    titlePaddingTop="15"
                                                                                    globalMarginTop="8"
                                                                                    archer_id="igw-b"
                                                                                    relations={{                                                
                                                                                        t8: !this.state.glb_d?[{
                                                                                            targetId: 'b8-net',
                                                                                            targetAnchor: 'bottom',
                                                                                            sourceAnchor: 'top',
                                                                                            style: {},
                                                                                            label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '20px', color:'#AF2623'}} >${this.state.prices.pergb_nwfw}/GB DTO</div>
                                                                                            //label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                        }] : [],
                                                                                        b2: (this.state.glb_d)? [{
                                                                                            targetId: 't8-glb-endp-b',
                                                                                            targetAnchor: 'top',
                                                                                            sourceAnchor: 'bottom',
                                                                                            style: {strokeColor: '#5787d0'},
                                                                                            label: <div className="arrowLabel whitebg"></div>
                                                                                            //label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                        }] : [],
                                                                                    }}
                                                                                />

                                                                                
                                                                            </div>

                                                                        }
                                                                        {/*  End of VPC B Top Row */}
                                                                        
                                                                        {/*  VPC B Right Side */}
                                                                        <div> 
                                                                            
                                                                            {/*  VPC B AZ1 */}
                                                                            <div className="inline azBlock" style={{display:'flex',minWidth:'200px'}} >

                                                                                <div style={{position: 'absolute', top: 4, left: 40, color: '#387EB5'}}>
                                                                                    Availability Zone 1
                                                                                </div>

                                                                                {/*  VPC B AZ1 Body*/}
                                                                                <div style={{ display:"grid", gridTemplateColums:"auto auto", flex:'auto'}}>

                                                                                    {/*  VPC B AZ1 Top Row*/}
                                                                                    <div style={{gridRow: "1 / span 2", display:"flex", flexWrap:'wrap', justifyContent:'space-around'}}>


                                                                                        { this.shouldShowServiceElement('vpc-endp-b') &&
                                                                                            <Block src="ENDP" height="50" 
                                                                                                icon='small'
                                                                                                style={{width: '100px'}}
                                                                                                title={<div><span>VPC E</span></div>}
                                                                                                titlePaddingTop="15"
                                                                                                globalMarginTop="8"
                                                                                                archer_id="vpc-endp-b"
                                                                                                relations={{
                                                                                                    t5: [{
                                                                                                        targetId: 'b6-3vpc1',
                                                                                                        targetAnchor: 'bottom',
                                                                                                        sourceAnchor: 'top',
                                                                                                        style: {},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                    }],
                                                                                                }}
                                                                                                    
                                                                                            />
                                                                                        }

                                                                                        { this.shouldShowServiceElement('nwfw-b') &&
                                                                                            <Block src="NFWE" height="50" 
                                                                                                icon='small'
                                                                                                style={{width: '120px'}}
                                                                                                title={<div><span>NFW</span></div>}
                                                                                                titlePaddingTop="10"
                                                                                                iconLabel= { "$" + this.state.prices.pergb_nwfw +"/GB DP"}
                                                                                                globalMarginTop="8"
                                                                                                archer_id="nfwe-b"
                                                                                                relations={{
                                                                                                    t8: [{
                                                                                                        targetId: 'b2-igw-b',
                                                                                                        targetAnchor: 'bottom',
                                                                                                        sourceAnchor: 'top',
                                                                                                        style: {strokeColor: '#AF2623'},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                    }]
                                                                                                }}
                                                                                            />
                                                                                        }   

                                                                                        { this.shouldShowServiceElement('glb-endp-b') &&
                                                                                            <Block src="ENDP" height="50" 
                                                                                                icon='small'
                                                                                                style={{width: '105px'}}
                                                                                                title={<div><span>GWLBE</span></div>}
                                                                                                titlePaddingTop="15"
                                                                                                globalMarginTop="8"
                                                                                                archer_id="glb-endp-b"
                                                                                                relations={{
                                                                                                    l4: [{
                                                                                                        targetId: 't8-glb',
                                                                                                        targetAnchor: 'top',
                                                                                                        sourceAnchor: 'left',
                                                                                                        style: {strokeColor: '#5787d0'},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                    }],
                                                                                                    b8: [{
                                                                                                        targetId: 't8-ec2b',
                                                                                                        targetAnchor: 'top',
                                                                                                        sourceAnchor: 'bottom',
                                                                                                        style: {strokeColor: '#5787d0'},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                    }]
                                                                                                }}
                                                                                            />
                                                                                        }  
                                                                                            
                                                                                    </div>
                                                                                    {/*  End VPC B AZ1 Top Row*/}

                                                                                    {/*  VPC B AZ1 Bottom Row*/}
                                                                                    <div style={{gridRow: "1 span 2", display:'flex', justifyContent:'space-around'}}>

                                                                                        <Block src="EC2" height="50" 
                                                                                            icon='small' 
                                                                                            style={{width: '150px'}}
                                                                                            title={<div><span>EC2 Instance*</span></div>}
                                                                                            titlePaddingTop="15"
                                                                                            globalMarginTop={this.state.nwfw? '20' : '20' }
                                                                                            archer_id="ec2b"
                                                                                            relations={{
                                                                                                b2: this.state.r53res_outbound? [{
                                                                                                    targetId: 't8-endp-oe',
                                                                                                    targetAnchor: 'top',
                                                                                                    sourceAnchor: 'bottom',
                                                                                                    style: {},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                }]:[],
                                                                                                t8: (this.state.nwfw)? [{
                                                                                                    targetId: 'b8-nfwe-b',
                                                                                                    targetAnchor: 'bottom',
                                                                                                    sourceAnchor: 'top',
                                                                                                    style: {strokeColor: '#AF2623'},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                }] : [],
                                                                                                t5: ((this.state.vpce_d))? [{
                                                                                                    targetId: 'b5-vpc-endp-b',
                                                                                                    targetAnchor: 'bottom',
                                                                                                    sourceAnchor: 'top',
                                                                                                    style: {},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                }] : [],
                                                                                                b3: (this.state.vpce_c)? [{
                                                                                                    targetId: 't6-tgw',
                                                                                                    targetAnchor: 'top',
                                                                                                    sourceAnchor: 'bottom',
                                                                                                    style:  this.state.nwfw_c? {strokeColor:'#AF2623'} : {} ,
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}>To TGW, ${this.state.prices.pergb_dx}</div>
                                                                                                }]:[],
                                                                        
                                                                                            }}
                                                                                        />

                                                                                    </div>
                                                                                    {/*  End of VPC B AZ1 Bottom Row */}

                                                                                </div>
                                                                                {/*  End VPC B AZ1 Body*/}
                                                                                
                                                                            </div>
                                                                            {/*  End of VPC B AZ1 */}

                                                                        </div>
                                                                        {/*  End of VPC B Right Side */}

                                                                        {/*  VPC B Left Side */}            
                                                                        <div style={{gridColumn:'1'}}>
                                                                            { this.shouldShowServiceElement('phzb') && 
                                                                                <Block src="PHZ" height="50"
                                                                                    icon='small'  
                                                                                    title={<div><span>PHZ</span></div>}
                                                                                    style={{width: '100px'}}
                                                                                    titlePaddingTop="15"
                                                                                    globalMarginTop="8"
                                                                                    archer_id="phzb"
                                                                                    relations={{                                                
                                                                                        b5: [{
                                                                                            targetId: 't7-phzc',
                                                                                            targetAnchor: 'top',
                                                                                            sourceAnchor: 'bottom',
                                                                                            style: {strokeDasharray: '5,5', strokeColor: '#5787d0' },
                                                                                            label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                        }],
                                                                                        
                                                                                    }}
                                                                                />
                                                                            }
                                                                        </div>
                                                                        {/*  End of VPC B Left Side */}

                                                                    </div>
                                                                    {/*  End of VPC B Body*/}

                                                                </div>
                                                                {/*  End of VPC B */}
                                                                

                                                            </ArcherElement>
                                                            {/*  End Account B Bottom Row*/}
                                                                    

                                                        </div>
                                                    }
                                                    {/*  End of Account B */}

                                                    {/* Account D */}
                                                    { this.shouldShowServiceElement('AccD') && 
                                                        <div className="baseElement account" style={{height:'100px'}}>

                                                            <div className="icon"><img src={'img/cloud.svg'} alt="cloud" /></div>
                                                            
                                                            <div className="cloudTitle title" style={{fontWeight: 'bold'}}>Account D</div>
                                                                <Block src="VPC" height="36" 
                                                                    style={{width: '112px'}}
                                                                    title={<div>VPC D</div>}
                                                                    titlePaddingTop="8"
                                                                    globalMarginTop="0"
                                                                    archer_id="vpcd"
                                                                    relations={{                                                
                                                                        b5: [{
                                                                            targetId: 'vpcb',
                                                                            targetAnchor: 'right',
                                                                            sourceAnchor: 'bottom',
                                                                            style: { strokeColor: '#5787d0' },
                                                                            label: <div className="arrowLabel peeringArrow whitebg" style={{position: 'relative', top: '5px', left:'25px'}}>${this.state.prices.dt_az}/GB DT Inter-AZ</div>
                                                                        }]
                                                                    }}
                                                                />
                                                        </div>
                                                    }
                                                    {/* End of Account D */}

                                                </div>
                                                {/*  End of Account Area */}
                                                
                                                {/* Networking Account Area*/}
                                                { this.shouldShowServiceElement('NetAcc') &&
                                                    <div className="diagramRow" style={{display:'grid', gridAutoFlow:'column'}}> 

                                                        <div id='networkingAccount' style={{ padding:'20px', display:'flex', justifyContent:'center'}}>

                                                            <div className="baseElement" style={{display:'grid', gridAutoFlow:'column', gap:'10px'}}>

                                                                <div className="icon"><img src={'img/cloud.svg'} alt="cloud" /></div>
                                                                <div className="cloudTitle title" style={{fontWeight: 'bold',gridColumn:'1 / span 2'}}>Networking Account</div>

                                                                <div style={{display: 'grid', gap:"10px", gridAutoFlow:'column', gridColumn:'1 / span 2', padding:'10px'}}>

                                                                    {/* Left Side of Networking Account*/}

                                                                    {/* Appliance VPC Area*/}
                                                                    {this.shouldShowServiceElement("AppVpc") &&
                                                                        <div style={{gridColumn:'1'}}>
                                                                            
                                                                            <div className="vpcBlock" style={{paddingBottom:'10px'}}>

                                                                                <div className="icon">
                                                                                    <img src={'img/vpc.svg'} style={{height: '32px'}} alt="region" /> 
                                                                                </div>

                                                                                <div style={{position: 'absolute', top: 4, left: 40, color: '#1e8901'}}>
                                                                                    Appliance VPC
                                                                                </div>

                                                                                {/*  Applicance VPC Body */}
                                                                                <div style={{display: 'grid', gap:"20px", gridAutoFlow:'row'}}>

                                                                                    <div style={{gridRow:'1 / 3', justifyContent:'center', display:'flex'}}> 
                                                                                        { this.shouldShowServiceElement('glb-endp-n') &&
                                                                                            <Block src="ENDP" height="50" 
                                                                                                icon='small'
                                                                                                style={{width: '105px'}}
                                                                                                title={<div><span>GLWBE</span></div>}
                                                                                                titlePaddingTop="15"
                                                                                                globalMarginTop="0"
                                                                                                archer_id="glb-endp-n"
                                                                                                relations={{
                                                                                                    l2: [ {
                                                                                                        targetId: 't2-glb',
                                                                                                        targetAnchor: 'top',
                                                                                                        sourceAnchor: 'left',
                                                                                                        style: {strokeColor: '#AF2623'},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                    }],
                                                                                                    r6: [{
                                                                                                        targetId: 'l6-tgw',
                                                                                                        targetAnchor: 'left',
                                                                                                        sourceAnchor: 'right',
                                                                                                        style: {},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}>To TGW, ${this.state.prices.pergb_dx}</div>
                                                                                                    },]
                                                                                                }}
                                                                                            />
                                                                                        }
                                                                                    </div>
                                                                                    
                                                                                    <div style={{gridRow:'4 / 3', display:'flex', justifyContent:'space-between', gap:'20px', paddingLeft:'10px', paddingRight:'10px'}}>
                                                                                        <Block src="GLB" height="50" 
                                                                                            icon='small'
                                                                                            style={{width: '100px'}}
                                                                                            title={<div><span>GWLB</span></div>}
                                                                                            titlePaddingTop="15"
                                                                                            globalMarginTop="8"
                                                                                            archer_id="glb"
                                                                                            relations={{
                                                                                                r6: (this.state.glb_d || this.state.glb_c)?[{
                                                                                                    targetId: 'l6-appl',
                                                                                                    targetAnchor: 'left',
                                                                                                    sourceAnchor: 'right',
                                                                                                    style: {strokeColor: '#AF2623'},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                }] : [],
                                                                                                t9: this.state.glb_d?[{
                                                                                                    targetId: 'l7-glb-endp-b',
                                                                                                    targetAnchor: 'left',
                                                                                                    sourceAnchor: 'top',
                                                                                                    style: {strokeColor: '#5787d0'},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                }]:[],
                                                                                                t5: this.state.glb_c?[{
                                                                                                    targetId: 'l7-glb-endp-n',
                                                                                                    targetAnchor: 'left',
                                                                                                    sourceAnchor: 'top',
                                                                                                    style: {strokeColor: '#AF2623'},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                }] : [],
                                                                                                l2 :this.state.glb_d?[{
                                                                                                    targetId: 'b6-glb-endp-a',
                                                                                                    targetAnchor: 'bottom',
                                                                                                    sourceAnchor: 'left',
                                                                                                    style: {strokeColor: '#AF2623',},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                }] : []
                                                                                            }}
                                                                                        />
                                                                                        <Block src="APPL" height="50" 
                                                                                            icon='small'
                                                                                            style={{width: '150px'}}
                                                                                            title={<div><span>Appliances*</span></div>}
                                                                                            titlePaddingTop="15"
                                                                                            globalMarginTop="8"
                                                                                            archer_id="appl"
                                                                                            relations={{
                                                                                                l2: [{
                                                                                                    targetId: 'r2-glb',
                                                                                                    targetAnchor: 'right',
                                                                                                    sourceAnchor: 'left',
                                                                                                    style: {strokeColor: '#AF2623'},
                                                                                                    label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                }]
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                {/*  End of Applicance VPC Body */}



                                                                            </div>
                                                                        </div>
                                                                    }
                                                                    {/* End of Appliance VPC Area*/}  

                                                                    { this.shouldShowServiceElement('tgw') && <div style={{gridRow:'1 / 4'}}>

                                                                        {/* TGW Area */}
                                                                        <div style={{display:'flex', justifyContent:'space-around', gridColumn:'1 / span 2', marginBottom:'50px'}}>

                                                                            <Block src="TGW" height="72"
                                                                                title={<div><span>Transit</span><span>Gateway {this.state.interRegion ? "(1)" : ""}</span></div>}
                                                                                style={{ width:'300px'}}
                                                                                titlePaddingTop="20"
                                                                                globalMarginTop="0"
                                                                                archer_id="tgw"
                                                                                relations={{
                                                                                    b4: this.state.dx ? [{
                                                                                        targetId: 't8-dxgw',
                                                                                        targetAnchor: 'top',
                                                                                        sourceAnchor: 'bottom',
                                                                                        label: <div className="arrowLabel graybg" style={{}}>$0.00</div>
                                                                                        }] : [],
                                                                                    b7: this.state.vpn ? [{
                                                                                        targetId: 't8-vpn',
                                                                                        targetAnchor: 'top',
                                                                                        sourceAnchor: 'bottom',
                                                                                        label: <div className="arrowLabel graybg" style={{}}>$0.00</div>
                                                                                        }] : [],
                                                                                    t5: (this.state.glb_c && !this.state.vpce_c)? [{
                                                                                        targetId: 'b5-ec2b',
                                                                                        targetAnchor: 'bottom',
                                                                                        sourceAnchor: 'top',
                                                                                        label: <div className="arrowLabel whitebg" style={{marginBottom: 20, marginLeft: 20}}>From TGW, $0.00</div>
                                                                                    }] : (!this.state.nwfw_c && !this.state.vpce_c)? [{
                                                                                        targetId: 'vpcb',
                                                                                        targetAnchor: 'bottom',
                                                                                        sourceAnchor: 'top',
                                                                                        label: <div className="arrowLabel whitebg" style={{marginBottom: 20, marginLeft: 20}}>From TGW, $0.00</div>
                                                                                    }] : [],
                                                                                    r2: this.state.interRegion ? [{
                                                                                        targetId: 'l2-tgw2',
                                                                                        targetAnchor: 'left',
                                                                                        sourceAnchor: 'right',
                                                                                        style: { strokeColor: '#5787d0' },
                                                                                        label: <div className="arrowLabel peeringArrow whitebg" style={{padding: 2}}>${this.state.prices.dt_az_current}/GB, DT IR</div>
                                                                                    }] : [],
                                                                        
                                                                                    t8: (this.state.nwfw_c)? [{
                                                                                        targetId: 'b8-ec2b',
                                                                                        targetAnchor: 'bottom',
                                                                                        sourceAnchor: 'top',
                                                                                        style: { strokeColor: '#AF2623' },
                                                                                        label: <div className="arrowLabel peeringArrow whitebg" style={{color:'#AF2623'}}>From TGW, $0.00</div>
                                                                                    }] : [],
                                                                                    b8: this.state.nwfw_c? [{
                                                                                        targetId: 'l8-nfwe-c',
                                                                                        targetAnchor: 'left',
                                                                                        sourceAnchor: 'bottom',
                                                                                        style: { strokeColor: '#AF2623' },
                                                                                        label: <div className="arrowLabel peeringArrow whitebg" style={{color:'#AF2623'}}>From TGW, $0.00</div>
                                                                                    }] : [],
                                                                                    b6: this.state.vpce_c? [{
                                                                                        targetId: 'l6-vpc-endp-c',
                                                                                        targetAnchor: 'left',
                                                                                        sourceAnchor: 'bottom',
                                                                                        style: {},
                                                                                        label: <div className="arrowLabel whitebg" style={{}}></div>
                                                                                    }] : [],
                                                                                    l2: this.state.glb_c? [{
                                                                                        targetId: 'r2-glb-endp-n',
                                                                                        targetAnchor: 'right',
                                                                                        sourceAnchor: 'left',
                                                                                        style: { },
                                                                                        label: <div className="arrowLabel whitebg" style={{}}>From TGW, $0.00</div>
                                                                                    }] : []
                                                                                            
                                                                                }}
                                                                            />

                                                                        </div>
                                                                        {/* End of TGW Area */}
                                                                        
                                                                        {/* Under of TGW Area */}
                                                                        <div style={{display:'flex', justifyContent:'center',gridColumn:'1 / span 2'}}>
                                                                    
                                                                            { this.shouldShowServiceElement('dx') && 
                                                                                <Block src="DX" height="60" 
                                                                                    title={<div><span>Direct Connect</span><span>Gateway</span></div>}
                                                                                    titlePaddingTop="12"
                                                                                    style={{display: 'inline-block', float: 'left', width: '180px'}}
                                                                                    globalMarginTop="0"
                                                                                    archer_id="dxgw"
                                                                                    relations={{
                                                                                        b8: this.state.dx ? [{
                                                                                            targetId: 't8-rt1',
                                                                                            targetAnchor: 'top',
                                                                                            sourceAnchor: 'top',
                                                                                            label: <div className="arrowLabel whitebg" style={{}}>${this.state.prices.dx_dto}/GB DX DTO</div>
                                                                                            }] : []
                                                                                        ,t2: [{
                                                                                            targetId: 'b2-tgw',
                                                                                            targetAnchor: 'bottom',
                                                                                            sourceAnchor: 'top',
                                                                                            label: <div className="arrowLabel graybg" style={{}}>To TGW, ${this.state.prices.pergb_dx}</div>
                                                                                            }]
                                                                                        }
                                                                                    }
                                                                                />
                                                                            }

                                                                            { this.shouldShowServiceElement('vpn') && 
                                                                                <Block src="VPN" height="60" 
                                                                                    title={<div><span>Site-to-Site</span><span>VPN</span></div>}
                                                                                    style={{display: 'inline-block', marginLeft: `${ this.state.dx ? '50px' : '0px'}`, float: 'left', width: '180px'}}
                                                                                    titlePaddingTop="12"
                                                                                    globalMarginTop="0"
                                                                                    archer_id="vpn"
                                                                                    relations={
                                                                                        {
                                                                                            b8: this.state.vpn ? [{
                                                                                                targetId: 't8-rt2',
                                                                                                targetAnchor: 'top',
                                                                                                sourceAnchor: 'top',
                                                                                                label: <div className="arrowLabel whitebg" style={{}}>${this.state.prices.vpn_dto}/GB Data Transfer Out</div>
                                                                                                }] : [],
                                                                                            t4: [{
                                                                                                targetId: 'b5-tgw',
                                                                                                targetAnchor: 'bottom',
                                                                                                sourceAnchor: 'top',
                                                                                                label: <div className="arrowLabel graybg" style={{}}>To TGW, ${this.state.prices.pergb_vpn}/GB</div>
                                                                                                }],
                                                                                                
                                                                                        }
                                                                                    }
                                                                                />
                                                                            } 
                                                                            
                                                                        </div>
                                                                        {/* End of Under TGW Area */}

                                                                    </div>
                                                                    }
                                                                    {/* End of Left Side of Networking Account */}

                                                                    {/*  Right side of Netowrking Account */}
                                                                    { this.shouldShowServiceElement('NetAcc-Right') && 
                                                                    
                                                                        <div style={{gridColumn:'2 / 4'}}>

                                                                            {/*  VPC C */}
                                                                            <div className="vpcBlock" style={{paddingBottom:'10px', width: this.state.vpce_c? '175px' : this.state.nwfw_c? '150px': ''}}>

                                                                                <div className="icon">
                                                                                    <img src={'img/vpc.svg'} style={{height: '32px'}} alt="region" /> 
                                                                                </div>

                                                                                <div style={{position: 'absolute', top: 4, left: 40, color: '#1e8901'}}>
                                                                                    {(this.state.nwfw_c)? 'Inspection VPC ': this.state.vpce_c? 'Shared Services VPC':'VPC C' }
                                                                                </div>

                                                                                {/* Inside of VPC C */}
                                                                                <div style={{display: 'grid', gap:"10px", gridAutoFlow:'row'}}>
                                                                                    
                                                                                    <div style={{gridColumn:'2 / 4'}} ></div>
                                                                                    {/* Right Side of VPC C*/}
                                                                                    
                                                                                    { this.shouldShowServiceElement('natg3') && <div> 
                                                                                        <Block src="NATG" height="50"
                                                                                                icon='small' 
                                                                                                style={{width: '100px'}}
                                                                                                title={<div><span>NATG</span></div>}
                                                                                                titlePaddingTop="15"
                                                                                                globalMarginTop="8"
                                                                                                archer_id="natg3"
                                                                                                relations={{                                                
                                                                                                    t8: [{
                                                                                                        targetId: this.state.nwfw? 'b8-igw' : 'b8-net' ,
                                                                                                        targetAnchor: 'bottom',
                                                                                                        sourceAnchor: 'top',
                                                                                                        style: {},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                    }],
                                                                                                    b8: this.state.nwfw_c? [{
                                                                                                        targetId: 't8-nfwe-c' ,
                                                                                                        targetAnchor: 'top',
                                                                                                        sourceAnchor: 'bottom',
                                                                                                        style: {},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                    }] : [],

                                                                                                }}
                                                                                            /> 
                                                                                            </div>
                                                                                            }

                                                                                    { (this.state.r53res_inbound || this.state.r53res_outbound) && <div>
                                                                                            <div style={{display:"flex", flexWrap:'non-wrap', justifyContent:'space-around', gap:'10px'}} >
                                                                                                
                                                                                                {this.shouldShowServiceElement('endp-oe') && 
                                                                                                    <Block src="ENDP" height="50"
                                                                                                        icon='small' 
                                                                                                        style={{width: '90px'}}
                                                                                                        title={<div><span>OE</span></div>}
                                                                                                        titlePaddingTop="15"
                                                                                                        globalMarginTop="0"
                                                                                                        archer_id="endp-oe"
                                                                                                        relations={{
                                                                                                            b8: this.state.r53res_outbound? [{
                                                                                                                targetId: 't2-cdns',
                                                                                                                targetAnchor: 'top',
                                                                                                                sourceAnchor: 'bottom',
                                                                                                            
                                                                                                                label: <div className="arrowLabel peeringArrow whitebg"></div>
                                                                                                            }] : []
                                                                                                        }}
                                                                                                    /> 
                                                                                                }

                                                                                                { this.shouldShowServiceElement('endp-ie') && 
                                                                                                    <Block src="ENDP" height="50"
                                                                                                        icon='small' 
                                                                                                        style={{width: '90px'}}
                                                                                                        title={<div><span>IE</span></div>}
                                                                                                        titlePaddingTop="15"
                                                                                                        globalMarginTop="0"
                                                                                                        archer_id="endp-ie"
                                                                                                        relations={{
                                                                                                            t2: this.state.r53res_inbound? [{
                                                                                                                targetId: 'b8-ec2',
                                                                                                                targetAnchor: 'bottom',
                                                                                                                sourceAnchor: 'top',
                                                                                                            
                                                                                                                label: <div className="arrowLabel peeringArrow whitebg"></div>
                                                                                                            }] : [],
                                                                                                            t8: this.state.r53res_inbound? [{
                                                                                                                targetId: 'b8-ec2b',
                                                                                                                targetAnchor: 'bottom',
                                                                                                                sourceAnchor: 'top',
                                                                                                            
                                                                                                                label: <div className="arrowLabel peeringArrow whitebg"></div>
                                                                                                            }] : []
                                                                                                        }}
                                                                                                    />
                                                                                                } 
                                                                                            </div>
                                                                                            
                                                                                        </div>
                                                                                    }
                                                                                    {/* End of Right Side of VPC C */}

                                                                                    {/* Left Side of VPC C */}
                                                                                    <div style={{gridColumn: "1 / span 1", gridColumn:'1', justifyContent:'space-around', gap:'10px'}}>

                                                                                        { this.shouldShowServiceElement('phzc') &&
                                                                                            <Block src="PHZ" height="50"
                                                                                                icon='small'  
                                                                                                title={<div><span>PHZ</span></div>}
                                                                                                style={{width: '100px'}}
                                                                                                titlePaddingTop="15"
                                                                                                globalMarginTop="0"
                                                                                                archer_id="phzc"
                                                                                                relations={{}}
                                                                                            />
                                                                                        }

                                                                                        { this.shouldShowServiceElement('nwfw-c') &&
                                                                                            <Block src="NFWE" height="50" 
                                                                                                icon='small'
                                                                                                style={{width: '100px', marginLeft: '20px'}}
                                                                                                title={<div><span>NFW</span></div>}
                                                                                            
                                                                                                titlePaddingTop="15"
                                                                                                globalMarginTop="52"
                                                                                                archer_id="nfwe-c"
                                                                                                relations={{
                                                                                                    l2: [{
                                                                                                        targetId: 'b9-tgw',
                                                                                                        targetAnchor: 'bottom',
                                                                                                        sourceAnchor: 'left',
                                                                                                        style: {strokeColor: '#AF2623'},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '-5px'}}>To TGW, ${this.state.prices.pergb_vpc}/GB</div>
                                                                                                    }]
                                                                                                }}
                                                                                            />
                                                                                                        
                                                                                        }

                                                                                        { this.shouldShowServiceElement('vpc-endp-c') &&
                                                                                            <Block src="ENDP" height="50" 
                                                                                                icon='small'
                                                                                                style={{width: '100px'}}
                                                                                                title={<div><span>VPC E</span></div>}
                                                                                                titlePaddingTop="15"
                                                                                                globalMarginTop="8"
                                                                                                archer_id="vpc-endp-c"
                                                                                                relations={{
                                                                                                    r5: [{
                                                                                                        targetId: 'l5-3vpc2',
                                                                                                        targetAnchor: 'left',
                                                                                                        sourceAnchor: 'right',
                                                                                                        style: {},
                                                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', top: '5px'}}></div>
                                                                                                    }],
                                                                                                }}
                                                                                                    
                                                                                            />
                                                                                        }
                                                                                    </div>

                                                                                    {/* End of Left Side of VPC C */}

                                                                                </div>
                                                                                {/* End of Inside of VPC C */}  

                                                                            </div>
                                                                            {/*  End of VPC C */}

                                                                        </div>
                                                                    }
                                                                    {/* End of Right Side of Networking Account*/}
                                                                </div>

                                                            </div> 
                                                        
                                                        </div>
                                                        
                                                        <div style={{display:'flex', alignItems:'center', paddingRight:'20px'}}>
                                                            { this.shouldShowServiceElement('3vpc2') &&
                                                                <Block src="NONE" height="70"
                                                                icon='small' 
                                                                style={{width: '260px'}}
                                                                title={<div>
                                                                        <span>Private Link Supported Services</span>
                                                                        <span>3rd Party VPC</span>
                                                                        <span>Service Provider VPC</span>
                                                                    </div>}
                                                                titlePaddingTop="6"
                                                                globalMarginTop="0"
                                                                archer_id="3vpc2"
                                                                relations={{}}
                                                                />                         
                                                            }
                                                        </div>

                                                    </div>
                                                }
                                                {/* End of Networking Account Area */}                 


                                            
                                            </div>
                                            {/* End of Main Region Area */}

                                            {/* On Premises Area */}
                                            <div id='onprem' style={{gridColumn:'1 / span 2', display:'flex', justifyContent:'space-around'}}>

                                                { this.shouldShowServiceElement('OnPrem')  &&

                                                    <div className="baseElement">

                                                    <div className="icon"><img src={'img/dc.svg'} alt="DC" /></div>
                                                    <div className="cloudTitle title" style={{fontWeight: 'bold', display:'flex', justifyContent:'center'}}>On Premises</div>

                                                    <div style={{display:'grid', gap:'20px', justifyContent:'space-between', gridAutoFlow:'column', padding:'10px'}} >
                                                        
                                                        { this.shouldShowServiceElement('rt1') && 
                                                            <Block src="CGW" height="50" 
                                                                title={<div><span>Customer</span><span>Gateway</span></div>}
                                                                style={{ width: '150px'}}
                                                                titlePaddingTop="6"
                                                                globalMarginTop="0"
                                                                archer_id="rt1"
                                                                relations={ {t2: [{
                                                                    targetId: 'b2-dxgw',
                                                                    targetAnchor: 'bottom',
                                                                    sourceAnchor: 'top',
                                                                    label: <div className="arrowLabel whitebg" style={{}}>$0.00/GB</div>
                                                                    }]}
                                                                }
                                                            />
                                                        }

                                                        { this.shouldShowServiceElement('rt2') && 
                                                            <Block src="CGW" height="50" 
                                                                title={<div><span>Customer</span><span>Gateway</span></div>}
                                                                style={{width: '150px'}}
                                                                titlePaddingTop="6"
                                                                globalMarginTop="0"
                                                                archer_id="rt2"
                                                                relations={ {t2: [{
                                                                    targetId: 'b2-vpn',
                                                                    targetAnchor: 'bottom',
                                                                    sourceAnchor: 'top',
                                                                    label: <div className="arrowLabel whitebg" style={{}}>$0.00/GB</div>
                                                                    }]}
                                                                }
                                                            />
                                                        }

                                                        { this.shouldShowServiceElement('cdns') &&

                                                            <Block src="SERVER" height="50" 
                                                                title={<div><span>Customer</span><span>DNS</span></div>}
                                                                style={{width: '150px'}}
                                                                titlePaddingTop="6"
                                                                globalMarginTop="0"
                                                                archer_id="cdns"
                                                                relations={{
                                                                    t8: this.state.r53res_inbound? [{
                                                                        targetId: 'b8-endp-ie',
                                                                        targetAnchor: 'bottom',
                                                                        sourceAnchor: 'top',
                                                                        label: <div className="arrowLabel peeringArrow whitebg"></div>
                                                                    }] : []
                                                                }}
                                                            />

                                                        }

                                                    </div>


                                                    </div>
                                                } 

                                                {/*OnPremise End*/}
                                            </div>
                                            {/* End of On Premises Area */}
                                        
                                            
                                            {/*Second Region */}
                                            
                                            <div className='' style={{ display: this.state.interRegion? '': 'none', border: "1px dashed #387EB5", position: 'relative', gridColumn: '3', gridRow:'2 / span 1', maxHeight:'400px', width:'400px', padding:'10px'}}>

                                                <div className="icon">
                                                    <img src={'img/region.svg'} style={{ height: '32px' }} alt="region" />
                                                </div>

                                                <div style={{ position: 'absolute', top: 4, left: 40, color: '#387EB5' }}>
                                                    {this.getNiceRegionName(this.state.peeredRegion)}
                                                </div>

                                                {/*  Second Region Top Row*/}
                                                <div className="diagramRow mt60">

                                                    {/* Second Region Networking Account */}
                                                    <div className="baseElement account wideAccount" ref={this.secondRegionNetworkingAccount} style={{width:'60%'}}>

                                                        <div className="icon"><img src={'img/cloud.svg'} alt="cloud" /></div>
                                                        <div className="cloudTitle title" style={{fontWeight: 'bold'}}>Networking Account</div>

                                                        <Block src="TGW" height="72" 
                                                            title={<div><span>Transit</span><span>Gateway {this.state.interRegion ? "(2)" : ""}</span></div>}
                                                            titlePaddingTop="20"
                                                            globalMarginTop="0"
                                                            archer_id="tgw2"
                                                            relations={ 
                                                                {
                                                                l8: this.state.interRegion ? [{
                                                                    targetId: 'r8-tgw',
                                                                    targetAnchor: 'right',
                                                                    sourceAnchor: 'left',
                                                                    style: { strokeColor: '#5787d0' },
                                                                    label: <div className="arrowLabel peeringArrow whitebg" style={{padding: 2}}>${this.state.prices.dt_az_back}/GB, DT IR</div>
                                                                }] : [],
                                                                b8: [{
                                                                    targetId: 't8-vpc-e',
                                                                    targetAnchor: 'top',
                                                                    sourceAnchor: 'bottom',
                                                                    label: <div className="arrowLabel whitebg" style={{padding: 2}}>$0.00</div>
                                                                }]
                                                                }
                                                            }
                                                        />
                                                    </div>
                                                    {/* End of Second Region Networking Account */} 

                                                </div>
                                                {/*  End of Second Region Top Row */}

                                                {/*  Second Region Bottom Row*/}
                                                <div className="diagramRow mt60">

                                                    {/* Account E */}
                                                    <div className="baseElement account" style={{marginLeft: '200px'}}>
                                                        <div className="icon"><img src={'img/cloud.svg'} alt="cloud" /></div>

                                                        <div className="cloudTitle title" style={{fontWeight: 'bold'}}>Account E</div>
                                                            {/* VPC E */}
                                                            <Block src="VPC" height="36" 
                                                                style={{width: '112px'}}
                                                                title={<div>VPC E</div>}
                                                                titlePaddingTop="8"
                                                                globalMarginTop="0"
                                                                archer_id="vpc-e"
                                                                relations={{                                                
                                                                    l2: [{
                                                                        targetId: 'b2-tgw2',
                                                                        targetAnchor: 'bottom',
                                                                        sourceAnchor: 'left',
                                                                        label: <div className="arrowLabel whitebg" style={{position: 'relative', left: '-10px'}}>To TGW, ${this.state.prices.pergb_vpc}/GB</div>
                                                                        }],
                                                                }}
                                                            />
                                                            {/* End of VPC E */}
                                                    </div>
                                                    {/* End of Account E */}

                                                </div>
                                                {/*  Second Region Bottom Row*/}

                                            </div> 
                                            
                                            {/* End of Second Region*/}

                                        </div>
                                         {/* Main Grid */}

                                    </ArcherContainer>

                                </div>
                                 {/* End of Main Diagram */}

                            </div>
                             {/* End of Diagram Display Box */}
                            
                            <Calc //dxChange={this.changeDxState} 
                                //vpnChange={this.changeVpnState}
                                //cvpnChange={this.changeCvpnState}
                                //natgChange={this.changeNatgState}
                                //peeringChange={this.changePeeringState}
                                interRegionChange={this.interRegionChange}
                                toggleServices = {this.toggleServices}
                                parentState={this.state} 
                                ref={this.calculatorRef}
                                popChange={this.popChange}
                            /> 

                        </div>
                        {/* End of Diagram and Options View */}

                    </div>

                    <Modal
                        isOpen={this.state.modalOpen}
                        onAfterOpen={ this.afterOpenModal }
                        onRequestClose={ this.closeModal }
                        contentLabel="Example Modal"
                        className="Modal"
                        overlayClassName="Overlay"
                        shouldCloseOnOverlayClick={false}
                        shouldCloseOnEsc={false}
                    >
                        <h1>Add Inter-Region Peering</h1>
                        <h2>Please select a region to peer with</h2>
                        
                        <div style={{width: '70%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '40px'}}>
                            <DropdownList
                                data={this.regions.filter((region) => !this.noPeerRegions.includes(region.region) )} // regions can't peer with China
                                defaultValue={"US East (N. Virginia)"}
                                style={{fontSize: '12px', display: 'inline-block', display: '-moz-inline-stack'}}
                                //valueField="code"
                                dataKey="code"
                                textField="region"
                                groupBy="continent"
                                onChange={ (value,metadata) => {
                                    if (this.state.region===value.code){
                                        alert('Please choose a different region!')
                                    } else {
                                        this.setState({preloader_active: true});
                                        
                                        let requested_ids = [];
                                        requested_ids.push ("DT_InterRegion--" + this.state.region + '---' + value.code);
                                        requested_ids.push ("DT_InterRegion--" + value.code + '---' + this.state.region);
                                        graphqlClient.graphql({query: queries.bulkPrices,
                                            variables: 
                                            {
                                                ids: requested_ids
                                            }}).then( (prices)=> {
                                                //console.log(prices);
                                                if (!prices.data.bulkPrices[0]){
                                                    alert('Warning: Using default pricing! Pricing not available for ' + this.state.region + ' and ' + value.code + ' regions')
                                                    this.setState({
                                                        preloader_active: false,
                                                        interRegion: true,
                                                        peeredRegion: value.code,
                                                        using_default_pricng:true,
                                                        tgw:true,
                                                        prices:{
                                                            ...this.state.prices,
                                                            dt_az_current: 0.02,
                                                            dt_az_back: 0.02
                                                        }
                                                    });
                                                } else {
                                                    this.EnableOrDisableServices(['tgw'], true)
                                                    this.setState({
                                                        preloader_active: false,
                                                        interRegion: true,
                                                        tgw : true,
                                                        peeredRegion: value.code,
                                                        prices: {...this.state.prices, 
                                                            dt_az_current: prices.data.bulkPrices[0].pricePerUnit,
                                                            dt_az_back: prices.data.bulkPrices[1].pricePerUnit}
                                                    });
                                                    const d = this.secondRegionNetworkingAccount.current;
                                                    const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
                                                    if (isChrome)
                                                        d.scrollIntoView();
                                                    else
                                                        d.scrollIntoView({behavior: 'smooth' });
                                                }
                                                this.closeModal();        
                                            }).catch( (err) => {
                                                Alert('Sorry, an error occured');
                                                this.setState({
                                                    preloader_active: false,
                                                    interRegion: false,
                                                });
                                                this.closeModal();        
                                            });
                                
                                    }
                                } }
                            />
                            

                            <button onClick={this.closeModal} className="btn btn-dark" >close</button>
                        </div>
                    </Modal>

                </div>

            </LoadingOverlay>
        )
    }

}

const LoadingOverlay = ({children, active, text}) => {
    return (
        <div className='Humus'>
           {children}
        </div>
    );
}
