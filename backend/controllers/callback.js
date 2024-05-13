// Fonction pour enregistrer une action dans la table d'historique
const db = require("../config/dbConnection");



const saveToHistory = async (description, actionPerformerId, role) => {
    try {
        let sqlQuery = '';
        let id = actionPerformerId;

        // Selon le rôle de l'utilisateur, définissez l'ID et la requête SQL appropriés
        switch (role) {
            case 'admin':               
                sqlQuery = 'INSERT INTO historique (date_action, heure_action, description_action, admin_idadmin) VALUES (NOW(), NOW(), ?, ?)';
                break;

           case 'client':              
                sqlQuery = 'INSERT INTO historique (date_action, heure_action, description_action, client_idclient) VALUES (NOW(), NOW(), ?, ?)';
                break;

            case 'employe':             
                sqlQuery = 'INSERT INTO historique (date_action, heure_action, description_action,employe_idemploye) VALUES (NOW(), NOW(), ?, ?)';
                break;

            default:
                console.error("Rôle d'utilisateur invalide:", role);
                throw new Error("Invalid user role");
        }

        const result = await db.query(
            sqlQuery,
            [description, id]
        );
        console.log("Action enregistrée dans l'historique avec succès");
        return result;
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'action dans l'historique:", error);
        throw error;
    }
};





module.exports = {saveToHistory};
