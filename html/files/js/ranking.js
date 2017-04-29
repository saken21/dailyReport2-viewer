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
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
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
	src.components.View.init();
	src.Manager.loadDB();
};
src.Manager.loadDB = function() {
	jp.saken.utils.Dom.jWindow.on("loadDB",src.Manager.onLoadedDB);
	src.db.Reports.load();
	src.db.Members.load();
};
src.Manager.onLoadedDB = function(event) {
	jp.saken.utils.Dom.jWindow.unbind("loadDB",src.Manager.onLoadedDB);
	src.components.Analyzer.init();
};
src.components = {};
src.components.Analyzer = function() { };
src.components.Analyzer.__name__ = true;
src.components.Analyzer.init = function() {
	src.components.Analyzer._data = new haxe.ds.StringMap();
	var _g1 = 0;
	var _g = src.components.Analyzer._keys.length;
	while(_g1 < _g) {
		var p = _g1++;
		src.components.Analyzer._data.set(src.components.Analyzer._keys[p],[]);
	}
	var _g11 = 0;
	var _g2 = src.db.Reports.db.length;
	while(_g11 < _g2) {
		var p1 = _g11++;
		src.components.Analyzer.analyzeReport(src.db.Reports.db[p1]);
	}
	var _g12 = 0;
	var _g3 = src.components.Analyzer._keys.length;
	while(_g12 < _g3) {
		var p2 = _g12++;
		var key = src.components.Analyzer._keys[p2];
		var array = src.components.Analyzer._data.get(key);
		src.components.Analyzer.sortData(array);
		src.components.View.setHTML(array,key);
	}
};
src.components.Analyzer.analyzeReport = function(info) {
	if(info == null) return;
	var reportID = info.id;
	var memberID = info.member_id;
	var memberInfo = src.db.Members.db[memberID];
	var memberName = memberInfo.name;
	var teamID;
	var x = memberInfo.team;
	teamID = HxOverrides.indexOf(src.Manager.TEAM_LIST,x,0);
	var note = info.note;
	var date = info.date;
	var updatetime = info.updatetime;
	var starList = info.star_list;
	var starLength = starList.split(",").length;
	var day = HxOverrides.strDate(date).getDay();
	var hour = HxOverrides.strDate(updatetime).getHours();
	var length = Math.floor(note.length / 10);
	if(starList.length == 0) starLength = 0;
	src.components.Analyzer.addData(src.components.Analyzer._data.get("individual"),memberID,starLength,["name"],[memberName]);
	src.components.Analyzer.addData(src.components.Analyzer._data.get("team"),teamID,starLength,["team"],[src.Manager.TEAM_LIST_JP[teamID]]);
	src.components.Analyzer.addData(src.components.Analyzer._data.get("report"),reportID,starLength,["name","note","date"],[memberName,note,date]);
	src.components.Analyzer.addData(src.components.Analyzer._data.get("hour"),hour,starLength,["hour"],[hour]);
	src.components.Analyzer.addData(src.components.Analyzer._data.get("length"),length,starLength,["length"],[length * 10]);
	if(starLength > 0) src.components.Analyzer.addContribution(starList.split(","));
};
src.components.Analyzer.addContribution = function(starList) {
	var _g1 = 0;
	var _g = starList.length;
	while(_g1 < _g) {
		var i = _g1++;
		var memberID = Std.parseInt(starList[i]);
		var memberInfo = src.db.Members.db[memberID];
		if(memberInfo == null) {
			console.log("error : " + memberID);
			continue;
		}
		var memberName = memberInfo.name;
		src.components.Analyzer.addData(src.components.Analyzer._data.get("contribution"),memberID,1,["name"],[memberName]);
	}
};
src.components.Analyzer.addData = function(array,key,starLength,columns,values) {
	var result;
	if(array[key] == null) result = 0; else result = array[key].get("star");
	result += starLength;
	var map = new haxe.ds.StringMap();
	var _g1 = 0;
	var _g = columns.length;
	while(_g1 < _g) {
		var p = _g1++;
		map.set(columns[p],values[p]);
	}
	map.set("star",result);
	array[key] = map;
};
src.components.Analyzer.sortData = function(array) {
	array.sort(function(a,b) {
		return Math.floor(b.get("star") - a.get("star"));
	});
};
src.components.View = function() { };
src.components.View.__name__ = true;
src.components.View.init = function() {
	src.components.View._data = new haxe.ds.StringMap();
	src.components.View._data.set("individual",["name","star"]);
	src.components.View._data.set("team",["team","star"]);
	src.components.View._data.set("report",["date","name","star","note"]);
	src.components.View._data.set("contribution",["name","star"]);
	src.components.View._data.set("hour",["hour","star"]);
	src.components.View._data.set("length",["length","star"]);
};
src.components.View.setHTML = function(data,key) {
	var html = "";
	var length = 7;
	if(key == "report") length -= 2;
	var columns = src.components.View._data.get(key);
	var _g = 0;
	while(_g < length) {
		var p = _g++;
		html += src.components.View.getHTML(data[p],p + 1,columns);
	}
	new js.JQuery("#" + key).find("ol").html(html);
};
src.components.View.getHTML = function(map,num,columns) {
	if(map == null || map.get("star") == 0) return "<li class=\"blank\">-</li>";
	var html = "<li>";
	html += "<span class=\"num\">" + num + "位</span>";
	var _g1 = 0;
	var _g = columns.length;
	while(_g1 < _g) {
		var p = _g1++;
		var column = columns[p];
		html += "<span class=\"" + column + "\">" + Std.string(map.get(column)) + "</span>";
	}
	return html + "</li>";
};
src.db = {};
src.db.Database = function() { };
src.db.Database.__name__ = true;
src.db.Database.load = function(db,table,columns,where) {
	if(where == null) where = "";
	if(src.db.Database._counter == null) src.db.Database._counter = 0;
	src.db.Database._counter++;
	jp.saken.utils.Ajax.getData(table,columns,function(data) {
		var _g1 = 0;
		var _g = data.length;
		while(_g1 < _g) {
			var p = _g1++;
			var obj = data[p];
			db[obj.id] = obj;
		}
		src.db.Database._counter--;
		if(src.db.Database._counter == 0) jp.saken.utils.Dom.jWindow.trigger("loadDB");
	},where);
};
src.db.Members = function() { };
src.db.Members.__name__ = true;
src.db.Members.load = function() {
	src.db.Database.load(src.db.Members.db = [],"members",src.db.Members.COLUMN_LIST);
};
src.db.Reports = function() { };
src.db.Reports.__name__ = true;
src.db.Reports.load = function(where) {
	if(where == null) where = "";
	src.db.Database.load(src.db.Reports.db = [],"reports",src.db.Reports.COLUMN_LIST,where);
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
jp.saken.utils.Dom.document = window.document;
jp.saken.utils.Dom.window = window;
jp.saken.utils.Dom.jWindow = new js.JQuery(jp.saken.utils.Dom.window);
jp.saken.utils.Dom.body = jp.saken.utils.Dom.document.body;
jp.saken.utils.Dom.jBody = new js.JQuery(jp.saken.utils.Dom.body);
jp.saken.utils.Dom.userAgent = jp.saken.utils.Dom.window.navigator.userAgent;
src.Manager.TEAM_LIST = ["Edit","Design","DTP","Web"];
src.Manager.TEAM_LIST_JP = ["編集","デザイン","DTP","Web"];
src.Manager.WEEK_LIST = ["日","月","火","水","木","金","土"];
src.components.Analyzer._keys = ["individual","team","report","contribution","hour","length"];
src.components.View.DISPLAY_LENGTH = 7;
src.db.Members.TABLE_NAME = "members";
src.db.Members.COLUMN_LIST = ["id","name","team"];
src.db.Reports.TABLE_NAME = "reports";
src.db.Reports.COLUMN_LIST = ["id","member_id","note","date","updatetime","star_list"];
src.Main.main();
})();
