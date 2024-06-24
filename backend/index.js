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
const http = require('http');
const socketIo = require('socket.io');
const db = require('./config/dbConnection');


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







io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    const query = `INSERT INTO messages (sender_id, rolesender, receiver_id, rolereciever, message) VALUES (?, ?, ?, ?, ?)`;
    console.log
    db.query(query, [message.sender_id, message.rolesender, message.receiver_id, message.rolereciever, message.message], (err, result) => {
      if (err) {
        console.error('Error inserting message:', err);
        return;
      }
      console.log('Message inserted into database:', message);
      const emittedMessage = { ...message, timestamp: new Date().toISOString() };
      io.emit('receiveMessage', emittedMessage);


    });
  });


  socket.on('disconnect', () => {
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