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


?>

<div id="loading">Loading...</div>

<?php

echo str_pad(' ', 4095);
flush();
ob_flush();

$current_view = "month";

define('BASE', dirname(__FILE__) .'/phpicalendar-karl/');
include(BASE.'functions/ical_parser.php');
if ($minical_view == 'current') $minical_view = 'month';

ereg ("([0-9]{4})([0-9]{2})([0-9]{2})", $getdate, $day_array2);
$this_day                               = $day_array2[3];
$this_month                             = $day_array2[2];
$this_year                              = $day_array2[1];

$unix_time                              = strtotime($getdate);
$today_today                    = date('Ymd', strtotime("now + $second_offset seconds"));
$tomorrows_date                 = date( "Ymd", strtotime("+1 day",  $unix_time));
$yesterdays_date                = date( "Ymd", strtotime("-1 day",  $unix_time));

// find out next month
$next_month_month               = ($this_month+1 == '13') ? '1' : ($this_month+1);
$next_month_day                 = $this_day;
$next_month_year                = ($next_month_month == '1') ? ($this_year+1) : $this_year;
while (!checkdate($next_month_month,$next_month_day,$next_month_year)) $next_month_day--;
$next_month_time                = mktime(0,0,0,$next_month_month,$next_month_day,$next_month_year);

// find out last month
$prev_month_month               = ($this_month-1 == '0') ? '12' : ($this_month-1);
$prev_month_day                 = $this_day;
$prev_month_year                = ($prev_month_month == '12') ? ($this_year-1) : $this_year;
while (!checkdate($prev_month_month,$prev_month_day,$prev_month_year)) $prev_month_day--;
$prev_month_time                = mktime(0,0,0,$prev_month_month,$prev_month_day,$prev_month_year);

$next_month                     = date("Ymd", $next_month_time);
$prev_month                     = date("Ymd", $prev_month_time);
$display_date                   = localizeDate ($dateFormat_month, $unix_time);
$parse_month                    = date ("Ym", $unix_time);
$first_of_month                 = $this_year.$this_month."01";
$start_month_day                = dateOfWeek($first_of_month, $week_start_day);
$thisday2                               = localizeDate($dateFormat_week_list, $unix_time);
$num_of_events2                         = 0;

function outputSingleDayEvents($daysEvents, $dayOfWeek, $daylink) {
        echo '<div class="single-day" id="day-' . $daylink . '">';

        usort($daysEvents, cmpEventLength);

        foreach ($daysEvents as $event) {
                if ($event != null) {
                        displayEvent($event);
                }
        }

        echo '</div>';
}

function cmpEventLength($a, $b) {
        return strlen($a['event_text']) - strlen($b['event_text']);
}

function popMultiDayEvent(&$daysEvents, $date) {
//      echo 'Days Events: ';
//      var_dump($daysEvents);

        $selectedLength = 0;
        $selectedIndex = null;

        for ($ct1 = 0; $ct1 < count($daysEvents); $ct1++) {
                $event = $daysEvents[$ct1];

                if (isMultiDay($event)) {
                        $length = round( (strtotime($event['allday_end']) - strtotime($event['allday_start'])) / 86400 );
                        if ($event['allday_start'] == $date || $dayOfWeek == 0) {
                                if ($length > $selectedLength) {
                                        $selectedLength = $length;
                                        $selectedIndex = $ct1;
                                }
                        }
                }

        }

        if ($selectedIndex !== null) {
                $event =  $daysEvents[$selectedIndex];
                $daysEvents = array_trim($daysEvents, $selectedIndex);
                return $event;
        }
        return null;
}

function array_trim( $array, $index ) {
   if ( is_array ( $array ) ) {
     unset ( $array[$index] );
     array_unshift ( $array, array_shift ( $array ) );
     return $array;
   } else {
     return false;
   }
}

function multiDayEventsLeft($weeksEvents, $dayOfWeek, $today) {
        for ($ct1 = 0; $ct1 <= $dayOfWeek; $ct1++) {
                $daysEvents = $weeksEvents[$ct1];
                for ($ct2 = 0; $ct2 < count($daysEvents); $ct2++) {
                        $event = $daysEvents[$ct2];
                        if (isMultiDay($event) && $event['allday_end'] > $today) {
                                return true;
                        }
                }
        }
        return false;
}
function isMultiDay($event) {
        return $event['allday_start'] != null && ($event['allday_end'] - $event['allday_start'] > 1);
}


function displayEvent($event) {
        displayEventAux($event, true, true);
}

function displayEventAux($event, $start, $end) {
        global $master_array;

        $event_calno = $event['calnumber'];
        $event_text = htmlentities(stripslashes($event["event_text"]));
        $eventDescription = $event['description'];
        $eventDescription = str_replace("\\n", "<br />", $eventDescription);
        $eventDescription = str_replace("\\r", "<br />", $eventDescription);
        $eventDescription = htmlentities(stripslashes($eventDescription));
        $uid = $event['uid'];

        $calendars = $master_array['calendars'];
        $calName = idEncode($calendars[$event_calno]['id']);

        $allDay = '';
        if ($event['allday_start'] != null) {
                $allDay = ' all-day';
        }

        if ($start) {
                $allDay .= ' start';
        }
        if ($end) {
                $allDay .= ' end';
        }

        $multiDayStartEnd = '';
        if (isMultiDay($event)) {
                $multiDayStartEnd = ' start-date-' . $event['allday_start'] . ' end-date-' . $event['allday_end'] ;
        }

        $idAttr = '';
        if ($uid) {
                $idAttr = ' id="event-' . $uid . '"';
        }

        echo '<div' . $idAttr . ' class="event cal-' . $calName
                . ' color-' . $event_calno . ' ' . $allDay . $multiDayStartEnd . '">';

//      if ($start) {
//              echo '<div class="drag left" id="drag-left-' . $uid . '"></div>';
//      }

//      if ($end) {
//              echo '<div class="drag right" id="drag-right-' . $uid . '"></div>';
//      }
        echo '<div class="text-outer"><div class="text"';
        if ($eventDescription != null && false) {
                $popupHTML = '<div class=\\\'title\\\'>' . addslashes($event_text) . '</div>'
                        . '<div class=\\\'body\\\'>' . addslashes($eventDescription) .'</div>';

                $popupHTML = '<div class=\\\'body\\\'>' . addslashes($eventDescription) .'</div>';

                echo " onmouseover=\"domTT_activate(this, event, 'content', '"
                        . $popupHTML
                        . "', 'styleClass', 'niceTitle', 'fade', 'in', 'fadeMax', 87);\"";
        }
        echo '>';

        echo ($event_text == '') ? '&nbsp;' : $event_text;

        echo '</div></div>';

        echo '<div class="description">';
        echo br2nl($eventDescription);
        echo '</div>';

        echo '</div>';

}

function br2nl($str) {
   return preg_replace('=<br */?>=i', "\n", $str);
}

function getEventLength($event, $dayOfWeek, $currentDay) {
        $length = round( (strtotime($event['allday_end']) - strtotime($event['allday_start'])) / 86400 );
        $daysLeftInEvent = round( (strtotime($event['allday_end']) - strtotime($currentDay)) / 86400 );
        $daysLeftInWeek  = 7 - $dayOfWeek;

        return min($daysLeftInEvent, $daysLeftInWeek);
}

function eventsLeftInWeek($weeksEvents) {
        for ($ct1 = 0; $ct1 < 7; $ct1++) {
                $daysEvents = $weeksEvents[$ct1];
                if ($daysEvents !== null) {
                        return true;
                }
        }
        return false;
}

function displayCalendarNames() {
        global $master_array;
        $calendars = $master_array['calendars'];

        echo '<div class="calendars" id="calendars">';
        for ($ct1 = 1; $ct1 <= count($calendars); $ct1++) {
                $calendar = $calendars[$ct1];
                $inputId = 'view-' . idEncode($calendar['id']);

                $isWebCal = '';
                if ($calendar['isWebCal']) {
                        $isWebCal = ' webcal';
                }

		if (!defined(DEFAULT_CALENDAR)) {
			define(DEFAULT_CALENDAR, $calendar['name']);
		}
		$isDefault = '';
		if ($calendar['name'] == DEFAULT_CALENDAR) {
			$isDefault = ' default';
		}

                echo '<div class="calendar-info color-' . $ct1 . $isWebCal . $isDefault . '">';

                echo '<span class="cal-details">';
                echo '<input type="checkbox" name="' . $inputId . '" id="' . $inputId . '" checked="checked" />';
                echo '<label class="name" for="' . $inputId . '">';
                echo $calendar['name'];
                echo '</label>';
                echo '</span> ';

                echo '<span class="links">';
                if ($calendar['isWebCal']) {
                        echo '<a href="' . $calendar['filename'] . '">ics</a>';
                        echo ' <span class="faded">rss</span>';
                } else {
                        echo '<a href="phpicalendar-karl/calendars/' . $calendar['id'] . '.ics' . '">ics</a>';
                        echo ' <a href="phpicalendar-karl/rss/rss.php?cal=' . $calendar['id'] . '&amp;rssview=month">rss</a>';
                }
                echo '</span>';

                echo '</div>';
        }
        echo '</div>';

}

function idEncode($text) {
        $temp = preg_replace('/ +/', '-', $text);
        return preg_replace('/[^A-Za-z0-9-_:]/', '_', $temp);
}


function displayCalendar() {
	global $master_array;
	global $prev_month;
	global $next_month;
	global $week_start_day;
	global $daysofweek_lang;
	global $start_month_day;
	global $today_today;

?>

<div id="baseURL" title="<?= SITE_DIR ?>" class="hidden"></div>

<div style="text-align: center; margin: 20px;"><a href="<?= SITE_DIR ?>">Today</a></div>


<div id="calendar">

<?php echo '<div class="prev-month"><a href="' . $prev_month . '"
title="Previous Month">&laquo;</a></div>'; ?>

<?php echo '<div class="next-month"><a href="' . $next_month . '"
title="Next Month">&raquo;</a></div>'; ?>


<a name="top"></a>
<div class="day-header">
<table cellspacing="0"  class="header" summary="Days of Weeks (these act as titles for follwing week tables)">
        <tr>
        <?php
                // loops through 7 times, starts with $week_start_day
                $start_day = strtotime($week_start_day);
//                        $start_day = strtotime("+1 day", $start_day); //HACK HACK HACK
                for ($i=0; $i<7; $i++) {
                        $day_num = date("w", $start_day);
                        $day = $daysofweek_lang[$day_num];
                        echo '<th>' . $day . '</th>';
                        $start_day = strtotime("+1 day", $start_day);
                }
        ?>
        </tr>
</table>
</div>
        <?php
                $sunday                 = strtotime("$start_month_day");
                $whole_month    = TRUE;
                $weekNum = 0;

                do {
                        $weekNum++;
                        echo '<div class="week">';
                        echo '<table cellspacing="0" summary="Events for week commencing ' . date('jS F Y', $sunday) . '">';

                        echo '<tr>';
                        for ($ct1 = 0; $ct1 < 7; $ct1++) {
                                $thisDate = strtotime('+' . $ct1 . ' day', $sunday);
                                $day = date ("j", $thisDate);
                                $daylink = date ("Ymd", $thisDate);

                                echo '<th';

                                if ($today_today == $daylink) {
                                        echo ' class="today"';
                                }

                                echo '>';
                                if ($weekNum != 1) {
                                        echo '<div class="more show-full">&nbsp;</div>';
                                }

                                echo '<a class="day-number" href="' . $daylink . '">' . $day . '</a>';

                                if ($day == '1') {
                                        $month = date('F', $thisDate);
                                        echo '<span class="month-text">' . $month . '</span>';
                                }

                                echo '<a class="new-event" title="' . $daylink .  '"><span>&nbsp;New Event</span></a>';
                                echo '</th>';
                        }
                        echo '</tr>';
                        // calculate max number of events in a single day this week
                        $maxEventsPerDay = 0;
                        $weeksEvents = array();
                        for ($ct1 = 0; $ct1 < 7; $ct1++) {
                                $weeksEvents[$ct1] = array();

                                $thisDate = strtotime('+' . $ct1 . ' day', $sunday);
                                $daylink = date('Ymd', $thisDate);
                                $daysEvents = 0;
                                if (isset($master_array[$daylink]) && $master_array[$daylink]) {
                                        foreach ($master_array[$daylink] as $eventTimes) {
                                                $keys = array_keys($eventTimes);
                                                foreach ($keys as $key) {
                                                        $event = $eventTimes[$key];
                                                        $event['uid'] = $key;
                                                        if ($event['allday_start'] != null) {
                                                                $daysEvents++;
                                                        }

                                                        if ($event['allday_start'] == null ||  $ct1 == 0 || $daylink == $event['allday_start']) {
                                                                $weeksEvents[$ct1][] = $event;
                                                        }
                                                }
                                        }
                                }
                                $maxEventsPerDay = max($maxEventsPerDay, $daysEvents + 1);
                        }
//                      var_dump($weeksEvents);
//                      var_dump($maxEventsPerDay);

                        for ($ct2 = 0; $ct2 < $maxEventsPerDay; $ct2++) {
                                if (eventsLeftInWeek($weeksEvents)) {
                                echo '<tr>';
                                for ($ct1 = 0; $ct1 < 7; $ct1++) {
                                        $thisDate = strtotime('+' . $ct1 . ' day', $sunday);
                                        $daylink = date('Ymd', $thisDate);
                                        $daysEvents = $weeksEvents[$ct1];

//                                      var_dump($daysEvents);

                                        if ($daysEvents !== null) {
                                                $event = popMultiDayEvent($daysEvents, $date);
                                                $weeksEvents[$ct1] = $daysEvents;

                                                if ($event == null) { // only single day events left
                                                        if (multiDayEventsLeft($weeksEvents, $ct1, $daylink)) {
                                                                echo '<td class="filler-cell"><span>&nbsp;</span></td>';
                                                        } else {
                                                                echo '<td class="td-s" rowspan="' . (($maxEventsPerDay - $ct2)) .  '">';
                                                                outputSingleDayEvents($daysEvents, $ct1, $daylink);
                                                                //echo 'Single Day Events<br />' . $daylink;
                                                                echo '</td>';

                                                                $weeksEvents[$ct1] = null;
                                                        }
                                                } else {
                                                        $eventLength = getEventLength($event, $ct1, $daylink);
                                                        $start = ($daylink == $event['allday_start']);
                                                        $daysLeftInEvent = round( (strtotime($event['allday_end']) - strtotime($daylink)) / 86400 );
                                                        $end = ($daysLeftInEvent == $eventLength);

                                                        echo '<td class="td-m" colspan="' . $eventLength . '">';
                                                        displayEventAux($event, $start, $end);
                                                        echo '</td>';
                                                        $ct1 += $eventLength - 1;
                                                }
                                        }

                                }
                                echo '</tr>';
                                }
                        }

/*
                        echo '<tr>';
                        for ($ct1 = 0; $ct1 < 7; $ct1++) {
                                $thisDate = strtotime('+' . $ct1 . ' day', $sunday);
                                displaySingleDayEvents($thisDate, $ct1);
                        }
                        echo '</tr>';
                        echo '<tr class="padding">';
                        for ($ct1 = 0; $ct1 < 7; $ct1++) {
                                echo '<td>&nbsp;</td>';
                        }
                        echo '</tr>';
*/

                        echo '</table>';
                        echo '</div>';

                        $sunday = strtotime("+7 day", $sunday);
                        $checkagain = date ("m", $sunday);
                        if ($checkagain != $this_month) $whole_month = FALSE;
                } while ($weekNum < 6); // while ($whole_month == TRUE);                                                                                     

                echo '<div class="dummy-week">';
                echo '<table cellspacing="0" summary="">';
                echo '<tr>';
                for ($ct1 = 0; $ct1 < 7; $ct1++) {
                        echo '<td><div class="more show-full">&nbsp;</div></td>';
                }


                echo '</tr>';
                echo '</table>';
                echo '</div>';

        ?>

</div>

<div id="show-hide-full">
    <a href="#" class="show-full">Show all events</a>
    <a href="#" class="hide-full hidden">Show only events that fit</a>
</div>
<div class="clear"></div>

<?php

        displayCalendarNames();

?>


<?php
}


?>
