const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ');
const { getTotalAmountAndDeliveryMethod, checkExistingInvoice } = require('./commandsContoller')

const { saveToHistory } = require('./callback')
const fs = require('fs');

const path = require('path');

const pdf = require('html-pdf');

const pdfTemplate = require('../document/index');



const getFactureOfClientAuthorized = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['client'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        if (!authResult.decode.id) {
            console.error("Client ID not found in token");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const client_idclient = authResult.decode.id;

        const facturesClient = await new Promise((resolve, reject) => {
            const sqlQuery = `
                SELECT f.*, c.*
                FROM facture f
                INNER JOIN commande c ON f.idcommande = c.idcommande 
                WHERE c.client_idclient  = ?
            `;

            db.query(sqlQuery, [client_idclient], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.json({ facturesClient });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};







const getInvoiceDetailsByCommandId = async (req, res) => {
    try {

        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }


        if (!['admin', 'employe', 'client'].includes(authResult.decode.role)) {
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

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10
    const offset = (page - 1) * limit;

    // Query to get the total number of records
    const countQuery = 'SELECT COUNT(*) AS total FROM facture';

    db.query(countQuery, (countErr, countResult) => {
        if (countErr) {
            console.error(countErr);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Query to get the paginated records
        const sqlQuery = 'SELECT * FROM facture LIMIT ? OFFSET ?';
        db.query(sqlQuery, [limit, offset], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            res.json({
                factures: result,
                total,
                totalPages,
                currentPage: page
            });
        });
    });
};

const searchFactures = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!['admin', 'employe'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const {
            etat_facture,
            methode_paiment_facture,
            statut_paiement_facture,
            date_facture_start,
            date_facture_end,
            date_echeance_start,
            date_echeance_end,
            page = 1,
            limit = 10
        } = req.query;

        const offset = (page - 1) * limit;

        let conditions = [];
        let values = [];

        if (etat_facture) {
            conditions.push('etat_facture = ?');
            values.push(etat_facture);
        }
        if (methode_paiment_facture) {
            conditions.push('methode_paiment_facture = ?');
            values.push(methode_paiment_facture);
        }
        if (statut_paiement_facture) {
            conditions.push('statut_paiement_facture = ?');
            values.push(statut_paiement_facture);
        }
        if (date_facture_start && date_facture_end) {
            conditions.push('date_facture BETWEEN ? AND ?');
            values.push(date_facture_start, date_facture_end);
        }
        if (date_echeance_start && date_echeance_end) {
            conditions.push('date_echeance BETWEEN ? AND ?');
            values.push(date_echeance_start, date_echeance_end);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        console.log('SQL WHERE CLAUSE:', whereClause); // Debugging line
        console.log('SQL VALUES:', values); // Debugging line

        const totalQuery = `SELECT COUNT(*) AS total FROM facture ${whereClause}`;
        const totalResult = await new Promise((resolve, reject) => {
            db.query(totalQuery, values, (err, result) => {
                if (err) return reject(err);
                resolve(result[0].total);
            });
        });

        const searchQuery = `SELECT * FROM facture ${whereClause} LIMIT ? OFFSET ?`;
        values.push(parseInt(limit), parseInt(offset));
        const searchResult = await new Promise((resolve, reject) => {
            db.query(searchQuery, values, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        res.json({
            factures: searchResult,
            total: totalResult,
            totalPages: Math.ceil(totalResult / limit),
            currentPage: parseInt(page)
        });
        console.log('date_echeance_start:', date_echeance_start);
        console.log('date_echeance_end:', date_echeance_end);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while searching invoices' });
    }
};

const createInvoice = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!['admin', 'employe'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        console.log(req.body)
        //sql autorisation select column descrption --> add automatique 
        // try 
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

            await new Promise((resolve, reject) => {
                db.query(
                    'UPDATE facture SET date_facture = NOW(), etat_facture = ?, statut_paiement_facture = ?, montant_total_facture = ?, methode_paiment_facture = ?, date_echeance = ?, mode_livraison_facture = ? WHERE idcommande = ?',
                    [etat_facture, statut_paiement_facture, montant_total_commande, methode_paiment_facture, new Date(date_echeance), metho_delivraison_commande, idcommande],
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


            const userId = authResult.decode.id;
            console.log('Connected user:', userId);
            const userRole = authResult.decode.role;
            saveToHistory('Invoice status created', userId, userRole);
            res.status(200).json({ message: "Invoice updated successfully" });
        } else {
            res.status(404).json({ message: "Invoice not found for this order" });
        }
    } catch (error) {
        console.error("Error updating invoice:", error);
        res.status(500).json({ message: "Internal server error" });
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

        // Delete the invoice
        await db.query(
            'DELETE FROM facture WHERE idcommande = ?',
            [idcommande]
        );

        // Update the order status
        await db.query(
            'UPDATE commande SET statut_commande = ? WHERE idcommande = ?',
            ['livré', idcommande]
        );

        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;
        saveToHistory('Statut de la facture supprimee', userId, userRole);

        res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};





const creatPDFInvoice = async (req, res) => {
    try {
        // Generate PDF using pdfTemplate and the data sent from the client
        const createPDF = await new Promise((resolve, reject) => {
            pdf.create(pdfTemplate(req.body), {}).toBuffer((err, buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(buffer);
                }
            });
        });

        // Save the PDF file to a specific directory on the server
        const filePath = `${__dirname}/../pdfs/invoice.pdf`; // Specify the desired directory
        fs.writeFile(filePath, createPDF, (err) => {
            if (err) {
                throw err;
            }
            console.log('PDF file saved successfully:', filePath);



            res.json({ filePath }); // Send the file path in the response
        });


    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ message: "Error generating PDF" });
    }
};


const fetchPDFInvoice = async (req, res) => {
    const filePath = req.query.filePath;
    if (!filePath) {
        return res.status(400).json({ message: "File path is missing" });
    }
    const sanitizedFilePath = path.posix.join(path.posix.dirname(filePath), path.posix.basename(filePath));
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    try {
        res.sendFile(path.resolve(sanitizedFilePath));

    }
    catch (error) {
        console.error("Error fetching PDF:", error);
        res.status(500).json({ message: "Error fetching PDF" });
    }
};


module.exports = {
    searchFactures,
    getInvoiceDetailsByCommandId, getAllFactures, createInvoice,
    deleteInvoiceByCommandId, creatPDFInvoice, fetchPDFInvoice, getFactureOfClientAuthorized
};
