<?php

/**
 * Created by PhpStorm.
 * User: Bilel BARHOUMI
 * Email: infobilel@gmail.com
 * Date: 18/02/2016
 * Time: 10:30
 */
class FacilityUpdate {
	/** constants for the Facility **/
	const POST_TYPE_FACILITY_UPDATE = 'facility_update';

	public function __construct() {
		add_action( 'add_meta_boxes', array( $this, 'facility_update_add_meta_boxes' ) );

		add_action( 'save_post', array( $this, 'facility_update_save_meta_box_data' ) );
		add_action( 'init', array( $this, 'create_facility_update' ) );

		add_filter( 'redirect_post_location', array( $this, 'facility_redirect_post_location') );

	}


	/**
	 * Create the custom post describing the facility_update
	 */
	function create_facility_update() {

		$args = array(
			'label'               => __( 'post_type', 'ibs-plugin' ),
			'description'         => __( 'Facility update definition', 'ibs-plugin' ),
			'labels'              => array(
				'name'               => _x( 'Facilities update', 'Facilities update', 'ibs-plugin' ),
				'singular_name'      => _x( 'Facility update', 'Facility update', 'ibs-plugin' ),
				'menu_name'          => __( 'Facilities updates', 'ibs-plugin' ),
				'parent_item_colon'  => __( 'Parent Items:', 'ibs-plugin' ),
				'all_items'          => __( 'All Facilities Update', 'ibs-plugin' ),
				'view_item'          => __( 'View Facility Update', 'ibs-plugin' ),
				'add_new_item'       => __( 'Add New Facility', 'ibs-plugin' ),
				'add_new'            => __( 'Add New', 'ibs-plugin' ),
				'edit_item'          => __( 'Edit Facility', 'ibs-plugin' ),
				'update_item'        => __( 'Update Facility', 'ibs-plugin' ),
				'search_items'       => __( 'Search Facility', 'ibs-plugin' ),
				'not_found'          => __( 'Facility not found', 'ibs-plugin' ),
				'not_found_in_trash' => __( 'Facility not found in Trash', 'ibs-plugin' ),
			),
			'supports'            => array(
				'title'
			),
			'hierarchical'        => true,
			'public'              => false,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_nav_menus'   => true,
			'show_in_admin_bar'   => true,
			'menu_position'       => 40,
			'menu_icon'           => 'dashicons-megaphone',
			'can_export'          => true,
			'has_archive'         => false,
			'exclude_from_search' => true,
			'publicly_queryable'  => false,
			'capability_type'     => 'post',
			'capabilities'        => array(
				'create_posts' => 'do_not_allow',
			),
		);
		register_post_type( self::POST_TYPE_FACILITY_UPDATE, $args );
	}

	function facility_update_add_meta_boxes( $post ) {
		$this->facility_update_add_meta_box();
	}

	/**
	 * Adds a box to the main column on the Post and Page edit screens.
	 */
	function facility_update_add_meta_box() {
		add_meta_box(
			'facility_update_sectionid',
			__( 'Facility Details', 'ibs-plugin' ),
			array( $this, 'meta_box_callback' ),
			$this:: POST_TYPE_FACILITY_UPDATE,
			'normal'
		);
	}

	/**
	 * Prints the box content.
	 *
	 * @param WP_Post $post The object for the current post/page.
	 */
	function meta_box_callback( $post ) {

		// Add an nonce field so we can check for it later. facility_update_meta_box_nonce
		wp_nonce_field( 'facility_update_meta_box', 'facility_update_meta_box_nonce' );

		$sector                  = get_post_meta( $post->ID, 'facility_update_sector', true );
		$operational_region      = get_post_meta( $post->ID, 'facility_update_operational_region', true );
		$organizational_type     = get_post_meta( $post->ID, 'facility_update_organizational_type', true );
		$financing_type          = get_post_meta( $post->ID, 'facility_update_financing_type', true );
		$funding_sources         = get_post_meta( $post->ID, 'facility_update_funding_sources', true );
		$stage                   = get_post_meta( $post->ID, 'facility_update_stage', true );
		$assets_under_management = get_post_meta( $post->ID, 'facility_update_assets_under_management', true );
		$min_investment          = get_post_meta( $post->ID, 'facility_update_min_investment', true );
		$max_investment          = get_post_meta( $post->ID, 'facility_update_max_investment', true );
		$currency                = get_post_meta( $post->ID, 'facility_update_currency', true );
		$num_financed_projects   = get_post_meta( $post->ID, 'facility_update_num_financed_projects', true );
		$total_investment        = get_post_meta( $post->ID, 'facility_update_total_investment', true );
		$website                 = get_post_meta( $post->ID, 'facility_update_website', true );
		$email                   = get_post_meta( $post->ID, 'facility_update_email', true );
		$phone                   = get_post_meta( $post->ID, 'facility_update_phone', true );
		$description             = get_post_meta( $post->ID, 'facility_update_description', true );
		$sustainability          = get_post_meta( $post->ID, 'facility_update_sustainability', true );
		$established             = get_post_meta( $post->ID, 'facility_update_established', true );
		$active_time             = get_post_meta( $post->ID, 'facility_update_active_time', true );

		?>
		<p><?php _e( 'These settings are needed for an facility.', 'bidx-facility_update' ) ?></p>
		<p>
			<label for="facility_update_sector"><?php _e( 'Sector', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_update_sector"
			           value="<?php echo esc_attr( $sector ) ?>"/>
		</p>
		<p>
			<label for="facility_update_operational_region"><?php _e( 'Operational Regions', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_update_operational_region"
			           value="<?php echo esc_attr( $operational_region ) ?>"/>
		</p>
		<p>
			<label for="facility_update_organizational_type"><?php _e( 'Organizational Type', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_update_organizational_type"
			           value="<?php echo esc_attr( $organizational_type ) ?>"/>
		</p>
		<p>
			<label for="facility_update_financing_type"><?php _e( 'Financing Type', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_update_financing_type"
			           value="<?php echo esc_attr( $financing_type ) ?>"/>
		</p>
		<p>
			<label for="facility_update_funding_sources"><?php _e( 'Funding Sources', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_update_funding_sources"
			           value="<?php echo esc_attr( $funding_sources ) ?>"/>
		</p>
		<p>
			<label for="facility_update_stage"><?php _e( 'Stage', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_update_stage"
			           value="<?php echo esc_attr( $stage ) ?>"/>
		</p>
		<p>
			<label
				for="facility_update_assets_under_management"><?php _e( 'Assets under management', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="number" name="facility_update_assets_under_management"
			           value="<?php echo esc_attr( $assets_under_management ) ?>"/>
		</p>
		<p>
			<label for="facility_update_min_investment"><?php _e( 'Minimum Investment', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="number" name="facility_update_min_investment"
			           value="<?php echo esc_attr( $min_investment ) ?>"/>
		</p>
		<p>
			<label for="facility_update_max_investment"><?php _e( 'Maximum Investment', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="number" name="facility_update_max_investment"
			           value="<?php echo esc_attr( $max_investment ) ?>"/>
		</p>
		<p>
			<label for="facility_update_currency"><?php _e( 'Currency', 'ibs-plugin' ) ?></label>
			<br>
			<select style="width:100%" name="facility_update_currency" id="facility_update_currency">
				<?php include_once 'currency.php' ?>
			</select>
		</p>
		<p>
			<label
				for="facility_update_num_financed_projects"><?php _e( 'N. Financed projects', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="number" name="facility_update_num_financed_projects"
			           value="<?php echo esc_attr( $num_financed_projects ) ?>"/>
		</p>
		<p>
			<label for="facility_update_total_investment"><?php _e( 'Total Investment', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="number" name="facility_update_total_investment"
			           value="<?php echo esc_attr( $total_investment ) ?>"/>
		</p>
		<p>
			<label for="facility_update_website"><?php _e( 'Website', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_update_website"
			           value="<?php echo esc_attr( $website ) ?>"/>
		</p>
		<p>
			<label for="facility_update_email"><?php _e( 'Email', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_update_email"
			           value="<?php echo esc_attr( $email ) ?>"/>
		</p>
		<p>
			<label for="facility_update_phone"><?php _e( 'Phone', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_update_phone"
			           value="<?php echo esc_attr( $phone ) ?>"/>
		</p>
		<p>
			<label for="facility_update_description"><?php _e( 'Description', 'ibs-plugin' ) ?></label>
			<br><textarea style="width:100%" type="text" name="facility_update_description"
			><?php echo esc_attr( $description ) ?></textarea>
		</p>
		<p>
			<label for="facility_update_sustainability"><?php _e( 'Sustainability ', 'ibs-plugin' ) ?></label>
			<br><textarea style="width:100%" type="text" name="facility_update_sustainability"
			><?php echo esc_attr( $sustainability ) ?></textarea>
		</p>
		<p>
			<label for="facility_update_established"><?php _e( 'Established', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_update_established"
			           value="<?php echo esc_attr( $established ) ?>"/>
		</p>
		<p>
			<label for="facility_update_active_time"><?php _e( 'Active time period of a fund', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_update_active_time"
			           value="<?php echo esc_attr( $active_time ) ?>"/>
		</p>

		<script>
			jQuery("#facility_update_currency").val("<?php echo esc_attr($currency) ?>");
		</script>
		<?php
	}

	/**
	 * When the post is saved, saves our custom data.
	 * We need to verify this came from our screen and with proper authorization,
	 * because the save_post action can be triggered at other times.
	 *
	 * @param int $post_id The ID of the post being saved.
	 */
	function facility_update_save_meta_box_data( $post_id ) {

		// Verify that the nonce is valid. facility_update_save_meta_box_data
		if ( ( isset( $_POST['facility_update_meta_box_nonce'] ) &&
		       ! wp_verify_nonce( $_POST['facility_update_meta_box_nonce'], 'facility_update_meta_box' ) )
		) {
			return;
		}

		// If this is an autosave, our form has not been submitted, so we don't want to do anything.
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		// Check the user's permissions.
		if ( isset( $_POST['post_type'] ) && $this::POST_TYPE_FACILITY_UPDATE == $_POST['post_type'] ) {
			if ( ! current_user_can( 'edit_page', $post_id ) ) {
				return;
			}
		} else {
			return;
		}

		if ( isset( $_POST['facility_update_sector'] ) ) {
			$sector = sanitize_text_field( $_POST['facility_update_sector'] );
		}
		if ( isset( $_POST['facility_update_operational_region'] ) ) {
			$operational_region = sanitize_text_field( $_POST['facility_update_operational_region'] );
		}
		if ( isset( $_POST['facility_update_organizational_type'] ) ) {
			$organizational_type = sanitize_text_field( $_POST['facility_update_organizational_type'] );
		}
		if ( isset( $_POST['facility_update_financing_type'] ) ) {
			$financing_type = sanitize_text_field( $_POST['facility_update_financing_type'] );
		}
		if ( isset( $_POST['facility_update_funding_sources'] ) ) {
			$funding_sources = sanitize_text_field( $_POST['facility_update_funding_sources'] );
		}
		if ( isset( $_POST['facility_update_stage'] ) ) {
			$stage = sanitize_text_field( $_POST['facility_update_stage'] );
		}
		if ( isset( $_POST['facility_update_assets_under_management'] ) ) {
			$assets_under_management = sanitize_text_field( $_POST['facility_update_assets_under_management'] );
		}
		if ( isset( $_POST['facility_update_min_investment'] ) ) {
			$min_investment = sanitize_text_field( $_POST['facility_update_min_investment'] );
		}
		if ( isset( $_POST['facility_update_max_investment'] ) ) {
			$max_investment = sanitize_text_field( $_POST['facility_update_max_investment'] );
		}
		if ( isset( $_POST['facility_update_currency'] ) ) {
			$currency = sanitize_text_field( $_POST['facility_update_currency'] );
		}
		if ( isset( $_POST['facility_update_num_financed_projects'] ) ) {
			$num_financed_projects = sanitize_text_field( $_POST['facility_update_num_financed_projects'] );
		}
		if ( isset( $_POST['facility_update_total_investment'] ) ) {
			$total_investment = sanitize_text_field( $_POST['facility_update_total_investment'] );
		}
		if ( isset( $_POST['facility_update_website'] ) ) {
			$website = sanitize_text_field( $_POST['facility_update_website'] );
		}
		if ( isset( $_POST['facility_update_email'] ) ) {
			$email = sanitize_text_field( $_POST['facility_update_email'] );
		}
		if ( isset( $_POST['facility_update_phone'] ) ) {
			$phone = sanitize_text_field( $_POST['facility_update_phone'] );
		}
		if ( isset( $_POST['facility_update_description'] ) ) {
			$description = sanitize_text_field( $_POST['facility_update_description'] );
		}
		if ( isset( $_POST['facility_update_sustainability'] ) ) {
			$sustainability = sanitize_text_field( $_POST['facility_update_sustainability'] );
		}
		if ( isset( $_POST['facility_update_established'] ) ) {
			$established = sanitize_text_field( $_POST['facility_update_established'] );
		}
		if ( isset( $_POST['facility_update_active_time'] ) ) {
			$active_time = sanitize_text_field( $_POST['facility_update_active_time'] );
		}

		$parent_post_id = wp_get_post_parent_id( $post_id );
		if ( $parent_post_id ) {
			update_post_meta( $parent_post_id, 'facility_sector', $sector );
			update_post_meta( $parent_post_id, 'facility_operational_region', $operational_region );
			update_post_meta( $parent_post_id, 'facility_organizational_type', $organizational_type );
			update_post_meta( $parent_post_id, 'facility_financing_type', $financing_type );
			update_post_meta( $parent_post_id, 'facility_funding_sources', $funding_sources );
			update_post_meta( $parent_post_id, 'facility_stage', $stage );
			update_post_meta( $parent_post_id, 'facility_assets_under_management', $assets_under_management );
			update_post_meta( $parent_post_id, 'facility_min_investment', $min_investment );
			update_post_meta( $parent_post_id, 'facility_max_investment', $max_investment );
			update_post_meta( $parent_post_id, 'facility_currency', $currency );
			update_post_meta( $parent_post_id, 'facility_num_financed_projects', $num_financed_projects );
			update_post_meta( $parent_post_id, 'facility_total_investment', $total_investment );
			update_post_meta( $parent_post_id, 'facility_website', $website );
			update_post_meta( $parent_post_id, 'facility_email', $email );
			update_post_meta( $parent_post_id, 'facility_phone', $phone );
			update_post_meta( $parent_post_id, 'facility_description', $description );
			update_post_meta( $parent_post_id, 'facility_sustainability', $sustainability );
			update_post_meta( $parent_post_id, 'facility_established', $established );
			update_post_meta( $parent_post_id, 'facility_active_time', $active_time );
		}

		wp_delete_post( $post_id );

	}

	static function getCurrencyOptions() {
		include 'currency.php';
	}

	/**
	 * Redirect to the edit.php on post save or publish.
	 */
	function facility_redirect_post_location( $location ) {

		if ( isset( $_POST['post_type'] ) && $_POST['post_type'] == "facility_update" )
			return admin_url( "edit.php?post_type=facility_update" );

		return $location;
	}

}
