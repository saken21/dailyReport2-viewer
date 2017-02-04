package ui;

import js.jquery.JQuery;
import js.jquery.Event;
import view.ReportViewer;
 
class Keyboard {
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init():Void {
		
		Manager.jWindow().on('keydown',onKeydown);
		
	}
	
	/* =======================================================================
	On Keydown
	========================================================================== */
	private static function onKeydown(event:Event):Void {
		
		var jTarget:JQuery = new JQuery(event.target);
		var keyCode:Int    = event.keyCode;
		
		if (event.ctrlKey) {
			
			switch (keyCode) {
				
				case 76 : { // [L]
					Manager.logout();
				}
				
				case 65,68 : { // [A][D]
					
					ReportViewer.archiveAll();
					event.preventDefault();
				
				}
				
				default : {}
				
			}
			
		}
		
	}

}