var BACKGROUND_ACTION_TIMEOUT = 50;
var BACKGROUND_OBJECTS_NUM = 27;
var Background=function(containerId)
{
	var bodyElement;	
	this.containerId=containerId;
	this.container=document.getElementById(this.containerId);
	//Ну хорошо, что дальше...размер окна? Ну окей...
	bodyElement=document.getElementsByTagName('body')[0];
	console.log('BackgroundInit:'+(window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight));	
	var element=document.createElement('CANVAS');
	//element.style.border="1px solid red";		
	element.id=containerId+"_canvas";
	this.container.appendChild(element);
	this.canvas=element;//должно прокатить.
	this.avWidth=0;
	this.avHeight=0;
	this.resizeToWindow();
	var background=this;

	window.addEventListener('resize', function()
	{		
		background.resizeToWindow();
	});
	this.context=this.canvas.getContext("2d");
	this.objArray= new Array();
	this.createMovingObjects(BACKGROUND_OBJECTS_NUM);
	this.draw();
	this.actionTimeout();
	//9 точек надо, координаты любые. окей. ну как всегда, чего уж там.
	//вспомним молодость, ага.
	this.flagStop=false;
	this.container.addEventListener('click',function(event)
	{
		background.catchMice(event);
	}
	);
}

Background.prototype.catchMice = function(event)
{
	//пройтись по всем объектам, получить координаты мыши, иди ж ты...
	var i;
	event.clientX;
	event.clientY;
	for(i=0;i<this.objArray.length;i++)
	{
		//изменить скорость так, чтобы они все устремились к точке, где находится мышь.
		var obj=this.objArray[i];
		if((event.clientX-obj.X)<0)obj.speedX*=Math.sign(event.clientX-obj.X)*Math.sign(obj.speedX);
		if((event.clientY-obj.Y)<0)obj.speedY*=-Math.sign(event.clientY-obj.Y)*Math.sign(obj.speedY);
		/*
		obj.speedX=(event.clientX-obj.X)/200;
		obj.speedY=(event.clientY-obj.Y)/200;
		*/
	}


	console.log(event);
}

Background.prototype.createMovingObjects = function(objectsNum)
{
	
	//var b=0xfffff;//yourNumber.toString(16);
	//случайный цвет, однако.
	var i;//counter;
	this.objArray = new Array();
	for(i=0;i<objectsNum;i++)
	{
		//this.objArray.push(new MovingPoint({maxWidth:this.avWidth;maxHeight:this.avHeight},this.avWidth,this.avHeight));
		this.objArray.push(new MovingPoint({},this.avWidth,this.avHeight));
	}
	//console.log(this.objArray);
}

Background.prototype.resizeToWindow = function()
{	
	this.avWidth=((window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth )-15);
	this.avHeight=((window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight)-15);
	this.container.style.height=this.avHeight+'px';
	this.container.style.width=this.avWidth+'px';
	this.canvas.width=this.avWidth;
	this.canvas.height=this.avHeight;
	this.canvas.style.width=this.container.style.width;
	this.canvas.style.height=this.container.style.height;
	this.createMovingObjects(BACKGROUND_OBJECTS_NUM);
	//if(this.context!==undefined) this.draw();//no need when action begins.
	//console.log("resize To");
	//Переинициализацию объектов, если она будет, тоже сюда, кстати...Но это потом.	
}

Background.prototype.startAction = function()
{
	this.flagStop=false;
	this.actionTimeout();
}

Background.prototype.stopAction = function()
{
	this.flagStop=true;
}
Background.prototype.invertAction = function()
{
	this.flagStop=!this.flagStop;
	if(this.flagStop===false) this.actionTimeout();
}
Background.prototype.actionTimeout = function()
{
	//Например, можно научить их бегать за мышью, но не по прямой, а по параболе, чтобы было интереснее
	var i;
	var bg=this;
	if(this.flagStop) return;
	for(i=0;i<bg.objArray.length;i++)
	{
		var obj=bg.objArray[i];
		obj.X+=obj.speedX;
		obj.Y+=obj.speedY;

		/*
		//Working method!
		if(obj.X>=(this.avWidth-obj.radius) || obj.X<=obj.radius) {obj.speedX*=-1;}
		if(obj.Y>=(this.avHeight-obj.radius) || obj.Y<=obj.radius) {obj.speedY*=-1;}
		*/		
		if(obj.X>=(this.avWidth+obj.radius) || obj.X<=-obj.radius)
		{
			//obj.speedX*=-1;			
			obj.speedX=-Math.sign(obj.speedX)*(Math.random()*this.avWidth+this.avWidth/2)/500;
			obj.color=randomColor();			
		}
		if(obj.Y>=(this.avHeight+obj.radius) || obj.Y<=-obj.radius)
		{
			//obj.speedY*=-1;
			obj.speedY=-Math.sign(obj.speedY)*(Math.random()*this.avHeight+this.avHeight/2)/500;
			obj.color=randomColor();
		}
	}
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.draw();
	setTimeout(function(){bg.actionTimeout();},CANVAS_REFRESH_TIMEOUT);
}

Background.prototype.draw = function()
{	
	var i;
	var context=this.context;
	context.globalAlpha = 0.5;
	context.lineWidth = 3;
	context.globalAlpha = 0.5;
	/*
	var lingrad = ctx.createLinearGradient(0,0,0,400);
    lingrad.addColorStop(0, "#ededed" );
    lingrad.addColorStop(0.5, "#818181" );
    lingrad.addColorStop(1, "#000000" );
    ctx.fillStyle = lingrad;
	*/
	var movX=undefined,movY=undefined;

	for(i=0;i<this.objArray.length;i++)
	{		
		context.fillStyle=this.objArray[i].color;
		context.beginPath();		
		context.arc(this.objArray[i].X,this.objArray[i].Y,this.objArray[i].radius,0,2*Math.PI);
		context.fill();		
	}
}


var MovingPoint = function(pointInfo,maxX,maxY)
{
	//var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
	//да и там, в кнопке, хорошо бы заиметь что-то подобное, кстати.
	//Ишь ты, а мозг и правда раскручивается постепенно.
	//this.radius=Math.floor(Math.min(maxX,maxY)/10);	
	this.radius=Math.floor(Math.min(maxX,maxY)/15);
	if(pointInfo.color!==undefined)
		this.color=pointInfo.color;
	else
		this.color=randomColor();
	if(pointInfo.X!==undefined)
		this.X=pointInfo.X;
	else
		this.X=Math.random()*(maxX-this.radius*2)+this.radius;
	if(pointInfo.Y!==undefined)
		this.Y=pointInfo.Y;
	else
		this.Y=Math.random()*(maxY-this.radius*2)+this.radius;
	if(pointInfo.speedX!==undefined)
		this.speedX=pointInfo.speedX;
	else
		//this.speedX=(Math.random()*maxX-maxX/2)/250;
		//this.speedX=(Math.random() < 0.5 ? -1 : 1)*(maxX/250);
		this.speedX=(Math.random() < 0.5 ? -1 : 1)*(Math.random()*maxX+maxX/2)/500;	
	if(pointInfo.speedY!==undefined)
		this.speedY=pointInfo.speedY;
	else
		//this.speedY=(Math.random()*maxY-maxY/2)/250;
		//this.speedY=(Math.random() < 0.5 ? -1 : 1)*(maxY/250);	
		this.speedY=(Math.random() < 0.5 ? -1 : 1)*(Math.random()*maxY+maxY/2)/500;	
}


function randomColor()
{
	var num = Math.floor(Math.random()*0xffffff).toString(16);
	//return "000000".substr(0, 6 - num.length) + num;
	return "#000000".substr(0, 7 - num.length) + num;
}

