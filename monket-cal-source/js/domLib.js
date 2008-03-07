/** $Id: domLib.js 1603 2004-11-14 23:54:26Z dallen $ */
// {{{ docs <-- this is a VIM (text editor) text fold

/**
 * Title: DOM Library Core
 * Version: 0.60
 *
 * Summary:
 * A set of commonly used functions that make it easier to create javascript
 * applications that rely on the DOM.
 *
 * Updated: 2004/11/12
 *
 * Maintainer: Dan Allen <dan.allen@mojavelinux.com>
 * Maintainer: Jason Rust <jrust@rustyparts.com>
 *
 * License: LGPL
 */

// }}}
// {{{ global constants (DO NOT EDIT)

/**
 * Global constants (DO NOT EDIT)
 */

// -- Browsers --
var domLib_userAgent = navigator.userAgent.toLowerCase();
var domLib_isMac = navigator.appVersion.indexOf('Mac') != -1;
var domLib_isOpera = domLib_userAgent.indexOf('opera') != -1;
var domLib_isOpera7 = (domLib_userAgent.indexOf('opera/7') != -1 || domLib_userAgent.indexOf('opera 7') != -1);
var domLib_isSafari = domLib_userAgent.indexOf('safari') != -1;
var domLib_isKonq = domLib_userAgent.indexOf('konqueror') != -1;
// Both konqueror and safari use the khtml rendering engine
var domLib_isKHTML = (domLib_isKonq || domLib_isSafari);
var domLib_isIE = (!domLib_isKHTML && !domLib_isOpera && (domLib_userAgent.indexOf('msie 5') != -1 || domLib_userAgent.indexOf('msie 6') != -1));
var domLib_isIE5up = domLib_isIE;
var domLib_isIE50 = (domLib_isIE && domLib_userAgent.indexOf('msie 5.0') != -1);
var domLib_isIE55 = (domLib_isIE && domLib_userAgent.indexOf('msie 5.5') != -1);
var domLib_isIE5 = (domLib_isIE50 || domLib_isIE55);
// safari and konq may use string "khtml, like gecko", so check for destinctive /
var domLib_isGecko = domLib_userAgent.indexOf('gecko/') != -1;
var domLib_isMacIE = (domLib_isIE && domLib_isMac);
var domLib_isIE55up = domLib_isIE5up && !domLib_isIE50 && !domLib_isMacIE;
var domLib_isIE6up = domLib_isIE55up && !domLib_isIE55;

// -- Abilities --
var domLib_standardsMode = (document.compatMode && document.compatMode == 'CSS1Compat');
var domLib_useLibrary = (domLib_isOpera7 || domLib_isKHTML || domLib_isIE55up || domLib_isGecko || domLib_isMacIE);
var domLib_hasBrokenTimeout = (domLib_isMacIE || (domLib_isKonq && domLib_userAgent.match(/konqueror\/3.([2-9])/) == null));
var domLib_canFade = (domLib_isGecko || domLib_isIE || domLib_isSafari || domLib_isOpera);
var domLib_canDrawOverSelect = (domLib_isOpera || domLib_isMac || domLib_isGecko);

// -- Event Variables --
var domLib_eventTarget = domLib_isIE ? 'srcElement' : 'currentTarget';
var domLib_eventButton = domLib_isIE ? 'button' : 'which';
var domLib_eventTo = domLib_isIE ? 'toElement' : 'relatedTarget';
var domLib_stylePointer = domLib_isIE ? 'hand' : 'pointer';
// NOTE: a bug exists in Opera that prevents maxWidth from being set to 'none', so we make it huge
var domLib_styleNoMaxWidth = domLib_isOpera ? '10000px' : 'none';
var domLib_hidePosition = '-1000px';
var domLib_scrollbarWidth = 14;
var domLib_autoId = 1;
var domLib_zIndex = 100;

// -- Detection --
var domLib_selectElements;

var domLib_timeoutStateId = 0;
var domLib_timeoutStates = new Hash();

// }}}
// {{{ DOM enhancements

if (!document.ELEMENT_NODE)
{
	document.ELEMENT_NODE = 1;
	document.ATTRIBUTE_NODE = 2;
	document.TEXT_NODE = 3;
	document.DOCUMENT_NODE = 9;
	document.DOCUMENT_FRAGMENT_NODE = 11;
}

Object.prototype.clone = function()
{
	var copy = {};
	for (var i in this)
	{
		var value = this[i];
		try
		{
			if (value != null && typeof(value) == 'object' && value != window && !value.nodeType)
			{
				// for IE5 which doesn't inherit prototype
				value.clone = Object.clone;
				copy[i] = value.clone();
			}
			else
			{
				copy[i] = value;
			}
		}
		catch(e)
		{
			copy[i] = value;
		}
	}

	return copy;
}

// }}}
// {{{ class Hash()

function Hash()
{
	this.length = 0;
    this.numericLength = 0; 
	this.elementData = [];
	for (var i = 0; i < arguments.length; i += 2)
	{
		if (typeof(arguments[i + 1]) != 'undefined')
		{
			this.elementData[arguments[i]] = arguments[i + 1];
			this.length++;
            if (arguments[i] == parseInt(arguments[i])) 
            {
                this.numericLength++;
            }
		}
	}
}

// using prototype as opposed to inner functions saves on memory 
Hash.prototype.get = function(in_key)
{
    return this.elementData[in_key];
}

Hash.prototype.set = function(in_key, in_value)
{
    if (typeof(in_value) != 'undefined')
    {
        if (typeof(this.elementData[in_key]) == 'undefined')
        {
            this.length++;
            if (in_key == parseInt(in_key)) 
            {
                this.numericLength++;
            }
        }

        return this.elementData[in_key] = in_value;
    }

    return false;
}

Hash.prototype.remove = function(in_key)
{
    var tmp_value;
    if (typeof(this.elementData[in_key]) != 'undefined')
    {
        this.length--;
        if (in_key == parseInt(in_key)) 
        {
            this.numericLength--;
        }

        tmp_value = this.elementData[in_key];
        delete this.elementData[in_key];
    }

    return tmp_value;
}

Hash.prototype.size = function()
{
    return this.length;
}

Hash.prototype.has = function(in_key)
{
    return typeof(this.elementData[in_key]) != 'undefined';
}

Hash.prototype.find = function(in_obj)
{
    for (var tmp_key in this.elementData) 
    {
        if (this.elementData[tmp_key] == in_obj) 
        {
            return tmp_key;
        }
    }
}

Hash.prototype.merge = function(in_hash)
{
    for (var tmp_key in in_hash.elementData) 
    {
        if (typeof(this.elementData[tmp_key]) == 'undefined') 
        {
            this.length++;
            if (tmp_key == parseInt(tmp_key)) 
            {
                this.numericLength++;
            }
        }

        this.elementData[tmp_key] = in_hash.elementData[tmp_key];
    }
}

Hash.prototype.compare = function(in_hash)
{
    if (this.length != in_hash.length) 
    {
        return false;
    }

    for (var tmp_key in this.elementData) 
    {
        if (this.elementData[tmp_key] != in_hash.elementData[tmp_key]) 
        {
            return false;
        }
    }
    
    return true;
}

// }}}
// {{{ domLib_isDescendantOf()

function domLib_isDescendantOf(in_object, in_ancestor)
{
	if (in_object == in_ancestor)
	{
		return true;
	}

	while (in_object != document.documentElement)
	{
		try
		{
			if ((tmp_object = in_object.offsetParent) && tmp_object == in_ancestor)
			{
				return true;
			}
			else if ((tmp_object = in_object.parentNode) == in_ancestor)
			{
				return true;
			}
			else
			{
				in_object = tmp_object;
			}
		}
		// in case we get some wierd error, just assume we haven't gone out yet
		catch(e)
		{
			return true;
		}
	}

	return false;
}

// }}}
// {{{ domLib_detectCollisions()

/**
 * NOTE: As of Mozilla 1.6, select elements are no longer a problem.
 */
function domLib_detectCollisions(in_object, in_recover)
{
	if (domLib_canDrawOverSelect)
	{
		return;
	}

	if (typeof(domLib_selectElements) == 'undefined')
	{
		domLib_selectElements = document.getElementsByTagName('select');
	}

	// if we don't have a tip, then unhide selects
	if (in_recover)
	{
		for (var cnt = 0; cnt < domLib_selectElements.length; cnt++)
		{
			var thisSelect = domLib_selectElements[cnt];

			if (!thisSelect.hideList)
			{
				thisSelect.hideList = new Hash();
			}

			thisSelect.hideList.remove(in_object.id);
			if (!thisSelect.hideList.length)
			{
				domLib_selectElements[cnt].style.visibility = 'visible';
				if (domLib_isKonq) { domLib_selectElements[cnt].style.display = ''; }
			}
		}

		return;
	}
	else if (domLib_selectElements.length == 0)
	{
		return;
	}

	// okay, we have a tip, so hunt and destroy
	var objectOffsets = domLib_getOffsets(in_object);

	for (var cnt = 0; cnt < domLib_selectElements.length; cnt++)
	{
		var thisSelect = domLib_selectElements[cnt];

		// if the select is in the tip, then skip it
		// :WARNING: is this too costly?
		if (domLib_isDescendantOf(thisSelect, in_object))
		{
			continue;
		}

		if (!thisSelect.hideList)
		{
			thisSelect.hideList = new Hash();
		}

		var selectOffsets = domLib_getOffsets(thisSelect); 
		var center2centerDistance = Math.sqrt(Math.pow(selectOffsets.get('leftCenter') - objectOffsets.get('leftCenter'), 2) + Math.pow(selectOffsets.get('topCenter') - 
objectOffsets.get('topCenter'), 2));
		var radiusSum = selectOffsets.get('radius') + objectOffsets.get('radius');
		// the encompassing circles are overlapping, get in for a closer look
		if (center2centerDistance < radiusSum)
		{
			// tip is left of select
			if ((objectOffsets.get('leftCenter') <= selectOffsets.get('leftCenter') && objectOffsets.get('right') < selectOffsets.get('left')) ||
			// tip is right of select
				(objectOffsets.get('leftCenter') > selectOffsets.get('leftCenter') && objectOffsets.get('left') > selectOffsets.get('right')) ||
			// tip is above select
				(objectOffsets.get('topCenter') <= selectOffsets.get('topCenter') && objectOffsets.get('bottom') < selectOffsets.get('top')) ||
			// tip is below select
				(objectOffsets.get('topCenter') > selectOffsets.get('topCenter') && objectOffsets.get('top') > selectOffsets.get('bottom')))
			{
				thisSelect.hideList.remove(in_object.id);
				if (!thisSelect.hideList.length)
				{
					thisSelect.style.visibility = 'visible';
					if (domLib_isKonq) { thisSelect.style.display = ''; }
				}
			}
			else
			{
				thisSelect.hideList.set(in_object.id, true);
				thisSelect.style.visibility = 'hidden';
				if (domLib_isKonq) { thisSelect.style.display = 'none'; }
			}
		}
	}
}

// }}}
// {{{ domLib_getOffsets()

function domLib_getOffsets(in_object)
{
	var originalObject = in_object;
	var originalWidth = in_object.offsetWidth;
	var originalHeight = in_object.offsetHeight;
	var offsetLeft = 0;
	var offsetTop = 0;

	while (in_object)
	{
		offsetLeft += in_object.offsetLeft;
		offsetTop += in_object.offsetTop;
		in_object = in_object.offsetParent;
	}

    // MacIE misreports the offsets (even with margin: 0 in body{}), still not perfect
    if (domLib_isMacIE) {
        offsetLeft += 10;
        offsetTop += 10;
    }

	return new Hash(
		'left',			offsetLeft,
		'top',			offsetTop,
		'right',		offsetLeft + originalWidth,
		'bottom',		offsetTop + originalHeight,
		'leftCenter',	offsetLeft + originalWidth/2,
		'topCenter',	offsetTop + originalHeight/2,
		'radius',		Math.max(originalWidth, originalHeight) 
	);
}

// }}}
// {{{ domLib_setTimeout()

function domLib_setTimeout(in_function, in_timeout, in_args)
{
	if (typeof(in_args) == 'undefined')
	{
		in_args = [];
	}

    if (in_timeout < 0)
	{
		throw "domLib_setTimeout(): Illegal timeout value " + in_timeout;
    }
	else if (in_timeout == 0)
	{
		in_function(in_args);
		return 0;
	}

	// must make a copy of the arguments so that we release the reference
	if (typeof(in_args.clone) != 'function')
	{
		in_args.clone = Object.clone;
	}

	var args = in_args.clone();

	if (!domLib_hasBrokenTimeout)
	{
		return setTimeout(function() { in_function(args); }, in_timeout);
	}
	else
	{
		var id = domLib_timeoutStateId++;
		var data = new Hash();
		data.set('function', in_function);
		data.set('args', args);
		domLib_timeoutStates.set(id, data);

		data.set('timeoutId', setTimeout('domLib_timeoutStates.get(' + id + ').get(\'function\')(domLib_timeoutStates.get(' + id + ').get(\'args\')); domLib_timeoutStates.remove(' + id + ');', 
in_timeout));
		return id;
	}
}

// }}}
// {{{ domLib_clearTimeout()

function domLib_clearTimeout(in_id)
{
	if (!domLib_hasBrokenTimeout)
	{
		clearTimeout(in_id);
	}
	else
	{
		if (domLib_timeoutStates.has(in_id))
		{
			clearTimeout(domLib_timeoutStates.get(in_id).get('timeoutId'))
			domLib_timeoutStates.remove(in_id);
		}
	}
}

// }}}
// {{{ domLib_getEventPosition()

function domLib_getEventPosition(in_eventObj)
{
	var eventPosition = new Hash('x', 0, 'y', 0, 'scrollX', 0, 'scrollY', 0);

	// IE varies depending on standard compliance mode
	if (domLib_isIE)
	{
		var doc = (domLib_standardsMode ? document.documentElement : document.body);
		// NOTE: events may fire before the body has been loaded
		if (doc)
		{
			eventPosition.set('x', in_eventObj.clientX + doc.scrollLeft);
			eventPosition.set('y', in_eventObj.clientY + doc.scrollTop);
			eventPosition.set('scrollX', doc.scrollLeft);
			eventPosition.set('scrollY', doc.scrollTop);
		}
	}
	else
	{
		eventPosition.set('x', in_eventObj.pageX);
		eventPosition.set('y', in_eventObj.pageY);
		eventPosition.set('scrollX', in_eventObj.pageX - in_eventObj.clientX);
		eventPosition.set('scrollY', in_eventObj.pageY - in_eventObj.clientY);
	}

	return eventPosition;
}

// }}}
// {{{ domLib_cancelBubble()

function domLib_cancelBubble(in_event)
{
    var eventObj = in_event ? in_event : window.event;
    eventObj.cancelBubble = true;
}

// }}}
// {{{ domLib_getIFrameReference()

function domLib_getIFrameReference(in_frame)
{
	if (domLib_isGecko || domLib_isIE)
	{
		return in_frame.frameElement;
	}
	else
	{
		// we could either do it this way or require an id on the frame
		// equivalent to the name
		var name = in_frame.name;
		if (!name || !in_frame.parent)
		{
			return;
		}

		var candidates = in_frame.parent.document.getElementsByTagName('iframe');
		for (var i = 0; i < candidates.length; i++)
		{
			if (candidates[i].name == name)
			{
				return candidates[i];
			}
		}
	}
}

// }}}
// {{{ domLib_getElementsByClass()

function domLib_getElementsByClass(in_class)
{
	var elements = domLib_isIE5 ? document.all : document.getElementsByTagName('*');	
	var matches = [];	
	var cnt = 0;
	for (var i = 0; i < elements.length; i++)
	{
		if ((" " + elements[i].className + " ").indexOf(" " + in_class + " ") != -1)
		{
			matches[cnt++] = elements[i];
		}
	}

	return matches;
}

// }}}
// {{{ makeTrue()

function makeTrue()
{
	return true;
}

// }}}
// {{{ makeFalse()

function makeFalse()
{
	return false;
}

// }}}

