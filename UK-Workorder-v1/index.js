var mssql = require('mssql');
var sqlConfig = require('../sqlConfig');
var Promise = require('bluebird');

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

const defPool = new mssql.ConnectionPool(funConfig);
module.exports =  (context, req, pool = defPool ) => {

    // Check mandatory properties in Request Body
    var missing = checkOrder(req.body);
    if(missing.length > 0 ) {
        console.log("properties missing");
        context.res = {
            status: 400,
            body: {
                error: "Please add all mandatory properties in request body",
                missing: missing
            }
        }
        context.done();
        return;
    }

    const order = req.body; 
    const imgLinks = order.images || [];            
    var wonum = null;

    return pool.connect().then(() => {
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

        }).then((response) => {
                                       
                    wonum = response.output.result.trim();                                            
                    wonum = Number(wonum);
                    // TODO:  Validate if work oder is succesfully upload

                    if(!wonum) {
                        console.log("invalid wonum")
                        context.res = {
                            status: 400,
                            body: {                                
                                msg: "Invalid WO Number"
                            }
                        } 
                        pool.close()
                        return;
                    }
                    if(imgLinks.length < 1){                        
                        // succesful response, no images
                        context.res = {
                            status: 200,
                            body: {                                
                                wonum: wonum,
                                msg: response
                            }
                         };  
                         return;
                    } else {
                        return Promise.map(imgLinks, function(link) {
                            return pool.request()
                                        .input('wonum', mssql.Numeric,  wonum)
                                        .input('name', mssql.NVarChar, "testname1")
                                        .input('link', mssql.NVarChar, link)
                                        .output('result', mssql.NChar)
                                        .execute('Akelius_Add_WOrkOder_Picture');        
                        })
                    }                     
        })
        .then((response) => {
            if(!response) return;

            if(Array.isArray(response)) {
                //var msg = response[0].output.result.trim();

                var msg = response.map( (item) => {
                    return item.output.result;
                })
                // TODO: Check for any errors in response array
                context.res = {
                    status: 200,
                    body: {
                        wonum: wonum,
                        msg: msg,                        
                    }
                }
                return;
            } else {
                // Procedure without image links was succesful
                return true;
            }
            pool.close();          
        })
        .catch((err) => {
            context.log('error', err);
            context.res = {
                status: 400,
                body: err
            };            
            pool.close();
        })
}

var checkOrder = (obj) => {
    
    // Array of mandatory properties
    var inspection = {        
        question        : "The assigned question (mandatory)",       
        description     : "The description about the work order (mandatory)",
        country         : "Two letters ISO Country Code (mandatory)",
        cost_center_number  : "Given Cost Center ID (mandatory)",
        user            : "Reported User EMail (mandatory)",
        inspection_type : "Type of the Inspection (mandatory)",       
        language        : "Language of description field (mandatory)",
        priority        : "Given priority (mandatory)"
   };  
 
   // Compare input obj with order and return array of missing properties.
   var temp = obj;
   var missing = [];

   for(var property in inspection) {
       if(!temp.hasOwnProperty(property)) {
           missing.push(property);
       }
   }
   
   return missing;
};