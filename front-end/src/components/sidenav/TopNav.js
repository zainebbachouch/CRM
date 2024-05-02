import React from 'react';

import { FaBell, FaArrowDown, FaShoppingBasket } from 'react-icons/fa';
import { GiHamburgerMenu } from "react-icons/gi";
import { CiSettings } from "react-icons/ci";
import flag from "../../images/flag.png";
import profile from "../../images/profile.png";
import { useAuth } from '../../views/context/authContext';
import { Link } from 'react-router-dom';
import './TopNav.css';

function TopNav() {
    const { currentUser } = useAuth();
    /*const [user,setUser]=useState()
    useEffect(()=>{
        axios.get(.....) 
    })*/
    return (
   <div  className="row m-0 p-0">
        <div className="container-fluid navbar m-0 p-0 d-flex justify-content-between navbar p-2">
            <div className="icons d-flex column-gap-2">
                <div className="icon1"><GiHamburgerMenu /></div>
                <Link to="/cart" className="basket">
                    <FaShoppingBasket />                  
                </Link>
            </div>

            <div className="icons d-flex column-gap-2">
                <div className="icons1"><FaBell /></div>
                <div className="icon1"><CiSettings /></div>
                <div className="icon1"> <img src={flag} alt="flag" className='flag' /></div>
                <div className='d-flex'>
                    <div className="icon1">  <img src={profile} alt="profile" className='profile' /></div>
                    <div className="icon1">{currentUser && currentUser.username ? currentUser.username : 'userrrrrrrrrr'}<FaArrowDown /></div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default TopNav;
