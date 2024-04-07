import React from 'react'
import SideBar from '../components/sidebar/SideBar'
import SideNav from '../components/sidenav/SideNav'
import "../style/viewsStyle/home.css"

function Home() {
  return (
    <div className='home'>
      <SideBar />
      <div className="homeContainer">
        <SideNav />
       
     
    
      </div>
    </div>
  )
}

export default Home
