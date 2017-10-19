package utils;

import haxe.Http;
import haxe.Json;
import js.Browser;
import js.jquery.JQuery;
import js.jquery.Event;
 
class Ajax {
	
	private static inline var PATH:String = 'files/php/';
	private static var _connectDB:Http;
	
	/* =======================================================================
	Public - Get IP
	========================================================================== */
	public static function getIP(onLoaded:String->Void):Void {
		
		var http:Http = new Http(PATH + 'getIP.php');
		
		setBusy();
		
		http.onData = function(data:String):Void {
			
			onLoaded(data);
			unsetBusy();
		
		};
		
		http.request(true);
		
	}
	
	/* =======================================================================
	Public - Get Datetime
	========================================================================== */
	public static function getDatetime(onLoaded:String->Void):Void {
		
		var http:Http = new Http(PATH + 'getDatetime.php');
		
		setBusy();
		
		http.onData = function(data:String):Void {
			
			onLoaded(Json.parse(data));
			unsetBusy();
		
		};
		
		http.request(true);
		
	}
	
	/* =======================================================================
	Public - Upload Image
	========================================================================== */
	public static function uploadImage(filename:String,base64:String,onLoaded:Void->Void = null):Void {
		
		var http:Http = new Http(PATH + 'uploadImage.php');
		
		setBusy();
		
		http.onData = function(data:String):Void {
			
			if (onLoaded != null) onLoaded();
			unsetBusy();
		
		};
		
		http.setParameter('filename',filename);
		http.setParameter('base64',base64);
		
		http.request(true);
		
	}
	
	/* =======================================================================
	Public - Delete Image
	========================================================================== */
	public static function deleteImage(filename:String,onLoaded:Void->Void = null):Void {
		
		var http:Http = new Http(PATH + 'deleteImage.php');
		
		setBusy();
		
		http.onData = function(data:String):Void {
			
			if (onLoaded != null) onLoaded();
			unsetBusy();
		
		};
		
		http.setParameter('filename',filename);
		http.request(true);
		
	}
	
	/* =======================================================================
	Public - Get Data
	========================================================================== */
	public static function getData(table:String,columns:Array<String>,onLoaded:Array<Dynamic>->Void,where:String = ''):Void {
		
		setConnectDB();
		
		_connectDB.onData = function(data:String):Void {
			
			onLoaded(Json.parse(data));
			unsetBusy();
		
		};
		
		var query:String = 'SELECT ' + columns.join(',') + ' FROM ' + table;
		if (where.length > 0) query += ' WHERE ' + where;
		
		requestConnectDB(query);
		
	}
	
	/* =======================================================================
	Public - Get Max Data
	========================================================================== */
	public static function getMaxData(table:String,column:String,onLoaded:Int->Void,where:String = ''):Void {
		
		setConnectDB();
		
		_connectDB.onData = function(data:String):Void {
			
			var reg    :EReg = new EReg('([0-9]+)','');
			var isMatch:Bool = reg.match(data);
			
			onLoaded(isMatch ? Std.parseInt(reg.matched(0)) : 0);
			
			unsetBusy();
			
		};
		
		var query:String = 'SELECT MAX(' + column + ') FROM ' + table;
		if (where.length > 0) query += ' WHERE ' + where;
		
		requestConnectDB(query);
		
	}
	
	/* =======================================================================
	Public - Get Is Empty
	========================================================================== */
	public static function getIsEmpty(table:String,onLoaded:Bool->Void,where:String):Void {
		
		getData(table,['id'],function(data:Array<Dynamic>):Void {
			onLoaded(data.length < 1);
		},where);
		
	}
	
	/* =======================================================================
	Public - Insert Data
	========================================================================== */
	public static function insertData(table:String,columns:Array<String>,values:Array<Dynamic>,onLoaded:Int->Void = null):Void {
		
		setConnectDB();
		
		_connectDB.onData = function(data:String):Void {
			
			if (onLoaded != null) onLoaded(Std.parseInt(data));
			unsetBusy();
		
		};
		
		for (i in 0...values.length) {
			values[i] = '\"' + values[i] + '\"';
		}
		
		var query:String = 'INSERT INTO ' + table + ' (' + columns.join(',') + ') VALUES (' + values.join(',') + ')';
		requestConnectDB(query,true);

	}
	
	/* =======================================================================
	Public - Update Data
	========================================================================== */
	public static function updateData(table:String,columns:Array<String>,values:Array<Dynamic>,where:String,onLoaded:Void->Void = null):Void {
		
		setConnectDB();
		
		_connectDB.onData = function(data:String):Void {
			
			if (onLoaded != null) onLoaded();
			unsetBusy();
		
		};
		
		var array:Array<Dynamic> = [];
		
		for (p in 0...columns.length) {
			array[p] = columns[p] + '= \"' + values[p] + '\"';
		}
		
		var query:String = 'UPDATE ' + table + ' SET ' + array.join(',') + ' WHERE ' + where;
		requestConnectDB(query);

	}
	
	/* =======================================================================
	Set Connect DB
	========================================================================== */
	private static function setConnectDB():Void {
		
		_connectDB = new Http(PATH + 'connectDB.php');
		
	}
	
	/* =======================================================================
	Request Connect DB
	========================================================================== */
	private static function requestConnectDB(query:String,isInsert:Bool = false):Void {
		
		setBusy();
		
		_connectDB.setParameter('query',query);
		if (isInsert) _connectDB.setParameter('insert','true');
		
		_connectDB.request(true);
		
	}
	
	/* =======================================================================
	Set Busy
	========================================================================== */
	private static function setBusy():Void {
		
		new JQuery(Browser.window).on('beforeunload',onBeforeunload);
		
	}
	
	/* =======================================================================
	Unset Busy
	========================================================================== */
	private static function unsetBusy():Void {
		
		new JQuery(Browser.window).unbind('beforeunload',onBeforeunload);
		
	}
	
	/* =======================================================================
	On Beforeunload
	========================================================================== */
	private static function onBeforeunload(event:Event):String {
		
		return 'データベース登録中です。';
		
	}

}