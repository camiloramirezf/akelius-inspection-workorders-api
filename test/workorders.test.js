const workOrderFunc = require('../UK-Workorder-v1');
var Promise = require('bluebird');
const sinon = require('sinon');
const { describe, it, befire} = require('mocha');
const  should  = require('should');
require('should-sinon');

describe("User input validation", () => {  

    // Define context obj for functions
    var _ctx = null;
    var pool = null;

    // Incomplete request
    var incompleterq = null;        

    // Valid request
    var validrq = null;

    // Declare recursive input   
    
    function recInput(){        
        return recInput();
    }

    beforeEach(() => {
        _ctx = {
            done : sinon.spy(),
            log: sinon.spy()
        }

        // Incomplete request
        incompleterq = {
            body: {            
                question: "why not?",
                country: "UK"
            }
        };

        // Valid request
        validrq = {
            body: {       
                question: "Testing",
                category: "General",
                subcategory: "Lift",
                description: "Minimum waaaaahh",
                country: "GB",
                cost_center_number: "40005",
                user: "hansel.graus@akelius.de",
                inspection_type: "Initial business",
                project_id: "50016b",
                priority: "High",
                images: ["link1", "link2", "link3"],
                language: "en-US"          
            }
        };        

        var mock = {
            request: function(){                
                return mock;
            },
            input: function(param, type, value) {                
                return mock;
            },
            output: function(param, type) {                
                return mock;
            },
            execute: sinon.stub().resolves({
                output: {
                    result: "320" // valid number
                }
            }),
            connect: sinon.stub().resolves(undefined),   
            close: sinon.stub()             
        }

        pool = mock;

    })

    it("Should return 400 if user request is invalid", () => {
        var rsp =  workOrderFunc(_ctx, incompleterq, pool);
        should(_ctx).have.property('res');
        should(_ctx.res.status).equal(400);
        pool.should.not.be.called();
    })

    it("Should return 400 if WO is invalid", (done) => {
        // Mock response
        pool.execute = sinon.stub().resolves({
            output: {
                result: "Invalid Number"
            }
        });

        var rsp =  workOrderFunc(_ctx, validrq, pool)
        .then(() => {
            should(_ctx).have.property('res');
            should(_ctx.res.status).equal(400);   
            done();     
        }).catch((err)  => {
            console.log("error", err);
            done();
        });        
    })

    it("Should not call Image SP if image not in request ", (done) => {
        validrq.body.images = [];
        
        var rsp = workOrderFunc(_ctx, validrq, pool)
        .then(() => {
            should(_ctx).have.property('res');
            should(_ctx.res.status).equal(200);        
            Promise.map.should.not.be.called();
            done();
        }).catch((err)  => {
            console.log("error", err);
            done();
        });
    })   

    it("Should call as many Image SPs as there are images in request", (done) => {
        
        Promise.map = sinon.stub()
            .withArgs(["link1", "link2", "link3"])
            .resolves([
                {
                output: { result: "Success"}
                },
                {
                output: { result: "Success" }
                },
                {
                output: { result: "Success" }
                }
        ]);

        var resp = workOrderFunc(_ctx, validrq, pool)
        .then(() => {
            should(_ctx).have.property('res');
            should(_ctx.res.status).equal(200);   
            should(_ctx.res.body.msg).equal("Success");     
            done();
        }).catch((err)  => {
            console.log("error", err);
            done();
        });
    })
})
