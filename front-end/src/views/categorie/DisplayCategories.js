import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddCategorie from './AddCategorie';

function DisplayCategories({ categories, setCategories, addCategory }) {
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.get('http://127.0.0.1:5000/api/getAllCategories', config);
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {  

        fetchCategories();
    }, [setCategories]);

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            await axios.delete(`http://127.0.0.1:5000/api/deleteCategorie/${id}`, config);
            setCategories(categories.filter((categorie) => categorie.idcategorie !== id));
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    const role =localStorage.getItem('role');

   /*const updateCategorie = async (id, newData) => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            await axios.put(`http://127.0.0.1:5000/api/updateCategorie/${id}`, newData, config);
            setCategories(categories.map((categorie) => {
                if (categorie.idcategorie === id) {
                    return { ...categorie, ...newData };
                }
                return categorie;
            }));
        } catch (error) {
            console.error("Error updating category:", error);
        }
    };*/
    const handleUpdate = (category) => {
        setSelectedCategory(category);
    };
    return (
        <div>
        <AddCategorie
            addCategory={addCategory}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            fetchCategories={fetchCategories}
        />
        {loading ? (
            <p>Loading...</p>
        ) : (
            <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((val, key) => (
                        <tr key={key}>
                            <td>{val.nom_categorie}</td>
                            <td>{val.description}</td>
                            {
                                role!='client' &&<td>                                
                                <button className="btn btn-primary mr-2" onClick={() => handleUpdate(val)}>Update</button>
                                <button className="btn btn-danger" onClick={() => handleDelete(val.idcategorie)}>Delete</button>
                            </td>
                            }
                           
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
    );
}

export default DisplayCategories;
