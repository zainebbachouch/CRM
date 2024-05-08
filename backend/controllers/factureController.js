const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ');
const { getTotalAmountAndDeliveryMethod, checkExistingInvoice } = require('./commandsContoller')

const { saveToHistory } = require('./callback')

const getInvoiceDetailsByCommandId = async (req, res) => {
    try {

        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }


        if (!['admin', 'employe'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { CommandId } = req.params;
        console.log('getid', CommandId)
        const InvoiceDetailsByCommandId = await new Promise((resolve, reject) => {
            const sqlQuery = `
                SELECT f.*, c.*
                FROM facture f
                INNER JOIN commande c ON f.idcommande = c.idcommande
                WHERE c.idcommande = ?
            `;

            db.query(sqlQuery, [CommandId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        const details = InvoiceDetailsByCommandId;

        res.json({ InvoiceDetailsByCommandId: details });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getAllFactures = async (req, res) => {
    const authResult = await isAuthorize(req, res);
    if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!['admin', 'employe'].includes(authResult.decode.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    const sqlQuery = 'SELECT * FROM facture';

    db.query(sqlQuery, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        res.json(result);
    });
};
/*
const createInvoice = async (req, res) => {
    try {
        const {
            date_facture,
            etat_facture,
            statut_paiement_facture,            
            methode_paiment_facture,
            date_echeance,
            idcommande
        } = req.body;

        // Récupérer le montant total de la commande depuis la table commande
        const totalAmountCommande = await getTotalAmountCommande(idcommande);

        // Insertion de la facture avec les détails fournis dans le corps de la requête
        const result = await db.query(
            'INSERT INTO facture (date_facture, etat_facture, statut_paiement_facture, montant_total_facture, methode_paiment_facture, date_echeance, idcommande) VALUES (NOW(), ?, ?, ?, ?, ?, ?)',
            [date_facture, etat_facture, statut_paiement_facture, totalAmountCommande, methode_paiment_facture, date_echeance, idcommande]
        );

        res.status(201).json({ message: "Facture créée avec succès", result });
    } catch (error) {
        console.error("Erreur lors de la création de la facture:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};
*/

const createInvoice = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!['admin', 'employe'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const {
            date_facture,
            etat_facture,
            statut_paiement_facture,
            methode_paiment_facture,
            date_echeance,
            idcommande
        } = req.body;

        const existingInvoice = await checkExistingInvoice(idcommande);
        const { montant_total_commande, metho_delivraison_commande } = await getTotalAmountAndDeliveryMethod(idcommande);

        if (existingInvoice) {
            const result = await db.query(
                'UPDATE facture SET date_facture = NOW(), etat_facture = ?, statut_paiement_facture = ?, montant_total_facture = ?, methode_paiment_facture = ?, date_echeance = ?, mode_livraison_facture = ? WHERE idcommande = ?',
                [etat_facture, statut_paiement_facture, montant_total_commande, methode_paiment_facture, new Date(date_echeance), metho_delivraison_commande, idcommande]
            );
            const userId = authResult.decode.id;
            console.log('qui connecte', userId);
            const userRole = authResult.decode.role;
            saveToHistory('Statut de la facture created ', userId, userRole);
            res.status(200).json({ message: "Facture mise à jour avec succès", affectedRows: result.affectedRows });

        } else {
            res.status(404).json({ message: "Facture non trouvée pour cette commande" });
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la facture:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const deleteInvoiceByCommandId = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!['admin', 'employe'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { idcommande } = req.params;

        const deleteResult = await db.query(
            'DELETE FROM facture WHERE idcommande = ?',
            [idcommande]
        );

        const updateResult = await db.query(
            'UPDATE commande SET statut_commande = ? WHERE idcommande = ?',
            ['livré', idcommande]
        );

        const userId = authResult.decode.id;
        console.log('qui connecte', userId);
        const userRole = authResult.decode.role;
        saveToHistory('Statut de la facture supprimee', userId, userRole); // Assuming always admin when deleting invoice

        res.json({ message: "facture supprimee successfully" });

    } catch (error) {
        console.error("Erreur lors de la suppression de la facture:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};



///question ????
const getInvoiceDetailsById = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!['admin', 'employe'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { commandId, invoiceId } = req.params;

        const InvoiceDetailsById = await new Promise((resolve, reject) => {
            const sqlQuery = `
                SELECT f.*, c.*
                FROM facture f
                INNER JOIN commande c ON f.idcommande = c.idcommande
                WHERE f.idfacture = ? OR c.idcommande = ?
            `;

            db.query(sqlQuery, [invoiceId, commandId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.json({ InvoiceDetailsById });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getInvoiceDetailsByCommandId, getAllFactures, createInvoice, deleteInvoiceByCommandId };
