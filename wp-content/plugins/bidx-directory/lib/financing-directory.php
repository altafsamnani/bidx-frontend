<?php


/**
 * Created by PhpStorm.
 * User: Bilel BARHOUMI
 * Email: infobilel@gmail.com
 * Date: 15/02/2016
 * Time: 12:59
 */
class FinancingDirectory {

	public function __construct() {
		add_action( 'plugins_loaded', array( 'PageTemplate', 'get_instance' ) );

		$facility = new Facility();
		new FacilityUpdate();
		$organisation = new Organisation();

		add_filter( 'cron_schedules', array( $this, 'add_cron_schedules' ) );

		add_action( 'send_update_facilities_hook', array( $facility, 'send_update_facilities_function' ) );
		add_action( 'sanitize_title_facilities', array( $facility, 'sanitize_title_facilities_function' ) );
		add_action( 'sanitize_title_organisations', array( $organisation, 'sanitize_title_organisations_function' ) );

		add_action( 'admin_menu', array( $this, 'fin_dir_menu' ) );
	}

	/**
	 * Initialize database object initialization.
	 * Flush rewrite rules to ensure connecting the Organisation in the right manner
	 */
	function load() {
		update_option( 'findir_cron_active', 0 );
		update_option( 'findir_cron_frequency', 'every_three_months' );
	}

	/**
	 * Hide the custom post type (do not remove)
	 */
	function unload() {
		wp_clear_scheduled_hook( 'send_update_facilities_hook' );
		delete_option( 'findir_cron_active' );
		delete_option( 'findir_cron_frequency' );
	}

	function add_cron_schedules( $schedules ) {

		$schedules['every_three_months'] = array(
			'interval' => 3 * 30 * 24 * 60 * 60,
			'display'  => __( 'Every 3 Months', 'ibs-plugin' )
		);
		$schedules['every_two_months']   = array(
			'interval' => 2 * 30 * 24 * 60 * 60,
			'display'  => __( 'Every 2 Months', 'ibs-plugin' )
		);
		$schedules['every_month']        = array(
			'interval' => 30 * 24 * 60 * 60,
			'display'  => __( 'Every Month', 'ibs-plugin' )
		);
		$schedules['every_ten_minutes']  = array(
			'interval' => 3 * 60,
			'display'  => __( 'Every 10 Minutes', 'ibs-plugin' )
		);

		return $schedules;
	}

	function fin_dir_menu() {
		add_menu_page( 'Financing Directory Setting', 'Financing Directory', 'manage_options', 'fin_dir_admin_menu', array(
			$this,
			'fin_dir_options'
		) );
		add_submenu_page( 'fin_dir_admin_menu', 'Read Me', 'Read Me', 'manage_options', 'fin_dir_admin_menu_readme', array(
			$this,
			'fin_dir_readme'
		) );
	}

	function fin_dir_options() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
		}

		?>
		<div id='icon-edit' class='icon32 icon32-posts-post'><br></div>
		<h2>Financing Directory Setting</h2>
		<form method='post' name="cron">
			<div class='metabox-holder'>
				<div id='categorydiv' class='postbox'>
					<div class='handlediv' title='Click to toggle'><br></div>
					<h3 class='hndle'><span>Send automatic update requests</span></h3>
					<br/>
					<?php
					$cron_active_name    = 'findir_cron_active';
					$cron_email          = 'findir_cron_email';
					$cron_frequency_name = 'findir_cron_frequency';
					$cron_test_mode      = 'findir_cron_test_mode';

					if ( isset( $_POST['cron-test-mode'] ) ) {
						$opt_test = 1;
					} else {
						$opt_test = 0;
					}
					update_option( $cron_test_mode, $opt_test );
					if ( isset( $_POST['cron-frequency'] ) ) {
						if ( isset( $_POST['cron-active-email'] ) ) {
							$opt_email = $_POST['cron-active-email'];
							update_option( $cron_email, $opt_email );
						}
						$old_opt    = get_option( $cron_active_name );
						$opt_active = 0;
						if ( isset( $_POST['cron-active'] ) ) {
							$opt_active = 1;
						}

						$opt_frequency = $_POST['cron-frequency'];
						update_option( $cron_frequency_name, $opt_frequency );

						if ( $opt_active && $old_opt != $opt_active ) {
							$delay['every_ten_minutes']  = 3 * 60;
							$delay['every_month']        = 30 * 24 * 60 * 60;
							$delay['every_two_months']   = 2 * 30 * 24 * 60 * 60;
							$delay['every_three_months'] = 3 * 30 * 24 * 60 * 60;

							update_option( $cron_active_name, $opt_active );
							wp_schedule_event( time() + $delay[ $opt_frequency ], $opt_frequency, 'send_update_facilities_hook' );
						} else if ( ! $opt_active && $old_opt != $opt_active ) {
							wp_clear_scheduled_hook( 'send_update_facilities_hook' );
							update_option( $cron_active_name, $opt_active );
						}
						?>
						<div class="updated"><p><strong><?php _e( 'settings saved.', 'menu-test' ); ?></strong></p>
						</div>
						<br/>
						<?php
					}

					?>

					<?php if ( get_option( $cron_active_name ) ) {
						$timestamp = wp_next_scheduled( 'send_update_facilities_hook' );
						?>
						<div class="notice notice-success"><p>
								<strong><?php _e( 'Next scheduled process: ', 'menu-test' );
									echo date_i18n( get_option( 'date_format' ), $timestamp ) . ' ' .
									     date_i18n( get_option( 'time_format' ), $timestamp, false ) ?></strong>
							</p></div>
					<?php } else { ?>
						<div class="notice notice-warning"><p>
								<strong><?php _e( 'This function is disabled. ', 'menu-test' ); ?></strong>
							</p></div>
					<?php } ?>
					<br/>

					<div class='inside'>
						<div id='taxonomy-category' class='categorydiv'>

							<div class='label'>
								<label class='selectit'>
									<input <?php echo get_option( $cron_test_mode ) ? 'checked' : ''; ?>
										value='1' type='checkbox' name='cron-test-mode' id='cron-test-mode'>
									Test mode
								</label>
							</div>
							<br>

							<div class='label'>
								<label class='selectit'>
									<input <?php echo ( get_option( $cron_active_name ) ) ? 'checked' : ''; ?>
										value='1' type='checkbox' name='cron-active' id='cron-active'>
									Do you want to activate sending automatic update requests ?
								</label>
							</div>

							<p>
								<label for="cron-frequency"><?php _e( 'Frequency', 'ibs-plugin' ) ?></label>
								<select name="cron-frequency" id="cron-frequency">
									<?php if ( $opt_test ) { ?>
										<option value="every_ten_minutes"> Every 3 minutes</option>
									<?php } ?>
									<option value="every_month"> Every month</option>
									<option value="every_two_months"> Every 2 months</option>
									<option value="every_three_months"> Every 3 months</option>
								</select>
							</p>
							<?php if ( $opt_test ) { ?>
								<p>
									<label for="cron-frequency"><?php _e( 'Email to test', 'ibs-plugin' ) ?></label>
									<input value='<?php echo get_option( $cron_email ); ?>'
									       type='text' name='cron-active-email' id='cron-active-email'>
								</p>

								<br/>
							<?php } ?>
							<div class='buttonwrapper'>
								<input type='submit' name='action' value='Save' class='button button-primary'>

							</div>
						</div>
					</div>
				</div>
			</div>
		</form>
		<form method='post' name="sanitize">
			<div class='metabox-holder'>
				<div id='categorydiv' class='postbox'>
					<div class='handlediv' title='Click to toggle'><br></div>
					<h3 class='hndle'><span>Update facilities and organisations URLs</span></h3>
					<br/>
					<?php if ( isset( $_POST['sanitize-urls'] ) ) {
						do_action( 'sanitize_title_facilities' );
						do_action( 'sanitize_title_organisations' );
						?>
						<div class="updated"><p>
								<strong><?php _e( 'Facilities and organisations URLs have been updated.', 'menu-test' ); ?></strong>
							</p>
						</div>
						<br/>
					<?php } ?>


					<div class='inside'>
						<div id='taxonomy-category' class='categorydiv'>
							<div class='buttonwrapper'>
								<input type='submit' name='action' value='Update URLs' class='button button-primary'>
								<input type='hidden' name='sanitize-urls' value=''>

							</div>
						</div>
					</div>
				</div>
			</div>
		</form>
		<script>
			jQuery("#cron-frequency").val("<?php echo esc_attr(get_option($cron_frequency_name)) ?>");
		</script>
		<?php
	}

	function fin_dir_readme() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
		}

		?>
		<div id='icon-edit' class='icon32 icon32-posts-post'><br></div>
		<h2>Financing Directory</h2>
		<div class='metabox-holder'>
			<div id='categorydiv' class='postbox'>
				<div class='handlediv' title='Click to toggle'><br></div>
				<h3 class='hndle'><span>Manage Organisations</span></h3>
				<br/>

				<div class='inside'>
					<div id='taxonomy-category' class='categorydiv'>

					</div>
				</div>
			</div>
		</div>
		<div class='metabox-holder'>
			<div id='categorydiv' class='postbox'>
				<div class='handlediv' title='Click to toggle'><br></div>
				<h3 class='hndle'><span>Manage Facilities</span></h3>
				<br/>

				<div class='inside'>
					<div id='taxonomy-category' class='categorydiv'>

					</div>
				</div>
			</div>
		</div>
		<div class='metabox-holder'>
			<div id='categorydiv' class='postbox'>
				<div class='handlediv' title='Click to toggle'><br></div>
				<h3 class='hndle'><span>Update Facilities</span></h3>
				<br/>

				<div class='inside'>
					<div id='taxonomy-category' class='categorydiv'>

					</div>
				</div>
			</div>
		</div>
		<div class='metabox-holder'>
			<div id='categorydiv' class='postbox'>
				<div class='handlediv' title='Click to toggle'><br></div>
				<h3 class='hndle'><span>Setting up the automatic update requesting </span></h3>
				<br/>

				<div class='inside'>
					<div id='taxonomy-category' class='categorydiv'>

					</div>
				</div>
			</div>
		</div>
		<?php
	}

}