package db;
 
class Works {
	
	public static var db:Array<Dynamic>;
	
	private static inline var TABLE_NAME:String = 'works';
	private static var COLUMN_LIST:Array<String> = ['id','client_id','name'];
	
	/* =======================================================================
	Public - Load
	========================================================================== */
	public static function load():Void {
		
		Database.load(db = [],TABLE_NAME,COLUMN_LIST);
		
	}

}