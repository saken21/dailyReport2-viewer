(function () { "use strict";
var DateTools = function() { };
DateTools.__name__ = true;
DateTools.delta = function(d,t) {
	var t1 = d.getTime() + t;
	var d1 = new Date();
	d1.setTime(t1);
	return d1;
};
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = true;
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw "EReg::matched";
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.dateStr = function(date) {
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var mi = date.getMinutes();
	var s = date.getSeconds();
	return date.getFullYear() + "-" + (m < 10?"0" + m:"" + m) + "-" + (d < 10?"0" + d:"" + d) + " " + (h < 10?"0" + h:"" + h) + ":" + (mi < 10?"0" + mi:"" + mi) + ":" + (s < 10?"0" + s:"" + s);
};
HxOverrides.strDate = function(s) {
	var _g = s.length;
	switch(_g) {
	case 8:
		var k = s.split(":");
		var d = new Date();
		d.setTime(0);
		d.setUTCHours(k[0]);
		d.setUTCMinutes(k[1]);
		d.setUTCSeconds(k[2]);
		return d;
	case 10:
		var k1 = s.split("-");
		return new Date(k1[0],k1[1] - 1,k1[2],0,0,0);
	case 19:
		var k2 = s.split(" ");
		var y = k2[0].split("-");
		var t = k2[1].split(":");
		return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
	default:
		throw "Invalid date format : " + s;
	}
};
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
HxOverrides.remove = function(a,obj) {
	var i = HxOverrides.indexOf(a,obj,0);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Lambda = function() { };
Lambda.__name__ = true;
Lambda.exists = function(it,f) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) return true;
	}
	return false;
};
Lambda.filter = function(it,f) {
	var l = new List();
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) l.add(x);
	}
	return l;
};
var List = function() {
	this.length = 0;
};
List.__name__ = true;
List.prototype = {
	add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,push: function(item) {
		var x = [item,this.h];
		this.h = x;
		if(this.q == null) this.q = x;
		this.length++;
	}
	,iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
};
var Main = function() { };
Main.__name__ = true;
Main.main = function() {
	new js.JQuery("document").ready(Manager.init);
};
var Manager = function() { };
Manager.__name__ = true;
Manager.init = function(event) {
	view.Login.init();
	view.SimpleBoard.init();
	view.ReportViewer.init();
	view.Information.init();
	view.StarChecker.init();
	jp.saken.utils.UI.setPagetop(new js.JQuery("#pagetop").find("a"));
	ui.Keyboard.init();
	view.Login.start();
};
Manager.login = function() {
	jp.saken.utils.Ajax.getDatetime(function(datetime) {
		Manager.visitDatetime = datetime;
		Manager.visitDate = Manager.visitDatetime.split(" ")[0];
		Manager.pastDate = jp.saken.utils.Handy.getPastDate(datetime,100);
		Manager.loadDB(Manager.onLoadedDB);
	});
};
Manager.logout = function() {
	if(!Manager._isLogined) return;
	utils.TimeKeeper.stop();
	view.Login.show();
	view.SimpleBoard.hide();
	view.ReportViewer.hide();
	view.StarChecker.hide();
};
Manager.reload = function() {
	utils.TimeKeeper.stop();
	view.ReportViewer.reset();
	Manager.login();
};
Manager.loadDB = function(onLoaded) {
	jp.saken.utils.Dom.jWindow.on("loadDB",onLoaded);
	db.Members.load();
	db.Tasks.load(Manager.pastDate);
	db.Works.load();
	db.Clients.load();
};
Manager.onLoadedDB = function(event) {
	jp.saken.utils.Dom.jWindow.unbind("loadDB",Manager.onLoadedDB);
	Manager._isLogined = true;
	view.Login.hide();
	view.SimpleBoard.show();
	view.ReportViewer.show();
	view.StarChecker.show();
	view.Information.run();
	utils.TimeKeeper.run();
};
var IMap = function() { };
IMap.__name__ = true;
Math.__name__ = true;
var Reflect = function() { };
Reflect.__name__ = true;
Reflect.getProperty = function(o,field) {
	var tmp;
	if(o == null) return null; else if(o.__properties__ && (tmp = o.__properties__["get_" + field])) return o[tmp](); else return o[field];
};
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
};
Reflect.deleteField = function(o,field) {
	if(!Object.prototype.hasOwnProperty.call(o,field)) return false;
	delete(o[field]);
	return true;
};
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
Std.parseFloat = function(x) {
	return parseFloat(x);
};
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c > 8 && c < 14 || c == 32;
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
};
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
var db = {};
db.Clients = function() { };
db.Clients.__name__ = true;
db.Clients.load = function() {
	db.Database.load(db.Clients.db = [],"clients",db.Clients.COLUMN_LIST);
};
db.Database = function() { };
db.Database.__name__ = true;
db.Database.load = function(db1,table,columns,where) {
	if(where == null) where = "";
	if(db.Database._counter == null) db.Database._counter = 0;
	db.Database._counter++;
	jp.saken.utils.Ajax.getData(table,columns,function(data) {
		var _g1 = 0;
		var _g = data.length;
		while(_g1 < _g) {
			var p = _g1++;
			var obj = data[p];
			db1[obj.id] = obj;
		}
		db.Database._counter--;
		if(db.Database._counter == 0) jp.saken.utils.Dom.jWindow.trigger("loadDB");
	},where);
};
db.Members = function() { };
db.Members.__name__ = true;
db.Members.load = function() {
	db.Database.load(db.Members.db = [],"members",db.Members.COLUMN_LIST);
};
db.Tasks = function() { };
db.Tasks.__name__ = true;
db.Tasks.load = function(pastDate) {
	if(pastDate == null) pastDate = "1999-1-1";
	db.Database.load(db.Tasks.db = [],"tasks",db.Tasks.COLUMN_LIST,"updatetime > \"" + pastDate + "\"");
};
db.Works = function() { };
db.Works.__name__ = true;
db.Works.load = function() {
	db.Database.load(db.Works.db = [],"works",db.Works.COLUMN_LIST);
};
var haxe = {};
haxe.Http = function(url) {
	this.url = url;
	this.headers = new List();
	this.params = new List();
	this.async = true;
};
haxe.Http.__name__ = true;
haxe.Http.prototype = {
	setParameter: function(param,value) {
		this.params = Lambda.filter(this.params,function(p) {
			return p.param != param;
		});
		this.params.push({ param : param, value : value});
		return this;
	}
	,request: function(post) {
		var me = this;
		me.responseData = null;
		var r = this.req = js.Browser.createXMLHttpRequest();
		var onreadystatechange = function(_) {
			if(r.readyState != 4) return;
			var s;
			try {
				s = r.status;
			} catch( e ) {
				s = null;
			}
			if(s == undefined) s = null;
			if(s != null) me.onStatus(s);
			if(s != null && s >= 200 && s < 400) {
				me.req = null;
				me.onData(me.responseData = r.responseText);
			} else if(s == null) {
				me.req = null;
				me.onError("Failed to connect or resolve host");
			} else switch(s) {
			case 12029:
				me.req = null;
				me.onError("Failed to connect to host");
				break;
			case 12007:
				me.req = null;
				me.onError("Unknown host");
				break;
			default:
				me.req = null;
				me.responseData = r.responseText;
				me.onError("Http Error #" + r.status);
			}
		};
		if(this.async) r.onreadystatechange = onreadystatechange;
		var uri = this.postData;
		if(uri != null) post = true; else {
			var $it0 = this.params.iterator();
			while( $it0.hasNext() ) {
				var p = $it0.next();
				if(uri == null) uri = ""; else uri += "&";
				uri += encodeURIComponent(p.param) + "=" + encodeURIComponent(p.value);
			}
		}
		try {
			if(post) r.open("POST",this.url,this.async); else if(uri != null) {
				var question = this.url.split("?").length <= 1;
				r.open("GET",this.url + (question?"?":"&") + uri,this.async);
				uri = null;
			} else r.open("GET",this.url,this.async);
		} catch( e1 ) {
			me.req = null;
			this.onError(e1.toString());
			return;
		}
		if(!Lambda.exists(this.headers,function(h) {
			return h.header == "Content-Type";
		}) && post && this.postData == null) r.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		var $it1 = this.headers.iterator();
		while( $it1.hasNext() ) {
			var h1 = $it1.next();
			r.setRequestHeader(h1.header,h1.value);
		}
		r.send(uri);
		if(!this.async) onreadystatechange(null);
	}
	,onData: function(data) {
	}
	,onError: function(msg) {
	}
	,onStatus: function(status) {
	}
};
haxe.Timer = function(time_ms) {
	var me = this;
	this.id = setInterval(function() {
		me.run();
	},time_ms);
};
haxe.Timer.__name__ = true;
haxe.Timer.prototype = {
	stop: function() {
		if(this.id == null) return;
		clearInterval(this.id);
		this.id = null;
	}
	,run: function() {
	}
};
haxe.ds = {};
haxe.ds.IntMap = function() {
	this.h = { };
};
haxe.ds.IntMap.__name__ = true;
haxe.ds.IntMap.__interfaces__ = [IMap];
haxe.ds.IntMap.prototype = {
	set: function(key,value) {
		this.h[key] = value;
	}
};
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	set: function(key,value) {
		this.h["$" + key] = value;
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
};
var jp = {};
jp.saken = {};
jp.saken.ui = {};
jp.saken.ui.Lightbox = function() { };
jp.saken.ui.Lightbox.__name__ = true;
jp.saken.ui.Lightbox.init = function(cls,jField) {
	jp.saken.ui.Lightbox.setHTML();
	jp.saken.ui.Lightbox._jParent = new js.JQuery("#" + "lightbox");
	jp.saken.ui.Lightbox._jBackground = jp.saken.ui.Lightbox._jParent.find(".bg").css({ opacity : .8});
	jp.saken.ui.Lightbox._jContent = jp.saken.ui.Lightbox._jParent.find(".content");
	jp.saken.ui.Lightbox._class = cls;
	if(jField == null) jField = jp.saken.utils.Dom.jBody;
	jp.saken.ui.Lightbox._jBackground.add(jp.saken.ui.Lightbox._jParent.find(".close")).on("click",jp.saken.ui.Lightbox.hide);
	jp.saken.utils.Dom.jWindow.on("resize",jp.saken.ui.Lightbox.resize);
	jField.on("click",jp.saken.ui.Lightbox.onClick);
};
jp.saken.ui.Lightbox.setHTML = function() {
	var html = "\n\t\t<section id=\"" + "lightbox" + "\">\n\t\t\t<div class=\"bg\" id=\"" + "lightbox" + "-bg\">&nbsp;</div>\n\t\t\t<section class=\"content\" id=\"" + "lightbox" + "-content\"></section>\n\t\t\t<button class=\"close\" id=\"" + "lightbox" + "-close\">×</button>\n\t\t</section>";
	jp.saken.utils.Dom.jBody.append(html);
};
jp.saken.ui.Lightbox.onClick = function(event) {
	var jTarget = new js.JQuery(event.target);
	var jAnchor = jTarget.parents(jp.saken.ui.Lightbox._class);
	if(jAnchor.length == 0) return;
	var href = jAnchor.prop("href");
	if(href.length > 0) {
		jp.saken.ui.Lightbox.show(href);
		return false;
	}
};
jp.saken.ui.Lightbox.show = function(src) {
	jp.saken.ui.Lightbox._jContent.empty().css({ width : "", height : ""}).html("<img src=\"" + src + "\">").find("img").on("load",jp.saken.ui.Lightbox.resize);
	jp.saken.ui.Lightbox._jParent.stop().fadeIn(300);
};
jp.saken.ui.Lightbox.hide = function(event) {
	jp.saken.ui.Lightbox._jParent.stop().fadeOut(300);
};
jp.saken.ui.Lightbox.resize = function(event) {
	var jTarget = jp.saken.ui.Lightbox._jContent.find("img");
	var jWindow = jp.saken.utils.Dom.jWindow;
	var winW = jWindow.width();
	var winH = jWindow.height();
	var w = jTarget.width();
	var h = jTarget.height();
	if(w > winW) w = winW;
	if(h > winH) h = winH;
	var x = Math.floor((winW - w) * .5);
	var y = Math.floor((winH - h) * .5);
	jp.saken.ui.Lightbox._jContent.css({ left : x, top : y, width : w, height : h});
};
jp.saken.utils = {};
jp.saken.utils.API = function() { };
jp.saken.utils.API.__name__ = true;
jp.saken.utils.API.getJSON = function(name,params,onLoaded) {
	jp.saken.utils.API.getString(name,params,function(data) {
		onLoaded(JSON.parse(data));
	});
};
jp.saken.utils.API.getString = function(name,params,onLoaded) {
	var http = new haxe.Http("/api/" + name + "/");
	http.onData = function(data) {
		onLoaded(data);
	};
	var $it0 = params.keys();
	while( $it0.hasNext() ) {
		var key = $it0.next();
		http.setParameter(key,params.get(key));
	}
	http.request(true);
};
jp.saken.utils.API.getIP = function(onLoaded) {
	jp.saken.utils.API.getString("handy",(function($this) {
		var $r;
		var _g = new haxe.ds.StringMap();
		_g.set("key","ip");
		$r = _g;
		return $r;
	}(this)),onLoaded);
};
jp.saken.utils.Ajax = function() { };
jp.saken.utils.Ajax.__name__ = true;
jp.saken.utils.Ajax.getIP = function(onLoaded) {
	var http = new haxe.Http("files/php/" + "getIP.php");
	jp.saken.utils.Ajax.setBusy();
	http.onData = function(data) {
		onLoaded(data);
		jp.saken.utils.Ajax.unsetBusy();
	};
	http.request(true);
};
jp.saken.utils.Ajax.getDatetime = function(onLoaded) {
	var http = new haxe.Http("files/php/" + "getDatetime.php");
	jp.saken.utils.Ajax.setBusy();
	http.onData = function(data) {
		onLoaded(JSON.parse(data));
		jp.saken.utils.Ajax.unsetBusy();
	};
	http.request(true);
};
jp.saken.utils.Ajax.uploadImage = function(filename,base64,onLoaded) {
	var http = new haxe.Http("files/php/" + "uploadImage.php");
	jp.saken.utils.Ajax.setBusy();
	http.onData = function(data) {
		if(onLoaded != null) onLoaded();
		jp.saken.utils.Ajax.unsetBusy();
	};
	http.setParameter("filename",filename);
	http.setParameter("base64",base64);
	http.request(true);
};
jp.saken.utils.Ajax.deleteImage = function(filename,onLoaded) {
	var http = new haxe.Http("files/php/" + "deleteImage.php");
	jp.saken.utils.Ajax.setBusy();
	http.onData = function(data) {
		if(onLoaded != null) onLoaded();
		jp.saken.utils.Ajax.unsetBusy();
	};
	http.setParameter("filename",filename);
	http.request(true);
};
jp.saken.utils.Ajax.getData = function(table,columns,onLoaded,where) {
	if(where == null) where = "";
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		onLoaded(JSON.parse(data));
		jp.saken.utils.Ajax.unsetBusy();
	};
	var query = "SELECT " + columns.join(",") + " FROM " + table;
	if(where.length > 0) query += " WHERE " + where;
	jp.saken.utils.Ajax.requestConnectDB(query);
};
jp.saken.utils.Ajax.getMaxData = function(table,column,onLoaded,where) {
	if(where == null) where = "";
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		var reg = new EReg("([0-9]+)","");
		var isMatch = reg.match(data);
		onLoaded(isMatch?Std.parseInt(reg.matched(0)):0);
		jp.saken.utils.Ajax.unsetBusy();
	};
	var query = "SELECT MAX(" + column + ") FROM " + table;
	if(where.length > 0) query += " WHERE " + where;
	jp.saken.utils.Ajax.requestConnectDB(query);
};
jp.saken.utils.Ajax.getIsEmpty = function(table,onLoaded,where) {
	jp.saken.utils.Ajax.getData(table,["id"],function(data) {
		onLoaded(data.length < 1);
	},where);
};
jp.saken.utils.Ajax.insertData = function(table,columns,values,onLoaded) {
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		if(onLoaded != null) onLoaded(Std.parseInt(data));
		jp.saken.utils.Ajax.unsetBusy();
	};
	var _g1 = 0;
	var _g = values.length;
	while(_g1 < _g) {
		var i = _g1++;
		values[i] = "'" + values[i] + "'";
	}
	var query = "INSERT INTO " + table + " (" + columns.join(",") + ") VALUES (" + values.join(",") + ")";
	jp.saken.utils.Ajax.requestConnectDB(query,true);
};
jp.saken.utils.Ajax.updateData = function(table,columns,values,where,onLoaded) {
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		if(onLoaded != null) onLoaded();
		jp.saken.utils.Ajax.unsetBusy();
	};
	var array = [];
	var _g1 = 0;
	var _g = columns.length;
	while(_g1 < _g) {
		var p = _g1++;
		array[p] = columns[p] + "= '" + values[p] + "'";
	}
	var query = "UPDATE " + table + " SET " + array.join(",") + " WHERE " + where;
	jp.saken.utils.Ajax.requestConnectDB(query);
};
jp.saken.utils.Ajax.setConnectDB = function() {
	jp.saken.utils.Ajax._connectDB = new haxe.Http("files/php/" + "connectDB.php");
};
jp.saken.utils.Ajax.requestConnectDB = function(query,isInsert) {
	if(isInsert == null) isInsert = false;
	jp.saken.utils.Ajax.setBusy();
	jp.saken.utils.Ajax._connectDB.setParameter("query",query);
	if(isInsert) jp.saken.utils.Ajax._connectDB.setParameter("insert","true");
	jp.saken.utils.Ajax._connectDB.request(true);
};
jp.saken.utils.Ajax.setBusy = function() {
	jp.saken.utils.Dom.jWindow.on("beforeunload",jp.saken.utils.Ajax.onBeforeunload);
};
jp.saken.utils.Ajax.unsetBusy = function() {
	jp.saken.utils.Dom.jWindow.unbind("beforeunload",jp.saken.utils.Ajax.onBeforeunload);
};
jp.saken.utils.Ajax.onBeforeunload = function(event) {
	return "データベース登録中です。";
};
var js = {};
jp.saken.utils.Dom = function() { };
jp.saken.utils.Dom.__name__ = true;
jp.saken.utils.Handy = function() { };
jp.saken.utils.Handy.__name__ = true;
jp.saken.utils.Handy.alert = function(value) {
	window.alert(value);
};
jp.saken.utils.Handy.confirm = function(text,ok,cancel) {
	if(window.confirm(text)) ok(); else if(cancel != null) cancel();
};
jp.saken.utils.Handy.getPastDate = function(date,num) {
	if(num == null) num = 30;
	var second = HxOverrides.strDate(date).getTime() - num * 86400000;
	var date1;
	var d = new Date();
	d.setTime(second);
	date1 = d;
	var m = jp.saken.utils.Handy.getFilledNumber(date1.getMonth() + 1,2);
	var d1 = jp.saken.utils.Handy.getFilledNumber(date1.getDate(),2);
	return date1.getFullYear() + "-" + m + "-" + d1;
};
jp.saken.utils.Handy.getFilledNumber = function(num,digits) {
	if(digits == null) digits = 3;
	var result = num + "";
	var blankLength = digits - jp.saken.utils.Handy.getDigits(num);
	var _g = 0;
	while(_g < blankLength) {
		var i = _g++;
		result = "0" + result;
	}
	return result;
};
jp.saken.utils.Handy.getDigits = function(val) {
	return (val + "").length;
};
jp.saken.utils.Handy.getFormattedPrice = function(price) {
	var string;
	if(price == null) string = "null"; else string = "" + price;
	var length = string.length;
	var result = "";
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		if(i > 0 && (length - i) % 3 == 0) result += ",";
		result += string.charAt(i);
	}
	return "￥" + result + "-";
};
jp.saken.utils.Handy.getLinkedHTML = function(text,target) {
	if(target == null) target = "_blank";
	if(new EReg("http","").match(text)) text = new EReg("((http|https)://[0-9a-z-/._?=&%\\[\\]~^:]+)","gi").replace(text,"<a href=\"$1\" target=\"" + target + "\">$1</a>");
	return text;
};
jp.saken.utils.Handy.getBreakedHTML = function(text) {
	if(new EReg("\n","").match(text)) text = new EReg("\r?\n","g").replace(text,"<br>");
	return text;
};
jp.saken.utils.Handy.getAdjustedHTML = function(text) {
	return jp.saken.utils.Handy.getLinkedHTML(jp.saken.utils.Handy.getBreakedHTML(text));
};
jp.saken.utils.Handy.getLines = function(text) {
	return jp.saken.utils.Handy.getNumberOfCharacter(text,"\n") + 1;
};
jp.saken.utils.Handy.getNumberOfCharacter = function(text,character) {
	return text.split(character).length - 1;
};
jp.saken.utils.Handy.getLimitText = function(text,count) {
	if(count == null) count = 10;
	if(text.length > count) text = HxOverrides.substr(text,0,count) + "...";
	return text;
};
jp.saken.utils.Handy.getReplacedSC = function(text) {
	text = StringTools.replace(text,"'","&#039;");
	text = StringTools.replace(text,"\\","&#47;");
	return text;
};
jp.saken.utils.Handy.getSlicedArray = function(array,num) {
	if(num == null) num = 1000;
	var results = [];
	var _g1 = 0;
	var _g = Math.ceil(array.length / num);
	while(_g1 < _g) {
		var i = _g1++;
		var j = i * num;
		results.push(array.slice(j,j + num));
	}
	return results;
};
jp.saken.utils.Handy.shuffleArray = function(array) {
	var copy = array.slice();
	var results = [];
	var length = copy.length;
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		var index = Math.floor(Math.random() * length);
		results.push(copy[index]);
		copy.splice(index,1);
	}
	return results;
};
jp.saken.utils.Handy.getMap = function(array) {
	var map = new haxe.ds.IntMap();
	var _g1 = 0;
	var _g = array.length;
	while(_g1 < _g) {
		var i = _g1++;
		var info = array[i];
		var id = info.id;
		Reflect.deleteField(info,"id");
		var fields = Reflect.fields(info);
		var value;
		if(fields.length > 1) value = info; else value = Reflect.getProperty(info,fields[0]);
		var v = value;
		map.set(id,v);
		v;
	}
	return map;
};
jp.saken.utils.Handy.getIsImageSource = function(string) {
	return new EReg("data:image","").match(string);
};
jp.saken.utils.Handy.timer = function(func,time) {
	if(time == null) time = 1000;
	var timer = new haxe.Timer(time);
	timer.run = function() {
		timer.stop();
		func();
	};
};
jp.saken.utils.Handy.prototype = {
	getRoundNumber: function(val,digits) {
		var m = Math.pow(10,digits);
		var d = Math.pow(.1,digits);
		return Math.floor(val * m) * d;
	}
};
jp.saken.utils.UI = function() { };
jp.saken.utils.UI.__name__ = true;
jp.saken.utils.UI.setPagetop = function(jTrigger,speed,easing) {
	if(easing == null) easing = "easeOutSine";
	if(speed == null) speed = 200;
	jp.saken.utils.UI.setAnchor(jTrigger,speed,easing);
};
jp.saken.utils.UI.setAnchor = function(jTrigger,speed,easing,jFix) {
	if(easing == null) easing = "easeOutSine";
	if(speed == null) speed = 200;
	var jHtml = new js.JQuery("html,body");
	jTrigger.on("click",function(event) {
		var href = new js.JQuery(event.currentTarget).data("anchor");
		if(href == null || href.indexOf("#") < 0) return;
		var top = new js.JQuery(href).offset().top;
		if(jFix != null) top -= jFix.outerHeight() + 10;
		jHtml.stop().animate({ scrollTop : top},speed,easing);
		return false;
	});
};
jp.saken.utils.UI.setAccordion = function(jTrigger,speed) {
	if(speed == null) speed = 200;
	var open = function(jTarget,jContent) {
		jTarget.addClass("opened");
		jContent.stop().slideDown(speed);
	};
	var close = function(jTarget1,jContent1) {
		jTarget1.removeClass("opened");
		jContent1.stop().slideUp(speed);
	};
	jTrigger.on("click",function(event) {
		var jTarget2 = new js.JQuery(event.currentTarget);
		var href = jTarget2.data("accordion");
		if(href == null || href.indexOf("#") < 0) return;
		var jContent2 = new js.JQuery(href);
		if(jTarget2.hasClass("opened")) close(jTarget2,jContent2); else open(jTarget2,jContent2);
		return false;
	});
};
jp.saken.utils.UI.setTextSelector = function(jTrigger,jTarget) {
	jTrigger.on("click",function(event) {
		var range = jp.saken.utils.Dom.document.createRange();
		var element = jTarget.get(0);
		var selection = jp.saken.utils.Dom.window.getSelection();
		range.selectNodeContents(element);
		selection.removeAllRanges();
		selection.addRange(range);
	});
};
js.Boot = function() { };
js.Boot.__name__ = true;
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i1;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js.Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str2 = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str2.length != 2) str2 += ", \n";
		str2 += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str2 += "\n" + s + "}";
		return str2;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js.Browser = function() { };
js.Browser.__name__ = true;
js.Browser.createXMLHttpRequest = function() {
	if(typeof XMLHttpRequest != "undefined") return new XMLHttpRequest();
	if(typeof ActiveXObject != "undefined") return new ActiveXObject("Microsoft.XMLHTTP");
	throw "Unable to create XMLHttpRequest object.";
};
js.Cookie = function() { };
js.Cookie.__name__ = true;
js.Cookie.set = function(name,value,expireDelay,path,domain) {
	var s = name + "=" + encodeURIComponent(value);
	if(expireDelay != null) {
		var d = DateTools.delta(new Date(),expireDelay * 1000);
		s += ";expires=" + d.toGMTString();
	}
	if(path != null) s += ";path=" + path;
	if(domain != null) s += ";domain=" + domain;
	window.document.cookie = s;
};
js.Cookie.all = function() {
	var h = new haxe.ds.StringMap();
	var a = window.document.cookie.split(";");
	var _g = 0;
	while(_g < a.length) {
		var e = a[_g];
		++_g;
		e = StringTools.ltrim(e);
		var t = e.split("=");
		if(t.length < 2) continue;
		h.set(t[0],decodeURIComponent(t[1].split("+").join(" ")));
	}
	return h;
};
js.Cookie.get = function(name) {
	return js.Cookie.all().get(name);
};
js.Cookie.remove = function(name,path,domain) {
	js.Cookie.set(name,"",-10,path,domain);
};
var ui = {};
ui.Datalist = function() { };
ui.Datalist.__name__ = true;
ui.Datalist.set = function(jTarget,mode,clientID) {
	var param;
	var _g = new haxe.ds.StringMap();
	_g.set("mode",mode);
	param = _g;
	if(clientID != null) {
		param.set("clientID",clientID);
		clientID;
	}
	jp.saken.utils.API.getJSON("dailyReport2",param,function(data) {
		var html = "";
		var _g2 = 0;
		var _g1 = data.length;
		while(_g2 < _g1) {
			var i = _g2++;
			var info = data[i];
			html += "<option value=\"" + Std.string(info.name) + "\" data-id=\"" + Std.string(info.id) + "\"></option>";
		}
		jTarget.html(html);
	});
};
ui.Keyboard = function() { };
ui.Keyboard.__name__ = true;
ui.Keyboard.init = function() {
	jp.saken.utils.Dom.jWindow.on("keydown",ui.Keyboard.onKeydown);
};
ui.Keyboard.onKeydown = function(event) {
	var jTarget = new js.JQuery(event.target);
	var keyCode = event.keyCode;
	if(event.ctrlKey) switch(keyCode) {
	case 76:
		Manager.logout();
		break;
	case 65:case 68:
		view.ReportViewer.archiveAll();
		return false;
	default:
	}
};
var utils = {};
utils.Data = function() { };
utils.Data.__name__ = true;
utils.Data.getDate = function(datetime) {
	var date = datetime.split(" ")[0];
	date = new EReg("-","g").replace(date,".");
	return date;
};
utils.Data.getDay = function(datetime) {
	return utils.Data.DAY_LIST[HxOverrides.strDate(datetime).getDay()] + ".";
};
utils.TimeKeeper = function() { };
utils.TimeKeeper.__name__ = true;
utils.TimeKeeper.run = function() {
	utils.TimeKeeper._timer = new haxe.Timer(300);
	utils.TimeKeeper._timer.run = utils.TimeKeeper.onLoop;
};
utils.TimeKeeper.stop = function() {
	utils.TimeKeeper._timer.stop();
};
utils.TimeKeeper.onLoop = function() {
	view.SimpleBoard.onLoop();
	view.Information.onLoop();
	view.StarChecker.onLoop();
	view.ReportViewer.onLoop();
	view.reportviewer.AutoSave.onLoop();
};
var view = {};
view.Information = function() { };
view.Information.__name__ = true;
view.Information.init = function() {
	view.Information._jParent = new js.JQuery("#information");
	view.Information._jLength = view.Information._jParent.find(".length");
	new js.JQuery("h1").add(view.Information._jParent).on("click",view.Information.onClick);
};
view.Information.run = function() {
	view.Information._lastDatetime = Manager.visitDatetime;
};
view.Information.onLoop = function() {
	view.Information.getData(["id","updatetime"],view.Information.set);
};
view.Information.getData = function(columns,onLoaded) {
	var where = "updatetime > \"" + view.Information._lastDatetime + "\" AND member_id != " + Manager.myID;
	jp.saken.utils.Ajax.getData("reports",columns,onLoaded,where);
};
view.Information.set = function(data) {
	var length = data.length;
	if(length == 0) return;
	view.Information._jLength.text(length == null?"null":"" + length);
	view.Information._jParent.stop().fadeIn(300);
};
view.Information.onClick = function(event) {
	Manager.reload();
	view.Information._jLength.text("0");
	view.Information._jParent.stop().fadeOut(300);
	jp.saken.utils.Ajax.getDatetime(function(datetime) {
		view.Information._lastDatetime = datetime;
	});
};
view.Login = function() { };
view.Login.__name__ = true;
view.Login.init = function() {
	view.Login._jParent = new js.JQuery("#login");
	view.Login._jID = view.Login._jParent.find(".id");
	view.Login._jPass = view.Login._jParent.find(".pass");
	view.Login._jSubmit = view.Login._jParent.find(".submit").on("click",view.Login.submit);
};
view.Login.show = function() {
	js.Cookie.remove("DR2LoginHistory2");
	view.Login._jID.add(view.Login._jPass).prop("value","");
	view.Login._jParent.fadeIn(300,function() {
		view.Login._jID.trigger("focus");
	});
};
view.Login.hide = function() {
	view.Login._jParent.stop().hide();
};
view.Login.start = function() {
	view.Login._jID.trigger("focus");
	var cookie = js.Cookie.get("DR2LoginHistory2");
	if(cookie == null) return;
	var info = JSON.parse(cookie);
	view.Login._jID.prop("value",info[0]);
	view.Login._jPass.prop("value",info[1]);
	view.Login.submit();
};
view.Login.submit = function(event) {
	var id = view.Login._jID.prop("value");
	var pass = view.Login._jPass.prop("value");
	var table = "members";
	var columns = ["*"];
	id = new EReg("_","").replace(id,"-");
	var where = "(parmanent_number = \"" + id + "\" OR parmanent_id = \"" + id + "\") AND pass = \"" + pass + "\"";
	jp.saken.utils.Ajax.getData(table,columns,view.Login.checkData,where);
	return false;
};
view.Login.checkData = function(data) {
	if(data.length == 0) {
		jp.saken.utils.Dom.window.alert("登録されていないアカウントです。");
		return;
	}
	var info = data[0];
	var cookie = JSON.stringify([info.parmanent_number,info.pass]);
	js.Cookie.set("DR2LoginHistory2",cookie);
	Manager.myID = info.id;
	Manager.myParmanentID = info.parmanent_id;
	Manager.myName = info.name;
	Manager.myTeam = info.team;
	Manager.login();
};
view.ReportViewer = function() { };
view.ReportViewer.__name__ = true;
view.ReportViewer.init = function() {
	view.ReportViewer._jParent = new js.JQuery("#reportviewer");
	view.ReportViewer._jContents = view.ReportViewer._jParent.find("#reportviewer-content").on({ click : view.ReportViewer.onClick, keydown : view.ReportViewer.onKeyup, change : view.ReportViewer.onChange});
	view.ReportViewer._jClientDatalist = view.ReportViewer._jParent.find("#client-datalist");
	view.ReportViewer._jWorkDatalist = view.ReportViewer._jParent.find("#work-datalist");
	view.reportviewer.AutoSave.init(view.ReportViewer._jContents);
	view.reportviewer.SortNavi.init(view.ReportViewer._jParent.find("#sort-navi"));
	view.reportviewer.SearchNavi.init(view.ReportViewer._jParent.find("#search-navi"));
	jp.saken.ui.Lightbox.init(".lightbox");
	view.reportviewer.Scrollbar.init(view.ReportViewer._jParent);
	ui.Datalist.set(view.ReportViewer._jClientDatalist,"clients");
};
view.ReportViewer.show = function() {
	view.ReportViewer.loadDB(function() {
		view.ReportViewer._jParent.show();
		view.reportviewer.SortNavi.showNew();
	});
	return;
	var param;
	var _g = new haxe.ds.StringMap();
	_g.set("mode","reports");
	_g.set("myID","15");
	_g.set("new","1");
	param = _g;
	jp.saken.utils.API.getJSON("dailyReport2",param,function(data) {
		var _g2 = 0;
		var _g1 = data.length;
		while(_g2 < _g1) {
			var i = _g2++;
			view.ReportViewer._jContents.append(view.reportviewer.Html2.getReport(data[i]));
		}
		view.ReportViewer.fadein();
	});
	view.ReportViewer._jParent.fadeIn(300);
};
view.ReportViewer.hide = function() {
	view.ReportViewer.reset();
	view.ReportViewer._jParent.stop().hide();
};
view.ReportViewer.loadDB = function(onLoaded) {
	jp.saken.utils.Ajax.getData("reports",["*"],function(data) {
		view.ReportViewer._fullData = view.ReportViewer.getSortedFullData(data);
		if(onLoaded != null) onLoaded();
	},"date > \"" + Manager.pastDate + "\"");
};
view.ReportViewer.showReports = function(category,eReg) {
	view.ReportViewer._jContents.removeClass().addClass(category).empty();
	view.ReportViewer._currentData = view.ReportViewer.getChoicedData(category,eReg);
	view.ReportViewer._current = 0;
	if(category == "new") view.ReportViewer.addNewEditor(Manager.myID,Manager.visitDate);
	view.ReportViewer.loadMore();
};
view.ReportViewer.loadMore = function(length) {
	if(length == null) length = 10;
	view.ReportViewer._jContents.append(view.ReportViewer.getHTML(view.ReportViewer._currentData,length));
	view.ReportViewer.fadein();
};
view.ReportViewer.archiveAll = function() {
	var jList = view.ReportViewer._jContents.find(".report").not(".archived");
	var _g1 = 0;
	var _g = jList.length;
	while(_g1 < _g) {
		var p = _g1++;
		var jTarget = jList.eq(p);
		if(jTarget.data("id") != 0) view.ReportViewer.archiveReport(jTarget,false);
	}
	view.ReportViewer.loadMore();
};
view.ReportViewer.search = function(value) {
	view.ReportViewer.showReports("searching",new EReg(value,"i"));
};
view.ReportViewer.reset = function() {
	view.reportviewer.SearchNavi.input("");
	view.reportviewer.SortNavi.clear();
	view.ReportViewer._jContents.empty();
};
view.ReportViewer.setTotaltime = function(jReport) {
	var totaltime = 0;
	jReport.find(".tasks").find(".task").each(function() {
		var value = $(this).find(".hour").find("input").prop("value");
		if(value.length == 0) value = "0";
		totaltime += Std.parseFloat(value);
	});
	totaltime = Math.ceil(totaltime * 10) / 10;
	jReport.find(".totaltime").find("span").text(totaltime == null?"null":"" + totaltime);
};
view.ReportViewer.updateStars = function(reportID,stars) {
	var _g1 = 0;
	var _g = view.ReportViewer._fullData.length;
	while(_g1 < _g) {
		var p = _g1++;
		if(view.ReportViewer._fullData[p].id == reportID) view.ReportViewer._fullData[p].star_list = stars;
	}
};
view.ReportViewer.onLoop = function() {
	var jTask = view.ReportViewer._jContents.find(".task");
	var jFocus = jTask.find(":focus").parents(".task");
	if(jFocus.hasClass("lastFocus")) return;
	jTask.removeClass("lastFocus");
	jFocus.addClass("lastFocus");
	view.ReportViewer.setWorkDatalist(jFocus);
};
view.ReportViewer.getSortedFullData = function(data) {
	var dates = [];
	var dataOfDate = new haxe.ds.StringMap();
	data.reverse();
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var p = _g1++;
		var info = data[p];
		var date = info.date;
		var array = dataOfDate.get(date);
		if(array == null) {
			array = [];
			dates.push(date);
		}
		array.push(info);
		dataOfDate.set(date,array);
	}
	dates.sort(function(a,b) {
		return Math.floor(HxOverrides.strDate(b).getTime() - HxOverrides.strDate(a).getTime());
	});
	data = [];
	var _g11 = 0;
	var _g2 = dates.length;
	while(_g11 < _g2) {
		var p1 = _g11++;
		var date1 = dates[p1];
		var array1 = dataOfDate.get(date1);
		array1.sort(function(a1,b1) {
			if(a1.updatetime < b1.updatetime) return 1; else return -1;
		});
		data = data.concat(array1);
	}
	return data;
};
view.ReportViewer.getChoicedData = function(category,eReg) {
	if(category == "all") return view.ReportViewer._fullData;
	var myID = Manager.myID;
	var team = category.split(" ")[0];
	var getChoiceNew = function(info) {
		return info.archived_list.split(",").indexOf(myID) == -1;
	};
	var getChoiceStared = function(info1) {
		return info1.star_list.split(",").indexOf(myID) > -1;
	};
	var getChoiceSelf = function(info2) {
		return info2.member_id == myID;
	};
	var getChoiceTeam = function(info3) {
		var memberDB = db.Members.db[info3.member_id];
		var value = memberDB.team;
		if(value.length == 0) value = memberDB.section;
		return value == team;
	};
	var getChoiceSearch = function(info4) {
		return eReg.match(view.ReportViewer.getReportString(info4));
	};
	var data = [];
	var getIsMatch;
	if(category == "new") getIsMatch = getChoiceNew; else if(category == "searching") getIsMatch = getChoiceSearch; else if(category == "stared") getIsMatch = getChoiceStared; else if(category == "self") getIsMatch = getChoiceSelf; else getIsMatch = getChoiceTeam;
	var _g1 = 0;
	var _g = view.ReportViewer._fullData.length;
	while(_g1 < _g) {
		var p = _g1++;
		var info5 = view.ReportViewer._fullData[p];
		if(getIsMatch(info5)) data.push(info5);
	}
	return data;
};
view.ReportViewer.getHTML = function(data,length) {
	var html = "";
	var a = view.ReportViewer._current;
	var b = view.ReportViewer._current + length;
	if(b > data.length) b = data.length;
	var _g = a;
	while(_g < b) {
		var p = _g++;
		var info = data[p];
		var date = info.date;
		html += view.reportviewer.Html.getReport(info.id,info.member_id,{ tasks : info.task_id_list, note : info.note, images : info.image_list, dates : [utils.Data.getDate(date),utils.Data.getDay(date)], updatetime : info.updatetime, stars : info.star_list, archives : info.archived_list});
	}
	view.ReportViewer._current = b;
	return html;
};
view.ReportViewer.getReportString = function(info) {
	var memberID = info.member_id;
	var tasks = info.task_id_list.split(",");
	var date = info.date;
	var array = [db.Members.db[memberID].name,utils.Data.getDate(date),utils.Data.getDay(date),info.note];
	var _g1 = 0;
	var _g = tasks.length;
	while(_g1 < _g) {
		var q = _g1++;
		var taskID = tasks[q];
		var taskInfo = db.Tasks.db[taskID];
		var workID = taskInfo.work_id;
		var workInfo = db.Works.db[workID];
		var clientID = workInfo.client_id;
		var clientInfo = db.Clients.db[clientID];
		array.push(workInfo.name);
		array.push(clientInfo.name);
	}
	return array.join(",");
};
view.ReportViewer.fadein = function() {
	var jReports = view.ReportViewer._jContents.find(".report").filter(".loading");
	var jArticles = jReports.find("article").css({ opacity : 0});
	var _g1 = 0;
	var _g = jArticles.length;
	while(_g1 < _g) {
		var p = _g1++;
		jReports.eq(p).removeClass("loading");
		jArticles.eq(p).stop().delay(60 * p).animate({ opacity : 1},200);
	}
};
view.ReportViewer.addNewEditor = function(myID,date) {
	jp.saken.utils.Ajax.getIsEmpty("reports",function(isEmpty) {
		if(!isEmpty) return;
		view.ReportViewer._jContents.prepend(view.reportviewer.Html.getReport(0,myID,{ dates : [utils.Data.getDate(date),utils.Data.getDay(date)]},true));
		var jTarget = view.ReportViewer._jContents.find(".report").first();
		view.reportviewer.AutoSave.setHTML(jTarget);
		new view.reportviewer.DragAndDrop(jTarget);
	},"date = \"" + date + "\" AND member_id = " + myID);
};
view.ReportViewer.onClick = function(event) {
	var jTarget = new js.JQuery(event.target);
	var jReport = jTarget.parents(".report");
	if(jTarget.hasClass("update")) view.reportviewer.ReportEditor.update(jReport);
	if(jTarget.hasClass("edit")) view.reportviewer.ReportEditor.setEditMode(jReport);
	if(jTarget.hasClass("clearTask")) view.ReportViewer.clearTask(jTarget.parents(".task"));
	if(jTarget.hasClass("upTask")) view.ReportViewer.upTask(jTarget.parents(".task"));
	if(jTarget.hasClass("downTask")) view.ReportViewer.downTask(jTarget.parents(".task"));
	if(jTarget.hasClass("addTask")) view.ReportViewer.addTask(jReport.find(".tasks"));
	if(jTarget.hasClass("copyTask")) view.ReportViewer.copyTasks(jReport);
	if(jTarget.hasClass("deleteImage")) view.ReportViewer.deleteImage(jTarget);
	if(jTarget.hasClass("addStar")) view.ReportViewer.addStar(jReport);
	if(jTarget.hasClass("archiveReport")) view.ReportViewer.archiveReport(jReport);
	if(jTarget.hasClass("search")) view.reportviewer.SearchNavi.input(jTarget.text());
};
view.ReportViewer.onKeyup = function(event) {
	var jTarget = new js.JQuery(event.target);
	var keyCode = event.keyCode;
	if(keyCode == 13) view.ReportViewer.onEnter(jTarget);
	if(event.ctrlKey) switch(keyCode) {
	case 8:
		view.ReportViewer.clearTask(jTarget.parents(".task"));
		break;
	default:
	}
};
view.ReportViewer.onChange = function(event) {
	var jTarget = new js.JQuery(event.target);
	view.ReportViewer.setWorkDatalist(jTarget.parents(".task"));
	view.ReportViewer.setTotaltime(jTarget.parents(".report"));
};
view.ReportViewer.onEnter = function(jTarget) {
	var jTask = jTarget.parents(".task");
	if(jTask.length == 0) return;
	var jSpan = jTarget.parent("span");
	var jTasks = jTarget.parents(".tasks");
	var isInputed = jTarget.prop("value").length > 0;
	if(jTask["is"](":last-child") && jSpan["is"](".hour")) {
		if(isInputed) view.ReportViewer.addTask(jTasks);
	} else if(isInputed) {
		var jNext = jTask.find("span").eq(jSpan.index() + 1).find("input");
		if(jNext.length > 0) jNext.trigger("focus"); else jTasks.find(".task").eq(jTask.index() + 1).find("input").first().trigger("focus");
	} else if(jSpan["is"](":first-child")) view.reportviewer.ReportEditor.update(jTasks.parents(".report"));
};
view.ReportViewer.setWorkDatalist = function(jTask) {
	var client = jTask.find(".client").find("input").prop("value");
	var clientID = view.ReportViewer._jClientDatalist.find("[value=\"" + client + "\"]").data("id");
	if(clientID == null) return;
	ui.Datalist.set(view.ReportViewer._jWorkDatalist,"works",clientID);
};
view.ReportViewer.addTask = function(jTasks) {
	var jTaskList = jTasks.find(".task");
	var jFocusTask = jTaskList.filter(".lastFocus");
	if(jFocusTask.length == 0) jFocusTask = jTaskList.last();
	var index = jFocusTask.index();
	var scrollTop = 30 * index;
	jFocusTask.after(view.reportviewer.Html.getTasks());
	jFocusTask.next().hide().slideDown(200).find("input").first().trigger("focus").removeClass("lastFocus");
	jTasks.animate({ scrollTop : scrollTop},200);
};
view.ReportViewer.clearTask = function(jTask) {
	if(jTask.length == 0) return;
	var jReport = jTask.parents(".report");
	var jTasks = jTask.parents(".tasks");
	var index = jTask.index();
	if(jTasks.find(".task").length == 1) {
		if(index == 0) jTask.find("input").prop("value","");
	} else jTask.remove();
	view.ReportViewer.setTotaltime(jReport);
};
view.ReportViewer.upTask = function(jTask) {
	var jTasks = jTask.parents(".tasks");
	var index = jTask.index();
	jTasks.find(".task").eq(index - 1).before(jTask);
};
view.ReportViewer.downTask = function(jTask) {
	var jTasks = jTask.parents(".tasks");
	var index = jTask.index();
	jTasks.find(".task").eq(index + 1).after(jTask);
};
view.ReportViewer.copyTasks = function(jReport) {
	if(jReport.data("id") > 0) return;
	jp.saken.utils.Ajax.getMaxData("reports","id",function(id) {
		if(id == 0) return;
		jp.saken.utils.Ajax.getData("reports",["task_id_list"],function(data) {
			var html = view.reportviewer.Html.getTasks(data[0].task_id_list.split(","),true);
			jReport.find(".tasks").html(html);
			view.ReportViewer.setTotaltime(jReport);
		},"id = " + id);
	},"member_id = " + Manager.myID);
};
view.ReportViewer.deleteImage = function(jTarget) {
	jTarget.parents("span").addClass("hidden");
};
view.ReportViewer.addStar = function(jReport) {
	var reportID = jReport.data("id");
	var myID = Manager.myID;
	var myParmanentID = Manager.myParmanentID;
	var jStars = jReport.find(".star").find("ul");
	var where = "id = " + reportID;
	jp.saken.utils.Ajax.getData("reports",["star_list","is_checked_star"],function(data) {
		var info = data[0];
		var array;
		if(info.star_list) array = info.star_list.split(","); else array = [];
		var isEmpty = HxOverrides.indexOf(array,myID,0) < 0;
		var checkd = info.is_checked_star;
		jStars.html(view.reportviewer.Html.getStars(array));
		if(isEmpty) {
			array.push(myID);
			jStars.append("<li class=\"mine\" title=\"" + myParmanentID + "\">★</li>");
			jStars.find("li").last().css({ top : 10}).animate({ top : 0},300,"easeOutBack");
			jReport.addClass("stared");
		} else {
			HxOverrides.remove(array,myID);
			if(array.length == 0) checkd = 1;
			var jMine = jStars.find(".mine");
			if(jMine.length > 0) jStars.find(".mine").remove(); else jStars.html(view.reportviewer.Html.getStars(array));
			jReport.removeClass("stared");
		}
		var stars = array.join(",");
		view.ReportViewer.updateStars(reportID,stars);
		var columns = ["star_list","is_checked_star"];
		var values = [stars,isEmpty?0:checkd];
		jp.saken.utils.Ajax.updateData("reports",columns,values,where);
	},where);
};
view.ReportViewer.archiveReport = function(jReport,isLoad) {
	if(isLoad == null) isLoad = true;
	jReport.addClass("archived");
	var reportID = jReport.data("id");
	var myID = Manager.myID;
	var where = "id = " + reportID;
	jp.saken.utils.Ajax.getData("reports",["archived_list"],function(data) {
		var array;
		if(data[0].archived_list) array = data[0].archived_list.split(","); else array = [];
		array.push(myID);
		var archives = array.join(",");
		view.ReportViewer.updateArchive(reportID,archives);
		jp.saken.utils.Ajax.updateData("reports",["archived_list"],[archives],where);
	},where);
	if(isLoad) view.ReportViewer.loadMore(1);
};
view.ReportViewer.updateArchive = function(reportID,archives) {
	var _g1 = 0;
	var _g = view.ReportViewer._fullData.length;
	while(_g1 < _g) {
		var p = _g1++;
		if(view.ReportViewer._fullData[p].id == reportID) view.ReportViewer._fullData[p].archived_list = archives;
	}
};
view.SimpleBoard = function() { };
view.SimpleBoard.__name__ = true;
view.SimpleBoard.init = function() {
	view.SimpleBoard._jParent = new js.JQuery("#simpleboard").on("click",view.SimpleBoard.onClick);
	view.SimpleBoard._jNewentry = view.SimpleBoard._jParent.find(".newentry");
	view.SimpleBoard._jTextarea = view.SimpleBoard._jNewentry.find("textarea").on("keydown",view.SimpleBoard.onKeydown);
	view.SimpleBoard._jEntries = view.SimpleBoard._jParent.find(".entries");
	view.SimpleBoard._defNewentryH = view.SimpleBoard._curNewentryH = view.SimpleBoard._jNewentry.height();
};
view.SimpleBoard.show = function() {
	view.SimpleBoard.start();
	view.SimpleBoard._jParent.fadeIn(300);
};
view.SimpleBoard.hide = function() {
	view.SimpleBoard._jParent.stop().hide();
};
view.SimpleBoard.onLoop = function() {
	if(view.SimpleBoard._lastUpdatetime == null) view.SimpleBoard._lastUpdatetime = Manager.visitDatetime;
	jp.saken.utils.Ajax.getData("simpleboard",["id"],function(data) {
		if(data.length > 0) view.SimpleBoard.start();
	},"updatetime > \"" + view.SimpleBoard._lastUpdatetime + "\"");
};
view.SimpleBoard.onClick = function(event) {
	var jTarget = new js.JQuery(event.target);
	var jParant = jTarget.parents(".entry");
	if(jTarget.hasClass("delete")) view.SimpleBoard.deleteEntry(jParant);
	if(jTarget.hasClass("checkbox")) view.SimpleBoard.checkEntry(jParant,jTarget);
};
view.SimpleBoard.onKeydown = function(event) {
	var text = view.SimpleBoard._jTextarea.prop("value");
	var lines = jp.saken.utils.Handy.getLines(text);
	view.SimpleBoard.setNewentryHeight(view.SimpleBoard._defNewentryH * lines);
	if(event.keyCode == 13) {
		if(event.shiftKey) view.SimpleBoard.setNewentryHeight(view.SimpleBoard._curNewentryH + view.SimpleBoard._defNewentryH); else if(text.length > 0) {
			view.SimpleBoard.setNewentryHeight(view.SimpleBoard._defNewentryH);
			view.SimpleBoard.addEntry(text);
			view.SimpleBoard._jTextarea.prop("value","");
			return false;
		}
	}
};
view.SimpleBoard.setNewentryHeight = function(value) {
	view.SimpleBoard._curNewentryH = value;
	view.SimpleBoard._jNewentry.height(value);
};
view.SimpleBoard.start = function() {
	view.SimpleBoard.getDatetime(function(datetime) {
		view.SimpleBoard._checkList = [];
		view.SimpleBoard.setEntries();
	});
};
view.SimpleBoard.setEntries = function() {
	var columns = ["id","member_id","text","check_list"];
	jp.saken.utils.Ajax.getData("simpleboard",columns,function(data) {
		var myID = Manager.myID;
		var html = "";
		data.reverse();
		var _g1 = 0;
		var _g = data.length;
		while(_g1 < _g) {
			var p = _g1++;
			var entry = data[p];
			var id = entry.id;
			var text = entry.text;
			var memberID = entry.member_id;
			var checkList = entry.check_list.split(",");
			var isChecked = HxOverrides.indexOf(checkList,myID,0) > -1;
			view.SimpleBoard._checkList[id] = checkList;
			html += view.SimpleBoard.getEntryHTML(id,memberID,jp.saken.utils.Handy.getAdjustedHTML(text),isChecked,checkList.length);
		}
		view.SimpleBoard._jEntries.html(html);
	},"is_visible=1");
};
view.SimpleBoard.addEntry = function(text) {
	var myID = Manager.myID;
	view.SimpleBoard.getDatetime(function(datetime) {
		var columns = ["member_id","text","updatetime","check_list"];
		jp.saken.utils.Ajax.insertData("simpleboard",columns,[myID,text,datetime,myID],function(lastID) {
			view.SimpleBoard._checkList[lastID] = [myID];
			var html = view.SimpleBoard.getEntryHTML(lastID,myID,jp.saken.utils.Handy.getAdjustedHTML(text),true,1);
			view.SimpleBoard._jEntries.prepend(html).find("li").eq(0).hide().slideDown(500);
		});
	});
	view.SimpleBoard._jTextarea.focus();
};
view.SimpleBoard.deleteEntry = function(jTarget) {
	var text = jp.saken.utils.Handy.getLimitText(jTarget.find(".text").text());
	var isOK = jp.saken.utils.Dom.window.confirm("「" + text + "」を削除してもよろしいですか？");
	if(!isOK) return;
	jTarget.remove();
	view.SimpleBoard.updateEntry("is_visible","0","id = " + Std.string(jTarget.data("id")));
};
view.SimpleBoard.checkEntry = function(jTarget,jCheckbox) {
	var id = jTarget.data("id");
	var myID = Manager.myID;
	var list = view.SimpleBoard._checkList[id];
	if(jCheckbox.prop("checked")) list.push(myID); else HxOverrides.remove(list,myID);
	var length = list.length + "";
	jTarget.find(".check").find("i").text(length);
	view.SimpleBoard.updateEntry("check_list",list.join(","),"id = " + id);
};
view.SimpleBoard.updateEntry = function(column,value,where) {
	view.SimpleBoard.getDatetime(function(datetime) {
		jp.saken.utils.Ajax.updateData("simpleboard",[column,"updatetime"],[value,datetime],where);
	});
};
view.SimpleBoard.getDatetime = function(onLoaded) {
	jp.saken.utils.Ajax.getDatetime(function(datetime) {
		view.SimpleBoard._lastUpdatetime = datetime;
		onLoaded(datetime);
	});
};
view.SimpleBoard.getEntryHTML = function(id,memberID,text,isChecked,checkLength) {
	var memberDB = db.Members.db[memberID];
	var isSelf = memberID == Manager.myID;
	var cls;
	if(isSelf) cls = " self"; else cls = "";
	var checkd;
	if(isChecked) checkd = " checked"; else checkd = "";
	var disabled;
	if(isSelf) disabled = " disabled"; else disabled = "";
	var html = "\n\t\t<li class=\"entry" + cls + "\" data-id=\"" + id + "\">\n\t\t\t<article class=\"article\">\n\t\t\t\t<input type=\"checkbox\" class=\"checkbox\"" + checkd + disabled + ">\n\t\t\t\t<b class=\"name " + Std.string(memberDB.parmanent_id) + " " + Std.string(memberDB.team) + "\">" + Std.string(memberDB.name) + "</b>\n\t\t\t\t<p class=\"text\">" + text + "</p>\n\t\t\t\t<button type=\"button\" class=\"delete\">×</button>\n\t\t\t\t<aside class=\"check\"><i>" + checkLength + "</i>人チェック済</aside>\n\t\t\t</article>\n\t\t</li>";
	return html;
};
view.StarChecker = function() { };
view.StarChecker.__name__ = true;
view.StarChecker.init = function() {
	jp.saken.utils.Dom.jWindow.on("click",view.StarChecker.onClickWindow);
	view.StarChecker._jParent = new js.JQuery("#starchecker").on("click",view.StarChecker.onClick);
	view.StarChecker._jContent = view.StarChecker._jParent.find("#starchecker-content");
	view.StarChecker._jFavicon = new js.JQuery("link.favicon");
	view.StarChecker._isOpen = false;
};
view.StarChecker.show = function() {
	view.StarChecker._jParent.fadeIn(300);
};
view.StarChecker.hide = function() {
	view.StarChecker.close();
	view.StarChecker.unset();
	view.StarChecker._lastData = null;
	view.StarChecker._jContent.empty();
	view.StarChecker._jParent.stop().hide();
};
view.StarChecker.onLoop = function() {
	jp.saken.utils.Ajax.getData("reports",["id","date","star_list"],function(data) {
		var length = data.length;
		if(length > 0) view.StarChecker.set(data);
		view.StarChecker._lastData = data;
	},"is_checked_star = 0 AND member_id = " + Manager.myID);
};
view.StarChecker.set = function(data) {
	if(view.StarChecker.getIsSame(data,view.StarChecker._lastData)) return;
	view.StarChecker._jParent.addClass("no-checked");
	view.StarChecker._jFavicon.prop("href","files/img/favicon_on.ico");
	var html = "";
	var myName = Manager.myName;
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var p = _g1++;
		var info = data[p];
		if(info.star_list.length == 0) continue;
		var id = info.id;
		var date = utils.Data.getDate(info.date);
		var stars = info.star_list.split(",");
		var length = stars.length;
		var search = myName + "," + date;
		var member1 = view.StarChecker.getMemberName(db.Members.db[stars[length - 1]]);
		var member2 = view.StarChecker.getMemberName(db.Members.db[stars[length - 2]]);
		var others = "";
		if(member2.length > 0) member2 = "と" + member2;
		if(length > 2) others = "他" + (length - 2) + "名";
		var string = "あなたの" + date + "の日報に" + member1 + member2 + others + "がスターを付けてます";
		html += "<li data-id=\"" + id + "\"><a class=\"search\" data-search=\"" + search + "\">" + string + "</a></li>";
		view.ReportViewer.updateStars(id,info.star_list);
	}
	view.StarChecker._jContent.html(html);
};
view.StarChecker.getMemberName = function(db) {
	if(db == null) return "";
	var name = db.name;
	return (name == null?"名無し":name.split(" ")[0]) + "さん";
};
view.StarChecker.unset = function() {
	view.StarChecker._jParent.removeClass("no-checked");
	view.StarChecker._jFavicon.prop("href","files/img/favicon.ico");
};
view.StarChecker.getIsSame = function(a,b) {
	if(view.StarChecker._lastData == null) return false;
	if(a.length != b.length) return false;
	var _g1 = 0;
	var _g = a.length;
	while(_g1 < _g) {
		var p = _g1++;
		var starA = a[p].star_list.split(",");
		var starB = b[p].star_list.split(",");
		if(starA[starA.length - 1] != starB[starB.length - 1]) return false;
	}
	return true;
};
view.StarChecker.onClick = function(event) {
	if(!view.StarChecker._jParent.hasClass("no-checked")) return;
	var jTarget = new js.JQuery(event.target);
	if(jTarget.hasClass("button")) view.StarChecker.toggleButton();
	if(jTarget.hasClass("search")) view.StarChecker.jump(jTarget);
};
view.StarChecker.onClickWindow = function(event) {
	var jTarget = new js.JQuery(event.target);
	if(jTarget.parents("#starchecker").length > 0) return;
	view.StarChecker.close();
};
view.StarChecker.toggleButton = function() {
	if(view.StarChecker._isOpen) view.StarChecker.close(); else view.StarChecker.open();
};
view.StarChecker.open = function() {
	view.StarChecker._isOpen = true;
	view.StarChecker._jContent.stop(true,true).slideDown(100);
};
view.StarChecker.close = function() {
	view.StarChecker._isOpen = false;
	view.StarChecker._jContent.stop(true,true).slideUp(100);
};
view.StarChecker.jump = function(jTarget) {
	var jParent = jTarget.parents("li");
	jp.saken.utils.Ajax.updateData("reports",["is_checked_star"],[1],"id = " + Std.string(jParent.data("id")));
	view.reportviewer.SearchNavi.input(jTarget.data("search"));
	jParent.remove();
	if(view.StarChecker._jContent.find("li").length == 0) {
		view.StarChecker.unset();
		view.StarChecker.close();
	}
};
view.reportviewer = {};
view.reportviewer.AutoSave = function() { };
view.reportviewer.AutoSave.__name__ = true;
view.reportviewer.AutoSave.init = function(jParent) {
	view.reportviewer.AutoSave._jParent = jParent;
};
view.reportviewer.AutoSave.onLoop = function() {
	var jReport = view.reportviewer.AutoSave._jParent.find(".report.edit-mode[data-id=\"0\"]");
	if(jReport.length == 0) return;
	var tasks = view.reportviewer.AutoSave.getTasks(jReport);
	var images = view.reportviewer.AutoSave.getImages(jReport);
	var note = jp.saken.utils.Handy.getReplacedSC(jReport.find(".note").find("textarea").prop("value"));
	var columns = ["tasks","note","images"];
	var values = [tasks,note,images];
	var joinData = values.join("+");
	if(view.reportviewer.AutoSave._joinData == joinData) return;
	view.reportviewer.AutoSave._joinData = joinData;
	view.reportviewer.AutoSave.update(Manager.myID,columns,values);
};
view.reportviewer.AutoSave.unsetData = function(jReport) {
	if(jReport.data("id") > 0) return;
	jp.saken.utils.Ajax.updateData("autosaves",["tasks","note","images"],["","",""],"member_id = " + Manager.myID);
};
view.reportviewer.AutoSave.setHTML = function(jReport) {
	jp.saken.utils.Ajax.getData("autosaves",["tasks","note","images"],function(data) {
		if(data.length == 0) return;
		var info = data[0];
		var tasks = info.tasks;
		var note = info.note;
		var images = info.images;
		if((tasks + note + images).length == 0) return;
		jReport.find(".tasks").html(view.reportviewer.AutoSave.getTasksHTML(tasks.split("\n")));
		jReport.find(".note").find("textarea").prop("value",note);
		jReport.find(".image").find("figure").html(view.reportviewer.AutoSave.getImagesHTML(images.split("\n")));
		view.ReportViewer.setTotaltime(jReport);
	},"member_id = " + Manager.myID);
};
view.reportviewer.AutoSave.getTasks = function(jReport) {
	var array = [];
	jReport.find(".tasks").find(".task").each(function() {
		var jTarget = $(this);
		var client = jTarget.find(".client").find("input").prop("value");
		var work = jTarget.find(".work").find("input").prop("value");
		var hour = jTarget.find(".hour").find("input").prop("value");
		array.push(client + "," + work + "," + hour);
	});
	return array.join("\n");
};
view.reportviewer.AutoSave.getImages = function(jReport) {
	var array = [];
	jReport.find(".image").find("figure").find("span").filter(":visible").each(function() {
		var jTarget = $(this);
		var filename = jTarget.data("filename");
		var src = jTarget.find("img").prop("src");
		array.push(filename + "#-----#" + src);
	});
	return array.join("\n");
};
view.reportviewer.AutoSave.update = function(myID,columns,values) {
	jp.saken.utils.Ajax.getIsEmpty("autosaves",function(isEmpty) {
		if(isEmpty) {
			columns.unshift("member_id");
			values.unshift(myID);
			jp.saken.utils.Ajax.insertData("autosaves",columns,values);
		} else jp.saken.utils.Ajax.updateData("autosaves",columns,values,"member_id = " + myID);
	},"member_id = " + myID);
};
view.reportviewer.AutoSave.getTasksHTML = function(tasks) {
	var html = "";
	var _g1 = 0;
	var _g = tasks.length;
	while(_g1 < _g) {
		var p = _g1++;
		var info = tasks[p];
		if(info.length == 0) continue;
		var array = info.split(",");
		html += view.reportviewer.Html.getTask([0,0,array[0],0,array[1],array[2]]);
	}
	return html;
};
view.reportviewer.AutoSave.getImagesHTML = function(images) {
	var html = "";
	var _g1 = 0;
	var _g = images.length;
	while(_g1 < _g) {
		var p = _g1++;
		var info = images[p];
		if(info.length == 0) continue;
		var array = info.split("#-----#");
		var src = array[1];
		var image = new Image();
		image.src = src;
		html += view.reportviewer.Html.getImage(array[0],src.split(";base64,")[1],image);
	}
	return html;
};
view.reportviewer.DragAndDrop = function(jParent) {
	this._onInner = false;
	this._jParent = jParent.on({ drop : $bind(this,this.onDrop), dragenter : $bind(this,this.onEnter), dragover : $bind(this,this.onOver), dragleave : $bind(this,this.onLeave)});
};
view.reportviewer.DragAndDrop.__name__ = true;
view.reportviewer.DragAndDrop.prototype = {
	onDrop: function(event) {
		var _g = this;
		var file = event.originalEvent.dataTransfer.files[0];
		var fileReader = new FileReader();
		var fileType = file.type.split("image/")[1];
		if(fileType == "jpeg") fileType = "jpg";
		fileReader.onload = function(event1) {
			_g.onLoaded(event1.target.result,fileType);
		};
		fileReader.readAsDataURL(file);
		this._jParent.removeClass("dragging");
		this.cancel(event);
		return false;
	}
	,onLoaded: function(src,fileType) {
		var _g = this;
		var image = new Image();
		image.src = src;
		image.onload = function(event) {
			if(image.width > 1200 || image.height > 960) {
				jp.saken.utils.Dom.window.alert("ファイルサイズが大き過ぎます。\nリサイズして再度お試しください。");
				return;
			}
			var filename = new Date().getTime() + "." + fileType;
			var base64 = src.split(";base64,")[1];
			_g._jParent.find(".image").find("figure").append(view.reportviewer.Html.getImage(filename,base64,image));
		};
	}
	,onEnter: function(event) {
		this._onInner = true;
		this.cancel(event);
		return false;
	}
	,onOver: function(event) {
		this._onInner = false;
		this._jParent.addClass("dragging");
		this.cancel(event);
		return false;
	}
	,onLeave: function(event) {
		if(this._onInner) this._onInner = false; else this._jParent.removeClass("dragging");
		this.cancel(event);
		return false;
	}
	,cancel: function(event) {
		event.preventDefault();
		event.stopPropagation();
	}
};
view.reportviewer.Html = function() { };
view.reportviewer.Html.__name__ = true;
view.reportviewer.Html.getReport = function(id,memberID,info,isEditMode) {
	if(isEditMode == null) isEditMode = false;
	var memberDB = db.Members.db[memberID];
	if(memberDB.is_visible == 0) return "";
	var myID = Manager.myID;
	var isSelf = memberID == myID;
	var cls;
	if(isSelf) cls = "self "; else cls = "";
	if(isEditMode) cls += "edit-mode ";
	var tasks;
	if(info.tasks) tasks = info.tasks.split(","); else tasks = null;
	var dates = info.dates;
	var date = dates[0];
	var day = dates[1];
	var note;
	if(info.note) note = info.note; else note = "";
	var images;
	if(info.images) images = info.images.split(","); else images = [];
	var updatetime;
	if(info.updatetime) updatetime = info.updatetime; else updatetime = "1999-01-01";
	var starts;
	if(info.stars) starts = info.stars.split(","); else starts = [];
	var archives;
	if(info.archives) archives = info.archives.split(","); else archives = [];
	var team = memberDB.team;
	var myParmanentID = Manager.myParmanentID;
	if(HxOverrides.indexOf(starts,myID,0) > -1) cls += "stared ";
	if(HxOverrides.indexOf(archives,myID,0) > -1) cls += "archived ";
	if(team.length == 0) team = memberDB.section;
	var html = "\n\t\t<li class=\"report " + cls + team + " loading\" data-id=\"" + id + "\">\n\t\t\t<article>\n\t\t\t\t<header class=\"header\">\n\t\t    \t\t<p class=\"name\"><a class=\"search\">" + Std.string(memberDB.name) + "</a></p>\n\t\t\t\t\t<aside>\n\t\t\t\t\t\t<time datetime=\"" + date + "\" class=\"datetime\"><a class=\"search\">" + date + "</a> <a class=\"search\">" + day + "</a></time>\n\t\t\t\t\t\t<button type=\"button\" class=\"edit\">編集</button>\n\t\t\t\t\t</aside>\n\t\t    \t</header>\n\t\t    \t<ul class=\"tasks\">" + view.reportviewer.Html.getTasks(tasks) + "</ul>" + view.reportviewer.Html.getTotaltime(tasks) + "\n\t\t\t\t<button type=\"button\" class=\"addTask\">+</button>\n\t\t\t\t<button type=\"button\" class=\"copyTask\">■</button>\n\t\t    \t<aside class=\"note\">\n\t\t    \t\t<p><textarea placeholder=\"今日のひとこと\">" + note + "</textarea><em>" + jp.saken.utils.Handy.getAdjustedHTML(note) + "</em></p>\n\t\t    \t</aside>\n\t\t    \t<aside class=\"image\">\n\t\t\t\t\t<p>画像をドロップしてください</p>\n\t\t    \t\t<figure>" + view.reportviewer.Html.getImages(images) + "</figure>\n\t\t    \t</aside>\n\t\t    \t<button type=\"button\" class=\"update\">&nbsp;</button>\n\t\t    \t<footer class=\"footer\">\n\t\t    \t\t<section class=\"star\">\n\t\t        \t\t<button type=\"button\" class=\"addStar\">★</button>\n\t\t        \t\t<ul>" + view.reportviewer.Html.getStars(starts) + "</ul>\n\t\t    \t\t</section>\n\t\t    \t\t<time datetime=\"" + utils.Data.getDate(updatetime) + "\" class=\"lastupdate\">" + Std.string(HxOverrides.strDate(updatetime)) + "</time>\n\t\t    \t\t<button type=\"button\" class=\"archiveReport\">×</button>\n\t\t    \t</footer>\n\t\t\t</article>\n\t\t</li>";
	return html;
};
view.reportviewer.Html.getTasks = function(tasks,isCopy) {
	if(isCopy == null) isCopy = false;
	var html = "";
	if(tasks == null) tasks = [0];
	var _g1 = 0;
	var _g = tasks.length;
	while(_g1 < _g) {
		var p = _g1++;
		var taskID = tasks[p];
		if(taskID > 0) {
			var taskInfo = db.Tasks.db[taskID];
			var workID = taskInfo.work_id;
			var workInfo = db.Works.db[workID];
			var clientID = workInfo.client_id;
			var clientInfo = db.Clients.db[clientID];
			html += view.reportviewer.Html.getTask([isCopy?"0":taskID,clientID,clientInfo.name,workID,workInfo.name,taskInfo.hour]);
		} else html += view.reportviewer.Html.getTask(null);
	}
	return html;
};
view.reportviewer.Html.getTask = function(info) {
	var taskID;
	var clientID;
	var clientName;
	var workID;
	var workName;
	var hour;
	if(view.reportviewer.Html._taskCounter == null) view.reportviewer.Html._taskCounter = 0;
	view.reportviewer.Html._taskCounter++;
	if(info == null) {
		taskID = clientID = workID = "0";
		clientName = workName = hour = "";
	} else {
		taskID = info[0];
		clientID = info[1];
		clientName = info[2];
		workID = info[3];
		workName = info[4];
		hour = info[5];
	}
	var clientDatalistID = "clientDatalist-" + view.reportviewer.Html._taskCounter;
	var workDatalistID = "workDatalist" + view.reportviewer.Html._taskCounter;
	return "\n\t\t\t<li class=\"task\" data-id=\"" + taskID + "\">\n\t\t    \t<span class=\"client\" data-id=\"" + clientID + "\">\n\t\t\t\t\t<input type=\"search\" autocomplete=\"on\" placeholder=\"クライアント名\" value=\"" + clientName + "\" list=\"client-datalist\">\n\t\t\t\t\t<em><a class=\"search\">" + clientName + "</a></em>\n\t\t\t\t</span>\n\t\t    \t<span class=\"work\" data-id=\"" + workID + "\">\n\t\t\t\t\t<input type=\"search\" autocomplete=\"on\" placeholder=\"案件名\" value=\"" + workName + "\" list=\"work-datalist\">\n\t\t\t\t\t<em><a class=\"search\">" + workName + "</a></em>\n\t\t\t\t</span>\n\t\t    \t<span class=\"hour\">\n\t\t\t\t\t<input type=\"number\" min=\"0.5\" step=\"0.5\" placeholder=\"時間\" value=\"" + hour + "\">\n\t\t\t\t\t<em>" + hour + "</em>\n\t\t\t\t</span>\n\t\t\t\t<button type=\"button\" class=\"clearTask\">×</button>\n\t\t\t\t<button type=\"button\" class=\"upTask\">↑</button>\n\t\t\t\t<button type=\"button\" class=\"downTask\">↓</button>\n\t\t    </li>";
};
view.reportviewer.Html.getImage = function(filename,base64,image) {
	if(base64 == null) base64 = "";
	var fileURL = "files/upload/" + filename;
	var jWrap = new js.JQuery("<span data-filename=\"" + filename + "\" data-base64=\"" + base64 + "\">");
	var jAnchor = jWrap.html("<a class=\"lightbox\"></a>").find("a");
	if(image == null) jAnchor.prop("href",fileURL).html("<img src=\"" + fileURL + "\">"); else jAnchor.append(image);
	jWrap.append("<button type=\"button\" class=\"deleteImage\">×</button>");
	return new js.JQuery("<div>").append(jWrap).html();
};
view.reportviewer.Html.getStars = function(stars) {
	var html = "";
	var length = stars.length;
	if(length > 20) return "<li>★×" + length + "</li>";
	var membersDB = db.Members.db;
	var myID = Manager.myID;
	var _g = 0;
	while(_g < length) {
		var p = _g++;
		var id = stars[p];
		var cls;
		if(id == myID) cls = " class=\"mine\""; else cls = "";
		var member = membersDB[id];
		if(member == null) continue;
		html += "<li" + cls + " title=\"" + Std.string(member.parmanent_id) + "\">★</li>";
	}
	return html;
};
view.reportviewer.Html.getTotaltime = function(tasks) {
	var totaltime = 0;
	if(tasks == null) tasks = [0];
	var _g1 = 0;
	var _g = tasks.length;
	while(_g1 < _g) {
		var p = _g1++;
		var taskID = tasks[p];
		if(taskID > 0) totaltime += Std.parseFloat(db.Tasks.db[taskID].hour);
	}
	totaltime = Math.ceil(totaltime * 10) / 10;
	return "<p class=\"totaltime\"><span>" + totaltime + "</span>h</p>";
};
view.reportviewer.Html.getDatalist = function(data) {
	var html = "";
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var p = _g1++;
		var info = data[p];
		if(info != null) {
			var clientID = info.client_id;
			var prop;
			if(clientID == null) prop = ""; else prop = " data-clientid=\"" + clientID + "\"";
			html += "<option value=\"" + Std.string(info.name) + "\" data-id=\"" + Std.string(info.id) + "\"" + prop + "></option>";
		}
	}
	return html;
};
view.reportviewer.Html.getImages = function(images) {
	var html = "";
	var _g1 = 0;
	var _g = images.length;
	while(_g1 < _g) {
		var p = _g1++;
		html += view.reportviewer.Html.getImage(images[p]);
	}
	return html;
};
view.reportviewer.Html2 = function() { };
view.reportviewer.Html2.__name__ = true;
view.reportviewer.Html2.getReport = function(info) {
	var id = info.id;
	var member = info.member;
	var tasks = info.task_list;
	var note = info.note;
	var images = info.image_list;
	var date = utils.Data.getDate(info.date);
	var day = utils.Data.getDay(info.date);
	var updatetime = info.updatetime;
	var stars = info.star_list;
	var isSelf = Manager.myID == member.id;
	var cls;
	if(isSelf) cls = "self "; else cls = "";
	var html = "\n\t\t<li class=\"report " + cls + Std.string(member.team) + " loading\" data-id=\"" + id + "\">\n\t\t\t<article>\n\t\t\t\t<header class=\"header\">\n\t\t    \t\t<p class=\"name\"><a class=\"search\">" + Std.string(member.name) + "</a></p>\n\t\t\t\t\t<aside>\n\t\t\t\t\t\t<time datetime=\"" + date + "\" class=\"datetime\"><a class=\"search\">" + date + "</a> <a class=\"search\">" + day + "</a></time>\n\t\t\t\t\t\t<button type=\"button\" class=\"edit\">編集</button>\n\t\t\t\t\t</aside>\n\t\t    \t</header>\n\t\t    \t<ul class=\"tasks\">" + view.reportviewer.Html2.getTasks(tasks) + "</ul>" + view.reportviewer.Html2.getTotaltime(tasks) + "\n\t\t\t\t<button type=\"button\" class=\"addTask\">+</button>\n\t\t\t\t<button type=\"button\" class=\"copyTask\">■</button>\n\t\t    \t<aside class=\"note\">\n\t\t    \t\t<p><textarea placeholder=\"今日のひとこと\">" + note + "</textarea><em>" + jp.saken.utils.Handy.getAdjustedHTML(note) + "</em></p>\n\t\t    \t</aside>\n\t\t    \t<aside class=\"image\">\n\t\t\t\t\t<p>画像をドロップしてください</p>\n\t\t    \t\t<figure>" + view.reportviewer.Html2.getImages(images) + "</figure>\n\t\t    \t</aside>\n\t\t    \t<button type=\"button\" class=\"update\">&nbsp;</button>\n\t\t    \t<footer class=\"footer\">\n\t\t    \t\t<section class=\"star\">\n\t\t        \t\t<button type=\"button\" class=\"addStar\">★</button>\n\t\t        \t\t<ul>" + view.reportviewer.Html2.getStars(stars) + "</ul>\n\t\t    \t\t</section>\n\t\t    \t\t<time datetime=\"" + utils.Data.getDate(updatetime) + "\" class=\"lastupdate\">" + Std.string(HxOverrides.strDate(updatetime)) + "</time>\n\t\t    \t\t<button type=\"button\" class=\"archiveReport\">×</button>\n\t\t    \t</footer>\n\t\t\t</article>\n\t\t</li>";
	return html;
};
view.reportviewer.Html2.getTasks = function(tasks) {
	var html = "";
	var _g1 = 0;
	var _g = tasks.length;
	while(_g1 < _g) {
		var i = _g1++;
		var task = tasks[i];
		if(view.reportviewer.Html2._taskCounter == null) view.reportviewer.Html2._taskCounter = 0;
		view.reportviewer.Html2._taskCounter++;
		var clientDatalistID = "clientDatalist-" + view.reportviewer.Html2._taskCounter;
		var workDatalistID = "workDatalist" + view.reportviewer.Html2._taskCounter;
		html += "\n\t\t\t\t<li class=\"task\" data-id=\"" + Std.string(task.id) + "\">\n\t\t\t    \t<span class=\"client\" data-id=\"" + Std.string(task.client.id) + "\">\n\t\t\t\t\t\t<input type=\"search\" autocomplete=\"on\" placeholder=\"クライアント名\" value=\"" + Std.string(task.client.name) + "\">\n\t\t\t\t\t\t<em><a class=\"search\">" + Std.string(task.client.name) + "</a></em>\n\t\t\t\t\t</span>\n\t\t\t    \t<span class=\"work\" data-id=\"" + Std.string(task.work.id) + "\">\n\t\t\t\t\t\t<input type=\"search\" autocomplete=\"on\" placeholder=\"案件名\" value=\"" + Std.string(task.work.name) + "\">\n\t\t\t\t\t\t<em><a class=\"search\">" + Std.string(task.work.name) + "</a></em>\n\t\t\t\t\t</span>\n\t\t\t    \t<span class=\"hour\">\n\t\t\t\t\t\t<input type=\"number\" min=\"0.5\" step=\"0.5\" placeholder=\"時間\" value=\"" + Std.string(task.hour) + "\">\n\t\t\t\t\t\t<em>" + Std.string(task.hour) + "</em>\n\t\t\t\t\t</span>\n\t\t\t\t\t<button type=\"button\" class=\"clearTask\">×</button>\n\t\t\t\t\t<button type=\"button\" class=\"upTask\">↑</button>\n\t\t\t\t\t<button type=\"button\" class=\"downTask\">↓</button>\n\t\t\t    </li>";
	}
	return html;
};
view.reportviewer.Html2.getImage = function(filename,base64,image) {
	if(base64 == null) base64 = "";
	var fileURL = "files/upload/" + filename;
	var jWrap = new js.JQuery("<span data-filename=\"" + filename + "\" data-base64=\"" + base64 + "\">");
	var jAnchor = jWrap.html("<a class=\"lightbox\"></a>").find("a");
	if(image == null) jAnchor.prop("href",fileURL).html("<img src=\"" + fileURL + "\">"); else jAnchor.append(image);
	jWrap.append("<button type=\"button\" class=\"deleteImage\">×</button>");
	return new js.JQuery("<div>").append(jWrap).html();
};
view.reportviewer.Html2.getStars = function(stars) {
	var html = "";
	var length = stars.length;
	if(length > 20) return "<li>★×" + length + "</li>";
	var myParmanentID = Manager.myParmanentID;
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		var parmanentID = stars[i];
		var cls;
		if(parmanentID == myParmanentID) cls = " class=\"mine\""; else cls = "";
		html += "<li" + cls + " title=\"" + parmanentID + "\">★</li>";
	}
	return html;
};
view.reportviewer.Html2.getTotaltime = function(tasks) {
	var result = 0;
	var _g1 = 0;
	var _g = tasks.length;
	while(_g1 < _g) {
		var i = _g1++;
		var task = tasks[i];
		result += Std.parseFloat(task.hour);
	}
	result = Math.ceil(result * 10) / 10;
	return "<p class=\"totaltime\"><span>" + result + "</span>h</p>";
};
view.reportviewer.Html2.getDatalist = function(data) {
	var html = "";
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var p = _g1++;
		var info = data[p];
		if(info != null) {
			var clientID = info.client_id;
			var prop;
			if(clientID == null) prop = ""; else prop = " data-clientid=\"" + clientID + "\"";
			html += "<option value=\"" + Std.string(info.name) + "\" data-id=\"" + Std.string(info.id) + "\"" + prop + "></option>";
		}
	}
	return html;
};
view.reportviewer.Html2.getImages = function(images) {
	var html = "";
	var _g1 = 0;
	var _g = images.length;
	while(_g1 < _g) {
		var p = _g1++;
		html += view.reportviewer.Html2.getImage(images[p]);
	}
	return html;
};
view.reportviewer.ReportEditor = function() { };
view.reportviewer.ReportEditor.__name__ = true;
view.reportviewer.ReportEditor.update = function(jParent) {
	if(view.reportviewer.ReportEditor._isUpdating) {
		jp.saken.utils.Dom.window.alert("更新中です。");
		return;
	}
	view.reportviewer.ReportEditor._jParent = jParent;
	view.reportviewer.ReportEditor._jTasks = view.reportviewer.ReportEditor._jParent.find(".tasks");
	view.reportviewer.ReportEditor._jTaskList = view.reportviewer.ReportEditor._jTasks.find(".task");
	if(!view.reportviewer.ReportEditor.getIsFull()) {
		jp.saken.utils.Dom.window.alert("空欄があります。");
		return;
	}
	view.reportviewer.ReportEditor._isUpdating = true;
	view.reportviewer.ReportEditor._jParent.addClass("updating").unbind().find("article").stop().css({ opacity : .3});
	view.reportviewer.ReportEditor.updateTasks();
	view.reportviewer.ReportEditor.updateImages();
	view.reportviewer.AutoSave.unsetData(jParent);
};
view.reportviewer.ReportEditor.setEditMode = function(jParent) {
	new view.reportviewer.DragAndDrop(jParent);
	jParent.stop().addClass("edit-mode").animate({ width : 628},300);
	jParent.find("article").stop().css({ opacity : .3}).animate({ opacity : 1},1000);
};
view.reportviewer.ReportEditor.cancel = function() {
	view.reportviewer.ReportEditor._isUpdating = false;
	view.reportviewer.ReportEditor._jParent.stop().removeClass("updating");
	view.reportviewer.ReportEditor._jParent.find("article").stop().animate({ opacity : 1},300);
	view.reportviewer.ReportEditor._jTaskList.unbind();
};
view.reportviewer.ReportEditor.getIsFull = function() {
	if(view.reportviewer.ReportEditor._jTaskList.length > 1) {
		var _g1 = 0;
		var _g = view.reportviewer.ReportEditor._jTaskList.length;
		while(_g1 < _g) {
			var p = _g1++;
			var jTask = view.reportviewer.ReportEditor._jTaskList.eq(p);
			var isEmpty = [true];
			jTask.find("input").each((function(isEmpty) {
				return function() {
					if($(this).prop("value").length > 0) isEmpty[0] = false;
				};
			})(isEmpty));
			if(isEmpty[0]) jTask.remove();
		}
	}
	view.reportviewer.ReportEditor._jTaskList = view.reportviewer.ReportEditor._jTasks.find(".task");
	var isFull = true;
	view.reportviewer.ReportEditor._jTaskList.find("input").each(function() {
		if($(this).prop("value").length == 0) isFull = false;
	});
	return isFull;
};
view.reportviewer.ReportEditor.updateTasks = function() {
	var counter = view.reportviewer.ReportEditor._jTaskList.length;
	var onUpdated = function(event) {
		counter--;
		if(counter == 0) view.reportviewer.ReportEditor.updateData();
	};
	var _g = 0;
	while(_g < counter) {
		var p = _g++;
		var jTask = view.reportviewer.ReportEditor._jTaskList.eq(p).unbind().on("updated",onUpdated);
		new view.reportviewer.Task(jTask);
	}
};
view.reportviewer.ReportEditor.updateImages = function() {
	var jImages = view.reportviewer.ReportEditor._jParent.find(".image").find("figure").find("span");
	if(jImages.length == 0) return;
	var _g1 = 0;
	var _g = jImages.length;
	while(_g1 < _g) {
		var p = _g1++;
		var jTarget = jImages.eq(p);
		var filename = jTarget.data("filename");
		if(jTarget.hasClass("hidden")) {
			jTarget.remove();
			jp.saken.utils.Ajax.deleteImage(filename);
		} else {
			var base64 = jTarget.data("base64");
			if(base64.length > 0) {
				jp.saken.utils.Ajax.uploadImage(filename,base64);
				jTarget.find(".lightbox").prop("href","files/upload/" + filename);
			}
		}
	}
};
view.reportviewer.ReportEditor.updateData = function() {
	var id = view.reportviewer.ReportEditor._jParent.data("id");
	var jNote = view.reportviewer.ReportEditor._jParent.find(".note");
	var jImages = view.reportviewer.ReportEditor._jParent.find(".image").find("figure").find("span");
	var note = jp.saken.utils.Handy.getReplacedSC(jNote.find("textarea").prop("value"));
	var taskIDs = [];
	var images = [];
	var _g1 = 0;
	var _g = view.reportviewer.ReportEditor._jTaskList.length;
	while(_g1 < _g) {
		var p = _g1++;
		taskIDs.push(view.reportviewer.ReportEditor._jTaskList.eq(p).data("id"));
	}
	var _g11 = 0;
	var _g2 = jImages.length;
	while(_g11 < _g2) {
		var p1 = _g11++;
		images.push(jImages.eq(p1).data("filename"));
	}
	jNote.find("em").html(jp.saken.utils.Handy.getAdjustedHTML(note));
	jp.saken.utils.Ajax.getDatetime(function(datetime) {
		var colums = view.reportviewer.ReportEditor.COLUMN_LIST;
		var values = [Manager.myID,taskIDs.join(","),note,images.join(","),datetime,""];
		view.reportviewer.ReportEditor._jParent.find(".lastupdate").text(Std.string(HxOverrides.strDate(datetime)));
		if(id > 0) jp.saken.utils.Ajax.updateData("reports",colums,values,"id = " + id,view.reportviewer.ReportEditor.onUpdated); else {
			colums = colums.concat(["date"]);
			values.push(datetime);
			jp.saken.utils.Ajax.insertData("reports",colums,values,view.reportviewer.ReportEditor.onInsertedData);
		}
	});
};
view.reportviewer.ReportEditor.onInsertedData = function(lastID) {
	view.reportviewer.ReportEditor._jParent.data("id",lastID);
	view.reportviewer.ReportEditor.onUpdated();
};
view.reportviewer.ReportEditor.onUpdated = function() {
	view.reportviewer.ReportEditor._isUpdating = false;
	var classes = "edit-mode" + " " + "updating";
	view.reportviewer.ReportEditor._jParent.stop().removeClass(classes).animate({ width : 298},300);
	view.reportviewer.ReportEditor._jParent.find("article").stop().animate({ opacity : 1},1000);
};
view.reportviewer.Scrollbar = function() { };
view.reportviewer.Scrollbar.__name__ = true;
view.reportviewer.Scrollbar.init = function(jTarget) {
	view.reportviewer.Scrollbar._jTarget = jTarget;
	jp.saken.utils.Dom.jWindow.on("scroll",view.reportviewer.Scrollbar.onScroll);
};
view.reportviewer.Scrollbar.onScroll = function(event) {
	var y = jp.saken.utils.Dom.jWindow.scrollTop();
	var t = view.reportviewer.Scrollbar._jTarget.position().top + view.reportviewer.Scrollbar._jTarget.height();
	var h = view.reportviewer.Scrollbar._jTarget.find(".report").first().height();
	if(y - t > 100 - h * 2) view.ReportViewer.loadMore();
};
view.reportviewer.SearchNavi = function() { };
view.reportviewer.SearchNavi.__name__ = true;
view.reportviewer.SearchNavi.init = function(jParent) {
	view.reportviewer.SearchNavi._jInput = jParent.find("input").on("keydown",view.reportviewer.SearchNavi.onKeydown);
	jParent.find(".clear").on("click",view.reportviewer.SearchNavi.clear);
};
view.reportviewer.SearchNavi.input = function(value) {
	view.reportviewer.SearchNavi._jInput.prop("value",value);
	view.ReportViewer.search(value);
	view.reportviewer.SortNavi.clear();
};
view.reportviewer.SearchNavi.clear = function(event) {
	view.reportviewer.SearchNavi._jInput.prop("value","");
};
view.reportviewer.SearchNavi.onKeydown = function(event) {
	if(event.keyCode == 13) {
		view.ReportViewer.search(view.reportviewer.SearchNavi._jInput.prop("value"));
		return false;
	}
};
view.reportviewer.SortNavi = function() { };
view.reportviewer.SortNavi.__name__ = true;
view.reportviewer.SortNavi.init = function(jParent) {
	view.reportviewer.SortNavi._jButtons = jParent.find("button").on("mousedown",view.reportviewer.SortNavi.onMousedown);
};
view.reportviewer.SortNavi.showNew = function() {
	view.reportviewer.SortNavi._jButtons.filter(".new").trigger("mousedown");
};
view.reportviewer.SortNavi.clear = function() {
	view.reportviewer.SortNavi._jButtons.removeClass("active");
};
view.reportviewer.SortNavi.onMousedown = function(event) {
	var jTarget = new js.JQuery(event.target);
	if(jTarget.hasClass("active")) return;
	view.reportviewer.SearchNavi.clear();
	var jParent = jTarget.parents("ul");
	jParent.find("button").removeClass("active");
	var cls = jTarget.prop("class");
	jTarget.addClass("active");
	view.ReportViewer.showReports(cls);
};
view.reportviewer.Task = function(jParent) {
	var _g = this;
	this._jParent = jParent;
	this._id = jParent.data("id");
	var jClient = jParent.find(".client");
	var jWork = jParent.find(".work");
	var jHour = jParent.find(".hour");
	this._clientName = jClient.find("input").prop("value");
	this._workName = jWork.find("input").prop("value");
	this._hour = jHour.find("input").prop("value");
	this._jParent.on({ getWorkID : function(event) {
		_g.update();
	}, getClientID : function(event1) {
		_g.judgeIsEmpty("works",_g._workName,"案件");
	}});
	jClient.find(".search").text(this._clientName);
	jWork.find(".search").text(this._workName);
	jHour.find("em").text(this._hour);
	this.judgeIsEmpty("clients",this._clientName,"クライアント");
};
view.reportviewer.Task.__name__ = true;
view.reportviewer.Task.prototype = {
	judgeIsEmpty: function(table,name,string) {
		var _g = this;
		jp.saken.utils.Ajax.getIsEmpty(table,function(isEmpty) {
			if(isEmpty) _g.addData(table,name,string); else _g.getData(table,name);
		},this.getWhere(name,table == "works"));
	}
	,addData: function(table,name,string) {
		var _g = this;
		var isOK = jp.saken.utils.Dom.window.confirm(string + "に「" + name + "」を追加しますか？");
		if(isOK) {
			var columns = [];
			var values = [];
			if(table == "clients") {
				columns = ["name"];
				values = [name];
			} else if(table == "works") {
				columns = ["client_id,name"];
				values = [this._clientID,name];
			}
			jp.saken.utils.Ajax.insertData(table,columns,values,function(lastID) {
				_g.getData(table,name);
			});
		} else view.reportviewer.ReportEditor.cancel();
	}
	,getData: function(table,name) {
		var _g = this;
		jp.saken.utils.Ajax.getData(table,["id"],function(data) {
			if(table == "clients") {
				_g._clientID = data[0].id;
				_g._jParent.trigger("getClientID");
			} else if(table == "works") {
				_g._workID = data[0].id;
				_g._jParent.trigger("getWorkID");
			}
		},this.getWhere(name,table == "works"));
	}
	,getWhere: function(name,isWork) {
		var where = "name = \"" + name + "\"";
		if(isWork) where += " AND client_id = \"" + this._clientID + "\"";
		return where;
	}
	,update: function() {
		var _g = this;
		jp.saken.utils.Ajax.getDatetime(function(datetime) {
			var myID = Manager.myID;
			var table = "tasks";
			var columns = ["member_id","work_id","hour","updatetime"];
			var values = [myID,_g._workID,_g._hour,datetime];
			if(_g._id > 0) jp.saken.utils.Ajax.updateData(table,columns,values,"id = " + _g._id,function() {
				_g._jParent.trigger("updated");
			}); else jp.saken.utils.Ajax.insertData(table,columns,values,function(lastID) {
				_g._jParent.data("id",lastID).trigger("updated");
			});
		});
	}
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i1) {
	return isNaN(i1);
};
String.__name__ = true;
Array.__name__ = true;
Date.__name__ = ["Date"];
var q = window.jQuery;
js.JQuery = q;
db.Clients.TABLE_NAME = "clients";
db.Clients.COLUMN_LIST = ["id","name"];
db.Members.TABLE_NAME = "members";
db.Members.COLUMN_LIST = ["id","parmanent_id","name","section","team","is_visible"];
db.Tasks.TABLE_NAME = "tasks";
db.Tasks.COLUMN_LIST = ["id","member_id","work_id","hour"];
db.Works.TABLE_NAME = "works";
db.Works.COLUMN_LIST = ["id","client_id","name"];
jp.saken.ui.Lightbox.ID = "lightbox";
jp.saken.utils.API.PATH = "/api/";
jp.saken.utils.Ajax.PATH = "files/php/";
jp.saken.utils.Dom.document = window.document;
jp.saken.utils.Dom.window = window;
jp.saken.utils.Dom.jWindow = new js.JQuery(jp.saken.utils.Dom.window);
jp.saken.utils.Dom.body = jp.saken.utils.Dom.document.body;
jp.saken.utils.Dom.jBody = new js.JQuery(jp.saken.utils.Dom.body);
jp.saken.utils.Dom.userAgent = jp.saken.utils.Dom.window.navigator.userAgent;
utils.Data.DAY_LIST = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
utils.Data.UPLOAD_FOLDER = "files/upload/";
view.Login.COOKIE_NAME = "DR2LoginHistory2";
view.ReportViewer.TABLE_NAME = "reports";
view.ReportViewer.LENGTH_AT_ONCE = 10;
view.SimpleBoard.TABLE_NAME = "simpleboard";
view.StarChecker.TABLE_NAME = "reports";
view.StarChecker.FAVICON_OFF = "files/img/favicon.ico";
view.StarChecker.FAVICON_ON = "files/img/favicon_on.ico";
view.reportviewer.AutoSave.TABLE_NAME = "autosaves";
view.reportviewer.DragAndDrop.MAX_IMAGE_WIDTH = 1200;
view.reportviewer.DragAndDrop.MAX_IMAGE_HEIGHT = 960;
view.reportviewer.ReportEditor.TABLE_NAME = "reports";
view.reportviewer.ReportEditor.COLUMN_LIST = ["member_id","task_id_list","note","image_list","updatetime","archived_list"];
view.reportviewer.ReportEditor.EDIT_MODE_CLASS = "edit-mode";
view.reportviewer.ReportEditor.UPDATING_CLASS = "updating";
view.reportviewer.ReportEditor.READ_MODE_WIDTH = 298;
view.reportviewer.ReportEditor.EDIT_MODE_WIDTH = 628;
Main.main();
})();
