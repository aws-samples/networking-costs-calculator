import * as React from 'react';
import { ArcherElement } from 'react-archer';
import Relation from './Block'


interface AnchorProps {
    location: string,
    relation_id: String,
    relations: Array<Relation>,
    extraStyle?: any,
}

export default class Anchor extends React.Component<AnchorProps, {}> {

    render(){
        let classname = '';
        let inlnstyle = {border: '0px solid blue', width: '0px', height: '0px',
                    zIndex: 8
                    };
        
        switch (this.props.location) {
            case 'left':
                inlnstyle.top = this.props.height*this.props.position + 'px'; inlnstyle.left = '0px';
                break;
            case 'right':
                inlnstyle.top = this.props.height*this.props.position + 'px'; inlnstyle.left = '100%';
                break;
            case 'top':
                inlnstyle.top = '0px'; inlnstyle.left = parseInt(this.props.position * 100) +'%';
                break;
            case 'bottom':
                inlnstyle.top = this.props.height + 'px'; inlnstyle.left = parseInt(this.props.position * 100) +'%';
                break;
            
            default:
                break;
        }
        inlnstyle.position = 'absolute';

        return (
            <div style={{position: 'relative'}}>
                <div style={{...inlnstyle,  ...this.props.extraStyle}} className={classname}>
                    <ArcherElement
                        id={this.props.relation_id}
                        relations={this.props.relations}>

                            <div>&nbsp;</div>

                    </ArcherElement>
                </div>
            </div>
        )
    }

}