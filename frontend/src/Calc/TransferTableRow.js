import React,{PureComponent} from 'react';

export default class AlbumTableRow extends PureComponent {


    render() {
        const {
            transfer_row_num,
            is_peering,
            t,
            transfer_details,
            remove_transfer_function,
        } = this.props;
        return(
            <tr key={'row-'+transfer_row_num} style={{color: is_peering ? '#5787d0' : ''}} >
                <td style={{width: '10px'}}>
                    <div>{transfer_row_num}</div>
                </td>
                <td style={{width: '160px'}}>{t.volume + ' ' + 
                        t.unit + ', ' + 
                        (t.source==='Direct Connect' ? 'DX' : t.source) + ' -> ' + 
                        (t.dest==='Direct Connect' ? 'DX' : t.dest)
                    }</td>
                <td style={{width: '70px'}}>{transfer_details.payingAccount}</td>
                <td style={{width: '150px'}}>{transfer_details.comments}</td>
                <td style={{width: '50px'}}>${transfer_details.cost}</td>
                <td style={{width: '12px', verticalAlign: 'middle'}}>
                    <img src={'img/minus-circle-solid.svg'} alt=''
                        onClick={() => remove_transfer_function(transfer_row_num)}
                        style={{width: 12, cursor: 'pointer'}} title="Remove this transfer" />
                </td>
            </tr>   
        );
    }
}