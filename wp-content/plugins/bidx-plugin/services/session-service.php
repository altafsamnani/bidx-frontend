<?php

require('api-bridge.php');

/**
 * @Author Altaf Samnani
 *  Session service that returns a list of session variables.
 * 
 *
 */
class SessionService extends APIBridge {

  public $sessionUrl = 'session';


  public function __construct(){
    parent::__construct();
    // Do stuff specific for Bar
  }


	/**
	 * Checks if the user is logged in on the API
   * @Author Altaf Samnani
	 * @param boolean $serviceCheck define if a service check is needed or a simple check on the API cookie is sufficient.
	 * In case of no API service check, the data in the Session profile will be very limited.
	 * @return boolean if user is logged in
	 */	
	function isLoggedIn( )
	{
    $result = $this->callBidxAPI($this->sessionUrl, array(), 'GET');
     
    return $result;
	}
}
?>
