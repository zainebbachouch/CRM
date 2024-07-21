const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ')
const { saveToHistory } = require('./callback')


const createCategorie = async (req, res) => {
    try {
        const { nom_categorie, description } = req.body;

        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

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
            res.json({ message: "Insertion réussie", nom_categorie });
            const userId = authResult.decode.id;
            const userRole = authResult.decode.role;
            console.log('qui connecte', userId)

            saveToHistory('Statut de la categorie ajouter', userId, userRole);
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
        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check role
        if (!['admin', 'employe', 'client'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        // Pagination parameters
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10
        const offset = (page - 1) * limit;

        // Queries for total count and paginated categories
        const countQuery = 'SELECT COUNT(*) AS total FROM categorie';
        const sqlQuery = 'SELECT * FROM categorie LIMIT ? OFFSET ?';

        // Execute queries in parallel
        const [countResult, categories] = await Promise.all([
            new Promise((resolve, reject) => {
                db.query(countQuery, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            }),
            new Promise((resolve, reject) => {
                db.query(sqlQuery, [limit, offset], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            })
        ]);

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        res.json({
            categories,
            total,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const searchCategorie = async (req, res) => {
    const { searchTerm } = req.params; // Ensure this matches the route parameter
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    try {
        // Query to get total number of categories that match the search term
        const totalQuery = 'SELECT COUNT(*) as total FROM categorie WHERE nom_categorie LIKE ?';
        const totalResult = await new Promise((resolve, reject) => {
            db.query(totalQuery, [`%${searchTerm}%`], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const total = totalResult[0].total;

        // Query to get categories with pagination and search term
        const categoriesQuery = 'SELECT * FROM categorie WHERE nom_categorie LIKE ? LIMIT ? OFFSET ?';
        const categoriesResult = await new Promise((resolve, reject) => {
            db.query(categoriesQuery, [`%${searchTerm}%`, limit, offset], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.json({
            categories: categoriesResult, // Changed from 'products' to 'categories'
            total: total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error in searchCategorie:', error);
        res.status(500).json({ error: 'Server error' });
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
            const userId = authResult.decode.id;
            const userRole = authResult.decode.role;
            console.log('qui connecte', userId)

            saveToHistory('Statut de la categorie mis à jour', userId, userRole);
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
            const userId = authResult.decode.id;
            const userRole = authResult.decode.role;
            console.log('qui connecte', userId)

            saveToHistory('Statut de la categorie supprimer', userId, userRole);
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};




module.exports = {searchCategorie, createCategorie, getCategorieById, getAllCategories, updateCategorie, deleteCategorie }