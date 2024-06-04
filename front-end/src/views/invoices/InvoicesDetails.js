import React, { useState, useEffect, useMemo , useContext} from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { saveAs } from 'file-saver';
import { UserPermissionsContext } from '../context/UserPermissionsPage'; // Correction de l'import



function InvoicesDetails() {
    const { id } = useParams();
    const [facturesData, setFacturesData] = useState({});
    const [customers, setCustomers] = useState([]);
    const role = localStorage.getItem('role');

    const token = localStorage.getItem("token");



    const isAdmin = localStorage.getItem('role') === 'admin';
    const userPermissions = useContext(UserPermissionsContext);

    const config = useMemo(() => {
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }, [token]);



    const createAndDownloadPdf = () => {
        axios.post('http://127.0.0.1:5000/api/createPDFInvoice', { facturesData, customers })
            .then((response) => {
                const filePath = response.data.filePath; // Get the file path from the response
                if (!filePath) {
                    throw new Error("File path is missing in the response");
                }
                axios.get('http://127.0.0.1:5000/api/fetchPDFInvoice', {
                    params: { filePath }, // Send the file path as a query parameter
                    responseType: 'blob'
                }).then((res) => {
                    const pdfBlob = new Blob([res.data], { type: 'application/pdf' });
                    saveAs(pdfBlob, 'invoice.pdf');
                }).catch((error) => {
                    console.error("Error downloading PDF:", error);
                    alert("Failed to download the invoice. Please try again later.");
                });
            })
            .catch((error) => {
                console.error("Error creating and downloading PDF:", error);
                alert("Failed to create and download the invoice. Please correct any issues before trying again.");
            });
    };


    useEffect(() => {
        const fetchInvoiceAndCustomerData = async () => {
            try {
                // Fetch invoice details
                const invoiceResponse = await axios.get(
                    `http://127.0.0.1:5000/api/getInvoiceDetailsByCommandId/${id}`,
                    config
                );
                setFacturesData(invoiceResponse.data.InvoiceDetailsByCommandId[0]);

                // Fetch customer information
                const customerResponse = await axios.get(
                    `http://127.0.0.1:5000/api/getCustomerByIDCommand/${id}`,
                    config
                );
                setCustomers(customerResponse.data); // Assuming the response contains customer information directly
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchInvoiceAndCustomerData();
    }, [id, config]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFacturesData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const createInvoice = async (event) => {
        console.log("Starting createInvoice()");
        console.log(config)
        event.preventDefault()
        try {
            console.log("Request payload:", facturesData);
            const response = await axios.put("http://127.0.0.1:5000/api/createInvoice", {
                date_facture: facturesData.date_facture,
                etat_facture: facturesData.etat_facture,
                statut_paiement_facture: facturesData.statut_paiement_facture,
                methode_paiment_facture: facturesData.methode_paiment_facture,
                date_echeance: facturesData.date_echeance,
                idcommande: id
            }, config);
            console.log("Response:", response);
            alert("Facture status updated successfully:");
        }
        catch (error) {
            console.error("Error updating facture status:", error);
        }
        console.log("Ending createInvoice()");
    };


    return (
        <div className="d-flex">
            <SideBar />
            <div className="container-fluid flex-column">
                <TopBar />
                <div className="container-fluid p-2">
                    <div>
                        {facturesData && (
                            <div className="d-flex flex-wrap" id="invoice-details">
                                <div className="mr-4" style={{ backgroundColor: "red" }}>
                                    <h2>Command {facturesData.description_commande}</h2>
                                    <p>
                                        ID: {facturesData.idcommande}
                                        <br />
                                        Date: {facturesData.date_commande}
                                        <br />
                                        Total Amount: {facturesData.montant_total_commande}
                                        <br />
                                        Address: {facturesData.adresselivraison_commande}
                                        <br />
                                        Payment Method: {facturesData.modepaiement_commande}<br />
                                        Status: {facturesData.statut_commande}
                                        <br />
                                        Delivery Date: {facturesData.date_livraison_commande}
                                        <br />
                                        Delivery Method: {facturesData.metho_delivraison_commande}
                                        <br />
                                    </p>
                                    <div style={{ backgroundColor: "yellow" }}>
                                        <h2>Customer Information</h2>
                                        {customers &&
                                            customers.map((customer, key) => (
                                                <p key={key}>
                                                    ID: {customer.idclient}
                                                    <br />
                                                    Name: {customer.nom_client} {customer.prenom_client}
                                                    <br />
                                                    Phone: {customer.telephone_client}
                                                    <br />
                                                    Address: {customer.adresse_client}
                                                    <br />
                                                    Email: {customer.email_client}
                                                    <br />
                                                    Genre: {customer.genre_client}
                                                    <br />
                                                    Date of Birth: {customer.datede_naissance_client}
                                                </p>
                                            ))}
                                    </div>
                                </div>
                                {role !== 'client' ? (
                                <form style={{ backgroundColor: "grey" }}>
                                    <div className="row">
                                        <div className="form-group">
                                            <label htmlFor="idfacture">Invoice ID:</label>
                                            <span className="form-control" id="idfacture" name="idfacture">
                                                {facturesData.idfacture}
                                            </span>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="date_facture">Invoice Date:</label>
                                            {/* update to date and add name="" */}
                                            <span className="form-control" id="date_facture" name="date_facture">
                                                {facturesData.date_facture}
                                            </span>

                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="etat_facture">Invoice Status:</label>
                                            {/* Update to select and add name="etat_facture" */}
                                            <select
                                                className="form-control"
                                                id="etat_facture"
                                                name="etat_facture"
                                                
                                                value={facturesData.etat_facture || ""}
                                                onChange={handleInputChange}
                                            >
                                                <option value="enAttente">En Attente</option>
                                                <option value="payee">Payée</option>
                                                <option value="enRetard">En Retard</option>
                                                <option value="annulee">Annulée</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="montant_total_facture">
                                                Total Amount:
                                            </label>
                                            <span className="form-control" id="montant_total_facture" name="montant_total_facture">
                                                {facturesData.montant_total_facture}
                                            </span>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="methode_paiment_facture">
                                                Payment Method:
                                            </label>
                                            <select
                                                className="form-control"
                                                id="methode_paiment_facture"
                                                name="methode_paiment_facture"
                                                value={facturesData.methode_paiment_facture || ""}
                                                onChange={handleInputChange}
                                            >
                                                <option value="Carte de crédit">
                                                    Carte de crédit
                                                </option>
                                                <option value="Virement bancaire">
                                                    Virement bancaire
                                                </option>
                                                <option value="Autre">Autre</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="date_echeance">Due Date:</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="date_echeance"
                                                name="date_echeance"
                                                value={facturesData.date_echeance || ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="statut_paiement_facture">
                                                Payment Status:
                                            </label>
                                            <select
                                                className="form-control"
                                                id="statut_paiement_facture"
                                                name="statut_paiement_facture"
                                                value={facturesData.statut_paiement_facture || ""}
                                                onChange={handleInputChange}
                                            >
                                                <option value="paye">Payé</option>
                                                <option value="non_paye">Non Payé</option>
                                            </select>
                                        </div>
                                        {(isAdmin || (userPermissions && userPermissions.updateFacture === 1)) && ( // Add parentheses here

                                        <button
                                            className="btn btn-primary mr-2" /*

                                            not exit type button execute auto post  2 solution if type or enot exit type then event */
                                            onClick={event => { createInvoice(event) }}
                                        >
                                            Create invoice
                                        </button>
                                        )}
                                        <button className="btn btn-success" type="button" onClick={createAndDownloadPdf}>createAndDownloadPdf </button>

                                    </div>
                                </form>
                                 ) :(
                                    facturesData && (
                                 <div>
                                 <h2>Invoice Details</h2>
                                 <p>
                                     ID: {facturesData.idfacture}<br />
                                     Date: {facturesData.date_facture}<br />
                                     Status: {facturesData.etat_facture}<br />
                                     Total Amount: {facturesData.montant_total_facture}<br />
                                     Payment Method: {facturesData.methode_paiment_facture}<br />
                                     Due Date: {facturesData.date_echeance}<br />
                                     Payment Status: {facturesData.statut_paiement_facture}<br />
                                 </p>
                                 <button className="btn btn-success" type="button" onClick={createAndDownloadPdf}>Download Invoice</button>
                                 </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


export default InvoicesDetails;