/**
* ================================================================================
*
* Daily Report ver 2.01.05
*
* Author : KENTA SAKATA
* Since  : 2013/05/14
* Update : 2017/03/17
*
* Licensed under the MIT License
* Copyright (c) Kenta Sakata
* http://saken.jp/
*
* ================================================================================
*
**/
package;

import js.jquery.JQuery;

class Main {
	
	public static function main():Void {
		
		new JQuery('document').ready(Manager.init);
		
	}

}