"use strict"

var Worker = require("basic-distributed-computation").Worker;
var request = require("request");
var urlMatch = /_url\/\{([a-z\.A-Z0-9\/\:-]+)\}/;
var idMatch = /_id\/{([a-z\.A-Z0-9\/\:-]+)\}/;

class Offloader extends Worker {
  constructor(parent){
    super("offload", parent);
  }

  work(req, inputKey, outputKey){
    var inputVal = req.body;
    if(inputKey){
      inputVal = req.body[inputKey];
    }

    var match = urlMatch.exec(req.paths[req.currentIdx]);
    var id = idMatch.exec(req.paths[req.currentIdx]);

    if(!match || !id){
      req.status("Invalid parameter, check id and urls").next();
      return;
    }

    var reqObj = {
      url: match[1] + "/" + id[1],
      body: inputVal,
      json:true
    };

    request.post(reqObj, (err, res, body) => {
      if(err){
        req.status(err).next();
        return;
      } else {
        if(outputKey){
          req.body[outputKey] = body;
        } else {
          req.body = body;
        }
        req.next();
      }
    });
  }
}

module.exports = Offloader;
