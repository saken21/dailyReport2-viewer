package db;
 
class Clients {
	
	public static var db:Array<Dynamic>;
	
	private static inline var TABLE_NAME:String = 'clients';
	private static var COLUMN_LIST:Array<String> = ['id','name'];
	
	/* =======================================================================
	Public - Load
	========================================================================== */
	public static function load():Void {
		
		Database.load(db = [],TABLE_NAME,COLUMN_LIST);
		
	}

}