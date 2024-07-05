import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaArrowDown, FaShoppingBasket } from 'react-icons/fa';
import { CiSettings } from "react-icons/ci";
import flag from "../../images/flag.png";
import profile from "../../images/profile.png";
import { Link, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { useNotificationContext } from '../../views/context/NotificationContext';
import './TopNav.css';

function TopNav() {
    const currentUser = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');

    const [isOpen, setIsOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const socketRef = useRef();
    const location = useLocation();
    const { state: { notifications, unreadCount }, dispatch } = useNotificationContext();

    useEffect(() => {
        const storedNotifications = localStorage.getItem('notifications');
        const storedUnreadCount = localStorage.getItem('unreadCount');

        if (storedNotifications) {
            dispatch({ type: 'SET_NOTIFICATIONS', payload: JSON.parse(storedNotifications) });
        }

        if (storedUnreadCount) {
            dispatch({ type: 'SET_UNREAD_COUNT', payload: parseInt(storedUnreadCount, 10) });
        }
    }, [dispatch]);

    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('unreadCount', unreadCount.toString());
    }, [unreadCount]);

    useEffect(() => {
        socketRef.current = io('http://localhost:3300', {
            query: { userId }
        });

        socketRef.current.on('connect', () => {
            console.log('Connected to server');
        });



        socketRef.current.on('receiveNotification', (notification) => {
            console.log('New notification received:', notification);
            dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [dispatch, userId]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/api/getNotification', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                dispatch({ type: 'SET_NOTIFICATIONS', payload: response.data.notifications });
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, [token, dispatch]);

    useEffect(() => {
        dispatch({ type: 'MARK_AS_READ' });
    }, [location, dispatch]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        setShowNotifications(false);
    };

    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            dispatch({ type: 'MARK_AS_READ' });
            localStorage.setItem('unreadCount', '0');
        }
    };

    const handleLogout = () => {
        console.log("Logged out");
    };

    return (
        <div className="row m-0 p-0">
            <div className="container-fluid navbar m-0 p-0 d-flex justify-content-between navbar p-2">
                <div className="icons d-flex column-gap-2">
                    <Link to="/cart" className="basket">
                        <FaShoppingBasket />
                    </Link>
                </div>

                <div className="icons d-flex column-gap-2">
                    <div className="icons1" onClick={handleNotificationClick}>
                        <div className="notification-icon">
                            <FaBell />
                            {unreadCount > 0 && <div className="notification-badge">{unreadCount}</div>}
                        </div>
                    </div>
                    <div className="icon1"><CiSettings /></div>
                    <div className="icon1"><img src={flag} alt="flag" className='flag' /></div>
                    <div className='d-flex'>
                        <div className="icon1"><img src={profile} alt="profile" className='profile' /></div>

                        <div className="dropdown">
                            <div className="icon1" onClick={toggleDropdown}>
                                {currentUser ? currentUser : 'User'} <FaArrowDown />
                            </div>
                            {isOpen && (
                                <div className="dropdown-menu">
                                    <Link to={`/profile/${userId}`} className="dropdown-item">Profile</Link>
                                    <div className="dropdown-item" onClick={handleLogout}>Logout</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showNotifications && (
                <div className="notification-list">
                    {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                            <div key={index} className="notification-item">
                                <p>{notification.message}</p>
                                <span className="notification-timestamp">{notification.timestamp}</span>
                            </div>
                        ))
                    ) : (
                        <p className="no-notifications">No notifications</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default TopNav;
