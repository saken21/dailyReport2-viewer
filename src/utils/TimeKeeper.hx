package utils;

import haxe.Timer;
import view.SimpleBoard;
import view.Information;
import view.StarChecker;
import view.ReportViewer;
import view.reportviewer.AutoSave;
 
class TimeKeeper {
	
	private static var _timer  :Timer;
	private static var _counter:Int;
	private static inline var TIMEOUT:Int = 120;
	
	/* =======================================================================
	Public - Run
	========================================================================== */
	public static function run():Void {
		
		_counter   = 0;
		_timer     = new Timer(1000);
		_timer.run = onLoop;

		SimpleBoard.onLoop();

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

		// SimpleBoard.onLoop();
		Information.onLoop();
		StarChecker.onLoop();
		ReportViewer.onLoop();
		AutoSave.onLoop();

		_counter = Manager.isFocus ? 0 : _counter + 1;
		if (_counter == TIMEOUT) {
			stop();
			Manager.timeout();
		}
		
	}
	

}