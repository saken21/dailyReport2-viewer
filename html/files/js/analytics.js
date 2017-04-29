(function () { "use strict";
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
var Lambda = function() { };
Lambda.__name__ = true;
Lambda.exists = function(it,f) {
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) return true;
	}
	return false;
};
Lambda.filter = function(it,f) {
	var l = new List();
	var $it0 = it.iterator();
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
var IMap = function() { };
IMap.__name__ = true;
Math.__name__ = true;
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
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
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
haxe.ds = {};
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
};
var jp = {};
jp.saken = {};
jp.saken.utils = {};
jp.saken.utils.Ajax = function() { };
jp.saken.utils.Ajax.__name__ = true;
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
		var p = _g1++;
		var i = p * num;
		results.push(array.slice(i,i + num));
	}
	return results;
};
jp.saken.utils.Handy.shuffleArray = function(array) {
	var copy = array.slice();
	var results = [];
	var length = copy.length;
	var _g = 0;
	while(_g < length) {
		var p = _g++;
		var index = Math.floor(Math.random() * length);
		results.push(copy[index]);
		copy.splice(index,1);
	}
	return results;
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
var src = {};
src.Main = function() { };
src.Main.__name__ = true;
src.Main.main = function() {
	new js.JQuery("document").ready(src.Manager.init);
};
src.Manager = function() { };
src.Manager.__name__ = true;
src.Manager.init = function(event) {
	jp.saken.utils.Dom.jWindow.on("loadDB",src.Manager.onLoadedDB);
	src.db.Members.load();
	src.db.Works.load();
	src.db.Clients.load();
};
src.Manager.onLoadedDB = function(event) {
	jp.saken.utils.Dom.jWindow.unbind("loadDB",src.Manager.onLoadedDB);
	src.datalist.Clientlist.init();
	src.datalist.Worklist.init();
	src.view.Form.init();
	src.view.Result.init();
	src.utils.Csv.init();
};
src.datalist = {};
src.datalist.Clientlist = function() { };
src.datalist.Clientlist.__name__ = true;
src.datalist.Clientlist.init = function() {
	var jParent = new js.JQuery("#clientlist").html(src.datalist.Datalist.getHTML(src.db.Clients.getDB()));
	src.datalist.Clientlist._jOptions = jParent.find("option");
};
src.datalist.Clientlist.getID = function(value) {
	return src.datalist.Clientlist._jOptions.not("disabled").filter("[value=\"" + value + "\"]").data("id");
};
src.datalist.Datalist = function() { };
src.datalist.Datalist.__name__ = true;
src.datalist.Datalist.getHTML = function(data) {
	var html = "";
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var p = _g1++;
		var info = data[p];
		if(info == null) continue;
		var id = info.id;
		var clientID = info.client_id;
		var team = info.team;
		var dataClient;
		if(clientID == null) dataClient = ""; else dataClient = " data-clientid=\"" + clientID + "\"";
		var dataTeam;
		if(team == null) dataTeam = ""; else dataTeam = " data-team=\"" + team + "\"";
		html += "<option value=\"" + Std.string(info.name) + "\" data-id=\"" + id + "\"" + dataClient + dataTeam + "></option>";
	}
	return html;
};
src.datalist.Worklist = function() { };
src.datalist.Worklist.__name__ = true;
src.datalist.Worklist.init = function() {
	var jParent = new js.JQuery("#worklist").html(src.datalist.Datalist.getHTML(src.db.Works.getDB()));
	src.datalist.Worklist._jOptions = jParent.find("option");
};
src.datalist.Worklist.select = function(clientID) {
	if(clientID == null) src.datalist.Worklist._jOptions.prop("disabled",false); else {
		src.datalist.Worklist._jOptions.prop("disabled",true);
		src.datalist.Worklist._jOptions.filter("[data-clientid=\"" + clientID + "\"]").prop("disabled",false);
	}
	src.view.Form.setInput("work");
};
src.datalist.Worklist.getID = function(value) {
	return src.datalist.Worklist._jOptions.not("disabled").filter("[value=\"" + value + "\"]").data("id");
};
src.db = {};
src.db.Clients = function() { };
src.db.Clients.__name__ = true;
src.db.Clients.load = function() {
	src.db.Clients._database = new src.db.Database("clients",src.db.Clients.COLUMN_LIST);
};
src.db.Clients.getDB = function() {
	return src.db.Clients._database.getDB();
};
src.db.Database = function(table,columns,where) {
	if(where == null) where = "";
	var _g2 = this;
	this._db = [];
	if(src.db.Database._counter == null) src.db.Database._counter = 0;
	src.db.Database._counter++;
	jp.saken.utils.Ajax.getData(table,columns,function(data) {
		var _g1 = 0;
		var _g = data.length;
		while(_g1 < _g) {
			var p = _g1++;
			var obj = data[p];
			_g2._db[obj.id] = obj;
		}
		src.db.Database._counter--;
		if(src.db.Database._counter == 0) jp.saken.utils.Dom.jWindow.trigger("loadDB");
	},where);
};
src.db.Database.__name__ = true;
src.db.Database.prototype = {
	getDB: function() {
		return this._db;
	}
};
src.db.Members = function() { };
src.db.Members.__name__ = true;
src.db.Members.load = function() {
	src.db.Members._database = new src.db.Database("members",src.db.Members.COLUMN_LIST);
};
src.db.Members.getDB = function() {
	return src.db.Members._database.getDB();
};
src.db.Works = function() { };
src.db.Works.__name__ = true;
src.db.Works.load = function() {
	src.db.Works._database = new src.db.Database("works",src.db.Works.COLUMN_LIST);
};
src.db.Works.getDB = function() {
	return src.db.Works._database.getDB();
};
src.utils = {};
src.utils.Csv = function() { };
src.utils.Csv.__name__ = true;
src.utils.Csv.init = function() {
	src.utils.Csv._jParent = new js.JQuery("#csv");
	jp.saken.utils.Dom.jWindow.on("beforeunload",src.utils.Csv.deleteCSV);
	src.utils.Csv.deleteCSV();
};
src.utils.Csv["export"] = function(data) {
	src.utils.Csv.http(src.utils.Csv.getAdjusted(data).join("\n"));
};
src.utils.Csv.getAdjusted = function(data) {
	var array = [];
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var p = _g1++;
		array.push(data[p].join(","));
	}
	return array;
};
src.utils.Csv.http = function(data) {
	var http = new haxe.Http("files/php/exportCSV.php");
	http.onData = src.utils.Csv.onExported;
	http.setParameter("data",data);
	http.setParameter("filename","data.csv");
	http.request(true);
};
src.utils.Csv.onExported = function(result) {
	var jAnchor = new js.JQuery("<a>");
	jAnchor.prop("download","data.csv");
	jAnchor.prop("href","files/php/csv/" + "data.csv");
	jAnchor.prop("target","_blank");
	jAnchor.addClass("download").text("→ Download " + "data.csv");
	src.utils.Csv._jParent.html(jAnchor);
};
src.utils.Csv.deleteCSV = function(event) {
	new haxe.Http("files/php/deleteCSV.php").request(true);
};
src.view = {};
src.view.Form = function() { };
src.view.Form.__name__ = true;
src.view.Form.init = function() {
	src.view.Form._jParent = new js.JQuery("#form").addClass("onReady");
	src.view.Form._jInputs = src.view.Form._jParent.find("input");
	var now = jp.saken.utils.Handy.getPastDate((function($this) {
		var $r;
		var _this = new Date();
		$r = HxOverrides.dateStr(_this);
		return $r;
	}(this)),0);
	src.view.Form._jInputs.filter(".time").prop("max",now).filter(".totime").prop("value",now);
	src.view.Form._jInputs.on("change",src.view.Form.onChange);
	src.view.Form._jParent.find(".submit").on("click",src.view.Form.submit);
};
src.view.Form.setInput = function(cls,value) {
	if(value == null) value = "";
	src.view.Form._jInputs.filter("." + cls).prop("value",value);
};
src.view.Form.onChange = function(event) {
	var jTarget = new js.JQuery(event.target);
	var value = jTarget.prop("value");
	if(jTarget.hasClass("client")) src.datalist.Worklist.select(src.datalist.Clientlist.getID(value));
	if(jTarget.hasClass("fromtime")) src.view.Form._jInputs.filter(".totime").prop("min",value);
};
src.view.Form.submit = function(event) {
	if(!src.view.Form._jParent.hasClass("onReady")) return false;
	var clientName = src.view.Form._jInputs.filter(".client").prop("value");
	var workName = src.view.Form._jInputs.filter(".work").prop("value");
	var fromtime = src.view.Form._jInputs.filter(".fromtime").prop("value");
	var totime = src.view.Form._jInputs.filter(".totime").prop("value");
	src.view.Result.show(clientName,workName,fromtime,jp.saken.utils.Handy.getPastDate(totime,-1));
	return false;
};
src.view.Result = function() { };
src.view.Result.__name__ = true;
src.view.Result.init = function() {
	src.view.Result._jParent = new js.JQuery("#result");
};
src.view.Result.show = function(clientName,workName,fromtime,totime) {
	src.view._Result.DB.load(src.datalist.Clientlist.getID(clientName),src.datalist.Worklist.getID(workName),fromtime,totime,function() {
		if(clientName == "") clientName = "全クライアント";
		if(workName == "") workName = "全案件";
		src.view.Result._jParent.fadeIn(300);
		src.view.Result._jParent.find(".client").text(clientName);
		src.view.Result._jParent.find(".work").text(workName);
		src.view.Result.set(src.view._Result.DB.getExtractedList(),src.view._Result.DB.getRowList());
	});
};
src.view.Result.set = function(data,all) {
	var totaltime = data.totaltime;
	src.view.Result.setDescription(src.view.Result._jParent.find(".description"),data.members.length,totaltime);
	src.view.Result.setTeam(src.view.Result._jParent.find(".team"),data.teamTimes,totaltime,all.teamTimes);
	src.view.Result.setPerson(src.view.Result._jParent.find(".person"),data.memberTimes,totaltime,all.memberTimes);
};
src.view.Result.setDescription = function(jParent,memberLength,totaltime) {
	var perperson = Math.floor(totaltime / memberLength * 10) / 10;
	if(Math.isNaN(perperson)) perperson = 0;
	jParent.find(".totaltime").find("dd").text(totaltime == null?"null":"" + totaltime);
	jParent.find(".perperson").find("dd").text(perperson == null?"null":"" + perperson);
	jParent.find(".price").find("dd").text(Std.string(Math.floor(3000 * totaltime)));
};
src.view.Result.setTeam = function(jParent,map,totaltime,all) {
	jParent.find("dl").each(function() {
		var jTarget = $(this);
		var team = jTarget.prop("class");
		var teamTime = map.get(team);
		var allTeamTime = all.get(team);
		if(teamTime == null) teamTime = 0;
		if(allTeamTime == null) allTeamTime = 0;
		var ratio = src.view.Result.getRatio(teamTime / totaltime);
		if(Math.isNaN(ratio)) ratio = 0;
		jTarget.find(".time").text(teamTime == null?"null":"" + teamTime);
		jTarget.find(".ratio").text(ratio == null?"null":"" + ratio);
		jTarget.find(".teamratio").text(Std.string(src.view.Result.getRatio(teamTime / allTeamTime)));
		src.view.Result.animateGraph(jTarget,ratio);
	});
};
src.view.Result.setPerson = function(jParent,array,totaltime,all) {
	jParent.html(src.view.Result.getPersonHTML(array,totaltime,all)).find("dl").each(function() {
		var jTarget = $(this);
		var ratio = Std.parseInt(jTarget.find(".ratio").text());
		src.view.Result.animateGraph(jTarget,ratio);
	});
};
src.view.Result.getPersonHTML = function(array,totaltime,all) {
	var html = "";
	var _g1 = 0;
	var _g = array.length;
	while(_g1 < _g) {
		var p = _g1++;
		var memberID = p;
		var hour = array[p];
		if(hour == null) continue;
		var memberInfo = src.db.Members.getDB()[memberID];
		html += "\n\t\t\t<dl class=\"" + Std.string(memberInfo.parmanent_id) + " " + Std.string(memberInfo.team) + "\">\n\t\t\t\t<dt>" + Std.string(memberInfo.name) + "</dt>\n\t\t\t\t<dd>\n\t\t\t\t\t<figure></figure>\n\t\t\t\t\t<span class=\"time\">" + hour + "</span>\n\t\t\t\t\t<span class=\"ratio\">" + src.view.Result.getRatio(hour / totaltime) + "</span>\n\t\t\t\t\t<span class=\"personratio\">" + src.view.Result.getRatio(hour / all[p]) + "</span>\n\t\t\t\t</dd>\n\t\t\t</dl>";
	}
	return html;
};
src.view.Result.getRatio = function(value) {
	return Math.floor(value * 1000) / 10;
};
src.view.Result.animateGraph = function(jTarget,ratio) {
	jTarget.find("figure").delay(100 * jTarget.index()).animate({ width : ratio * .7 + "%"},300);
};
src.view._Result = {};
src.view._Result.DB = function() { };
src.view._Result.DB.__name__ = true;
src.view._Result.DB.load = function(clientID,workID,fromtime,totime,onLoaded) {
	var clients = src.db.Clients.getDB();
	var works = src.db.Works.getDB();
	var where = "updatetime >= \"" + fromtime + "\" AND updatetime < \"" + totime + "\"";
	jp.saken.utils.Ajax.getData("tasks",src.view._Result.DB.COLUMNS,function(data) {
		src.view._Result.DB._rowData = data;
		src.view._Result.DB._extractedData = [];
		var _g1 = 0;
		var _g = data.length;
		while(_g1 < _g) {
			var p = _g1++;
			var info = data[p];
			var isConcerned = false;
			if(workID == null) {
				if(clientID == null || works[info.work_id].client_id == clientID) isConcerned = true;
			} else if(info.work_id == workID) isConcerned = true;
			if(isConcerned) src.view._Result.DB._extractedData.push(info);
		}
		src.view._Result.DB._rowList = src.view._Result.DB.getList(src.view._Result.DB._rowData);
		src.view._Result.DB._extractedList = src.view._Result.DB.getList(src.view._Result.DB._extractedData);
		onLoaded();
		src.view._Result.DB.exportCSV(src.view._Result.DB._extractedData);
	},where);
};
src.view._Result.DB.getRowList = function() {
	return src.view._Result.DB._rowList;
};
src.view._Result.DB.getExtractedList = function() {
	return src.view._Result.DB._extractedList;
};
src.view._Result.DB.getList = function(data) {
	var totaltime = 0;
	var members = [];
	var memberTimes = [];
	var teamTimes = new haxe.ds.StringMap();
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var p = _g1++;
		var info = data[p];
		var memberID = info.member_id;
		var hour = Std.parseFloat(info.hour);
		var team = src.db.Members.getDB()[memberID].team;
		totaltime += hour;
		if(HxOverrides.indexOf(members,memberID,0) < 0) members.push(memberID);
		var memberTime = memberTimes[memberID];
		if(memberTime == null) memberTime = 0;
		memberTimes[memberID] = memberTime + hour;
		var teamTime = teamTimes.get(team);
		if(teamTime == null) teamTime = 0;
		teamTimes.set(team,teamTime + hour);
	}
	return { totaltime : totaltime, members : members, memberTimes : memberTimes, teamTimes : teamTimes};
};
src.view._Result.DB.exportCSV = function(data) {
	var clients = src.db.Clients.getDB();
	var works = src.db.Works.getDB();
	var members = src.db.Members.getDB();
	var array = [];
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var p = _g1++;
		var info = data[p];
		var memberID = info.member_id;
		var workID = info.work_id;
		var hour = Std.parseFloat(info.hour);
		var updatetime = info.updatetime;
		var workInfo = works[workID];
		var workName = workInfo.name;
		var clientName = clients[workInfo.client_id].name;
		var memberInfo = members[memberID];
		var memberName = memberInfo.name;
		var team = memberInfo.team;
		array.push([clientName,workName,team,memberName,hour,updatetime]);
	}
	src.utils.Csv["export"](array);
};
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
jp.saken.utils.Ajax.PATH = "files/php/";
jp.saken.utils.Dom.window = window;
jp.saken.utils.Dom.jWindow = new js.JQuery(jp.saken.utils.Dom.window);
jp.saken.utils.Dom.jBody = new js.JQuery("body");
src.db.Clients.TABLE_NAME = "clients";
src.db.Clients.COLUMN_LIST = ["id","name"];
src.db.Members.TABLE_NAME = "members";
src.db.Members.COLUMN_LIST = ["id","parmanent_id","name","section","team","is_visible"];
src.db.Works.TABLE_NAME = "works";
src.db.Works.COLUMN_LIST = ["id","client_id","name"];
src.utils.Csv.PHP_URL = "files/php/exportCSV.php";
src.utils.Csv.DELETE_URL = "files/php/deleteCSV.php";
src.utils.Csv.FILE_NAME = "data.csv";
src.view.Result.PAYMENT = 3000;
src.view._Result.DB.TABLE = "tasks";
src.view._Result.DB.COLUMNS = ["member_id","work_id","hour","updatetime"];
src.Main.main();
})();
