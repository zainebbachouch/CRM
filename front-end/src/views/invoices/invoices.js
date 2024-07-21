import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import axios from 'axios';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { Link } from 'react-router-dom';
import { UserPermissionsContext } from '../context/UserPermissionsPage';
import "../../style/viewsStyle/facture.css";

function Invoices() {
  const [factures, setFactures] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchCriteria, setSearchCriteria] = useState({
    etat_facture: '',
    methode_paiment_facture: '',
    statut_paiement_facture: '',
    dateType: '', // Added this line
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const isAdmin = role === 'admin';
  const userPermissions = useContext(UserPermissionsContext);

  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }), [token]);

  const searchFactures = useCallback(async (searchCriteria, page = 1) => {
    setLoading(true);
    try {
        const { dateType, startDate, endDate, ...criteria } = searchCriteria;
        const params = {
            ...criteria,
            page,
            limit: itemsPerPage,
            ...(dateType && startDate && endDate && { [`${dateType}_start`]: startDate, [`${dateType}_end`]: endDate })
        };

        const response = await axios.get('http://127.0.0.1:5000/api/searchFactures', {
            ...config,
            params,
        });
        setFactures(response.data.factures);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
    } catch (err) {
        console.error('Error searching factures:', err);
    } finally {
        setLoading(false);
    }
}, [config, itemsPerPage]);


  const fetchInvoices = useCallback(async (page = 1) => {
    console.log('Fetching invoices for page:', page);
    try {
      if (role === 'client') {
        const response = await axios.get('http://127.0.0.1:5000/api/getFactureOfClientAuthorized', config);
        setInvoices(response.data.facturesClient);
      } else {
        const response = await axios.get(`http://127.0.0.1:5000/api/getAllFactures?page=${page}&limit=${itemsPerPage}`, config);
        setFactures(response.data.factures);
        setTotalPages(Math.ceil(response.data.total / itemsPerPage));
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  }, [config, itemsPerPage, role]);

  useEffect(() => {
    if (Object.values(searchCriteria).some(value => value)) {
      searchFactures(searchCriteria, currentPage);
    } else {
      fetchInvoices(currentPage);
    }
  }, [searchCriteria, currentPage, searchFactures, fetchInvoices]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    searchFactures(searchCriteria, currentPage);
  };

  const handleSearchChange = (event) => {
    const { name, value } = event.target;
    setSearchCriteria(prevState => ({ ...prevState, [name]: value }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      if (Object.values(searchCriteria).some(value => value)) {
        searchFactures(searchCriteria, newPage);
      } else {
        fetchInvoices(newPage);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:5000/api/deleteInvoice/${id}`, config);
      if (response.status === 200) {
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
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="mb-2">
              <label>Etat Facture:</label>
              <select name="etat_facture" value={searchCriteria.etat_facture} onChange={handleSearchChange} className="form-control">
                <option value="">All</option>
                <option value="enAttente">enAttente</option>
                <option value="payee">payee</option>
                <option value="enRetard">enRetard</option>
                <option value="annulee">annulee</option>
              </select>
            </div>
            <div className="mb-2">
              <label>Methode Paiement:</label>
              <select name="methode_paiment_facture" value={searchCriteria.methode_paiment_facture} onChange={handleSearchChange} className="form-control">
                <option value="">All</option>
                <option value="Carte de crédit">Carte de crédit</option>
                <option value="Virement bancaire">Virement bancaire</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div className="mb-2">
              <label>Statut Paiement:</label>
              <select name="statut_paiement_facture" value={searchCriteria.statut_paiement_facture} onChange={handleSearchChange} className="form-control">
                <option value="">All</option>
                <option value="paye">paye</option>
                <option value="non_paye">non_paye</option>
              </select>
            </div>
            <div className="mb-2">
              <label>Date Type:</label>
              <select name="dateType" value={searchCriteria.dateType} onChange={handleSearchChange} className="form-control">
                <option value="">Select Date Type</option>
                <option value="date_facture">Date Facture</option>
                <option value="date_echeance">Date Echeance</option>
              </select>
            </div>
            <div className="mb-2">
              <label>Start Date:</label>
              <input type="date" name="startDate" value={searchCriteria.startDate} onChange={handleSearchChange} className="form-control" />
            </div>
            <div className="mb-2">
              <label>End Date:</label>
              <input type="date" name="endDate" value={searchCriteria.endDate} onChange={handleSearchChange} className="form-control" />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Etat</th>
                  <th>Methode</th>
                  <th>Statut</th>
                  <th>Date Facture</th>
                  <th>Date Echeance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {factures.map(facture => (
                  <tr key={facture.idfacture}>
                    <td>{facture.etat_facture}</td>
                    <td>{facture.methode_paiment_facture}</td>
                    <td>{facture.statut_paiement_facture}</td>
                    <td>{new Date(facture.date_facture).toLocaleDateString()}</td>
                    <td>{new Date(facture.date_echeance).toLocaleDateString()}</td>
                    <td>
                      {isAdmin && (
                        <>
                          <button onClick={() => handleDelete(facture.idfacture)} className="btn btn-danger">Delete</button>
                          <Link to={`/updateInvoice/${facture.idfacture}`} className="btn btn-primary">Update</Link>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="pagination">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invoices;
