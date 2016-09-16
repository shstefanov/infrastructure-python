var path   = require("path");
var assert = require("assert");
var test   = require("infrastructure/test_env");

describe("PythonWrapper structure", ()=>{

  var env;

  it("Starts application", (next)=>{
    // this.timeout(60000);
    test.start({ 
      process_mode: "cluster",
      rootDir: path.join(__dirname, "fixture")
    }, function(err, _env){
      assert.equal(err, null);
      env = _env;
      next();
    });
  });

  it("calls python script", (next)=>{
    env.i.do("python.Echo.py_test", 12, function(err, result){
      console.log("1-------------------------------------------------", err, result);
      next();
    });
  });

  it("calls python script", (next)=>{
    env.i.do("python.Echo.py_test", 12, function(err, result){
      console.log("2-------------------------------------------------", err, result);
      next();
    });
  });


  it("Stops application", function(next){
    env.stop(function(err){
      assert.equal(err, null);
      next();
    });
  });



});