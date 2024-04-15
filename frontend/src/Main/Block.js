import * as React from 'react';
import './main.css';

import Anchor from './Anchor';

export interface Relation {
    targetId: String,
    from: String,
    to: String,
    label: String,
}

export interface Relations {
    tl : Array<Relation>,
    tr : Array<Relation>,
    bl : Array<Relation>,
    br : Array<Relation>,
}

interface BlockProps {
    height: Integer,
    src: String,
    title: JSX,
    iconLabel: String,
    titlePaddingTop: Integer,
    globalMarginTop: Integer,
    archer_id: String,
    relations: Relations,
}

export default class Block extends React.Component<BlockProps, {}> {

    render() {

        if (!this.props.relations) this.props.relations =  {tl:[], tr:[], bl:[], br:[]} ;


        var img_style = {height: this.props.height + 'px'};

        if (this.props.icon === 'small'){
            img_style = {height:'45px'}
        }

        var img =
            this.props.src==='VPN' ? <img src={'img/vpn.svg'} style={img_style} alt="vpn" /> :
            this.props.src==='TGW' ? <img src={'img/tgw.svg'} style={img_style} alt="tgw" /> :
            this.props.src==='VPC' ? <img src={'img/vpc.svg'} style={img_style} alt="vpc" /> :
            this.props.src==='CGW' ? <img src={'img/cgw.svg'} style={img_style} alt="cgw" /> :
            this.props.src==='DC' ? <img src={'img/dc.svg'} style={img_style} alt="dc" /> :
            this.props.src==='DX' ? <img src={'img/dx.svg'} style={img_style} alt="DX" /> :
            this.props.src==='NATG' ? <img src={'img/nat-gateway.svg'} style={img_style} className="small-icon" alt="NATG" /> :
            this.props.src==='CVPN' ? <img src={'img/cvpn.svg'} style={img_style} alt="CVPN" /> :
            this.props.src==='client' ? <img src={'img/client.svg'} style={img_style} className="small-icon" alt="client" /> :
            this.props.src==='internet' ? <img src={'img/internet.svg'} style={img_style} className="small-icon" alt="internet" /> :
            this.props.src==='NLB' ? <img src={'img/nlb.svg'} style={img_style} className="small-icon" alt="nlb" /> :
            this.props.src==='ALB' ? <img src={'img/alb.svg'} style={img_style} className="small-icon" alt="alb" /> :
            this.props.src==='R53RES' ? <img src={'img/r53res.svg'} style={img_style} className="small-icon" alt="r53" /> :
            this.props.src==='DNSFW' ? <img src={'img/res-dns-fw.svg'} style={img_style} className="small-icon" alt="resdnsfw" /> :
            this.props.src==='EC2' ? <img src={'img/ec2.svg'} style={img_style} className="small-icon" alt="ec2" /> :
            this.props.src==='ENI' ? <img src={'img/eni.svg'} style={img_style} className="small-icon" alt="eni" /> :
            this.props.src==='ENDP' ? <img src={'img/endpoint.svg'} style={img_style} className="small-icon" alt="ednp" /> :
            this.props.src==='PHZ' ? <img src={'img/phz.svg'} style={img_style} className="small-icon" alt="phz" /> :
            this.props.src==='NFWE' ? <img src={'img/nfw-endp.svg'} style={img_style} className="small-icon" alt="nfw-endp" /> :
            this.props.src==='SERVER' ? <img src={'img/server.svg'} style={img_style} className="small-icon" alt="server" /> :
            this.props.src==='IGW' ? <img src={'img/igw.svg'} style={img_style} className="small-icon" alt="igw" /> :
            this.props.src==='GLB' ? <img src={'img/glb.svg'} style={img_style} className="small-icon" alt="glb" /> :
            this.props.src==='APPL' ? <img src={'img/appliance.svg'} style={img_style} className="small-icon" alt="appl" /> :
            this.props.src==='NONE'?  '' :

            
            <img src={'img/cloud.svg'} style={img_style} alt="cloud" />;
        
            let globalMarginTop = this.props.globalMarginTop;
            if (globalMarginTop===0) globalMarginTop=50;
            
            //fix the weird gaps caused by archer sometimes
            let extraStyle = {}
            if (this.props.src==='TGW'){
                for (let i=1; i<=9; i++){
                    extraStyle['b'+i] = {top: 52};
                }
            } else if (this.props.src==='DX'){
                extraStyle.b2 = {top: 41};
            } else if (this.props.src==='VPN'){
                extraStyle.b2 = {top: 41};
            } else if (this.props.src==='CVPN'){
                extraStyle.b8 = {top: 31};
            } else if (this.props.src==='client' ||this.props.src==='NATG'){
                extraStyle.b8 = {top: 31};
            } else if (this.props.src==='internet'){
                extraStyle.b2 = {top: 31};
                extraStyle.b8 = {top: 31};
            } else if (this.props.src==='VPC'){
                extraStyle.b5 = {top: 16};
            } else if (this.props.src==='NFWE'){
                extraStyle.b8 = {top: 28};
                extraStyle.t7 = {top: -22};
            } else if (this.props.src==='ENDP'){
                extraStyle.b2 = {top: 31};
                extraStyle.b5 = {top: 30};
                extraStyle.b6 = {top: 31};
                extraStyle.b8 = {top: 31};
            } else if (this.props.src==='PHZ'){
                extraStyle.b5 = {top: 31};
            } else if (this.props.src==='EC2'){
                extraStyle.t3 = {top: 0};
            } else if (this.props.src==='ENI'){
                extraStyle.b2 = {top: 31};
            } else if (this.props.src==='NONE'){
                extraStyle.b4 = {top: 50};
                extraStyle.b6 = {top: 50};
            //} else if (this.props.src==='R53RES'){
            //    extraStyle.b8 = {top: 50};
            } else if (this.props.src==='IGW'){
                extraStyle.b2 = {top: 31};
                //extraStyle.b8 = {top: 31};
            }

        return (



            <div className="baseElement" style={{...this.props.style, height: this.props.height + 'px',
                                    backgroundColor: '#fff',
                                    marginTop: globalMarginTop + 'px' }}>

                <Anchor location='left' position={0.1} relation_id={'l1-'+this.props.archer_id} relations={this.props.relations.l1} height={this.props.height} extraStyle={extraStyle['l1']} />
                <Anchor location='left' position={0.2} relation_id={'l2-'+this.props.archer_id} relations={this.props.relations.l2} height={this.props.height} extraStyle={extraStyle['l2']} />
                <Anchor location='left' position={0.3} relation_id={'l3-'+this.props.archer_id} relations={this.props.relations.l3} height={this.props.height} extraStyle={extraStyle['l3']} />
                <Anchor location='left' position={0.4} relation_id={'l4-'+this.props.archer_id} relations={this.props.relations.l4} height={this.props.height} extraStyle={extraStyle['l4']} />
                <Anchor location='left' position={0.5} relation_id={'l5-'+this.props.archer_id} relations={this.props.relations.l5} height={this.props.height} extraStyle={extraStyle['l5']} />
                <Anchor location='left' position={0.6} relation_id={'l6-'+this.props.archer_id} relations={this.props.relations.l6} height={this.props.height} extraStyle={extraStyle['l6']} />
                <Anchor location='left' position={0.7} relation_id={'l7-'+this.props.archer_id} relations={this.props.relations.l7} height={this.props.height} extraStyle={extraStyle['l7']} />
                <Anchor location='left' position={0.8} relation_id={'l8-'+this.props.archer_id} relations={this.props.relations.l8} height={this.props.height} extraStyle={extraStyle['l8']} />
                <Anchor location='left' position={0.9} relation_id={'l9-'+this.props.archer_id} relations={this.props.relations.l9} height={this.props.height} extraStyle={extraStyle['l9']} />

                <Anchor location='right' position={0.1} relation_id={'r1-'+this.props.archer_id} relations={this.props.relations.r1} height={this.props.height} extraStyle={extraStyle['r1']} />
                <Anchor location='right' position={0.2} relation_id={'r2-'+this.props.archer_id} relations={this.props.relations.r2} height={this.props.height} extraStyle={extraStyle['r2']} />
                <Anchor location='right' position={0.3} relation_id={'r3-'+this.props.archer_id} relations={this.props.relations.r3} height={this.props.height} extraStyle={extraStyle['r3']} />
                <Anchor location='right' position={0.4} relation_id={'r4-'+this.props.archer_id} relations={this.props.relations.r4} height={this.props.height} extraStyle={extraStyle['r4']} />
                <Anchor location='right' position={0.5} relation_id={'r5-'+this.props.archer_id} relations={this.props.relations.r5} height={this.props.height} extraStyle={extraStyle['r5']} />
                <Anchor location='right' position={0.6} relation_id={'r6-'+this.props.archer_id} relations={this.props.relations.r6} height={this.props.height} extraStyle={extraStyle['r6']} />
                <Anchor location='right' position={0.7} relation_id={'r7-'+this.props.archer_id} relations={this.props.relations.r7} height={this.props.height} extraStyle={extraStyle['r7']} />
                <Anchor location='right' position={0.8} relation_id={'r8-'+this.props.archer_id} relations={this.props.relations.r8} height={this.props.height} extraStyle={extraStyle['r8']} />
                <Anchor location='right' position={0.9} relation_id={'r9-'+this.props.archer_id} relations={this.props.relations.r9} height={this.props.height} extraStyle={extraStyle['r9']} />

                <Anchor location='top' position={0.1} relation_id={'t1-'+this.props.archer_id} relations={this.props.relations.t1} height={this.props.height} extraStyle={extraStyle['t1']} />
                <Anchor location='top' position={0.2} relation_id={'t2-'+this.props.archer_id} relations={this.props.relations.t2} height={this.props.height} extraStyle={extraStyle['t2']} />
                <Anchor location='top' position={0.3} relation_id={'t3-'+this.props.archer_id} relations={this.props.relations.t3} height={this.props.height} extraStyle={extraStyle['t3']} />
                <Anchor location='top' position={0.4} relation_id={'t4-'+this.props.archer_id} relations={this.props.relations.t4} height={this.props.height} extraStyle={extraStyle['t4']} />
                <Anchor location='top' position={0.5} relation_id={'t5-'+this.props.archer_id} relations={this.props.relations.t5} height={this.props.height} extraStyle={extraStyle['t5']} />
                <Anchor location='top' position={0.6} relation_id={'t6-'+this.props.archer_id} relations={this.props.relations.t6} height={this.props.height} extraStyle={extraStyle['t6']} />
                <Anchor location='top' position={0.7} relation_id={'t7-'+this.props.archer_id} relations={this.props.relations.t7} height={this.props.height} extraStyle={extraStyle['t7']} />
                <Anchor location='top' position={0.8} relation_id={'t8-'+this.props.archer_id} relations={this.props.relations.t8} height={this.props.height} extraStyle={extraStyle['t8']} />
                <Anchor location='top' position={0.9} relation_id={'t9-'+this.props.archer_id} relations={this.props.relations.t9} height={this.props.height} extraStyle={extraStyle['t9']} />

                <Anchor location='bottom' position={0.1} relation_id={'b1-'+this.props.archer_id} relations={this.props.relations.b1} height={this.props.height} extraStyle={extraStyle['b1']} />
                <Anchor location='bottom' position={0.2} relation_id={'b2-'+this.props.archer_id} relations={this.props.relations.b2} height={this.props.height} extraStyle={extraStyle['b2']} />
                <Anchor location='bottom' position={0.3} relation_id={'b3-'+this.props.archer_id} relations={this.props.relations.b3} height={this.props.height} extraStyle={extraStyle['b3']} />
                <Anchor location='bottom' position={0.4} relation_id={'b4-'+this.props.archer_id} relations={this.props.relations.b4} height={this.props.height} extraStyle={extraStyle['b4']} />
                <Anchor location='bottom' position={0.5} relation_id={'b5-'+this.props.archer_id} relations={this.props.relations.b5} height={this.props.height} extraStyle={extraStyle['b5']} />
                <Anchor location='bottom' position={0.6} relation_id={'b6-'+this.props.archer_id} relations={this.props.relations.b6} height={this.props.height} extraStyle={extraStyle['b6']} />
                <Anchor location='bottom' position={0.7} relation_id={'b7-'+this.props.archer_id} relations={this.props.relations.b7} height={this.props.height} extraStyle={extraStyle['b7']} />
                <Anchor location='bottom' position={0.8} relation_id={'b8-'+this.props.archer_id} relations={this.props.relations.b8} height={this.props.height} extraStyle={extraStyle['b8']} />
                <Anchor location='bottom' position={0.9} relation_id={'b9-'+this.props.archer_id} relations={this.props.relations.b9} height={this.props.height} extraStyle={extraStyle['b9']} />

                
                <div className="icon" style={{height:'100%'}}>
                    {img}
                </div>
                
                <div className="title" style={{ paddingLeft: (this.props.src === 'NONE')? '' : this.props.height + 'px', lineHeight: '20px' }}>
                    <span style={{ paddingTop: this.props.titlePaddingTop + 'px' }}>
                        {this.props.title}
                    </span>
                    { this.props.iconLabel &&
                    <span style={{fontSize:"10px"}}>
                        {this.props.iconLabel}
                </span>
                    }

                </div>
                <div style={{}}>

                </div>



            </div>


        )
    }

}