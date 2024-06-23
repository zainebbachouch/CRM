import React, { useState } from 'react';
import crmIcon from "../../images/crm.png";
import './sidebar.css';
import { FaHome, FaUserAlt, FaRegChartBar, FaCommentAlt } from "react-icons/fa";
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../views/context/authContext';
import { GiHamburgerMenu } from "react-icons/gi";

function SideBar() {
  const [isOpen, setIsOpen] = useState(true); // État pour contrôler la visibilité de la barre latérale
  const role = localStorage.getItem("role");
  const menuItem = [
    {
      path: "/Products",
      name: "Products",
      icon: <FaUserAlt />
    },
    {
      path: "/commands",
      name: "commands",
      icon: <FaRegChartBar />
    },
    {
      path: "/invoices",
      name: "invoices",
      icon: <FaCommentAlt />
    },
    {
      path: "/messenger",
      name: "messenger",
      icon: <FaCommentAlt />
    }
  ];
  const adminstration = {
    path: "/adminstration",
    name: "adminstration",
    icon: <FaCommentAlt />
  };
  const authorization = {
    path: "/authorization",
    name: "authorization",
    icon: <FaCommentAlt />
  };
  const categorieItem = {
    path: "/Categories",
    name: "Categories",
    icon: <FaCommentAlt />
  };
  const menuItem2 = [
    {
      path: "/login",
      name: "Authentification",
      icon: <FaUserAlt />
    },
    {
      path: "/calendar",
      name: "Calendar",
      icon: <FaRegChartBar />,
      notification: true
    }
  ];
  const { currentUser } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(!isOpen); // Fonction pour basculer l'état de la barre latérale
  };

  return (
    <div className={`Sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="menu" onClick={toggleSidebar}>
        <GiHamburgerMenu />
      </div>

      
      <div className="top d-flex">
        <img src={crmIcon} alt="" className="logo" />
        <p className='logo w-100 text-center'>CRM APP</p>
      </div>
      <div className="dashboard d-flex justify-content-between align-items-center">
        <FaHome className='navIcon' />
        <Link to="/Dashboard" className="navLink" style={{ color: 'white' }}> Dashboard</Link>
        <div className="dashNotifcation">6</div>
      </div>
      <div className="center p-0">
        <span style={{ color: 'white' }} className='navLink'>Management</span>
        {menuItem.map((item, index) => (
          <NavLink style={{ color: 'white' }} to={item.path} key={index} className="link d-flex navLink mt-2 p-2 activeNavLink">
            <div className="icon navIcon">{item.icon}</div>
            <div className="link_text">{item.name}</div>
          </NavLink>
        ))}
        {role !== 'client' && (
          <>
            <NavLink style={{ color: 'white' }} to={categorieItem.path} key="categorieItem" className="link d-flex navLink mt-2 p-2 activeNavLink">
              <div className="icon navIcon">{categorieItem.icon}</div>
              <div className="link_text">{categorieItem.name}</div>
            </NavLink>
            <NavLink style={{ color: 'white' }} to={adminstration.path} key="adminstration" className="link d-flex navLink mt-2 p-2 activeNavLink">
              <div className="icon navIcon">{adminstration.icon}</div>
              <div className="link_text">{adminstration.name}</div>
            </NavLink>
            <NavLink style={{ color: 'white' }} to={authorization.path} key="authorization" className="link d-flex navLink mt-2 p-2 activeNavLink">
              <div className="icon navIcon">{authorization.icon}</div>
              <div className="link_text">{authorization.name}</div>
            </NavLink>
          </>
        )}
      </div>
      <div className="center p-0">
        <span style={{ color: 'white' }} className='navLink'>Pages</span>
        {menuItem2.map((item, index) => (
          <NavLink style={{ color: 'white' }} to={item.path} key={index} className="link d-flex align-items-center navLink mt-2 p-2 activeNavLink">
            <div className="icon navIcon">{item.icon}</div>
            <div className="link_text">{item.name}</div>
            {item.notification && <div className='dashNotifcation2 mx-2'>new</div>}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default SideBar;
