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

	private $diff = 0;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->WP_Widget (
				'bidxplugin_counter_widget',
				__('Counter Widget'),
				array (
						'name' => ': : Bidx Competition Counter',
						'classname' => 'bidxplugin_counter_widget',
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
			$style			  = $instance['style'];
		} else {
			$competition_id   = '';
			$competition_link = '';
			$style = 'flat';
		}

		$competitions = BidxCompetition :: get_competitions_list();		//get list of competitions

?>
    	<p>
            <label for="<?php echo $this->get_field_id( $this->COMPETITION_ID_KEY ); ?>"><?php _e('Select Competition:', 'bidxplugin'); ?></label>
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
            <label for="<?php echo $this->get_field_id( 'style' ); ?>"><?php _e( 'Clock Style:', 'bidxplugin' ); ?></label>
			<select name="<?php echo $this->get_field_name( 'style' ) ?>" id="<?php echo $this->get_field_id( 'style' ) ?>">
<?php
				$styles = array(
					__( 'Flat', 'bidxplugin' ) => 'flat',
					__( 'Circle', 'bidxplugin' ) => 'circle',
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
            <label for="<?php echo $this->get_field_id('competition_link'); ?>"><?php _e('Alternative link to competition (optional):', 'bidxplugin'); ?></label>
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
		$instance[$this->COMPETITION_ID_KEY] = esc_sql( $new_instance[$this->COMPETITION_ID_KEY] );
		$instance[$this->COMPETITION_LINK_KEY] = esc_sql( $new_instance[$this->COMPETITION_LINK_KEY] );
		$instance['style'] = esc_sql( $new_instance['style'] );
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
		$style = $instance['style'];

		// Region Check
		$active_region = $args['id'];
        $add_container = false;
        if  ( ( $active_region === 'pub-front-top' || $active_region === 'priv-front-top' ) && get_theme_mod( 'front_top_width' ) !== true )
        {
            $add_container = true;
        }

        if  ( ( $active_region === 'pub-front-bottom' || $active_region === 'priv-front-bottom' ) && get_theme_mod( 'front_bottom_width' ) !== true )
        {
            $add_container = true;
        }

		echo $before_widget;

        if ( $add_container ) :
?>
            <div class="container">
<?php
        endif;

		echo $this -> render_content( $competition_id, $competition_link, $style );

        if ( $add_container ) :
?>
            </div>
<?php
        endif;

		echo $after_widget;
	}

	/**
	 * Output rendering for the widget and for the shortcode
	 */
	function render_content( $competition_id, $competition_link=null, $style='circle' ) {

		if ( empty( $competition_id ) )
		{
?>
            <div class="alert alert-danger">
                <blockquote>
                    <p><?php _e( 'No Competition Set','bidxplugin' ); ?></p>
                </blockquote>
                <p class="hide-overflow">
                    <span class="pull-left">
                        <?php _e('Sidebar', 'bidxplugin') ?>: <strong><?php echo $args['name']; ?></strong>&nbsp;
                    </span>
                    <span class="pull-right">
                        <?php _e('Widget', 'bidxplugin') ?>: <strong><?php echo $args['widget_name']; ?></strong>
                    </span>
                </p>
            </div>
<?php
		}
		else
		{
			if ( is_plugin_active( 'sitepress-multilingual-cms/sitepress.php') )
           	{
				$competition_id = wpml_get_content('post_competition', $competition_id );
			}

			$post = get_post($competition_id);

			if ($post -> post_type != 'competition')
			{
?>
	            <div class="alert alert-danger">
	                <blockquote>
	                    <p><?php _e( 'Defined post is not a competition','bidxplugin' ); ?></p>
	                </blockquote>
	                <p class="hide-overflow">
	                    <span class="pull-left">
	                        <?php _e('Sidebar', 'bidxplugin') ?>: <strong><?php echo $args['name']; ?></strong>&nbsp;
	                    </span>
	                    <span class="pull-right">
	                        <?php _e('Widget', 'bidxplugin') ?>: <strong><?php echo $args['widget_name']; ?></strong>
	                    </span>
	                </p>
	            </div>
<?php
			}
			$startdate = get_post_meta( $competition_id, 'competition_startdate', true );
			$enddate = get_post_meta( $competition_id, 'competition_enddate', true );
			$this->timestamp = strtotime($enddate);
			if ( $competition_link == null ) {
				$competition_link = get_permalink( $competition_id );
			}
?>
		<div class="competition">
		<h2><?php echo $post -> post_title ?></h2>
		<p><?php echo $post -> post_excerpt ?></p>
		<div class="counter hide-overflow text-center <?php echo $style ?>">
<?php
		if ( $this->timestamp < time() ) {
?>
            <div class="alert alert-warning">
                <strong><i class="fa fa-exclamation-triangle"></i> <?php _e( 'This competition has expired','bidxplugin' ); ?></strong>
            </div>
			<a class="btn btn-secondary btn-block" href="/competition"><?php _e( 'Visit our competition overview','bidxplugin' ); ?> </a><?php
		} else {
			add_action( 'wp_print_footer_scripts', array( &$this, 'add_clock_footer_scripts' ) );
			?>
			<div class="counter-block">
				<div class="days counter-number"></div>
				<div class="counter-text"><?php _e( 'DAYS','bidxplugin' ); ?></div>
			</div>
			<div class="counter-block">
				<div class="hours counter-number"></div>
				<div class="counter-text"><?php _e( 'HOURS','bidxplugin' ); ?></div>
			</div>
			<div class="counter-block">
				<div class="minutes counter-number"></div>
				<div class="counter-text"><?php _e( 'MINUTES','bidxplugin' ); ?></div>
			</div>
			<div class="counter-block">
				<div class="seconds counter-number"></div>
				<div class="counter-text"><?php _e( 'SECONDS','bidxplugin' ); ?></div>
			</div>
		</div>
		<a class="btn btn-secondary btn-block" href="<?php echo $competition_link; ?>"><?php _e( 'View Now','bidxplugin' ); ?></a>
<?php
		}
?>
		</div>
<?php
		}
	}

	/**
	 * Adds the extra javascripts on the bottom for the widget
	 */
	function add_clock_footer_scripts() {

		echo "<script src='//cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.2/moment.min.js'></script>";
		echo "<script>
				countdown();
				setInterval(countdown, 1000);

				function countdown ()
				{
					var now = moment(),
						then = moment.unix(".$this->timestamp."),

					ms = then.diff(now, 'milliseconds', true);
					days = Math.floor(moment.duration(ms).asDays());
					then = then.subtract('days', days);
					ms = then.diff(now, 'milliseconds', true);
					hours = Math.floor(moment.duration(ms).asHours());
					then = then.subtract('hours', hours);
					ms = then.diff(now, 'milliseconds', true);
					minutes = Math.floor(moment.duration(ms).asMinutes());
					then = then.subtract('minutes', minutes);
					ms = then.diff(now, 'milliseconds', true);
					seconds = Math.floor(moment.duration(ms).asSeconds());

					$('.counter .days').text(days);
					$('.counter .hours').text(hours);
					$('.counter .minutes').text(minutes);
					$('.counter .seconds').text(seconds);
				}

		</script>";
	}

	/**
	 * Called when the shortcode is used with the following parameters :
	 * - id    : post_id
	 * - size  : relative size between 0.2 and 2
	 * - link  : optional link to override link to competition page
	 * - style : circle or flat
	 * @param array $atts
	 */
	function handle_shortcode( $atts ) {

		$competition_id = $atts['id'];
		$link = null;
		if ( isset ($atts['link'] ) ) {
			$link = $atts['link'];
		}
		$this :: render_content( $competition_id, $link );
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
				'bidxplugin_registration_widget',
				__('Registration Widget'),
				array (
						'name' => ': : Bidx Competition Registration',
						'classname' => 'bidxplugin_registration_widget',
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
            <label for="<?php echo $this->get_field_id('competition_id'); ?>"><?php _e('Select Competition:', 'bidxplugin'); ?></label>
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
				_e( 'You have been registered for this competition.','bidxplugin' );
			} else {
				if ( isset( $_REQUEST['REGISTRATION'] ) ) {
					$registration->registerUser( $user_id );
					_e( 'Thank you for registering for this competition.','bidxplugin' );
				}
				else {
				//	if

					?><a class="btn btn-secondary btn-lg " href="?REGISTRATION"><?php _e( 'Register Now','bidxplugin' ) ?></a><?php

				}
			}
		}
	}

}


?>
