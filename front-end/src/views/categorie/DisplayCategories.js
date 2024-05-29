import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AddCategorie from './AddCategorie';

function DisplayCategories({ categories, setCategories, addCategory }) {
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                withCredentials: true,
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
    }, [setCategories]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                withCredentials: true,
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

    const role = localStorage.getItem('role');

    const handleUpdate = (category, action) => {
        if (action === "update") {
            setSelectedCategory(category);
        }
    };

    return (
        <div>
            {role !== 'client' && (
                <div>
                    <AddCategorie
                        addCategory={addCategory}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        fetchCategories={fetchCategories}
                    />
                    <div className="container-fluid d-flex justify-content-end mb-2">
                        <button className="btn btn-success mr-2" data-bs-toggle="modal" data-bs-target="#categoryModal" onClick={() => handleUpdate(null, 'ajouter')}>
                            Ajouter un nouveau categorie +
                        </button>
                    </div>
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
                                        <td>
                                            <button className="btn btn-primary mr-2" data-bs-toggle="modal" data-bs-target="#categoryModal" onClick={() => handleUpdate(val, 'update')}>Update</button>
                                            <button className="btn btn-danger" onClick={() => handleDelete(val.idcategorie)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default DisplayCategories;
