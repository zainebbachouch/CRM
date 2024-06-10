import React, { useState } from 'react';

import { FaBell, FaArrowDown, FaShoppingBasket } from 'react-icons/fa';
import { GiHamburgerMenu } from "react-icons/gi";
import { CiSettings } from "react-icons/ci";
import flag from "../../images/flag.png";
import profile from "../../images/profile.png";
import { Link } from 'react-router-dom';
import './TopNav.css';

function TopNav() {
    const currentUser = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');

    const [isOpen, setIsOpen] = useState(false);
    /*const [profileData, setProfileData] = useState({});

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    const config = useMemo(() => {
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        };
    }, [token]);

    const fetchProfileData = async () => {
        try {
            let response;
            if (role === 'admin') {
                response = await axios.get(`http://127.0.0.1:5000/api/athorizedadmin`, config);
            } else if (role === 'client') {
                response = await axios.get(`http://127.0.0.1:5000/api/athorizedclient`, config);
            } else if (role === 'employe') {
                response = await axios.get(`http://127.0.0.1:5000/api/athorizedemploye`, config);
            }
            setProfileData(response.data);
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [role, config]);
*/

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        // Implémentez votre logique de déconnexion ici
        console.log("Logged out");
    };

    return (
        <div className="row m-0 p-0">
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

                        <div className="dropdown">
                            <div className="icon1" onClick={toggleDropdown}>
                                {currentUser ? currentUser : 'userrrrrrrrrr'} <FaArrowDown />
                            </div>
                            {isOpen && (
                                <div className="dropdown-menu">
                                    {console.log('uuuuuu', userId)}
                                    <Link to={`/profile/${userId}`} className="dropdown-item">Profile</Link>
                                    <div className="dropdown-item" onClick={handleLogout}>Logout</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TopNav;
