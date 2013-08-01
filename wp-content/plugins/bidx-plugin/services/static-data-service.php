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
	 * @link http://bidx.net/api/v1/staticdata	 *	
	 */
	public function getStaticData( $query = NULL ) {
		
		 $data = $this->callBidxAPI('staticdata', $query, 'GET');
		 return $data;
	}	
    
	/**
	 * Performs a search action 
	 * @param string $query
	 * @return response of the search service
	 * @link http://bidx.net/api/v1/staticdata	 *	
	 */
	public function getMultilingualStaticData( $staticDataObj ) {

        foreach($staticDataObj as $staticDataKey => $staticDataValue ) {
            $resultKey->value = $staticDataValue->key;
            $resultKey->label = _x($staticDataValue->value, 'static', '');
            $resultStaticData[$staticDataKey][] = $resultKey;
        }
        
    }



}

?>
