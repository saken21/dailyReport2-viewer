package db;
 
class Tasks {
	
	public static var db:Array<Dynamic>;
	
	private static inline var TABLE_NAME:String = 'tasks';
	private static var COLUMN_LIST:Array<String> = ['id','member_id','work_id','hour'];
	
	/* =======================================================================
	Public - Load
	========================================================================== */
	public static function load(pastDate:String = '1999-1-1'):Void {
		
		Database.load(db = [],TABLE_NAME,COLUMN_LIST,'updatetime > "' + pastDate + '"');
		
	}

}