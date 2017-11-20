package;

import js.Browser;
import js.jquery.JQuery;
import js.jquery.Event;
import jp.saken.js.ui.UI;
import utils.Ajax;
import jp.saken.common.utils.Handy;
import view.*;
import db.*;
import ui.*;
import utils.*;
 
class Manager {
	
	private static var _jWindow  :JQuery;
	private static var _isLogined:Bool;
	
	public static var myID         :Int;
	public static var myParmanentID:String;
	public static var myName       :String;
	public static var myTeam       :String;
	public static var visitDatetime:String;
	public static var visitDate    :String;
	public static var pastDate     :String;
	public static var isFocus      :Bool;
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init(event:Event):Void {

		_jWindow = new JQuery(Browser.window);
		
		Login.init();
		SimpleBoard.init();
		ReportViewer.init();
		Information.init();
		StarChecker.init();
		
		UI.setPagetop(new JQuery('#pagetop').find('a'));
		Keyboard.init();
		
		Login.start();
		setFocusEvent();

		if (~/mode=special/g.match(Browser.location.search)) new JQuery('#all').addClass('specialmode');
		
	}

		/* =======================================================================
		Public - Get JQuery Window
		========================================================================== */
		public static function jWindow():JQuery {
			
			return _jWindow;

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
		Public - Timeout
		========================================================================== */
		public static function timeout():Void {

			var array : Array<String> = ['01.jpg','02.jpg','03.jpg','04.gif','05.png'];

			var map : Array<Map<String,String>> = [
				[ 'name' => '01.jpg','text' => 'タイムアウトしました' ],
				[ 'name' => '02.jpg','text' => 'タイムアウトしました' ],
				[ 'name' => '03.jpg','text' => 'タイムアウトしました' ],
				[ 'name' => '04.jpg','text' => 'タイムアウトしました' ],
				[ 'name' => '05.jpg','text' => 'タイムアウトしました' ],
				[ 'name' => '06.jpg','text' => 'タイムアウトしました' ],
				[ 'name' => '07.jpg','text' => 'タイムアウトしました' ],
				[ 'name' => '08.jpg','text' => 'タイムアウトしました' ],
				[ 'name' => '09.jpg','text' => 'タイムアウトしました' ],
				[ 'name' => '10.gif','text' => 'がんばろう！ ヤクルト' ],
				[ 'name' => '11.gif','text' => 'がんばろう！ ヤクルト' ],
				[ 'name' => '12.jpg','text' => '名前は「わらび舞妓ちゃん」' ],
				[ 'name' => '13.png','text' => 'Trelloのキャラクター' ],
				[ 'name' => '14.jpg','text' => 'がおぁー' ]
			];
			var num  : Int = Math.floor( Math.random() * map.length );
			var data : Map<String,String> = map[num];

			for (i in 0 ... 100) {
				trace(Math.floor( Math.random() * map.length ));
			}

			new JQuery('#main').html('
				<div class="wrap">
					<div id="timeout">
						<figure>
							<img src="files/img/timeout/${data['name']}?171117">
							<figcaption>${data['text']}</figcaption>
						</figure>
						<a href="http://tpxg.graphic.co.jp/xgweb/Login.asp" target="_blank">
							<img src="files/img/timeout/timeout.gif" alt="Time Pro-XG">
						</a>
						<p>残業時間の申請お忘れずに</p>
						<a href="index.html">日報に戻る</a>
					</div>
				</div>');

		}
		
	/* =======================================================================
	Set Focus Event
	========================================================================== */
	private static function setFocusEvent():Void {

		isFocus = true;
		_jWindow.on('focus',function():Void {
			isFocus = true;
		});

		_jWindow.on('blur',function():Void {
			isFocus = false;
		});

	}
		
	/* =======================================================================
	Load DB
	========================================================================== */
	private static function loadDB(onLoaded:Event->Void):Void {
		
		_jWindow.on('loadDB',onLoaded);
		
		Members.load();
		Tasks.load(pastDate);
		Works.load();
		Clients.load();

	}
	
	/* =======================================================================
	On Loaded DB
	========================================================================== */
	private static function onLoadedDB(event:Event):Void {
		
		_jWindow.off('loadDB',onLoadedDB);
		
		_isLogined = true;

		Login.hide();
		SimpleBoard.show();
		ReportViewer.show();
		StarChecker.show();
		
		Information.run();
		TimeKeeper.run();
		
	}

}