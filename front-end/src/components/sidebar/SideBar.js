import React, { useEffect } from 'react';
import crmIcon from "../../images/crm.png"
import './sidebar.css';
import { FaHome, FaUserAlt, FaRegChartBar, FaCommentAlt } from "react-icons/fa";
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../views/context/authContext';


function SideBar() {
  const menuItem = [
    /*  {
        path: "/Dashbord",
        name: "Dashbord",
        icon: <FaTh />
      },*/
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
      path: "/Categories",
      name: "Categories",
      icon: <FaCommentAlt />
    }
  ]
  const menuItem2 = [
    /*  {
        path: "/Dashbord",
        name: "Dashbord",
        icon: <FaTh />
      },*/
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


  ]
  const { currentUser } = useAuth();/// donne directemen valeur c'est que username
  /*
useEffect(()=>{
  console.log(localStorage.getItem('role'))
})*/
  return (
    <div className="Sidebar d-flex flex-column col-4">
      <div className="top d-flex " >
        <img src={crmIcon} alt="" className="logo" />
        <p className='logo w-100 text-center'>CRM APP</p>
      </div>
      <div style={{ color: 'red' }}>

        <p>Welcome, {currentUser && currentUser.username ? currentUser.username : 'userrrrrrrrrr'}</p>


      </div>

      <div className="dashboard d-flex  justify-content-between align-items-center">
        <FaHome className='navIcon' />
        <Link to="/Dashboard" className="navLink " style={{ color: 'white' }}> Dashboard</Link>
        <div className="dashNotifcation">6</div>

      </div>


      <div className="center p-0">
        <span style={{ color: 'white' }} className='navLink'>Management</span>
        {
          menuItem.map((item, index) => (
            <NavLink style={{ color: 'white' }} to={item.path} key={index} className="link d-flex navLink mt-2 p-2  activeNavLink" >
              <div className="icon navIcon" >{item.icon}</div>
              <div className="link_text">{item.name}</div>
            </NavLink>
          ))
        }
      </div>
      <div className="center p-0">
        <span style={{ color: 'white' }} className='navLink'>Pages</span>
        {
          menuItem2.map((item, index) => (
            <NavLink style={{ color: 'white' }} to={item.path} key={index} className="link d-flex align-items-center navLink mt-2 p-2  activeNavLink" >
              <div className="icon navIcon" >{item.icon}</div>
              <div className="link_text">{item.name}</div>
              {item.notification &&
                (<div className='dashNotifcation2 mx-2'>new</div>)


              }
            </NavLink>
          ))
        }
      </div>


    </div>
  )
}
export default SideBar;
