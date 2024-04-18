const db = require("../config/dbConnection");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const { isAuthorize } = require('../services/validateToken ')
const { creatToken } = require('../services/createTokenService.js');

const getUserById = async (req, res) => {

    const id = req.params.id;
    console.log(id);
    try {
        let query, userType;
        const response = await isAuthorize(req, res)
        if (response.message != 'authorized') {
            res.send(response)
        }
        else {
            console.log(response)
        }
        //  res.send(response);

        if (response.decode.role === 'admin') {
            console.log('req.user.type req.user.type :', req.user.type);
            query = 'SELECT email_admin, mdp FROM admin WHERE idadmin = ?';
            userType = 'admin';
        } else if (response.decode.role === 'employe') {
            query = 'SELECT email_employe, mdp FROM employe WHERE idemploye = ?';
            userType = 'employe';
        } else if (response.decode.role === 'client') {
            query = 'SELECT email_client, mdp FROM client WHERE idclient = ?';
            userType = 'client';
        } else {
            return res.status(404).json({ message: 'User not found' });
        }


        db.query(query, [id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Server error' });
            }

            console.log("Query results:", results);

            if (!results || results.length === 0) {
                return res.status(404).json({ message: `User not found with id ${id}` });
            }

            const user = results[0];
            const email = user[`email_${userType}`];
            const password = user.mdp;
            res.status(200).json({ email, password });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const loginAdmin = async (email, password) => {
    try {
        const query = 'SELECT * FROM admin WHERE email_admin = ? LIMIT 1';
        const result = await new Promise((resolve, reject) => {
            db.query(query, [email], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if (result.length === 0) {
            return { success: false, message: "User not found" };
        }

        const user = result[0];
        const isPasswordValid = await bcrypt.compare(password, user.mdp);
        if (!isPasswordValid) {
            return { success: false, message: "Invalid password" };
        }

        const token = await creatToken("admin", user.idadmin, user.email_admin, process.env.JWT_SECRET, '1h');
        await db.query(`UPDATE admin SET date_inscription_admin = NOW() WHERE idadmin = ?`, [user.idadmin]);

        return { success: true, message: "Login successful", token: token, role: 'admin', user: { username: user.nom_admin } };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Internal server error" };
    }
};



const loginEmploye = async (email, password) => {
    try {
        const query = 'SELECT * FROM employe WHERE email_employe = ? AND etat_compte = "active" LIMIT 1 ';
        const result = await new Promise((resolve, reject) => {
            db.query(query, [email], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if (result.length === 0) {
            return { success: false, message: "User not found" };
        }

        const user = result[0];
        const isPasswordValid = await bcrypt.compare(password, user.mdp);
        if (!isPasswordValid) {
            return { success: false, message: "Invalid password" };
        }

        const token = await creatToken("employe", user.idemploye, user.email_employe, process.env.JWT_SECRET, '1h');

        await db.query(`UPDATE employe SET date_inscription_employe = NOW() WHERE idemploye = ?`, [user.idemploye]);

        return { success: true, message: "Login successful", token: token, role: 'employe', user: { username: user.nom_employe } };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Internal server error" };
    }
};
;
const loginClient = async (email, password) => {
    try {
        const query = 'SELECT * FROM client WHERE email_client = ? AND etat_compte = "active" LIMIT 1';
        const result = await new Promise((resolve, reject) => {
            db.query(query, [email], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if (result.length === 0) {
            return { success: false, message: "User not found" };
        }

        const user = result[0];
        const isPasswordValid = await bcrypt.compare(password, user.mdp);
        if (!isPasswordValid) {
            return { success: false, message: "Invaliddddddddddddddd password" };
        }
        const token = await creatToken("client", user.idclient, user.email_client, process.env.JWT_SECRET, '1h');

        await db.query(`UPDATE client SET date_inscription_client = NOW() WHERE idclient = ?`, [user.idclient]);

        return { success: true, message: "Login successful", token: token, role: 'client', user: { username: user.nom_client } };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Internal llllllllllllllllserver error" };
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        let loginResult = await loginAdmin(email, password);
        if (!loginResult.success) {
            loginResult = await loginEmploye(email, password);
            if (!loginResult.success) {
                loginResult = await loginClient(email, password);
            }
        }

        if (!loginResult.success) {
            return res.status(404).json({ message: loginResult.message });
        }

        return res.json(loginResult);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internaaaaaaaaaaaal server error" });
    }
};

const registerA = async (req, res) => {
    const { nom, prenom, email, password, telephone, adresse, dateDeNaissance, genre } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        if (genre && !["femme", "homme"].includes(genre)) {
            return res.status(422).json({ message: "Genre must be 'femme' or 'homme'" });
        }

        const userData = {
            nom_admin: nom,
            prenom_admin: prenom,
            email_admin: email,
            mdp: hashedPassword,
            telephone_admin: telephone,
            adresse_admin: adresse,
            date_de_naissance_admin: dateDeNaissance,
            genre_admin: genre || null,
            etat_compte: 'active'
        };

        const result = await db.query('INSERT INTO admin SET ?', userData);

        if (result) {
            console.log("Admin registered successfully");
            db.query(`UPDATE admin SET date_inscription_admin = now() WHERE idadmin = ?`, [result.insertId], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Internal server error" });
                }
                console.log("User registered successfully");
            });
            res.json({ message: "Inscription réussie" });
        } else {
            console.error("Error registering admin");
            res.status(500).json({ message: "Erreur lors de l'inscription" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};


const registerE = async (req, res) => {
    const { nom, prenom, email, password, telephone, adresse, dateDeNaissance, genre } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);


        if (genre && !["femme", "homme"].includes(genre)) {
            return res.status(422).json({ message: "Genre must be 'femme' or 'homme'" });
        }

        const userData = {
            nom_employe: nom,
            prenom_employe: prenom,
            email_employe: email,
            mdp: hashedPassword,
            photo_employe: null,
            telephone_employe: telephone,
            adresse_employe: adresse,
            //datede_naissance_employe: dateDeNaissance , 
            datede_naissance_employe: dateDeNaissance,
            date_inscription_employe: new Date(),
            genre_employe: genre || "femme",
            etat_compte: 'inactive'
        };
        //ENUM('femme', 'homm')

        const result = await db.query('INSERT INTO employe SET ?', userData);

        if (result) {
            console.log("Employee registered successfully");
            res.json({ message: "Inscription réussie" });
            console.log(result);
        } else {
            console.error("Error registering employee");
            res.status(500).json({ message: "Erreur lors de l'inscription" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const registerC = async (req, res) => {
    const { nom, prenom, email, password, telephone, adresse, dateDeNaissance, genre } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        if (genre && !["femme", "homme"].includes(genre)) {
            return res.status(422).json({ message: "Genre must be 'femme' or 'homme'" });
        }

        const userData = {
            nom_client: nom,
            prenom_client: prenom,
            email_client: email,
            mdp: hashedPassword,
            photo_client: null,
            telephone_client: telephone,
            adresse_client: adresse,
            datede_naissance_client: dateDeNaissance,
            date_inscription_client: new Date(),
            genre_client: genre || "femme",
            etat_compte: 'inactive'
        };

        const result = await db.query('INSERT INTO client SET ?', userData);

        if (result) {
            console.log("User registered successfully");
            console.log(result);
            res.json({ message: "Inscription réussieeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" });
        } else {
            console.error("Error registering user");
            res.status(500).json({ message: "Erreur lors de l'inscription" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

const registerUser = async (req, res) => {
    const { typeUtilisateur } = req.body;

    if (typeUtilisateur === 'employee') {
        return registerE(req, res);
    } else if (typeUtilisateur === 'client') {
        return registerC(req, res);
    } else {
        return res.status(422).json({ message: "Invalid user type" });
    }
};





module.exports = { loginAdmin, loginEmploye, loginClient, loginUser, registerA, registerE, registerC, registerUser, getUserById };