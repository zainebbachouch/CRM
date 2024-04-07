import React from 'react';
import crmIcon from "../../images/crm.png"
import './sidebar.css';
import { FaHome , FaUserAlt, FaRegChartBar, FaCommentAlt } from "react-icons/fa";
import { NavLink, Link } from 'react-router-dom';


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
  return (
    <div className="Sidebar">
      <div className="top" >
        <img src={crmIcon} alt="" className="logo" />
        <span className='logo'>CRM App</span>
      </div>

      <div className="dashbored">
      <FaHome style={{ color: 'white' } }/> <Link to="/Dashbord" style={{ color: 'white' }}>dashbored</Link>
      </div>


      <div className="center">
        <span style={{ color: 'white'}} >Management</span>
        {
          menuItem.map((item, index) => (
            <NavLink style={{ color: 'white'}} to={item.path} key={index} className="link" activeclassName="active">
              <div className="icon" >{item.icon}</div>
              <div className="link_text">{item.name}</div>
            </NavLink>
          ))
        }
      </div>


    </div>
  )
}
export default SideBar;
