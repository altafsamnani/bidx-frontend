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
    function isHavingProfile ($type)
    {
        $sessionData = BidxCommon::$staticSession;
        $entities = (isset($sessionData->data->entities)) ? $sessionData->data->entities : NULL;
        if ($entities) {
            foreach ($entities as $entity) {
                if ($entity->bidxMeta->bidxEntityType == $type) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Checks if the user is having particular profile ex Investor, Entrprepneur,
     *
     * @param String $type Type of profile (investor,entrpreneur etc)
     *
     * @return entity object if having the profilem or boolean if not
     */
    function returnEntity ( $type )
    {
        $sessionData = BidxCommon::$staticSession;
        $entities = (isset($sessionData->data->entities)) ? $sessionData->data->entities : NULL;
        if ($entities) {
            foreach ($entities as $entity) {
                if ($entity->bidxMeta->bidxEntityType == $type) {
                    return $entity;
                }
            }
        }
        return false;
    }


    /**
     * Retrieve an array of the groups this member is associated with members
     *
     * @return array with groups or empty array if there are no group associated with this member
     */
    function getGroups( ) {
        $sessionData = BidxCommon::$staticSession;
        $groups = $sessionData->data->groups;
        $result = array();


    $profiles = array(
        'bidxInvestorProfile'        => array(
            'Investor Dashboard' => '/investor-dashboard'
        ),
        'bidxEntrepreneurProfile'   => array(
            'Entrepreneur Dashboard' => '/entrepreneur-dashboard'
        )
    );



        foreach($groups as $key => $value) {

            if ( $value -> bidxMeta -> bidxGroupType === "Open" )
            {
                $result [ $key ] = array(
                    "name"  => $value -> name,
                    "url"   => $value -> bidxMeta -> bidxGroupUrl
                );
            }

        }

        return $result;

    }

}
?>
