import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';import axios from 'axios';
//import { useLocation } from 'react-router-dom';
import CompleteCommand from '../../components/sidenav/completeCommand';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { Link } from 'react-router-dom';
import { UserPermissionsContext } from '../context/UserPermissionsPage'; // Correction de l'import

import io from "socket.io-client";




function Commands() {
  const [loading, setLoading] = useState(true);
  const [commands, setCommands] = useState([]);
  const [commandData, setCommandData] = useState(null);
  const [error, setError] = useState(null);
  const isAdmin = localStorage.getItem('role') === 'admin';
  const userPermissions = useContext(UserPermissionsContext);
  const socket = io.connect("http://localhost:3300");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');


  // const location = useLocation();
  //const searchParams = new URLSearchParams(location.search);
  // const id = searchParams.get('idcommand');

  const email = localStorage.getItem('email');
  const userid = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  const config = useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  const searchCommands = useCallback(async (searchTerm, page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Make a request to the backend API to search for commands
      const response = await axios.get(`http://127.0.0.1:5000/api/searchCommands/${searchTerm}?page=${page}&limit=10`, config);

      // Update the state with the results from the API
      setCommands(response.data.commands); // Update to set commands
      setTotalPages(Math.ceil(response.data.total / 10)); // Use limit parameter here
      setCurrentPage(page); // Update current page
    } catch (err) {
      console.error('Error searching commands:', err);
    } finally {
      setLoading(false);
    }
  }, [setCommands]);


  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      if (localStorage.getItem('role') === 'client') {
        const currentCommandeId = localStorage.getItem('currentCommandeId');
        if (currentCommandeId) {
          const response = await axios.post('http://127.0.0.1:5000/api/completeCommand', { currentCommandeId }, config);
          setCommandData(response.data);
        }
      } else {
        const response = await axios.get(`http://127.0.0.1:5000/api/getAllCommands?page=${page}&limit=10`, config);
        setCommands(response.data.commands);
        setTotalPages(Math.ceil(response.data.total / 10));
        setCurrentPage(page);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [config]);



  useEffect(() => {
    if (searchTerm) {
      searchCommands(searchTerm, currentPage);
    } else {
      fetchData(currentPage);
    }

  }, [searchTerm, currentPage, searchCommands, fetchData, role, config]);
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    searchCommands(searchTerm, currentPage);
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };


  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      if (searchTerm) {
        searchCommands(searchTerm, newPage);
      } else {
        fetchData(newPage);
      }
    }
  };

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
    // Prepare the data to be emitted via socket
    const commandData = {
      idcommande,
      newStatus,
    };

    // Emit the updateCommandStatus event with the prepared data
    socket.emit('updateCommandStatus', { ...commandData, email, userid, role });
  };


  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : commandData ? (
        <CompleteCommand commandData={commandData} />
      ) : (
        <div className="d-flex">
          <SideBar />
          <div className="container-fluid flex-column">
            <TopBar />
            <div className="container-fluid p-2">
              <form onSubmit={handleSearchSubmit} className="d-flex">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="form-control me-2"
                />
              </form>
              <table>
                <thead>
                  <tr>
                    <th>IDd</th>
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
                          value={commands[key].statut_commande}

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
                        {(isAdmin || (userPermissions && userPermissions.updateCommande === 1)) && ( // Add parentheses here

                          <button
                            className="btn btn-primary mr-2"
                            onClick={() => updateCommandStatus(command.idcommande, command.statut_commande)}
                          >
                            Update
                          </button>
                        )}
                        {(isAdmin || (userPermissions && userPermissions.deleteCommande === 1)) && ( // Add parentheses here
                          <button> delete</button>
                        )}
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
              <nav aria-label="Page navigation">
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                  </li>
                  {[...Array(totalPages).keys()].map(page => (
                    <li key={page + 1} className={`page-item ${page + 1 === currentPage ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(page + 1)}>{page + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Commands;