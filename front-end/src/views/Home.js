import React from 'react'
import SideBar from '../components/sidebar/SideBar'
import TopNav from '../components/sidenav/TopNav'
import "../style/viewsStyle/home.css"

function Home() {
  return (
    <div className='home'>
      <SideBar />
      <div className="homeContainer">
        <TopNav />
       
     
    
      </div>
    </div>
  )
}

export default Home
