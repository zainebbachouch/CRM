const express = require("express");
const basketController = require("../controllers/basketController");
const router = express.Router();

router.get('/getProductsInCart', basketController.getProductsInCart);
router.post('/AddtoCart', basketController.AddtoCart);

module.exports = router;