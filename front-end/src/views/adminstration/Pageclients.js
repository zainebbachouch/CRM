import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useParams ,useNavigate} from 'react-router-dom';
import axios from 'axios';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { Link } from 'react-router-dom';



function Pageclients() {
    const { id } = useParams(); // Utiliser le hook useParams pour obtenir les paramètres d'URL
      const [clientsData, setClientsData] = useState({});
      const [loading, setLoading] = useState(true);
  
      const token = localStorage.getItem('token');
  
      const [filterActive, setFilterActive] = useState(1); // Default to account setting

      const navigate = useNavigate();
  
      useEffect(() => {
        if (loading) {
          navigate(`/Pageclients/${id}/envoyeeMail`);
        }
      }, [loading, id, navigate]);



      const config = useMemo(() => ({
          headers: {
              Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
      }), [token]);
  
      useEffect(() => {
        const fetchClientsData = async () => {
            try {
                let response;
               
                response = await axios.get(`http://127.0.0.1:5000/api/clientbyid/${id}`, config);
            
            setClientsData(response.data);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching employe data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClientsData();
    }, [ config, id]);
  

  
  
  
    if (loading) {
      return <div>Loading...</div>;
  }
    return (
      <div className="d-flex">
              <SideBar />
              <div className="container-fluid flex-column">
                  <TopBar />
                  <div className="container-fluid p-2">
                      <div className="row m-0 p-0">
                      <div className="profile-card col-md-3">
    <img alt="Profile" className="profile-img" />
    <h2>Client #{id}</h2>
    <p>Client Data</p>
    <hr />
   
        <div className="clientContactInfo">
            <span>Contact info</span>
           
            <div >
                <div >Nom</div>
                <div >{clientsData.nom_client}{clientsData.prenom_client}</div>
            </div>
           
            <div >
                <div >Email address</div>
                <div >{clientsData.email_client}</div>
            </div>
          
            <div >
                <div >Phone number</div>
                <div >{clientsData.telephone_client}</div>
            </div>
            <div >
                <div >Address</div>
                <div >{clientsData.adresse_client}</div>
            </div>
            <div>
                <div >Date of Birth</div>
                <div >{clientsData.datede_naissance_client}</div>
            </div>
            <div >
                <div >Date of Registration</div>
                <div >{clientsData.date_inscription_client}</div>
            </div>
            <div >
                <div >Gender</div>
                <div >{clientsData.genre_client}</div>
            </div>
            <div >
                <div >Account Status</div>
                <div >{clientsData.etat_compte}</div>
            </div>
        </div>
    </div>

    <div className="col-md-9">
    <ul className="nav nav-tabs" id="profileTabs" role="tablist">
    <li className="nav-item">
                  <Link className="nav-link"
                   to={`/Pageclients/${id}/envoyeeMail`} 
                   role="tab"
                   onClick={() => setFilterActive(1)}
                   >
                    Envoyee Mail
                  </Link>
                </li>
  <li className="nav-item">
  <Link
                    className={`nav-link ${filterActive === 2 ? 'active' : ''}`}
                    to={`/Pageclients/${id}/makecall`}
                    role="tab"
                    onClick={() => setFilterActive(2)}
                  >      Make Call
    </Link>
  </li>
  <li className="nav-item">
  <Link
                    className={`nav-link ${filterActive === 3 ? 'active' : ''}`}
                    to={`/Pageclients/${id}/historique`}
                    role="tab"
                    onClick={() => setFilterActive(3)}
                  >      Historique
    </Link>
  </li>
</ul>

              <div className="tab-content" id="profileTabsContent">
                <Outlet/>
              </div>
              </div>
                          

                            
                            </div>
                            </div>
                            
                            </div>
                            </div>
    )
  }

export default Pageclients
