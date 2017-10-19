package view.reportviewer;

import js.jquery.JQuery;
import js.html.Image;
import jp.saken.common.utils.Handy;
import db.Members;
import db.Tasks;
import db.Works;
import db.Clients;
import utils.Data;

class Html {
	
	private static var _taskCounter:Int;
	
	/* =======================================================================
	Public - Get Report
	========================================================================== */
	public static function getReport(id:Int,memberID:Int,info:Dynamic,isEditMode:Bool = false):String {

		var memberDB:Dynamic = Members.db[memberID];
		if (memberDB.is_visible == 0) return '';
		
		var myID  :Int    = Manager.myID;
		var isSelf:Bool   = memberID == myID;
		var cls   :String = isSelf ? 'self ' : '';

		if (isEditMode) cls += 'edit-mode ';

		var tasks     :Array<Int>    = info.tasks ? info.tasks.split(',') : null;
		var dates     :Dynamic       = info.dates;
		var date      :String        = dates[0];
		var day       :String        = dates[1];
		var note      :String        = info.note ? info.note : '';
		var images    :Array<String> = info.images ? info.images.split(',') : [];
		var updatetime:String        = info.updatetime ? info.updatetime : '1999-01-01';
		var starts    :Array<Int>    = info.stars ? info.stars.split(',') : [];
		var archives  :Array<Int>    = info.archives ? info.archives.split(',') : [];
		var team      :String        = memberDB.team;
		var myParmanentID:String = Manager.myParmanentID;
		
		if (starts.indexOf(myID) > -1) cls += 'stared ';
		if (archives.indexOf(myID) > -1) cls += 'archived ';
		if (team.length == 0) team = memberDB.section;

		var html:String = '
		<li class="report ' + cls + team + ' loading" data-id="' + id + '">
			<article>
				<header class="header">
		    		<p class="name"><a class="search">' + memberDB.name + '</a></p>
					<aside>
						<time datetime="' + date + '" class="datetime"><a class="search">' + date + '</a> <a class="search">' + day + '</a></time>
						<div class="editTime"><input type="date" value="' + StringTools.replace(date,'.','-') + '"><p class="updateDatetime">更新</p></div>
						<button type="button" class="edit">編集</button>
					</aside>
		    	</header>
		    	<ul class="tasks">' + getTasks(tasks) + '</ul>' + getTotaltime(tasks) + '
				<button type="button" class="addTask">+</button>
				<button type="button" class="copyTask">■</button>
		    	<aside class="note">
		    		<p><textarea placeholder="今日のひとこと">' + note + '</textarea><em>' + Handy.getAdjustedHTML(note) + '</em></p>
		    	</aside>
		    	<aside class="image">
					<p>画像をドロップしてください</p>
		    		<figure>' + getImages(images) + '</figure>
		    	</aside>
		    	<button type="button" class="update">&nbsp;</button>
		    	<footer class="footer">
		    		<section class="star">
		        		<button type="button" class="addStar">★</button>
		        		<ul>' + getStars(starts) + '</ul>
		    		</section>
		    		<time datetime="' + Data.getDate(updatetime) + '" class="lastupdate">' + Date.fromString(updatetime) + '</time>
		    		<button type="button" class="archiveReport">×</button>
		    	</footer>
			</article>
		</li>';

		return html;

	}

		/* =======================================================================
		Public - Get Tasks
		========================================================================== */
		public static function getTasks(tasks:Array<Int> = null,isCopy:Bool = false):String {

			var html:String = '';
			if (tasks == null) tasks = [0];

			for (p in 0...tasks.length) {

				var taskID:Int = tasks[p];

				if (taskID > 0) {

					var taskInfo  :Dynamic = Tasks.db[taskID];
					var workID    :Int     = taskInfo.work_id;
					var workInfo  :Dynamic = Works.db[workID];
					var clientID  :Int     = workInfo.client_id;
					var clientInfo:Dynamic = Clients.db[clientID];
					
					html += getTask([(isCopy ? '0' : taskID),clientID,clientInfo.name,workID,workInfo.name,taskInfo.hour]);

				} else {

					html += getTask(null);

				}

			}

			return html;

		}
		
		/* =======================================================================
		Public - Get Task
		========================================================================== */
		public static function getTask(info:Array<Dynamic>):String {

			var taskID:String,clientID:String,clientName:String,workID:String,workName:String,hour:String;

			if (_taskCounter == null) _taskCounter = 0;
			_taskCounter++;

			if (info == null) {

				taskID = clientID = workID = '0';
				clientName = workName = hour = '';

			} else {

				taskID     = info[0];
				clientID   = info[1];
				clientName = info[2];
				workID     = info[3];
				workName   = info[4];
				hour       = info[5];

			}

			var clientDatalistID:String = 'clientDatalist-' + _taskCounter;
			var workDatalistID  :String = 'workDatalist' + _taskCounter;

			return '
			<li class="task" data-id="' + taskID + '">
		    	<span class="client" data-id="' + clientID + '">
					<input type="search" autocomplete="on" placeholder="クライアント名" value="' + clientName + '" list="client-datalist">
					<em><a class="search">' + clientName + '</a></em>
				</span>
		    	<span class="work" data-id="' + workID + '">
					<input type="search" autocomplete="on" placeholder="案件名" value="' + workName + '" list="work-datalist">
					<em><a class="search">' + workName + '</a></em>
				</span>
		    	<span class="hour">
					<input type="number" min="0.5" step="0.5" placeholder="時間" value="' + hour + '">
					<em>' + hour + '</em>
				</span>
				<button type="button" class="clearTask">×</button>
				<button type="button" class="upTask">↑</button>
				<button type="button" class="downTask">↓</button>
		    </li>';

		}
		
		/* =======================================================================
		Public - Get Image
		========================================================================== */
		public static function getImage(filename:String,base64:String = '',image:Image = null):String {
			
			var fileURL:String = Data.UPLOAD_FOLDER + filename;
			var jWrap  :JQuery = new JQuery('<span data-filename="' + filename + '" data-base64="' + base64 + '">');
			var jAnchor:JQuery = jWrap.html('<a class="lightbox"></a>').find('a');
			
			if (image == null) jAnchor.prop('href',fileURL).html('<img src="' + fileURL + '">');
			else jAnchor.append(image);
			
			jWrap.append('<button type="button" class="deleteImage">×</button>');

			return new JQuery('<div>').append(jWrap).html();

		}
		
		/* =======================================================================
		Public - Get Stars
		========================================================================== */
		public static function getStars(stars:Array<Int>):String {

			var html  :String = '';
			var length:Int    = stars.length;
			
			if (length > 20) return '<li>★×' + length + '</li>';

			var membersDB:Array<Dynamic> = Members.db;
			var myID:Int = Manager.myID;

			for (p in 0...length) {

				var id    :Int    = stars[p];
				var cls   :String = (id == myID) ? ' class="mine"' : '';
				var member:Dynamic = membersDB[id];
				
				if (member == null) continue;

				html += '<li' + cls + ' title="' + member.parmanent_id + '">★<span class="starName">' + member.parmanent_id + '</span></li>';

			}

			return html;

		}
		
	/* =======================================================================
	Get Totaltime
	========================================================================== */
	private static function getTotaltime(tasks:Array<Int> = null):String {

		var totaltime:Float = 0;
		if (tasks == null) tasks = [0];

		for (p in 0...tasks.length) {

			var taskID:Int = tasks[p];
			if (taskID > 0) totaltime += Std.parseFloat(Tasks.db[taskID].hour);

		}
		
		totaltime = Math.ceil((totaltime * 10)) / 10;

		return '<p class="totaltime"><span>' + totaltime + '</span>h</p>';

	}
	
	/* =======================================================================
	Get Datalist
	========================================================================== */
	private static function getDatalist(data:Array<Dynamic>):String {
		
		var html:String = '';
		
		for (p in 0...data.length) {
			
			var info:Dynamic = data[p];
			
			if (info != null) {
				
				var clientID:Int = info.client_id;
				var prop:String = (clientID == null) ? '' : ' data-clientid="' + clientID + '"';
				
				html += '<option value="' + info.name + '" data-id="' + info.id + '"' + prop + '></option>';
			}
			
		}
		
		return html;
		
	}
	
	/* =======================================================================
	Get Images
	========================================================================== */
	private static function getImages(images:Array<String>):String {
		
		var html:String = '';
		
		for (p in 0...images.length) {
			html += getImage(images[p]);
		}
		
		return html;
		
	}
	
}