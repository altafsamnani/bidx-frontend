<?php

require('api-bridge.php');

/**
 *  Session service that returns a list of session variables.
 * 
 *
 */
class SessionService extends APIBridge {
	
	/**
	 * Checks if the user is logged in on the API
	 * @param boolean $serviceCheck define if a service check is needed or a simple check on the API cookie is sufficient.
	 * In case of no API service check, the data in the Session profile will be very limited.
	 * @return boolean if user is logged in
	 */	
	function isLoggedIn(boolean $serviceCheck)
	{
		//add code here
		return true;
	}
	
}
?>
