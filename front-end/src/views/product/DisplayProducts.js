import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AddProduct from './AddProduct';
import { Link } from 'react-router-dom';

function DisplayProducts({ products, setProducts, addProduct, setSelectedProductId }) {
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [categories, setCategories] = useState([]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.get('http://127.0.0.1:5000/api/getAllProducts', config);
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    }, [setProducts]);

    const fetchCategories = useCallback(async () => {
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
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            await axios.delete(`http://127.0.0.1:5000/api/deleteProduct/${id}`, config);
            setProducts(products.filter((product) => product.idproduit !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const role = localStorage.getItem('role');

    const handleUpdate = (product) => {
        setSelectedProduct(product);
    };

    // Function to get category name based on category ID
    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.idcategorie === categoryId);
        return category ? category.nom_categorie : 'N/A';
    };


    return (
        <div>
            {role !== 'client' && (
                <AddProduct
                    addProduct={addProduct}
                    selectedProduct={selectedProduct}
                    setSelectedProduct={setSelectedProduct}
                    fetchProducts={fetchProducts}
                    categories={categories}
                    setCategories={setCategories}
                    loading={loading}
                    setLoading={setLoading}
                    products={products}
                    setProducts={setProducts}
                />
            )}
            {loading ? (
                <p>Loading...</p>
            ) : role !== 'client' ? (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Discount</th>
                            <th>Photo</th>
                            <th>Added Date</th>
                            <th>Modified Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((val, key) => (
                            <tr key={key}>
                                <td>{val.nom_produit}</td>
                                <td>{val.prix_produit}</td>
                                <td>{val.description_produit}</td>
                                <td>{getCategoryName(val.categorie_idcategorie)}</td>
                                <td>{val.remise_produit}</td>
                                <td>{val.photo_produit}</td>
                                <td>{val.date_ajout_produit}</td>
                                <td>{val.date_modification_produit}</td>
                                <td>
                                    <button className="btn btn-primary mr-2" onClick={() => handleUpdate(val)}>
                                        Update
                                    </button>
                                    <button className="btn btn-danger" onClick={() => handleDelete(val.idproduit)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="d-flex flex-wrap">
                    {products.map((product, index) => (
                      <div className="card" style={{ width: '18rem' }} key={index}>
                        <img className="card-img-top" src={product.photo_produit} alt={product.nom_produit} />
                        <div className="card-body">
                          <h5 className="card-title">{product.nom_produit}</h5>
                          <p>{getCategoryName(product.categorie_idcategorie)}</p>
                          <p className="card-text">{product.description_produit}</p>
                          <p className="card-price">{product.prix_produit}</p>
                          <Link to={`/Products/${product.idproduit}`} className="btn btn-primary">
                         Show Details
                          </Link>

                          <button className="btn btn-primary">add to basket</button>
                        </div>
                      </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DisplayProducts;
