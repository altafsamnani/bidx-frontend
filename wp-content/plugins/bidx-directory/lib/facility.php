<?php

/**
 * Created by PhpStorm.
 * User: Bilel BARHOUMI
 * Email: infobilel@gmail.com
 * Date: 18/02/2016
 * Time: 10:30
 */
class Facility {
	/** constants for the Facility **/
	const POST_TYPE_FACILITY = 'facility';

	public function __construct() {
		add_action( 'add_meta_boxes', array( $this, 'facility_add_meta_boxes' ) );

		add_action( 'save_post', array( $this, 'facility_save_meta_box_data' ) );
		add_action( 'init', array( $this, 'create_facility' ) );

		// Custom post table
		add_filter( 'manage_facility_posts_columns', array( $this, 'facility_table_head' ) );
		add_action( 'manage_facility_posts_custom_column', array( $this, 'facility_table_content' ), 10, 2 );
		add_filter( 'manage_edit-facility_sortable_columns', array( $this, 'facility_sortable_columns' ) );

		add_action( 'init', array( $this, 'facility_add_rewrite_rules' ) );

		add_filter( 'template_include', array( $this, 'template_chooser' ) );

		add_action( 'wp_ajax_load_search_results', array( $this, 'load_search_results' ) );
		add_action( 'wp_ajax_nopriv_load_search_results', array( $this, 'load_search_results' ) );

		add_action( 'wp_ajax_rate_facility', array( $this, 'rate_facility' ) );
		add_action( 'wp_ajax_nopriv_rate_facility', array( $this, 'rate_facility' ) );

		add_shortcode( 'facility_search', array( $this, 'facility_search_shortcode' ) );


		$boostrapSliderPath = '/wp-content/plugins/bidx-plugin/static/vendor/bootstrap-slider-master';
		wp_register_style( 'css_slider', $boostrapSliderPath . '/css/bootstrap-slider.css' );
		wp_enqueue_style( 'css_slider' );

		$bootstrapScriptSlider = $boostrapSliderPath . '/dist/bootstrap-slider.min.js';
		wp_enqueue_script( 'script_slider', $bootstrapScriptSlider, array( 'jquery' ) );

		$select2 = '/wp-content/plugins/bidx-directory/assets/select2';

		wp_register_style( 'css_select2', $select2 . '/css/select2.min.css' );
		wp_enqueue_style( 'css_select2' );

		wp_enqueue_script( 'script_select2', $select2 . '/js/select2.min.js', array( 'jquery' ) );

	}

	function facility_add_rewrite_rules() {
		add_rewrite_rule(
			'facilities/(.*)/(.*)',
			'index.php?post_type=facility&name=$matches[2]',
			'top'
		);
		add_rewrite_rule(
			'facilities/(.*)',
			'index.php?post_type=facility&name=$matches[1]',
			'top'
		);
		add_rewrite_rule(
			'organisation/(.*)',
			'index.php?post_type=organisation&name=$matches[1]',
			'top'
		);
		add_rewrite_rule(
			'facilities/(.+?)/?$',
			'index.php?post_type=facility&update=true&name=$matches[1]',
			'top'
			);
		add_rewrite_tag('%update%','([^&]+)');
	}

	function template_chooser( $template ) {
		if ( isset( $_GET['post_type'] ) ) {
			$post_type = $_GET['post_type'];
			if ( is_search() && $post_type == 'facility' ) {

				return dirname( __FILE__ ) . '/templates/search_facility_page.php';
			}
		}
		if ( isset( $_GET['action'] ) && isset( $_GET['post'] ) ) {
			$action = $_GET['action'];
			$post   = $_GET['post'];
			if ( $post && $action == 'update-facility' ) {

				return dirname( __FILE__ ) . '/update-facility.php';
			}
		}

		return $template;
	}

	/**
	 * Create the custom post describing the facility
	 */
	function create_facility() {

		$args = array(
			'label'               => __( 'post_type', 'ibs-plugin' ),
			'description'         => __( 'Facility definition', 'ibs-plugin' ),
			'labels'              => array(
				'name'               => _x( 'Facilities', 'Facilities', 'ibs-plugin' ),
				'singular_name'      => _x( 'Facility', 'Facility', 'ibs-plugin' ),
				'menu_name'          => __( 'Facilities', 'ibs-plugin' ),
				'parent_item_colon'  => __( 'Parent Items:', 'ibs-plugin' ),
				'all_items'          => __( 'All Facilities', 'ibs-plugin' ),
				'view_item'          => __( 'View Facility', 'ibs-plugin' ),
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
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_nav_menus'   => true,
			'show_in_admin_bar'   => true,
			'menu_position'       => 40,
			'menu_icon'           => 'dashicons-megaphone',
			'can_export'          => true,
			'has_archive'         => true,
			'exclude_from_search' => false,
			'publicly_queryable'  => true,
			'capability_type'     => 'post',
			'rewrite'             => array( 'slug' => 'facilities' ),
		);
		register_post_type( self::POST_TYPE_FACILITY, $args );
	}

	function facility_add_meta_boxes( $post ) {
		$this->facility_add_meta_box();
		$this->organisation_parent_add_meta_box();
	}

	/**
	 * Adds a box to the main column on the Post and Page edit screens.
	 */
	function facility_add_meta_box() {
		add_meta_box(
			'facility_sectionid',
			__( 'Facility Details', 'ibs-plugin' ),
			array( $this, 'meta_box_callback' ),
			$this:: POST_TYPE_FACILITY,
			'normal'
		);
	}

	function organisation_parent_add_meta_box() {
		add_meta_box(
			'organisation_parent_sectionid',
			__( 'Organisation', 'ibs-plugin' ),
			array( $this, 'organisation_parent_meta_box' ),
			$this:: POST_TYPE_FACILITY,
			'side'
		);
	}


	/**
	 * Prints the box content.
	 *
	 * @param WP_Post $post The object for the current post/page.
	 */
	function meta_box_callback( $post ) {

		// Add an nonce field so we can check for it later. Facility_meta_box_nonce
		wp_nonce_field( 'facility_meta_box', 'facility_meta_box_nonce' );

		/*
		 * Use get_post_meta() to retrieve an existing value
		* from the database and use the value for the form.
		*/
		$sector                  = get_post_meta( $post->ID, 'facility_sector', true );
		$operational_region      = get_post_meta( $post->ID, 'facility_operational_region', true );
		$organizational_type     = get_post_meta( $post->ID, 'facility_organizational_type', true );
		$financing_type          = get_post_meta( $post->ID, 'facility_financing_type', true );
		$funding_sources         = get_post_meta( $post->ID, 'facility_funding_sources', true );
		$stage                   = get_post_meta( $post->ID, 'facility_stage', true );
		$assets_under_management = get_post_meta( $post->ID, 'facility_assets_under_management', true );
		$min_investment          = get_post_meta( $post->ID, 'facility_min_investment', true );
		$max_investment          = get_post_meta( $post->ID, 'facility_max_investment', true );
		$currency                = get_post_meta( $post->ID, 'facility_currency', true );
		$num_financed_projects   = get_post_meta( $post->ID, 'facility_num_financed_projects', true );
		$total_investment        = get_post_meta( $post->ID, 'facility_total_investment', true );
		$website                 = get_post_meta( $post->ID, 'facility_website', true );
		$email                   = get_post_meta( $post->ID, 'facility_email', true );
		$phone                   = get_post_meta( $post->ID, 'facility_phone', true );
		$description             = get_post_meta( $post->ID, 'facility_description', true );
		$sustainability          = get_post_meta( $post->ID, 'facility_sustainability', true );
		$established             = get_post_meta( $post->ID, 'facility_established', true );
		$active_time             = get_post_meta( $post->ID, 'facility_active_time', true );

		?>
		<p><?php _e( 'These settings are needed for an facility.', 'bidx-facility' ) ?></p>
		<p>
			<label for="facility_sector"><?php _e( 'Sector', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_sector"
			           value="<?php echo esc_attr( $sector ) ?>"/>
		</p>
		<p>
			<label for="facility_operational_region"><?php _e( 'Operational Regions', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_operational_region"
			           value="<?php echo esc_attr( $operational_region ) ?>"/>
		</p>
		<p>
			<label for="facility_organizational_type"><?php _e( 'Organizational Type', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_organizational_type"
			           value="<?php echo esc_attr( $organizational_type ) ?>"/>
		</p>
		<p>
			<label for="facility_financing_type"><?php _e( 'Financing Type', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_financing_type"
			           value="<?php echo esc_attr( $financing_type ) ?>"/>
		</p>
		<p>
			<label for="facility_funding_sources"><?php _e( 'Funding Sources', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_funding_sources"
			           value="<?php echo esc_attr( $funding_sources ) ?>"/>
		</p>
		<p>
			<label for="facility_stage"><?php _e( 'Stage', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_stage"
			           value="<?php echo esc_attr( $stage ) ?>"/>
		</p>
		<p>
			<label for="facility_assets_under_management"><?php _e( 'Assets under management', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="number" name="facility_assets_under_management"
			           value="<?php echo esc_attr( $assets_under_management ) ?>"/>
		</p>
		<p>
			<label for="facility_min_investment"><?php _e( 'Minimum Investment', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="number" name="facility_min_investment"
			           value="<?php echo esc_attr( $min_investment ) ?>"/>
		</p>
		<p>
			<label for="facility_max_investment"><?php _e( 'Maximum Investment', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="number" name="facility_max_investment"
			           value="<?php echo esc_attr( $max_investment ) ?>"/>
		</p>
		<p>
			<label for="facility_currency"><?php _e( 'Currency', 'ibs-plugin' ) ?></label>
			<br>
			<select style="width:100%" name="facility_currency" id="facility_currency">
				<?php include_once 'currency.php' ?>
			</select>
		</p>
		<p>
			<label for="facility_num_financed_projects"><?php _e( 'N. Financed projects', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="number" name="facility_num_financed_projects"
			           value="<?php echo esc_attr( $num_financed_projects ) ?>"/>
		</p>
		<p>
			<label for="facility_total_investment"><?php _e( 'Total Investment', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="number" name="facility_total_investment"
			           value="<?php echo esc_attr( $total_investment ) ?>"/>
		</p>
		<p>
			<label for="facility_website"><?php _e( 'Website', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_website"
			           value="<?php echo esc_attr( $website ) ?>"/>
		</p>
		<p>
			<label for="facility_email"><?php _e( 'Email', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_email"
			           value="<?php echo esc_attr( $email ) ?>"/>
		</p>
		<p>
			<label for="facility_phone"><?php _e( 'Phone', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_phone"
			           value="<?php echo esc_attr( $phone ) ?>"/>
		</p>
		<p>
			<label for="facility_description"><?php _e( 'Description', 'ibs-plugin' ) ?></label>
			<br><textarea style="width:100%" type="text" name="facility_description"
			><?php echo esc_attr( $description ) ?></textarea>
		</p>
		<p>
			<label for="facility_sustainability"><?php _e( 'Sustainability ', 'ibs-plugin' ) ?></label>
			<br><textarea style="width:100%" type="text" name="facility_sustainability"
			><?php echo esc_attr( $sustainability ) ?></textarea>
		</p>
		<p>
			<label for="facility_established"><?php _e( 'Established', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_established"
			           value="<?php echo esc_attr( $established ) ?>"/>
		</p>
		<p>
			<label for="facility_active_time"><?php _e( 'Active time period of a fund', 'ibs-plugin' ) ?></label>
			<br><input style="width:100%" type="text" name="facility_active_time"
			           value="<?php echo esc_attr( $active_time ) ?>"/>
		</p>

		<script>
			jQuery("#facility_currency").val("<?php echo esc_attr($currency) ?>");
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
	function facility_save_meta_box_data( $post_id ) {

		// Verify that the nonce is valid. facility_save_meta_box_data
		if ( ( isset( $_POST['facility_meta_box_nonce'] ) &&
		       ! wp_verify_nonce( $_POST['facility_meta_box_nonce'], 'facility_meta_box' ) )
		) {
			return;
		}

		// If this is an autosave, our form has not been submitted, so we don't want to do anything.
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		// Check the user's permissions.
		if ( isset( $_POST['post_type'] ) && $this::POST_TYPE_FACILITY == $_POST['post_type'] ) {
			if ( ! current_user_can( 'edit_page', $post_id ) ) {
				return;
			}
		} else {
			return;
		}

		if ( isset( $_POST['facility_sector'] ) ) {
			$sector = sanitize_text_field( $_POST['facility_sector'] );
		}
		if ( isset( $_POST['facility_operational_region'] ) ) {
			$operational_region = sanitize_text_field( $_POST['facility_operational_region'] );
		}
		if ( isset( $_POST['facility_organizational_type'] ) ) {
			$organizational_type = sanitize_text_field( $_POST['facility_organizational_type'] );
		}
		if ( isset( $_POST['facility_financing_type'] ) ) {
			$financing_type = sanitize_text_field( $_POST['facility_financing_type'] );
		}
		if ( isset( $_POST['facility_funding_sources'] ) ) {
			$funding_sources = sanitize_text_field( $_POST['facility_funding_sources'] );
		}
		if ( isset( $_POST['facility_stage'] ) ) {
			$stage = sanitize_text_field( $_POST['facility_stage'] );
		}
		if ( isset( $_POST['facility_assets_under_management'] ) ) {
			$assets_under_management = sanitize_text_field( $_POST['facility_assets_under_management'] );
		}
		if ( isset( $_POST['facility_min_investment'] ) ) {
			$min_investment = sanitize_text_field( $_POST['facility_min_investment'] );
		}
		if ( isset( $_POST['facility_max_investment'] ) ) {
			$max_investment = sanitize_text_field( $_POST['facility_max_investment'] );
		}
		if ( isset( $_POST['facility_currency'] ) ) {
			$currency = sanitize_text_field( $_POST['facility_currency'] );
		}
		if ( isset( $_POST['facility_num_financed_projects'] ) ) {
			$num_financed_projects = sanitize_text_field( $_POST['facility_num_financed_projects'] );
		}
		if ( isset( $_POST['facility_total_investment'] ) ) {
			$total_investment = sanitize_text_field( $_POST['facility_total_investment'] );
		}
		if ( isset( $_POST['facility_website'] ) ) {
			$website = sanitize_text_field( $_POST['facility_website'] );
		}
		if ( isset( $_POST['facility_email'] ) ) {
			$email = sanitize_text_field( $_POST['facility_email'] );
		}
		if ( isset( $_POST['facility_phone'] ) ) {
			$phone = sanitize_text_field( $_POST['facility_phone'] );
		}
		if ( isset( $_POST['facility_description'] ) ) {
			$description = sanitize_text_field( $_POST['facility_description'] );
		}
		if ( isset( $_POST['facility_sustainability'] ) ) {
			$sustainability = sanitize_text_field( $_POST['facility_sustainability'] );
		}
		if ( isset( $_POST['facility_established'] ) ) {
			$established = sanitize_text_field( $_POST['facility_established'] );
		}
		if ( isset( $_POST['facility_active_time'] ) ) {
			$active_time = sanitize_text_field( $_POST['facility_active_time'] );
		}

		update_post_meta( $post_id, 'facility_sector', $sector );
		update_post_meta( $post_id, 'facility_operational_region', $operational_region );
		update_post_meta( $post_id, 'facility_organizational_type', $organizational_type );
		update_post_meta( $post_id, 'facility_financing_type', $financing_type );
		update_post_meta( $post_id, 'facility_funding_sources', $funding_sources );
		update_post_meta( $post_id, 'facility_stage', $stage );
		update_post_meta( $post_id, 'facility_assets_under_management', $assets_under_management );
		update_post_meta( $post_id, 'facility_min_investment', $min_investment );
		update_post_meta( $post_id, 'facility_max_investment', $max_investment );
		update_post_meta( $post_id, 'facility_currency', $currency );
		update_post_meta( $post_id, 'facility_num_financed_projects', $num_financed_projects );
		update_post_meta( $post_id, 'facility_total_investment', $total_investment );
		update_post_meta( $post_id, 'facility_website', $website );
		update_post_meta( $post_id, 'facility_email', $email );
		update_post_meta( $post_id, 'facility_phone', $phone );
		update_post_meta( $post_id, 'facility_description', $description );
		update_post_meta( $post_id, 'facility_sustainability', $sustainability );
		update_post_meta( $post_id, 'facility_established', $established );
		update_post_meta( $post_id, 'facility_active_time', $active_time );

	}

	/**
	 * List the Facilities in this site
	 *
	 * @return WP_Query
	 */
	static function get_facilities_list() {
		return new WP_Query( array( 'post_type' => 'facility', 'post_status' => 'publish' ) );
	}

	/**
	 * Adds extra fields to the competition overview
	 *
	 * @param $defaults
	 *
	 * @return mixed
	 */
	function facility_table_head( $defaults ) {
		$defaults['facility_sector']  = __( 'Sector', 'ibs-plugin' );
		$defaults['facility_website'] = __( 'Website', 'ibs-plugin' );
		$defaults['date']             = __( 'Date', 'ibs-plugin' );

		return $defaults;
	}

	function facility_sortable_columns( $columns ) {
		$columns['facility_sector']  = 'facility_sector';
		$columns['facility_website'] = 'facility_website';

		return $columns;
	}

	/**
	 * Fills the extra created columns for the competition post type
	 *
	 * @param string $column_name
	 * @param int $post_id
	 */
	function facility_table_content( $column_name, $post_id ) {
		if ( $column_name == 'facility_sector' ) {
			$facility_sector = get_post_meta( $post_id, 'facility_sector', true );
			echo $facility_sector ? $facility_sector : '--';
		}
		if ( $column_name == 'facility_website' ) {
			$facility_website = get_post_meta( $post_id, 'facility_website', true );
			echo $facility_website ? $facility_website : '--';
		}
	}


	/* Displays the meta box. */
	function organisation_parent_meta_box( $post ) {
		$parents = get_posts(
			array(
				'post_type'   => 'organisation',
				'orderby'     => 'title',
				'order'       => 'ASC',
				'numberposts' => - 1
			)
		);
		if ( ! empty( $parents ) ) {

			echo '<select name="parent_id" class="widefat">'; // !Important! Don't change the 'parent_id' name attribute.

			foreach ( $parents as $parent ) {
				printf( '<option value="%s"%s>%s</option>', esc_attr( $parent->ID ), selected( $parent->ID, $post->post_parent, false ), esc_html( $parent->post_title ) );
			}

			echo '</select>';
		}
	}

	static function getCurrencyOptions() {
		include 'currency.php';
	}

	static function get_post_meta_all( $meta_key ) {
		global $wpdb;

		$_data = array();
		$wpdb->query( "
        SELECT `meta_value`
        FROM $wpdb->postmeta
        WHERE `meta_key` like " . $meta_key . "
        and `meta_value` != ''
    " );

		foreach ( $wpdb->last_result as $v ) {
			if ( $v != '' ) {
				$x = explode( ',', $v->meta_value );
				foreach ( $x as $v1 ) {
					if ( $v1 != 'N/A' ) {
						$_data[] = $v1;
					}
				}
			}
		};

		$_data = array_map( 'trim', $_data );
		asort( $_data );

		return array_unique( $_data, SORT_REGULAR );
	}

	static function get_post_meta_max_investment() {
		global $wpdb;

		$data = array();
		$wpdb->query( "
            SELECT max(cast(`meta_value` as unsigned)) as max_invest
            FROM $wpdb->postmeta
            WHERE `meta_key` like 'facility_max_investment'
        " );

		foreach ( $wpdb->last_result as $k => $v ) {
			$data = $v->max_invest;
		};

		return $data;
	}

	function load_search_results() {
		$_country = array();
		if ( isset( $_POST['facility_country'] ) ) {
			foreach ( $_POST['facility_country'] as $selectedOption ) {
				$_country[] = $selectedOption;
			}
		}
		if ( sizeof( $_country ) > 0 ) {
			$query['relation'] = 'OR';
			foreach ( $_country as $option ) {
				$query[] = array(
					'key'     => 'organisation_country',
					'value'   => $option,
					'compare' => 'like',
				);
			}
			$query[] = array(
				'key'     => 'organisation_country',
				'value'   => 'All',
				'compare' => 'like',
			);
			if ( sizeof( $query ) > 2 ) {
				$_meta_query[] = $query;
			} else {
				$_meta_query[] = $query[0];
			}
			$query = null;
			$_args = array(
				'post_type'      => array( 'organisation' ),
				'post_status'    => 'publish',
				'meta_query'     => $_meta_query,
				'posts_per_page' => - 1
			);
		} else {
			$_args = array(
				'post_type'      => array( 'organisation' ),
				'post_status'    => 'publish',
				'posts_per_page' => - 1
			);
		}

		$query = new WP_Query( $_args );
		if ( $query->have_posts() ) :
			$parent = array();

			while ( $query->have_posts() ) : $query->the_post();
				global $post;
				$parent[] = $post->ID;
			endwhile;

			$query                = $_POST['s'];
			$_organizational_type = array();
			if ( isset( $_POST['facility_organizational_type'] ) ) {
				foreach ( $_POST['facility_organizational_type'] as $selectedOption ) {
					$_organizational_type[] = $selectedOption;
				}
			}
//		$_currency            = $_POST['facility_currency'];
			$_operational_region = array();
			if ( isset( $_POST['facility_operational_region'] ) ) {
				foreach ( $_POST['facility_operational_region'] as $selectedOption ) {
					$_operational_region[] = $selectedOption;
				}
			}
			$_financing_type = array();
			if ( isset( $_POST['facility_financing_type'] ) ) {
				foreach ( $_POST['facility_financing_type'] as $selectedOption ) {
					$_financing_type[] = $selectedOption;
				}
			}
			//		$_investment_min_max  = $_POST['facility_investment_min_max'];
			$_stage = array();
			if ( isset( $_POST['facility_stage'] ) ) {
				foreach ( $_POST['facility_stage'] as $selectedOption ) {
					$_stage[] = $selectedOption;
				}
			}
			$_sector = array();
			if ( isset( $_POST['facility_sector'] ) ) {
				foreach ( $_POST['facility_sector'] as $selectedOption ) {
					$_sector[] = $selectedOption;
				}
			}
			$_paged = $_POST['paged'];

//		if ( ! empty( $_investment_min_max ) ) {
//			$_investment_min_max = explode( ',', esc_attr( $_investment_min_max ) );
//			$investment_min      = $_investment_min_max[0];
//			$investment_max      = $_investment_min_max[1];
//		} else {
//			$investment_max = Facility::get_post_meta_max_investment();
//			$investment_min = 0;
//		}
//
//		$_investment_max = Facility::get_post_meta_max_investment();

			$paged = $_paged ? absint( $_paged ) : 1;

			// WP_Query arguments

			// WP_Query arguments
			if ( $_organizational_type ) {
				$query['relation'] = 'OR';

				foreach ( $_organizational_type as $option ) {
					$query[] = array(
						'key'     => 'facility_organizational_type',
						'value'   => $option,
						'compare' => 'like',
					);
				}
				if ( sizeof( $query ) > 2 ) {
					$meta_query[] = $query;
				} else {
					$meta_query[] = $query[0];
				}
				$query = null;
			}
//		if ( $_currency ) {
//			$meta_query[] = array(
//				'key'     => 'facility_currency',
//				'value'   => $_currency,
//				'compare' => 'LIKE',
//			);
//		}

			if ( $_operational_region ) {
				$query['relation'] = 'OR';
				foreach ( $_operational_region as $option ) {
					$query[] = array(
						'key'     => 'facility_operational_region',
						'value'   => $option,
						'compare' => 'like',
					);
				}
				if ( sizeof( $query ) > 2 ) {
					$meta_query[] = $query;
				} else {
					$meta_query[] = $query[0];
				}
				$query = null;
			}
			if ( $_financing_type ) {
				$query['relation'] = 'OR';
				foreach ( $_financing_type as $option ) {
					$query[] = array(
						'key'     => 'facility_financing_type',
						'value'   => $option,
						'compare' => 'like',
					);
				}
				if ( sizeof( $query ) > 2 ) {
					$meta_query[] = $query;
				} else {
					$meta_query[] = $query[0];
				}
				$query = null;
			}
//		$meta_query[] = array(
//			'relation' => 'OR',
//			array(
//				'key'     => 'facility_max_investment',
//				'value'   => array( $investment_min, $investment_max ),
//				'type'    => 'numeric',
//				'compare' => 'BETWEEN',
//			),
//			array(
//				'key'     => 'facility_min_investment',
//				'value'   => array( $investment_min, $investment_max ),
//				'type'    => 'numeric',
//				'compare' => 'BETWEEN',
//			),
//			array(
//				'relation' => 'AND',
//				array(
//					'key'     => 'facility_min_investment',
//					'value'   => $investment_min,
//					'type'    => 'numeric',
//					'compare' => '<',
//				),
//				array(
//					'key'     => 'facility_max_investment',
//					'value'   => $investment_max,
//					'type'    => 'numeric',
//					'compare' => '>',
//				)
//			)
//		);
			if ( $_stage ) {
				$query['relation'] = 'OR';
				foreach ( $_stage as $option ) {
					$query[] = array(
						'key'     => 'facility_stage',
						'value'   => $option,
						'compare' => 'like',
					);
				}
				if ( sizeof( $query ) > 2 ) {
					$meta_query[] = $query;
				} else {
					$meta_query[] = $query[0];
				}
				$query = null;
			}
			if ( $_sector ) {
				$query['relation'] = 'OR';
				foreach ( $_sector as $option ) {
					$query[] = array(
						'key'     => 'facility_sector',
						'value'   => $option,
						'compare' => 'like',
					);
				}
				if ( sizeof( $query ) > 2 ) {
					$meta_query[] = $query;
				} else {
					$meta_query[] = $query[0];
				}
				$query = null;
			}
			$args = array(
				'post_type'       => array( 'facility' ),
				's'               => $query,
				'post_status'     => 'publish',
				'posts_per_page'  => 5,
				'paged'           => $paged,
				'meta_query'      => $meta_query,
				'post_parent__in' => $parent
			);
			// The Query
			$query  = new WP_Query( $args );

			if ( $query->have_posts() ) : ?>
				<?php /* Start the Loop */ ?>
				<div class="alert alert-success" style="margin-top: 7px; margin-bottom: 8px;">
					<strong><i
							class="fa fa-search"></i>&nbsp; <?php printf( __( $query->found_posts . ' facilities found ', 'shape' ) ); ?>
					</strong>
				</div>
				<div class="row">
					<div class="col-md-12" id="pagination" style="margin-bottom: 7px">
						<?php
						echo paginate_links( array(
							'base'    => '%_%',
							'format'  => '?paged=%#%&post_type=facility',
							'current' => max( 1, $paged ),
							'total'   => $query->max_num_pages
						) );
						?>
					</div>
					<?php while ( $query->have_posts() ) : $query->the_post();

						global $post;
						$sector              = get_post_meta( $post->ID, 'facility_sector', true );
						$country             = get_post_meta( $post->post_parent, 'organisation_country', true );
						$operational_region  = get_post_meta( $post->ID, 'facility_operational_region', true );
						$organizational_type = get_post_meta( $post->ID, 'facility_organizational_type', true );
						$financing_type      = get_post_meta( $post->ID, 'facility_financing_type', true );
//					$funding_sources         = get_post_meta( $post->ID, 'facility_funding_sources', true );
//					$stage                   = get_post_meta( $post->ID, 'facility_stage', true );
//					$assets_under_management = get_post_meta( $post->ID, 'facility_assets_under_management', true );
						$min_investment = get_post_meta( $post->ID, 'facility_min_investment', true );
						$max_investment = get_post_meta( $post->ID, 'facility_max_investment', true );
//					$currency                = get_post_meta( $post->ID, 'facility_currency', true );
						?>

						<div class="col-sm-12 col-md-12">
							<div class="thumbnail" style="display: flex; margin-bottom: 8px;">
								<div class="caption" style="padding: 4px; width: 100%;">
									<a href="<?php the_permalink(); ?>" target="_blank">
										<h4 style="margin-bottom: 7px; margin-top: 7px;"><?php the_title(); ?></h4>
									</a>

									<?php
									$min = is_numeric( $min_investment ) ? number_format_i18n( $min_investment ) : '---';
									$max = is_numeric( $max_investment ) ? number_format_i18n( $max_investment ) : '---';
									echo $organizational_type . ' | ' . $financing_type;
									//								     . ' <br>Investments (' . $currency . '): min. ' . $min . ' max. ' . $max;
									echo '<br> ' . $sector . ' | ' . $country . ' | ' . $operational_region;
									?>
									<br>
									Created: <?php echo get_the_date(); ?> |
									Last modified: <?php the_modified_date(); ?>
								</div>
							</div>
						</div>

					<?php endwhile; ?>
					<div class="col-md-12" id="pagination">
						<?php
						echo paginate_links( array(
							'base'    => '%_%',
							'format'  => '?paged=%#%&post_type=facility',
							'current' => max( 1, $paged ),
							'total'   => $query->max_num_pages
						) );
						?>
					</div>
				</div>

				<?php
			else : ?>
				<div class="alert alert-warning" style="margin-top: 7px; margin-bottom: 8px;">
					<strong><i
							class="fa fa-exclamation-triangle"></i> <?php printf( __( 'No facility found! ', 'shape' ) ); ?>
					</strong>
				</div>
			<?php endif;
		else : ?>
			<div class="alert alert-warning" style="margin-top: 7px; margin-bottom: 8px;">
				<strong><i
						class="fa fa-exclamation-triangle"></i> <?php printf( __( 'No facility found! ', 'shape' ) ); ?>
				</strong>
			</div>
		<?php endif;

		die();
	}

	function rate_facility() {

		global $wp_session;

		$ID    = $_POST['facility_id'];
		$value = $_POST['rate_value'];

		if ( ! is_numeric( $value ) ) {
			$value = 0;
		}
		$rate_number = get_post_meta( $ID, 'facility_rate_number', true );
		if ( ! is_numeric( $rate_number ) ) {
			$rate_number = 0;
		}
		$rate_average = get_post_meta( $ID, 'facility_rate_average', true );
		if ( ! is_numeric( $rate_average ) ) {
			$rate_average = 0;
		}

		$rate_average = ( $rate_average * $rate_number + $value ) / ( $rate_number + 1 );

		$rate_number ++;

		update_post_meta( $ID, 'facility_rate_number', $rate_number );
		update_post_meta( $ID, 'facility_rate_average', $rate_average );
		$nonce = wp_create_nonce( 'facility-rate-' . $ID );
		if ( ! session_id() ) {
			session_start();
		}
		$_SESSION[ 'facility-rate-' . $ID ] = $nonce;


		echo $rate_number;

		die();
	}


	function facility_search_shortcode( $atts ) {
		require_once "templates/search_facility_shortcode.php";
	}


	function send_update_facilities_function() {

		$test = get_option( 'findir_cron_test_mode' );
		if ( $test ) {
			$number = 5;
		} else {
			$number = - 1;
		}
		$args = array(
			'post_type'      => array( 'facility' ),
			'post_status'    => 'publish',
			'posts_per_page' => $number,
		);

		// The Query
		$query = new WP_Query( $args );

		if ( $query->have_posts() ) :
			while ( $query->have_posts() ) : $query->the_post();
				global $post;

				$nonce = wp_create_nonce( 'update-facility-' . $post->ID );
				update_post_meta( $post->ID, 'facility_nonce', $nonce );
				$edit_post = add_query_arg( 'post', $post->ID, home_url() . '/update-fund?action=update-facility&_wpnonce=' . $nonce );

				if ( $test ) {
					$to = get_option( 'findir_cron_email' ) ? get_option( 'findir_cron_email' ) : 'bilel.barhoumi@ibsit.net';
				} else {
					$email = get_post_meta( $post->ID, 'facility_email', true );
					$to    = $email ? $email : '';
				}
				$subject = 'Update fund: ' . $post->post_title;
				$body    = 'Update fund : <a href="' . $edit_post . '">' . $post->post_title . '</a><br><br>';
				$headers = array( 'Content-Type: text/html; charset=UTF-8' );

				wp_mail( $to, $subject, $body, $headers );

			endwhile;
		endif;

	}

	function sanitize_title_facilities_function() {
		global $wpdb;
		$args = array(
			'post_type'      => array( $this::POST_TYPE_FACILITY ),
			'posts_per_page' => - 1,
		);

		// The Query
		$query = new WP_Query( $args );

		if ( $query->have_posts() ) :
			while ( $query->have_posts() ) : $query->the_post();
				global $post;

				$new_slug = sanitize_title( $post->post_title );
				wp_update_post(
					array(
						'ID'          => $post->ID,
						'post_name'   => $new_slug,
						'post_status' => 'publish'
					)
				);
				$wpdb->update( $wpdb->posts, array( 'post_status' => 'publish' ), array( 'ID' => $post->ID ) );

				clean_post_cache( $post->ID );
			endwhile;
		endif;

	}

}
