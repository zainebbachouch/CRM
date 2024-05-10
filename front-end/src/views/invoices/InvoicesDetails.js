import React, { useState, useEffect ,useMemo} from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; 
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';

function InvoicesDetails() { 
  const { id } = useParams(); 
  console.log('idddddddddddddddddd', id);
  const [facturesData, setFacturesData] = useState([]);
  const token = localStorage.getItem('token');

  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }), [token]);
  
  useEffect(() => {
    const fetchInvoicesDetails = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/api/getInvoiceDetailsByCommandId/${id}`,
          config
        );
        setFacturesData((response.data.InvoiceDetailsByCommandId));
      } catch (err) {
        console.error('Error fetching invoices:', err);
      }
    }
    fetchInvoicesDetails();
  }, [id, config]); 

  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column">
        <TopBar />
        <div className="container-fluid p-2">
          { facturesData.map((faccom, key) => (
             <div key={key}>
              <h2>{faccom.description_commande}</h2>
              <p>
                ID: {faccom.idcommande}<br />
                Date: {faccom.date_commande}<br />
                Total Amount: {faccom.montant_total_commande}<br />
                Address: {faccom.adresselivraison_commande}<br />
                Payment Method: {faccom.modepaiement_commande}<br />
                Status: {faccom.statut_commande}<br />
                Delivery Date: {faccom.date_livraison_commande}<br />
                Delivery Method: {faccom.metho_delivraison_commande}<br />
              </p>
            </div>
          ))} 
        </div>
      </div>
    </div>
  );
}

export default InvoicesDetails;
