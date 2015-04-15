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
    public function getMultilingualStaticData( $staticDataObj )  {

    	$resultStaticData = array();

        $xValue           = '';
    	// what if not an array : PHP Warning:  Invalid argument supplied for foreach()
        foreach ( $staticDataObj as $staticObjKey => $staticObjValue )
        {

            $count = 0;

            foreach ( $staticObjValue as $staticDataKey => $staticDataValue )
            {

            	$xValue    =   _x ($staticDataValue->value, $staticDataValue->key, 'static');

                $resultStaticData[$staticObjKey][$count]        =   new stdClass();

                $resultStaticData[$staticObjKey][$count]->value =   $staticDataValue->key;

                $resultStaticData[$staticObjKey][$count]->label =   $xValue ;

                $count++;
            }
        }
        return $resultStaticData;
    }

}

?>
