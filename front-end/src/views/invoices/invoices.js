import React, { useState, useEffect ,useMemo} from 'react';
import axios from 'axios';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { Link } from 'react-router-dom';
function Invoices() {
  const [factures, setFactures] = useState([]);
  const token = localStorage.getItem('token');
  //const role = localStorage.getItem('role');
  const config = useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);
  useEffect(() => {
    async function fetchInvoices() {
      try {
       
        const response = await axios.get(
          'http://127.0.0.1:5000/api/getAllFactures',
          config
        );
       // console.log('facttttttttttttttt',response.data)
        setFactures(response.data);
      } catch (err) {
        console.error('Error fetching invoices:', err);
      }
    }
    fetchInvoices();
  }, [config]); // Fetch invoices when token or role changes

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