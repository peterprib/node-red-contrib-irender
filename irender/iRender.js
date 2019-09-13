const nodeLabel="iRender";
const ts=(new Date().toString()).split(' ');
console.log([parseInt(ts[2],10),ts[1],ts[4]].join(' ')+" - [info] "+nodeLabel+" Copyright 2019 Jaroslav Peter Prib");

const debugOff=(()=>false);
function debugOn(m) {
	const ts=(new Date().toString()).split(' ');
	if(!debugCnt--) {
		console.log([parseInt(ts[2],10),ts[1],ts[4]].join(' ')+" - [debug] "+nodeLabel+" debugging turn off");
		debug=debugOff;
	}
	if(debugCnt<0) {
		debugCnt=100;
		console.log([parseInt(ts[2],10),ts[1],ts[4]].join(' ')+" - [debug] "+nodeLabel+" debugging next "+debugCnt+" debug points");
	}
	console.log([parseInt(ts[2],10),ts[1],ts[4]].join(' ')+" - [debug] "+nodeLabel+" "+(m instanceof Object?JSON.stringify(m):m));
}
let debug=debugOn,debugCnt=100;

const fs=require('fs'),
	path=require('path'),
	mustache = require("mustache"),
	initialPath=path.join(__dirname,"initialise"),
	cookieParser = require("cookie-parser"),
	express=require("express");
let initial="",isSetup;
debug({label:"initialise: ",files:initialPath});

fs.readdirSync(path.join(__dirname,"initialise")).forEach(filename => {
	debug({label:"loading: ",filename:filename});
	initial+=fs.readFileSync(path.join(initialPath,filename));
});

function setUpURL(RED,node,data,type,id) {
	const url="/"+nodeLabel+"/"+(id||"initialise");
	node.log("establish url "+url);
	RED.httpNode.get(url,
			cookieParser(),
			(req,res,next)=>{ next(); }, //httpMiddleware
			(req,res,next)=>{ next(); }, //corsHandler,
			(req,res,next)=>{ next(); }, // metricsHandler,
			(req,res)=>{  //callback
				res.setHeader("Content-Type", type||"text/javascript");
				res.write(data);
				res.statusCode = 200;
				res.end()
			},
			(err,req,res,next)=>{ //errorHandler
				res.sendStatus(500);
			}
	);
}
const tableTemplate=fs.readFileSync(path.join(__dirname,"table.template"));
const windowTemplate=fs.readFileSync(path.join(__dirname,"window.template"));

module.exports = function (RED) {
    function redNode(config) {
        RED.nodes.createNode(this, config);
        let node=Object.assign(this,config);
        if(!isSetup) {
        	isSetup=true;
        	setUpURL(RED,node,initial);
        	node.log("establish url "+"/"+nodeLabel+"/images");
        	RED.httpNode.use("/"+nodeLabel+"/images",express.static(path.join(__dirname, 'images')));
        }
        const mainWindow = mustache.render(windowTemplate.toString(), {baseURL:nodeLabel,title:"iRender",footer:"iRender by Peter Prib"});
        setUpURL(RED,node,mainWindow,"text/HTML","index");
        
    }
    RED.nodes.registerType(nodeLabel,redNode);
};
