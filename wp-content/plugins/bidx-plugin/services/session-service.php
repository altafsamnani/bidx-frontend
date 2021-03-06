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
	public function __construct()
    {
		parent :: __construct();
	}

	/**
	 * Checks if the user is logged in on the API
	 * @param boolean $serviceCheck define if a service check is needed or a simple check on the API cookie is sufficient.
	 * In case of no API service check, the data in the Session profile will be very limited.
	 * @return boolean if user is logged in
	 */
	function isLoggedIn(  )
    {

		$this->sessionData = $this->callBidxAPI($this->sessionUrl, array(), 'GET');

		return $this->sessionData;

	}

    /**
     * Checks if the user is having Frontend and session set
     * @param boolean $serviceCheck define if a service check is needed or a simple check on the API cookie is sufficient.
     * In case of no API service check, the data in the Session profile will be very limited.
     * @return boolean if user is having Frontend and session set
     */
    function isFrontendSessionSet(  )
    {

        $sessionData = BidxCommon::$staticSession;

        if ($sessionData->authenticated === "true")
        {
                return true;
        }

        return false;
    }

    /**
	 * Checks if the user is having particular profile ex Investor, Entrprepneur,
	 * @param String $type Type of profile (investor,entrepreneur, mentor)
	 * @return boolean if having profile or not
	 */
    function isHavingProfile( $type, $sessionData = NULL ) 
    {

        $sessionData = ( $sessionData ) ? $sessionData : BidxCommon::$staticSession;

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
     * @param String $type Type of profile (investor,entrepreneur etc)
     * @return entity object if having the profilem or boolean if not
     */
    function returnEntity ( $type ) {

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
     * @return array with groups or empty array if there are no group associated with this member
     */
    function getGroups( ) {

    	$result = array();
        $sessionData = BidxCommon::$staticSession;
        if ( isset( $sessionData->data ) ) { //validate if the data is there
	        $groups = $sessionData->data->groups;
		    if (! empty ( $groups ) ) {
		        foreach ( $groups as $key => $value ) {
		            if ( $value -> bidxMeta -> bidxGroupType === "Open" ) {
		                $result [ $key ] = array(
		                    "name"  => $value -> name,
		                    "url"   => $value -> bidxMeta -> bidxGroupUrl
		                );
		            }
		        }
		    }
        }
        return $result;

    }

    /**
     * Checks if the user has at least one of the roles.
     * @param mixed $roles single role or array of roles to check.
     * @return boolean true if the user has at least one of the roles, false if not
     */
    function isHavingRole( $roles ) {
        $sessionData = BidxCommon::$staticSession;
        if ( !empty( $sessionData ) ) {
            $userRoles = ( !empty( $sessionData->data->roles )) ? $sessionData->data->roles : NULL;
            if ( !empty( $userRoles ) ) {
                if( is_array( $roles ) ) {
                    return count( array_intersect($userRoles, $roles) ) > 0;
                }
                else {
                    return in_array( $roles, $userRoles );
                }
            }
        }
        return false;
    }

    /**
     * Checks if the user is an admin in the current group.
     * @return boolean true if admin, false if not
     */
    function isAdmin( ) {
        return $this->isHavingRole( array('GroupAdmin', 'GroupOwner') );
    }

    /**
     * Checks if the user is a platform admin.
     * @return boolean true if platform admin, false if not
     */
    function isSysAdmin( ) {
       return $this->isHavingRole( 'SysAdmin' );
    }

    /**
     *
     * @return multitype:NULL
     */
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
