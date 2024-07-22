import React, { useState, useEffect } from 'react';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { RiDeleteBinLine } from "react-icons/ri";
import './TopNav.css';



function Historyy() {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/getAllHistoryById`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            client_idclient: role === 'client' ? id : undefined,
            employe_idemploye: role === 'employe' ? id : undefined,
            admin_idadmin: role === 'admin' ? id : undefined
          }
        });
        setHistory(response.data.historique);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching history:', error);
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id, token, role]);

  const handleDelete = async (idAction) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/deleteHistory/${idAction}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setHistory(history.filter(item => item.idaction !== idAction));
      console.log('History deleted successfully');
    } catch (error) {
      console.error('Error deleting history:', error);
    }
  };

  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column">
        <TopBar />
        <div className="container-fluid p-2 history-container">
          {loading ? (
            <p>Loading...</p>
          ) : (
            history.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID Action</th>
                    <th>Date Action</th>
                    <th>Heure Action</th>
                    <th>Description Action</th>
                    <th>Client ID</th>
                    <th>Employe ID</th>
                    <th>Admin ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.idaction}>
                      <td>{item.idaction}</td>
                      <td>{item.date_action}</td>
                      <td>{item.heure_action}</td>
                      <td>{item.description_action}</td>
                      <td>{item.client_idclient}</td>
                      <td>{item.employe_idemploye}</td>
                      <td>{item.admin_idadmin}</td>
                      <td>
                        <div onClick={() => handleDelete(item.idaction)}>
                          <RiDeleteBinLine />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No history found.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Historyy;
