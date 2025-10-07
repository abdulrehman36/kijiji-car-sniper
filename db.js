if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const mysql = require('mysql2');

console.log('Connecting to MySQL...');
console.log('Host:', process.env.DB_HOST);
console.log('Database:', process.env.DB_NAME);

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to MySQL');
  }
});

module.exports = db;