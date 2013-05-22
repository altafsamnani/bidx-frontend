<?php

/**
 * Gather search results for a standard full text query.
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
	 * @param string $filter optional value --> not implemented yet
	 * @return response of the search service
	 * @link http://bidx.net/api/v1/search
	 * @todo implement the query cooking here for the facets
	 */
	public function getSearchResults( $query, $filter = null ) {
		
		return $this->callBidxAPI('staticdata/?q=' . $query, array(), 'GET');
		
	}	

}

?>
