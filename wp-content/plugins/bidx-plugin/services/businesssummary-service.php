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
    private $apiUrl = 'businesssummary/';

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
    function getSummaryDetails ( $businessSummaryId )
    {
        //Call entity API
        $result = $this->callBidxAPI ($this->apiUrl . $businessSummaryId, array (), 'GET');

        return $result;
    }

    /**
     * Retrieve the details of a single company
     *
     * @param integer $companyId
     *
     * @return object company details
     */
    function getExpressFormSubmission ( $bidxBusinessSummary )
    {
        //Call entity API
        $tagResults     =   false;
        foreach( $bidxBusinessSummary as $businessSummaryId )
        {
            $businessSummaryId  =   9066;
            $result             =   $this->callBidxAPI ($this->apiUrl . $businessSummaryId, array (), 'GET');
            $bidxMeta           =   $result->data->bidxMeta;

            if(isset($bidxMeta->tagAssignmentSummary))
            {
                $tagAssignmentSummary = $bidxMeta->tagAssignmentSummary;
                foreach( $tagAssignmentSummary as $valueTag)
                {
                    if($valueTag->tagId === 'mekar')
                    {
                        $tagResults     =   $result;
                        break;
                    }
                }

                if( $tagResults )
                {
                    break;
                }

            }
        }

        return $tagResults;
    }
}

?>
