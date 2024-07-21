const express = require("express");
const categorieController = require("../controllers/categorieController");
const router = express.Router();

router.post('/createCategorie', categorieController.createCategorie);
router.get('/getCategorieById/:id', categorieController.getCategorieById);
router.get('/getAllCategories', categorieController.getAllCategories);
router.put('/updateCategorie/:id', categorieController.updateCategorie);
router.delete('/deleteCategorie/:id', categorieController.deleteCategorie);
router.get('/searchCategories/:searchTerm', categorieController.searchCategorie);

module.exports = router;
