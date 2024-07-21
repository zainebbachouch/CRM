import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState('employe'); // Ajout de l'état pour userType
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/forgot-password', { email, userType }); // Envoyer userType
            setMessage('Code de réinitialisation envoyé à votre e-mail');
            setTimeout(() => {
                navigate('/reset-password');
            }, 2000); // Redirection après 2 secondes
        } catch (error) {
            setMessage('Erreur lors de l\'envoi du code de réinitialisation');
        }
    };

    return (
        <div>
            <h2>Mot de passe oublié</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Entrez votre e-mail"
                    required
                />
                <div className="form-group">
                    <label htmlFor="userType">Type d'utilisateur</label>
                    <select
                        className="form-control"
                        id="userType"
                        name="userType"
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                    >
                        <option value="">Select  Type</option>

                        <option value="employe">Employé</option>
                        <option value="client">Client</option>
                    </select>
                </div>
                <button type="submit">Envoyer le code</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ForgotPassword;
