<?php

/**
 * Created by PhpStorm.
 * User: Bilel BARHOUMI
 * Email: infobilel@gmail.com
 * Date: 18/02/2016
 * Time: 14:50
 */
class Organisation {
	/** constants for the Facility **/
	const POST_TYPE_ORGANISATION = 'organisation';

	public function __construct() {
		add_action( 'add_meta_boxes', array( $this, 'organisation_add_meta_box' ) );
		add_action( 'save_post', array( $this, 'organisation_save_meta_box_data' ) );
		add_action( 'init', array( $this, 'create_organisation' ) );

		// Custom post table
		add_filter( 'manage_organisation_posts_columns', array( $this, 'organisation_table_head' ) );
		add_action( 'manage_organisation_posts_custom_column', array( $this, 'organisation_table_content' ), 10, 2 );
		add_filter( 'manage_edit-organisation_sortable_columns', array( $this, 'organisation_sortable_columns' ) );
	}

	/**
	 * Create the custom post describing the organisation
	 */
	function create_organisation() {

		$args = array(
			'label'               => __( 'post_type', 'ibs-plugin' ),
			'description'         => __( 'Organisation definition', 'ibs-plugin' ),
			'labels'              => array(
				'name'               => _x( 'Organisations', 'Organisations', 'ibs-plugin' ),
				'singular_name'      => _x( 'Organisation', 'Organisation', 'ibs-plugin' ),
				'menu_name'          => __( 'Organisations', 'ibs-plugin' ),
				'parent_item_colon'  => __( 'Parent Items:', 'ibs-plugin' ),
				'all_items'          => __( 'All Organisations', 'ibs-plugin' ),
				'view_item'          => __( 'View Organisation', 'ibs-plugin' ),
				'add_new_item'       => __( 'Add New Organisation', 'ibs-plugin' ),
				'add_new'            => __( 'Add New', 'ibs-plugin' ),
				'edit_item'          => __( 'Edit Organisation', 'ibs-plugin' ),
				'update_item'        => __( 'Update Organisation', 'ibs-plugin' ),
				'search_items'       => __( 'Search Organisation', 'ibs-plugin' ),
				'not_found'          => __( 'Organisation not found', 'ibs-plugin' ),
				'not_found_in_trash' => __( 'Organisation not found in Trash', 'ibs-plugin' ),
			),
			'supports'            => array(
				'title'
			),
			'hierarchical'        => true,
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_nav_menus'   => true,
			'show_in_admin_bar'   => true,
			'menu_position'       => 40,
			'menu_icon'           => 'dashicons-networking',
			'can_export'          => true,
			'has_archive'         => true,
			'exclude_from_search' => false,
			'publicly_queryable'  => true,
			'capability_type'     => 'post',
		);
		register_post_type( self::POST_TYPE_ORGANISATION, $args );
	}

	/**
	 * Adds a box to the main column on the Post and Page edit screens.
	 */
	function organisation_add_meta_box() {

		add_meta_box(
			'organisation_sectionid',
			__( 'Organisation Details', 'ibs-plugin' ),
			array( $this, 'meta_box_callback' ),
			$this:: POST_TYPE_ORGANISATION,
			'normal'
		);
	}

	/**
	 * Prints the box content.
	 *
	 * @param WP_Post $post The object for the current post/page.
	 */
	function meta_box_callback( $post ) {

		// Add an nonce field so we can check for it later. organisation_meta_box_nonce
		wp_nonce_field( 'organisation_meta_box', 'organisation_meta_box_nonce' );

		/*
		 * Use get_post_meta() to retrieve an existing value
		* from the database and use the value for the form.
		*/
		$website = get_post_meta( $post->ID, 'organisation_website', true );
		$email   = get_post_meta( $post->ID, 'organisation_email', true );
		$phone   = get_post_meta( $post->ID, 'organisation_phone', true );
		$address = get_post_meta( $post->ID, 'organisation_address', true );
		$country = get_post_meta( $post->ID, 'organisation_country', true );

		?>
		<p><?php _e( 'These settings are needed for an organisation.', 'bidx-organisation' ) ?></p>
		<p>
			<label for="organisation_address"><?php _e( 'Address', 'ibs-plugin' ) ?></label>
			<br><textarea style="width:100%" name="organisation_address"><?php echo esc_attr( $address ) ?></textarea>
		</p>
		<p>
			<label for="organisation_country"><?php _e( 'Country', 'ibs-plugin' ) ?></label>
			<br><select style="width:100%" name="organisation_country" id="organisation_country">
				<?php include_once 'country.php' ?>
			</select>
		</p>
		<p>
			<label for="organisation_email"><?php _e( 'Email', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="email" name="organisation_email"
			           value="<?php echo esc_attr( $email ) ?>"/>
		</p>
		<p>
			<label for="organisation_phone"><?php _e( 'Telephone', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="organisation_phone"
			           value="<?php echo esc_attr( $phone ) ?>"/>
		</p>
		<p>
			<label for="organisation_website"><?php _e( 'Website', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="organisation_website"
			           value="<?php echo esc_attr( $website ) ?>"/>
		</p>
		<script>
			jQuery("#organisation_country").val("<?php echo esc_attr($country) ?>");
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
	function organisation_save_meta_box_data( $post_id ) {

		// Verify that the nonce is valid. organisation_save_meta_box_data
		if ( ( isset( $_POST['organisation_meta_box_nonce'] ) &&
		       ! wp_verify_nonce( $_POST['organisation_meta_box_nonce'], 'organisation_meta_box' ) )
		) {
			return;
		}

		// If this is an autosave, our form has not been submitted, so we don't want to do anything.
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		// Check the user's permissions.
		if ( isset( $_POST['post_type'] ) && $this::POST_TYPE_ORGANISATION == $_POST['post_type'] ) {
			if ( ! current_user_can( 'edit_page', $post_id ) ) {
				return;
			}
		} else {
			return;
		}

		if ( isset( $_POST['organisation_website'] ) ) {
			$website = sanitize_text_field( $_POST['organisation_website'] );
		}
		if ( isset( $_POST['organisation_email'] ) ) {
			$email = sanitize_text_field( $_POST['organisation_email'] );
		}
		if ( isset( $_POST['organisation_phone'] ) ) {
			$phone = sanitize_text_field( $_POST['organisation_phone'] );
		}
		if ( isset( $_POST['organisation_address'] ) ) {
			$address = sanitize_text_field( $_POST['organisation_address'] );
		}
		if ( isset( $_POST['organisation_country'] ) ) {
			$country = sanitize_text_field( $_POST['organisation_country'] );
		}

		update_post_meta( $post_id, 'organisation_website', $website );
		update_post_meta( $post_id, 'organisation_email', $email );
		update_post_meta( $post_id, 'organisation_phone', $phone );
		update_post_meta( $post_id, 'organisation_address', $address );
		update_post_meta( $post_id, 'organisation_country', $country );

	}

	/**
	 * List the organisations in this site
	 *
	 * @return WP_Query
	 */
	static function get_organisations_list() {
		return new WP_Query( array( 'post_type' => 'organisation', 'post_status' => 'publish' ) );
	}

	/**
	 * Adds extra fields to the competition overview
	 *
	 * @param $defaults
	 *
	 * @return mixed
	 */
	function organisation_table_head( $defaults ) {
		$defaults['organisation_email']   = __( 'Email', 'ibs-plugin' );
		$defaults['organisation_website'] = __( 'Website', 'ibs-plugin' );
		$defaults['organisation_country'] = __( 'Country', 'ibs-plugin' );
		$defaults['date']                 = __( 'Date', 'ibs-plugin' );

		return $defaults;
	}

	function organisation_sortable_columns( $columns ) {
		$columns['organisation_email']   = 'organisation_email';
		$columns['organisation_country'] = 'organisation_country';
		$columns['organisation_website'] = 'organisation_website';

		return $columns;
	}

	/**
	 * Fills the extra created columns for the competition post type
	 *
	 * @param string $column_name
	 * @param int $post_id
	 */
	function organisation_table_content( $column_name, $post_id ) {
		if ( $column_name == 'organisation_email' ) {
			$organisation_email = get_post_meta( $post_id, 'organisation_email', true );
			echo $organisation_email ? $organisation_email : '--';
		}
		if ( $column_name == 'organisation_website' ) {
			$organisation_website = get_post_meta( $post_id, 'organisation_website', true );
			echo $organisation_website ? $organisation_website : '--';
		}
		if ( $column_name == 'organisation_country' ) {
			$organisation_country = get_post_meta( $post_id, 'organisation_country', true );
			echo $organisation_country ? $organisation_country : '--';
		}
	}

	function sanitize_title_organisations_function() {

		global $wpdb;
		$args = array(
			'post_type' => array( $this::POST_TYPE_ORGANISATION ),
			'posts_per_page' => -1,
		);

		// The Query
		$query = new WP_Query( $args );

		if ( $query->have_posts() ) :
			while ( $query->have_posts() ) : $query->the_post();
				global $post;

				$new_slug = sanitize_title( $post->post_title );
					wp_update_post(
						array(
							'ID'        => $post->ID,
							'post_name' => $new_slug
						)
					);
				$wpdb->update( $wpdb->posts, array( 'post_status' => 'publish' ), array( 'ID' => $post->ID ) );

				clean_post_cache( $post->ID );			endwhile;
		endif;

	}
}