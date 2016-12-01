package view;

import haxe.Json;
import js.JQuery;
import js.Cookie;
import jp.saken.utils.Ajax;
import jp.saken.utils.Dom;
 
class Login {
	
	private static var _jParent:JQuery;
	private static var _jID    :JQuery;
	private static var _jPass  :JQuery;
	private static var _jSubmit:JQuery;
	
	private static inline var COOKIE_NAME:String = 'DR2LoginHistory2';
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init():Void {
		
		_jParent = new JQuery('#login');
		_jID     = _jParent.find('.id');
		_jPass   = _jParent.find('.pass');
		_jSubmit = _jParent.find('.submit').on('click',submit);
		
	}
	
		/* =======================================================================
		Public - Show
		========================================================================== */
		public static function show():Void {
			
			Cookie.remove(COOKIE_NAME);
			_jID.add(_jPass).prop('value','');
			
			_jParent.fadeIn(300,function():Void {
				_jID.trigger('focus');
			});

		}
		
		/* =======================================================================
		Public - Hide
		========================================================================== */
		public static function hide():Void {
			
			_jParent.stop().hide();

		}
	
		/* =======================================================================
		Public - Start
		========================================================================== */
		public static function start():Void {

			_jID.trigger('focus');

			var cookie:String = Cookie.get(COOKIE_NAME);
			if (cookie == null) return;
			
			var info:Array<String> = Json.parse(cookie);

			_jID.prop('value',info[0]);
			_jPass.prop('value',info[1]);

			submit();

	    }
	
	/* =======================================================================
	Submit
	========================================================================== */
	private static function submit(event:JqEvent = null):Void {
		
		var id     :String        = _jID.prop('value');
		var pass   :String        = _jPass.prop('value');
		var table  :String        = 'members';
		var columns:Array<String> = ['*'];
		
		id = ~/_/.replace(id,'-');
		
		var where:String = '(parmanent_number = "' + id + '" OR parmanent_id = "' + id + '") AND pass = "' + pass + '"';
		Ajax.getData(table,columns,checkData,where);
		
		return untyped false;
		
	}
	
	/* =======================================================================
	Check Data
	========================================================================== */
	private static function checkData(data:Array<Dynamic>):Void {
		
		if (data.length == 0) {
			
			Dom.window.alert('登録されていないアカウントです。');
			return;
			
		}
		
		var info  :Dynamic = data[0];
		var cookie:String  = Json.stringify([info.parmanent_number,info.pass]);
		
		Cookie.set(COOKIE_NAME,cookie);
		
		Manager.myID          = info.id;
		Manager.myParmanentID = info.parmanent_id;
		Manager.myName        = info.name;
		Manager.myTeam        = info.team;
		
		Manager.login();
		
	}

}