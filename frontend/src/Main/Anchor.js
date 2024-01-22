import * as React from 'react';
import { ArcherElement } from 'react-archer';
import Relation from './Block'


interface AnchorProps {
    location: string,
    relation_id: String,
    relations: Array<Relation>,
}

export default class Anchor extends React.Component<AnchorProps, {}> {

    render(){
        let classname = '';
        let style = {border: '0px solid blue', width: '0px', height: '0px',
                    zIndex: 8
                    };
        
        switch (this.props.location) {
            case 'left':
                style.top = this.props.height*this.props.position + 'px'; style.left = '0px';
                break;
            case 'right':
                style.top = this.props.height*this.props.position + 'px'; style.left = '100%';
                break;
            case 'top':
                style.top = '0px'; style.left = parseInt(this.props.position * 100) +'%';
                break;
            case 'bottom':
                style.top = this.props.height + 'px'; style.left = parseInt(this.props.position * 100) +'%';
                break;
            
            default:
                break;
        }

        return (
            <div>
                <ArcherElement
                    style={style}
                    className={classname}
                    id={this.props.relation_id}
                    relations={this.props.relations}>

                        <div>&nbsp;</div>

                </ArcherElement>
            </div>
        )
    }

}