<?php

	if ($_POST) {
		unlink('../upload/'.$_POST['filename']);
	}

?>