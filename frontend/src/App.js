import React, { useReducer } from 'react';
import './App.css';
import Main from './Main/Main'
import {
  Container
} from 'reactstrap';

import { Provider } from './store';
import { calcReducer, initialCalcState } from './reducers/calcReducer';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import ReactModal from 'react-modal';

//window.LOG_LEVEL = 'DEBUG';

Amplify.configure(awsconfig);


//React Modal
ReactModal.setAppElement('#root');


function App() {

  const useCalcState = useReducer(calcReducer, initialCalcState);
  const year = new Date().getFullYear();

  return (
    <Provider value={useCalcState}>
      <div className="App">

        <h1>AWS Networking Costs Calculator (BETA)</h1>
        <Container>
          <Main />
        </Container>
      </div>
      <div className="footer">
        <span style={{color: '#555'}}>
           This Calculator provides an estimate of usage charges for AWS services based on certain information you provide.<br/>
          Monthly charges will be based on your actual usage of AWS services, and may vary from the estimates the Calculator has provided.<br/>
          * The services marked wih a star (*) are not factored in the calculations<br/>
        </span>
        <div style={{ marginTop: '4px'}}>
          <span style={{color: '#444'}}>beta - contact <a href="mailto:netcalc@amazon.com" style={{color:'#444'}}>netcalc@amazon.com</a> for issues &nbsp;&nbsp;&nbsp;&nbsp;</span> 
            © 2008 - {year}, Amazon Web Services, Inc. or its affiliates. All rights reserved.

        </div>
      </div>
    </Provider>
  );
}

export default App;
