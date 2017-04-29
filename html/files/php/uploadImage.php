<?php

	if ($_POST) {
		file_put_contents('../upload/'.$_POST['filename'],base64_decode($_POST['base64']));
	}

?>