const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ')

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

const getAllHistoryById = async (req, res) => {
    try {
      // Authorization check
      const authResult = await isAuthorize(req, res);
      if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      // Role check
      const { role } = authResult.decode;
      if (!['admin', 'employe', 'client'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
  
      const { client_idclient, employe_idemploye, admin_idadmin } = req.query;
  
      if (!client_idclient && !employe_idemploye && !admin_idadmin) {
        return res.status(400).json({ message: "Bad Request: At least one ID parameter must be provided" });
      }
  
      let query = 'SELECT * FROM historique WHERE ';
      const conditions = [];
      const values = [];
  
      if (client_idclient) {
        conditions.push('client_idclient = ?');
        values.push(client_idclient);
      }
  
      if (employe_idemploye) {
        conditions.push('employe_idemploye = ?');
        values.push(employe_idemploye);
      }
  
      if (admin_idadmin) {
        conditions.push('admin_idadmin = ?');
        values.push(admin_idadmin);
      }
  
      query += conditions.join(' OR ');
  
      const historiqueResult = await new Promise((resolve, reject) => {
        db.query(query, values, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
  
      res.json({ historique: historiqueResult });
    } catch (error) {
      console.error('Error fetching historique:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const deleteHistoryById = async (req, res) => {
    try {
      const authResult = await isAuthorize(req, res);
      if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const { role } = authResult.decode;
      const { idAction } = req.params;
  
      const query = `
        DELETE FROM historique 
        WHERE idaction = ? AND (
          (client_idclient = ? AND ? = 'client') OR 
          (employe_idemploye = ? AND ? = 'employe') OR 
          (admin_idadmin = ? AND ? = 'admin')
        )
      `;
  
      const values = [idAction, idAction, role, idAction, role, idAction, role];
  
      await new Promise((resolve, reject) => {
        db.query(query, values, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
  
      res.json({ message: 'History deleted successfully' });
    } catch (error) {
      console.error('Error deleting history:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

module.exports = {
    getNotifications,
    deleteNotification,
    updateSeenNotification,
    getUnreadCount,
    getAllHistoryById,
    deleteHistoryById
};
