const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoute = require("./routes/userRoute");
const categorieRoute = require("./routes/categorieRoute");
const productRoute = require("./routes/productRoute");
const baskeRoute = require("./routes/baskeRoute");
const commandsRoute = require("./routes/commandsRoute");
const factureRoute = require("./routes/factureRoute");
const autorisationRoute = require("./routes/autorisationRoute");
const messengerRoute = require("./routes/messengerRoutes");
const http = require('http');
const socketIo = require('socket.io');
const db = require('./config/dbConnection');
const { saveNotification, getInformationOfRole } = require('./controllers/callback'); // Importer la fonction saveNotification
const { createProduct } = require('./controllers/productController');
const { passCommand } = require('./controllers/basketController');
const { updateCommandStatus } = require('./controllers/commandsContoller')





const cookieParser = require("cookie-parser");
const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Refresh-Token'],
  }
});
//app.use(cors()); 

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  //origin: "http://127.0.0.1:3000",
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Refresh-Token'],
  optionsSuccessStatus: 200,
  // add this line
  // exposeHeaders: ['Set-Cookie'],
  //debug: true,*/

}));

app.use(cookieParser());


app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`Response sent: ${res.statusCode} ${res.statusMessage}`);
  });
  next();
});

app.use('/api', userRoute);
app.use('/api', categorieRoute);
app.use('/api', productRoute);
app.use('/api', baskeRoute);
app.use('/api', commandsRoute);
app.use('/api', factureRoute);
app.use('/api', autorisationRoute);
app.use('/api', messengerRoute);


app.get('/api/listMessages', (req, res) => {
  const { sender_id, receiver_id } = req.query;
  const query = `
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) 
       OR (sender_id = ? AND receiver_id = ?) 
    ORDER BY timestamp ASC`;

  db.query(query, [sender_id, receiver_id, receiver_id, sender_id], (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      res.status(500).send('Error fetching messages');
      return;
    }
    res.status(200).json({ messages: results });
    console.log(results);
  });
});


app.get('/api/conversations', (req, res) => {
  const userId = req.query.userId;
  const query = `
  SELECT 
    CASE 
        WHEN sender_id = ? THEN receiver_id 
        ELSE sender_id 
    END AS id,
    CASE 
        WHEN sender_id = ? THEN rolereciever 
        ELSE rolesender 
    END AS role,
    COALESCE(c.nom_client, e.nom_employe, a.nom_admin) AS name,
    COALESCE(c.prenom_client, e.prenom_employe, a.prenom_admin) AS prenom,
    COALESCE(c.photo_client, e.photo_employe, a.photo_admin) AS photo,
    (SELECT message FROM messages 
        WHERE (sender_id = ? AND receiver_id = CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END) 
           OR (sender_id = CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AND receiver_id = ?)
        ORDER BY timestamp DESC LIMIT 1) AS message
  FROM messages 
  LEFT JOIN client c ON c.idclient = CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
  LEFT JOIN employe e ON e.idemploye = CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
  LEFT JOIN admin a ON a.idadmin = CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
  WHERE sender_id = ? OR receiver_id = ?
  GROUP BY id, role, name, prenom, photo
  ORDER BY timestamp DESC;
`;

  db.query(query, [userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId], (err, results) => {
    if (err) {
      console.error('Error fetching conversations:', err);
      res.status(500).send('Error fetching conversations');
      return;
    }
    res.status(200).json({ conversations: results });
  });
});


app.get('/api/allUsers', (req, res) => {
  const query = `
    SELECT idadmin AS userId, 'admin' AS role, nom_admin AS name, prenom_admin AS prenom, photo_admin AS photo FROM admin
    UNION
    SELECT idemploye AS userId, 'employe' AS role, nom_employe AS name, prenom_employe AS prenom, photo_employe AS photo FROM employe
    UNION
    SELECT idclient AS userId, 'client' AS role, nom_client AS name, prenom_client AS prenom, photo_client AS photo FROM client;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Error fetching users');
      return;
    }
    res.status(200).json({ users: results });
  });
});




const userSocketMap = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  // Assuming you have a way to get the userId, for example through a query parameter or an event
  const userId = socket.handshake.query.userId; // or through an authentication event
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  socket.on('sendMessage', async (message) => {
    const query = `INSERT INTO messages (sender_id, rolesender, receiver_id, rolereciever, message) VALUES (?, ?, ?, ?, ?)`;

    try {
      await db.query(query, [message.sender_id, message.rolesender, message.receiver_id, message.rolereciever, message.message]);
      console.log('Message inserted into database:', message);

      // Retrieve sender and receiver information
      const senderInfo = await getInformationOfRole(message.rolesender, message.sender_id);
      const receiverInfo = await getInformationOfRole(message.rolereciever, message.receiver_id);

      if (senderInfo && receiverInfo) {
        let senderName;
        if (message.rolesender === 'admin') {
          senderName = `${senderInfo.nom_admin} ${senderInfo.prenom_admin} ${senderInfo.photo_admin}`;
        } else if (message.rolesender === 'client') {
          senderName = `${senderInfo.nom_client} ${senderInfo.prenom_client} ${senderInfo.photo_client}`;
        } else if (message.rolesender === 'employe') {
          senderName = `${senderInfo.nom_employe} ${senderInfo.prenom_employe} ${senderInfo.photo_employe}`;
        }

        const notificationMessage = `New message from ${senderName} (${message.sender_id}) to ${message.receiver_id}: ${message.message}`;

        const email_destinataire = receiverInfo[`email_${message.rolereciever}`];
        await saveNotification(email_destinataire, notificationMessage);

        // Emit notification only to the receiver
        const receiverSocketId = userSocketMap[message.receiver_id];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveNotification', {
            message: notificationMessage,
            timestamp: new Date().toISOString(),
            sender_id: message.sender_id
          });
        }
      }

      const emittedMessage = { ...message, timestamp: new Date().toISOString() };
      io.emit('receiveMessage', emittedMessage);

    } catch (err) {
      console.error('Error inserting message or saving notification:', err);
    }
  });

  // Function to save notification for each email
  const saveNotifications = async (email_destinataires, message) => {
    try {
      const sqlQuery = 'INSERT INTO notification (email_destinataire, message, date) VALUES (?, ?, NOW())';
      const results = [];

      // Iterate through each email and save notification
      for (const email of email_destinataires) {
        const result = await db.query(sqlQuery, [email, message]);
        console.log("Notification enregistrée avec succès pour:", email);
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la notification:", error);
      throw error;
    }
  };

  // Handle newProduct event
  socket.on('newProduct', async (product) => {
    console.log('New product added:', product);

    try {
      const req = { body: product }; // Simulating req object
      await createProduct(req, {
        status: (code) => ({
          json: (data) => {
            console.log(`Response sent: ${code} ${JSON.stringify(data)}`);
            // Handle response if needed
          }
        }),
      });

      // Query all users (admins, employees, clients)
      const queryPromise = (sql) => {
        return new Promise((resolve, reject) => {
          db.query(sql, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        });
      };

      const [admins, employees, clients] = await Promise.all([
        queryPromise('SELECT * FROM admin'),
        queryPromise('SELECT * FROM employe'),
        queryPromise('SELECT * FROM client')
      ]);

      console.log('Admins:', admins);
      console.log('Employees:', employees);
      console.log('Clients:', clients);

      const notificationMessage = `A new product has been added: ${product.nom_produit}`;

      // Send notifications to admins (excluding the sender)
      const adminEmails = admins
        .filter(admin => admin.idadmin !== userId)
        .map(admin => admin.email_admin);
      await saveNotifications(adminEmails, notificationMessage);

      // Send notifications to employees (excluding the sender)
      const employeeEmails = employees
        .filter(employee => employee.idemploye !== userId)
        .map(employee => employee.email_employe);
      await saveNotifications(employeeEmails, notificationMessage);

      // Send notifications to clients
      const clientEmails = clients
        .map(client => client.email_client);
      await saveNotifications(clientEmails, notificationMessage);

      // Notify all users about the new product, excluding the sender
      const senderSocketId = userSocketMap[userId];
      for (const socketId in userSocketMap) {
        if (socketId !== senderSocketId) {
          io.to(userSocketMap[socketId]).emit('receiveNotification', {
            message: notificationMessage,
            timestamp: new Date().toISOString(),
            product_id: product.id
          });
        }
      }
    } catch (error) {
      console.error('Error creating product in index.js:', error);
    }
  });

  // Handle newProduct event
  socket.on('passCommand', async (commandData) => {
    console.log('passCommand received', commandData);
    try {
      const req = { body: commandData }; // Simulating req object
      await passCommand(req, {
        status: (code) => ({
          json: (data) => {
            console.log(`Response sent: ${code} ${JSON.stringify(data)}`);
            // Handle response if needed
          }
        }),
      });

      // Query all users (admins, employees, clients)
      const queryPromise = (sql) => {
        return new Promise((resolve, reject) => {
          db.query(sql, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        });
      };

      const [admins, employees, clients] = await Promise.all([
        queryPromise('SELECT * FROM admin'),
        queryPromise('SELECT * FROM employe'),
      ]);

      console.log('Admins:', admins);
      console.log('Employees:', employees);

      const notificationMessage = `A new passCommand has been added by client `;

      // Send notifications to admins (excluding the sender)
      const adminEmails = admins
        .filter(admin => admin.idadmin !== userId)
        .map(admin => admin.email_admin);
      await saveNotifications(adminEmails, notificationMessage);

      // Send notifications to employees (excluding the sender)
      const employeeEmails = employees
        .filter(employee => employee.idemploye !== userId)
        .map(employee => employee.email_employe);
      await saveNotifications(employeeEmails, notificationMessage);

      // Notify all users about the new product, excluding the sender
      const senderSocketId = userSocketMap[userId];
      for (const socketId in userSocketMap) {
        if (socketId !== senderSocketId) {
          io.to(userSocketMap[socketId]).emit('receiveNotification', {
            message: notificationMessage,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error  passCommand in index.js:', error);
    }
  });
  // Handle updateCommandStatus event
  socket.on('updateCommandStatus', async (commandData) => {
    console.log('updateCommandStatus received', commandData);
    try {
      const req = { body: commandData }; // Simulating req object
      await updateCommandStatus(req, {
        status: (code) => ({
          json: (data) => {
            console.log(`Response sent: ${code} ${JSON.stringify(data)}`);
          }
        }),
      });

      // Query all users (admins, employees) and specific clients related to the command
      const queryPromise = (sql, params = []) => {
        return new Promise((resolve, reject) => {
          db.query(sql, params, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        });
      };

      const [admins, employees, relatedClients] = await Promise.all([
        queryPromise('SELECT * FROM admin'),
        queryPromise('SELECT * FROM employe'),
        queryPromise('SELECT client.email_client FROM client JOIN commande ON client.idclient = commande.client_idclient WHERE commande.idcommande = ?', [commandData.idcommande])]);

      console.log('Admins:', admins);
      console.log('Employees:', employees);
      console.log('Related Clients:', relatedClients);

      const notificationMessage = `A new command status update has been made`;

      // Send notifications to admins (excluding the sender)
      const adminEmails = admins
        .filter(admin => admin.idadmin !== commandData.userId)
        .map(admin => admin.email_admin);
      await saveNotifications(adminEmails, notificationMessage);

      // Send notifications to employees (excluding the sender)
      const employeeEmails = employees
        .filter(employee => employee.idemploye !== commandData.userId)
        .map(employee => employee.email_employe);
      await saveNotifications(employeeEmails, notificationMessage);

      // Send notifications to related clients
      const clientEmails = relatedClients.map(client => client.email_client);
      await saveNotifications(clientEmails, notificationMessage);

      // Notify all users about the new status update, excluding the sender
      const senderSocketId = userSocketMap[commandData.userId];
      for (const socketId in userSocketMap) {
        if (socketId !== senderSocketId) {
          io.to(userSocketMap[socketId]).emit('receiveNotification', {
            message: notificationMessage,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error in updateCommandStatus in index.js:', error);
    }
  });




  socket.on('disconnect', () => {
    for (let userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
    console.log('Client disconnected');
  });
});


/*   const selectQuery = 'SELECT * FROM messages WHERE rolesender = ? AND sender_id = ? ORDER BY timestamp ASC';
   
   db.query(selectQuery, [message.rolesender, message.sender_id], (err, results) => {
     if (err) {
       console.error('Error fetching messages:', err);
       return;
     }
   
     console.log('Sending updated messages to clients');
     io.emit('receiveMessage', results);
   });*/








server.listen(3300, () => {
  console.log("socket server is running ")
})
app.listen(5000, () => {
  console.log('Server running on https://localhost:5000');

});

module.exports.userSocketMap = userSocketMap;