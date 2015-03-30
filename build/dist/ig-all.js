!function(t){var e,i;!function(){function t(t,e){if(!e)return t;if(0===t.indexOf(".")){var i=e.split("/"),a=t.split("/"),n=i.length-1,r=a.length,s=0,o=0;t:for(var c=0;r>c;c++)switch(a[c]){case"..":if(!(n>s))break t;s++,o++;break;case".":o++;break;default:break t}return i.length=n-s,a=a.slice(o),i.concat(a).join("/")}return t}function a(e){function i(i,s){if("string"==typeof i){var o=a[i];return o||(o=r(t(i,e)),a[i]=o),o}i instanceof Array&&(s=s||function(){},s.apply(this,n(i,s,e)))}var a={};return i}function n(i,a,n){for(var o=[],c=s[n],h=0,u=Math.min(i.length,a.length);u>h;h++){var l,d=t(i[h],n);switch(d){case"require":l=c&&c.require||e;break;case"exports":l=c.exports;break;case"module":l=c;break;default:l=r(d)}o.push(l)}return o}function r(t){var e=s[t];if(!e)throw new Error("No "+t);if(!e.defined){var i=e.factory,a=i.apply(this,n(e.deps||[],i,t));"undefined"!=typeof a&&(e.exports=a),e.defined=1}return e.exports}var s={};i=function(t,e,i){s[t]={id:t,deps:e,factory:i,defined:0,exports:{},require:a(t)}},e=a("")}(),i("ig",["ig/ig"],function(t){return t}),i("ig/ig",["require"],function(){"use strict";window.requestAnimationFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||function(t){var e,i,a=this;setTimeout(function(){e=+new Date,t(e),i=+new Date,a.timeout=1e3/60-(i-e)},a.timeout)}}(),window.cancelAnimationFrame=function(){return window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.webkitCancelRequestAnimationFrame||window.mozCancelAnimationFrame||window.mozCancelRequestAnimationFrame||window.msCancelAnimationFrame||window.msCancelRequestAnimationFrame||window.oCancelAnimationFrame||window.oCancelRequestAnimationFrame||window.clearTimeout}();var t={};return t}),i("ig/util",["require"],function(){"use strict";var t=Math.PI/180,e=180/Math.PI,i=Object.prototype,a={};return a.noop=function(){},a.extend=function(t,e){for(var i=1,a=arguments.length;a>i;i++)if(e=arguments[i])for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);return t},a.inherits=function(t,e){var i=function(){};i.prototype=e.prototype;var a=t.prototype,n=t.prototype=new i;for(var r in a)n[r]=a[r];return t.prototype.constructor=t,t.superClass=e.prototype,t},a.deg2Rad=function(e){return e*t},a.rad2Deg=function(t){return t*e},a.window2Canvas=function(t,e,i){var a=t.getBoundingClientRect();return{x:Math.round(e-a.left*(t.width/a.width)),y:Math.round(i-a.top*(t.height/a.height))}},a.fastApply=function(t,e,i){switch(i.length){case 0:return t.call(e);case 1:return t.call(e,i[0]);case 2:return t.call(e,i[0],i[1]);case 3:return t.call(e,i[0],i[1],i[2]);case 4:return t.call(e,i[0],i[1],i[2],i[3]);case 5:return t.call(e,i[0],i[1],i[2],i[3],i[4]);case 6:return t.call(e,i[0],i[1],i[2],i[3],i[4],i[5]);case 7:return t.call(e,i[0],i[1],i[2],i[3],i[4],i[5],i[6]);case 8:return t.call(e,i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7]);case 9:return t.call(e,i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7],i[8]);default:return t.apply(e,i)}},a.removeArrByCondition=function(t,e){for(var i,a=-1,n=0,r=t.length;r>n;n++)if(i=t[n],e(i)){a=n;break}-1!==a&&t.splice(a,1)},a.parseColor=function(t,e){return e===!0?"number"==typeof t?0|t:("string"==typeof t&&"#"===t[0]&&(t=t.slice(1)),parseInt(t,16)):("number"==typeof t&&(t="#"+("00000"+(0|t).toString(16)).substr(-6)),t)},a.colorToRGB=function(t,e){"string"==typeof t&&"#"===t[0]&&(t=window.parseInt(t.slice(1),16)),e=void 0===e?1:e;var i=t>>16&255,a=t>>8&255,n=255&t,r=0>e?0:e>1?1:e;return 1===r?"rgb("+i+","+a+","+n+")":"rgba("+i+","+a+","+n+","+r+")"},a.randomInt=function(t,e){return Math.floor(Math.random()*e+t)},a.randomFloat=function(t,e){return Math.random()*(e-t)+t},a.domWrap=function(t,e,i){return t.parentNode.insertBefore(e,t),e.appendChild(t),e.id=i,t},a.getType=function(t){var e=i.toString.call(t),a=/\[object (\w+)\]/.exec(e);return a[1].toLowerCase()},a.windowToCanvas=function(t,e,i){var a=t.getBoundingClientRect(),n=t.width,r=t.height;return{x:Math.round(e-a.left*(n/a.width)),y:Math.round(i-a.top*(r/a.height))}},a.getMouseCoords=function(t,e){var i=t.getBoundingClientRect(),a=i.top,n=i.bottom,r=i.left,s=i.right,o=getComputedStyle(t,null);if(o){var c=parseInt(o.getPropertyValue("border-top-width"),10),h=parseInt(o.getPropertyValue("border-right-width"),10),u=parseInt(o.getPropertyValue("border-bottom-width"),10),l=parseInt(o.getPropertyValue("border-left-width"),10);r+=l,s-=h,a+=c,n-=u}var d={};d.x=e.clientX-r,d.y=e.clientY-a;var f=s-r;if(t.width!==f){var p=n-a;d.x=d.x*(t.width/f),d.y=d.y*(t.height/p)}return d},a.captureMouse=function(t){var e={x:0,y:0,event:null},i=document.body.scrollLeft,a=document.documentElement.scrollLeft,n=document.body.scrollTop,r=document.documentElement.scrollTop,s=t.offsetLeft,o=t.offsetTop;return t.addEventListener("mousemove",function(t){var c,h;t.pageX||t.pageY?(c=t.pageX,h=t.pageY):(c=t.clientX+i+a,h=t.clientY+n+r),c-=s,h-=o,e.x=c,e.y=h,e.event=t,console.warn(e)},!1),e},a.captureTouch=function(t){var e={x:null,y:null,isPressed:!1,event:null},i=document.body.scrollLeft,n=document.documentElement.scrollLeft,r=document.body.scrollTop,s=document.documentElement.scrollTop,o=t.offsetLeft,c=t.offsetTop;return t.addEventListener("touchstart",function(t){e.isPressed=!0,e.event=t,console.warn(e,"touchstart")},!1),t.addEventListener("touchend",function(t){e.isPressed=!1,e.x=null,e.y=null,e.event=t,console.warn(e,"touchend")},!1),t.addEventListener("touchmove",function(t){var h,u,l=t.touches[0];l.pageX||l.pageY?(h=l.pageX,u=l.pageY):(h=l.clientX+i+n,u=l.clientY+r+s),h-=o,u-=c,e.x=h,e.y=u,e.event=t,console.log(a.getMouseCoords(e.event.target,l))},!1),e},a}),i("ig/Event",["require"],function(){"use strict";function t(){this._events={}}var e="_observerGUID";return t.prototype={constructor:t,on:function(t,i){this._events||(this._events={});var a=this._events[t];return a||(a=this._events[t]=[]),i.hasOwnProperty(e)||(i[e]=+new Date),a.push(i),this},un:function(t,e){if(this._events){if(!e)return void(this._events[t]=[]);var i=this._events[t];if(i)for(var a=0;a<i.length;a++)i[a]===e&&(i.splice(a,1),a--);return this}},fire:function(t,i){1===arguments.length&&"object"==typeof t&&(i=t,t=i.type);var a=this["on"+t];if("function"==typeof a&&a.call(this,i),this._events){null==i&&(i={}),"[object Object]"!==Object.prototype.toString.call(i)&&(i={data:i}),i.type=t,i.target=this;var n={},r=this._events[t];if(r){r=r.slice();for(var s=0;s<r.length;s++){var o=r[s];n.hasOwnProperty(o[e])||o.call(this,i)}}if("*"!==t){var c=this._events["*"];if(!c)return;c=c.slice();for(var s=0;s<c.length;s++){var o=c[s];n.hasOwnProperty(o[e])||o.call(this,i)}}}},enable:function(e){e._events={},e.on=t.prototype.on,e.un=t.prototype.un,e.fire=t.prototype.fire}},t}),i("ig/env",["require"],function(){"use strict";function t(t){var e={},i={},a=t.match(/Web[kK]it[\/]{0,1}([\d.]+)/),n=t.match(/(Android);?[\s\/]+([\d.]+)?/),r=!!t.match(/\(Macintosh\; Intel /),s=t.match(/(iPad).*OS\s([\d_]+)/),o=t.match(/(iPod)(.*OS\s([\d_]+))?/),c=!s&&t.match(/(iPhone\sOS)\s([\d_]+)/),h=t.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),u=t.match(/Windows Phone ([\d.]+)/),l=h&&t.match(/TouchPad/),d=t.match(/Kindle\/([\d.]+)/),f=t.match(/Silk\/([\d._]+)/),p=t.match(/(BlackBerry).*Version\/([\d.]+)/),g=t.match(/(BB10).*Version\/([\d.]+)/),v=t.match(/(RIM\sTablet\sOS)\s([\d.]+)/),m=t.match(/PlayBook/),y=t.match(/Chrome\/([\d.]+)/)||t.match(/CriOS\/([\d.]+)/),w=t.match(/Firefox\/([\d.]+)/),b=t.match(/MSIE\s([\d.]+)/)||t.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),x=!y&&t.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),S=x||t.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/),C=t.match(/MicroMessenger\/([\d.]+)/),I=t.match(/baiduboxapp\/[^\/]+\/([\d.]+)_/)||t.match(/baiduboxapp\/([\d.]+)/)||t.match(/BaiduHD\/([\d.]+)/)||t.match(/FlyFlow\/([\d.]+)/)||t.match(/baidubrowser\/([\d.]+)/),k=t.match(/MQQBrowser\/([\d.]+)/)||t.match(/QQ\/([\d.]+)/),O=t.match(/UCBrowser\/([\d.]+)/),j=t.match(/SogouMobileBrowser\/([\d.]+)/),A=n&&t.match(/MiuiBrowser\/([\d.]+)/),X=t.match(/LBKIT/),P=t.match(/Mercury\/([\d.]+)/);return(i.webkit=!!a)&&(i.version=a[1]),n&&(e.android=!0,e.version=n[2]),c&&!o&&(e.ios=e.iphone=!0,e.version=c[2].replace(/_/g,".")),s&&(e.ios=e.ipad=!0,e.version=s[2].replace(/_/g,".")),o&&(e.ios=e.ipod=!0,e.version=o[3]?o[3].replace(/_/g,"."):null),u&&(e.wp=!0,e.version=u[1]),h&&(e.webos=!0,e.version=h[2]),l&&(e.touchpad=!0),p&&(e.blackberry=!0,e.version=p[2]),g&&(e.bb10=!0,e.version=g[2]),v&&(e.rimtabletos=!0,e.version=v[2]),m&&(i.playbook=!0),d&&(e.kindle=!0,e.version=d[1]),f&&(i.silk=!0,i.version=f[1]),!f&&e.android&&t.match(/Kindle Fire/)&&(i.silk=!0),y&&(i.chrome=!0,i.version=y[1]),w&&(i.firefox=!0,i.version=w[1]),b&&(i.ie=!0,i.version=b[1]),S&&(r||e.ios)&&(i.safari=!0,r&&(i.version=S[1])),x&&(i.webview=!0),C&&(i.wechat=!0,i.version=C[1]),I&&(delete i.webview,i.baidu=!0,i.version=I[1]),k&&(i.qq=!0,i.version=k[1]),O&&(delete i.webview,i.uc=!0,i.version=O[1]),j&&(delete i.webview,i.sogou=!0,i.version=j[1]),A&&(i.xiaomi=!0,i.version=A[1]),X&&(i.liebao=!0,i.version="0"),P&&(i.mercury=!0,i.version=P[1]),navigator.standalone&&(i.standalone=!0),e.tablet=!!(s||m||n&&!t.match(/Mobile/)||w&&t.match(/Tablet/)||b&&!t.match(/Phone/)&&t.match(/Touch/)),e.phone=!(e.tablet||e.ipod||!(n||c||h||p||g||y&&t.match(/Android/)||y&&t.match(/CriOS\/([\d.]+)/)||w&&t.match(/Mobile/)||b&&t.match(/Touch/))),{browser:i,os:e}}function e(t){t.audioData=!!window.Audio,t.webAudio=!(!window.AudioContext&&!window.webkitAudioContext);var e=document.createElement("audio"),i=!1;try{(i=!!e.canPlayType)&&(e.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,"")&&(t.ogg=!0),(e.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,"")||e.canPlayType("audio/opus;").replace(/^no$/,""))&&(t.opus=!0),e.canPlayType("audio/mpeg;").replace(/^no$/,"")&&(t.mp3=!0),e.canPlayType('audio/wav; codecs="1"').replace(/^no$/,"")&&(t.wav=!0),(e.canPlayType("audio/x-m4a;")||e.canPlayType("audio/aac;").replace(/^no$/,""))&&(t.m4a=!0),e.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")&&(t.webm=!0))}catch(a){}}var i=t(navigator.userAgent),a={browser:i.browser,os:i.os,supportOrientation:"number"==typeof window.orientation&&"object"==typeof window.onorientationchange,supportTouch:"ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch,supportGeolocation:null!=navigator.geolocation,isAndroid:i.os.android,isIOS:i.os.ios,isPhone:i.os.phone,isTablet:i.os.tablet,isMobile:i.os.phone||i.os.tablet};return e(a),a}),i("ig/Game",["require","./Event","./util","./env","./Stage"],function(t){"use strict";function e(){var t=this,e=window.innerWidth,a=window.innerHeight,n=e/a,r=t.canvas.width/t.canvas.height,s=n>r?a/t.canvas.height:e/t.canvas.width,o=t.canvas.width*s,c=t.canvas.height*s;if(t.canvas.style.width=o+"px",t.canvas.style.height=c+"px",t.canvas.parentNode&&(t.canvas.parentNode.style.width=o+"px",t.canvas.parentNode.style.height=c+"px"),r>=n){var h=(a-c)/2;t.canvas.style.top=h+"px"}t.width=t.canvas.width,t.cssWidth=t.canvas.style.width,t.height=t.canvas.height,t.cssHeight=t.canvas.style.height,i.call(t)}function i(){var t=this;t.offCanvas||(t.offCanvas=document.createElement("canvas"),t.offCtx=t.offCanvas.getContext("2d")),t.offCanvas.width=t.canvas.width,t.offCanvas.style.width=t.canvas.style.width,t.offCanvas.height=t.canvas.height,t.offCanvas.style.height=t.canvas.style.height}function a(t){t=t||{},d.apply(this,arguments),this.name=null===t.name||void 0===t.name?"ig_game_"+v++:t.name,this.paused=!1,this.stageStack=[],this.stages={},m=t.fps||60}var n,r,s,o,c,h,u,l,d=t("./Event"),f=t("./util"),p=t("./env"),g=t("./Stage"),v=0,m=60;return a.prototype={constructor:a,init:function(t){var a=this;if(!t.canvas)throw new Error("Game init must be require a canvas param");a.canvas=f.domWrap(t.canvas,document.createElement("div"),"ig-stage-container"+v),a.canvas.width=t.width||320,a.canvas.height=t.height||480;var n=parseInt(a.canvas.width,10),r=parseInt(a.canvas.height,10),s=t.maxWidth||5e3,o=t.maxHeight||5e3;if(t.maximize){document.body.style.padding=0,document.body.style.margin=0;var c,h=f.getType(t.pageScroll);c="number"===h?t.pageScroll:"boolean"===h?17:0,n=t.width||Math.min(window.innerWidth,s)-c,r=t.height||Math.min(window.innerHeight-5,o)}p.supportTouch&&(a.canvas.style.height=2*r+"px",window.scrollTo(0,1),n=Math.min(window.innerWidth,s),r=Math.min(window.innerHeight,o)),a.ctx=a.canvas.getContext("2d"),a.canvas.style.height=r+"px",a.canvas.style.width=n+"px",a.canvas.width=n,a.canvas.height=r,a.canvas.style.position="relative",a.width=a.canvas.width,a.cssWidth=a.canvas.style.width,a.height=a.canvas.height,a.cssHeight=a.canvas.style.height,i.call(a);var u=a.canvas.parentNode;return u.style.width=n+"px",u.style.margin="0 auto",u.style.position="relative",window.addEventListener(p.supportOrientation?"orientationchange":"resize",function(){setTimeout(function(){window.scrollTo(0,1),t.scaleFit&&e.call(a)},0)},!1),a},start:function(){var t=this;t.paused=!1,r=Date.now(),n=0,s=1e3/m,o=0,c=Date.now(),h=0,u=0,l=0;var e="",i=f.noop,a=arguments.length;switch(a){case 1:"function"===f.getType(arguments[0])?i=arguments[0]:(e=arguments[0],i=f.noop);break;case 2:e=arguments[0],i=arguments[1]}if(e){for(var d=t.stageStack,p=-1,g=0,v=d.length;v>g;g++)if(d[g].name===e){p=g;break}t.swapStage(p,0)}return t.requestID=window.requestAnimationFrame(function(){t.render.call(t,e)}),"function"===f.getType(i)&&i.call(t,{data:{startTime:r,interval:s}}),t},render:function(){var t=this;if(t.requestID=window.requestAnimationFrame(function(t){return function(){t.render.call(t)}}(t)),!t.paused){if(n=Date.now(),o=n-r,o>s){l++,r=n-o%s,t.fire("beforeGameRender",{data:{startTime:r,totalFrameCounter:l}});var e=t.getCurrentStage();e&&(e.update(l,o),e.render()),t.fire("afterGameRender",{data:{startTime:r,totalFrameCounter:l}})}u>1e3?(c=Date.now(),u=0,t.fire("gameFPS",{data:{fps:h,totalFrameCounter:l}}),h=0):(u=Date.now()-c,++h)}},pause:function(){return this.paused=!0,this},resume:function(){return this.paused=!1,this},stop:function(){return window.cancelAnimationFrame(this.requestID),this},getStageStack:function(){return this.stageStack},getStageByName:function(t){return this.stages[t]},createStage:function(t){var e=this;t=f.extend({},{canvas:e.canvas,offCanvas:e.offCanvas,game:e},t);var i=new g(t);return this.pushStage(i),i},pushStage:function(t){var e=this;e.getStageByName(t.name)||(t.gameOwner=e,e.stageStack.push(t),e.stages[t.name]=t,e.sortStageIndex())},popStage:function(){var t=this,e=t.stageStack.pop();e&&(delete t.stages[e.name],t.sortStageIndex())},sortStageIndex:function(){for(var t=this.stageStack,e=t.length-1,i=0;e>=0;e--,i++)t[e].zIndex=i},removeStageByName:function(t){var e=this,i=e.getStageByName(t);if(i){delete e.stages[i.name];var a=e.stageStack;f.removeArrByCondition(a,function(e){return e.name===t}),e.sortStageIndex()}},changeStage:function(t){var e=this;if(t){for(var i=e.stageStack,a=-1,n=0,r=i.length;r>n;n++)if(i[n].name===t){a=n;break}e.swapStage(a,0)}},swapStage:function(t,e){var i=this,a=i.stageStack,n=a.length;if(t>=0&&n-1>=t&&e>=0&&n-1>=e){var r=a[t];a[t]=a[e],a[e]=r,i.sortStageIndex()}i.ctx.clearRect(0,0,i.canvas.width,i.canvas.height)},getStageIndex:function(t){return t.zIndex},getCurrentStage:function(){var t=this;return t.stageStack[0]},clearAllStage:function(){for(var t=this,e=0,i=t.stageStack.length;i>e;e++)t.stageStack[e].clean();t.stages={},t.stageStack=[]}},f.inherits(a,d),a}),i("ig/Stage",["require","./Event","./util","./DisplayObject"],function(t){"use strict";function e(t){var e=this;t.save(),t.fillStyle=t.createPattern(e.image,e.repeat),t.fillRect(e.x,e.y,t.canvas.width,t.canvas.height),t.restore(),h.src||(h.src=t.canvas.toDataURL(),e.image=h)}function i(t,e,i,a,n,r){var s=this,o=Math.abs(a.x)%n,c=Math.abs(a.y)%r,h=a.x<0?n-o:o,u=a.y<0?r-c:c,l=i.width<n-h?i.width:n-h,d=i.height<r-u?i.height:r-u;return t.drawImage(s.image,h,u,l,d,e.x,e.y,l,d),{width:l,height:d}}function a(){var t=this,a=t.parallax;if(a){var n=t.offCtx;"no-repeat"!==a.repeat&&e.call(a,n);for(var r=a.image.width,s=a.image.height,o={width:0,height:0},c=0;s>c;c+=o.height)for(var h=0;r>h;h+=o.width){var u={x:a.x+h,y:a.y+c},l={width:r-h,height:s-c},d={x:0,y:0};0===h&&(d.x=a.vX),0===c&&(d.y=a.vY),o=i.call(a,n,u,l,d,r,s)}}}function n(t){var e=this,i=e.parallax;i&&(i.anims&&"array"===o.getType(i.anims)?(i.animInterval=i.animInterval||1e4,i.curAnim||(i.curAnim=i.anims[0]),t%i.animInterval===0&&(void 0===i.time&&(i.time=0),i.time++,i.time===i.anims.length&&(i.time=0),i.curAnim=i.anims[i.time])):i.curAnim={aX:i.aX,aY:i.aY},i.vX=(i.vX+i.curAnim.aX)%i.image.width,i.vY=(i.vY+i.curAnim.aY)%i.image.height)}function r(t){s.apply(this,arguments),t=t||{},this.name=null===t.name||void 0===t.name?"ig_stage_"+u++:t.name,this.displayObjectList=[],this.displayObjects={},this.canvas=t.canvas,this.ctx=t.canvas.getContext("2d"),this.offCanvas=t.offCanvas,this.offCtx=t.offCanvas.getContext("2d"),this.width=t.game.width,this.height=t.game.height,this.cssWidth=t.game.cssWidth,this.cssHeight=t.game.cssHeight}var s=t("./Event"),o=t("./util"),c=t("./DisplayObject"),h=new Image,u=0;return r.prototype={constructor:r,clear:function(){var t=this;return t.offCtx.clearRect(0,0,t.width,t.height),t},setBgColor:function(t){var e=this;return e.bgColor=t,e},setBgImg:function(t,e){var i,a=this;"htmlimageelement"===o.getType(t)?i=t.src:"string"===o.getType(t)&&(i=t);var n="url("+i+")",r="",s="",c="";switch(e){case"center":r="no-repeat",s="center";break;case"full":c=a.cssWidth+"px "+a.cssHeight+"px"}return a.bgImg={bgUrl:n,bgRepeat:r,bgPos:s,bgSize:c},a},setParallaxScroll:function(t){var e=this;if(t=t||{},!t.image)throw new Error("ParallaxScroll must be require a image param");t.repeat=t.repeat&&-1!==["repeat","repeat-x","repeat-y"].indexOf(t.repeat)?t.repeat:"no-repeat",e.parallax=o.extend({},{x:0,y:0,vX:0,vY:0,aX:0,aY:0},t)},update:function(t,e){var i=this;n.call(i,t);for(var a,r=i.displayObjectList,s=r.length,o=0;s>o;o++)a=i.displayObjectList[o].status,(1===a||2===a)&&this.displayObjectList[o].update(e)},render:function(){var t=this;t.clear(),t.fire("beforeStageRender"),t.sortDisplayObject();var e,i=t.displayObjectList,n=i.length;t.offCtx.save(),t.offCtx.clearRect(0,0,t.offCanvas.width,t.offCanvas.height),t.canvas.style.backgroundColor=t.bgColor?t.bgColor:"",t.bgImg?(t.canvas.style.backgroundImage=t.bgImg.bgUrl,t.canvas.style.backgroundRepeat=t.bgImg.bgRepeat,t.canvas.style.backgroundPosition=t.bgImg.bgPos,t.canvas.style.backgroundSize=t.bgImg.bgSize):t.canvas.style.backgroundImage="",a.call(t);for(var r=0;n>r;r++)e=t.displayObjectList[r].status,(1===e||3===e)&&t.displayObjectList[r].render(t.offCtx);t.offCtx.restore(),t.ctx.drawImage(t.offCanvas,0,0),t.fire("afterStageRender")},renderDisplayObject:function(){var t,e=this,i=e.displayObjectList,a=i.length;e.offCtx.save(),e.offCtx.clearRect(0,0,e.offCanvas.width,e.offCanvas.height);for(var n=0;a>n;n++)t=e.displayObjectList[n].status,(1===t||3===t)&&e.displayObjectList[n].render(e.offCtx);e.offCtx.restore(),e.ctx.drawImage(e.offCanvas,0,0)},sortDisplayObject:function(){this.displayObjectList.sort(function(t,e){return t.zIndex-e.zIndex})},getDisplayObjectList:function(){return this.displayObjectList},getDisplayObjectByName:function(t){return this.displayObjects[t]},createDisplayObject:function(t){var e=new c(t);return this.addDisplayObject(e),e},addDisplayObject:function(t){var e=this;t&&!e.getDisplayObjectByName(t.name)&&(t.stageOwner=e,e.displayObjectList.push(t),e.displayObjects[t.name]=t)},removeDisplayObject:function(t){t&&this.removeDisplayObjectByName(t.name)},removeDisplayObjectByName:function(t){var e=this,i=e.displayObjects[t];if(i){delete e.displayObjects[i.name];var a=e.displayObjectList;o.removeArrByCondition(a,function(e){return e.name===t})}},clearAllDisplayObject:function(){this.displayObjectList=[],this.displayObjects={}}},o.inherits(r,s),r}),i("ig/DisplayObject",["require","./Event","./util"],function(t){"use strict";function e(t){t=t||{},i.apply(this,arguments),this.name=null===t.name||void 0===t.name?"ig_displayobject_"+n++:t.name,this.stageOwner=null,this.x=t.x||0,this.y=t.y||0,this.width=t.width||0,this.height=t.height||0,this.radius=t.radius||0,this.scaleX=t.scaleX||1,this.scaleY=t.scaleY||1,this.angle=t.angle||0,this.alpha=t.alpha||1,this.zIndex=t.zIndex||0,this.fillStyle=t.fillStyle||null,this.strokeStyle=t.strokeStyle||null,this.image=t.image||null,this.vX=t.vX||0,this.vY=t.vY||0,this.aX=t.aX||0,this.aY=t.aY||0,this.frictionX=t.frictionX||1,this.frictionY=t.frictionY||1,this.reverseVX=!1,this.reverseVY=!1,this.status=1,this.customProp=t.customProp||{},this.debug=!!t.debug||!1,this.setPos(this.x,this.y)}var i=t("./Event"),a=t("./util"),n=0;return e.prototype={constructor:e,setPos:function(t,e){this.x=t||this.x,this.y=e||this.y},setAcceleration:function(t,e){this.aX=t||this.aX,this.aY=e||this.aY},setAccelerationX:function(t){this.aX=t||this.aX},setAccelerationY:function(t){this.aY=t||this.aY},resetAcceleration:function(){this.aX=0,this.aY=0},move:function(t,e){this.x+=t,this.y+=e},moveStep:function(){this.vX+=this.aX,this.vX*=this.frictionX,this.x+=this.vX,this.vY+=this.aY,this.vY*=this.frictionY,this.y+=this.vY},setFrictionX:function(t){this.frictionX=t},setFrictionY:function(t){this.frictionY=t},rotate:function(t){var e=this.stageOwner.offCtx;e.save(),e.rotate(a.deg2Rad(t||this.angle)),e.restore()},update:function(){return!0},render:function(){return!0}},a.inherits(e,i),e}),i("ig/SpriteSheet",["require","./util","./DisplayObject"],function(t){"use strict";function e(t){if(t=t||{},!t.image)throw new Error("SpriteSheet must be require a image param");a.apply(this,arguments),this.name=null===t.name||void 0===t.name?"ig_spritesheet_"+n++:t.name,this.relativeX=t.relativeX||0,this.relativeY=t.relativeY||0,this.frameWidth=t.frameWidth||32,this.frameHeight=t.frameHeight||32,this.total=t.total||1,this.totalBackup=this.total,this.frameIndex=0,this.frameStartX=t.frameStartX||0,this.frameStartXBackup=this.frameStartX,this.frameStartY=t.frameStartY||0,this.frameStartYBackup=this.frameStartY,this.offsets=t.offsets,this._offsetX=0,this._offsetY=0,this._offsetWidth=0,this._offsetHeight=0,r=0}var i=t("./util"),a=t("./DisplayObject"),n=0,r=0;return e.prototype={constructor:e,update:function(){var t=this;r%1===0&&(t._offsetX=0,t._offsetY=0,t._offsetWidth=0,t._offsetHeight=0,t.offsets&&t.offsets[t.frameIndex]&&(t._offsetX=t.offsets[t.frameIndex].x||0,t._offsetY=t.offsets[t.frameIndex].y||0,t._offsetWidth=t.offsets[t.frameIndex].width||0,t._offsetHeight=t.offsets[t.frameIndex].height||0),t.relativeX=t.frameStartX*t.frameWidth+t.frameIndex*t.frameWidth+t._offsetX,t.relativeY=t.frameStartY*t.frameHeight+t._offsetY,t.frameIndex++,t.frameIndex>=t.total&&(t.frameIndex=0,t.frameStartY=t.frameStartYBackup,t.total=t.totalBackup),t.frameIndex*t.frameWidth>=t.image.width&&(t.frameStartY++,t.total=t.total-t.frameIndex,t.frameIndex=0)),r++},render:function(t){var e=this;t.save(),t.globalAlpha=e.alpha,t.translate(e.x,e.y),t.rotate(i.deg2Rad(e.angle)),t.scale(e.scaleX,e.scaleY),t.drawImage(e.image,e.relativeX,e.relativeY,e.frameWidth+e._offsetWidth,e.frameHeight+e._offsetHeight,-e.frameWidth/2,-e.frameHeight/2,e.frameWidth+e._offsetWidth,e.frameHeight+e._offsetHeight),t.restore()}},i.inherits(e,a),e}),i("ig/resourceLoader",["require","./ig","./util"],function(t){function e(t){var e=t.split(".");return e[e.length-1].toLowerCase()}var i=t("./ig"),a=t("./util"),n={png:"Image",jpg:"Image",gif:"Image",jpeg:"Image",ogg:"Audio",wav:"Audio",m4a:"Audio",mp3:"Audio"};i.resources={},i.loadOther=function(){var t,i,n,r,s=arguments.length;switch(s){case 1:t=i=arguments[0],n=r=a.noop;break;case 2:t=i=arguments[0],n=r=arguments[1];break;case 3:t=i=arguments[0],n=arguments[1],r=arguments[2];break;default:t=arguments[0],i=arguments[1],n=arguments[2],r=arguments[3]}var o=e(i),c=new XMLHttpRequest;c.onreadystatechange=function(){4===c.readyState&&(200===c.status?"json"===o?n(t,JSON.parse(c.responseText)):n(t,c.responseText):r(i))},c.open("GET",i,!0),c.send(null)},i.loadImage=function(){var t,e,i,n,r=arguments.length;switch(r){case 1:t=e=arguments[0],i=n=a.noop;break;case 2:t=e=arguments[0],i=n=arguments[1];break;case 3:t=e=arguments[0],i=arguments[1],n=arguments[2];break;default:t=arguments[0],e=arguments[1],i=arguments[2],n=arguments[3]}var s=new Image;s.addEventListener("load",function(){i(t,s)}),s.addEventListener("error",function(){n(e)}),s.src=e},i.loadResource=function(t,r,s){var o=this;s=s||{},Array.isArray(t)||(t=[t]);for(var c=!1,h=function(t){c=!0,(s.errorCallback||function(t){throw"Loading Error: "+t}).call(o,t)},u=s.processCallback||a.noop,l=t.length,d=l,f=function(t,e){c||(i.resources[t]||(i.resources[t]=e),d--,u(l-d,l),0===d&&r&&r.call(o,i.resources))},p=s.customResourceTypes||{},g=a.extend({},n,p),v=0;l>v;v++){var m,y,w=t[v];"object"===a.getType(w)?(m=w.id,y=w.src):m=y=w;var b=o["load"+g[e(y)]];b||(b=o.loadOther),b(m,y,f,h)}}}),i("ig/Shape/Ball",["require","../util","../DisplayObject"],function(t){"use strict";function e(){var t=this;a.apply(t,arguments)}var i=t("../util"),a=t("../DisplayObject");return e.prototype={constructor:e,update:function(){var t=this,e=t.stageOwner.width,i=t.stageOwner.height;(t.x<t.radius||t.x>e-t.radius)&&(t.vX=-t.vX),(t.y<t.radius||t.y>i-t.radius)&&(t.vY=-t.vY),t.moveStep(),t.bBox.x=t.x,t.bBox.y=t.y},render:function(t){t.save(),t.beginPath(),t.fillStyle=this.color,t.arc(this.x,this.y,this.radius,0,2*Math.PI),t.fill(),t.restore(),this.bBox.color="red",this.checkCollide(),this.bBox.show(t)},setBBox:function(t){this.bBox=t},checkCollide:function(){for(var t=this,e=t.stageOwner.displayObjectList,i=e.length,a=0;i>a;a++)t.name!==e[a].name&&t.bBox.isCollide(e[a].bBox)&&"yellow"!==t.bBox.color&&(console.warn(1),t.bBox.color="yellow",e[a].bBox.color="yellow")}},i.inherits(e,a),e}),i("ig/geom/Circle",["require","../util","../DisplayObject","../collision"],function(t){"use strict";function e(){a.apply(this,arguments)}var i=t("../util"),a=t("../DisplayObject"),n=t("../collision"),r=Math.abs,s=Math.sqrt;return e.prototype={constructor:e,intersects:function(t,e){return n.checkCircleCircle(this,t,e)},intersectsPolygon:function(t,e){return n.checkCirclePolygon(this,t,e)},hitTestPoint:function(t,e){var i=r(t-this.x),a=r(e-this.y),n=s(i*i+a*a);return n<=this.radius?!0:!1},debugRender:function(t){this.debug&&(t.save(),t.strokeStyle="black",t.strokeRect(this.x-this.radius,this.y-this.radius,2*this.radius,2*this.radius),t.restore())}},i.inherits(e,a),e}),i("ig/geom/Vector",["require"],function(){function t(t,e){this.x=t||0,this.y=e||t||0}var e=Math.sqrt,i=Math.cos,a=Math.sin;return t.prototype={constructor:t,copy:function(t){return this.x=t.x,this.y=t.y,this},rotate:function(t){var e=this.x,n=this.y,r=i(t),s=a(t);return this.x=e*r-n*s,this.y=e*s+n*r,this},perp:function(){var t=this.x;return this.x=this.y,this.y=-t,this},reverse:function(){return this.x=-this.x,this.y=-this.y,this},normalize:function(){var t=this.len();return t>0&&(this.x/=t,this.y/=t),this},add:function(t){return this.x+=t.x,this.y+=t.y,this},sub:function(t){return this.x-=t.x,this.y-=t.y,this},scale:function(t,e){return this.x*=t,this.y*=e||t,this},project:function(t){var e=this.dot(t)/t.len2();return this.x=e*t.x,this.y=e*t.y,this},projectN:function(t){var e=this.dot(t);return this.x=e*t.x,this.y=e*t.y,this},reflect:function(t){var e=this.x,i=this.y;return this.project(t).scale(2),this.x-=e,this.y-=i,this},reflectN:function(t){var e=this.x,i=this.y;return this.projectN(t).scale(2),this.x-=e,this.y-=i,this},dot:function(t){return this.x*t.x+this.y*t.y},len2:function(){return this.dot(this)},len:function(){return e(this.len2())}},t}),i("ig/geom/Polygon",["require","../util","../DisplayObject","../collision","./Vector"],function(t){"use strict";function e(t){a.apply(this,arguments),this.points=t.points||[],this.recalc(),this.getBounds()}var i=t("../util"),a=t("../DisplayObject"),n=t("../collision"),r=t("./Vector");return e.prototype={constructor:e,recalc:function(){var t=this.points,e=t.length;this.edges=[],this.normals=[];for(var i=0;e>i;i++){var a=t[i],n=e-1>i?t[i+1]:t[0],s=(new r).copy(n).sub(a),o=(new r).copy(s).perp().normalize();this.edges.push(s),this.normals.push(o)}return this},getBounds:function(){for(var t=this.points,e=this.x,i=this.y,t=this.points,e=this.x,i=this.y,a=Number.MAX_VALUE,n=Number.MIN_VALUE,r=Number.MAX_VALUE,s=Number.MIN_VALUE,o=0,c=t.length;c>o;o++)t[o].x<a&&(a=t[o].x),t[o].x>n&&(n=t[o].x),t[o].y<r&&(r=t[o].y),t[o].y>s&&(s=t[o].y);return this.bounds={x:a+e,y:r+i,width:n-a,height:s-r},this},intersects:function(t,e){return n.checkPolygonPolygon(this,t,e)},intersectsCircle:function(t,e){return n.checkPolygonCircle(this,t,e)},debugRender:function(t){this.debug&&(this.getBounds(),t.save(),t.strokeStyle="black",t.strokeRect(this.bounds.x,this.bounds.y,this.bounds.width,this.bounds.height),t.restore())}},i.inherits(e,a),e}),i("ig/collision",["require","./geom/Vector"],function(t){"use strict";function e(){this.first=null,this.second=null,this.overlapN=new r,this.overlapV=new r,this.reset()}function i(t,e,i){for(var a=Number.MAX_VALUE,n=-Number.MAX_VALUE,s=t.length;s--;){var o=new r(t[s].x,t[s].y).dot(e);a>o&&(a=o),o>n&&(n=o)}i[0]=a,i[1]=n}function a(t,e,a,n,r,s){var o=p.pop(),h=p.pop(),u=d.pop().copy(e).sub(t),l=u.dot(r);if(i(a,r,o),i(n,r,h),h[0]+=l,h[1]+=l,o[0]>h[1]||h[0]>o[1])return d.push(u),p.push(o),p.push(h),!0;if(s){var f=0;if(o[0]<h[0])if(s.firstInSecond=!1,o[1]<h[1])f=o[1]-h[0],s.secondInFirst=!1;else{var g=o[1]-h[0],v=h[1]-o[0];f=v>g?g:-v}else if(s.secondInFirst=!1,o[1]>h[1])f=o[0]-h[1],s.firstInSecond=!1;else{var g=o[1]-h[0],v=h[1]-o[0];f=v>g?g:-v}var m=c(f);m<s.overlap&&(s.overlap=m,s.overlapN.copy(r),0>f&&s.overlapN.reverse())}return d.push(u),p.push(o),p.push(h),!1}function n(t,e){var i=t.len2(),a=e.dot(t);return 0>a?h:a>i?l:u}for(var r=t("./geom/Vector"),s=Math.sqrt,o=Math.pow,c=Math.abs,h=-1,u=0,l=1,d=[],f=0;10>f;f++)d.push(new r);for(var p=[],f=0;5>f;f++)p.push([]);e.prototype={constructor:e,reset:function(){return this.firstInSecond=!0,this.secondInFirst=!0,this.overlap=Number.MAX_VALUE,this}};var g=new e,v={};return v.checkCircleCircle=function(t,e,i){var a=d.pop().copy(new r(e.x,e.y)).sub(new r(t.x,t.y)),n=t.radius*t.scaleX+e.radius*e.scaleX,c=o(n,2),h=a.len2();if(h>c)return d.push(a),!1;if(i){g.reset();var u=s(h);return g.first=t,g.second=e,g.overlap=n-u,g.overlapN.copy(a.normalize()),g.overlapV.copy(a).scale(g.overlap),g.firstInSecond=t.radius<=e.radius&&u<=e.radius-t.radius,g.secondInFirst=e.radius<=t.radius&&u<=t.radius-e.radius,d.push(a),g}},v.checkPolygonPolygon=function(t,e,i){var n=t.points,r=n.length,s=e.points,o=s.length,c={x:t.x,y:t.y},h={x:e.x,y:e.y},u=null;for(i&&(u=g.reset());r--;)if(a(c,h,n,s,t.normals[r],u))return!1;for(;o--;)if(a(c,h,n,s,e.normals[o],u))return!1;return u&&(u.first=t,u.second=e,u.overlapV.copy(u.overlapN).scale(u.overlap)),u},v.checkPolygonCircle=function(t,e,i){var a=d.pop().copy(new r(e.x,e.y)).sub(new r(t.x,t.y)),s=e.radius,o=s*s,u=t.points,f=u.length,p=d.pop(),v=d.pop(),m=null;i&&(m=g.reset());for(var y=0;f>y;y++){var w=y===f-1?0:y+1,b=0===y?f-1:y-1,x=0,S=null;p.copy(t.edges[y]),v.copy(a).sub(u[y]),m&&v.len2()>o&&(m.firstInSecond=!1);var C=n(p,v);if(C===h){p.copy(t.edges[b]);var I=d.pop().copy(a).sub(u[b]);if(C=n(p,I),C===l){var k=v.len();if(k>s)return d.push(a),d.push(p),d.push(v),d.push(I),!1;m&&(m.secondInFirst=!1,S=v.normalize(),x=s-k)}d.push(I)}else if(C===l){if(p.copy(t.edges[w]),v.copy(a).sub(u[w]),C=n(p,v),C===h){var k=v.len();if(k>s)return d.push(a),d.push(p),d.push(v),!1;m&&(m.secondInFirst=!1,S=v.normalize(),x=s-k)}}else{var O=p.perp().normalize(),k=v.dot(O),j=c(k);if(k>0&&j>s)return d.push(a),d.push(O),d.push(v),!1;m&&(S=O,x=s-k,(k>=0||2*s>x)&&(m.secondInFirst=!1))}S&&m&&c(x)<c(m.overlap)&&(m.overlap=x,m.overlapN.copy(S))}return m&&(m.a=t,m.b=e,m.overlapV.copy(m.overlapN).scale(m.overlap)),d.push(a),d.push(p),d.push(v),m
},v.checkCirclePolygon=function(t,e,i){var a=v.checkPolygonCircle(e,t,i);if(a){var n=a.first,r=a.firstInSecond;a.overlapN.reverse(),a.overlapV.reverse(),a.first=a.second,a.second=n,a.firstInSecond=a.secondInFirst,a.secondInFirst=r}return a},v});var a,n=e("ig"),r="ig/util",s="util",o="";o?n[o]?n[o][s]=e(r):(a={},a[s]=e(r),n[o]=a):(a=e(r),s&&(n[s]=a));var a,r="ig/Event",s="Event",o="";o?n[o]?n[o][s]=e(r):(a={},a[s]=e(r),n[o]=a):(a=e(r),s&&(n[s]=a));var a,r="ig/env",s="env",o="";o?n[o]?n[o][s]=e(r):(a={},a[s]=e(r),n[o]=a):(a=e(r),s&&(n[s]=a));var a,r="ig/Game",s="Game",o="";o?n[o]?n[o][s]=e(r):(a={},a[s]=e(r),n[o]=a):(a=e(r),s&&(n[s]=a));var a,r="ig/Stage",s="",o="";o?n[o]?n[o][s]=e(r):(a={},a[s]=e(r),n[o]=a):(a=e(r),s&&(n[s]=a));var a,r="ig/DisplayObject",s="DisplayObject",o="";o?n[o]?n[o][s]=e(r):(a={},a[s]=e(r),n[o]=a):(a=e(r),s&&(n[s]=a));var a,r="ig/SpriteSheet",s="SpriteSheet",o="";o?n[o]?n[o][s]=e(r):(a={},a[s]=e(r),n[o]=a):(a=e(r),s&&(n[s]=a));var a,r="ig/resourceLoader",s="",o="";o?n[o]?n[o][s]=e(r):(a={},a[s]=e(r),n[o]=a):(a=e(r),s&&(n[s]=a));var a,r="ig/Stage",s="",o="";o?n[o]?n[o][s]=e(r):(a={},a[s]=e(r),n[o]=a):(a=e(r),s&&(n[s]=a));var a,r="ig/Shape/Ball",s="Ball",o="Shape";o?n[o]?n[o][s]=e(r):(a={},a[s]=e(r),n[o]=a):(a=e(r),s&&(n[s]=a));var a,r="ig/geom/Circle",s="Circle",o="geom";o?n[o]?n[o][s]=e(r):(a={},a[s]=e(r),n[o]=a):(a=e(r),s&&(n[s]=a));var a,r="ig/geom/Vector",s="Vector",o="geom";o?n[o]?n[o][s]=e(r):(a={},a[s]=e(r),n[o]=a):(a=e(r),s&&(n[s]=a));var a,r="ig/geom/Polygon",s="Polygon",o="geom";o?n[o]?n[o][s]=e(r):(a={},a[s]=e(r),n[o]=a):(a=e(r),s&&(n[s]=a));var a,r="ig/collision",s="",o="";o?n[o]?n[o][s]=e(r):(a={},a[s]=e(r),n[o]=a):(a=e(r),s&&(n[s]=a)),t.ig=n}(window);