<?php
/**
 * 
 * @author Jaap Gorjup
 * @version 1.0
 */

class LastMembersWidget extends WP_Widget {
	
	/**
	 * Register widget with WordPress.
	 */
	public function __construct($widget_id, $widget_name) {
		parent::__construct( $widget_id, $widget_name,
				array( 'description' => 'Shows the last members of a group', ) 
		);
	}
	
	/**
	 * Front-end display of widget.
	 *
	 * @see WP_Widget::widget()
	 * @param array $args     Widget arguments.
	 * @param array $instance Saved values from database.
	 */
	public function widget( $args, $instance ) {
		extract( $args );
		$title = apply_filters( 'widget_title', $instance['title'] );
	
		echo $before_widget;
		if ( ! empty( $title ) )
			echo $before_title . $title . $after_title;

		require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
		$view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/group/static/templates/' );
		$view->sessionData = BidxCommon::$staticSession;
		
		require_once( BIDX_PLUGIN_DIR . '/../services/group-service.php' );
		$groupSvc = new GroupService( );
		$view->members = $groupSvc->getLatestMembers(  );
		echo $view->render( 'lastMembers.phtml' ); 
		
		echo $after_widget;
	}

}
?>