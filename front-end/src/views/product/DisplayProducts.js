import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import AddProduct from './addProduct';
import { Link } from 'react-router-dom';
import "../../style/products.css"
//import UserPermissionsContext from '../context/UserPermissionsPage';
import { UserPermissionsContext } from '../context/UserPermissionsPage'; // Correction de l'import

function DisplayProducts({ products, setProducts, addProduct, setSelectedProductId }) {
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const userPermissions = useContext(UserPermissionsContext);
    useEffect(() => {

        console.log('User Permissions in DisplayProducts:', userPermissions);

    }, [userPermissions]);


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

    const handleUpdate = (product, action) => {
        if (action === "update") {
            setSelectedProduct(product);
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.idcategorie === categoryId);
        return category ? category.nom_categorie : 'N/A';
    };

    const handleAddToBasket = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.post('http://127.0.0.1:5000/api/AddtoCart', {
                produitId: productId,
                quantite: 1,
            }, config);
            console.log(response.data);
            const { currentCommandeId } = response.data;
            localStorage.setItem('currentCommandeId', currentCommandeId);
        } catch (error) {
            console.error('Error adding product to basket:', error);
        }
    };
    const isAdmin = localStorage.getItem('role') === 'admin';
    return (
        <div className="m-0 p-0">
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
            <div className="container-fluid d-flex justify-content-end mb-2">
                {(isAdmin || (userPermissions && userPermissions.addProduit === 1)) && ( // Add parentheses here

                    <button className="btn btn-success mr-2" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => handleUpdate('val', 'ajouter')}>
                        Ajouter un nouveau produit +
                    </button>
                )}
            </div>

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


                                    {(isAdmin || (userPermissions && userPermissions.updateProduit === 1)) && ( // Add parentheses here
                                        <button className="btn btn-primary mr-2" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => handleUpdate(val, 'update')}>
                                            Update
                                        </button>
                                    )}

                                    {/** concernat  userPermissions.deleteProduit lorsque on mis . pas select de choix de atribut */}

                                    {(isAdmin || (userPermissions && userPermissions.deleteProduit === 1)) && ( // Add parentheses here
                                        <button className="btn btn-danger" onClick={() => handleDelete(val.idproduit)}>
                                            Delete
                                        </button>
                                    )}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="d-flex flex-wrap m-0 p-0 justify-content-around productDisplay">
                    {products.map((product, index) => (
                        <div className="card p-2" style={{ width: '18rem' }} key={index}>
                            <img className="card-img-top" src={product.photo_produit} alt={product.nom_produit} />
                            <div className="card-body">
                                <p className="card-title"><span className="label">Nom Produit : </span>{product.nom_produit}</p>
                                <p><span className="label">Categorie Produit : </span>{getCategoryName(product.categorie_idcategorie)}</p>
                                <p className="card-text">{product.description_produit}</p>
                                <p className="card-price"><span className="label">Prix Produit : </span>{product.prix_produit}</p>
                                <div className="buttonsContainer d-flex container-fluid m-0 p-0 column-gap-2">
                                    <button className="btn btn-primary p-0">
                                        <Link to={`/Products/${product.idproduit}`} className="text-white btn-link">
                                            Show Details
                                        </Link>
                                    </button>
                                    <button className="btn btn-success" onClick={() => handleAddToBasket(product.idproduit)}>
                                        Add to basket
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


export default DisplayProducts;