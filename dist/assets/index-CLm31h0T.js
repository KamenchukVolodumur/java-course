var e=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports);(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var t=e((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.portal`),r=Symbol.for(`react.fragment`),i=Symbol.for(`react.strict_mode`),a=Symbol.for(`react.profiler`),o=Symbol.for(`react.consumer`),s=Symbol.for(`react.context`),c=Symbol.for(`react.forward_ref`),l=Symbol.for(`react.suspense`),u=Symbol.for(`react.memo`),d=Symbol.for(`react.lazy`),f=Symbol.for(`react.activity`),p=Symbol.iterator;function m(e){return typeof e!=`object`||!e?null:(e=p&&e[p]||e[`@@iterator`],typeof e==`function`?e:null)}var h={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},g=Object.assign,_={};function v(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}v.prototype.isReactComponent={},v.prototype.setState=function(e,t){if(typeof e!=`object`&&typeof e!=`function`&&e!=null)throw Error(`takes an object of state variables to update or a function which returns an object of state variables.`);this.updater.enqueueSetState(this,e,t,`setState`)},v.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,`forceUpdate`)};function y(){}y.prototype=v.prototype;function b(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}var x=b.prototype=new y;x.constructor=b,g(x,v.prototype),x.isPureReactComponent=!0;var ee=Array.isArray;function S(){}var C={H:null,A:null,T:null,S:null},te=Object.prototype.hasOwnProperty;function ne(e,n,r){var i=r.ref;return{$$typeof:t,type:e,key:n,ref:i===void 0?null:i,props:r}}function re(e,t){return ne(e.type,t,e.props)}function w(e){return typeof e==`object`&&!!e&&e.$$typeof===t}function ie(e){var t={"=":`=0`,":":`=2`};return`$`+e.replace(/[=:]/g,function(e){return t[e]})}var ae=/\/+/g;function oe(e,t){return typeof e==`object`&&e&&e.key!=null?ie(``+e.key):t.toString(36)}function se(e){switch(e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason;default:switch(typeof e.status==`string`?e.then(S,S):(e.status=`pending`,e.then(function(t){e.status===`pending`&&(e.status=`fulfilled`,e.value=t)},function(t){e.status===`pending`&&(e.status=`rejected`,e.reason=t)})),e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason}}throw e}function ce(e,r,i,a,o){var s=typeof e;(s===`undefined`||s===`boolean`)&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case`bigint`:case`string`:case`number`:c=!0;break;case`object`:switch(e.$$typeof){case t:case n:c=!0;break;case d:return c=e._init,ce(c(e._payload),r,i,a,o)}}if(c)return o=o(e),c=a===``?`.`+oe(e,0):a,ee(o)?(i=``,c!=null&&(i=c.replace(ae,`$&/`)+`/`),ce(o,r,i,``,function(e){return e})):o!=null&&(w(o)&&(o=re(o,i+(o.key==null||e&&e.key===o.key?``:(``+o.key).replace(ae,`$&/`)+`/`)+c)),r.push(o)),1;c=0;var l=a===``?`.`:a+`:`;if(ee(e))for(var u=0;u<e.length;u++)a=e[u],s=l+oe(a,u),c+=ce(a,r,i,s,o);else if(u=m(e),typeof u==`function`)for(e=u.call(e),u=0;!(a=e.next()).done;)a=a.value,s=l+oe(a,u++),c+=ce(a,r,i,s,o);else if(s===`object`){if(typeof e.then==`function`)return ce(se(e),r,i,a,o);throw r=String(e),Error(`Objects are not valid as a React child (found: `+(r===`[object Object]`?`object with keys {`+Object.keys(e).join(`, `)+`}`:r)+`). If you meant to render a collection of children, use an array instead.`)}return c}function le(e,t,n){if(e==null)return e;var r=[],i=0;return ce(e,r,``,``,function(e){return t.call(n,e,i++)}),r}function ue(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var T=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},E={map:le,forEach:function(e,t,n){le(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return le(e,function(){t++}),t},toArray:function(e){return le(e,function(e){return e})||[]},only:function(e){if(!w(e))throw Error(`React.Children.only expected to receive a single React element child.`);return e}};e.Activity=f,e.Children=E,e.Component=v,e.Fragment=r,e.Profiler=a,e.PureComponent=b,e.StrictMode=i,e.Suspense=l,e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=C,e.__COMPILER_RUNTIME={__proto__:null,c:function(e){return C.H.useMemoCache(e)}},e.cache=function(e){return function(){return e.apply(null,arguments)}},e.cacheSignal=function(){return null},e.cloneElement=function(e,t,n){if(e==null)throw Error(`The argument must be a React element, but you passed `+e+`.`);var r=g({},e.props),i=e.key;if(t!=null)for(a in t.key!==void 0&&(i=``+t.key),t)!te.call(t,a)||a===`key`||a===`__self`||a===`__source`||a===`ref`&&t.ref===void 0||(r[a]=t[a]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var o=Array(a),s=0;s<a;s++)o[s]=arguments[s+2];r.children=o}return ne(e.type,i,r)},e.createContext=function(e){return e={$$typeof:s,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:o,_context:e},e},e.createElement=function(e,t,n){var r,i={},a=null;if(t!=null)for(r in t.key!==void 0&&(a=``+t.key),t)te.call(t,r)&&r!==`key`&&r!==`__self`&&r!==`__source`&&(i[r]=t[r]);var o=arguments.length-2;if(o===1)i.children=n;else if(1<o){for(var s=Array(o),c=0;c<o;c++)s[c]=arguments[c+2];i.children=s}if(e&&e.defaultProps)for(r in o=e.defaultProps,o)i[r]===void 0&&(i[r]=o[r]);return ne(e,a,i)},e.createRef=function(){return{current:null}},e.forwardRef=function(e){return{$$typeof:c,render:e}},e.isValidElement=w,e.lazy=function(e){return{$$typeof:d,_payload:{_status:-1,_result:e},_init:ue}},e.memo=function(e,t){return{$$typeof:u,type:e,compare:t===void 0?null:t}},e.startTransition=function(e){var t=C.T,n={};C.T=n;try{var r=e(),i=C.S;i!==null&&i(n,r),typeof r==`object`&&r&&typeof r.then==`function`&&r.then(S,T)}catch(e){T(e)}finally{t!==null&&n.types!==null&&(t.types=n.types),C.T=t}},e.unstable_useCacheRefresh=function(){return C.H.useCacheRefresh()},e.use=function(e){return C.H.use(e)},e.useActionState=function(e,t,n){return C.H.useActionState(e,t,n)},e.useCallback=function(e,t){return C.H.useCallback(e,t)},e.useContext=function(e){return C.H.useContext(e)},e.useDebugValue=function(){},e.useDeferredValue=function(e,t){return C.H.useDeferredValue(e,t)},e.useEffect=function(e,t){return C.H.useEffect(e,t)},e.useEffectEvent=function(e){return C.H.useEffectEvent(e)},e.useId=function(){return C.H.useId()},e.useImperativeHandle=function(e,t,n){return C.H.useImperativeHandle(e,t,n)},e.useInsertionEffect=function(e,t){return C.H.useInsertionEffect(e,t)},e.useLayoutEffect=function(e,t){return C.H.useLayoutEffect(e,t)},e.useMemo=function(e,t){return C.H.useMemo(e,t)},e.useOptimistic=function(e,t){return C.H.useOptimistic(e,t)},e.useReducer=function(e,t,n){return C.H.useReducer(e,t,n)},e.useRef=function(e){return C.H.useRef(e)},e.useState=function(e){return C.H.useState(e)},e.useSyncExternalStore=function(e,t,n){return C.H.useSyncExternalStore(e,t,n)},e.useTransition=function(){return C.H.useTransition()},e.version=`19.2.7`})),n=e(((e,n)=>{n.exports=t()})),r=e((e=>{function t(e,t){var n=e.length;e.push(t);a:for(;0<n;){var r=n-1>>>1,a=e[r];if(0<i(a,t))e[r]=t,e[n]=a,n=r;else break a}}function n(e){return e.length===0?null:e[0]}function r(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;a:for(var r=0,a=e.length,o=a>>>1;r<o;){var s=2*(r+1)-1,c=e[s],l=s+1,u=e[l];if(0>i(c,n))l<a&&0>i(u,c)?(e[r]=u,e[l]=n,r=l):(e[r]=c,e[s]=n,r=s);else if(l<a&&0>i(u,n))e[r]=u,e[l]=n,r=l;else break a}}return t}function i(e,t){var n=e.sortIndex-t.sortIndex;return n===0?e.id-t.id:n}if(e.unstable_now=void 0,typeof performance==`object`&&typeof performance.now==`function`){var a=performance;e.unstable_now=function(){return a.now()}}else{var o=Date,s=o.now();e.unstable_now=function(){return o.now()-s}}var c=[],l=[],u=1,d=null,f=3,p=!1,m=!1,h=!1,g=!1,_=typeof setTimeout==`function`?setTimeout:null,v=typeof clearTimeout==`function`?clearTimeout:null,y=typeof setImmediate<`u`?setImmediate:null;function b(e){for(var i=n(l);i!==null;){if(i.callback===null)r(l);else if(i.startTime<=e)r(l),i.sortIndex=i.expirationTime,t(c,i);else break;i=n(l)}}function x(e){if(h=!1,b(e),!m)if(n(c)!==null)m=!0,ee||(ee=!0,w());else{var t=n(l);t!==null&&oe(x,t.startTime-e)}}var ee=!1,S=-1,C=5,te=-1;function ne(){return g?!0:!(e.unstable_now()-te<C)}function re(){if(g=!1,ee){var t=e.unstable_now();te=t;var i=!0;try{a:{m=!1,h&&(h=!1,v(S),S=-1),p=!0;var a=f;try{b:{for(b(t),d=n(c);d!==null&&!(d.expirationTime>t&&ne());){var o=d.callback;if(typeof o==`function`){d.callback=null,f=d.priorityLevel;var s=o(d.expirationTime<=t);if(t=e.unstable_now(),typeof s==`function`){d.callback=s,b(t),i=!0;break b}d===n(c)&&r(c),b(t)}else r(c);d=n(c)}if(d!==null)i=!0;else{var u=n(l);u!==null&&oe(x,u.startTime-t),i=!1}}break a}finally{d=null,f=a,p=!1}i=void 0}}finally{i?w():ee=!1}}}var w;if(typeof y==`function`)w=function(){y(re)};else if(typeof MessageChannel<`u`){var ie=new MessageChannel,ae=ie.port2;ie.port1.onmessage=re,w=function(){ae.postMessage(null)}}else w=function(){_(re,0)};function oe(t,n){S=_(function(){t(e.unstable_now())},n)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(e){e.callback=null},e.unstable_forceFrameRate=function(e){0>e||125<e?console.error(`forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported`):C=0<e?Math.floor(1e3/e):5},e.unstable_getCurrentPriorityLevel=function(){return f},e.unstable_next=function(e){switch(f){case 1:case 2:case 3:var t=3;break;default:t=f}var n=f;f=t;try{return e()}finally{f=n}},e.unstable_requestPaint=function(){g=!0},e.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=f;f=e;try{return t()}finally{f=n}},e.unstable_scheduleCallback=function(r,i,a){var o=e.unstable_now();switch(typeof a==`object`&&a?(a=a.delay,a=typeof a==`number`&&0<a?o+a:o):a=o,r){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=a+s,r={id:u++,callback:i,priorityLevel:r,startTime:a,expirationTime:s,sortIndex:-1},a>o?(r.sortIndex=a,t(l,r),n(c)===null&&r===n(l)&&(h?(v(S),S=-1):h=!0,oe(x,a-o))):(r.sortIndex=s,t(c,r),m||p||(m=!0,ee||(ee=!0,w()))),r},e.unstable_shouldYield=ne,e.unstable_wrapCallback=function(e){var t=f;return function(){var n=f;f=t;try{return e.apply(this,arguments)}finally{f=n}}}})),i=e(((e,t)=>{t.exports=r()})),a=e((e=>{var t=n();function r(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function i(){}var a={d:{f:i,r:function(){throw Error(r(522))},D:i,C:i,L:i,m:i,X:i,S:i,M:i},p:0,findDOMNode:null},o=Symbol.for(`react.portal`);function s(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:o,key:r==null?null:``+r,children:e,containerInfo:t,implementation:n}}var c=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function l(e,t){if(e===`font`)return``;if(typeof t==`string`)return t===`use-credentials`?t:``}e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=a,e.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(r(299));return s(e,t,null,n)},e.flushSync=function(e){var t=c.T,n=a.p;try{if(c.T=null,a.p=2,e)return e()}finally{c.T=t,a.p=n,a.d.f()}},e.preconnect=function(e,t){typeof e==`string`&&(t?(t=t.crossOrigin,t=typeof t==`string`?t===`use-credentials`?t:``:void 0):t=null,a.d.C(e,t))},e.prefetchDNS=function(e){typeof e==`string`&&a.d.D(e)},e.preinit=function(e,t){if(typeof e==`string`&&t&&typeof t.as==`string`){var n=t.as,r=l(n,t.crossOrigin),i=typeof t.integrity==`string`?t.integrity:void 0,o=typeof t.fetchPriority==`string`?t.fetchPriority:void 0;n===`style`?a.d.S(e,typeof t.precedence==`string`?t.precedence:void 0,{crossOrigin:r,integrity:i,fetchPriority:o}):n===`script`&&a.d.X(e,{crossOrigin:r,integrity:i,fetchPriority:o,nonce:typeof t.nonce==`string`?t.nonce:void 0})}},e.preinitModule=function(e,t){if(typeof e==`string`)if(typeof t==`object`&&t){if(t.as==null||t.as===`script`){var n=l(t.as,t.crossOrigin);a.d.M(e,{crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0})}}else t??a.d.M(e)},e.preload=function(e,t){if(typeof e==`string`&&typeof t==`object`&&t&&typeof t.as==`string`){var n=t.as,r=l(n,t.crossOrigin);a.d.L(e,n,{crossOrigin:r,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0,type:typeof t.type==`string`?t.type:void 0,fetchPriority:typeof t.fetchPriority==`string`?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy==`string`?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet==`string`?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes==`string`?t.imageSizes:void 0,media:typeof t.media==`string`?t.media:void 0})}},e.preloadModule=function(e,t){if(typeof e==`string`)if(t){var n=l(t.as,t.crossOrigin);a.d.m(e,{as:typeof t.as==`string`&&t.as!==`script`?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0})}else a.d.m(e)},e.requestFormReset=function(e){a.d.r(e)},e.unstable_batchedUpdates=function(e,t){return e(t)},e.useFormState=function(e,t,n){return c.H.useFormState(e,t,n)},e.useFormStatus=function(){return c.H.useHostTransitionStatus()},e.version=`19.2.7`})),o=e(((e,t)=>{function n(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>`u`||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!=`function`))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=a()})),s=e((e=>{var t=i(),r=n(),a=o();function s(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function c(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function l(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function u(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function d(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function f(e){if(l(e)!==e)throw Error(s(188))}function p(e){var t=e.alternate;if(!t){if(t=l(e),t===null)throw Error(s(188));return t===e?e:null}for(var n=e,r=t;;){var i=n.return;if(i===null)break;var a=i.alternate;if(a===null){if(r=i.return,r!==null){n=r;continue}break}if(i.child===a.child){for(a=i.child;a;){if(a===n)return f(i),e;if(a===r)return f(i),t;a=a.sibling}throw Error(s(188))}if(n.return!==r.return)n=i,r=a;else{for(var o=!1,c=i.child;c;){if(c===n){o=!0,n=i,r=a;break}if(c===r){o=!0,r=i,n=a;break}c=c.sibling}if(!o){for(c=a.child;c;){if(c===n){o=!0,n=a,r=i;break}if(c===r){o=!0,r=a,n=i;break}c=c.sibling}if(!o)throw Error(s(189))}}if(n.alternate!==r)throw Error(s(190))}if(n.tag!==3)throw Error(s(188));return n.stateNode.current===n?e:t}function m(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=m(e),t!==null)return t;e=e.sibling}return null}var h=Object.assign,g=Symbol.for(`react.element`),_=Symbol.for(`react.transitional.element`),v=Symbol.for(`react.portal`),y=Symbol.for(`react.fragment`),b=Symbol.for(`react.strict_mode`),x=Symbol.for(`react.profiler`),ee=Symbol.for(`react.consumer`),S=Symbol.for(`react.context`),C=Symbol.for(`react.forward_ref`),te=Symbol.for(`react.suspense`),ne=Symbol.for(`react.suspense_list`),re=Symbol.for(`react.memo`),w=Symbol.for(`react.lazy`),ie=Symbol.for(`react.activity`),ae=Symbol.for(`react.memo_cache_sentinel`),oe=Symbol.iterator;function se(e){return typeof e!=`object`||!e?null:(e=oe&&e[oe]||e[`@@iterator`],typeof e==`function`?e:null)}var ce=Symbol.for(`react.client.reference`);function le(e){if(e==null)return null;if(typeof e==`function`)return e.$$typeof===ce?null:e.displayName||e.name||null;if(typeof e==`string`)return e;switch(e){case y:return`Fragment`;case x:return`Profiler`;case b:return`StrictMode`;case te:return`Suspense`;case ne:return`SuspenseList`;case ie:return`Activity`}if(typeof e==`object`)switch(e.$$typeof){case v:return`Portal`;case S:return e.displayName||`Context`;case ee:return(e._context.displayName||`Context`)+`.Consumer`;case C:var t=e.render;return e=e.displayName,e||=(e=t.displayName||t.name||``,e===``?`ForwardRef`:`ForwardRef(`+e+`)`),e;case re:return t=e.displayName||null,t===null?le(e.type)||`Memo`:t;case w:t=e._payload,e=e._init;try{return le(e(t))}catch{}}return null}var ue=Array.isArray,T=r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,E=a.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,de={pending:!1,data:null,method:null,action:null},fe=[],pe=-1;function me(e){return{current:e}}function D(e){0>pe||(e.current=fe[pe],fe[pe]=null,pe--)}function O(e,t){pe++,fe[pe]=e.current,e.current=t}var he=me(null),ge=me(null),_e=me(null),ve=me(null);function ye(e,t){switch(O(_e,t),O(ge,e),O(he,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Vd(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Vd(t),e=Hd(t,e);else switch(e){case`svg`:e=1;break;case`math`:e=2;break;default:e=0}}D(he),O(he,e)}function be(){D(he),D(ge),D(_e)}function xe(e){e.memoizedState!==null&&O(ve,e);var t=he.current,n=Hd(t,e.type);t!==n&&(O(ge,e),O(he,n))}function Se(e){ge.current===e&&(D(he),D(ge)),ve.current===e&&(D(ve),Qf._currentValue=de)}var Ce,we;function Te(e){if(Ce===void 0)try{throw Error()}catch(e){var t=e.stack.trim().match(/\n( *(at )?)/);Ce=t&&t[1]||``,we=-1<e.stack.indexOf(`
    at`)?` (<anonymous>)`:-1<e.stack.indexOf(`@`)?`@unknown:0:0`:``}return`
`+Ce+e+we}var Ee=!1;function De(e,t){if(!e||Ee)return``;Ee=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(t){var n=function(){throw Error()};if(Object.defineProperty(n.prototype,"props",{set:function(){throw Error()}}),typeof Reflect==`object`&&Reflect.construct){try{Reflect.construct(n,[])}catch(e){var r=e}Reflect.construct(e,[],n)}else{try{n.call()}catch(e){r=e}e.call(n.prototype)}}else{try{throw Error()}catch(e){r=e}(n=e())&&typeof n.catch==`function`&&n.catch(function(){})}}catch(e){if(e&&r&&typeof e.stack==`string`)return[e.stack,r.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName=`DetermineComponentFrameRoot`;var i=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,`name`);i&&i.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:`DetermineComponentFrameRoot`});var a=r.DetermineComponentFrameRoot(),o=a[0],s=a[1];if(o&&s){var c=o.split(`
`),l=s.split(`
`);for(i=r=0;r<c.length&&!c[r].includes(`DetermineComponentFrameRoot`);)r++;for(;i<l.length&&!l[i].includes(`DetermineComponentFrameRoot`);)i++;if(r===c.length||i===l.length)for(r=c.length-1,i=l.length-1;1<=r&&0<=i&&c[r]!==l[i];)i--;for(;1<=r&&0<=i;r--,i--)if(c[r]!==l[i]){if(r!==1||i!==1)do if(r--,i--,0>i||c[r]!==l[i]){var u=`
`+c[r].replace(` at new `,` at `);return e.displayName&&u.includes(`<anonymous>`)&&(u=u.replace(`<anonymous>`,e.displayName)),u}while(1<=r&&0<=i);break}}}finally{Ee=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:``)?Te(n):``}function Oe(e,t){switch(e.tag){case 26:case 27:case 5:return Te(e.type);case 16:return Te(`Lazy`);case 13:return e.child!==t&&t!==null?Te(`Suspense Fallback`):Te(`Suspense`);case 19:return Te(`SuspenseList`);case 0:case 15:return De(e.type,!1);case 11:return De(e.type.render,!1);case 1:return De(e.type,!0);case 31:return Te(`Activity`);default:return``}}function ke(e){try{var t=``,n=null;do t+=Oe(e,n),n=e,e=e.return;while(e);return t}catch(e){return`
Error generating stack: `+e.message+`
`+e.stack}}var Ae=Object.prototype.hasOwnProperty,je=t.unstable_scheduleCallback,Me=t.unstable_cancelCallback,Ne=t.unstable_shouldYield,Pe=t.unstable_requestPaint,Fe=t.unstable_now,Ie=t.unstable_getCurrentPriorityLevel,Le=t.unstable_ImmediatePriority,Re=t.unstable_UserBlockingPriority,ze=t.unstable_NormalPriority,Be=t.unstable_LowPriority,Ve=t.unstable_IdlePriority,He=t.log,Ue=t.unstable_setDisableYieldValue,We=null,Ge=null;function Ke(e){if(typeof He==`function`&&Ue(e),Ge&&typeof Ge.setStrictMode==`function`)try{Ge.setStrictMode(We,e)}catch{}}var qe=Math.clz32?Math.clz32:Xe,Je=Math.log,Ye=Math.LN2;function Xe(e){return e>>>=0,e===0?32:31-(Je(e)/Ye|0)|0}var Ze=256,Qe=262144,$e=4194304;function et(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function tt(e,t,n){var r=e.pendingLanes;if(r===0)return 0;var i=0,a=e.suspendedLanes,o=e.pingedLanes;e=e.warmLanes;var s=r&134217727;return s===0?(s=r&~a,s===0?o===0?n||(n=r&~e,n!==0&&(i=et(n))):i=et(o):i=et(s)):(r=s&~a,r===0?(o&=s,o===0?n||(n=s&~e,n!==0&&(i=et(n))):i=et(o)):i=et(r)),i===0?0:t!==0&&t!==i&&(t&a)===0&&(a=i&-i,n=t&-t,a>=n||a===32&&n&4194048)?t:i}function nt(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function rt(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function it(){var e=$e;return $e<<=1,!($e&62914560)&&($e=4194304),e}function at(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function ot(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function st(e,t,n,r,i,a){var o=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var s=e.entanglements,c=e.expirationTimes,l=e.hiddenUpdates;for(n=o&~n;0<n;){var u=31-qe(n),d=1<<u;s[u]=0,c[u]=-1;var f=l[u];if(f!==null)for(l[u]=null,u=0;u<f.length;u++){var p=f[u];p!==null&&(p.lane&=-536870913)}n&=~d}r!==0&&ct(e,r,0),a!==0&&i===0&&e.tag!==0&&(e.suspendedLanes|=a&~(o&~t))}function ct(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var r=31-qe(t);e.entangledLanes|=t,e.entanglements[r]=e.entanglements[r]|1073741824|n&261930}function lt(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-qe(n),i=1<<r;i&t|e[r]&t&&(e[r]|=t),n&=~i}}function ut(e,t){var n=t&-t;return n=n&42?1:dt(n),(n&(e.suspendedLanes|t))===0?n:0}function dt(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function ft(e){return e&=-e,2<e?8<e?e&134217727?32:268435456:8:2}function pt(){var e=E.p;return e===0?(e=window.event,e===void 0?32:mp(e.type)):e}function mt(e,t){var n=E.p;try{return E.p=e,t()}finally{E.p=n}}var ht=Math.random().toString(36).slice(2),gt=`__reactFiber$`+ht,_t=`__reactProps$`+ht,vt=`__reactContainer$`+ht,yt=`__reactEvents$`+ht,bt=`__reactListeners$`+ht,xt=`__reactHandles$`+ht,St=`__reactResources$`+ht,Ct=`__reactMarker$`+ht;function wt(e){delete e[gt],delete e[_t],delete e[yt],delete e[bt],delete e[xt]}function Tt(e){var t=e[gt];if(t)return t;for(var n=e.parentNode;n;){if(t=n[vt]||n[gt]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=df(e);e!==null;){if(n=e[gt])return n;e=df(e)}return t}e=n,n=e.parentNode}return null}function Et(e){if(e=e[gt]||e[vt]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Dt(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(s(33))}function Ot(e){var t=e[St];return t||=e[St]={hoistableStyles:new Map,hoistableScripts:new Map},t}function k(e){e[Ct]=!0}var kt=new Set,At={};function jt(e,t){Mt(e,t),Mt(e+`Capture`,t)}function Mt(e,t){for(At[e]=t,e=0;e<t.length;e++)kt.add(t[e])}var Nt=RegExp(`^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`),Pt={},Ft={};function It(e){return Ae.call(Ft,e)?!0:Ae.call(Pt,e)?!1:Nt.test(e)?Ft[e]=!0:(Pt[e]=!0,!1)}function Lt(e,t,n){if(It(t))if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:e.removeAttribute(t);return;case`boolean`:var r=t.toLowerCase().slice(0,5);if(r!==`data-`&&r!==`aria-`){e.removeAttribute(t);return}}e.setAttribute(t,``+n)}}function Rt(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(t);return}e.setAttribute(t,``+n)}}function zt(e,t,n,r){if(r===null)e.removeAttribute(n);else{switch(typeof r){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(n);return}e.setAttributeNS(t,n,``+r)}}function Bt(e){switch(typeof e){case`bigint`:case`boolean`:case`number`:case`string`:case`undefined`:return e;case`object`:return e;default:return``}}function Vt(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()===`input`&&(t===`checkbox`||t===`radio`)}function Ht(e,t,n){var r=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&r!==void 0&&typeof r.get==`function`&&typeof r.set==`function`){var i=r.get,a=r.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return i.call(this)},set:function(e){n=``+e,a.call(this,e)}}),Object.defineProperty(e,t,{enumerable:r.enumerable}),{getValue:function(){return n},setValue:function(e){n=``+e},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Ut(e){if(!e._valueTracker){var t=Vt(e)?`checked`:`value`;e._valueTracker=Ht(e,t,``+e[t])}}function Wt(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r=``;return e&&(r=Vt(e)?e.checked?`true`:`false`:e.value),e=r,e===n?!1:(t.setValue(e),!0)}function Gt(e){if(e||=typeof document<`u`?document:void 0,e===void 0)return null;try{return e.activeElement||e.body}catch{return e.body}}var Kt=/[\n"\\]/g;function qt(e){return e.replace(Kt,function(e){return`\\`+e.charCodeAt(0).toString(16)+` `})}function Jt(e,t,n,r,i,a,o,s){e.name=``,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`?e.type=o:e.removeAttribute(`type`),t==null?o!==`submit`&&o!==`reset`||e.removeAttribute(`value`):o===`number`?(t===0&&e.value===``||e.value!=t)&&(e.value=``+Bt(t)):e.value!==``+Bt(t)&&(e.value=``+Bt(t)),t==null?n==null?r!=null&&e.removeAttribute(`value`):Xt(e,o,Bt(n)):Xt(e,o,Bt(t)),i==null&&a!=null&&(e.defaultChecked=!!a),i!=null&&(e.checked=i&&typeof i!=`function`&&typeof i!=`symbol`),s!=null&&typeof s!=`function`&&typeof s!=`symbol`&&typeof s!=`boolean`?e.name=``+Bt(s):e.removeAttribute(`name`)}function Yt(e,t,n,r,i,a,o,s){if(a!=null&&typeof a!=`function`&&typeof a!=`symbol`&&typeof a!=`boolean`&&(e.type=a),t!=null||n!=null){if(!(a!==`submit`&&a!==`reset`||t!=null)){Ut(e);return}n=n==null?``:``+Bt(n),t=t==null?n:``+Bt(t),s||t===e.value||(e.value=t),e.defaultValue=t}r??=i,r=typeof r!=`function`&&typeof r!=`symbol`&&!!r,e.checked=s?e.checked:!!r,e.defaultChecked=!!r,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`&&(e.name=o),Ut(e)}function Xt(e,t,n){t===`number`&&Gt(e.ownerDocument)===e||e.defaultValue===``+n||(e.defaultValue=``+n)}function Zt(e,t,n,r){if(e=e.options,t){t={};for(var i=0;i<n.length;i++)t[`$`+n[i]]=!0;for(n=0;n<e.length;n++)i=t.hasOwnProperty(`$`+e[n].value),e[n].selected!==i&&(e[n].selected=i),i&&r&&(e[n].defaultSelected=!0)}else{for(n=``+Bt(n),t=null,i=0;i<e.length;i++){if(e[i].value===n){e[i].selected=!0,r&&(e[i].defaultSelected=!0);return}t!==null||e[i].disabled||(t=e[i])}t!==null&&(t.selected=!0)}}function Qt(e,t,n){if(t!=null&&(t=``+Bt(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n==null?``:``+Bt(n)}function $t(e,t,n,r){if(t==null){if(r!=null){if(n!=null)throw Error(s(92));if(ue(r)){if(1<r.length)throw Error(s(93));r=r[0]}n=r}n??=``,t=n}n=Bt(t),e.defaultValue=n,r=e.textContent,r===n&&r!==``&&r!==null&&(e.value=r),Ut(e)}function en(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var tn=new Set(`animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp`.split(` `));function nn(e,t,n){var r=t.indexOf(`--`)===0;n==null||typeof n==`boolean`||n===``?r?e.setProperty(t,``):t===`float`?e.cssFloat=``:e[t]=``:r?e.setProperty(t,n):typeof n!=`number`||n===0||tn.has(t)?t===`float`?e.cssFloat=n:e[t]=(``+n).trim():e[t]=n+`px`}function rn(e,t,n){if(t!=null&&typeof t!=`object`)throw Error(s(62));if(e=e.style,n!=null){for(var r in n)!n.hasOwnProperty(r)||t!=null&&t.hasOwnProperty(r)||(r.indexOf(`--`)===0?e.setProperty(r,``):r===`float`?e.cssFloat=``:e[r]=``);for(var i in t)r=t[i],t.hasOwnProperty(i)&&n[i]!==r&&nn(e,i,r)}else for(var a in t)t.hasOwnProperty(a)&&nn(e,a,t[a])}function an(e){if(e.indexOf(`-`)===-1)return!1;switch(e){case`annotation-xml`:case`color-profile`:case`font-face`:case`font-face-src`:case`font-face-uri`:case`font-face-format`:case`font-face-name`:case`missing-glyph`:return!1;default:return!0}}var on=new Map([[`acceptCharset`,`accept-charset`],[`htmlFor`,`for`],[`httpEquiv`,`http-equiv`],[`crossOrigin`,`crossorigin`],[`accentHeight`,`accent-height`],[`alignmentBaseline`,`alignment-baseline`],[`arabicForm`,`arabic-form`],[`baselineShift`,`baseline-shift`],[`capHeight`,`cap-height`],[`clipPath`,`clip-path`],[`clipRule`,`clip-rule`],[`colorInterpolation`,`color-interpolation`],[`colorInterpolationFilters`,`color-interpolation-filters`],[`colorProfile`,`color-profile`],[`colorRendering`,`color-rendering`],[`dominantBaseline`,`dominant-baseline`],[`enableBackground`,`enable-background`],[`fillOpacity`,`fill-opacity`],[`fillRule`,`fill-rule`],[`floodColor`,`flood-color`],[`floodOpacity`,`flood-opacity`],[`fontFamily`,`font-family`],[`fontSize`,`font-size`],[`fontSizeAdjust`,`font-size-adjust`],[`fontStretch`,`font-stretch`],[`fontStyle`,`font-style`],[`fontVariant`,`font-variant`],[`fontWeight`,`font-weight`],[`glyphName`,`glyph-name`],[`glyphOrientationHorizontal`,`glyph-orientation-horizontal`],[`glyphOrientationVertical`,`glyph-orientation-vertical`],[`horizAdvX`,`horiz-adv-x`],[`horizOriginX`,`horiz-origin-x`],[`imageRendering`,`image-rendering`],[`letterSpacing`,`letter-spacing`],[`lightingColor`,`lighting-color`],[`markerEnd`,`marker-end`],[`markerMid`,`marker-mid`],[`markerStart`,`marker-start`],[`overlinePosition`,`overline-position`],[`overlineThickness`,`overline-thickness`],[`paintOrder`,`paint-order`],[`panose-1`,`panose-1`],[`pointerEvents`,`pointer-events`],[`renderingIntent`,`rendering-intent`],[`shapeRendering`,`shape-rendering`],[`stopColor`,`stop-color`],[`stopOpacity`,`stop-opacity`],[`strikethroughPosition`,`strikethrough-position`],[`strikethroughThickness`,`strikethrough-thickness`],[`strokeDasharray`,`stroke-dasharray`],[`strokeDashoffset`,`stroke-dashoffset`],[`strokeLinecap`,`stroke-linecap`],[`strokeLinejoin`,`stroke-linejoin`],[`strokeMiterlimit`,`stroke-miterlimit`],[`strokeOpacity`,`stroke-opacity`],[`strokeWidth`,`stroke-width`],[`textAnchor`,`text-anchor`],[`textDecoration`,`text-decoration`],[`textRendering`,`text-rendering`],[`transformOrigin`,`transform-origin`],[`underlinePosition`,`underline-position`],[`underlineThickness`,`underline-thickness`],[`unicodeBidi`,`unicode-bidi`],[`unicodeRange`,`unicode-range`],[`unitsPerEm`,`units-per-em`],[`vAlphabetic`,`v-alphabetic`],[`vHanging`,`v-hanging`],[`vIdeographic`,`v-ideographic`],[`vMathematical`,`v-mathematical`],[`vectorEffect`,`vector-effect`],[`vertAdvY`,`vert-adv-y`],[`vertOriginX`,`vert-origin-x`],[`vertOriginY`,`vert-origin-y`],[`wordSpacing`,`word-spacing`],[`writingMode`,`writing-mode`],[`xmlnsXlink`,`xmlns:xlink`],[`xHeight`,`x-height`]]),sn=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function cn(e){return sn.test(``+e)?`javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')`:e}function ln(){}var un=null;function dn(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var fn=null,pn=null;function mn(e){var t=Et(e);if(t&&(e=t.stateNode)){var n=e[_t]||null;a:switch(e=t.stateNode,t.type){case`input`:if(Jt(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type===`radio`&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll(`input[name="`+qt(``+t)+`"][type="radio"]`),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var i=r[_t]||null;if(!i)throw Error(s(90));Jt(r,i.value,i.defaultValue,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name)}}for(t=0;t<n.length;t++)r=n[t],r.form===e.form&&Wt(r)}break a;case`textarea`:Qt(e,n.value,n.defaultValue);break a;case`select`:t=n.value,t!=null&&Zt(e,!!n.multiple,t,!1)}}}var hn=!1;function gn(e,t,n){if(hn)return e(t,n);hn=!0;try{return e(t)}finally{if(hn=!1,(fn!==null||pn!==null)&&(bu(),fn&&(t=fn,e=pn,pn=fn=null,mn(t),e)))for(t=0;t<e.length;t++)mn(e[t])}}function _n(e,t){var n=e.stateNode;if(n===null)return null;var r=n[_t]||null;if(r===null)return null;n=r[t];a:switch(t){case`onClick`:case`onClickCapture`:case`onDoubleClick`:case`onDoubleClickCapture`:case`onMouseDown`:case`onMouseDownCapture`:case`onMouseMove`:case`onMouseMoveCapture`:case`onMouseUp`:case`onMouseUpCapture`:case`onMouseEnter`:(r=!r.disabled)||(e=e.type,r=!(e===`button`||e===`input`||e===`select`||e===`textarea`)),e=!r;break a;default:e=!1}if(e)return null;if(n&&typeof n!=`function`)throw Error(s(231,t,typeof n));return n}var vn=!(typeof window>`u`||window.document===void 0||window.document.createElement===void 0),yn=!1;if(vn)try{var bn={};Object.defineProperty(bn,"passive",{get:function(){yn=!0}}),window.addEventListener(`test`,bn,bn),window.removeEventListener(`test`,bn,bn)}catch{yn=!1}var xn=null,Sn=null,Cn=null;function wn(){if(Cn)return Cn;var e,t=Sn,n=t.length,r,i=`value`in xn?xn.value:xn.textContent,a=i.length;for(e=0;e<n&&t[e]===i[e];e++);var o=n-e;for(r=1;r<=o&&t[n-r]===i[a-r];r++);return Cn=i.slice(e,1<r?1-r:void 0)}function Tn(e){var t=e.keyCode;return`charCode`in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function En(){return!0}function Dn(){return!1}function On(e){function t(t,n,r,i,a){for(var o in this._reactName=t,this._targetInst=r,this.type=n,this.nativeEvent=i,this.target=a,this.currentTarget=null,e)e.hasOwnProperty(o)&&(t=e[o],this[o]=t?t(i):i[o]);return this.isDefaultPrevented=(i.defaultPrevented==null?!1===i.returnValue:i.defaultPrevented)?En:Dn,this.isPropagationStopped=Dn,this}return h(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():typeof e.returnValue!=`unknown`&&(e.returnValue=!1),this.isDefaultPrevented=En)},stopPropagation:function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():typeof e.cancelBubble!=`unknown`&&(e.cancelBubble=!0),this.isPropagationStopped=En)},persist:function(){},isPersistent:En}),t}var kn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},An=On(kn),jn=h({},kn,{view:0,detail:0}),Mn=On(jn),Nn,Pn,Fn,In=h({},jn,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:qn,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return`movementX`in e?e.movementX:(e!==Fn&&(Fn&&e.type===`mousemove`?(Nn=e.screenX-Fn.screenX,Pn=e.screenY-Fn.screenY):Pn=Nn=0,Fn=e),Nn)},movementY:function(e){return`movementY`in e?e.movementY:Pn}}),Ln=On(In),Rn=On(h({},In,{dataTransfer:0})),zn=On(h({},jn,{relatedTarget:0})),Bn=On(h({},kn,{animationName:0,elapsedTime:0,pseudoElement:0})),Vn=On(h({},kn,{clipboardData:function(e){return`clipboardData`in e?e.clipboardData:window.clipboardData}})),Hn=On(h({},kn,{data:0})),Un={Esc:`Escape`,Spacebar:` `,Left:`ArrowLeft`,Up:`ArrowUp`,Right:`ArrowRight`,Down:`ArrowDown`,Del:`Delete`,Win:`OS`,Menu:`ContextMenu`,Apps:`ContextMenu`,Scroll:`ScrollLock`,MozPrintableKey:`Unidentified`},Wn={8:`Backspace`,9:`Tab`,12:`Clear`,13:`Enter`,16:`Shift`,17:`Control`,18:`Alt`,19:`Pause`,20:`CapsLock`,27:`Escape`,32:` `,33:`PageUp`,34:`PageDown`,35:`End`,36:`Home`,37:`ArrowLeft`,38:`ArrowUp`,39:`ArrowRight`,40:`ArrowDown`,45:`Insert`,46:`Delete`,112:`F1`,113:`F2`,114:`F3`,115:`F4`,116:`F5`,117:`F6`,118:`F7`,119:`F8`,120:`F9`,121:`F10`,122:`F11`,123:`F12`,144:`NumLock`,145:`ScrollLock`,224:`Meta`},Gn={Alt:`altKey`,Control:`ctrlKey`,Meta:`metaKey`,Shift:`shiftKey`};function Kn(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Gn[e])?!!t[e]:!1}function qn(){return Kn}var Jn=On(h({},jn,{key:function(e){if(e.key){var t=Un[e.key]||e.key;if(t!==`Unidentified`)return t}return e.type===`keypress`?(e=Tn(e),e===13?`Enter`:String.fromCharCode(e)):e.type===`keydown`||e.type===`keyup`?Wn[e.keyCode]||`Unidentified`:``},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:qn,charCode:function(e){return e.type===`keypress`?Tn(e):0},keyCode:function(e){return e.type===`keydown`||e.type===`keyup`?e.keyCode:0},which:function(e){return e.type===`keypress`?Tn(e):e.type===`keydown`||e.type===`keyup`?e.keyCode:0}})),Yn=On(h({},In,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0})),Xn=On(h({},jn,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:qn})),Zn=On(h({},kn,{propertyName:0,elapsedTime:0,pseudoElement:0})),Qn=On(h({},In,{deltaX:function(e){return`deltaX`in e?e.deltaX:`wheelDeltaX`in e?-e.wheelDeltaX:0},deltaY:function(e){return`deltaY`in e?e.deltaY:`wheelDeltaY`in e?-e.wheelDeltaY:`wheelDelta`in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0})),$n=On(h({},kn,{newState:0,oldState:0})),er=[9,13,27,32],tr=vn&&`CompositionEvent`in window,nr=null;vn&&`documentMode`in document&&(nr=document.documentMode);var rr=vn&&`TextEvent`in window&&!nr,ir=vn&&(!tr||nr&&8<nr&&11>=nr),ar=` `,or=!1;function sr(e,t){switch(e){case`keyup`:return er.indexOf(t.keyCode)!==-1;case`keydown`:return t.keyCode!==229;case`keypress`:case`mousedown`:case`focusout`:return!0;default:return!1}}function cr(e){return e=e.detail,typeof e==`object`&&`data`in e?e.data:null}var lr=!1;function ur(e,t){switch(e){case`compositionend`:return cr(t);case`keypress`:return t.which===32?(or=!0,ar):null;case`textInput`:return e=t.data,e===ar&&or?null:e;default:return null}}function dr(e,t){if(lr)return e===`compositionend`||!tr&&sr(e,t)?(e=wn(),Cn=Sn=xn=null,lr=!1,e):null;switch(e){case`paste`:return null;case`keypress`:if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case`compositionend`:return ir&&t.locale!==`ko`?null:t.data;default:return null}}var fr={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function pr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t===`input`?!!fr[e.type]:t===`textarea`}function mr(e,t,n,r){fn?pn?pn.push(r):pn=[r]:fn=r,t=Ed(t,`onChange`),0<t.length&&(n=new An(`onChange`,`change`,null,n,r),e.push({event:n,listeners:t}))}var hr=null,gr=null;function _r(e){yd(e,0)}function vr(e){if(Wt(Dt(e)))return e}function yr(e,t){if(e===`change`)return t}var br=!1;if(vn){var xr;if(vn){var Sr=`oninput`in document;if(!Sr){var Cr=document.createElement(`div`);Cr.setAttribute(`oninput`,`return;`),Sr=typeof Cr.oninput==`function`}xr=Sr}else xr=!1;br=xr&&(!document.documentMode||9<document.documentMode)}function wr(){hr&&(hr.detachEvent(`onpropertychange`,Tr),gr=hr=null)}function Tr(e){if(e.propertyName===`value`&&vr(gr)){var t=[];mr(t,gr,e,dn(e)),gn(_r,t)}}function Er(e,t,n){e===`focusin`?(wr(),hr=t,gr=n,hr.attachEvent(`onpropertychange`,Tr)):e===`focusout`&&wr()}function Dr(e){if(e===`selectionchange`||e===`keyup`||e===`keydown`)return vr(gr)}function Or(e,t){if(e===`click`)return vr(t)}function kr(e,t){if(e===`input`||e===`change`)return vr(t)}function Ar(e,t){return e===t&&(e!==0||1/e==1/t)||e!==e&&t!==t}var jr=typeof Object.is==`function`?Object.is:Ar;function Mr(e,t){if(jr(e,t))return!0;if(typeof e!=`object`||!e||typeof t!=`object`||!t)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!Ae.call(t,i)||!jr(e[i],t[i]))return!1}return!0}function Nr(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Pr(e,t){var n=Nr(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}a:{for(;n;){if(n.nextSibling){n=n.nextSibling;break a}n=n.parentNode}n=void 0}n=Nr(n)}}function Fr(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Fr(e,t.parentNode):`contains`in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Ir(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Gt(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href==`string`}catch{n=!1}if(n)e=t.contentWindow;else break;t=Gt(e.document)}return t}function Lr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t===`input`&&(e.type===`text`||e.type===`search`||e.type===`tel`||e.type===`url`||e.type===`password`)||t===`textarea`||e.contentEditable===`true`)}var Rr=vn&&`documentMode`in document&&11>=document.documentMode,zr=null,Br=null,Vr=null,Hr=!1;function Ur(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Hr||zr==null||zr!==Gt(r)||(r=zr,`selectionStart`in r&&Lr(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Vr&&Mr(Vr,r)||(Vr=r,r=Ed(Br,`onSelect`),0<r.length&&(t=new An(`onSelect`,`select`,null,t,n),e.push({event:t,listeners:r}),t.target=zr)))}function Wr(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n[`Webkit`+e]=`webkit`+t,n[`Moz`+e]=`moz`+t,n}var Gr={animationend:Wr(`Animation`,`AnimationEnd`),animationiteration:Wr(`Animation`,`AnimationIteration`),animationstart:Wr(`Animation`,`AnimationStart`),transitionrun:Wr(`Transition`,`TransitionRun`),transitionstart:Wr(`Transition`,`TransitionStart`),transitioncancel:Wr(`Transition`,`TransitionCancel`),transitionend:Wr(`Transition`,`TransitionEnd`)},Kr={},qr={};vn&&(qr=document.createElement(`div`).style,`AnimationEvent`in window||(delete Gr.animationend.animation,delete Gr.animationiteration.animation,delete Gr.animationstart.animation),`TransitionEvent`in window||delete Gr.transitionend.transition);function Jr(e){if(Kr[e])return Kr[e];if(!Gr[e])return e;var t=Gr[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in qr)return Kr[e]=t[n];return e}var Yr=Jr(`animationend`),Xr=Jr(`animationiteration`),Zr=Jr(`animationstart`),Qr=Jr(`transitionrun`),$r=Jr(`transitionstart`),ei=Jr(`transitioncancel`),ti=Jr(`transitionend`),ni=new Map,ri=`abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel`.split(` `);ri.push(`scrollEnd`);function ii(e,t){ni.set(e,t),jt(t,[e])}var ai=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},oi=[],si=0,ci=0;function li(){for(var e=si,t=ci=si=0;t<e;){var n=oi[t];oi[t++]=null;var r=oi[t];oi[t++]=null;var i=oi[t];oi[t++]=null;var a=oi[t];if(oi[t++]=null,r!==null&&i!==null){var o=r.pending;o===null?i.next=i:(i.next=o.next,o.next=i),r.pending=i}a!==0&&pi(n,i,a)}}function ui(e,t,n,r){oi[si++]=e,oi[si++]=t,oi[si++]=n,oi[si++]=r,ci|=r,e.lanes|=r,e=e.alternate,e!==null&&(e.lanes|=r)}function di(e,t,n,r){return ui(e,t,n,r),mi(e)}function fi(e,t){return ui(e,null,null,t),mi(e)}function pi(e,t,n){e.lanes|=n;var r=e.alternate;r!==null&&(r.lanes|=n);for(var i=!1,a=e.return;a!==null;)a.childLanes|=n,r=a.alternate,r!==null&&(r.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(i=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,i&&t!==null&&(i=31-qe(n),e=a.hiddenUpdates,r=e[i],r===null?e[i]=[t]:r.push(t),t.lane=n|536870912),a):null}function mi(e){if(50<du)throw du=0,fu=null,Error(s(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var hi={};function gi(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function _i(e,t,n,r){return new gi(e,t,n,r)}function vi(e){return e=e.prototype,!(!e||!e.isReactComponent)}function yi(e,t){var n=e.alternate;return n===null?(n=_i(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function bi(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function xi(e,t,n,r,i,a){var o=0;if(r=e,typeof e==`function`)vi(e)&&(o=1);else if(typeof e==`string`)o=Uf(e,n,he.current)?26:e===`html`||e===`head`||e===`body`?27:5;else a:switch(e){case ie:return e=_i(31,n,t,i),e.elementType=ie,e.lanes=a,e;case y:return Si(n.children,i,a,t);case b:o=8,i|=24;break;case x:return e=_i(12,n,t,i|2),e.elementType=x,e.lanes=a,e;case te:return e=_i(13,n,t,i),e.elementType=te,e.lanes=a,e;case ne:return e=_i(19,n,t,i),e.elementType=ne,e.lanes=a,e;default:if(typeof e==`object`&&e)switch(e.$$typeof){case S:o=10;break a;case ee:o=9;break a;case C:o=11;break a;case re:o=14;break a;case w:o=16,r=null;break a}o=29,n=Error(s(130,e===null?`null`:typeof e,``)),r=null}return t=_i(o,n,t,i),t.elementType=e,t.type=r,t.lanes=a,t}function Si(e,t,n,r){return e=_i(7,e,r,t),e.lanes=n,e}function Ci(e,t,n){return e=_i(6,e,null,t),e.lanes=n,e}function wi(e){var t=_i(18,null,null,0);return t.stateNode=e,t}function Ti(e,t,n){return t=_i(4,e.children===null?[]:e.children,e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var Ei=new WeakMap;function Di(e,t){if(typeof e==`object`&&e){var n=Ei.get(e);return n===void 0?(t={value:e,source:t,stack:ke(t)},Ei.set(e,t),t):n}return{value:e,source:t,stack:ke(t)}}var Oi=[],ki=0,Ai=null,ji=0,Mi=[],Ni=0,Pi=null,Fi=1,Ii=``;function Li(e,t){Oi[ki++]=ji,Oi[ki++]=Ai,Ai=e,ji=t}function Ri(e,t,n){Mi[Ni++]=Fi,Mi[Ni++]=Ii,Mi[Ni++]=Pi,Pi=e;var r=Fi;e=Ii;var i=32-qe(r)-1;r&=~(1<<i),n+=1;var a=32-qe(t)+i;if(30<a){var o=i-i%5;a=(r&(1<<o)-1).toString(32),r>>=o,i-=o,Fi=1<<32-qe(t)+i|n<<i|r,Ii=a+e}else Fi=1<<a|n<<i|r,Ii=e}function zi(e){e.return!==null&&(Li(e,1),Ri(e,1,0))}function Bi(e){for(;e===Ai;)Ai=Oi[--ki],Oi[ki]=null,ji=Oi[--ki],Oi[ki]=null;for(;e===Pi;)Pi=Mi[--Ni],Mi[Ni]=null,Ii=Mi[--Ni],Mi[Ni]=null,Fi=Mi[--Ni],Mi[Ni]=null}function Vi(e,t){Mi[Ni++]=Fi,Mi[Ni++]=Ii,Mi[Ni++]=Pi,Fi=t.id,Ii=t.overflow,Pi=e}var Hi=null,A=null,j=!1,Ui=null,Wi=!1,Gi=Error(s(519));function Ki(e){throw Qi(Di(Error(s(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?`text`:`HTML`,``)),e)),Gi}function qi(e){var t=e.stateNode,n=e.type,r=e.memoizedProps;switch(t[gt]=e,t[_t]=r,n){case`dialog`:Q(`cancel`,t),Q(`close`,t);break;case`iframe`:case`object`:case`embed`:Q(`load`,t);break;case`video`:case`audio`:for(n=0;n<_d.length;n++)Q(_d[n],t);break;case`source`:Q(`error`,t);break;case`img`:case`image`:case`link`:Q(`error`,t),Q(`load`,t);break;case`details`:Q(`toggle`,t);break;case`input`:Q(`invalid`,t),Yt(t,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case`select`:Q(`invalid`,t);break;case`textarea`:Q(`invalid`,t),$t(t,r.value,r.defaultValue,r.children)}n=r.children,typeof n!=`string`&&typeof n!=`number`&&typeof n!=`bigint`||t.textContent===``+n||!0===r.suppressHydrationWarning||Md(t.textContent,n)?(r.popover!=null&&(Q(`beforetoggle`,t),Q(`toggle`,t)),r.onScroll!=null&&Q(`scroll`,t),r.onScrollEnd!=null&&Q(`scrollend`,t),r.onClick!=null&&(t.onclick=ln),t=!0):t=!1,t||Ki(e,!0)}function Ji(e){for(Hi=e.return;Hi;)switch(Hi.tag){case 5:case 31:case 13:Wi=!1;return;case 27:case 3:Wi=!0;return;default:Hi=Hi.return}}function Yi(e){if(e!==Hi)return!1;if(!j)return Ji(e),j=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=!(n!==`form`&&n!==`button`)||Ud(e.type,e.memoizedProps)),n=!n),n&&A&&Ki(e),Ji(e),t===13){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(s(317));A=uf(e)}else if(t===31){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(s(317));A=uf(e)}else t===27?(t=A,Zd(e.type)?(e=lf,lf=null,A=e):A=t):A=Hi?cf(e.stateNode.nextSibling):null;return!0}function Xi(){A=Hi=null,j=!1}function Zi(){var e=Ui;return e!==null&&(Ql===null?Ql=e:Ql.push.apply(Ql,e),Ui=null),e}function Qi(e){Ui===null?Ui=[e]:Ui.push(e)}var $i=me(null),ea=null,ta=null;function na(e,t,n){O($i,t._currentValue),t._currentValue=n}function ra(e){e._currentValue=$i.current,D($i)}function ia(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)===t?r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t):(e.childLanes|=t,r!==null&&(r.childLanes|=t)),e===n)break;e=e.return}}function aa(e,t,n,r){var i=e.child;for(i!==null&&(i.return=e);i!==null;){var a=i.dependencies;if(a!==null){var o=i.child;a=a.firstContext;a:for(;a!==null;){var c=a;a=i;for(var l=0;l<t.length;l++)if(c.context===t[l]){a.lanes|=n,c=a.alternate,c!==null&&(c.lanes|=n),ia(a.return,n,e),r||(o=null);break a}a=c.next}}else if(i.tag===18){if(o=i.return,o===null)throw Error(s(341));o.lanes|=n,a=o.alternate,a!==null&&(a.lanes|=n),ia(o,n,e),o=null}else o=i.child;if(o!==null)o.return=i;else for(o=i;o!==null;){if(o===e){o=null;break}if(i=o.sibling,i!==null){i.return=o.return,o=i;break}o=o.return}i=o}}function oa(e,t,n,r){e=null;for(var i=t,a=!1;i!==null;){if(!a){if(i.flags&524288)a=!0;else if(i.flags&262144)break}if(i.tag===10){var o=i.alternate;if(o===null)throw Error(s(387));if(o=o.memoizedProps,o!==null){var c=i.type;jr(i.pendingProps.value,o.value)||(e===null?e=[c]:e.push(c))}}else if(i===ve.current){if(o=i.alternate,o===null)throw Error(s(387));o.memoizedState.memoizedState!==i.memoizedState.memoizedState&&(e===null?e=[Qf]:e.push(Qf))}i=i.return}e!==null&&aa(t,e,n,r),t.flags|=262144}function sa(e){for(e=e.firstContext;e!==null;){if(!jr(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function ca(e){ea=e,ta=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function la(e){return da(ea,e)}function ua(e,t){return ea===null&&ca(e),da(e,t)}function da(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},ta===null){if(e===null)throw Error(s(308));ta=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else ta=ta.next=t;return n}var fa=typeof AbortController<`u`?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(t,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(e){return e()})}},pa=t.unstable_scheduleCallback,ma=t.unstable_NormalPriority,M={$$typeof:S,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function ha(){return{controller:new fa,data:new Map,refCount:0}}function ga(e){e.refCount--,e.refCount===0&&pa(ma,function(){e.controller.abort()})}var _a=null,va=0,ya=0,ba=null;function xa(e,t){if(_a===null){var n=_a=[];va=0,ya=dd(),ba={status:`pending`,value:void 0,then:function(e){n.push(e)}}}return va++,t.then(Sa,Sa),t}function Sa(){if(--va===0&&_a!==null){ba!==null&&(ba.status=`fulfilled`);var e=_a;_a=null,ya=0,ba=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function Ca(e,t){var n=[],r={status:`pending`,value:null,reason:null,then:function(e){n.push(e)}};return e.then(function(){r.status=`fulfilled`,r.value=t;for(var e=0;e<n.length;e++)(0,n[e])(t)},function(e){for(r.status=`rejected`,r.reason=e,e=0;e<n.length;e++)(0,n[e])(void 0)}),r}var wa=T.S;T.S=function(e,t){tu=Fe(),typeof t==`object`&&t&&typeof t.then==`function`&&xa(e,t),wa!==null&&wa(e,t)};var Ta=me(null);function Ea(){var e=Ta.current;return e===null?G.pooledCache:e}function Da(e,t){t===null?O(Ta,Ta.current):O(Ta,t.pool)}function Oa(){var e=Ea();return e===null?null:{parent:M._currentValue,pool:e}}var ka=Error(s(460)),Aa=Error(s(474)),ja=Error(s(542)),Ma={then:function(){}};function Na(e){return e=e.status,e===`fulfilled`||e===`rejected`}function Pa(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(ln,ln),t=n),t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,Ra(e),e;default:if(typeof t.status==`string`)t.then(ln,ln);else{if(e=G,e!==null&&100<e.shellSuspendCounter)throw Error(s(482));e=t,e.status=`pending`,e.then(function(e){if(t.status===`pending`){var n=t;n.status=`fulfilled`,n.value=e}},function(e){if(t.status===`pending`){var n=t;n.status=`rejected`,n.reason=e}})}switch(t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,Ra(e),e}throw Ia=t,ka}}function Fa(e){try{var t=e._init;return t(e._payload)}catch(e){throw typeof e==`object`&&e&&typeof e.then==`function`?(Ia=e,ka):e}}var Ia=null;function La(){if(Ia===null)throw Error(s(459));var e=Ia;return Ia=null,e}function Ra(e){if(e===ka||e===ja)throw Error(s(483))}var za=null,Ba=0;function Va(e){var t=Ba;return Ba+=1,za===null&&(za=[]),Pa(za,e,t)}function Ha(e,t){t=t.props.ref,e.ref=t===void 0?null:t}function Ua(e,t){throw t.$$typeof===g?Error(s(525)):(e=Object.prototype.toString.call(t),Error(s(31,e===`[object Object]`?`object with keys {`+Object.keys(t).join(`, `)+`}`:e)))}function Wa(e){function t(t,n){if(e){var r=t.deletions;r===null?(t.deletions=[n],t.flags|=16):r.push(n)}}function n(n,r){if(!e)return null;for(;r!==null;)t(n,r),r=r.sibling;return null}function r(e){for(var t=new Map;e!==null;)e.key===null?t.set(e.index,e):t.set(e.key,e),e=e.sibling;return t}function i(e,t){return e=yi(e,t),e.index=0,e.sibling=null,e}function a(t,n,r){return t.index=r,e?(r=t.alternate,r===null?(t.flags|=67108866,n):(r=r.index,r<n?(t.flags|=67108866,n):r)):(t.flags|=1048576,n)}function o(t){return e&&t.alternate===null&&(t.flags|=67108866),t}function c(e,t,n,r){return t===null||t.tag!==6?(t=Ci(n,e.mode,r),t.return=e,t):(t=i(t,n),t.return=e,t)}function l(e,t,n,r){var a=n.type;return a===y?d(e,t,n.props.children,r,n.key):t!==null&&(t.elementType===a||typeof a==`object`&&a&&a.$$typeof===w&&Fa(a)===t.type)?(t=i(t,n.props),Ha(t,n),t.return=e,t):(t=xi(n.type,n.key,n.props,null,e.mode,r),Ha(t,n),t.return=e,t)}function u(e,t,n,r){return t===null||t.tag!==4||t.stateNode.containerInfo!==n.containerInfo||t.stateNode.implementation!==n.implementation?(t=Ti(n,e.mode,r),t.return=e,t):(t=i(t,n.children||[]),t.return=e,t)}function d(e,t,n,r,a){return t===null||t.tag!==7?(t=Si(n,e.mode,r,a),t.return=e,t):(t=i(t,n),t.return=e,t)}function f(e,t,n){if(typeof t==`string`&&t!==``||typeof t==`number`||typeof t==`bigint`)return t=Ci(``+t,e.mode,n),t.return=e,t;if(typeof t==`object`&&t){switch(t.$$typeof){case _:return n=xi(t.type,t.key,t.props,null,e.mode,n),Ha(n,t),n.return=e,n;case v:return t=Ti(t,e.mode,n),t.return=e,t;case w:return t=Fa(t),f(e,t,n)}if(ue(t)||se(t))return t=Si(t,e.mode,n,null),t.return=e,t;if(typeof t.then==`function`)return f(e,Va(t),n);if(t.$$typeof===S)return f(e,ua(e,t),n);Ua(e,t)}return null}function p(e,t,n,r){var i=t===null?null:t.key;if(typeof n==`string`&&n!==``||typeof n==`number`||typeof n==`bigint`)return i===null?c(e,t,``+n,r):null;if(typeof n==`object`&&n){switch(n.$$typeof){case _:return n.key===i?l(e,t,n,r):null;case v:return n.key===i?u(e,t,n,r):null;case w:return n=Fa(n),p(e,t,n,r)}if(ue(n)||se(n))return i===null?d(e,t,n,r,null):null;if(typeof n.then==`function`)return p(e,t,Va(n),r);if(n.$$typeof===S)return p(e,t,ua(e,n),r);Ua(e,n)}return null}function m(e,t,n,r,i){if(typeof r==`string`&&r!==``||typeof r==`number`||typeof r==`bigint`)return e=e.get(n)||null,c(t,e,``+r,i);if(typeof r==`object`&&r){switch(r.$$typeof){case _:return e=e.get(r.key===null?n:r.key)||null,l(t,e,r,i);case v:return e=e.get(r.key===null?n:r.key)||null,u(t,e,r,i);case w:return r=Fa(r),m(e,t,n,r,i)}if(ue(r)||se(r))return e=e.get(n)||null,d(t,e,r,i,null);if(typeof r.then==`function`)return m(e,t,n,Va(r),i);if(r.$$typeof===S)return m(e,t,n,ua(t,r),i);Ua(t,r)}return null}function h(i,o,s,c){for(var l=null,u=null,d=o,h=o=0,g=null;d!==null&&h<s.length;h++){d.index>h?(g=d,d=null):g=d.sibling;var _=p(i,d,s[h],c);if(_===null){d===null&&(d=g);break}e&&d&&_.alternate===null&&t(i,d),o=a(_,o,h),u===null?l=_:u.sibling=_,u=_,d=g}if(h===s.length)return n(i,d),j&&Li(i,h),l;if(d===null){for(;h<s.length;h++)d=f(i,s[h],c),d!==null&&(o=a(d,o,h),u===null?l=d:u.sibling=d,u=d);return j&&Li(i,h),l}for(d=r(d);h<s.length;h++)g=m(d,i,h,s[h],c),g!==null&&(e&&g.alternate!==null&&d.delete(g.key===null?h:g.key),o=a(g,o,h),u===null?l=g:u.sibling=g,u=g);return e&&d.forEach(function(e){return t(i,e)}),j&&Li(i,h),l}function g(i,o,c,l){if(c==null)throw Error(s(151));for(var u=null,d=null,h=o,g=o=0,_=null,v=c.next();h!==null&&!v.done;g++,v=c.next()){h.index>g?(_=h,h=null):_=h.sibling;var y=p(i,h,v.value,l);if(y===null){h===null&&(h=_);break}e&&h&&y.alternate===null&&t(i,h),o=a(y,o,g),d===null?u=y:d.sibling=y,d=y,h=_}if(v.done)return n(i,h),j&&Li(i,g),u;if(h===null){for(;!v.done;g++,v=c.next())v=f(i,v.value,l),v!==null&&(o=a(v,o,g),d===null?u=v:d.sibling=v,d=v);return j&&Li(i,g),u}for(h=r(h);!v.done;g++,v=c.next())v=m(h,i,g,v.value,l),v!==null&&(e&&v.alternate!==null&&h.delete(v.key===null?g:v.key),o=a(v,o,g),d===null?u=v:d.sibling=v,d=v);return e&&h.forEach(function(e){return t(i,e)}),j&&Li(i,g),u}function b(e,r,a,c){if(typeof a==`object`&&a&&a.type===y&&a.key===null&&(a=a.props.children),typeof a==`object`&&a){switch(a.$$typeof){case _:a:{for(var l=a.key;r!==null;){if(r.key===l){if(l=a.type,l===y){if(r.tag===7){n(e,r.sibling),c=i(r,a.props.children),c.return=e,e=c;break a}}else if(r.elementType===l||typeof l==`object`&&l&&l.$$typeof===w&&Fa(l)===r.type){n(e,r.sibling),c=i(r,a.props),Ha(c,a),c.return=e,e=c;break a}n(e,r);break}else t(e,r);r=r.sibling}a.type===y?(c=Si(a.props.children,e.mode,c,a.key),c.return=e,e=c):(c=xi(a.type,a.key,a.props,null,e.mode,c),Ha(c,a),c.return=e,e=c)}return o(e);case v:a:{for(l=a.key;r!==null;){if(r.key===l)if(r.tag===4&&r.stateNode.containerInfo===a.containerInfo&&r.stateNode.implementation===a.implementation){n(e,r.sibling),c=i(r,a.children||[]),c.return=e,e=c;break a}else{n(e,r);break}else t(e,r);r=r.sibling}c=Ti(a,e.mode,c),c.return=e,e=c}return o(e);case w:return a=Fa(a),b(e,r,a,c)}if(ue(a))return h(e,r,a,c);if(se(a)){if(l=se(a),typeof l!=`function`)throw Error(s(150));return a=l.call(a),g(e,r,a,c)}if(typeof a.then==`function`)return b(e,r,Va(a),c);if(a.$$typeof===S)return b(e,r,ua(e,a),c);Ua(e,a)}return typeof a==`string`&&a!==``||typeof a==`number`||typeof a==`bigint`?(a=``+a,r!==null&&r.tag===6?(n(e,r.sibling),c=i(r,a),c.return=e,e=c):(n(e,r),c=Ci(a,e.mode,c),c.return=e,e=c),o(e)):n(e,r)}return function(e,t,n,r){try{Ba=0;var i=b(e,t,n,r);return za=null,i}catch(t){if(t===ka||t===ja)throw t;var a=_i(29,t,null,e.mode);return a.lanes=r,a.return=e,a}}}var Ga=Wa(!0),Ka=Wa(!1),qa=!1;function Ja(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Ya(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Xa(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Za(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,W&2){var i=r.pending;return i===null?t.next=t:(t.next=i.next,i.next=t),r.pending=t,t=mi(e),pi(e,null,n),t}return ui(e,r,t,n),mi(e)}function Qa(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,n&4194048)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,lt(e,n)}}function $a(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var o={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?i=a=o:a=a.next=o,n=n.next}while(n!==null);a===null?i=a=t:a=a.next=t}else i=a=t;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:a,shared:r.shared,callbacks:r.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var eo=!1;function to(){if(eo){var e=ba;if(e!==null)throw e}}function no(e,t,n,r){eo=!1;var i=e.updateQueue;qa=!1;var a=i.firstBaseUpdate,o=i.lastBaseUpdate,s=i.shared.pending;if(s!==null){i.shared.pending=null;var c=s,l=c.next;c.next=null,o===null?a=l:o.next=l,o=c;var u=e.alternate;u!==null&&(u=u.updateQueue,s=u.lastBaseUpdate,s!==o&&(s===null?u.firstBaseUpdate=l:s.next=l,u.lastBaseUpdate=c))}if(a!==null){var d=i.baseState;o=0,u=l=c=null,s=a;do{var f=s.lane&-536870913,p=f!==s.lane;if(p?(q&f)===f:(r&f)===f){f!==0&&f===ya&&(eo=!0),u!==null&&(u=u.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});a:{var m=e,g=s;f=t;var _=n;switch(g.tag){case 1:if(m=g.payload,typeof m==`function`){d=m.call(_,d,f);break a}d=m;break a;case 3:m.flags=m.flags&-65537|128;case 0:if(m=g.payload,f=typeof m==`function`?m.call(_,d,f):m,f==null)break a;d=h({},d,f);break a;case 2:qa=!0}}f=s.callback,f!==null&&(e.flags|=64,p&&(e.flags|=8192),p=i.callbacks,p===null?i.callbacks=[f]:p.push(f))}else p={lane:f,tag:s.tag,payload:s.payload,callback:s.callback,next:null},u===null?(l=u=p,c=d):u=u.next=p,o|=f;if(s=s.next,s===null){if(s=i.shared.pending,s===null)break;p=s,s=p.next,p.next=null,i.lastBaseUpdate=p,i.shared.pending=null}}while(1);u===null&&(c=d),i.baseState=c,i.firstBaseUpdate=l,i.lastBaseUpdate=u,a===null&&(i.shared.lanes=0),Kl|=o,e.lanes=o,e.memoizedState=d}}function ro(e,t){if(typeof e!=`function`)throw Error(s(191,e));e.call(t)}function io(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)ro(n[e],t)}var ao=me(null),oo=me(0);function so(e,t){e=Gl,O(oo,e),O(ao,t),Gl=e|t.baseLanes}function co(){O(oo,Gl),O(ao,ao.current)}function lo(){Gl=oo.current,D(ao),D(oo)}var uo=me(null),fo=null;function po(e){var t=e.alternate;O(N,N.current&1),O(uo,e),fo===null&&(t===null||ao.current!==null||t.memoizedState!==null)&&(fo=e)}function mo(e){O(N,N.current),O(uo,e),fo===null&&(fo=e)}function ho(e){e.tag===22?(O(N,N.current),O(uo,e),fo===null&&(fo=e)):go(e)}function go(){O(N,N.current),O(uo,uo.current)}function _o(e){D(uo),fo===e&&(fo=null),D(N)}var N=me(0);function vo(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||af(n)||of(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder===`forwards`||t.memoizedProps.revealOrder===`backwards`||t.memoizedProps.revealOrder===`unstable_legacy-backwards`||t.memoizedProps.revealOrder===`together`)){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var yo=0,P=null,F=null,I=null,bo=!1,xo=!1,So=!1,Co=0,wo=0,To=null,Eo=0;function L(){throw Error(s(321))}function Do(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!jr(e[n],t[n]))return!1;return!0}function Oo(e,t,n,r,i,a){return yo=a,P=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,T.H=e===null||e.memoizedState===null?Ws:Gs,So=!1,a=n(r,i),So=!1,xo&&(a=Ao(t,n,r,i)),ko(e),a}function ko(e){T.H=Us;var t=F!==null&&F.next!==null;if(yo=0,I=F=P=null,bo=!1,wo=0,To=null,t)throw Error(s(300));e===null||z||(e=e.dependencies,e!==null&&sa(e)&&(z=!0))}function Ao(e,t,n,r){P=e;var i=0;do{if(xo&&(To=null),wo=0,xo=!1,25<=i)throw Error(s(301));if(i+=1,I=F=null,e.updateQueue!=null){var a=e.updateQueue;a.lastEffect=null,a.events=null,a.stores=null,a.memoCache!=null&&(a.memoCache.index=0)}T.H=Ks,a=t(n,r)}while(xo);return a}function jo(){var e=T.H,t=e.useState()[0];return t=typeof t.then==`function`?Lo(t):t,e=e.useState()[0],(F===null?null:F.memoizedState)!==e&&(P.flags|=1024),t}function Mo(){var e=Co!==0;return Co=0,e}function No(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function Po(e){if(bo){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}bo=!1}yo=0,I=F=P=null,xo=!1,wo=Co=0,To=null}function Fo(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return I===null?P.memoizedState=I=e:I=I.next=e,I}function R(){if(F===null){var e=P.alternate;e=e===null?null:e.memoizedState}else e=F.next;var t=I===null?P.memoizedState:I.next;if(t!==null)I=t,F=e;else{if(e===null)throw P.alternate===null?Error(s(467)):Error(s(310));F=e,e={memoizedState:F.memoizedState,baseState:F.baseState,baseQueue:F.baseQueue,queue:F.queue,next:null},I===null?P.memoizedState=I=e:I=I.next=e}return I}function Io(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Lo(e){var t=wo;return wo+=1,To===null&&(To=[]),e=Pa(To,e,t),t=P,(I===null?t.memoizedState:I.next)===null&&(t=t.alternate,T.H=t===null||t.memoizedState===null?Ws:Gs),e}function Ro(e){if(typeof e==`object`&&e){if(typeof e.then==`function`)return Lo(e);if(e.$$typeof===S)return la(e)}throw Error(s(438,String(e)))}function zo(e){var t=null,n=P.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var r=P.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(t={data:r.data.map(function(e){return e.slice()}),index:0})))}if(t??={data:[],index:0},n===null&&(n=Io(),P.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),r=0;r<e;r++)n[r]=ae;return t.index++,n}function Bo(e,t){return typeof t==`function`?t(e):t}function Vo(e){return Ho(R(),F,e)}function Ho(e,t,n){var r=e.queue;if(r===null)throw Error(s(311));r.lastRenderedReducer=n;var i=e.baseQueue,a=r.pending;if(a!==null){if(i!==null){var o=i.next;i.next=a.next,a.next=o}t.baseQueue=i=a,r.pending=null}if(a=e.baseState,i===null)e.memoizedState=a;else{t=i.next;var c=o=null,l=null,u=t,d=!1;do{var f=u.lane&-536870913;if(f===u.lane?(yo&f)===f:(q&f)===f){var p=u.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),f===ya&&(d=!0);else if((yo&p)===p){u=u.next,p===ya&&(d=!0);continue}else f={lane:0,revertLane:u.revertLane,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=f,o=a):l=l.next=f,P.lanes|=p,Kl|=p;f=u.action,So&&n(a,f),a=u.hasEagerState?u.eagerState:n(a,f)}else p={lane:f,revertLane:u.revertLane,gesture:u.gesture,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=p,o=a):l=l.next=p,P.lanes|=f,Kl|=f;u=u.next}while(u!==null&&u!==t);if(l===null?o=a:l.next=c,!jr(a,e.memoizedState)&&(z=!0,d&&(n=ba,n!==null)))throw n;e.memoizedState=a,e.baseState=o,e.baseQueue=l,r.lastRenderedState=a}return i===null&&(r.lanes=0),[e.memoizedState,r.dispatch]}function Uo(e){var t=R(),n=t.queue;if(n===null)throw Error(s(311));n.lastRenderedReducer=e;var r=n.dispatch,i=n.pending,a=t.memoizedState;if(i!==null){n.pending=null;var o=i=i.next;do a=e(a,o.action),o=o.next;while(o!==i);jr(a,t.memoizedState)||(z=!0),t.memoizedState=a,t.baseQueue===null&&(t.baseState=a),n.lastRenderedState=a}return[a,r]}function Wo(e,t,n){var r=P,i=R(),a=j;if(a){if(n===void 0)throw Error(s(407));n=n()}else n=t();var o=!jr((F||i).memoizedState,n);if(o&&(i.memoizedState=n,z=!0),i=i.queue,hs(qo.bind(null,r,i,e),[e]),i.getSnapshot!==t||o||I!==null&&I.memoizedState.tag&1){if(r.flags|=2048,us(9,{destroy:void 0},Ko.bind(null,r,i,n,t),null),G===null)throw Error(s(349));a||yo&127||Go(r,t,n)}return n}function Go(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=P.updateQueue,t===null?(t=Io(),P.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Ko(e,t,n,r){t.value=n,t.getSnapshot=r,Jo(t)&&Yo(e)}function qo(e,t,n){return n(function(){Jo(t)&&Yo(e)})}function Jo(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!jr(e,n)}catch{return!0}}function Yo(e){var t=fi(e,2);t!==null&&hu(t,e,2)}function Xo(e){var t=Fo();if(typeof e==`function`){var n=e;if(e=n(),So){Ke(!0);try{n()}finally{Ke(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Bo,lastRenderedState:e},t}function Zo(e,t,n,r){return e.baseState=n,Ho(e,F,typeof r==`function`?r:Bo)}function Qo(e,t,n,r,i){if(Bs(e))throw Error(s(485));if(e=t.action,e!==null){var a={payload:i,action:e,next:null,isTransition:!0,status:`pending`,value:null,reason:null,listeners:[],then:function(e){a.listeners.push(e)}};T.T===null?a.isTransition=!1:n(!0),r(a),n=t.pending,n===null?(a.next=t.pending=a,$o(t,a)):(a.next=n.next,t.pending=n.next=a)}}function $o(e,t){var n=t.action,r=t.payload,i=e.state;if(t.isTransition){var a=T.T,o={};T.T=o;try{var s=n(i,r),c=T.S;c!==null&&c(o,s),es(e,t,s)}catch(n){ns(e,t,n)}finally{a!==null&&o.types!==null&&(a.types=o.types),T.T=a}}else try{a=n(i,r),es(e,t,a)}catch(n){ns(e,t,n)}}function es(e,t,n){typeof n==`object`&&n&&typeof n.then==`function`?n.then(function(n){ts(e,t,n)},function(n){return ns(e,t,n)}):ts(e,t,n)}function ts(e,t,n){t.status=`fulfilled`,t.value=n,rs(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,$o(e,n)))}function ns(e,t,n){var r=e.pending;if(e.pending=null,r!==null){r=r.next;do t.status=`rejected`,t.reason=n,rs(t),t=t.next;while(t!==r)}e.action=null}function rs(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function is(e,t){return t}function as(e,t){if(j){var n=G.formState;if(n!==null){a:{var r=P;if(j){if(A){b:{for(var i=A,a=Wi;i.nodeType!==8;){if(!a){i=null;break b}if(i=cf(i.nextSibling),i===null){i=null;break b}}a=i.data,i=a===`F!`||a===`F`?i:null}if(i){A=cf(i.nextSibling),r=i.data===`F!`;break a}}Ki(r)}r=!1}r&&(t=n[0])}}return n=Fo(),n.memoizedState=n.baseState=t,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:is,lastRenderedState:t},n.queue=r,n=Ls.bind(null,P,r),r.dispatch=n,r=Xo(!1),a=zs.bind(null,P,!1,r.queue),r=Fo(),i={state:t,dispatch:null,action:e,pending:null},r.queue=i,n=Qo.bind(null,P,i,a,n),i.dispatch=n,r.memoizedState=e,[t,n,!1]}function os(e){return ss(R(),F,e)}function ss(e,t,n){if(t=Ho(e,t,is)[0],e=Vo(Bo)[0],typeof t==`object`&&t&&typeof t.then==`function`)try{var r=Lo(t)}catch(e){throw e===ka?ja:e}else r=t;t=R();var i=t.queue,a=i.dispatch;return n!==t.memoizedState&&(P.flags|=2048,us(9,{destroy:void 0},cs.bind(null,i,n),null)),[r,a,e]}function cs(e,t){e.action=t}function ls(e){var t=R(),n=F;if(n!==null)return ss(t,n,e);R(),t=t.memoizedState,n=R();var r=n.queue.dispatch;return n.memoizedState=e,[t,r,!1]}function us(e,t,n,r){return e={tag:e,create:n,deps:r,inst:t,next:null},t=P.updateQueue,t===null&&(t=Io(),P.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e),e}function ds(){return R().memoizedState}function fs(e,t,n,r){var i=Fo();P.flags|=e,i.memoizedState=us(1|t,{destroy:void 0},n,r===void 0?null:r)}function ps(e,t,n,r){var i=R();r=r===void 0?null:r;var a=i.memoizedState.inst;F!==null&&r!==null&&Do(r,F.memoizedState.deps)?i.memoizedState=us(t,a,n,r):(P.flags|=e,i.memoizedState=us(1|t,a,n,r))}function ms(e,t){fs(8390656,8,e,t)}function hs(e,t){ps(2048,8,e,t)}function gs(e){P.flags|=4;var t=P.updateQueue;if(t===null)t=Io(),P.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function _s(e){var t=R().memoizedState;return gs({ref:t,nextImpl:e}),function(){if(W&2)throw Error(s(440));return t.impl.apply(void 0,arguments)}}function vs(e,t){return ps(4,2,e,t)}function ys(e,t){return ps(4,4,e,t)}function bs(e,t){if(typeof t==`function`){e=e();var n=t(e);return function(){typeof n==`function`?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function xs(e,t,n){n=n==null?null:n.concat([e]),ps(4,4,bs.bind(null,t,e),n)}function Ss(){}function Cs(e,t){var n=R();t=t===void 0?null:t;var r=n.memoizedState;return t!==null&&Do(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function ws(e,t){var n=R();t=t===void 0?null:t;var r=n.memoizedState;if(t!==null&&Do(t,r[1]))return r[0];if(r=e(),So){Ke(!0);try{e()}finally{Ke(!1)}}return n.memoizedState=[r,t],r}function Ts(e,t,n){return n===void 0||yo&1073741824&&!(q&261930)?e.memoizedState=t:(e.memoizedState=n,e=mu(),P.lanes|=e,Kl|=e,n)}function Es(e,t,n,r){return jr(n,t)?n:ao.current===null?!(yo&42)||yo&1073741824&&!(q&261930)?(z=!0,e.memoizedState=n):(e=mu(),P.lanes|=e,Kl|=e,t):(e=Ts(e,n,r),jr(e,t)||(z=!0),e)}function Ds(e,t,n,r,i){var a=E.p;E.p=a!==0&&8>a?a:8;var o=T.T,s={};T.T=s,zs(e,!1,t,n);try{var c=i(),l=T.S;l!==null&&l(s,c),typeof c==`object`&&c&&typeof c.then==`function`?Rs(e,t,Ca(c,r),pu(e)):Rs(e,t,r,pu(e))}catch(n){Rs(e,t,{then:function(){},status:`rejected`,reason:n},pu())}finally{E.p=a,o!==null&&s.types!==null&&(o.types=s.types),T.T=o}}function Os(){}function ks(e,t,n,r){if(e.tag!==5)throw Error(s(476));var i=As(e).queue;Ds(e,i,t,de,n===null?Os:function(){return js(e),n(r)})}function As(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:de,baseState:de,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Bo,lastRenderedState:de},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Bo,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function js(e){var t=As(e);t.next===null&&(t=e.alternate.memoizedState),Rs(e,t.next.queue,{},pu())}function Ms(){return la(Qf)}function Ns(){return R().memoizedState}function Ps(){return R().memoizedState}function Fs(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=pu();e=Xa(n);var r=Za(t,e,n);r!==null&&(hu(r,t,n),Qa(r,t,n)),t={cache:ha()},e.payload=t;return}t=t.return}}function Is(e,t,n){var r=pu();n={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Bs(e)?Vs(t,n):(n=di(e,t,n,r),n!==null&&(hu(n,e,r),Hs(n,t,r)))}function Ls(e,t,n){Rs(e,t,n,pu())}function Rs(e,t,n,r){var i={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Bs(e))Vs(t,i);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var o=t.lastRenderedState,s=a(o,n);if(i.hasEagerState=!0,i.eagerState=s,jr(s,o))return ui(e,t,i,0),G===null&&li(),!1}catch{}if(n=di(e,t,i,r),n!==null)return hu(n,e,r),Hs(n,t,r),!0}return!1}function zs(e,t,n,r){if(r={lane:2,revertLane:dd(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},Bs(e)){if(t)throw Error(s(479))}else t=di(e,n,r,2),t!==null&&hu(t,e,2)}function Bs(e){var t=e.alternate;return e===P||t!==null&&t===P}function Vs(e,t){xo=bo=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Hs(e,t,n){if(n&4194048){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,lt(e,n)}}var Us={readContext:la,use:Ro,useCallback:L,useContext:L,useEffect:L,useImperativeHandle:L,useLayoutEffect:L,useInsertionEffect:L,useMemo:L,useReducer:L,useRef:L,useState:L,useDebugValue:L,useDeferredValue:L,useTransition:L,useSyncExternalStore:L,useId:L,useHostTransitionStatus:L,useFormState:L,useActionState:L,useOptimistic:L,useMemoCache:L,useCacheRefresh:L};Us.useEffectEvent=L;var Ws={readContext:la,use:Ro,useCallback:function(e,t){return Fo().memoizedState=[e,t===void 0?null:t],e},useContext:la,useEffect:ms,useImperativeHandle:function(e,t,n){n=n==null?null:n.concat([e]),fs(4194308,4,bs.bind(null,t,e),n)},useLayoutEffect:function(e,t){return fs(4194308,4,e,t)},useInsertionEffect:function(e,t){fs(4,2,e,t)},useMemo:function(e,t){var n=Fo();t=t===void 0?null:t;var r=e();if(So){Ke(!0);try{e()}finally{Ke(!1)}}return n.memoizedState=[r,t],r},useReducer:function(e,t,n){var r=Fo();if(n!==void 0){var i=n(t);if(So){Ke(!0);try{n(t)}finally{Ke(!1)}}}else i=t;return r.memoizedState=r.baseState=i,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:i},r.queue=e,e=e.dispatch=Is.bind(null,P,e),[r.memoizedState,e]},useRef:function(e){var t=Fo();return e={current:e},t.memoizedState=e},useState:function(e){e=Xo(e);var t=e.queue,n=Ls.bind(null,P,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:Ss,useDeferredValue:function(e,t){return Ts(Fo(),e,t)},useTransition:function(){var e=Xo(!1);return e=Ds.bind(null,P,e.queue,!0,!1),Fo().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var r=P,i=Fo();if(j){if(n===void 0)throw Error(s(407));n=n()}else{if(n=t(),G===null)throw Error(s(349));q&127||Go(r,t,n)}i.memoizedState=n;var a={value:n,getSnapshot:t};return i.queue=a,ms(qo.bind(null,r,a,e),[e]),r.flags|=2048,us(9,{destroy:void 0},Ko.bind(null,r,a,n,t),null),n},useId:function(){var e=Fo(),t=G.identifierPrefix;if(j){var n=Ii,r=Fi;n=(r&~(1<<32-qe(r)-1)).toString(32)+n,t=`_`+t+`R_`+n,n=Co++,0<n&&(t+=`H`+n.toString(32)),t+=`_`}else n=Eo++,t=`_`+t+`r_`+n.toString(32)+`_`;return e.memoizedState=t},useHostTransitionStatus:Ms,useFormState:as,useActionState:as,useOptimistic:function(e){var t=Fo();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=zs.bind(null,P,!0,n),n.dispatch=t,[e,t]},useMemoCache:zo,useCacheRefresh:function(){return Fo().memoizedState=Fs.bind(null,P)},useEffectEvent:function(e){var t=Fo(),n={impl:e};return t.memoizedState=n,function(){if(W&2)throw Error(s(440));return n.impl.apply(void 0,arguments)}}},Gs={readContext:la,use:Ro,useCallback:Cs,useContext:la,useEffect:hs,useImperativeHandle:xs,useInsertionEffect:vs,useLayoutEffect:ys,useMemo:ws,useReducer:Vo,useRef:ds,useState:function(){return Vo(Bo)},useDebugValue:Ss,useDeferredValue:function(e,t){return Es(R(),F.memoizedState,e,t)},useTransition:function(){var e=Vo(Bo)[0],t=R().memoizedState;return[typeof e==`boolean`?e:Lo(e),t]},useSyncExternalStore:Wo,useId:Ns,useHostTransitionStatus:Ms,useFormState:os,useActionState:os,useOptimistic:function(e,t){return Zo(R(),F,e,t)},useMemoCache:zo,useCacheRefresh:Ps};Gs.useEffectEvent=_s;var Ks={readContext:la,use:Ro,useCallback:Cs,useContext:la,useEffect:hs,useImperativeHandle:xs,useInsertionEffect:vs,useLayoutEffect:ys,useMemo:ws,useReducer:Uo,useRef:ds,useState:function(){return Uo(Bo)},useDebugValue:Ss,useDeferredValue:function(e,t){var n=R();return F===null?Ts(n,e,t):Es(n,F.memoizedState,e,t)},useTransition:function(){var e=Uo(Bo)[0],t=R().memoizedState;return[typeof e==`boolean`?e:Lo(e),t]},useSyncExternalStore:Wo,useId:Ns,useHostTransitionStatus:Ms,useFormState:ls,useActionState:ls,useOptimistic:function(e,t){var n=R();return F===null?(n.baseState=e,[e,n.queue.dispatch]):Zo(n,F,e,t)},useMemoCache:zo,useCacheRefresh:Ps};Ks.useEffectEvent=_s;function qs(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:h({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Js={enqueueSetState:function(e,t,n){e=e._reactInternals;var r=pu(),i=Xa(r);i.payload=t,n!=null&&(i.callback=n),t=Za(e,i,r),t!==null&&(hu(t,e,r),Qa(t,e,r))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=pu(),i=Xa(r);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=Za(e,i,r),t!==null&&(hu(t,e,r),Qa(t,e,r))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=pu(),r=Xa(n);r.tag=2,t!=null&&(r.callback=t),t=Za(e,r,n),t!==null&&(hu(t,e,n),Qa(t,e,n))}};function Ys(e,t,n,r,i,a,o){return e=e.stateNode,typeof e.shouldComponentUpdate==`function`?e.shouldComponentUpdate(r,a,o):t.prototype&&t.prototype.isPureReactComponent?!Mr(n,r)||!Mr(i,a):!0}function Xs(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps==`function`&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps==`function`&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Js.enqueueReplaceState(t,t.state,null)}function Zs(e,t){var n=t;if(`ref`in t)for(var r in n={},t)r!==`ref`&&(n[r]=t[r]);if(e=e.defaultProps)for(var i in n===t&&(n=h({},n)),e)n[i]===void 0&&(n[i]=e[i]);return n}function Qs(e){ai(e)}function $s(e){console.error(e)}function ec(e){ai(e)}function tc(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(e){setTimeout(function(){throw e})}}function nc(e,t,n){try{var r=e.onCaughtError;r(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(e){setTimeout(function(){throw e})}}function rc(e,t,n){return n=Xa(n),n.tag=3,n.payload={element:null},n.callback=function(){tc(e,t)},n}function ic(e){return e=Xa(e),e.tag=3,e}function ac(e,t,n,r){var i=n.type.getDerivedStateFromError;if(typeof i==`function`){var a=r.value;e.payload=function(){return i(a)},e.callback=function(){nc(t,n,r)}}var o=n.stateNode;o!==null&&typeof o.componentDidCatch==`function`&&(e.callback=function(){nc(t,n,r),typeof i!=`function`&&(iu===null?iu=new Set([this]):iu.add(this));var e=r.stack;this.componentDidCatch(r.value,{componentStack:e===null?``:e})})}function oc(e,t,n,r,i){if(n.flags|=32768,typeof r==`object`&&r&&typeof r.then==`function`){if(t=n.alternate,t!==null&&oa(t,n,i,!0),n=uo.current,n!==null){switch(n.tag){case 31:case 13:return fo===null?Du():n.alternate===null&&Y===0&&(Y=3),n.flags&=-257,n.flags|=65536,n.lanes=i,r===Ma?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([r]):t.add(r),Gu(e,r,i)),!1;case 22:return n.flags|=65536,r===Ma?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([r])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([r]):n.add(r)),Gu(e,r,i)),!1}throw Error(s(435,n.tag))}return Gu(e,r,i),Du(),!1}if(j)return t=uo.current,t===null?(r!==Gi&&(t=Error(s(423),{cause:r}),Qi(Di(t,n))),e=e.current.alternate,e.flags|=65536,i&=-i,e.lanes|=i,r=Di(r,n),i=rc(e.stateNode,r,i),$a(e,i),Y!==4&&(Y=2)):(!(t.flags&65536)&&(t.flags|=256),t.flags|=65536,t.lanes=i,r!==Gi&&(e=Error(s(422),{cause:r}),Qi(Di(e,n)))),!1;var a=Error(s(520),{cause:r});if(a=Di(a,n),Zl===null?Zl=[a]:Zl.push(a),Y!==4&&(Y=2),t===null)return!0;r=Di(r,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=i&-i,n.lanes|=e,e=rc(n.stateNode,r,e),$a(n,e),!1;case 1:if(t=n.type,a=n.stateNode,!(n.flags&128)&&(typeof t.getDerivedStateFromError==`function`||a!==null&&typeof a.componentDidCatch==`function`&&(iu===null||!iu.has(a))))return n.flags|=65536,i&=-i,n.lanes|=i,i=ic(i),ac(i,e,n,r),$a(n,i),!1}n=n.return}while(n!==null);return!1}var sc=Error(s(461)),z=!1;function cc(e,t,n,r){t.child=e===null?Ka(t,null,n,r):Ga(t,e.child,n,r)}function lc(e,t,n,r,i){n=n.render;var a=t.ref;if(`ref`in r){var o={};for(var s in r)s!==`ref`&&(o[s]=r[s])}else o=r;return ca(t),r=Oo(e,t,n,o,a,i),s=Mo(),e!==null&&!z?(No(e,t,i),Nc(e,t,i)):(j&&s&&zi(t),t.flags|=1,cc(e,t,r,i),t.child)}function uc(e,t,n,r,i){if(e===null){var a=n.type;return typeof a==`function`&&!vi(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,dc(e,t,a,r,i)):(e=xi(n.type,null,r,t,t.mode,i),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!Pc(e,i)){var o=a.memoizedProps;if(n=n.compare,n=n===null?Mr:n,n(o,r)&&e.ref===t.ref)return Nc(e,t,i)}return t.flags|=1,e=yi(a,r),e.ref=t.ref,e.return=t,t.child=e}function dc(e,t,n,r,i){if(e!==null){var a=e.memoizedProps;if(Mr(a,r)&&e.ref===t.ref)if(z=!1,t.pendingProps=r=a,Pc(e,i))e.flags&131072&&(z=!0);else return t.lanes=e.lanes,Nc(e,t,i)}return yc(e,t,n,r,i)}function fc(e,t,n,r){var i=r.children,a=e===null?null:e.memoizedState;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode===`hidden`){if(t.flags&128){if(a=a===null?n:a.baseLanes|n,e!==null){for(r=t.child=e.child,i=0;r!==null;)i=i|r.lanes|r.childLanes,r=r.sibling;r=i&~a}else r=0,t.child=null;return mc(e,t,a,n,r)}if(n&536870912)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Da(t,a===null?null:a.cachePool),a===null?co():so(t,a),ho(t);else return r=t.lanes=536870912,mc(e,t,a===null?n:a.baseLanes|n,n,r)}else a===null?(e!==null&&Da(t,null),co(),go(t)):(Da(t,a.cachePool),so(t,a),go(t),t.memoizedState=null);return cc(e,t,i,n),t.child}function pc(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function mc(e,t,n,r,i){var a=Ea();return a=a===null?null:{parent:M._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&Da(t,null),co(),ho(t),e!==null&&oa(e,t,r,!0),t.childLanes=i,null}function hc(e,t){return t=Oc({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function gc(e,t,n){return Ga(t,e.child,null,n),e=hc(t,t.pendingProps),e.flags|=2,_o(t),t.memoizedState=null,e}function _c(e,t,n){var r=t.pendingProps,i=(t.flags&128)!=0;if(t.flags&=-129,e===null){if(j){if(r.mode===`hidden`)return e=hc(t,r),t.lanes=536870912,pc(null,e);if(mo(t),(e=A)?(e=rf(e,Wi),e=e!==null&&e.data===`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Pi===null?null:{id:Fi,overflow:Ii},retryLane:536870912,hydrationErrors:null},n=wi(e),n.return=t,t.child=n,Hi=t,A=null)):e=null,e===null)throw Ki(t);return t.lanes=536870912,null}return hc(t,r)}var a=e.memoizedState;if(a!==null){var o=a.dehydrated;if(mo(t),i)if(t.flags&256)t.flags&=-257,t=gc(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(s(558));else if(z||oa(e,t,n,!1),i=(n&e.childLanes)!==0,z||i){if(r=G,r!==null&&(o=ut(r,n),o!==0&&o!==a.retryLane))throw a.retryLane=o,fi(e,o),hu(r,e,o),sc;Du(),t=gc(e,t,n)}else e=a.treeContext,A=cf(o.nextSibling),Hi=t,j=!0,Ui=null,Wi=!1,e!==null&&Vi(t,e),t=hc(t,r),t.flags|=4096;return t}return e=yi(e.child,{mode:r.mode,children:r.children}),e.ref=t.ref,t.child=e,e.return=t,e}function vc(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!=`function`&&typeof n!=`object`)throw Error(s(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function yc(e,t,n,r,i){return ca(t),n=Oo(e,t,n,r,void 0,i),r=Mo(),e!==null&&!z?(No(e,t,i),Nc(e,t,i)):(j&&r&&zi(t),t.flags|=1,cc(e,t,n,i),t.child)}function bc(e,t,n,r,i,a){return ca(t),t.updateQueue=null,n=Ao(t,r,n,i),ko(e),r=Mo(),e!==null&&!z?(No(e,t,a),Nc(e,t,a)):(j&&r&&zi(t),t.flags|=1,cc(e,t,n,a),t.child)}function xc(e,t,n,r,i){if(ca(t),t.stateNode===null){var a=hi,o=n.contextType;typeof o==`object`&&o&&(a=la(o)),a=new n(r,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=Js,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=r,a.state=t.memoizedState,a.refs={},Ja(t),o=n.contextType,a.context=typeof o==`object`&&o?la(o):hi,a.state=t.memoizedState,o=n.getDerivedStateFromProps,typeof o==`function`&&(qs(t,n,o,r),a.state=t.memoizedState),typeof n.getDerivedStateFromProps==`function`||typeof a.getSnapshotBeforeUpdate==`function`||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(o=a.state,typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount(),o!==a.state&&Js.enqueueReplaceState(a,a.state,null),no(t,r,a,i),to(),a.state=t.memoizedState),typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!0}else if(e===null){a=t.stateNode;var s=t.memoizedProps,c=Zs(n,s);a.props=c;var l=a.context,u=n.contextType;o=hi,typeof u==`object`&&u&&(o=la(u));var d=n.getDerivedStateFromProps;u=typeof d==`function`||typeof a.getSnapshotBeforeUpdate==`function`,s=t.pendingProps!==s,u||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(s||l!==o)&&Xs(t,a,r,o),qa=!1;var f=t.memoizedState;a.state=f,no(t,r,a,i),to(),l=t.memoizedState,s||f!==l||qa?(typeof d==`function`&&(qs(t,n,d,r),l=t.memoizedState),(c=qa||Ys(t,n,c,r,f,l,o))?(u||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount==`function`&&(t.flags|=4194308)):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=l),a.props=r,a.state=l,a.context=o,r=c):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!1)}else{a=t.stateNode,Ya(e,t),o=t.memoizedProps,u=Zs(n,o),a.props=u,d=t.pendingProps,f=a.context,l=n.contextType,c=hi,typeof l==`object`&&l&&(c=la(l)),s=n.getDerivedStateFromProps,(l=typeof s==`function`||typeof a.getSnapshotBeforeUpdate==`function`)||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(o!==d||f!==c)&&Xs(t,a,r,c),qa=!1,f=t.memoizedState,a.state=f,no(t,r,a,i),to();var p=t.memoizedState;o!==d||f!==p||qa||e!==null&&e.dependencies!==null&&sa(e.dependencies)?(typeof s==`function`&&(qs(t,n,s,r),p=t.memoizedState),(u=qa||Ys(t,n,u,r,f,p,c)||e!==null&&e.dependencies!==null&&sa(e.dependencies))?(l||typeof a.UNSAFE_componentWillUpdate!=`function`&&typeof a.componentWillUpdate!=`function`||(typeof a.componentWillUpdate==`function`&&a.componentWillUpdate(r,p,c),typeof a.UNSAFE_componentWillUpdate==`function`&&a.UNSAFE_componentWillUpdate(r,p,c)),typeof a.componentDidUpdate==`function`&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate==`function`&&(t.flags|=1024)):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=p),a.props=r,a.state=p,a.context=c,r=u):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),r=!1)}return a=r,vc(e,t),r=(t.flags&128)!=0,a||r?(a=t.stateNode,n=r&&typeof n.getDerivedStateFromError!=`function`?null:a.render(),t.flags|=1,e!==null&&r?(t.child=Ga(t,e.child,null,i),t.child=Ga(t,null,n,i)):cc(e,t,n,i),t.memoizedState=a.state,e=t.child):e=Nc(e,t,i),e}function Sc(e,t,n,r){return Xi(),t.flags|=256,cc(e,t,n,r),t.child}var Cc={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function wc(e){return{baseLanes:e,cachePool:Oa()}}function Tc(e,t,n){return e=e===null?0:e.childLanes&~n,t&&(e|=Yl),e}function Ec(e,t,n){var r=t.pendingProps,i=!1,a=(t.flags&128)!=0,o;if((o=a)||(o=e!==null&&e.memoizedState===null?!1:(N.current&2)!=0),o&&(i=!0,t.flags&=-129),o=(t.flags&32)!=0,t.flags&=-33,e===null){if(j){if(i?po(t):go(t),(e=A)?(e=rf(e,Wi),e=e!==null&&e.data!==`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Pi===null?null:{id:Fi,overflow:Ii},retryLane:536870912,hydrationErrors:null},n=wi(e),n.return=t,t.child=n,Hi=t,A=null)):e=null,e===null)throw Ki(t);return of(e)?t.lanes=32:t.lanes=536870912,null}var c=r.children;return r=r.fallback,i?(go(t),i=t.mode,c=Oc({mode:`hidden`,children:c},i),r=Si(r,i,n,null),c.return=t,r.return=t,c.sibling=r,t.child=c,r=t.child,r.memoizedState=wc(n),r.childLanes=Tc(e,o,n),t.memoizedState=Cc,pc(null,r)):(po(t),Dc(t,c))}var l=e.memoizedState;if(l!==null&&(c=l.dehydrated,c!==null)){if(a)t.flags&256?(po(t),t.flags&=-257,t=kc(e,t,n)):t.memoizedState===null?(go(t),c=r.fallback,i=t.mode,r=Oc({mode:`visible`,children:r.children},i),c=Si(c,i,n,null),c.flags|=2,r.return=t,c.return=t,r.sibling=c,t.child=r,Ga(t,e.child,null,n),r=t.child,r.memoizedState=wc(n),r.childLanes=Tc(e,o,n),t.memoizedState=Cc,t=pc(null,r)):(go(t),t.child=e.child,t.flags|=128,t=null);else if(po(t),of(c)){if(o=c.nextSibling&&c.nextSibling.dataset,o)var u=o.dgst;o=u,r=Error(s(419)),r.stack=``,r.digest=o,Qi({value:r,source:null,stack:null}),t=kc(e,t,n)}else if(z||oa(e,t,n,!1),o=(n&e.childLanes)!==0,z||o){if(o=G,o!==null&&(r=ut(o,n),r!==0&&r!==l.retryLane))throw l.retryLane=r,fi(e,r),hu(o,e,r),sc;af(c)||Du(),t=kc(e,t,n)}else af(c)?(t.flags|=192,t.child=e.child,t=null):(e=l.treeContext,A=cf(c.nextSibling),Hi=t,j=!0,Ui=null,Wi=!1,e!==null&&Vi(t,e),t=Dc(t,r.children),t.flags|=4096);return t}return i?(go(t),c=r.fallback,i=t.mode,l=e.child,u=l.sibling,r=yi(l,{mode:`hidden`,children:r.children}),r.subtreeFlags=l.subtreeFlags&65011712,u===null?(c=Si(c,i,n,null),c.flags|=2):c=yi(u,c),c.return=t,r.return=t,r.sibling=c,t.child=r,pc(null,r),r=t.child,c=e.child.memoizedState,c===null?c=wc(n):(i=c.cachePool,i===null?i=Oa():(l=M._currentValue,i=i.parent===l?i:{parent:l,pool:l}),c={baseLanes:c.baseLanes|n,cachePool:i}),r.memoizedState=c,r.childLanes=Tc(e,o,n),t.memoizedState=Cc,pc(e.child,r)):(po(t),n=e.child,e=n.sibling,n=yi(n,{mode:`visible`,children:r.children}),n.return=t,n.sibling=null,e!==null&&(o=t.deletions,o===null?(t.deletions=[e],t.flags|=16):o.push(e)),t.child=n,t.memoizedState=null,n)}function Dc(e,t){return t=Oc({mode:`visible`,children:t},e.mode),t.return=e,e.child=t}function Oc(e,t){return e=_i(22,e,null,t),e.lanes=0,e}function kc(e,t,n){return Ga(t,e.child,null,n),e=Dc(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Ac(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),ia(e.return,t,n)}function jc(e,t,n,r,i,a){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i,treeForkCount:a}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=r,o.tail=n,o.tailMode=i,o.treeForkCount=a)}function Mc(e,t,n){var r=t.pendingProps,i=r.revealOrder,a=r.tail;r=r.children;var o=N.current,s=(o&2)!=0;if(s?(o=o&1|2,t.flags|=128):o&=1,O(N,o),cc(e,t,r,n),r=j?ji:0,!s&&e!==null&&e.flags&128)a:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Ac(e,n,t);else if(e.tag===19)Ac(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break a;for(;e.sibling===null;){if(e.return===null||e.return===t)break a;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(i){case`forwards`:for(n=t.child,i=null;n!==null;)e=n.alternate,e!==null&&vo(e)===null&&(i=n),n=n.sibling;n=i,n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null),jc(t,!1,i,n,a,r);break;case`backwards`:case`unstable_legacy-backwards`:for(n=null,i=t.child,t.child=null;i!==null;){if(e=i.alternate,e!==null&&vo(e)===null){t.child=i;break}e=i.sibling,i.sibling=n,n=i,i=e}jc(t,!0,n,null,a,r);break;case`together`:jc(t,!1,null,null,void 0,r);break;default:t.memoizedState=null}return t.child}function Nc(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Kl|=t.lanes,(n&t.childLanes)===0)if(e!==null){if(oa(e,t,n,!1),(n&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(s(153));if(t.child!==null){for(e=t.child,n=yi(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=yi(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Pc(e,t){return(e.lanes&t)===0?(e=e.dependencies,!!(e!==null&&sa(e))):!0}function Fc(e,t,n){switch(t.tag){case 3:ye(t,t.stateNode.containerInfo),na(t,M,e.memoizedState.cache),Xi();break;case 27:case 5:xe(t);break;case 4:ye(t,t.stateNode.containerInfo);break;case 10:na(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,mo(t),null;break;case 13:var r=t.memoizedState;if(r!==null)return r.dehydrated===null?(n&t.child.childLanes)===0?(po(t),e=Nc(e,t,n),e===null?null:e.sibling):Ec(e,t,n):(po(t),t.flags|=128,null);po(t);break;case 19:var i=(e.flags&128)!=0;if(r=(n&t.childLanes)!==0,r||=(oa(e,t,n,!1),(n&t.childLanes)!==0),i){if(r)return Mc(e,t,n);t.flags|=128}if(i=t.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),O(N,N.current),r)break;return null;case 22:return t.lanes=0,fc(e,t,n,t.pendingProps);case 24:na(t,M,e.memoizedState.cache)}return Nc(e,t,n)}function Ic(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps)z=!0;else{if(!Pc(e,n)&&!(t.flags&128))return z=!1,Fc(e,t,n);z=!!(e.flags&131072)}else z=!1,j&&t.flags&1048576&&Ri(t,ji,t.index);switch(t.lanes=0,t.tag){case 16:a:{var r=t.pendingProps;if(e=Fa(t.elementType),t.type=e,typeof e==`function`)vi(e)?(r=Zs(e,r),t.tag=1,t=xc(null,t,e,r,n)):(t.tag=0,t=yc(null,t,e,r,n));else{if(e!=null){var i=e.$$typeof;if(i===C){t.tag=11,t=lc(null,t,e,r,n);break a}else if(i===re){t.tag=14,t=uc(null,t,e,r,n);break a}}throw t=le(e)||e,Error(s(306,t,``))}}return t;case 0:return yc(e,t,t.type,t.pendingProps,n);case 1:return r=t.type,i=Zs(r,t.pendingProps),xc(e,t,r,i,n);case 3:a:{if(ye(t,t.stateNode.containerInfo),e===null)throw Error(s(387));r=t.pendingProps;var a=t.memoizedState;i=a.element,Ya(e,t),no(t,r,null,n);var o=t.memoizedState;if(r=o.cache,na(t,M,r),r!==a.cache&&aa(t,[M],n,!0),to(),r=o.element,a.isDehydrated)if(a={element:r,isDehydrated:!1,cache:o.cache},t.updateQueue.baseState=a,t.memoizedState=a,t.flags&256){t=Sc(e,t,r,n);break a}else if(r!==i){i=Di(Error(s(424)),t),Qi(i),t=Sc(e,t,r,n);break a}else{switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName===`HTML`?e.ownerDocument.body:e}for(A=cf(e.firstChild),Hi=t,j=!0,Ui=null,Wi=!0,n=Ka(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(Xi(),r===i){t=Nc(e,t,n);break a}cc(e,t,r,n)}t=t.child}return t;case 26:return vc(e,t),e===null?(n=kf(t.type,null,t.pendingProps,null))?t.memoizedState=n:j||(n=t.type,e=t.pendingProps,r=Bd(_e.current).createElement(n),r[gt]=t,r[_t]=e,Pd(r,n,e),k(r),t.stateNode=r):t.memoizedState=kf(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return xe(t),e===null&&j&&(r=t.stateNode=ff(t.type,t.pendingProps,_e.current),Hi=t,Wi=!0,i=A,Zd(t.type)?(lf=i,A=cf(r.firstChild)):A=i),cc(e,t,t.pendingProps.children,n),vc(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&j&&((i=r=A)&&(r=tf(r,t.type,t.pendingProps,Wi),r===null?i=!1:(t.stateNode=r,Hi=t,A=cf(r.firstChild),Wi=!1,i=!0)),i||Ki(t)),xe(t),i=t.type,a=t.pendingProps,o=e===null?null:e.memoizedProps,r=a.children,Ud(i,a)?r=null:o!==null&&Ud(i,o)&&(t.flags|=32),t.memoizedState!==null&&(i=Oo(e,t,jo,null,null,n),Qf._currentValue=i),vc(e,t),cc(e,t,r,n),t.child;case 6:return e===null&&j&&((e=n=A)&&(n=nf(n,t.pendingProps,Wi),n===null?e=!1:(t.stateNode=n,Hi=t,A=null,e=!0)),e||Ki(t)),null;case 13:return Ec(e,t,n);case 4:return ye(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Ga(t,null,r,n):cc(e,t,r,n),t.child;case 11:return lc(e,t,t.type,t.pendingProps,n);case 7:return cc(e,t,t.pendingProps,n),t.child;case 8:return cc(e,t,t.pendingProps.children,n),t.child;case 12:return cc(e,t,t.pendingProps.children,n),t.child;case 10:return r=t.pendingProps,na(t,t.type,r.value),cc(e,t,r.children,n),t.child;case 9:return i=t.type._context,r=t.pendingProps.children,ca(t),i=la(i),r=r(i),t.flags|=1,cc(e,t,r,n),t.child;case 14:return uc(e,t,t.type,t.pendingProps,n);case 15:return dc(e,t,t.type,t.pendingProps,n);case 19:return Mc(e,t,n);case 31:return _c(e,t,n);case 22:return fc(e,t,n,t.pendingProps);case 24:return ca(t),r=la(M),e===null?(i=Ea(),i===null&&(i=G,a=ha(),i.pooledCache=a,a.refCount++,a!==null&&(i.pooledCacheLanes|=n),i=a),t.memoizedState={parent:r,cache:i},Ja(t),na(t,M,i)):((e.lanes&n)!==0&&(Ya(e,t),no(t,null,null,n),to()),i=e.memoizedState,a=t.memoizedState,i.parent===r?(r=a.cache,na(t,M,r),r!==i.cache&&aa(t,[M],n,!0)):(i={parent:r,cache:r},t.memoizedState=i,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=i),na(t,M,r))),cc(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error(s(156,t.tag))}function Lc(e){e.flags|=4}function Rc(e,t,n,r,i){if((t=(e.mode&32)!=0)&&(t=!1),t){if(e.flags|=16777216,(i&335544128)===i)if(e.stateNode.complete)e.flags|=8192;else if(wu())e.flags|=8192;else throw Ia=Ma,Aa}else e.flags&=-16777217}function zc(e,t){if(t.type!==`stylesheet`||t.state.loading&4)e.flags&=-16777217;else if(e.flags|=16777216,!Wf(t))if(wu())e.flags|=8192;else throw Ia=Ma,Aa}function Bc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag===22?536870912:it(),e.lanes|=t,Xl|=t)}function Vc(e,t){if(!j)switch(e.tailMode){case`hidden`:t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case`collapsed`:n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function B(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&65011712,r|=i.flags&65011712,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function Hc(e,t,n){var r=t.pendingProps;switch(Bi(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return B(t),null;case 1:return B(t),null;case 3:return n=t.stateNode,r=null,e!==null&&(r=e.memoizedState.cache),t.memoizedState.cache!==r&&(t.flags|=2048),ra(M),be(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Yi(t)?Lc(t):e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Zi())),B(t),null;case 26:var i=t.type,a=t.memoizedState;return e===null?(Lc(t),a===null?(B(t),Rc(t,i,null,r,n)):(B(t),zc(t,a))):a?a===e.memoizedState?(B(t),t.flags&=-16777217):(Lc(t),B(t),zc(t,a)):(e=e.memoizedProps,e!==r&&Lc(t),B(t),Rc(t,i,e,r,n)),null;case 27:if(Se(t),n=_e.current,i=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&Lc(t);else{if(!r){if(t.stateNode===null)throw Error(s(166));return B(t),null}e=he.current,Yi(t)?qi(t,e):(e=ff(i,r,n),t.stateNode=e,Lc(t))}return B(t),null;case 5:if(Se(t),i=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&Lc(t);else{if(!r){if(t.stateNode===null)throw Error(s(166));return B(t),null}if(a=he.current,Yi(t))qi(t,a);else{var o=Bd(_e.current);switch(a){case 1:a=o.createElementNS(`http://www.w3.org/2000/svg`,i);break;case 2:a=o.createElementNS(`http://www.w3.org/1998/Math/MathML`,i);break;default:switch(i){case`svg`:a=o.createElementNS(`http://www.w3.org/2000/svg`,i);break;case`math`:a=o.createElementNS(`http://www.w3.org/1998/Math/MathML`,i);break;case`script`:a=o.createElement(`div`),a.innerHTML=`<script><\/script>`,a=a.removeChild(a.firstChild);break;case`select`:a=typeof r.is==`string`?o.createElement(`select`,{is:r.is}):o.createElement(`select`),r.multiple?a.multiple=!0:r.size&&(a.size=r.size);break;default:a=typeof r.is==`string`?o.createElement(i,{is:r.is}):o.createElement(i)}}a[gt]=t,a[_t]=r;a:for(o=t.child;o!==null;){if(o.tag===5||o.tag===6)a.appendChild(o.stateNode);else if(o.tag!==4&&o.tag!==27&&o.child!==null){o.child.return=o,o=o.child;continue}if(o===t)break a;for(;o.sibling===null;){if(o.return===null||o.return===t)break a;o=o.return}o.sibling.return=o.return,o=o.sibling}t.stateNode=a;a:switch(Pd(a,i,r),i){case`button`:case`input`:case`select`:case`textarea`:r=!!r.autoFocus;break a;case`img`:r=!0;break a;default:r=!1}r&&Lc(t)}}return B(t),Rc(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==r&&Lc(t);else{if(typeof r!=`string`&&t.stateNode===null)throw Error(s(166));if(e=_e.current,Yi(t)){if(e=t.stateNode,n=t.memoizedProps,r=null,i=Hi,i!==null)switch(i.tag){case 27:case 5:r=i.memoizedProps}e[gt]=t,e=!!(e.nodeValue===n||r!==null&&!0===r.suppressHydrationWarning||Md(e.nodeValue,n)),e||Ki(t,!0)}else e=Bd(e).createTextNode(r),e[gt]=t,t.stateNode=e}return B(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(r=Yi(t),n!==null){if(e===null){if(!r)throw Error(s(318));if(e=t.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(s(557));e[gt]=t}else Xi(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;B(t),e=!1}else n=Zi(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(_o(t),t):(_o(t),null);if(t.flags&128)throw Error(s(558))}return B(t),null;case 13:if(r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(i=Yi(t),r!==null&&r.dehydrated!==null){if(e===null){if(!i)throw Error(s(318));if(i=t.memoizedState,i=i===null?null:i.dehydrated,!i)throw Error(s(317));i[gt]=t}else Xi(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;B(t),i=!1}else i=Zi(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=i),i=!0;if(!i)return t.flags&256?(_o(t),t):(_o(t),null)}return _o(t),t.flags&128?(t.lanes=n,t):(n=r!==null,e=e!==null&&e.memoizedState!==null,n&&(r=t.child,i=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(i=r.alternate.memoizedState.cachePool.pool),a=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(a=r.memoizedState.cachePool.pool),a!==i&&(r.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),Bc(t,t.updateQueue),B(t),null);case 4:return be(),e===null&&Sd(t.stateNode.containerInfo),B(t),null;case 10:return ra(t.type),B(t),null;case 19:if(D(N),r=t.memoizedState,r===null)return B(t),null;if(i=(t.flags&128)!=0,a=r.rendering,a===null)if(i)Vc(r,!1);else{if(Y!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(a=vo(e),a!==null){for(t.flags|=128,Vc(r,!1),e=a.updateQueue,t.updateQueue=e,Bc(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)bi(n,e),n=n.sibling;return O(N,N.current&1|2),j&&Li(t,r.treeForkCount),t.child}e=e.sibling}r.tail!==null&&Fe()>nu&&(t.flags|=128,i=!0,Vc(r,!1),t.lanes=4194304)}else{if(!i)if(e=vo(a),e!==null){if(t.flags|=128,i=!0,e=e.updateQueue,t.updateQueue=e,Bc(t,e),Vc(r,!0),r.tail===null&&r.tailMode===`hidden`&&!a.alternate&&!j)return B(t),null}else 2*Fe()-r.renderingStartTime>nu&&n!==536870912&&(t.flags|=128,i=!0,Vc(r,!1),t.lanes=4194304);r.isBackwards?(a.sibling=t.child,t.child=a):(e=r.last,e===null?t.child=a:e.sibling=a,r.last=a)}return r.tail===null?(B(t),null):(e=r.tail,r.rendering=e,r.tail=e.sibling,r.renderingStartTime=Fe(),e.sibling=null,n=N.current,O(N,i?n&1|2:n&1),j&&Li(t,r.treeForkCount),e);case 22:case 23:return _o(t),lo(),r=t.memoizedState!==null,e===null?r&&(t.flags|=8192):e.memoizedState!==null!==r&&(t.flags|=8192),r?n&536870912&&!(t.flags&128)&&(B(t),t.subtreeFlags&6&&(t.flags|=8192)):B(t),n=t.updateQueue,n!==null&&Bc(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),r=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(r=t.memoizedState.cachePool.pool),r!==n&&(t.flags|=2048),e!==null&&D(Ta),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),ra(M),B(t),null;case 25:return null;case 30:return null}throw Error(s(156,t.tag))}function Uc(e,t){switch(Bi(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return ra(M),be(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Se(t),null;case 31:if(t.memoizedState!==null){if(_o(t),t.alternate===null)throw Error(s(340));Xi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(_o(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(s(340));Xi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return D(N),null;case 4:return be(),null;case 10:return ra(t.type),null;case 22:case 23:return _o(t),lo(),e!==null&&D(Ta),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return ra(M),null;case 25:return null;default:return null}}function Wc(e,t){switch(Bi(t),t.tag){case 3:ra(M),be();break;case 26:case 27:case 5:Se(t);break;case 4:be();break;case 31:t.memoizedState!==null&&_o(t);break;case 13:_o(t);break;case 19:D(N);break;case 10:ra(t.type);break;case 22:case 23:_o(t),lo(),e!==null&&D(Ta);break;case 24:ra(M)}}function Gc(e,t){try{var n=t.updateQueue,r=n===null?null:n.lastEffect;if(r!==null){var i=r.next;n=i;do{if((n.tag&e)===e){r=void 0;var a=n.create,o=n.inst;r=a(),o.destroy=r}n=n.next}while(n!==i)}}catch(e){Z(t,t.return,e)}}function Kc(e,t,n){try{var r=t.updateQueue,i=r===null?null:r.lastEffect;if(i!==null){var a=i.next;r=a;do{if((r.tag&e)===e){var o=r.inst,s=o.destroy;if(s!==void 0){o.destroy=void 0,i=t;var c=n,l=s;try{l()}catch(e){Z(i,c,e)}}}r=r.next}while(r!==a)}}catch(e){Z(t,t.return,e)}}function qc(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{io(t,n)}catch(t){Z(e,e.return,t)}}}function Jc(e,t,n){n.props=Zs(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(n){Z(e,t,n)}}function Yc(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var r=e.stateNode;break;case 30:r=e.stateNode;break;default:r=e.stateNode}typeof n==`function`?e.refCleanup=n(r):n.current=r}}catch(n){Z(e,t,n)}}function Xc(e,t){var n=e.ref,r=e.refCleanup;if(n!==null)if(typeof r==`function`)try{r()}catch(n){Z(e,t,n)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n==`function`)try{n(null)}catch(n){Z(e,t,n)}else n.current=null}function Zc(e){var t=e.type,n=e.memoizedProps,r=e.stateNode;try{a:switch(t){case`button`:case`input`:case`select`:case`textarea`:n.autoFocus&&r.focus();break a;case`img`:n.src?r.src=n.src:n.srcSet&&(r.srcset=n.srcSet)}}catch(t){Z(e,e.return,t)}}function Qc(e,t,n){try{var r=e.stateNode;Fd(r,e.type,n,t),r[_t]=t}catch(t){Z(e,e.return,t)}}function $c(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Zd(e.type)||e.tag===4}function el(e){a:for(;;){for(;e.sibling===null;){if(e.return===null||$c(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Zd(e.type)||e.flags&2||e.child===null||e.tag===4)continue a;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function tl(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=ln));else if(r!==4&&(r===27&&Zd(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(tl(e,t,n),e=e.sibling;e!==null;)tl(e,t,n),e=e.sibling}function nl(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(r===27&&Zd(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(nl(e,t,n),e=e.sibling;e!==null;)nl(e,t,n),e=e.sibling}function rl(e){var t=e.stateNode,n=e.memoizedProps;try{for(var r=e.type,i=t.attributes;i.length;)t.removeAttributeNode(i[0]);Pd(t,r,n),t[gt]=e,t[_t]=n}catch(t){Z(e,e.return,t)}}var il=!1,V=!1,al=!1,ol=typeof WeakSet==`function`?WeakSet:Set,H=null;function sl(e,t){if(e=e.containerInfo,Rd=sp,e=Ir(e),Lr(e)){if(`selectionStart`in e)var n={start:e.selectionStart,end:e.selectionEnd};else a:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var i=r.anchorOffset,a=r.focusNode;r=r.focusOffset;try{n.nodeType,a.nodeType}catch{n=null;break a}var o=0,c=-1,l=-1,u=0,d=0,f=e,p=null;b:for(;;){for(var m;f!==n||i!==0&&f.nodeType!==3||(c=o+i),f!==a||r!==0&&f.nodeType!==3||(l=o+r),f.nodeType===3&&(o+=f.nodeValue.length),(m=f.firstChild)!==null;)p=f,f=m;for(;;){if(f===e)break b;if(p===n&&++u===i&&(c=o),p===a&&++d===r&&(l=o),(m=f.nextSibling)!==null)break;f=p,p=f.parentNode}f=m}n=c===-1||l===-1?null:{start:c,end:l}}else n=null}n||={start:0,end:0}}else n=null;for(zd={focusedElem:e,selectionRange:n},sp=!1,H=t;H!==null;)if(t=H,e=t.child,t.subtreeFlags&1028&&e!==null)e.return=t,H=e;else for(;H!==null;){switch(t=H,a=t.alternate,e=t.flags,t.tag){case 0:if(e&4&&(e=t.updateQueue,e=e===null?null:e.events,e!==null))for(n=0;n<e.length;n++)i=e[n],i.ref.impl=i.nextImpl;break;case 11:case 15:break;case 1:if(e&1024&&a!==null){e=void 0,n=t,i=a.memoizedProps,a=a.memoizedState,r=n.stateNode;try{var h=Zs(n.type,i);e=r.getSnapshotBeforeUpdate(h,a),r.__reactInternalSnapshotBeforeUpdate=e}catch(e){Z(n,n.return,e)}}break;case 3:if(e&1024){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)ef(e);else if(n===1)switch(e.nodeName){case`HEAD`:case`HTML`:case`BODY`:ef(e);break;default:e.textContent=``}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(e&1024)throw Error(s(163))}if(e=t.sibling,e!==null){e.return=t.return,H=e;break}H=t.return}}function cl(e,t,n){var r=n.flags;switch(n.tag){case 0:case 11:case 15:Sl(e,n),r&4&&Gc(5,n);break;case 1:if(Sl(e,n),r&4)if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(e){Z(n,n.return,e)}else{var i=Zs(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(i,t,e.__reactInternalSnapshotBeforeUpdate)}catch(e){Z(n,n.return,e)}}r&64&&qc(n),r&512&&Yc(n,n.return);break;case 3:if(Sl(e,n),r&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{io(e,t)}catch(e){Z(n,n.return,e)}}break;case 27:t===null&&r&4&&rl(n);case 26:case 5:Sl(e,n),t===null&&r&4&&Zc(n),r&512&&Yc(n,n.return);break;case 12:Sl(e,n);break;case 31:Sl(e,n),r&4&&pl(e,n);break;case 13:Sl(e,n),r&4&&ml(e,n),r&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=Ju.bind(null,n),sf(e,n))));break;case 22:if(r=n.memoizedState!==null||il,!r){t=t!==null&&t.memoizedState!==null||V,i=il;var a=V;il=r,(V=t)&&!a?wl(e,n,(n.subtreeFlags&8772)!=0):Sl(e,n),il=i,V=a}break;case 30:break;default:Sl(e,n)}}function ll(e){var t=e.alternate;t!==null&&(e.alternate=null,ll(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&wt(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var U=null,ul=!1;function dl(e,t,n){for(n=n.child;n!==null;)fl(e,t,n),n=n.sibling}function fl(e,t,n){if(Ge&&typeof Ge.onCommitFiberUnmount==`function`)try{Ge.onCommitFiberUnmount(We,n)}catch{}switch(n.tag){case 26:V||Xc(n,t),dl(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:V||Xc(n,t);var r=U,i=ul;Zd(n.type)&&(U=n.stateNode,ul=!1),dl(e,t,n),pf(n.stateNode),U=r,ul=i;break;case 5:V||Xc(n,t);case 6:if(r=U,i=ul,U=null,dl(e,t,n),U=r,ul=i,U!==null)if(ul)try{(U.nodeType===9?U.body:U.nodeName===`HTML`?U.ownerDocument.body:U).removeChild(n.stateNode)}catch(e){Z(n,t,e)}else try{U.removeChild(n.stateNode)}catch(e){Z(n,t,e)}break;case 18:U!==null&&(ul?(e=U,Qd(e.nodeType===9?e.body:e.nodeName===`HTML`?e.ownerDocument.body:e,n.stateNode),Np(e)):Qd(U,n.stateNode));break;case 4:r=U,i=ul,U=n.stateNode.containerInfo,ul=!0,dl(e,t,n),U=r,ul=i;break;case 0:case 11:case 14:case 15:Kc(2,n,t),V||Kc(4,n,t),dl(e,t,n);break;case 1:V||(Xc(n,t),r=n.stateNode,typeof r.componentWillUnmount==`function`&&Jc(n,t,r)),dl(e,t,n);break;case 21:dl(e,t,n);break;case 22:V=(r=V)||n.memoizedState!==null,dl(e,t,n),V=r;break;default:dl(e,t,n)}}function pl(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Np(e)}catch(e){Z(t,t.return,e)}}}function ml(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Np(e)}catch(e){Z(t,t.return,e)}}function hl(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new ol),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new ol),t;default:throw Error(s(435,e.tag))}}function gl(e,t){var n=hl(e);t.forEach(function(t){if(!n.has(t)){n.add(t);var r=Yu.bind(null,e,t);t.then(r,r)}})}function _l(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var i=n[r],a=e,o=t,c=o;a:for(;c!==null;){switch(c.tag){case 27:if(Zd(c.type)){U=c.stateNode,ul=!1;break a}break;case 5:U=c.stateNode,ul=!1;break a;case 3:case 4:U=c.stateNode.containerInfo,ul=!0;break a}c=c.return}if(U===null)throw Error(s(160));fl(a,o,i),U=null,ul=!1,a=i.alternate,a!==null&&(a.return=null),i.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)yl(t,e),t=t.sibling}var vl=null;function yl(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:_l(t,e),bl(e),r&4&&(Kc(3,e,e.return),Gc(3,e),Kc(5,e,e.return));break;case 1:_l(t,e),bl(e),r&512&&(V||n===null||Xc(n,n.return)),r&64&&il&&(e=e.updateQueue,e!==null&&(r=e.callbacks,r!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?r:n.concat(r))));break;case 26:var i=vl;if(_l(t,e),bl(e),r&512&&(V||n===null||Xc(n,n.return)),r&4){var a=n===null?null:n.memoizedState;if(r=e.memoizedState,n===null)if(r===null)if(e.stateNode===null){a:{r=e.type,n=e.memoizedProps,i=i.ownerDocument||i;b:switch(r){case`title`:a=i.getElementsByTagName(`title`)[0],(!a||a[Ct]||a[gt]||a.namespaceURI===`http://www.w3.org/2000/svg`||a.hasAttribute(`itemprop`))&&(a=i.createElement(r),i.head.insertBefore(a,i.querySelector(`head > title`))),Pd(a,r,n),a[gt]=e,k(a),r=a;break a;case`link`:var o=Vf(`link`,`href`,i).get(r+(n.href||``));if(o){for(var c=0;c<o.length;c++)if(a=o[c],a.getAttribute(`href`)===(n.href==null||n.href===``?null:n.href)&&a.getAttribute(`rel`)===(n.rel==null?null:n.rel)&&a.getAttribute(`title`)===(n.title==null?null:n.title)&&a.getAttribute(`crossorigin`)===(n.crossOrigin==null?null:n.crossOrigin)){o.splice(c,1);break b}}a=i.createElement(r),Pd(a,r,n),i.head.appendChild(a);break;case`meta`:if(o=Vf(`meta`,`content`,i).get(r+(n.content||``))){for(c=0;c<o.length;c++)if(a=o[c],a.getAttribute(`content`)===(n.content==null?null:``+n.content)&&a.getAttribute(`name`)===(n.name==null?null:n.name)&&a.getAttribute(`property`)===(n.property==null?null:n.property)&&a.getAttribute(`http-equiv`)===(n.httpEquiv==null?null:n.httpEquiv)&&a.getAttribute(`charset`)===(n.charSet==null?null:n.charSet)){o.splice(c,1);break b}}a=i.createElement(r),Pd(a,r,n),i.head.appendChild(a);break;default:throw Error(s(468,r))}a[gt]=e,k(a),r=a}e.stateNode=r}else Hf(i,e.type,e.stateNode);else e.stateNode=If(i,r,e.memoizedProps);else a===r?r===null&&e.stateNode!==null&&Qc(e,e.memoizedProps,n.memoizedProps):(a===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):a.count--,r===null?Hf(i,e.type,e.stateNode):If(i,r,e.memoizedProps))}break;case 27:_l(t,e),bl(e),r&512&&(V||n===null||Xc(n,n.return)),n!==null&&r&4&&Qc(e,e.memoizedProps,n.memoizedProps);break;case 5:if(_l(t,e),bl(e),r&512&&(V||n===null||Xc(n,n.return)),e.flags&32){i=e.stateNode;try{en(i,``)}catch(t){Z(e,e.return,t)}}r&4&&e.stateNode!=null&&(i=e.memoizedProps,Qc(e,i,n===null?i:n.memoizedProps)),r&1024&&(al=!0);break;case 6:if(_l(t,e),bl(e),r&4){if(e.stateNode===null)throw Error(s(162));r=e.memoizedProps,n=e.stateNode;try{n.nodeValue=r}catch(t){Z(e,e.return,t)}}break;case 3:if(Bf=null,i=vl,vl=gf(t.containerInfo),_l(t,e),vl=i,bl(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Np(t.containerInfo)}catch(t){Z(e,e.return,t)}al&&(al=!1,xl(e));break;case 4:r=vl,vl=gf(e.stateNode.containerInfo),_l(t,e),bl(e),vl=r;break;case 12:_l(t,e),bl(e);break;case 31:_l(t,e),bl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,gl(e,r)));break;case 13:_l(t,e),bl(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(eu=Fe()),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,gl(e,r)));break;case 22:i=e.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,u=il,d=V;if(il=u||i,V=d||l,_l(t,e),V=d,il=u,bl(e),r&8192)a:for(t=e.stateNode,t._visibility=i?t._visibility&-2:t._visibility|1,i&&(n===null||l||il||V||Cl(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){l=n=t;try{if(a=l.stateNode,i)o=a.style,typeof o.setProperty==`function`?o.setProperty(`display`,`none`,`important`):o.display=`none`;else{c=l.stateNode;var f=l.memoizedProps.style,p=f!=null&&f.hasOwnProperty(`display`)?f.display:null;c.style.display=p==null||typeof p==`boolean`?``:(``+p).trim()}}catch(e){Z(l,l.return,e)}}}else if(t.tag===6){if(n===null){l=t;try{l.stateNode.nodeValue=i?``:l.memoizedProps}catch(e){Z(l,l.return,e)}}}else if(t.tag===18){if(n===null){l=t;try{var m=l.stateNode;i?$d(m,!0):$d(l.stateNode,!1)}catch(e){Z(l,l.return,e)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break a;for(;t.sibling===null;){if(t.return===null||t.return===e)break a;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}r&4&&(r=e.updateQueue,r!==null&&(n=r.retryQueue,n!==null&&(r.retryQueue=null,gl(e,n))));break;case 19:_l(t,e),bl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,gl(e,r)));break;case 30:break;case 21:break;default:_l(t,e),bl(e)}}function bl(e){var t=e.flags;if(t&2){try{for(var n,r=e.return;r!==null;){if($c(r)){n=r;break}r=r.return}if(n==null)throw Error(s(160));switch(n.tag){case 27:var i=n.stateNode;nl(e,el(e),i);break;case 5:var a=n.stateNode;n.flags&32&&(en(a,``),n.flags&=-33),nl(e,el(e),a);break;case 3:case 4:var o=n.stateNode.containerInfo;tl(e,el(e),o);break;default:throw Error(s(161))}}catch(t){Z(e,e.return,t)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function xl(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;xl(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function Sl(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)cl(e,t.alternate,t),t=t.sibling}function Cl(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:Kc(4,t,t.return),Cl(t);break;case 1:Xc(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount==`function`&&Jc(t,t.return,n),Cl(t);break;case 27:pf(t.stateNode);case 26:case 5:Xc(t,t.return),Cl(t);break;case 22:t.memoizedState===null&&Cl(t);break;case 30:Cl(t);break;default:Cl(t)}e=e.sibling}}function wl(e,t,n){for(n&&=(t.subtreeFlags&8772)!=0,t=t.child;t!==null;){var r=t.alternate,i=e,a=t,o=a.flags;switch(a.tag){case 0:case 11:case 15:wl(i,a,n),Gc(4,a);break;case 1:if(wl(i,a,n),r=a,i=r.stateNode,typeof i.componentDidMount==`function`)try{i.componentDidMount()}catch(e){Z(r,r.return,e)}if(r=a,i=r.updateQueue,i!==null){var s=r.stateNode;try{var c=i.shared.hiddenCallbacks;if(c!==null)for(i.shared.hiddenCallbacks=null,i=0;i<c.length;i++)ro(c[i],s)}catch(e){Z(r,r.return,e)}}n&&o&64&&qc(a),Yc(a,a.return);break;case 27:rl(a);case 26:case 5:wl(i,a,n),n&&r===null&&o&4&&Zc(a),Yc(a,a.return);break;case 12:wl(i,a,n);break;case 31:wl(i,a,n),n&&o&4&&pl(i,a);break;case 13:wl(i,a,n),n&&o&4&&ml(i,a);break;case 22:a.memoizedState===null&&wl(i,a,n),Yc(a,a.return);break;case 30:break;default:wl(i,a,n)}t=t.sibling}}function Tl(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&ga(n))}function El(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&ga(e))}function Dl(e,t,n,r){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)Ol(e,t,n,r),t=t.sibling}function Ol(e,t,n,r){var i=t.flags;switch(t.tag){case 0:case 11:case 15:Dl(e,t,n,r),i&2048&&Gc(9,t);break;case 1:Dl(e,t,n,r);break;case 3:Dl(e,t,n,r),i&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&ga(e)));break;case 12:if(i&2048){Dl(e,t,n,r),e=t.stateNode;try{var a=t.memoizedProps,o=a.id,s=a.onPostCommit;typeof s==`function`&&s(o,t.alternate===null?`mount`:`update`,e.passiveEffectDuration,-0)}catch(e){Z(t,t.return,e)}}else Dl(e,t,n,r);break;case 31:Dl(e,t,n,r);break;case 13:Dl(e,t,n,r);break;case 23:break;case 22:a=t.stateNode,o=t.alternate,t.memoizedState===null?a._visibility&2?Dl(e,t,n,r):(a._visibility|=2,kl(e,t,n,r,(t.subtreeFlags&10256)!=0||!1)):a._visibility&2?Dl(e,t,n,r):Al(e,t),i&2048&&Tl(o,t);break;case 24:Dl(e,t,n,r),i&2048&&El(t.alternate,t);break;default:Dl(e,t,n,r)}}function kl(e,t,n,r,i){for(i&&=(t.subtreeFlags&10256)!=0||!1,t=t.child;t!==null;){var a=e,o=t,s=n,c=r,l=o.flags;switch(o.tag){case 0:case 11:case 15:kl(a,o,s,c,i),Gc(8,o);break;case 23:break;case 22:var u=o.stateNode;o.memoizedState===null?(u._visibility|=2,kl(a,o,s,c,i)):u._visibility&2?kl(a,o,s,c,i):Al(a,o),i&&l&2048&&Tl(o.alternate,o);break;case 24:kl(a,o,s,c,i),i&&l&2048&&El(o.alternate,o);break;default:kl(a,o,s,c,i)}t=t.sibling}}function Al(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,r=t,i=r.flags;switch(r.tag){case 22:Al(n,r),i&2048&&Tl(r.alternate,r);break;case 24:Al(n,r),i&2048&&El(r.alternate,r);break;default:Al(n,r)}t=t.sibling}}var jl=8192;function Ml(e,t,n){if(e.subtreeFlags&jl)for(e=e.child;e!==null;)Nl(e,t,n),e=e.sibling}function Nl(e,t,n){switch(e.tag){case 26:Ml(e,t,n),e.flags&jl&&e.memoizedState!==null&&Gf(n,vl,e.memoizedState,e.memoizedProps);break;case 5:Ml(e,t,n);break;case 3:case 4:var r=vl;vl=gf(e.stateNode.containerInfo),Ml(e,t,n),vl=r;break;case 22:e.memoizedState===null&&(r=e.alternate,r!==null&&r.memoizedState!==null?(r=jl,jl=16777216,Ml(e,t,n),jl=r):Ml(e,t,n));break;default:Ml(e,t,n)}}function Pl(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Fl(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];H=r,Rl(r,e)}Pl(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Il(e),e=e.sibling}function Il(e){switch(e.tag){case 0:case 11:case 15:Fl(e),e.flags&2048&&Kc(9,e,e.return);break;case 3:Fl(e);break;case 12:Fl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Ll(e)):Fl(e);break;default:Fl(e)}}function Ll(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];H=r,Rl(r,e)}Pl(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Kc(8,t,t.return),Ll(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Ll(t));break;default:Ll(t)}e=e.sibling}}function Rl(e,t){for(;H!==null;){var n=H;switch(n.tag){case 0:case 11:case 15:Kc(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var r=n.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:ga(n.memoizedState.cache)}if(r=n.child,r!==null)r.return=n,H=r;else a:for(n=e;H!==null;){r=H;var i=r.sibling,a=r.return;if(ll(r),r===n){H=null;break a}if(i!==null){i.return=a,H=i;break a}H=a}}}var zl={getCacheForType:function(e){var t=la(M),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return la(M).controller.signal}},Bl=typeof WeakMap==`function`?WeakMap:Map,W=0,G=null,K=null,q=0,J=0,Vl=null,Hl=!1,Ul=!1,Wl=!1,Gl=0,Y=0,Kl=0,ql=0,Jl=0,Yl=0,Xl=0,Zl=null,Ql=null,$l=!1,eu=0,tu=0,nu=1/0,ru=null,iu=null,X=0,au=null,ou=null,su=0,cu=0,lu=null,uu=null,du=0,fu=null;function pu(){return W&2&&q!==0?q&-q:T.T===null?pt():dd()}function mu(){if(Yl===0)if(!(q&536870912)||j){var e=Qe;Qe<<=1,!(Qe&3932160)&&(Qe=262144),Yl=e}else Yl=536870912;return e=uo.current,e!==null&&(e.flags|=32),Yl}function hu(e,t,n){(e===G&&(J===2||J===9)||e.cancelPendingCommit!==null)&&(Su(e,0),yu(e,q,Yl,!1)),ot(e,n),(!(W&2)||e!==G)&&(e===G&&(!(W&2)&&(ql|=n),Y===4&&yu(e,q,Yl,!1)),rd(e))}function gu(e,t,n){if(W&6)throw Error(s(327));var r=!n&&(t&127)==0&&(t&e.expiredLanes)===0||nt(e,t),i=r?Au(e,t):Ou(e,t,!0),a=r;do{if(i===0){Ul&&!r&&yu(e,t,0,!1);break}else{if(n=e.current.alternate,a&&!vu(n)){i=Ou(e,t,!1),a=!1;continue}if(i===2){if(a=t,e.errorRecoveryDisabledLanes&a)var o=0;else o=e.pendingLanes&-536870913,o=o===0?o&536870912?536870912:0:o;if(o!==0){t=o;a:{var c=e;i=Zl;var l=c.current.memoizedState.isDehydrated;if(l&&(Su(c,o).flags|=256),o=Ou(c,o,!1),o!==2){if(Wl&&!l){c.errorRecoveryDisabledLanes|=a,ql|=a,i=4;break a}a=Ql,Ql=i,a!==null&&(Ql===null?Ql=a:Ql.push.apply(Ql,a))}i=o}if(a=!1,i!==2)continue}}if(i===1){Su(e,0),yu(e,t,0,!0);break}a:{switch(r=e,a=i,a){case 0:case 1:throw Error(s(345));case 4:if((t&4194048)!==t)break;case 6:yu(r,t,Yl,!Hl);break a;case 2:Ql=null;break;case 3:case 5:break;default:throw Error(s(329))}if((t&62914560)===t&&(i=eu+300-Fe(),10<i)){if(yu(r,t,Yl,!Hl),tt(r,0,!0)!==0)break a;su=t,r.timeoutHandle=Kd(_u.bind(null,r,n,Ql,ru,$l,t,Yl,ql,Xl,Hl,a,`Throttled`,-0,0),i);break a}_u(r,n,Ql,ru,$l,t,Yl,ql,Xl,Hl,a,null,-0,0)}}break}while(1);rd(e)}function _u(e,t,n,r,i,a,o,s,c,l,u,d,f,p){if(e.timeoutHandle=-1,d=t.subtreeFlags,d&8192||(d&16785408)==16785408){d={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:ln},Nl(t,a,d);var m=(a&62914560)===a?eu-Fe():(a&4194048)===a?tu-Fe():0;if(m=qf(d,m),m!==null){su=a,e.cancelPendingCommit=m(Lu.bind(null,e,t,a,n,r,i,o,s,c,u,d,null,f,p)),yu(e,a,o,!l);return}}Lu(e,t,a,n,r,i,o,s,c)}function vu(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var r=0;r<n.length;r++){var i=n[r],a=i.getSnapshot;i=i.value;try{if(!jr(a(),i))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function yu(e,t,n,r){t&=~Jl,t&=~ql,e.suspendedLanes|=t,e.pingedLanes&=~t,r&&(e.warmLanes|=t),r=e.expirationTimes;for(var i=t;0<i;){var a=31-qe(i),o=1<<a;r[a]=-1,i&=~o}n!==0&&ct(e,n,t)}function bu(){return W&6?!0:(id(0,!1),!1)}function xu(){if(K!==null){if(J===0)var e=K.return;else e=K,ta=ea=null,Po(e),za=null,Ba=0,e=K;for(;e!==null;)Wc(e.alternate,e),e=e.return;K=null}}function Su(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,qd(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),su=0,xu(),G=e,K=n=yi(e.current,null),q=t,J=0,Vl=null,Hl=!1,Ul=nt(e,t),Wl=!1,Xl=Yl=Jl=ql=Kl=Y=0,Ql=Zl=null,$l=!1,t&8&&(t|=t&32);var r=e.entangledLanes;if(r!==0)for(e=e.entanglements,r&=t;0<r;){var i=31-qe(r),a=1<<i;t|=e[i],r&=~a}return Gl=t,li(),n}function Cu(e,t){P=null,T.H=Us,t===ka||t===ja?(t=La(),J=3):t===Aa?(t=La(),J=4):J=t===sc?8:typeof t==`object`&&t&&typeof t.then==`function`?6:1,Vl=t,K===null&&(Y=1,tc(e,Di(t,e.current)))}function wu(){var e=uo.current;return e===null?!0:(q&4194048)===q?fo===null:(q&62914560)===q||q&536870912?e===fo:!1}function Tu(){var e=T.H;return T.H=Us,e===null?Us:e}function Eu(){var e=T.A;return T.A=zl,e}function Du(){Y=4,Hl||(q&4194048)!==q&&uo.current!==null||(Ul=!0),!(Kl&134217727)&&!(ql&134217727)||G===null||yu(G,q,Yl,!1)}function Ou(e,t,n){var r=W;W|=2;var i=Tu(),a=Eu();(G!==e||q!==t)&&(ru=null,Su(e,t)),t=!1;var o=Y;a:do try{if(J!==0&&K!==null){var s=K,c=Vl;switch(J){case 8:xu(),o=6;break a;case 3:case 2:case 9:case 6:uo.current===null&&(t=!0);var l=J;if(J=0,Vl=null,Pu(e,s,c,l),n&&Ul){o=0;break a}break;default:l=J,J=0,Vl=null,Pu(e,s,c,l)}}ku(),o=Y;break}catch(t){Cu(e,t)}while(1);return t&&e.shellSuspendCounter++,ta=ea=null,W=r,T.H=i,T.A=a,K===null&&(G=null,q=0,li()),o}function ku(){for(;K!==null;)Mu(K)}function Au(e,t){var n=W;W|=2;var r=Tu(),i=Eu();G!==e||q!==t?(ru=null,nu=Fe()+500,Su(e,t)):Ul=nt(e,t);a:do try{if(J!==0&&K!==null){t=K;var a=Vl;b:switch(J){case 1:J=0,Vl=null,Pu(e,t,a,1);break;case 2:case 9:if(Na(a)){J=0,Vl=null,Nu(t);break}t=function(){J!==2&&J!==9||G!==e||(J=7),rd(e)},a.then(t,t);break a;case 3:J=7;break a;case 4:J=5;break a;case 7:Na(a)?(J=0,Vl=null,Nu(t)):(J=0,Vl=null,Pu(e,t,a,7));break;case 5:var o=null;switch(K.tag){case 26:o=K.memoizedState;case 5:case 27:var c=K;if(o?Wf(o):c.stateNode.complete){J=0,Vl=null;var l=c.sibling;if(l!==null)K=l;else{var u=c.return;u===null?K=null:(K=u,Fu(u))}break b}}J=0,Vl=null,Pu(e,t,a,5);break;case 6:J=0,Vl=null,Pu(e,t,a,6);break;case 8:xu(),Y=6;break a;default:throw Error(s(462))}}ju();break}catch(t){Cu(e,t)}while(1);return ta=ea=null,T.H=r,T.A=i,W=n,K===null?(G=null,q=0,li(),Y):0}function ju(){for(;K!==null&&!Ne();)Mu(K)}function Mu(e){var t=Ic(e.alternate,e,Gl);e.memoizedProps=e.pendingProps,t===null?Fu(e):K=t}function Nu(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=bc(n,t,t.pendingProps,t.type,void 0,q);break;case 11:t=bc(n,t,t.pendingProps,t.type.render,t.ref,q);break;case 5:Po(t);default:Wc(n,t),t=K=bi(t,Gl),t=Ic(n,t,Gl)}e.memoizedProps=e.pendingProps,t===null?Fu(e):K=t}function Pu(e,t,n,r){ta=ea=null,Po(t),za=null,Ba=0;var i=t.return;try{if(oc(e,i,t,n,q)){Y=1,tc(e,Di(n,e.current)),K=null;return}}catch(t){if(i!==null)throw K=i,t;Y=1,tc(e,Di(n,e.current)),K=null;return}t.flags&32768?(j||r===1?e=!0:Ul||q&536870912?e=!1:(Hl=e=!0,(r===2||r===9||r===3||r===6)&&(r=uo.current,r!==null&&r.tag===13&&(r.flags|=16384))),Iu(t,e)):Fu(t)}function Fu(e){var t=e;do{if(t.flags&32768){Iu(t,Hl);return}e=t.return;var n=Hc(t.alternate,t,Gl);if(n!==null){K=n;return}if(t=t.sibling,t!==null){K=t;return}K=t=e}while(t!==null);Y===0&&(Y=5)}function Iu(e,t){do{var n=Uc(e.alternate,e);if(n!==null){n.flags&=32767,K=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){K=e;return}K=e=n}while(e!==null);Y=6,K=null}function Lu(e,t,n,r,i,a,o,c,l){e.cancelPendingCommit=null;do Hu();while(X!==0);if(W&6)throw Error(s(327));if(t!==null){if(t===e.current)throw Error(s(177));if(a=t.lanes|t.childLanes,a|=ci,st(e,n,a,o,c,l),e===G&&(K=G=null,q=0),ou=t,au=e,su=n,cu=a,lu=i,uu=r,t.subtreeFlags&10256||t.flags&10256?(e.callbackNode=null,e.callbackPriority=0,Xu(ze,function(){return Uu(),null})):(e.callbackNode=null,e.callbackPriority=0),r=(t.flags&13878)!=0,t.subtreeFlags&13878||r){r=T.T,T.T=null,i=E.p,E.p=2,o=W,W|=4;try{sl(e,t,n)}finally{W=o,E.p=i,T.T=r}}X=1,Ru(),zu(),Bu()}}function Ru(){if(X===1){X=0;var e=au,t=ou,n=(t.flags&13878)!=0;if(t.subtreeFlags&13878||n){n=T.T,T.T=null;var r=E.p;E.p=2;var i=W;W|=4;try{yl(t,e);var a=zd,o=Ir(e.containerInfo),s=a.focusedElem,c=a.selectionRange;if(o!==s&&s&&s.ownerDocument&&Fr(s.ownerDocument.documentElement,s)){if(c!==null&&Lr(s)){var l=c.start,u=c.end;if(u===void 0&&(u=l),`selectionStart`in s)s.selectionStart=l,s.selectionEnd=Math.min(u,s.value.length);else{var d=s.ownerDocument||document,f=d&&d.defaultView||window;if(f.getSelection){var p=f.getSelection(),m=s.textContent.length,h=Math.min(c.start,m),g=c.end===void 0?h:Math.min(c.end,m);!p.extend&&h>g&&(o=g,g=h,h=o);var _=Pr(s,h),v=Pr(s,g);if(_&&v&&(p.rangeCount!==1||p.anchorNode!==_.node||p.anchorOffset!==_.offset||p.focusNode!==v.node||p.focusOffset!==v.offset)){var y=d.createRange();y.setStart(_.node,_.offset),p.removeAllRanges(),h>g?(p.addRange(y),p.extend(v.node,v.offset)):(y.setEnd(v.node,v.offset),p.addRange(y))}}}}for(d=[],p=s;p=p.parentNode;)p.nodeType===1&&d.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof s.focus==`function`&&s.focus(),s=0;s<d.length;s++){var b=d[s];b.element.scrollLeft=b.left,b.element.scrollTop=b.top}}sp=!!Rd,zd=Rd=null}finally{W=i,E.p=r,T.T=n}}e.current=t,X=2}}function zu(){if(X===2){X=0;var e=au,t=ou,n=(t.flags&8772)!=0;if(t.subtreeFlags&8772||n){n=T.T,T.T=null;var r=E.p;E.p=2;var i=W;W|=4;try{cl(e,t.alternate,t)}finally{W=i,E.p=r,T.T=n}}X=3}}function Bu(){if(X===4||X===3){X=0,Pe();var e=au,t=ou,n=su,r=uu;t.subtreeFlags&10256||t.flags&10256?X=5:(X=0,ou=au=null,Vu(e,e.pendingLanes));var i=e.pendingLanes;if(i===0&&(iu=null),ft(n),t=t.stateNode,Ge&&typeof Ge.onCommitFiberRoot==`function`)try{Ge.onCommitFiberRoot(We,t,void 0,(t.current.flags&128)==128)}catch{}if(r!==null){t=T.T,i=E.p,E.p=2,T.T=null;try{for(var a=e.onRecoverableError,o=0;o<r.length;o++){var s=r[o];a(s.value,{componentStack:s.stack})}}finally{T.T=t,E.p=i}}su&3&&Hu(),rd(e),i=e.pendingLanes,n&261930&&i&42?e===fu?du++:(du=0,fu=e):du=0,id(0,!1)}}function Vu(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,ga(t)))}function Hu(){return Ru(),zu(),Bu(),Uu()}function Uu(){if(X!==5)return!1;var e=au,t=cu;cu=0;var n=ft(su),r=T.T,i=E.p;try{E.p=32>n?32:n,T.T=null,n=lu,lu=null;var a=au,o=su;if(X=0,ou=au=null,su=0,W&6)throw Error(s(331));var c=W;if(W|=4,Il(a.current),Ol(a,a.current,o,n),W=c,id(0,!1),Ge&&typeof Ge.onPostCommitFiberRoot==`function`)try{Ge.onPostCommitFiberRoot(We,a)}catch{}return!0}finally{E.p=i,T.T=r,Vu(e,t)}}function Wu(e,t,n){t=Di(n,t),t=rc(e.stateNode,t,2),e=Za(e,t,2),e!==null&&(ot(e,2),rd(e))}function Z(e,t,n){if(e.tag===3)Wu(e,e,n);else for(;t!==null;){if(t.tag===3){Wu(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError==`function`||typeof r.componentDidCatch==`function`&&(iu===null||!iu.has(r))){e=Di(n,e),n=ic(2),r=Za(t,n,2),r!==null&&(ac(n,r,t,e),ot(r,2),rd(r));break}}t=t.return}}function Gu(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new Bl;var i=new Set;r.set(t,i)}else i=r.get(t),i===void 0&&(i=new Set,r.set(t,i));i.has(n)||(Wl=!0,i.add(n),e=Ku.bind(null,e,t,n),t.then(e,e))}function Ku(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,G===e&&(q&n)===n&&(Y===4||Y===3&&(q&62914560)===q&&300>Fe()-eu?!(W&2)&&Su(e,0):Jl|=n,Xl===q&&(Xl=0)),rd(e)}function qu(e,t){t===0&&(t=it()),e=fi(e,t),e!==null&&(ot(e,t),rd(e))}function Ju(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),qu(e,n)}function Yu(e,t){var n=0;switch(e.tag){case 31:case 13:var r=e.stateNode,i=e.memoizedState;i!==null&&(n=i.retryLane);break;case 19:r=e.stateNode;break;case 22:r=e.stateNode._retryCache;break;default:throw Error(s(314))}r!==null&&r.delete(t),qu(e,n)}function Xu(e,t){return je(e,t)}var Zu=null,Qu=null,$u=!1,ed=!1,td=!1,nd=0;function rd(e){e!==Qu&&e.next===null&&(Qu===null?Zu=Qu=e:Qu=Qu.next=e),ed=!0,$u||($u=!0,ud())}function id(e,t){if(!td&&ed){td=!0;do for(var n=!1,r=Zu;r!==null;){if(!t)if(e!==0){var i=r.pendingLanes;if(i===0)var a=0;else{var o=r.suspendedLanes,s=r.pingedLanes;a=(1<<31-qe(42|e)+1)-1,a&=i&~(o&~s),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,ld(r,a))}else a=q,a=tt(r,r===G?a:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),!(a&3)||nt(r,a)||(n=!0,ld(r,a));r=r.next}while(n);td=!1}}function ad(){od()}function od(){ed=$u=!1;var e=0;nd!==0&&Gd()&&(e=nd);for(var t=Fe(),n=null,r=Zu;r!==null;){var i=r.next,a=sd(r,t);a===0?(r.next=null,n===null?Zu=i:n.next=i,i===null&&(Qu=n)):(n=r,(e!==0||a&3)&&(ed=!0)),r=i}X!==0&&X!==5||id(e,!1),nd!==0&&(nd=0)}function sd(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,i=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var o=31-qe(a),s=1<<o,c=i[o];c===-1?((s&n)===0||(s&r)!==0)&&(i[o]=rt(s,t)):c<=t&&(e.expiredLanes|=s),a&=~s}if(t=G,n=q,n=tt(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r=e.callbackNode,n===0||e===t&&(J===2||J===9)||e.cancelPendingCommit!==null)return r!==null&&r!==null&&Me(r),e.callbackNode=null,e.callbackPriority=0;if(!(n&3)||nt(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(r!==null&&Me(r),ft(n)){case 2:case 8:n=Re;break;case 32:n=ze;break;case 268435456:n=Ve;break;default:n=ze}return r=cd.bind(null,e),n=je(n,r),e.callbackPriority=t,e.callbackNode=n,t}return r!==null&&r!==null&&Me(r),e.callbackPriority=2,e.callbackNode=null,2}function cd(e,t){if(X!==0&&X!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(Hu()&&e.callbackNode!==n)return null;var r=q;return r=tt(e,e===G?r:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r===0?null:(gu(e,r,t),sd(e,Fe()),e.callbackNode!=null&&e.callbackNode===n?cd.bind(null,e):null)}function ld(e,t){if(Hu())return null;gu(e,t,!0)}function ud(){Yd(function(){W&6?je(Le,ad):od()})}function dd(){if(nd===0){var e=ya;e===0&&(e=Ze,Ze<<=1,!(Ze&261888)&&(Ze=256)),nd=e}return nd}function fd(e){return e==null||typeof e==`symbol`||typeof e==`boolean`?null:typeof e==`function`?e:cn(``+e)}function pd(e,t){var n=t.ownerDocument.createElement(`input`);return n.name=t.name,n.value=t.value,e.id&&n.setAttribute(`form`,e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function md(e,t,n,r,i){if(t===`submit`&&n&&n.stateNode===i){var a=fd((i[_t]||null).action),o=r.submitter;o&&(t=(t=o[_t]||null)?fd(t.formAction):o.getAttribute(`formAction`),t!==null&&(a=t,o=null));var s=new An(`action`,`action`,null,r,i);e.push({event:s,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(nd!==0){var e=o?pd(i,o):new FormData(i);ks(n,{pending:!0,data:e,method:i.method,action:a},null,e)}}else typeof a==`function`&&(s.preventDefault(),e=o?pd(i,o):new FormData(i),ks(n,{pending:!0,data:e,method:i.method,action:a},a,e))},currentTarget:i}]})}}for(var hd=0;hd<ri.length;hd++){var gd=ri[hd];ii(gd.toLowerCase(),`on`+(gd[0].toUpperCase()+gd.slice(1)))}ii(Yr,`onAnimationEnd`),ii(Xr,`onAnimationIteration`),ii(Zr,`onAnimationStart`),ii(`dblclick`,`onDoubleClick`),ii(`focusin`,`onFocus`),ii(`focusout`,`onBlur`),ii(Qr,`onTransitionRun`),ii($r,`onTransitionStart`),ii(ei,`onTransitionCancel`),ii(ti,`onTransitionEnd`),Mt(`onMouseEnter`,[`mouseout`,`mouseover`]),Mt(`onMouseLeave`,[`mouseout`,`mouseover`]),Mt(`onPointerEnter`,[`pointerout`,`pointerover`]),Mt(`onPointerLeave`,[`pointerout`,`pointerover`]),jt(`onChange`,`change click focusin focusout input keydown keyup selectionchange`.split(` `)),jt(`onSelect`,`focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange`.split(` `)),jt(`onBeforeInput`,[`compositionend`,`keypress`,`textInput`,`paste`]),jt(`onCompositionEnd`,`compositionend focusout keydown keypress keyup mousedown`.split(` `)),jt(`onCompositionStart`,`compositionstart focusout keydown keypress keyup mousedown`.split(` `)),jt(`onCompositionUpdate`,`compositionupdate focusout keydown keypress keyup mousedown`.split(` `));var _d=`abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting`.split(` `),vd=new Set(`beforetoggle cancel close invalid load scroll scrollend toggle`.split(` `).concat(_d));function yd(e,t){t=(t&4)!=0;for(var n=0;n<e.length;n++){var r=e[n],i=r.event;r=r.listeners;a:{var a=void 0;if(t)for(var o=r.length-1;0<=o;o--){var s=r[o],c=s.instance,l=s.currentTarget;if(s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){ai(e)}i.currentTarget=null,a=c}else for(o=0;o<r.length;o++){if(s=r[o],c=s.instance,l=s.currentTarget,s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){ai(e)}i.currentTarget=null,a=c}}}}function Q(e,t){var n=t[yt];n===void 0&&(n=t[yt]=new Set);var r=e+`__bubble`;n.has(r)||(Cd(t,e,2,!1),n.add(r))}function bd(e,t,n){var r=0;t&&(r|=4),Cd(n,e,r,t)}var xd=`_reactListening`+Math.random().toString(36).slice(2);function Sd(e){if(!e[xd]){e[xd]=!0,kt.forEach(function(t){t!==`selectionchange`&&(vd.has(t)||bd(t,!1,e),bd(t,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[xd]||(t[xd]=!0,bd(`selectionchange`,!1,t))}}function Cd(e,t,n,r){switch(mp(t)){case 2:var i=cp;break;case 8:i=lp;break;default:i=up}n=i.bind(null,t,n,e),i=void 0,!yn||t!==`touchstart`&&t!==`touchmove`&&t!==`wheel`||(i=!0),r?i===void 0?e.addEventListener(t,n,!0):e.addEventListener(t,n,{capture:!0,passive:i}):i===void 0?e.addEventListener(t,n,!1):e.addEventListener(t,n,{passive:i})}function wd(e,t,n,r,i){var a=r;if(!(t&1)&&!(t&2)&&r!==null)a:for(;;){if(r===null)return;var o=r.tag;if(o===3||o===4){var s=r.stateNode.containerInfo;if(s===i)break;if(o===4)for(o=r.return;o!==null;){var c=o.tag;if((c===3||c===4)&&o.stateNode.containerInfo===i)return;o=o.return}for(;s!==null;){if(o=Tt(s),o===null)return;if(c=o.tag,c===5||c===6||c===26||c===27){r=a=o;continue a}s=s.parentNode}}r=r.return}gn(function(){var r=a,i=dn(n),o=[];a:{var s=ni.get(e);if(s!==void 0){var c=An,u=e;switch(e){case`keypress`:if(Tn(n)===0)break a;case`keydown`:case`keyup`:c=Jn;break;case`focusin`:u=`focus`,c=zn;break;case`focusout`:u=`blur`,c=zn;break;case`beforeblur`:case`afterblur`:c=zn;break;case`click`:if(n.button===2)break a;case`auxclick`:case`dblclick`:case`mousedown`:case`mousemove`:case`mouseup`:case`mouseout`:case`mouseover`:case`contextmenu`:c=Ln;break;case`drag`:case`dragend`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`dragstart`:case`drop`:c=Rn;break;case`touchcancel`:case`touchend`:case`touchmove`:case`touchstart`:c=Xn;break;case Yr:case Xr:case Zr:c=Bn;break;case ti:c=Zn;break;case`scroll`:case`scrollend`:c=Mn;break;case`wheel`:c=Qn;break;case`copy`:case`cut`:case`paste`:c=Vn;break;case`gotpointercapture`:case`lostpointercapture`:case`pointercancel`:case`pointerdown`:case`pointermove`:case`pointerout`:case`pointerover`:case`pointerup`:c=Yn;break;case`toggle`:case`beforetoggle`:c=$n}var d=(t&4)!=0,f=!d&&(e===`scroll`||e===`scrollend`),p=d?s===null?null:s+`Capture`:s;d=[];for(var m=r,h;m!==null;){var g=m;if(h=g.stateNode,g=g.tag,g!==5&&g!==26&&g!==27||h===null||p===null||(g=_n(m,p),g!=null&&d.push(Td(m,g,h))),f)break;m=m.return}0<d.length&&(s=new c(s,u,null,n,i),o.push({event:s,listeners:d}))}}if(!(t&7)){a:{if(s=e===`mouseover`||e===`pointerover`,c=e===`mouseout`||e===`pointerout`,s&&n!==un&&(u=n.relatedTarget||n.fromElement)&&(Tt(u)||u[vt]))break a;if((c||s)&&(s=i.window===i?i:(s=i.ownerDocument)?s.defaultView||s.parentWindow:window,c?(u=n.relatedTarget||n.toElement,c=r,u=u?Tt(u):null,u!==null&&(f=l(u),d=u.tag,u!==f||d!==5&&d!==27&&d!==6)&&(u=null)):(c=null,u=r),c!==u)){if(d=Ln,g=`onMouseLeave`,p=`onMouseEnter`,m=`mouse`,(e===`pointerout`||e===`pointerover`)&&(d=Yn,g=`onPointerLeave`,p=`onPointerEnter`,m=`pointer`),f=c==null?s:Dt(c),h=u==null?s:Dt(u),s=new d(g,m+`leave`,c,n,i),s.target=f,s.relatedTarget=h,g=null,Tt(i)===r&&(d=new d(p,m+`enter`,u,n,i),d.target=h,d.relatedTarget=f,g=d),f=g,c&&u)b:{for(d=Dd,p=c,m=u,h=0,g=p;g;g=d(g))h++;g=0;for(var _=m;_;_=d(_))g++;for(;0<h-g;)p=d(p),h--;for(;0<g-h;)m=d(m),g--;for(;h--;){if(p===m||m!==null&&p===m.alternate){d=p;break b}p=d(p),m=d(m)}d=null}else d=null;c!==null&&Od(o,s,c,d,!1),u!==null&&f!==null&&Od(o,f,u,d,!0)}}a:{if(s=r?Dt(r):window,c=s.nodeName&&s.nodeName.toLowerCase(),c===`select`||c===`input`&&s.type===`file`)var v=yr;else if(pr(s))if(br)v=kr;else{v=Dr;var y=Er}else c=s.nodeName,!c||c.toLowerCase()!==`input`||s.type!==`checkbox`&&s.type!==`radio`?r&&an(r.elementType)&&(v=yr):v=Or;if(v&&=v(e,r)){mr(o,v,n,i);break a}y&&y(e,s,r),e===`focusout`&&r&&s.type===`number`&&r.memoizedProps.value!=null&&Xt(s,`number`,s.value)}switch(y=r?Dt(r):window,e){case`focusin`:(pr(y)||y.contentEditable===`true`)&&(zr=y,Br=r,Vr=null);break;case`focusout`:Vr=Br=zr=null;break;case`mousedown`:Hr=!0;break;case`contextmenu`:case`mouseup`:case`dragend`:Hr=!1,Ur(o,n,i);break;case`selectionchange`:if(Rr)break;case`keydown`:case`keyup`:Ur(o,n,i)}var b;if(tr)b:{switch(e){case`compositionstart`:var x=`onCompositionStart`;break b;case`compositionend`:x=`onCompositionEnd`;break b;case`compositionupdate`:x=`onCompositionUpdate`;break b}x=void 0}else lr?sr(e,n)&&(x=`onCompositionEnd`):e===`keydown`&&n.keyCode===229&&(x=`onCompositionStart`);x&&(ir&&n.locale!==`ko`&&(lr||x!==`onCompositionStart`?x===`onCompositionEnd`&&lr&&(b=wn()):(xn=i,Sn=`value`in xn?xn.value:xn.textContent,lr=!0)),y=Ed(r,x),0<y.length&&(x=new Hn(x,e,null,n,i),o.push({event:x,listeners:y}),b?x.data=b:(b=cr(n),b!==null&&(x.data=b)))),(b=rr?ur(e,n):dr(e,n))&&(x=Ed(r,`onBeforeInput`),0<x.length&&(y=new Hn(`onBeforeInput`,`beforeinput`,null,n,i),o.push({event:y,listeners:x}),y.data=b)),md(o,e,r,n,i)}yd(o,t)})}function Td(e,t,n){return{instance:e,listener:t,currentTarget:n}}function Ed(e,t){for(var n=t+`Capture`,r=[];e!==null;){var i=e,a=i.stateNode;if(i=i.tag,i!==5&&i!==26&&i!==27||a===null||(i=_n(e,n),i!=null&&r.unshift(Td(e,i,a)),i=_n(e,t),i!=null&&r.push(Td(e,i,a))),e.tag===3)return r;e=e.return}return[]}function Dd(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Od(e,t,n,r,i){for(var a=t._reactName,o=[];n!==null&&n!==r;){var s=n,c=s.alternate,l=s.stateNode;if(s=s.tag,c!==null&&c===r)break;s!==5&&s!==26&&s!==27||l===null||(c=l,i?(l=_n(n,a),l!=null&&o.unshift(Td(n,l,c))):i||(l=_n(n,a),l!=null&&o.push(Td(n,l,c)))),n=n.return}o.length!==0&&e.push({event:t,listeners:o})}var kd=/\r\n?/g,Ad=/\u0000|\uFFFD/g;function jd(e){return(typeof e==`string`?e:``+e).replace(kd,`
`).replace(Ad,``)}function Md(e,t){return t=jd(t),jd(e)===t}function $(e,t,n,r,i,a){switch(n){case`children`:typeof r==`string`?t===`body`||t===`textarea`&&r===``||en(e,r):(typeof r==`number`||typeof r==`bigint`)&&t!==`body`&&en(e,``+r);break;case`className`:Rt(e,`class`,r);break;case`tabIndex`:Rt(e,`tabindex`,r);break;case`dir`:case`role`:case`viewBox`:case`width`:case`height`:Rt(e,n,r);break;case`style`:rn(e,r,a);break;case`data`:if(t!==`object`){Rt(e,`data`,r);break}case`src`:case`href`:if(r===``&&(t!==`a`||n!==`href`)){e.removeAttribute(n);break}if(r==null||typeof r==`function`||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=cn(``+r),e.setAttribute(n,r);break;case`action`:case`formAction`:if(typeof r==`function`){e.setAttribute(n,`javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')`);break}else typeof a==`function`&&(n===`formAction`?(t!==`input`&&$(e,t,`name`,i.name,i,null),$(e,t,`formEncType`,i.formEncType,i,null),$(e,t,`formMethod`,i.formMethod,i,null),$(e,t,`formTarget`,i.formTarget,i,null)):($(e,t,`encType`,i.encType,i,null),$(e,t,`method`,i.method,i,null),$(e,t,`target`,i.target,i,null)));if(r==null||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=cn(``+r),e.setAttribute(n,r);break;case`onClick`:r!=null&&(e.onclick=ln);break;case`onScroll`:r!=null&&Q(`scroll`,e);break;case`onScrollEnd`:r!=null&&Q(`scrollend`,e);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(s(61));if(n=r.__html,n!=null){if(i.children!=null)throw Error(s(60));e.innerHTML=n}}break;case`multiple`:e.multiple=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`muted`:e.muted=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`defaultValue`:case`defaultChecked`:case`innerHTML`:case`ref`:break;case`autoFocus`:break;case`xlinkHref`:if(r==null||typeof r==`function`||typeof r==`boolean`||typeof r==`symbol`){e.removeAttribute(`xlink:href`);break}n=cn(``+r),e.setAttributeNS(`http://www.w3.org/1999/xlink`,`xlink:href`,n);break;case`contentEditable`:case`spellCheck`:case`draggable`:case`value`:case`autoReverse`:case`externalResourcesRequired`:case`focusable`:case`preserveAlpha`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``+r):e.removeAttribute(n);break;case`inert`:case`allowFullScreen`:case`async`:case`autoPlay`:case`controls`:case`default`:case`defer`:case`disabled`:case`disablePictureInPicture`:case`disableRemotePlayback`:case`formNoValidate`:case`hidden`:case`loop`:case`noModule`:case`noValidate`:case`open`:case`playsInline`:case`readOnly`:case`required`:case`reversed`:case`scoped`:case`seamless`:case`itemScope`:r&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``):e.removeAttribute(n);break;case`capture`:case`download`:!0===r?e.setAttribute(n,``):!1!==r&&r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,r):e.removeAttribute(n);break;case`cols`:case`rows`:case`size`:case`span`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`&&!isNaN(r)&&1<=r?e.setAttribute(n,r):e.removeAttribute(n);break;case`rowSpan`:case`start`:r==null||typeof r==`function`||typeof r==`symbol`||isNaN(r)?e.removeAttribute(n):e.setAttribute(n,r);break;case`popover`:Q(`beforetoggle`,e),Q(`toggle`,e),Lt(e,`popover`,r);break;case`xlinkActuate`:zt(e,`http://www.w3.org/1999/xlink`,`xlink:actuate`,r);break;case`xlinkArcrole`:zt(e,`http://www.w3.org/1999/xlink`,`xlink:arcrole`,r);break;case`xlinkRole`:zt(e,`http://www.w3.org/1999/xlink`,`xlink:role`,r);break;case`xlinkShow`:zt(e,`http://www.w3.org/1999/xlink`,`xlink:show`,r);break;case`xlinkTitle`:zt(e,`http://www.w3.org/1999/xlink`,`xlink:title`,r);break;case`xlinkType`:zt(e,`http://www.w3.org/1999/xlink`,`xlink:type`,r);break;case`xmlBase`:zt(e,`http://www.w3.org/XML/1998/namespace`,`xml:base`,r);break;case`xmlLang`:zt(e,`http://www.w3.org/XML/1998/namespace`,`xml:lang`,r);break;case`xmlSpace`:zt(e,`http://www.w3.org/XML/1998/namespace`,`xml:space`,r);break;case`is`:Lt(e,`is`,r);break;case`innerText`:case`textContent`:break;default:(!(2<n.length)||n[0]!==`o`&&n[0]!==`O`||n[1]!==`n`&&n[1]!==`N`)&&(n=on.get(n)||n,Lt(e,n,r))}}function Nd(e,t,n,r,i,a){switch(n){case`style`:rn(e,r,a);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(s(61));if(n=r.__html,n!=null){if(i.children!=null)throw Error(s(60));e.innerHTML=n}}break;case`children`:typeof r==`string`?en(e,r):(typeof r==`number`||typeof r==`bigint`)&&en(e,``+r);break;case`onScroll`:r!=null&&Q(`scroll`,e);break;case`onScrollEnd`:r!=null&&Q(`scrollend`,e);break;case`onClick`:r!=null&&(e.onclick=ln);break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`innerHTML`:case`ref`:break;case`innerText`:case`textContent`:break;default:if(!At.hasOwnProperty(n))a:{if(n[0]===`o`&&n[1]===`n`&&(i=n.endsWith(`Capture`),t=n.slice(2,i?n.length-7:void 0),a=e[_t]||null,a=a==null?null:a[n],typeof a==`function`&&e.removeEventListener(t,a,i),typeof r==`function`)){typeof a!=`function`&&a!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,r,i);break a}n in e?e[n]=r:!0===r?e.setAttribute(n,``):Lt(e,n,r)}}}function Pd(e,t,n){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`img`:Q(`error`,e),Q(`load`,e);var r=!1,i=!1,a;for(a in n)if(n.hasOwnProperty(a)){var o=n[a];if(o!=null)switch(a){case`src`:r=!0;break;case`srcSet`:i=!0;break;case`children`:case`dangerouslySetInnerHTML`:throw Error(s(137,t));default:$(e,t,a,o,n,null)}}i&&$(e,t,`srcSet`,n.srcSet,n,null),r&&$(e,t,`src`,n.src,n,null);return;case`input`:Q(`invalid`,e);var c=a=o=i=null,l=null,u=null;for(r in n)if(n.hasOwnProperty(r)){var d=n[r];if(d!=null)switch(r){case`name`:i=d;break;case`type`:o=d;break;case`checked`:l=d;break;case`defaultChecked`:u=d;break;case`value`:a=d;break;case`defaultValue`:c=d;break;case`children`:case`dangerouslySetInnerHTML`:if(d!=null)throw Error(s(137,t));break;default:$(e,t,r,d,n,null)}}Yt(e,a,c,l,u,o,i,!1);return;case`select`:for(i in Q(`invalid`,e),r=o=a=null,n)if(n.hasOwnProperty(i)&&(c=n[i],c!=null))switch(i){case`value`:a=c;break;case`defaultValue`:o=c;break;case`multiple`:r=c;default:$(e,t,i,c,n,null)}t=a,n=o,e.multiple=!!r,t==null?n!=null&&Zt(e,!!r,n,!0):Zt(e,!!r,t,!1);return;case`textarea`:for(o in Q(`invalid`,e),a=i=r=null,n)if(n.hasOwnProperty(o)&&(c=n[o],c!=null))switch(o){case`value`:r=c;break;case`defaultValue`:i=c;break;case`children`:a=c;break;case`dangerouslySetInnerHTML`:if(c!=null)throw Error(s(91));break;default:$(e,t,o,c,n,null)}$t(e,r,i,a);return;case`option`:for(l in n)if(n.hasOwnProperty(l)&&(r=n[l],r!=null))switch(l){case`selected`:e.selected=r&&typeof r!=`function`&&typeof r!=`symbol`;break;default:$(e,t,l,r,n,null)}return;case`dialog`:Q(`beforetoggle`,e),Q(`toggle`,e),Q(`cancel`,e),Q(`close`,e);break;case`iframe`:case`object`:Q(`load`,e);break;case`video`:case`audio`:for(r=0;r<_d.length;r++)Q(_d[r],e);break;case`image`:Q(`error`,e),Q(`load`,e);break;case`details`:Q(`toggle`,e);break;case`embed`:case`source`:case`link`:Q(`error`,e),Q(`load`,e);case`area`:case`base`:case`br`:case`col`:case`hr`:case`keygen`:case`meta`:case`param`:case`track`:case`wbr`:case`menuitem`:for(u in n)if(n.hasOwnProperty(u)&&(r=n[u],r!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:throw Error(s(137,t));default:$(e,t,u,r,n,null)}return;default:if(an(t)){for(d in n)n.hasOwnProperty(d)&&(r=n[d],r!==void 0&&Nd(e,t,d,r,n,void 0));return}}for(c in n)n.hasOwnProperty(c)&&(r=n[c],r!=null&&$(e,t,c,r,n,null))}function Fd(e,t,n,r){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`input`:var i=null,a=null,o=null,c=null,l=null,u=null,d=null;for(m in n){var f=n[m];if(n.hasOwnProperty(m)&&f!=null)switch(m){case`checked`:break;case`value`:break;case`defaultValue`:l=f;default:r.hasOwnProperty(m)||$(e,t,m,null,r,f)}}for(var p in r){var m=r[p];if(f=n[p],r.hasOwnProperty(p)&&(m!=null||f!=null))switch(p){case`type`:a=m;break;case`name`:i=m;break;case`checked`:u=m;break;case`defaultChecked`:d=m;break;case`value`:o=m;break;case`defaultValue`:c=m;break;case`children`:case`dangerouslySetInnerHTML`:if(m!=null)throw Error(s(137,t));break;default:m!==f&&$(e,t,p,m,r,f)}}Jt(e,o,c,l,u,d,a,i);return;case`select`:for(a in m=o=c=p=null,n)if(l=n[a],n.hasOwnProperty(a)&&l!=null)switch(a){case`value`:break;case`multiple`:m=l;default:r.hasOwnProperty(a)||$(e,t,a,null,r,l)}for(i in r)if(a=r[i],l=n[i],r.hasOwnProperty(i)&&(a!=null||l!=null))switch(i){case`value`:p=a;break;case`defaultValue`:c=a;break;case`multiple`:o=a;default:a!==l&&$(e,t,i,a,r,l)}t=c,n=o,r=m,p==null?!!r!=!!n&&(t==null?Zt(e,!!n,n?[]:``,!1):Zt(e,!!n,t,!0)):Zt(e,!!n,p,!1);return;case`textarea`:for(c in m=p=null,n)if(i=n[c],n.hasOwnProperty(c)&&i!=null&&!r.hasOwnProperty(c))switch(c){case`value`:break;case`children`:break;default:$(e,t,c,null,r,i)}for(o in r)if(i=r[o],a=n[o],r.hasOwnProperty(o)&&(i!=null||a!=null))switch(o){case`value`:p=i;break;case`defaultValue`:m=i;break;case`children`:break;case`dangerouslySetInnerHTML`:if(i!=null)throw Error(s(91));break;default:i!==a&&$(e,t,o,i,r,a)}Qt(e,p,m);return;case`option`:for(var h in n)if(p=n[h],n.hasOwnProperty(h)&&p!=null&&!r.hasOwnProperty(h))switch(h){case`selected`:e.selected=!1;break;default:$(e,t,h,null,r,p)}for(l in r)if(p=r[l],m=n[l],r.hasOwnProperty(l)&&p!==m&&(p!=null||m!=null))switch(l){case`selected`:e.selected=p&&typeof p!=`function`&&typeof p!=`symbol`;break;default:$(e,t,l,p,r,m)}return;case`img`:case`link`:case`area`:case`base`:case`br`:case`col`:case`embed`:case`hr`:case`keygen`:case`meta`:case`param`:case`source`:case`track`:case`wbr`:case`menuitem`:for(var g in n)p=n[g],n.hasOwnProperty(g)&&p!=null&&!r.hasOwnProperty(g)&&$(e,t,g,null,r,p);for(u in r)if(p=r[u],m=n[u],r.hasOwnProperty(u)&&p!==m&&(p!=null||m!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:if(p!=null)throw Error(s(137,t));break;default:$(e,t,u,p,r,m)}return;default:if(an(t)){for(var _ in n)p=n[_],n.hasOwnProperty(_)&&p!==void 0&&!r.hasOwnProperty(_)&&Nd(e,t,_,void 0,r,p);for(d in r)p=r[d],m=n[d],!r.hasOwnProperty(d)||p===m||p===void 0&&m===void 0||Nd(e,t,d,p,r,m);return}}for(var v in n)p=n[v],n.hasOwnProperty(v)&&p!=null&&!r.hasOwnProperty(v)&&$(e,t,v,null,r,p);for(f in r)p=r[f],m=n[f],!r.hasOwnProperty(f)||p===m||p==null&&m==null||$(e,t,f,p,r,m)}function Id(e){switch(e){case`css`:case`script`:case`font`:case`img`:case`image`:case`input`:case`link`:return!0;default:return!1}}function Ld(){if(typeof performance.getEntriesByType==`function`){for(var e=0,t=0,n=performance.getEntriesByType(`resource`),r=0;r<n.length;r++){var i=n[r],a=i.transferSize,o=i.initiatorType,s=i.duration;if(a&&s&&Id(o)){for(o=0,s=i.responseEnd,r+=1;r<n.length;r++){var c=n[r],l=c.startTime;if(l>s)break;var u=c.transferSize,d=c.initiatorType;u&&Id(d)&&(c=c.responseEnd,o+=u*(c<s?1:(s-l)/(c-l)))}if(--r,t+=8*(a+o)/(i.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e==`number`)?e:5}var Rd=null,zd=null;function Bd(e){return e.nodeType===9?e:e.ownerDocument}function Vd(e){switch(e){case`http://www.w3.org/2000/svg`:return 1;case`http://www.w3.org/1998/Math/MathML`:return 2;default:return 0}}function Hd(e,t){if(e===0)switch(t){case`svg`:return 1;case`math`:return 2;default:return 0}return e===1&&t===`foreignObject`?0:e}function Ud(e,t){return e===`textarea`||e===`noscript`||typeof t.children==`string`||typeof t.children==`number`||typeof t.children==`bigint`||typeof t.dangerouslySetInnerHTML==`object`&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Wd=null;function Gd(){var e=window.event;return e&&e.type===`popstate`?e===Wd?!1:(Wd=e,!0):(Wd=null,!1)}var Kd=typeof setTimeout==`function`?setTimeout:void 0,qd=typeof clearTimeout==`function`?clearTimeout:void 0,Jd=typeof Promise==`function`?Promise:void 0,Yd=typeof queueMicrotask==`function`?queueMicrotask:Jd===void 0?Kd:function(e){return Jd.resolve(null).then(e).catch(Xd)};function Xd(e){setTimeout(function(){throw e})}function Zd(e){return e===`head`}function Qd(e,t){var n=t,r=0;do{var i=n.nextSibling;if(e.removeChild(n),i&&i.nodeType===8)if(n=i.data,n===`/$`||n===`/&`){if(r===0){e.removeChild(i),Np(t);return}r--}else if(n===`$`||n===`$?`||n===`$~`||n===`$!`||n===`&`)r++;else if(n===`html`)pf(e.ownerDocument.documentElement);else if(n===`head`){n=e.ownerDocument.head,pf(n);for(var a=n.firstChild;a;){var o=a.nextSibling,s=a.nodeName;a[Ct]||s===`SCRIPT`||s===`STYLE`||s===`LINK`&&a.rel.toLowerCase()===`stylesheet`||n.removeChild(a),a=o}}else n===`body`&&pf(e.ownerDocument.body);n=i}while(n);Np(t)}function $d(e,t){var n=e;e=0;do{var r=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display=`none`):(n.style.display=n._stashedDisplay||``,n.getAttribute(`style`)===``&&n.removeAttribute(`style`)):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=``):n.nodeValue=n._stashedText||``),r&&r.nodeType===8)if(n=r.data,n===`/$`){if(e===0)break;e--}else n!==`$`&&n!==`$?`&&n!==`$~`&&n!==`$!`||e++;n=r}while(n)}function ef(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case`HTML`:case`HEAD`:case`BODY`:ef(n),wt(n);continue;case`SCRIPT`:case`STYLE`:continue;case`LINK`:if(n.rel.toLowerCase()===`stylesheet`)continue}e.removeChild(n)}}function tf(e,t,n,r){for(;e.nodeType===1;){var i=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!r&&(e.nodeName!==`INPUT`||e.type!==`hidden`))break}else if(!r)if(t===`input`&&e.type===`hidden`){var a=i.name==null?null:``+i.name;if(i.type===`hidden`&&e.getAttribute(`name`)===a)return e}else return e;else if(!e[Ct])switch(t){case`meta`:if(!e.hasAttribute(`itemprop`))break;return e;case`link`:if(a=e.getAttribute(`rel`),a===`stylesheet`&&e.hasAttribute(`data-precedence`)||a!==i.rel||e.getAttribute(`href`)!==(i.href==null||i.href===``?null:i.href)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin)||e.getAttribute(`title`)!==(i.title==null?null:i.title))break;return e;case`style`:if(e.hasAttribute(`data-precedence`))break;return e;case`script`:if(a=e.getAttribute(`src`),(a!==(i.src==null?null:i.src)||e.getAttribute(`type`)!==(i.type==null?null:i.type)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin))&&a&&e.hasAttribute(`async`)&&!e.hasAttribute(`itemprop`))break;return e;default:return e}if(e=cf(e.nextSibling),e===null)break}return null}function nf(e,t,n){if(t===``)return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!n||(e=cf(e.nextSibling),e===null))return null;return e}function rf(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!t||(e=cf(e.nextSibling),e===null))return null;return e}function af(e){return e.data===`$?`||e.data===`$~`}function of(e){return e.data===`$!`||e.data===`$?`&&e.ownerDocument.readyState!==`loading`}function sf(e,t){var n=e.ownerDocument;if(e.data===`$~`)e._reactRetry=t;else if(e.data!==`$?`||n.readyState!==`loading`)t();else{var r=function(){t(),n.removeEventListener(`DOMContentLoaded`,r)};n.addEventListener(`DOMContentLoaded`,r),e._reactRetry=r}}function cf(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t===`$`||t===`$!`||t===`$?`||t===`$~`||t===`&`||t===`F!`||t===`F`)break;if(t===`/$`||t===`/&`)return null}}return e}var lf=null;function uf(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`/$`||n===`/&`){if(t===0)return cf(e.nextSibling);t--}else n!==`$`&&n!==`$!`&&n!==`$?`&&n!==`$~`&&n!==`&`||t++}e=e.nextSibling}return null}function df(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`$`||n===`$!`||n===`$?`||n===`$~`||n===`&`){if(t===0)return e;t--}else n!==`/$`&&n!==`/&`||t++}e=e.previousSibling}return null}function ff(e,t,n){switch(t=Bd(n),e){case`html`:if(e=t.documentElement,!e)throw Error(s(452));return e;case`head`:if(e=t.head,!e)throw Error(s(453));return e;case`body`:if(e=t.body,!e)throw Error(s(454));return e;default:throw Error(s(451))}}function pf(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);wt(e)}var mf=new Map,hf=new Set;function gf(e){return typeof e.getRootNode==`function`?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var _f=E.d;E.d={f:vf,r:yf,D:Sf,C:Cf,L:wf,m:Tf,X:Df,S:Ef,M:Of};function vf(){var e=_f.f(),t=bu();return e||t}function yf(e){var t=Et(e);t!==null&&t.tag===5&&t.type===`form`?js(t):_f.r(e)}var bf=typeof document>`u`?null:document;function xf(e,t,n){var r=bf;if(r&&typeof t==`string`&&t){var i=qt(t);i=`link[rel="`+e+`"][href="`+i+`"]`,typeof n==`string`&&(i+=`[crossorigin="`+n+`"]`),hf.has(i)||(hf.add(i),e={rel:e,crossOrigin:n,href:t},r.querySelector(i)===null&&(t=r.createElement(`link`),Pd(t,`link`,e),k(t),r.head.appendChild(t)))}}function Sf(e){_f.D(e),xf(`dns-prefetch`,e,null)}function Cf(e,t){_f.C(e,t),xf(`preconnect`,e,t)}function wf(e,t,n){_f.L(e,t,n);var r=bf;if(r&&e&&t){var i=`link[rel="preload"][as="`+qt(t)+`"]`;t===`image`&&n&&n.imageSrcSet?(i+=`[imagesrcset="`+qt(n.imageSrcSet)+`"]`,typeof n.imageSizes==`string`&&(i+=`[imagesizes="`+qt(n.imageSizes)+`"]`)):i+=`[href="`+qt(e)+`"]`;var a=i;switch(t){case`style`:a=Af(e);break;case`script`:a=Pf(e)}mf.has(a)||(e=h({rel:`preload`,href:t===`image`&&n&&n.imageSrcSet?void 0:e,as:t},n),mf.set(a,e),r.querySelector(i)!==null||t===`style`&&r.querySelector(jf(a))||t===`script`&&r.querySelector(Ff(a))||(t=r.createElement(`link`),Pd(t,`link`,e),k(t),r.head.appendChild(t)))}}function Tf(e,t){_f.m(e,t);var n=bf;if(n&&e){var r=t&&typeof t.as==`string`?t.as:`script`,i=`link[rel="modulepreload"][as="`+qt(r)+`"][href="`+qt(e)+`"]`,a=i;switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:a=Pf(e)}if(!mf.has(a)&&(e=h({rel:`modulepreload`,href:e},t),mf.set(a,e),n.querySelector(i)===null)){switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:if(n.querySelector(Ff(a)))return}r=n.createElement(`link`),Pd(r,`link`,e),k(r),n.head.appendChild(r)}}}function Ef(e,t,n){_f.S(e,t,n);var r=bf;if(r&&e){var i=Ot(r).hoistableStyles,a=Af(e);t||=`default`;var o=i.get(a);if(!o){var s={loading:0,preload:null};if(o=r.querySelector(jf(a)))s.loading=5;else{e=h({rel:`stylesheet`,href:e,"data-precedence":t},n),(n=mf.get(a))&&Rf(e,n);var c=o=r.createElement(`link`);k(c),Pd(c,`link`,e),c._p=new Promise(function(e,t){c.onload=e,c.onerror=t}),c.addEventListener(`load`,function(){s.loading|=1}),c.addEventListener(`error`,function(){s.loading|=2}),s.loading|=4,Lf(o,t,r)}o={type:`stylesheet`,instance:o,count:1,state:s},i.set(a,o)}}}function Df(e,t){_f.X(e,t);var n=bf;if(n&&e){var r=Ot(n).hoistableScripts,i=Pf(e),a=r.get(i);a||(a=n.querySelector(Ff(i)),a||(e=h({src:e,async:!0},t),(t=mf.get(i))&&zf(e,t),a=n.createElement(`script`),k(a),Pd(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function Of(e,t){_f.M(e,t);var n=bf;if(n&&e){var r=Ot(n).hoistableScripts,i=Pf(e),a=r.get(i);a||(a=n.querySelector(Ff(i)),a||(e=h({src:e,async:!0,type:`module`},t),(t=mf.get(i))&&zf(e,t),a=n.createElement(`script`),k(a),Pd(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function kf(e,t,n,r){var i=(i=_e.current)?gf(i):null;if(!i)throw Error(s(446));switch(e){case`meta`:case`title`:return null;case`style`:return typeof n.precedence==`string`&&typeof n.href==`string`?(t=Af(n.href),n=Ot(i).hoistableStyles,r=n.get(t),r||(r={type:`style`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};case`link`:if(n.rel===`stylesheet`&&typeof n.href==`string`&&typeof n.precedence==`string`){e=Af(n.href);var a=Ot(i).hoistableStyles,o=a.get(e);if(o||(i=i.ownerDocument||i,o={type:`stylesheet`,instance:null,count:0,state:{loading:0,preload:null}},a.set(e,o),(a=i.querySelector(jf(e)))&&!a._p&&(o.instance=a,o.state.loading=5),mf.has(e)||(n={rel:`preload`,as:`style`,href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},mf.set(e,n),a||Nf(i,e,n,o.state))),t&&r===null)throw Error(s(528,``));return o}if(t&&r!==null)throw Error(s(529,``));return null;case`script`:return t=n.async,n=n.src,typeof n==`string`&&t&&typeof t!=`function`&&typeof t!=`symbol`?(t=Pf(n),n=Ot(i).hoistableScripts,r=n.get(t),r||(r={type:`script`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};default:throw Error(s(444,e))}}function Af(e){return`href="`+qt(e)+`"`}function jf(e){return`link[rel="stylesheet"][`+e+`]`}function Mf(e){return h({},e,{"data-precedence":e.precedence,precedence:null})}function Nf(e,t,n,r){e.querySelector(`link[rel="preload"][as="style"][`+t+`]`)?r.loading=1:(t=e.createElement(`link`),r.preload=t,t.addEventListener(`load`,function(){return r.loading|=1}),t.addEventListener(`error`,function(){return r.loading|=2}),Pd(t,`link`,n),k(t),e.head.appendChild(t))}function Pf(e){return`[src="`+qt(e)+`"]`}function Ff(e){return`script[async]`+e}function If(e,t,n){if(t.count++,t.instance===null)switch(t.type){case`style`:var r=e.querySelector(`style[data-href~="`+qt(n.href)+`"]`);if(r)return t.instance=r,k(r),r;var i=h({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return r=(e.ownerDocument||e).createElement(`style`),k(r),Pd(r,`style`,i),Lf(r,n.precedence,e),t.instance=r;case`stylesheet`:i=Af(n.href);var a=e.querySelector(jf(i));if(a)return t.state.loading|=4,t.instance=a,k(a),a;r=Mf(n),(i=mf.get(i))&&Rf(r,i),a=(e.ownerDocument||e).createElement(`link`),k(a);var o=a;return o._p=new Promise(function(e,t){o.onload=e,o.onerror=t}),Pd(a,`link`,r),t.state.loading|=4,Lf(a,n.precedence,e),t.instance=a;case`script`:return a=Pf(n.src),(i=e.querySelector(Ff(a)))?(t.instance=i,k(i),i):(r=n,(i=mf.get(a))&&(r=h({},n),zf(r,i)),e=e.ownerDocument||e,i=e.createElement(`script`),k(i),Pd(i,`link`,r),e.head.appendChild(i),t.instance=i);case`void`:return null;default:throw Error(s(443,t.type))}else t.type===`stylesheet`&&!(t.state.loading&4)&&(r=t.instance,t.state.loading|=4,Lf(r,n.precedence,e));return t.instance}function Lf(e,t,n){for(var r=n.querySelectorAll(`link[rel="stylesheet"][data-precedence],style[data-precedence]`),i=r.length?r[r.length-1]:null,a=i,o=0;o<r.length;o++){var s=r[o];if(s.dataset.precedence===t)a=s;else if(a!==i)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function Rf(e,t){e.crossOrigin??=t.crossOrigin,e.referrerPolicy??=t.referrerPolicy,e.title??=t.title}function zf(e,t){e.crossOrigin??=t.crossOrigin,e.referrerPolicy??=t.referrerPolicy,e.integrity??=t.integrity}var Bf=null;function Vf(e,t,n){if(Bf===null){var r=new Map,i=Bf=new Map;i.set(n,r)}else i=Bf,r=i.get(n),r||(r=new Map,i.set(n,r));if(r.has(e))return r;for(r.set(e,null),n=n.getElementsByTagName(e),i=0;i<n.length;i++){var a=n[i];if(!(a[Ct]||a[gt]||e===`link`&&a.getAttribute(`rel`)===`stylesheet`)&&a.namespaceURI!==`http://www.w3.org/2000/svg`){var o=a.getAttribute(t)||``;o=e+o;var s=r.get(o);s?s.push(a):r.set(o,[a])}}return r}function Hf(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t===`title`?e.querySelector(`head > title`):null)}function Uf(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case`meta`:case`title`:return!0;case`style`:if(typeof t.precedence!=`string`||typeof t.href!=`string`||t.href===``)break;return!0;case`link`:if(typeof t.rel!=`string`||typeof t.href!=`string`||t.href===``||t.onLoad||t.onError)break;switch(t.rel){case`stylesheet`:return e=t.disabled,typeof t.precedence==`string`&&e==null;default:return!0}case`script`:if(t.async&&typeof t.async!=`function`&&typeof t.async!=`symbol`&&!t.onLoad&&!t.onError&&t.src&&typeof t.src==`string`)return!0}return!1}function Wf(e){return!(e.type===`stylesheet`&&!(e.state.loading&3))}function Gf(e,t,n,r){if(n.type===`stylesheet`&&(typeof r.media!=`string`||!1!==matchMedia(r.media).matches)&&!(n.state.loading&4)){if(n.instance===null){var i=Af(r.href),a=t.querySelector(jf(i));if(a){t=a._p,typeof t==`object`&&t&&typeof t.then==`function`&&(e.count++,e=Jf.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,k(a);return}a=t.ownerDocument||t,r=Mf(r),(i=mf.get(i))&&Rf(r,i),a=a.createElement(`link`),k(a);var o=a;o._p=new Promise(function(e,t){o.onload=e,o.onerror=t}),Pd(a,`link`,r),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&!(n.state.loading&3)&&(e.count++,n=Jf.bind(e),t.addEventListener(`load`,n),t.addEventListener(`error`,n))}}var Kf=0;function qf(e,t){return e.stylesheets&&e.count===0&&Xf(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var r=setTimeout(function(){if(e.stylesheets&&Xf(e,e.stylesheets),e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}},6e4+t);0<e.imgBytes&&Kf===0&&(Kf=62500*Ld());var i=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Xf(e,e.stylesheets),e.unsuspend)){var t=e.unsuspend;e.unsuspend=null,t()}},(e.imgBytes>Kf?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(r),clearTimeout(i)}}:null}function Jf(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Xf(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Yf=null;function Xf(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Yf=new Map,t.forEach(Zf,e),Yf=null,Jf.call(e))}function Zf(e,t){if(!(t.state.loading&4)){var n=Yf.get(e);if(n)var r=n.get(null);else{n=new Map,Yf.set(e,n);for(var i=e.querySelectorAll(`link[data-precedence],style[data-precedence]`),a=0;a<i.length;a++){var o=i[a];(o.nodeName===`LINK`||o.getAttribute(`media`)!==`not all`)&&(n.set(o.dataset.precedence,o),r=o)}r&&n.set(null,r)}i=t.instance,o=i.getAttribute(`data-precedence`),a=n.get(o)||r,a===r&&n.set(null,i),n.set(o,i),this.count++,r=Jf.bind(this),i.addEventListener(`load`,r),i.addEventListener(`error`,r),a?a.parentNode.insertBefore(i,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(i,e.firstChild)),t.state.loading|=4}}var Qf={$$typeof:S,Provider:null,Consumer:null,_currentValue:de,_currentValue2:de,_threadCount:0};function $f(e,t,n,r,i,a,o,s,c){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=at(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=at(0),this.hiddenUpdates=at(null),this.identifierPrefix=r,this.onUncaughtError=i,this.onCaughtError=a,this.onRecoverableError=o,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=c,this.incompleteTransitions=new Map}function ep(e,t,n,r,i,a,o,s,c,l,u,d){return e=new $f(e,t,n,o,c,l,u,d,s),t=1,!0===a&&(t|=24),a=_i(3,null,null,t),e.current=a,a.stateNode=e,t=ha(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:r,isDehydrated:n,cache:t},Ja(a),e}function tp(e){return e?(e=hi,e):hi}function np(e,t,n,r,i,a){i=tp(i),r.context===null?r.context=i:r.pendingContext=i,r=Xa(t),r.payload={element:n},a=a===void 0?null:a,a!==null&&(r.callback=a),n=Za(e,r,t),n!==null&&(hu(n,e,t),Qa(n,e,t))}function rp(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function ip(e,t){rp(e,t),(e=e.alternate)&&rp(e,t)}function ap(e){if(e.tag===13||e.tag===31){var t=fi(e,67108864);t!==null&&hu(t,e,67108864),ip(e,67108864)}}function op(e){if(e.tag===13||e.tag===31){var t=pu();t=dt(t);var n=fi(e,t);n!==null&&hu(n,e,t),ip(e,t)}}var sp=!0;function cp(e,t,n,r){var i=T.T;T.T=null;var a=E.p;try{E.p=2,up(e,t,n,r)}finally{E.p=a,T.T=i}}function lp(e,t,n,r){var i=T.T;T.T=null;var a=E.p;try{E.p=8,up(e,t,n,r)}finally{E.p=a,T.T=i}}function up(e,t,n,r){if(sp){var i=dp(r);if(i===null)wd(e,t,r,fp,n),Cp(e,r);else if(Tp(i,e,t,n,r))r.stopPropagation();else if(Cp(e,r),t&4&&-1<Sp.indexOf(e)){for(;i!==null;){var a=Et(i);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var o=et(a.pendingLanes);if(o!==0){var s=a;for(s.pendingLanes|=2,s.entangledLanes|=2;o;){var c=1<<31-qe(o);s.entanglements[1]|=c,o&=~c}rd(a),!(W&6)&&(nu=Fe()+500,id(0,!1))}}break;case 31:case 13:s=fi(a,2),s!==null&&hu(s,a,2),bu(),ip(a,2)}if(a=dp(r),a===null&&wd(e,t,r,fp,n),a===i)break;i=a}i!==null&&r.stopPropagation()}else wd(e,t,r,null,n)}}function dp(e){return e=dn(e),pp(e)}var fp=null;function pp(e){if(fp=null,e=Tt(e),e!==null){var t=l(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=u(t),e!==null)return e;e=null}else if(n===31){if(e=d(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return fp=e,null}function mp(e){switch(e){case`beforetoggle`:case`cancel`:case`click`:case`close`:case`contextmenu`:case`copy`:case`cut`:case`auxclick`:case`dblclick`:case`dragend`:case`dragstart`:case`drop`:case`focusin`:case`focusout`:case`input`:case`invalid`:case`keydown`:case`keypress`:case`keyup`:case`mousedown`:case`mouseup`:case`paste`:case`pause`:case`play`:case`pointercancel`:case`pointerdown`:case`pointerup`:case`ratechange`:case`reset`:case`resize`:case`seeked`:case`submit`:case`toggle`:case`touchcancel`:case`touchend`:case`touchstart`:case`volumechange`:case`change`:case`selectionchange`:case`textInput`:case`compositionstart`:case`compositionend`:case`compositionupdate`:case`beforeblur`:case`afterblur`:case`beforeinput`:case`blur`:case`fullscreenchange`:case`focus`:case`hashchange`:case`popstate`:case`select`:case`selectstart`:return 2;case`drag`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`mousemove`:case`mouseout`:case`mouseover`:case`pointermove`:case`pointerout`:case`pointerover`:case`scroll`:case`touchmove`:case`wheel`:case`mouseenter`:case`mouseleave`:case`pointerenter`:case`pointerleave`:return 8;case`message`:switch(Ie()){case Le:return 2;case Re:return 8;case ze:case Be:return 32;case Ve:return 268435456;default:return 32}default:return 32}}var hp=!1,gp=null,_p=null,vp=null,yp=new Map,bp=new Map,xp=[],Sp=`mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset`.split(` `);function Cp(e,t){switch(e){case`focusin`:case`focusout`:gp=null;break;case`dragenter`:case`dragleave`:_p=null;break;case`mouseover`:case`mouseout`:vp=null;break;case`pointerover`:case`pointerout`:yp.delete(t.pointerId);break;case`gotpointercapture`:case`lostpointercapture`:bp.delete(t.pointerId)}}function wp(e,t,n,r,i,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:a,targetContainers:[i]},t!==null&&(t=Et(t),t!==null&&ap(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,i!==null&&t.indexOf(i)===-1&&t.push(i),e)}function Tp(e,t,n,r,i){switch(t){case`focusin`:return gp=wp(gp,e,t,n,r,i),!0;case`dragenter`:return _p=wp(_p,e,t,n,r,i),!0;case`mouseover`:return vp=wp(vp,e,t,n,r,i),!0;case`pointerover`:var a=i.pointerId;return yp.set(a,wp(yp.get(a)||null,e,t,n,r,i)),!0;case`gotpointercapture`:return a=i.pointerId,bp.set(a,wp(bp.get(a)||null,e,t,n,r,i)),!0}return!1}function Ep(e){var t=Tt(e.target);if(t!==null){var n=l(t);if(n!==null){if(t=n.tag,t===13){if(t=u(n),t!==null){e.blockedOn=t,mt(e.priority,function(){op(n)});return}}else if(t===31){if(t=d(n),t!==null){e.blockedOn=t,mt(e.priority,function(){op(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Dp(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=dp(e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);un=r,n.target.dispatchEvent(r),un=null}else return t=Et(n),t!==null&&ap(t),e.blockedOn=n,!1;t.shift()}return!0}function Op(e,t,n){Dp(e)&&n.delete(t)}function kp(){hp=!1,gp!==null&&Dp(gp)&&(gp=null),_p!==null&&Dp(_p)&&(_p=null),vp!==null&&Dp(vp)&&(vp=null),yp.forEach(Op),bp.forEach(Op)}function Ap(e,n){e.blockedOn===n&&(e.blockedOn=null,hp||(hp=!0,t.unstable_scheduleCallback(t.unstable_NormalPriority,kp)))}var jp=null;function Mp(e){jp!==e&&(jp=e,t.unstable_scheduleCallback(t.unstable_NormalPriority,function(){jp===e&&(jp=null);for(var t=0;t<e.length;t+=3){var n=e[t],r=e[t+1],i=e[t+2];if(typeof r!=`function`){if(pp(r||n)===null)continue;break}var a=Et(n);a!==null&&(e.splice(t,3),t-=3,ks(a,{pending:!0,data:i,method:n.method,action:r},r,i))}}))}function Np(e){function t(t){return Ap(t,e)}gp!==null&&Ap(gp,e),_p!==null&&Ap(_p,e),vp!==null&&Ap(vp,e),yp.forEach(t),bp.forEach(t);for(var n=0;n<xp.length;n++){var r=xp[n];r.blockedOn===e&&(r.blockedOn=null)}for(;0<xp.length&&(n=xp[0],n.blockedOn===null);)Ep(n),n.blockedOn===null&&xp.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(r=0;r<n.length;r+=3){var i=n[r],a=n[r+1],o=i[_t]||null;if(typeof a==`function`)o||Mp(n);else if(o){var s=null;if(a&&a.hasAttribute(`formAction`)){if(i=a,o=a[_t]||null)s=o.formAction;else if(pp(i)!==null)continue}else s=o.action;typeof s==`function`?n[r+1]=s:(n.splice(r,3),r-=3),Mp(n)}}}function Pp(){function e(e){e.canIntercept&&e.info===`react-transition`&&e.intercept({handler:function(){return new Promise(function(e){return i=e})},focusReset:`manual`,scroll:`manual`})}function t(){i!==null&&(i(),i=null),r||setTimeout(n,20)}function n(){if(!r&&!navigation.transition){var e=navigation.currentEntry;e&&e.url!=null&&navigation.navigate(e.url,{state:e.getState(),info:`react-transition`,history:`replace`})}}if(typeof navigation==`object`){var r=!1,i=null;return navigation.addEventListener(`navigate`,e),navigation.addEventListener(`navigatesuccess`,t),navigation.addEventListener(`navigateerror`,t),setTimeout(n,100),function(){r=!0,navigation.removeEventListener(`navigate`,e),navigation.removeEventListener(`navigatesuccess`,t),navigation.removeEventListener(`navigateerror`,t),i!==null&&(i(),i=null)}}}function Fp(e){this._internalRoot=e}Ip.prototype.render=Fp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(s(409));var n=t.current;np(n,pu(),e,t,null,null)},Ip.prototype.unmount=Fp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;np(e.current,2,null,e,null,null),bu(),t[vt]=null}};function Ip(e){this._internalRoot=e}Ip.prototype.unstable_scheduleHydration=function(e){if(e){var t=pt();e={blockedOn:null,target:e,priority:t};for(var n=0;n<xp.length&&t!==0&&t<xp[n].priority;n++);xp.splice(n,0,e),n===0&&Ep(e)}};var Lp=r.version;if(Lp!==`19.2.7`)throw Error(s(527,Lp,`19.2.7`));E.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render==`function`?Error(s(188)):(e=Object.keys(e).join(`,`),Error(s(268,e)));return e=p(t),e=e===null?null:m(e),e=e===null?null:e.stateNode,e};var Rp={bundleType:0,version:`19.2.7`,rendererPackageName:`react-dom`,currentDispatcherRef:T,reconcilerVersion:`19.2.7`};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`){var zp=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!zp.isDisabled&&zp.supportsFiber)try{We=zp.inject(Rp),Ge=zp}catch{}}e.createRoot=function(e,t){if(!c(e))throw Error(s(299));var n=!1,r=``,i=Qs,a=$s,o=ec;return t!=null&&(!0===t.unstable_strictMode&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onUncaughtError!==void 0&&(i=t.onUncaughtError),t.onCaughtError!==void 0&&(a=t.onCaughtError),t.onRecoverableError!==void 0&&(o=t.onRecoverableError)),t=ep(e,1,!1,null,null,n,r,null,i,a,o,Pp),e[vt]=t.current,Sd(e),new Fp(t)}})),c=e(((e,t)=>{function n(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>`u`||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!=`function`))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=s()})),l=n(),u=c(),d={id:`01`,title:`Wykład 01: Wstęp, Ekosystem JVM & System Typów`,description:`Wprowadzenie do języka Java, wirtualnej maszyny JVM, systemów budowania projektów (Maven, Gradle) oraz fundamentalnego systemu typów (typy proste i referencyjne).`,sections:[{title:`1. Język Java i platforma JVM`,content:'\nJęzyk Java został stworzony w firmie **Sun Microsystems** przez zespół pod kierownictwem **Jamesa Goslinga** i oficjalnie wydany w **1996 roku**. Od 2010 roku, po przejęciu Sun Microsystems, właścicielem i głównym deweloperem platformy jest **Oracle**. Filozofia Java opiera się na haśle **"Write Once, Run Anywhere" (WORA)**, co oznacza, że raz skompilowany program powinien działać bez zmian na dowolnej platformie sprzętowej i systemowej posiadającej środowisko uruchomieniowe Java.\n\nW przeciwieństwie do języków kompilowanych bezpośrednio do kodu maszynowego (jak C++), Java wykorzystuje architekturę dwuetapową:\n1. **Kompilacja**: Kod źródłowy (`.java`) jest kompilowany przez kompilator `javac` do kodu pośredniego, zwanego **kodem bajtowym (Bytecode)**, i zapisywany w plikach `.class`.\n2. **Uruchomienie**: Wirtualna Maszyna Javy (**JVM - Java Virtual Machine**) interpretuje lub kompiluje w locie kod bajtowy do kodu maszynowego konkretnego procesora.\n\n### Elementy Ekosystemu Java:\n* **JVM (Java Virtual Machine)**: Rdzeń platformy odpowiedzialny za wykonywanie kodu bajtowego, zarządzanie pamięcią (Garbage Collector), ładowanie klas i bezpieczeństwo.\n* **JRE (Java Runtime Environment)**: Środowisko uruchomieniowe. Zawiera JVM oraz standardowe biblioteki uruchomieniowe niezbędne do uruchomienia programu. Od Javy 11 JRE nie jest już dystrybuowane jako osobny pakiet instalacyjny – instaluje się pełne JDK.\n* **JDK (Java Development Kit)**: Zestaw narzędzi programistycznych. Zawiera JRE oraz narzędzia takie jak kompilator (`javac`), debugger (`jdb`), dokumentator (`javadoc`) i pakiety diagnostyczne.\n'},{title:`2. Jak działa kompilacja JIT i zarządzanie pamięcią`,content:`
Wykonanie kodu bajtowego przez JVM odbywa się na dwa sposoby w celu optymalizacji wydajności:
* **Interpretacja**: JVM czyta instrukcje kodu bajtowego jedna po drugiej i tłumaczy na instrukcje procesora. Jest to proces wolny.
* **Kompilacja JIT (Just-In-Time)**: Analizator JVM wykrywa tzw. "gorące sekcje" (hotspots) – często uruchamiane pętle lub metody. Kompilator JIT (np. C1 lub C2 w maszynie HotSpot) kompiluje te fragmenty bezpośrednio do wysoce zoptymalizowanego kodu maszynowego danej platformy i zapisuje je w pamięci podręcznej (Code Cache). Kolejne wywołania są wykonywane z prędkością kodu natywnego.

Zarządzaniem pamięcią zajmuje się **Garbage Collector (GC)**. Programista Java nie alokuje ani nie zwalnia pamięci ręcznie (nie ma operatora \`delete\` ani \`free\`). Obiekty są tworzone na stercie (Heap) za pomocą słowa kluczowego \`new\`, a GC automatycznie wykrywa i usuwa obiekty, do których nie prowadzą już referencje. Zapobiega to wyciekom pamięci (Memory Leaks) i błędom typu *use-after-free*, aczkolwiek może powodować krótkie pauzy w działaniu aplikacji (tzw. *Stop-The-World*).
`},{title:`3. Narzędzia budowania projektów: Maven i Gradle`,content:`
W ekosystemie Java standardem zarządzania projektami, zależnościami (bibliotekami zewnętrznymi) i cyklem życia aplikacji są systemy budowania. Dwa najpopularniejsze z nich to **Apache Maven** oraz **Gradle**. Zastępują one mechanizmy budowania IDE i pozwalają na automatyzację procesów CI/CD.

### Apache Maven:
Opiera się na podejściu deklaratywnym oraz koncepcji "konwencji ponad konfiguracją" (Convention over Configuration). Strukturę projektu definiuje plik XML o nazwie \`pom.xml\` (Project Object Model).

Przykładowy plik \`pom.xml\`:
\`\`\`xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>pl.edu.pw.mini</groupId>
    <artifactId>java-app</artifactId>
    <version>1.0.0</version>
    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>
    <dependencies>
        <dependency>
            <groupId>com.google.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.10.1</version>
        </dependency>
    </dependencies>
</project>
\`\`\`

### Gradle:
Nowocześniejsze, wydajniejsze i bardziej elastyczne narzędzie, które zamiast XML używa języka DSL (Domain Specific Language) opartego na Groovy lub Kotlin. Konfiguracja znajduje się w pliku \`build.gradle\` lub \`build.gradle.kts\`.

Przykładowy plik \`build.gradle.kts\` (Kotlin DSL):
\`\`\`kotlin
plugins {
    java
}

group = "pl.edu.pw.mini"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("com.google.code.gson:gson:2.10.1")
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
}

tasks.withType<JavaCompile> {
    sourceCompatibility = "21"
    targetCompatibility = "21"
}
\`\`\`
`},{title:`4. System Typów w Javie`,content:"\nJava jest językiem **silnie typowanym (strongly typed)**, co oznacza, że każda zmienna musi mieć zadeklarowany typ przed użyciem, a poprawność typów jest rygorystycznie sprawdzana podczas kompilacji.\n\nW Javie system typów dzieli się na dwie główne kategorie:\n1. **Typy proste (Primitive Types)**\n2. **Typy referencyjne (Reference Types)**\n\n### Typy proste (Primitive Types):\nSą wbudowane w język i przechowują bezpośrednio wartości. Zmienne lokalne typów prostych są alokowane na stosie (Stack), co zapewnia bardzo szybki dostęp. Natomiast pola typów prostych będące częścią obiektów są alokowane na stercie (Heap) razem z obiektem, do którego należą. Java posiada dokładnie 8 typów prostych:\n\n| Typ | Rozmiar (bity) | Domyślna wartość | Zakres wartości |\n| :--- | :--- | :--- | :--- |\n| `byte` | 8 | 0 | -128 do 127 |\n| `short` | 16 | 0 | -32,768 do 32,767 |\n| `int` | 32 | 0 | -2^31 do 2^31 - 1 |\n| `long` | 64 | 0L | -2^63 do 2^63 - 1 |\n| `float` | 32 | 0.0f | Zmiennoprzecinkowy pojedynczej precyzji |\n| `double` | 64 | 0.0d | Zmiennoprzecinkowy podwójnej precyzji |\n| `char` | 16 | '\\u0000' | Pojedynczy znak Unicode (UTF-16) |\n| `boolean` | ~8 (w praktyce zależy od JVM) | false | `true` lub `false` |\n\n### Typy referencyjne (Reference Types):\nSłużą do reprezentowania obiektów, tablic i interfejsów. Zmienna referencyjna nie przechowuje obiektu bezpośrednio, lecz **referencję (adres w pamięci)** do obiektu alokowanego na stercie (Heap). Wszystkie typy referencyjne dziedziczą po klasie `java.lang.Object`.\n* Wartością domyślną dla każdej referencji jest `null`, co oznacza, że referencja nie wskazuje na żaden obiekt.\n* Próba wywołania metody na referencji o wartości `null` skutkuje wyrzuceniem wyjątku `NullPointerException` (NPE).\n\n### Klasy osłonowe (Wrapper Classes) i Autoboxing:\nDla każdego typu prostego istnieje odpowiadający mu typ referencyjny (klasa osłonowa), np. `Integer` dla `int`, `Double` dla `double`, `Boolean` dla `boolean`.\n* **Autoboxing**: Automatyczna konwersja typu prostego na obiekt klasy osłonowej (np. `Integer x = 5;`).\n* **Unboxing**: Automatyczne wyciąganie wartości prostej z obiektu osłonowego (np. `int y = x;`).\n\n> [!WARNING]\n> Autoboxing i unboxing zachodzą niejawnie i mogą powodować problemy wydajnościowe (np. w pętlach o dużej liczbie iteracji) z powodu ciągłego tworzenia nowych obiektów na stercie oraz ryzyko `NullPointerException` przy próbie unboxingu referencji o wartości `null`.\n"},{title:`5. Hello World w Javie`,content:`
Klasyczny program w Javie wymaga zdefiniowania klasy publicznej, której nazwa musi dokładnie odpowiadać nazwie pliku. Punktem wejścia aplikacji jest metoda statyczna \`main\`.

\`\`\`java
// Hello.java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

W Javie 21 jako funkcja preview pojawiła się możliwość pisania uproszczonych programów bez jawnej deklaracji klasy (JEP 445). Funkcjonalność ta została sfinalizowana w **Javie 23** (JEP 477) pod nazwą **Implicitly Declared Classes and Instance Main Methods**, co pozwala na uproszczenie kodu dla początkujących:

\`\`\`java
// Hello.java (Java 23+, preview od Java 21)
void main() {
    System.out.println("Hello, World!");
}
\`\`\`

Aby uruchomić plik bezpośrednio z linii komend (bez jawnego tworzenia plików class od Javy 11):
\`\`\`bash
java Hello.java
\`\`\`
`},{title:`6. Pakiety (Packages) i import`,content:"\nPakiety w Javie pełnią rolę analogiczną do przestrzeni nazw (namespaces) w C#. Służą do logicznej organizacji klas i zapobiegania konfliktom nazw.\n\n### Deklaracja pakietu:\nPierwsza instrukcja w pliku źródłowym (poza komentarzami) musi deklarować pakiet, do którego należy dana klasa:\n```java\npackage pl.edu.pw.mini.app;\n\npublic class MyApp { ... }\n```\n\nKonwencja nazewnictwa pakietów to odwrócona domena organizacji (np. `pl.edu.pw.mini`). Struktura pakietów **musi odpowiadać strukturze katalogów** na dysku — klasa `pl.edu.pw.mini.app.MyApp` musi znajdować się w pliku `pl/edu/pw/mini/app/MyApp.java`.\n\n### Import klas:\n```java\nimport java.util.List;              // Import pojedynczej klasy\nimport java.util.*;                  // Import wszystkich klas z pakietu (niezalecane)\nimport static java.lang.Math.PI;    // Import statyczny — pozwala pisać PI zamiast Math.PI\nimport static java.lang.Math.*;     // Import statyczny wszystkich stałych i metod Math\n```\n\n> [!NOTE]\n> Klasy z pakietu `java.lang` (np. `String`, `Integer`, `System`, `Math`) są importowane automatycznie i nie wymagają jawnej instrukcji `import`.\n"},{title:`7. Zmienne, var, final i Rzutowanie Typów`,content:'\n### Deklaracja zmiennych:\nW Javie każda zmienna musi mieć jawnie zadeklarowany typ (lub użyć wnioskowania typu `var`):\n```java\nint age = 25;\nString name = "Anna";\ndouble pi = 3.14159;\n```\n\n### Słowo kluczowe var (Java 10+):\nOd Javy 10 dostępne jest wnioskowanie typu dla zmiennych lokalnych za pomocą słowa kluczowego `var`. Kompilator sam określa typ na podstawie wartości inicjalizacyjnej:\n```java\nvar count = 10;                  // int\nvar names = new ArrayList<String>(); // ArrayList<String>\nvar stream = Files.lines(path);  // Stream<String>\n```\n\n> [!WARNING]\n> `var` działa **wyłącznie ze zmiennymi lokalnymi** — nie można go stosować do pól klas, parametrów metod ani typów zwracanych. Zmienna musi być natychmiast zainicjalizowana.\n\n### Słowo kluczowe final:\n`final` to modyfikator oznaczający niezmienność:\n* **Zmienna final**: Raz przypisana wartość nie może być zmieniona (odpowiednik `const`/`readonly`).\n* **Metoda final**: Nie może być nadpisana (`@Override`) w podklasach.\n* **Klasa final**: Nie można po niej dziedziczyć (np. `String`, `Integer` — są final).\n\n```java\nfinal int MAX_SIZE = 100;      // Stała — nie można zmienić\nfinal List<String> list = new ArrayList<>();\nlist.add("ok");                // DOZWOLONE — final chroni referencję, nie zawartość obiektu!\n// list = new ArrayList<>();   // BŁĄD KOMPILACJI — nie można zmienić referencji\n```\n\n### Rzutowanie typów (Type Casting):\n* **Rzutowanie poszerzające (Widening)**: Automatyczne, bezstratne — np. `int` → `long` → `double`.\n* **Rzutowanie zawężające (Narrowing)**: Wymaga jawnego rzutowania, może powodować utratę danych.\n\n```java\nint i = 42;\ndouble d = i;            // Widening: automatyczne (42.0)\nint j = (int) 3.99;      // Narrowing: jawne — obcina część ułamkową (3)\n\nObject obj = "Hello";\nString s = (String) obj;  // Rzutowanie referencyjne (wymaga instanceof dla bezpieczeństwa)\n```\n'}],quiz:[{question:`Który element ekosystemu Java jest bezpośrednio odpowiedzialny za kompilację kodu źródłowego .java do kodu bajtowego .class?`,options:[`JVM (Java Virtual Machine)`,`JRE (Java Runtime Environment)`,`Kompilator javac wchodzący w skład JDK`,`Garbage Collector`],answer:2,explanation:`Kompilator 'javac' przetwarza kod źródłowy na kod bajtowy. JVM wykonuje ten kod bajtowy, a JRE to środowisko uruchomieniowe bez narzędzi kompilacji.`},{question:`Co to jest kompilacja JIT (Just-In-Time) w maszynie JVM?`,options:[`Kompilacja całego projektu przed uruchomieniem w celu szybszego startu.`,`Dynamiczna kompilacja często wykonywanych fragmentów kodu bajtowego do natywnego kodu maszynowego w trakcie działania programu.`,`Usuwanie nieużywanych obiektów z pamięci sterty.`,`Weryfikacja bezpieczeństwa kodu bajtowego przed uruchomieniem.`],answer:1,explanation:`Kompilacja JIT (Just-In-Time) kompiluje kod bajtowy do kodu maszynowego na bieżąco podczas wykonywania programu, co drasticznie zwiększa wydajność.`},{question:`Czym różnią się typy proste (np. int) od typów referencyjnych (np. Integer) w Javie?`,options:[`Typy proste są zapisywane w plikach XML, a referencyjne w bazie danych.`,`Zmienne typów prostych przechowują referencje, a typów referencyjnych bezpośrednie dane na stosie.`,`Zmienne lokalne typów prostych przechowują wartości bezpośrednio (najczęściej na stosie), a typy referencyjne przechowują adresy do obiektów alokowanych na stercie.`,`W Javie nie ma różnicy między typami prostymi a referencyjnymi.`],answer:2,explanation:`Zmienne lokalne typów prostych przechowują wartości bezpośrednio (najczęściej na stosie), natomiast typy referencyjne wskazują na obiekty na stercie i domyślnie mogą przyjmować wartość null. Pola typów prostych w obiektach znajdują się na stercie razem z obiektem.`}]},f={id:`02`,title:`Wykład 02: Fundamenty Javy, Pamięć JVM i Obiektowość (Poziom Strong Junior)`,description:`Kompleksowy przewodnik od podstawowych typów i instrukcji sterujących, przez zarządzanie pamięcią (Stos vs Sterta, String Pool), po zaawansowane koncepcje programowania obiektowego i wewnętrzne mechanizmy JVM.`,sections:[{title:`1. Typy Danych i Architektura Pamięci (Stack vs Heap)`,content:`
Zrozumienie, jak Java zarządza pamięcią, to granica między początkującym a "Strong Juniorem". JVM dzieli pamięć na dwa główne obszary operacyjne:

1. **Stack (Stos Pamięci):**
   * Bardzo szybka pamięć przydzielana dla każdego wątku.
   * Działa w oparciu o tzw. *Stack Frames* (ramki stosu). Każde wywołanie metody tworzy nową ramkę, która jest niszczona, gdy metoda się kończy.
   * Przechowuje **typy proste** (\`int\`, \`double\`, \`boolean\`) zmiennych lokalnych oraz **Referencje** (adresy) do obiektów.

2. **Heap (Sterta):**
   * Duży obszar pamięci współdzielony przez wszystkie wątki.
   * To tutaj fizycznie alokowane są **wszystkie obiekty** (tworzone słowem kluczowym \`new\`) oraz tablice.
   * Zarządzany przez *Garbage Collector*, który automatycznie usuwa obiekty, do których nie prowadzi już żadna referencja ze stosu.

### Pass-by-Value (Przekazywanie przez wartość)
Częste pytanie rekrutacyjne: *Czy Java przekazuje parametry przez wartość, czy przez referencję?* 
Odpowiedź brzmi: **Zawsze przez wartość**. 

Jednakże, wartością dla obiektów jest ich **adres w pamięci (referencja)**. Kiedy przekazujesz obiekt do metody, kopiujesz jego adres.
* ✅ Możesz zmienić **stan** obiektu na stercie, używając skopiowanego adresu.
* ❌ Nie możesz zmienić **referencji** przypisanej do oryginalnej zmiennej.

\`\`\`java
public class MemoryExample {
    public static void main(String[] args) {
        int primitiveAge = 25;
        List<String> objectList = new ArrayList<>();
        objectList.add("Junior");

        modifyData(primitiveAge, objectList);

        // primitiveAge nadal wynosi 25! (Zmieniliśmy tylko kopię na Stosie)
        System.out.println("Wiek: " + primitiveAge); 
        
        // objectList to teraz ["Junior", "Mid"]! (Zmieniliśmy obiekt na Stercie)
        System.out.println("Lista: " + objectList); 
    }

    static void modifyData(int ageCopy, List<String> listCopy) {
        // Zmienia tylko wartość w ramce stosu metody modifyData
        ageCopy = 99; 
        
        // Używa adresu, by wejść na Stertę i zmodyfikować istniejący obiekt
        listCopy.add("Mid"); 
        
        // Przypisanie nowego obiektu zmienia TYLKO lokalny wskaźnik 'listCopy'. 
        // Oryginalny 'objectList' w metodzie main() o tym nie wie!
        listCopy = new ArrayList<>(); 
        listCopy.add("Senior"); 
    }
}
\`\`\`
`},{title:`2. Klasa String: Niezmienność i String Pool`,content:`
Klasa \`java.lang.String\` reprezentuje ciąg znaków. Od Javy 9 wewnętrznie przechowuje dane w postaci tablicy bajtów: \`private final byte[] value;\` (wcześniej była to tablica \`char[]\`).

### Immutability (Niezmienność)
Raz utworzony String **nigdy** się nie zmienia. Każda operacja (np. \`.replace()\`, \`.concat()\`) tworzy nowy obiekt na stercie.
Dlaczego twórcy Javy podjęli taką decyzję?
1. **Wielowątkowość (Thread-safety):** Niemutowalne obiekty można bezpiecznie udostępniać między wątkami bez ryzyka wyścigu (Race Condition).
2. **Klucze w HashMap:** Jeśli String użyty jako klucz w mapie zmieniłby się, jego hash uległby zmianie i stracilibyśmy do niego dostęp.
3. **Bezpieczeństwo:** Klasy systemowe używają Stringów do przekazywania haseł i URL-i. Niezmienność gwarantuje, że haker nie zmieni wartości po tym, jak przeszła ona walidację bezpieczeństwa.

### String Pool (Pula Stringów)
Dzięki niezmienności, JVM optymalizuje pamięć poprzez współdzielenie takich samych napisów w tzw. **String Pool** (wydzielonym fragmencie Sterty).

\`\`\`java
// 1. Literały trafiają automatycznie do String Pool
String s1 = "Java"; 
String s2 = "Java"; 

// 2. Słowo 'new' ZMUSZA JVM do utworzenia zupełnie nowego obiektu na stercie (poza pulą)!
String s3 = new String("Java"); 

System.out.println(s1 == s2); // true (ten sam adres w String Pool)
System.out.println(s1 == s3); // false (różne adresy - jeden w puli, drugi obok na stercie)

// 3. Metoda intern() każe JVM sprawdzić, czy wartość jest już w puli
String s4 = s3.intern(); 
System.out.println(s1 == s4); // true (intern zwrócił adres z puli)
\`\`\`

> [!WARNING]
> Z powodu niezmienności, tworzenie napisów w dużej pętli (\`str += "a"\`) jest zabójcze dla wydajności — alokuje tysiące porzuconych obiektów. 

### StringBuilder vs StringBuffer
Do dynamicznego budowania tekstu używamy klas mutowalnych. Posiadają one wewnętrzną tablicę, która rozszerza swój rozmiar w miarę potrzeby.
* **\`StringBuilder\`**: Niesynchronizowany, bardzo szybki. To standardowy wybór w 99% przypadków.
* **\`StringBuffer\`**: Synchronizowany (thread-safe), przez co wolniejszy. Używany tylko w aplikacjach wielowątkowych typu "legacy".
`},{title:`3. Tablice (Arrays) i Memory Layout`,content:`
Tablice to najbardziej podstawowa struktura danych. Mają **stały rozmiar**, zdefiniowany w momencie tworzenia.

### Deklaracja i inicjalizacja
\`\`\`java
int[] numbers = new int[5]; // Wypełniona zerami
int[] initialNumbers = {10, 20, 30, 40, 50}; // Szybka inicjalizacja
System.out.println("Rozmiar: " + numbers.length); // length to pole finalne, nie metoda!

// Tablice wielowymiarowe (tablice tablic)
int[][] matrix = new int[3][3];
int[][] jaggedArray = { {1, 2}, {3, 4, 5}, {6} }; // Nieregularna (poszarpana)
\`\`\`

### Co się dzieje w pamięci?
Różnica między tablicą typów prostych a referencyjnych jest kluczowa dla wydajności:
1. **Tablica typów prostych (np. \`int[]\`):** JVM alokuje jeden ciągły blok pamięci. Liczby leżą "jedna obok drugiej". Dostęp jest błyskawiczny dzięki ładowaniu ich do pamięci podręcznej procesora (CPU Cache).
2. **Tablica obiektów (np. \`String[]\`):** JVM alokuje tablicę wskaźników (adresów). Faktyczne obiekty leżą w losowych miejscach na stercie. Odczyt wymaga najpierw pobrania adresu, a potem skoku w inne miejsce pamięci (tzw. zjawisko *Cache Miss*).

### Kopiowanie tablic
Używanie pętli \`for\` do kopiowania to anty-wzorzec. Należy używać metod natywnych:
\`\`\`java
int[] src = {1, 2, 3};
int[] dest = new int[3];

// Wywołuje wysoce zoptymalizowany kod napisany w C/C++ wewnątrz maszyny wirtualnej:
System.arraycopy(src, 0, dest, 0, src.length);

// Lub w sposób bardziej nowoczesny:
int[] clone = Arrays.copyOf(src, src.length);
\`\`\`
`},{title:`4. Instrukcje Sterowania (Control Flow)`,content:`
Java oferuje klasyczny zestaw instrukcji sterujących, rozbudowany o nowoczesne elementy.

### Warunki i Pętle
\`\`\`java
// if / else
if (score > 90) { /* A */ } 
else if (score > 80) { /* B */ } 
else { /* C */ }

// Operator trójargumentowy (Ternary Operator)
String status = (age >= 18) ? "Adult" : "Minor";

// Pętla for klasyczna
for (int i = 0; i < array.length; i++) { ... }

// Pętla for-each (Enhanced for) - preferowana dla kolekcji i tablic
for (String name : namesList) { ... }

// Pętla while / do-while
while (condition) { ... }
do { ... } while (condition); // Wykona się co najmniej RAZ
\`\`\`

### Etykiety (Labels) i Break/Continue
\`\`\`java
// 'break' przerywa aktualną pętlę, 'continue' przeskakuje do następnej iteracji.
// Ale co jeśli chcemy przerwać ZEWNĘTRZNĄ pętlę z wewnątrz wewnętrznej?
outerLoop: 
for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 5; j++) {
        if (i * j > 10) {
            break outerLoop; // Przerywa obie pętle natychmiast!
        }
    }
}
\`\`\`

### Klasyczny Switch vs Nowoczesny Switch Expression (Java 14+)
Klasyczny \`switch\` (Statement) był problematyczny przez zjawisko **fall-through** (spadanie do kolejnego case'a po zapomnieniu \`break\`). Nowoczesny \`switch\` jest **wyrażeniem** — zwraca wartość i rozwiązuje ten problem.

\`\`\`java
// NOWY SWITCH: Czysty, bez break, używa operatora strzałki (->)
int numLetters = switch (dayOfWeek) {
    case MONDAY, FRIDAY, SUNDAY -> 6;
    case TUESDAY -> 7;
    case THURSDAY, SATURDAY -> 8;
    case WEDNESDAY -> 9;
    default -> {
        // Jeśli blok wymaga wielu linii kodu, zwracamy wartość słowem 'yield'
        System.out.println("Nieznany dzień");
        yield 0; 
    }
};
\`\`\`
Nowy switch jest wyczerpujący (exhaustive). Jeśli robisz switcha po klasie \`Enum\` i nie pokryjesz wszystkich opcji, kod się nie skompiluje!
`},{title:`5. Kontrakt java.lang.Object: equals() i hashCode()`,content:'\nKlasa `Object` to korzeń całego drzewa dziedziczenia w Javie. Jeśli nie napiszemy `extends`, kompilator dopisze `extends Object` automatycznie.\n\n### Domyślna implementacja equals()\nDomyślnie `equals(Object o)` wykonuje po prostu `this == o`, porównując referencje. Dla klas domenowych (DTO) musimy to nadpisać.\nZasady (kontrakt) nadpisanego `equals`:\n1. **Zwrotność:** `a.equals(a) == true`\n2. **Symetryczność:** Jeśli `a.equals(b) == true`, to `b.equals(a) == true`\n3. **Przechodniość:** Jeśli `a.equals(b)` i `b.equals(c)`, to `a.equals(c)`\n4. **Spójność:** Wielokrotne wywołanie daje ten sam wynik.\n\n### Magia hashCode()\nWspółpracuje w parze z `HashMap` oraz `HashSet`. Zwraca wartość numeryczną określającą "kubełek" (bucket), do którego trafi obiekt.\n\n> [!CAUTION]\n> **Złota reguła Javy:** Jeśli zdefiniujesz, że dwa obiekty są równe według `equals()`, to ich `hashCode()` **MUSI** zwrócić dokładnie taką samą wartość! Złamanie tej zasady sprawi, że wrzucisz obiekt do `HashSet`, a następnie program stwierdzi, że go tam nie ma.\n\n```java\npublic class User {\n    private String email;\n    private int age;\n\n    @Override\n    public boolean equals(Object o) {\n        if (this == o) return true; // Szybka ścieżka: to ten sam obiekt\n        if (o == null || getClass() != o.getClass()) return false;\n        User user = (User) o;\n        return age == user.age && Objects.equals(email, user.email);\n    }\n\n    @Override\n    public int hashCode() {\n        // Pod maską: wynik mnożony jest przez liczbę pierwszą 31, by unikać kolizji hashów\n        return Objects.hash(email, age); \n    }\n}\n```\n'},{title:`6. Programowanie Obiektowe (OOP) i V-Table`,content:`
Java to w 99% język obiektowy, oparty na klasach, implementujący trzy filary OOP: Hermetyzację, Dziedziczenie i Polimorfizm.

### Hermetyzacja (Encapsulation)
Stan obiektu (pola) powinien być ukryty, a dostęp do niego kontrolowany przez metody publiczne (gettery/settery). Realizuje się to modyfikatorami:
* \`private\` — widoczne tylko w danej klasie.
* \`default\` (brak modyfikatora) — widoczne w całym pakiecie (Package-private).
* \`protected\` — widoczne w pakiecie + w klasach dziedziczących.
* \`public\` — widoczne wszędzie.

### Dziedziczenie (Inheritance)
Klasa może dziedziczyć tylko po **JEDNEJ** innej klasie (brak wielokrotnego dziedziczenia klas — rozwiązuje to tzw. Problem Diamentu).
\`\`\`java
public class Animal {
    protected String name;
    public Animal(String name) { this.name = name; }
    public void makeSound() { System.out.println("..."); }
}

public class Dog extends Animal {
    public Dog(String name) {
        super(name); // super() wywołuje konstruktor klasy bazowej
    }

    @Override // Adnotacja gwarantująca, że faktycznie nadpisujemy metodę
    public void makeSound() {
        System.out.println("Hau!");
    }
}
\`\`\`

### Polimorfizm i V-Table (Virtual Method Table)
Możemy przypisać obiekt typu \`Dog\` do zmiennej typu \`Animal\`. Kiedy wywołamy \`animal.makeSound()\`, JVM w czasie działania programu (Runtime) sprawdzi faktyczny typ obiektu i wywoła metodę z klasy \`Dog\`.

Jak to działa pod maską? JVM używa **V-Table**. Kiedy klasa jest ładowana do pamięci, tworzona jest dla niej tablica wskaźników do metod. Jeśli \`Dog\` nadpisze metodę \`makeSound\`, wskaźnik w V-Table \`Doga\` zostaje podmieniony z implementacji \`Animal\` na implementację \`Dog\`. Mechanizm ten nazywa się **Dynamic Dispatch**.
`},{title:`7. Klasy Abstrakcyjne vs Interfejsy`,content:`
Kiedy chcemy zdefiniować "szablon" dla klas dziedziczących, stajemy przed wyborem:

### Klasa Abstrakcyjna
Może posiadać pełnoprawny stan (pola niestatyczne) oraz konstruktory, ale nie da się stworzyć jej instancji przez \`new\`.
\`\`\`java
public abstract class GameEntity {
    private int health = 100; // Ma swój własny stan!
    public GameEntity() { ... } // Ma konstruktor
    
    public void takeDamage(int dmg) { health -= dmg; } // Zaimplementowana
    public abstract void render(); // Abstrakcyjna (wymaga implementacji)
}
\`\`\`

### Interfejs
Czysty kontrakt. Od Javy 8 interfejsy mogą posiadać metody z domyślną implementacją (słowo kluczowe \`default\`). Wprowadzono to, by dodać m.in. metodę \`.stream()\` do kolekcji bez niszczenia kompatybilności wstecznej.
\`\`\`java
public interface Playable {
    // Każde pole jest domyślnie: public static final (stała)
    int MAX_PLAYERS = 4; 

    // Metoda abstrakcyjna (domyślnie public abstract)
    void play(); 

    // Metoda domyślna z implementacją
    default void stop() {
        System.out.println("Zatrzymano odtwarzanie.");
    }
}
\`\`\`

| Cecha | Klasa Abstrakcyjna | Interfejs |
| :--- | :--- | :--- |
| **Stan (Pola)** | Dowolne (private, protected, int, List) | Tylko stałe (\`public static final\`) |
| **Konstruktor** | Tak | Nie |
| **Dziedziczenie** | Klasa może rozszerzyć tylko 1 klasę | Klasa może implementować wiele interfejsów |
| **Przeznaczenie** | Współdzielenie cech i kodu pomiędzy spokrewnionymi obiektami ("JEST") | Definiowanie możliwości/roli obiektu ("POTRAFI") |
`},{title:`8. Parametry Metod: Varargs i Przeciążanie`,content:`
### Przeciążanie metod (Method Overloading)
W jednej klasie może istnieć wiele metod o tej samej nazwie, o ile mają **inną listę parametrów** (typ, liczba lub kolejność). Typ zwracany NIE bierze udziału w rozróżnianiu przeciążeń!

\`\`\`java
public int calculate(int a, int b) { return a + b; }
public double calculate(double a, double b) { return a + b; }
// BŁĄD KOMPILACJI: public long calculate(int a, int b) { return a + b; }
\`\`\`

### Varargs (Zmienna liczba argumentów)
Służy do tworzenia metod przyjmujących dowolną liczbę parametrów danego typu. Używa się trzykropka \`...\`.
Pod maską, kompilator po prostu zbiera przekazane parametry w **zwykłą tablicę** danego typu.

\`\`\`java
// varargs MUST be the last parameter in the signature!
public static int sum(String message, int... numbers) {
    int total = 0;
    // 'numbers' to wewnętrznie int[]
    for (int num : numbers) { 
        total += num;
    }
    System.out.println(message + ": " + total);
    return total;
}

// Użycie:
sum("Wynik", 10, 20);      // Dwa argumenty
sum("Wynik", 1, 2, 3, 4);  // Cztery argumenty
sum("Wynik");              // Brak argumentów (tablica pusty int[])
\`\`\`
`},{title:`9. Nowoczesne Rekordy (Records) — Java 16`,content:'\nHistorycznie kod w Javie cierpiał na nadmiarowość (tzw. boilerplate). Aby stworzyć prosty obiekt DTO (Data Transfer Object) do przesyłania danych, trzeba było napisać kilkadziesiąt linii kodu dla prywatnych pól, getterów, hashCode, equals i toString.\n\nJava 16 wprowadziła **Rekordy**, które są idealnym, niemutowalnym nośnikiem danych.\n\n```java\npublic record UserResponse(UUID id, String email, boolean isActive) {}\n```\n\n### Co kompilator robi z tym jednym rzędem kodu?\n1. Tworzy klasę `final` rozszerzającą ukrytą klasę bazową `java.lang.Record`.\n2. Pola `id`, `email` oraz `isActive` stają się `private final`.\n3. Automatycznie dostarcza akcesory. Uwaga: nie `getId()`, a po prostu `id()`!\n4. Automatycznie generuje ultra-wydajne `equals()`, `hashCode()` oraz `toString()` przy pomocy instrukcji bytecode\'u `invokedynamic`.\n\n### Compact Constructor (Kompaktowy Konstruktor)\nRekordy pozwalają na dodanie konstruktora służącego tylko do szybkiej walidacji bez pisania przepisywania zmiennych:\n\n```java\npublic record ProductDto(String name, BigDecimal price) {\n    // Nie musisz pisać this.name = name!\n    public ProductDto {\n        Objects.requireNonNull(name, "Nazwa jest wymagana");\n        if (price.compareTo(BigDecimal.ZERO) < 0) {\n            throw new IllegalArgumentException("Cena nie może być ujemna");\n        }\n    }\n    \n    // Rekordy mogą też mieć swoje własne metody\n    public String getFormattedPrice() {\n        return price + " PLN";\n    }\n}\n```\n'}],quiz:[{question:`Gdy wywołujemy doSomething(List<String> list), i wewnątrz zmienimy metodą list.add("test"), to dlaczego oryginalna lista również ulegnie zmianie pomimo przekazywania przez wartość?`,options:[`Ponieważ Java przekazuje obiekty zawsze przez referencję, a nie przez wartość.`,`Ponieważ skopiowaną wartością był adres w pamięci prowadzący do jedynej kopii obiektu Listy na Stercie (Heap).`,`Ponieważ kolekcje (List, Set) posiadają wbudowany mechanizm mutacji między-ramkowej.`,`Tylko jeśli przypiszemy list = new ArrayList<>() zmiany odzwierciedlą się wyżej.`],answer:1,explanation:`W Javie przesyłana wartość to skopiowany adres prowadzący do obiektu. Posiadając ten adres, modyfikacja obiektu zmieni go globalnie na stercie.`},{question:`Z jakiego powodu klasa String w Javie została zaprogramowana jako immutable (niezmienna)?`,options:[`Umożliwia to zjawisko buforowania napisów (String Pool) w pamięci operacyjnej.`,`Zapewnia to absolutne bezpieczeństwo przy komunikacji między wieloma wątkami (Thread-safety).`,`Chroni to stan krytycznych kluczy wprowadzonych do kolekcji np. HashMap przed ich zewnętrzną zmianą.`,`Wszystkie powyższe powody są kluczowe w architekturze klasy String.`],answer:3,explanation:`Niezmienność zapewnia buforowanie pamięci, bezpieczeństwo dla wielowątkowości i stabilność logiki używającej Stringów jako identyfikatorów lub kluczy map.`},{question:`Co decyduje, czy w Javie zastosować Klasę Abstrakcyjną czy Interfejs?`,options:[`Tylko interfejsy potrafią implementować abstrakcyjne metody.`,`Jeśli obiekt współdzieli z klasą wspólną logikę (pola prywatne, konstruktor, zmienny stan) -> Klasa Abstrakcyjna. Jeśli opisuje tylko role do spełnienia (kontrakt) -> Interfejs.`,`Klasy abstrakcyjnej używa się tylko, by stworzyć rekord, a interfejsu gdy chcemy zainicjować zmienne przez operator new.`,`Nie ma różnicy z technicznego punktu widzenia, używa się ich naprzemiennie.`],answer:1,explanation:`Klasa abstrakcyjna niesie ze sobą 'stan' (zmienne, konstruktory), podczas gdy interfejs (nawet posiadający default method) dotyczy zdefiniowania API / możliwości i jest obdarzony wyłącznie publicznymi stałymi finalnymi.`},{question:`W jaki sposób najnowszy (wprowadzony w Java 14) Switch operuje jako tzw. Expression?`,options:[`Pozwala pisać switch z wykorzystaniem lambd i wymaga zwracania Stringa.`,`Przed każdym case wymaga napisania słowa 'break' aby uniknąć pomyłki tzw. fall-through.`,`Pozwala na zwrot obliczonej na jego podstawie wartości poprzez zapis przypisania (np. int result = switch...) eliminując po drodze wymóg umieszczania instrukcji break za pomocą zapisu '->'.`,`Wcale nie obsługuje wartości zwrotnych, różnica polega wyłącznie w składni wizualnej polegającej na użyciu przecinków.`],answer:2,explanation:`Nowoczesny switch jest traktowany przez Jave jako pełnoprawne 'wyrażenie' zwracające wynik po operatorze ->. Ponadto jest wyczerpujący (exhaustive) co podnosi bezpieczeństwo.`}]},p={id:`03`,title:`Wykład 03: Modyfikatory Dostępu, Typy Wyliczeniowe, Generyki i Iteratory`,description:`Omówienie modyfikatorów dostępu w Javie, bogatych typów Enum, różnic między typami zagnieżdżonymi a wewnętrznymi, działania generyków (Type Erasure, Wildcards, PECS) i interfejsów Iterator/Iterable.`,sections:[{title:`1. Modyfikatory Dostępu (Access Modifiers)`,content:`
Modyfikatory dostępu w Javie określają widoczność klas, interfejsów, konstruktorów, pól i metod. Java posiada cztery poziomy widoczności (z trzema słowami kluczowymi):

1. **\`public\`**: Element jest widoczny ze wszystkich klas w aplikacji, niezależnie od pakietu.
2. **\`protected\`**: Element jest widoczny w obrębie tego samego pakietu oraz w klasach dziedziczących (nawet w innych pakietach).
3. **domyślny (brak modyfikatora - *package-private*)**: Element jest widoczny wyłącznie dla klas znajdujących się w tym samym pakiecie.
4. **\`private\`**: Element jest widoczny wyłącznie w obrębie klasy, w której został zadeklarowany.

Tabela widoczności:

| Modyfikator | Klasa | Pakiet | Podklasa (inny pakiet) | Świat |
| :--- | :---: | :---: | :---: | :---: |
| \`public\` | TAK | TAK | TAK | TAK |
| \`protected\` | TAK | TAK | TAK | NIE |
| *package-private* | TAK | TAK | NIE | NIE |
| \`private\` | TAK | NIE | NIE | NIE |
`},{title:`2. Klasy Enum (Typy Wyliczeniowe)`,content:`
W Javie \`enum\` jest pełnoprawną klasą dziedziczącą niejawnie po klasie \`java.lang.Enum\`. Oznacza to, że enumy w Javie mogą mieć pola, metody, konstruktory, a nawet implementować interfejsy.

Przykład rozbudowanego typu Enum:
\`\`\`java
public enum Planet {
    MERCURY(3.303e+23, 2.4397e6),
    VENUS(4.869e+24, 6.0518e6),
    EARTH(5.976e+24, 6.37814e6);

    private final double mass;   // w kilogramach
    private final double radius; // w metrach

    // Konstruktor (zawsze prywatny!)
    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
    }

    public double mass() { return mass; }
    public double radius() { return radius; }

    public double surfaceGravity() {
        final double G = 6.67300E-11;
        return G * mass / (radius * radius);
    }
}
\`\`\`
`},{title:`3. Klasy Zagnieżdżone vs Wewnętrzne`,content:`
Klasy zadeklarowane wewnątrz innych klas dzielimy na dwie kategorie:
1. **Statyczne klasy zagnieżdżone (Static Nested Classes)**: Deklarowane z modyfikatorem \`static\`. Zachowują się jak zwykłe klasy najwyższego poziomu, nie mają dostępu do niestatycznych pól i metod klasy otaczającej. Ich istnienie służy jedynie logicznemu zgrupowaniu kodu.
2. **Klasy wewnętrzne (Inner Classes)**: Deklarowane bez słowa \`static\`. Każda instancja klasy wewnętrznej jest ściśle powiązana z konkretną instancją klasy zewnętrznej i ma bezpośredni dostęp do wszystkich jej pól i metod (nawet tych oznaczonych jako \`private\`).

\`\`\`java
public class Outer {
    private String outerField = "Zewnętrzne pole";

    public static class StaticNested {
        void print() {
            // System.out.println(outerField); // BŁĄD! Brak dostępu do instancji zewnętrznej
        }
    }

    public class Inner {
        void print() {
            System.out.println(outerField); // OK! Dostęp do pola Outer.this.outerField
        }
    }
}
\`\`\`
`},{title:`4. Typy Generyczne (Generics) i Type Erasure`,content:`
Generyki pozwalają na parametryzowanie typów klas i metod. Kluczową cechą generyków w Javie jest **Type Erasure (Wymazywanie Typów)**.
* Kompilator Javy sprawdza poprawność typów generycznych w czasie kompilacji, a następnie **usuwa** informacje o parametrach typów (zastępując je typem \`Object\` lub ich górną granicą - bound).
* W efekcie, skompilowany kod bajtowy nie zawiera informacji o typach generycznych. Na przykład \`List<String>\` i \`List<Integer>\` w czasie działania programu (Runtime) stają się tą samą surową klasą \`List\`.

Powoduje to pewne ograniczenia:
* Nie można wywołać \`new T()\` ani utworzyć tablicy typów generycznych (\`new T[10]\`).
* Nie można sprawdzić typu instancji za pomocą \`instanceof List<String>\` (można jedynie \`instanceof List<?> \`).
* Metody przeciążone nie mogą różnić się tylko parametrem typu generycznego.

### Wildcard Generics i zasada PECS:
Java wspiera trzy rodzaje symboli wieloznacznych (wildcards) w typach generycznych:
* **\`? extends T\`** (Upper Bounded Wildcard) — akceptuje \`T\` lub dowolny jego podtyp. Używany gdy chcemy **odczytywać** elementy z kolekcji (Producer).
* **\`? super T\`** (Lower Bounded Wildcard) — akceptuje \`T\` lub dowolny jego nadtyp. Używany gdy chcemy **dodawać** elementy do kolekcji (Consumer).
* **\`?\`** (Unbounded Wildcard) — akceptuje dowolny typ. Używany gdy nie potrzebujemy żadnych informacji o typie elementów.

Zasada **PECS (Producer Extends, Consumer Super)** pomaga wybrać właściwy wildcard:
\`\`\`java
// Producer (odczyt) — ? extends
public static double sum(List<? extends Number> list) {
    double total = 0;
    for (Number n : list) total += n.doubleValue();
    return total;
}

// Consumer (zapis) — ? super
public static void addIntegers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
}

// Metoda generyczna z ograniczeniem (bounded type)
public static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}
\`\`\`
`},{title:`5. Nullowalność (Nullability) i Optional`,content:`
Domyślnie każda referencja w Javie może wskazywać na \`null\`. Aby uniknąć plag \`NullPointerException\` (NPE), Java oferuje klasę \`java.util.Optional<T>\`, która reprezentuje kontener mogący zawierać wartość lub być pusty.

Użycie \`Optional\`:
\`\`\`java
Optional<String> name = Optional.ofNullable(getNameFromDatabase());

// Bezpieczne pobranie wartości z wartością domyślną
String result = name.orElse("Domyślna wartość");

// Rzucenie wyjątku w przypadku braku wartości
String forcedResult = name.orElseThrow(() -> new IllegalArgumentException("Brak imienia!"));

// Wykonanie logiki, jeśli wartość istnieje
name.ifPresent(n -> System.out.println("Witaj, " + n));
\`\`\`

Dodatkowo, nowoczesne biblioteki i narzędzia statycznej analizy kodu wykorzystują adnotacje takie jak \`@NonNull\` i \`@Nullable\` do sprawdzania bezpieczeństwa referencji w czasie kompilacji.
`},{title:`6. Interfejsy Iterator i Iterable`,content:"\n* **`Iterable<T>`**: Interfejs posiadający tylko jedną abstrakcyjną metodę: `Iterator<T> iterator()`. Klasa implementująca `Iterable` deklaruje, że można po niej iterować za pomocą pętli typu foreach: `for (T item : collection) { ... }`.\n* **`Iterator<T>`**: Interfejs definiujący sam obiekt nawigacyjny o metodach:\n  * `boolean hasNext()`: zwraca prawdę, jeśli są kolejne elementy.\n  * `T next()`: zwraca kolejny element.\n  * `void remove()`: usuwa ostatnio zwrócony element ze struktury danych.\n"}],quiz:[{question:`Czym różni się klasa wewnętrzna (Inner Class) od statycznej klasy zagnieżdżonej (Static Nested Class)?`,options:[`Klasa wewnętrzna ma dostęp do niestatycznych pól klasy otaczającej, natomiast statyczna klasa zagnieżdżona tego dostępu nie posiada.`,`Statyczna klasa zagnieżdżona dziedziczy po klasie bazowej Outer, a klasa wewnętrzna nie.`,`Klasy wewnętrzne mogą być deklarowane tylko w interfejsach.`,`Nie ma między nimi żadnej różnicy.`],answer:0,explanation:`Inner Class posiada niejawne powiązanie z instancją klasy Outer (Outer.this) i ma dostęp do jej pól niestatycznych. Static Nested Class zachowuje się jak zwykła klasa i takiego dostępu nie posiada.`},{question:`Co to jest Wymazywanie Typów (Type Erasure) w generykach Javy?`,options:[`Proces usuwania nieużywanych klas przez Garbage Collector.`,`Usuwanie informacji o typach generycznych przez kompilator w czasie kompilacji, przez co w czasie wykonania (runtime) wszystkie generyki działają na typie Object lub granicach typów.`,`Konwersja typów prostych na ich klasy osłonowe.`,`Błąd kompilatora polegający na gubieniu referencji.`],answer:1,explanation:`Type Erasure polega na usunięciu parametrów typów generycznych (np. zamiana List<String> na surową listę List w kodzie bajtowym). Zapewnia to kompatybilność wsteczną ze starszymi wersjami Javy.`},{question:`Jak najlepiej radzić sobie z ryzykiem wystąpienia NullPointerException?`,options:[`Ignorować i pozwalać aplikacji na restart.`,`Pisać bloki try-catch wokół każdej linijki kodu.`,`Używać klasy Optional<T> do reprezentowania wartości opcjonalnych oraz adnotacji @NonNull/@Nullable do statycznej weryfikacji kodu.`,`Unikać używania typów referencyjnych i pisać kod tylko na typach prostych.`],answer:2,explanation:`Użycie Optional<T> jasno dokumentuje intencję metody, a adnotacje wspierane przez IDE pozwalają wykryć potencjalne błędy NullPointerException jeszcze przed uruchomieniem kodu.`}]},m={id:`04`,title:`Wykład 04: Programowanie Funkcjonalne & Kolekcje`,description:`Wprowadzenie do programowania funkcyjnego w Javie (wyrażenia lambda, interfejsy funkcyjne, referencje do metod) oraz przegląd struktur danych w Java Collections Framework.`,sections:[{title:`1. Metody Domyślne w Interfejsach (Default Methods)`,content:`
Przed wersją Java 8 dodanie nowej metody do interfejsu wymuszało modyfikację wszystkich klas, które go implementowały. W celu zapewnienia kompatybilności wstecznej (szczególnie przy wprowadzaniu biblioteki Stream API), Java 8 wprowadziła **metody domyślne (default methods)**.

Metoda domyślna posiada domyślną implementację wewnątrz interfejsu, oznaczoną słowem kluczowym \`default\`. Klasy implementujące interfejs mogą (ale nie muszą) ją nadpisać.

\`\`\`java
public interface Logger {
    void log(String message); // Metoda abstrakcyjna

    default void logWarning(String message) {
        log("[WARNING] " + message); // Metoda domyślna
    }
}
\`\`\`

### Problem wielokrotnego dziedziczenia metod domyślnych (Diament):
Jeśli klasa implementuje dwa interfejsy posiadające metody domyślne o tej samej sygnaturze, kompilator zgłosi błąd. Programista musi ręcznie rozstrzygnąć konflikt w klasie implementującej:

\`\`\`java
public class CustomLogger implements LoggerA, LoggerB {
    @Override
    public void logWarning(String message) {
        // Jawne wywołanie konkretnej implementacji
        LoggerA.super.logWarning(message); 
    }
}
\`\`\`
`},{title:`2. Interfejsy Funkcyjne i Wyrażenia Lambda`,content:'\n**Interfejs Funkcyjny (Functional Interface)** to interfejs posiadający **dokładnie jedną metodę abstrakcyjną** (może zawierać wiele metod domyślnych lub statycznych). Zazwyczaj oznacza się go adnotacją `@FunctionalInterface`.\n\nWyrażenie lambda to anonimowa implementacja interfejsu funkcyjnego, pozwalająca traktować kod jako dane (przekazywać funkcje jako parametry).\n\nPakiet `java.util.function` definiuje standardowe interfejsy funkcyjne:\n1. **`Predicate<T>`**: Przyjmuje argument typu T, zwraca `boolean` (metoda `test(T t)`).\n2. **`Consumer<T>`**: Przyjmuje argument typu T, nic nie zwraca (metoda `accept(T t)`).\n3. **`Supplier<T>`**: Nie przyjmuje argumentów, zwraca wartość typu T (metoda `get()`).\n4. **`Function<T, R>`**: Przyjmuje argument typu T, zwraca wartość typu R (metoda `apply(T t)`).\n5. **`BiFunction<T, U, R>`**: Przyjmuje argumenty typów T i U, zwraca R.\n\nPrzykład użycia lambd:\n```java\n// Predicate\nPredicate<String> isNotEmpty = s -> !s.isEmpty();\nboolean check = isNotEmpty.test("Java"); // true\n\n// Consumer\nConsumer<String> printer = text -> System.out.println(text);\nprinter.accept("Uruchamianie Consumer...");\n```\n'},{title:`3. Referencje do Metod (Method References)`,content:"\nReferencja do metody to skrócony zapis wyrażenia lambda, który odwołuje się do istniejącej metody za pomocą operatora `::`.\n\nMamy cztery rodzaje referencji do metod:\n1. **Do metody statycznej**: `ClassName::staticMethodName` (np. `Integer::parseInt` zamiast `s -> Integer.parseInt(s)`).\n2. **Do metody instancji konkretnego obiektu**: `containingObject::instanceMethodName` (np. `System.out::println` zamiast `x -> System.out.println(x)`).\n3. **Do metody instancji obiektu dowolnego typu, przekazanego jako parametr**: `ClassName::instanceMethodName` (np. `String::toUpperCase` zamiast `s -> s.toUpperCase()`).\n4. **Do konstruktora**: `ClassName::new` (np. `ArrayList::new` zamiast `() -> new ArrayList<>()`).\n"},{title:`4. Java Collections Framework (JCF)`,content:"\nJava Collections Framework (JCF) to ujednolicona architektura służąca do reprezentowania i manipulowania kolekcjami danych. Wszystkie główne kolekcje znajdują się w pakiecie `java.util` i dziedziczą po głównym interfejsie `Collection<E>` (z wyjątkiem map).\n\n### Najważniejsze interfejsy i ich implementacje:\n\n#### 1. List (Uporządkowana lista elementów, dopuszcza duplikaty):\n* **`ArrayList`**: Oparta na dynamicznej tablicy. Zapewnia stały czas dostępu `O(1)` przy odczycie po indeksie, ale usuwanie/wstawianie w środku trwa `O(n)`. Jest to domyślna implementacja.\n* **`LinkedList`**: Implementacja w postaci listy dwukierunkowej. Szybkie wstawianie/usuwanie na końcach `O(1)`, ale wolny dostęp po indeksie `O(n)`. Wstawianie/usuwanie w środku wymaga uprzedniego znalezienia węzła (`O(n)`), choć sama operacja modyfikacji wskaźników trwa `O(1)`.\n\n#### 2. Set (Kolekcja unikalnych elementów, brak duplikatów):\n* **`HashSet`**: Oparty na tablicy mieszającej (`HashMap`). Bardzo szybkie operacje wstawiania, usuwania i wyszukiwania `O(1)`. Brak gwarancji kolejności elementów.\n* **`TreeSet`**: Oparty na drzewie czerwono-czarnym. Elementy są automatycznie sortowane naturalnie (lub przez zadany Comparator). Wolniejsze operacje wyszukiwania i zapisu `O(log n)`.\n\n#### 3. Queue (Kolejka FIFO - First-In-First-Out):\n* Używana do buforowania elementów, np. `PriorityQueue` (kolejka priorytetowa) lub `ArrayDeque` (dwukierunkowa kolejka stosu/kolejki).\n"},{title:`5. Comparable i Comparator — Porównywanie Obiektów`,content:`
Aby sortować kolekcje obiektów lub umieszczać je w \`TreeSet\`/\`TreeMap\`, obiekty muszą być porównywalne. Java oferuje dwa mechanizmy:

### Comparable<T> — porządek naturalny:
Interfejs implementowany przez klasę, definiujący jej domyślny sposób porównywania:
\`\`\`java
public class Student implements Comparable<Student> {
    private String name;
    private double gpa;

    @Override
    public int compareTo(Student other) {
        return Double.compare(this.gpa, other.gpa); // Sortowanie po GPA rosnąco
    }
}

// Użycie:
Collections.sort(students); // Użyje compareTo()
\`\`\`

### Comparator<T> — porządek zewnętrzny:
Interfejs funkcyjny definiujący alternatywny sposób porównywania, niezależny od klasy:
\`\`\`java
// Sortowanie po nazwisku (Comparator jako lambda)
students.sort(Comparator.comparing(Student::getName));

// Sortowanie po GPA malejąco, a przy remisie — po nazwisku rosnąco
students.sort(
    Comparator.comparingDouble(Student::getGpa).reversed()
              .thenComparing(Student::getName)
);
\`\`\`

> [!TIP]
> Zasada: \`Comparable\` definiujesz raz w klasie (porządek naturalny). \`Comparator\` tworzysz na zewnątrz, kiedy potrzebujesz wielu różnych sortowań.
`},{title:`6. Text Blocks — Wieloliniowe Napisy (Java 15+)`,content:`
Od Javy 15 dostępne są **Text Blocks** — wieloliniowe literały tekstowe otoczone potrójnymi cudzysłowami. Automatycznie obsługują wcięcia, znaki nowej linii i nie wymagają escapeowania cudzysłowów wewnątrz tekstu.

Porównanie tradycyjnego podejścia i Text Blocks:
\`\`\`java
// Bez Text Blocks (przed Java 15) — nieczytelne!
String json = "{" +
    "  name: Jan," +
    "  age: 25" +
    "}";

// Z Text Blocks (Java 15+) — czytelne i naturalne
// Składnia: trzy cudzysłowy otwierające, treść, trzy cudzysłowy zamykające
String json = """
        {
            "name": "Jan",
            "age": 25
        }
        """;
\`\`\`

Text Blocks idealnie nadają się do osadzania w kodzie:
* Zapytań SQL: \`SELECT * FROM users WHERE age > 18\`
* Fragmentów HTML/XML
* Szablonów JSON/YAML
* Komunikatów wieloliniowych

> [!NOTE]
> Wcięcie wspólne dla wszystkich linii jest automatycznie usuwane (incidental whitespace). Pozycja zamykających trzech cudzysłowów definiuje poziom bazowy wcięcia.
`},{title:`7. Czego Java nie posiada: Extension Methods i Tuples`,content:`
Kilka konstrukcji obecnych w C# nie istnieje w Javie. Warto znać ich alternatywy:

### Brak Extension Methods:
W C# można "doczepić" nową metodę do istniejącej klasy bez jej modyfikacji. Java tego **nie wspiera**. Alternatywy:
* **Klasy narzędziowe (Utility Classes)**: Statyczne metody w klasach typu \`Collections\`, \`Arrays\`, \`Files\`, \`Objects\`:
  \`\`\`java
  // Zamiast "myList.isEmpty()" jako extension:
  Collections.unmodifiableList(myList);
  Objects.requireNonNull(value, "Wartość nie może być null");
  \`\`\`
* **Metody domyślne w interfejsach (default methods)**: Dodają nowe metody do interfejsu bez łamania istniejących implementacji — ale wymagają dziedziczenia po interfejsie.

### Brak natywnych Tuple:
Java nie posiada wbudowanych krotek (tuple). Alternatywy:
* **Record (Java 16+)** — funkcjonalnie odpowiada nazwanej krotce:
  \`\`\`java
  record Pair<A, B>(A first, B second) {}
  var result = new Pair<>("Anna", 25);
  System.out.println(result.first()); // "Anna"
  \`\`\`
* **Map.Entry<K,V>** — para klucz-wartość do tymczasowego użytku.
* Biblioteki: \`Pair\` z Apache Commons Lang lub JavaFX.
`}],quiz:[{question:`Jaki jest główny cel wprowadzania metod domyślnych (default methods) w interfejsach Javy 8?`,options:[`Umożliwienie symulacji wielokrotnego dziedziczenia stanu klasy.`,`Ułatwienie ewolucji interfejsów bez łamania kompatybilności wstecznej z istniejącymi implementacjami.`,`Zastąpienie klas abstrakcyjnych we wszystkich scenariuszach.`,`Zwiększenie bezpieczeństwa poprzez ukrywanie kodu przed refleksją.`],answer:1,explanation:`Metody domyślne pozwoliły na rozbudowę bibliotek standardowych (np. dodanie metody stream() do interfejsu Collection) bez konieczności modyfikowania wszystkich klas zewnętrznych implementujących te interfejsy.`},{question:`Zapis 'System.out::println' jest przykładem czego?`,options:[`Referencji do metody instancyjnej konkretnego obiektu`,`Referencji do metody statycznej`,`Referencji do konstruktora`,`Przeciążania operatora wywołania metody`],answer:0,explanation:`System.out zwraca obiekt typu PrintStream. Operator :: odwołuje się do jego metody instancyjnej println. Jest to referencja do metody instancyjnej konkretnego obiektu.`},{question:`Która kolekcja będzie najbardziej wydajna, jeśli zależy nam na błyskawicznym sprawdzaniu obecności elementu bez dbania o ich kolejność?`,options:[`ArrayList`,`LinkedList`,`HashSet`,`TreeSet`],answer:2,explanation:`HashSet opiera się na strukturze tablicy mieszającej i oferuje średni czas wyszukiwania O(1) (stały), co jest najszybszym rozwiązaniem.`}]},h={id:`05`,title:`Wykład 05: Mapy, Stream API, Wyjątki Kontrolowane i Niekontrolowane`,description:`Zaawansowane omówienie struktury Map, przetwarzania strumieniowego (Stream API) oraz systemu wyjątków (checked i unchecked exceptions).`,sections:[{title:`1. Struktura Mapy (Map) i jej Implementacje`,content:'\nInterfejs `java.util.Map<K, V>` reprezentuje strukturę słownikową przechowującą asocjacje klucz-wartość. Klucze w mapie muszą być unikalne. Trzy najczęściej stosowane implementacje to:\n\n1. **`HashMap`**: Oparta na tablicy mieszającej. Operacje zapisu, odczytu i usuwania trwają średnio `O(1)` (od Javy 8, w najgorszym przypadku `O(log n)` dzięki konwersji kubełków na drzewa czerwono-czarne). Kolejność elementów nie jest gwarantowana. Wymaga poprawnej implementacji metod `equals()` i `hashCode()` dla obiektów będących kluczami.\n2. **`LinkedHashMap`**: Dziedziczy po `HashMap`, ale dodatkowo utrzymuje listę dwukierunkową przechodzącą przez wszystkie wpisy. Zachowuje kolejność wstawiania elementów (insertion order).\n3. **`TreeMap`**: Oparta na drzewie czerwono-czarnym (SortedMap). Elementy są automatycznie sortowane według kluczy. Operacje trwają `O(log n)`.\n\nPrzykładowe operacje:\n```java\nMap<String, Integer> ages = new HashMap<>();\nages.put("Anna", 28);\nages.put("Jan", 35);\n\n// Pobranie z wartością domyślną\nint age = ages.getOrDefault("Maria", 18); // 18\n\n// Iteracja po mapie\nages.forEach((name, a) -> System.out.println(name + " ma " + a + " lat."));\n```\n'},{title:`2. Java Stream API`,content:'\nWprowadzone w Javie 8 **Stream API** to potężne narzędzie do deklaratywnego przetwarzania strumieni danych (kolekcji, tablic, I/O) przy użyciu paradygmatu funkcyjnego. Strumień nie przechowuje danych, lecz przesyła je przez rurociąg operacji.\n\nOperacje na strumieniach dzielą się na dwie grupy:\n1. **Operacje pośrednie (Intermediate Operations)**: Są leniwe (lazy) - nie wykonują się, dopóki nie zostanie wywołana operacja terminalna. Zwracają nowy strumień, co pozwala na ich łączenie w łańcuchy.\n   * `filter(Predicate<T>)`: Filtruje elementy.\n   * `map(Function<T, R>)`: Transformuje elementy z typu T na typ R.\n   * `flatMap(Function<T, Stream<R>>)`: Spłaszcza strukturę (np. zamienia strumień list na strumień elementów).\n   * `sorted()`, `distinct()`, `limit(long)`, `skip(long)`.\n2. **Operacje terminalne (Terminal Operations)**: Uruchamiają przetwarzanie danych i zamykają strumień. Zwracają konkretny wynik (kolekcję, liczbę, boolean) lub nie zwracają nic.\n   * `collect(Collector)`: Zbiera elementy do kolekcji (np. `Collectors.toList()`).\n   * `forEach(Consumer<T>)`: Wykonuje akcję dla każdego elementu.\n   * `reduce(BinaryOperator<T>)`: Agreguje elementy do jednej wartości (np. suma, iloczyn).\n   * `count()`, `findFirst()`, `anyMatch(Predicate)`.\n\nPrzykład rurociągu Stream API:\n```java\nList<String> names = List.of("Jan", "Anna", "Marek", "Aleksandra");\n\nList<String> result = names.stream()\n    .filter(name -> name.startsWith("A"))\n    .map(String::toUpperCase)\n    .sorted()\n    .collect(Collectors.toList()); // [ALEKSANDRA, ANNA]\n```\n'},{title:`3. Wyjątki: Kontrolowane (Checked) vs Niekontrolowane (Unchecked)`,content:'\nObsługa błędów w Javie opiera się na obiektach dziedziczących po klasie `java.lang.Throwable`. Hierarchia ta dzieli się na dwie główne gałęzie: `Error` (poważne błędy systemowe JVM, np. `OutOfMemoryError`, których program nie powinien próbować łapać) oraz `Exception` (błędy aplikacji).\n\nKlasa `Exception` i jej podklasy dzielą się na:\n\n### 1. Wyjątki Kontrolowane (Checked Exceptions):\nSą to wszystkie klasy dziedziczące po `Exception` z wyłączeniem gałęzi `RuntimeException`.\n* Kompilator **wymaga** od programisty jawnej obsługi tych wyjątków.\n* Metoda, która może rzucić taki wyjątek, musi zadeklarować go w swojej sygnaturze za pomocą słowa kluczowego `throws` lub obsłużyć go lokalnie w bloku `try-catch`.\n* Przykłady: `IOException`, `SQLException`, `ClassNotFoundException`.\n\n### 2. Wyjątki Niekontrolowane (Unchecked / Runtime Exceptions):\nSą to wszystkie klasy dziedziczące po `RuntimeException`.\n* Kompilator **nie wymaga** ich deklarowania ani obsługi. Są to zazwyczaj błędy logiczne programisty, których można uniknąć poprzez poprawną logikę.\n* Przykłady: `NullPointerException`, `IllegalArgumentException`, `IndexOutOfBoundsException`, `ArithmeticException`.\n\nPrzykład obsługi wyjątków:\n```java\npublic void readFile(String path) throws IOException { // Checked exception zadeklarowany\n    if (path == null) {\n        throw new IllegalArgumentException("Ścieżka nie może być null"); // Unchecked exception\n    }\n    // Logika I/O mogąca rzucić IOException\n}\n\npublic void run() {\n    try {\n        readFile("dane.txt");\n    } catch (IOException e) {\n        System.err.println("Błąd odczytu pliku: " + e.getMessage());\n    } finally {\n        System.out.println("Blok finally wykonuje się zawsze.");\n    }\n}\n```\n'},{title:`4. Tworzenie Własnych Wyjątków (Custom Exceptions)`,content:`
W profesjonalnym kodzie Java często tworzymy własne klasy wyjątków, aby precyzyjnie opisać błędy specyficzne dla naszej domeny biznesowej.

### Własny wyjątek kontrolowany (Checked):
\`\`\`java
public class InsufficientFundsException extends Exception {
    private final double deficit;

    public InsufficientFundsException(String message, double deficit) {
        super(message);
        this.deficit = deficit;
    }

    public double getDeficit() { return deficit; }
}

// Użycie:
public void withdraw(double amount) throws InsufficientFundsException {
    if (amount > balance) {
        throw new InsufficientFundsException(
            "Brakuje środków: " + (amount - balance) + " PLN",
            amount - balance
        );
    }
    balance -= amount;
}
\`\`\`

### Własny wyjątek niekontrolowany (Unchecked):
\`\`\`java
public class InvalidOrderStateException extends RuntimeException {
    public InvalidOrderStateException(String message) {
        super(message);
    }
}
\`\`\`

> [!TIP]
> Zasada: twórz wyjątki **checked** gdy wywołujący MUSI zareagować (np. brak pliku, timeout sieci). Twórz **unchecked** gdy to błąd programisty (np. niepoprawne argumenty, zły stan obiektu).
`},{title:`5. Zaawansowane Collectors w Stream API`,content:`
Oprócz \`Collectors.toList()\`, klasa \`Collectors\` oferuje potężne kolektory do agregacji i grupowania danych:

\`\`\`java
List<Student> students = List.of(
    new Student("Anna", "Informatyka", 4.8),
    new Student("Jan", "Matematyka", 3.5),
    new Student("Maria", "Informatyka", 4.2),
    new Student("Piotr", "Matematyka", 4.9)
);

// groupingBy — grupowanie po wydziale
Map<String, List<Student>> byDept = students.stream()
    .collect(Collectors.groupingBy(Student::department));
// {"Informatyka": [Anna, Maria], "Matematyka": [Jan, Piotr]}

// partitioningBy — podział na dwie grupy (true/false)
Map<Boolean, List<Student>> partition = students.stream()
    .collect(Collectors.partitioningBy(s -> s.gpa() > 4.0));
// {true: [Anna, Maria, Piotr], false: [Jan]}

// toMap — konwersja na mapę klucz-wartość
Map<String, Double> nameToGpa = students.stream()
    .collect(Collectors.toMap(Student::name, Student::gpa));

// joining — łączenie napisów z separatorem
String names = students.stream()
    .map(Student::name)
    .collect(Collectors.joining(", ", "[", "]"));
// "[Anna, Jan, Maria, Piotr]"

// Grupowanie z zagnieżdżonym kolektorem — średnia GPA per wydział
Map<String, Double> avgGpa = students.stream()
    .collect(Collectors.groupingBy(
        Student::department,
        Collectors.averagingDouble(Student::gpa)
    ));
// {"Informatyka": 4.5, "Matematyka": 4.2}
\`\`\`
`},{title:`6. Parallel Streams i ForkJoinPool`,content:`
Java umożliwia równoległe przetwarzanie strumieni przez zastąpienie \`stream()\` wywołaniem \`parallelStream()\` lub dodaniem \`.parallel()\` do istniejącego strumienia:

\`\`\`java
// Sekwencyjne przetwarzanie (1 wątek)
long count = list.stream()
    .filter(s -> s.length() > 5)
    .count();

// Równoległe przetwarzanie (wiele wątków)
long count = list.parallelStream()
    .filter(s -> s.length() > 5)
    .count();
\`\`\`

Strumienie równoległe domyślnie korzystają z **Common ForkJoinPool** — puli wątków opartej na algorytmie **work-stealing** (nieaktywne wątki "kradną" zadania od zajętych).

> [!WARNING]
> **Kiedy NIE używać Parallel Streams:**
> * Dla **małych kolekcji** (< 10 000 elementów) — narzut na podział i łączenie przewyższa korzyści.
> * Gdy operacje mają **efekty uboczne** (np. modyfikacja wspólnego stanu) — ryzyko wyścigów (race conditions).
> * Gdy źródło danych ma **kiepską podzielność** (np. \`LinkedList\`, \`Stream.iterate\`) — nie da się efektywnie podzielić na fragmenty.
> * Gdy operacje są **blokujące I/O** — zablokuje wątki Common ForkJoinPool, co spowolni całą aplikację.

### ForkJoinPool — własna pula:
Jeśli nie chcemy blokować Common ForkJoinPool (np. w web serverze), możemy stworzyć dedykowaną pulę:
\`\`\`java
ForkJoinPool customPool = new ForkJoinPool(4); // 4 wątki
long result = customPool.submit(() ->
    hugeList.parallelStream()
        .filter(item -> expensiveCheck(item))
        .count()
).join();
\`\`\`

### Inne operacje równoległe:
\`\`\`java
// Równoległe sortowanie tablicy (szybsze niż Arrays.sort dla dużych tablic)
int[] data = new int[10_000_000];
Arrays.parallelSort(data);

// Równoległe ustawianie wartości
Arrays.parallelSetAll(data, i -> i * 2);
\`\`\`
`}],quiz:[{question:`Jaki jest czas dostępu przy odczycie wartości z HashMap, jeśli znamy jej klucz (w optymalnym przypadku)?`,options:[`O(n)`,`O(log n)`,`O(1)`,`O(n^2)`],answer:2,explanation:`HashMap korzysta z tablicy mieszającej (bucket array) i przelicza hashcode klucza, co pozwala na pobranie wartości w stałym czasie O(1).`},{question:`Co charakteryzuje operacje pośrednie (Intermediate Operations) w Stream API?`,options:[`Natychmiast przetwarzają dane i zamykają strumień.`,`Są leniwe (lazy) - nie wykonują się do czasu wywołania operacji terminalnej i zwracają nowy strumień.`,`Można wywołać tylko jedną taką operację na strumieniu.`,`Zawsze modyfikują oryginalną kolekcję danych.`],answer:1,explanation:`Operacje pośrednie (np. filter, map) są łączone w rurociąg i nie wykonują żadnych obliczeń, dopóki nie zostanie wywołana operacja terminalna (np. collect).`},{question:`Czym różnią się Checked Exceptions od Unchecked Exceptions (Runtime Exceptions) pod względem kompilacji?`,options:[`Checked exceptions są sprawdzane w czasie działania programu, a Unchecked w czasie kompilacji.`,`Kompilator wymaga od programisty jawnego zadeklarowania lub obsłużenia wyjątków Checked (np. IOException), natomiast w przypadku wyjątków Unchecked (np. NullPointerException) nie ma takiego wymogu.`,`Unchecked exceptions powodują zawieszenie JVM, a Checked nie.`,`Nie ma żadnych różnic syntaktycznych.`],answer:1,explanation:`Checked Exceptions muszą być jawnie obsłużone (try-catch) lub zadeklarowane (throws) w sygnaturze metody pod groźbą błędu kompilacji. Unchecked Exceptions nie podlegają tej restrykcji.`}]},g={id:`06`,title:`Wykład 06: Strumienie Wejścia/Wyjścia, System Plików i Programowanie Reaktywne`,description:`Omówienie klasycznego I/O (strumienie bajtowe i znakowe), nowoczesnego NIO.2 (Files, Path), obsługi archiwów ZIP oraz podstaw programowania reaktywnego w oparciu o Java Flow API.`,sections:[{title:`1. Klasyczne Strumienie I/O (java.io)`,content:'\nKlasyczne wejście/wyjście w Javie opiera się na koncepcji strumieni danych (Streams), które reprezentują jednokierunkowy przepływ danych. Dzielimy je na dwie główne rodziny:\n\n### 1. Strumienie bajtowe (Byte Streams):\nSłużą do pracy z surowymi danymi binarnymi (np. pliki graficzne, dźwiękowe, binarne). Ich klasy bazowe to:\n* **`InputStream`**: Klasa abstrakcyjna dla strumieni wejściowych (np. `FileInputStream`).\n* **`OutputStream`**: Klasa abstrakcyjna dla strumieni wyjściowych (np. `FileOutputStream`).\n\n### 2. Strumienie znakowe (Character Streams):\nSłużą do pracy z plikami tekstowymi. Automatycznie obsługują kodowanie znaków (np. UTF-8). Ich klasy bazowe to:\n* **`Reader`**: Klasa abstrakcyjna do odczytu znaków (np. `FileReader`, `BufferedReader`).\n* **`Writer`**: Klasa abstrakcyjna do zapisu znaków (np. `FileWriter`, `BufferedWriter`).\n\n### Strumienie buforowane (Buffered Streams):\nDomyślne operacje I/O na dysku są bardzo kosztowne. Aby zwiększyć wydajność, należy owijać standardowe strumienie w ich wersje buforowane, które czytają dane dużymi blokami do pamięci podręcznej (RAM):\n```java\ntry (BufferedReader reader = new BufferedReader(new FileReader("plik.txt"))) {\n    String line;\n    while ((line = reader.readLine()) != null) {\n        System.out.println(line);\n    }\n} // automatyczne zamknięcie strumienia\n```\n'},{title:`2. Nowoczesny System Plików: NIO.2 (java.nio.file)`,content:`
Pakiet NIO.2 (Non-blocking I/O) wprowadzony w Javie 7 zastępuje starą klasę \`java.io.File\` nowym, bardziej elastycznym i bezpiecznym API opartym na trzech głównych elementach:

1. **\`java.nio.file.Path\`**: Reprezentuje ścieżkę do pliku lub katalogu w systemie operacyjnym (niezależną od platformy). Ścieżki tworzymy za pomocą metody statycznej \`Path.of()\` lub \`Paths.get()\`.
2. **\`java.nio.file.Files\`**: Klasa narzędziowa zawierająca statyczne metody do operacji na plikach i katalogach (tworzenie, usuwanie, kopiowanie, sprawdzanie atrybutów, czytanie zawartości).
3. **\`java.nio.file.FileSystem\`**: Reprezentuje system plików.

Przykłady użycia NIO.2:
\`\`\`java
Path path = Path.of("dokumenty/dane.txt");

// Sprawdzenie istnienia pliku
boolean exists = Files.exists(path);

// Odczytanie wszystkich linii jako lista stringów
List<String> lines = Files.readAllLines(path);

// Zapisanie tekstu do pliku
Files.writeString(path, "Nowa zawartość", StandardOpenOption.CREATE, StandardOpenOption.WRITE);

// Szybkie kopiowanie pliku
Path destination = Path.of("kopia/dane_kopia.txt");
Files.copy(path, destination, StandardCopyOption.REPLACE_EXISTING);
\`\`\`
`},{title:`3. Obsługa Archiwów (ZIP)`,content:`
Java umożliwia łatwe tworzenie i rozpakowywanie archiwów zip przy użyciu strumieni \`ZipOutputStream\` i \`ZipInputStream\` znajdujących się w pakiecie \`java.util.zip\`. Każdy plik w archiwum ZIP reprezentowany jest przez obiekt \`ZipEntry\`.

Przykład tworzenia archiwum ZIP:
\`\`\`java
Path zipFile = Path.of("archiwum.zip");
Path sourceFile = Path.of("dane.txt");

try (ZipOutputStream zos = new ZipOutputStream(Files.newOutputStream(zipFile))) {
    ZipEntry entry = new ZipEntry(sourceFile.getFileName().toString());
    zos.putNextEntry(entry);
    
    // Skopiowanie zawartości pliku do archiwum ZIP
    Files.copy(sourceFile, zos);
    zos.closeEntry();
}
\`\`\`
`},{title:`4. Programowanie Reaktywne: Java Flow API`,content:"\nWprowadzone w Javie 9 **Flow API** w pakiecie `java.util.concurrent.Flow` implementuje standard **Reactive Streams**. Jest to wzorzec służący do asynchronicznego przetwarzania strumieni danych bez blokowania wątków i z wbudowaną kontrolą tempa producenta przez konsumenta (tzw. **Backpressure**).\n\nFlow API definiuje 4 powiązane interfejsy:\n1. **`Flow.Publisher<T>`**: Produkuje strumień danych i rejestruje subskrybentów. Posiada metodę `subscribe(Subscriber<? super T> subscriber)`.\n2. **`Flow.Subscriber<T>`**: Konsumuje dane. Implementuje metody:\n   * `onSubscribe(Flow.Subscription subscription)`: wywoływana na początku subskrypcji.\n   * `onNext(T item)`: odbiera kolejny element danych.\n   * `onError(Throwable throwable)`: odbiera powiadomienie o błędzie (zamyka subskrypcję).\n   * `onComplete()`: odbiera powiadomienie o zakończeniu strumienia.\n3. **`Flow.Subscription`**: Reprezentuje powiązanie subskrybenta z wydawcą. Subskrybent używa jej do żądania kolejnych elementów (`request(long n)`) lub rezygnacji (`cancel()`). Zapobiega to przepełnieniu pamięci subskrybenta (Backpressure).\n4. **`Flow.Processor<T, R>`**: Działa jednocześnie jako `Subscriber` oraz `Publisher`. Służy do transformacji strumienia danych z typu T na typ R.\n"}],quiz:[{question:`Jaka jest podstawowa różnica między strumieniami znakowymi (Reader/Writer) a bajtowymi (InputStream/OutputStream)?`,options:[`Strumienie znakowe pracują na plikach na dysku, a bajtowe tylko w sieci.`,`Strumienie znakowe odczytują/zapisują tekst z uwzględnieniem kodowania znaków (np. UTF-8), podczas gdy bajtowe operują na surowych bajtach (binarnie).`,`Strumienie bajtowe są automatycznie buforowane, a znakowe nie.`,`Strumienie znakowe zostały wycofane z użycia w Javie 8.`],answer:1,explanation:`Reader i Writer zostały wprowadzone w celu poprawnej obsługi internacjonalizacji i kodowania znaków tekstowych. Strumienie bajtowe operują na surowych bajtach (dane binarne).`},{question:`Która klasa w pakiecie NIO.2 zawiera statyczne metody operacji na plikach (np. Files.exists(), Files.copy())?`,options:[`Path`,`Files`,`FileSystem`,`File`],answer:1,explanation:`java.nio.file.Files to klasa narzędziowa zawierająca kilkadziesiąt statycznych metod służących do operowania na plikach i katalogach.`},{question:`Co to jest Backpressure w kontekście Flow API?`,options:[`Zjawisko cofania się danych w strumieniu wejściowym.`,`Mechanizm kontroli przepływu, pozwalający Subskrybentowi na zgłaszanie liczby elementów, które jest w stanie przetworzyć (poprzez metodę Subscription.request(n)), zapobiegając przepełnieniu pamięci konsumenta przez zbyt szybki Publisher.`,`Błąd sieciowy występujący w aplikacjach TCP.`,`Metoda automatycznego zamykania zasobów w bloku try.`],answer:1,explanation:`Backpressure to kluczowy element Reactive Streams. Subskrybent kontroluje tempo nadawania, prosząc o kolejne porcje danych (request(n)), dzięki czemu wydawca nie zasypie go danymi.`}]},_={id:`07`,title:`Wykład 07: Zarządzanie Zasobami, Adnotacje, Refleksja i Moduły JPMS`,description:`Szczegółowe omówienie mechanizmu try-with-resources, tworzenia i przetwarzania adnotacji, dynamicznej refleksji API (Reflection) oraz modułowości Java Platform Module System (JPMS).`,sections:[{title:`1. AutoCloseable i try-with-resources`,content:`
Zarządzanie zasobami zewnętrznymi (np. pliki, połączenia z bazą danych, gniazda sieciowe) wymaga ich bezwzględnego zamykania po zakończeniu pracy, aby uniknąć wycieków zasobów systemowych.

Tradycyjna metoda z blokiem \`finally\` była bardzo skomplikowana i podatna na błędy (ponieważ zamykanie zasobu w \`finally\` samo mogło rzucić wyjątek).

Java 7 wprowadziła konstrukcję **try-with-resources**, która automatycznie zamyka wszystkie otwarte w niej zasoby pod warunkiem, że implementują one interfejs **\`java.lang.AutoCloseable\`** (lub jego podinterfejs \`java.io.Closeable\`). Interfejs \`AutoCloseable\` definiuje metodę \`void close() throws Exception\`, natomiast \`Closeable\` ogranicza sygnaturę do \`throws IOException\`.

> [!NOTE]
> Jeśli zarówno blok \`try\`, jak i metoda \`close()\` rzucą wyjątek, wyjątek z \`close()\` zostanie dodany jako **suppressed exception** (dostępny przez \`Throwable.getSuppressed()\`).

Porównanie tradycyjnego zamykania i try-with-resources:
\`\`\`java
// Klasyczna wersja (skomplikowana)
FileInputStream fis = null;
try {
    fis = new FileInputStream("plik.txt");
    // praca z plikiem
} finally {
    if (fis != null) {
        try {
            fis.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

// Nowoczesna wersja (try-with-resources)
try (FileInputStream fis2 = new FileInputStream("plik.txt")) {
    // praca z plikiem - zasób zamknie się automatycznie po wyjściu z bloku try
} // niejawne wywołanie fis2.close()
\`\`\`

> [!TIP]
> W konstrukcji try-with-resources można zainicjalizować wiele zasobów rozdzielając je średnikami: \`try (ResA a = new ResA(); ResB b = new ResB()) { ... }\`. Będą one zamykane w kolejności odwrotnej do ich deklaracji.
`},{title:`2. Adnotacje w Javie`,content:'\nAdnotacje w Javie to rodzaj metadanych, które dostarczają informacji o kodzie programu, nie wpływając bezpośrednio na jego działanie. Są używane przez kompilator (np. `@Override`, `@Deprecated`, `@SuppressWarnings`) oraz przez frameworki do konfiguracji i weryfikacji w czasie wykonania (np. Spring, Hibernate).\n\n### Definiowanie własnych adnotacji:\nWłasną adnotację definiuje się za pomocą słowa kluczowego `@interface`. Kluczowe jest określenie dwóch adnotacji meta:\n* **`@Retention`**: Określa, jak długo adnotacja ma być przechowywana:\n  * `RetentionPolicy.SOURCE`: widoczna tylko w kodzie źródłowym, usuwana przez kompilator (np. Lombok).\n  * `RetentionPolicy.CLASS`: zapisywana w pliku `.class`, ale niedostępna w czasie działania programu.\n  * `RetentionPolicy.RUNTIME`: zapisywana w pliku `.class` i dostępna w runtime poprzez refleksję.\n* **`@Target`**: Określa, do jakich elementów kodu można zastosować adnotację (np. `ElementType.METHOD`, `ElementType.FIELD`, `ElementType.TYPE` dla klas).\n\nPrzykład:\n```java\n@Retention(RetentionPolicy.RUNTIME)\n@Target(ElementType.METHOD)\npublic @interface ExecutionTime {\n    String value() default "Standardowa diagnostyka";\n}\n```\n'},{title:`3. Refleksja (Reflection API)`,content:`
**Refleksja** to mechanizm pozwalający programowi na badanie i modyfikację własnej struktury oraz zachowania w czasie działania programu (Runtime). Za pomocą pakietu \`java.lang.reflect\` możemy analizować klasy, pobierać ich pola, metody, konstruktory, a także wywoływać je dynamicznie, nawet jeśli są prywatne.

Zastosowanie refleksji:
\`\`\`java
// Pobranie obiektu klasy
Class<?> clazz = Class.forName("pl.edu.pw.mini.User");

// Stworzenie instancji klasy dynamicznie
Constructor<?> constructor = clazz.getConstructor(String.class);
Object user = constructor.newInstance("Jan Kowalski");

// Pobranie i wywołanie prywatnej metody
Method privateMethod = clazz.getDeclaredMethod("calculateSalary");
privateMethod.setAccessible(true); // Ominięcie kontroli modyfikatorów dostępu!
Object result = privateMethod.invoke(user);

// Modyfikacja prywatnego pola
Field privateField = clazz.getDeclaredField("id");
privateField.setAccessible(true);
privateField.set(user, 12345);
\`\`\`

> [!CAUTION]
> Choć refleksja jest potężna, wiąże się z dużymi kosztami wydajnościowymi — refleksja omija optymalizacje kompilatora JIT (np. inlining metod), co znacząco spowalnia wielokrotne wywołania refleksyjne w porównaniu z bezpośrednimi wywołaniami metod. Ponadto wyłącza weryfikację typów w czasie kompilacji (błędy pojawią się dopiero w runtime) oraz łamie zasady enkapsulacji (modyfikacja prywatnych pól). Powinna być stosowana z umiarem (głównie w bibliotekach i frameworkach).
`},{title:`4. System Modułów JPMS (Java Platform Module System)`,content:`
Wprowadzony w Javie 9 **Java Platform Module System (JPMS)** (znany jako Project Jigsaw) zredefiniował architekturę aplikacji Java. Wprowadził on dodatkowy poziom abstrakcji powyżej pakietów – **Moduły**.

Moduł grupuje powiązane pakiety i zasoby. Konfiguracja modułu znajduje się w pliku **\`module-info.java\`** w katalogu głównym kodu źródłowego.

Kluczowe dyrektywy w \`module-info.java\`:
* **\`requires\`**: Deklaruje zależności modułu od innych modułów (np. \`requires java.sql;\`).
* **\`exports\`**: Deklaruje pakiety z tego modułu, które mają być publicznie widoczne dla innych modułów. Pakiety niewyeksportowane są traktowane jako całkowicie prywatne (nawet dla refleksji!).
* **\`opens\`**: Pozwala na dostęp do określonego pakietu poprzez refleksję innym modułom bez eksportowania go do normalnego importu.

Przykład pliku \`module-info.java\`:
\`\`\`java
module my.awesome.app {
    requires java.sql;
    requires com.google.gson;

    exports pl.edu.pw.mini.api;
    opens pl.edu.pw.mini.model to com.google.gson;
}
\`\`\`

JPMS eliminuje problem "Classpath Hell" (konfliktów wersji JAR-ów) poprzez silną enkapsulację i weryfikację zależności przy starcie aplikacji (JVM od razu zgłosi brak wymaganego modułu).
`}],quiz:[{question:`Jaki interfejs musi implementować klasa, aby jej instancja mogła być użyta w konstrukcji try-with-resources?`,options:[`java.io.Serializable`,`java.lang.Runnable`,`java.lang.AutoCloseable`,`java.lang.Cloneable`],answer:2,explanation:`Try-with-resources wymaga, aby zasób implementował AutoCloseable (lub jego podinterfejs Closeable), co gwarantuje obecność metody close(), która jest wywoływana automatycznie.`},{question:`Która polityka retencji (@Retention) sprawi, że adnotacja będzie dostępna w czasie działania programu za pomocą refleksji?`,options:[`RetentionPolicy.SOURCE`,`RetentionPolicy.CLASS`,`RetentionPolicy.RUNTIME`,`Brak adnotacji @Retention domyślnie zapewnia jej dostępność.`],answer:2,explanation:`RetentionPolicy.RUNTIME instruuje kompilator i maszynę JVM, aby zachować adnotację w pliku klasy i załadować ją do pamięci, dzięki czemu jest dostępna w runtime przez refleksję.`},{question:`Co robi dyrektywa 'exports' w konfiguracji module-info.java?`,options:[`Deklaruje, że moduł wymaga biblioteki zewnętrznej.`,`Udostępnia publicznie klasy z wybranego pakietu dla innych modułów.`,`Eksportuje cały projekt do formatu ZIP.`,`Zezwala na refleksyjny dostęp do prywatnych pól klasy.`],answer:1,explanation:`Dyrektywa exports pozwala na udostępnienie określonego pakietu na zewnątrz modułu. Bez eksportu, pakiety są całkowicie ukryte przed innymi modułami.`}]},v={id:`08`,title:`Wykład 08: Javadoc, Wzorce Dopasowania (Pattern Matching) i Wątki`,description:`Omówienie braku przeciążania operatorów w Javie, tworzenia dokumentacji Javadoc, alternatyw dla dyrektyw preprocesora, nowoczesnego Pattern Matchingu oraz podstaw wielowątkowości (Threads).`,sections:[{title:`1. Brak Przeciążania Operatorów & Javadoc`,content:`
### Przeciążanie Operatorów (Operator Overloading) w Javie:
Java **nie wspiera** przeciążania operatorów (z wyjątkiem operatora \`+\` dla obiektów \`String\`). James Gosling podjął tę decyzję w celu uproszczenia składni i uniknięcia błędów, które często pojawiały się w języku C++ z powodu nieczytelnych przeciążeń.

W Javie operacje na obiektach matematycznych (np. \`BigDecimal\`, \`BigInteger\`) wykonujemy za pomocą jawnych metod:
\`\`\`java
BigDecimal a = new BigDecimal("10.50");
BigDecimal b = new BigDecimal("2.30");

// Zamiast a + b:
BigDecimal sum = a.add(b);

// Zamiast a * b:
BigDecimal product = a.multiply(b);
\`\`\`

### Dokumentacja Javadoc:
Javadoc to oficjalny system generowania dokumentacji HTML z komentarzy w kodzie źródłowym. Komentarze Javadoc zaczynają się od \`/**\` i kończą na \`*/\`. Stosuje się w nich specjalne tagi:

\`\`\`java
/**
 * Oblicza pole powierzchni koła.
 *
 * @param radius promień koła, musi być większy od zera
 * @return pole powierzchni koła jako double
 * @throws IllegalArgumentException jeśli promień jest mniejszy lub równy zero
 * @see <a href="https://pl.wikipedia.org/wiki/Ko%C5%82o">Koło w Wikipedii</a>
 */
public double calculateArea(double radius) {
    if (radius <= 0) {
        throw new IllegalArgumentException("Promień musi być dodatni!");
    }
    return Math.PI * radius * radius;
}
\`\`\`
`},{title:`2. Dyrektywy Preprocesora w Javie`,content:'\nJava **nie posiada preprocesora** (nie ma dyrektyw takich jak `#define`, `#ifdef`, `#if` znanych z C/C++ czy C#). Wynika to z chęci uniknięcia uzależnienia kodu źródłowego od środowiska kompilacji oraz ułatwienia analizy kodu przez edytory (IDE).\n\nW Javie funkcjonalności te realizuje się poprzez:\n1. **Flagi kompilatora i stałe logiczne**: Kompilator Javy automatycznie usuwa martwy kod (Dead Code Elimination) w przypadku stałych warunków w czasie kompilacji:\n   ```java\n   public static final boolean DEBUG = false;\n   \n   if (DEBUG) {\n       System.out.println("To wypisze się tylko w debugu"); // Kod ten zostanie usunięty z pliku .class!\n   }\n   ```\n2. **Profile Maven/Gradle**: Filtrowanie zasobów na etapie budowania (zastępowanie zmiennych w plikach `.properties` lub `.xml`).\n3. **Zmienne środowiskowe**: Sprawdzanie parametrów systemu operacyjnego w runtime (`System.getProperty("os.name")`).\n'},{title:`3. Nowoczesny Pattern Matching (Dopasowanie do Wzorców)`,content:`
W nowszych wersjach Javy (Java 16 do 21) wprowadzono mechanizmy **Pattern Matchingu**, które drastycznie zmniejszają boilerplate i zwiększają bezpieczeństwo kodu:

### 1. Pattern Matching dla instanceof (Java 16):
Tradycyjne rzutowanie typu:
\`\`\`java
if (obj instanceof String) {
    String s = (String) obj; // Ręczne rzutowanie
    System.out.println(s.toUpperCase());
}
\`\`\`
Nowoczesne dopasowanie:
\`\`\`java
if (obj instanceof String s) { // Zmienna 's' jest automatycznie zrzutowana i dostępna w tym bloku
    System.out.println(s.toUpperCase());
}
\`\`\`

### 2. Pattern Matching w instrukcjach switch (Java 21):
Pozwala na sprawdzenie typu w switchu:
\`\`\`java
String result = switch (obj) {
    case Integer i -> "Liczba całkowita: " + i;
    case String s  -> "Napis o długości: " + s.length();
    case null      -> "Wartość null!";
    default        -> "Inny typ";
};
\`\`\`

### 3. Klasy Blokowane (Sealed Classes — Java 17, JEP 409) i wyczerpalność switcha:
Klasy sealed (\`sealed class\`) ograniczają listę podklas, które mogą po nich dziedziczyć. Słowo kluczowe \`permits\` jawnie wymienia dozwolone podklasy. Jeśli wszystkie podklasy są zdefiniowane w tym samym pliku źródłowym, klauzula \`permits\` może zostać pominięta.

Każda dozwolona podklasa musi być oznaczona jako \`final\`, \`sealed\` lub \`non-sealed\`.

W połączeniu ze switchem, kompilator może sprawdzić wyczerpalność (czy obsłużono wszystkie przypadki), eliminując potrzebę pisania bloku \`default\`:
\`\`\`java
public sealed interface Shape permits Circle, Square {}
public final class Circle implements Shape { public double radius; }
public final class Square implements Shape { public double side; }

// Wyczerpujący switch (brak default)
double area = switch (shape) {
    case Circle c -> Math.PI * c.radius * c.radius;
    case Square s -> s.side * s.side;
};
\`\`\`
`},{title:`4. Podstawy Wielowątkowości: Wątki (Threads)`,content:`
Wielowątkowość w Javie pozwala na jednoczesne wykonywanie wielu zadań w ramach tego samego procesu. Każdy program w Javie uruchamia przynajmniej jeden wątek główny (Main Thread).

Wątek reprezentowany jest przez klasę \`java.lang.Thread\`. Wątki można tworzyć na dwa sposoby:

### 1. Dziedziczenie po klasie Thread:
\`\`\`java
public class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Wątek uruchomiony: " + Thread.currentThread().getName());
    }
}
// Uruchomienie:
MyThread t = new MyThread();
t.start(); // Uwaga: wywołujemy start(), a nie run()!
\`\`\`

### 2. Implementacja interfejsu Runnable (Zalecane):
Umożliwia oddzielenie definicji zadania od mechanizmu wątku (lepsze praktyki obiektowe).
\`\`\`java
Runnable task = () -> System.out.println("Zadanie w wątku: " + Thread.currentThread().getName());
Thread t = new Thread(task);
t.start();
\`\`\`

### Różnica między start() a run():
* **\`start()\`**: Tworzy nowy wątek na poziomie systemu operacyjnego i uruchamia w nim asynchronicznie metodę \`run()\`.
* **\`run()\`**: Zwykłe wywołanie metody w wątku bieżącym (wykonanie synchroniczne).
`}],quiz:[{question:`W jaki sposób w Javie realizuje się operacje arytmetyczne na precyzyjnych liczbach dziesiętnych klasy BigDecimal?`,options:[`Używając standardowych operatorów, np. c = a + b;`,`Wywołując metody takie jak a.add(b) i a.multiply(b), ponieważ Java nie wspiera przeciążania operatorów.`,`Java automatycznie zamienia BigDecimal na typ int.`,`Poprzez refleksję i wywołanie ukrytych operatorów.`],answer:1,explanation:`Java nie wspiera przeciążania operatorów, dlatego operacje na klasach takich jak BigDecimal muszą być wywoływane za pomocą jawnych metod (add, multiply, divide).`},{question:`Co daje zastosowanie Pattern Matching dla operatora instanceof (od Java 16)?`,options:[`Pozwala na szybsze działanie programu na starszych systemach.`,`Automatycznie rzutuje sprawdzany obiekt na deklarowaną zmienną typu, eliminując konieczność pisania dodatkowej linijki kodu z rzutowaniem.`,`Uniemożliwia rzutowanie obiektów na typy niekompatybilne.`,`Zamienia instancje na typy prymitywne.`],answer:1,explanation:`Zapis 'if (obj instanceof String s)' sprawdza typ obj, a jeśli warunek jest spełniony, automatycznie tworzy zmienną referencyjną 's' typu String, gotową do użycia.`},{question:`Co się stanie, gdy zamiast metody start() wywołamy bezpośrednio metodę run() na obiekcie Thread?`,options:[`Wątek zostanie uruchomiony w tle, ale bez nazwy.`,`Kod z metody run() wykona się synchronicznie w bieżącym wątku (nie zostanie utworzony nowy wątek systemowy).`,`Zostanie rzucony wyjątek IllegalThreadStateException.`,`Maszyna JVM zakończy działanie programu.`],answer:1,explanation:`Tylko metoda start() żąda od systemu operacyjnego utworzenia nowego wątku. Bezpośrednie wywołanie run() działa jak zwykłe wywołanie metody na obiekcie w bieżącym wątku.`}]},y={id:`09`,title:`Wykład 09: Współbieżność Asynchroniczna i Wirtualne Wątki (Project Loom)`,description:`Omówienie puli wątków (ExecutorService), asynchronicznej kompozycji zadań (CompletableFuture), formatowania danych oraz przełomowej technologii Wirtualnych Wątków w Javie 21.`,sections:[{title:`1. Zarządzanie Wątkami: ExecutorService`,content:`
Ręczne tworzenie obiektów \`Thread\` dla każdego zadania jest nieefektywne (tworzenie wątku OS jest kosztowne i zużywa ok. 1MB pamięci RAM na stos). Do zarządzania pulami wątków służy interfejs **\`java.util.concurrent.ExecutorService\`**.

Klasa narzędziowa \`Executors\` pozwala na łatwe tworzenie pul:
* **\`newFixedThreadPool(int n)\`**: Pula ze stałą liczbą wątków. Idealna do zadań o ograniczonych zasobach procesora.
* **\`newCachedThreadPool()\`**: Tworzy nowe wątki w razie potrzeby, a nieużywane usuwa. Dobra do wielu krótkich, nieblokujących zadań.
* **\`newScheduledThreadPool(int n)\`**: Umożliwia cykliczne lub opóźnione wywoływanie zadań.

Przykład użycia:
\`\`\`java
ExecutorService executor = Executors.newFixedThreadPool(4);

// Przesłanie zadania typu Runnable (nic nie zwraca)
executor.submit(() -> System.out.println("Zadanie w puli"));

// Przesłanie zadania typu Callable (zwraca wartość w obiekcie Future)
Future<Integer> future = executor.submit(() -> {
    Thread.sleep(1000);
    return 42;
});

// Pobranie wyniku (metoda get() jest blokująca!)
Integer result = future.get(); // 42

// Zamykanie puli (zawsze konieczne!)
executor.shutdown();
\`\`\`
`},{title:`2. Programowanie Asynchroniczne: CompletableFuture`,content:`
Klasa \`Future\` nie pozwala na łatwe łączenie zadań w łańcuchy ani asynchroniczną reakcję na błędy. Java 8 wprowadziła klasę **\`CompletableFuture<T>\`**, która implementuje interfejs \`CompletionStage\` i reprezentuje asynchroniczny etap obliczeń, który można komponować bez blokowania wątków.

Przykłady kompozycji asynchronicznej:
\`\`\`java
CompletableFuture.supplyAsync(() -> {
    // Zadanie 1: Odczyt danych z sieci (uruchamiane w domyślnej puli ForkJoinPool.commonPool)
    return "Dane użytkownika";
})
.thenApply(data -> {
    // Zadanie 2: Transformacja danych (wywoływane po zakończeniu Zadania 1)
    return data + " (zanalizowane)";
})
.thenAccept(result -> {
    // Zadanie 3: Konsumpcja wyniku
    System.out.println("Wynik końcowy: " + result);
})
.exceptionally(throwable -> {
    // Obsługa błędów na dowolnym etapie łańcucha
    System.err.println("Błąd: " + throwable.getMessage());
    return null;
});
\`\`\`
`},{title:`3. Wirtualne Wątki (Virtual Threads) - Project Loom (Java 21)`,content:`
Przed wersją Java 21, jeden wątek Java (\`Thread\`) odpowiadał dokładnie jednemu wątkowi systemu operacyjnego (Platform Thread / Kernel Thread). Powodowało to ograniczenie liczby wątków do kilku tysięcy z powodu zużycia pamięci i narzutu na przełączanie kontekstu (context switching) w OS.

Java 21 wprowadza **Wirtualne Wątki (Virtual Threads)**, rozwijane w ramach projektu **Loom**. 
* Są to niezwykle tanie wątki (od kilkuset bajtów do kilku KB na wątek), zarządzane bezpośrednio przez JVM w pamięci sterty, a nie przez system operacyjny.
* Możemy uruchomić **miliony** wirtualnych wątków jednocześnie.
* Kiedy wirtualny wątek wykonuje blokującą operację I/O (np. zapytanie do bazy danych, czytanie pliku), JVM odmontowuje go z fizycznego wątku nośnego (Carrier Thread) i parkuje. Wątek fizyczny w tym czasie wykonuje inne wirtualne wątki. Po zakończeniu I/O, wirtualny wątek jest przywracany na wolny wątek fizyczny.

> [!WARNING]
> **Thread Pinning**: Gdy wirtualny wątek wykonuje kod wewnątrz bloku \`synchronized\` lub wywołuje kod natywny (JNI/FFM) i napotyka operację blokującą I/O, nie może zostać odmontowany od wątku nośnego (Carrier Thread). Powoduje to fizyczne zablokowanie wątku nośnego. Zaleca się używanie \`ReentrantLock\` zamiast \`synchronized\` w kodzie przeznaczonym dla wirtualnych wątków.

Dzięki temu pisanie kodu blokującego staje się wysoce wydajne, bez potrzeby stosowania skomplikowanych frameworków reaktywnych (jak WebFlux czy RxJava).

Od Javy 21 dostępna jest również (w wersji preview) funkcjonalność **Structured Concurrency** (JEP 462), umożliwiająca grupowanie powiązanych wirtualnych wątków za pomocą \`StructuredTaskScope\`, co zapewnia automatyczne anulowanie podzadań w przypadku awarii jednego z nich.

Tworzenie wirtualnych wątków:
\`\`\`java
// 1. Bezpośrednie uruchomienie wątku wirtualnego
Thread.startVirtualThread(() -> {
    System.out.println("Działam w wątku wirtualnym!");
});

// 2. Użycie dedykowanego Executora (tworzy nowy wątek wirtualny dla każdego zadania)
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> {
        // Operacja blokująca I/O
        Thread.sleep(1000);
        return "Gotowe";
    });
} // Automatyczne zamknięcie puli (try-with-resources) czeka na zakończenie zadań
\`\`\`
`},{title:`4. Formatowanie Danych (Date, Time, String)`,content:'\n### String.format i System.out.printf:\nJava oferuje klasyczny mechanizm formatowania w stylu C:\n```java\nString info = String.format("Witaj %s! Masz %d powiadomień. Saldo: %.2f PLN", "Anna", 5, 120.538);\n// "Witaj Anna! Masz 5 powiadomień. Saldo: 120.54 PLN"\n```\n\n### Nowoczesny czas: Java Date/Time API (java.time):\nWprowadzony w Javie 8 pakiet zastępuje stare, wadliwe klasy `Date` i `Calendar`. Nowe klasy są **niemutowalne** i bezpieczne wielowątkowo:\n* **`LocalDate`**: Sama data (rok, miesiąc, dzień) - np. `LocalDate.now()`.\n* **`LocalTime`**: Sam czas (godzina, minuta, sekunda).\n* **`LocalDateTime`**: Data i czas bez strefy czasowej.\n* **`ZonedDateTime`**: Pełna data, czas i strefa czasowa.\n* **`DateTimeFormatter`**: Służy do parsowania i formatowania dat:\n```java\nLocalDateTime now = LocalDateTime.now();\nDateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");\nString text = now.format(formatter); // "2026-07-07 22:55:00"\n```\n'}],quiz:[{question:`Co dzieje się z fizycznym wątkiem procesora (Carrier Thread), gdy wirtualny wątek Java 21 wykonuje blokującą operację wejścia/wyjścia (np. Thread.sleep() lub I/O)?`,options:[`Wątek fizyczny zostaje zablokowany i czeka, marnując zasoby procesora.`,`JVM automatycznie odmontowuje zablokowany wątek wirtualny, zwalniając wątek fizyczny do wykonywania innych wątków wirtualnych.`,`System operacyjny kończy proces aplikacji.`,`Zostaje rzucony wyjątek VirtualThreadBlockedException.`],answer:1,explanation:`Jest to kluczowa zaleta wirtualnych wątków. Kiedy następuje blokada I/O, wirtualny wątek jest parkowany w pamięci sterty, a Carrier Thread natychmiast przejmuje inne zadania.`},{question:`Która metoda w klasie CompletableFuture pozwala na transformację wyniku asynchronicznego (analogicznie do map w strumieniach)?`,options:[`thenAccept(Consumer)`,`thenApply(Function)`,`exceptionally(Function)`,`allOf(CompletableFuture[])`],answer:1,explanation:`Metoda 'thenApply' przyjmuje interfejs funkcyjny Function, transformuje wynik asynchroniczny z typu T na U i zwraca nowy CompletableFuture<U>.`},{question:`Co charakteryzuje klasy z pakietu java.time (wprowadzonego w Java 8, np. LocalDate, LocalDateTime)?`,options:[`Są mutowalne i wymagają synchronizacji w aplikacjach wielowątkowych.`,`Są całkowicie niemutowalne (thread-safe) - każda modyfikacja (np. plusDays(1)) zwraca nowy obiekt.`,`Są przestarzałe i nie zaleca się ich używania.`,`Służą wyłącznie do formatowania plików tekstowych.`],answer:1,explanation:`Klasy z pakietu java.time są niemutowalne (immutable) i dzięki temu bezpieczne w środowiskach wielowątkowych (brak ryzyka wyścigu - race conditions).`}]},b={id:`10`,title:`Wykład 10: Sieci TCP, Protokół HTTP i Serializacja Danych`,description:`Zagadnienia komunikacji sieciowej w Javie (gniazda Socket/ServerSocket, nowoczesny HttpClient), asynchroniczne strumienie reactive flow, oraz metody serializacji (Java, JSON, Protobuf).`,sections:[{title:`1. Sieć TCP: Gniazda (Socket i ServerSocket)`,content:`
Java umożliwia bezpośrednią komunikację sieciową na poziomie warstwy transportowej (TCP) przy użyciu pakietu \`java.net\`. Do obsługi połączeń klient-serwer służą dwie klasy:

1. **\`ServerSocket\`**: Klasa używana przez aplikację serwera do nasłuchiwania na określonym porcie. Metoda \`accept()\` blokuje wątek do momentu nawiązania połączenia przez klienta i zwraca obiekt \`Socket\`.
2. **\`Socket\`**: Klasa reprezentująca połączenie dwukierunkowe. Pozwala na pobranie strumieni wejściowych (\`getInputStream()\`) i wyjściowych (\`getOutputStream()\`) do wymiany danych.

Przykład prostego serwera echo:
\`\`\`java
public class EchoServer {
    public static void main(String[] args) throws IOException {
        try (ServerSocket serverSocket = new ServerSocket(8080)) {
            System.out.println("Serwer nasłuchuje na porcie 8080...");
            while (true) {
                // accept() blokuje wątek do nadejścia połączenia
                try (Socket clientSocket = serverSocket.accept();
                     BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
                     PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true)) {
                    
                    String line = in.readLine();
                    out.println("Echo: " + line);
                }
            }
        }
    }
}
\`\`\`
`},{title:`2. Nowoczesny Klient HTTP: HttpClient (Java 11)`,content:`
Od Javy 11 standardowy klient HTTP (\`java.net.http.HttpClient\`) zastąpił stare, mało wydajne API \`HttpURLConnection\`. Nowy klient wspiera protokoły **HTTP/1.1** oraz **HTTP/2**, zapytania synchroniczne, asynchroniczne (zwracające \`CompletableFuture\`) oraz technologię WebSocket.

Przykład zapytania asynchronicznego GET:
\`\`\`java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("https://api.github.com/users/octocat"))
        .header("Accept", "application/json")
        .GET()
        .build();

// Asynchroniczne wywołanie (nie blokuje wątku głównego)
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
        .thenApply(HttpResponse::body)
        .thenAccept(json -> System.out.println("Otrzymany JSON: " + json))
        .join(); // blokuje wątek główny na końcu tylko do zakończenia programu
\`\`\`
`},{title:`3. Serializacja Danych: Klasyczna Java, JSON i Protobuf`,content:`
Serializacja to proces zapisu stanu obiektu (pamięci RAM) do formatu binarnego lub tekstowego w celu przesłania go przez sieć lub zapisu na dysku. Deserializacja to proces odwrotny.

### 1. Serializacja Natywna Java (\`java.io.Serializable\`):
* Wymaga zaimplementowania interfejsu-znacznika \`Serializable\`.
* Należy zadeklarować pole \`private static final long serialVersionUID\` w celu weryfikacji zgodności klas w procesie deserializacji.
* Pola oznaczone modyfikatorem \`transient\` nie podlegają serializacji.
* **Uwaga na bezpieczeństwo**: Natywna serializacja Javy jest uznawana za przestarzałą i wysoce niebezpieczną (podatność na ataki typu *deserialization gadgets*, które pozwalają na zdalne wykonanie kodu - RCE). Nie zaleca się jej w nowych projektach.

### 2. Serializacja do JSON (np. biblioteka Jackson):
Najpopularniejszy format tekstowy. Używamy bibliotek takich jak **Jackson** lub **Gson**. Jackson automatycznie mapuje obiekty Java (w tym Rekordy!) na format JSON i odwrotnie przy użyciu klasy \`ObjectMapper\`:
\`\`\`java
ObjectMapper mapper = new ObjectMapper();
User user = new User("Jan", 30);

// Serializacja do Stringa JSON
String json = mapper.writeValueAsString(user); // {"name":"Jan","age":30}

// Deserializacja z JSON
User userCopy = mapper.readValue(json, User.class);
\`\`\`

### 3. Protocol Buffers (Protobuf - od Google):
Format binarny o wysokiej wydajności. Wymaga zdefiniowania schematu danych w pliku \`.proto\`, na podstawie którego generowany jest kod Java. Jest znacznie szybszy i generuje mniejszy narzut sieciowy niż JSON/XML. Szeroko stosowany w komunikacji gRPC.
`}],quiz:[{question:`Co robi metoda ServerSocket.accept()?`,options:[`Wysyła zapytanie HTTP do klienta.`,`Zamyka połączenie serwera.`,`Blokuje wątek i nasłuchuje na porcie, zwracając obiekt Socket w momencie nawiązania połączenia przez klienta.`,`Deserializuje strumień danych.`],answer:2,explanation:`Metoda accept() jest operacją blokującą. Czeka na połączenie od klienta TCP i po jego nawiązaniu zwraca obiekt Socket reprezentujący to połączenie.`},{question:`Dlaczego standardowa, natywna serializacja Java (Serializable) jest obecnie odradzana?`,options:[`Jest niekompatybilna z nowymi systemami operacyjnymi.`,`Stwarza duże zagrożenie bezpieczeństwa, umożliwiając ataki typu Remote Code Execution (RCE) podczas deserializacji niezweryfikowanych danych.`,`Działa tylko w aplikacjach jednowątkowych.`,`Wycofano ją w Javie 21.`],answer:1,explanation:`Deserializacja w natywnej Javie tworzy obiekty bez wywoływania konstruktorów i pozwala na manipulację grafem obiektów, co napastnicy mogą wykorzystać do uruchomienia złośliwego kodu.`},{question:`Co oznacza modyfikator 'transient' przy deklaracji pola klasy implementującej Serializable?`,options:[`Pole to jest przesyłane jako pierwsze.`,`Pole to zostanie pominięte podczas procesu serializacji obiektu.`,`Pole to jest zapisywane w formacie JSON, a pozostałe w XML.`,`Wymusza szyfrowanie zawartości tego pola.`],answer:1,explanation:`Słowo kluczowe transient informuje mechanizm serializacji, że stan tego pola nie powinien być zapisywany (np. hasła, połączenia sieciowe, pola obliczalne).`}]},x={id:`11`,title:`Wykład 11: Warsztaty - Struktura Aplikacji, Testy i Dobre Praktyki`,description:`Praktyczny poradnik konfiguracji profesjonalnego projektu w Javie: struktura pakietów (Architecture Layers), testowanie z JUnit 5, logowanie zdarzeń (SLF4J/Logback) oraz budowanie dystrybucyjne (Uber-JAR).`,sections:[{title:`1. Profesjonalna Struktura Projektu (Package Structure)`,content:"\nDla aplikacji biznesowych w środowisku Java standardem jest architektura warstwowa (Layered Architecture). Pozwala ona na odseparowanie odpowiedzialności (Separation of Concerns). Pakiety w projekcie (np. `pl.edu.pw.mini.app`) powinny odzwierciedlać te warstwy:\n\n* **`model` (lub `domain` / `entity` )**: Zawiera czyste encje biznesowe, dane i rekordy (np. `User`, `Order`).\n* **`repository` (lub `dao` - Data Access Object)**: Warstwa odpowiedzialna za bezpośrednią komunikację z bazą danych lub systemem plików.\n* **`service`**: Warstwa logiki biznesowej. Tu znajdują się algorytmy, kalkulacje oraz wywołania repozytoriów.\n* **`controller` (lub `api` / `ui` )**: Punkt wejścia do aplikacji. Obsługuje interfejs użytkownika (np. REST API, konsola, GUI).\n* **`config`**: Klasy konfiguracyjne aplikacji.\n\nPrzykład struktury katalogów na dysku:\n```text\nsrc/\n├── main/\n│   ├── java/\n│   │   └── pl/edu/pw/mini/app/\n│   │       ├── model/\n│   │       ├── repository/\n│   │       ├── service/\n│   │       └── App.java (punkt wejścia)\n│   └── resources/\n│       ├── application.properties (pliki konfiguracyjne)\n│       └── logback.xml (konfiguracja loggera)\n└── test/\n    └── java/\n        └── pl/edu/pw/mini/app/\n            └── service/ (testy jednostkowe warstwy biznesowej)\n```\n"},{title:`2. Testowanie Jednostkowe: JUnit 5 i AssertJ`,content:`
Testy jednostkowe (Unit Tests) weryfikują poprawność pojedynczych metod w oderwaniu od reszty systemu. Standardem w Javie jest biblioteka **JUnit 5 (Jupiter)**. Do tworzenia czytelnych asercji często stosuje się bibliotekę **AssertJ**.

Przykład testu jednostkowego:
\`\`\`java
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CalculatorTest {
    private Calculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new Calculator(); // Inicjalizacja przed każdym testem
    }

    @Test
    void shouldAddTwoNumbersCorrectly() {
        // given & when
        int result = calculator.add(2, 3);

        // then (Asercja JUnit 5)
        // assertEquals(5, result);
        
        // then (Asercja AssertJ - bardzo czytelna)
        assertThat(result)
            .isEqualTo(5)
            .isPositive();
    }

    @Test
    void shouldThrowExceptionWhenDividingByZero() {
        // then
        assertThatThrownBy(() -> calculator.divide(10, 0))
            .isInstanceOf(ArithmeticException.class)
            .hasMessageContaining("Dzielenie przez zero");
    }
}
\`\`\`
`},{title:`3. Logowanie Zdarzeń: SLF4J i Logback`,content:`
Używanie \`System.out.println()\` do wypisywania informacji diagnostycznych w aplikacjach produkcyjnych jest antywzorcem (brak kontroli nad poziomami logowania, brak formatowania, trudne przekierowanie do plików).

Standardem w Javie jest fasada **SLF4J (Simple Logging Facade for Java)** w połączeniu z biblioteką implementującą, np. **Logback** lub **Log4j2**.

### Poziomy logowania (od najniższego):
1. **\`TRACE\`**: Bardzo szczegółowe logi diagnostyczne.
2. **\`DEBUG\`**: Logi przydatne podczas programowania i lokalnego uruchamiania.
3. **\`INFO\`**: Ogólne informacje o pracy aplikacji (np. start serwera, zarejestrowanie użytkownika).
4. **\`WARN\`**: Ostrzeżenia o niespodziewanych sytuacjach, które nie przerywają pracy (np. wolne zapytanie).
5. **\`ERROR\`**: Błędy krytyczne, zazwyczaj z zrzutem stosu (stacktrace).

Użycie loggera w klasie:
\`\`\`java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    public void registerUser(String username) {
        log.info("Próba rejestracji użytkownika: {}", username); // dynamiczny parametr {}
        try {
            // logika
        } catch (Exception e) {
            log.error("Nieudana rejestracja użytkownika {}: ", username, e); // zrzut stosu
        }
    }
}
\`\`\`
`},{title:`4. Budowanie i Wdrażanie Aplikacji (Uber-JAR)`,content:`
Aby uruchomić aplikację Java na innym komputerze bez konieczności instalowania zależności, należy spakować projekt do pliku **Uber-JAR** (znanego też jako Fat-JAR). Zawiera on zarówno nasze skompilowane pliki \`.class\`, jak i wszystkie zależne biblioteki ZIP-owane w jednym pliku \`.jar\`.

W Mavenie do tworzenia Uber-JAR służy wtyczka \`maven-shade-plugin\`:
\`\`\`xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>3.5.1</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
            <configuration>
                <transformers>
                    <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                        <mainClass>pl.edu.pw.mini.app.App</mainClass>
                    </transformer>
                </transformers>
            </configuration>
        </execution>
    </executions>
</plugin>
\`\`\`

Budowanie i uruchamianie z konsoli:
\`\`\`bash
# Zbudowanie projektu (stworzenie pliku JAR w katalogu target)
mvn clean package

# Uruchomienie aplikacji z pliku JAR
java -jar target/java-app-1.0.0.jar
\`\`\`
`}],quiz:[{question:`Który pakiet zawiera adnotacje testowe (np. @Test, @BeforeEach) biblioteki JUnit 5?`,options:[`org.junit.jupiter.api`,`junit.framework`,`org.junit.test`,`java.util.test`],answer:0,explanation:`JUnit 5 (Jupiter) korzysta z pakietu org.junit.jupiter.api dla swoich adnotacji i mechanizmów asercji.`},{question:`Dlaczego antywzorcem jest wypisywanie logów przez System.out.println()?`,options:[`System.out.println() nie działa w systemie Linux.`,`System.out.println() jest synchronizowany na konsoli i drastycznie spowalnia aplikację w środowisku wielowątkowym, dodatkowo nie pozwala na filtrowanie poziomów logowania (np. INFO vs ERROR) ani łatwy zapis do pliku.`,`Metoda ta rzuca wyjątek IOException.`,`JVM usuwa te wywołania podczas optymalizacji JIT.`],answer:1,explanation:`Standardowe wyjście konsoli jest blokujące i mało wydajne, dodatkowo brak w nim elastyczności (brak poziomów logów, metadanych czasu i nazwy wątku).`},{question:`Co to jest Fat-JAR (lub Uber-JAR)?`,options:[`Plik JAR przechowujący duże pliki graficzne i bazy danych.`,`Skompilowany plik archiwum .jar, który zawiera wszystkie klasy naszej aplikacji oraz dodatkowo wszystkie biblioteki zależne wewnątrz jednego pliku, co umożliwia uruchomienie aplikacji za pomocą komendy java -jar.`,`Zintegrowane środowisko uruchomieniowe Java.`,`Narzędzie do optymalizacji pamięci heap.`],answer:1,explanation:`Fat-JAR łączy cały kod projektu i zależności w jeden plik wykonywalny, co ułatwia dystrybucję i deployment aplikacji.`}]},ee={id:`12`,title:`Wykład 12: Pamięć Poza-Stertowa (Off-Heap), Mapowanie Pamięci i Klasa Unsafe`,description:`Zarządzanie pamięcią na poziomie zaawansowanym: mapowanie plików (MappedByteBuffer), bezpośrednie operacje na pamięci za pomocą sun.misc.Unsafe oraz nowoczesne API pamięci obcej (Project Panama).`,sections:[{title:`1. Pliki Mapowane w Pamięci (MappedByteBuffer)`,content:`
Domyślne czytanie plików przez tradycyjne I/O wymaga kopiowania danych z bufora jądra systemu operacyjnego (Kernel Space) do bufora przestrzeni użytkownika JVM (User Space). 

Do pracy z ogromnymi plikami o najwyższej wydajności służy **Mapowanie Pamięci (Memory-Mapped Files)** dostępne w NIO.2 poprzez klasę **\`MappedByteBuffer\`**.

Mechanizm ten mapuje fizyczny plik bezpośrednio do wirtualnej pamięci adresowej procesu. Z punktu widzenia aplikacji, plik wygląda jak gigantyczna tablica w pamięci RAM, a system operacyjny zajmuje się automatycznym doczytywaniem stron pliku z dysku (page fault) w tle i synchronizacją zmian.

Przykład użycia:
\`\`\`java
Path path = Path.of("ogromny_plik.dat");

try (FileChannel channel = FileChannel.open(path, StandardOpenOption.READ, StandardOpenOption.WRITE)) {
    // Mapowanie 10 megabajtów pliku do pamięci
    MappedByteBuffer buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, 10 * 1024 * 1024);
    
    // Zapis pod konkretną pozycję (niezwykle szybki)
    buffer.put(100, (byte) 42);
    
    // Odczyt z pozycji
    byte val = buffer.get(100); // 42
    
    // Wymuszenie zapisu zmian na dysk
    buffer.force();
}
\`\`\`

Zalety:
* Błyskawiczny dostęp do losowych fragmentów pliku.
* Dane nie podlegają Garbage Collectorowi (ponieważ leżą w pamięci poza stertą JVM - **Off-Heap**).
* Możliwość współdzielenia pamięci między procesami.
`},{title:`2. Klasa sun.misc.Unsafe`,content:`
Klasa \`sun.misc.Unsafe\` to wewnętrzne, nieoficjalne API maszyny JVM, które daje programiście Java niskopoziomowe możliwości zbliżone do języków C/C++:
* Alokacja i zwalnianie pamięci poza stertą (\`allocateMemory()\`, \`freeMemory()\`).
* Bezpośrednie czytanie/zapisywanie wartości pod adresem pamięci (pointer-like access).
* Pobieranie fizycznych przesunięć pól (offsets) w strukturze klasy.
* Operacje atomowe Compare-And-Swap (CAS) używane do budowania struktur lock-free.

Instancję \`Unsafe\` można pobrać tylko za pomocą refleksji, gdyż bezpośrednie pobranie jest blokowane:
\`\`\`java
Field theUnsafeField = Unsafe.class.getDeclaredField("theUnsafe");
theUnsafeField.setAccessible(true);
Unsafe unsafe = (Unsafe) theUnsafeField.get(null);

// Ręczna alokacja 4 bajtów pamięci off-heap
long memoryAddress = unsafe.allocateMemory(4);

// Zapis wartości int bezpośrednio pod adresem
unsafe.putInt(memoryAddress, 9999);

// Odczyt wartości
int value = unsafe.getInt(memoryAddress); // 9999

// Ręczne zwolnienie pamięci (brak zwolnienia skutkuje leakem pamięci systemowej!)
unsafe.freeMemory(memoryAddress);
\`\`\`

> [!CAUTION]
> Użycie \`Unsafe\` wyłącza wszelkie zabezpieczenia JVM. Błędy takie jak wyjście poza zaalokowaną pamięć (segmentation fault) powodują natychmiastowe zawieszenie całej wirtualnej maszyny (JVM crash), a brak ręcznego zwalniania alokacji prowadzi do wycieków pamięci systemowej.

> [!WARNING]
> **Deprecation**: Od JDK 23 metody dostępu do pamięci w \`sun.misc.Unsafe\` są oznaczone jako terminally deprecated. Od JDK 24 generowane są ostrzeżenia w runtime, a od JDK 26 metody te domyślnie wyrzucają wyjątek (wymagana flaga \`--sun-misc-unsafe-memory-access=allow\`). Oficjalnymi zamiennikami są \`VarHandle\` (od JDK 9, dla pamięci na stercie) oraz FFM API (od JDK 22, dla pamięci poza stertą). Na JDK 17+ wymagana jest również flaga \`--add-opens java.base/sun.misc=ALL-UNNAMED\` aby uzyskać refleksyjny dostęp do pola \`theUnsafe\`.
`},{title:`3. Nowoczesny Standard: Foreign Function & Memory API (Project Panama)`,content:`
W celu zastąpienia niebezpiecznej klasy \`Unsafe\` oraz powolnego interfejsu JNI, w nowszych wersjach Javy (ostatecznie stabilne w Java 22+) w ramach projektu **Panama** wprowadzono **Foreign Function & Memory (FFM) API**.

FFM API umożliwia bezpieczną, wydajną alokację pamięci off-heap oraz wywoływanie funkcji w bibliotekach natywnych (C/C++).

Główne abstrakcje FFM:
* **\`MemorySegment\`**: Reprezentuje ciągły obszar pamięci (on-heap lub off-heap).
* **\`Arena\`**: Kontroluje cykl życia i zwalniania segmentów pamięci (np. blokowe zwalnianie przy zamknięciu areny).

Przykład bezpiecznej alokacji off-heap:
\`\`\`java
// Użycie areny w bloku try-with-resources automatycznie zwalnia całą pamięć off-heap na końcu!
try (Arena arena = Arena.ofConfined()) {
    // Alokacja miejsca na 10 liczb całkowitych int (10 * 4 bajty = 40 bajtów)
    MemorySegment segment = arena.allocate(40);
    
    // Zapisanie wartości
    for (int i = 0; i < 10; i++) {
        segment.setAtIndex(ValueLayout.JAVA_INT, i, i * 10);
    }
    
    // Odczytanie wartości
    int val = segment.getAtIndex(ValueLayout.JAVA_INT, 5); // 50
} // Pamięć off-heap jest bezpiecznie i automatycznie zwalniana w tym miejscu!
\`\`\`
`}],quiz:[{question:`Co dzieje się z danymi zapisanymi w pamięci Off-Heap (poza stertą JVM), np. w MappedByteBuffer?`,options:[`Są automatycznie czyszczone przez Garbage Collector w krótkich odstępach czasu.`,`Nie są widoczne dla Garbage Collectora, co zapobiega pauzom Stop-The-World, ale programista musi dbać o ich poprawne zwalnianie.`,`Są szyfrowane przez system operacyjny.`,`Zostają usunięte natychmiast po wywołaniu dowolnej metody na obiekcie String.`],answer:1,explanation:`Pamięć Off-Heap leży poza stertą zarządzaną przez JVM. Dzięki temu nie obciąża ona Garbage Collectora (brak GC pauses), ale wymaga odpowiedzialnego zarządzania alokacjami.`},{question:`Dlaczego bezpośrednie korzystanie z klasy sun.misc.Unsafe jest odradzane?`,options:[`Unsafe działa bardzo wolno.`,`Wyłącza ono wszystkie zabezpieczenia JVM (np. brak weryfikacji granic pamięci), co przy najmniejszym błędzie może spowodować awarię i zamknięcie całej maszyny JVM (crash).`,`Wycofano ją całkowicie z biblioteki standardowej bez zamiennika w Java 11.`,`Wymaga posiadania licencji Oracle.`],answer:1,explanation:`Klasa Unsafe pozwala na pisanie kodu w stylu C (operacje na wskaźnikach, alokacja malloc/free). Dowolny błąd (np. zapis pod niewłaściwy adres) powoduje awarię procesu (JVM crash) zamiast kontrolowanego wyjątku.`},{question:`Jaki element z FFM API (Project Panama) kontroluje cykl życia i automatyczne zwalnianie obszarów pamięci off-heap?`,options:[`MemorySegment`,`Arena`,`Garbage Collector`,`Unsafe`],answer:1,explanation:`Arena zarządza alokacjami pamięci i implementuje interfejs AutoCloseable. Zamknięcie areny automatycznie zwalnia wszystkie powiązane z nią segmenty pamięci off-heap.`}]},S={id:`13`,title:`Wykład 13: Interoperacyjność Natywna i Blokowanie Wyłączne (Locks)`,description:`Metody wywoływania kodu natywnego (JNI vs Linker API), Java Memory Model (JMM), słowo kluczowe volatile oraz blokowanie wyłączne (synchronized, ReentrantLock).`,sections:[{title:`1. Komunikacja z Kodem Natywnym: JNI & Linker API`,content:`
Czasami zachodzi potrzeba wywołania w Javie istniejących bibliotek napisanych w C/C++ (np. sterowników, bibliotek obliczeniowych). Służą do tego dwa mechanizmy:

### 1. JNI (Java Native Interface) - Klasyczny Standard:
Wymaga zadeklarowania metody ze słowem kluczowym \`native\`, wygenerowania nagłówków C/C++ (\`javac -h\`), napisania kodu pomostowego w C/C++ i skompilowania biblioteki współdzielonej (\`.dll\` lub \`.so\`).
* JNI wiąże się z dużym narzutem wydajnościowym na przełączanie kontekstu JVM-Native.
* Kod pomostowy w C/C++ jest trudny w utrzymaniu.

### 2. Linker API (Project Panama - Java 22+):
Modernizowany mechanizm pozwalający na bezpośrednie ładowanie bibliotek i wywoływanie ich funkcji bezpośrednio z poziomu Javy, bez pisania kodu pomostowego w C/C++.

Przykład wywołania funkcji \`strlen\` z biblioteki standardowej C za pomocą FFM Linkera:
\`\`\`java
// 1. Znajdź Linker i wyszukaj funkcję strlen
Linker linker = Linker.nativeLinker();
SymbolLookup stdlib = linker.defaultLookup();
MemorySegment strlenAddr = stdlib.find("strlen").orElseThrow();

// 2. Zdefiniuj sygnaturę metody (argumenty i zwracany typ)
FunctionDescriptor descriptor = FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS);

// 3. Stwórz uchwyt do metody (MethodHandle)
MethodHandle strlen = linker.downcallHandle(strlenAddr, descriptor);

// 4. Zaalokuj pamięć na napis C i wywołaj metodę
try (Arena arena = Arena.ofConfined()) {
    MemorySegment cString = arena.allocateFrom("Witaj z Java!");
    long length = (long) strlen.invokeExact(cString); // wywołanie natywne!
    System.out.println("Długość napisu: " + length); // 13
}
\`\`\`
`},{title:`2. Model Pamięci Java (JMM) i słowo kluczowe volatile`,content:`
W systemach wieloprocesorowych każdy rdzeń ma własną pamięć podręczną (L1/L2/L3 Cache). Wątki mogą kopiować zmienne z pamięci głównej (RAM) do lokalnych pamięci podręcznych procesora. Prowadzi to do problemu **widoczności (visibility)**: zmiany wprowadzone przez jeden wątek mogą być niewidoczne dla innego.

Dodatkowo, kompilator i procesor mogą zmieniać kolejność wykonywania instrukcji (**instruction reordering**), o ile nie zmienia to wyniku w pojedynczym wątku.

**Java Memory Model (JMM)** definiuje zasady komunikacji między wątkami a pamięcią. Jedną z głównych instrukcji JMM jest słowo kluczowe **\`volatile\`**.

Użycie modyfikatora \`volatile\` przy polu klasy gwarantuje:
1. **Widoczność**: Każdy odczyt zmiennej volatile odbywa się bezpośrednio z pamięci głównej (RAM), a każdy zapis jest natychmiast do niej wypychany.
2. **Barierę pamięci (Memory Barrier)**: Zapobiega przestawianiu instrukcji (reordering) wokół zmiennej volatile.

\`\`\`java
public class SharedFlag {
    // volatile gwarantuje, że wątki natychmiast zobaczą zmianę flagi
    private volatile boolean active = true; 

    public void stop() { active = false; }
    
    public void runLoop() {
        while (active) {
            // wykonuj pracę
        }
    }
}
\`\`\`

> [!WARNING]
> \`volatile\` zapewnia spójność odczytu/zapisu pojedynczych zmiennych, ale **nie zapewnia atomowości** operacji złożonych (np. inkrementacja \`count++\` wymaga odczytu, modyfikacji i zapisu, co przy volatile nadal może prowadzić do race condition). Do operacji atomowych służą klasy z pakietu \`java.util.concurrent.atomic\` (np. \`AtomicInteger\`).
`},{title:`3. Blokowanie Wyłączne (Exclusive Locking)`,content:`
Kiedy wiele wątków modyfikuje ten sam stan (np. pole klasy), zachodzi ryzyko wyścigu (**Race Condition**). Aby temu zapobiec, musimy zapewnić sekcjom krytycznym wzajemne wykluczanie (Mutual Exclusion).

### 1. Słowo kluczowe synchronized:
Najprostsza forma blokowania w Javie. Działa na poziomie monitora obiektu (każdy obiekt w Javie ma niejawny monitor lock).

* **Metoda synchronizowana**: Blokuje monitor obiektu \`this\` (dla metod instancji) lub monitor klasy (dla metod statycznych):
  \`\`\`java
  public synchronized void increment() {
      count++; // cała metoda staje się sekcją krytyczną
  }
  \`\`\`
* **Blok synchronizowany**: Blokuje tylko wybrany obiekt (monitor), co pozwala na zawężenie sekcji krytycznej (lepsza wydajność):
  \`\`\`java
  private final Object lock = new Object();
  
  public void updateData() {
      synchronized (lock) {
          count++; // tylko ten fragment jest zablokowany
      }
  }
  \`\`\`

### 2. Klasa ReentrantLock (java.util.concurrent.locks):
Nowocześniejszy, jawny mechanizm blokowania. Oferuje większe możliwości niż \`synchronized\`:
* Możliwość rezerwowania blokady z limitem czasu (\`tryLock()\`).
* Możliwość przerwania wątku oczekującego (\`lockInterruptibly()\`).
* Możliwość włączenia sprawiedliwego kolejkowania (Fair Lock - wątki dostają blokadę w kolejności zgłoszeń).

Użycie \`ReentrantLock\`:
\`\`\`java
private final ReentrantLock lock = new ReentrantLock();

public void performAction() {
    lock.lock(); // jawne zablokowanie
    try {
        // sekcja krytyczna (modyfikacja stanu)
    } finally {
        lock.unlock(); // bezwzględne zwolnienie w bloku finally!
    }
}
\`\`\`
`}],quiz:[{question:`Co gwarantuje oznaczenie pola klasy słowem kluczowym volatile w Javie?`,options:[`Sprawia, że wszystkie metody w klasie stają się automatycznie synchronizowane.`,`Gwarantuje, że zapisy i odczyty tego pola będą realizowane bezpośrednio z/do pamięci głównej (RAM) i zapobiega reorderingowi instrukcji.`,`Zabezpiecza pole przed dostępem poprzez refleksję.`,`Zezwala na przeciążanie operatorów na tym polu.`],answer:1,explanation:`Oznaczenie volatile zapewnia widoczność zmian między wątkami (dane nie są buforowane w lokalnym cache procesora) oraz wstawia bariery pamięciowe dla kompilatora.`},{question:`Dlaczego operacja inkrementacji 'count++' na polu 'volatile int count' nie jest bezpieczna wątkowo (thread-safe)?`,options:[`Ponieważ volatile działa tylko na obiektach, a nie na typach prostych.`,`Ponieważ operacja count++ składa się z trzech etapów (odczyt, dodanie, zapis), a volatile gwarantuje atomowość jedynie dla pojedynczych odczytów i zapisów.`,`Ponieważ kompilator usuwa tę instrukcję z kodu bajtowego.`,`W rzeczywistości jest bezpieczna wątkowo.`],answer:1,explanation:`Volatile nie zapewnia atomowości. Inkrementacja jest operacją złożoną. Jeśli dwa wątki odczytają tę samą wartość jednocześnie, oba zapiszą tę samą wartość zwiększoną o 1, gubiąc jedną operację.`},{question:`Jaka jest kluczowa różnica między ReentrantLock a synchronized?`,options:[`ReentrantLock działa automatycznie bez bloku try-finally.`,`synchronized jest szybszy w każdej sytuacji.`,`ReentrantLock pozwala na próby blokowania z limitem czasu (tryLock()) oraz sprawiedliwe kolejkowanie wątków, czego synchronized nie potrafi.`,`ReentrantLock można używać tylko w interfejsach.`],answer:2,explanation:`ReentrantLock daje programiście pełną, programistyczną kontrolę nad blokowaniem, m.in. poprzez tryLock(), co pozwala uniknąć zakleszczeń (deadlocks).`}]},C={id:`14`,title:`Wykład 14: Zaawansowana Synchronizacja, Sygnalizacja i Procesory Adnotacji`,description:`Blokowanie współdzielone (ReadWriteLock, StampedLock), mechanizmy sygnalizacji wątków (CountDownLatch, CyclicBarrier, Semaphore), kolekcje współbieżne oraz procesory adnotacji (Annotation Processors) jako alternatywa generatorów kodu.`,sections:[{title:`1. Blokowanie Współdzielone: ReadWriteLock & StampedLock`,content:`
Zwykły \`lock\` (blokowanie wyłączne) drastycznie ogranicza skalowalność aplikacji w scenariuszach, gdzie dane są bardzo często czytane, a rzadko modyfikowane. Wiele wątków może bezpiecznie czytać te same dane jednocześnie, a blokować należy tylko wątki modyfikujące.

### 1. ReentrantReadWriteLock:
Dzieli blokadę na dwie części:
* **Read Lock (blokada odczytu)**: Może być uzyskana przez wiele wątków czytających jednocześnie, pod warunkiem, że żaden wątek nie modyfikuje danych.
* **Write Lock (blokada zapisu)**: Wyłączna blokada dla wątku modyfikującego. Blokuje zarówno innych piszących, jak i wszystkich czytających.

\`\`\`java
private final ReentrantReadWriteLock rwl = new ReentrantReadWriteLock();
private final Lock readLock = rwl.readLock();
private final Lock writeLock = rwl.writeLock();
private int data = 0;

public int readData() {
    readLock.lock();
    try { return data; }
    finally { readLock.unlock(); }
}

public void writeData(int newValue) {
    writeLock.lock();
    try { data = newValue; }
    finally { writeLock.unlock(); }
}
\`\`\`

### 2. StampedLock (Java 8):
Nowocześniejszy mechanizm optymalizacyjny. Oferuje tzw. **odczyt optymistyczny (Optimistic Read)**. Wątek czytający pobiera pieczęć (stamp) i czyta dane bez zakładania blokady. Na koniec weryfikuje pieczęć (\`validate()\`). Jeśli żaden wątek nie zapisał danych w międzyczasie, odczyt kończy się powodzeniem bez jakiegokolwiek narzutu synchronizacyjnego. W przeciwnym wypadku wątek przechodzi w klasyczny odczyt blokujący.

\`\`\`java
StampedLock lock = new StampedLock();

// Optimistic Read
long stamp = lock.tryOptimisticRead();
double currentX = x, currentY = y; // odczyt pól
if (!lock.validate(stamp)) {
    // Wartość mogła się zmienić — fallback do pełnego odczytu
    stamp = lock.readLock();
    try {
        currentX = x;
        currentY = y;
    } finally {
        lock.unlockRead(stamp);
    }
}
\`\`\`
`},{title:`2. Narzędzia Sygnalizacji Wątków`,content:'\nKlasy z pakietu `java.util.concurrent` dostarczają wyspecjalizowane synchronizatory ułatwiające koordynację pracy wątków:\n\n* **`Semaphore`**: Kontroluje dostęp do ograniczonej liczby zasobów za pomocą liczników zezwoleń (`acquire()` pobiera zezwolenie, `release()` je zwraca).\n* **`CountDownLatch`**: Pozwala jednemu lub wielu wątkom na oczekiwanie (`await()`), aż grupa operacji wykonywanych w innych wątkach zostanie zakończona. Licznik jest zmniejszany za pomocą `countDown()` i jest **jednorazowy** (nie można go zresetować).\n* **`CyclicBarrier`**: Pozwala grupie wątków na wzajemne czekanie na siebie w punkcie synchronizacji (barierze) za pomocą `await()`. Po osiągnięciu limitu bariera jest zwalniana i może być użyta ponownie (jest **cykliczna**).\n* **`Phaser`**: Bardziej elastyczny synchronizator uogólniający zarówno `CountDownLatch`, jak i `CyclicBarrier`. Umożliwia dynamiczną rejestrację/wyrejestrowanie uczestników oraz obsługę wielu faz synchronizacji.\n\nPrzykład CountDownLatch:\n```java\nCountDownLatch latch = new CountDownLatch(3); // Czekamy na 3 usługi pomocnicze\n\n// Wątki pomocnicze wywołują latch.countDown() po zainicjalizowaniu\nexecutor.submit(() -> {\n    // inicjalizacja...\n    latch.countDown();\n});\n\n// Wątek główny czeka na ukończenie wszystkich trzech inicjalizacji\nlatch.await(); \nSystem.out.println("Wszystkie usługi wystartowały. Uruchamianie aplikacji głównej...");\n```\n'},{title:`3. Kolekcje Współbieżne (Concurrent Collections)`,content:"\nStandardowe kolekcje z JCF (np. `ArrayList`, `HashMap`) nie są bezpieczne wątkowo. Używanie dla nich wrapperów typu `Collections.synchronizedMap()` synchronizuje całą mapę na jednym monitorze lock, co drastycznie spowalnia aplikację w środowisku wielowątkowym.\n\nPakiet `java.util.concurrent` zawiera wysoce zoptymalizowane kolekcje współbieżne:\n\n* **`ConcurrentHashMap`**: Zamiast blokowania całej mapy, używa blokowania na poziomie pojedynczych kubełków (`synchronized` na węźle głównym kubełka) oraz operacji atomowych CAS (Compare-And-Swap) dla pustych kubełków. Ta architektura (od Javy 8) zapewnia wysoką współbieżność bez globalnych blokad. Umożliwia jednoczesny odczyt wielu wątkom bez blokowania.\n* **`CopyOnWriteArrayList`**: Każda modyfikacja (dodanie/usunięcie) tworzy nową kopię całej wewnętrznej tablicy pod spodem. Odczyt jest niezwykle szybki i nieblokujący, ale zapis jest bardzo kosztowny. Idealna do list typu *listenerzy/subskrybenci* (bardzo dużo odczytów, sporadyczne zapisy).\n* **`BlockingQueue`** (`LinkedBlockingQueue`, `ArrayBlockingQueue`): Kolejki blokujące wątki przy próbie pobrania z pustej kolejki (`take()`) lub zapisu do pełnej kolejki (`put()`). Kluczowy element wzorca **Producent-Konsument**.\n"},{title:`4. Procesory Adnotacji (Annotation Processors)`,content:"\nW przeciwieństwie do generatorów źródłowych (Source Generators) w C#, Java od wersji 6 posiada mechanizm **Annotation Processing Tool (APT)**, zintegrowany bezpośrednio z kompilatorem `javac`.\n\nProcesory adnotacji skanują kod źródłowy w poszukiwaniu adnotacji w czasie kompilacji i mogą generować dodatkowe pliki źródłowe Java (`.java`), pliki zasobów lub klasy. Zapewnia to zerowy narzut wydajnościowy w runtime (brak refleksji).\n\nNajważniejsze zastosowania APT w ekosystemie Java:\n1. **Lombok**: Modyfikuje bezpośrednio drzewo AST kodu w pamięci kompilatora, wstrzykując metody takie jak gettery, settery, konstruktory, `builder()` i `toString()` na podstawie adnotacji:\n   ```java\n   @Getter @Setter @Builder\n   public class User {\n       private String name;\n       private int age;\n   } // Metody getName(), setName(), build() itp. są generowane przy kompilacji\n   ```\n2. **MapStruct**: Generuje w czasie kompilacji kod klas mapujących (mappery typu DTO-Entity), który wykonuje zwykłe, szybkie przypisania pól `get/set`, zastępując refleksję.\n"}],quiz:[{question:`Kiedy najlepiej zastosować ReentrantReadWriteLock zamiast zwykłego ReentrantLock?`,options:[`W aplikacjach jednowątkowych.`,`W scenariuszach, w których operacje odczytu danych są wykonywane znacznie częściej niż operacje zapisu/modyfikacji.`,`Gdy zależy nam na szyfrowaniu zapisywanych obiektów.`,`Tylko podczas pracy z bazami danych SQL.`],answer:1,explanation:`ReadWriteLock pozwala wielu wątkom na jednoczesny odczyt (współdzielenie), a blokuje tylko przy zapisie. Sprawdza się to doskonale przy dużej przewadze odczytów.`},{question:`Czym różni się CountDownLatch od CyclicBarrier?`,options:[`CountDownLatch jest przeznaczony do pracy na stercie, a CyclicBarrier na stosie.`,`CountDownLatch służy do zliczania wyjątków, a CyclicBarrier do ich generowania.`,`CountDownLatch jest synchronizatorem jednorazowym (jego licznik po spadku do zera nie może być zresetowany), podczas gdy CyclicBarrier może być używany wielokrotnie po zresetowaniu.`,`CyclicBarrier nie może współpracować z pulami wątków.`],answer:2,explanation:`CountDownLatch po otwarciu bramy pozostaje otwarty na stałe (latch). CyclicBarrier pozwala grupie wątków na wielokrotne cykliczne czekanie na siebie w rundach.`},{question:`W jaki sposób Annotation Processors (np. Lombok, MapStruct) wpływają na wydajność aplikacji w runtime?`,options:[`Spowalniają aplikację, ponieważ stale analizują kod przez refleksję.`,`Mają zerowy wpływ na wydajność w runtime, ponieważ generują lub modyfikują kod w czasie kompilacji (aplikacja uruchamia się z gotowym kodem Java).`,`Wymagają instalacji agenta JVM.`,`Zwiększają zużycie pamięci heap o 50%.`],answer:1,explanation:`Annotation Processors działają wyłącznie na etapie kompilacji (build-time). Wygenerowany kod staje się częścią kodu bajtowego pliku class, przez co uruchomienie programu nie ponosi żadnego kosztu refleksji.`}]},te={id:`15`,title:`Wykład 15: Architektura JVM, Odśmiecanie Pamięci (GC) & GraalVM AOT`,description:`Zaawansowany przegląd wnętrza Wirtualnej Maszyny Javy: organizacja pamięci heap/non-heap, typy i tuning Garbage Collectorów, Ahead-of-Time compilation (GraalVM Native Image) oraz detale techniczne Virtual Threads.`,sections:[{title:`1. Struktura Pamięci JVM (Memory Layout)`,content:`
Pamięć alokowana przez maszynę JVM dzieli się na dwa główne obszary: **Heap (Sterta)** oraz **Non-Heap (Obszary poza stertą)**.

### 1. Pamięć Heap (Sterta):
Przechowuje wszystkie obiekty i tablice stworzone przez aplikację. Podlega automatycznemu odśmiecaniu przez Garbage Collector. Od czasów Javy 8 sterta dzieli się tradycyjnie na generacje (Generational Heap):
* **Young Generation (Młoda Generacja)**: Tu trafiają nowo utworzone obiekty. Składa się z:
  * **Eden Space**: Miejsce pierwszej alokacji.
  * **Survivor Spaces (S0 / S1)**: Obszary przejściowe, w których obiekty są kopiowane i "starzeją się" (aging) podczas szybkich cykli odśmiecania (Minor GC).
* **Old Generation (Tenured Generation)**: Przechowuje długożyjące obiekty przeniesione z generacji młodej po przeżyciu określonej liczby cykli odśmiecania. Odśmiecana rzadziej (Major / Full GC).

### 2. Pamięć Non-Heap:
Obszary pamięci nieregulowane przez standardowy stertowy GC:
* **Metaspace (od Java 8)**: Przechowuje metadane klas, metody i tabele symboli (zastąpił stary obszar *PermGen*, alokowany bezpośrednio z pamięci natywnej RAM).
* **Thread Stacks (Stosy Wątków)**: Każdy wątek fizyczny otrzymuje własny stos przeznaczony na ramki metod i zmienne lokalne (typy proste i referencje).
* **Code Cache**: Miejsce, w którym kompilator JIT przechowuje skompilowany kod natywny maszynowy.
`},{title:`2. Przegląd i Tuning Garbage Collectorów`,content:"\nWybór odpowiedniego odśmiecania (Garbage Collector - GC) zależy od wymagań aplikacji co do przepustowości (throughput) oraz czasu opóźnień (latency):\n\n* **Serial GC (`-XX:+UseSerialGC` )**: Używa jednego wątku do odśmiecania. Zatrzymuje całą aplikację (Stop-The-World). Dobry do bardzo małych mikroserwisów o minimalnym zużyciu pamięci RAM.\n* **Parallel GC (`-XX:+UseParallelGC` )**: Używa wielu wątków w celu zmaksymalizowania przepustowości procesora. Powoduje pauzy Stop-The-World, ale jest idealny do zadań wsadowych (batch processing).\n* **G1 GC (`-XX:+UseG1GC` )**: Domyślny odśmiecacz od Javy 9. Dzieli stertę na małe regiony i odśmieca te o największej liczbie śmieci w pierwszej kolejności. Dąży do zachowania określonego, niskiego czasu pauz (np. max 200ms).\n* **ZGC (`-XX:+UseZGC` )**: Nowoczesny odśmiecacz o ultra niskich opóźnieniach (Zero-Pause / Sub-millisecond latency). Wykonuje niemal całą pracę współbieżnie z działaniem aplikacji, nawet na stertach o rozmiarach wielu terabajtów. Od Javy 21 wspiera podział na generacje (z flagą `-XX:+ZGenerational`; od Javy 23 tryb generacyjny jest domyślny).\n* **Shenandoah GC (`-XX:+UseShenandoahGC` )**: Alternatywa o podobnych celach, rozwijana przez Red Hat i dostępna w OpenJDK od Javy 12, również oferująca niskie pauzy niezależnie od rozmiaru sterty.\n\n### Podstawowe parametry tuningu:\n* `-Xms<rozmiar>`: Początkowa wielkość sterty (np. `-Xms2g`).\n* `-Xmx<rozmiar>`: Maksymalna wielkość sterty (np. `-Xmx4g`).\n* `-XX:MaxGCPauseMillis=<ms>`: Wskazówka dla G1 GC dotycząca maksymalnego dopuszczalnego czasu pauzy.\n"},{title:`3. GraalVM i Kompilacja AOT (Ahead-of-Time)`,content:`
Tradycyjnie kod Javy uruchamia się w trybie JIT (Just-In-Time) - proces kompilacji do kodu maszynowego następuje przy każdym uruchomieniu aplikacji po jej "rozgrzaniu". Powoduje to powolny start aplikacji (cold start) i wysokie początkowe zużycie pamięci.

**GraalVM** to alternatywne środowisko uruchomieniowe JDK, które oferuje kompilator **Ahead-of-Time (AOT)**. Umożliwia on skompilowanie aplikacji Java bezpośrednio do samodzielnego pliku wykonywalnego (**Native Image**) dla danego systemu operacyjnego (np. plik \`.exe\` na Windowsie lub binarka Linuxa).

Porównanie JIT vs AOT (GraalVM):

| Cecha | JIT (Standard JVM) | AOT (GraalVM Native Image) |
| :--- | :--- | :--- |
| **Czas startu** | Sekundy (rozgrzewanie kompilatora) | Milisekundy (natychmiastowy start) |
| **Zużycie RAM** | Wysokie (metadane JVM, JIT, kompilator) | Niskie (brak JIT kompilatora i standardowego classloadera — aplikacja zawiera lekki runtime SubstrateVM z własnym GC) |
| **Rozmiar dystrybucyjny** | Wymaga instalacji JDK/JRE | Samodzielny, mały plik binarny |
| **Maksymalna wydajność** | Bardzo wysoka (dzięki optymalizacjom profilowanym w runtime) | Nieco niższa w długim horyzoncie czasowym |
| **Ograniczenia** | Brak | Ograniczenia refleksji (wymaga deklaracji w plikach JSON), dynamicznego ładowania klas |

GraalVM Native Image jest kluczowym elementem nowoczesnych frameworków chmurowych (np. Quarkus, Spring Boot 3 Native, Micronaut) uruchamianych w architekturze Serverless / Kubernetes, gdzie liczy się błyskawiczny start i minimalne zużycie RAM.
`},{title:`4. Wirtualne Wątki: Szczegóły Implementacji i Blokowanie (Pinning)`,content:`
Choć wirtualne wątki (Virtual Threads) drastycznie upraszczają współbieżność I/O, programista musi rozumieć ich fizyczną implementację w celu uniknięcia pułapek wydajnościowych:

### Scheduler i Carrier Threads:
Wirtualne wątki są mapowane na wątki platformowe (Carrier Threads) przez wewnętrzny scheduler JVM oparty na **\`ForkJoinPool\`**. Kiedy wątek wirtualny wykonuje operację blokującą na poziomie standardowej biblioteki Java (np. \`Socket.read()\`, \`Lock.lock()\`), JVM automatycznie zdejmuje go (yield/unmount) ze stosu wątku Carrier i zapisuje jego ramki stosu na stercie (Heap).

### Problem Przyszpilenia (Thread Pinning):
Zdarzają się sytuacje, w których wirtualny wątek **nie może** zostać odmontowany od wątku nośnego (Carrier Thread). Zjawisko to nazywa się **Thread Pinning (przyszpilenie)**. Kiedy wątek wirtualny jest przyszpilony, jego blokada blokuje fizyczny wątek platformy, niwecząc korzyści wydajnościowe.

Przyszpilenie występuje w dwóch przypadkach:
1. Gdy wątek wirtualny wykonuje kod wewnątrz bloku lub metody **\`synchronized\`**:
   \`\`\`java
   // ANTYWZORZEC dla Wątków Wirtualnych:
   public synchronized void doSomething() {
       // Operacja blokująca I/O przyszpili wątek wirtualny do wątku Carrier!
       Thread.sleep(1000); 
   }
   // ROZWIĄZANIE: Zamiana synchronized na ReentrantLock!
   \`\`\`
2. Gdy wątek wirtualny wywołuje funkcję natywną poprzez **JNI** lub **FFM API**.

> [!IMPORTANT]
> W aplikacjach przeznaczonych do uruchamiania na wątkach wirtualnych (Java 21+), należy bezwzględnie zastąpić synchronizację blokami \`synchronized\` na rzecz klas \`ReentrantLock\`, które nie powodują przyszpilania wątków wirtualnych.
`}],quiz:[{question:`Gdzie w strukturze pamięci JVM (od Java 8) przechowywane są metadane klas?`,options:[`Eden Space`,`Survivor Space`,`Metaspace (część pamięci Non-Heap alokowana z pamięci fizycznej RAM)`,`Old Generation`],answer:2,explanation:`W Javie 8 usunięto obszar PermGen ze sterty i zastąpiono go obszarem Metaspace, który jest alokowany z natywnej pamięci RAM i rośnie dynamicznie.`},{question:`Który Garbage Collector oferuje ultra niskie opóźnienia (poniżej milisekundy), działając współbieżnie z wątkami aplikacji?`,options:[`Serial GC`,`Parallel GC`,`ZGC (Z Garbage Collector)`,`G1 GC`],answer:2,explanation:`ZGC to nowoczesny odśmiecacz o niskich opóźnieniach. Został zaprojektowany w celu minimalizacji pauz Stop-The-World do wartości poniżej 1ms, bez względu na rozmiar sterty.`},{question:`Na czym polega zjawisko przyszpilenia (Thread Pinning) wątku wirtualnego w Javie 21?`,options:[`Na zablokowaniu Garbage Collectora przez wątek wirtualny.`,`Na trwałym przypisaniu wątku wirtualnego do pamięci Metaspace.`,`Sytuacja, w której wirtualny wątek wykonuje kod wewnątrz bloku synchronized (lub kodu natywnego) i blokada I/O powoduje fizyczne zablokowanie wątku nośnego (Carrier Thread), co uniemożliwia schedulerowi przełączenie kontekstu.`,`Na automatycznym zamknięciu wątku przez system operacyjny.`],answer:3,explanation:`Przyszpilenie uniemożliwia JVM odmontowanie wątku wirtualnego. Występuje głównie w blokach 'synchronized' wykonujących I/O. Rozwiązaniem jest migracja na ReentrantLock.`}]},ne={id:`16`,title:`Wykład 16: Zasady SOLID i Wzorce Projektowe (Design Patterns)`,description:`Kompletny przewodnik po pięciu zasadach SOLID, najważniejszych wzorcach projektowych GoF (kreacyjnych, strukturalnych i behawioralnych) oraz koncepcji Dependency Injection — fundamencie frameworków takich jak Spring.`,sections:[{title:`1. Wprowadzenie: Po co nam zasady i wzorce?`,content:`
Pisanie kodu, który *działa*, to dopiero początek. Prawdziwym wyzwaniem jest pisanie kodu, który jest **łatwy do zrozumienia**, **prosty do rozszerzenia** i **odporny na zmiany**. Zasady SOLID i wzorce projektowe to sprawdzone w praktyce receptury, które pomagają osiągnąć te cele.

### Czym są zasady SOLID?
SOLID to akronim opisujący pięć fundamentalnych zasad projektowania obiektowego, sformułowanych przez Roberta C. Martina (Uncle Bob). Ich celem jest tworzenie kodu, który:
* Jest odporny na zmiany wymagań biznesowych.
* Minimalizuje efekt "domina" — zmiana w jednym miejscu nie powoduje kaskady błędów w innych.
* Jest łatwy do testowania jednostkowego.

### Czym są wzorce projektowe?
Wzorce projektowe (Design Patterns) to **powtarzalne, sprawdzone rozwiązania typowych problemów projektowych**. Nie są gotowym kodem do skopiowania, lecz schematami, które programista adaptuje do swojej konkretnej sytuacji. Zostały skatalogowane w 1994 roku przez tzw. "Gang of Four" (GoF) w książce *"Design Patterns: Elements of Reusable Object-Oriented Software"*.

Dzielą się na trzy kategorie:
1. **Kreacyjne** (Creational) — dotyczą sposobu tworzenia obiektów.
2. **Strukturalne** (Structural) — dotyczą kompozycji klas i obiektów.
3. **Behawioralne** (Behavioral) — dotyczą komunikacji między obiektami.
`},{title:`2. Zasada S — Single Responsibility Principle (SRP)`,content:`
> **Klasa powinna mieć tylko jeden powód do zmiany.**

Oznacza to, że każda klasa powinna być odpowiedzialna za **jedną, dobrze zdefiniowaną rzecz**. Jeśli klasa zarządza użytkownikami, generuje raporty i wysyła emaile — ma trzy powody do zmiany i łamie SRP.

### ❌ Złamanie SRP:
\`\`\`java
public class UserService {
    public void registerUser(String name, String email) {
        // 1. Walidacja danych
        if (name.isBlank()) throw new IllegalArgumentException("Puste imię");
        // 2. Zapis do bazy danych
        database.save(new User(name, email));
        // 3. Wysłanie emaila powitalnego
        emailClient.send(email, "Witamy!", "Cześć " + name);
        // 4. Logowanie zdarzenia
        logger.info("Zarejestrowano: " + email);
    }
}
\`\`\`
Ta klasa ma **cztery powody do zmiany**: zmiana walidacji, zmiana bazy danych, zmiana systemu email, zmiana logowania.

### ✅ Zgodne z SRP:
\`\`\`java
public class UserValidator {
    public void validate(String name, String email) { /* ... */ }
}

public class UserRepository {
    public void save(User user) { /* ... */ }
}

public class WelcomeEmailSender {
    public void send(String email, String name) { /* ... */ }
}

public class UserRegistrationService {
    private final UserValidator validator;
    private final UserRepository repository;
    private final WelcomeEmailSender emailSender;

    public UserRegistrationService(UserValidator validator,
                                    UserRepository repository,
                                    WelcomeEmailSender emailSender) {
        this.validator = validator;
        this.repository = repository;
        this.emailSender = emailSender;
    }

    public void registerUser(String name, String email) {
        validator.validate(name, email);
        repository.save(new User(name, email));
        emailSender.send(email, name);
    }
}
\`\`\`
Teraz każda klasa ma **dokładnie jeden powód do zmiany**. \`UserRegistrationService\` jedynie koordynuje przepływ, delegując szczegóły do specjalistów.
`},{title:`3. Zasada O — Open/Closed Principle (OCP)`,content:`
> **Klasy powinny być otwarte na rozszerzanie, ale zamknięte na modyfikację.**

Oznacza to, że powinno być możliwe dodanie nowej funkcjonalności **bez zmieniania istniejącego, przetestowanego kodu**. Osiąga się to przez abstrakcję (interfejsy) i polimorfizm.

### ❌ Złamanie OCP:
\`\`\`java
public class DiscountCalculator {
    public double calculate(String customerType, double price) {
        return switch (customerType) {
            case "REGULAR" -> price * 0.95;
            case "VIP" -> price * 0.80;
            case "EMPLOYEE" -> price * 0.70;
            // Dodanie nowego typu = modyfikacja tego kodu!
            default -> price;
        };
    }
}
\`\`\`
Każdy nowy typ klienta wymaga modyfikacji istniejącej klasy.

### ✅ Zgodne z OCP:
\`\`\`java
public interface DiscountStrategy {
    double apply(double price);
}

public class RegularDiscount implements DiscountStrategy {
    @Override
    public double apply(double price) { return price * 0.95; }
}

public class VipDiscount implements DiscountStrategy {
    @Override
    public double apply(double price) { return price * 0.80; }
}

// Dodanie nowego typu = nowa klasa, BEZ modyfikacji istniejących!
public class StudentDiscount implements DiscountStrategy {
    @Override
    public double apply(double price) { return price * 0.90; }
}

public class DiscountCalculator {
    public double calculate(DiscountStrategy strategy, double price) {
        return strategy.apply(price);
    }
}
\`\`\`
Teraz dodanie nowego rabatu wymaga jedynie utworzenia nowej klasy implementującej \`DiscountStrategy\`.
`},{title:`4. Zasada L — Liskov Substitution Principle (LSP)`,content:`
> **Obiekty klasy bazowej powinny być zastępowalne obiektami klas pochodnych bez zmiany poprawności programu.**

Innymi słowy: jeśli metoda przyjmuje parametr typu \`Animal\`, to powinno działać poprawnie niezależnie od tego, czy przekażemy \`Dog\`, \`Cat\` czy \`Parrot\`.

### ❌ Klasyczny przykład złamania LSP — Kwadrat i Prostokąt:
\`\`\`java
public class Rectangle {
    protected int width, height;
    public void setWidth(int w) { this.width = w; }
    public void setHeight(int h) { this.height = h; }
    public int getArea() { return width * height; }
}

public class Square extends Rectangle {
    @Override
    public void setWidth(int w) { this.width = w; this.height = w; }
    @Override
    public void setHeight(int h) { this.width = h; this.height = h; }
}
\`\`\`
\`\`\`java
void resize(Rectangle r) {
    r.setWidth(5);
    r.setHeight(10);
    assert r.getArea() == 50; // ❌ FAILS dla Square! (area = 100)
}
\`\`\`
\`Square\` zmienia zachowanie \`setWidth\`/\`setHeight\` w sposób nieoczekiwany dla kodu, który operuje na \`Rectangle\`.

### ✅ Poprawne podejście:
Zamiast dziedziczenia, użyj osobnych klas lub wspólnego interfejsu \`Shape\`:
\`\`\`java
public interface Shape {
    int getArea();
}

public record Rectangle(int width, int height) implements Shape {
    public int getArea() { return width * height; }
}

public record Square(int side) implements Shape {
    public int getArea() { return side * side; }
}
\`\`\`
Teraz \`Rectangle\` i \`Square\` to równorzędne implementacje \`Shape\`, a nie relacja dziedziczenia.
`},{title:`5. Zasada I — Interface Segregation Principle (ISP)`,content:`
> **Klienty nie powinny być zmuszane do zależności od metod, których nie używają.**

Lepiej mieć wiele małych, wyspecjalizowanych interfejsów niż jeden duży, "gruby" interfejs.

### ❌ Złamanie ISP — "Gruby" interfejs:
\`\`\`java
public interface MultiFunctionPrinter {
    void print(Document doc);
    void scan(Document doc);
    void fax(Document doc);
    void staple(Document doc);
}
\`\`\`
Prosta drukarka musi implementować \`scan()\`, \`fax()\`, \`staple()\`, choć ich nie obsługuje:
\`\`\`java
public class BasicPrinter implements MultiFunctionPrinter {
    public void print(Document doc) { /* OK */ }
    public void scan(Document doc) { throw new UnsupportedOperationException(); }
    public void fax(Document doc) { throw new UnsupportedOperationException(); }
    public void staple(Document doc) { throw new UnsupportedOperationException(); }
}
\`\`\`

### ✅ Zgodne z ISP:
\`\`\`java
public interface Printable    { void print(Document doc); }
public interface Scannable    { void scan(Document doc); }
public interface Faxable      { void fax(Document doc); }

public class BasicPrinter implements Printable {
    public void print(Document doc) { /* OK */ }
}

public class OfficePrinter implements Printable, Scannable, Faxable {
    public void print(Document doc) { /* ... */ }
    public void scan(Document doc) { /* ... */ }
    public void fax(Document doc) { /* ... */ }
}
\`\`\`
Teraz każda klasa implementuje tylko te interfejsy, które faktycznie obsługuje.
`},{title:`6. Zasada D — Dependency Inversion Principle (DIP)`,content:`
> **Moduły wysokiego poziomu nie powinny zależeć od modułów niskiego poziomu. Oba powinny zależeć od abstrakcji.**

To najważniejsza zasada przed nauką Springa, ponieważ jest ona fundamentem **Dependency Injection (DI)**.

### ❌ Złamanie DIP — bezpośrednia zależność:
\`\`\`java
public class OrderService {
    private final MySqlOrderRepository repository = new MySqlOrderRepository();

    public void placeOrder(Order order) {
        repository.save(order);
    }
}
\`\`\`
\`OrderService\` jest na stałe "przybity" do \`MySqlOrderRepository\`. Aby zmienić bazę danych na PostgreSQL, trzeba modyfikować \`OrderService\`.

### ✅ Zgodne z DIP — zależność od abstrakcji:
\`\`\`java
public interface OrderRepository {
    void save(Order order);
}

public class MySqlOrderRepository implements OrderRepository {
    @Override
    public void save(Order order) { /* Zapis do MySQL */ }
}

public class PostgresOrderRepository implements OrderRepository {
    @Override
    public void save(Order order) { /* Zapis do PostgreSQL */ }
}

public class OrderService {
    private final OrderRepository repository; // Zależy od INTERFEJSU

    // Dependency Injection przez konstruktor!
    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    public void placeOrder(Order order) {
        repository.save(order);
    }
}
\`\`\`
\`\`\`java
// Wybór implementacji dokonywany jest NA ZEWNĄTRZ klasy:
OrderService service = new OrderService(new PostgresOrderRepository());
\`\`\`

### Dependency Injection (DI) — klucz do Springa
**DI to technika realizacji DIP**, w której obiekt **nie tworzy swoich zależności sam** (przez \`new\`), ale **otrzymuje je z zewnątrz** — przez konstruktor, setter lub pole.

Trzy formy DI:
\`\`\`java
// 1. Przez konstruktor (REKOMENDOWANE)
public OrderService(OrderRepository repo) { this.repository = repo; }

// 2. Przez setter
public void setRepository(OrderRepository repo) { this.repository = repo; }

// 3. Przez pole (w Springu: @Autowired)
@Autowired
private OrderRepository repository;
\`\`\`

W Springu rolę "dostawcy zależności" pełni **kontener IoC (Inversion of Control)**. Programista jedynie deklaruje, czego potrzebuje (\`@Autowired\`), a Spring sam tworzy obiekty i "wstrzykuje" je w odpowiednie miejsca.
`},{title:`7. Wzorce Kreacyjne: Singleton`,content:`
> **Singleton gwarantuje, że klasa ma dokładnie jedną instancję i zapewnia globalny punkt dostępu do niej.**

Jest to najczęściej spotykany (i najczęściej nadużywany) wzorzec. W Springu **domyślnie każdy bean jest Singletonem**.

### Implementacja (thread-safe — enum):
Najprostsza i najlepsza implementacja Singletona w Javie to użycie enuma:
\`\`\`java
public enum AppConfig {
    INSTANCE;

    private String databaseUrl = "jdbc:mysql://localhost:3306/mydb";

    public String getDatabaseUrl() { return databaseUrl; }
}

// Użycie:
String url = AppConfig.INSTANCE.getDatabaseUrl();
\`\`\`
JVM gwarantuje, że enum zostanie zainicjowany dokładnie raz, jest thread-safe i odporny na serializację.

### Implementacja klasyczna (lazy, thread-safe):
\`\`\`java
public class AppConfig {
    private static volatile AppConfig instance;

    private AppConfig() {} // Prywatny konstruktor!

    public static AppConfig getInstance() {
        if (instance == null) {
            synchronized (AppConfig.class) {
                if (instance == null) {
                    instance = new AppConfig();
                }
            }
        }
        return instance;
    }
}
\`\`\`

> [!WARNING]
> Singleton utrudnia testowanie jednostkowe (globalna, współdzielona instancja). Dlatego we frameworkach takich jak Spring preferuje się DI zamiast ręcznego wywoływania \`getInstance()\` — kontener zarządza cyklem życia obiektów.
`},{title:`8. Wzorce Kreacyjne: Factory Method i Builder`,content:`
### Factory Method
> **Definiuje interfejs tworzenia obiektu, ale pozwala podklasom zdecydować, która klasa zostanie utworzona.**

\`\`\`java
public interface Notification {
    void send(String message);
}

public class EmailNotification implements Notification {
    public void send(String message) { System.out.println("Email: " + message); }
}

public class SmsNotification implements Notification {
    public void send(String message) { System.out.println("SMS: " + message); }
}

public class PushNotification implements Notification {
    public void send(String message) { System.out.println("Push: " + message); }
}

// FACTORY — logika tworzenia w jednym miejscu
public class NotificationFactory {
    public static Notification create(String channel) {
        return switch (channel.toLowerCase()) {
            case "email" -> new EmailNotification();
            case "sms"   -> new SmsNotification();
            case "push"  -> new PushNotification();
            default -> throw new IllegalArgumentException(
                           "Nieznany kanał: " + channel);
        };
    }
}

// Użycie:
Notification n = NotificationFactory.create("email");
n.send("Witamy!");
\`\`\`
Kod kliencki nie zna konkretnych klas — operuje na interfejsie \`Notification\`.

---

### Builder
> **Pozwala konstruować złożone obiekty krok po kroku, oddzielając proces konstrukcji od reprezentacji.**

Builder jest idealny, gdy konstruktor miałby zbyt wiele parametrów:
\`\`\`java
public class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final String body;
    private final int timeout;

    private HttpRequest(Builder builder) {
        this.url = builder.url;
        this.method = builder.method;
        this.headers = builder.headers;
        this.body = builder.body;
        this.timeout = builder.timeout;
    }

    public static class Builder {
        private final String url;       // Wymagane
        private String method = "GET";  // Domyślne
        private Map<String, String> headers = new HashMap<>();
        private String body = "";
        private int timeout = 30_000;

        public Builder(String url) { this.url = url; }

        public Builder method(String method) {
            this.method = method; return this;
        }
        public Builder header(String key, String value) {
            this.headers.put(key, value); return this;
        }
        public Builder body(String body) {
            this.body = body; return this;
        }
        public Builder timeout(int ms) {
            this.timeout = ms; return this;
        }
        public HttpRequest build() { return new HttpRequest(this); }
    }
}

// Użycie — czytelna, płynna składnia:
HttpRequest request = new HttpRequest.Builder("https://api.example.com/users")
    .method("POST")
    .header("Content-Type", "application/json")
    .body("{\\"name\\": \\"Jan\\"}")
    .timeout(5000)
    .build();
\`\`\`

> [!TIP]
> Biblioteka **Lombok** (z Wykładu 14) potrafi wygenerować Builder automatycznie za pomocą adnotacji \`@Builder\` nad klasą.
`},{title:`9. Wzorce Strukturalne: Adapter i Decorator`,content:`
### Adapter
> **Przekształca interfejs jednej klasy na interfejs oczekiwany przez klienta. Pozwala współpracować klasom, które normalnie nie mogłyby ze sobą działać.**

Wyobraź sobie, że masz stary system logowania, który używa interfejsu \`OldLogger\`, ale twój nowy kod wymaga \`NewLogger\`:
\`\`\`java
// Stary interfejs (np. z zewnętrznej biblioteki)
public interface OldLogger {
    void writeLog(String text);
}

// Nowy interfejs (wymagany przez Twój kod)
public interface NewLogger {
    void log(Level level, String message);
}

// ADAPTER — most między starym a nowym
public class LoggerAdapter implements NewLogger {
    private final OldLogger oldLogger;

    public LoggerAdapter(OldLogger oldLogger) {
        this.oldLogger = oldLogger;
    }

    @Override
    public void log(Level level, String message) {
        oldLogger.writeLog("[" + level + "] " + message);
    }
}
\`\`\`
Adapter jest powszechnie używany w Javie — np. \`Arrays.asList()\` adaptuje tablicę na interfejs \`List\`.

---

### Decorator
> **Dynamicznie dodaje nowe zachowanie do obiektu, opakowując go w inny obiekt o tym samym interfejsie.**

\`\`\`java
public interface DataSource {
    void writeData(String data);
    String readData();
}

public class FileDataSource implements DataSource {
    private final String filename;
    public FileDataSource(String filename) { this.filename = filename; }
    public void writeData(String data) { /* Zapis do pliku */ }
    public String readData() { /* Odczyt z pliku */ return "dane"; }
}

// DECORATOR — dodaje szyfrowanie
public class EncryptionDecorator implements DataSource {
    private final DataSource wrapped;

    public EncryptionDecorator(DataSource source) {
        this.wrapped = source;
    }

    @Override
    public void writeData(String data) {
        wrapped.writeData(encrypt(data)); // Dodatkowe zachowanie
    }

    @Override
    public String readData() {
        return decrypt(wrapped.readData()); // Dodatkowe zachowanie
    }

    private String encrypt(String data) { return Base64.getEncoder().encodeToString(data.getBytes()); }
    private String decrypt(String data) { return new String(Base64.getDecoder().decode(data)); }
}
\`\`\`
\`\`\`java
// Dekoratory można "zagnieżdżać" (nakładać warstwami):
DataSource source = new EncryptionDecorator(
                        new CompressionDecorator(
                            new FileDataSource("secret.txt")));
source.writeData("Bardzo ważne dane");
\`\`\`

W Javie Decorator jest wszechobecny w strumieniach I/O:
\`BufferedReader(new InputStreamReader(new FileInputStream("plik.txt")))\`
`},{title:`10. Wzorce Strukturalne: Proxy`,content:`
> **Proxy dostarcza obiekt zastępczy, kontrolujący dostęp do innego obiektu.**

Proxy wygląda identycznie jak oryginalny obiekt (implementuje ten sam interfejs), ale dodaje dodatkową logikę "przed" lub "po" wywołaniu metody.

\`\`\`java
public interface ImageLoader {
    void display();
}

public class RealImage implements ImageLoader {
    private final String filename;

    public RealImage(String filename) {
        this.filename = filename;
        loadFromDisk(); // Kosztowna operacja!
    }

    private void loadFromDisk() {
        System.out.println("Ładowanie obrazu: " + filename);
    }

    public void display() {
        System.out.println("Wyświetlanie: " + filename);
    }
}

// PROXY — ładuje obraz dopiero przy pierwszym użyciu (lazy loading)
public class LazyImageProxy implements ImageLoader {
    private final String filename;
    private RealImage realImage; // null dopóki nie jest potrzebny

    public LazyImageProxy(String filename) {
        this.filename = filename;
        // NIE ładujemy obrazu w konstruktorze!
    }

    @Override
    public void display() {
        if (realImage == null) {
            realImage = new RealImage(filename); // Lazy initialization
        }
        realImage.display();
    }
}
\`\`\`

### Rodzaje Proxy:
* **Lazy Proxy** — opóźnia kosztowną inicjalizację (jak powyżej).
* **Logging Proxy** — loguje każde wywołanie metody.
* **Access Proxy** — sprawdza uprawnienia przed wywołaniem.
* **Caching Proxy** — zapamiętuje wyniki wcześniejszych wywołań.

> [!IMPORTANT]
> **Spring AOP (Aspect-Oriented Programming)** jest w całości oparty na wzorcu Proxy. Gdy dodajesz \`@Transactional\` do metody, Spring automatycznie tworzy obiekt Proxy, który otwiera transakcję PRZED wywołaniem i commituje ją PO wywołaniu. Zrozumienie tego wzorca jest kluczowe dla zrozumienia "magii" Springa.
`},{title:`11. Wzorce Behawioralne: Strategy`,content:`
> **Strategy definiuje rodzinę algorytmów, hermetyzuje każdy z nich i umożliwia ich wymianę.**

Ten wzorzec już widzieliśmy przy zasadzie OCP! Wydzielamy algorytm do osobnego interfejsu i przekazujemy go jako zależność.

\`\`\`java
public interface SortStrategy {
    <T extends Comparable<T>> void sort(List<T> list);
}

public class BubbleSortStrategy implements SortStrategy {
    @Override
    public <T extends Comparable<T>> void sort(List<T> list) {
        System.out.println("Sortowanie bąbelkowe...");
        // Implementacja bubble sort
    }
}

public class QuickSortStrategy implements SortStrategy {
    @Override
    public <T extends Comparable<T>> void sort(List<T> list) {
        System.out.println("Sortowanie szybkie...");
        Collections.sort(list); // Uproszczone
    }
}

// Kontekst — używa strategii, nie wiedząc, jaka to implementacja
public class DataProcessor {
    private SortStrategy strategy;

    public DataProcessor(SortStrategy strategy) {
        this.strategy = strategy;
    }

    // Możliwość zmiany strategii w runtime!
    public void setStrategy(SortStrategy strategy) {
        this.strategy = strategy;
    }

    public void process(List<String> data) {
        strategy.sort(data);
        data.forEach(System.out::println);
    }
}
\`\`\`

> [!TIP]
> W Javie od wersji 8+ Strategy jest naturalnie wyrażany przez **interfejsy funkcyjne i lambdy**. Zamiast tworzyć oddzielne klasy, można po prostu przekazać lambdę:
> \`\`\`java
> // Comparator to Strategy!
> list.sort((a, b) -> a.length() - b.length());
> list.sort(Comparator.comparing(String::length));
> \`\`\`
`},{title:`12. Wzorce Behawioralne: Observer`,content:`
> **Observer definiuje mechanizm subskrypcji, pozwalając obiektom automatycznie reagować na zmiany stanu innego obiektu.**

Używany wszędzie tam, gdzie istnieje relacja "jeden-do-wielu" (np. system zdarzeń, powiadomienia, GUI).

\`\`\`java
// Interfejs obserwatora
public interface EventListener {
    void onEvent(String eventType, String data);
}

// Menedżer subskrypcji (Publisher)
public class EventManager {
    private final Map<String, List<EventListener>> listeners = new HashMap<>();

    public void subscribe(String eventType, EventListener listener) {
        listeners.computeIfAbsent(eventType, k -> new ArrayList<>()).add(listener);
    }

    public void unsubscribe(String eventType, EventListener listener) {
        listeners.getOrDefault(eventType, List.of()).remove(listener);
    }

    public void notify(String eventType, String data) {
        listeners.getOrDefault(eventType, List.of())
                 .forEach(listener -> listener.onEvent(eventType, data));
    }
}

// Konkretni obserwatorzy
public class EmailAlertListener implements EventListener {
    @Override
    public void onEvent(String eventType, String data) {
        System.out.println("📧 Email: Zdarzenie '" + eventType + "' — " + data);
    }
}

public class LoggingListener implements EventListener {
    @Override
    public void onEvent(String eventType, String data) {
        System.out.println("📝 Log: [" + eventType + "] " + data);
    }
}
\`\`\`
\`\`\`java
// Użycie:
EventManager events = new EventManager();
events.subscribe("user.registered", new EmailAlertListener());
events.subscribe("user.registered", new LoggingListener());
events.subscribe("order.placed", new LoggingListener());

// Powiadomienie wszystkich subskrybentów:
events.notify("user.registered", "jan@example.com");
// 📧 Email: Zdarzenie 'user.registered' — jan@example.com
// 📝 Log: [user.registered] jan@example.com
\`\`\`

> [!IMPORTANT]
> W Springu wzorzec Observer jest realizowany przez mechanizm **ApplicationEvent** i \`@EventListener\`. Kiedy publikujesz zdarzenie (\`applicationEventPublisher.publishEvent(event)\`), Spring automatycznie wywołuje wszystkie metody oznaczone \`@EventListener\`, które nasłuchują na ten typ zdarzenia.
`},{title:`13. Wzorce Behawioralne: Template Method`,content:`
> **Template Method definiuje szkielet algorytmu w klasie bazowej, pozwalając podklasom nadpisać konkretne kroki bez zmiany ogólnej struktury.**

\`\`\`java
public abstract class DataMiner {

    // TEMPLATE METHOD — definiuje szkielet algorytmu
    // Metoda finalna, nie może być nadpisana!
    public final void mine(String path) {
        openFile(path);
        String rawData = extractData();
        List<String> parsed = parseData(rawData);
        analyzeData(parsed);
        generateReport(parsed);
        closeFile();
    }

    // Kroki wspólne — implementacja w klasie bazowej
    void generateReport(List<String> data) {
        System.out.println("Raport: znaleziono " + data.size() + " rekordów.");
    }

    // Kroki abstrakcyjne — MUSZĄ być zaimplementowane przez podklasy
    protected abstract void openFile(String path);
    protected abstract String extractData();
    protected abstract List<String> parseData(String rawData);
    protected abstract void analyzeData(List<String> data);
    protected abstract void closeFile();
}

public class CsvDataMiner extends DataMiner {
    @Override
    protected void openFile(String path) { System.out.println("Otwieranie CSV: " + path); }
    @Override
    protected String extractData() { return "jan,28\\nmaria,35"; }
    @Override
    protected List<String> parseData(String rawData) {
        return List.of(rawData.split("\\\\n"));
    }
    @Override
    protected void analyzeData(List<String> data) {
        System.out.println("Analiza " + data.size() + " wierszy CSV...");
    }
    @Override
    protected void closeFile() { System.out.println("Zamknięto CSV."); }
}

public class JsonDataMiner extends DataMiner {
    // ... analogiczna implementacja dla JSON
}
\`\`\`
\`\`\`java
DataMiner miner = new CsvDataMiner();
miner.mine("dane.csv");
// Otwieranie CSV: dane.csv
// Analiza 2 wierszy CSV...
// Raport: znaleziono 2 rekordów.
// Zamknięto CSV.
\`\`\`

Szkielet algorytmu (\`mine()\`) jest taki sam, ale każda podklasa realizuje kroki na swój sposób.
`},{title:`14. Podsumowanie: SOLID + Wzorce — Tabela Referencyjna`,content:`
### Zasady SOLID — krótki przegląd

| Zasada | Akronim | Esencja |
|--------|---------|---------|
| Single Responsibility | **S** | Jedna klasa = jeden powód do zmiany |
| Open/Closed | **O** | Rozszerzaj przez nowe klasy, nie modyfikuj starych |
| Liskov Substitution | **L** | Podklasa musi działać wszędzie tam, gdzie klasa bazowa |
| Interface Segregation | **I** | Wiele małych interfejsów > jeden duży |
| Dependency Inversion | **D** | Zależ od abstrakcji, nie od konkretnych klas |

### Wzorce — krótki przegląd

| Wzorzec | Kategoria | Kiedy używać | Przykład w Javie/Springu |
|---------|-----------|--------------|--------------------------|
| **Singleton** | Kreacyjny | Jedna instancja w całej aplikacji | Spring Bean (domyślny scope) |
| **Factory Method** | Kreacyjny | Tworzenie obiektów bez ujawniania klasy | \`Calendar.getInstance()\` |
| **Builder** | Kreacyjny | Obiekt z wieloma opcjonalnymi parametrami | \`StringBuilder\`, Lombok \`@Builder\` |
| **Adapter** | Strukturalny | Integracja niekompatybilnych interfejsów | \`Arrays.asList()\`, \`InputStreamReader\` |
| **Decorator** | Strukturalny | Dodawanie zachowań bez zmiany klasy | \`BufferedReader(FileReader)\` |
| **Proxy** | Strukturalny | Kontrola dostępu, lazy loading, logowanie | Spring AOP, \`@Transactional\` |
| **Strategy** | Behawioralny | Wymienialny algorytm | \`Comparator\`, \`Predicate\` |
| **Observer** | Behawioralny | Reagowanie na zdarzenia | Spring \`@EventListener\` |
| **Template Method** | Behawioralny | Stały szkielet algorytmu, zmienne kroki | \`HttpServlet.doGet()/doPost()\` |

> [!TIP]
> Nie musisz zapamiętywać wszystkich wzorców na raz. Najważniejsze przed Springiem to: **Singleton**, **Factory**, **Proxy**, **Strategy** i **Observer** — oraz zrozumienie zasady **DIP / Dependency Injection**.
`}],quiz:[{question:`Która zasada SOLID mówi, że klasa powinna mieć tylko jeden powód do zmiany?`,options:[`Open/Closed Principle`,`Single Responsibility Principle`,`Liskov Substitution Principle`,`Dependency Inversion Principle`],answer:1,explanation:`Single Responsibility Principle (SRP) — klasa powinna odpowiadać za jedną, dobrze zdefiniowaną odpowiedzialność. Jeśli klasa ma wiele powodów do zmiany, powinna zostać podzielona.`},{question:`Czym jest Dependency Injection (DI)?`,options:[`Techniką tworzenia zależności wewnątrz klasy za pomocą operatora new`,`Wzorcem, w którym obiekt NIE tworzy swoich zależności sam, ale otrzymuje je z zewnątrz (np. przez konstruktor)`,`Mechanizmem automatycznego usuwania nieużywanych obiektów z pamięci`,`Sposobem na ukrycie implementacji za interfejsem`],answer:1,explanation:`DI to technika realizacji zasady DIP (Dependency Inversion Principle). Obiekt deklaruje, czego potrzebuje (przez konstruktor lub adnotację), a kontener (np. Spring) 'wstrzykuje' odpowiednią implementację.`},{question:`Który wzorzec projektowy jest fundamentem mechanizmu @Transactional w Springu?`,options:[`Observer`,`Singleton`,`Proxy`,`Factory Method`],answer:2,explanation:`Spring tworzy obiekt Proxy, który 'owija' oryginalny obiekt i dodaje logikę transakcyjną (otwieranie transakcji przed wywołaniem metody i commitowanie po jej zakończeniu). To klasyczny wzorzec Proxy.`},{question:`Jaka jest różnica między wzorcami Decorator a Proxy?`,options:[`Nie ma różnicy, to synonimy`,`Decorator dodaje NOWE zachowanie (np. szyfrowanie), a Proxy kontroluje DOSTĘP do istniejącego obiektu (np. lazy loading, autoryzacja)`,`Proxy może mieć wiele warstw, a Decorator nie`,`Decorator działa tylko z interfejsami, a Proxy z klasami abstrakcyjnymi`],answer:1,explanation:`Choć strukturalnie są podobne (oba opakowują obiekt o tym samym interfejsie), ich intencje się różnią. Decorator wzbogaca funkcjonalność, a Proxy kontroluje lub zarządza cyklem życia obiektu docelowego.`},{question:`Który z poniższych przykładów najlepiej ilustruje wzorzec Strategy w standardowej Javie?`,options:[`System.out.println()`,`Comparator<T> przekazywany do metody sort()`,`StringBuilder`,`HashMap`],answer:1,explanation:`Comparator<T> to klasyczny przykład wzorca Strategy — definiuje algorytm porównywania (strategię) jako obiekt, który można wymieniać. Metoda sort() nie wie, jak porównywać elementy — deleguje to do przekazanej strategii.`}]},re={id:`17`,title:`Wykład 17: Komunikacja Sieciowa — HTTP, REST API oraz format JSON`,description:`Przygotowanie do tworzenia usług sieciowych: podstawy protokołu HTTP, architektura REST, struktura danych JSON oraz wykorzystanie wbudowanego w Javę HttpClienta do integracji z zewnętrznymi API.`,sections:[{title:`1. Protokół HTTP — Podstawy`,content:`
Zanim zaczniesz pisać własne aplikacje sieciowe (np. w Spring Boot), musisz zrozumieć, jak komputery rozmawiają ze sobą w internecie. Językiem tej komunikacji jest najczęściej **HTTP** (HyperText Transfer Protocol).

Komunikacja HTTP zawsze odbywa się w modelu **Klient-Serwer**:
1. **Klient** (np. przeglądarka internetowa, aplikacja mobilna, inna aplikacja Java) wysyła **Żądanie (Request)**.
2. **Serwer** (np. Twoja aplikacja w Spring Boot) analizuje żądanie, przetwarza je i zwraca **Odpowiedź (Response)**.

Każde Żądanie (Request) składa się z:
* **Metody (Verb):** określa, *co* chcemy zrobić.
* **URL (Endpoint):** określa, *na jakim zasobie* chcemy operować (np. \`/api/users/1\`).
* **Nagłówków (Headers):** dodatkowe metadane (np. \`Content-Type: application/json\`, tokeny autoryzacyjne).
* **Ciała (Body):** opcjonalne dane wysyłane do serwera (np. dane z formularza lub obiekt JSON).

Każda Odpowiedź (Response) składa się z:
* **Kodu statusu (Status Code):** 3-cyfrowa liczba informująca o wyniku operacji.
* **Nagłówków (Headers):** np. rozmiar odpowiedzi, data.
* **Ciała (Body):** zwrócone dane (np. kod HTML lub JSON z informacjami o użytkowniku).
`},{title:`2. Metody HTTP i Kody Statusów`,content:"\n### Najważniejsze Metody HTTP (Verbs)\n\nW nowoczesnym podejściu każda metoda reprezentuje konkretną operację (tzw. operacje CRUD — Create, Read, Update, Delete):\n\n| Metoda | Kiedy używamy? | Przykład |\n|--------|----------------|----------|\n| **GET** | Pobieranie danych z serwera. Nigdy nie modyfikuje stanu na serwerze! (Tzw. operacja bezpieczna i idempotentna). | `GET /users` — pobiera listę użytkowników |\n| **POST** | Wysłanie danych do serwera w celu utworzenia NOWEGO zasobu. | `POST /users` — tworzy nowego użytkownika na bazie danych w ciele zapytania |\n| **PUT** | Całkowite zaktualizowanie lub podmiana ISTNIEJĄCEGO zasobu. | `PUT /users/123` — podmienia dane usera 123 |\n| **PATCH** | Częściowa aktualizacja zasobu. | `PATCH /users/123` — zmienia tylko np. hasło |\n| **DELETE** | Usunięcie zasobu. | `DELETE /users/123` — usuwa użytkownika 123 |\n\n### Najważniejsze Kody Statusów (Status Codes)\n\nSą pogrupowane w pięć kategorii (tzw. setek):\n* **2xx (Sukces):**\n  * `200 OK` — udało się.\n  * `201 Created` — udało się, nowy zasób został pomyślnie utworzony (zwykle po POST).\n  * `204 No Content` — operacja powiodła się, ale serwer nie zwraca żadnych danych (często po DELETE).\n* **3xx (Przekierowania):**\n  * `301 Moved Permanently`, `302 Found` — klient ma wyszukać zasób pod innym adresem URL.\n* **4xx (Błąd Klienta):** (To TWOJA wina)\n  * `400 Bad Request` — wysłałeś niepoprawne dane (np. zły JSON).\n  * `401 Unauthorized` — brak logowania, brak poprawnego hasła/tokenu.\n  * `403 Forbidden` — jesteś zalogowany, ale nie masz uprawnień (np. nie jesteś adminem).\n  * `404 Not Found` — próbujesz pobrać zasób, którego nie ma (zły URL lub brak encji w bazie).\n* **5xx (Błąd Serwera):** (To wina SERWERA)\n  * `500 Internal Server Error` — wystąpił nieobsłużony wyjątek (np. `NullPointerException`) w kodzie backendu.\n  * `502 Bad Gateway`, `503 Service Unavailable` — serwer leży, baza danych nie odpowiada itp.\n"},{title:`3. Czym jest REST API?`,content:`
REST (Representational State Transfer) to styl architektury dla tworzenia API (Application Programming Interface), oparty na standardach HTTP. Spring Boot pozwala na błyskawiczne tworzenie REST-owych endpointów za pomocą adnotacji \`@RestController\`.

Główne zasady architektury REST:
1. **Bezstanowość (Statelessness):** Serwer nie zapamiętuje żadnych sesji między żądaniami. Każdy request musi zawierać wszystkie informacje (np. token w nagłówku), aby serwer wiedział, kim jest nadawca.
2. **Architektura Klient-Serwer:** Rozdzielenie frontendu (np. React, Angular, aplikacja na Androida) od backendu (np. Java Spring Boot). Komunikują się one jedynie wysyłając żądania i odpowiedzi HTTP.
3. **Zasoby jako URI:** Każdy obiekt, na którym można operować (użytkownik, produkt, zamówienie), ma swój unikalny identyfikator URL.

### Przykład dobrych endpointów REST:
Zauważ, że używamy rzeczowników w liczbie mnogiej. Akcję określa metoda HTTP, a nie sam adres URL!

* ✅ \`GET /api/products\` (Pobierz listę)
* ✅ \`POST /api/products\` (Utwórz produkt)
* ✅ \`GET /api/products/42\` (Pobierz jeden produkt o ID 42)
* ✅ \`DELETE /api/products/42\` (Usuń produkt 42)

* ❌ \`GET /api/getProducts\` (Złe, akcja w nazwie URL)
* ❌ \`POST /api/products/42/delete\` (Złe, do usuwania służy metoda DELETE, a nie POST i dziwny URL)
`},{title:`4. Format Danych JSON`,content:`
Frontend i Backend mogą być napisane w różnych językach (np. JavaScript i Java). Aby mogły przesyłać sobie obiekty, muszą je przetłumaczyć na uniwersalny format tekstowy (tzw. serializacja). Dziś absolutnym standardem w API jest **JSON** (JavaScript Object Notation).

### Struktura JSON
JSON składa się z:
1. Obiektów (wąsy \`{ }\`)
2. Tablic (nawiasy kwadratowe \`[ ]\`)
3. Par klucz-wartość (klucz **zawsze** w podwójnych cudzysłowach)
4. Wartości podstawowych: stringi (w \`" "\`), liczby (bez cudzysłowów), \`true\`, \`false\`, \`null\`.

### Przykładowy dokument JSON:
\`\`\`json
{
  "id": 101,
  "name": "Jan Kowalski",
  "isActive": true,
  "balance": 1500.50,
  "roles": ["USER", "ADMIN"],
  "address": {
    "city": "Warszawa",
    "street": "Wiejska 1"
  },
  "department": null
}
\`\`\`

> [!NOTE]
> W Javie popularne biblioteki (jak **Jackson** czy **Gson**) potrafią automatycznie mapować taki JSON bezpośrednio na obiekt klasy Java za pomocą refleksji (i odwrotnie). Spring Boot wbudowuje w siebie bibliotekę Jackson i robi to całkowicie pod maską!
`},{title:`5. Integracja z API z poziomu Javy (HttpClient)`,content:`
Od Javy 11 w bibliotece standardowej dostępny jest świetny, nowoczesny klient HTTP, który obsługuje zarówno operacje synchroniczne, jak i asynchroniczne (np. przy użyciu \`CompletableFuture\`).

Aby pobrać dane z zewnętrznego REST API (np. kursy walut, dane pogodowe), musisz:
1. Zbudować klienta: \`HttpClient.newHttpClient()\`
2. Zbudować żądanie (HttpRequest): określić URL i metodę
3. Wysłać żądanie i odebrać odpowiedź (HttpResponse)

### Przykład: Pobieranie losowego faktu o kotach (metoda GET)
\`\`\`java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class CatFactClient {
    public static void main(String[] args) throws Exception {
        // 1. Tworzymy klienta
        HttpClient client = HttpClient.newHttpClient();

        // 2. Budujemy żądanie GET
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://catfact.ninja/fact"))
            .GET()
            .build();

        System.out.println("Wysyłam zapytanie...");

        // 3. Wysyłamy żądanie i oczekujemy odpowiedzi w postaci Stringa (BodyHandlers.ofString)
        HttpResponse<String> response = client.send(
            request, 
            HttpResponse.BodyHandlers.ofString()
        );

        // 4. Analizujemy odpowiedź
        System.out.println("Status Code: " + response.statusCode()); // np. 200
        System.out.println("Body (JSON): " + response.body()); 
        // Wypisze np: {"fact":"Cats sleep 12-16 hours a day.","length":29}
    }
}
\`\`\`
`},{title:`6. Deserializacja JSON za pomocą biblioteki zewnętrznej`,content:`
Kiedy pobierzemy Stringa (jak w przykładzie powyżej), praca z nim w Javie jest trudna. Chcielibyśmy go zamienić na nasz własny obiekt (Record). Aby to zrobić, używamy biblioteki **Jackson**.

### Krok 1: Dodanie zależności do pom.xml (Maven)
\`\`\`xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.16.1</version>
</dependency>
\`\`\`

### Krok 2: Przygotowanie klasy (Rekordu) w Javie
Od Javy 14, Rekordy są do tego idealne. Nazwy pól muszą się pokrywać z kluczami z JSON-a!
\`\`\`java
public record CatFact(String fact, int length) {}
\`\`\`

### Krok 3: Deserializacja za pomocą ObjectMapper
\`\`\`java
import com.fasterxml.jackson.databind.ObjectMapper;

// Zamiast ręcznie wypisywać Stringa (z poprzedniego punktu):
String jsonString = response.body();

// Używamy ObjectMapper z biblioteki Jackson
ObjectMapper mapper = new ObjectMapper();

// Konwertujemy String JSON na instancję rekordu CatFact!
CatFact catFactObj = mapper.readValue(jsonString, CatFact.class);

System.out.println("Czy wiesz, że: " + catFactObj.fact());
System.out.println("Długość tekstu to: " + catFactObj.length());
\`\`\`

Gdy poznasz Spring Boot, przekonasz się, że on wszystko to robi za Ciebie — zarówno tworzenie JSON-ów na wyjściu (serializacja), jak i odbieranie ich na wejściu (deserializacja). Jednak zrozumienie mechanizmów, które za tym stoją, jest bezcenne przy poszukiwaniu błędów i debugowaniu złożonych systemów!
`}],quiz:[{question:`Która metoda HTTP powinna być użyta do aktualizacji istniejącego zasobu użytkownika (np. edycja profilu)?`,options:[`POST`,`PUT lub PATCH`,`GET`,`UPDATE`],answer:1,explanation:`PUT służy do wymiany (nadpisania) całego zasobu nowymi danymi, natomiast PATCH służy do częściowej aktualizacji (np. zmiana tylko nazwiska). POST tworzy nowy zasób, a metody UPDATE w HTTP po prostu nie ma.`},{question:`Jaki kod statusu HTTP jest poprawny, gdy klient spróbuje wejść na URL, który nie istnieje?`,options:[`200 OK`,`400 Bad Request`,`404 Not Found`,`500 Internal Server Error`],answer:2,explanation:`404 Not Found jednoznacznie oznacza 'szukany zasób nie został odnaleziony'. Z kolei 400 Bad Request to zła zawartość zapytania, a 500 to błąd w kodzie samej aplikacji.`},{question:`Co charakteryzuje architekturę REST w kontekście stanu klienta (Statelessness)?`,options:[`Każde zapytanie do serwera tworzy tzw. 'sesję', do której mają dostęp kolejne zapytania.`,`Serwer nie przechowuje stanu klienta pomiędzy kolejnymi zapytaniami. Każde żądanie HTTP musi zawierać wszystkie niezbędne informacje (np. token).`,`Stan użytkownika zapisywany jest wyłącznie w plikach cookies na serwerze.`,`REST wymusza, by stan przetrzymywać na osobnym serwerze pamięci (np. Redis).`],answer:1,explanation:`Zasada bezstanowości (statelessness) nakazuje, by serwer przetwarzał każde zapytanie HTTP niezależnie, nie opierając się na żadnych historycznych sesjach pamiętanych w jego pamięci RAM.`},{question:`Jaka biblioteka w Javie jest standardowo używana (m.in. wbudowana w Spring Boot) do konwersji pomiędzy formatem JSON a obiektami Java?`,options:[`Hibernate`,`JUnit`,`Jackson`,`Maven`],answer:2,explanation:`Jackson (a dokładniej moduł jackson-databind) to najpopularniejsza biblioteka realizująca konwersje Obiekt <-> JSON (czyli mapowanie obiektowo-rekordowe do formatu testowego).`}]},w={id:`18`,title:`Wykład 18: Relacyjne Bazy Danych i Podstawy SQL w Javie (JDBC)`,description:`Zrozumienie działania relacyjnych baz danych, wprowadzenie do podstawowych instrukcji języka SQL oraz omówienie sposobu łączenia się z bazą danych z poziomu kodu Javy poprzez JDBC.`,sections:[{title:`1. Relacyjne Bazy Danych (RDBMS)`,content:'\nGdy dane w aplikacji, takiej jak sklep internetowy czy portal społecznościowy, muszą przetrwać pomiędzy uruchomieniami programu, używamy tzw. trwałości danych (Persistance). Do tego celu powszechnie stosuje się **Relacyjne Bazy Danych**. Przykłady to **PostgreSQL**, **MySQL**, **Oracle** czy wbudowana baza **H2**.\n\n### Koncepcje relacyjne:\n1. **Tabela (Table):** Przypomina arkusz kalkulacyjny w Excelu. Służy do przechowywania określonego typu danych, np. `Users` lub `Orders`.\n2. **Rekord/Wiersz (Row):** Pojedynczy "obiekt" z danymi, czyli np. jeden konkretny użytkownik. Odpowiada jednemu instancji klasy w Javie.\n3. **Kolumna (Column):** Atrybut danych o określonym typie, np. `first_name` (typu tekstowego), `age` (typu całkowitego). Odpowiada polu w klasie Javy.\n4. **Klucz główny (Primary Key - PK):** Unikalny identyfikator każdego rekordu. Żadne dwa rekordy nie mogą mieć tego samego PK. Najczęściej jest to rosnący numer (ID) typu `BIGINT` (w Javie jako `Long`).\n5. **Klucz obcy (Foreign Key - FK):** Wskazuje na Klucz Główny w innej tabeli, tworząc w ten sposób *relację* pomiędzy tabelami. Np. wiersz w tabeli `Orders` posiada pole `user_id`, które prowadzi nas do informacji o właścicielu w tabeli `Users`.\n'},{title:`2. Język SQL (Structured Query Language)`,content:`
Bazy relacyjne nie rozumieją Javy. By z nimi "porozmawiać", wykorzystujemy uniwersalny język **SQL**.

Dzieli się on na podgrupy, a najczęstszą z nich jest **DML (Data Manipulation Language)**. Jego fundamentami jest tak zwany **CRUD** (Create, Read, Update, Delete):

### 1. Pobieranie danych (Read - SELECT)
Służy do wyszukiwania danych.
\`\`\`sql
-- Wyciągnij wszystkich użytkowników z tabeli users
SELECT * FROM users;

-- Zwróć tylko adresy email dla użytkowników, którzy mają więcej niż 18 lat
SELECT email FROM users WHERE age > 18;
\`\`\`

### 2. Tworzenie danych (Create - INSERT)
Służy do wstawiania nowych rekordów.
\`\`\`sql
-- ID często jest generowane autoamtycznie, więc pomijamy je na wejściu.
INSERT INTO users (first_name, last_name, age, email) 
VALUES ('Jan', 'Kowalski', 25, 'jan@example.com');
\`\`\`

### 3. Aktualizacja danych (Update - UPDATE)
> [!WARNING]
> Zawsze stosuj klauzulę \`WHERE\` przy operacji \`UPDATE\` lub \`DELETE\`. W przeciwnym razie modyfikacji ulegną WSZYSTKIE rekordy w tabeli!

\`\`\`sql
-- Zmień adres email tylko użytkownikowi o ID = 42
UPDATE users 
SET email = 'new_email@example.com' 
WHERE id = 42;
\`\`\`

### 4. Usuwanie danych (Delete - DELETE)
\`\`\`sql
-- Usunięcie rekordu. Uważaj na brak klauzuli WHERE!
DELETE FROM users WHERE id = 42;
\`\`\`

### Pobieranie z relacji (JOIN)
Pozwala "skleić" w zapytaniu dane z kilku powiązanych ze sobą tabel (używając klucza głównego i klucza obcego).
\`\`\`sql
-- Znajdź wszystkie zamówienia oraz imiona osób, które je złożyły
SELECT orders.order_number, users.first_name 
FROM orders
JOIN users ON orders.user_id = users.id;
\`\`\`
`},{title:`3. Łączenie Javy z Bazą (JDBC)`,content:`
Aplikacja z zasady nie używa okienka tekstowego SQL. Jak z poziomu kodu Javy wstawiać obiekty do tabel? Służy do tego warstwa **JDBC (Java Database Connectivity)** wbudowana w bibliotekę Javy (w pakiecie \`java.sql\`).

Kroki w klasycznym podejściu (tzw. "Czysty JDBC"):

### Krok 1: Dodanie sterownika bazy danych
Ponieważ do każdej bazy mówi się nieco innym "dialektem", potrzebujesz tłumacza (tzw. Drivera). Dodaje się go z pliku JAR lub z Mavena:
\`\`\`xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.2</version>
</dependency>
\`\`\`

### Krok 2: Kod komunikacyjny:
\`\`\`java
import java.sql.*;

public class JdbcExample {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/my_database";
        String user = "db_user";
        String pass = "db_password";

        // Używamy try-with-resources dla połączeń sieciowych do bezpiecznego ich zamknięcia!
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             PreparedStatement statement = conn.prepareStatement("SELECT * FROM users WHERE age > ?")) {

             // Zabezpieczenie przed atakiem SQL Injection: podmieniamy znak zapytania
             statement.setInt(1, 18);

             try (ResultSet rs = statement.executeQuery()) {
                 while (rs.next()) {
                     System.out.println("Znalazłem Usera: " + rs.getString("first_name"));
                 }
             }
        } catch (SQLException e) {
             e.printStackTrace();
        }
    }
}
\`\`\`

> [!NOTE]
> Zauważ, że w czystym podejściu JDBC, zaledwie dla jednego zapytania musimy utworzyć Connection, Prepared Statement, bindować parametry, wykonać query, stworzyć ResultSet oraz zamknąć wszystkie powiązane z nimi zmienne na końcu. A wszystko to owinąć w try-catch. Jest to tzw. "Boilerplate code" (kod szablonowy). 
`},{title:`4. ORM (Object-Relational Mapping)`,content:`
Ze względu na obszerność boilerplate kodu w natywnym JDBC, świat Javy rzadko używa go bezpośrednio do pisania aplikacji korporacyjnych. O wiele popularniejszym podejściem są narzędzia, które załatwiają za nas "czarną robotę". Są to narzędzia **ORM (Object-Relational Mapping)**. 

Standardem Javy w tej kategorii jest **JPA (Java Persistence API)**, a wiodącą biblioteką implementującą jest **Hibernate**.

Narzędzia typu Hibernate pozwalają w ogóle przestać pisać bazowy SQL! Wystarczy zadeklarować klasę używając adnotacji. Framework sam stworzy w tle kod JDBC oraz zapytania SQL po to, by tę klasę automatycznie zsynchronizować z relacyjną tabelą.

Przykładowy zarys tego, co cię czeka w świecie Hibernate i Spring Data (kolejny szczebel zaawansowania dla Spring Boota):

\`\`\`java
@Entity // Mówi bibliotece, że ta klasa to reprezentacja Tabeli SQL
@Table(name = "users")
public class User {

    @Id // Klucz główny
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    // Magia polega na tym, że zamiast pisać "SELECT * FROM users WHERE age > 18"
    // Spring zbuduje nam obiekt i da gotową, dającą się wywołać bezpośrednio z kodu listę!
}
\`\`\`
Mimo iż z reguły bazuje się dzisiaj na Hibernate i narzędziach ORM, **zrozumienie bazowych konstrukcji SQL (Join, Select, Indexy)** jest jedną z najcenniejszych wartości na rynku pracy. Działanie narzędzia Hibernate bez problemu zrozumiesz, mając za sobą doświadczenie z Adnotacjami i Reflection API omawianymi we wcześniejszych modułach tego kursu!
`}],quiz:[{question:`W jakim celu stosuje się klauzulę WHERE przy instrukcjach typu UPDATE lub DELETE?`,options:[`Służy wyłącznie celom logowania – bez WHERE zapytanie wcale się nie uruchomi.`,`Dzięki niej zoptymalizujemy zapis pod względem zużytej pamięci serwera.`,`Chroni to nas przed omyłkowym zaaplikowaniem tej operacji dla WSZYSTKICH wierszy występujących w tej konkretnej tabeli.`,`Powyższe stwierdzenie o WHERE w UPDATE/DELETE nie jest prawdziwe — klauzuli WHERE używa się wyłącznie z instrukcją SELECT.`],answer:2,explanation:"Działanie `UPDATE` oraz `DELETE` bez nałożonego uprzednio filtru modyfikuje globalnie od góry do dołu całą tabelę, prowadząc najczęściej do krytycznych błędów biznesowych i incydentów produkcji."},{question:`Czym jest 'Foreign Key' w relacyjnej bazie danych?`,options:[`Bezpiecznym kluczem autoryzacyjnym, wysyłanym z Frontendu`,`Wartością powiązującą pole w danej tabeli do Klucza Głównego innej tabeli (służącą nawiązaniu i weryfikacji relacji)`,`Wyłącznie inną nazwą na klucz UUID generowany z systemu operacyjnego`,`Dodatkową kopią zapasową hasła do tej konkretnej bazy z autoryzacji`],answer:1,explanation:`Foreign Key (Klucz obcy) to podstawa łączenia tabel – np. przechowując w tabeli 'Samochod' informację na temat tego, do kogo on należy (z wykorzystaniem pola 'id_wlasciciela' pochodzącego z tabeli 'Klient').`},{question:`Dlaczego technologia ORM (jak Hibernate) stała się preferowaną opcją względem natywnego (czystego) użycia JDBC w środowisku Javy?`,options:[`Ponieważ Hibernate wykonuje zapytania kilkadziesiąt razy szybciej niż standardowe JDBC pod spodem.`,`Jako jedyna potrafi zamknąć za dewelopera gniazda Socket do wybranego klastra bazodanowego.`,`Automatycznie zwalnia zasoby deweloperów z pisania trywialnego, szablonowego (boilerplate) kodu i konwertowania obiektów SQL -> Java ręcznie z każdej z poszczególnych kolumn ResultSet.`,`Ponieważ natywny JDBC został porzucony od wersji Java 8 i ma w sobie wiele luk zabezpieczeń.`],answer:2,explanation:`ORM odciąża deweloperów z rutynowego pisania logiki typu pobieranie parametru rs.getString("age"), bindowanie PreparedStatement itd. Pamiętaj jednak, że z technicznego punktu widzenia ORM w tle wykonuje mimo wszystko zapytania poprzez wbudowane pod spodem JDBC, więc natywne połączenie bywa szybsze!`}]},ie={id:`Lab01`,title:`Лабораторна 1: Вступ до Git та IntelliJ IDEA`,description:`Основи роботи з системами контролю версій`,sections:[{title:`1. Вступ до Git`,content:`
Малі проекти, які ведуться однією людиною, відносно легко підтримувати. Проте, коли проект росте, вам може знадобитися скасувати частину змін, спробувати новий підхід без ризику зламати робочий код, або працювати в команді.

Саме для цього потрібна **система контролю версій** (VCS). У цьому курсі ми зосередимося на найпопулярнішій системі — **Git**. 

Ви можете виконувати завдання за допомогою терміналу або використовуючи графічний інтерфейс **IntelliJ IDEA**. Хоча IDE значно спрощує рутинні задачі, обов'язково потрібно розуміти базові команди консолі.
`},{title:`2. Перші кроки`,content:`
### Дані користувача (Credentials)
Дії в Git пов'язані з вашою особистістю. Встановіть своє ім'я та email у терміналі:
\`\`\`bash
git config --global user.name "Ваше Ім'я"
git config --global user.email "ваш.email@example.com"
\`\`\`

### Ініціалізація репозиторію
**Репозиторій** — це місце, де зберігаються файли проекту та історія їх змін (у прихованій папці \`.git\`).
Щоб створити репозиторій у поточній папці:
\`\`\`bash
git init
\`\`\`

**В IntelliJ IDEA:** Відкрийте проект, виберіть у верхньому меню \`VCS -> Enable Version Control Integration\`, виберіть \`Git\` і натисніть OK.

> [!TIP]
> **Завдання 0:** Створіть нову папку \`JavaLabs\`, відкрийте її в терміналі або IntelliJ IDEA та ініціалізуйте Git репозиторій.
`},{title:`3. Робота з файлами`,content:'\nФайл у Git може перебувати в трьох основних станах:\n* `modified` (змінений, але не підготовлений)\n* `staged` (підготовлений до коміту)\n* `committed` (збережений у репозиторії)\n\nБазовий робочий процес:\n1. Змінюєте файли.\n2. Додаєте їх у Staging Area: `git add <файл>` (або `git add .` для всіх файлів).\n3. Робите коміт: `git commit -m "Опис змін"`.\n\n### Ігнорування файлів (.gitignore)\nJava-проекти містять скомпільовані класи (`.class`), папки збірки (`target/` або `out/`) та налаштування IDE (`.idea/`, `*.iml`). Ці файли **не можна** комітити! Їх потрібно додати у файл `.gitignore`.\n\n**В IntelliJ IDEA:** Натисніть `Alt+0` (або `Cmd+0`), щоб відкрити вікно **Commit**. Виберіть файли, напишіть повідомлення і натисніть кнопку `Commit`.\n\n> [!TIP]\n> **Завдання 1:** \n> 1. Створіть файл `Main.java` з простим кодом "Hello World".\n> 2. Створіть файл `.gitignore` і додайте туди `out/`, `target/`, `.idea/`, `*.iml`.\n> 3. Додайте обидва файли в staging (`git add .`).\n> 4. Видаліть `.gitignore` зі staging (`git restore --staged .gitignore`).\n> 5. Зробіть коміт лише файлу `Main.java`.\n> 6. Перевірте статус (`git status`), переконайтесь що `.gitignore` залишився модифікованим, після чого закомітьте і його окремо.\n'},{title:`4. Гілки (Branching) та Злиття (Merging)`,content:'\nГілки дозволяють розробляти нові фічі ізольовано від стабільного коду. \nТиповий підхід:\n* `main` (або `master`) — стабільна версія.\n* `feature/login` — гілка для розробки нової фічі.\n\nКоманди:\n* Створити нову гілку і перейти на неї: `git checkout -b feature/name`\n* Перейти на існуючу: `git checkout main`\n* Злиття (Merge): перейти на `main` і виконати `git merge feature/name`\n\n**В IntelliJ IDEA:** Використовуйте меню гілок у правому нижньому куті екрану (там де написано `main`). Натисніть на нього -> `New Branch`. Для злиття виберіть гілку зі списку і натисніть `Merge into Current`.\n\n### Відкладення змін (Stash)\nЯкщо ви почали роботу, але потрібно терміново перейти на іншу гілку, ви можете тимчасово "відкласти" незавершені зміни:\n```bash\ngit stash        // Відкласти зміни\ngit stash pop    // Повернути зміни\n```\n\n> [!TIP]\n> **Завдання 2:** \n> 1. Створіть нову гілку `feature/greetings`.\n> 2. Змініть `Main.java` так, щоб програма виводила "Hello, Alice!". Закомітьте зміни.\n> 3. Поверніться на `main`. Переконайтеся, що код там старий ("Hello World").\n> 4. Злийте гілку `feature/greetings` у `main`.\n'},{title:`5. Віддалені репозиторії та Конфлікти`,content:`
Щоб співпрацювати з іншими, використовують віддалені репозиторії (наприклад, GitHub, GitLab).

* \`git clone <url>\` — клонувати репозиторій.
* \`git fetch origin\` — завантажити зміни з віддаленого репозиторію, але не застосовувати їх до робочих файлів.
* \`git pull origin main\` — завантажити і злити зміни (fetch + merge).
* \`git push origin main\` — відправити ваші локальні коміти на сервер.

### Вирішення конфліктів
Якщо два розробники одночасно змінили один і той самий рядок коду у різних гілках, при спробі злиття (\`git pull\` або \`git merge\`) виникне **конфлікт**. Git не зможе автоматично об'єднати файли і попросить вас зробити це вручну.

Git вставить спеціальні маркери у файл:
\`\`\`java
<<<<<<< HEAD
System.out.println("Hello from Alice");
=======
System.out.println("Hello from Bob");
>>>>>>> feature/bob-changes
\`\`\`

Вам потрібно відредагувати файл, видалити маркери і залишити правильний код, після чого додати файл (\`git add\`) і зробити коміт.

**В IntelliJ IDEA:** Використовуйте зручний інструмент **Merge Conflicts** (з'явиться автоматично), де ви побачите 3 панелі: ваша локальна версія, версія сервера, і результуючий файл посередині. Клікайте на "стрілочки", щоб перенести потрібні блоки коду.

> [!IMPORTANT]
> Конфлікти — це нормальна частина роботи в команді. Не бійтеся їх. Уважно читайте, які саме рядки конфліктують, і обирайте правильний фінальний результат.
`}],quiz:[{question:`Яка команда використовується для тимчасового збереження незавершених змін без створення коміту?`,options:[`git add`,`git stash`,`git save`,`git commit --temp`],answer:1,explanation:"Команда `git stash` відкладає модифікації робочого каталогу у спеціальний сховок, дозволяючи вам перемикатися між гілками, не втрачаючи незавершеної роботи."},{question:`Яку папку обов'язково треба додати у .gitignore для проектів IntelliJ IDEA з Maven?`,options:[`src/`,`pom.xml`,`target/ та .idea/`,`lib/`],answer:2,explanation:"Папка `target/` містить скомпільовані файли (.class, .jar), а `.idea/` — локальні налаштування редактора. Їх не можна додавати до системи контролю версій."}]},ae={id:`Lab02`,title:`Лабораторна 2: Maven, Unit Tests, Java CLI`,description:`Основи побудови багатомодульних проектів, управління залежностями та модульне тестування.`,sections:[{title:`Task 1: Структура Maven (Багатомодульний проект)`,content:`
Замість того, щоб тримати весь код у купі, великі проекти розбивають на незалежні модулі. У Java стандартним інструментом для управління проектами та збіркою є **Maven** (або Gradle).
Ми створимо програму для перевірки надійності паролів, яка складатиметься з двох частин:
1. Бібліотеки з бізнес-логікою (\`PasswordValidatorLib\`).
2. Консольного застосунку (\`PasswordValidatorApp\`), який використовує цю бібліотеку.

### 1. Створення батьківського проекту
Створіть нову папку \`PasswordValidator\` та ініціалізуйте в ній головний файл \`pom.xml\` (Project Object Model). Це буде "батьківський" проект.

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>org.example</groupId>
    <artifactId>PasswordValidator</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <modules>
        <module>PasswordValidatorLib</module>
        <module>PasswordValidatorApp</module>
    </modules>
</project>
\`\`\`

### 2. Створення модулів
Усередині папки \`PasswordValidator\` створіть дві підпапки: \`PasswordValidatorLib\` та \`PasswordValidatorApp\`. У кожній з них створіть базову структуру Maven:
* \`src/main/java/\`
* \`src/test/java/\`
* Власний \`pom.xml\`.

Приклад \`pom.xml\` для \`PasswordValidatorApp\`:
\`\`\`xml
    <parent>
        <groupId>org.example</groupId>
        <artifactId>PasswordValidator</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <artifactId>PasswordValidatorApp</artifactId>
\`\`\`

### 3. Зв'язування проектів
Щоб застосунок міг викликати код з бібліотеки, нам потрібно додати залежність в \`PasswordValidatorApp/pom.xml\`:
\`\`\`xml
    <dependencies>
        <dependency>
            <groupId>org.example</groupId>
            <artifactId>PasswordValidatorLib</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
    </dependencies>
\`\`\`
`},{title:`Task 2: Розробка коду та управління залежностями`,content:'\n### 1. Частина бібліотеки\nУ модулі `PasswordValidatorLib` (в папці `src/main/java/org/example/`) створіть два файли:\n* `ValidationError.java` — публічний `enum` можливих помилок (наприклад, `TOO_SHORT`, `NO_LOWERCASE`, `NO_SPECIAL_CHAR`).\n* `PasswordValidator.java` — клас із методом `public List<ValidationError> validate(String password)`.\n\nЩоб не поміщати всю логіку в один метод, розбийте перевірки на окремі приватні (або package-private) методи:\n* `boolean validateLength(String password)`: перевіряє, чи має пароль мінімум 8 символів.\n* `boolean validateHasLowerCase(String password)`: перевіряє наявність малої літери.\n* `boolean validateContainsSpecialCharacter(String password)`: перевіряє наявність хоча б одного знаку `!@#$%^&*(),.?":{}|<>`.\n\nУ методі `validate` викликайте ці перевірки і, якщо якась не проходить, додавайте відповідний `ValidationError` до списку і повертайте його.\n\n### 2. Консольна частина\nУ модулі `PasswordValidatorApp` створіть клас `Main` з методом `public static void main(String[] args)`.\nВикористовуючи клас `Scanner`, в циклі запитуйте у користувача пароль:\n* Створіть об\'єкт `PasswordValidator` (використовуйте імпорт з бібліотеки).\n* Викличте метод `validate()`.\n* Якщо список помилок порожній, виведіть `"✓ Password is valid and safe!"`.\n* Якщо є помилки, виведіть `"✗ Password is invalid:"` і для кожної помилки виведіть її опис з нового рядка.\n* Якщо користувач введе `exit`, завершіть роботу програми.\n\n### 3. Зовнішні залежності (Maven Repository)\nУявимо, що ви хочете додати кольоровий текст у консоль. Замість того, щоб писати ANSI-коди вручну, ви можете скористатися готовою бібліотекою з [Maven Central Repository](https://mvnrepository.com/).\n\nДодайте в `pom.xml` модуля `PasswordValidatorApp` бібліотеку **Jansi** (або будь-яку подібну для кольорів):\n```xml\n<dependency>\n    <groupId>org.fusesource.jansi</groupId>\n    <artifactId>jansi</artifactId>\n    <version>2.4.0</version>\n</dependency>\n```\nПісля оновлення Maven (кнопка `Load Maven Changes` в IDE), використайте класи бібліотеки, щоб розфарбувати вивід: зелений колір для успіху, червоний — для помилок.\n'},{title:`Task 3: Модульні тести (JUnit 5)`,content:`
Останнім кроком є написання тестів для нашої бібліотеки. Тести перевіряють, що кожна "одиниця" коду діє саме так, як очікувалося.

Хороший тест будується за схемою **Arrange-Act-Assert (AAA)**:
1. **Arrange (Підготовка):** Налаштування даних та створення об'єктів.
2. **Act (Дія):** Виклик методу, який ми тестуємо.
3. **Assert (Перевірка):** Перевірка результату на відповідність очікуванням.

### 1. Налаштування JUnit
Додайте в \`pom.xml\` модуля \`PasswordValidatorLib\` залежність на JUnit 5:
\`\`\`xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.10.0</version>
    <scope>test</scope>
</dependency>
\`\`\`
*(Зверніть увагу на \`<scope>test</scope>\` — ця бібліотека не потрапить у фінальний білд програми, вона доступна лише при запуску тестів).*

### 2. Написання тестів
Створіть клас \`PasswordValidatorTest\` у папці \`src/test/java/org/example/\`.
Напишіть перший тест згідно зі схемою AAA:

\`\`\`java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PasswordValidatorTest {
    @Test
    void validate_ValidPassword_ReturnsEmptyErrorList() {
        // Arrange
        PasswordValidator validator = new PasswordValidator();
        String password = "StrongPassword123!";
        
        // Act
        var errors = validator.validate(password);
        
        // Assert
        assertTrue(errors.isEmpty(), "Список помилок має бути порожнім");
    }
}
\`\`\`

Часто застосовується підхід **Test Driven Development (TDD)**: ви спочатку пишете тест, він падає (бо логіки ще немає), а потім пишете код, щоб тест пройшов.

**Завдання:** Допишіть наступні тести:
* \`validate_PasswordHasNoSpecialCharacter_ReturnsError\`
* \`validate_EmptyString_ReturnsMultipleErrors\`
* \`validate_ShortPassword_ReturnsTooShortError\`

Запустіть тести з консолі командою \`mvn test\` або через графічний інтерфейс IntelliJ IDEA.
`}],quiz:[{question:`Яка стандартна директорія використовується у Maven для зберігання початкового коду основної програми?`,options:[`src/`,`src/main/java/`,`src/main/code/`,`java/src/`],answer:1,explanation:"Maven використовує конвенцію `src/main/java/` для основних вихідних файлів (джерел) та `src/test/java/` для модульних тестів."},{question:`Яка анотація з JUnit 5 вказує на те, що метод є тестовим?`,options:[`@TestCase`,`@Check`,`@Test`,`@RunTest`],answer:2,explanation:"У JUnit (і 4, і 5) тестові методи позначаються анотацією `@Test` (наприклад: `org.junit.jupiter.api.Test`)."}]},oe={id:`Lab03`,title:`Лабораторна 3: Класи, Спадкування, Інкапсуляція`,description:`Основи ООП на прикладі бібліотеки для матриць`,sections:[{title:`1. Вступ`,content:`
Завданням на цю лабораторну роботу є створення простої бібліотеки, відповідальної за операції над матрицями. 
Ми реалізуємо абстрактну матрицю та дві її імплементації: густу (Dense) і розріджену (Sparse), використовуючи принципи об'єктно-орієнтованого програмування.
`},{title:`2. Етап 1: Базові класи (4 бали)`,content:'\nУ пакеті `org.example.matrix` створіть абстрактну суперклас `Matrix`, яка матиме:\n* `protected` поля для кількості рядків (`rows`) та колонок (`cols`).\n* Конструктор, який приймає кількість рядків і колонок як `int`. \n* Публічні **гетери** `getRows()` та `getColumns()`.\n* Абстрактні методи `public abstract float get(int row, int col)` та `public abstract void set(int row, int col, float value)` (вони замінять індексатори, яких немає в Java).\n* Перевизначений метод `toString()`, який красиво форматує матрицю для виводу в консоль (використовуйте `StringBuilder`).\n\nДалі створіть класи `DenseMatrix` та `SparseMatrix`, які наслідують `Matrix`.\n\n* `DenseMatrix` повинна зберігати елементи у вигляді двовимірного масиву `float[][]`.\n* `SparseMatrix` повинна зберігати лише ненульові елементи у колекції (наприклад, `Map<String, Float>`, де ключ — це рядок "row,col", або створити допоміжний запис `record Point(int r, int c)` і використовувати `Map<Point, Float>`). Це заощаджує пам\'ять для великих матриць, де більшість елементів — нулі.\n\nОбидві класи повинні мати конструктор `int, int`. Новостворені матриці за замовчуванням повинні бути заповнені нулями.\nЯкщо розміри менші або дорівнюють нулю, викидайте виняток `IllegalArgumentException`.\n'},{title:`3. Етап 2: Операції (3 бали)`,content:"\nДодайте до `Matrix` абстрактні методи `identity()`, `transpose()` та `norm()`. Реалізуйте їх у класах-нащадках.\n\n* `identity()` — робить матрицю одиничною (одиниці по діагоналі, решта нулі). Якщо матриця не квадратна, метод повинен викидати виняток `IllegalStateException`.\n* `transpose()` — повертає нову матрицю, яка є транспонованою копією поточної.\n* `norm()` — повертає норму матриці (Фробеніусову норму), яка дорівнює квадратному кореню із суми квадратів усіх елементів.\n\n> [!TIP]\n> У `SparseMatrix` метод `norm()` повинен обчислюватися за час $O(K)$, де $K$ — кількість ненульових елементів, а не $O(N \\times M)$.\n"},{title:`4. Етап 3: Математика без перевантаження (3 бали)`,content:"\nУ C# можна перевантажити оператори (`+`, `*`). Java цього **не підтримує**, тому ми будемо використовувати звичайні методи.\n\nДодайте абстрактний метод `protected abstract Matrix getInstance(int rows, int cols)` у клас `Matrix`. Цей метод має використовуватися для створення нової матриці **того ж типу**, що і поточна (Dense або Sparse), не прив'язуючись до конкретного підкласу у базовій логіці.\n\nУ класі `Matrix` реалізуйте наступні методи (вони не абстрактні, використовуйте `get`, `set` та `getInstance`):\n* `public Matrix add(Matrix other)` — додавання.\n* `public Matrix subtract(Matrix other)` — віднімання.\n* `public Matrix multiply(Matrix other)` — матричне множення.\n* `public Matrix multiply(float scalar)` — множення на скаляр.\n\nЯкщо розміри матриць не збігаються для операції (наприклад, додавання матриць різних розмірів), викидайте `IllegalArgumentException`.\n"},{title:`5. Етап 4: Алгоритми (2 бали)`,content:`
Створіть клас \`MatrixAlgorithms\` зі статичним методом \`pseudoInverse(Matrix a, int maxIter)\`, який повертає псевдообернену матрицю.
За замовчуванням кількість ітерацій можна вважати 1000. Допустима похибка $\\epsilon = 10^{-7}$. 

Для спрощення, тестуйте лише на квадратних матрицях.

**Алгоритм:**
1. $I$ — одинична матриця того ж розміру, що і $A$.
2. $\\alpha = 1 / (||A||^2)$
3. $A_1 = \\alpha \\cdot A^T$
4. Для $i = 1 \\dots maxIter$:
   - $A_2 = A_1 + A_1 \\cdot (I - A \\cdot A_1)$
   - Якщо $||A_2 - A_1|| < \\epsilon$, перервати цикл.
   - $A_1 = A_2$
5. Повернути $A_2$.
`}],quiz:[{question:"Чому ми додали абстрактний метод `getInstance(rows, cols)` у суперклас?",options:[`Щоб заборонити створення об'єктів`,`Щоб створювати нові матриці того ж типу (Dense/Sparse) під час операцій add/multiply без дублювання коду`,`Тому що абстрактні класи не мають конструкторів`,`Це стандартна вимога для всіх класів Java`],answer:1,explanation:"Метод `getInstance` (паттерн Factory Method) дозволяє реалізувати логіку `add` у суперкласі `Matrix`, який не знає, яку саме реалізацію (Dense чи Sparse) він зараз додає, але може створити правильний тип результату."},{question:`Яка колекція найкраще підходить для збереження елементів у SparseMatrix?`,options:[`ArrayList<Float>`,`Float[][]`,`Map<Point, Float> або Map<String, Float>`,`LinkedList<Float>`],answer:2,explanation:`Map (Словник) ідеально підходить для розріджених матриць, де ключем є координати елемента (x, y), а значенням — саме число. Нулі просто не зберігаються в пам'яті.`}]},se={id:`Lab04`,title:`Лабораторна 4: Менеджер Контактів`,description:`Колекції, Lambda-вирази, Stream API, Comparable/Comparator та обробка винятків на прикладі консольної міні-апки.`,sections:[{title:`Опис завдання`,content:"\nУ цій лабораторній роботі ви створите повноцінну консольну програму — **Менеджер Контактів**. Програма дозволить додавати, шукати, фільтрувати, сортувати та групувати контакти.\n\nЦя лабораторна покриває матеріал **Лекцій 4 і 5**:\n* Інтерфейси `Comparable` та `Comparator` (Лекція 4)\n* Лямбда-вирази та функціональні інтерфейси (`Predicate`, `Function`, `Consumer`) (Лекція 4)\n* Method References (Лекція 4)\n* Java Collections Framework: `List`, `Set`, `Map` (Лекція 4–5)\n* Stream API: `filter`, `map`, `sorted`, `collect` (Лекція 5)\n* `Collectors.groupingBy`, `Collectors.joining` (Лекція 5)\n* Checked та Unchecked Exceptions, створення власних винятків (Лекція 5)\n"},{title:`Task 1: Модель даних (2 бали)`,content:`
### 1.1. Клас \`Contact\`
Створіть клас \`Contact\` у пакеті \`org.example.contacts.model\` з наступними полями:

\`\`\`java
public class Contact implements Comparable<Contact> {
    private final String firstName;
    private final String lastName;
    private final String phone;
    private final String email;
    private final ContactGroup group;

    // Конструктор, гетери, toString()
}
\`\`\`

Зверніть увагу:
* Всі поля \`final\` — об'єкт **іммутабельний** (після створення не може бути змінений).
* Клас реалізує інтерфейс \`Comparable<Contact>\` — метод \`compareTo\` повинен сортувати контакти **за прізвищем**, а при однакових прізвищах — **за ім'ям**.

### 1.2. Enum \`ContactGroup\`
Створіть enum \`ContactGroup\` у тому ж пакеті:

\`\`\`java
public enum ContactGroup {
    FAMILY("Родина"),
    FRIENDS("Друзі"),
    WORK("Робота"),
    UNIVERSITY("Університет"),
    OTHER("Інше");

    private final String displayName;

    ContactGroup(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
\`\`\`

### 1.3. Власний виняток \`DuplicateContactException\`
Створіть клас \`DuplicateContactException\` у пакеті \`org.example.contacts.exception\`:

\`\`\`java
public class DuplicateContactException extends Exception {
    public DuplicateContactException(String message) {
        super(message);
    }
}
\`\`\`

Це **checked exception** (наслідує \`Exception\`). Він буде кидатися при спробі додати контакт з телефоном, який вже існує у базі.

> [!IMPORTANT]
> **Питання для роздумів:** Чому ми використали \`Exception\`, а не \`RuntimeException\`? Тому що дублікат контакту — це ситуація, яку програма **може і повинна** обробити (наприклад, вивести повідомлення користувачу), а не фатальна помилка. Checked exceptions змушують програміста явно обробляти такі випадки.
`},{title:`Task 2: Сервіс управління контактами (3 бали)`,content:`
Створіть клас \`ContactService\` у пакеті \`org.example.contacts.service\`. Цей клас міститиме всю бізнес-логіку.

### Стартовий код (скелет класу):
\`\`\`java
package org.example.contacts.service;

import org.example.contacts.exception.DuplicateContactException;
import org.example.contacts.model.Contact;
import org.example.contacts.model.ContactGroup;

import java.util.*;
import java.util.stream.*;

public class ContactService {
    private final List<Contact> contacts = new ArrayList<>();

    /**
     * Додає контакт до списку.
     * @throws DuplicateContactException якщо контакт з таким номером вже існує.
     */
    public void addContact(Contact contact) throws DuplicateContactException {
        // TODO: Перевірити, чи не існує контакт з таким самим телефоном.
        //       Використайте stream() + anyMatch() з Predicate.
        //       Якщо існує — кинути DuplicateContactException.
        //       Інакше — додати до списку.
    }

    /**
     * Повертає всі контакти, відсортовані природнім порядком (Comparable).
     */
    public List<Contact> getAllSorted() {
        // TODO: Використайте stream() + sorted() + collect(Collectors.toList())
        return List.of();
    }

    /**
     * Шукає контакти за частковим збігом імені або прізвища (case-insensitive).
     */
    public List<Contact> searchByName(String query) {
        // TODO: Використайте stream() + filter() з лямбдою,
        //       яка перевіряє firstName і lastName через toLowerCase().contains()
        return List.of();
    }

    /**
     * Повертає контакти, відсортовані за переданим Comparator.
     * Наприклад: за email, за групою, або за ім'ям у зворотному порядку.
     */
    public List<Contact> getAllSortedBy(Comparator<Contact> comparator) {
        // TODO: Використайте stream() + sorted(comparator) + collect()
        return List.of();
    }

    /**
     * Групує контакти за їхньою групою (ContactGroup).
     * Повертає Map, де ключ — група, значення — список контактів.
     */
    public Map<ContactGroup, List<Contact>> groupByCategory() {
        // TODO: Використайте stream() + Collectors.groupingBy()
        //       з method reference Contact::getGroup
        return Map.of();
    }

    /**
     * Повертає кількість контактів у кожній групі.
     */
    public Map<ContactGroup, Long> countByCategory() {
        // TODO: Використайте Collectors.groupingBy() + Collectors.counting()
        return Map.of();
    }

    /**
     * Повертає всі унікальні email-адреси, зібрані в один рядок через кому.
     */
    public String getAllEmailsAsString() {
        // TODO: Використайте stream() + map(Contact::getEmail)
        //       + distinct() + Collectors.joining(", ")
        return "";
    }

    /**
     * Перевіряє, чи є в базі хоча б один контакт з вказаної групи.
     */
    public boolean hasContactsInGroup(ContactGroup group) {
        // TODO: Використайте stream() + anyMatch()
        return false;
    }

    /**
     * Повертає Optional з контактом, у якого найдовше прізвище.
     */
    public Optional<Contact> findWithLongestLastName() {
        // TODO: Використайте stream() + max() з Comparator.comparingInt(...)
        return Optional.empty();
    }
}
\`\`\`

### Що потрібно реалізувати:
Замініть кожен \`// TODO\` на робочу імплементацію з використанням **Stream API**, **лямбда-виразів** та **method references**.

> [!TIP]
> Намагайтеся використовувати **method references** (\`Contact::getEmail\`, \`String::toLowerCase\`) там, де це можливо, замість повних лямбда-виразів. Це робить код компактнішим і читабельнішим.
`},{title:`Task 3: Консольний інтерфейс (2 бали)`,content:`
Створіть клас \`Main\` у пакеті \`org.example.contacts\` з інтерактивним меню:

\`\`\`java
public class Main {
    public static void main(String[] args) {
        ContactService service = new ContactService();
        Scanner scanner = new Scanner(System.in);

        // Наповнити початковими даними (seed)
        seedData(service);

        while (true) {
            System.out.println("\\n=== Менеджер Контактів ===");
            System.out.println("1. Показати всі контакти");
            System.out.println("2. Додати контакт");
            System.out.println("3. Пошук за ім'ям");
            System.out.println("4. Сортувати за...");
            System.out.println("5. Групувати за категорією");
            System.out.println("6. Статистика");
            System.out.println("0. Вихід");
            System.out.print("Ваш вибір: ");

            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1" -> showAll(service);
                case "2" -> addContact(service, scanner);
                case "3" -> search(service, scanner);
                case "4" -> sortMenu(service, scanner);
                case "5" -> groupByCategory(service);
                case "6" -> showStats(service);
                case "0" -> {
                    System.out.println("До побачення!");
                    return;
                }
                default -> System.out.println("Невідома команда.");
            }
        }
    }
}
\`\`\`

### Реалізація пунктів меню:

**Пункт 2 — Додати контакт.** Запитайте у користувача ім'я, прізвище, телефон, email та групу. Для вибору групи виведіть список із \`ContactGroup.values()\`. Оберніть виклик \`service.addContact()\` у блок \`try-catch (DuplicateContactException e)\`, щоб вивести зрозуміле повідомлення замість краху програми.

**Пункт 4 — Сортувати за...** Покажіть підменю:
\`\`\`
  a) За прізвищем (натуральний порядок — Comparable)
  b) За email
  c) За групою, потім за прізвищем
\`\`\`
Для варіанту *b* передайте \`Comparator.comparing(Contact::getEmail)\`.
Для варіанту *c* використайте ланцюговий компаратор:
\`\`\`java
Comparator.comparing(Contact::getGroup)
          .thenComparing(Contact::getLastName)
\`\`\`

**Пункт 5 — Групувати за категорією.** Викличте \`service.groupByCategory()\` і виведіть результат у форматі:
\`\`\`
--- Робота ---
  Петренко Олег — +380501234567
  Іванова Марія — +380671112233
--- Родина ---
  Каменчук Андрій — +380931234567
\`\`\`
Для форматування використайте \`forEach\` на \`Map\` з лямбдою.

**Пункт 6 — Статистика.** Виведіть:
* Загальну кількість контактів (\`contacts.size()\`).
* Кількість контактів у кожній групі (\`countByCategory()\`).
* Список усіх email через кому (\`getAllEmailsAsString()\`).
* Контакт з найдовшим прізвищем (\`findWithLongestLastName()\` — зверніть увагу, що повертається \`Optional\`, тому використайте \`ifPresentOrElse\`).

### Початкові дані (seed):
Створіть метод \`seedData\`, який додає 6–8 тестових контактів у різних групах, щоб не вводити їх вручну при кожному запуску:
\`\`\`java
private static void seedData(ContactService service) {
    try {
        service.addContact(new Contact("Олег", "Петренко", "+380501234567",
            "oleg@work.com", ContactGroup.WORK));
        service.addContact(new Contact("Марія", "Іванова", "+380671112233",
            "maria@gmail.com", ContactGroup.FRIENDS));
        service.addContact(new Contact("Андрій", "Каменчук", "+380931234567",
            "andrii@family.com", ContactGroup.FAMILY));
        service.addContact(new Contact("Катерина", "Бондаренко", "+380661234567",
            "katya@uni.edu", ContactGroup.UNIVERSITY));
        service.addContact(new Contact("Дмитро", "Шевченко", "+380991234567",
            "dmytro@work.com", ContactGroup.WORK));
        service.addContact(new Contact("Юлія", "Коваленко", "+380731234567",
            "yulia@gmail.com", ContactGroup.FRIENDS));
    } catch (DuplicateContactException e) {
        System.err.println("Помилка ініціалізації: " + e.getMessage());
    }
}
\`\`\`
`},{title:`Task 4: Додаткові завдання (3 бали)`,content:`
### 4.1. Валідація вхідних даних (1 бал)
Створіть клас \`ContactValidator\` з методом:
\`\`\`java
public static void validate(String firstName, String lastName,
                             String phone, String email)
                             throws InvalidContactDataException { ... }
\`\`\`

Створіть новий **unchecked exception** \`InvalidContactDataException\` (наслідує \`RuntimeException\`). Метод повинен перевіряти:
* Ім'я та прізвище не можуть бути порожніми (\`isBlank()\`).
* Телефон повинен починатися з \`+\` і містити лише цифри (перевірте за допомогою \`String.matches("\\\\+\\\\d+")\`).
* Email повинен містити символ \`@\`.

> [!IMPORTANT]
> **Чому тут \`RuntimeException\`?** Тому що некоректні дані від користувача — це **помилка програмування** (або UI), яку не завжди є сенс обробляти через \`try-catch\`. Це ілюструє різницю між checked та unchecked exceptions з Лекції 5.

### 4.2. Функціональний фільтр (1 бал)
Додайте метод у \`ContactService\`, який приймає довільний фільтр як параметр:
\`\`\`java
public List<Contact> filterBy(Predicate<Contact> predicate) {
    return contacts.stream()
                   .filter(predicate)
                   .collect(Collectors.toList());
}
\`\`\`

Використайте його у \`Main\` для створення складних фільтрів:
\`\`\`java
// Знайти всіх з групи WORK, чий email містить "work"
Predicate<Contact> workFilter = c -> c.getGroup() == ContactGroup.WORK;
Predicate<Contact> emailFilter = c -> c.getEmail().contains("work");

// Комбінуємо предикати через .and()
List<Contact> result = service.filterBy(workFilter.and(emailFilter));
\`\`\`

### 4.3. Трансформація та експорт (1 бал)
Додайте метод, який перетворює список контактів у список рядків у форматі CSV:
\`\`\`java
public List<String> exportToCsv() {
    return contacts.stream()
        .sorted()
        .map(c -> String.join(",",
            c.getFirstName(),
            c.getLastName(),
            c.getPhone(),
            c.getEmail(),
            c.getGroup().name()))
        .collect(Collectors.toList());
}
\`\`\`

Додайте пункт меню "7. Експорт у CSV", який виведе результат у консоль (кожен рядок — один контакт). У наступних лабораторних ми навчимося записувати це у файл.
`},{title:`Структура проекту`,content:`
Фінальна структура вашого проекту повинна мати вигляд:
\`\`\`
ContactManager/
├── pom.xml
└── src/
    ├── main/java/org/example/contacts/
    │   ├── Main.java
    │   ├── model/
    │   │   ├── Contact.java
    │   │   └── ContactGroup.java
    │   ├── service/
    │   │   └── ContactService.java
    │   └── exception/
    │       ├── DuplicateContactException.java
    │       └── InvalidContactDataException.java
    └── test/java/org/example/contacts/
        └── service/
            └── ContactServiceTest.java  (бонус)
\`\`\`

> [!TIP]
> **Бонусне завдання:** Напишіть 3–4 модульних тести для \`ContactService\` (з використанням JUnit 5, який ви вивчили у Лабораторній 2). Наприклад:
> * \`addContact_DuplicatePhone_ThrowsException\` — перевірка, що при додаванні дубліката кидається виняток (\`assertThrows\`).
> * \`searchByName_PartialMatch_ReturnsResults\` — перевірка пошуку.
> * \`groupByCategory_ReturnsCorrectGroups\` — перевірка групування.
`}],quiz:[{question:"Чим відрізняється `Comparable` від `Comparator`?",options:[`Comparable визначає природній порядок сортування ВСЕРЕДИНІ самого класу (метод compareTo), а Comparator — це ЗОВНІШНІЙ об'єкт, який задає альтернативний порядок (метод compare)`,`Comparable працює тільки зі String, а Comparator — з будь-яким типом`,`Comparable — це клас, а Comparator — інтерфейс`,`Різниці немає, це синоніми`],answer:0,explanation:`Comparable<T> реалізується самим класом і визначає його 'натуральний' порядок (наприклад, прізвище). Comparator<T> — це окремий об'єкт, який можна створити через лямбду для будь-якого альтернативного сортування (наприклад, за email чи за групою).`},{question:"Що робить метод `Collectors.groupingBy(Contact::getGroup)`?",options:[`Сортує контакти за групою`,`Видаляє дублікати груп`,`Створює Map<ContactGroup, List<Contact>>, де ключ — група, а значення — список контактів цієї групи`,`Фільтрує контакти, залишаючи лише ті, що мають групу`],answer:2,explanation:`Collectors.groupingBy() — це термінальна операція Stream, яка розподіляє елементи по групах, створюючи Map. Method reference Contact::getGroup вказує, за яким полем групувати.`},{question:`Що станеться, якщо не обробити DuplicateContactException (checked exception) у коді?`,options:[`Програма скомпілюється, але впаде при запуску`,`Код не скомпілюється — компілятор Java ВИМАГАЄ обробити checked exceptions через try-catch або throws`,`Нічого, checked exceptions ігноруються автоматично`,`Компілятор видасть попередження (warning), але код скомпілюється`],answer:1,explanation:`Це ключова відмінність checked exceptions від unchecked (RuntimeException). Компілятор Java змушує програміста явно вказати, що він обробляє цей виняток (try-catch) або передає його далі (throws у сигнатурі методу).`},{question:`Як правильно скомбінувати два предикати, щоб знайти контакти з групи WORK, чий email містить 'work'?`,options:[`workFilter.and(emailFilter)`,`workFilter + emailFilter`,`Predicate.combine(workFilter, emailFilter)`,`workFilter && emailFilter`],answer:0,explanation:`Інтерфейс Predicate<T> має default-методи and(), or(), negate(), які дозволяють комбінувати предикати в складні умови без написання нових лямбд.`}]},ce=[d,f,p,m,h,g,_,v,y,b,x,ee,S,C,te,ne,re,w],le=[ie,ae,oe,se],ue=e((e=>{var t=Symbol.for(`react.transitional.element`);function n(e,n,r){var i=null;if(r!==void 0&&(i=``+r),n.key!==void 0&&(i=``+n.key),`key`in n)for(var a in r={},n)a!==`key`&&(r[a]=n[a]);else r=n;return n=r.ref,{$$typeof:t,type:e,key:i,ref:n===void 0?null:n,props:r}}e.jsx=n,e.jsxs=n})),T=e(((e,t)=>{t.exports=ue()}))(),E={ua:{title:`Гайд по Java`,subtitle:`Курс лекцій на базі навчальної програми MiNI PW`,searchPlaceholder:`Пошук тем, коду чи ключових слів...`,progress:`Прогрес вивчення`,completed:`Вивчено`,notCompleted:`Позначити як вивчене`,quizTitle:`Тест для самоперевірки`,quizSubmit:`Перевірити відповіді`,quizReset:`Пройти тест знову`,quizCorrect:`Вірно!`,quizIncorrect:`Є помилки. Спробуйте ще раз.`,prev:`Назад`,next:`Вперед`,noLecturesFound:`Лекцій не знайдено за вашим запитом`,author:`Розроблено на основі матеріалів факультету MiNI PW • Адаптовано для Java`,markAllRead:`Позначити все як вивчене`,resetProgress:`Скинути прогрес`,infoTitle:`Корисна примітка`,copied:`Скопійовано!`,copy:`Копіювати`,quizScore:`Ваш результат`,closeQuiz:`Закрити`,questions:`питання`},pl:{title:`Przewodnik po Javie`,subtitle:`Kurs wykładów oparty na programie MiNI PW`,searchPlaceholder:`Szukaj tematów, kodu lub słów kluczowych...`,progress:`Postęp nauki`,completed:`Ukończono`,notCompleted:`Oznacz jako ukończone`,quizTitle:`Test sprawdzający`,quizSubmit:`Sprawdź odpowiedzi`,quizReset:`Rozwiąż ponownie`,quizCorrect:`Poprawnie!`,quizIncorrect:`Są błędy. Spróbuj ponownie.`,prev:`Poprzedni`,next:`Następny`,noLecturesFound:`Nie znaleziono wykładów spełniających kryteria`,author:`Opracowane na podstawie materiałów Wydziału MiNI PW • Adaptacja do Java`,markAllRead:`Oznacz wszystkie jako przeczytane`,resetProgress:`Resetuj postęp`,infoTitle:`Ważna uwaga`,copied:`Skopiowano!`,copy:`Kopiuj`,quizScore:`Twój wynik`,closeQuiz:`Zamknij`,questions:`pytania`},en:{title:`Java Guide`,subtitle:`Lecture course based on the MiNI PW syllabus`,searchPlaceholder:`Search topics, code, or keywords...`,progress:`Learning Progress`,completed:`Completed`,notCompleted:`Mark as completed`,quizTitle:`Knowledge Check Quiz`,quizSubmit:`Verify Answers`,quizReset:`Retake Quiz`,quizCorrect:`Correct!`,quizIncorrect:`Incorrect answers. Try again.`,prev:`Previous`,next:`Next`,noLecturesFound:`No lectures matched your query`,author:`Developed based on MiNI PW materials • Adapted for Java`,markAllRead:`Mark all as read`,resetProgress:`Reset progress`,infoTitle:`Important Note`,copied:`Copied!`,copy:`Copy`,quizScore:`Your score`,closeQuiz:`Close`,questions:`questions`}};function de(){let[e,t]=(0,l.useState)(`01`),[n,r]=(0,l.useState)(``),[i,a]=(0,l.useState)(`ua`),[o,s]=(0,l.useState)(`dark`),[c,u]=(0,l.useState)(()=>{let e=localStorage.getItem(`java_guide_completed`);return e?JSON.parse(e):{}}),[d,f]=(0,l.useState)({}),[p,m]=(0,l.useState)({}),[h,g]=(0,l.useState)(null);(0,l.useEffect)(()=>{localStorage.setItem(`java_guide_completed`,JSON.stringify(c))},[c]),(0,l.useEffect)(()=>{document.documentElement.setAttribute(`data-theme`,o)},[o]);let _=[...ce,...le],v=_.find(t=>t.id===e)||_[0],y=e=>{u(t=>({...t,[e]:!t[e]}))},b=()=>{window.confirm(i===`ua`?`Ви впевнені, що хочете скинути весь прогрес?`:`Czy na pewno chcesz zresetować cały postęp?`)&&(u({}),f({}),m({}))},x=()=>{let e={};_.forEach(t=>{e[t.id]=!0}),u(e)},ee=Math.round(Object.keys(c).filter(e=>c[e]).length/_.length*100),S=_.filter(e=>{let t=n.toLowerCase();return e.title.toLowerCase().includes(t)||e.description.toLowerCase().includes(t)||e.sections.some(e=>e.title.toLowerCase().includes(t)||e.content.toLowerCase().includes(t))}),C=e=>{t(e),window.scrollTo({top:0,behavior:`smooth`})},te=()=>{let t=_.findIndex(t=>t.id===e);t>0&&C(_[t-1].id)},ne=()=>{let t=_.findIndex(t=>t.id===e);t<_.length-1&&C(_[t+1].id)},re=(t,n)=>{p[e]||f(r=>({...r,[`${e}_${t}`]:n}))},w=()=>{m(t=>({...t,[e]:!0}))},ie=()=>{m(t=>({...t,[e]:!1})),f(t=>{let n={...t};return v.quiz.forEach((t,r)=>{delete n[`${e}_${r}`]}),n})},ae=(e,t)=>{let n=e.split(`
`),r=0,a=!1,o=[],s=`java`,c=[],l=!1,u=[],d=()=>{u.length>0&&(c.push((0,T.jsx)(`ul`,{className:`content-list`,children:u},`list-${t}-${r++}`)),u=[],l=!1)},f=e=>{let t=e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`);return t=t.replace(/\*\*(.*?)\*\*/g,`<strong>$1</strong>`),t=t.replace(/`(.*?)`/g,`<code>$1</code>`),(0,T.jsx)(`span`,{dangerouslySetInnerHTML:{__html:t}})};for(let e=0;e<n.length;e++){let p=n[e].trim();if(p.startsWith("```")){if(a){let e=o.join(`
`),n=r++;c.push((0,T.jsxs)(`div`,{className:`code-block-wrapper`,children:[(0,T.jsxs)(`div`,{className:`code-block-header`,children:[(0,T.jsx)(`span`,{className:`code-lang-label`,children:s}),(0,T.jsx)(`button`,{className:`code-copy-btn`,onClick:()=>{navigator.clipboard.writeText(e),g(`${t}-${n}`),setTimeout(()=>g(null),1500)},children:h===`${t}-${n}`?E[i].copied:E[i].copy})]}),(0,T.jsx)(`pre`,{className:`code-pre`,children:(0,T.jsx)(`code`,{className:`code-content`,children:e})})]},`code-${t}-${n}`)),o=[],a=!1}else d(),s=p.replace("```",``)||`java`,a=!0;continue}if(a){o.push(n[e]);continue}if(p.startsWith(`* `)){l=!0,u.push((0,T.jsx)(`li`,{className:`content-list-item`,children:f(p.substring(2))},`li-${t}-${e}`));continue}else l&&p!==``&&(p.startsWith(`* `)||d());if(!(p.startsWith(`|`)&&(p.includes(`---`)||p.includes(`:---`)))){if(p.startsWith(`|`)&&p.endsWith(`|`)){d();let r=p.split(`|`).map(e=>e.trim()).filter((e,t,n)=>t>0&&t<n.length-1),i=e>0&&n[e-1].includes(`---`);c.push((0,T.jsx)(`div`,{className:`table-row-grid ${i?`table-header`:``}`,children:r.map((e,t)=>(0,T.jsx)(`div`,{className:`table-cell`,children:f(e)},`cell-${t}`))},`tr-${t}-${e}`));continue}if(p.startsWith(`> [!`)){d();let r=p.match(/> \[!(.*?)\]/)?.[1]||`NOTE`,i=[],a=e+1;for(;a<n.length&&n[a].trim().startsWith(`>`);)i.push(n[a].trim().replace(/^>\s?/,``)),a++;e=a-1,c.push((0,T.jsxs)(`div`,{className:`alert-box alert-${r.toLowerCase()}`,children:[(0,T.jsxs)(`div`,{className:`alert-badge`,children:[(0,T.jsxs)(`span`,{className:`alert-icon`,children:[r===`IMPORTANT`&&`⚠️`,r===`WARNING`&&`🔥`,r===`CAUTION`&&`🛑`,r===`NOTE`&&`💡`,r===`TIP`&&`✨`]}),(0,T.jsx)(`span`,{className:`alert-label`,children:r})]}),(0,T.jsx)(`div`,{className:`alert-text-body`,children:f(i.join(` `))})]},`alert-${t}-${e}`));continue}if(p.startsWith(`### `)){d(),c.push((0,T.jsx)(`h4`,{className:`section-h4`,children:f(p.substring(4))},`h4-${t}-${e}`));continue}p!==``&&(d(),c.push((0,T.jsx)(`p`,{className:`content-paragraph`,children:f(p)},`p-${t}-${e}`)))}}return d(),c},oe=v.quiz?v.quiz.length:0,se=0;return v.quiz&&v.quiz.forEach((t,n)=>{d[`${e}_${n}`]===t.answer&&se++}),(0,T.jsxs)(`div`,{className:`app-container`,children:[(0,T.jsxs)(`aside`,{className:`sidebar`,children:[(0,T.jsxs)(`div`,{className:`sidebar-header`,children:[(0,T.jsxs)(`div`,{className:`title-area`,children:[(0,T.jsx)(`span`,{className:`logo-badge`,children:`JVM`}),(0,T.jsx)(`h2`,{children:E[i].title})]}),(0,T.jsx)(`p`,{className:`subtitle`,children:E[i].subtitle})]}),(0,T.jsxs)(`div`,{className:`progress-card`,children:[(0,T.jsxs)(`div`,{className:`progress-labels`,children:[(0,T.jsx)(`span`,{className:`progress-title`,children:E[i].progress}),(0,T.jsxs)(`span`,{className:`progress-percentage`,children:[ee,`%`]})]}),(0,T.jsx)(`div`,{className:`progress-track-bar`,children:(0,T.jsx)(`div`,{className:`progress-fill-bar`,style:{width:`${ee}%`}})}),(0,T.jsxs)(`div`,{className:`progress-buttons`,children:[(0,T.jsx)(`button`,{className:`small-action-btn`,onClick:x,children:E[i].markAllRead}),(0,T.jsx)(`button`,{className:`small-action-btn btn-danger`,onClick:b,children:E[i].resetProgress})]})]}),(0,T.jsxs)(`div`,{className:`search-box-wrapper`,children:[(0,T.jsx)(`input`,{type:`text`,className:`search-input`,placeholder:E[i].searchPlaceholder,value:n,onChange:e=>r(e.target.value)}),n&&(0,T.jsx)(`button`,{className:`clear-search-btn`,onClick:()=>r(``),children:`×`})]}),(0,T.jsx)(`nav`,{className:`lecture-nav`,children:(0,T.jsxs)(`ul`,{className:`lecture-list`,children:[S.map(t=>{let n=t.id===e,r=c[t.id],i=t.id.startsWith(`Lab`),a=i?t.id:`Wykład ${t.id}`,o=i?t.title.replace(/^Лабораторна \d+:\s?/,``):t.title.replace(/^Wykład \d+:\s?/,``);return(0,T.jsxs)(`li`,{className:`lecture-item ${n?`active`:``} ${r?`completed`:``} ${i?`lab-item`:``}`,onClick:()=>C(t.id),children:[(0,T.jsx)(`div`,{className:`lecture-item-checkbox`,children:(0,T.jsx)(`span`,{className:`chk-mark`,children:r?`✓`:``})}),(0,T.jsxs)(`div`,{className:`lecture-item-content`,children:[(0,T.jsx)(`span`,{className:`lecture-badge`,children:a}),(0,T.jsx)(`span`,{className:`lecture-title-text`,children:o})]})]},t.id)}),S.length===0&&(0,T.jsx)(`p`,{className:`no-results-msg`,children:E[i].noLecturesFound})]})})]}),(0,T.jsxs)(`main`,{className:`main-content`,children:[(0,T.jsxs)(`header`,{className:`main-header`,children:[(0,T.jsxs)(`div`,{className:`header-breadcrumbs`,children:[(0,T.jsx)(`span`,{children:E[i].title}),(0,T.jsx)(`span`,{className:`divider`,children:`/`}),(0,T.jsx)(`span`,{className:`active-breadcrumb`,children:v.title.split(`:`)[0]})]}),(0,T.jsxs)(`div`,{className:`controls-group`,children:[(0,T.jsx)(`div`,{className:`lang-selector`,children:[`ua`,`pl`,`en`].map(e=>(0,T.jsx)(`button`,{className:`lang-btn ${i===e?`active`:``}`,onClick:()=>a(e),children:e.toUpperCase()},e))}),(0,T.jsx)(`button`,{className:`theme-toggle-btn`,onClick:()=>s(o===`dark`?`light`:`dark`),children:o===`dark`?`☀️`:`🌙`})]})]}),(0,T.jsxs)(`article`,{className:`lecture-article`,children:[(0,T.jsxs)(`div`,{className:`lecture-hero-card`,children:[(0,T.jsxs)(`span`,{className:`hero-badge`,children:[i===`ua`?`Навчальний модуль`:i===`pl`?`Moduł edukacyjny`:`Lecture Module`,` `,v.id]}),(0,T.jsx)(`h1`,{className:`hero-lecture-title`,children:v.title}),(0,T.jsx)(`p`,{className:`hero-lecture-desc`,children:v.description}),(0,T.jsx)(`div`,{className:`article-meta-row`,children:(0,T.jsxs)(`button`,{className:`complete-toggle-btn ${c[v.id]?`btn-completed`:``}`,onClick:()=>y(v.id),children:[(0,T.jsx)(`span`,{className:`btn-icon`,children:c[v.id]?`✓`:`◯`}),(0,T.jsx)(`span`,{children:c[v.id]?E[i].completed:E[i].notCompleted})]})})]}),(0,T.jsx)(`div`,{className:`lecture-body`,children:v.sections.map((e,t)=>(0,T.jsxs)(`section`,{className:`lecture-section-card`,children:[(0,T.jsx)(`h3`,{className:`section-title-h3`,children:e.title}),(0,T.jsx)(`div`,{className:`section-content-body`,children:ae(e.content,t)})]},`sec-${t}`))}),v.quiz&&v.quiz.length>0&&(0,T.jsxs)(`section`,{className:`quiz-section-card`,children:[(0,T.jsxs)(`div`,{className:`quiz-header`,children:[(0,T.jsx)(`span`,{className:`quiz-badge`,children:`⚡ QUIZ`}),(0,T.jsx)(`h3`,{className:`quiz-title-h3`,children:E[i].quizTitle})]}),(0,T.jsx)(`div`,{className:`quiz-questions-list`,children:v.quiz.map((t,n)=>{let r=d[`${e}_${n}`],a=p[e];return(0,T.jsxs)(`div`,{className:`quiz-question-item`,children:[(0,T.jsxs)(`p`,{className:`quiz-question-text`,children:[(0,T.jsxs)(`span`,{className:`question-number`,children:[n+1,`.`]}),` `,t.question]}),(0,T.jsx)(`div`,{className:`quiz-options-grid`,children:t.options.map((e,i)=>{let o=``;return r===i&&(o=`option-selected`),a&&(o=i===t.answer?`option-correct`:r===i?`option-incorrect`:`option-disabled`),(0,T.jsxs)(`button`,{className:`quiz-option-btn ${o}`,disabled:a,onClick:()=>re(n,i),children:[(0,T.jsxs)(`span`,{className:`option-letter`,children:[String.fromCharCode(65+i),`.`]}),(0,T.jsx)(`span`,{className:`option-text`,children:e})]},`opt-${i}`)})}),a&&r===t.answer&&(0,T.jsx)(`div`,{className:`feedback-box feedback-success`,children:(0,T.jsxs)(`p`,{children:[(0,T.jsx)(`strong`,{children:E[i].quizCorrect}),` `,t.explanation]})}),a&&r!==t.answer&&(0,T.jsx)(`div`,{className:`feedback-box feedback-danger`,children:(0,T.jsxs)(`p`,{children:[(0,T.jsx)(`strong`,{children:E[i].quizIncorrect}),` `,t.explanation]})})]},`q-${n}`)})}),(0,T.jsx)(`div`,{className:`quiz-actions-footer`,children:p[e]?(0,T.jsxs)(`div`,{className:`quiz-result-score-row`,children:[(0,T.jsxs)(`span`,{className:`score-label`,children:[E[i].quizScore,`: `,(0,T.jsxs)(`strong`,{children:[se,` / `,oe]})]}),(0,T.jsx)(`button`,{className:`quiz-secondary-btn`,onClick:ie,children:E[i].quizReset})]}):(0,T.jsx)(`button`,{className:`quiz-primary-btn`,disabled:v.quiz.some((t,n)=>d[`${e}_${n}`]===void 0),onClick:w,children:E[i].quizSubmit})})]}),(0,T.jsxs)(`footer`,{className:`article-navigation-footer`,children:[(0,T.jsxs)(`button`,{className:`footer-nav-btn`,disabled:_.findIndex(t=>t.id===e)===0,onClick:te,children:[`← `,E[i].prev]}),(0,T.jsxs)(`button`,{className:`footer-nav-btn`,disabled:_.findIndex(t=>t.id===e)===_.length-1,onClick:ne,children:[E[i].next,` →`]})]})]}),(0,T.jsx)(`footer`,{className:`main-footer-credit`,children:(0,T.jsx)(`p`,{children:E[i].author})})]})]})}(0,u.createRoot)(document.getElementById(`root`)).render((0,T.jsx)(l.StrictMode,{children:(0,T.jsx)(de,{})}));