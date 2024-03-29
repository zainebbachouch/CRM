import React from 'react';
import "../style/viewsStyle/registerStyle.css";

export default function Register() {
    return (
        <div className="registerContainer m-0 p-0">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title text-center">Sign In</h2>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="nom">Nom </label>
                                    <input type="text" className="form-control" id="nom" name="nom" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="prenom">Prénom </label>
                                    <input type="text" className="form-control" id="prenom" name="prenom" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Adresse e-mail </label>
                                    <input type="email" className="form-control" id="email" name="email" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="mdp">Mot de passe </label>
                                    <input type="password" className="form-control" id="mdp" name="mdp" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="photo">Photo </label>
                                    <input type="file" className="form-control" id="photo" name="photo" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="telephone">Téléphone </label>
                                    <input type="tel" className="form-control" id="telephone" name="telephone" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="adresse">Adresse </label>
                                    <input type="text" className="form-control" id="adresse" name="adresse" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="datede_naissance">Date de naissance </label>
                                    <input type="date" className="form-control" id="datede_naissance" name="datede_naissance" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="genre">Genre </label>
                                    <select className="form-control" id="genre" name="genre">
                                        <option value="femme">Femme</option>
                                        <option value="homme">Homme</option>
                                    </select>
                                </div>
                                <div className="form-group text-center mt-2">
                                    <button type="button" className="btn btn-primary submitButton">Créez votre compte</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
       
    );
}
