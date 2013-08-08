<?php

/**
 * Session service that returns a list of session variables.
 *
 * @author Altaf Samnani
 * @version 1.0
 * @link http://bidx.net/api/v1/member
 *
 */
class MemberService extends APIbridge {

  /**
   * Constructs the API bridge.
   * Needed for operational logging.
   */
  public function __construct() {
    parent :: __construct();
  }

  /**
   * Checks if the user is logged in on the API
   *
   * @param boolean $serviceCheck define if a service check is needed or a simple check on the API cookie is sufficient.
   * In case of no API service check, the data in the Session profile will be very limited.
   * @return boolean if user is logged in
   */
  function getMemberDetails() {

    $sessionData = BidxCommon::$staticSession;
    $memberId = $sessionData->memberId;

    //Call member profile
    $result = $this->callBidxAPI('members/' . $memberId, array(), 'GET');
    //If edit rights inject js and render edit button
    $result->data->isMyProfile = false;
    if (!empty($result->data->bidxMemberProfile->bidxCanEdit) && !empty($result->data) && ($memberId == $sessionData->data->id) ) {
      $result->data->isMyProfile = true;
    }

    $return = $this->processMemberDetails($result, $sessionData);

    return $return;
  }

  function processMemberDetails ( $result, $sessionData ) {
    $groupDetails = (!empty($result->data->groups)) ? $result->data->groups : array();
    $bidXGroupDomain = $result->bidxGroupDomain;
    $sessionGroups = (!empty($sessionData->data->groups)) ? $sessionData->data->groups : NULL;
    $loggedInGroups = (array) $sessionGroups;
    $loggedInGroupKeys = array_keys($loggedInGroups);
    $groupInfo = NULL;
    foreach ($groupDetails as $groupKey => $groupValue) {
      //Group Info

      // New API has wrapped all it's data into a 'bidxMeta' block
      // Below is for keeping it backwards/forwards compatible
      //
      $meta = isset( $groupValue->bidxMeta ) ? $groupValue->bidxMeta : $groupValue;

      $bidxGroupUrlVal = $this->getBidxSubdomain(false, $meta->bidxGroupUrl );


      if ($bidxGroupUrlVal == $bidXGroupDomain) {
         $groupInfo->groupName    = $groupValue->name;
         $groupInfo->slogan       = isset( $groupValue->slogan )      ? $groupValue->slogan       : "";
         $groupInfo->description  = isset( $groupValue->description ) ? $groupValue->description  : "";
         $groupInfo->logo         = isset( $groupValue->logo )        ? $groupValue->logo         : "";

         $result->data->groupInfo = $groupInfo;
      }

      //Join Link
       if(!$result->data->isMyProfile) {
        $groupDetails->{$groupKey}->join  = (in_array($groupKey,$loggedInGroupKeys)) ? false : true;
       }

    }


    $result->data->groups = $groupDetails;

    $entityDetails = (!empty($result->data->entities)) ? $result->data->entities : array();

    foreach ( $entityDetails as $entityKey => $entityValue) {

      // New API has wrapped all it's data into a 'bidxMeta' block
      // Below is for keeping it backwards/forwards compatible
      //
      $entityMeta = isset( $entityValue->bidxMeta ) ? $entityValue->bidxMeta : $entityValue;

      if($entityMeta->bidxEntityType == 'bidxBusinessSummary') {
        $resultEntity = $this->callBidxAPI('entity/' . $entityMeta->bidxEntityId, array(), 'GET');
        $rowValues = array('Tagline',
          'Summary',
          'Industry',
          'Location');
        $result->data->wp->entities->bidxBusinessSummary = $resultEntity->data;
      }

    }

    return $result;

  }

}

?>
