module.exports = ({ facturesData, customers }) => {
    const today = new Date();
    return `
        <!doctype html>
        <html>
           <head>
              <meta charset="utf-8">
              <title>PDF Result Template</title>
              <style>
                 /* Your CSS styles here */
              </style>
           </head>
           <body>
              <div class="invoice-box">
                 <!-- Invoice details -->
                 <h2>Command {facturesData.description_commande}</h2>
                 <p>
                     ID: ${facturesData.idcommande}
                     <br />
                     Date: ${facturesData.date_commande}
                     <br />
                     Total Amount: ${facturesData.montant_total_commande}
                     <br />
                     Address: ${facturesData.adresselivraison_commande}
                     <br />
                     Payment Method: ${facturesData.modepaiement_commande}<br />
                     Status: ${facturesData.statut_commande}
                     <br />
                     Delivery Date: ${facturesData.date_livraison_commande}
                     <br />
                     Delivery Method: ${facturesData.metho_delivraison_commande}
                     <br />
                 </p>
                 <h2>Invoice Details</h2>
                 <p>
                    ID: ${facturesData.idfacture}<br>
                    Date: ${facturesData.date_facture}<br>
                    Status: ${facturesData.etat_facture}<br>
                    Total Amount: ${facturesData.montant_total_facture}<br>
                    Payment Method: ${facturesData.methode_paiment_facture}<br>
                    Due Date: ${facturesData.date_echeance}<br>
                    Payment Status: ${facturesData.statut_paiement_facture}<br>
                 </p>

                 <!-- Customer details -->
                 <h2>Customer Details</h2>
                 ${customers.map(customer => `
                    <p>
                        ID: ${customer.idclient}<br>
                        Name: ${customer.nom_client} ${customer.prenom_client}<br>
                        Phone: ${customer.telephone_client}<br>
                        Address: ${customer.adresse_client}<br>
                        Email: ${customer.email_client}<br>
                        Genre: ${customer.genre_client}<br>
                        Date of Birth: ${customer.datede_naissance_client}<br>
                    </p>
                 `).join('')}

                 <!-- Additional styling and content -->
              </div>
           </body>
        </html>
    `;
};
