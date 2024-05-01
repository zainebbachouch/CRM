import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function CompleteCommand() {
    const [command, setCommand] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('idcommand');

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
                setCommand(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching command details:', error);
                setLoading(false);
            }
        };

        if (id) {
            fetchCommandDetails(id);
        } else {
            setLoading(false);
        }
    }, [id, location.search]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCommand((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handlePassCommand = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const trimmedModePaiementCommande = command.modepaiement_commande.slice(0, 19); // Trim the value to 19 characters
            console.log("Length of modepaiement_commande:", command.modepaiement_commande.length);

            await axios.put(`http://127.0.0.1:5000/api/passCommand`, {
                currentCommandeId: id,
                description_commande: command.description_commande,
                adresselivraison_commande: command.adresselivraison_commande,
                modepaiement_commande: trimmedModePaiementCommande, // Use the trimmed value
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
        <div>
            {loading ? (
                <div>Loading...</div>
            ) : command ? (
                <form>
                    <div>
                        <label htmlFor="idcommande">Command ID:</label>
                        <span id="idcommande" name="idcommande">{command.idcommande}</span>
                    </div>
                    <div>
                        <label htmlFor="date_commande">Date:</label>
                        <span id="date_commande">{command.date_commande} </span>
                    </div>
                    <div>
                        <label htmlFor="description_commande">Description:</label>
                        <input type="text" id="description_commande" name="description_commande" value={command.description_commande || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label htmlFor="montant_total_commande">Total Amount:</label>
                        <span id="montant_total_commande">{command.montantTotalCommande}</span>
                    </div>
                    <div>
                        <label htmlFor="adresselivraison_commande">Delivery Address:</label>
                        <input type="text" id="adresselivraison_commande" name="adresselivraison_commande" value={command.adresselivraison_commande || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label htmlFor="modepaiement_commande">Payment Method:</label>
                        <select id="modepaiement_commande" name="modepaiement_commande" value={command.modepaiement_commande || ''} onChange={handleInputChange}>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Debit Card">Debit Card</option>
                            <option value="PayPal">PayPal</option>
                            <option value="Cash on Delivery">Cash on Delivery</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="statut_commande">Status:</label>
                        <span id="statut_commande">{command.statut_commande}</span>
                    </div>
                    <div>
                        <label htmlFor="date_livraison_commande">Delivery Date:</label>
                        <input type="date" id="date_livraison_commande" name="date_livraison_commande" value={command.date_livraison_commande || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label htmlFor="metho_delivraison_commande">Delivery Method:</label>
                        <select id="metho_delivraison_commande" name="metho_delivraison_commande" value={command.metho_delivraison_commande || ''} onChange={handleInputChange}>
                            <option value="domicile">Domicile</option>
                            <option value="surplace">Sur Place</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="client_idclient">Client ID:</label>
                        <span id="client_idclient">{command.client_idclient}</span>
                    </div>
                    <button onClick={handlePassCommand}>pass Command</button>
                </form>
            ) : (
                <div>Command details not found.</div>
            )}
        </div>
    );
}

export default CompleteCommand;
