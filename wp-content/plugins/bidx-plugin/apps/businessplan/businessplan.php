<?php

/**
 * Search class loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @version 1.0
 */
class businessplan {

  static $deps = array('jquery', 'jquery-ui', 'bootstrap', 'underscore', 'backbone', 'json2',
    'gmaps-places', 'holder', 'bidx-form',
    'bidx-utils', 'bidx-api-core', 'bidx-common');

  /**
   * Constructor
   */
  function __construct() {
    add_action('wp_enqueue_scripts', array(&$this, 'register_businessplan_bidx_ui_libs'));
  }

  /**
   * Load the scripts and css belonging to this function
   */
  function register_businessplan_bidx_ui_libs() {

    wp_register_script('businessplan', plugins_url('static/js/businessplan.js', __FILE__), self :: $deps, '20130501', TRUE);
    wp_register_style('businessplan', plugins_url('static/css/businessplan.css', __FILE__), array(), '20130501', 'all');
    wp_enqueue_style('businessplan');
  }

  /**
   * Load the content.
   * Dynamic action needs to be added here
   * @param $atts
   */
  function load($atts) {

    /* 1 Template Rendering */
    require_once(BIDX_PLUGIN_DIR . '/templatelibrary.php');
    $view = new TemplateLibrary(BIDX_PLUGIN_DIR . '/businessplan/templates/');

    /* 2. Service MemberProfile */
    require_once( BIDX_PLUGIN_DIR . '/../services/business-plan-service.php' );
    $bpSummaryObj = new BusinessPlanService( );

    /* 3. Render Member Profile Services for Initial View Display */
    $summaryData = $bpSummaryObj->getSummaryDetails( );

    $view->data = $summaryData->data;

    $view->render('summary.phtml');
  }

}

?>
