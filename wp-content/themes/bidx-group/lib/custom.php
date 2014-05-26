<?php


function theme_enqueue_styles() {
    wp_enqueue_style('bidx-group', get_stylesheet_directory_uri().'/assets/bootstrap-3.1.1/less/bootstrap.less');
    
    include_once( ABSPATH . 'wp-admin/includes/plugin.php' );
    if (is_plugin_active ('bidx-plugin/bidX-plugin.php'))
    {
        wp_enqueue_style('bidx-plugin', plugins_url().'/bidx-plugin/static/less/bidx.less');
    }
}
add_action('init', 'theme_enqueue_styles');

/**
 * Custom functions for Bidx
 *
 *
 */
/**
 * Applies the template replacement variables from Post vars
 *
 * @since April 16
 * @Author Altaf Samnani
 *
 * @param string $content  Template Content
 * @param string $content  Replaced Template Content
 */

require_once "class-wp-customize-control.php";

add_filter ('the_content', 'bidx_filter', 5);
add_filter('bidx', 'do_shortcode', 1);

function bidx_filter ($content)
{
    $formValues = $_POST;
    $hiddenElement = "";
    foreach ($formValues as $key => $value) {
        $varName = '[!' . strtoupper ($key) . '!]';
        if (strpos ($content, $varName)) {
            $content = str_replace ($varName, $value, $content);
        } else {
            $hiddenElement .= '<input type="hidden" name="' . $key . '" value="' . $value . '">';
        }
    }

    //Replace the redirect variable
    if (isset ($_GET['q'])) {
        $redirect = $_GET['q'];
        $content = str_replace ('[!Q!]', $redirect, $content);
    }

    //Replace the redirect variable
    if (isset ($_GET['q'])) {
        $redirect = $_GET['q'];
        $content = str_replace ('[!Q!]', $redirect, $content);
    }

    //echo $content;exit;
    //Add Status Messages if any
    //$content = bidx_get_status_msgs() . $content;

    // Add variables as hidden that cant be replaced from Post Variables to keep the previous state
    $content = str_replace ('</form>', $hiddenElement . '</form>', $content);

    // Debug the Get/Post params
    if (DOMAIN_CURRENT_SITE == 'bidx.dev') {

        // new dBug($_REQUEST);
    }

    return $content;
}


/**
 * Display Status Notifications.
 *
 * @author Altaf S
 * @since Jun 19 2013
 *
 *
 * @return string $statusMessages notification html
 * @access public
 * @example ?smsg = 4 &sparam=base64_enocde('key1=val1|key2=val2|key3=val3)
 * @Why keeping seperate because its run time and session clear in common.php because it needs before session call
   */
function bidx_get_status_msgs( ) {

    $statusMessages = '';
    $replaceString = NULL;
    //Add Error Status Msg
    if (isset ($_GET['emsg'])) {
        $textId = $_GET['emsg'];
        (!empty($_GET['eparam'])) ? $replaceString = base64_decode($_GET['eparam']) :'';
        $statusMsg = bidx_status_text ( $textId, $replaceString );
        $statusMessages = "<div class='alert alert-danger'>
                      <button data-dismiss='alert' class='close fa fa-times' type='button'></button>
                      {$statusMsg}
                    </div>";
       // $content = str_replace ('<!-- Msg -->', $statusMsgDiv, $content);
    }

    //Add Success Status Msg

    if (isset ($_GET['smsg'])) {
        $textId = $_GET['smsg'];
        (!empty($_GET['sparam'])) ? $replaceString = base64_decode($_GET['sparam']) :'';
        $statusMsg = bidx_status_text ( $textId, $replaceString );
        $statusMessages = "<div class='alert alert-success'>
                      <button data-dismiss='alert' class='close fa fa-times' type='button'></button>
                      {$statusMsg}
                    </div>";
        // $content = str_replace ('<!-- Msg -->', $statusMsgDiv, $content);
    }

    /* Message comes directly when we want to show error msg directly */
    if (isset ($_GET['edmsg'])) {

        $statusMessages = "<div class='alert alert-danger'>
                      <button data-dismiss='alert' class='close fa fa-times' type='button'></button>
                      ".base64_decode($_GET['edmsg']).
                      "</div>";

    }



    return $statusMessages;
}

/**
 * Getthe status notification text
 *
 * @author Altaf S
 * @since Jun 19 2013
 *
 * @param string $textId status notification id
 * @return string $statusMessages notification html
 * @access public
   */
function bidx_status_text ( $textId, $replaceString ) {

    switch($textId) {

    case '1' :
        $text = "Your session expired. Please login again, sorry for any inconvenience and appreciate your patience.";
        break;

    case '2' :
        $text = "Welcome in the group!";
        break;

    case '3' :
        $text = "Successfully left the group!";
        break;

    case '4' :
        $text = "Thank you! You are successful registered as a member of the bidX platform and this group. Feel free to browse around and see what <!--groupname--> can offer you.";
        break;

    case '5':
        $text = 'Successfully published!';
        break;
    case '6':
        $text = 'Request accepted!';
        break;
    case '7':
        $text = 'Request refused!';
        break;
    case '8':
        $text = 'You have successfully %action% the request!';
        break;


    default :
        $text = 'Add your notification message to custom.php with id ';

     }

     if( $replaceString ) {
         $keyValues = explode('|',$replaceString);
         foreach( $keyValues as $repValue) {
             $dispNote = explode("=", $repValue);
             $dispKey = '%'.$dispNote[0].'%';
             $dispVal = $dispNote[1];
             $text = str_replace($dispKey,$dispVal,$text);
         }

     }

    return $text;

}

/**
 * Function get_custom_field_value() - retrieves the custom
 *
 * If $i is not provided, grap single value from custom field
 * If $i has been provided and is less then arary count, get array value corresponding to index $i
 *
 * @param  string $key
 * @param  number $i
 *
 * @return string
 */
function get_custom_field_value ( $key,  $i = null)
{

    $single = !$i ? true : false;
    $result = get_post_meta( get_the_ID(), $key , $single );

    // if multiple customfields with the same key are requested
    //
    if ( !$single ) {
        if ( $i < count( $result) ) {
            $value = $result[ $i ];
        } else {
            $value = "Error, requested array index " .  $i . " does not exist";
        }
    // if only one custom field value is requested
    //
    } else {
        $value = $result;
    }

    return $value;
}



