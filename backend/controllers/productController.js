const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ')
const { saveToHistory ,search } = require('./callback');



const getProductById = (req, res) => {
    try {
        const { produitId } = req.params;
        if (!produitId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }
        db.query('SELECT * FROM produit WHERE idproduit = ?', [produitId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            if (result.length === 0) {
                console.log("Product not found");
                return res.status(404).json({ message: "Product not found" });
            }
            console.log("Product found:", result[0]);
            res.json(result[0]);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getAllProducts = async (req, res) => {
    try {
        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Role check
        const { role } = authResult.decode;
        if (!['admin', 'employe', 'client'].includes(role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        // Get pagination parameters
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10
        const offset = (page - 1) * limit;

        // Query to get total number of products
        const totalQuery = 'SELECT COUNT(*) as total FROM produit';
        db.query(totalQuery, (err, totalResult) => {
            if (err) {
                console.error('Error fetching total count:', err);
                return res.status(500).json({ message: "Internal server error" });
            }

            const total = totalResult[0].total;

            // Query to get products with pagination
            const productsQuery = 'SELECT * FROM produit LIMIT ? OFFSET ?';
            db.query(productsQuery, [limit, offset], (err, productsResult) => {
                if (err) {
                    console.error('Error fetching products:', err);
                    return res.status(500).json({ message: "Internal server error" });
                }

                res.json({
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    products: productsResult
                });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// In productController.js

const searchProducts = async (req, res) => {
    const { searchTerm } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    try {
        // Query to get total number of products that match the search term
        const totalQuery = 'SELECT COUNT(*) as total FROM produit WHERE nom_produit LIKE ?';
        const totalResult = await new Promise((resolve, reject) => {
            db.query(totalQuery, [`%${searchTerm}%`], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const total = totalResult[0].total;

        // Query to get products with pagination and search term
        const productsQuery = 'SELECT * FROM produit WHERE nom_produit LIKE ? LIMIT ? OFFSET ?';
        const productsResult = await new Promise((resolve, reject) => {
            db.query(productsQuery, [`%${searchTerm}%`, limit, offset], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.json({
            products: productsResult,
            total: total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error in searchProducts:', error);
        res.status(500).send('Server error');
    }
};



const createProduct = async (req, res) => {
    try {
        const { nom_produit, prix_produit, description_produit, categorie_idcategorie,
            remise_produit, photo_produit } = req.body;

        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check role
        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const existingCategory = await db.query('SELECT * FROM categorie WHERE idcategorie = ?', [categorie_idcategorie]);
        if (existingCategory.length === 0) {
            return res.status(400).json({ message: "La catégorie associée n'existe pas" });
        }

        const dateAjoutProduit = new Date().toISOString().slice(0, 19).replace('T', ' ');


        const result = await db.query(
            'INSERT INTO produit (nom_produit, prix_produit, description_produit, categorie_idcategorie, remise_produit, photo_produit, date_ajout_produit) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nom_produit, prix_produit, description_produit, categorie_idcategorie, remise_produit, photo_produit, dateAjoutProduit]
        );
        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;
        saveToHistory('Statut de la produit ajouter', userId, userRole);
        res.json({ message: "Produit créé avec succès", nom_produit });
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

        const existingCategory = await db.query('SELECT * FROM categorie WHERE idcategorie = ?', [categorie_idcategorie]);
        if (existingCategory.length === 0) {
            return res.status(400).json({ message: "La catégorie associée n'existe pas" });
        }

        const result = await db.query(
            'UPDATE produit SET nom_produit = ?, prix_produit = ?, description_produit = ?, categorie_idcategorie = ?, remise_produit = ?, photo_produit = ?, date_modification_produit = NOW() WHERE idproduit = ?',
            [nom_produit, prix_produit, description_produit, categorie_idcategorie, remise_produit, photo_produit, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }
        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;
        saveToHistory('Statut de la produit mise a jour ', userId, userRole);
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
        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;
        saveToHistory('Statut de la produit supprimer', userId, userRole);
        res.json({ message: "Produit supprimé avec succès" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// 1. Total Sales: Sum of all sales for each product.
const getTotalSales = async (req, res) => {
    try {
        const query = `
            SELECT p.idproduit, p.nom_produit, SUM(f.montant_total_facture) AS totalSales
            FROM produit p
            JOIN ligne_de_commande lc ON p.idproduit = lc.produit_idproduit
            JOIN commande c ON lc.commande_idcommande = c.idcommande
            JOIN facture f ON c.idcommande = f.idcommande
            GROUP BY p.idproduit, p.nom_produit`;
        
        const results = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching total sales:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// Function to get total products sold based on selected period
const getTotalProductsSold = async (req, res) => {
    const period = req.query.period || 'monthly'; // Default to 'monthly' if no period is provided
    console.log("Period for total products sold:", period); // Log the period
    // Determine date filtering based on the period
    let dateCondition;
    switch (period) {
        case 'daily':
            dateCondition = `DATE(f.date_facture) = CURDATE()`;
            break;
        case 'weekly':
            dateCondition = `YEARWEEK(f.date_facture, 1) = YEARWEEK(CURDATE(), 1)`; // ISO week format
            break;
        case 'monthly':
            dateCondition = `MONTH(f.date_facture) = MONTH(CURDATE()) AND YEAR(f.date_facture) = YEAR(CURDATE())`;
            break;
        case 'yearly':
            dateCondition = `YEAR(f.date_facture) = YEAR(CURDATE())`;
            break;
        default:
            return res.status(400).json({ message: "Invalid period" });
    }

    try {
        const query = `
            SELECT SUM(lc.quantite_produit) AS totalProductsSold  
            FROM ligne_de_commande lc
            JOIN produit p ON lc.produit_idproduit = p.idproduit
            JOIN commande c ON lc.commande_idcommande = c.idcommande
            JOIN facture f ON c.idcommande = f.idcommande
            WHERE f.etat_facture = 'payee' AND ${dateCondition};`; // Filter by paid invoices and selected period

        const results = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const totalProductsSold = results[0]?.totalProductsSold || 0; // Get the total products sold
        res.status(200).json([{ totalProductsSold }]); // Return as an array
        // Return totalProductsSold
    } catch (error) {
        console.error("Error fetching total products sold:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = {
    getTotalSales,getTotalProductsSold,
    searchProducts,createProduct, getProductById, getAllProducts, updateProduct, deleteProduct };


