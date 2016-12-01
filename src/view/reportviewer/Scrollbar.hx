package view.reportviewer;

import js.JQuery;
import jp.saken.utils.Dom;
 
class Scrollbar {
	
	private static var _jTarget:JQuery;
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init(jTarget:JQuery):Void {
		
		_jTarget = jTarget;
		Dom.jWindow.on('scroll',onScroll);
		
	}
	
	/* =======================================================================
	On Scroll
	========================================================================== */
	private static function onScroll(event:JqEvent):Void {
		
		var y:Int = Dom.jWindow.scrollTop();
		var t:Int = _jTarget.position().top + _jTarget.height();
		var h:Int =  _jTarget.find('.report').first().height();
		
		if (y - t > 100 - h * 2) ReportViewer.loadMore();
		
	}

}