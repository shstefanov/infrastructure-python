

var assert = require("assert");

describe("Python Wrapper class", ()=>{

  const PythonWrapper = require("../index.js");

  it("Creates instance", function(next){

    var Wrapper = PythonWrapper.extend("Wrapper", {
      options: {},

      getSomeValue: "./alabala.py"

    })
    assert.equal(1,1);
    next();
  });


});