import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AddProduct({ addProduct, selectedProduct,products,setProducts, setSelectedProduct, fetchProducts, categories, setCategories, loading, setLoading }) {
    const [formData, setFormData] = useState({
        nom_produit: '',
        prix_produit: '',
        description_produit: '',
        categorie_idcategorie: '',
        photo_produit: ''
    });

    const [errors, setErrors] = useState({
        productNameError: '',
        productPriceError: '',
        productDescriptionError: '',
        productCategoryError: '',
        productImageError: '',
        general: ''
    });
    const [successMessage, setSuccessMessage] = useState('');

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
            console.log("Categories response:", response.data); // Log the response data
            setCategories(response.data);
        } catch (err) {
            console.error("Error fetching categories:", err.message);
            setErrors({ general: "An error occurred while fetching categories. Please try again later." });
        } finally {
            setLoading(false);
        }
    }, [setCategories, setLoading]);

    useEffect(() => {
        fetchCategories();
        if (selectedProduct) {
            // Populate form fields with selected product's data
            setFormData({
                nom_produit: selectedProduct.nom_produit,
                prix_produit: selectedProduct.prix_produit,
                description_produit: selectedProduct.description_produit,
                categorie_idcategorie: selectedProduct.categorie_idcategorie,
                photo_produit: selectedProduct.photo_produit
            });
        }
    }, [fetchCategories, selectedProduct]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: type === 'file' ? e.target.files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccessMessage('');
    
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            };
            if (selectedProduct) {
                const response = await axios.put(`http://127.0.0.1:5000/api/updateProduct/${selectedProduct.idproduit}`, formData, config);
                // Update product in the products list
                const updatedProducts = products.map((product) => {
                    if (product.idproduit === selectedProduct.idproduit) {
                        return response.data; // Updated product
                    }
                    return product;
                });
                setProducts(updatedProducts); // Use setProducts function from props to update products
                setSuccessMessage('Product updated successfully');
                fetchProducts();
            } else {
                const response = await axios.post('http://127.0.0.1:5000/api/createProduct', formData, config);
                addProduct(response.data);
                setSuccessMessage(response.data.message);
                fetchProducts();
                setFormData({
                    nom_produit: '',
                    prix_produit: '',
                    description_produit: '',
                    categorie_idcategorie: '',
                    photo_produit: ''
                });
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
        <div>
            <h1>{selectedProduct ? 'Update Product' : 'Add New Product'}</h1>
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            {errors.general && <p style={{ color: 'red' }}>{errors.general}</p>}
            <form id="productForm">
                <label htmlFor="nom_produit">Product Name:</label><br />
                <input
                    type="text"
                    id="nom_produit"
                    name="nom_produit"
                    value={formData.nom_produit}
                    onChange={handleChange}
                    required
                /><br /><br />

                <label htmlFor="prix_produit">Price:</label><br />
                <input
                    type="number"
                    id="prix_produit"
                    name="prix_produit"
                    value={formData.prix_produit}
                    onChange={handleChange}
                    required
                /><br /><br />

                <label htmlFor="description_produit">Description:</label><br />
                <textarea
                    id="description_produit"
                    name="description_produit"
                    value={formData.description_produit}
                    onChange={handleChange}
                    required
                /><br /><br />

                <label htmlFor="categorie_idcategorie">Category:</label><br />
                <select
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


                <br /><br />

                <label htmlFor="photo_produit">Image:</label><br />
                <input
                    type="file"
                    id="photo_produit"
                    name="photo_produit"
                    onChange={handleChange}
                    required
                /><br /><br />

                <button type="submit" onClick={handleSubmit}>{selectedProduct ? 'Update Product' : 'Add Product'}</button>
            </form>
            {loading && <p>Loading...</p>}
        </div>
    );
}

export default AddProduct;
