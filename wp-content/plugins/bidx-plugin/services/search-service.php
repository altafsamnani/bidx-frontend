<?php

/**
 * Gather search results for a standard full text query.
 * 
 * @author Jaap Gorjup
 * @version 1.0
 */
class SearchService extends APIbridge {

	/**
	 * Constructs the API bridge.
	 * Needed for operational logging.
	 */
	public function __construct() {
		
		parent :: __construct();
		
	}	
	
	/**
	 * Performs a search action 
	 * @param array $query variables list
	 * @return response of the search service
	 * @link http://bidx.net/api/v1/search
	 * @todo implement the query cooking here for the facets
	 */
	public function getSearchResults( $query ) {
			
	    $jsonEncode 	=	json_encode($query);
	    		
		return $this->callBidxAPI('nnsearch/', $jsonEncode,'POST', FALSE, FALSE, TRUE );
		
	}	

	/**
	 * Cooks the query :
	 * - q : query text
	 * - fq : filter query on result
	 * - sort : sorting fields 
	 * - start : result number to start with
	 * - rows : amount of results to show
	 * 
	 * This is also added because the params can clash in the future 
	 * and this is the location to do the mapping.
	 * 
	 * @return array mapping of fields from GET params
	 */
	public function cookQuery($atts = null) {

		$query = array();
		if ( $atts == null ) {
			$atts = $_REQUEST;
			$this -> getLogger() -> trace( 'Cooking query based on $_REQUEST ' .  $atts['q'] );
		}
		$this -> addToArray( 'q', $query, $atts );
		$this -> addToArray( 'fq', $query, $atts );
		$this -> addToArray( 'sort', $query, $atts );
		$this -> addToArray( 'start', $query, $atts );
		$this -> addToArray( 'rows', $query, $atts );
		$this -> getLogger() -> trace( $query );
		return $query;
		
	}
	
	/**
	 * Adds a attribute parameter to the array for the API call
	 * @param unknown $name name of the variable
	 * @param unknown $array the array to add the result to
	 */
	private function addToArray($name, &$array, $atts) {
		
		if ( array_key_exists( $name, $atts ) ) {	
			$value = $atts[$name];
			//@todo encode string for search
			
			$array[$name] = $value;	
			$this -> getLogger() -> trace( 'Adding search param ' . $name . ' : ' . $array[$name] );
		} else {
			$this -> getLogger() -> trace( 'Param ' . $name . ' skipped' );
		}
			
	}
	
}

?>
