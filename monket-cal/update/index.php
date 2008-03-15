<?php

include_once('../monket-cal-config.php');
include_once( MONKET_FILE_BASE . 'CalendarUpdater.class.php');

$result = 'failed';

try {
	$updater = new CalendarUpdater();
	$uid = $updater->update($_GET);
	
	$result = "success";
	if ($uid != null) {
		$result .= "\n" . $uid;
	} 
	
} catch (Exception $e) {
	$result = "failed\n" . $e->getMessage();
}

echo $result;

?>
