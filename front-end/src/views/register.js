import React, { useState } from "react";
import axios from "axios";
import "../style/viewsStyle/registerStyle.css";

const emailValidator = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordValidator = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;

export default function Register() {
    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        telephone: "",
        adresse: "",
        dateDeNaissance: "",
        genre: "femme",
        typeUtilisateur: "employee",
    });

    const [touchedFields, setTouchedFields] = useState({
        nom: false,
        prenom: false,
        email: false,
        password: false,
        passwordConfirmation: false,
        telephone: false,
        adresse: false,
        dateDeNaissance: false,
    });

    const [errors, setErrors] = useState({
        nomError: "",
        prenomError: "",
        emailAddressError: "",
        passwordError: "",
        passwordConfirmationError: "",
        telephoneError: "",
        adresseError: "",
        dateDeNaissanceError: "",
        generalError: "",
    });

    const handleFocus = (fieldName) => {
        setTouchedFields({ ...touchedFields, [fieldName]: true });
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        const validationErrors = validateForm({ ...formData, [name]: e.target.value });
        setErrors({ ...errors, ...validationErrors });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setTouchedFields({ ...touchedFields, [name]: true });
        // Effacer les erreurs non pertinentes lors de la modification d'un champ
        setErrors((prevErrors) => ({
            ...prevErrors,
            [`${name}Error`]: "", // Effacer l'erreur du champ modifié
            generalError: "", // Effacer l'erreur générale lorsqu'un champ est modifié
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Marquer tous les champs comme touchés pour afficher les erreurs
        setTouchedFields({
            nom: true,
            prenom: true,
            email: true,
            password: true,
            passwordConfirmation: true,
            telephone: true,
            adresse: true,
            dateDeNaissance: true,
        });

        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length === 0) {
            try {

                const response = await axios.post("http://127.0.0.1:5000/api/registerUser", formData);
               
                console.log("Response from server:", response.data);
            } catch (err) {
                console.error("Error object:", err);
                if (err.response) {
                    setErrors({ ...errors, generalError: err.response.data });
                } else {
                    setErrors({ ...errors, generalError: "An error occurred. Please try again later." });
                }
            }
        } else {
            setErrors(validationErrors);
        }
    };


    const validateForm = (data) => {
        let errors = {};

        if (!data.nom.trim()) errors.nomError = "Le nom est requis";
        if (touchedFields.prenom && !data.prenom.trim()) errors.prenomError = "Le prénom est requis";
        if (touchedFields.email && !data.email.trim()) errors.emailAddressError = "L'adresse e-mail est requise";
        else if (touchedFields.email && !emailValidator.test(data.email.trim())) errors.emailAddressError = "L'adresse e-mail n'est pas valide";
        if (touchedFields.password && !data.password.trim()) errors.passwordError = "Le mot de passe est requis";
        else if (touchedFields.password && !passwordValidator.test(data.password)) errors.passwordError = "Le mot de passe doit contenir au moins 8 caractères, 1 chiffre, 1 majuscule et 1 minuscule";
        if (touchedFields.passwordConfirmation && data.password !== data.passwordConfirmation) errors.passwordConfirmationError = "Les mots de passe ne correspondent pas";

        if (touchedFields.telephone && !data.telephone.trim()) errors.telephoneError = "Le numéro de téléphone est requis";
        if (touchedFields.adresse && !data.adresse.trim()) errors.adresseError = "L'adresse est requise";
        if (touchedFields.dateDeNaissance && !data.dateDeNaissance) errors.dateDeNaissanceError = "La date de naissance est requise";


        return errors;
    };

    return (
        <div className="registerContainer m-0 p-0">
            <div className="col-md-6">
                <div className="card">
                    <div className="card-body">
                        <h2 className="card-title text-center">Inscription</h2>
                        <form>
                            <div className="form-group">
                                <label htmlFor="nom">Nom</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.nomError && touchedFields.nom ? "invalid" : ""}`}
                                    id="nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onFocus={() => handleFocus("nom")}
                                />
                                {errors.nomError && touchedFields.nom && <div className="errorMsg">{errors.nomError}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="prenom">Prénom</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.prenomError && touchedFields.prenom ? "invalid" : ""}`}
                                    id="prenom"
                                    name="prenom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onFocus={() => handleFocus("prenom")}
                                />
                                {errors.prenomError && touchedFields.prenom && <div className="errorMsg">{errors.prenomError}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Adresse e-mail</label>
                                <input
                                    type="email"
                                    className={`form-control ${errors.emailAddressError && touchedFields.email ? "invalid" : ""}`}
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onFocus={() => handleFocus("email")}
                                />
                                {errors.emailAddressError && touchedFields.email && <div className="errorMsg">{errors.emailAddressError}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Mot de passe</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.passwordError && touchedFields.password ? "invalid" : ""}`}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onFocus={() => handleFocus("password")}
                                />
                                {errors.passwordError && touchedFields.password && <div className="errorMsg">{errors.passwordError}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="passwordConfirmation">Confirmer le mot de passe</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.passwordConfirmationError && touchedFields.passwordConfirmation ? "invalid" : ""}`}
                                    id="passwordConfirmation"
                                    name="passwordConfirmation"
                                    value={formData.passwordConfirmation}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onFocus={() => handleFocus("passwordConfirmation")}
                                />
                                {errors.passwordConfirmationError && touchedFields.passwordConfirmation && <div className="errorMsg">{errors.passwordConfirmationError}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="telephone">Téléphone</label>
                                <input
                                    type="tel"
                                    className={`form-control ${errors.telephoneError && touchedFields.telephone ? "invalid" : ""}`}
                                    id="telephone"
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onFocus={() => handleFocus("telephone")}
                                />
                                {errors.telephoneError && touchedFields.telephone && <div className="errorMsg">{errors.telephoneError}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="adresse">Adresse</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.adresseError && touchedFields.adresse ? "invalid" : ""}`}
                                    id="adresse"
                                    name="adresse"
                                    value={formData.adresse}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onFocus={() => handleFocus("adresse")}
                                />
                                {errors.adresseError && touchedFields.adresse && <div className="errorMsg">{errors.adresseError}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="dateDeNaissance">Date de naissance</label>
                                <input
                                    type="date"
                                    className={`form-control ${errors.dateDeNaissanceError && touchedFields.dateDeNaissance ? "invalid" : ""}`}
                                    id="dateDeNaissance"
                                    name="dateDeNaissance"
                                    value={formData.dateDeNaissance}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onFocus={() => handleFocus("dateDeNaissance")}
                                />
                                {errors.dateDeNaissanceError && touchedFields.dateDeNaissance && <div className="errorMsg">{errors.dateDeNaissanceError}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="genre">Genre </label>
                                <select
                                    className="form-control"
                                    id="genre"
                                    name="genre"
                                    value={formData.genre}
                                    onChange={handleChange}
                                >
                                    <option value="femme">Femme</option>
                                    <option value="homme">Homme</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="typeUtilisateur">Type d'utilisateur</label>
                                <select
                                    className="form-control"
                                    id="typeUtilisateur"
                                    name="typeUtilisateur"
                                    value={formData.typeUtilisateur}
                                    onChange={handleChange}
                                >
                                    <option value="employee">Employé</option>
                                    <option value="client">Client</option>
                                </select>
                            </div>


                            {errors.generalError && <div className="errorMsg">{errors.generalError}</div>}
                            <button type="submit" className="btn submitButton" onClick={handleSubmit}>S'inscrire</button>
                        </form>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
