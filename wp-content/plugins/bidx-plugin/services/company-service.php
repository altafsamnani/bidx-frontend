<?php

/**
 * Session service that returns a list of session variables.
 *
 * @author Arne de Bree
 * @version 1.0
 * @link http://bidx.net/api/v1/company
 *
 */
class CompanyService extends APIbridge {

  /**
   * Constructs the API bridge.
   * Needed for operational logging.
   */
  public function __construct() {
    parent :: __construct();
  }

  /**
   * Retrieve the details of a single company
   *
   * @param integer $companyId
   *
   * @return object company details
   */
  function getCompanyDetails( $companyId ) {

    //Call company API
    $result = $this->callBidxAPI('company/' . $companyId, array(), 'GET');

    error_log( var_export( $result , true ));

    return $result->data;
  }
}

?>
