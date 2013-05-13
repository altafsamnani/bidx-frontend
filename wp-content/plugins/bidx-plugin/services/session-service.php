<?php

require('api-bridge.php');

/**
 * @Author Altaf Samnani
 *  Session service that returns a list of session variables.
 * 
 *
 */
class SessionService extends APIBridge {

  public $sessionUrl = 'session';

  private $data;

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
	function isLoggedIn(  )
	{
    $this->sessionData = $this->callBidxAPI($this->sessionUrl, array(), 'GET');

   // $data->membersId = $sessionData->data->id;
   // $data->bidxGroupDomain = $sessionData->bidxGroupDomain;
    
    $this->data->membersId = $this->sessionData->data->id;
    $this->data->bidxGroupDomain = $this->sessionData->bidxGroupDomain;

    //Add JS Variables for Frontend
    $resultDisplay = $this->injectJsVariables();//

    // Will use it with Wordpress Action/theming
    //dd_action( 'wp_head', array($this, 'injectJsVariables') );
     
    return $this->sessionData;
	}

 /**
	 * Injects Bidx Api response as JS variables
   * @Author Altaf Samnani
	 * @param Array $result bidx response as array
	 *
	 * @return String Injects js variables
	 */
  function injectJsVariables(  ) {

    //Session Response data
    $jsSessionVars = (isset($this->sessionData->data)) ? json_encode($this->sessionData->data) :'{}';

    //Api Resposne data
    $jsApiVars = (isset($this->data)) ? json_encode($this->data) :'{}';



    $scriptJs = " <head><script>
            var bidxConfig = bidxConfig || {};

            bidxConfig.context =  $jsApiVars ;

            /* Dump response of the session-api */
            bidxConfig.session = $jsSessionVars ;

            bidxConfig.authenticated = {$this->sessionData->authenticated};
</script></head>";
    echo $scriptJs;
    return;
    //eturn $scriptJs;


  }
}
?>
