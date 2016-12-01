package view.reportviewer;

import js.JQuery;

class SortNavi {
	
	private static var _jButtons:JQuery;
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init(jParent:JQuery):Void {
		
		_jButtons = jParent.find('button').on('mousedown',onMousedown);
		
	}
		
		/* =======================================================================
		Public - Show New
		========================================================================== */
		public static function showNew():Void {

			_jButtons.filter('.new').trigger('mousedown');

		}
		
		/* =======================================================================
		Public - Clear
		========================================================================== */
		public static function clear():Void {

			_jButtons.removeClass('active');

		}
	
	/* =======================================================================
	On Mousedown
	========================================================================== */
	private static function onMousedown(event:JqEvent):Void {
		
		var jTarget:JQuery = new JQuery(event.target);
		if (jTarget.hasClass('active')) return;
		
		SearchNavi.clear();
		
		var jParent:JQuery = jTarget.parents('ul');
		
		jParent.find('button').removeClass('active');
		
		var cls:String = jTarget.prop('class');
		jTarget.addClass('active');
		
		ReportViewer.showReports(cls);
		
	}
	
}