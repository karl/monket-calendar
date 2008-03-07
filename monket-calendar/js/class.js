        /*
         * Monket Calendar 0.9
         *  by Karl O'Keeffe
         *  24 June 2005
         *
         * Homepage: http://www.monket.net/wiki/monket-calendar/
         * Released under the GPL (all code)
         * Released under the Creative Commons License 2.5 (without phpicalendar)
         */



/*
 * Add/Remove/Replace function original from the web.
 * Can't remember which site I'm afraid :(
 */

var SEP = '(^|$| )';

function hasClass(object, className) {
    var regex = new RegExp(SEP + className + SEP);
    return regex.test(object.className);
}

function addClass(o, cls) {
    if(!hasClass(o, cls)) {
        o.className += " " + cls;
    }
}

function removeClass(o, cls) {
    var regex = new RegExp(SEP + cls + SEP);
    o.className = o.className.replace(regex, " ");
}

function replaceClass(o, ocls, ncls) {
    var regex = new RegExp(SEP + ocls + SEP);
    o.className = o.className.replace(regex, ncls);
}

function getElementsByClass(object, cls) {
   var classElements = new Array();
   
   var allElements = object.getElementsByTagName('*');
   for (var ct1 = 0; ct1 < allElements.length; ct1++) {
      var element = allElements[ct1];
      if (hasClass(element, cls)) {
         classElements[classElements.length] = element;
      }
   }
   
   return classElements;
}

