package view;

import js.JQuery;
import jp.saken.utils.Ajax;
import jp.saken.utils.Dom;
import db.Members;
import utils.Data;
import view.reportviewer.SortNavi;
import view.reportviewer.SearchNavi;

class StarChecker {
	
	private static var _jParent :JQuery;
	private static var _jContent:JQuery;
	private static var _jFavicon:JQuery;
	private static var _isOpen  :Bool;
	private static var _lastData:Array<Dynamic>;
	
	private static inline var TABLE_NAME :String = 'reports';
	private static inline var FAVICON_OFF:String = 'files/img/favicon.ico';
	private static inline var FAVICON_ON :String = 'files/img/favicon_on.ico';
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init():Void {
		
		Dom.jWindow.on('click',onClickWindow);
		
		_jParent  = new JQuery('#starchecker').on('click',onClick);
		_jContent = _jParent.find('#starchecker-content');
		_jFavicon = new JQuery('link.favicon');
		_isOpen   = false;
		
	}
	
		/* =======================================================================
		Public - Show
		========================================================================== */
		public static function show():Void {
			
			_jParent.fadeIn(300);
			
		}
		
		/* =======================================================================
		Public - Hide
		========================================================================== */
		public static function hide():Void {
			
			close();
			unset();
			
			_lastData = null;
			
			_jContent.empty();
			_jParent.stop().hide();
			
		}
		
		/* =======================================================================
		Public - On Loop
		========================================================================== */
		public static function onLoop():Void {

			Ajax.getData(TABLE_NAME,['id','date','star_list'],function(data:Array<Dynamic>):Void {
				
				var length:Int = data.length;
				if (length > 0) set(data);
				
				_lastData = data;

			},'is_checked_star = 0 AND member_id = ' + Manager.myID);

		}
	
	/* =======================================================================
	Set
	========================================================================== */
	private static function set(data:Array<Dynamic>):Void {
		
		if (getIsSame(data,_lastData)) return;
		
		_jParent.addClass('no-checked');
		_jFavicon.prop('href',FAVICON_ON);
		
		var html  :String = '';
		var myName:String = Manager.myName;
		
		for (p in 0...data.length) {
			
			var info:Dynamic = data[p];
			if (info.star_list.length == 0) continue;
			
			var id      :Int        = info.id;
			var date    :String     = Data.getDate(info.date);
			var stars   :Array<Int> = info.star_list.split(',');
			var length  :Int        = stars.length;
			var search  :String     = myName + ',' + date;
			
			var member1 :String = getMemberName(Members.db[stars[length - 1]]);
			var member2 :String = getMemberName(Members.db[stars[length - 2]]);
			var others  :String = '';
			
			if (member2.length > 0) member2 = 'と' + member2;
			if (length > 2) others = '他' + (length - 2) + '名';
			
			var string :String = 'あなたの' + date + 'の日報に' + member1 + member2 + others + 'がスターを付けてます';
			html += '<li data-id="' + id + '"><a class="search" data-search="' + search + '">' + string + '</a></li>';
			
			ReportViewer.updateStars(id,info.star_list);
			
		}
		
		_jContent.html(html);
		
	}
	
	/* =======================================================================
	Get Member Name
	========================================================================== */
	private static function getMemberName(db:Dynamic):String {
		
		if (db == null) return '';
		
		var name:String = db.name;
		return (name == null ? '名無し' : name.split(' ')[0]) + 'さん';
		
	}
	
	/* =======================================================================
	Unset
	========================================================================== */
	private static function unset():Void {
		
		_jParent.removeClass('no-checked');
		_jFavicon.prop('href',FAVICON_OFF);
		
	}
	
	/* =======================================================================
	Get Is Same
	========================================================================== */
	private static function getIsSame(a:Array<Dynamic>,b:Array<Dynamic>):Bool {
		
		if (_lastData == null) return false;
		if (a.length != b.length) return false;
		
		for (p in 0...a.length) {
			
			var starA:Array<Int> = a[p].star_list.split(',');
			var starB:Array<Int> = b[p].star_list.split(',');
			
			if (starA[starA.length - 1] != starB[starB.length - 1]) {
				return false;
			}
			
		}
		
		return true;
		
	}
	
	/* =======================================================================
	On Click
	========================================================================== */
	private static function onClick(event:JqEvent):Void {
		
		if (!_jParent.hasClass('no-checked')) return;
		
		var jTarget:JQuery = new JQuery(event.target);
		
		if (jTarget.hasClass('button')) toggleButton();
		if (jTarget.hasClass('search')) jump(jTarget);
		
	}
	
	/* =======================================================================
	On Click Window
	========================================================================== */
	private static function onClickWindow(event:JqEvent):Void {
		
		var jTarget:JQuery = new JQuery(event.target);
		if (jTarget.parents('#starchecker').length > 0) return;
		
		close();
		
	}
	
	/* =======================================================================
	Toggle Button
	========================================================================== */
	private static function toggleButton():Void {
		
		if (_isOpen) close();
		else open();
		
	}
	
	/* =======================================================================
	Open
	========================================================================== */
	private static function open():Void {
		
		_isOpen = true;
		_jContent.stop(true,true).slideDown(100);
		
	}
	
	/* =======================================================================
	Close
	========================================================================== */
	private static function close():Void {
		
		_isOpen = false;
		_jContent.stop(true,true).slideUp(100);
		
	}
	
	/* =======================================================================
	Jump
	========================================================================== */
	private static function jump(jTarget:JQuery):Void {
		
		var jParent:JQuery = jTarget.parents('li');
		
		Ajax.updateData(TABLE_NAME,['is_checked_star'],[1],'id = ' + jParent.data('id'));
		SearchNavi.input(jTarget.data('search'));
		
		jParent.remove();
		
		if (_jContent.find('li').length == 0) {
			
			unset();
			close();
			
		}
		
	}
	
}