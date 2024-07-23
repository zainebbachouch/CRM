// notificationUtils.js
const db = require('./db'); // Assurez-vous que le module 'db' est correctement exporté

const saveNotification = async (email_destinataires, message, emailsender) => {
    try {
      const sqlQuery = 'INSERT INTO notification (email_destinataire, message, date, email_sender,seen ,unreadCount ) VALUES (?, ?, NOW(), ?,?,1)';
      const results = [];
      //const updateQuery = 'UPDATE notification SET unreadCount = unreadCount + 1 WHERE email_destinataire = ?';

      for (const email of email_destinataires) {
        // Skip inserting if email is same as sender's email
        if (email === emailsender) {
          continue;
        }

        const result = await db.query(sqlQuery, [email, message, emailsender, true]);
        console.log("Notification enregistrée avec succès pour:", email);
        results.push(result);

      //  const updateResult = await db.query(updateQuery, [email]);
       // console.log(`Unread count mis à jour pour ${email}:`, updateResult);
      }

      return results;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la notification:", error);
      throw error;
    }
  };

module.exports = { saveNotification };
