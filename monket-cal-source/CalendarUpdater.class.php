<?php

// TODO: Ensure all error cases are handled gracefully

require_once('icalcreator/iCalcreator.class.php');
require_once('Calendar.class.php');

class CalendarUpdater {

	private function moveEvent($uid, $eventText, $oldCalName, $calName) {

		// read in old cal
		// get event from old cal
		$oldCalendar = new Calendar($oldCalName);
		$event = $oldCalendar->getComponent($uid);
		$oldCalendar->deleteComponent($uid);

		// Update event with other changes
		$event->setProperty('summary', $eventText);

		// read in new cal
		// append event
		$newCalendar = new Calendar($calName);
		$newCalendar->setComponent($event);

		// Save Calendars
		$oldCalendar->save();
		$newCalendar->save();
	}


	// Four possible cases when updating:
	//  Move event + update event
	//  New event
	//  Delete event
	//  Update event
	function update($data) {
		
			$uid = substr($data['uid'], strlen('event-'));
			$oldCalName = $data['oldCalName'];
			$calName = $data['calName'];
			$eventStart = $data['eventStart'];
			$eventEnd   = $data['eventEnd'];
			$eventText = $data['eventText'];

			if ($calName == null) {
				throw new Exception("no calendar name");
			}

			if ($uid == '' && ($eventStart == null || $eventEnd == null)) {
				throw new Exception("no start/end date");
			}

			if ($uid == '' && $eventText == '') {
				throw new Exception("haven't created event because text is empty");
			}


			if ($oldCalName != null) {
				// we have an old calendar, so move event from that cal to $calName
				// possibly updating event summary as well
				$this->moveEvent($uid, $eventText, $oldCalName, $calName);

			} else 	if ($uid == '') {
				// No UID so create a new event

				$event = new vevent();
				$event->setProperty('summary', $eventText);
				$event->setProperty('dtstart', $eventStart, array( 'VALUE' => 'DATE' ));
				$event->setProperty('dtend', $eventEnd, array( 'VALUE' => 'DATE' ));

				$uid = $event->getProperty('uid');

				$cal = new Calendar($calName);
				$cal->setComponent($event);
				$cal->save();

				return $uid;

			} else if ($eventText === '') {
				// Event text is now empty, so delete event

				$cal = new Calendar($calName);
				$cal->deleteComponent($uid);
				$cal->save();

			} else {
				// Update the event


				$cal = new Calendar($calName);
				$event = $cal->getComponent($uid);

				if ($eventText != null) { 
					$event->setProperty('summary', $eventText);
				}

				if ($eventStart != null) { 
					$event->setProperty('dtstart', $eventStart, array( 'VALUE' => 'DATE' ));
				}

				if ($eventEnd != null) { 
					$event->setProperty('dtend', $eventEnd, array( 'VALUE' => 'DATE' ));
				}

				$cal->setComponent($event, $uid);

				$cal->save();

			}

	}

}

?>
