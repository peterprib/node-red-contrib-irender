//"use strict";
/*
 * legend:{position:{vertical:"top"||"bottom",horizontal:"left"||"right"}};
 */
function MouseSvg(svgObject) {
	this.svgObject=svgObject;
	this.element=svgObject.drawObject(this.svgCursorDetails);
	this.svgObject.svg.addEventListener('mousemove', this.move.bind(this), false);
}
MouseSvg.prototype.svgCursorDetails={action:"g",id:"cursorDetails",draggable:false,"font-size":10,style:"z-index:99999;",children:[
	{action:"text",x:2,y:12,draggable:false,children:["x:"]},
	{action:"text",x:14,y:12,draggable:false,children:["?"]},
	{action:"text",x:2,y:24,draggable:false,children:["y:"]},
	{action:"text",x:14,y:24,draggable:false,children:["?"]}
]};
MouseSvg.prototype.move=function(ev) {
	this.element.childNodes[1].firstChild.nodeValue=ev.offsetX;
	this.element.childNodes[3].firstChild.nodeValue=ev.offsetY;
};
function Svg(base,properties,options) {
	this.legend=Object.assign({display:true,position:{vertical:"top",horizontal:"right"}});
	this.base=base;
	this.options=(options||{});
	this.element=document.createElement("div");
	this.element.IRender=this;
	Object.assign(this.element.style,{width:"100%",height:"100%"});
	this.svg=document.createElementNS(this.nsSVG,"svg");
	this.set(Object.assign({},properties,{width:"100%",height:"100%"}));
	this.element.appendChild(this.svg);
	this.loadUseShapes(this.shapes);
	this.addBase();
	if(options.legend) this.addLegend(options.legend);
	if(this.options.mouseCoords==null || this.options.mouseCoords)
		this.mouse=new MouseSvg(this);
	if(this.editable)
		this.element.addEventListener('dblclick', this.editFloatingPane.bind(this), false)
	if(this.movable)
		this.svg.addEventListener('mousedown', this.dragStart.bind(this), false);
	if(this.resizable)
		this.svg.addEventListener('resize',this.resize.bind(this), false);
}
Svg.prototype.addBase=function() {
	this.base=this.drawObject({action:"g",id:"base"});
	const mousedown=this.options.mousedown||this.properties.mousedown;
	this.setOn("mousedown","mouseup","mousemove","click","dblclick","resize");
};
Svg.prototype.addExperimental=function() {
	this.addWatermark("Experimental");
};
Svg.prototype.addLegend=function(properties) {
	Object.assign(this.legend,properties===true?null:properties);
	this.legendElement=this.drawObject({action:"g",id:"legend",style:{cursor:"hover"}});
	this.makeDraggable(this.legendElement);
};
Svg.prototype.addLegendRow=function(options,text,colour) {
	const holdingG=this.legendElement.getBoundingClientRect();
	const y=(holdingG.height);
	if(colour) {
		this.drawObject({action:"g",y:y,children:[
				{action:"use",x:0,y:y,fill:colour,xlink:{href:"#legendBox"}},
				{action:"text",x:16,y:y+11,"font-size":11,children:[text]}
			]},
			this.legendElement
		);
	} else {
		this.drawObject(Object.assign({action:"text",x:0,y:y+11,"font-size":11,children:[text]},options),this.legendElement);
	}
	this.legendFitPane();
	return this;
}
Svg.prototype.addWatermark=function(title) {
	this.drawObject({action:"g",id:"watermark",children:[
		{action:"text",x:5,y:5,transform:"rotate(45)","font-size":30,children:[title]}
	]});
};
Svg.prototype.appendTo=function(n) {
	n.appendChild(this.svg);
	this.parent;
	return this;
}
Svg.prototype.add2Attr=function(e,o) {
	for(let p in o) {
		if(e.hasAttribute(p))
			e.setAttribute(p,parseInt(e.getAttribute(p))+o[p]);
	}
};
Svg.prototype.add2pairs=function(aIn,x,y) {
	return aIn.replace(/,/g," ").trim().split(" ").map((c,i,a)=>(parseInt(c)+x)+","+(parseInt(a[i+1])+y),"").join(" ");
/*	
	const a=aIn.replace(/,/g," ").trim();
	for(let r="", p=a.split(" "),i=0;i<p.length;i=i+2) {
		r+=(parseInt(p[i])+x)+","+(parseInt(p[i+1])+y)+" ";
	}
	return r.trim();
*/};
Svg.prototype.clear=function(n) {
	while(n.childNodes.length) //all except first which is defs
		n.removeChild(n.lastChild);
};
Svg.prototype.clearAll=function() {
	this.clearLegend();
	this.clear(this.base);
};
Svg.prototype.clearLegend=function() {
	this.clear(this.legendElement);
}
Svg.prototype.close=function() {
//	this.svgFloat.parentElement.removeChild(this.svgFloat);
	this.floatPane.style.display="none";
//	this.element.removeChild(this.floatPane);
//	delete this.floatPane;
};
Svg.prototype.createFloat=function(title) {
	this.floatPane=createTable(2,1);
	this.floatPane.addEventListener('click', eventDoNothing.bind(this), false);
	this.floatPane.mySvg=this;
	this.element.appendChild(this.floatPane);
	this.floatPaneHeader=this.floatPane.rows[0].style.width="100%";
	this.floatPaneHeader=this.floatPane.rows[0].cells[0];
	this.floatPaneHeader.mySvg=this;
	this.floatPaneHeader.style="background-color: LightGrey; height: 25px; width: 100%; text-align: center; vertical-align:top ;";
	this.floatPaneHeader.appendChild(createNode("\u00a0"+(title||"No Title Set")+"\u00a0"));
	this.closeIcon=this.getIconImage("close_s.gif");
	this.closeIcon.align="right";
	this.floatPaneHeader.appendChild(this.closeIcon);
	this.closeIcon.addEventListener('click', this.onclickClose.bind(this), false);
	this.closeIcon.addEventListener('mouseenter', this.iconEnter.bind(this), false);
	this.closeIcon.addEventListener('mouseleave', this.iconLeave.bind(this), false);
	this.floatPane.style="min-width: 100px; min-height: 100px;"+
		"position:fixed; filter: alpha(opacity=100); -moz-opacity: 1; background-color:white; opacity: 1; padding:0px;"+
		"overflow:auto; z-index:99999; background-color:#FFFFFF; border: 1px solid #a4a4a4;";
	this.floatPaneDetail=this.floatPane.rows[1].cells[0];
	this.floatPane.draggable=true;//dragStart
	this.floatPane.addEventListener('dragstart', dragStart.bind(this), false);
	
	this.floatPaneDetail.mySvg=this;
	this.form=new Form(this)
		.select({title:"Shape",
			option:{ "function": function(e) {
					for(var s in this.shapes) {
						e.appendChild(this.action({action:"option",label:s,value:s,children:[s]}));
				}}},
			onchange: function(ev) {
					this.shape=ev.target.value;
					this.setMapping(shapes[this.shape])
					this.applyFilter("insert",this.shapes[this.shape].action);
				}
			},null,["insert"])
		.input({title:"Radius",type:"number",min:1},"r",["circle"])
		.input({title:"Stroke",type:"color"},"stroke")
		.input({title:"Stroke Width",type:"number",min:1,max:10,value:1},"stroke-width")
		.input({title:"Opacity",type:"range",min:0,max:100,value:50},"opacity") 
		.input({title:"Fill",type:"color"},"fill")   
		.input({title:"Fill Opacity",type:"range",min:0,max:100,},"fill-opacity") 
		.input({title:"",type:"button",value:"Insert",
				onclick: function(ev) {
						this.parent.insertShape({x:ev.offsetX,y:ev.offsetY},Object.assign({},this.shapes[this.shape],this.getMapping()));
						this.parent.close();
					}
				},null,["insert"])
		.input({title:"",type:"button",value:"Update",
				onclick: function(ev) {
//						this.parent.insertShape({x:ev.offsetX,y:ev.offsetY},Object.assign(Object.assign({},this.parent.shapes[this.shape],this.getMapping());
						this.parent.close();
					}
				},null,["update"])
		.addItem({title:"Zoom",children:[
					{action:"input",type:"button",value:"Fit Window",onclick: function(ev) {this.parent.zoomAll();}},
					{action:"input",type:"button",value:"+",onclick: function(ev) {this.parent.zoomIn();}},
					{action:"input",type:"button",value:"-",onclick: function(ev) {this.parent.zoomOut();}}
				]
			})
		.setMapping(this.shapes.square);
	this.floatPaneDetail.appendChild(this.form.element);
};
Svg.prototype.displayLegend=function() {
	this.legendElement.setStyle({'display': (this.legend.display?"block":"none")});
	return this;
};
Svg.prototype.draw=function(p) {
	this.drawObject(p);
	return this;
};
Svg.prototype.drawObject=function(p,n) {
	if(p.constructor === String)
		return n.appendChild(document.createTextNode(p));
	if(p instanceof Array)
		return p.map(c=>this.drawObject(c,n));
	const o=document.createElementNS(this.nsSVG, p.action);
	if(!o) throw Error("SVG invalid function "+p.action);
	for(let a in p){
		if(a=="action") continue;
		if(a=="children" && p[a] instanceof Array) {
			this.drawObject(p[a],o);
		} else if(a=="xlink") {
			for(let x in p[a])
				o.setAttributeNS(this.xlink, "xlink:"+x, p[a][x]);
		} else if(a=="style") {
			Object.assign(o.style,p[a]);
		} else if(a=="title") {
			let t=document.createElementNS(this.nsSVG,a);
			t.appendChild(document.createTextNode(p[a]));
			o.insertBefore(t,o.firstChild);
		} else if(a instanceof Function) {
			o.addEventListener((p.substr(0,2)=="on"?p.substr(2):p), a.bind(this), false);
		} else try{
				o.setAttributeNS(null, a, p[a]);
			} catch(e) {
				throw Error("failed set attribute "+a+" to "+p[a]+" error "+e)
			}
	}
	if(p.action=="foreignObject")
		o.setAttributeNS(null, "requiredExtensions", "http://www.w3.org/1999/xhtml");
	(n||this.svg).appendChild(o);
	return o;
};
Svg.prototype.drawObjectAssign=function() {
	this.drawObject(Object.assign({},...arguments));
};
Svg.prototype.editFloatingPane=function(ev) {
	ev.stopPropagation();
	if(this.floatPane) {
		this.floatPane.style.display="table";
	} else {
		this.createFloat("Edit");
	}
	this.positionFixed(this.floatPane,ev.clientX,ev.clientY);
	if(ev.srcElement.nodeName=="svg") {
		this.form.applyFilter(["insert",ev.srcElement.nodeName]);
		return;
	}
	this.form.setMapping(this.toJSON(ev.srcElement));
	this.form.applyFilter(["update",ev.srcElement.nodeName]);
};
Svg.prototype.getDef=function() {
	if(!this.def) {
		this.def=document.createElementNS(this.nsSVG, "def");
		this.svg.appendChild(this.def);
	}
	return this.def;
};
Svg.prototype.getIconImage=function(n) {
	let i=new Image(16,16);
	i.src="images/"+n;
	return i;
};
Svg.prototype.getPaneSize=function() {
	return this.svg.getBoundingClientRect();
};
Svg.prototype.graph=function() {
	return this.drawObject(Object.assign({},...arguments),this.base)
};
Svg.prototype.hideLegend=function() {
	this.legendElement.setStyle({'display': (this.legend.display?"none":"block")});
	return this;
};
Svg.prototype.iconEnter=function(ev) {
	Object.assign(ev.target.style,{cursor:"pointer",filter:"invert(100%)"})
//	ev.target.style.cursor="pointer";
//	ev.target.style.filter="invert(100%)";
};
Svg.prototype.iconLeave=function(ev) {
	Object.assign(ev.target.style,{cursor:"inherit",filter:"inherit"});
//	ev.target.style.cursor="inherit";
//	ev.target.style.filter="inherit";
};
Svg.prototype.insertShape=function(pos,p) {
	switch(p.action) {
		case "circle": 
		case "ellipse":
			p.cx=pos.x;
			p.cy=pos.y;
			break;
		case "rect": 
		case "use": 
		case "g": 
		case "text": 
			p.x=pos.x;
			p.y=pos.y;
			break;
		case "line": 
			p.x2-=pos.x-p.x1;
			p.y2-=pos.y-p.y1;
			p.x1=pos.x;
			p.y1=pos.y;
			break;
	}
	return this.drawObject(p);
};
Svg.prototype.legendFitPane=function() {
	const paneBox=this.getPaneSize(),
		legendBox=this.legendElement.getBBox(),
		position=this.legend.position;
	if(position.horizontal=="left") {
//		this.legendElement.setAttribute('x',0);
		legendBox.x=0;
	} else if(position.horizontal=="right"){
//		this.legendElement.setAttribute('x',paneBox.width-legendBox.width);
		legendBox.x=paneBox.width-legendBox.width;
	} else if(legendBox.x<0) {
//		this.legendElement.setAttribute('x',0);
		legendBox.x=0;
	} else if(legendBox.x+legendBox.width>paneBox.width ){
//		this.legendElement.setAttribute('x',paneBox.width-legendBox.width);
		legendBox.x=paneBox.width-legendBox.width;
	}
	if(position.vertical=="top"){
//		this.legendElement.setAttribute('y',0);
		legendBox.y=0;
	} else if(position.vertical=="bottom"){
//		this.legendElement.setAttribute('y',paneBox.height-legendBox.height);
		legendBox.y=paneBox.height-legendBox.height;
	} else if(legendBox.y<0){
//		this.legendElement.setAttribute('y',0);
		legendBox.y=0;
	} else if(legendBox.y+legendBox.height>paneBox.height){
//		this.legendElement.setAttribute('y',paneBox.height-legendBox.height);
		legendBox.y=paneBox.height-legendBox.height;
	}
	this.moveSvgElement(this.legendElement,this.legendElement.getBBox(),legendBox);
}
Svg.prototype.loadUseShapes=function(o) {
	const def=this.getDef();
	for(var p in o) {
		def.appendChild(this.drawObject(Object.assign({id:p},o[p])));
	}
};
Svg.prototype.onclickClose=function(ev) {
	ev.stopPropagation();
	this.close(ev);
};
Svg.prototype.pattern=function(p) {
	return this.drawObject(Object.assign({action:"pattern"},p));
};
Svg.prototype.polarToCartesian=function(centreX, centreY, radius, angleInDegrees) {
	const angleInRadians=(angleInDegrees-90)*Math.PI/180.0;
	return centreX+(radius*Math.cos(angleInRadians))+" "+(centreY+(radius*Math.sin(angleInRadians)));
};
Svg.prototype.positionFixed=function(e,x,y) {
	Object.assign(e.style,{left:x+"px",top:y+"px"});
};
Svg.prototype.set=function(o) {
	for (var p in o) {
		switch (p) {
			case "viewBox":
				this.svg.setAttribute(p,o[p].minx+" "+o[p].miny+" "+o[p].width+" "+o[p].height);
				break;
			case "draw":
				this.draw(o[p]);
				break;
			default:
				this.svg.setAttribute(p,o[p]);
		}
	}
};
Svg.prototype.setOn=function(onEvents) {
	(onEvents instanceof Array?onEvents:[...arguments]).forEach(onEvent=>{
		const event=this.options[onEvent]||this[onEvent]||null;
		if(event)
			this.svg.addEventListener(onEvent,event.call.bind(event.object), false);
	});
};
Svg.prototype.setMoveSVGObject=function(ev) {
	if(ev.target.nodeName=="svg") return;
	if(ev.target.getAttribute("draggable")==="false") return;
	ev.stopPropagation();
	ev.preventDefault();
	this.moveObject=ev.target;
	this.moveX=ev.clientX;
	this.moveY=ev.clientY;
	this.moveObject.addEventListener('mouseout', this.moveSVGObjectReset.bind(this), false);
	this.moveObject.addEventListener('mouseup', this.moveSVGObjectReset.bind(this), false);
	this.moveObject.addEventListener('mousemove', this.moveSVGObject.bind(this), false);
	this.moveObject.addEventListener('click', eventDoNothing.bind(this), false);

/*
	this.moveTransform=his.moveObject.getAttributeNS(null, "transform");
	if(this.moveTransform=null) this.moveTransform="matrix(1 0 0 1 0 0)";
	this.moveMatrix=this.moveTransform.slice(7,-1).split(' ');
	for(var i=0; i<this.moveMatrix.length; i++) {
		this.moveMatrix[i]=parseFloat(this.moveMatrix[i]);
	}
*/
};
Svg.prototype.toJSON=function(o) {
	let i,n,p,r={action:o.nodeName};
	for(i=0;i<o.attributes.length;i++) {
		p=o.attributes[i];
		r[p.nodeName]=p.value;
	}
	if(o.style) {
		for(i=0;;i++) {
			if(i in o.style) {
				p=o.style[i];
				n=p.split("-");
				for(var j=1;j<n.length;j++) {
					n[j]=n[j].charAt(0).toUpperCase()+n[j].substr(1);
				}
				r[p]=o.style[n.join("")];
				continue;
			}
			break;
		}
	}
	if(o.children.length) {
		r.children=o.children.map(c=>this.toJSON(c));
	}
	return r;
};
/*
Svg.prototype.delta=function(s,e) {
		return {x:(s.x-e.x),y:(s.y-e.y)}
	};
*/
Svg.prototype.movePane=function(p) {
	const left=Number(this.floatPane.style.left.slice(0, -2)),
		top=Number(this.floatPane.style.top.slice(0, -2));
	Object.assign(this.floatPane,{left:(left+p.x)+"px",top:(top+p.y)+"px"});
	this.setMaxPaneSize();
};
Svg.prototype.moveSVGObject=function(ev) {
	if(!this.moveObject) return;	
	switch(this.moveObject.nodeName) {
		case "line":
			this.add2Attr(this.moveObject,{x1:ev.movementX,x2:ev.movementX,y1:ev.movementY,y2:ev.movementY});
			return;
		case "rect":
		case "use": 
		case "pattern":
		case "g":
		case "text":
			this.add2Attr(this.moveObject,{x:ev.movementX,y:ev.movementY});
			return;
		case "circle":  
		case "ellipse":  
			this.add2Attr(this.moveObject,{cx:ev.movementX,cy:ev.movementY});
			return;
		case "polygon":  
		case "polyline":  
			this.moveObject.setAttribute("points",this.add2pairs(this.moveObject.getAttribute("points"),ev.movementX,ev.movementY));
			return;
	}
/*
  let dx=ev.clientX - this.moveX
  	,dy=ev.clientY - this.moveY;
  this.moveMatrix[4] += dx;
  this.moveMatrix[5] += dy;
  this.moveObject.setAttributeNS(null, "transform", "matrix(" + moveMatrix.join(' ') + ")");
  this.moveX=ev.clientX;
  this.moveY=ev.clientY;
*/
};
Svg.prototype.moveSVGObjectReset=function(ev) {
	if(!this.moveObject) return;
	this.moveObject.removeEventListener('mousemove', this.moveSVGObject.bind(this), false);
	this.moveObject.removeEventListener('mouseout', this.moveSVGObjectReset.bind(this), false);
	this.moveObject.removeEventListener('mouseup', this.moveSVGObjectReset.bind(this), false);
	this.moveObject.removeEventListener('click', eventDoNothing.bind(this), false);
	delete this.moveObject;
};
Svg.prototype.resize=function() {
	console.warn("svg resize to be done");
};
Svg.prototype.setMaxPaneSize=function() {
	const p=this.floatPane.getBoundingClientRect()
		,w=this.element.getBoundingClientRect()
	if(w.width<p.right) this.floatPane.style.width=(w.width-p.left)+"px";
	if(w.height<p.bottom) this.floatPane.style.height=(w.height-p.top)+"px";
};
Svg.prototype.translate=function(element,xOffset, yOffset) {
	element.setAttribute('transform', 'translate(' + xOffset + ',' + yOffset + ')');
	return this;
};
Svg.prototype.zoomAll=function() {
	const bb=this.svg.getBBox();
	this.svg.setAttribute("viewBox", [bb.x,bb.y,bb.width,bb.height].join(" ") );
};
Svg.prototype.zoomIn=function() {	
	this.svg.currentScale=1.1 * this.svg.currentScale; // zoom out
};
Svg.prototype.zoomOut=function() {	
	this.svg.currentScale=0.9 * this.svg.currentScale; // zoom out
};

Svg.prototype.xlink="http://www.w3.org/1999/xlink";
Svg.prototype.nsSVG="http://www.w3.org/2000/svg";
Svg.prototype.shapes={
		circle:{action:"circle",cx:"40",cy:"40",r:"40",stroke:"black","stroke-width":4,fill:"yellow"},
		square:{action:"rect",id:"rect",x:0,y:0,width:32,height:32,stroke:"black","stroke-width":4,fill:"yellow"},
		ellipse:{action:"ellipse",id:"ellipse",cx:"40",cy:"40",rx:"40",ry:"30",stroke:"yellow","stroke-width":4,fill:"yellow"},
		line:{action:"line",id:"line",x1:"0",y1:"0",x2:"40",y2:"30",stroke:"black","stroke-width":4},
		star:{action:"polygon",id:"polygon",points:"100,10 40,198 190,78 10,78 160,198",stroke:"purple","stroke-width":1,fill:"limellow","fill-rule":"nonzero"},
		text:{action:"text",id:"text",x:0,y:0,"font-size":100,children:["test text"]},
		arrowHead:{action:"polyline",points:"40 60 80 20 120 60"   ,stroke:"black","stroke-width":"20","stroke-linecap":"butt",fill:"none","stroke-linejoin":"miter"},
		arrowHeadRound:{action:"polyline",points:"40 140 80 100 120 140",stroke:"black","stroke-width":"20","stroke-linecap":"round",fill:"none","stroke-linejoin":"round"},
		arrowHeadBevel:{action:"polyline",points:"40 220 80 180 120 220",stroke:"black","stroke-width":"20","stroke-linecap":"square",fill:"none","stroke-linejoin":"bevel"},
		legendBox:{action:"rect",x:"0",y:"0",width:"12",height:"12",opacity:"0.3"}
	};

Svg.prototype.dragElement=null;
Svg.prototype.dragOffset=null;
Svg.prototype.dragTransform=null;
Svg.prototype.dragStart=function(evt) {
	if(evt.target.getAttribute("draggable")==="false" ||!evt.target.classList.contains("draggable")) return;
	this.dragElement=evt.target;
	this.dragElement.addEventListener('mousemove', this.drag.bind(this));
	this.dragElement.addEventListener('touchmove', this.drag.bind(this));
	this.dragElement.addEventListener('mouseup', this.dragEnd.bind(this));
	this.dragElement.addEventListener('mouseleave', this.dragEnd.bind(this));
	this.dragElement.addEventListener('touchend', this.dragEnd.bind(this));
	this.dragElement.addEventListener('touchleave', this.dragEnd.bind(this));
	this.dragElement.addEventListener('touchcancel', this.dragEnd.bind(this));
	
	this.dragOffset =this.getMousePosition(evt);
   // Get all the transforms currently on this element
	let transforms = this.dragElement.transform.baseVal;
   // Ensure the first transform is a translate transform
	if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
     // Create an transform that translates by (0, 0)
		let translate = svg.createSVGTransform();
		translate.setTranslate(0, 0);
      // Add the translation to the front of the transforms list
		this.dragElement.transform.baseVal.insertItemBefore(translate, 0);
	}
	// Get initial translation amount
	this.dragTransform = transforms.getItem(0);
	this.dragOffset.x -= this.dragTransform.matrix.e;
	this.dragOffset.y -= this.dragTransform.matrix.f;
//  const confined = evt.target.classList.contains('confine');
//  if(!this.dragConfined) return;
	const bbox = this.dragElement.getBBox(),
		svgBBox=this.svg.getBBox();
	this.dragminX = svgBBox.x - bbox.x;
	this.dragmaxX = svgBBox.x - svgBBox.width - bbox.x - bbox.width;
	this.dragminY = svgBBox.y - bbox.y;
	this.dragmaxY = svgBBox.y - svgBBox.height - bbox.y - bbox.height;
};
Svg.prototype.drag=function(evt) {
	if(this.dragElement==null) return;
    evt.preventDefault();
    const coord=this.getMousePosition(evt);
    let dx=coord.x-this.dragOffset.x,
       	dy=coord.y-this.dragOffset.y;
//    if(this.dragConfined) {
    	const box=this.svg.getBBox();
    	dx=Maths.min(Maths.max(dx,this.dragMinX),this.dragMaxX);
    	dy=Maths.min(Maths.max(dy,this.dragMinY),this.dragMaxY);
//    }
    this.dragTransform.setTranslate(dx,dy);
};

Svg.prototype.getMousePosition=function(evt) {
	const CTM = this.svg.getScreenCTM();
	if (evt.touches) { evt = evt.touches[0]; }
	return {
	    x: (evt.clientX - CTM.e) / CTM.a,
	    y: (evt.clientY - CTM.f) / CTM.d
	  };
};
Svg.prototype.dragEnd=function(evt) {
	this.dragElement.removeEventListener('mousemove', this.drag.bind(this), false);
	this.dragElement.removeEventListener('touchmove', this.drag.bind(this), false);
	this.dragElement.removeEventListener('mouseup', this.dragEnd.bind(this), false);
	this.dragElement.removeEventListener('mouseleave', this.dragEnd.bind(this), false);
	this.dragElement.removeEventListener('touchend', this.dragEnd.bind(this), false);
	this.dragElement.removeEventListener('touchleave', this.dragEnd.bind(this), false);
	this.dragElement.removeEventListener('touchcancel', this.dragEnd.bind(this), false);
	this.dragElement=false;
};
Svg.prototype.makeDraggable=function(element) {
	element.addEventListener('mousedown', this.dragStart.bind(this));
	element.addEventListener('touchstart', this.dragStart.bind(this));
};
Svg.prototype.moveSvgElement=function(element,from,to) {
	if(from.x==to.x && from.y==to.y) return;
	this.getMoveTransform(element).setTranslate(to.x-from.x,to.y-from.y);
};
Svg.prototype.moveSvgElementDelta=function(element,from,to) {
	if(from.x==to.x && from.y==to.y) return;
	this.getMoveTransform(element).setTranslate(to.x-from.x+transform.matrix.e,to.y-from.y+transform.matrix.f);
};
Svg.prototype.getMoveTransform=function(element,from,to) {
	const transforms = element.transform.baseVal; // Get all transforms on element
			// Ensure the first transform is a translate transform
	if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
		const translate = this.svg.createSVGTransform(); // Create transform that translates by (0, 0)
		translate.setTranslate(0, 0);
		element.transform.baseVal.insertItemBefore(translate, 0);  // Add to front of transforms list
	}
	return transforms.getItem(0); 	// Get initial translation amount
};
Svg.prototype.displayObjectDetailsEnd=function(evt) {
	const displayElement=evt.target;
	displayElement.removeEventListener('mouseleave', this.displayObjectDetailsEnd.bind(this), false);
	displayElement.removeEventListener('touchend', this.displayObjectDetailsEnd.bind(this), false);
	displayElement.removeEventListener('touchleave', this.displayObjectDetailsEnd.bind(this), false);
	displayElement.removeEventListener('touchcancel', this.displayObjectDetailsEnd.bind(this), false);
	delete displayElement;
};
Svg.prototype.displayObjectDetailsStart=function(evt) {
	const svgElement=evt.target,
		displayData=svgElement.getAttribute("displayData");
	if(!displayData) return;
	displayElement=this.createElement("TABLE");
	for(var property in displayData)
		this.createDisplayRow(displayElement,property,displayData[property]);
	displayElement.addEventListener('mouseleave', this.displayObjectDetailsEnd.bind(this));
	displayElement.addEventListener('touchend', this.displayObjectDetailsEnd.bind(this));
	displayElement.addEventListener('touchleave', this.displayObjectDetailsEnd.bind(this));
	displayElement.addEventListener('touchcancel', this.displayObjectDetailsEnd.bind(this));
};
Svg.prototype.createElement=function(e,n){
	var en=document.createElement(e);
	if(n) n.appendChild(en);
	return en;
};
Svg.prototype.createDisplayRow=function(table,property,detail){
	const row=this.createElement("TR",table)
	this.createElement("TD",row).appendChild(document.createTextNode(property));
	this.createElement("TD",row).appendChild(document.createTextNode(detail));
};
