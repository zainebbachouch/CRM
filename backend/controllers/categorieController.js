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


const revenuecontribution = async (req, res) => {
    const period = req.query.period || 'monthly';
    console.log("Period for revenue contribution:", period);

    let dateCondition;
    let dateFormat;

    switch (period) {
        case 'daily':
            dateCondition = `DATE(f.date_facture) = CURDATE()`;
            dateFormat = '%Y-%m-%d';
            break;
        case 'weekly':
            dateCondition = `YEARWEEK(f.date_facture, 1) = YEARWEEK(CURDATE(), 1)`;
            dateFormat = '%Y-%u'; // Week number
            break;
        case 'monthly':
            dateCondition = `MONTH(f.date_facture) = MONTH(CURDATE()) AND YEAR(f.date_facture) = YEAR(CURDATE())`;
            dateFormat = '%Y-%m';
            break;
        case 'yearly':
            dateCondition = `YEAR(f.date_facture) = YEAR(CURDATE())`;
            dateFormat = '%Y';
            break;
        default:
            return res.status(400).json({ message: "Invalid period" });
    }

    try {
        const query = `
            SELECT 
                c.nom_categorie AS category,
                DATE_FORMAT(f.date_facture, '${dateFormat}') AS period,
                AVG(f.montant_total_facture) AS revenu
            FROM 
                ligne_de_commande l
            JOIN 
                produit p ON l.produit_idproduit = p.idproduit
            JOIN 
                categorie c ON p.categorie_idcategorie = c.idcategorie
            JOIN 
                commande co ON l.commande_idcommande = co.idcommande
            JOIN 
                facture f ON co.idcommande = f.idcommande
            WHERE 
                f.etat_facture = 'payee' AND ${dateCondition}
            GROUP BY 
                c.nom_categorie, period;
        `;

        const results = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching total Revenue Contribution by Category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const topSellingCategories = async (req, res) => {
    const period = req.query.period || 'monthly';
    console.log("Period for top selling categories:", period);
  
    let dateCondition;
    let dateFormat;
  
    switch (period) {
      case 'daily':
        dateCondition = `DATE(f.date_facture) = CURDATE()`;
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        dateCondition = `YEARWEEK(f.date_facture, 1) = YEARWEEK(CURDATE(), 1)`;
        dateFormat = '%Y-%u';
        break;
      case 'monthly':
        dateCondition = `MONTH(f.date_facture) = MONTH(CURDATE()) AND YEAR(f.date_facture) = YEAR(CURDATE())`;
        dateFormat = '%Y-%m';
        break;
      case 'yearly':
        dateCondition = `YEAR(f.date_facture) = YEAR(CURDATE())`;
        dateFormat = '%Y';
        break;
      default:
        return res.status(400).json({ message: "Invalid period" });
    }
  
    try {
      const query = `
        SELECT 
          c.nom_categorie AS category,
          COUNT(l.produit_idproduit) AS total_products_sold,
          SUM(l.quantite_produit * p.prix_produit) AS total_sales
        FROM 
          ligne_de_commande l
        JOIN 
          produit p ON l.produit_idproduit = p.idproduit
        JOIN 
          categorie c ON p.categorie_idcategorie = c.idcategorie
        JOIN 
          commande co ON l.commande_idcommande = co.idcommande
        JOIN 
          facture f ON co.idcommande = f.idcommande
        WHERE 
          ${dateCondition} 
        GROUP BY 
          c.nom_categorie
        ORDER BY 
          total_sales DESC
        LIMIT 5;
      `;
  
      console.log("Query for top selling categories:", query); // Log the query

      const results = await new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
  
      res.status(200).json(results); // Return the results
    } catch (error) {
      console.error("Error fetching top selling categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };






module.exports = {
    revenuecontribution,topSellingCategories,
    searchCategorie, createCategorie, getCategorieById, getAllCategories, updateCategorie, deleteCategorie }


