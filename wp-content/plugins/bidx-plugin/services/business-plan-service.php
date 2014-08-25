<?php

/**
 * Entity service that returns details for business plans.
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
     * Retrieve the details of a single business plan summary
     *
     * @param integer $companyId
     *
     * @return object company details
     */
    function getSummaryDetails ()
    {
        //Call entity API
        $sessionData = BidxCommon::$staticSession;

        $bidxBusinessSummaryId = $sessionData->bidxBusinessSummaryId;

        $result = $this->callBidxAPI ($this->apiUrl . $bidxBusinessSummaryId, array (), 'GET');

        return $result;
    }

}

?>
