package view.reportviewer;

import js.Browser;
import js.jquery.JQuery;
import js.jquery.Event;
import jp.saken.common.utils.Handy;
import jp.saken.js.utils.Ajax;
import utils.Data;

class ReportEditor {
	
	private static var _jParent   :JQuery;
	private static var _jTasks    :JQuery;
	private static var _jTaskList :JQuery;
	private static var _isUpdating:Bool;
	
	private static inline var TABLE_NAME:String = 'reports';
	private static var COLUMN_LIST:Array<String> = ['member_id','task_id_list','note','image_list','updatetime','archived_list'];
	
	private static inline var EDIT_MODE_CLASS:String = 'edit-mode';
	private static inline var UPDATING_CLASS :String = 'updating';
	private static inline var READ_MODE_WIDTH:Int    = 298;
	private static inline var EDIT_MODE_WIDTH:Int    = 628;
	
		/* =======================================================================
		Public - Update
		========================================================================== */
		public static function update(jParent:JQuery):Void {
			
			if (_isUpdating) {
				
				Browser.window.alert('更新中です。');
				return;
				
			}
			
			_jParent   = jParent;
			_jTasks    = _jParent.find('.tasks');
			_jTaskList = _jTasks.find('.task');
			
			if (!getIsFull()) {
				
				Browser.window.alert('空欄があります。');
				return;
				
			}
			
			_isUpdating = true;
			_jParent.addClass(UPDATING_CLASS).unbind().find('article').stop().css({ opacity:.3 });
			
			updateTasks();
			updateImages();

		}
		
		/* =======================================================================
		Public - Set Edit Mode
		========================================================================== */
		public static function setEditMode(jParent:JQuery):Void {
			
			new DragAndDrop(jParent);
			
			jParent.stop().addClass(EDIT_MODE_CLASS).animate({ width:EDIT_MODE_WIDTH }, 300);
			jParent.find('article').stop().css({ opacity:.3 }).animate({ opacity:1 }, 1000);

		}
		
		/* =======================================================================
		Public - Cancel
		========================================================================== */
		public static function cancel():Void {
			
			_isUpdating = false;

			_jParent.stop().removeClass(UPDATING_CLASS);
			_jParent.find('article').stop().animate({ opacity:1 }, 300);
			
			_jTaskList.unbind();

		}
	
	/* =======================================================================
	Get Is Full
	========================================================================== */
	private static function getIsFull():Bool {
		
		if (_jTaskList.length > 1) {
			
			for (p in 0..._jTaskList.length) {
				
				var jTask  :JQuery = _jTaskList.eq(p);
				var isEmpty:Bool   = true;
				var jInputs:JQuery = jTask.find('input');

				for (i in 0...jInputs.length) {

					if (jInputs.eq(i).prop('value').length  > 0) {
						isEmpty = false;
					}

				}

				if (isEmpty) jTask.remove();
				
			}
			
		}
		
		_jTaskList = _jTasks.find('.task');
		
		var isFull :Bool   = true;
		var jInputs:JQuery = _jTaskList.find('input');

		for (i in 0...jInputs.length) {

			if (jInputs.eq(i).prop('value').length == 0) {
				isFull = false;
			}

		}
		
		return isFull;
		
	}
	
	/* =======================================================================
	Update Tasks
	========================================================================== */
	private static function updateTasks():Void {
		
		var counter:Int = _jTaskList.length;
		
		function onUpdated(event:Event):Void {
			
			counter--;
			if (counter == 0) updateData();
			
		}
		
		for (p in 0...counter) {
			
			var jTask:JQuery = _jTaskList.eq(p).unbind().on('updated',onUpdated);
			new Task(jTask);
			
		}
		
	}
	
	/* =======================================================================
	Update Images
	========================================================================== */
	private static function updateImages():Void {
		
		var jImages:JQuery = _jParent.find('.image').find('figure').find('span');
		if (jImages.length == 0) return;
		
		for (p in 0...jImages.length) {
			
			var jTarget :JQuery = jImages.eq(p);
			var filename:String = jTarget.data('filename');
			
			if (jTarget.hasClass('hidden')) {
				
				jTarget.remove();
				Ajax.deleteImage(filename);
				
			} else {
				
				var base64:String = jTarget.data('base64');
				
				if (base64.length > 0) {
					
					Ajax.uploadImage(filename,base64);
					jTarget.find('.lightbox').prop('href',Data.UPLOAD_FOLDER + filename);
				
				}
				
			}
			
		}
		
	}
	
	/* =======================================================================
	Update Data
	========================================================================== */
	private static function updateData():Void {
		
		var id     :Int    = _jParent.data('id');
		var jNote  :JQuery = _jParent.find('.note');
		var jImages:JQuery = _jParent.find('.image').find('figure').find('span');
		
		var note:String = Handy.getReplacedSC(jNote.find('textarea').prop('value'));
		
		var taskIDs:Array<String> = [];
		var images :Array<String> = [];
		
		for (p in 0..._jTaskList.length) {
			taskIDs.push(_jTaskList.eq(p).data('id'));
		}
		
		for (p in 0...jImages.length) {
			images.push(jImages.eq(p).data('filename'));
		}
		
		jNote.find('em').html(Handy.getAdjustedHTML(note));
		
		Ajax.getDatetime(function(datetime:String):Void {
			
			var colums:Array<String>  = COLUMN_LIST;
			var values:Array<Dynamic> = [Manager.myID,taskIDs.join(','),note,images.join(','),datetime,''];
			
			_jParent.find('.lastupdate').text(Std.string(Date.fromString(datetime)));
			
			if (id > 0) {
				
				Ajax.updateData(TABLE_NAME,colums,values,'id = ' + id,onUpdated);
				
			} else {
				
				colums = colums.concat(['date']);
				values.push(datetime);
				
				Ajax.insertData(TABLE_NAME,colums,values,onInsertedData);
				
			}
			
		});
		
	}
	
	/* =======================================================================
	On Inserted Data
	========================================================================== */
	private static function onInsertedData(lastID:Int):Void {
		
		_jParent.data('id',lastID);
		onUpdated();
		
	}
	
	/* =======================================================================
	On Updated
	========================================================================== */
	private static function onUpdated():Void {
		
		_isUpdating = false;
		
		var classes:String = EDIT_MODE_CLASS + ' ' + UPDATING_CLASS;
		
		_jParent.stop().removeClass(classes).animate({ width:READ_MODE_WIDTH }, 300);
		_jParent.find('article').stop().animate({ opacity:1 }, 1000);

		AutoSave.unsetData(_jParent);
		
	}
	
}