!function(e){var t,i;!function(){function e(e,t){if(!t)return e;if(0===e.indexOf(".")){var i=t.split("/"),n=e.split("/"),a=i.length-1,r=n.length,o=0,s=0;e:for(var c=0;r>c;c++)switch(n[c]){case"..":if(!(a>o))break e;o++,s++;break;case".":s++;break;default:break e}return i.length=a-o,n=n.slice(s),i.concat(n).join("/")}return e}function n(t){function i(i,o){if("string"==typeof i){var s=n[i];return s||(s=r(e(i,t)),n[i]=s),s}i instanceof Array&&(o=o||function(){},o.apply(this,a(i,o,t)))}var n={};return i}function a(i,n,a){for(var s=[],c=o[a],u=0,h=Math.min(i.length,n.length);h>u;u++){var d,l=e(i[u],a);switch(l){case"require":d=c&&c.require||t;break;case"exports":d=c.exports;break;case"module":d=c;break;default:d=r(l)}s.push(d)}return s}function r(e){var t=o[e];if(!t)throw new Error("No "+e);if(!t.defined){var i=t.factory,n=i.apply(this,a(t.deps||[],i,e));"undefined"!=typeof n&&(t.exports=n),t.defined=1}return t.exports}var o={};i=function(e,t,i){o[e]={id:e,deps:t,factory:i,defined:0,exports:{},require:n(e)}},t=n("")}(),i("ig",["ig/ig"],function(e){return e}),i("ig/ig",["require"],function(){window.requestAnimationFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||function(e){var t,i,n=this;setTimeout(function(){t=+new Date,e(t),i=+new Date,n.timeout=1e3/60-(i-t)},n.timeout)}}(),window.cancelAnimationFrame=function(){return window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.webkitCancelRequestAnimationFrame||window.mozCancelAnimationFrame||window.mozCancelRequestAnimationFrame||window.msCancelAnimationFrame||window.msCancelRequestAnimationFrame||window.oCancelAnimationFrame||window.oCancelRequestAnimationFrame||window.clearTimeout}();var e={};return e}),i("ig/util",["require"],function(){var e={};return e.noop=function(){},e.inherits=function(e,t){var i=function(){};i.prototype=t.prototype;var n=e.prototype,a=e.prototype=new i;for(var r in n)a[r]=n[r];return e.prototype.constructor=e,e.superClass=t.prototype,e},e.deg2Rad=function(e){return e*Math.PI/180},e.rad2Deg=function(e){return 180*e/Math.PI},e.window2Canvas=function(e,t,i){var n=e.getBoundingClientRect();return{x:Math.round(t-n.left*(e.width/n.width)),y:Math.round(i-n.top*(e.height/n.height))}},e.fastApply=function(e,t,i){switch(i.length){case 0:return e.call(t);case 1:return e.call(t,i[0]);case 2:return e.call(t,i[0],i[1]);case 3:return e.call(t,i[0],i[1],i[2]);case 4:return e.call(t,i[0],i[1],i[2],i[3]);case 5:return e.call(t,i[0],i[1],i[2],i[3],i[4]);case 6:return e.call(t,i[0],i[1],i[2],i[3],i[4],i[5]);case 7:return e.call(t,i[0],i[1],i[2],i[3],i[4],i[5],i[6]);case 8:return e.call(t,i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7]);case 9:return e.call(t,i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7],i[8]);default:return e.apply(t,i)}},e.removeArrByCondition=function(e,t){for(var i,n=-1,a=0,r=e.length;r>a;a++)if(i=e[a],t(i)){n=a;break}-1!==n&&e.splice(e,1)},e.parseColor=function(e,t){return t===!0?"number"==typeof e?0|e:("string"==typeof e&&"#"===e[0]&&(e=e.slice(1)),parseInt(e,16)):("number"==typeof e&&(e="#"+("00000"+(0|e).toString(16)).substr(-6)),e)},e.colorToRGB=function(e,t){"string"==typeof e&&"#"===e[0]&&(e=window.parseInt(e.slice(1),16)),t=void 0===t?1:t;var i=e>>16&255,n=e>>8&255,a=255&e,r=0>t?0:t>1?1:t;return 1===r?"rgb("+i+","+n+","+a+")":"rgba("+i+","+n+","+a+","+r+")"},e.randomInt=function(e,t){return Math.floor(Math.random()*t+e)},e.randomFloat=function(e,t){return Math.random()*(t-e)+e},e.domWrap=function(e,t){var i=e.cloneNode(!0);if("string"==typeof t){var n=document.createElement("div");n.innerHTML=t,n=n.children[0],n.appendChild(i),e.parentNode.replaceChild(n,e)}else t.appendChild(i),e.parentNode.replaceChild(t,e);return i},e}),i("ig/Event",["require"],function(){function e(){this._events={}}var t="_observerGUID";return e.prototype.on=function(e,i){this._events||(this._events={});var n=this._events[e];n||(n=this._events[e]=[]),i.hasOwnProperty(t)||(i[t]=+new Date),n.push(i)},e.prototype.un=function(e,t){if(this._events){if(!t)return void(this._events[e]=[]);var i=this._events[e];if(i)for(var n=0;n<i.length;n++)i[n]===t&&(i.splice(n,1),n--)}},e.prototype.fire=function(e,i){1===arguments.length&&"object"==typeof e&&(i=e,e=i.type);var n=this["on"+e];if("function"==typeof n&&n.call(this,i),this._events){null==i&&(i={}),"[object Object]"!==Object.prototype.toString.call(i)&&(i={data:i}),i.type=e,i.target=this;var a={},r=this._events[e];if(r){r=r.slice();for(var o=0;o<r.length;o++){var s=r[o];a.hasOwnProperty(s[t])||s.call(this,i)}}if("*"!==e){var c=this._events["*"];if(!c)return;c=c.slice();for(var o=0;o<c.length;o++){var s=c[o];a.hasOwnProperty(s[t])||s.call(this,i)}}}},e.enable=function(t){t._events={},t.on=e.prototype.on,t.un=e.prototype.un,t.fire=e.prototype.fire},e}),i("ig/platform",["require"],function(){function e(e){var t={},i={},n=e.match(/Web[kK]it[\/]{0,1}([\d.]+)/),a=e.match(/(Android);?[\s\/]+([\d.]+)?/),r=!!e.match(/\(Macintosh\; Intel /),o=e.match(/(iPad).*OS\s([\d_]+)/),s=e.match(/(iPod)(.*OS\s([\d_]+))?/),c=!o&&e.match(/(iPhone\sOS)\s([\d_]+)/),u=e.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),h=e.match(/Windows Phone ([\d.]+)/),d=u&&e.match(/TouchPad/),l=e.match(/Kindle\/([\d.]+)/),m=e.match(/Silk\/([\d._]+)/),p=e.match(/(BlackBerry).*Version\/([\d.]+)/),g=e.match(/(BB10).*Version\/([\d.]+)/),f=e.match(/(RIM\sTablet\sOS)\s([\d.]+)/),v=e.match(/PlayBook/),y=e.match(/Chrome\/([\d.]+)/)||e.match(/CriOS\/([\d.]+)/),w=e.match(/Firefox\/([\d.]+)/),b=e.match(/MSIE\s([\d.]+)/)||e.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),S=!y&&e.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),x=S||e.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/),O=e.match(/MicroMessenger\/([\d.]+)/),C=e.match(/baiduboxapp\/[^\/]+\/([\d.]+)_/)||e.match(/baiduboxapp\/([\d.]+)/)||e.match(/BaiduHD\/([\d.]+)/)||e.match(/FlyFlow\/([\d.]+)/)||e.match(/baidubrowser\/([\d.]+)/),k=e.match(/MQQBrowser\/([\d.]+)/)||e.match(/QQ\/([\d.]+)/),F=e.match(/UCBrowser\/([\d.]+)/),j=e.match(/SogouMobileBrowser\/([\d.]+)/),I=a&&e.match(/MiuiBrowser\/([\d.]+)/),M=e.match(/LBKIT/),A=e.match(/Mercury\/([\d.]+)/);return(i.webkit=!!n)&&(i.version=n[1]),a&&(t.android=!0,t.version=a[2]),c&&!s&&(t.ios=t.iphone=!0,t.version=c[2].replace(/_/g,".")),o&&(t.ios=t.ipad=!0,t.version=o[2].replace(/_/g,".")),s&&(t.ios=t.ipod=!0,t.version=s[3]?s[3].replace(/_/g,"."):null),h&&(t.wp=!0,t.version=h[1]),u&&(t.webos=!0,t.version=u[2]),d&&(t.touchpad=!0),p&&(t.blackberry=!0,t.version=p[2]),g&&(t.bb10=!0,t.version=g[2]),f&&(t.rimtabletos=!0,t.version=f[2]),v&&(i.playbook=!0),l&&(t.kindle=!0,t.version=l[1]),m&&(i.silk=!0,i.version=m[1]),!m&&t.android&&e.match(/Kindle Fire/)&&(i.silk=!0),y&&(i.chrome=!0,i.version=y[1]),w&&(i.firefox=!0,i.version=w[1]),b&&(i.ie=!0,i.version=b[1]),x&&(r||t.ios)&&(i.safari=!0,r&&(i.version=x[1])),S&&(i.webview=!0),O&&(i.wechat=!0,i.version=O[1]),C&&(delete i.webview,i.baidu=!0,i.version=C[1]),k&&(i.qq=!0,i.version=k[1]),F&&(delete i.webview,i.uc=!0,i.version=F[1]),j&&(delete i.webview,i.sogou=!0,i.version=j[1]),I&&(i.xiaomi=!0,i.version=I[1]),M&&(i.liebao=!0,i.version="0"),A&&(i.mercury=!0,i.version=A[1]),navigator.standalone&&(i.standalone=!0),t.tablet=!!(o||v||a&&!e.match(/Mobile/)||w&&e.match(/Tablet/)||b&&!e.match(/Phone/)&&e.match(/Touch/)),t.phone=!(t.tablet||t.ipod||!(a||c||u||p||g||y&&e.match(/Android/)||y&&e.match(/CriOS\/([\d.]+)/)||w&&e.match(/Mobile/)||b&&e.match(/Touch/))),{browser:i,os:t}}var t=e(navigator.userAgent),i={browser:t.browser,os:t.os,supportOrientation:"number"==typeof window.orientation&&"object"==typeof window.onorientationchange,supportTouch:"ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch,supportGeolocation:null!=navigator.geolocation};return i}),i("ig/ImageLoader",["require","./util","./Event"],function(e){function t(){this.images={},this.imageUrls=[],this.imagesLoadedCount=0,this.imagesErrorLoadedCount=0,this.imageIndex=0,this.imageLoadingProgressCallback=n.noop,this.imageLoadedCallback=n.noop,this.imageLoadedErrorCallback=n.noop}var i=Array.prototype;return t.prototype.loadImage=function(e){var t=this,i=new Image;i.src=e,i.addEventListener("load",function(e){t.imagesLoadedCount++,"function"==typeof t.imageLoadedCallback&&t.imageLoadedCallback.call(t,e)}),i.addEventListener("error",function(e){t.imagesErrorLoadedCount++,"function"==typeof t.imageLoadedErrorCallback&&t.imageLoadedErrorCallback.call(t,e)}),t.images[e]=i},t.prototype.loadImages=function(){var e=this,t=e.imageUrls.length;return e.imageIndex<t&&(e.loadImage(e.imageUrls[e.imageIndex]),e.imageIndex++),(e.imagesLoadedCount+e.imagesErrorLoadedCount)/t*100},t.prototype.addImage=function(e){var t=this;i.push[Array.isArray(e)?"apply":"call"](t.imageUrls,e)},e("./util").inherits(t,e("./Event")),t}),i("ig/Game",["require","./Event","./util","./Stage","./FrameMonitor"],function(e){function t(){i.apply(this,arguments),this.paused=!1,this.curGameFrameMonitor=new r,this.stageStack=[],this.stages={}}var i=e("./Event"),n=e("./util"),a=e("./Stage"),r=e("./FrameMonitor");return t.prototype={constructor:t,render:function(){var e=this;e.curGameFrameMonitor.update(),e.paused||(e.requestID=window.requestAnimationFrame(function(){e.render.call(e)})),e.fire("Game:beforeRender",{data:{curFrame:e.curGameFrameMonitor.cur,maxFrame:e.curGameFrameMonitor.max,minFrame:e.curGameFrameMonitor.min}});var t=e.getCurrentStage();t&&(t.update(),t.render()),e.fire("Game:afterRender",{data:{curFrame:e.curGameFrameMonitor.cur,maxFrame:e.curGameFrameMonitor.max,minFrame:e.curGameFrameMonitor.min}})},start:function(){var e=this;e.paused=!1,e.curGameFrameMonitor.reset(),e.requestID=window.requestAnimationFrame(function(){e.curGameFrameMonitor.start(),e.render.call(e)})},pause:function(){this.paused=!0},resume:function(){var e=this;e.paused=!1,e.requestID=window.requestAnimationFrame(function(){e.render.call(e)})},stop:function(){window.cancelAnimationFrame(this.requestID)},getStageStack:function(){return this.stageStack},getStageByName:function(e){return this.stages[e]},createStage:function(e){var t=new a(e);return this.pushStage(t),t},pushStage:function(e){var t=this;t.getStageByName(e.name)||(t.stageStack.push(e),t.stages[e.name]=e,t.sortStageIndex())},popStage:function(){var e=this,t=e.stageStack.pop();t&&(t.clean(),delete e.stages[t.name],e.sortStageIndex())},sortStageIndex:function(){for(var e=this.stageStack,t=0,i=e.length;i>t;t++)e[t].container.style.zIndex=t},removeStageByName:function(e){var t=this,i=t.getStageByName(e);if(i){i.clean(),delete t.stages[i.name];var a=t.stageStack;n.removeArrByCondition(a,function(t){return t.name===e}),t.sortStageIndex()}},swapStage:function(e,t){var i=this,n=i.stageStack,a=n.length;if(e>=0&&a-1>=e&&t>=0&&a-1>=t){var r=n[e];n[e]=n[t],n[t]=r,i.sortStageIndex()}},getStageIndex:function(e){return e.container.style.zIndex},getCurrentStage:function(){var e=this;return e.stageStack[e.stageStack.length-1]},clearAllStage:function(){for(var e=this,t=0,i=e.stageStack.length;i>t;t++)e.stageStack[t].clean();e.stages={},e.stageStack=[]}},n.inherits(t,i),t}),i("ig/FrameMonitor",["require"],function(){function e(){this.max=0,this.min=9999,this.cur=0,this.curTime=0,this.expendPerFrame=0,this.startTimePerSecond=0,this.totalPerSecond=0}return e.prototype={constructor:e,reset:function(){var e=this;e.max=0,e.min=9999,e.cur=0,e.curTime=0,e.expendPerFrame=0,e.startTimePerSecond=0,e.totalPerSecond=0},start:function(){this.curTime=this.startTimePerSecond=new Date},update:function(){var e=new Date;e-this.startTimePerSecond>=1e3?(this.cur=this.totalPerSecond,this.max=this.cur>this.max?this.cur:this.max,this.min=this.cur<this.min?this.cur:this.min,this.totalPerSecond=0,this.startTimePerSecond=e):++this.totalPerSecond,this.expendPerFrame=e-this.curTime,this.curTime=e}},e}),i("ig/Stage",["require","./Event","./util","./DisplayObject"],function(e){function t(e){if(i.apply(this,arguments),e=e||{},!e.canvas)throw new Error("Stage must be require a canvas param");this.canvas=e.canvas,this.ctx=this.canvas.getContext("2d"),this.container=this.canvas.parentNode,this.guid=0,this.name=null===e.name||void 0===e.name?"ig_stage_"+this.guid++:e.name,this.x=e.x||0,this.y=e.y||0,this.width=e.width||this.canvas.width,this.height=e.height||this.canvas.height,this.containerBgColor=e.containerBgColor||"#000",this.setSize(),this.setContainerBgColor(),this.displayObjectList=[],this.displayObjects={}}var i=e("./Event"),n=e("./util"),a=e("./DisplayObject");return t.prototype={constructor:t,clear:function(){var e=this;e.ctx.clearRect(0,0,e.width,e.height)},setSize:function(e,t){var i=this;i.width=e||i.width,i.height=t||i.height,i.container.style.width=i.width+"px",i.container.style.height=i.height+"px",i.canvas.width=i.width,i.canvas.height=i.height,console.log(i.canvas)},setContainerBgColor:function(){var e=this;e.containerBgColor=e.containerBgColor||"#000",e.container.style.backgroundColor=e.containerBgColor},setContainerBgImg:function(e,t){var i=this;switch(i.container.style.backgroundImage="url("+e+")",t){case"center":i.container.style.backgroundRepeat="no-repeat",i.container.style.backgroundPosition="center";break;case"full":i.container.style.backgroundSize=i.width+"px "+i.height+"px"}},clean:function(){var e=this;e.container.removeChild(e.canvas),e.container.parentNode.removeChild(e.container),e.canvas=e.container=e.ctx=null},update:function(){for(var e=0,t=this.displayObjectList.length;t>e;e++)this.displayObjectList[e].update()},render:function(){var e=this;e.clear(),e.fire("Stage:beforeRender",{data:{}}),this.sortDisplayObject(),this.renderDisplayObject(),e.fire("Stage:afterRender",{data:{}})},renderDisplayObject:function(){var e,t=this,i=t.displayObjectList,n=i.length;t.ctx.save();for(var a=0;n>a;a++)e=t.displayObjectList[a].status,(1===e||2===e)&&t.displayObjectList[a].render(t.ctx);t.ctx.restore()},sortDisplayObject:function(){this.displayObjectList.sort(function(e,t){return e.zIndex-t.zIndex})},getDisplayObjectList:function(){return this.displayObjectList},getDisplayObjectByName:function(e){return this.displayObjects[e]},createDisplayObject:function(e){var t=new a(e);return this.addDisplayObject(t),t},addDisplayObject:function(e){var t=this;t.getDisplayObjectByName(e.name)||(e.stageOwner=t,t.displayObjectList.push(e),t.displayObjects[e.name]=e)},removeDisplayObject:function(e){this.removeDisplayObjectByName(e.name)},removeDisplayObjectByName:function(e){var t=this,i=t.displayObjects[e];if(i){delete t.displayObjects[i.name];var a=t.displayObjectList;n.removeArrByCondition(a,function(t){return t.name===e})}},getDisplayObjectByName:function(e){return this.displayObjects[e]},clearAllDisplayObject:function(){this.displayObjectList=[],this.displayObjects={}}},n.inherits(t,i),t}),i("ig/DisplayObject",["require","./Event","./util"],function(e){function t(e){n.apply(this,arguments),e=e||{},this.guid=0,this.name=null===e.name||void 0===e.name?"ig_displayobject_"+this.guid++:e.name,this.stageOwner=null,this.x=e.x||0,this.y=e.y||0,this.width=e.width||20,this.height=e.height||20,this.vX=e.vX||0,this.vY=e.vY||0,this.aX=e.aX||0,this.aY=e.aY||0,this.reverseX=!1,this.reverseY=!1,this.alpha=e.alpha||1,this.scale=e.scale||1,this.angle=e.angle||0,this.radius=30*Math.random(),this.zIndex=0,this.status=1,this.customProp={},this.debug=!1}function i(e){var t=this;e.save(),e.beginPath(),e.lineWidth=1,e.strokeStyle="#fff",e.globalAlpha=.8,e.rect(t.x,t.y,t.width,t.height),e.closePath(),e.stroke(),e.restore()}var n=e("./Event"),a=e("./util");return t.prototype={constructor:t,setPos:function(e,t){var i=this;i.x=e||i.x,i.y=t||i.y},move:function(e,t){this.x+=e,this.y+=t},moveStep:function(){var e=this;e.vX+=e.aX,e.vY+=e.aY,e.x+=e.vX,e.y+=e.vY},rotate:function(e){this.angle=e},update:function(){this.moveStep()},render:function(e){var t=this;e.save(),e.globalAlpha=t.alpha,e.rotate(t.angle*Math.PI/180),e.translate(t.x*t.scale,t.y*t.scale),t.fire("DisplayObject:render",t),t.debug&&i.call(t,e),e.restore()},isHit:function(e){var t=this,i=t.x>e.x?t.x:e.x,n=t.x+t.width<e.x+e.width?t.x+t.width:e.x+e.width,a=t.y>e.y?t.y:e.y,r=t.y+t.width<e.y+e.width?t.y+t.width:e.y+e.width;return n>=i&&r>=a}},a.inherits(t,n),t});var n=t("ig");n.util=t("ig/util"),n.Event=t("ig/Event"),n.env=t("ig/platform"),n.ImageLoader=t("ig/ImageLoader"),n.Game=t("ig/Game"),n.FrameMonitor=t("ig/FrameMonitor"),n.Stage=t("ig/Stage"),n.DisplayObject=t("ig/DisplayObject"),e.ig=n}(window);