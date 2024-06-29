// NotificationContext.js
import React, { createContext, useReducer, useContext } from 'react';

const NotificationContext = createContext();

const notificationsReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_NOTIFICATION':
            const newNotifications = [action.payload, ...state.notifications];
            localStorage.setItem('notifications', JSON.stringify(newNotifications));
            localStorage.setItem('unreadCount', state.unreadCount + 1);

            return {
                notifications: newNotifications,
                unreadCount: state.unreadCount + 1
            };
        case 'MARK_AS_READ':
            localStorage.setItem('unreadCount', 0);
            return {
                ...state,
                unreadCount: 0
            };
        case 'SET_NOTIFICATIONS':
            localStorage.setItem('notifications', JSON.stringify(action.payload));
            return {
                notifications: action.payload,
                unreadCount: state.unreadCount
            };
        default:
            return state;
    }
};

export const NotificationProvider = ({ children }) => {
    const [state, dispatch] = useReducer(notificationsReducer, {
        notifications: JSON.parse(localStorage.getItem('notifications')) || [],
        unreadCount: parseInt(localStorage.getItem('unreadCount'), 10) || 0
    });

    return (
        <NotificationContext.Provider value={{ state, dispatch }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => useContext(NotificationContext);
