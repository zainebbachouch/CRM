import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';

function Invoices() {
  const [factures, setFactures] = useState([]);
  const role = localStorage.getItem('role');

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(
          'http://127.0.0.1:5000/api/getAllFactures',
          config
        );
        setFactures(response.data);
      } catch (err) {
        console.error('Error fetching invoices:', err);
      }
    }
    fetchInvoices();
  }, [role]); // Fetch invoices when role changes

  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column">
        <TopBar />
        <div className="container-fluid p-2">
          <table className="table">
            <thead>
              <tr>
                <th>idfacture</th>
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
            <tbody>
              {factures.map((invoice) => (
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
                    <button className="btn btn-primary mr-2">Update</button>
                    <button className="btn btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Invoices;
