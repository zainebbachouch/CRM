const express = require("express");
const productController = require("../controllers/productController");
const router = express.Router();

// Routes pour les produits
router.post('/createProduct', productController.createProduct);
router.get('/getProductById/:id', productController.getProductById);
router.get('/getAllProducts', productController.getAllProducts);
router.put('/updateProduct/:id', productController.updateProduct);
router.delete('/deleteProduct/:id', productController.deleteProduct);

module.exports = router;
