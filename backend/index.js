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