<?php



/**
 * @Author Altaf Samnani
 *  Session service that returns a list of session variables.
 *
 *
 */
class MemberService  extends APIbridge{

  public $memberUrl = 'members';

  public function __construct() {

    // Do stuff specific for Bar
  }

  /**
   * Checks if the user is logged in on the API
   * @Author Altaf Samnani
   * @link http://bidx.net/member/
   * @param boolean $serviceCheck define if a service check is needed or a simple check on the API cookie is sufficient.
   * In case of no API service check, the data in the Session profile will be very limited.
   * @return boolean if user is logged in
   */
  function getMemberDetails( ) {
    //Session Service
    //$sessionData = $this->isLoggedIn();
   $sessionData = BidxCommon::$staticSession;
   $memberId    = $sessionData->memberId;
   
    //Call member profile
    $result = $this->callBidxAPI($this->memberUrl . '/' . $memberId, array(), 'GET'); //.$memberId 4
    //If edit rights inject js and render edit button
 
    if ($result->data->bidxMemberProfile->bidxCanEdit) {
      $result->data->isMyProfile  = ($memberId == $sessionData->data->id) ? true : false;
    }
 
    return $result;
  }

}

?>
