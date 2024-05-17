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


        if (!['admin', 'employe','client'].includes(authResult.decode.role)) {
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
            // Wrap the query in a promise for asynchronous handling
               await new Promise((resolve, reject) => {
                  db.query(
                      'UPDATE facture SET date_facture = NOW(), etat_facture = ?, statut_paiement_facture = ?, montant_total_facture = ?, methode_paiment_facture = ?, date_echeance = ?, mode_livraison_facture = ? WHERE idcommande = ?',
                      [etat_facture, statut_paiement_facture, montant_total_commande, methode_paiment_facture, new Date(date_echeance), metho_delivraison_commande, idcommande],
                      (err, result) => {
                          if (err) {
                              console.error(err);
                              reject(err); // Reject the promise with the error
                          } else {
                              resolve(result); // Resolve the promise with the result
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
    if (!filePath)
     { 
return res.status(400).json({ message: "File path is missing" }); } 
const sanitizedFilePath = path.posix.join( path.posix.dirname(filePath),path.posix.basename(filePath) );
       res.setHeader("Access-Control-Allow-Origin", "*");
       res.setHeader("Access-Control-Allow-Methods", "GET"); 
       res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        try { res.sendFile(path.resolve(sanitizedFilePath)); } 
        catch (error) 
        { console.error("Error fetching PDF:", error); 
        res.status(500).json({ message: "Error fetching PDF" }); } };


module.exports = { getInvoiceDetailsByCommandId, getAllFactures, createInvoice, 
    deleteInvoiceByCommandId ,creatPDFInvoice,fetchPDFInvoice,getFactureOfClientAuthorized};
