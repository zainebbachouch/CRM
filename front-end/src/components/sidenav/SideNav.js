import React from 'react';
import './SideNav.css';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

import ListOutlinedIcon from '@mui/icons-material/ListOutlined';

function SideNav() {
    return (
        <div className="navbar">
            <div className="wrapper">

                <div className="items">
         
                    <div className="item">
                        <NotificationsNoneOutlinedIcon className="icon" />
                       
                    </div>
                  
                    <div className="item">
                        <ListOutlinedIcon className="icon" />
                    </div>
                    <div className="item">
                        <ListOutlinedIcon className="icon" />
                    </div>
                    <div className="item">
                        <ListOutlinedIcon className="icon" />
                    </div>

                </div>
            </div>
        </div>
    );
}

export default SideNav;
