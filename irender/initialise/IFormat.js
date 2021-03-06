/*
 * [{column:0,format:afunction,title:"a col"},...]
 */
if(!String.prototype.CRLF2BR)
    String.prototype.CRLF2BR = function () {
		return  this.replace("\n\r","<br/>").replace("\n","<br/>");
	};
if(!String.prototype.to)
    String.prototype.to = function (type) {
		return this==null?null:type==null?value:this['to'+type.capitalize()];
	};
if(!String.prototype.toDatetime)
    String.prototype.toDatetime = String.prototype.toTime;
if(!String.prototype.toDate)
    String.prototype.toDate = String.prototype.toTime;
if(!String.prototype.toInt)
    String.prototype.toInt = function () {
		return parseInt(this);
	};
if(!String.prototype.toReal)
    String.prototype.toReal = function () {
		return parseFloat(this);
	};
if(!String.prototype.toTime)
    String.prototype.toTime = function () {
		return  Date.parse(this);
	};
if(!String.prototype.toTimestamp)
    String.prototype.toTimestamp = function () {
		return Date.parse(this.substr(0,4)+'/'+this.substr(5,2)+'/'+this.substr(8,11))
			+ parseInt(this.substr(21,3));
	};
if(!String.prototype.toTitle)
	String.prototype.toTitle = function () {
		var title=this.substr(0,1).toUpperCase()
			,lastLowerCase=false;
		for(var i=1; i<this.length; i++) {
			char=this.substr(i,1);
			if(char==char.toUpperCase()) {
				if(lastLowerCase) title+=' ';
				lastLowerCase=false;
				if(char=='_' ||	char==' ') continue;
			} else lastLowerCase=true;
			title+=char;
		}
		return title;
  	};

function IFormat(options) {
	Object.assign(this,{format:"auto"},options);
	this.formatter=this[this.format];
	return this;
}
IFormat.prototype.dataConversionFunc={
	"real": function(value) {return parseFloat(value);},
	"int": function(value) {return parseFloat(value);},
	"number": function(value) {return parseFloat(value);},
	"timestamp": function(value) {
		return Date.parse(value.substr(0,4)+'/'+value.substr(5,2)+'/'+value.substr(8,11))
		+ parseInt(value.substr(21,3));
	},
	"time": function(value) {return Date.parse(value);},
	"datetime": function(value) {return Date.parse(value);},
	"date": function(value) {return Date.parse(value);}
};
IFormat.prototype.dataConversion=(type,value)=>{
	if(value==null) return null;
	if(IFormat.prototype.dataConversionFunc[type]==null) return value;
	try{
		return IFormat.prototype.dataConversionFunc[type](value);
	} catch(e) {
		throw Error("data conversion error data type: " +type + ' value: "'+ value +'"');
	}
};
IFormat.prototype.toHTML = function() {
	return document.createTextNode(this.formatter.apply(this,arguments));
};
IFormat.prototype.auto = function (v) {
	this.formatter=IFormat.prototype.toString;
	return this.formatter.apply(this,arguments);
};
IFormat.prototype.toString = (v)=>v==null?"":v.toString();
IFormat.prototype.copy = (v)=>v;
IFormat.prototype.dateTypes = ["date","time","datetime","timestamp"];
IFormat.prototype.dateTimeTypes = IFormat.prototype.dateTypes;
IFormat.prototype.isDateTime=((type)=>IFormat.prototype.dateTimeTypes.includes(type));
IFormat.prototype.numberTypes = ['real','double','int','number','bigint'];
IFormat.prototype.isNumber=((type)=>IFormat.prototype.numberTypes.includes(type));
IFormat.prototype.measureTypes = IFormat.prototype.numberTypes.concat(IFormat.prototype.dateTypes);
IFormat.prototype.isMeasure=((type)=>IFormat.prototype.measureTypes.includes(type));
IFormat.prototype.stringTypes = ['string'];
IFormat.prototype.isString=((type)=>IFormat.prototype.stringTypes.includes(type));
IFormat.prototype.clone = IFormat.prototype.copy;
IFormat.prototype.noChange = IFormat.prototype.copy;
IFormat.prototype.getStringAfterDelimiter = (v)=>getStringAfterDelimiter(v,wordPosition,delimiter);
IFormat.prototype.padLeadZero = (value,size)=>"000000000000".substr(0,size-value.toString().length)+value;
IFormat.prototype.regexp = function(v) {return v.split(this.regPattern,1)[0];};
IFormat.prototype.substr = (v)=>isNaN(stringLength)?v.substr(startPosition):v.substr(startPosition,stringLength);
IFormat.prototype.substring = (v)=>isNaN(stringLength)?v.substring(startPosition):v.substring(startPosition,stringLength);
IFormat.prototype.word = (v)=>{
	try{
		return v.split(wordPattern,wordPositionLimit)[wordPosition];
	} catch(e) {}
	return ""; 
};
IFormat.prototype.toDuration = (v)=>{
	v=parseFloat(v);
	var r="",t;
	if(v>=60) {
		if(v>=3600) {
			if(v>=86440) {
				if(this.toDuration=='D') return Math.round(v/86400).toString()+'D'; 
				t = Math.floor(v/86400);
				v=v-t*86400;
				r+=t.toString()+'D';
			}
			if(this.toDuration=='H') return r+Math.round(v/360).toString()+'H'; 
			t = Math.floor(v/3600);
			v-=t*3600;
			r+=(t>9?'':'0')+t.toString()+'H';
		}
		if(this.toDuration=='M') return r+Math.round(v/60).toString()+'M'; 
		t = Math.floor(v/60);
		v-=t*60;
		r+=(t>9?'':'0')+t.toString()+'M';
	}
	if(this.toDuration=='S') return r+Math.round(v/60).toString()+'S'; 
	return r+(v>9?'':'0')+v.toFixed(6).toString();
};
IFormat.prototype.parseFloat = parseFloat;
IFormat.prototype.parseInt = parseInt;
IFormat.prototype.toExponential = (v)=>Number(v).toExponential(this.toExponentialVal);
IFormat.prototype.toFixed = (v)=>Number(v).toFixed(this.toFixedVal);
IFormat.prototype.toPrecision = (v)=>Number(v).toPrecision(this.toPrecisionVal);
IFormat.prototype.toBase = (v)=>Number(v).toString(this.toBaseVal);
IFormat.prototype.number = (v)=>Number(v);
/*{
	v=Number(v);
	if(this.separator) {
		const valueString=v.toString().split('.');
		v="";
		if(valueString[1]!=null) {
			v='.'+valueString[1].substr(0,3);
			for (var i=3;i<valueString[1].length;i+=3) {
				v+=this.separator+valueString[1].substr(i,3);
			}
		} 
		const len=valueString[0].length-1;
		value=valueString[0].substr(valueString[0].length-1,1)+v;
		for (var i=valueString[0].length-2;i>=0;i--) {
			value=valueString[0].substr(i,1)+((len-i)%3==0?this.separator:'')+v;
		}
	}
};
*/
IFormat.prototype.toAbbreviatedNumber = (v)=>IFormat.prototype.formatNumberToAbbreviated(v);
IFormat.prototype.appendAbbreviatedNumber = (v)=>v+" ("+IFormat.prototype.toAbbreviatedNumber(v)+")";
IFormat.prototype.prependAbbreviatednumber = (v)=>IFormat.prototype.toAbbreviatedNumber(v) + " ("+v+")";
IFormat.prototype.toYesNo = (v)=>v=="y"||v=="1"||v==1?'Yes':"No";
IFormat.prototype.toBoolean = (v)=>v=="t"||v=="1"||v==1?"True":'False';
IFormat.prototype.normalize = function(v) {return (this.normalizer==0 ? null : v/this.normalizer)};
IFormat.prototype.percent = function(v) {return 100*this.normalize(v)};
IFormat.prototype.percentage = IFormat.prototype.percent;

IFormat.prototype.format = (value,datatype,precision)=>{
	try{
		return IFormat.prototype["format"+datatype](value,precision);
	} catch(e) {
		return value;
	}
};
IFormat.prototype.formatAbbreviate = (value,datatype,precision)=>{
	try{
		return IFormat.prototype["format"+datatype+"Abbrev"](value,precision);
	} catch(e) {
		return value==null?"":value.toString();
	}
};
IFormat.prototype.formatTime = function (tsIn,precision) {
	const ts=ts instanceof Date? tsIn : (new Date()).setTime(parseInt(tsIn));
	let t="";
	if(this.precision<360) t+=IFormat.padLeadZero(ts.getHours(),2)+':';
	if(this.precision< 60) t+=IFormat.padLeadZero(ts.getMinutes(),2)+':';
	if(this.precision<  1) t+=IFormat.padLeadZero(ts.getSeconds(),2)
	return t;
};
IFormat.prototype.formattime = IFormat.prototype.formatTime;
IFormat.prototype.formattimeAbbrev = IFormat.prototype.formatTime;

IFormat.prototype.formatDate = (tsIn,precision)=>{
	const ts=ts instanceof Date? tsIn : (new Date()).setTime(parseInt(tsIn));
	let d="";
	if(precision >= 1440) d+=ts.getFullYear()+'-';
	if(precision >= 1440) d+=IFormat.padLeadZero(ts.getMonth()+1,2)+'-';
	if(precision >= 1440) d+=IFormat.padLeadZero(ts.getDate(),2);
	if(precision >= 1440) d+=' ';
	return d;
};
IFormat.prototype.formatdate = IFormat.prototype.formatDate;
IFormat.prototype.formatdateAbbrev = IFormat.prototype.formatDate;
IFormat.prototype.formatTimestamp = (tsIn,precision)=>{
	const ts=ts instanceof Date? tsIn : (new Date()).setTime(parseInt(tsIn));
	if(precision >= 1440) ts+=ts.getFullYear()+'-';
	if(precision >= 1440) ts+=IFormat.padLeadZero(ts.getMonth()+1,2)+'-';
	if(precision >= 1440) ts+=IFormat.padLeadZero(ts.getDate(),2);
	if(precision >= 1440) ts+=' ';
	if(this.precision<360) ts+=IFormat.padLeadZero(ts.getHours(),2)+':';
	if(this.precision< 60) ts+=IFormat.padLeadZero(ts.getMinutes(),2)+':';
	if(this.precision<  1) ts+=IFormat.padLeadZero(ts.getSeconds(),2)
	return ts;
};
IFormat.prototype.formatDateTime = IFormat.prototype.formatTimestamp;
IFormat.prototype.formatdatetime = IFormat.prototype.formatTimestamp;
IFormat.prototype.formatdatetimeAbbrev = IFormat.prototype.formatTimestamp;
IFormat.prototype.formatToString = (v)=>v.toString();

IFormat.prototype.formatNumberToAbbreviated = (value)=>{
	let isAbbreviated=true;
	if(typeof value!='number') value=parseFloat(value);
	if (value>Math.pow(10,16)) valueAbbr = Math.round(value/Math.pow(10,15)).toString()+'P';
	else if (value>Math.pow(10,13)) valueAbbr = Math.round(value/Math.pow(10,12)).toString()+'T';
	else if (value>Math.pow(10,10)) valueAbbr = Math.round(value/Math.pow(10,9)).toString()+'G';
	else if (value>Math.pow(10,7)) valueAbbr = Math.round(value/Math.pow(10,6)).toString()+'M';
	else if (value>Math.pow(10,4)) valueAbbr = Math.round(value/Math.pow(10,3)).toString()+'K';
	else { 
		isAbbreviated=false;
		if (value == Math.round(value)) valueAbbr = value.toString();
		else if (value>=10000) valueAbbr = value.toFixed(0).toString();
		else if (value>=1000) valueAbbr = value.toFixed(1).toString();
		else if (value>=100) valueAbbr = value.toFixed(2).toString();
		else if (value>=10) valueAbbr = value.toPrecision(3).toString();
		else if (value<10) valueAbbr = value.toPrecision(2).toString();
		else valueAbbr = value.toString();
	}
	return valueAbbr;
};
//IFormat.prototype.formatNumber = IFormat.prototype.formatToString;
IFormat.prototype.formatNumber = IFormat.prototype.formatNumberToAbbreviated;
IFormat.prototype.formatnumber = IFormat.prototype.formatNumber;
IFormat.prototype.formatReal = IFormat.prototype.formatToString;
IFormat.prototype.formatreal = IFormat.prototype.formatReal;
IFormat.prototype.formatInt = IFormat.prototype.formatToString;
IFormat.prototype.formatint = IFormat.prototype.formatInt;

IFormat.prototype.formatnumberAbbrev = IFormat.prototype.formatNumberToAbbreviated;
IFormat.prototype.formatrealAbbrev = IFormat.prototype.formatReal;
IFormat.prototype.formatintAbbrev = IFormat.prototype.formatInt;
IFormat.prototype.getFormatFunction = datatype=>{
	try{
		return IFormat.prototype["format"+datatype]||IFormat.prototype.toString;
	} catch(e) {
		return IFormat.prototype.toString;
	}

};
IFormat.prototype.getFormatAbbreviatedFunction = datatype=>{
	try{
		return IFormat.prototype["format"+datatype+"Abbrev"]||IFormat.prototype.toString;
	} catch(e) {
		return IFormat.prototype.toString;
	}

};
IFormat.prototype.wrap = (v)=>this.pre + v + this.post;

const iFormat= new IFormat();
