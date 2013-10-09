<?php

require('api-bridge.php');

/**
 * Session service that returns a list of session variables.
 * 
 * @author Altaf Samnani
 * @version 1.0
 */
class SessionService extends APIBridge {

	public $sessionUrl = 'session';
	private $data;

	/**
	 * Constructs the API bridge.
	 * Needed for operational logging.
	 */
	public function __construct() {
		parent :: __construct();
	}

	/**
	 * Checks if the user is logged in on the API
	 * 
	 * @param boolean $serviceCheck define if a service check is needed or a simple check on the API cookie is sufficient.
	 * In case of no API service check, the data in the Session profile will be very limited.
	 * @return boolean if user is logged in
	 */
	function isLoggedIn(  )
	{
		$this->sessionData = $this->callBidxAPI($this->sessionUrl, array(), 'GET');
		//trace logging this
		return $this->sessionData;
	}

    /**
	 * Checks if the user is having particular profile ex Investor, Entrprepneur,
	 *
	 * @param String $type Type of profile (investor,entrpreneur etc)
	 * 
	 * @return boolean if having profile or not
	 */
    function isHavingProfile($type) {
        $sessionData = BidxCommon::$staticSession;
        $entities = $sessionData->data->entities;
        foreach($entities as $value) {
            if($value->bidxMeta->bidxEntityType == $type) {
                return true;
            }
        }

        return false;

    }

}
?>
