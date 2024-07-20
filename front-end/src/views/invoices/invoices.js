import React, { useState, useEffect, useMemo ,useContext } from 'react';
import axios from 'axios';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { Link } from 'react-router-dom';
import { UserPermissionsContext } from '../context/UserPermissionsPage'; // Correction de l'import



function Invoices() {
  const [factures, setFactures] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10); // You can adjust this value as needed


  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');


  const isAdmin = localStorage.getItem('role') === 'admin';
  const userPermissions = useContext(UserPermissionsContext);

  const config = useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);
  const fetchInvoices = async (page = 1) => {
        try {
      if (role === 'client') {
        const response = await axios.get('http://127.0.0.1:5000/api/getFactureOfClientAuthorized', config);
        setInvoices(response.data.facturesClient); // Assuming the data structure returned from the server


      } else {
       const response = await axios.get(`http://127.0.0.1:5000/api/getAllFactures?page=${page}&limit=${itemsPerPage}`, config);
        setFactures(response.data.factures);
        setTotalPages(Math.ceil(response.data.total / itemsPerPage));
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  }
  useEffect(() => {
  
    fetchInvoices();
  }, [role, config]); // Fetch invoices when token or role changes
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      fetchInvoices(newPage);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:5000/api/deleteInvoice/${id}`, config);
      if (response.status === 200) {
      //  setFactures(factures.filter((facture) => facture.idfacture !== id));
      fetchInvoices();
      } else {
        console.error('Failed to delete invoice:', response.data.message);
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column">
        <TopBar />
        <div className="container-fluid p-2">
          <table className="table">
            <thead>
              <tr>
                <th>idfacturee</th>
                <th>date_facture</th>
                <th>etat_facture</th>
                <th>montant_total_facture</th>
                <th>methode_paiment_facture</th>
                <th>date_echeance</th>
                <th>statut_paiement_facture</th>
                <th>idcommande</th>
                <th>Actions</th>
              </tr>
            </thead>
            {role !== 'client' ? (
              <tbody>
                {factures.map((invoice, key) => (
                  <tr key={invoice.idfacture}>
                    <td>{invoice.idfacture}</td>
                    <td>{invoice.date_facture}</td>
                    <td>{invoice.etat_facture}</td>
                    <td>{invoice.montant_total_facture}</td>
                    <td>{invoice.methode_paiment_facture}</td>
                    <td>{invoice.date_echeance}</td>
                    <td>{invoice.statut_paiement_facture}</td>
                    <td>{invoice.idcommande}</td>
                    <td>
                      <button className="btn btn-success">
                        <Link to={`/invoices/${invoice.idcommande}`} className="text-white btn-link"> 
                          show details
                        </Link>
                      </button>
                      {(isAdmin || (userPermissions && userPermissions.deleteFacture === 1)) && ( // Add parentheses here

                      <button className="btn btn-danger" onClick={() => handleDelete(invoice.idcommande)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
              {invoices && invoices.map((invoice, key) => (
                    <tr key={invoice.idfacture}>
                    <td>{invoice.idfacture}</td>
                    <td>{invoice.date_facture}</td>
                    <td>{invoice.etat_facture}</td>
                    <td>{invoice.montant_total_facture}</td>
                    <td>{invoice.methode_paiment_facture}</td>
                    <td>{invoice.date_echeance}</td>
                    <td>{invoice.statut_paiement_facture}</td>
                    <td>{invoice.idcommande}</td>
                    <td>
                      <button className="btn btn-success">
                        <Link to={`/invoices/${invoice.idcommande}`} className="text-white btn-link"> 
                          show details
                        </Link>
                      </button>               
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
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
  );
}

export default Invoices;
