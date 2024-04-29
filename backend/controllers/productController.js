const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ')

const getProductById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM produit WHERE idproduit = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur interne du serveur" });
        }
        if (result.length === 0) {
            console.log("Product not found");
            return res.status(404).json({ message: "Produit non trouvé" });
        }
        console.log("Product found:", result[0]);
        res.json(result[0]);
    });
};

const getAllProducts  = async (req, res) => {
      // Authorization check
      const authResult = await isAuthorize(req, res);
      if (authResult.message !== 'authorized') {
          return res.status(401).json({ message: "Unauthorized" });
      }
  
       // Check role
       if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe'&& authResult.decode.role !== 'client' ) {
          return res.status(403).json({ message: "Insufficient permissions" });
      }
    db.query('SELECT * FROM produit', (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur interne du serveur" });
        }
        res.json(result);
    });
};
const createProduct = async (req, res) => {
    try {
        const { nom_produit, prix_produit, description_produit, categorie_idcategorie, remise_produit, photo_produit } = req.body;
        
        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        // Check role
        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        // Check if the associated category exists
        const existingCategory = await db.query('SELECT * FROM categorie WHERE idcategorie = ?', [categorie_idcategorie]);
        if (existingCategory.length === 0) {
            return res.status(400).json({ message: "La catégorie associée n'existe pas" });
        }

        // Set current date for date_ajout_produit
        const dateAjoutProduit = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Insert the product into the database
        const result = await db.query(
            'INSERT INTO produit (nom_produit, prix_produit, description_produit, categorie_idcategorie, remise_produit, photo_produit, date_ajout_produit) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [nom_produit, prix_produit, description_produit, categorie_idcategorie, remise_produit, photo_produit, dateAjoutProduit]
        );
        res.json({ message: "Produit créé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom_produit, prix_produit, description_produit, categorie_idcategorie, remise_produit, photo_produit } = req.body;

        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check role
        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        // Check if the associated category exists
        const existingCategory = await db.query('SELECT * FROM categorie WHERE idcategorie = ?', [categorie_idcategorie]);
        if (existingCategory.length === 0) {
            return res.status(400).json({ message: "La catégorie associée n'existe pas" });
        }

        // Update the product and set date_modification_produit to current timestamp
        const result = await db.query(
            'UPDATE produit SET nom_produit = ?, prix_produit = ?, description_produit = ?, categorie_idcategorie = ?, remise_produit = ?, photo_produit = ?, date_modification_produit = NOW() WHERE idproduit = ?',
            [nom_produit, prix_produit, description_produit, categorie_idcategorie, remise_produit, photo_produit, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }
        
        res.json({ message: "Produit mis à jour avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check role
        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const result = await db.query('DELETE FROM produit WHERE idproduit = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }
        
        res.json({ message: "Produit supprimé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createProduct, getProductById, getAllProducts, updateProduct, deleteProduct };


