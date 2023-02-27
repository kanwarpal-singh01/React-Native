import React from 'react';

export const LocalizeContext = React.createContext();

const LocalizeProvider = ({ children, value }) => {
    return <LocalizeContext.Provider value={value}>
        {children}
    </LocalizeContext.Provider>
}

export default LocalizeProvider;