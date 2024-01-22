import React from 'react';

const netcalcContext = React.createContext({});

export const Provider = netcalcContext.Provider;
export const Consumer = netcalcContext.Consumer;
export default netcalcContext;