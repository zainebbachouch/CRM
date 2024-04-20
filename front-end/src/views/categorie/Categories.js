import React, { useState } from 'react';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import "../../style/viewsStyle/categorieStyle.css";
import DisplayCategories from './DisplayCategories';

function Categories() {
    const [categories, setCategories] = useState([]);

    const addCategory = (newCategory) => {
        setCategories([...categories, newCategory]);
    }

    return (
        <div className='container-fluid p-0'>
        <div className="row">
            <SideBar />
            <div className="col p-0">
                <TopBar />
                <div className="main-content">
                    <DisplayCategories categories={categories} setCategories={setCategories} addCategory={addCategory}/>
                </div>
            </div>
        </div>
    </div>
    );
}

export default Categories;
