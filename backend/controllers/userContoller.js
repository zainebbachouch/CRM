const db = require("../config/dbConnection");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const { isAuthorize } = require('../services/validateToken ')
const { createToken } = require('../services/createTokenService.js');
const { saveToHistory, getInformationOfRole, updateInformationOfRole } = require('./callback')
const nodemailer = require('nodemailer');





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

        const token = await createToken("admin", user.idadmin, user.email_admin, process.env.JWT_SECRET);
        const { mdp, ...others } = user;

        /*  res.cookie("accessToken", token, {
              httpOnly: true,
              sameSite: "none",
              secure: true,
          }).status(200).json({ role: 'admin', user: { username: user.nom_admin }, others });*/


        db.query(`UPDATE admin SET date_inscription_admin = NOW() WHERE idadmin = ?`, [user.idadmin]);

        // Log the login action to history
        const userId = user.idadmin;
        const userRole = 'admin'; // Assuming there is no 'role' field in the user object
        console.log('User connected:', userId);
        await saveToHistory('Statut connecter pour client ', userId, userRole);



        return { success: true, message: "Login successful", token: token, role: 'admin', user: { username: user.nom_admin, id: user.idadmin } };
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

        const token = await createToken("employe", user.idemploye, user.email_employe, process.env.JWT_SECRET);


        /*  res.cookie("accessToken", token, {
              httpOnly: true,
              sameSite: "none",
              secure: true,
          }).status(200).json({ role: 'employe', user: { username: user.nom_employe }, others });*/

        db.query(`UPDATE employe SET date_inscription_employe = NOW() WHERE idemploye = ?`, [user.idemploye]);

        // Log the login action to history
        const userId = user.idemploye;
        const userRole = 'employe'; // Assuming there is no 'role' field in the user object
        console.log('User connected:', userId);
        await saveToHistory('Statut connecter pour employe ', userId, userRole);

        return { success: true, message: "Login successful", token: token, role: 'employe', user: { username: user.nom_employe, id: user.idemploye } };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Internal server error" };
    }
};

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
            return { success: false, message: "Invalid password" };
        }

        const token = await createToken("client", user.idclient, user.email_client, process.env.JWT_SECRET);


        /* res.cookie("accessToken", token, {
             httpOnly: true,
             sameSite: "none",
             secure: true,
         }).status(200).json({ role: 'client', user: { username: user.nom_client }, others });*/

        db.query(`UPDATE client SET date_inscription_client = NOW() WHERE idclient = ?`, [user.idclient]);


        // Log the login action to history
        const userId = user.idclient;
        const userRole = 'client'; // Assuming there is no 'role' field in the user object
        console.log('User connected:', userId);
        await saveToHistory('Statut connecter pour client ', userId, userRole);



        //saveToHistory('Statut connecter', userId, userRole);
        return {
            success: true, message: "Login successful", token: token, role: 'client', user: { username: user.nom_client, id: user.idemploye }
        };

    } catch (error) {
        console.error(error);
        return { success: false, message: "Internal server error" };
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
        return res.status(500).json({ message: "Internal server error" });
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







/*************************************************************************
 * *******************************************************************
 * ***********************************************************
 */


const listEmployees = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        /* if (!['admin'].includes(authResult.decode.role)) {
             return res.status(403).json({ message: "Insufficient permissions" });
         }*/
        if (authResult.decode.role !== 'admin') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const result = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM employe', (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};


const listClients = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['admin', 'employe'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const result = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM client', (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};


const deleteEmployee = async (req, res) => {
    const { id } = req.params;

    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        /*   if (!['admin'].includes(authResult.decode.role)) {
               return res.status(403).json({ message: "Insufficient permissions" });
           }*/
        if (authResult.decode.role !== 'admin') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const result = await new Promise((resolve, reject) => {
            db.query('DELETE FROM employe WHERE idemploye = ?', [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }
        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;
        saveToHistory('Statut de la employe supprimer', userId, userRole);
        res.json({ message: "Employee deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};


const deleteClient = async (req, res) => {
    const { id } = req.params;

    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['admin', 'employe'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const result = await new Promise((resolve, reject) => {
            db.query('DELETE FROM client WHERE idclient = ?', [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Client not found" });
        }
        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;
        saveToHistory('Statut de la client supprimer', userId, userRole);
        res.json({ message: "Client deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};



const updateEmployeeStatus = async (req, res) => {
    const { id } = req.params;
    const { etat_compte } = req.body;

    if (!['active', 'inactive'].includes(etat_compte)) {
        return res.status(400).json({ message: "Invalid account status" });
    }

    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        /*   if (!['admin'].includes(authResult.decode.role)) {
               return res.status(403).json({ message: "Insufficient permissions" });
           }*/
        if (authResult.decode.role !== 'admin') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const result = await new Promise((resolve, reject) => {
            db.query('UPDATE employe SET etat_compte = ? WHERE idemploye = ?', [etat_compte, id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const employee = await new Promise((resolve, reject) => {
            db.query('SELECT nom_employe, prenom_employe, email_employe FROM employe WHERE idemploye = ?', [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });

        const { nom_employe, prenom_employe, email_employe } = employee;
        const statusMessage = etat_compte === 'active' ? 'active' : 'inactive';
        const recipients = [{ email: email_employe, name: `${prenom_employe} ${nom_employe}`, status: statusMessage }];

        if (etat_compte === 'active') {
            await sendActivationEmails(recipients);
        } else {
            await sendDeactivationEmails(recipients);
        }
        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;
        saveToHistory('updateEmployeeStatus', userId, userRole);
        res.json({ message: "Employee status updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateClientStatus = async (req, res) => {
    const { id } = req.params;
    const { etat_compte } = req.body;

    if (!['active', 'inactive'].includes(etat_compte)) {
        return res.status(400).json({ message: "Invalid account status" });
    }

    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['admin', 'employe'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const result = await new Promise((resolve, reject) => {
            db.query('UPDATE client SET etat_compte = ? WHERE idclient = ?', [etat_compte, id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Client not found" });
        }


        const client = await new Promise((resolve, reject) => {
            db.query('SELECT nom_client, prenom_client, email_client FROM client WHERE idclient = ?', [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });

        const { nom_client, prenom_client, email_client } = client;
        const statusMessage = etat_compte === 'active' ? 'active' : 'inactive';
        const recipients = [{ email: email_client, name: `${prenom_client} ${nom_client}`, status: statusMessage }];


        if (etat_compte === 'active') {
            await sendActivationEmails(recipients);
        } else {
            await sendDeactivationEmails(recipients);
        }
        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;
        saveToHistory('Update Status Client', userId, userRole);
        res.json({ message: "Client deleted successfully" });
        res.json({ message: "Client status updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};




/*
const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false, 
    auth: {
        user: 'zaineb.bachouch@gmail.com',
        pass: process.env.PASSMAIL 
    }
});
  */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'zaineb.bachouch@gmail.com',
        pass: process.env.PASSMAIL
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: 'zaineb.bachouch@gmail.com',
            to,
            subject,
            html,
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};



const sendActivationEmails = async (recipients) => {
    const subject = 'Account Activation';
    try {
        await Promise.all(recipients.map(async (recipient) => {
            const { email, name, status } = recipient;
            const html = `
                <p>Hello ${name},</p>
                <p>Your account status is now ${status}.</p>
                <p>Welcome to our platform!</p>
            `;
            await sendEmail(email, subject, html);
            console.log(email)
        }));
        console.log('Activation emails sent successfully');
    } catch (error) {
        console.error('Error sending activation emails:', error);
    }
};

const sendDeactivationEmails = async (recipients) => {
    const subject = 'Account Deactivation';
    try {
        await Promise.all(recipients.map(async (recipient) => {
            const { email, name, status } = recipient;
            const html = `
                <p>Hello ${name},</p>
                <p>Your account status is now ${status}.</p>
                <p>We are sorry to see you go.</p>
            `;
            await sendEmail(email, subject, html);
            console.log(email)
        }));
        console.log('Deactivation emails sent successfully');
    } catch (error) {
        console.error('Error sending deactivation emails:', error);
    }
};





/*************************** ,**********************************************
 * *******************************************************************
 * ***********************************************************
 */


const listAdminAuthorized = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['admin'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        const userId = authResult.decode.id;
        const result = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM admin WHERE idadmin = ?', [userId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const listEmployeAuthorized = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['employe', 'admin'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        const id = req.params.id;
        const result = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM employe WHERE idemploye = ?', [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const listClientAuthorized = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['employe', 'admin', 'client'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        const id = req.params.id;
        const result = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM client WHERE idclient = ?', [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};





const getAdminInformation = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (authResult.decode.role !== 'admin') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        const id = req.params.id;

        const adminInfo = await getInformationOfRole('admin', id);
        if (!adminInfo) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.json(adminInfo);
    } catch (error) {
        console.error("Error retrieving admin information:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getClientInformation = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['client'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const id = req.params.id;
        const clientInfo = await getInformationOfRole('client', id);

        if (!clientInfo) {
            return res.status(404).json({ message: "Client not found" });
        }

        res.json(clientInfo);
    } catch (error) {
        console.error("Error retrieving client information:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getEmployeInformation = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['employe'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const id = req.params.id;
        const employeInfo = await getInformationOfRole('employe', id);

        if (!employeInfo) {
            return res.status(404).json({ message: "Employe not found" });
        }

        res.json(employeInfo);
    } catch (error) {
        console.error("Error retrieving employe information:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};




const updateAdminInformation = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (authResult.decode.role !== 'admin') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        const id = req.params.id;

        // Get existing admin information
        const existingAdminInfo = await getInformationOfRole('admin', id);
        if (!existingAdminInfo) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Merge the request body with the existing data
        const updatedAdminInfo = { ...existingAdminInfo };
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                updatedAdminInfo[key] = req.body[key];
            }
        });

        // Update the database
        const result = await updateInformationOfRole('admin', id, updatedAdminInfo);
        if (result) {
            res.json({ message: "Admin information updated successfully" });
        } else {
            res.status(500).json({ message: "Failed to update admin information" });
        }
    } catch (error) {
        console.error("Error updating admin information:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const updateClientInformation = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const id = req.params.id;
        if (authResult.decode.role === 'client') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        // Get existing client information
        const existingClientInfo = await getInformationOfRole('client', id);
        if (!existingClientInfo) {
            return res.status(404).json({ message: "Client not found" });
        }

        // Merge the request body with the existing data
        const updatedClientInfo = { ...existingClientInfo };
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                updatedClientInfo[key] = req.body[key];
            }
        });

        // Update the database
        const result = await updateInformationOfRole('client', id, updatedClientInfo);
        if (result) {
            res.json({ message: "Client information updated successfully" });
        } else {
            res.status(500).json({ message: "Failed to update client information" });
        }
    } catch (error) {
        console.error("Error updating client information:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



const updateEmployeInformation = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const id = req.params.id;
        if (authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        // Get existing employe information
        const existingEmployeInfo = await getInformationOfRole('employe', id);
        if (!existingEmployeInfo) {
            return res.status(404).json({ message: "Employe not found" });
        }

        // Merge the request body with the existing data
        const updatedEmployeInfo = { ...existingEmployeInfo };
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                updatedEmployeInfo[key] = req.body[key];
            }
        });

        // Update the database
        const result = await updateInformationOfRole('employe', id, updatedEmployeInfo);
        if (result) {
            res.json({ message: "Employe information updated successfully" });
        } else {
            res.status(500).json({ message: "Failed to update employe information" });
        }
    } catch (error) {
        console.error("Error updating employe information:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

///////////////////////////////////////**////////////////////////////
/****************************************************************** */
/*const sendMailEmploye = async (req, res) => {

    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (authResult.decode.role !== 'admin') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
   // Récupérer les données de l'email depuis la requête
   const { to, subject, message } = req.body;

   // Vérification des données
   if (!to || !subject || !message) {
       return res.status(400).json({ message: "Incomplete email data" });
   }

   // Envoyer l'email
   await sendEmail(to, subject, message);
    
    } catch (error) {
        console.error("Error send mail to employe information:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

*/





const sendMailEmploye = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { to, subject, message, recipientRole, recipientId } = req.body;

        if (!to || !subject || !message) {
            return res.status(400).json({ message: "Incomplete email data" });
        }

        const emailId = await insertEmailIntoDatabase(to, subject, message);

        await insertEmailSender(emailId, authResult.decode.id, authResult.decode.role);

        await insertEmailRecipient(emailId, recipientId, recipientRole);

        await sendEmail(to, subject, message);

        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email to employe:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const insertEmailIntoDatabase = async (to, subject, message) => {
    try {
        const query = 'INSERT INTO emails (to_email, subject, message) VALUES (?, ?, ?)';
        const result = await new Promise((resolve, reject) => {
            db.query(query, [to, subject, message], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
        return result.insertId;
    } catch (error) {
        console.error("Error inserting email into database:", error);
        throw error;
    }
};

async function insertEmailSender(emailId, senderId, senderRole) {
    try {
        let query;
        if (senderRole === 'admin') {
            query = `INSERT INTO email_senders (email_id, sender_admin_id) VALUES (?, ?)`;
        } else if (senderRole === 'employee') {
            query = `INSERT INTO email_senders (email_id, sender_employe_id) VALUES (?, ?)`;
        } else if (senderRole === 'client') {
            query = `INSERT INTO email_senders (email_id, sender_client_id) VALUES (?, ?)`;
        }

        if (!query) {
            throw new Error('Invalid sender role');
        }

        await new Promise((resolve, reject) => {
            db.query(query, [emailId, senderId], (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error("Error inserting email sender into database:", error);
        throw error;
    }
}

async function insertEmailRecipient(emailId, recipientId, recipientRole) {
    try {
        let query;
        if (recipientRole === 'admin') {
            query = `INSERT INTO email_recipients (email_id, recipient_admin_id) VALUES (?, ?)`;
        } else if (recipientRole === 'employee') {
            query = `INSERT INTO email_recipients (email_id, recipient_employe_id) VALUES (?, ?)`;
        } else if (recipientRole === 'client') {
            query = `INSERT INTO email_recipients (email_id, recipient_client_id) VALUES (?, ?)`;
        }

        if (!query) {
            throw new Error('Invalid recipient role');
        }

        await new Promise((resolve, reject) => {
            db.query(query, [emailId, recipientId], (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error("Error inserting email recipient into database:", error);
        throw error;
    }
}





const listEmails = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const sqlQuery = 'SELECT * FROM emails';


        const result = await new Promise((resolve, reject) => {
            db.query(sqlQuery, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.json({ result });
    }
    catch (error) {
        console.error("Error list email ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    listEmployees, listClients, updateEmployeeStatus, updateClientStatus, deleteEmployee, deleteClient,

    loginAdmin, loginEmploye, loginClient, loginUser, registerA, registerE, registerC, registerUser, getUserById, getAdminInformation,

    getClientInformation, getEmployeInformation, updateAdminInformation, updateClientInformation,

    updateEmployeInformation, listAdminAuthorized, listEmployeAuthorized, listClientAuthorized, sendMailEmploye,

    listEmails
};