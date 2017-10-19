package view;

import haxe.Json;
import js.Browser;
import js.jquery.JQuery;
import js.jquery.Event;
import jp.saken.js.components.Lightbox;
import utils.Ajax;
import db.Members;
import db.Tasks;
import db.Clients;
import db.Works;
import utils.Data;
import ui.Datalist;
import view.reportviewer.*;

class ReportViewer {
	
	private static var _jParent        :JQuery;
	private static var _jContents      :JQuery;
	private static var _jClientDatalist:JQuery;
	private static var _jWorkDatalist  :JQuery;
	private static var _fullData       :Array<Dynamic>;
	private static var _currentData    :Array<Dynamic>;
	private static var _current        :Int;
	
	private static inline var TABLE_NAME:String = 'reports';
	private static inline var LENGTH_AT_ONCE:Int = 10;
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init():Void {
		
		_jParent = new JQuery('#reportviewer');
		
		_jContents = _jParent.find('#reportviewer-content').on({
			
			click   : onClick,
			keydown : onKeyup,
			change  : onChange
			
		});
		
		_jClientDatalist = _jParent.find('#client-datalist');
		_jWorkDatalist   = _jParent.find('#work-datalist');
		
		AutoSave.init(_jContents);
		
		SortNavi.init(_jParent.find('#sort-navi'));
		SearchNavi.init(_jParent.find('#search-navi'));
		
		Lightbox.init('.lightbox');
		Scrollbar.init(_jParent);
		
		Datalist.set(_jClientDatalist,'clients');
		
	}
	
		/* =======================================================================
		Public - Show
		========================================================================== */
		public static function show():Void {
			
			loadDB(function():Void {
				
				_jParent.show();
				SortNavi.showNew();
				
			});
			
		}
		
		/* =======================================================================
		Public - Hide
		========================================================================== */
		public static function hide():Void {
			
			reset();
			_jParent.stop().hide();
			
		}
		
		/* =======================================================================
		Public - Load DB
		========================================================================== */
		public static function loadDB(onLoaded:Void->Void = null):Void {
			
			Ajax.getData(TABLE_NAME,['*'],function(data:Array<Dynamic>):Void {
				
				_fullData = getSortedFullData(data);
				if (onLoaded != null) onLoaded();
			
			},'date > "' + Manager.pastDate + '"');
			
		}
		
		/* =======================================================================
		Public - Show Reports
		========================================================================== */
		public static function showReports(category:String,eReg:EReg = null):Void {

			_jContents.removeClass().addClass(category).empty();

			_currentData = getChoicedData(category,eReg);
			_current = 0;
			
			if (category == 'new') addNewEditor(Manager.myID,Manager.visitDate);
			
			loadMore();

		}
		
		/* =======================================================================
		Public - Load More
		========================================================================== */
		public static function loadMore(length:Int = null):Void {
			
			if (length == null) length = LENGTH_AT_ONCE;
			
			_jContents.append(getHTML(_currentData,length));
			fadein();
			
		}
		
		/* =======================================================================
		Public - Archive All
		========================================================================== */
		public static function archiveAll():Void {
			
			var jList:JQuery = _jContents.find('.report').not('.archived');
			
			for (p in 0...jList.length) {
				
				var jTarget:JQuery = jList.eq(p);
				if (jTarget.data('id') != 0) archiveReport(jTarget,false);
				
			}
			
			loadMore();
			
		}
		
		/* =======================================================================
		Public - Search
		========================================================================== */
		public static function search(value:String):Void {
			
			showReports('searching',new EReg(value,'i'));

		}
		
		/* =======================================================================
		Public - Rest
		========================================================================== */
		public static function reset():Void {
			
			SearchNavi.input('');
			SortNavi.clear();
			
			_jContents.empty();

		}
		
		/* =======================================================================
		Public - Set Totaltime
		========================================================================== */
		public static function setTotaltime(jReport:JQuery):Void {

			var totaltime:Float  = 0;
			var jTasks   :JQuery = jReport.find('.tasks').find('.task');

			for (i in 0...jTasks.length) {

				var value:String = jTasks.eq(i).find('.hour').find('input').prop('value');
				if (value.length == 0) value = '0';
				
				totaltime += Std.parseFloat(value);

			}

			totaltime = Math.ceil((totaltime * 10)) / 10;
			jReport.find('.totaltime').find('span').text(Std.string(totaltime));

		}
		
		/* =======================================================================
		Public - Update Stars
		========================================================================== */
		public static function updateStars(reportID:Int,stars:String):Void {

			for (p in 0..._fullData.length) {
				if (_fullData[p].id == reportID) _fullData[p].star_list = stars;
			}

		}
		
		/* =======================================================================
		Public - On Loop
		========================================================================== */
		public static function onLoop():Void {
			
			var jTask :JQuery = _jContents.find('.task');
			var jFocus:JQuery = jTask.find(':focus').parents('.task');
			
			if (jFocus.hasClass('lastFocus')) return;
			
			jTask.removeClass('lastFocus');
			jFocus.addClass('lastFocus');
			
			setWorkDatalist(jFocus);

		}
	
	/* =======================================================================
	Get Sorted Full Data
	========================================================================== */
	private static function getSortedFullData(data:Array<Dynamic>):Array<Dynamic> {
		
		var dates:Array<String> = [];
		var dataOfDate:Map<String,Array<Dynamic>> = new Map();
		
		data.reverse();
		
		for (p in 0...data.length) {
			
			var info :Dynamic        = data[p];
			var date :String         = info.date;
			var array:Array<Dynamic> = dataOfDate.get(date);
			
			if (array == null) {
				
				array = [];
				dates.push(date);
				
			}
			
			array.push(info);
			dataOfDate.set(date,array);

		}
		
		dates.sort(function(a:String,b:String):Int {
			return Math.floor(Date.fromString(b).getTime() - Date.fromString(a).getTime());
		});
		
		data = [];
		
		for (p in 0...dates.length) {
			
			var date:String = dates[p];
			var array:Array<Dynamic> = dataOfDate.get(date);
			
			array.sort(function(a:Dynamic,b:Dynamic):Int {
				return (a.updatetime < b.updatetime) ? 1 : -1;
			});
			
			data = data.concat(array);
			
		}
		
		return data;
		
	}
	
	/* =======================================================================
	Get Choiced Data
	========================================================================== */
	private static function getChoicedData(category:String,eReg:EReg = null):Array<Dynamic> {
		
		if (category == 'all') return _fullData;
		
		var myID:Int    = Manager.myID;
		var team:String = category.split(' ')[0];
		
		function getChoiceNew(info:Dynamic):Bool {
			return info.archived_list.split(',').indexOf(myID) == -1;
		}
		
		function getChoiceStared(info:Dynamic):Bool {
			return info.star_list.split(',').indexOf(myID) > -1;
		}
		
		function getChoiceSelf(info:Dynamic):Bool {
			return info.member_id == myID;
		}
		
		function getChoiceTeam(info:Dynamic):Bool {
			
			var memberDB:Dynamic = Members.db[info.member_id];
			var value   :String  = memberDB.team;
			
			if (value.length == 0) value = memberDB.section;
			
			return value == team;
			
		}
		
		function getChoiceSearch(info:Dynamic):Bool {
			return eReg.match(getReportString(info));
		}
		
		var data:Array<Dynamic> = [];
		
		var getIsMatch:Dynamic->Bool = (function():Dynamic->Bool {
			
			if (category == 'new') return getChoiceNew;
			else if (category == 'searching') return getChoiceSearch;
			else if (category == 'stared') return getChoiceStared;
			else if (category == 'self') return getChoiceSelf;
			else return getChoiceTeam;
			
		})();

		for (p in 0..._fullData.length) {

			var info:Dynamic = _fullData[p];
			if (getIsMatch(info)) data.push(info);

		}
		
		return data;
		
	}
	
	/* =======================================================================
	Get HTML
	========================================================================== */
	private static function getHTML(data:Array<Dynamic>,length:Int):String {
		
		var html:String = '';
		
		var a:Int = _current;
		var b:Int = _current + length;
		
		if (b > data.length) b = data.length;
		
		for (p in a...b) {
			
			var info:Dynamic = data[p];
			var date:String  = info.date;

			html += Html.getReport(info.id,info.member_id,{

				tasks      : info.task_id_list,
				note       : info.note,
				images     : info.image_list,
				dates      : [Data.getDate(date),Data.getDay(date)],
				updatetime : info.updatetime,
				stars      : info.star_list,
				archives   : info.archived_list

			});
			
		}
		
		_current = b;
		
		return html;
		
	}
	
	/* =======================================================================
	Get Report String
	========================================================================== */
	private static function getReportString(info:Dynamic):String {
		
		var memberID:Int = info.member_id;
		
		var tasks:Array<Int>    = info.task_id_list.split(',');
		var date :String        = info.date;
		var array:Array<String> = [Members.db[memberID].name,Data.getDate(date),Data.getDay(date),info.note];
		
		for (q in 0...tasks.length) {
			
			var taskID  :Int     = tasks[q];
			var taskInfo:Dynamic = Tasks.db[taskID];

			if (taskInfo == null) continue;

			var workID    :Int     = taskInfo.work_id;
			var workInfo  :Dynamic = Works.db[workID];
			var clientID  :Int     = workInfo.client_id;
			var clientInfo:Dynamic = Clients.db[clientID];
			
			array.push(workInfo.name);
			array.push(clientInfo.name);
			
		}
		
		return array.join(',');
		
	}
	
	/* =======================================================================
	Fadein
	========================================================================== */
	private static function fadein():Void {
		
		var jReports :JQuery = _jContents.find('.report').filter('.loading');
		var jArticles:JQuery = jReports.find('article').css({ opacity:0 });
		
		for (p in 0...jArticles.length) {
			
			jReports.eq(p).removeClass('loading');
			jArticles.eq(p).stop().delay(60 * p).animate({ opacity:1 }, 200);
		
		}
		
	}
	
	/* =======================================================================
	Add New Editor
	========================================================================== */
	private static function addNewEditor(myID:Int,date:String):Void {
		
		Ajax.getIsEmpty(TABLE_NAME,function(isEmpty:Bool):Void {
			
			if (!isEmpty) return;

			_jContents.prepend(Html.getReport(0,myID,{
				dates : [Data.getDate(date),Data.getDay(date)]
			},true));
			
			var jTarget:JQuery = _jContents.find('.report').first();
			
			AutoSave.setHTML(jTarget);
			new DragAndDrop(jTarget);

		},'date = "' + date + '" AND member_id = ' + myID);
		
	}
	
	/* =======================================================================
	On Click
	========================================================================== */
	private static function onClick(event:Event):Void {
		
		var jTarget:JQuery = new JQuery(event.target);
		var jReport:JQuery = jTarget.parents('.report');
		
		if (jTarget.hasClass('update')) ReportEditor.update(jReport);
		if (jTarget.hasClass('edit')) ReportEditor.setEditMode(jReport);
		if (jTarget.hasClass('clearTask')) clearTask(jTarget.parents('.task'));
		if (jTarget.hasClass('upTask')) upTask(jTarget.parents('.task'));
		if (jTarget.hasClass('downTask')) downTask(jTarget.parents('.task'));
		if (jTarget.hasClass('addTask')) addTask(jReport.find('.tasks'));
		if (jTarget.hasClass('copyTask')) copyTasks(jReport);
		if (jTarget.hasClass('deleteImage')) deleteImage(jTarget);
		if (jTarget.hasClass('addStar')) addStar(jReport);
		if (jTarget.hasClass('archiveReport')) archiveReport(jReport);
		if (jTarget.hasClass('search')) SearchNavi.input(jTarget.text());
		if (jTarget.hasClass('updateDatetime')) updateDatetime(jReport,jTarget);
		
	}
	
	/* =======================================================================
	On Keyup
	========================================================================== */
	private static function onKeyup(event:Event):Void {
		
		var jTarget:JQuery = new JQuery(event.target);
		var keyCode:Int    = event.keyCode;
		
		if (keyCode == 13) { // [enter]
			onEnter(jTarget);
		}
		
		if (event.ctrlKey) {
			
			switch (keyCode) {
				
				case 8 : { // [delete]
					clearTask(jTarget.parents('.task'));
				}
				
				default : {}
				
			}
			
		}
		
	}
	
	/* =======================================================================
	On Change
	========================================================================== */
	private static function onChange(event:Event):Void {
		
		var jTarget:JQuery = new JQuery(event.target);
		
		setWorkDatalist(jTarget.parents('.task'));
		setTotaltime(jTarget.parents('.report'));
		
	}
	
	/* =======================================================================
	On Enter
	========================================================================== */
	private static function onEnter(jTarget:JQuery):Void {
		
		var jTask:JQuery = jTarget.parents('.task');
		if (jTask.length == 0) return;

		var jSpan :JQuery = jTarget.parent('span');
		var jTasks:JQuery = jTarget.parents('.tasks');

		var isInputed:Bool = (jTarget.prop('value').length > 0);

		if (jTask.is(':last-child') && jSpan.is('.hour')) {

			if (isInputed) addTask(jTasks);

		} else {

			if (isInputed) {

				var jNext:JQuery = jTask.find('span').eq(jSpan.index() + 1).find('input');

				if (jNext.length > 0) jNext.trigger('focus');
				else jTasks.find('.task').eq(jTask.index() + 1).find('input').first().trigger('focus');

			} else if (jSpan.is(':first-child')) {

				ReportEditor.update(jTasks.parents('.report'));

			}

		}

	}
	
	/* =======================================================================
	Set Work Datalist
	========================================================================== */
	private static function setWorkDatalist(jTask:JQuery):Void {
		
		var client  :String = jTask.find('.client').find('input').prop('value');
		var clientID:String = _jClientDatalist.find('[value="' + client + '"]').data('id');
		
		if (clientID == null) return;
		
		Datalist.set(_jWorkDatalist,'works',clientID);
		
	}
	
	/* =======================================================================
	Add Task
	========================================================================== */
	private static function addTask(jTasks:JQuery):Void {
		
		var jTaskList :JQuery = jTasks.find('.task');
		var jFocusTask:JQuery = jTaskList.filter('.lastFocus');
		
		if (jFocusTask.length == 0) jFocusTask = jTaskList.last();
		
		var index    :Int = jFocusTask.index();
		var scrollTop:Int = 30 * index;
		
		jFocusTask.after(Html.getTasks());
		jFocusTask.next().hide().slideDown(200).find('input').first().trigger('focus').removeClass('lastFocus');
		
		jTasks.animate({ scrollTop:scrollTop }, 200);
		
	}
	
	/* =======================================================================
	Clear Task
	========================================================================== */
	private static function clearTask(jTask:JQuery):Void {

		if (jTask.length == 0) return;
		
		var jReport:JQuery = jTask.parents('.report');
		var jTasks :JQuery = jTask.parents('.tasks');
		var index  :Int    = jTask.index();

		if (jTasks.find('.task').length == 1) {
			if (index == 0) jTask.find('input').prop('value','');
		} else {
			jTask.remove();
		}
		
		setTotaltime(jReport);

	}
	
	/* =======================================================================
	Up Task
	========================================================================== */
	private static function upTask(jTask:JQuery):Void {
		
		var jTasks:JQuery = jTask.parents('.tasks');
		var index :Int    = jTask.index();

		jTasks.find('.task').eq(index - 1).before(jTask);

	}
	
	/* =======================================================================
	Down Task
	========================================================================== */
	private static function downTask(jTask:JQuery):Void {
		
		var jTasks:JQuery = jTask.parents('.tasks');
		var index :Int    = jTask.index();

		jTasks.find('.task').eq(index + 1).after(jTask);

	}
	
	/* =======================================================================
	Copy Tasks
	========================================================================== */
	private static function copyTasks(jReport:JQuery):Void {
		
		if (jReport.data('id') > 0) return;
		
		Ajax.getMaxData(TABLE_NAME,'id',function(id:Int):Void {
			
			if (id == 0) return;
			
			Ajax.getData(TABLE_NAME,['task_id_list'],function(data:Array<Dynamic>):Void {
				
				var html:String = Html.getTasks(data[0].task_id_list.split(','),true);
				
				jReport.find('.tasks').html(html);
				setTotaltime(jReport);

			},'id = ' + id);
			
		},'member_id = ' + Manager.myID);
		
	}
	
	/* =======================================================================
	Delete Image
	========================================================================== */
	private static function deleteImage(jTarget:JQuery):Void {
		
		jTarget.parents('span').addClass('hidden');
		
	}
	
	/* =======================================================================
	Add Star
	========================================================================== */
	private static function addStar(jReport:JQuery):Void {
		
		var reportID     :Int    = jReport.data('id');
		var myID         :Int    = Manager.myID;
		var myParmanentID:String = Manager.myParmanentID;
		var jStars       :JQuery = jReport.find('.star').find('ul');
		var where        :String = 'id = ' + reportID;

		Ajax.getData(TABLE_NAME,['star_list','is_checked_star'],function(data:Array<Dynamic>):Void {
			
			var info   :Dynamic    = data[0];
			var array  :Array<Int> = info.star_list ? info.star_list.split(',') : [];
			var isEmpty:Bool       = array.indexOf(myID) < 0;
			var checkd :Int        = info.is_checked_star;
			
			jStars.html(Html.getStars(array));
			
			if (isEmpty) {
				
				array.push(myID);

				jStars.append('<li class="mine" title="' + myParmanentID + '">★</li>');
				jStars.find('li').last().css({ top:10 }).animate({ top:0 }, 300, 'easeOutBack');
				jReport.addClass('stared');

			} else {
				
				array.remove(myID);
				if (array.length == 0) checkd = 1;
				
				var jMine:JQuery = jStars.find('.mine');
				
				if (jMine.length > 0) jStars.find('.mine').remove();
				else jStars.html(Html.getStars(array));
				
				jReport.removeClass('stared');

			}
			
			var stars:String = array.join(',');
			updateStars(reportID,stars);
			
			var columns:Array<String>  = ['star_list','is_checked_star'];
			var values :Array<Dynamic> = [stars,isEmpty ? 0 : checkd];

			Ajax.updateData(TABLE_NAME,columns,values,where);

		},where);
		
	}
	
	/* =======================================================================
	Archive Report
	========================================================================== */
	private static function archiveReport(jReport:JQuery,isLoad:Bool = true):Void {
		
		jReport.addClass('archived');
		
		var reportID:Int    = jReport.data('id');
		var myID    :Int    = Manager.myID;
		var where   :String = 'id = ' + reportID;
		
		Ajax.getData(TABLE_NAME,['archived_list'],function(data:Array<Dynamic>):Void {
			
			var array:Array<Int> = data[0].archived_list ? data[0].archived_list.split(',') : [];
			array.push(myID);
			
			var archives:String = array.join(',');
			
			updateArchive(reportID,archives);
			Ajax.updateData(TABLE_NAME,['archived_list'],[archives],where);
			
		},where);
		
		if (isLoad) loadMore(1);
		
	}
	
	/* =======================================================================
	Public - Update Stars
	========================================================================== */
	public static function updateArchive(reportID:Int,archives:String):Void {

		for (p in 0..._fullData.length) {
			if (_fullData[p].id == reportID) _fullData[p].archived_list = archives;
		}

	}
	
	/* =======================================================================
	Update Datetime
	========================================================================== */
	private static function updateDatetime(jReport:JQuery,jTarget:JQuery):Void {

		var updatetime : String = jTarget.siblings('input[type="date"]').val();
		if (updatetime == null || updatetime == '') {
			Browser.window.alert('空欄があります。');
			return;
		}

		var where : String = 'id = ' + jReport.data('id');
		if (Browser.window.confirm(updatetime + 'に日付を更新しますか？')) {
			Ajax.updateData(TABLE_NAME,['date'],[updatetime],where,function() {
				Browser.window.alert('日付を更新しました。');
			});
		}
		
	}
	
}