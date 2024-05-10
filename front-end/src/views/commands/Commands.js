import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
//import { useLocation } from 'react-router-dom';
import CompleteCommand from '../../components/sidenav/completeCommand';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { Link } from 'react-router-dom';

function Commands() {
  const [loading, setLoading] = useState(true);
  const [commands, setCommands] = useState([]);
  const [commandData, setCommandData] = useState(null);
  const [error, setError] = useState(null);

 // const location = useLocation();
  //const searchParams = new URLSearchParams(location.search);
 // const id = searchParams.get('idcommand');
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  const config = useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === 'client') {
          const currentCommandeId = localStorage.getItem('currentCommandeId');
          if (currentCommandeId) {
            const response = await axios.post('http://127.0.0.1:5000/api/completeCommand', { currentCommandeId }, config);
            setCommandData(response.data);
          }
        } else {
          const response = await axios.get('http://127.0.0.1:5000/api/getAllCommands', config);
          setCommands(response.data);
        }
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [role, config]);

  /*const handleInputChange = (event, index) => {
    const { name, value } = event.target;
    setCommands((prevCommands) => {
      const updatedCommands = [...prevCommands];
      updatedCommands[index][name] = value;
      return updatedCommands;
    });
  };*/
  const handleInputChange = (event, index) => {
    const { name, value } = event.target;
    setCommands((prevCommands) => {
      const updatedCommands = [...prevCommands]; // Créez une copie de l'array de commandes
      updatedCommands[index] = { ...updatedCommands[index], [name]: value }; // Mettez à jour la commande spécifique avec la nouvelle valeur
      return updatedCommands; // Réaffectez la copie mise à jour à l'état
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
    <div>
      {loading? (
        <div>Loading...</div>
      ) : error? (
        <div>Error: {error}</div>
      ) : commandData? (
        <CompleteCommand commandData={commandData} />
      ) : (
        <div className="d-flex">
          <SideBar />
          <div className="container-fluid flex-column">
            <TopBar />
            <div className="container-fluid p-2">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Total Amount</th>
                    <th>Address</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th>Delivery Date</th>
                    <th>Delivery Method</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                    {commands.map((command, key) => (
                    <tr key={key}>
                        <td>{command.idcommande}</td>
                        <td>{command.description_commande}</td>
                        <td>{command.date_commande}</td>
                        <td>{command.montant_total_commande}</td>
                        <td>{command.adresselivraison_commande}</td>
                        <td>{command.modepaiement_commande}</td>
                        <td>
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
                        </td>
                        <td>{command.date_livraison_commande}</td>
                        <td>{command.metho_delivraison_commande}</td>
                        <td>
                            <button
                                className="btn btn-primary mr-2"
                                onClick={() => updateCommandStatus(command.idcommande, command.statut_commande)}
                                >
                                Update
                            </button>
                            <button className="btn btn-primary p-0">
                                <Link to={`/commands/${command.idcommande}`} className="text-white btn-link">
                                Show Details
                                </Link>

                            </button>
                        </td>
                     </tr>  
                        ))}
                 </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Commands;