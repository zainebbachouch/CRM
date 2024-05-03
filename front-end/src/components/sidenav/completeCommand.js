import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './TopNav.css';
import SideBar from '../sidebar/SideBar';
import TopBar from "./TopNav";

function CompleteCommand(props) {
    const { commandData} = props; // Destructure commandData and id props
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('idcommand');
    const [command, setCommand] = useState(commandData);// Define commandData state

    const commandId = localStorage.getItem('commandId');

    useEffect(() => {
        const fetchCommandDetails = async (currentCommandeId) => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const response = await axios.post('http://127.0.0.1:5000/api/completeCommand', { currentCommandeId }, config);
               // console.log('Command fetched:', response.data); // Log the fetched command data
               setCommand(response.data);
               setLoading(false);
            } catch (error) {
                console.error('Error fetching command details:', error);
                setLoading(false);
            }
        };

        if (id || commandId) {
            fetchCommandDetails(id);
        } else {
            setLoading(false);
        }
    }, [id,commandId, commandData]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        console.log(event.target.value)
        setCommand((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handlePassCommand = async () => {
        setLoading(true);
       // console.log(command)

       try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            //  const trimmedModePaiementCommande = command.modepaiement_commande.slice(0, 19); // Trim the value to 19 characters
            //  console.log("Length of modepaiement_commande:", command.modepaiement_commande.length);

            await axios.put(`http://127.0.0.1:5000/api/passCommand`, {
                currentCommandeId: id,
                description_commande: command.description_commande,
                adresselivraison_commande: command.adresselivraison_commande,
                modepaiement_commande: command.modepaiement_commande, 
                date_livraison_commande: command.date_livraison_commande,
                metho_delivraison_commande: command.metho_delivraison_commande,
                montant_total_commande: command.montantTotalCommande,
            }, config);

            alert("Command passed successfully!");
        } catch (error) {
            console.error("Error passing command:", error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="d-flex">
        {/* Sidebar component */}
        <SideBar />

        <div className="container-fluid flex-column">
            {/* TopBar component */}
            <TopBar /> 

            <div className="container-fluid p-2">
                {loading ? (
                    <div>Loading...</div>
                ) : command ? (
                    <form>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="idcommande">Command ID:</label>
                                    <span className="form-control" id="idcommande" name="idcommande">{command.idcommande}</span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="date_commande">Date:</label>
                                    <span className="form-control" id="date_commande">{command.date_commande}</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description_commande">Description:</label>
                            <input type="text" className="form-control" id="description_commande" name="description_commande" value={command.description_commande || ''} onChange={handleInputChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="montant_total_commande">Total Amount:</label>
                            <span className="form-control" id="montant_total_commande">{command.montantTotalCommande}</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="adresselivraison_commande">Address:</label>
                            <input type="text" className="form-control" id="adresselivraison_commande" name="adresselivraison_commande" value={command.adresselivraison_commande || ''} onChange={handleInputChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="modepaiement_commande">Payment Method:</label>
                            <select className="form-control" id="modepaiement_commande" name="modepaiement_commande" onChange={handleInputChange}>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Debit Card">Debit Card</option>
                                <option value="PayPal">PayPal</option>
                                <option value="Cash on Delivery">Cash on Delivery</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="statut_commande">Status:</label>
                            <span className="form-control" id="statut_commande">{command.statut_commande}</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="date_livraison_commande">Delivery Date:</label>
                            <input type="date" className="form-control" id="date_livraison_commande" name="date_livraison_commande" value={command.date_livraison_commande || ''} onChange={handleInputChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="metho_delivraison_commande">Delivery Method:</label>
                            <select className="form-control" id="metho_delivraison_commande" name="metho_delivraison_commande" value={command.metho_delivraison_commande || ''} onChange={handleInputChange}>
                                <option value="domicile">Domicile</option>
                                <option value="surplace">Sur Place</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="client_idclient">Client ID:</label>
                            <span className="form-control" id="client_idclient">{command.client_idclient}</span>
                        </div>

                        <button className="btn btn-primary" onClick={handlePassCommand}>Pass Command</button>
                    </form>
                ) : (
                    <div>Command details not found.</div>
                )}
            </div>
        </div>
    </div>
);
}

export default CompleteCommand;
