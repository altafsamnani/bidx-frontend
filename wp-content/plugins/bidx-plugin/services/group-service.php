<?php

/**
 * Gather group related information for:
 * - latest members
 * - group details
 * - list of groups
 *
 * @author Jaap Gorjup
 * @version 1.0
 *
 * @todo store the group related data centrally so the data is called only once
 * @todo see if the listMembers is not already in the session which optimizes one call
 * @todo Overview of all groups should be cached for public usage for performance reasons or future optimization of group service
 */
class GroupService extends APIbridge {

	/**
	 * Acceptable cache timeout (seconds) used when getting latest business summaries
	 * and latest group members.
	 *
	 * (Arjan, 2014-01-19: other group API results are cached for an hour, and it seems
	 * that the latest business summaries and latest group members results are based on
	 * the very same JSON results from the backend group API, hence could be shared?)
	 */
	private $cache = 600;


	/**
	 * Constructs the API bridge.
	 * Needed for operational logging.
	 */
	public function __construct() {
		parent :: __construct();
	}

  /**
   * Retrieves the latest members from a group
   * @param string $group_id optional a group id otherwise the current
   * @link http://bidx.net/api/v1/group
   * @return partial result from the service in JSON form containing the members
   */
  public function getLatestMembers( $group_id = null ) {

  	$result = $this -> getGroupDetails( $group_id, 'latest_members', $this->cache );

  	if ( property_exists( $result, 'data' ) ) {
  		return $result -> data -> latestMembers;
  	}
  	else {
  		return;
  	}

  }

  /**
   * Retrieves the latest members from a group
   * @param string $group_id optional a group id otherwise the current
   * @link http://bidx.net/api/v1/group
   * @return partial result from the service in JSON form containing the members
   */
  public function getGroupSettings( $options = array() ) 
  {
    $result = array();

    if( !empty( $options ) )
    {
      foreach( $options as $optionKey => $optionVal)
      {
         switch ( $optionVal )
         {
            case 'wizehive':

              $result['wizehive'] = get_option('bidx-wizehive-slug');
              break;

            default:
         }
      }
    }

    return $result;
  }


  /**
   * Retrieves the latest companies from a group
   * @param string $group_id optional a group id otherwise the current
   * @link http://bidx.net/api/v1/group
   * @return partial result from the service in JSON form containing the members
   */
  public function getLatestBusinessSummaries( $group_id = null ) {

    $result = $this -> getGroupDetails( $group_id, 'latest_groups', $this->cache );

    if ( !empty( $result) ) {
      return $result -> data -> latestBusinessSummaries;
    }
    else {
      return;
    }

  }


  /**
   * Retrieves the full group data
   * @param string $group_id optional a group id otherwise the current
   * @param string $transient optionally the name of the transient storage value named localgroup
   * @param string $cached number of seconds before cache should be refreshed
   * @link http://bidx.net/api/v1/group
   * @return full result from the service in JSON form
   */
  public function getGroupDetails( $group_id = null, $transient = 'localgroup', $cached = 3600 ) {

	if ($group_id == null)
  {
    $body   =  array( 'showLatestMembers'           =>  false
                    , 'showLatestBusinessSummaries' =>  false
                    , 'showGroupAdmins'             =>  false);

    //$result = get_transient( $transient );

		if ( empty($result) || $result === false )
    {
      if( $transient === 'latest_members' )
      {
        $body['showLatestMembers']  =   true;
      }

      if( $transient === 'latest_groups' )
      {
        $body['showLatestBusinessSummaries']  = true;
      }
			// It wasn't there, so regenerate the data and save the transient
			$result = $this->callBidxAPI( 'groups/' . $this -> getBidxSubdomain(), $body, 'GET', false, true );

			//check if error response : else skip
			// method added for robustness
			if ( "ERROR" != $result->status ) {
				set_transient( $transient, $result, $cached ); //1 hour default
				set_transient( $transient . '_backup', $result, $cached + 5*60 ); // store backup for 5 minutes more
			} else {
				$result = get_transient( $transient . '_backup' );
			}
		}

	} else {

		$result = $this->callBidxAPI( 'groups/' . $group_id, array(), 'GET' );

	}


	return $result;
  }

  /**
   * Retrieves the full group data
   * @param string $group_id optional a group id otherwise the current
   * @link http://bidx.net/api/v1/group
   * @return full result from the service in JSON form
   */
  public function getGroupList( $group_type = 'Open' ) {

  	return $this->callBidxAPI('groups/?groupType=' . $group_type, array(), 'GET');

  }

  /**
   * Use an API service to match the group name to the group id needed for service calls
   * @param string $group_name name of the group determined by domain
   * @return long respresentation id of the group
   */
public function getGroupId( $group_name ) {

  	$group_id = 0;

  	if ( false === ( $result = get_transient( 'groupoverview' ) ) ) {
  		// It wasn't there, so regenerate the data and save the transient
  		$result = $this->callBidxAPI('groups/', array(), 'GET');
  		set_transient( 'groupoverview', $result, 300 );
  	}

	$data = $result -> data;
  	foreach( $data as $group ) {
  		if ( $group -> domain === $group_name ) {

  			$group_id = $group -> id;
  			break;
  		}
  	}
  	return $group_id;

  }

}

?>
