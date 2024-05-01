import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaRegPlusSquare, FaRegMinusSquare } from 'react-icons/fa';

function GetCartProducts() {
    const [cartProducts, setCartProducts] = useState([]);
    const [loading, setLoading] = useState(true);

  
    const fetchCartProducts = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchCartProducts();
    }, [fetchCartProducts]);
    /*
    const handleCompleteCommand = () => {
        const currentCommandeId = localStorage.getItem('currentCommandeId');
        if (currentCommandeId) {
          // Set the currentCommandeId in the localStorage
          localStorage.setItem('currentCommandeId', currentCommandeId);
      
          // Navigate to the CompleteCommand page
          window.location.href = "/completeCommand";
        } else {
          console.error('Current Commande ID not found in localStorage');
        }
      };*/
    const handleCompleteCommand = () => {
   
        const currentCommandeId = localStorage.getItem('currentCommandeId');

      
        if (currentCommandeId) {
           
           window.location.href = `/completeCommand?idcommand=${currentCommandeId}`;
       
        } else {
            console.error('Current Commande ID not found in localStorage');
        }
    };



    const handlePlusClick = async (product) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.post('http://127.0.0.1:5000/api/increaseProductQuantity', { produitId: product.idproduit }, config);

     
            await fetchCartProducts();
        } catch (error) {
            console.error('Error increasing product quantity:', error);
            alert('An error occurred while updating the product quantity. Please try again later.');
        }
    };

    const handleMinusClick = async (product) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.post('http://127.0.0.1:5000/api/decreaseProductQuantity', { produitId: product.idproduit }, config);

            
            await fetchCartProducts();
        } catch (error) {
            console.error('Error decreasing product quantity:', error);
            alert('An error occurred while updating the product quantity. Please try again later.');
        }
    };

    return (
        <div>
            {loading ? (
                <div className="cart-count">Loading...</div>
            ) : cartProducts && cartProducts.length > 0 ? (
                <>
                    <div className="cart-count">Cart Count: {cartProducts.length}</div>
                    <div className="card-container d-flex flex-wrap">
                        {cartProducts.map((product, index) => (
                            <div className="card" style={{ width: '18rem' }} key={index}>
                                <img className="card-img-top" src={product.photo_produit} alt={product.nom_produit} />
                                <div className="card-body">
                                    <h5 className="card-title">{product.nom_produit}</h5>
                                    <p className="card-text">{product.description_produit}</p>
                                    <p className="card-price">{product.prix_produit}</p>
                                    <p>Discount: {product.remise_produit}%</p>
                                    <div className="quantity-control">
                                        <FaRegPlusSquare onClick={() => handlePlusClick(product)} />
                                        <p>Quantity: {product.quantite_produit}</p>
                                        <FaRegMinusSquare onClick={() => handleMinusClick(product)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleCompleteCommand}>Complete Command</button>
                </>
            ) : (
                <div className="cart-count">Your cart is empty</div>
            )}
        </div>
    );
}

export default GetCartProducts;
