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

    /**
     * Checks if the user is an admin in the current group.
     * @return boolean true if admin, false if not
     */
    function isAdmin( ) {
    	$sessionData = BidxCommon::$staticSession;
    	$roles = ( !empty($sessionData->data->roles ) ) ? $sessionData->data->roles:NULL;
    	$currentGroupAdmin = false;
    	if ( !empty($sessionData) && !empty($roles) ) {
    		if ( in_array( 'GroupAdmin', $roles ) ||
    			 in_array( 'GroupOwner', $roles ) ) {
    			$currentGroupAdmin = true;
    		}
    	}
    	return $currentGroupAdmin;
    }

    function getGroupOwnerIds() {
        $groupOwnerIdArr = array();
        $sessionData = BidxCommon::$staticSession;
        $groupOwners = $sessionData->data->groupOwners;
        foreach ($groupOwners as $value) {
            $groupOwnerIdArr[] = $value->id;
        }

        return $groupOwnerIdArr;
    }

    /**
     * get session to set password
     */
    function getActivationSession( $code ) {

        // prepare data array to be posted
        //
        $data = array(
            "activationToken" => $code
        );

        // do actual post to API
        //
        $result = $this->callBidxAPI( 'session/activate', $data, 'POST' );
        return $result;


    }
}





?>
