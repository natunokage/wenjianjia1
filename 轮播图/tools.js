var tools = {
	/* 获取元素的样式
	 * @param  obj <DOM Object> 要获取样式的元素对象
	 * @param  attr <string>  要获取的属性名
	 * @return  <string>  样式的值
	 */
	getStyle : function (obj, attr) {
	// 	if(obj.currentStyle){
	// 		// IE
	// 		return obj.currentStyle[attr];
	// 	}else{
	// 		return getComputedStyle(obj, false)[attr];
	// 	}
		
		return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
		
	// 	try{
	// 		return obj.currentStyle[attr];
	// 	}catch(){
	// 		return  getComputedStyle(obj, false)[attr];
	// 	}
	},
	
	/* 给元素设置样式
	 * obj <DOM Object> 要设置样式的元素
	 * attrObj <object> 设置的样式，如 {"width" : "200px", "height" : "300px"}
	 */
	setStyle : function (obj, attrObj) {
		for(var key in attrObj) {
			obj.style[key] = attrObj[key];
		}
	},
	
	/* 获取一个元素距离body边缘的坐标
	 * @param obj <DOM Object>  要获取坐标的那个元素对象
	 * @return <object> {left, top}
	 */
	getBodyDis : function (obj) {
		var left = 0, top = 0;
		while(obj.offsetParent) {
			left += obj.offsetLeft;
			top += obj.offsetTop;
			// obj赋值为父级，往前走一步继续计算
			obj = obj.offsetParent;
		}
		return {
			"top" : top,
			"left" : left
		};
	},
	
	/* 获取整个body的宽高
	 * @return <object> {width, height}
	 */
	getBody : function () {
		return {
			width : document.documentElement.clientWidth || document.body.clientWidth,
			height : document.documentElement.clientHeight || document.body.clientHeight
		}
	},
	/* 添加事件监听
	 * obj <DOM object>   添加监听的DOM对象
	 * type <string> 事件句柄（不带on）
	 * fn <function> 事件处理函数
	 * isCapture <boolean> 是否捕获，默认为false（IE8+有效）
	 */
	on: function (obj, type, fn, isCapture) {
		isCapture = isCapture || false;
		
		if(window.attachEvent){
			obj.attachEvent("on"+type, fn);
		}else{
			obj.addEventListener(type, fn, isCapture);
		}
		
	},
	/* 移出事件监听
	 * obj <DOM object>   添加监听的DOM对象
	 * type <string> 事件句柄（不带on）
	 * fn <function> 要移出的那个事件处理函数
	 * isCapture <boolean> 监听是在捕获阶段的话那么移出也要传true，默认为false（IE8+有效）
	 */
	off : function (obj, type, fn, isCapture) {
		isCapture = isCapture || false;
		if(window.detachEvent){
			obj.detachEvent("on"+type, fn);
		}else{
			obj.removeEventListener(type, fn, isCapture);
		}
	},
	
	/* 给某个元素绑定鼠标滚轮事件
	 * obj <DOM object>   添加监听的DOM对象
	 * fn <function>  事件处理函数 这个函数有一个参数 <boolean>  true向下  false代表向上
	 */
	scroll : function (obj, fn) {
		// 回调函数
		// 判断事件有没有效，而不是有没有绑定（有效但是没有绑定的时候值为null）
		if(obj.onmousewheel !== undefined) {
			
			obj.onmousewheel = function (e) {
				e = e || event;
				
				fn(e.wheelDelta < 0);
				/* if(e.wheelDelta < 0) fn(true);
				else fn(false); */
			}
		}else{
			
			obj.addEventListener("DOMMouseScroll", function (e) {
				e = e || event;
				fn(e.detail>0);
			})
		}
	},
	
	/* 让元素匀速运动到指定终点
	 * obj  <DOM Object>  运动的DOM元素
	 * attr <string>  运动的属性名称
	 * end  <number>  运动的终点值
	 * time <number>  运动的耗时
	 */
	linearMove : function (obj, attr, end, time) {
		// 先清除上一次的定时器
		// 把定时器挂在obj的自定义属性上，确保唯一性
		clearInterval(obj.timer);
		// 获取起点值
		var start = parseInt(this.getStyle(obj, attr));
		// 计算总距离
		var distance = end - start;
		// 计算速度
		// 计算运动的步数，以50ms为一步
		var steps = parseInt(time / 20);
		// 计算 px/步
		var speed = distance / steps;
		obj.timer = setInterval(function () {
			
			// 往前走一步
			start += speed;
			obj.style[attr] = start + "px";
			// 到终点的距离小于了一个速度的距离，那么就结束运动
			if(Math.abs(start - end) < Math.abs(speed)) {
				clearInterval(obj.timer);
				// 有可能会超出一点，手动拉回来
				obj.style[attr] = end + "px";
			}
		},20);
		
	},
	/* 缓冲运动
	 * obj  <DOM Object>  运动的DOM元素
	 * attr <string>  运动的属性名称
	 * end  <number>  运动的终点值
	 */
	move: function (obj, attr, end) {
		//console.log("move");
		// 清除上一次的定时器
		clearInterval(obj.timer);
		// 获取起点值
		var start = parseInt(this.getStyle(obj, attr));
		// 开始运动
		obj.timer = setInterval(function () {
			//console.log(11);
			// 剩下的距离
			var distance = end - start;
			// 速度（这一步走得距离）
			// 正向靠近的时候速度0.9向上取整变为1，负向接近的时候速度-0.9向下取整变为-1
			var speed = distance > 0 ? Math.ceil(distance / 10) : Math.floor(distance / 10);
			// 修改start本身
			start += speed;
			obj.style[attr] = start + "px";
			// 判断终点
			// 由于最后十步一定是一像素的移动，所以一定能相等
			if(start === end) {
				clearInterval(obj.timer);
				//console.log("end");
			}
		}, 20);
	},
	
	/* 让元素在窗口范围绝对居中
	 * obj  <DOM Object> 要居中的那个元素
	 */
	showCenter : function (obj) {
		// 显示
		// this.setStyle(obj, {display: "block"});
		obj.style.display = "block";
		// 加上绝对定位
		// 计算坐标
		let _this = this;
		function center () {
			var _top = (_this.getBody().height - obj.offsetHeight) / 2;
			var _left = (_this.getBody().width - obj.offsetWidth) / 2;
			console.log(obj.offsetHeight, obj.offsetWidth);
			_this.setStyle(obj, {
				position :"absolute",
				left : _left + "px",
				top : _top + "px"
			});
		};
		center();
		// 窗口大小发生改变的时候重新计算坐标
		window.onresize = center;
	}
}

