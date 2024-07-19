const express = require("express");
const productController = require("../controllers/productController");
const router = express.Router();
const multer = require('multer');


// Configure Multer storage and file naming
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../document/uploads'); // Set the directory for file uploads
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Generate a unique file name
    }
});

const upload = multer({ storage: storage });

router.put('/updateProduct/:id', (req, res) => { upload.single('photo_produit'), productController.updateProduct(req, res) });
router.post('/createProduct', (req, res) => { upload.single('photo_produit'), productController.createProduct(req, res) });


router.get('/getProductById/:produitId', productController.getProductById);
router.get('/getAllProducts', productController.getAllProducts);
router.delete('/deleteProduct/:id', productController.deleteProduct);

module.exports = router;
