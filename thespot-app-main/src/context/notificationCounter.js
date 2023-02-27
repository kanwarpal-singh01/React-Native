import React from 'react';

export const NotificationContext = React.createContext();

const NotificationContextProvider = ({ children, value }) => {
    return <NotificationContext.Provider value={value}>
        {children}
    </NotificationContext.Provider>
}

export default NotificationContextProvider;