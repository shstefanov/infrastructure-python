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

  it("calls script test/fixture/python/src/test.py and inspect the result", (next)=>{
    env.i.do("python.Echo.py_test", {aaa: 555}, function(err, result){
      assert.deepEqual(result, [ { connect_port: 5099 }, { aaa: 555 } ] );
      next();
    });
  });

  it("calls script test/fixture/python/src/test.py and inspect the result", (next)=>{
    env.i.do("python.Echo.py_test", {aaa: 999}, function(err, result){
      assert.deepEqual(result, [ { connect_port: 5099 }, { aaa: 999 } ] );
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