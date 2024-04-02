const db = require("../config/dbConnection");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key';
const { creatToken } = require('../services/createTokenService.js');


const login = async (req, res) => {
    const { email, password } = req.body;

    try {/// tous qui est requete modifier 
        const query = 'SELECT * FROM admin WHERE email_admin = ? LIMIT 1';
        db.query(query, [email], async (err, result) => {
            if (err) {
                return res.status(400).send({ msg: err });
            }

            console.log("Query results:", result);

            if (result.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }


            const user = result[0];
            console.log("User data:", user);
            const isPasswordValid = await bcrypt.compare(password, user.mdp);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid password" });
            }

            const token = await creatToken(user.idadmin, user.email_admin, JWT_SECRET, '1h');

            db.query(`UPDATE admin SET date_inscription_admin = now() WHERE idadmin = ?`, [user.idadmin], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Internal server error" });
                }

                res.json({ message: "Login successful", token: token });
            });
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



const register = async (req, res) => {
    const { nom, prenom, email, password, telephone, adresse, dateDeNaissance, genre } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Validate genre field
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
            genre: genre || null, // Optional field, set to null if not provided
            etat_compte: 'active' // Automatically set to 'active'
        };

        const result = await db.query('INSERT INTO admin SET ?', userData);

        // You had a typo here, it should be db.query, not dbquery
        db.query(`UPDATE admin SET date_inscription_admin = now() WHERE idadmin = ?`, [result.insertId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal server error" });
            }
            console.log("User registered successfully");
        });

        res.json({ message: "Inscription réussie" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
};



const getUserById = async (req, res) => {
    const id = req.params.id;

    try {
        const query = 'SELECT email_admin, mdp FROM admin WHERE idadmin = ?';
        db.query(query, [req.user.id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Server error' });
            }

            console.log("Query results:", results);

            if (!results || results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const user = results[0];
            const email = user.email_admin;
            const password = user.mdp;
            res.status(200).json({ email, password });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = { login, register, getUserById };