import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import axios from 'axios';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { Link } from 'react-router-dom';



function Pageemployes() {
  const { id } = useParams(); // Utiliser le hook useParams pour obtenir les paramètres d'URL
    const [employeData, setEmployeData] = useState({});
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    //const role = localStorage.getItem('role');

    const config = useMemo(() => ({
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    }), [token]);

    useEffect(() => {
      const fetchEmployeData = async () => {
          try {
              let response;
             
                  response = await axios.get(`http://127.0.0.1:5000/api/employebyid/${id}`, config);
            
              setEmployeData(response.data);
              console.log('lool',response.data);
          } catch (error) {
              console.error("Error fetching employe data:", error);
          } finally {
              setLoading(false);
          }
      };
      fetchEmployeData();
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
                            <h2>Employe #{id}</h2>
                            <p>employeData</p>
                            {console.log("employedattttta",employeData)}
                            <hr />
                            <div className="clientInfo">
  <div className="clientContactInfo">
    <span>Contact info</span>
 
    <div >
      <div >Nom</div>
      <div >{employeData.nom_employe}{employeData.prenom_employe}</div>
    </div>

    <div >
  <div >Email address</div>
  <div >{employeData.email_employe}</div>
</div>

    <div >
      <div >Phone number</div>
      <div >{employeData.telephone_employe}</div>
    </div>
    <div >
      <div >Address</div>
      <div >{employeData.adresse_employe}</div>
    </div>
    <div >
      <div >Date of Birth</div>
      <div >{employeData.datede_naissance_employe}</div>
    </div>
    <div >
      <div >Date of Registration</div>
      <div >{employeData.date_inscription_employe}</div>
    </div>
    <div >
      <div >Gender</div>
      <div >{employeData.genre_employe}</div>
    </div>
    <div >
      <div >Account Status</div>
      <div >{employeData.etat_compte}</div>
    </div>
  </div>
</div>
</div>
<div className="col-md-9">
<ul className="nav nav-tabs" id="profileTabs" role="tablist">
  <li className="nav-item">
    <Link className="nav-link" to={`envoyeeMail`} role="tab">
      Envoyee Mail
    </Link>
  </li>
  <li className="nav-item">
    <Link className="nav-link" to={`makecall`} role="tab">
      Make Call
    </Link>
  </li>
  <li className="nav-item">
    <Link className="nav-link" to={`historique`} role="tab">
      Historique
    </Link>
  </li>
</ul>

              <div className="tab-content" id="profileTabsContent">
                <Outlet />
              </div>
                          </div>
                          
                          </div>
                          </div>
                          
                          </div></div>
  )
}

export default Pageemployes
