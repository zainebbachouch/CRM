import { React, useState } from "react";
import "../style/viewsStyle/registerStyle.css";
import axios from "axios";

export default function Register() {
    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        telephone: "",
        adresse: "",
        dateDeNaissance: "",
        genre: "",
        typeUtilisateur: "employee"
    });
    const [err, setErr] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
  /*  const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
      };*/

      const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post("http://127.0.0.1:5000/api/registerC", formData);
            console.log("Response from server:", response.data);
        } catch (err) {
            console.error("Error object:", err);
            if (err.response) {
                // If error response exists, set error state
                setErr(err.response.data);
            } else {
                // If no error response, set a generic error message
                setErr("An error occurred. Please try again later.");
            }
        }
        console.log(formData);
    };
    const handleSubmit2 = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post("http://localhost:8800/api/auth/register", formData);
            console.log("Response from server:", response.data);
        } catch (err) {
            console.error("Error object:", err);
            setErr(err.response.data);
        }
        console.log("Form data:", formData);
    };
    
    
  
    return (
        <div className="registerContainer m-0 p-0">
            <div className="col-md-6">
                <div className="card">
                    <div className="card-body">
                        <h2 className="card-title text-center">Sign In</h2>
                        <form>
                            <div className="form-group">
                                <label htmlFor="nom">Nom </label>
                                <input type="text" className="form-control" id="nom" name="nom"  onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="prenom">Prénom </label>
                                <input type="text" className="form-control" id="prenom" name="prenom"  onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Adresse e-mail </label>
                                <input type="email" className="form-control" id="email" name="email"  onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="mdp">Mot de passe </label>
                                <input type="password" className="form-control" id="mdp" name="password"  onChange={handleChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="telephone">Téléphone </label>
                                <input type="tel" className="form-control" id="telephone" name="telephone"  onChange={handleChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="adresse">Adresse </label>
                                <input type="text" className="form-control" id="adresse" name="adresse"  onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="datede_naissance">Date de naissance </label>
                                <input type="date" className="form-control" id="datede_naissance" name="dateDeNaissance"  onChange={handleChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="genre">Genre </label>
                                <select className="form-control" id="genre" name="genre"  onChange={handleChange}>
                                    <option value="femme">Femme</option>
                                    <option value="homme">Homme</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="typeUtilisateur">Type d'utilisateur</label>
                                <select className="form-control" id="typeUtilisateur" name="typeUtilisateur"  onChange={handleChange}>
                                    <option value="employee">Employé</option>
                                    <option value="client">Client</option>
                                </select>
                            </div>

                            <div className="form-group text-center mt-2">
                                {err && <div className="error-message">{err}</div>}
                                <button type="button" className="btn btn-primary submitButton" onClick={handleSubmit}>Créez votre compte</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
