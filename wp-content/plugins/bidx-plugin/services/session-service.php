<?php

require('api-bridge.php');

/**
 * @Author Altaf Samnani
 *  Session service that returns a list of session variables.
 * 
 *
 */
class SessionService extends APIBridge {

  private $apiUrl = 'session';


  public function __construct(){
    parent::__construct();
    // Do stuff specific for Bar
  }


	/**
	 * Checks if the user is logged in on the API
   * @Author Altaf Samnani
	 * @param boolean $serviceCheck define if a service check is needed or a simple check on the API cookie is sufficient.
	 * In case of no API service check, the data in the Session profile will be very limited.
	 * @return boolean if user is logged in
	 */	
	function isLoggedIn( )
	{
    $result = $this->callBidxAPI($this->apiUrl, array(), 'GET');
   
    // Will use it with Wordpress Action/theming
    //add_action( 'wp_head', array($this, 'inject_js_variables') );

    $resultDisplay = $this->inject_js_variables($result);

    return;
	}

  /**
	 * Injects Bidx Api response as JS variables
   * @Author Altaf Samnani
	 * @param Array $result bidx response as array
	 *
	 * @return String Injects js variables 
	 */
  function inject_js_variables( $result ) {
    $data = (isset($result->data)) ? json_encode($result->data) :'{}';

    //Set other data language/authenticated/
    unset($result->data);

    $otherData = json_encode($result);  

    echo " <script>
            var bidxConfig = bidxConfig || {};

            bidxConfig.context =  $data ; 

            /* Dump response of the session-api */
            bidxConfig.session = $otherData ;

            bidxConfig.authenticated = {$result->authenticated};
</script>";
            return;    
  
  }
	
}
?>
