        /*
         * Monket Calendar 0.9
         *  by Karl O'Keeffe
         *  24 June 2005
         *
         * Homepage: http://www.monket.net/wiki/monket-calendar/
         * Released under the GPL (all code)
         * Released under the Creative Commons License 2.5 (without phpicalendar)
         */

function delay(gap) { /* gap is in millisecs */
   var then = new Date().getTime();
   var now = then;
   while ((now - then) < gap) {
      now = new Date().getTime();
   }
}

    /*
    * This function will not return until (at least)
    * the specified number of milliseconds have passed.
    * It uses a modal dialog.
    */
     function pause(numberMillis) {
        var dialogScript = 
           'window.setTimeout(' +
           ' function () { window.close(); }, ' + numberMillis + ');';
        var result = 
// For IE5.
         window.showModalDialog(
           'javascript:document.writeln(' +
            '"<script>' + dialogScript + '<' + '/script>")');

/* For NN6, but it requires a trusted script.
         openDialog(
           'javascript:document.writeln(' +
            '"<script>' + dialogScript + '<' + '/script>"',
           'pauseDialog', 'modal=1,width=10,height=10');
 */
     }

function findPosX(obj)
{
	var curleft = 0;
	if (obj.offsetParent) {
		while (obj) {
			curleft += obj.offsetLeft;
			obj = obj.offsetParent;
		}
	} else if (obj.x) {
		curleft += obj.x;
	}
	return curleft;
}

function findPosY(obj)
{
	var curtop = 0;
	if (obj.offsetParent)
	{
		while (obj)
		{
			curtop += obj.offsetTop
			obj = obj.offsetParent;
		}
	}
	else if (obj.y)
		curtop += obj.y;
	return curtop;
}

String.prototype.trim=function(){
     var
         r=/^\s+|\s+$/,
         a=this.split(/\n/g),
         i=a.length;
     while(i-->0)
         a[i]=a[i].replace(r,'');
     return a.join('\n');
}


/*
 * Browser detection from Quirksmode
 *  http://www.quirksmode.org/js/detect.html
 */

var detect = navigator.userAgent.toLowerCase();
var OS,browser,version,total,thestring;

if (checkIt('konqueror'))
{
	browser = "Konqueror";
	OS = "Linux";
}
else if (checkIt('safari')) browser = "Safari"
else if (checkIt('omniweb')) browser = "OmniWeb"
else if (checkIt('opera')) browser = "Opera"
else if (checkIt('webtv')) browser = "WebTV";
else if (checkIt('icab')) browser = "iCab"
else if (checkIt('msie')) browser = "Internet Explorer"
else if (!checkIt('compatible'))
{
	browser = "Netscape Navigator"
	version = detect.charAt(8);
}
else browser = "An unknown browser";

if (!version) version = detect.charAt(place + thestring.length);

if (!OS)
{
	if (checkIt('linux')) OS = "Linux";
	else if (checkIt('x11')) OS = "Unix";
	else if (checkIt('mac')) OS = "Mac"
	else if (checkIt('win')) OS = "Windows"
	else OS = "an unknown operating system";
}

function checkIt(string)
{
	place = detect.indexOf(string) + 1;
	thestring = string;
	return place;
}
