<?php

class Calendar extends vcalendar {
	private $name;
	
	function __construct($name) {
		parent::__construct();
		
		$this->name = $name;
		
		$filename = $this->name . '.ics';
		
		$this->setConfig( 'directory', CALENDAR_DIR ); // identify directory
		$this->setConfig( 'filename', $filename ); // identify file name
		$this->parse();
	}

	function save() {
		$filename = $this->name . '.ics';
		$tempFilename = $filename . '.temp';
		$backupFilename = $filename . '.backup';

		$this->setConfig( 'filename', $tempFilename ); // identify file name
		$this->saveCalendar();

		// copy old file to backup
		if (!copy(CALENDAR_DIR . $filename, CALENDAR_DIR . $backupFilename)) {
			throw new Exception("failed\nunable to backup calendar '$filename' to '$backupFilename'");
		}

		// copy new file to original
		if (!copy(CALENDAR_DIR . $tempFilename, CALENDAR_DIR . $filename)) {
			throw new Exception("failed\nunable to copy temporary calendar file '$tempFilename' to '$filename'");
		}
	}	
	
	
}
