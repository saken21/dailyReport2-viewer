package view.reportviewer;

import js.JQuery;
import js.html.Image;
import jp.saken.utils.Ajax;
import jp.saken.utils.Handy;
 
class AutoSave {
	
	private static var _jParent :JQuery;
	private static var _joinData:String;
	
	private static inline var TABLE_NAME:String = 'autosaves';
	
	/* =======================================================================
	Public - Init
	========================================================================== */
	public static function init(jParent:JQuery):Void {
		
		_jParent = jParent;
		
	}
	
		/* =======================================================================
		Public - On Loop
		========================================================================== */
		public static function onLoop():Void {

			var jReport:JQuery = _jParent.find('.report.edit-mode[data-id="0"]');
			if (jReport.length == 0) return;

			var tasks :String = getTasks(jReport);
			var images:String = getImages(jReport);
			var note  :String = Handy.getReplacedSC(jReport.find('.note').find('textarea').prop('value'));

			var columns:Array<String>  = ['tasks','note','images'];
			var values :Array<Dynamic> = [tasks,note,images];
			
			var joinData:String = values.join('+');
			
			if (_joinData == joinData) return;
			_joinData = joinData;
			
			update(Manager.myID,columns,values);

		}

		/* =======================================================================
		Public - Unset Data
		========================================================================== */
		public static function unsetData(jReport:JQuery):Void {

			if (jReport.data('id') > 0) return;
			Ajax.updateData(TABLE_NAME,['tasks','note','images'],['','',''],'member_id = ' + Manager.myID);

		}

		/* =======================================================================
		Public - Set HTML
		========================================================================== */
		public static function setHTML(jReport:JQuery):Void {

			Ajax.getData(TABLE_NAME,['tasks','note','images'],function(data:Array<Dynamic>):Void {

				if (data.length == 0) return;

				var info  :Dynamic = data[0];
				var tasks :String  = info.tasks;
				var note  :String  = info.note;
				var images:String  = info.images;
				
				if ((tasks + note + images).length == 0) return;

				jReport.find('.tasks').html(getTasksHTML(tasks.split('\n')));
				jReport.find('.note').find('textarea').prop('value',note);
				jReport.find('.image').find('figure').html(getImagesHTML(images.split('\n')));

				ReportViewer.setTotaltime(jReport);

			},'member_id = ' + Manager.myID);

		}
		
	/* =======================================================================
	Get Tasks
	========================================================================== */
	private static function getTasks(jReport:JQuery):String {
		
		var array:Array<String> = [];
		
		jReport.find('.tasks').find('.task').each(function():Void {

			var jTarget:JQuery = JQuery.cur;
			var client :String = jTarget.find('.client').find('input').prop('value');
			var work   :String = jTarget.find('.work').find('input').prop('value');
			var hour   :Float  = jTarget.find('.hour').find('input').prop('value');

			array.push(client + ',' + work + ',' + hour);

		});
		
		return array.join('\n');
		
	}
	
	/* =======================================================================
	Get Images
	========================================================================== */
	private static function getImages(jReport:JQuery):String {
		
		var array:Array<String> = [];

		jReport.find('.image').find('figure').find('span').filter(':visible').each(function():Void {

			var jTarget :JQuery = JQuery.cur;
			var filename:String = jTarget.data('filename');
			var src     :String = jTarget.find('img').prop('src');

			array.push(filename + '#-----#' + src);

		});
		
		return array.join('\n');
		
	}
	
	/* =======================================================================
	Update
	========================================================================== */
	private static function update(myID:Int,columns:Array<String>,values:Array<Dynamic>):Void {
		
		Ajax.getIsEmpty(TABLE_NAME,function(isEmpty:Bool):Void {

			if (isEmpty) {

				columns.unshift('member_id');
				values.unshift(myID);

				Ajax.insertData(TABLE_NAME,columns,values);

			} else {

				Ajax.updateData(TABLE_NAME,columns,values,'member_id = ' + myID);

			}

		},'member_id = ' + myID);
		
	}
	
	/* =======================================================================
	Get Tasks HTML
	========================================================================== */
	private static function getTasksHTML(tasks:Array<String>):String {
		
		var html:String = '';

		for (p in 0...tasks.length) {

			var info:String = tasks[p];
			if (info.length == 0) continue;

			var array:Array<String> = info.split(',');

			html += Html.getTask([0,0,array[0],0,array[1],array[2]]);

		}

		return html;
		
	}
	
	/* =======================================================================
	Get Images HTML
	========================================================================== */
	private static function getImagesHTML(images:Array<String>):String {
		
		var html:String = '';

		for (p in 0...images.length) {

			var info:String = images[p];
			if (info.length == 0) continue;

			var array:Array<String> = info.split('#-----#');
			var src  :String        = array[1];

			var image:Image = new Image();
			image.src = src;

			html += Html.getImage(array[0],src.split(";base64,")[1],image);

		}

		return html;
		
	}

}