<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
	<title>Monket Calendar</title>
  <?php
    include_once('monket-cal-config.php');    
    include_once( MONKET_FILE_BASE . 'monket-cal-init.php');

    echo getCalInitHTML();
  ?>

<style>
html {
	font-family: Verdana;
	font-size: 14px;
}
</style>

</head>
<body>

<div class="hidden" id="logging-on"></div>
<h1><?= $MC['title'] ?></h1>

<?php
  include_once( MONKET_FILE_BASE . 'monket-cal-parse.php');
  displayCalendar();
?>

</body>
</html>