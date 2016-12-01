/**
* ================================================================================
*
* Daily Report ver 2.01.03
*
* Author : KENTA SAKATA
* Since  : 2013/05/14
* Update : 2016/08/19
*
* Licensed under the MIT License
* Copyright (c) Kenta Sakata
* http://saken.jp/
*
* ================================================================================
*
**/
package;

import js.JQuery;

class Main {
	
	public static function main():Void {
		
		new JQuery('document').ready(Manager.init);
		
	}

}