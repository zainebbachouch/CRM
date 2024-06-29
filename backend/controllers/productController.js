const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ')
const { saveToHistory, saveNotification, getInformationOfRole } = require('./callback');


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
    // Authorization check
    const authResult = await isAuthorize(req, res);
    if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Check role
    if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe' && authResult.decode.role !== 'client') {
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

/*
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
        res.json({ message: "Produit créé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};*/



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

        // Fetch all employees and clients
        const employees = await db.query('SELECT * FROM employe');
        const clients = await db.query('SELECT * FROM client');

        // Create notification message
        const notificationMessage = `Nouveau produit ajouté: ${nom_produit}`;

        // Send notifications to employees
        for (const employee of employees) {
            const email = employee.email_employe;
            await saveNotification(email, notificationMessage);

            const receiverSocketId = userSocketMap[employee.idemploye];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receiveNotification', {
                    message: notificationMessage,
                    timestamp: new Date().toISOString(),
                    sender_id: userId
                });
            }
        }

        // Send notifications to clients
        for (const client of clients) {
            const email = client.email_client;
            await saveNotification(email, notificationMessage);

            const receiverSocketId = userSocketMap[client.idclient];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receiveNotification', {
                    message: notificationMessage,
                    timestamp: new Date().toISOString(),
                    sender_id: userId
                });
            }
        }

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

module.exports = { createProduct, getProductById, getAllProducts, updateProduct, deleteProduct };


