/*
	功能：jQuery打字动画效果插件
	作者：YuYan
	代码版本：V1.0
	日期：2016-6-23
 */
(function($){
	var printQueue=0;//队列号
	$.fn.typewriter=function(options){
		var printText,//待打印文字
			printSpeed,//打印速度
			cursor,//光标元素
			calback,//回调函数
			queue,//是否队列化
			cursorBlinkRate,//光标闪烁速度
			cursorColor;//光标颜色
		var that = this,
			thisQueue = printQueue,//队列号
			insertCursor;//插入的光标元素

		printQueue += 1;
		
		//参数处理
		if(options === undefined || options === null)return this;//无参数时直接返回
		if(typeof options === "object"){
			//参数为对象的情况
			if(options.printText === undefined || options.printText === null)return this;
			printText = options.printText.toString().split("");
			printSpeed = options.printSpeed;
			cursor = options.cursor;
			calback = options.calback;
			queue = options.queue;
			cursorBlinkRate = options.cursorBlinkRate;
			cursorColor = options.cursorColor;
		}else{
			//简单调用的情况
			printText = arguments[0].toString().split("");
			printSpeed = arguments[1];
			if(typeof arguments[2] === "function"){
				calback = arguments[2];
			}else{
				cursor = arguments[2];
				calback = arguments[3];
			}
		}
		
		//设置各样式
		if(typeof $.fn.typewriter.printSpeed !== "number")$.fn.typewriter.printSpeed = 300;
		if(typeof $.fn.typewriter.cursorBlinkRate !== "number")$.fn.typewriter.cursorBlinkRate = 541;
		
		//设置打印速度
		printSpeed = parseInt(printSpeed);
		if(isNaN(printSpeed)){
			printSpeed = $.fn.typewriter.printSpeed;
		}
		
		//设置队列
		queue = queue === false ? "typewriterFx" : "fx";
		
		//设置光标闪烁速度
		cursorBlinkRate = parseInt(cursorBlinkRate);
		if(isNaN(cursorBlinkRate)){
			cursorBlinkRate = $.fn.typewriter.cursorBlinkRate;
		}
		
		//设置光标颜色
		if(typeof cursorColor !== "string"){
			cursorColor = "black";
		}
		
		//创建光标元素
		switch(cursor){
			case "vertical":
				cursor = document.createElement("span");
				cursor.innerHTML = "|";
				cursor.style.color = cursorColor;
			break;
			case "block":
				cursor = document.createElement("span");
				cursor.innerHTML = "&nbsp;";
				cursor.style.backgroundColor = cursorColor;
			break;
			case "underline":
				cursor = document.createElement("span");
				cursor.innerHTML = "_";
				cursor.style.color = cursorColor;
			break;
			case "none":
				cursor = null;
				cursorBlinkRate = 0;
			break;
			default:
				cursor = $(cursor)[0];
				if(cursor === undefined || cursor.tagName.toUpperCase() === "BR"){
					cursor = undefined;
					cursorBlinkRate = 0;
				}
			break;
		}
		
		//插入光标
		if(cursor !== undefined){
			that.queue(queue,function(next){
				if(this === that[0]){
					that.typewriter_cursor().remove();
					$(cursor).data("typewriter",thisQueue).appendTo(that);
					//光标闪烁
					blink();
				}
				next();
			});
		}
		
		
		//光标闪烁函数
		function blink(){
			var blinkCursor = that.children(":not(br)").filter(function(){return $(this).data("typewriter") === thisQueue;});
			if(blinkCursor.length === 0)return;
			if(cursorBlinkRate > 0){
				blinkCursor.css("display",blinkCursor.css("display") !== "inline" ? "inline" : "none");
				setTimeout(blink,cursorBlinkRate);
			}
		}
		
		//打印文字
		$.each(printText,function(index,value){
			var insertElement;
			switch(value){
			case "\n":
				insertElement = document.createElement("br");
				break;
			case " ":
				insertElement = "&nbsp;";
				break;
			default:
				insertElement = document.createTextNode(value);
				break;
			}
			if(index !== 0 && printSpeed > 0){
				that.delay(printSpeed,queue);
			}
			that.queue(queue,function(next){
				var insertCursor = $(this).typewriter_cursor();
				var insertClone = insertElement.cloneNode !== undefined ? insertElement.cloneNode() : insertElement;
				if(insertCursor.length > 0){
					insertCursor.before(insertClone);
				}
				else{
					that.append(insertClone);
				}
				next();
			});
		});
		
		//调用回调函数
		if(typeof calback === "function"){
			that.queue(queue,function(next){
				calback.call(this);
				next();
			});
		}

		return that;
	};
	
	//获取或设置选中元素中的光标
	$.fn.typewriter_cursor = function(cursor,cursorBlinkRate,cursorColor){
		if(cursor === undefined){
			//获取光标
			return this.children(":not(br)").filter(function(){return $(this).data("typewriter") !== undefined;});
		}else if(cursorBlinkRate === undefined){
			//设置光标
			return this.typewriter("",0,cursor);
		}else{
			return this.typewriter({
				printText : "" ,
				printSpeed : 0 ,
				cursor : cursor ,
				cursorBlinkRate : cursorBlinkRate ,
				cursorColor : cursorColor
			});
		}
	};
	
	//退格动画
	$.fn.typewriter_backspace = function(){
		var count = parseInt(arguments[0]),//退格字数
			printSpeed = parseInt(arguments[1]),//退格速度
			queue,//是否队列化
			calback;//回调函数
		var that = this;
		
		//参数处理
		if(typeof arguments[2] === "boolean"){
			queue = arguments[2];
			calback = arguments[3];
		}else{
			queue = true;
			calback = arguments[2];
		}
		
		//参数错误直接返回
		if(isNaN(count)){
			return this;
		}

		if(typeof $.fn.typewriter.printSpeed !== "number")$.fn.typewriter.printSpeed = 300;
		if(typeof $.fn.typewriter.cursorBlinkRate !== "number")$.fn.typewriter.cursorBlinkRate = 541;
		
		//设置退格速度
		if(isNaN(printSpeed)){
			printSpeed = $.fn.typewriter.printSpeed;
		}
		
		//设置队列
		queue = queue === false ? "typewriterFx":"fx";
		
		//退格处理
		while(count > 0){
			that.queue(queue,function(next){
				var insertCursor = $(this).typewriter_cursor(),//插入的光标元素
					delText;//要删除的文本节点
				if(insertCursor.length > 0){
					delText = insertCursor[0].previousSibling;
				}else{
					delText = this.lastChild;
				}
				while(delText !== null && delText.nodeType !== 3){
					delText = delText.previousSibling;
				}
				if(delText !== null){
					this.removeChild(insertCursor[0].previousSibling);
				}
				next();
			});
			count = count - 1;
			if(count !== 0 && printSpeed > 0){
				that.delay(printSpeed,queue);
			}
		}

		//调用回调函数
		if(typeof calback === "function"){
			that.queue(queue,function(next){
				calback.call(this);
				next();
			});
		}

		return that;
	}
	
	$.fn.typewriter.printSpeed = 300;//默认打印速度
	$.fn.typewriter.cursorBlinkRate = 541;//默认光标闪烁速度
}(jQuery));