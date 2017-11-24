var mssql = require('mssql');
var sqlConfig = require('../sqlConfig');

// Configuration object specific for this function (UK)
const funConfig = {
    user: sqlConfig.user,
    password: sqlConfig.password,
    server: sqlConfig.server,
    port: sqlConfig.port,
    database: "Voyager_UK",
    options: {
        encrypt: true
    }   
}

module.exports = (context, req) => {

    return mssql.connect(funConfig).then( (pool) => {
        const order = req.body; 
        return pool.request()
            .input('question', mssql.NChar, order.question)
            .input('category', mssql.NVarChar, order.category)
            .input('subcategory', mssql.NVarChar, order.subcategory)
            .input('description', mssql.NVarChar, order.description)
            .input('country', mssql.NVarChar, order.country)
            .input('cost_center_number', mssql.NChar, order.cost_center_number)
            .input('user', mssql.NVarChar, order.user)
            .input('inspection_type', mssql.NVarChar, order.inspection_type)
            .input('project_id', mssql.NChar, order.project_id)
            .input('language', mssql.NChar, order.language) 
            .output('result', mssql.NChar)       
            .execute('Akelius_Add_WOrkOder');        
        }).then((result) => {
                    context.log('procedure results: ', result);                    
                    context.res = {
                       body: result
                    };          
                    mssql.close();          
        }).catch((err) => {
            context.log('error', err);
            context.res = {
                status: 400,
                body: err
            };            
            mssql.close();
        })
}