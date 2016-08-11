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

    /*private $tokenKey          = '2238c1b2da7541f88ba560bc'; // 24 bit
 
    private $iv                = '81fd7bff';  // 8 bit

    private $bitCheck          = 8;*/

    /**
     * Constructs the API bridge.
     * Needed for operational logging.
     */
    private $apiUrl     =   'businesssummary/';

    private $submitUrl  =   'https://app.wizehive.com/appform/display';

    private $editUrl    =   'https://app.wizehive.com/appform/edit';

    private $printUrl   =   'https://app.wizehive.com/appform/print';

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
    function postSummaryDetails ( $businessSummaryId, $businessSummaryData )
    {
        //Call entity API
        $result = $this->callBidxAPI ($this->apiUrl . $businessSummaryId, $businessSummaryData, 'PUT');

        return $result;
    }


    /**
     * Retrieve the details of a single company
     *
     * @param integer $companyId
     *
     * @return object company details
     

    $user = array(
     'id' => '124144235235',
     'name' => 'Sam Wich',
     'first' => 'Sam',
     'last' => 'Wich',
     'email' => 'samwich13335@deli.com',
    );
    */

    function getWizehivesBpData()
    {

    }

    function getWizehivesMemberData()
    {

    }


    function getWizehivesSubmissionData ( $memberData, $bpData )
    {
        //Call entity API
        $results                    =   array( );
        $member                     =   $memberData->member;
        $bidxMemberProfile          =   $memberData->bidxMemberProfile;
        $personalDetails            =   $bidxMemberProfile->personalDetails; 
        $userId                     =   $member->bidxMeta->bidxMemberId;
        $userEmail                  =   $member->username;
        $address1                   =   $personalDetails->address[0]->street.' '.$personalDetails->address[0]->streetNumber; 



        $id                         =   $userId;
        $first                      =   $personalDetails->firstName;
        $last                       =   $personalDetails->lastName;
        $email                      =   $userEmail;

        $conactDetail               =   $personalDetails->contactDetail[0];
        $landline                   =   $conactDetail->landLine;
        $mobile                     =   $contactDetail->mobile;
        $nationality                =   $personalDetails->nationality;
        $gender                     =   ( $personalDetails->gender == 'f' ) ? 'female' : 'male';


        $businessSummaryId          =   $bpData->bidxMeta->bidxEntityId;
        $wizehivesUrl               =   $this->submitUrl;

        $btnLabel                   =   __('Apply to GACC', 'bidxplugin');

        $integrationObj             =   isset( $memberData->member->integrations ) ? $memberData->member->integrations : false ;

        $integrations               =  (array) $integrationObj;
        
        
        $integrations               =  NULL; 
        /*
        if( $integrations ) // TEST
        {
            $integrations['wizehive.submission.id']     =   '3396837';  
            $integrations['wizehive.businessplan.id']   =   '10175';  
            $integrations['wizehive.submission.final']  =   false;  
        }*/


        $integrationSubmissionId    =  $integrations['wizehive.submission.id']   ;

        $integrationsId             =  $integrations['wizehive.businessplan.id'] ;

        $integrationStatus          =  $integrations['wizehive.submission.final'];

        $integrationSubmissionIdUrl =  ($integrationSubmissionId) ? '/'.$integrationSubmissionId : '';
        
        if( $integrationsId == $businessSummaryId  )
        { 
            $btnLabel       =  'Print GACC' ;

            $wizehivesUrl   =  $this->printUrl;

            if( $integrationStatus === 'false' ) 
            {
                $btnLabel       =   'Submit to GACC' ;

                $wizehivesUrl   =    $this->editUrl;
            }
        }


        $wizehiveSlug       =   get_option('bidx-wizehive-slug');

        $actionUrl          =   $wizehivesUrl.'/'.$wizehiveSlug.$integrationSubmissionIdUrl;

        $wizehivesBpMapping   =   array(
         'id'                   => $businessSummaryId,
         'title'                => $bpData->name,
         'country'              => implode( $bpData->countryOperation, ", "),
         'stageOfBusiness'      => $bpData->stageBusiness,
         'yearSalesStarted'     => $bpData->yearSalesStarted,
         'financialSummaries'   => json_decode(json_encode($bpData->financialSummaries), true)

        );

        $wizehivesUserMapping   =   array(
         'id'       => $id,
         'name'     => $member->displayName,
         'first'    => $first,
         'last'     => $last,
         'email'    => $email
        );

        $wizehivesFormMapping   = array(
         'first'            =>  $first,
         'last'             =>  $last,
         'email'            =>  $email,
         'landline'         =>  $landline,
         'mobile'           =>  $mobile,
         'gender'           =>  $gender,
         'nationality'      =>  $nationality,
         'address1'         =>  $address1,
         'address2'         =>  '',
         'city'             =>  $personalDetails->address[0]->cityTown,
         'state'            =>  'Not known',           
         'zip'              =>  $personalDetails->address[0]->postalCode,
         'country'          =>  $personalDetails->address[0]->country,
         'aicpa_member_id'  =>  $id,
         'business'         =>  $wizehivesBpMapping 
        );

        $timestamp = time();
        
        $token_data = $id . '|' . $email . '|' . $timestamp;
        
        $token_key = '2238c1b2da7541f88ba560bc81fd7bff';
        $token = hash_hmac('sha1', $token_data , $token_key);     


        $results            =   array( 
                                'actionurl' =>  $actionUrl,
                                'user'      =>  urlencode(json_encode($wizehivesUserMapping)),
                                //'business'  =>  urlencode(json_encode($wizehivesBpMapping)),
                                'form'      =>  urlencode(json_encode($wizehivesFormMapping)),
                                'timestamp' =>  $timestamp,
                                'token'     =>  $token,
                                'btnLabel'  =>  $btnLabel
                                ); 

        return $results;
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
        if( !empty( $bidxBusinessSummary ) )
        {    
            foreach( $bidxBusinessSummary as $businessSummaryId )
            {
                //$businessSummaryId  =   9066;
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
        }

        return $tagResults;
    }
}

?>
