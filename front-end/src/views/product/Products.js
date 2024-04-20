import React from 'react'
import SideBar from '../../components/sidebar/SideBar'
import TopBar from "../../components/sidenav/TopNav"
import AddProduct from './AddProduct'

function Products() {
    return (
        <div className='container-fluid p-0 d-flex'  style={{ backgroundColor: '#dbe1e4' }}>
        <SideBar></SideBar>
        <div className="p-0 m-0 row col">
            <div className="col  p-0">
            <TopBar></TopBar> 
            </div>
            <AddProduct/>
         
        </div>    
        
        </div>
    )
}

export default Products
