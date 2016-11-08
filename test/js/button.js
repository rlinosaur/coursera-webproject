var CANVAS_REFRESH_TIMEOUT=50;
var BUTTONLOCK_TIME_MS=500;
var BUTTONLOCK_STEP_MS=CANVAS_REFRESH_TIMEOUT/BUTTONLOCK_TIME_MS;
var BUTTONLOCK_DEFAULT_SIZE=100;

var ButtonLockArc=function(radius, width,color,clockwise,internalRadius,finalAngle)
{
	this.width=width;
	this.radius=radius;
	this.color=color;
	this.clockwise=clockwise;	
	if(internalRadius!==undefined)
		this.freeAngle=Math.asin(internalRadius/this.radius);
	else
		this.freeAngle=Math.PI/2;
	this.shiftAngle=Math.random()*2*Math.PI;
	this.currentAngle=this.shiftAngle;//Угол, с которого всё начинается.
	if(finalAngle!==undefined)
		this.finalAngle=finalAngle;
	else
		this.finalAngle=0.5*Math.PI;
	if(!clockwise)			
		this.finalAngle-=2*Math.PI;
	this.stepAngle=(this.currentAngle-this.finalAngle)*BUTTONLOCK_STEP_MS;//не используется пока (шаг, с которым смещается угол до нужного нам положения, получается из разницы между сдвигом и итогом)

	this.lockTimeoutWorks=false;//понадобится ли? Не знаю.
	this.unlockTimeoutWorks=false;
	//зафигачить таймаут надобно...вроде бы как, да.

}

ButtonLockArc.prototype.setfreeAngle=function(internalRadius)
{
	this.freeAngle=Math.asin(internalRadius/this.radius);
}

var ButtonLockNucleus = function(color)
{
	this.color=color;
	this.state=0.0;//States range: 0.0 ... 1.0
	this.radius=7;
}

var ButtonLock = function (containerId, finalAngle)
{	
	this.finalAngle;
	if(finalAngle!==undefined)this.finalAngle=finalAngle;
		else this.finalAngle=0.5*Math.PI;
	this.nucleus = new ButtonLockNucleus('blue');
	this.arcArray= new Array();
	this.createArcs(BUTTONLOCK_DEFAULT_SIZE,BUTTONLOCK_DEFAULT_SIZE);

	this.containerId=containerId;
	this.container=document.getElementById(this.containerId);
	this.container.className="buttonLockContainer";
	this.centerX=BUTTONLOCK_DEFAULT_SIZE/2;
	this.centerY=BUTTONLOCK_DEFAULT_SIZE/2;
	//this.container.style="2px solid red";

	var element=document.createElement('CANVAS');
	//element.style.border="1px solid red";	
	element.width=BUTTONLOCK_DEFAULT_SIZE;
	element.height=BUTTONLOCK_DEFAULT_SIZE;
	element.style.width=element.width+"px";
	element.style.height=element.height+"px";	
	element.id=containerId+"_canvas";

	var button = this;
	element.onmouseenter = function()
	{
		button.unlockTimeoutWorks=false;
		button.lockTimeoutWorks=true;	
		button.unlockTimeout();		
	}
	element.onmouseleave = function()
	{
		button.lockTimeoutWorks=false;
		button.unlockTimeoutWorks=true;
		button.lockTimeout();		
	}	
	this.container.appendChild(element);
	this.canvas=element;//должно прокатить.	
	console.log(this.canvas);
	this.context=this.canvas.getContext("2d");
}

ButtonLock.prototype.createArcs=function(width,height,num)
{
	var arcNum;
	if (num==undefined)
		arcNum=Math.floor((Math.min(width,height)-12)/10);
	else
		arcNum=num;
	this.arcArray = new Array();
	var clockWiseFlag=false;
	for(i=0;i<arcNum;i++)
	{
		this.arcArray.push(new ButtonLockArc(10+i*5,2,'green',clockWiseFlag,this.nucleus.radius));	
		clockWiseFlag=!clockWiseFlag;	
	}
}

ButtonLock.prototype.setSize=function(width,height)
{
	this.canvas.width=width;
	this.canvas.height=height;
	this.canvas.style.width=width+"px";
	this.canvas.style.height=height+"px";
	this.centerX=width/2;
	this.centerY=height/2;
	//ну можно, конечно, даааа....ну а почему нет?
	this.createArcs(width,height);
}
ButtonLock.prototype.unlockTimeout=function()
{		
	var button=this;
	var flagNotYet=false;
	var currentArc;
	var i;
	if(!button.lockTimeoutWorks) return;
	for(i=0;i<button.arcArray.length;i++)
	{
		currentArc=button.arcArray[i];		
		if(Math.abs(currentArc.finalAngle-currentArc.currentAngle)>Math.abs(currentArc.stepAngle))
		{
			currentArc.currentAngle-=currentArc.stepAngle;
			flagNotYet |=true;
		}		
	}
	button.nucleus.state+=BUTTONLOCK_STEP_MS;
	if(flagNotYet)
		setTimeout(function(){button.unlockTimeout();},CANVAS_REFRESH_TIMEOUT);
	else
	{
		//Done. Could do something like menu appearance etc...
		for(i=0;i<button.arcArray.length;i++)button.arcArray[i].currentAngle=button.arcArray[i].finalAngle;
		button.nucleus.state=1.0;
	}
	button.canvasClear(button.context,button.canvas);
	button.draw();	
}


ButtonLock.prototype.lockTimeout=function()
{	
	var button=this;
	var flagNotYet=false;
	var currentArc;
	var i;
	if(!button.unlockTimeoutWorks) return;
	for(i=0;i<button.arcArray.length;i++)
	{
		currentArc=button.arcArray[i];		
		if(Math.abs(currentArc.shiftAngle-currentArc.currentAngle)>Math.abs(currentArc.stepAngle))
		{
			currentArc.currentAngle+=currentArc.stepAngle;
			flagNotYet |=true;
		}
	}
	button.nucleus.state-=BUTTONLOCK_STEP_MS;
	if(button.nucleus.state<0)button.nucleus.state=0;
	if(flagNotYet)
		setTimeout(function(){button.lockTimeout();},CANVAS_REFRESH_TIMEOUT);
	else
	{
		for(i=0;i<button.arcArray.length;i++)button.arcArray[i].currentAngle=button.arcArray[i].shiftAngle;		
		button.nucleus.state=0.0;
	}
	button.canvasClear(button.context,button.canvas);
	button.draw();	
}

ButtonLock.prototype.draw = function()
{
	/*
	Arc parameters: center_x, center_y, radius,start_angle, end_angle;
	*/	
	var rad;	
	var currentArc;
	var context=this.context;
	context.globalAlpha = 1.0
	context.fillStyle = '#0000FF';	
	context.lineWidth = 3;
	for(i=0;i<this.arcArray.length;i++)
	{
		currentArc=this.arcArray[i];
		context.strokeStyle = currentArc.color;
		context.beginPath();		
		context.arc(this.centerX,this.centerY,currentArc.radius,currentArc.freeAngle+currentArc.currentAngle,2*Math.PI-currentArc.freeAngle+currentArc.currentAngle);		
		context.stroke();		
	}

	context.globalAlpha = this.nucleus.state;
	context.fillStyle=this.nucleus.color;	
	context.beginPath();
	context.arc(this.centerX,this.centerY,this.nucleus.radius,0,2*Math.PI);
	context.fill();	
}

ButtonLock.prototype.canvasClear = function(context,canvas)
{
	context.clearRect(0, 0, canvas.width, canvas.height);
}