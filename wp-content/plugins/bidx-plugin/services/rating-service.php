<?php

/**
 * Rating service that returns the ratings for a given entity.
 *
 * @version 1.0
 * @link http://bidx.net/api/v1/rating
 *
 */
class RatingService extends APIbridge
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
     * Retrieve the rating of a single entity
     *
     * @param integer $entityId
     *
     * @return object rating details (more detailed when a Group Administrator or the owner of the entity makes the requests)
     */
    function getRating ( $businessSummaryId )
    {
        //Call entity API
        $result = $this->callBidxAPI ($this->apiUrl . $businessSummaryId . "/rating", array (), 'GET');

        return $result;
    }

}

?>
