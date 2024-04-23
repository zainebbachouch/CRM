import React, { useState } from 'react';
import SideBar from '../../components/sidebar/SideBar'
import TopBar from "../../components/sidenav/TopNav"
import DisplayProducts from './DisplayProducts'

function Products() {
    const [products, setProducts] = useState([]);

    const addProduct = (newProduct) => {
        setProducts([...products, newProduct]);
    }

    return (
        <div className='container-fluid p-0 d-flex'  style={{ backgroundColor: '#dbe1e4' }}>
        <SideBar></SideBar>
        <div className="col p-0">
                <TopBar />
                <div className="main-content">
                    <DisplayProducts products={products} setProducts={setProducts} addProduct={addProduct}/>
                </div>
            </div>
         
        </div>    
       
    )
}

export default Products