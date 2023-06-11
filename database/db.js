const mysql = require('mysql2');

const conexion = mysql.createConnection({
  host: 'containers-us-west-195.railway.app',
  user: 'root',
  password: 'MkdDOk38TsAGYvEdWB5e',
  database: 'railway',
  port: '6602',
});

conexion.connect((error) => {
  if (error) {
    console.error('El error de conexión es: ' + error);
  }
  console.log('Conectado a la BD');
});

module.exports = conexion;