<?php

        /*
         * Monket Calendar 0.9
         *  by Karl O'Keeffe
         *  24 June 2005
         *
         * Homepage: http://www.monket.net/wiki/monket-calendar/
         * Released under the GPL (all code)
         * Released under the Creative Commons License 2.5 (without phpicalendar)
         */

	function doUpdate() {
		$uid = substr($_GET['uid'], strlen('event-'));
		$oldCalName = $_GET['oldCalName'];
		$calName = $_GET['calName'];
		$eventStart = $_GET['eventStart'];
		$eventEnd   = $_GET['eventEnd'];
		$eventText = $_GET['eventText'];

		if ($calName == null) {
			return "failed\nno calendar name";
		}

		if ($uid == '' && ($eventStart == null || $eventEnd == null)) {
			return "failed\nno start/end date";
		}

		if ($uid == '' && $eventText == '') {
			return "success\nhaven't created event because text is empty";
		}

		
		if ($oldCalName != null) {
			// we have an old calendar, so move event from that cal to $calName
			// read in old cal
			// get event from old cal
			// read in new cal
			// append event
		}

                $filename = CALENDAR_DIR . $calName . '.ics';

		// backup calendar
		if (!copy($filename, $filename . '.bak')) {
			return "failed\nunable to backup calendar: $filename";
		}

                //   get calendar file specified
                if (!is_writable($filename)) {
			return "failed\ncalendar is not writeable: $filename";
		}

		$lines = file($filename);
		if ($lines === FALSE) {
			return "failed\nunable to read in calendar: $filename";
		}

		$handle = fopen($filename, 'w');
		if ($handle == null) {
			return "failed\nunable to open calendar file for writing: $filename";
		}

		$result = "failed:\nunknown reason";
		if ($uid == '') {
			$uid = uniqid('MONKET-', true);

			//   create ical record
			$record = "";
			$record .= "BEGIN:VEVENT\n";
			$record .= "DTSTART;VALUE=DATE:" . $eventStart .  "\n";
			$record .= "DTEND;VALUE=DATE:" . $eventEnd . "\n";
			$record .= "SUMMARY:" . $eventText . "\n";
			$record .= "UID:" . $uid . "\n";
			$record .= "DTSTAMP:" . date('Ymd\THis') . "\n";
			$record .= "END:VEVENT\n";
	
			$result = "failed\ndid not write record";
			foreach ($lines as $line) {
				if (trim($line) == 'END:VCALENDAR') {
					$result = 'success' . "\n" . $uid;
					fputs($handle, $record);
				}
				fputs($handle, $line);
			}

		} else {
			$result = "failed\nunable to edit event";
			$record = null;
			foreach ($lines as $line) {
				$value = trim($line);
				
				if ($value == 'BEGIN:VEVENT') {
					$record = $line;
				} else if (startsWith($value, 'UID:')) {
                                	$record .= $line;
                                	$recordUid = trim(substr($value, strlen('UID:')));
                                } else if ($value == 'END:VEVENT') {
                                	$record .= $line;
                                	if ($uid == $recordUid) {
						$record = updateRecord($record, $eventText, $eventStart, $eventEnd);
					}
					fputs($handle, $record);
					$record = null;
					$recordUid = null;
					$result = "success";
                                } else if ($record !== null) {
                                	$record .= $line;
                                } else {
                                	fputs($handle, $line);
                                }
			}
		}

		fclose($handle);
		echo $result;
	}

	function startsWith($string, $substring) {
                return (substr($string, 0, strlen($substring)) == $substring);
	}

	function updateRecord($record, $eventText, $eventStart, $eventEnd) {
		if ($eventText !== null && trim($eventText) == '') {
			return null;
		}

		$newRecord = '';
		$recordArray = split("\n", $record);
		foreach ($recordArray as $line) {
			if ($eventText !== null && startsWith($line, 'SUMMARY:')) {
				$line = 'SUMMARY:' . $eventText;
			}
			if ($eventStart !== null && startsWith($line, 'DTSTART')) {
				$line = 'DTSTART;VALUE=DATE:' . $eventStart;
			}
			if ($eventEnd !== null && startsWith($line, 'DTEND')) {
				$line = 'DTEND;VALUE=DATE:' . $eventEnd;
			}
			$newRecord .= $line . "\n";
		}		
		return trim($newRecord) . "\n";
	}

?>
