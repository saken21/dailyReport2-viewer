package view;

import js.JQuery;
import jp.saken.utils.Ajax;
import jp.saken.utils.Dom;
import db.Members;
import utils.Data;
import view.reportviewer.Html;
import view.reportviewer.SearchNavi;

class Information {
	
	private static var _jParent     :JQuery;
	private static var _jLength     :JQuery;
	private static var _lastDatetime:String;
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init():Void {
		
		_jParent = new JQuery('#information');
		_jLength = _jParent.find('.length');
		
		new JQuery('h1').add(_jParent).on('click',onClick);
		
	}
	
		/* =======================================================================
		Public - Run
		========================================================================== */
		public static function run():Void {
			
			_lastDatetime = Manager.visitDatetime;

		}
		
		/* =======================================================================
		Public - On Loop
		========================================================================== */
		public static function onLoop():Void {
			
			getData(['id','updatetime'],set);

		}
		
	/* =======================================================================
	Get Data
	========================================================================== */
	private static function getData(columns:Array<String>,onLoaded:Array<Dynamic>->Void):Void {
		
		var where:String = 'updatetime > "' + _lastDatetime + '" AND member_id != ' + Manager.myID;
		Ajax.getData('reports',columns,onLoaded,where);
		
	}
		
	/* =======================================================================
	Set
	========================================================================== */
	private static function set(data:Array<Dynamic>):Void {
		
		var length:Int = data.length;
		if (length == 0) return;
		
		_jLength.text(Std.string(length));
		_jParent.stop().fadeIn(300);
		
	}
	
	/* =======================================================================
	On Click
	========================================================================== */
	private static function onClick(event:JqEvent):Void {
		
		Manager.reload();
		
		_jLength.text('0');
		_jParent.stop().fadeOut(300);
		
		Ajax.getDatetime(function(datetime:String):Void {
			_lastDatetime = datetime;
		});
		
	}
	
}