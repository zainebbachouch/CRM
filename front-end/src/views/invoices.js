import React from 'react'
import SideBar from '../components/sidebar/SideBar'
import TopBar from "../components/sidenav/TopNav"
function invoices() {
  return (
    <div className='container-fluid p-0 d-flex'  style={{ backgroundColor: '#dbe1e4' }}>
    <SideBar></SideBar>
    <div className="p-0 m-0 row col">
        <div className="col  p-0">
        <TopBar></TopBar> 
        <h1>factures</h1>
        </div>
     
    </div>    
    
    </div>
  )
}

export default invoices
