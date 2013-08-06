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
    public function getMultilingualStaticData ($staticDataObj)
    {

        foreach ($staticDataObj as $staticObjKey => $staticObjValue) {
            $count = 0;
            foreach ($staticObjValue as $staticDataKey => $staticDataValue) {

                $resultStaticData[$staticObjKey][$count]->value = $staticDataValue->key;
                $resultStaticData[$staticObjKey][$count]->label = _x ($staticDataValue->value, $staticDataValue->key, 'static');
                $count++;
            }
        }

        return $resultStaticData;
    }

}

?>
