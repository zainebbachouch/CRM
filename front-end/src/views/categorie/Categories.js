// Categories.js
import React, { useState } from 'react';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import "../../style/viewsStyle/categorieStyle.css";
import AddCategorie from './AddCategorie';
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
                        <AddCategorie addCategory={addCategory} />
                        <DisplayCategories categories={categories} setCategories={setCategories}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Categories;
