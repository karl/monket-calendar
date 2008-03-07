

var EVENT_FORM = 'event-form';
var FORM_EVENT = 'form-event';

var HIDDEN_CLASS = 'hidden';
var WORKING_CLASS = 'working';
var UPDATE_FAILED_CLASS = 'update-failed';
var DELETE_CLASS = 'delete';

var ELEMENT_NODE = 1;

var AJAX_SUCCESS = 'success';
var DEFAULT_CALENDAR = 'Home';
var DEFAULT_CALENDAR_NUM = '2';

var NEW_EVENT_TEXT = '***NEW_EVENT_TEXT***';

var calendar;
var allDays;
var allEvents;

var calendars;

var savedX;
var savedY;
var savedPart;

var baseURL;

var defaultCalendar;
var defaultCalendarNum;

function init() {
    initLogging(document.getElementById('logging-on'));
    try {
	showLoading();	

	baseURL = document.getElementById('baseURL').title;
        calendar = document.getElementById('calendar');
       
       initCalendars();
       initShowHideFull();
       initEvents();
       initNewEventButtons();
       initFormatting();
       initShowHideCalendars();
       initScrolling();

       log('initialised');
	hideLoading();
    } catch(e) {
       logError(e);
       throw(e);
    }
}

function showLoading() {
	var loading = document.getElementById('loading');
	removeClass(loading, HIDDEN_CLASS);
}

function hideLoading() {
	var loading = document.getElementById('loading');
	addClass(loading, HIDDEN_CLASS);
}


function initCalendars() {
	var cals = document.getElementById('calendars');
	var checkboxes = cals.getElementsByTagName('input');

	calendars = new Array();
	for (var ct1 = 0; ct1 < checkboxes.length; ct1++) {
		var checkbox = checkboxes[ct1];
		var calendar = checkbox.parentNode.parentNode;
		var calName = checkbox.name.substring(5);

		calendars[ct1 + 1] = new Object();
		calendars[ct1 + 1].name =  calName;
		calendars[ct1 + 1].isWebCal = hasClass(calendar, 'webcal');

		if (hasClass(calendar, 'default')) {
			defaultCalendar = calName;
			defaultCalendarNum = ct1 + 1;
			log('Default Calendar: ' + calName);
		}
	}

	log('calendars: ');
	log(calendars);
}

function initShowHideCalendars() {
	var calendars = document.getElementById('calendars');
	var checkboxes = calendars.getElementsByTagName('input');

	for (var ct1 = 0; ct1 < checkboxes.length; ct1++) {
		var input = checkboxes[ct1];
		input.onmouseup = showHideCalendar;
	}

	log('show/hide calendars initialised');
}

function showHideCalendar() {
	try {
		var input = this;
		var calName = input.name.substring(5);
		log('show/hide calendar: ' + calName);

		var calendar = document.getElementById('calendar');
		var events = getElementsByClass(calendar, 'cal-' + calName);

		for (var ct1 = 0; ct1 < events.length; ct1++) {
			var event = events[ct1];
			if (!input.checked) {
				removeClass(event, HIDDEN_CLASS);
			} else {
				addClass(event, HIDDEN_CLASS);
			}
		}

		formatSingleDays();

	} catch(e) {
		logError(e);
		throw(e);
	}
}

function initShowHideFull() {
	var showHideFull = document.getElementById('show-hide-full');
	var hide = getElementsByClass(showHideFull, 'hide-full')[0];
	addClass(hide, HIDDEN_CLASS);

	var shows = getElementsByClass(document, 'show-full');
	for (var ct1 = 0; ct1 < shows.length; ct1++) {
		shows[ct1].onclick = showFull;
	}

	var hides = getElementsByClass(document, 'hide-full');
	for (var ct1 = 0; ct1 < hides.length; ct1++) {
		hides[ct1].onclick = hideFull;
	}

}

function showFull() {
	try {
		var cal = document.getElementById('calendar');
		addClass(cal, 'full');

		var showHideFull = document.getElementById('show-hide-full');
		var hide = getElementsByClass(showHideFull, 'hide-full')[0];
		removeClass(hide, HIDDEN_CLASS);
		var show = getElementsByClass(showHideFull, 'show-full')[0];
		addClass(show, HIDDEN_CLASS);
	} catch(e) {
		logError(e);
		throw(e);
	}
	return false;
}

function hideFull() {
	try {
		var cal = document.getElementById('calendar');
		removeClass(cal, 'full');

		var showHideFull = document.getElementById('show-hide-full');
		var hide = getElementsByClass(showHideFull, 'hide-full')[0];
		addClass(hide, HIDDEN_CLASS);
		var show = getElementsByClass(showHideFull, 'show-full')[0];
		removeClass(show, HIDDEN_CLASS);
	} catch(e) {
		logError(e);
		throw(e);
	}
	return false;
}

function initScrolling() {
	if (location.hash == '') {
		location.hash = 'top';
	}

//	calendar.onmousewheel = function() { doScrollCalendar(event.wheelDelta / -120); return false; };
}

function doScrollCalendar(movement) {
	try {
		log('scroll calendar: ' + movement);

		var weeks = getElementsByClass(calendar, 'week');
		var firstWeek = weeks[0];
		var lastWeek = weeks[weeks.length - 1];

		if (movement < 0) {
			firstWeek.parentNode.removeChild(firstWeek);

			var newWeek = firstWeek;
			lastWeek.parentNode.insertBefore(newWeek, lastWeek.nextSibling);
		} else if (movement > 0) {
			lastWeek.parentNode.removeChild(lastWeek);

			var newWeek = lastWeek;
			firstWeek.parentNode.insertBefore(newWeek, firstWeek);
		}
	} catch(e) {
		logError(e);
		throw(e);
	}
}

function initFormatting() {
	if (browser != 'Internet Explorer') {
		window.onresize = function() { showLoading(); format(); hideLoading(); };
		format();
	}
}

function format() {
	try {
		log('formatting');
		formatFades();
		formatSingleDays();
		log('formatting - done');
	} catch(e) {
		logError(e);
		throw(e);
	}
}

function formatFades() {
	var fades = getElementsByClass(calendar, 'more');
	for (var ct1 = 0; ct1 < fades.length; ct1++) {
		var fade = fades[ct1];
		
		var dayWidth = fade.parentNode.offsetWidth - 1;

		fade.style.width = dayWidth + 'px';
	}
}

function formatSingleDays() {
	log('formatting single days');
	var singleDays = getElementsByClass(calendar, 'single-day');
	for (var ct1 = 0; ct1 < singleDays.length; ct1++) {
		var singleDay = singleDays[ct1];
		var singleDayTop = findPosY(singleDay);

		var week = getSingleDayWeek(singleDay);
		var weekTop = findPosY(week);
		var weekBottom = weekTop + week.offsetHeight;

		var height = weekBottom - singleDayTop;
		singleDay.style.height = height + 'px';
	}
	log('single days formatted');
}

function getSingleDayWeek(singleDay) {
	var element = singleDay;
	while (element != null && !hasClass(element, 'week')) {
		element = element.parentNode;
	}
	return element;
}

function initEvents() {
    log('initialising events');
    
    var weeks = getElementsByClass(calendar, 'week');
    
    
    allDays = new Array();
    
    for (var ct1 = 0; ct1 < weeks.length; ct1++) {
        var week = weeks[ct1];

        var days = week.getElementsByTagName('th');
        for (var ct2 = 0; ct2 < days.length; ct2++) {
            allDays[allDays.length] = days[ct2];
        }
    }


    allEvents = getElementsByClass(calendar, 'event');

    initAllEvents(allEvents);
    

    log('events initialised');    
}

function initAllEvents(allEvents) {
	log('initialising all events');
	var numEvents = allEvents.length;
	for (var ct1 = 0; ct1 < numEvents; ct1++) {
		var event = allEvents[ct1];
		initEvent(event);
	}
}


function initEvent(event) {
	var calNo = getCalNo(event);
	if (!isWebCal(calNo)) {
		addClass(event, 'editable');

		event.onmouseover = function(ev) { mouseOverEvent(ev, this) };
		event.onmouseout  = function(ev) { mouseOutEvent(ev, this) };
		event.onmousedown = function(ev) { mouseDownEvent(ev, this) };

		var text = getEventText(event);
		text.onmouseover = function(ev) { mouseOverEvent(ev, this.parentNode.parentNode); };
		text.onmouseout  = function(ev) { mouseOutEvent(ev, this.parentNode.parentNode); };
		text.onmousedown = function(ev) { mouseDownEvent(ev, this.parentNode.parentNode); };

		//prevent IE text selection!!!
		event.ondrag = function () { return false; };
		event.onselectstart = function () { return false; };
	}
}

function unInitEvent(event) {
	removeClass(event, 'editable');

	event.onmouseover = null;
	event.onmouseout  = null;
	event.onmousedown = null;

	var text = getEventText(event);
	text.onmouseover = null;
	text.onmouseout  = null;
	text.onmousedown = null;

	event.ondrag = null;
	event.onselectstart = null;
}

function isWebCal(calNo) {
	return calendars[calNo].isWebCal;
}

function findMouseX(e) {
	var posx = 0;
	if (!e) var e = window.event;
	if (e.pageX) {
		posx = e.pageX;
	} else if (e.clientX) {
		posx = e.clientX + document.documentElement.scrollLeft;
	}
	return posx;
}

function findMouseY(e) {
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageY) {
		posy = e.pageY;
	} else if (e.clientY) {
		posy = e.clientY + document.documentElement.scrollTop;
	}
	return posy;
}


function mouseOverEvent(e, event) {
	try {
		var mouseX = findMouseX(e);
		var mouseY = findMouseY(e);
		var part = getEventPart(event, mouseX, mouseY);

		if (part == 'start') {
			addClass(event, 'hover-start');
		} else if (part == 'end') {
			addClass(event, 'hover-end');
		}

	} catch(e) {
		logError(e);
		throw(e);
	}
}

function getEventPart(event, mouseX, mouseY) {
		var text = getEventText(event);
		var textStart = findPosX(text);
		var textEnd = textStart + text.offsetWidth;

		var eventTop = findPosY(event);
		var eventBottom = eventTop + event.offsetHeight;
//		if (mouseY < eventTop || mouseY > eventBottom) {
//			return null;
//		}

//		alert('mX: ' + mouseX + ', mY: ' + mouseY + ', eventLeft: ' + findPosX(event) + ', eventEnd: ' + (findPosX(event) + event.offsetWidth));

		if (mouseX < textStart && hasClass(event, 'start')) {
			return 'start';
		} else if (mouseX > textEnd && hasClass(event, 'end')) {
			return 'end';
		} else {
			return 'text';
		}
}

function mouseDownEvent(e, event) {
	try {
		var mouseX = findMouseX(e);
		var mouseY = findMouseY(e);

		savedX = mouseX;
		savedY = mouseY;

		savedPart = getEventPart(event, mouseX, mouseY);	
		savedEvent = event;

		document.onmousemove = function(ev) { mouseMoveEvent(ev, savedEvent) };
		document.onmouseup   = function(ev) { mouseUpEvent(ev, savedEvent) };

		return false;
	} catch(e) {
		logError(e);
		throw(e);
	}
}

function mouseMoveEvent(e, event) {
	try {
		var mouseX = findMouseX(e);
		var mouseY = findMouseY(e);

		if (savedPart != null) {
			if (movedDistance(savedX, savedY, mouseX, mouseY) > 5) {

				if (savedPart == 'text' && isSingleDayEvent(event)) {
					log('dragging event text');
					savedPart = null;

					var dragEvent = document.createElement('div');
					addClass(dragEvent, 'drag-event');

					dragEvent.style.width = (event.offsetWidth - 6) + 'px';
					dragEvent.style.height = (event.offsetHeight - 6) + 'px';

					dragEvent.style.top = (findPosY(event) + (mouseY - savedY)) + 'px';
					dragEvent.style.left = (findPosX(event) + (mouseX - savedX)) + 'px';
					var body = document.getElementsByTagName('body')[0];
					body.appendChild(dragEvent);

					Drag.init(dragEvent);
					dragEvent.onDragEnd = function(x, y) { dropEvent(event, dragEvent, x, y); };
					Drag.start(e, dragEvent);
				} else if (savedPart == 'start' || savedPart == 'end') {
					log('dragging event ' + savedPart);
					part = savedPart;
					savedPart = null;

					var dragResize = document.createElement('div');
					addClass(dragResize, 'drag-event');
					addClass(dragResize, part);

					var width = 30 - 6;
					dragResize.style.width = width + 'px';
					dragResize.style.height = (event.offsetHeight - 6) + 'px';

					var position = 0;
					if (part == 'end') {
						position = event.offsetWidth - width;
					}

					dragResize.style.top = (findPosY(event) + (mouseY - savedY)) + 'px';
					dragResize.style.left = (findPosX(event) + (mouseX - savedX) + position) + 'px';
					var body = document.getElementsByTagName('body')[0];
					body.appendChild(dragResize);

					Drag.init(dragResize);
					dragResize.onDragEnd = function(x, y) { dropResize(event, dragResize, part, x, y); };
					Drag.start(e, dragResize);
				}			

			}	
		}
	} catch(e) {
		logError(e);
		throw(e);
	}
}



function dropEvent(event, dragEvent, x, y) {
	var width  = dragEvent.offsetWidth;
	var height = dragEvent.offsetHeight; 		

	var singleDay = findSingleDayAtPos(x + (width /2), y + (height / 2));
	if (singleDay == null) {
		dragEvent.parentNode.removeChild(dragEvent);
		log('event not dropped on day, so not moving');
	} else {
		log('moving event to new day');
		var date = getSingleDayDate(singleDay);

		if (date == getEventDate(event)) {
			log('event fropped on same day, so not moving');
			dragEvent.parentNode.removeChild(dragEvent);
			return;
		}

	        showWorking(event);	
		var uid = getEventUid(event);
		var calName = getCalName(event);

	         // submit ajax
		var req = new DataRequestor();
		req.addArg(_GET, 'uid', uid);
		req.addArg(_GET, 'calName', calName);

		req.addArg(_GET, 'eventStart', date);
		req.addArg(_GET, 'eventEnd', (date - 0) + 1);

		req.onload = function(data, obj) { moveAjaxCallback(event, singleDay, dragEvent, data, obj); };
		req.onfail = function(status) { moveAjaxCallback(event, singleDay, dragEvent, status, null) };
		req.getURL(baseURL + 'update/');
	}
}


function dropResize(event, dragResize, part, x, y) {
	var width  = dragResize.offsetWidth;
	var height = dragResize.offsetHeight; 		

	var singleDay = findSingleDayAtPos(x + (width /2), y + (height / 2));
	if (singleDay == null) {
		dragResize.parentNode.removeChild(dragResize);
		log('event not dropped on day, so not resizing');
		return;
	}

	var date = getSingleDayDate(singleDay);
	var eventStartDate = getEventStartDate(event);
	var eventEndDate   = getEventEndDate(event);  

	if ((part == 'start' && date > eventEndDate) || (part == 'end' && date < eventStartDate)) {
		dragResize.parentNode.removeChild(dragResize);
		log('resize would make event negative in length, ignoring');
	} else {
		log('resize event to new day');

		if ((part == 'start' && date == eventStartDate) || (part == 'end' && date == eventEndDate)) {
			dragResize.parentNode.removeChild(dragResize);
			log('resize to same day, ignoring');
			return;
		}


	        showWorking(event);	
		var uid = getEventUid(event);
		var calName = getCalName(event);

	         // submit ajax
		var req = new DataRequestor();
		req.addArg(_GET, 'uid', uid);
		req.addArg(_GET, 'calName', calName);

		if (part == 'start') {
			req.addArg(_GET, 'eventStart', date);
		} else if (part == 'end') {
			req.addArg(_GET, 'eventEnd', (date - 0) + 1);
		}

		req.onload = function(data, obj) { resizeAjaxCallback(event, dragResize, data, obj); };
		req.onfail = function(status) { resizeAjaxCallback(event, dragResize, status, null) };
		req.getURL(baseURL + 'update/');
	}
}

function isSingleDayEvent(event) {
	return hasClass(event.parentNode, 'single-day');
}

function getEventStartDate(event) {
	if (isSingleDayEvent(event)) {
		return getEventDate(event);
	} else {
		var reg = /(^| )start-date-([^ ]+)($| )/;
		var ar = reg.exec(event.className);
		return ar[2];
	}
}

function getEventEndDate(event) {
	if (isSingleDayEvent(event)) {
		return getEventDate(event);
	} else {
		var reg = /(^| )end-date-([^ ]+)($| )/;
		var ar = reg.exec(event.className);
		return ar[2] - 1;
	}
}

function findSingleDayAtPos(x, y) {
	var singleDays = getElementsByClass(document, 'single-day');
	for (var ct1 = singleDays.length - 1; ct1 >= 0; ct1--) {
		var singleDay = singleDays[ct1];

		var top = findPosY(singleDay);
		var left = findPosX(singleDay);
		var right = left + singleDay.offsetWidth;
		var bottom = top + singleDay.offsetHeight;

		if (x >= left && x <= right && y >= top && y <= bottom) {
			log('dropped on day');
			return singleDay;
		}	
	}
	return null;
}

function mouseUpEvent(e, event) {
	try {
		if (savedEvent != null) {
			var mouseX = findMouseX(e);
			var mouseY = findMouseY(e);

			var part = getEventPart(event, mouseX, mouseY);
			if (savedPart != null && savedPart == part) {
				editEvent(event);
			}		

			savedX = null;
			savedY = null;
			savedPart = null;
			savedEvent = null;
//			document.onmousemove = null;
//			document.onmouseup = null;
		}
	} catch(e) {
		logError(e);
		throw(e);
	}
}

function movedDistance(startX, startY, endX, endY) {
	return Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
}

function mouseOutEvent(ev, event) {
	try {
		removeClass(event, 'hover-(start|end)');
	} catch(e) {
		logError(e);
		throw(e);
	}
}

function initNewEventButtons() {
    log('initialising new event buttons');
    var calendar = document.getElementById('calendar');
    newEventButtons = getElementsByClass(calendar, 'new-event');
    
    for (var ct1 = 0; ct1 < newEventButtons.length; ct1++) {
        var button = newEventButtons[ct1];
        button.onclick = function() { addNewEvent(getDaySingleEvents(this)); };

	var date = button.title;
	var singleDayId = 'day-' + date;
	var singleDay = document.getElementById(singleDayId);
	singleDay.ondblclick = function() { addNewEvent(this); };
    }
}

function addNewEvent(daySingleEvents) {
    try {
        log('Adding new Event');
        
        var newEvent = document.createElement('div');
        addClass(newEvent, 'event');
        addClass(newEvent, 'start');
        addClass(newEvent, 'end');

        addClass(newEvent, 'cal-' + defaultCalendar);
	addClass(newEvent, 'color-' + defaultCalendarNum);        

	newEvent.innerHTML = '<div class="text-outer"><div class="text">New Event...</div></div>';

        daySingleEvents.appendChild(newEvent);
        initEvent(newEvent);
        editEvent(newEvent);
	var text = getEventText(newEvent);
	text.innerHTML = NEW_EVENT_TEXT;
    
    } catch(e) {
        logError(e);
	throw(e);
    }
    return false;
}

function getDaySingleEvents(newEventButton) {
    log('getting day single events for button: ' + newEventButton);
    var date = newEventButton.title;
    var daySingleEvents = document.getElementById('day-' + date);

    if (daySingleEvents == null) {
        logError('No day for date: ' + date);
    }

    return daySingleEvents;
}

function getFormDelete(form) {
        return getElementsByClass(form, 'delete-button')[0];
}

function ajaxDeleteEvent(event) {
        // do ajax delete
        // callback will handle js delete

        var form = getEventForm(event);
        var input = getFormInput(form);
        input.value = '';
        editComplete(form);
}

function editEvent(event) {
   try {
	unInitEvent(event);

      var eventText = getEventText(event);
      var eventDesc = getEventDesc(event);

      addClass(event, 'old-cal-' + getCalName(event));

      if (getEventForm(event) != null) {
         log('event already has a form');
         return;
      }
      
      var form = document.createElement('form');
      form.innerHTML = '<input type="text" size="1024" name="eventText" value="" /><span class="delete-button"></span>';

      var input = getFormInput(form);
      var del = getFormDelete(form);
      del.onclick = function() { ajaxDeleteEvent(this.parentNode.parentNode); };

      var text = eventText.innerHTML.replace(new RegExp("(\n|\r|\t| )+", "g"), " ");
      text = htmlUnEscape(text);
      input.value = text;
        if (input.value == '&nbsp;') {
                input.value = '';
        }

      input.style.width = (eventText.offsetWidth - 13) + "px";
            
        
        log('input value: ' + input.value);


      addClass(eventText.parentNode, HIDDEN_CLASS);
      event.appendChild(form);
            
      input.onkeyup = function() { checkInput(this);  };
      input.onkeydown = function(e) { editKeyHandler(e, getInputEvent(this)) };

        workingEvent = event;
        document.onmousedown = function(e) { documentClick(e, workingEvent) };

//      input.onblur = function() { inputBlur(this); };
      form.onsubmit = function() { editComplete(this);  return false; };
      input.select();      
      input.focus();

   } catch(e) {
      logError(e);
	throw(e);
   }
}

function inputBlur(input) {
        var form = input.parentNode;
        var event = form.parentNode;

        editComplete(form);
}

function documentClick(e, event) {
        try {
                var mouseX = findMouseX(e);
                var mouseY = findMouseY(e);

                if (!isInEvent(event, mouseX, mouseY)) {
                        editComplete(getEventForm(event));
                }
        } catch(e) {
                logError(e);
                throw(e);
        }
}

function isInEvent(event, x, y) {
        var eventTop = findPosY(event);
        var eventBottom = eventTop + event.offsetHeight;

        var eventLeft = findPosX(event);
        var eventRight = eventLeft + event.offsetWidth;

        return (x >= eventLeft && x <= eventRight && y >= eventTop && y <= eventBottom);
}

function editKeyHandler(e, event) {
	if (!e) var e = window.event;
	if (e.keyCode) code = e.keyCode;
	else if (e.which) code = e.which;

	var calNo = getCalNo(event);

	log('ctrl: ' + e.ctrlKey);

	var newCalNo = calNo;
	if (e.ctrlKey && code == 38) {
		do {
			newCalNo = newCalNo - 1;
			if (newCalNo < 1) {
				newCalNo = calendars.length - 1;
			}
		} while (isWebCal(newCalNo));
	} else if (e.ctrlKey && code == 40) {
		do {
			newCalNo = (newCalNo - 1) + 2;
			if (newCalNo > (calendars.length - 1)) {
				newCalNo = 1;
			}
		} while(isWebCal(newCalNo));
	} else if (code == 27) {
		log('cancelling event editing');
		resetEventFromEdit(event);
		if (getEventUid(event) == -1) {
			event.parentNode.removeChild(event);
			log('removing new event that was cancelled');
		}
	}

	if (newCalNo != calNo) {
		setCalNo(event, newCalNo);
	}
}


function checkInput(input) {
        var form = input.parentNode;
        var del = getFormDelete(form);

        if (input.value == '') {
                addClass(del, 'hover');
        } else {
                removeClass(del, 'hover');
        }
}


function htmlEscape(s) {
	s = s.replace(/&/g,'&amp;');
	s = s.replace(/>/g,'&gt;');
	s = s.replace(/</g,'&lt;');
	return s;
}

function htmlUnEscape(s) {
	s = s.replace(/&amp;/g, '&');
	s = s.replace(/&gt;/g, '>');
	s = s.replace(/&lt;/g, '<');
	return s;
}

function editComplete(form) {
   try {
      log('editComplete() - form: ' + form);      
	document.onmousedown = null;      


      var event = getFormEvent(form);
      var eventText = getEventText(event);
   
      addClass(form, HIDDEN_CLASS);
      removeClass(eventText.parentNode, HIDDEN_CLASS);

      var input = getFormInput(form);


	log('input: "' + input.value + '"');
	log('text: "' + eventText.innerHTML + '"');
      if (input.value == '' && eventText.innerHTML == NEW_EVENT_TEXT) {
        resetEventFromEdit(event);
	deleteEvent(event);
	return;
      }


      if (input.value != eventText.innerHTML || hasClass(event, UPDATE_FAILED_CLASS)) {
         log('sending changed value: ' + input.value);

	input.value = input.value.trim();
        var text = htmlEscape(input.value);
        text = (text == '') ? '&nbsp;' : text;

        var parts = getEventParts(event);
        for (var ct1 = 0; ct1 < parts.length; ct1++) {
                var partText = getEventText(parts[ct1]);
                partText.innerHTML = text;
        }
   
        showWorking(event);

	var uid = getEventUid(event);
	var calName = getCalName(event);
	var oldCalName = getOldCalName(event);

         // submit ajax
	var req = new DataRequestor();
	req.addArg(_GET, 'uid', uid);
	req.addArg(_GET, 'eventText', input.value);	
	req.addArg(_GET, 'calName', calName);

	if (oldCalName != calName) {
		req.addArg(_GET, 'oldCalName', event.oldCalName);
	}

	if (uid == -1) {
		$date = getEventDate(event);
		req.addArg(_GET, 'eventStart', $date);
		req.addArg(_GET, 'eventEnd', ($date - 0) + 1);
	}

	req.onload = function(data, obj) { editAjaxCallback(event, data, obj); };
	req.onfail = function(status) { editAjaxCallback(event, status, null) };
	req.getURL(baseURL + 'update/');

      } else {
        if (!hasClass(event, WORKING_CLASS)) {
		resetEventFromEdit(event);
	}
      }

      log('editComplete() - done');
   } catch(e) {
	logError(e);
	throw(e);
   }
}

function getOldCalName(event) {
	var reg = /(^| )old-cal-([^ ]+)($| )/;
        var ar = reg.exec(event.className);
	return ar[2];
}

function getCalName(event) {
	var reg = /(^| )cal-([^ ]+)($| )/;
        var ar = reg.exec(event.className);
	return ar[2];
}

function setCalName(event, calName) {
	var cls = 'cal-' + getCalName(event);
	removeClass(event, cls);
	addClass(event, 'cal-' + calName);
}

function getCalNo(event) {
	var reg = /(^| )color-([^ ]+)($| )/;
	var ar = reg.exec(event.className);
	return ar[2];
}

function setCalNo(event, num) {
	var cls = 'color-' + getCalNo(event);
	var calName = calendars[num].name;	

	removeClass(event, cls);
	addClass(event, 'color-' + num);
	setCalName(event, calName);

	log('set cal no: ' + num + ', name: ' + calName);
}

function moveAjaxCallback(event, singleDay, dragEvent, data, obj) {
	try {
		var lines = data.split('\n');

		if (lines[0] != AJAX_SUCCESS) {
			log('event editing failed: "' + data + '"');
			addClass(event, UPDATE_FAILED_CLASS);
		} else {
			removeClass(event, WORKING_CLASS);
			event.parentNode.removeChild(event);
			singleDay.appendChild(event);
		}
		dragEvent.parentNode.removeChild(dragEvent);
	} catch(e) {
		logError(e);
		throw(e);
	}
}

function resizeAjaxCallback(event, dragResize, data, obj) {
	try {
		log('resize callback');
		var lines = data.split('\n');

		if (lines[0] != AJAX_SUCCESS) {
			log('event editing failed: "' + data + '"');
			addClass(event, UPDATE_FAILED_CLASS);
		} else {
			removeClass(event, WORKING_CLASS);
			log('update event details!!');
			window.location.reload(true);
		}
		dragResize.parentNode.removeChild(dragResize);
	} catch(e) {
		logError(e);
		throw(e);
	}
}

function editAjaxCallback(event, data, obj) {
	try {
		var lines = data.split('\n');

		if (lines[0] != AJAX_SUCCESS) {
			log('event editing failed: "' + data + '"');
			addClass(event, UPDATE_FAILED_CLASS);
		} else {
			var form = getEventForm(event);
			var input = getFormInput(form);
			if (input.value == '') {
				deleteEvent(event);
			}
	
			if (lines.length > 1) {
				log('Assuming have uid: ' + lines[1]);
				event.setAttribute('id', 'event-' + lines[1]);
			}
		}
		resetEventFromEdit(event);

	} catch(e) {
		logError(e);
		throw(e);
	}
}

function deleteEvent(event) {
        log('event deleted!');

        var eventParts = getEventParts(event);
        for (var ct1 = 0; ct1 < eventParts.length; ct1++) {
                var part = eventParts[ct1];
                part.parentNode.removeChild(part);
        }

        formatSingleDays();
}

function getEventParts(event) {
        var uid = getEventUid(event);
        var results = new Array();
        var num = 0;

        if (uid == -1) {
                results[num] = event;
        } else {
                var events = getElementsByClass(calendar, 'event');
                for (var ct1 = 0; ct1 < events.length; ct1++) {
                        var event = events[ct1];
                        var eventUid = getEventUid(event);
                        if (eventUid == uid) {
                                results[num] = event;
                                num++;
                        }
                }
        }

        return results;
}

function getEventDate(event) {
	var day = event.parentNode;
	return getSingleDayDate(day);
}

function getSingleDayDate(day) {
	var id = day.getAttributeNode('id').nodeValue;
	log('id ' + id);
	return id.substring(4);
}

function getFormInput(form) {
   return form.getElementsByTagName('input')[0];
}

function getInputEvent(input) {
	return input.parentNode.parentNode;
}

function getFormEvent(form) {
   return form.parentNode;
}

function getEventForm(event) {
   return event.getElementsByTagName('form')[0];
}

function getEventText(event) {
    return getElementsByClass(event, 'text')[0];
}

function getTextEvent(text) {
	return text.parentNode.parentNode;
}

function getEventDesc(event) {
    return getElementsByClass(event, 'description')[0];
}

function getEventUid(event) {
	var uid = -1;
	if (event.getAttributeNode('id') && 
	    event.getAttributeNode('id').nodeValue != '') {
		uid = event.getAttributeNode('id').nodeValue;
	}
	return uid;
}

	


function showWorking(event) {
	removeClass(event, UPDATE_FAILED_CLASS);
	addClass(event, WORKING_CLASS);
}

function editCallbackHack() {
   editCallback(eventHack);
}

function editCallback(event) {
   resetEventFromEdit(event);
}

function resetEventFromEdit(event) {
   log('resetEventFromEdit() - event: ' + event);
   document.onmousedown = null;
   if (event) {   

     var form = getEventForm(event);
     if (form) {
        event.removeChild(form);
     }
   
     var eventText = getEventText(event);
     if (eventText) {
       removeClass(eventText.parentNode, HIDDEN_CLASS);
     }
  
     removeClass(event, WORKING_CLASS);

     initEvent(event);
   }
   log('resetEventFromEdit() - done');
}


window.onload = init;


