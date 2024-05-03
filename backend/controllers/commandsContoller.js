const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ');


const getAllCommands = async (req, res) => {
    // Authorization check
    const authResult = await isAuthorize(req, res);
    if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Check role
    if (!['admin', 'employe'].includes(authResult.decode.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    // Construct SQL query
    const sqlQuery = 'SELECT * FROM commande';

    // Execute SQL query
    db.query(sqlQuery, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        res.json(result);
    });
};


const updateCommandStatus = async (req, res) => {
    // Authorization check
    const authResult = await isAuthorize(req, res);
    if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Check role
    if (!['admin', 'employe'].includes(authResult.decode.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { idcommande, newStatus } = req.body;

    if (!idcommande || !newStatus) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if newStatus is valid
    const validStatus = ['enattente', 'traitement', 'expédié', 'livré'];
    if (!validStatus.includes(newStatus)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    // Construct SQL query
    const sqlQuery = 'UPDATE commande SET statut_commande = ? WHERE idcommande = ?';

    // Execute SQL query
    db.query(sqlQuery, [newStatus, idcommande], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        res.json({ message: "Command status updated successfully" });
    });
};


const getCommandsByClientId = async (req, res) => {
    // Authorization check
    const authResult = await isAuthorize(req, res);
    if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Check role
    if (!['admin', 'employe'].includes(authResult.decode.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { clientId } = req.params;

    // Construct SQL query with JOIN
    const sqlQuery = 'SELECT c.* FROM commande c INNER JOIN client cl ON c.client_idclient = cl.idclient WHERE cl.idclient = ?';

    // Execute SQL query
    db.query(sqlQuery, [clientId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        res.json(result);
    });
};



module.exports = {getAllCommands ,updateCommandStatus,getCommandsByClientId}