import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GetCartProducts() {
    const [cartProducts, setCartProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCartProducts() {    
            try {    
                const token = localStorage.getItem('token');    
                const config = {    
                    headers: {    
                        Authorization: `Bearer ${token}`,    
                    },    
                };
    
                const response = await axios.get('http://127.0.0.1:5000/api/getProductsInCart', config); 

                setCartProducts(response.data.cartProductsResult);    
                setLoading(false);
    
            } catch (error) {    
                console.error('Error fetching cart products:', error);    
                setLoading(false);    
            }
    
        }    
        fetchCartProducts();
    
    }, []);

    return (
        <div>
            {loading ? (
                <div className="cart-count">Loading...</div>
            ) : cartProducts && cartProducts.length > 0 ? (
                <>
                    <div className="cart-count">Cart Count: {cartProducts.length}</div>
                    <div className="card-container d-flex flex-wrap">
                        {cartProducts.map((product, key) => (
                            <div className="card" style={{ width: '18rem' }} key={key}>
                                <img className="card-img-top" src={product.photo_produit} alt={product.nom_produit} />
                                <div className="card-body">
                                    <h5 className="card-title">{product.nom_produit}</h5>
                                    <p className="card-text">{product.description_produit}</p>
                                    <p className="card-price">{product.prix_produit}</p>
                                    <p>Discount: {product.remise_produit}%</p>
                                    <p>Quantity: {product.quantite_produit}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="cart-count">Your cart is empty</div>
            )}
        </div>
    );
}

export default GetCartProducts;
