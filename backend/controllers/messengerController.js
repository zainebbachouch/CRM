const db = require("../config/dbConnection");

// Récupérer toutes les notifications
const getNotifications = async (req, res) => {
    try {
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

// Supprimer une notification par ID
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await new Promise((resolve, reject) => {
            const query = 'DELETE FROM notification WHERE id = ?';
            db.query(query, [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification non trouvée' });
        }

        res.json({ message: 'Notification supprimée avec succès' });

    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getNotifications,
    deleteNotification
};
