<?php 
/**
 * Shows a counter.
 * Rules are:
 * - There must a defined competition
 * - Must have a valid end-date defined 
 * 
 * @author Jaap Gorjup
 */
class BidxCompetitionCounterWidget extends WP_Widget {
	
	/**
	 * Constructor
	 */
	public function __construct() {
		$this->WP_Widget (
				'bidx_competition_counter_widget',
				__('Counter Widget'),
				array (
						'name' => ': : Bidx Competition Counter',
						'classname' => 'bidx_competition_counter_widget',
						'description' => __( 'Add a expiration clock for your competition' )
				)
		);		
	}	
	
	/**
	 * Maintenance of the widget. The following fields can be set in the admin:
	 * - Name of the competition (if none show error)
	 * - Counter type (seconds, hours, days)
	 * - Competition link (optional)
	 * 
	 * 
	 * @param WP_Widget $instance
	 */
	function form( $instance ) {
		?>
	        <p><?php _e( 'No configuration options available', 'bidx_competition_plugin'); ?></p>
		<?php
	} 	
	

	/**
	 * Stores the value of the widget
	 * @param WP_Widget $new_instance
	 * @param WP_Widget $old_instance
	 * @return WP_Widget
	 */
	function update( $new_instance, $old_instance ) {
		$instance = $old_instance;
		$instance['competition_id'] = esc_sql( $new_instance['competition_id']);
		$instance['counter_type'] = esc_sql( $new_instance['counter_type']);
		$instance['competition_link'] = esc_sql( $new_instance['competition_link']);
		return $instance;
	}
	 
	/**
	 * Output
	 * @param array $args arguments for input
	 * @param WP_Widget $instance instance of this widget
	 */
	function widget($args, $instance) {
		extract( $args );	
		$competition_id = $args['competition_id'];

		
		echo $before_widget;
		?>
		<h3><?php _e('Countdown','bidx_competition_plugin');?></h3>
		<?php
		echo $after_widget;
	}	
}

/**
 * Allows registration for a competition from a page.
 * Rules are:
 * - Competition should still be active (in time)
 * - The user should not be registered, else it is a link to the competition info page en the business summary page.
 * - 
 */
class BidxCompetitionRegistrationWidget extends WP_Widget {

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->WP_Widget (
				'bidx_competition_registration_widget',
				__('Counter Widget'),
				array (
						'name' => ': : Bidx Competition Registration',
						'classname' => 'bidx_competition_registration_widget',
						'description' => __( 'Provides quick registration to a competition' )
				)
		);
	}
	
	/**
	 * Maintenance of the widget
	 * @param WP_Widget $instance
	 */
	function form( $instance ) {
		?>
	        <p><?php _e( 'No configuration options available', 'bidx_competition_plugin'); ?></p>
		<?php
	} 	
	

	/**
	 * Stores the value of the widget
	 * @param WP_Widget $new_instance
	 * @param WP_Widget $old_instance
	 * @return WP_Widget
	 */
	function update( $new_instance, $old_instance ) {
		$instance = $old_instance;
		$instance['competition_code'] = esc_sql( $new_instance['competition_code']);
		return $instance;
	}
	 
	/**
	 * Output
	 * @param array $args arguments for input
	 * @param WP_Widget $instance instance of this widget
	 */
	function widget($args, $instance) {
		extract( $args );		 
		echo $before_widget;
	
	
		echo $after_widget;
	}	
	
}


?>