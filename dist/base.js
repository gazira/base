define("#base/0.9.16/aspect",[],function(require,exports){function weave(when,methodName,callback,context){var names=methodName.split(eventSplitter),name,method;while(name=names.shift())method=getMethod(this,name),method.__isAspected||wrap.call(this,name),this.on(when+":"+name,callback,context);return this}function getMethod(host,methodName){var method=host[methodName];if(!method)throw new Error("Invalid method name: "+methodName);return method}function wrap(methodName){var old=this[methodName];this[methodName]=function(){var args=Array.prototype.slice.call(arguments),beforeArgs=["before:"+methodName].concat(args);this.trigger.apply(this,beforeArgs);var ret=old.apply(this,arguments);return this.trigger("after:"+methodName,ret),ret},this[methodName].__isAspected=!0}exports.before=function(methodName,callback,context){return weave.call(this,"before",methodName,callback,context)},exports.after=function(methodName,callback,context){return weave.call(this,"after",methodName,callback,context)};var eventSplitter=/\s+/}),define("#base/0.9.16/attribute",[],function(require,exports){function isString(val){return toString.call(val)==="[object String]"}function isFunction(val){return toString.call(val)==="[object Function]"}function isPlainObject(o){return o&&toString.call(o)==="[object Object]"&&"isPrototypeOf"in o}function isEmptyObject(o){for(var p in o)if(o.hasOwnProperty(p))return!1;return!0}function merge(receiver,supplier){var key,value;for(key in supplier)supplier.hasOwnProperty(key)&&(value=supplier[key],isArray(value)?value=value.slice():isPlainObject(value)&&(value=merge(receiver[key]||{},value)),receiver[key]=value);return receiver}function ucfirst(str){return str.charAt(0).toUpperCase()+str.substring(1)}function getInheritedAttrs(instance,specialProps){var inherited=[],proto=instance.constructor.prototype;while(proto)proto.hasOwnProperty("attrs")||(proto.attrs={}),copySpecialProps(specialProps,proto.attrs,proto),isEmptyObject(proto.attrs)||inherited.unshift(proto.attrs),proto=proto.constructor.superclass;var result={};for(var i=0,len=inherited.length;i<len;i++)result=merge(result,normalize(inherited[i]));return result}function copySpecialProps(specialProps,receiver,supplier,isAttr2Prop){for(var i=0,len=specialProps.length;i<len;i++){var key=specialProps[i];if(supplier.hasOwnProperty(key)){var val=supplier[key];receiver[key]=isAttr2Prop?receiver.get(key):val}}}function parseEventsFromInstance(host,attrs){for(var attr in attrs)if(attrs.hasOwnProperty(attr)){var m="_onChange"+ucfirst(attr);host[m]&&host.on("change:"+attr,host[m])}}function parseEventsFromAttrs(host,attrs){for(var key in attrs)if(attrs.hasOwnProperty(key)){var value=attrs[key].value,m;isFunction(value)&&(m=key.match(EVENT_PATTERN))&&(host[m[1]](getEventName(m[2]),value),delete attrs[key])}}function getEventName(name){var m=name.match(EVENT_NAME_PATTERN),ret=m[1]?"change:":"";return ret+=m[2].toLowerCase()+m[3],ret}function setSetterAttrs(host,attrs,userValues){var options={silent:!0};host.__initializingAttrs=!0;for(var key in userValues)userValues.hasOwnProperty(key)&&attrs[key].setter&&host.set(key,userValues[key].value,options);delete host.__initializingAttrs}function normalize(attrs){attrs=merge({},attrs);for(var key in attrs){var attr=attrs[key];if(isPlainObject(attr)&&hasOwnProperties(attr,ATTR_SPECIAL_KEYS))continue;attrs[key]={value:attr}}return attrs}function hasOwnProperties(object,properties){for(var i=0,len=properties.length;i<len;i++)if(object.hasOwnProperty(properties[i]))return!0;return!1}function isEmptyAttrValue(o){return o==null||(isString(o)||isArray(o))&&o.length===0||isPlainObject(o)&&isEmptyObject(o)}function isEqual(a,b){if(a===b)return!0;if(isEmptyAttrValue(a)&&isEmptyAttrValue(b))return!0;var className=toString.call(a);if(className!=toString.call(b))return!1;switch(className){case"[object String]":return a==String(b);case"[object Number]":return a!=+a?b!=+b:a==0?1/a==1/b:a==+b;case"[object Date]":case"[object Boolean]":return+a==+b;case"[object RegExp]":return a.source==b.source&&a.global==b.global&&a.multiline==b.multiline&&a.ignoreCase==b.ignoreCase;case"[object Array]":var aString=a.toString(),bString=b.toString();return aString.indexOf("[object")===-1&&bString.indexOf("[object")===-1&&aString===bString}if(typeof a!="object"||typeof b!="object")return!1;if(isPlainObject(a)&&isPlainObject(b)){if(!isEqual(keys(a),keys(b)))return!1;for(var p in a)if(a[p]!==b[p])return!1;return!0}return!1}exports.initAttrs=function(config,dataAttrsConfig){dataAttrsConfig&&(config=config?merge(dataAttrsConfig,config):dataAttrsConfig);var specialProps=this.propsInAttrs||[],attrs,inheritedAttrs,userValues;inheritedAttrs=getInheritedAttrs(this,specialProps),attrs=merge({},inheritedAttrs),config&&(userValues=normalize(config),merge(attrs,userValues)),parseEventsFromInstance(this,attrs),this.attrs=attrs,setSetterAttrs(this,attrs,userValues),parseEventsFromAttrs(this,attrs),copySpecialProps(specialProps,this,this.attrs,!0)},exports.get=function(key){var attr=this.attrs[key]||{},val=attr.value;return attr.getter?attr.getter.call(this,val,key):val},exports.set=function(key,val,options){var attrs={};isString(key)?attrs[key]=val:(attrs=key,options=val),options||(options={});var silent=options.silent,now=this.attrs,changed=this.__changedAttrs||(this.__changedAttrs={});for(key in attrs){if(!attrs.hasOwnProperty(key))continue;var attr=now[key]||(now[key]={});val=attrs[key];if(attr.readOnly)throw new Error("This attribute is readOnly: "+key);if(attr.validator){var ex=attr.validator.call(this,val,key);if(ex!==!0){options.error&&options.error.call(this,ex);continue}}attr.setter&&(val=attr.setter.call(this,val,key));var prev=this.get(key);isPlainObject(prev)&&isPlainObject(val)&&(val=merge(merge({},prev),val)),now[key].value=val,!this.__initializingAttrs&&!isEqual(prev,val)&&(silent?changed[key]=[val,prev]:this.trigger("change:"+key,val,prev,key))}return this},exports.change=function(){var changed=this.__changedAttrs;if(changed){for(var key in changed)if(changed.hasOwnProperty(key)){var args=changed[key];this.trigger("change:"+key,args[0],args[1],key)}delete this.__changedAttrs}return this};var toString=Object.prototype.toString,isArray=Array.isArray||function(val){return toString.call(val)==="[object Array]"},keys=Object.keys;keys||(keys=function(o){var result=[];for(var name in o)o.hasOwnProperty(name)&&result.push(name);return result});var EVENT_PATTERN=/^(on|before|after)([A-Z].*)$/,EVENT_NAME_PATTERN=/^(Change)?([A-Z])(.*)/,ATTR_SPECIAL_KEYS=["value","getter","setter","validator","readOnly"]}),define("#base/0.9.16/base",["./aspect","./attribute","#events/0.9.1/events","#class/0.9.2/class"],function(require,exports,module){var Class=require("#class/0.9.2/class"),Events=require("#events/0.9.1/events"),Aspect=require("./aspect"),Attribute=require("./attribute"),Base=Class.create({Implements:[Events,Aspect,Attribute],initialize:function(config){this.initAttrs(config)},destroy:function(){this.off();for(var p in this)this.hasOwnProperty(p)&&delete this[p]}});module.exports=Base});