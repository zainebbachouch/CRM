import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import io from "socket.io-client";



function AddProduct({ addProduct, selectedProduct, products, setProducts, setSelectedProduct, fetchProducts, categories, setCategories, loading, setLoading }) {
    const [formData, setFormData] = useState({
        nom_produit: '',
        prix_produit: '',
        description_produit: '',
        categorie_idcategorie: '',
        photo_produit: '',
        remise_produit: ''
    });

    const email = localStorage.getItem('email');
    const userid = localStorage.getItem('userId');
    const role = localStorage.getItem('role');


    const [refresh, setRefresh] = useState("no")
    const [errors, setErrors] = useState({
        productNameError: '',
        productPriceError: '',
        productDescriptionError: '',
        productCategoryError: '',
        productImageError: '',
        productRemiseError: '',
        general: ''
    });
    const [successMessage, setSuccessMessage] = useState('');
    const socket = io.connect("http://localhost:3300");

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.get("http://127.0.0.1:5000/api/getAllCategories", config);

            if (!response) {
                return;
            }
            console.log("Categories response:", response.data);
            setCategories(response.data);
        } catch (err) {
            console.error("Error fetching categories:", err.message);
            setErrors({ general: "An error occurred while fetching categories. Please try again later." });
        } finally {
            setLoading(false);
        }
    }, [setCategories, setLoading, refresh]);

    useEffect(() => {
        fetchCategories();
        if (selectedProduct) {
            setFormData({
                nom_produit: selectedProduct.nom_produit,
                prix_produit: selectedProduct.prix_produit,
                description_produit: selectedProduct.description_produit,
                categorie_idcategorie: selectedProduct.categorie_idcategorie,
                remise_produit: selectedProduct.remise_produit,
                photo_produit: selectedProduct.photo_produit
            });
        }
    }, [fetchCategories, selectedProduct]);

    const handleChange = async (e) => {
        const { name, type, files } = e.target;

        if (type === 'file' && files.length > 0) {
            const file = files[0];
            console.log('fileproduit', file);

            const formData1 = new FormData();
            formData1.append('file', file);
            formData1.append('upload_preset', 'xlcnkdgy'); // Nom de l'environnement cloud

            try {
                const response = await axios.post('https://api.cloudinary.com/v1_1/dik98v16k/image/upload/', formData1);
                const imageUrl = response.data.secure_url;

                setFormData((prevFormData) => ({
                    ...prevFormData,
                    [name]: imageUrl,
                }));
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        } else {
            const { value } = e.target;
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccessMessage('');
        // Préparer les données du formulaire
        const formDataToSend = new FormData();
        for (const key in formData) {
            formDataToSend.append(key, formData[key]);
        }
        // Ajouter l'image seulement si elle existe
        if (formData.photo_produit) {
            formDataToSend.append('photo_produit', formData.photo_produit);
        }
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            };
            if (selectedProduct) {
                const response = await axios.put(`http://127.0.0.1:5000/api/updateProduct/${selectedProduct.idproduit}`, formData, config);

                const updatedProducts = products.map((product) => {
                    if (product.idproduit === selectedProduct.idproduit) {
                        return response.data;
                    }
                    return product;
                });
                setProducts(updatedProducts);
                //2
                setSuccessMessage('');
                document.getElementById("closeButton").click()
                setRefresh("yes")
                fetchProducts();
            } else {
                const response = await axios.post('http://127.0.0.1:5000/api/createProduct', formData, config);
                addProduct(response.data);
                //ajouter les adresse mail conntecte now

                socket.emit('newProduct', { ...response.data, email, userid, role });
                setSuccessMessage(response.data.message);
                fetchProducts();
                setFormData({
                    nom_produit: '',
                    prix_produit: '',
                    description_produit: '',
                    categorie_idcategorie: '',
                    photo_produit: '',
                    remise_produit: ''
                });

                setSuccessMessage("");
                document.getElementById("closeButton").click()
                setRefresh("yes")

            }
        } catch (err) {
            console.error('Error:', err);
            if (err.response) {
                setErrors(err.response.data);
            } else {
                setErrors({ general: 'An error occurred. Please try again later.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* fade */}
            <div className="modal fade h-80" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{selectedProduct ? 'Update Product' : 'Add New Product'}</h5>

                        </div>
                        <div className="modal-body">
                            <div className="container">
                                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                {errors.general && <div className="alert alert-danger">{errors.general}</div>}
                                <form id="productForm" onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="nom_produit">Product Name:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="nom_produit"
                                            name="nom_produit"
                                            value={formData.nom_produit}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="prix_produit">Price:</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="prix_produit"
                                            name="prix_produit"
                                            value={formData.prix_produit}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="description_produit">Description:</label>
                                        <textarea
                                            className="form-control"
                                            id="description_produit"
                                            name="description_produit"
                                            value={formData.description_produit}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="categorie_idcategorie">Category:</label>
                                        <select
                                            className="form-control"
                                            id="categorie_idcategorie"
                                            name="categorie_idcategorie"
                                            value={formData.categorie_idcategorie}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {Array.isArray(categories) && categories.map((category, index) => (
                                                <option key={index} value={category.idcategorie}>
                                                    {category.nom_categorie}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="remise_produit">Discount:</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="remise_produit"
                                            name="remise_produit"
                                            value={formData.remise_produit}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="photo_produit">Image:</label>
                                        <input
                                            type="file"
                                            className="form-control-file"
                                            id="photo_produit"
                                            name="photo_produit"
                                            onChange={handleChange}

                                        />
                                    </div>
                                    <div className="modal-footer d-flex column-gap-2">
                                        <button type="button" className="btn btn-danger" data-bs-dismiss="modal" id="closeButton">Cancel</button>
                                        <button type="submit" className="btn btn-primary">{selectedProduct ? 'Update Product' : 'Add Product'}</button>
                                    </div>
                                </form>
                                {loading && <div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div>}

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>


    );
}

export default AddProduct;
