package view;

import js.jquery.JQuery;
import js.jquery.Event;

class Timeout {

	public static inline var SECONDS:Int = 120;
	private static var DATA_MAP:Array<Map<String,String>>  = [
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
		[ 'name' => '14.jpg','text' => 'がおぁー' ],
		[ 'name' => '15.jpg','text' => 'スライリー' ]
	];
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init():Void {
		
		var data : Map<String,String> = getData();

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
	Get Data
	========================================================================== */
	private static function getData():Map<String,String> {
		
		var num : Int = Math.floor( Math.random() * DATA_MAP.length );
		return DATA_MAP[num];

	}
	
}