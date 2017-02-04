package db;

import jp.saken.js.utils.Ajax;
 
class Database {
	
	private static var _counter:Int;
	
	/* =======================================================================
	Public - Load
	========================================================================== */
	public static function load(db:Array<Dynamic>,table:String,columns:Array<String>,where:String = ''):Void {
		
		if (_counter == null) _counter = 0;
		_counter++;
		
		Ajax.getData(table,columns,function(data:Array<Dynamic>):Void {
			
			for (p in 0...data.length) {
				
				var obj:Dynamic = data[p];
				db[obj.id] = obj;
				
			}
			
			_counter--;
			if (_counter == 0) Manager.jWindow().trigger('loadDB');
			
		},where);
		
	}

}