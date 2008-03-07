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

	date_default_timezone_set('UTC');

	if (isset($_GET['getdate'])) {
		$unix_time    = strtotime($_GET['getdate']);
	} else {
		$unix_time    = time();
	}

	$display_date = date('F Y', $unix_time);

	$MC = array();
	$MC['title'] = $display_date;
	$MC['webcals'] = array();

	if (is_array($MonketWebCals)) {
		foreach($MonketWebCals as $webcal) {
			addWebCal($webcal);
		}
	}

function getCalInitHTML() {
	$init = '';

	$init .= '<script type="text/javascript" src="'. MONKET_BASE .'js/class.js" ></script>';
        $init .= '<script type="text/javascript" src="'. MONKET_BASE .'js/logging.js" ></script>';
        $init .= '<script type="text/javascript" src="'. MONKET_BASE .'js/dom-drag.js"></script>';
        $init .= '<script type="text/javascript" src="'. MONKET_BASE .'js/prototype.js"></script>';
        $init .= '<script type="text/javascript" src="'. MONKET_BASE .'js/rico.js"></script>';
        $init .= '<script type="text/javascript" src="'. MONKET_BASE .'js/calendar.js" ></script>';
        $init .= '<script type="text/javascript" src="'. MONKET_BASE .'js/util.js" ></script>';
        $init .= '<script type="text/javascript" src="'. MONKET_BASE .'js/data-requestor.js" ></script>';
        $init .= '<script type="text/javascript" src="'. MONKET_BASE .'js/domLib.js" ></script>';
        $init .= '<script type="text/javascript" src="'. MONKET_BASE .'js/domTT.js"></script>';
        $init .= '<script type="text/javascript" src="'. MONKET_BASE .'js/alphaAPI.js" ></script>';

        $init .= '<style type="text/css" media="screen">';
        $init .= '<!--';
        $init .= '  @import "'. MONKET_BASE .'css/calendar.css";';
        $init .= '  @import "'. MONKET_BASE .'css/logging.css";';
        $init .= '  @import "'. MONKET_BASE .'css/dom-tt.css";';
        $init .= '-->';
        $init .= '</style>';


        $init .= '<!-- compliance patch for microsoft browsers -->';
        $init .= '<!--[if lt IE 7]>';
        $init .= '<script type="text/javascript">';
        $init .= 'IE7_PNG_SUFFIX = ".png";';
        $init .= '</script>';
        $init .= '<script src="'. MONKET_BASE .'js/ie7/ie7-standard.js" type="text/javascript">';
        $init .= '</script>';
        $init .= '<![endif]-->';


	return $init;
}

function addWebCal($webcal) {
	global $MC;
	$MC['webcals'][] = $webcal;
}

?>
