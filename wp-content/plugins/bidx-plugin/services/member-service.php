<?php

require('session-service.php');

/**
 * @Author Altaf Samnani
 *  Session service that returns a list of session variables.
 *
 *
 */
class MemberService extends SessionService {

  public $memberUrl = 'members';


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
	function getMemberDetails( )
	{
    //Session Service
    $sessionData = $this->isLoggedIn();
    
    $membersId = $sessionData->data->id;
    
    //Call member profile
    $result = $this->callBidxAPI($this->memberUrl.'/2', array(), 'GET'); //.$membersId 4

    return $result;
	}

  

}
?>
