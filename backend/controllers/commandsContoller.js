const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ');
const {saveToHistory}=require('./callback')


const getCustomerByIDCommand = async (req, res) => {
    try {
        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        
        // Check role
        if (!['admin', 'employe','client'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const {CommandId} = req.params;
        
        const sqlQuery = 'SELECT client.* FROM commande INNER JOIN client ON commande.client_idclient = client.idclient WHERE commande.idcommande = ?';
        //console.log("Executing SQL query:", sqlQuery);
        console.log("CommandId:::::::::::::::::::::");

        db.query(sqlQuery, [CommandId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "Client information not found for command ID: " + CommandId });
            }

            res.json(result); // Assuming you only need the first result
        });
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving customer information: " + error.message });
    }
};



const getAllCommands = async (req, res) => {
    // Authorization check
    const authResult = await isAuthorize(req, res);
    if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Check role
    if (!['admin', 'employe'].includes(authResult.decode.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    // Construct SQL query
    const sqlQuery = 'SELECT * FROM commande ';

    // Execute SQL query
    db.query(sqlQuery, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        res.json(result);
    });
};

const updateCommandStatus = async (req, res) => {
    // Authorization check
    const authResult = await isAuthorize(req, res);
    if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Check role
    const userRole = authResult.decode.role;
    if (!['admin', 'employe'].includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { idcommande, newStatus } = req.body;

    if (!idcommande || !newStatus) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    if (newStatus === 'expédié') {
        const existingInvoice = await checkExistingInvoice(idcommande);
        if (!existingInvoice) {
            try {
                await createInvoice(idcommande);
            } catch (error) {
                console.error("Error creating invoice:", error);
                return res.status(500).json({ message: "Error creating invoice" });
            }
        }
    }

    const validStatus = ['enattente', 'traitement', 'expédié', 'livré'];
    if (!validStatus.includes(newStatus)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    const sqlQuery = 'UPDATE commande SET statut_commande = ? WHERE idcommande = ?';

    db.query(sqlQuery, [newStatus, idcommande], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        res.json({ message: "Command status updated successfully" });
        
        const userId = authResult.decode.id;
        //    const userRole = authResult.decode.role;
        console.log('qui connecte',userId)

        saveToHistory('Statut de la commande mis à jour', userId, userRole);
    });
};





const checkExistingInvoice = async (idcommande) => {
    try {
        const result = await new Promise((resolve, reject) => {
            db.query(
                'SELECT * FROM facture WHERE idcommande = ?',
                [idcommande],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(result.length > 0);
                    }
                }
            );
        });

        return result;
    } catch (error) {
        console.error("Error checking existing invoice:", error);
        throw error;
    }
};


const createInvoice = async (idcommande) => {
    try {
        // Récupérer le montant total de la commande et le mode de livraison depuis la table commande
        const { montant_total_commande, metho_delivraison_commande } = await getTotalAmountAndDeliveryMethod(idcommande);
        
        // Insertion de la facture avec les détails fournis dans le corps de la requête
        await new Promise((resolve, reject) => {
            db.query(
                'INSERT INTO facture (date_facture, etat_facture, statut_paiement_facture, idcommande, montant_total_facture, mode_livraison_facture) VALUES (NOW(), "enAttente", "non_paye", ?, ?, ?)',
                [idcommande, montant_total_commande, metho_delivraison_commande],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        console.log("Facture créée pour l'ID de commande:", idcommande);
                        resolve(result.insertId);
                    }
                }
            );
        });
    } catch (error) {
        console.error("Erreur lors de la création de la facture:", error);
        throw error;
    }
};

const getTotalAmountAndDeliveryMethod = async (idcommande) => {
    try {
        const result = await new Promise((resolve, reject) => {
            db.query(
                'SELECT montant_total_commande, metho_delivraison_commande FROM commande WHERE idcommande = ?',
                [idcommande],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(result[0]);
                    }
                }
            );
        });

        return result;
    } catch (error) {
        console.error("Erreur lors de la récupération du montant total de la commande et du mode de livraison:", error);
        throw error;
    }
};





const getCommandsByClientId = async (req, res) => {
    // Authorization check
    const authResult = await isAuthorize(req, res);
    if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Check role
    if (!['admin', 'employe'].includes(authResult.decode.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { clientId } = req.params;

    // Construct SQL query with JOIN
    const sqlQuery = 'SELECT c.* FROM commande c INNER JOIN client cl ON c.client_idclient = cl.idclient WHERE cl.idclient = ?';

    // Execute SQL query
    db.query(sqlQuery, [clientId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        res.json(result);
    });
};


const getCommandsByCommandId = async (req, res) => {
    // Authorization check
    const authResult = await isAuthorize(req, res);
    if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Check role
    if (!['admin', 'employe'].includes(authResult.decode.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { CommandId } = req.params;

    // Construct SQL query with JOIN
    const sqlQuery = 'SELECT * FROM commande WHERE idcommande = ?';
    // Execute SQL query
    db.query(sqlQuery, [CommandId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        res.json(result);
    });
}
module.exports = {getCustomerByIDCommand, getAllCommands, updateCommandStatus, 
    getCommandsByClientId, getCommandsByCommandId,getTotalAmountAndDeliveryMethod ,checkExistingInvoice}