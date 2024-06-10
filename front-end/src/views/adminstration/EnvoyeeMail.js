import React, { useState } from 'react';


function EnvoyeeMailEmploye() {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique pour envoyer l'e-mail à l'employé avec les données du formulaire
    console.log('Adresse e-mail de l\'employé :', formData.to);
    console.log('Sujet du message :', formData.subject);
    console.log('Contenu du message :', formData.message);
    // Vous pouvez appeler ici une fonction qui envoie l'e-mail à l'employé avec les données du formulaire
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>pur</h3>
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

function EnvoyeeMailClient() {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique pour envoyer l'e-mail au client avec les données du formulaire
    console.log('Adresse e-mail du client :', formData.to);
    console.log('Sujet du message :', formData.subject);
    console.log('Contenu du message :', formData.message);
    // Vous pouvez appeler ici une fonction qui envoie l'e-mail au client avec les données du formulaire
  };

  return (
    <form onSubmit={handleSubmit}>
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
