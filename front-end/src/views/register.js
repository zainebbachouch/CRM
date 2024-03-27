import React from 'react';
import "../style/viewsStyle/registerStyle.css";

export default function Register() {
    return (
        <div className="registerContainer d-flex justify-content-center align-items-center">
            <div className="registerForm d-flex flex-column align-items-center justify-content-center">
                <div className="signIn">
                    <h2>Sign In</h2>
                </div>
                <div className="loginOutput mt-4">
                    <div className="form-group mt-3" >
                        <label htmlFor="nom">Nom :</label>
                        <input type="text" id="nom" name="nom" />
                    </div>
                    <div className="form-group mt-1">
                        <label htmlFor="prenom">Prénom :</label>
                        <input type="text" id="prenom" name="prenom" />
                    </div>
                    <div className="form-group mt-1">
                        <label htmlFor="email">Adresse e-mail :</label>
                        <input type="email" id="email" name="email" />
                    </div>
                    <div className="form-group mt-1">
                        <label htmlFor="mdp">Mot de passe :</label>
                        <input type="password" id="mdp" name="mdp" />
                    </div>
                    <div className="form-group mt-1">
                        <label htmlFor="photo">Photo :</label>
                        <input type="text" id="photo" name="photo" />
                    </div>
                    <div className="form-group mt-1">
                        <label htmlFor="telephone">Téléphone :</label>
                        <input type="tel" id="telephone" name="telephone" />
                    </div>
                    <div className="form-group mt-1">
                        <label htmlFor="adresse">Adresse :</label>
                        <input type="text" id="adresse" name="adresse" />
                    </div>
                    <div className="form-group mt-1">
                        <label htmlFor="datede_naissance">Date de naissance :</label>
                        <input type="date" id="datede_naissance" name="datede_naissance" />
                    </div>
                    <div className="form-group mt-1">
                        <label htmlFor="genre">Genre :</label>
                        <select id="genre" name="genre">
                            <option value="femme">Femme</option>
                            <option value="homme">Homme</option>
                        </select>
                    </div>
                    <div className="form-group mt-1">
                        <button type="submit">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
