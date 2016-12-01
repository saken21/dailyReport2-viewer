package ui;

import js.JQuery;
import jp.saken.utils.Dom;
import view.ReportViewer;
 
class Keyboard {
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init():Void {
		
		Dom.jWindow.on('keydown',onKeydown);
		
	}
	
	/* =======================================================================
	On Keydown
	========================================================================== */
	private static function onKeydown(event:JqEvent):Void {
		
		var jTarget:JQuery = new JQuery(event.target);
		var keyCode:Int    = event.keyCode;
		
		if (event.ctrlKey) {
			
			switch (keyCode) {
				
				case 76 : { // [L]
					Manager.logout();
				}
				
				case 65,68 : { // [A][D]
					
					ReportViewer.archiveAll();
					return untyped false;
				
				}
				
				default : {}
				
			}
			
		}
		
	}

}