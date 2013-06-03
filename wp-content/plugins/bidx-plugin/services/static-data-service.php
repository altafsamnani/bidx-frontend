<?php

/**
 * Gather staticdata
 * 
 * @author Jaap Gorjup
 * @version 1.0
 */
class StaticDataService extends APIbridge {

	/**
	 * Constructs the API bridge.
	 * Needed for operational logging.
	 */
	public function __construct() {
		parent :: __construct();
	}	
	
	/**
	 * Performs a search action 
	 * @param string $query
	 * @return response of the search service
	 * @link http://bidx.net/api/v1/staticdata
	 * @todo implement the transient storage here
	 * @todo implement with $query=null
	 */
	public function getStaticData( $query ) {
		
		 $data = $this->callBidxAPI('staticdata', $query, 'GET');
		 return $data;
	}	

}

?>
