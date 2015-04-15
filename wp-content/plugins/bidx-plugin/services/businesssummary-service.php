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

    function isHavingCompetitionRole ( $businessSummaryData )
    {


        $loggedInUserIsBpAssessor           =   false;
        $loggedInUserIsBpJudge              =   false;
        $loggedInUserIsCompetitionAssessor  =   false;
        $loggedInUserIsCompetitionJudge     =   false;
        $roleData                           =   array();

        $competitionsData           =  $businessSummaryData->bidxMeta->bidxCompetitions;

        foreach( $competitionsData as $competition )
        {
            /*Check is having Judge Role */
            $competitionMeta            =   $competition->bidxMeta;
            $competitionRoles           =   $competitionMeta->bidxCompetitionRoles;
            $competitionApplications    =   $competition->applications;
            $competitionData            =   array(  'id'    => $competitionMeta->bidxCompetitionId
                                            ,       'name'  => $competition->name );

            if( in_array( 'COMPETITION_ASSESSOR' , $competitionRoles) )
            {
                $loggedInUserIsCompetitionAssessor  =  true;
                $roleData[ 'loggedInUserIsCompetitionAssessor' ][ ] = $competitionData;
            }

            if( in_array( 'COMPETITION_JUDGE' , $competitionRoles) )
            {
                $loggedInUserIsCompetitionJudge  =  true;
                $roleData[ 'loggedInUserIsCompetitionJudge' ][ ] = $competitionData;

            }

            /*Check is having Assesor Role */
            if( !empty($competitionApplications) )
            {
                foreach( $competitionApplications as $application )
                {
                    if(!empty($application) && $application->entityId ==  $businessSummaryData->bidxMeta->bidxEntityId) // Though it will be always same, just to make sure adding this condition
                    {
                        $applicationBidxMeta         =   $application->bidxMeta;

                        if($applicationBidxMeta->bidxCompetitionCanAssess)
                        {
                            $loggedInUserIsBpAssessor   =   true;
                            $roleData[ 'loggedInUserIsBpAssessor' ][ ] = $competitionData;
                        }

                        if($applicationBidxMeta->bidxCompetitionCanJudge)
                        {
                            $loggedInUserIsBpJudge      =   true;
                            $roleData[ 'loggedInUserIsBpJudge' ][ ] = $competitionData;
                        }
                    }

                }

            }

        }

        $competitionRoles   =   array(  'loggedInUserIsCompetitionAssessor' =>  $loggedInUserIsCompetitionAssessor
                                    ,   'loggedInUserIsCompetitionJudge'    =>  $loggedInUserIsCompetitionJudge
                                    ,   'loggedInUserIsBpAssessor'          =>  $loggedInUserIsBpAssessor
                                    ,   'loggedInUserIsBpJudge'             =>  $loggedInUserIsBpJudge  );

        $result             =   array(  'competitionRoles'  =>  $competitionRoles
                                    ,   'roleData'          =>  $roleData

                                );

        return $result;
    }

}

?>
