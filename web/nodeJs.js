const http = require('http');
const url = require('url');
const fs = require('fs');
var storedData = new Map();

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  try{
     handleRequest(req, res);
  }catch(e){
    console.log("error: "+e);
  }
  res.end();
}).listen(8080);




var handleRequest = function(req,res){
    const reqObject = url.parse(req.url, true);
    switch(reqObject.pathname){
        case "/setId":
             if(reqObject.query){
                if(reqObject.query.id && reqObject.query.cardNumber){
                    storedData.set(reqObject.query.id,reqObject.query.cardNumber);
                    res.write(reqObject.query.id);
                }
             }
             break;
        
         case "/getId":
             if(reqObject.query){
                if(reqObject.query.id){
                    var cardNumber = storedData.get(reqObject.query.id);
                    if(cardNumber){
                        res.write(""+cardNumber+"");
                    }else{
                        res.write("");
                    }
                }
             }
             break;
                
        default:
             var body = fs.readFileSync('./index.html', 'utf8');
             res.write(body);
             break;
    }
}