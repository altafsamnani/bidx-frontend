<?php
/**
 * Authentication and registration content loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @author Altaf Samnani (ajax functions)
 * @author msp (js app)
 * @version 1.0
 */
class auth {

	/**
	 * Constructor
	 * Registers hooks for ajax requests and security related material
	 * Also registers the scripts for auth.
	 */

    static $deps = array ('jquery', 'bootstrap', 'underscore', 'backbone', 'json2', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-data', 'bidx-i18n',
                        'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods', 'bidx-location','chosen','bidx-tagsinput','bidx-chosen');


	function __construct() {

		add_action( 'wp_enqueue_scripts', array( &$this, 'register_auth_bidx_ui_libs' ) );
	}

	/**
	 * Load the scripts and css belonging to this function
	 */
	function register_auth_bidx_ui_libs() {

        wp_register_script( 'registration',  plugins_url( 'static/js/group-registration.js',    __FILE__ ), array(), '20130501', TRUE );
        wp_register_script( 'join', plugins_url( 'static/js/join.js', __FILE__ ), $deps, '20140710', TRUE );

        $deps = array_merge( self :: $deps, array( 'registration', 'join' ) );

        wp_register_script( 'auth', plugins_url( 'static/js/auth.js', __FILE__ ), $deps, '20130501', TRUE );

	}

	/**
	 * Load the content.
	 * Dynamic action needs to be added here
	 * @param $atts
	 */
	function load($atts) {

		// 1. Template Rendering
		require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
		$view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/auth/templates/' );
		// 2. Determine the view needed

		$command = $atts['view'];
        $type    = array_key_exists( 'type', $atts ) ? $atts['type'] : null;

        $view->showRegisterLink = true;
        $view->showLoginLink = true;
        $render = $command;

        // we need to activate a new account and check the token provided
        //
        if ( $command === "activate" ) {

            // check if code has been provided
            //
            $activationCode = isset( $_GET[ "code" ] ) ? $_GET["code"]  : "";


            if ( $activationCode !== "" ) {

                // do the session call
                //
                require_once( BIDX_PLUGIN_DIR .'/../services/session-service.php' );
                $sessionObj = new SessionService( );

                $result = $sessionObj -> getActivationSession( $activationCode );


                // if sessionState is pending, redirect to setpassword
                //
                if ( isset ( $result -> data -> SessionState ) && ( $result -> data -> SessionState === "PendingInitialPasswordSet" || $result -> data -> SessionState === "PendingPasswordReset"  ) ) {

                    $redirect_url = '/setpassword/';

                } elseif ( isset ( $result -> code ) && $result -> code === "activationTokenExpired" ) {

                    $redirect_url = '/setpassword/#setpassword/expired';

                } else {
                    // THIS NEEDS TO GET SOME DECENT ERROR HANDLING
                    //
                    echo "<H1>Ooops, something went wrong</H1>";
                    echo $result -> text;
                    die();
                }
                // do the redirect
                //
                header ("Location: $redirect_url");

            } else {
                // catchall kinda page...
                //
                echo "<H1>Ooops, something went wrong</H1>";
                echo "No activation token received.";
                die();
            }



        } else {
            require_once( BIDX_PLUGIN_DIR . '/../services/group-service.php' );
            $groupSvc = new GroupService( );
            $view->groupNotification = (!empty($atts['name'])) ? $atts['name']: 'we';
            $view->group = $groupSvc->getGroupDetails();
            $view->render( $render . '.phtml' );
        }



	}
}

?>
