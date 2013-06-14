<?php

/**
 * Session service that returns a list of session variables.
 *
 * @author Altaf Samnani
 * @version 1.0
 * @link http://bidx.net/api/v1/entity
 *
 */
class BusinessPlanService extends APIbridge
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
        //Call company API
        $sessionData = BidxCommon::$staticSession;

        $bidxBusinessSummaryId = $sessionData->bidxBusinessSummaryId;

        $result = $this->callBidxAPI ($this->apiUrl . $bidxBusinessSummaryId, array (), 'GET');

        return $result;
    }

}

?>
