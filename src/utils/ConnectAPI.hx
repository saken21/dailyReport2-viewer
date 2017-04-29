package utils;
 
class Data {
	
	private static var DAY_LIST:Array<String> = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
	public static inline var UPLOAD_FOLDER:String = 'files/upload/';
	
	/* =======================================================================
	Public - Get Date
	========================================================================== */
	public static function getDate(datetime:String):String {
		
		var date:String = datetime.split(' ')[0];
		date = ~/-/g.replace(date,'.');
		
		return date;
		
	}
	
	/* =======================================================================
	Public - Get Day
	========================================================================== */
	public static function getDay(datetime:String):String {
		
		return DAY_LIST[Date.fromString(datetime).getDay()] + '.';
		
	}

}