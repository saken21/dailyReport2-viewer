package view.reportviewer;

import js.JQuery;
import jp.saken.utils.Dom;
import jp.saken.utils.Ajax;

class Task {
	
	private var _jParent   :JQuery;
	private var _id        :Int;
	private var _clientID  :Int;
	private var _workID    :Int;
	private var _clientName:String;
	private var _workName  :String;
	private var _hour      :String;
	
	/* =======================================================================
	Constructor
	========================================================================== */
	public function new(jParent:JQuery):Void {
		
		_jParent = jParent;
		_id      = jParent.data('id');
		
		var jClient:JQuery = jParent.find('.client');
		var jWork  :JQuery = jParent.find('.work');
		var jHour  :JQuery = jParent.find('.hour');
		
		_clientName = jClient.find('input').prop('value');
		_workName   = jWork.find('input').prop('value');
		_hour       = jHour.find('input').prop('value');
		
		_jParent.on({
			
			getWorkID : function(event:JqEvent):Void {
				update();
			},
			
			getClientID : function(event:JqEvent):Void {
				judgeIsEmpty('works',_workName,'案件');
			}
			
		});
		
		jClient.find('.search').text(_clientName);
		jWork.find('.search').text(_workName);
		jHour.find('em').text(_hour);
		
		judgeIsEmpty('clients',_clientName,'クライアント');
		
	}
	
	/* =======================================================================
	Judge Is Empty
	========================================================================== */
	private function judgeIsEmpty(table:String,name:String,string:String):Void {
		
		Ajax.getIsEmpty(table,function(isEmpty:Bool):Void {
			
			if (isEmpty) addData(table,name,string);
			else getData(table,name);
			
		},getWhere(name,table == 'works'));
		
	}
	
	/* =======================================================================
	Add Data
	========================================================================== */
	private function addData(table:String,name:String,string:String):Void {
		
		var isOK:Bool = Dom.window.confirm(string + 'に「' + name + '」を追加しますか？');
		
		if (isOK) {
			
			var columns:Array<String>  = [];
			var values :Array<Dynamic> = [];
			
			if (table == 'clients') {
				
				columns = ['name'];
				values  = [name];
				
			} else if (table == 'works') {
				
				columns = ['client_id,name'];
				values  = [_clientID,name];
				
			}
			
			Ajax.insertData(table,columns,values,function(lastID:Int):Void {
				getData(table,name);
			});
			
		} else {
			
			ReportEditor.cancel();
			
		}
		
	}
	
	/* =======================================================================
	Get Data
	========================================================================== */
	private function getData(table:String,name:String):Void {
		
		Ajax.getData(table,['id'],function(data:Array<Dynamic>):Void {
			
			if (table == 'clients') {
				
				_clientID = data[0].id;
				_jParent.trigger('getClientID');
				
			} else if (table == 'works') {
				
				_workID = data[0].id;
				_jParent.trigger('getWorkID');
				
			}
			
		},getWhere(name,table == 'works'));
		
	}
	
	/* =======================================================================
	Get Where
	========================================================================== */
	private function getWhere(name:String,isWork:Bool):String {
		
		var where:String = 'name = "' + name + '"';
		if (isWork) where += ' AND client_id = "' + _clientID + '"';
		
		return where;
		
	}
	
	/* =======================================================================
	Update
	========================================================================== */
	private function update():Void {
		
		Ajax.getDatetime(function(datetime:String):Void {
			
			var myID:Int = Manager.myID;
			
			var table  :String         = 'tasks';
			var columns:Array<String>  = ['member_id','work_id','hour','updatetime'];
			var values :Array<Dynamic> = [myID,_workID,_hour,datetime];
			
			if (_id > 0) {
				
				Ajax.updateData(table,columns,values,'id = ' + _id,function():Void {
					_jParent.trigger('updated');
				});
				
			} else {
				
				Ajax.insertData(table,columns,values,function(lastID:Int):Void {
					_jParent.data('id',lastID).trigger('updated');
				});
				
			}
			
		});
		
	}
	
}