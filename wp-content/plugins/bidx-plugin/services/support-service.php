<?php

/**
 * Session service that returns a list of session variables.
 *
 * @author Altaf Samnani
 * @version 1.0
 * @link http://bidx.net/api/v1/entity
 *
 */

$zendeskFilePath = '/zendesk/zendesk-support.php';
require_once WP_PLUGIN_DIR . $zendeskFilePath  ;

class SupportService extends Zendesk_Support
{
    /**
     * Constructs the API bridge.
     * Needed for operational logging.
     */

    public $notices;

    private $logger;


    public function __construct ()
    {

        add_action( 'init', array( &$this, 'bidx_init' ) );
        parent :: __construct ();
        $this->logger = Logger::getLogger ("Support");

    }

    public function bidx_init()
    {
      global $zendesk_support;

      if( isset($_REQUEST['type']) && $_REQUEST['type'] == 'bidx-support' )
      {
        add_action( 'wp_enqueue_scripts', array( &$this, '_admin_print_styles' ) );

        $this->bidx_process_forms();
      }
      else
      {
        $this->bidx_admin_process_forms();
      }

    }

 /*
   * Helper: Is Agent
   *
   * A conditional function that returns true if the current or
   * specified Zendesk user is an agent, otherwise returns false,
   * meaning that it's probably an end-user.
   *
   */
  function bidx_is_agent( $user_ID = false ) {

    // Current user or a specific user ID.
    $zendesk_user = $user_ID ? get_user_meta( $user_ID, 'zendesk_user_options', true ) : $this->zendesk_user;

    if ( isset( $zendesk_user['roles'] ) && $zendesk_user['roles'] > 0 )
      return true;
    else
      return false;
  }

  /*
   * Form Processing
   *
   * This method is fired during admin init, does all the form
   * processing. Most of the forms are fired using the POST method,
   * although some (such as logout) can use the GET. GET should be
   * processed before post.
   *
   */
  private function bidx_admin_process_forms() {


    if ( isset( $_REQUEST['zendesk-logout'] ) && $this->zendesk_user ) {

      $page = admin_url('admin.php?page=support&zendesk-logout-success=true#support/mbx-inbox');
      $this->zendesk_user = false;
      delete_user_meta( $this->user->ID, 'zendesk_user_options' );
      wp_redirect( $page );
      die();
    }

    // Display a logout success message
    //if ( isset( $_REQUEST['zendesk-logout-success'] ) )
      //$this->bidx_add_notice( 'zendesk_login', __( 'You have successfully logged out of your Zendesk account.', 'zendesk' ), 'confirm' );

  }


  /*
   * Form Processing
   *
   * This method is fired during admin init, does all the form
   * processing. Most of the forms are fired using the POST method,
   * although some (such as logout) can use the GET. GET should be
   * processed before post.
   *
   */
  private function bidx_process_forms() {

    // Logout

    if ( isset( $_REQUEST['zendesk-logout'] ) && $this->zendesk_user ) {

      $page = '/support?zendesk-logout-success=true';
      $this->zendesk_user = false;
      delete_user_meta( $this->user->ID, 'zendesk_user_options' );
      wp_redirect( $page );
      die();
    }

    // Display a logout success message
    if ( isset( $_REQUEST['zendesk-logout-success'] ) )
      $this->bidx_add_notice( 'zendesk_login', __( 'You have successfully logged out of your Zendesk account.', 'zendesk' ), 'confirm' );


    // Change tickets view, probably never reached since an AJAX call
    // is more likely to respond to such a request. Lave this just in case.
    if ( isset( $_REQUEST['zendesk-tickets-change-view'] ) && is_numeric( $_REQUEST['zendesk-tickets-change-view'] ) && $this->zendesk_user ) {

      // Is somebody trying to cheat?
      if ( $this->bidx_get_bidx_user_widget() != 'tickets-widget' ) {
        $this->bidx_add_notice( 'zendesk_login', __( 'You are not allowed to view the tickets widget', 'zendesk' ), 'alert' );
        return;
      }

      // Fire a request to catch all available views.
      $requested_view = (int) $_REQUEST['zendesk-tickets-change-view'];
      $views = $this->api->get_views();

      if ( ! is_wp_error( $views ) ) {

        // Loop through the views and update the user meta.
        foreach ( $views as $view ) {
          if ( $view->id == $requested_view ) {
            $this->zendesk_user['default_view'] = array(
              'id' => $view->id,
              'title' => $view->title
            );

            // Update and redirect.
            update_user_meta( $this->user->ID, 'zendesk_user_options', $this->zendesk_user );
            wp_redirect( admin_url() );
            die();
          }
        }
      } else {
        // Views could not be fetched
        $this->bidx_add_notice( 'zendesk_tickets_widget', $views->get_error_message(), 'alert' );
        return;
      }
    }

    // Gather and validate some form data
    if ( ! isset( $_POST['zendesk-form-submit'], $_POST['zendesk-form-context'], $_POST['zendesk-form-data'] ) ) return;
    $context = $_POST['zendesk-form-context'];
    $form_data = $_POST['zendesk-form-data'];

    // Pick the right form processor
    switch ( $context ) {
      case 'login':
        if ( ! isset( $form_data['username'], $form_data['password'] ) ) {
          $this->bidx_add_notice( 'zendesk_login', __( 'All fields are required. Please try again.', 'zendesk' ), 'alert' );
          return;
        }

        $username = $form_data['username'];
        $password = $form_data['password'];

        $auth = $this->api->authenticate($username, $password);

        if ( ! is_wp_error( $auth ) ) {
          // Get the user views
          $views = $this->api->get_views();

          if ( ! is_wp_error( $views ) ) {
            $default_view = array_shift( $views );
          } else {
            $default_view = false;
            $default_view->id = 0;
            $default_view->title = __( 'My open requests', 'zendesk' );
          }

          // Since this is not a remote auth set remote_auth to
          // false.
          $this->zendesk_user = array(
            'username' => $username,
            'password' => $password,
            'roles' => $auth->roles,
            'default_view' => array(
              'id' => $default_view->id,
              'title' => $default_view->title,
            )
          );

          $this->bidx_add_notice( 'zendesk_login', sprintf( __( 'Howdy, <strong>%s</strong>! You are now logged in to Zendesk.', 'zendesk' ), $auth->name ), 'confirm' );

          update_user_meta( $this->user->ID, 'zendesk_user_options', $this->zendesk_user );
        } else {
          $this->bidx_add_notice( 'zendesk_login', $auth->get_error_message(), 'alert' );
        }

        break;

      case 'create-ticket':

        // Is somebody trying to cheat?
        if ( $this->bidx_get_bidx_user_widget() != 'contact-form' ) {
          $this->bidx_add_notice( 'zendesk_login', __( 'You are not allowed to view the contact form.', 'zendesk' ), 'alert' );
          return;
        }

        if ( ! isset( $form_data['summary'], $form_data['details'] ) ) {
          $this->bidx_add_notice( 'zendesk_contact_form', __( 'All fields are required. Please try again.', 'zendesk' ), 'alert' );
          return;
        }

        $summary = strip_tags( stripslashes( trim( $form_data['summary'] ) ) );
        $details = strip_tags( stripslashes( trim( $form_data['details'] ) ) );

        // Quick validation
        if ( empty( $summary ) || empty( $details ) ) {
          $this->bidx_add_notice( 'zendesk_contact_form', __( 'All fields are required. Please try again.', 'zendesk' ), 'alert' );
          return;
        }

        // Either tickets.json or requests.json based on user role.
        if ( $this->bidx_is_agent() ) {

          // Agent requests
          $response = $this->api->create_ticket( $summary, $details );

        } elseif ( ! $this->bidx_is_agent() && $this->zendesk_user ) {

          // End-users request (logged in)
          $response = $this->api->create_request( $summary, $details );

        } else {

          // Anonymous requests (if allowed in plugin settings)
          if ( $this->settings['contact_form_anonymous'] && $this->bidx_is_agent( $this->settings['contact_form_anonymous_user'] ) ) {

            // Find the agent to fire anonymous requests
            $agent = $this->_get_agent( $this->settings['contact_form_anonymous_user'] );

            // Make sure the agent is there and is an agent (again)
            if ( ! $agent ) {
              $this->bidx_add_notice( 'zendesk_contact_form', __( 'Something went wrong. We could not use the agent to fire this request.', 'zendesk' ), 'alert' );
              break;
            }

            // Awkwward!
            if ( $agent['username'] == $this->user->user_email ) {
              $this->bidx_add_notice( 'zendesk_contact_form', sprintf( __( 'Wow, you managed to fire a request "on behalf of" yourself! Why don\'t you <a href="%s">login first</a>?', 'zendesk' ), admin_url('?zendesk-login-form=true') ) , 'alert' );
              break;
            }

            // Clone the current API settings and change the authentication pair
            $api = clone $this->api;
            $api->authenticate( $agent['username'], $agent['password'], false );

            // Fire a new ticket using the current user's name and email, similar to comments to tickets thing.
            $response = $api->create_ticket( $summary, $details, $this->user->display_name, $this->user->user_email );

            // Get rid of the cloned object
            unset( $api );
          }
        }

        // Error handling
        if ( ! is_wp_error( $response ) ) {
          $this->bidx_add_notice( 'zendesk_contact_form', __( 'Your request has been created successfully!', 'zendesk' ), 'confirm' );
        } else {
          $this->bidx_add_notice( 'zendesk_contact_form', $response->get_error_message(), 'alert' );
        }

        break;
    }
  }

    /*
   * Dashboard Widget: Login
   *
   * The login dashboard widget, displayed to the users that are logged
   * in, but not into their Zendesk account. Zendesk account credentials
   * are kept in the zendesk_user_options user meta field in the database,
   * loaded during admin_init and could be accessed via $this->zendesk_user.
   *
   */
    public function bidx_dashboard_widget_login() {

    $type = ( isset($_REQUEST['page']) && $_REQUEST['page'] == 'support' ) ? 'bidx-admin-support' : 'bidx-support';

    ?>
    <div class="inside">
      <?php $this->do_bidx_notices( 'zendesk_login' ); ?>

      <!--<img height="85px" width="145px" class="zendesk-buddha" src="/wp-content/themes/bidx/assets/img/logo-desktop.png" alt="Zendesk" /> -->
      <p class="description"><?php _e( 'Use your Bidx support account credentials to log in the form below. Please note that these are not your WordPress username and password.', 'zendesk' ); ?></p>
      <form id="zendesk-login" method="post" >
        <input type="hidden" name="zendesk-form-submit" value="1" />
        <input type="hidden" name="zendesk-form-context" value="login" />
        <input type="hidden" name="type" value="<?php echo $type;?>" />
        <div>
          <label><?php _e( 'Username:', 'zendesk' ); ?></label>
          <input name="zendesk-form-data[username]" type="text" class="regular-text" value="<?php echo bloginfo('admin_email'); ?>" /><br />
        </div>
        <div>
          <label><?php _e( 'Password:', 'zendesk' ); ?></label>
          <input name="zendesk-form-data[password]" type="password" class="regular-text" />
        </div>
        <div class="submit">
          <input name="Submit" type="submit" class="button-primary" value="<?php esc_attr_e('Login to Bidx support', 'zendesk'); ?>" /><br />

        </div>
        <br class="clear" />
      </form>
    </div>
  <?php
  }

  /*
   * Dashboard Widget: Contact Form
   *
   * Displays the Contact Form widget in the dashboard. Upon processing,
   * a new ticket is created via the Zendesk API with the Summary and
   * Details filled out in this form. A logout link is also present.
   *
   */
  public function bidx_dashboard_widget_contact_form() {

    $type = ( isset($_REQUEST['page']) && $_REQUEST['page' == 'support'] ) ? 'bidx-admin-support' : 'bidx-support';

  ?>
    <div class="inside">
      <?php
        $this->do_bidx_notices( 'zendesk_login' );
        $this->do_bidx_notices( 'zendesk_contact_form' );
      ?>
      <form id="zendesk-contact-form" method="post" action="/support">
        <input type="hidden" name="zendesk-form-submit" value="1" />
        <input type="hidden" name="zendesk-form-context" value="create-ticket" />
        <input type="hidden" name="type" value="<?php echo $type;?>" />
        <p>
          <label><?php echo $this->settings['contact_form_summary']; ?></label>
          <input name="zendesk-form-data[summary]" class="large-text" type="text" />
        </p>

        <p>
          <label><?php echo $this->settings['contact_form_details']; ?></label>
          <textarea id="zendesk-contact-form-details" name="zendesk-form-data[details]" class="large-text" style="height: 10em;"></textarea>
        </p>

        <p class="submit">
          <input name="Submit" type="submit" class="button-primary" value="<?php echo esc_attr( trim( $this->settings['contact_form_submit'] ) ); ?>" />

          <?php if ( $this->zendesk_user ): ?>
            <?php printf( __( 'Logged in as <strong>%s</strong>', 'zendesk' ), $this->zendesk_user['username'] ); ?>

            <!-- (<a href="?zendesk-logout=true&type=bidx-support"><?php// _e( 'logout', 'zendesk' ); ?></a>) -->
          <?php endif; ?>



        </p>
        <br class="clear" />
      </form>
    </div>
  <?php
  }


  /*
   * Do Notices
   *
   * Process all the added notices for a specific context and output
   * them on screen using the _notice function. Loops through notes,
   * confirms and alerts for the given context.
   *
   */
  public function do_bidx_notices( $context ) {
    global $zendesk_support;
    echo '<div class="zendesk-notices-group">';
    foreach ( array( 'note', 'confirm', 'alert' ) as $type ) {
      if ( isset( $zendesk_support->notices[$context . '_' . $type] ) ) {
        $notices = $zendesk_support->notices[$context . '_' . $type];

        foreach ( $notices as $notice )
          $this->bidx_notice( $notice, $type );
      }
    }
    echo '</div>';
  }

  /*
   * Add Notice
   *
   * An internal function to add a notice to a specific context, where
   * contexts are "places" that display notice messages, such as
   * 'login_form' or 'tickets_widget'. The $text is the text to display
   * and the $type is either 'note', 'confirm', or 'alert' which
   * differs in colors when output.
   *
   */
  function bidx_add_notice( $context, $text, $type = 'note' ) {
    global $zendesk_support;


    if ( isset( $zendesk_support->notices[$context . '_' . $type] ) )
      $zendesk_support->notices[$context . '_' . $type][] = $text;
    else
      $zendesk_support->notices[$context . '_' . $type] = array( $text );
  }

  /*
   * Notice
   *
   * Prints the notice to screen given a certain $type, which can be
   * 'note', 'alert' and 'confirm' according to the stylesheets.
   *
   */
  public function bidx_notice( $text, $type = 'note' ) {
  ?>
    <div class="zendesk-admin-notice zendesk-<?php echo $type; ?>">
      <p><?php echo $text; ?></p>
    </div>
  <?php
  }



  /* Bidx Zend Desk Support Functions */
function addBidxZendDisplay ($bidx_widget_options)
{
   // global $this->notices;
   // $this->notices = (isset($this->notices)) ? $this->notices : array();
    global $zendesk_support;
    $this->notices = (isset($zendesk_support->notices)) ? $zendesk_support->notices:NULL;

    $widget_options = $this->bidx_get_bidx_user_widget( $bidx_widget_options );

    //echo $widget_options;exit;
    // If the plugin hasn't been configured yet.
    if ( ! isset( $this->settings['account'] ) || empty( $this->settings['account'] ) && $widget_options != 'none' ) {
     // wp_add_dashboard_widget( 'zendesk-dashboard-widget', __( 'Zendesk Support', 'zendesk' ), array( &$this, '_dashboard_widget_config' ) );

      return $this->_dashboard_widget_config();
    }

    if ( ! $this->zendesk_user && $widget_options == 'contact-form' && $this->settings['contact_form_anonymous'] && $this->bidx_is_agent( $this->settings['contact_form_anonymous_user'] ) ) {
      //wp_add_dashboard_widget( 'zendesk-dashboard-widget', $this->settings['contact_form_title'], array( &$this, 'bidx_dashboard_widget_contact_form' ) );
      return $this->bidx_dashboard_widget_contact_form();

    }

    if ( ! $this->zendesk_user && $widget_options != 'none'  ) {
      //wp_add_dashboard_widget( 'zendesk-dashboard-widget', __( 'Zendesk Support Login', 'zendesk' ), array( &$this, 'bidx_dashboard_widget_login' ) );
      return $this->bidx_dashboard_widget_login();

    } else {
      // Based on user role and the plugin settings.
      switch ( $widget_options ) {
        case 'contact-form':
          //wp_add_dashboard_widget( 'zendesk-dashboard-widget', $this->settings['contact_form_title'], array( &$this, 'bidx_dashboard_widget_contact_form' ) );
          return $this->bidx_dashboard_widget_contact_form();
          break;

        case 'tickets-widget':
          //wp_add_dashboard_widget( 'zendesk-dashboard-widget', __( 'Zendesk for WordPress', 'zendesk' ), array( &$this, '_dashboard_widget_tickets' ) );
          return $this->_dashboard_widget_tickets();
          break;
      }
    }
  }


  /*
   * Get Current User Dashboard Widget (helper)
   *
   * Internal function, returns the current user's dashboard widget
   * settings based on his or her role and the plugin settings. The
   * returned string is 'tickets-widget', 'contact-form' or 'none'.
   *
   */
  public function bidx_get_bidx_user_widget( $bidx_widget_options = 'contact-form'  ) {
    //$current_user = wp_get_current_user ();

    /*if (in_array (WP_ADMIN_ROLE, $current_user->roles) || in_array (WP_OWNER_ROLE, $current_user->roles)) {

       $this->settings["dashboard_{WP_ADMIN_ROLE}"] = $this->settings['dashboard_administrator'];
       $this->settings["dashboard_{WP_OWNER_ROLE}"] = $this->settings['dashboard_administrator'];
       return $this->settings['dashboard_administrator'];

    } else if ( in_array (WP_MEMBER_ROLE, $current_user->roles) || in_array (WP_ANONYMOUS_ROLE, $current_user->roles)){

      return $this->settings['dashboard_subscriber'];

    }*/
   // $this->settings['dashboard_administrator'] = 'tickets-widget';
    $this->settings["dashboard_{WP_ADMIN_ROLE}"] = $bidx_widget_options;
    $this->settings["dashboard_{WP_OWNER_ROLE}"] = $bidx_widget_options;
    return $this->settings["dashboard_{WP_OWNER_ROLE}"];

    //return 'none';
  }


  public function bidx_zendesk_forced_login( $username, $password) {

    if ( ! $this->zendesk_user ) {

    $auth = $this->api->authenticate($username, $password);

    if ( ! is_wp_error( $auth ) ) {
      // Get the user views
      $views = $this->api->get_views();

      if ( ! is_wp_error( $views ) ) {
        $default_view = array_shift( $views );
      } else {
        $default_view = false;
        $default_view->id = 0;
        $default_view->title = __( 'My open requests', 'zendesk' );
      }

      // Since this is not a remote auth set remote_auth to
      // false.
      $this->zendesk_user = array(
        'username' => $username,
        'password' => $password,
        'roles' => $auth->roles,
        'default_view' => array(
          'id' => $default_view->id,
          'title' => $default_view->title,
        )
      );

      //$this->bidx_add_notice( 'zendesk_login', sprintf( __( 'Howdy, <strong>%s</strong>! You are now logged in to Zendesk.', 'zendesk' ), $auth->name ), 'confirm' );
      update_user_meta( $this->user->ID, 'zendesk_user_options', $this->zendesk_user );
    }

  }
}

}
?>
