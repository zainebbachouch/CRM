const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ');
const { saveToHistory } = require('./callback')


const addEmployeesToAuthorization = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['admin'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        // Step 1: Récupérer tous les emails des employés depuis la table employe
        const employees = await new Promise((resolve, reject) => {
            db.query('SELECT email_employe FROM employe', (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    const emails = result.map(row => row.email_employe);
                    resolve(emails);
                }
            });
        });

        // Step 2: Pour chaque email, vérifier s'il existe déjà dans la table autorisation
        // Si l'email n'existe pas, insérer une nouvelle ligne avec des autorisations par défaut à false
        const insertPromises = employees.map((email) => {
            return new Promise((resolve, reject) => {
                const checkExistenceQuery = 'SELECT COUNT(*) AS count FROM autorisation WHERE email_employe = ?';
                db.query(checkExistenceQuery, [email], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        const exists = result[0].count > 0;
                        if (!exists) {
                            const insertQuery = 'INSERT INTO autorisation (email_employe, deleteClient, deleteFacture, deleteCommande, deleteProduit, deleteCategorie, activateClient, addProduit, addCategorie, incativeClient, updateFacture, updateCommande, updateProduit, updateCategorie) VALUES (?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)';
                            db.query(insertQuery, [email], (err, result) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(result);
                                }

                            });
                        } else {
                            resolve("Employee already exists in authorization table");
                        }
                    }
                });
            });
        });

        // Attendre l'exécution de toutes les requêtes d'insertion
        await Promise.all(insertPromises);

        // Step 3: Récupérer toutes les autorisations mises à jour pour les employés
        const authorizations = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM autorisation', (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.json({
            message: "Employees added to authorization table successfully",
            authorizations: authorizations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}



const updatestatusEmployesAutorisation = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['admin'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { email_employe, deleteFacture, deleteCommande, deleteProduit, deleteCategorie, activateClient, addProduit, addCategorie, incativeClient, updateFacture, updateCommande, updateProduit, updateCategorie } = req.body;

        if (!email_employe) {
            return res.status(400).json({ message: "Missing email_employe" });
        }

        console.log('Received data:', req.body);  // Log received data

        const sqlQuery = `
        UPDATE autorisation
        SET deleteFacture = ?, deleteCommande = ?, deleteProduit = ?, deleteCategorie = ?, activateClient = ?, addProduit = ?, addCategorie = ?, incativeClient = ?, updateFacture = ?, updateCommande = ?, updateProduit = ?, updateCategorie = ?
        WHERE email_employe = ?`;

        db.query(sqlQuery, [deleteFacture, deleteCommande, deleteProduit, deleteCategorie, activateClient, addProduit, addCategorie, incativeClient, updateFacture, updateCommande, updateProduit, updateCategorie, email_employe], (err, result) => {
            if (err) {
                console.error('SQL Error:', err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Employee not found" });
            }
            const userId = authResult.decode.id;
            const userRole = authResult.decode.role;
            console.log('qui connecte', userId);

            saveToHistory('updatestatusEmployesAutorisation', userId, userRole);
            res.json({ message: "Authorizations updated successfully" });
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

const getUserPermissions = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userEmail = authResult.decode.email; // Obtenir l'email de l'utilisateur connecté

        // Récupérer les autorisations de l'utilisateur à partir de la table 'autorisation'
        const userPermissions = await new Promise((resolve, reject) => {
            const query = `SELECT deleteClient, deleteFacture, deleteCommande, deleteProduit, deleteCategorie, activateClient, addProduit, addCategorie, updateFacture, updateCommande, updateProduit, updateCategorie 
                           FROM autorisation 
                           WHERE email_employe = ?`;
            db.query(query, [userEmail], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result[0]); // Assurez-vous de renvoyer le premier résultat (qui devrait être unique)
                }
            });
        });

        console.log('User Permissions:', userPermissions); // Ajouté pour le débogage

        res.json({ permissions: userPermissions });
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};





module.exports = { addEmployeesToAuthorization, updatestatusEmployesAutorisation, getUserPermissions };


