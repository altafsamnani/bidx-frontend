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
		add_shortcode( 'competition', array( $this, 'handle_shortcode' ) );
	}	
	
	/**
	 * Maintenance of the widget. The following fields can be set in the admin:
	 * - Name of the competition (if none show error)
	 * - Competition link (optional)
	 * 
	 * 
	 * @param WP_Widget $instance
	 */
	function form( $instance ) {
		
		if ( $instance )
		{
			$competition_id = $instance['competition_id'];
			$competition_link = $instance['competition_link'];
		}
		else
		{
			$competition_id = '';
			$competition_link = '';
		}
		//get list of competitions
		$competitions = BidxCompetition :: get_competitions_list();
		//check if competitions exist
		?>
    	<p>
            <label for="<?php echo $this->get_field_id('competition_id'); ?>"><?php _e('Select Competition:', 'bidx_competition'); ?></label>
			<select name="<?php echo $this->get_field_name('competition_id') ?>" id="<?php echo $this->get_field_id('competition_id') ?>">
			<?php 
            foreach ( $competitions->posts as $competition) {
                printf(
                    '<option value="%s" %s >%s</option>',
                    $competition->ID,
                    $competition->ID == $competition_id ? 'selected="selected"' : '',
                    $competition->post_title
                );
            }
            ?>
            </select>
        </p>
    	<p>
            <label for="<?php echo $this->get_field_id('competition_link'); ?>"><?php _e('Alternative link to competition (optional):', 'bidx_competition'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('competition_link'); ?>" name="<?php echo $this->get_field_name('competition_link'); ?>" type="text" value="<?php echo $competition_link; ?>" />
        </p>        
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
		$competition_id = $instance['competition_id'];
		$competition_link = $instance['competition_link'];
		
		echo $before_widget;
		
		if ( empty( $competition_id ) ) {
			_e('No Competition Set','bidx_competition');
		}
		else {
			$startdate = get_post_meta( $competition_id, 'competition_startdate', true );
			$enddate = get_post_meta( $competition_id, 'competition_enddate', true );
			$post = get_post($competition_id);		
			
			$diff = abs(strtotime($enddate) - time());

			//strip the link to make it relative from the website root
			
		?>
		<div class="well">
		<h3><?php _e('Competition','bidx_competition_plugin');?></h3>
		<div class="bidx countdown-title ">
			<a class="btn" href="<?php echo get_permalink( $competition_id ); ?>"><?php echo $post -> post_title ?></a>
		</div>
		<div class="bidx countdown-time">
			<h4><?php 
			if ($diff < 0) {
				_e( 'This competition has expired.','bidx_competition_plugin' );
				?><a href="#"><?php _e( 'Visit our competition overview.','bidx_competition_plugin' ); ?> </a><?php 
			}
			else
			{
				$years = floor($diff / (365*60*60*24));
				$months = floor(($diff - $years * 365*60*60*24) / (30*60*60*24));
				$days = floor(($diff - $years * 365*60*60*24 - $months*30*60*60*24)/ (60*60*24));
				
				_e( 'You have','bidx_competition_plugin' );
				
				echo '<div>';
				if ( $years > 0 ) {
					echo ' '.$years. ' ';
					if ( $years > 1 ) {
						_e( 'Years','bidx_competition_plugin' );
					} else {
						_e( 'Year','bidx_competition_plugin' );
					}
				}
				if ( $months > 0 ) {
					echo ' '.$months. ' ';
					_e( 'Months','bidx_competition_plugin' );
				}
				if ( $days > 0 ) {
					echo ' '.$days. ' ';
					_e( 'Days','bidx_competition_plugin' );
				}
				echo '</div>';
				_e( 'left to join','bidx_competition_plugin' );
			}	
			?>
			</h4>
			<a class="btn btn-secondary btn-lg pull-right" href="<?php echo get_permalink( $competition_id ); ?>">View Now</a>
		</div>
		
		<?php
		}
		echo '</div>';
		echo $after_widget;
	}	
	
	/**
	 * Output rendering for the widget and for the shortcode
	 */
	function render_content( $competition_id, $competition_link='' ) {

	if ( empty( $competition_id ) ) {
		_e('No Competition Set','bidx_competition');
	}
	else {
		$startdate = get_post_meta( $competition_id, 'competition_startdate', true );
		$enddate = get_post_meta( $competition_id, 'competition_enddate', true );
		$post = get_post($competition_id);		
		$diff = abs(strtotime($enddate) - time());

	//strip the link to make it relative from the website root
		
	?>
		<div class="well">
		<h3><?php _e('Competition','bidx_competition_plugin');?></h3>
		<div class="bidx countdown-title ">
			<a class="btn" href="<?php echo get_permalink( $competition_id ); ?>"><?php echo $post -> post_title ?></a>
		</div>
		<div class="bidx countdown-time">
			<h4><?php 
			if ($diff < 0) {
				_e( 'This competition has expired.','bidx_competition_plugin' );
				?><a href="#"><?php _e( 'Visit our competition overview.','bidx_competition_plugin' ); ?> </a><?php 
			}
			else
			{
				$years = floor($diff / (365*60*60*24));
				$months = floor(($diff - $years * 365*60*60*24) / (30*60*60*24));
				$days = floor(($diff - $years * 365*60*60*24 - $months*30*60*60*24)/ (60*60*24));
				
				_e( 'You have','bidx_competition_plugin' );
				
				echo '<div>';
				if ( $years > 0 ) {
					echo ' '.$years. ' ';
					if ( $years > 1 ) {
						_e( 'Years','bidx_competition_plugin' );
					} else {
						_e( 'Year','bidx_competition_plugin' );
					}
				}
				if ( $months > 0 ) {
					echo ' '.$months. ' ';
					_e( 'Months','bidx_competition_plugin' );
				}
				if ( $days > 0 ) {
					echo ' '.$days. ' ';
					_e( 'Days','bidx_competition_plugin' );
				}
				echo '</div>';
				_e( 'left to join','bidx_competition_plugin' );
			}	
			?>
			</h4>
			<a class="btn btn-secondary btn-lg pull-right" href="<?php echo get_permalink( $competition_id ); ?>">View Now</a>
		</div>
		
		<?php
		}
		echo '</div>';
	}
	
	/**
	 * Called when the shortcode is used
	 * @param array $atts
	 */
	function handle_shortcode( $atts ) {
		$competition_id = $atts['id'];
		$this :: render_content( $competition_id );
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
	        <p><?php _e( 'No configuration options available', 'bidx_competition'); ?></p>
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
		?>
		<p><?php _e( 'No configuration options available', 'bidx_competition'); ?></p>
		<?php 
		echo $after_widget;
	}	
	
}


?>