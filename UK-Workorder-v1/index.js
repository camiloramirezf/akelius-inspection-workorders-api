var PoolDef = require('../mssqlService');
var pool = new PoolDef("Voyager_UK");

module.exports = (context, req) => {
    return pool.connect(config).then( () => {
        const order = req.body; 
        return pool.request()
            .input('question', sql.NChar, order.question)
            .input('category', sql.NVarChar, order.category)
            .input('subcategory', sql.NVarChar, order.subcategory)
            .input('description', sql.NVarChar, order.description)
            .input('country', sql.NVarChar, order.country)
            .input('cost_center_number', sql.NChar, order.cost_center_number)
            .input('user', sql.NVarChar, order.user)
            .input('inspection_type', sql.NVarChar, order.inspection_type)
            .input('project_id', sql.NChar, order.project_id)
            .input('language', sql.NChar, order.language) 
            .output('result', sql.NChar)       
            .execute('Akelius_Add_WOrkOder');        
        }).then((result) => {
                    context.log('procedure results: ', result);                    
                    context.res = {result: result};
                    pool.close();                    
     })
}