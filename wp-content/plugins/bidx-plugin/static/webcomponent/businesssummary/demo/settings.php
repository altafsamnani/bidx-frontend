<?php
/**
 *
 * @author Altaf
 * @version 1.0
 */
class settings
{

	function get_bidx_subdomain ($echo = false, $url = NULL)
	{
	    $httpHost = ($url) ? str_replace(array("http://", "https://"),"",$url) : $_SERVER ["HTTP_HOST"];
	    $hostAddress = explode ('.', $httpHost );
	    if (is_array ($hostAddress)) {
	        if (strcasecmp ("www", $hostAddress [0]) == 0) {
	            $passBack = 1;
	        } else {
	            $passBack = 0;
	        }
	        if ($echo == false) {
	            return ( $hostAddress [$passBack] );
	        } else {
	            echo ( $hostAddress [$passBack] );
	        }
	    } else {
	        return ( false );
	    }
	}

	function is_ssl() 
	{
		$isSecure = false;
		if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') {
		    $isSecure = true;
		}
		elseif (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https' || !empty($_SERVER['HTTP_X_FORWARDED_SSL']) && $_SERVER['HTTP_X_FORWARDED_SSL'] == 'on') {
		    $isSecure = true;
		}		
		return $isSecure;
	}

}

?>