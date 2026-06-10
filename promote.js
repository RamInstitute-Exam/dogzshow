const mysql = require('mysql2/promise');

async function run() {
  try {
    const connection = await mysql.createConnection('mysql://avnadmin:AVNS_rKF1_GdxenX0I5mqdOA@mysql-78732e9-balamuruganwebdeveloper-7fa4.h.aivencloud.com:19110/defaultdb?ssl-mode=REQUIRED');
    const [result] = await connection.execute('UPDATE User SET role = ? WHERE email = ?', ['ADMIN', 'admin@gmail.com']);
    console.log('Successfully promoted admin@gmail.com', result);
    await connection.end();
  } catch(e) {
    console.error(e);
  }
}
run();
