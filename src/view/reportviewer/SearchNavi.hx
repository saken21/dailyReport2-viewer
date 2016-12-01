package view.reportviewer;

import js.JQuery;

class SearchNavi {
	
	private static var _jInput:JQuery;
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init(jParent:JQuery):Void {
		
		_jInput = jParent.find('input').on('keydown',onKeydown);
		jParent.find('.clear').on('click',clear);
		
	}
	
		/* =======================================================================
		Public - Input
		========================================================================== */
		public static function input(value:String):Void {

			_jInput.prop('value',value);
			ReportViewer.search(value);
			
			SortNavi.clear();

		}
		
		/* =======================================================================
		Public - Clear
		========================================================================== */
		public static function clear(event:JqEvent = null):Void {

			_jInput.prop('value','');

		}
	
	/* =======================================================================
	On Keydown
	========================================================================== */
	private static function onKeydown(event:JqEvent):Void {
		
		if (event.keyCode == 13) {
			
			ReportViewer.search(_jInput.prop('value'));
			return untyped false;
			
		}
		
	}
	
}