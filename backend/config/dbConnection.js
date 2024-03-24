const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    database: 'crm_db',
    user: 'root',
    password: 'root123'
});

module.exports = connection;
