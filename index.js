
var Class  = require("infrastructure/lib/Class");
var extend = Class.extend;
var exec   = require("child_process").exec;
var path   = require("path");
var fs     = require("fs");

var reserved = [
  "options", "constructor"
];


module.exports = Class.extend("PythonWrapper", {
  constructor: function(env, structure_name, node_name){
    if(!this.callable) this.callable = [];
    if(!this.options) this.options = {};
    var structure_path = path.join(env.config.rootDir, env.config.structures[structure_name].path);
    Object.keys(this.__proto__).forEach((key)=>{
      if(typeof this[key] === "string"){
        var scriptname = this[key].trim().split(" ").shift();
        var target_path = path.join(structure_path, scriptname);
        var PYTHONPATH = (__dirname+"/pylib")+(this.options.PYTHONPATH || "");
        var command = "PYTHONPATH=\"$PYTHONPATH:"+PYTHONPATH+"\" python "+ this[key].replace(scriptname, target_path);
        if(fs.existsSync(target_path)){
          console.log("EXISTS ::: ", target_path);
          this.callable.push(key);
          this[key] = (data, cb)=>{
            console.log(command);
            exec(command, (err, output, err_output)=>cb(err?err_output:null, output ) );
          }          
        }
      }
    });
  },
});