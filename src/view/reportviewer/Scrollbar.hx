package view.reportviewer;

import js.jquery.JQuery;
import js.jquery.Event;
 
class Scrollbar {
	
	private static var _jTarget:JQuery;
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init(jTarget:JQuery):Void {
		
		_jTarget = jTarget;
		Manager.jWindow().on('scroll',onScroll);
		
	}
	
	/* =======================================================================
	On Scroll
	========================================================================== */
	private static function onScroll(event:Event):Void {
		
		var y:Float = Manager.jWindow().scrollTop();
		var t:Float = _jTarget.position().top + _jTarget.height();
		var h:Float =  _jTarget.find('.report').first().height();
		
		if (y - t > 100 - h * 2) ReportViewer.loadMore();
		
	}

}