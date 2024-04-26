import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/getProductById/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product:', err);
      }
    }
    fetchProduct();
  }, [id]);

  if (!product) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>{product.nom_produit}</h1>
      <img src={product.photo_produit} alt={product.nom_produit} />
            <p>{product.description_produit}</p>
      <p>Price: {product.prix_produit}</p>
      <p>Category: {product.categorie_idcategorie}</p>
      <p>Discount: {product.remise_produit}</p>
      <p>Added Date: {product.date_ajout_produit}</p>
      <p>Modified Date: {product.date_modification_produit}</p>
    </div>
  );
}

export default ProductDetails;
