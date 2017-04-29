<?php

	if ($_POST) exportCSV($_POST);
	
	function exportCSV($data) {
		
		$string = $data['data'];
		$file   = fopen('csv/'.$data['filename'],'w');
		
		mb_convert_variables("SJIS","UTF-8",$string);
		
		fwrite($file,$string);
		fclose($file);
		
		echo('success');
		
	}

?>