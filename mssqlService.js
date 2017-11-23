var mssql = require('mssql');

module.exports = function(db){
    var sqlConfig = {
        user : process.env.MMSQL_USER,
        password : process.env.MMSQL_PASSWORD,
        serverName : process.env.MSSQL_SERVERNAME,
        database: db    
    }
    const mPool = new mssql.ConnectionPool(sqlConfig);
    return mPool;    
};