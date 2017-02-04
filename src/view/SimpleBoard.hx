package view;

import js.Browser;
import js.jquery.JQuery;
import js.jquery.Event;
import jp.saken.common.utils.Handy;
import jp.saken.js.utils.Ajax;
import db.Members;

class SimpleBoard {
	
	private static var _jParent       :JQuery;
	private static var _jNewentry     :JQuery;
	private static var _jTextarea     :JQuery;
	private static var _jEntries      :JQuery;
	private static var _defNewentryH  :Float;
	private static var _curNewentryH  :Float;
	private static var _lastUpdatetime:String;
	private static var _checkList     :Array<Array<Int>>;
	
	private static inline var TABLE_NAME:String = 'simpleboard';
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init():Void {
		
		_jParent   = new JQuery('#simpleboard').on('click',onClick);
		_jNewentry = _jParent.find('.newentry');
		_jTextarea = _jNewentry.find('textarea').on('keydown',onKeydown);
		_jEntries  = _jParent.find('.entries');
		
		_defNewentryH = _curNewentryH = _jNewentry.height();
		
	}
	
		/* =======================================================================
		Public - Show
		========================================================================== */
		public static function show():Void {
			
			start();
			_jParent.fadeIn(300);
			
		}
		
		/* =======================================================================
		Public - Hide
		========================================================================== */
		public static function hide():Void {
			
			_jParent.stop().hide();
			
		}
		
		/* =======================================================================
		Public - On Loop
		========================================================================== */
		public static function onLoop():Void {
			
			if (_lastUpdatetime == null) {
				_lastUpdatetime = Manager.visitDatetime;
			}

			Ajax.getData(TABLE_NAME,['id'],function(data:Array<Dynamic>):Void {
				
				if (data.length > 0) start();

			},'updatetime > "' + _lastUpdatetime + '"');

		}
		
	/* =======================================================================
	On Click
	========================================================================== */
	private static function onClick(event:Event):Void {
		
		var jTarget:JQuery = new JQuery(event.target);
		var jParant:JQuery = jTarget.parents('.entry');
		
		if (jTarget.hasClass('delete')) deleteEntry(jParant);
		if (jTarget.hasClass('checkbox')) checkEntry(jParant,jTarget);
		
	}
	
	/* =======================================================================
	On Keydown
	========================================================================== */
	private static function onKeydown(event:Event):Void {
		
		var text :String = _jTextarea.prop('value');
		var lines:Int    = Handy.getLines(text);
		
		setNewentryHeight(_defNewentryH * lines);
		
		if (event.keyCode == 13) {
			
			if (event.shiftKey) {
				
				setNewentryHeight(_curNewentryH + _defNewentryH);
				
			} else if (text.length > 0) {
				
				setNewentryHeight(_defNewentryH);
				
				addEntry(text);
				_jTextarea.prop('value','');

				event.preventDefault();
				
			}
			
		}
		
	}
	
	/* =======================================================================
	Set Newentry Height
	========================================================================== */
	private static function setNewentryHeight(value:Float):Void {
		
		_curNewentryH = value;
		_jNewentry.height(value);
		
	}
	
	/* =======================================================================
	Start
	========================================================================== */
	private static function start():Void {
		
		getDatetime(function(datetime:String):Void {
			
			_checkList = [];
			setEntries();
			
		});
		
	}
	
	/* =======================================================================
	Set Entries
	========================================================================== */
	private static function setEntries():Void {
		
		var columns:Array<String> = ['id','member_id','text','check_list'];
		
		Ajax.getData(TABLE_NAME,columns,function(data:Array<Dynamic>):Void {
			
			var myID:Int    = Manager.myID;
			var html:String = '';
			
			data.reverse();
			
			for (p in 0...data.length) {
				
				var entry:Dynamic = data[p];
				var id   :Int     = entry.id;
				var text :String  = entry.text;
				
				var memberID:Int = entry.member_id;
				
				var checkList:Array<Int> = entry.check_list.split(',');
				var isChecked:Bool = checkList.indexOf(myID) > -1;
				
				_checkList[id] = checkList;
				html += getEntryHTML(id,memberID,Handy.getAdjustedHTML(text),isChecked,checkList.length);
				
			}
			
			_jEntries.html(html);
			
		},'is_visible=1');
		
	}
	
	/* =======================================================================
	Add Entry
	========================================================================== */
	private static function addEntry(text:String):Void {
		
		var myID:Int = Manager.myID;
		
		getDatetime(function(datetime:String):Void {
			
			var columns:Array<String> = ['member_id','text','updatetime','check_list'];
			
			Ajax.insertData(TABLE_NAME,columns,[myID,text,datetime,myID],function(lastID:Int):Void {
				
				_checkList[lastID] = [myID];

				var html:String = getEntryHTML(lastID,myID,Handy.getAdjustedHTML(text),true,1);
				_jEntries.prepend(html).find("li").eq(0).hide().slideDown(500);
				
			});
			
		});
		
		_jTextarea.focus();
		
	}
	
	/* =======================================================================
	Delete Entry
	========================================================================== */
	private static function deleteEntry(jTarget:JQuery):Void {
		
		var text:String = Handy.getLimitedText(jTarget.find('.text').text());
		var isOK:Bool   = Browser.window.confirm('「' + text + '」を削除してもよろしいですか？');
		
		if (!isOK) return;
		
		jTarget.remove();
		updateEntry('is_visible','0','id = ' + jTarget.data('id'));
		
	}
	
	/* =======================================================================
	Check Entry
	========================================================================== */
	private static function checkEntry(jTarget:JQuery,jCheckbox:JQuery):Void {
		
		var id  :Int        = jTarget.data('id');
		var myID:Int        = Manager.myID;
		var list:Array<Int> = _checkList[id];
		
		if (jCheckbox.prop('checked')) list.push(myID);
		else list.remove(myID);
		
		var length:String = list.length + '';
		jTarget.find('.check').find('i').text(length);
		
		updateEntry('check_list',list.join(','),'id = ' + id);
		
	}
	
	/* =======================================================================
	Update Entry
	========================================================================== */
	private static function updateEntry(column:String,value:String,where:String):Void {
		
		getDatetime(function(datetime:String):Void {
			Ajax.updateData(TABLE_NAME,[column,'updatetime'],[value,datetime],where);
		});
		
	}
	
	/* =======================================================================
	Get Datetime
	========================================================================== */
	private static function getDatetime(onLoaded:String->Void):Void {
		
		Ajax.getDatetime(function(datetime:String):Void {
			
			_lastUpdatetime = datetime;
			onLoaded(datetime);
			
		});
		
	}
	
	/* =======================================================================
	Get Entry HTML
	========================================================================== */
	private static function getEntryHTML(id:Int,memberID:Int,text:String,isChecked:Bool,checkLength:Int):String {
		
		var memberDB:Dynamic = Members.db[memberID];
		var isSelf  :Bool    = memberID == Manager.myID;
		var cls     :String  = isSelf ? ' self' : '';
		var checkd  :String  = isChecked ? ' checked' : '';
		var disabled:String  = isSelf ? ' disabled' : '';
		
		var html:String = '
		<li class="entry' + cls + '" data-id="' + id + '">
			<article class="article">
				<input type="checkbox" class="checkbox"' + checkd + disabled + '>
				<b class="name ' + memberDB.parmanent_id + ' ' + memberDB.team + '">' + memberDB.name + '</b>
				<p class="text">' + text + '</p>
				<button type="button" class="delete">×</button>
				<aside class="check"><i>' + checkLength + '</i>人チェック済</aside>
			</article>
		</li>';
		
		return html;
		
	}

}