import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom'; 
import axios from 'axios';

function EnvoyeeMailEmploye() {
  const { id, email } = useParams();
  const token = localStorage.getItem('token');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [filterActive, setFilterActive] = useState(1); // Default to account setting
  const [emails, setEmails] = useState([]);


  const handleFilterClick = (filter) => {
    setFilterActive(filter);
};

  const config = useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  const [formData, setFormData] = useState({
    to: email ? email : '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
     // if (role === 'employe') {

      const formDataToSend = {
        ...formData,
        recipientRole: 'employee', 
        recipientId: id 
      };
      
      const response = await axios.post('http://127.0.0.1:5000/api/sendMailEmploye', formDataToSend, config);
            setSuccessMessage(response.data.message);
      setFormData({
        to: email ? email : '',
        subject: '',
        message: ''
      });
    
      fetchEmails();
    
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || 'Une erreur est survenue lors de l\'envoi du mail.');
      } else if (error.request) {
        setErrorMessage('Aucune réponse du serveur.');
      } else {
        setErrorMessage('Une erreur est survenue lors de l\'envoi du mail.');
      }
    }
  }
  const fetchEmails = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/listEmails', config);
      setEmails(response.data.emails);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  // Fetch the list of emails when the component mounts
  useEffect(() => {
    fetchEmails();
  }, []);
  return (
    <div className="col-md-9">

    <ul className="nav nav-tabs" id="profileTabs" role="tablist">
    <li
        className={`nav-link ${filterActive === 1 ? 'active' : ''}`}
        onClick={() => handleFilterClick(1)}
        role="tab"
    >
        mail
    </li>
    <li
        className={`nav-link ${filterActive === 2 ? 'active' : ''}`}
        onClick={() => handleFilterClick(2)}
        role="tab"
    >
      list mails
    </li>
    <li
        className={`nav-link ${filterActive === 3 ? 'active' : ''}`}
        onClick={() => handleFilterClick(3)}
        role="tab"
    >

Company Settings
    </li>
    </ul>
    <div className={`tab-pane fade ${filterActive === 1 ? 'show active' : ''}`} role="tabpanel">

    <form onSubmit={handleSubmit}>
      <h3>Envoyer un email à un employé</h3>
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <div>
        <label htmlFor="to">À :</label>
        <input
          type="email"
          id="to"
          name="to"
          value={formData.to}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="subject">Sujet :</label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="message">Message :</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Envoyer</button>
    </form>
    </div>

    <div className={`tab-pane fade ${filterActive === 2 ? 'show active' : ''}`} role="tabpanel">
                                   
                                     {/* list mails */}
                                </div>
                                <div className={`tab-pane fade ${filterActive === 3 ? 'show active' : ''}`} role="tabpanel">
                                    {/* Company Settings Content */}
                                </div>
    </div>
  );
}

function EnvoyeeMailClient() {
  const { email } = useParams();
  const token = localStorage.getItem('token');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const config = useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  const [formData, setFormData] = useState({
    to: email ? email : '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/sendMailClient', formData, config);
      setSuccessMessage(response.data.message);
      setFormData({
        to: email ? email : '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setErrorMessage('Une erreur est survenue lors de l\'envoi du mail.');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Envoyer un email à un client</h3>
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <div>
        <label htmlFor="to">À :</label>
        <input
          type="email"
          id="to"
          name="to"
          value={formData.to}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="subject">Sujet :</label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="message">Message :</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Envoyer</button>
    </form>
  );
}

export { EnvoyeeMailEmploye, EnvoyeeMailClient };
