package;

import js.JQuery;
import jp.saken.utils.UI;
import jp.saken.utils.Ajax;
import jp.saken.utils.Handy;
import jp.saken.utils.Dom;
import view.*;
import db.*;
import ui.*;
import utils.*;
 
class Manager {
	
	private static var _isLogined:Bool;
	
	public static var myID         :Int;
	public static var myParmanentID:String;
	public static var myName       :String;
	public static var myTeam       :String;
	public static var visitDatetime:String;
	public static var visitDate    :String;
	public static var pastDate     :String;
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init(event:JqEvent):Void {
		
		Login.init();
		SimpleBoard.init();
		ReportViewer.init();
		Information.init();
		StarChecker.init();
		
		UI.setPagetop(new JQuery('#pagetop').find('a'));
		Keyboard.init();
		
		Login.start();
		
	}
	
		/* =======================================================================
		Public - Login
		========================================================================== */
		public static function login():Void {
			
			Ajax.getDatetime(function(datetime:String):Void {
				
				visitDatetime = datetime;
				
				visitDate = visitDatetime.split(' ')[0];
				pastDate  = Handy.getPastDate(datetime,100);
				
				loadDB(onLoadedDB);

			});

		}

		/* =======================================================================
		Public - Logout
		========================================================================== */
		public static function logout():Void {

			if (!_isLogined) return;
			
			TimeKeeper.stop();

			Login.show();
			SimpleBoard.hide();
			ReportViewer.hide();
			StarChecker.hide();

		}
		
		/* =======================================================================
		Public - Reload
		========================================================================== */
		public static function reload():Void {
			
			TimeKeeper.stop();
			ReportViewer.reset();
			
			login();

		}
		
	/* =======================================================================
	Load DB
	========================================================================== */
	private static function loadDB(onLoaded:JqEvent->Void):Void {
		
		Dom.jWindow.on('loadDB',onLoaded);
		
		Members.load();
		Tasks.load(pastDate);
		Works.load();
		Clients.load();

	}
	
	/* =======================================================================
	On Loaded DB
	========================================================================== */
	private static function onLoadedDB(event:JqEvent):Void {
		
		Dom.jWindow.unbind('loadDB',onLoadedDB);
		
		_isLogined = true;

		Login.hide();
		SimpleBoard.show();
		ReportViewer.show();
		StarChecker.show();
		
		Information.run();
		TimeKeeper.run();
		
	}

}