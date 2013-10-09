<?php

/**
 * Session service that returns a list of session variables.
 *
 * @author Altaf Samnani
 * @version 1.0
 * @link http://bidx.net/api/v1/entity
 *
 */
class BusinessSummaryService extends APIbridge
{
    /**
     * Constructs the API bridge.
     * Needed for operational logging.
     */
    private $apiUrl = 'entity/';

    public function __construct ()
    {
        parent :: __construct ();
    }

    /**
     * Retrieve the details of a single company
     *
     * @param integer $companyId
     *
     * @return object company details
     */
    function getSummaryDetails ()
    {
        //Call entity API
        $sessionData = BidxCommon::$staticSession;

        $businessSummaryId = $sessionData->businessSummaryId;

        $result = $this->callBidxAPI ($this->apiUrl . $businessSummaryId, array (), 'GET');

        return $result;
    }

}

?>
