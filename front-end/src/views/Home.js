import React from 'react'
import SideBar from '../components/sidebar/SideBar'
import TopBar from "../components/sidenav/TopNav"
import "../style/viewsStyle/home.css"

function Home() {
  return (
    <div className='container-fluid p-0 d-flex'>
    <SideBar></SideBar>
    <div className="p-0 m-0 row col">
        <div className="col  p-0">
        <TopBar></TopBar> 
        <h1>home</h1>
        </div>
     
    </div>    
    
    </div>
  )
}

export default Home
