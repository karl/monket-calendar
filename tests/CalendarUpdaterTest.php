<?php

require_once 'PHPUnit/Framework.php';

define('SITE_DIR', '/~karl/monket-calendar/monket-cal/');
define('CALENDAR_DIR', '/Users/karl/Sites/monket-calendar/tests/calendars/');
define('MONKET_BASE', '/~karl/monket-calendar/monket-cal-source/');
define('MONKET_FILE_BASE', '/Users/karl/Sites/monket-calendar/monket-cal-source/');

define('DEFAULT_CALENDAR', 'Home');

require_once '../monket-cal-source/CalendarUpdater.class.php';

// TODO: Not finished yet, work out how better to do the unit testing.

class CalendarUpdaterTest extends PHPUnit_Framework_TestCase {

	protected $updater;

	public static function invalidData() {
		$invalidData = array();
		
		// No Data
		$invalidData[][] = array();
		
		// Only a UID
		$invalidData[][] = array('uid' => 'TEST-UID');
		
		// New Event
		$invalidData[][] = array('eventText' => 'Test Summary', 'calName' => 'TestCal', 'eventStart' => '2008-01-01');
		$invalidData[][] = array('eventText' => 'Test Summary', 'calName' => 'TestCal', 'eventEnd' => '2008-01-02');
		$invalidData[][] = array('eventText' => 'Test Summary', 'eventStart' => '2008-01-01', 'eventEnd' => '2008-01-02');
		$newEventData[][] = array('eventText' => 'Test Summary', 'calName' => 'TestCal', 'oldCalName' => 'OldTestCal', 'eventStart' => '2008-01-01', 'eventEnd' => '2008-01-02');
		
		return $invalidData;
	}
	
	public static function newEventData() {
		$newEventData = array();

		$newEventData[][] = array('eventText' => 'Test Summary', 'calName' => 'TestCal', 'eventStart' => '2008-01-01', 'eventEnd' => '2008-01-02');
		
		return $newEventData;
	}

	protected function setUp() {
		copy('calendars/TestCal.ics.test', 'calendars/TestCal.ics');
		copy('calendars/OldTestCal.ics.test', 'calendars/OldTestCal.ics');
		$this->updater = new CalendarUpdater();
	}
	
    /**
     * @expectedException Exception
     * @dataProvider invalidData
     */
	function testInvalidData($data) {
		$result = $this->updater->update($data);
	}
	
    /**
     * @dataProvider newEventData
     */
	function testNewEventData($data) {
		$result = $this->updater->update($data);
		
		$this->assertNotNull($result);
	}
	

}

?>