
var EventedClass  = require("infrastructure/lib/EventedClass");
var extend = EventedClass.extend;
var exec   = require("child_process").exec;
var path   = require("path");
var fs     = require("fs");
var net    = require("net");

var reserved = [
  "options", "constructor", "config"
];


module.exports = EventedClass.extend( "PythonWrapper", {
  constructor: function(env, structure_name, node_name){
    this.env = env;
    if(typeof this.config === "string") this.config = env.helpers.resolve(env.config, this.config);
    this.config = this.config || {};
    if(!this.callable) this.callable = [];
    if(!this.options) this.options = {};

    this.workers_data = new Map();

    this.connect_token = 0;
    
    // Setup structure root path
    this.structure_path = path.join(env.config.rootDir, env.config.structures[structure_name].path);
    
    // Setup PYTONPATH
    this.PYTHONPATH = __dirname+"/pylib";
    if(this.config.PYTHONPATH){
      if(Array.isArray(this.config.PYTHONPATH)) this.PYTHONPATH += ":" + this.config.PYTHONPATH.join(":");
      else if(typeof this.config.PYTHONPATH === "string") this.PYTHONPATH += ":" + this.config.PYTHONPATH;
    }

    this.createConnectionServer();

    Object.keys(this.__proto__).forEach((key)=>{
      if(typeof this[key] === "string"){
        if(key.indexOf("#") === 0){
          return this.createScriptCaller(key.replace("#", ""), this[key].trim());
        }
        else this.startPythonWorker(key, this[key].trim());
      }
    });


    env.stops.push( (cb) => { this.server.close(); cb(); } );

    return EventedClass.apply(this, arguments);
  },

  createScriptCaller: function(fn_name, cmd){
    var script_file_name = cmd.split(" ").shift();
    var target_path = path.join(this.structure_path, script_file_name);
    
    var command = "PYTHONPATH=\"$PYTHONPATH:"+this.PYTHONPATH+"\" python "+ cmd.replace(script_file_name, target_path);
    if(fs.existsSync(target_path)){
      this.callable.push(fn_name);
      this[fn_name] = (data, cb)=>{
        var options = Object.keys(data).map((key)=>`${key}=${data[key]}`).join(" ");
        var token = this.createConnectToken();
        var connect_options = " connect-port=" + ( this.config.connect_port || 5090 ) + " connect-token=" + token;
        var cmd = command + connect_options +" " + options;
        var worker = exec(cmd, (err, output, err_output)=>{
          try{
            if(err) output = err_output;
            output = JSON.parse(output);
            cb( err ? output : null, err ? null : output );
          }catch(e){
            cb( err ? output : null, err ? null : output );
          }
          this.workers_data.delete( token.toString() );
        });
        var worker_context = { worker, args: data };
        this.workers_data.set(token.toString(), worker_context );
      }          
    }
    
  },

  createConnectionServer: function(){
    this.server = net.createServer( (worker_socket)=>{
      // Worker initializes the connection first
      worker_socket.once("data", (connection_token)=>{
        connection_token = JSON.parse(connection_token);
        var worker_context = this.workers_data.get(connection_token.toString());
        worker_context.socket = worker_socket;
        worker_socket.write(JSON.stringify([ "config", this.config ]));
        worker_socket.write(JSON.stringify([ "args", worker_context.args ]));
        worker_socket.on( "data", (data)=>{
          console.log("regular data", data);
        });
      });
    });
    this.server.listen(this.config.connect_port);
  },

  startPythonWorker: function(fn_name, cmd){

  },


  createConnectToken: function(){
    return this.connect_token++;
  }

});