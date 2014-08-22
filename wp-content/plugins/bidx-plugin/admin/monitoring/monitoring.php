<?php

    require_once( BIDX_PLUGIN_DIR . '/../admin/admin.php' ); 
    
	//Create a page
	$admin_mon = new Bidx_Admin_Monitoring('edit.php',
									__('Monitoring','domain'),
									__('Monitoring','domain'), 
									'editor',
									'bidx_monitoring_page',
									'admin_body_content');

	//Define the body content for the page (if callback is specified above)
	function admin_body_content()
	{
		//echo 'Monitoring page contains the latest status of your portal.';
	
	}

	//Add metaboxes to the page
	add_action('add_meta_boxes','sh_example_metaboxes');
	
	function sh_example_metaboxes()
	{

		add_meta_box( 'Geo Location', __('Geo Location','bidx-plugin'), 'analytics_geo', null, 'normal', 'default' );
		
		add_meta_box( 'User Data', __('User Data','bidx-plugin'), 'analytics_user', null, 'normal', 'default' );	

		add_meta_box( 'Roles', __('User Roles','bidx-plugin'), 'analytics_roles', null, 'side' ,  'default' );

		add_meta_box( 'Registraions', __('Registrations','bidx-plugin'), 'analytics_registrations', null, 'side', 'default' );
		
		add_meta_box( 'Summaries', __('Business Summaries','bidx-plugin'), 'analytics_summaries', null, 'side', 'default' );	
		
		/* Add metaboxes help */
		get_current_screen()->add_help_tab( array(
			'id'      => 'How to use ? ',
			'title'   => __('Overview'),
			'content' =>
			'<p>' . __( 'This report gives overview of Registered Users, Business Summaries, Geographical data' ) . '</p>' 			
		) );

		get_current_screen()->set_help_sidebar(
			'<p><strong>' . __( 'View more links:' ) . '</strong></p>' .
			'<p>' . __( '<a href="/wp-admin/admin.php?page=getting-started" target="_blank">Getting started</a>' ) . '</p>' .
			'<p>' . __( '<a href="/wp-admin/admin.php?page=group-settings" target="_blank">Group Settings</a>' ) . '</p>'
		);
	}

	function analytics_geo()
	{
		$view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/../admin/monitoring/static/templates/' );        
        echo $view->render( 'country-geochart.phtml' );
	}	

	function analytics_user()
	{
		echo 'Inside analytics_user';
	}	

	function analytics_registrations()
	{
		echo 'Inside analytics_registrations';
	}	
	
	function analytics_roles()
	{
		//1. Template Rendering               
        $view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/../admin/monitoring/static/templates/' );        
        echo $view->render( 'userrole-piechart.phtml' );		

	}

	function analytics_summaries()
	{
		echo 'Inside roles';				

	}
	?>