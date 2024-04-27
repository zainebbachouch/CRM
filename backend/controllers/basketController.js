const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ');
const { v4: uuidv4 } = require('uuid');


// id+1 ->commant easy then verification 
const generateUniqueCommandeId = async () => {
    try {
        const id = await getCommandID();
        console.log(`Generated id: ${id}`);

        return id;

    } catch (error) {
        console.error("Error in generateUniqueCommandeId:", error);
        throw error;
    }
};


const getCommandID = async () => {
    try {
        const result = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM commande', (error, rows) => {
                if (error) {
                    reject(error);
                } else {
                    // Since you're using COUNT(*) in the query, there will always be a result
                    // So you should directly resolve with the count value
                    resolve(rows[0].count + 1);
                }
            });
        });
        console.log("Result from getCommandID:", result);
        return result;
    } catch (error) {
        console.error("Error in getCommandID:", error);
        throw error;
    }
};

const getOrCreateCommande = async (clientId) => {
    console.log("getOrCreateCommande called with clientId:", clientId);
    try {
        const result = await db.query("SELECT idcommande FROM commande WHERE client_idclient = ? AND statut_commande='enattente'", [clientId]);
        // console.log("Result from getOrCreateCommande:", result);
        if (result.length > 0) {
            return result[0].idcommande;
        } else {
            console.log("No commande found for this client");
            const currentCommandeId = await generateUniqueCommandeId();
            if (currentCommandeId) {
                const currentDate = new Date().toISOString();
                // Fixed query by adding missing placeholder for description_commande
                 await db.query(
                      'INSERT INTO commande (idcommande, date_commande, client_idclient, description_commande, statut_commande) VALUES (?, ?, ?, ?, ?)',
                      [currentCommandeId, currentDate, clientId, 'Some description', 'enattente']
                  );
                return currentCommandeId;
            }
        }
    } catch (error) {
        console.error("Error in getOrCreateCommande:", error);
        throw error;
    }
};

const AddtoCart = async (req, res) => {
    try {
        const { produitId, quantite } = req.body;
        if (!produitId || !quantite || typeof produitId !== 'number' || typeof quantite !== 'number') {
            return res.status(400).json({ message: 'Invalid request' });
        }
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['admin', 'employe', 'client'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        const currentCommandeId = await getOrCreateCommande(authResult.decode.id);
        if (currentCommandeId) {
            await db.query(
                'INSERT INTO ligne_de_commande (produit_idproduit, quantite_produit, commande_idcommande) VALUES (?, ?, ?)',
                [produitId, quantite, currentCommandeId]
            );
            console.log("After query execution");
            res.json({ message: "Product added to cart successfully" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getProductsInCart = async (req, res) => {
    try {        

        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['client'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        let client_idclient;
        if (authResult.decode.id ) {
            console.log("Client ID found in token:", authResult.decode.id);
            client_idclient = authResult.decode.id;
        } else {
            console.error("Client ID not found in token");
            return res.status(401).json({ message: "Client ID not found in token" });
        }  
      
        
        const cartProducts = await db.query(
            'SELECT p.* FROM produit p JOIN ligne_de_commande lc ON p.idproduit = lc.produit_idproduit WHERE lc.client_idclient = ? AND lc.commande_idcommande = ?',
            [client_idclient, client_command_id] // Add client_command_id to filter products based on the command associated with the client
        );
        

        res.json(cartProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getProductsInCart, AddtoCart };
