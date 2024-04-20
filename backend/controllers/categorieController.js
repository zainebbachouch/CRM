const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ')

const createCategorie = async (req, res) => {
    try {
        const { nom_categorie, description } = req.body;
        
        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        // Check role
        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const existingCategorie = await db.query('SELECT * FROM categorie WHERE nom_categorie = ?', [nom_categorie]);
        if (existingCategorie.length > 0) {
            return res.status(400).json({ message: "Une catégorie avec ce nom existe déjà" });
        }

        const categorieData = {
            nom_categorie: nom_categorie,
            description: description,
        };

        const result = await db.query('INSERT INTO categorie SET ?', categorieData);
        if (result) {
            console.log("Catégorie insérée avec succès");
            console.log(result);
            res.json({ message: "Insertion réussie" });
        } else {
            console.error("Erreur lors de l'insertion de la catégorie");
            res.status(500).json({ message: "Erreur lors de l'insertion de la catégorie" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getCategorieById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM categorie WHERE idcategorie = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur interne du serveur" });
        }
        if (result.length === 0) {
            console.log("Category not found");
            return res.status(404).json({ message: "Catégorie non trouvée" });
        }
        console.log("Category found:", result[0]);
        res.json(result[0]);
    });
};

/// add authorized 

const getAllCategories = async (req, res) => {
    try {
        const categories = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM categorie', (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        // Send the categories as JSON
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};




const updateCategorie = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom_categorie, description } = req.body;
        
        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        // Check role
        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        
        db.query('UPDATE categorie SET nom_categorie = ?, description = ? WHERE idcategorie = ?', [nom_categorie, description, id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erreur interne du serveur" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Catégorie non trouvée" });
            }
            res.json({ message: "Catégorie mise à jour avec succès" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteCategorie = async (req, res) => {
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
        
        db.query('DELETE FROM categorie WHERE idcategorie = ?', [id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erreur interne du serveur" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Catégorie non trouvée" });
            }
            res.json({ message: "Catégorie supprimée avec succès" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};




module.exports = {createCategorie ,getCategorieById ,getAllCategories,updateCategorie,deleteCategorie}