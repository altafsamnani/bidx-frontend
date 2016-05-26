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
    function getWizehivesSubmissionData ( $memberData, $businessSummaryId, $view )
    {
        //Call entity API
        $results            =   array( );
        $member             =   $memberData->data->member;
        $bidxMemberProfile  =   $memberData->data->bidxMemberProfile;
        $personalDetails    =   $bidxMemberProfile->personalDetails; 
        $userId             =   $member->bidxMeta->bidxMemberId;
        $userEmail          =   $member->username;
        $address1           =   $personalDetails->address[0]->street.' '.$personalDetails->address[0]->streetNumber; 


        $id                 =   $userId;
        $first              =   $personalDetails->firstName;
        $last               =   $personalDetails->lastName;
        $email              =   $userEmail;

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
         'address1'         =>  $address1,
         'address2'         =>  '',
         'city'             =>  $personalDetails->address[0]->cityTown,
         'state'            =>  'Not known',           
         'zip'              =>  $personalDetails->address[0]->postalCode,
         'country'          =>  $personalDetails->address[0]->country,
         'aicpa_member_id'  =>  $id
        );

        $timestamp = time();
        
        $token_data = $id . '|' . $email . '|' . $timestamp;
        
        $token_key = '2238c1b2da7541f88ba560bc81fd7bff';
        $token = hash_hmac('sha1', $token_data , $token_key);

       /* echo "<pre>"; 
        print_r($wizehivesUserMapping); 
        print_r($wizehivesFormMapping); 
        echo $token;
        echo "</pre>";*/ 

        /*$wizehivesUserMapping = array(
         'id' => '121',
         'name' => 'Sam Wich1',
         'first' => 'Sam12',
         'last' => 'Wich12',
         'email' => 'samwich132335@deli.com',
        );


        $timestamp = time();
        $token_data = $wizehivesUserMapping['id'] . '|' . $wizehivesUserMapping['email'] . '|' . $timestamp;
        $token_key = '2238c1b2da7541f88ba560bc81fd7bff';
        $token = hash_hmac('sha1', $token_data , $token_key);
        $form = json_encode(array());

        $wizehivesFormMapping = array(
         'first' => 'Sam12',
         'last' => 'Wich12',
         'email' => 'samwich132335@deli.com',
         'address1' => '1 Turkey Lane',
         'address2' => '',
         'city' => 'Rye',
         'state' => 'MA',
         'zip' => '01234',
         'country' => 'US',
         'aicpa_member_id' => '121',
        );

        echo "<pre>"; 
        print_r($wizehivesUserMapping); 
        print_r($wizehivesFormMapping); 
        echo $token;
        echo "</pre>";exit;


        //$timestamp          =   time( );

        //$inputData          =   $businessSummaryId . '|' . $userId . '|' . $userEmail ;
        
        //$token              =   hash_hmac('sha1', $tokenData , $this->tokenKey);
        //$token              =   $this->encrypt( $inputData,  $this->tokenKey, $this->iv, $this->bitCheck  );
        //$token              =   base64_encode($inputData);

        /*$results            =   array( 
                                'user'      =>  $wizehivesUserMapping,
                                'form'      =>  $wizehivesFormMapping,
                                'timestamp' =>  $timestamp,
                                'token'     =>  $token
                                );*/ 

        $results            =   array( 
                                'user'      =>  urlencode(json_encode($wizehivesUserMapping)),
                                'form'      =>  urlencode(json_encode($wizehivesFormMapping)),
                                'timestamp' =>  $timestamp,
                                'token'     =>  $token
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

        return $tagResults;
    }
}

?>
