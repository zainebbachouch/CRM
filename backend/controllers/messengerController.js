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


const updateSeenNotification = async (req, res) => {
    try {
        const updateQuery = `
            UPDATE notification 
            SET seen = true 
            WHERE email_destinataire = ? AND seen = false
        `;

        const updateResult = await new Promise((resolve, reject) => {
            db.query(updateQuery, [req.body.email_destinataire], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.json({ notificationsUpdated: updateResult });

    } catch (error) {
        console.error('Error updating notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getUnreadCount = async (req, res) => {
    try {
        const { email_destinataire } = req.params;
        const query = 'SELECT COUNT(*) as unreadCount FROM notification WHERE email_destinataire = ? AND seen = false';

        const unreadCount = await new Promise((resolve, reject) => {
            db.query(query, [email_destinataire], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result[0].unreadCount);
                }
            });
        });

        res.json({ unreadCount });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getNotifications,
    deleteNotification,
    updateSeenNotification,
    getUnreadCount
};
