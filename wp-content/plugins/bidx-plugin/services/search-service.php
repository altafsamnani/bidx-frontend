<?php

/**
 * Gather search results for a standard full text query.
 * 
 * @author Jaap Gorjup
 * @version 1.0
 */
class SearchService extends APIbridge {

	/**
	 * Performs a search action 
	 * @param string $query
	 * @param string $filter optional value --> not implemented yet
	 * @return response of the search service
	 * @link http://bidx.net/api/v1/search
	 * @todo implement the query cooking here for the facets
	 */
	public function getSearchResults( $query, $filter = null ) {
		
		return $this->callBidxAPI('search/?q=' . $query, array(), 'GET');
		
	}	

}

?>
