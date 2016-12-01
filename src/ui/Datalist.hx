package ui;

import js.JQuery;
import jp.saken.utils.API;
 
class Datalist {
	
	/* =======================================================================
	Public - Set
	========================================================================== */
	public static function set(jTarget:JQuery,mode:String,clientID:String = null):Void {
		
		var param:Map<String,String> = ['mode'=>mode];
		if (clientID != null) param['clientID'] = clientID;
		
		API.getJSON('dailyReport2',param,function(data:Array<Dynamic>):Void {
			
			var html:String = '';
			
			for (i in 0...data.length) {
				
				var info:Dynamic = data[i];
				html += '<option value="' + info.name + '" data-id="' + info.id + '"></option>';
			
			}
			
			jTarget.html(html);
			
		});
		
	}

}