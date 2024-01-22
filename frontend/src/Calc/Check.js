import React, {Component} from 'react';
import Checkbox from '../Common/Checkbox';


class Check extends Component {

    constructor(props){
        super(props);
        this.state = { 
            is_disabled: false,

        }
    }

    //add state to track disabled via switch state    
    handleCheckboxChange = event => {
        if(this.props.serviceCode === 'interRegion'){
            this.props.onChange(event.target.checked, event);
        }else{
            this.props.onChange(event.target.checked,this.props.serviceCode, event);
        }
      
    } 
    disabledCheckBox = () => {
        
        let disabledServices = this.props.disableService;
        //console.log(disabledServices.includes(this.props.serviceCode));
        return disabledServices.includes(this.props.serviceCode)
    }  

    render() { 
        return ( 
            <div style={{ padding: 6, float: "left", display: 'inline-block' }}>
                <div style={{}}>
                    <label>
                        <Checkbox
                            checked={this.props.checked}
                            onChange={this.handleCheckboxChange}
                            disabled={this.disabledCheckBox()}
                        />
                        <span style={{ marginLeft: 4, lineHeight: '16px', fontWeight: 300, color:this.disabledCheckBox()? 'grey' : this.props.defaultPricing? '#ffc107' : 'black'}}>{this.props.title} {this.props.defaultPricing? "**" : ''} </span>
                    </label>
                </div>
            </div>            
        );
    }
}
 
export default Check;
