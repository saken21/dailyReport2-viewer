package view.reportviewer;

import js.jquery.JQuery;
import js.jquery.Event;
import js.html.FileReader;
import js.html.Blob;
import js.html.Image;
import jp.saken.js.utils.Handy;

class DragAndDrop {
	
	private var _jParent:JQuery;
	private var _onInner:Bool;
	
	private static inline var MAX_IMAGE_WIDTH :Int = 1200;
	private static inline var MAX_IMAGE_HEIGHT:Int = 960;
	
	/* =======================================================================
	Constructor
	========================================================================== */
	public function new(jParent:JQuery):Void {

		_onInner = false;

		_jParent = jParent.on({

			drop      : onDrop,
			dragenter : onEnter,
			dragover  : onOver,
			dragleave : onLeave

		});

	}
	
	/* =======================================================================
	On Drop
	========================================================================== */
	private function onDrop(event:Event):Void {
		
		var file:Blob = untyped event.originalEvent.dataTransfer.files[0];
		var fileReader:FileReader = new FileReader();
		
		var fileType:String = file.type.split('image/')[1];
		if (fileType == 'jpeg') fileType = 'jpg';
		
		fileReader.onload = function(event:Dynamic):Void {
			onLoaded(event.target.result,fileType);
		};
		
		fileReader.readAsDataURL(file);
		
		_jParent.removeClass('dragging');
		cancel(event);
		
		event.preventDefault();
		
	}
	
	/* =======================================================================
	On Loaded
	========================================================================== */
	private function onLoaded(src:String,fileType:String):Void {
		
		var image:Image = new Image();
		image.src = src;
		
		image.onload = function(event:Dynamic):Void {
			
			if (image.width > MAX_IMAGE_WIDTH || image.height > MAX_IMAGE_HEIGHT) {

				Handy.alert('ファイルサイズが大き過ぎます。\nリサイズして再度お試しください。');
				return;

			}
			
			var filename:String = Date.now().getTime() + '.' + fileType;
			var base64  :String = src.split(';base64,')[1];

			_jParent.find('.image').find('figure').append(Html.getImage(filename,base64,image));
			
		};
		
	}
	
	/* =======================================================================
	On Drop
	========================================================================== */
	private function onEnter(event:Event):Void {
		
		_onInner = true;
		cancel(event);
		
	}
	
	/* =======================================================================
	On Drop
	========================================================================== */
	private function onOver(event:Event):Void {
		
		_onInner = false;
		_jParent.addClass('dragging');
		
		cancel(event);
		
	}
	
	/* =======================================================================
	On Leave
	========================================================================== */
	private function onLeave(event:Event):Void {
		
		if (_onInner) _onInner = false;
		else _jParent.removeClass('dragging');
		
		cancel(event);
		
	}
	
	/* =======================================================================
	On Drop
	========================================================================== */
	private function cancel(event:Event):Void {
		
		event.preventDefault();
		event.stopPropagation();
		
	}
	
}