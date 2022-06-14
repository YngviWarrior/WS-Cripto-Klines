import mysql from 'mysql';

function CreateConnection() {
    var conn = mysql.createConnection({
            host: "localhost",
            user: "igor",
            password: "123456",
            database: 'rhenyx'
        });
      
    conn.connect(function(err) {
        if (err) throw err;
        console.log("Mysql Connected!");
    });

    return conn
    
}


export default CreateConnection