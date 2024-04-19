// AddCategorie.js
import React, { useState } from 'react';
import axios from 'axios';

function AddCategorie({ addCategory }) {
    const [formData, setFormData] = useState({
        nom_categorie: "",
        description: ""
    });

    const [errors, setErrors] = useState({
        nomCategorieError: "",
        descriptionError: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const response = await axios.post("http://127.0.0.1:5000/api/createCategorie", formData, config);
            console.log("Response from server:", response.data);
            addCategory(response.data);
            setFormData({
                nom_categorie: "",
                description: ""
            });
        } catch (err) {
            console.error("Error object:", err);
            if (err.response) {
                if (err.response.status === 403) {
                    setErrors({ ...errors, nomCategorieError: "Insufficient permissions to create a category." });
                } else {
                    setErrors({ ...errors, nomCategorieError: err.response.data });
                }
            } else {
                setErrors({ ...errors, nomCategorieError: "An error occurred. Please try again later." });
            }
        }
    };

    return (
        <div className='container-fluid p-0' style={{ backgroundColor: '#dbe1e4' }}>
            <div className="p-0 m-0 row col">
                <div className="col p-0">
                    <h1>Categories</h1>
                    <form className="container">
                        <div className="mb-3">
                            <label htmlFor="nomCategorie" className="form-label">Nom de la catégorie</label>
                            <input
                                type="text"
                                className="form-control"
                                id="nom_categorieInput"
                                name="nom_categorie"
                                value={formData.nom_categorie}
                                onChange={handleChange}
                                placeholder="Enter nom_categorie"
                                required
                            />
                            {errors.nomCategorieError && <p className="error-message">{errors.nomCategorieError}</p>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                type="text"
                                className="form-control"
                                id="descriptionInput"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter description"
                                rows={4}
                                required
                            />
                            {errors.descriptionError && <p className="error-message">{errors.descriptionError}</p>}
                        </div>
                        <button type="submit" className="btn btn-primary" onClick={handleSubmit}>Submit</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddCategorie;
