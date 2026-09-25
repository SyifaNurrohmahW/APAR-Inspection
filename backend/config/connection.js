const db = require('mysql2');
require('dotenv').config();

const host = process.env.DB_HOST || process.env.MYSQLHOST || '127.0.0.1';
const user = process.env.DB_USER || process.env.MYSQLUSER;
const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD;
const database = process.env.DB_NAME || process.env.MYSQLDATABASE;
const port = process.env.DB_PORT || process.env.MYSQLPORT ? Number(process.env.DB_PORT || process.env.MYSQLPORT) : 3306;

console.log('Connecting to Database host:', host, 'port:', port, 'user:', user, 'database:', database);

const pool = db.createPool({
    host: host,
    user: user,
    password: password,
    database: database,
    port: port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Tes koneksi saat pertama kali diinisialisasi
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database pool:', err);
        return;
    }
    console.log('Connected to the database pool successfully!');
    connection.release();
});

module.exports = pool;