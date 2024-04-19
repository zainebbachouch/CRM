import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function DisplayCategories() {
    const [categorieList, setCategorieList] = useState([]);

    async function fetchCategories() {
        try {
            const response = await axios.get("http://127.0.0.1:5000/api/getAllCategories");
            setCategorieList(response.data);
            console.log('Response:', response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    async function handleDelete(id) {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            await axios.delete(`http://127.0.0.1:5000/api/categories/${id}`, config);
            setCategorieList(categorieList.filter((categorie) => categorie.idcategorie !== id));
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    }

    return (
        <div>
            <h1>Categories</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categorieList.map((val, key) => (
                        <tr key={key}>
                            <td>{val.nom_categorie}</td>
                            <td>{val.description}</td>
                            <td>
                                <button className="btn btn-primary mr-2">Update</button>
                                <button className="btn btn-danger" onClick={() => handleDelete(val.idcategorie)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DisplayCategories;