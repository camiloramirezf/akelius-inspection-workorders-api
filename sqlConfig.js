
module.exports = {
    user : process.env.MSSQL_USER,
    password : process.env.MSSQL_PASSWORD,
    server : process.env.MSSQL_SERVERNAME,
    port: process.env.MSSQL_PORT || 1433        
}
    