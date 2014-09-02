<?php 
/**
 * Shows a counter.
 * Rules are:
 * - There must a defined competition
 * - Must have a valid end-date defined 
 * 
 * The counter can be added and configured as a widget.
 * It also can be used as shortcode [competition id="competition_id" size="scale"]
 * The competition_id should be a valid id else nothing is shown.
 * The scale is for making it bigger and smaller where standard is 1.0 and it can range from 0.2 to 2.0.
 * 
 * TODO : join two widgets and make type selector for function (informational / registration / call to action)
 * 
 * @author Jaap Gorjup
 */
class BidxCompetitionCounterWidget extends WP_Widget {
		
	private $COMPETITION_ID_KEY = 'competition_id';
	private $COMPETITION_LINK_KEY = 'competition_link';
	private $CLOCK_SIZE_KEY = 'clock-size';
	
	private $diff = 0;
	
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
	 * - Counter type (flipclock)
	 * 
	 * @param WP_Widget $instance
	 */
	function form( $instance ) {
		

		if ( $instance ) {
			$competition_id   = $instance[$this->COMPETITION_ID_KEY];
			$competition_link = $instance[$this->COMPETITION_LINK_KEY];
			$clock_size 	  = $instance[$this->CLOCK_SIZE_KEY];
		} else {
			$competition_id   = '';
			$competition_link = '';
			$clock_size 	  = 1.0;
			$style = 'fancy';
		}

		$competitions = BidxCompetition :: get_competitions_list();		//get list of competitions

		?>
    	<p>
            <label for="<?php echo $this->get_field_id( $this->COMPETITION_ID_KEY ); ?>"><?php _e('Select Competition:', 'bidx_competition'); ?></label>
			<select name="<?php echo $this->get_field_name( $this->COMPETITION_ID_KEY ) ?>" id="<?php echo $this->get_field_id( $this->COMPETITION_ID_KEY ) ?>">
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
            <label for="<?php echo $this->get_field_id( 'clock_size' ); ?>"><?php _e( 'Size of the countdown clock:', 'bidx_competition' ); ?></label>
			<select name="<?php echo $this->get_field_name( 'clock_size' ) ?>" id="<?php echo $this->get_field_id( 'clock_size' ) ?>">
			<?php 
				$sizes = array( 
					__( 'small',  'bidx_competition' ) => '0.3',
					__( 'medium', 'bidx_competition' ) => '0.5',
					__( 'normal', 'bidx_competition' ) => '1.0',
					__( 'large',  'bidx_competition' ) => '1.3'		
				);
				foreach ( $sizes as $key => $value ) {
					printf(
						'<option value="%s" %s >%s</option>',
						$value,
						$value == $clock_size ? 'selected="selected"' : '',
						$key
					);
				}
			?>			
			</select>
		</p>
		<p>
            <label for="<?php echo $this->get_field_id( 'style' ); ?>"><?php _e( 'Clock Style:', 'bidx_competition' ); ?></label>
			<select name="<?php echo $this->get_field_name( 'style' ) ?>" id="<?php echo $this->get_field_id( 'style' ) ?>">
			<?php 
				$styles = array( 
					__( 'Fancy', 'bidx_competition' ) => 'fancy',
					__( 'Flat', 'bidx_competition' ) => 'flat',
				);
				foreach ( $styles as $key => $value ) {
					printf(
						'<option value="%s" %s >%s</option>',
						$value,
						$value == $style ? 'selected="selected"' : '',
						$key
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
		$instance[$this->COMPETITION_ID_KEY] = esc_sql( $new_instance[$this->COMPETITION_ID_KEY]);
		$instance[$this->COMPETITION_LINK_KEY] = esc_sql( $new_instance[$this->COMPETITION_LINK_KEY]);
		$instance[$this->CLOCK_SIZE_KEY] = esc_sql( $new_instance[$this->CLOCK_SIZE_KEY]);
		$instance['style'] = esc_sql( $new_instance['style']);
		return $instance;
	}
	 
	/**
	 * Output
	 * @param array $args arguments for input
	 * @param WP_Widget $instance instance of this widget
	 */
	function widget($args, $instance) {

		extract( $args );	
		$competition_id = $instance[$this->COMPETITION_ID_KEY];
		$competition_link = $instance[$this->COMPETITION_LINK_KEY];
		$clock_size = $instance[$this->CLOCK_SIZE_KEY];

		echo $before_widget;
		echo $this -> render_content( $competition_id, $clock_size, $competition_link, $style );
		echo $after_widget;
	}	
	
	/**
	 * Output rendering for the widget and for the shortcode
	 */
	function render_content( $competition_id, $clock_size='1.0', $competition_link=null, $style='fancy' ) {

		if ( empty( $competition_id ) ) {

			_e( 'No Competition Set','bidx_competition' );
		} else {

			$post = get_post($competition_id);
			if ($post -> post_type != 'competition') {
				_e( 'Defined post is not a competition','bidx_competition' );
			}
			$startdate = get_post_meta( $competition_id, 'competition_startdate', true );
			$enddate = get_post_meta( $competition_id, 'competition_enddate', true );	
			$this->diff = abs(strtotime($enddate) - time());	
			if ( $competition_link == null ) {
				$competition_link = get_permalink( $competition_id );
			}	
	?>
		<div class="competition <?php echo $style; ?>">
		<h3><?php echo $post -> post_title ?></h3>
		<p><?php echo $post -> post_excerpt ?></p>
		<div class="counter">
		<?php 
		if ($this->diff < 0) {
			?>
			<h4><?php _e( 'This competition has expired.','bidx_competition_plugin' ); ?></h4>
			<a href="/competition"><?php _e( 'Visit our competition overview.','bidx_competition_plugin' ); ?> </a><?php 
		} else {
			add_action( 'wp_print_footer_scripts', array( &$this, 'add_clock_footer_scripts' ) );			
			?>
			<link rel="stylesheet" href="<?php echo plugins_url() ?>/bidx-competition-plugin/js/flipclock/flipclock.css">
			<style>.your-clock { zoom: <?php echo $clock_size ?>; -moz-transform: scale(<?php echo $clock_size ?>) }</style>
			<div class="your-clock"></div>
		</div>			
			<?php 
		}	
		?>
		<a class="btn btn-secondary btn-block" href="<?php echo $competition_link; ?>">View Now</a>
		</div>
		<?php
		}
	}
	
	/**
	 * Adds the extra javascripts on the bottom for the FlipClock
	 */
	function add_clock_footer_scripts() {

		echo "<script src='".plugins_url() ."/bidx-competition-plugin/js/flipclock/flipclock.min.js'></script>";
		echo "<script>var clock = jQuery('.your-clock').FlipClock(". $this->diff .", { clockFace: 'DailyCounter', countdown: true });</script>";
	}
	
	/**
	 * Called when the shortcode is used with the following parameters :
	 * - id    : post_id
	 * - size  : relative size between 0.2 and 2
	 * - link  : optional link to override link to competition page
	 * 
	 * @param array $atts
	 */
	function handle_shortcode( $atts ) {

		$competition_id = $atts['id'];
		$clock_size = 0.5;
		$link = null;
		if ( isset ($atts['size'] ) ) {
			$clock_size = $atts['size'];
		}
		if ( isset ($atts['link'] ) ) {
			$link = $atts['link'];
		}	
		$this :: render_content( $competition_id, $clock_size, $link );
	}
	
}

/**
 * Allows registration for a competition from a page.
 * Rules are:
 * - Competition should still be active (in time)
 * - The user should not be registered, else it is a link to the competition info page en the business summary page.
 * 
 * Move this centrally in one Widget.
 * This widget also shows the Judge information
 * Clock can be sized to invisible
 * Various view templates can be chosen
 * 
 */
class BidxCompetitionRegistrationWidget extends WP_Widget {

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->WP_Widget (
				'bidx_competition_registration_widget',
				__('Registration Widget'),
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
		$competition_id = $instance['competition_id'];
		
		echo $before_widget;
		echo $this -> render_content( $competition_id );
		echo $after_widget;
	}	
	
	/**
	 * Render the output for the registration
	 * @param string $competition_id
	 */
	function render_content( $competition_id ) {

		//check if user is logged in --> link to login with link to status page
		if ( is_user_logged_in() ) {
			$user_id = ''; //get from environment
			$registration = new CompetitionRegistration( $competition_id );
			if ( $registration->is_user_in_competition( $user_id ) ) {
				_e( 'You have been registered for this competition.','bidx_competition' );			
			} else {								
				if ( isset( $_REQUEST['REGISTRATION'] ) ) {
					$registration->registerUser( $user_id );
					_e( 'Thank you for registering for this competition.','bidx_competition' );
				}
				else { 
				//	if 

					?><a class="btn btn-secondary btn-lg " href="?REGISTRATION"><?php _e( 'Register Now','bidx_competition' ) ?></a><?php 
									
				}			
			}
		}	
	}	
	
}


?>
