import React, { useState, useEffect ,useMemo} from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';

function CommandDetails() {
    const { id } = useParams();
    const [commands, setCommands] = useState([]);
    //const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    // Define config outside of useEffect to ensure it's memoized correctly
    const config = useMemo(() => ({
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }), [token]);
    

    useEffect(() => {
        async function fetchCommandById() {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/api/getCommandsByCommandId/${id}`, config);
                setCommands(response.data);
            } catch (err) {
                console.error('Error fetching CommandId:', err);
            }
        }
        fetchCommandById();
    }, [id, config]); // Include config in the dependency array

    const handleInputChange = (event, index) => {
        const { name, value } = event.target;
        setCommands(prevCommands => {
            const updatedCommands = [...prevCommands];
            updatedCommands[index] = { ...updatedCommands[index], [name]: value };
            return updatedCommands;
        });
    };

    const updateCommandStatus = async (idcommande, newStatus) => {
        try {
            const response = await axios.put('http://127.0.0.1:5000/api/updateStatus', { idcommande, newStatus }, config);
            console.log('Command status updated successfully:', response.data);
        } catch (error) {
            console.error('Error updating command status:', error);
        }
    };

    return (
        <div className="d-flex">
            <SideBar />
            <div className="container-fluid flex-column">
                <TopBar />
                <div className="container-fluid p-2">
                    {commands.map((command, key) => (
                        <div key={key}>
                            <h2>{command.description_commande}</h2>
                            <p>
                                ID: {command.idcommande}<br />
                                Date: {command.date_commande}<br />
                                Total Amount: {command.montant_total_commande}<br />
                                Address: {command.adresselivraison_commande}<br />
                                Payment Method: {command.modepaiement_commande}<br />
                                Status: 
                                <select
                                    className="form-control"
                                    id="statut_commande"
                                    name="statut_commande"
                                    onChange={(event) => handleInputChange(event, key)}
                                >
                                    <option value="enattente">enattente</option>
                                    <option value="traitement">traitement</option>
                                    <option value="expédié">expédié</option>
                                    <option value="livré">livré</option>
                                </select>
                                <br />
                                Delivery Date: {command.date_livraison_commande}<br />
                                Delivery Method: {command.metho_delivraison_commande}<br />
                                <button
                                    className="btn btn-primary mr-2"
                                    onClick={() => updateCommandStatus(command.idcommande, command.statut_commande)}
                                >
                                    Update
                                </button>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CommandDetails;
