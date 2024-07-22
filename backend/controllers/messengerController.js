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
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { role } = authResult.decode;
        if (!['admin', 'employe', 'client'].includes(role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { client_idclient, employe_idemploye, admin_idadmin } = req.query;

        if (!client_idclient && !employe_idemploye && !admin_idadmin) {
            return res.status(400).json({ message: "Bad Request: At least one ID parameter must be provided" });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10
        const offset = (page - 1) * limit;

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

        query += conditions.join(' OR ') + ' LIMIT ? OFFSET ?';
        values.push(limit, offset);

        const totalQuery = 'SELECT COUNT(*) as total FROM historique WHERE ' + conditions.join(' OR ');
        const totalResult = await new Promise((resolve, reject) => {
            db.query(totalQuery, values.slice(0, -2), (err, result) => {
                if (err) return reject(err);
                resolve(result[0].total);
            });
        });

        const historiqueResult = await new Promise((resolve, reject) => {
            db.query(query, values, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.json({
            historique: historiqueResult,
            total: totalResult,
            page,
            limit,
            totalPages: Math.ceil(totalResult / limit)
        });
    } catch (error) {
        console.error('Error fetching historique:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const searchHistoryByDate = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { role } = authResult.decode;
        if (!['admin', 'employe', 'client'].includes(role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { startDate, endDate, client_idclient, employe_idemploye, admin_idadmin, description_action } = req.query;

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        let conditions = [];
        let values = [];

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
        if (startDate && endDate) {
            conditions.push('date_action BETWEEN ? AND ?');
            values.push(startDate, endDate);
        }
        if (description_action) {
            conditions.push('description_action LIKE ?');
            values.push(`%${description_action}%`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const totalResultsQuery = `SELECT COUNT(*) AS total FROM historique ${whereClause}`;
        const totalResult = await new Promise((resolve, reject) => {
            db.query(totalResultsQuery, values, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const total = totalResult[0].total;

        const historyQuery = `SELECT * FROM historique ${whereClause} ORDER BY date_action DESC LIMIT ? OFFSET ?`;
        const history = await new Promise((resolve, reject) => {
            db.query(historyQuery, [...values, limit, offset], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.json({
            historique: history,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Error searching history by date:', error);
        res.status(500).json({ message: 'Server error' });
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



  
const searchNotificationsByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Bad Request: Both startDate and endDate must be provided" });
        }

        // Query to get notifications within the specified date range
        const query = `
            SELECT id, email_destinataire, message, date 
            FROM notification 
            WHERE date BETWEEN ? AND ?
        `;
        const values = [startDate, endDate];

        const notificationResult = await new Promise((resolve, reject) => {
            db.query(query, values, (err, result) => {
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
    getNotifications,
    deleteNotification,
    updateSeenNotification,
    getUnreadCount,
    getAllHistoryById,
    deleteHistoryById,
    searchHistoryByDate,
    searchNotificationsByDate

};
