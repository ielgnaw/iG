!function(n){var e,t;!function(){function n(n,e){if(!e)return n;if(0===n.indexOf(".")){var t=e.split("/"),i=n.split("/"),r=t.length-1,a=i.length,u=0,o=0;n:for(var s=0;a>s;s++)switch(i[s]){case"..":if(!(r>u))break n;u++,o++;break;case".":o++;break;default:break n}return t.length=r-u,i=i.slice(o),t.concat(i).join("/")}return n}function i(e){function t(t,u){if("string"==typeof t){var o=i[t];return o||(o=a(n(t,e)),i[t]=o),o}t instanceof Array&&(u=u||function(){},u.apply(this,r(t,u,e)))}var i={};return t}function r(t,i,r){for(var o=[],s=u[r],c=0,f=Math.min(t.length,i.length);f>c;c++){var w,h=n(t[c],r);switch(h){case"require":w=s&&s.require||e;break;case"exports":w=s.exports;break;case"module":w=s;break;default:w=a(h)}o.push(w)}return o}function a(n){var e=u[n];if(!e)throw new Error("No "+n);if(!e.defined){var t=e.factory,i=t.apply(this,r(e.deps||[],t,n));"undefined"!=typeof i&&(e.exports=i),e.defined=1}return e.exports}var u={};t=function(n,e,t){u[n]={id:n,deps:e,factory:t,defined:0,exports:{},require:i(n)}},e=i("")}(),t("ig",["ig/ig"],function(n){return n}),t("ig/ig",["require"],function(){"use strict";window.requestAnimationFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||function(n){var e,t,i=this;setTimeout(function(){e=+new Date,n(e),t=+new Date,i.timeout=1e3/60-(t-e)},i.timeout)}}(),window.cancelAnimationFrame=function(){return window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.webkitCancelRequestAnimationFrame||window.mozCancelAnimationFrame||window.mozCancelRequestAnimationFrame||window.msCancelAnimationFrame||window.msCancelRequestAnimationFrame||window.oCancelAnimationFrame||window.oCancelRequestAnimationFrame||window.clearTimeout}();var n={};return n}),t("ig/easing",["require"],function(){"use strict";var n={};return n.linear=function(n,e,t,i){return t*n/i+e},n.easeInQuad=function(n,e,t,i){return t*(n/=i)*n+e},n.easeOutQuad=function(n,e,t,i){return-t*(n/=i)*(n-2)+e},n.easeInOutQuad=function(n,e,t,i){return(n/=i/2)<1?t/2*n*n+e:-t/2*(--n*(n-2)-1)+e},n.easeInCubic=function(n,e,t,i){return t*(n/=i)*n*n+e},n.easeOutCubic=function(n,e,t,i){return t*((n=n/i-1)*n*n+1)+e},n.easeInOutCubic=function(n,e,t,i){return(n/=i/2)<1?t/2*n*n*n+e:t/2*((n-=2)*n*n+2)+e},n.easeInQuart=function(n,e,t,i){return t*(n/=i)*n*n*n+e},n.easeOutQuart=function(n,e,t,i){return-t*((n=n/i-1)*n*n*n-1)+e},n.easeInOutQuart=function(n,e,t,i){return(n/=i/2)<1?t/2*n*n*n*n+e:-t/2*((n-=2)*n*n*n-2)+e},n.easeInQuint=function(n,e,t,i){return t*(n/=i)*n*n*n*n+e},n.easeOutQuint=function(n,e,t,i){return t*((n=n/i-1)*n*n*n*n+1)+e},n.easeInOutQuint=function(n,e,t,i){return(n/=i/2)<1?t/2*n*n*n*n*n+e:t/2*((n-=2)*n*n*n*n+2)+e},n.easeInSine=function(n,e,t,i){return-t*Math.cos(n/i*(Math.PI/2))+t+e},n.easeOutSine=function(n,e,t,i){return t*Math.sin(n/i*(Math.PI/2))+e},n.easeInOutSine=function(n,e,t,i){return-t/2*(Math.cos(Math.PI*n/i)-1)+e},n.easeInExpo=function(n,e,t,i){return 0===n?e:t*Math.pow(2,10*(n/i-1))+e},n.easeOutExpo=function(n,e,t,i){return n==i?e+t:t*(-Math.pow(2,-10*n/i)+1)+e},n.easeInOutExpo=function(n,e,t,i){return 0===n?e:n==i?e+t:(n/=i/2)<1?t/2*Math.pow(2,10*(n-1))+e:t/2*(-Math.pow(2,-10*--n)+2)+e},n.easeInCirc=function(n,e,t,i){return-t*(Math.sqrt(1-(n/=i)*n)-1)+e},n.easeOutCirc=function(n,e,t,i){return t*Math.sqrt(1-(n=n/i-1)*n)+e},n.easeInOutCirc=function(n,e,t,i){return(n/=i/2)<1?-t/2*(Math.sqrt(1-n*n)-1)+e:t/2*(Math.sqrt(1-(n-=2)*n)+1)+e},n.easeInElastic=function(n,e,t,i,r,a){if(0===n)return e;if(1==(n/=i))return e+t;a||(a=.3*i);var u;return!r||r<Math.abs(t)?(r=t,u=a/4):u=a/(2*Math.PI)*Math.asin(t/r),-(r*Math.pow(2,10*(n-=1))*Math.sin(2*(n*i-u)*Math.PI/a))+e},n.easeOutElastic=function(n,e,t,i,r,a){if(0===n)return e;if(1==(n/=i))return e+t;a||(a=.3*i);var u;return!r||r<Math.abs(t)?(r=t,u=a/4):u=a/(2*Math.PI)*Math.asin(t/r),r*Math.pow(2,-10*n)*Math.sin(2*(n*i-u)*Math.PI/a)+t+e},n.easeInOutElastic=function(n,e,t,i,r,a){if(0===n)return e;if(2==(n/=i/2))return e+t;a||(a=.3*i*1.5);var u;return!r||r<Math.abs(t)?(r=t,u=a/4):u=a/(2*Math.PI)*Math.asin(t/r),1>n?-.5*r*Math.pow(2,10*(n-=1))*Math.sin(2*(n*i-u)*Math.PI/a)+e:r*Math.pow(2,-10*(n-=1))*Math.sin(2*(n*i-u)*Math.PI/a)*.5+t+e},n.easeInBack=function(n,e,t,i,r){return void 0===r&&(r=1.70158),t*(n/=i)*n*((r+1)*n-r)+e},n.easeOutBack=function(n,e,t,i,r){return void 0===r&&(r=1.70158),t*((n=n/i-1)*n*((r+1)*n+r)+1)+e},n.easeInOutBack=function(n,e,t,i,r){return void 0===r&&(r=1.70158),(n/=i/2)<1?t/2*n*n*(((r*=1.525)+1)*n-r)+e:t/2*((n-=2)*n*(((r*=1.525)+1)*n+r)+2)+e},n.easeInBounce=function(e,t,i,r){return i-n.easeOutBounce(r-e,0,i,r)+t},n.easeOutBounce=function(n,e,t,i){return(n/=i)<1/2.75?7.5625*t*n*n+e:2/2.75>n?t*(7.5625*(n-=1.5/2.75)*n+.75)+e:2.5/2.75>n?t*(7.5625*(n-=2.25/2.75)*n+.9375)+e:t*(7.5625*(n-=2.625/2.75)*n+.984375)+e},n.easeInOutBounce=function(e,t,i,r){return r/2>e?.5*n.easeInBounce(2*e,0,i,r)+t:.5*n.easeOutBounce(2*e-r,0,i,r)+.5*i+t},n});var i,r=e("ig"),a="ig/easing",u="easing",o="";o?r[o]?r[o][u]=e(a):(i={},i[u]=e(a),r[o]=i):(i=e(a),u&&(r[u]=i)),n.ig=r}(window);