package view.reportviewer;

import js.JQuery;
import js.html.Image;
import jp.saken.utils.Handy;
import db.Members;
import db.Tasks;
import db.Works;
import db.Clients;
import utils.Data;

class Html2 {
	
	private static var _taskCounter:Int;
	
	/* =======================================================================
	Public - Get Report
	========================================================================== */
	public static function getReport(info:Dynamic):String {
		
		var id        :Int            = info.id;
		var member    :Dynamic        = info.member;
		var tasks     :Array<Dynamic> = info.task_list;
		var note      :String         = info.note;
		var images    :Array<String>  = info.image_list;
		var date      :String         = Data.getDate(info.date);
		var day       :String         = Data.getDay(info.date);
		var updatetime:String         = info.updatetime;
		var stars     :Array<String>  = info.star_list;
		
		var isSelf:Bool   = (Manager.myID == member.id);
		var cls   :String = isSelf ? 'self ' : '';

		var html:String = '
		<li class="report ' + cls + member.team + ' loading" data-id="' + id + '">
			<article>
				<header class="header">
		    		<p class="name"><a class="search">' + member.name + '</a></p>
					<aside>
						<time datetime="' + date + '" class="datetime"><a class="search">' + date + '</a> <a class="search">' + day + '</a></time>
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
		        		<ul>' + getStars(stars) + '</ul>
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
		public static function getTasks(tasks:Array<Dynamic>):String {

			var html:String = '';

			for (i in 0...tasks.length) {

				var task:Dynamic = tasks[i];
				
				if (_taskCounter == null) _taskCounter = 0;
				_taskCounter++;
				
				var clientDatalistID:String = 'clientDatalist-' + _taskCounter;
				var workDatalistID  :String = 'workDatalist' + _taskCounter;
				
				html += '
				<li class="task" data-id="' + task.id + '">
			    	<span class="client" data-id="' + task.client.id + '">
						<input type="search" autocomplete="on" placeholder="クライアント名" value="' + task.client.name + '">
						<em><a class="search">' + task.client.name + '</a></em>
					</span>
			    	<span class="work" data-id="' + task.work.id + '">
						<input type="search" autocomplete="on" placeholder="案件名" value="' + task.work.name + '">
						<em><a class="search">' + task.work.name + '</a></em>
					</span>
			    	<span class="hour">
						<input type="number" min="0.5" step="0.5" placeholder="時間" value="' + task.hour + '">
						<em>' + task.hour + '</em>
					</span>
					<button type="button" class="clearTask">×</button>
					<button type="button" class="upTask">↑</button>
					<button type="button" class="downTask">↓</button>
			    </li>';

			}

			return html;

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
		public static function getStars(stars:Array<String>):String {

			var html  :String = '';
			var length:Int    = stars.length;
			
			if (length > 20) return '<li>★×' + length + '</li>';

			var myParmanentID:String = Manager.myParmanentID;

			for (i in 0...length) {

				var parmanentID:String = stars[i];
				var cls:String = (parmanentID == myParmanentID) ? ' class="mine"' : '';

				html += '<li' + cls + ' title="' + parmanentID + '">★</li>';

			}

			return html;

		}
		
	/* =======================================================================
	Get Totaltime
	========================================================================== */
	private static function getTotaltime(tasks:Array<Dynamic>):String {

		var result:Float = 0;

		for (i in 0...tasks.length) {

			var task:Dynamic = tasks[i];
			result += Std.parseFloat(task.hour);

		}

		result = Math.ceil((result * 10)) / 10;

		return '<p class="totaltime"><span>' + result + '</span>h</p>';

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