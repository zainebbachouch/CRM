const db = require("../config/dbConnection");
//const { isAuthorize } = require("../services/validateToken");

const getNotifications = async (req, res) => {
    try {
        /*const authResult = await isAuthorize(req, res);

        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!['admin', 'employe', 'client'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        if (!authResult.decode.id) {
            console.error("Client ID not found in token");
            return res.status(401).json({ message: "Unauthorized" });
        }
*/
        const notificationResult = await new Promise((resolve, reject) => {
            const query = 'SELECT id, email_destinataire, message, date FROM notification;';
            db.query(query, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.json({ notifications: notificationResult });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getNotifications
};
