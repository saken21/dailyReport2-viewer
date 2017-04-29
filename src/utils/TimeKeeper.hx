package utils;

import haxe.Timer;
import view.SimpleBoard;
import view.Information;
import view.StarChecker;
import view.ReportViewer;
import view.reportviewer.AutoSave;
 
class TimeKeeper {
	
	private static var _timer:Timer;
	
	/* =======================================================================
	Public - Run
	========================================================================== */
	public static function run():Void {
		
		_timer = new Timer(300);
		_timer.run = onLoop;

	}

		/* =======================================================================
		Public - Stop
		========================================================================== */
		public static function stop():Void {
			
			_timer.stop();

		}
		
	/* =======================================================================
	On Loop
	========================================================================== */
	private static function onLoop():Void {
		
		SimpleBoard.onLoop();
		Information.onLoop();
		StarChecker.onLoop();
		ReportViewer.onLoop();
		AutoSave.onLoop();
		
	}
	

}