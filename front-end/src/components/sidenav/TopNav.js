import React from 'react';
import './TopNav.css';
import { FaBell,FaArrowDown} from 'react-icons/fa';
import { GiHamburgerMenu } from "react-icons/gi";
import { CiSettings } from "react-icons/ci";
import  flag from "../../images/flag.png"
import  profile from "../../images/profile.png"
function TopNav() {
    return (
        <div className="navbar col-12 p-2">
            <div className="icon1"><GiHamburgerMenu /></div>
            <div className="icons d-flex column-gap-2">
                <div className="icon1"><FaBell /></div>
                <div className="icon1"><CiSettings /></div>
                <div className="icon1"> <img src={flag} alt="flag" className='flag' /></div>
                <div className='d-flex'>
                <div className="icon1">  <div className="icon1"> <img src={profile} alt="profile" className='profile' /></div></div>
                <div className="icon1">kate doe <FaArrowDown /></div>
                </div>
               

            </div>
        </div>
    );
}

export default TopNav;
