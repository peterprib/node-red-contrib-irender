function Column() {
	for(let i=0;i<arguments.length;i++) 
		Object.assign(this,arguments[i]);
//	this.iFormat=new IFormat();
	if(!this.column) this.column=this.name;
	if(!this.title) this.title=this.name;
	if(!this.type)
		this.type=this.data||this.data.length?typeof this.data[0][this.offset]:"string";
}
Column.prototype.appendCellTitle = function(row,css) {
	css.createElement(row,"TD","Head").appendChild(document.createTextNode(this.title));
};
Column.prototype.appendCellData = function(row,css,dataRow) {
	css.createElement(row,"TD","Cell").appendChild(iFormat.toHTML(dataRow[this.offset]));
};
Column.prototype.getAbbreviated = function(i) {
	if(!this.formatAbbreviateFunction)
		this.formatAbbreviateFunction=iFormat.getFormatAbbreviatedFunction(this.type);
	return this.formatAbbreviateFunction(this.data[i][this.offset],this.precision);
};
Column.prototype.getAbbreviatedValue = function(value) {
	if(!this.formatAbbreviateFunction)
		this.formatAbbreviateFunction=iFormat.getFormatAbbreviatedFunction(this.type);
	return this.formatAbbreviateFunction(value,this.precision);
};
Column.prototype.getAvg = function() {
	return this.avg||this.setAvg();
};
Column.prototype.getColumnData = function() {
	return this.columnData||this.setColumnData();
};
Column.prototype.getCount = function() {
	return this.data.length
};
Column.prototype.getDataRow = function(i) {
	return (this.columnData||this.getColumnData())[i];
};
Column.prototype.getDataFirst = function() {
	return (this.columnData||this.getColumnData())[0];
};
Column.prototype.getDataLast = function() {
	return (this.columnData||this.getColumnData())[this.columnData.length-1];
};
Column.prototype.getDeltaData = function() {
	return this.delta||this.setDeltaData();
};
Column.prototype.getFormatted = function(i) {
	if(!this.formatFunction)
		this.formatFunction=iFormat.getFormatFunction(this.type);
	return this.formatFunction((this.columnData||this.getColumnData())[i],this.precision);
};
Column.prototype.getFormattedInRow = function(row) {
	if(!this.formatfunction)
		this.formatfunction=iFormat.getFormatFunction(this.type);
	return this.formatFunction(row[this.offset],this.precision);
};
Column.prototype.getFormattedValue = function(v) {
	if(!this.formatfunction)
		this.formatfunction=iFormat.getFormatFunction(this.type);
	return this.formatFunction(v,this.precision);
};
Column.prototype.getMax = function() {
	return this.max||this.setMax();
};
Column.prototype.getMin = function() {
	return this.min||this.setMin();
};
Column.prototype.getMinDelta = function() {
	return this.min||this.setMinDelta();
};
Column.prototype.getNormalizedData = function() {
	if(!this.normalizedData) {
		const range=this.getRange();
		if(range) {
			const avg=this.getAvg(),
				offset=range/avg;
			this.normalizedData=this.getValidNumber(this.getColumn.data.map(c=>c/range-offset));
		} else
			this.normalizedData=this.getValidNumber(this.getColumn.data.map(c=>0));
		
	}
	return this.normalizedData;
};
Column.prototype.getPercentage = function(value) {
	return 100*value/(this.sum||this.getSum());
};
Column.prototype.getPercentageRow = function(i) {
	return 100*(this.columnData||this.getColumnData())[i]/(this.sum||this.getSum());
};
Column.prototype.getPointsNear = function(value,points,radiusChart=5) {
	const radius=this.scaleReverse(radiusChart),
		min=value-radius,max=value+radius,columnData=(this.columnData||this.getColumnData());
	if(points) return points.filter(i=>{const c=columnData[i]; return min<=c&&c<=max});
	let pointsFound=[];
	columnData.forEach((c,i)=>{if(min<=c&&c<=max) pointsFound.push(i)});
	return pointsFound;
};
Column.prototype.getProportion = function(value) {
	return value/(this.sum||this.getSum());
};
Column.prototype.getProportionRow = function(i) {
	return (this.columnData||this.getColumnData())[i]/(this.sum||this.getSum());
};
Column.prototype.getRange = function() {
	return this.range||this.setRange();
};
Column.prototype.getRatio = function() {
	return this.ratio||this.setRatio();
};
Column.prototype.getRow = function(i) {
	return (this.columnData||this.getColumnData())[i];
};
Column.prototype.getScaledRow = function(i) {
	return (this.columnData||this.getColumnData())[i]*(this.ratio||this.getRatio());
};
Column.prototype.getString = function(i) {
	if(!this.format)
		this.formatfunction=iFormat.getFormatFunction(this.type);
	this.formatFunction(this.data[i][this.offset],this.precision);
};
Column.prototype.getSum = function() {
	if(this.sum==null)
		this.sum=(this.columnData||this.getColumnData()).reduce((c,a)=>c+a, this.isMeasure()?0:"")
	return this.sum;
};
Column.prototype.getValidNumber = function(value) {
	if(isNaN(value)) throw Error(this.name+" or its calculation does have valid number but has value "+value);
	return value;
};
Column.prototype.isDateTime = function() {
	return iFormat.isDateTime(this.type);
};
Column.prototype.isInRange = function(value) {
	return value>= (this.min||this.getMin()) || value <= (this.max||this.getMax());
};
Column.prototype.isMeasure = function() {
	return iFormat.isMeasure(this.type);
};
Column.prototype.isTimestamp = function() {
	return iFormat.isString(this.type);
};
Column.prototype.isTimestamp = function() {
	return iFormat.isTimestamp(this.type);
};
Column.prototype.scale = function(value) {
	return value*(this.ratio||this.getRatio());
};
Column.prototype.scaleReverse = function(value) {
	return (this.ratio||this.getRatio())/value;
};
Column.prototype.scaleExponential=function(value){
	const ratio=this.ratio||this.getRatio();
	return value==0
		?0
		:value>0
			?Math.log(value*ratio)
			:-Math.log(-value*ratio);
};
Column.prototype.setAvg = function() {
	this.avg=this.sum(d)/this.columnData.length;
	return this.avg;
};
Column.prototype.setColumnData = function() {
	this.columnData=this.data.map(r=>r[this.offset]);
	return this.columnData;
};
Column.prototype.setDeltaData = function() {
	if(this.isMeasure())
		this.delta=this.getColumnData().map((cell,index,arr)=>index?arr[index]-arr[index-1]:null);
	return this.delta;
};
Column.prototype.setMax = function() {
	this.max=this.getValidNumber(Math.max(...this.getColumnData()));
	return this.max;
};
Column.prototype.setMin = function() {
	this.min=this.getValidNumber(Math.min(...(this.getColumnData())));
	return this.min;
};
Column.prototype.setMinDelta = function() {
	this.minDelta=this.getValidNumber(Math.min(...this.getDeltaData().slice(1)));
	return this.minDelta;
};
Column.prototype.setRange = function() {
	this.range=this.getValidNumber(this.getMax()-this.getMin());
	return this.range;
};
Column.prototype.setRatio = function() {
	this.ratio=this.getValidNumber(this.getMax()/this.getRange());
	return this.ratio;
};
