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
      const existingCommand = await new Promise((resolve, reject) => {
        db.query("SELECT idcommande FROM commande WHERE client_idclient =? AND statut_commande='enattente'", [clientId], (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          if (result.length === 0) {
            console.log("No commande found for this client");
            resolve(null);
          } else {
            console.log("Existing commande found for this client:", result[0].idcommande);
            resolve(result[0].idcommande);
          }
        });
      });
      if (existingCommand) {
        return existingCommand;
      } else {
        const currentCommandeId = await generateUniqueCommandeId();
        if (currentCommandeId) {
          const currentDate = new Date().toISOString();
          await db.query(
            'INSERT INTO commande (idcommande, date_commande, client_idclient, description_commande, statut_commande) VALUES (?, ?, ?, "Some description", ?)',
            [currentCommandeId, currentDate, clientId, 'enattente']
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
            const existingProduct = await new Promise((resolve, reject) => {
                db.query(
                    'SELECT * FROM ligne_de_commande WHERE produit_idproduit = ? AND commande_idcommande = ?',
                    [produitId, currentCommandeId],
                    (err, result) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    }
                );
            });
            
            if (existingProduct.length > 0) {
                // Update the quantity of the existing product
                const newQuantite = existingProduct[0].quantite_produit + quantite;
                await db.query(
                    'UPDATE ligne_de_commande SET quantite_produit = ? WHERE produit_idproduit = ? AND commande_idcommande = ?',
                    [newQuantite, produitId, currentCommandeId]
                );
            } else {
                // Insert a new product into the cart
                await db.query(
                    'INSERT INTO ligne_de_commande (produit_idproduit, quantite_produit, commande_idcommande) VALUES (?, ?, ?)',
                    [produitId, quantite, currentCommandeId]
                );
            }
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
        if (authResult.decode.id) {
            console.log("Client ID found in token :", authResult.decode.id);
            client_idclient = authResult.decode.id;
        } else {
            console.error("Client ID not found in token");
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.log("Client ID:", client_idclient);

        // Test query to retrieve all products
        const allProducts = await new Promise((resolve, reject) => {
            const query = 'SELECT * FROM produit';
            db.query(query, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        console.log("All products:", allProducts);

        // Use the SQL query to retrieve products in the cart
        const cartProductsResult = await new Promise((resolve, reject) => {
            const query = "SELECT p.*, lc.quantite_produit FROM produit p JOIN ligne_de_commande lc ON p.idproduit = lc.produit_idproduit JOIN commande c ON lc.commande_idcommande = c.idcommande WHERE c.client_idclient = ?";
            db.query(query, [client_idclient], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        console.log("Cart products result:", cartProductsResult);

        // Extract the rows from the query result
        const cartProducts = cartProductsResult;

        // Log the cartProducts array
        console.log("Cart products:", cartProducts);

        // Send only the necessary data as the response
        res.json({  cartProductsResult: cartProducts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getProductsInCart, AddtoCart };