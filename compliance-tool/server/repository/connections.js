var oracledb = require('oracledb');

oracledb.getConnection(
{
  user          : process.env.DB_USER,
  password      : process.env.DB_PASS,
  connectString : process.env.DB_HOST
},
function(err, connection) {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log('Connection was successful!');

  connection.close(
    function(err) {
      if (err) {
        console.error(err.message);
      }
    });
});