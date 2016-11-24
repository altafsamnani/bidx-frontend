<?php

/**
 * Created by PhpStorm.
 * User: Bilel BARHOUMI
 * Email: infobilel@gmail.com
 * Date: 15/02/2016
 * Time: 12:59
 */

/**
 * The main template.
 *
 * @package Ibs
 */
wp_register_style( 'single-facility', plugins_url( 'bidx-directory/assets/style-single-facility.css' ) );
wp_enqueue_style( 'single-facility' );

get_template_part('templates', 'header');

$query = new WP_Query( array(
	'post_type'      => 'facility',
	'posts_per_page' => '-1',
) );

if ( $query->have_posts() ) : while ( $query->have_posts() ) : $query->the_post();

	if ( isset( $_GET['post'] ) ) {

		if ( $_GET['post'] == $post->ID ) {
			$current_post = $post->ID;

			$title     = get_the_title();
			$permalink = get_the_permalink();
		}
	}

endwhile; endif;
wp_reset_query();

global $current_post;

$nonce  = isset( $_REQUEST['_wpnonce'] ) ? $_REQUEST['_wpnonce'] : '';
$_nonce = get_post_meta( $current_post, 'facility_nonce', true );

if ( ! ( $nonce == $_nonce ) ) {
	require TEMPLATEPATH . '/404.php';
} else if ( isset( $_POST['submitted'] ) && isset( $_POST['post_nonce_field'] ) && wp_verify_nonce( $_POST['post_nonce_field'], 'post_nonce' ) ) {

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

	$args = array(
		'post_type'      => 'facility_update',
		'post_status'    => 'pending',
		'posts_per_page' => '-1',
		'post_parent'    => $current_post
	);
	$loop = new WP_Query( $args );
	if ( $loop->have_posts() ): while ( $loop->have_posts() ) : $loop->the_post();
		global $post;
		$post_id = $post->ID;

	endwhile;
	endif;

	if ( ! $post_id ) {
		$post_information = array(
			'post_title'  => $title,
			'post_type'   => 'facility_update',
			'post_status' => 'pending',
			'post_parent' => $current_post,
		);

		$post_id = wp_insert_post( $post_information );
	}

	update_post_meta( $post_id, 'facility_update_sector', $sector );
	update_post_meta( $post_id, 'facility_update_operational_region', $operational_region );
	update_post_meta( $post_id, 'facility_update_organizational_type', $organizational_type );
	update_post_meta( $post_id, 'facility_update_financing_type', $financing_type );
	update_post_meta( $post_id, 'facility_update_funding_sources', $funding_sources );
	update_post_meta( $post_id, 'facility_update_stage', $stage );
	update_post_meta( $post_id, 'facility_update_assets_under_management', $assets_under_management );
	update_post_meta( $post_id, 'facility_update_min_investment', $min_investment );
	update_post_meta( $post_id, 'facility_update_max_investment', $max_investment );
	update_post_meta( $post_id, 'facility_update_currency', $currency );
	update_post_meta( $post_id, 'facility_update_num_financed_projects', $num_financed_projects );
	update_post_meta( $post_id, 'facility_update_total_investment', $total_investment );
	update_post_meta( $post_id, 'facility_update_website', $website );
	update_post_meta( $post_id, 'facility_update_email', $email );
	update_post_meta( $post_id, 'facility_update_phone', $phone );
	update_post_meta( $post_id, 'facility_update_description', $description );
	update_post_meta( $post_id, 'facility_update_sustainability', $sustainability );
	update_post_meta( $post_id, 'facility_update_established', $established );
	update_post_meta( $post_id, 'facility_update_active_time', $active_time );
	delete_post_meta( $current_post, 'facility_nonce' );

	if ( $post_id ) { ?>
		<div class="page-header">
			<h1><?php echo $title; ?></h1>

		</div>
		<br>
		<div class="alert alert-success">
			<?php _e( 'You fund have been updated and sent to the administrator.', 'ibs-plugin' ); ?>
		</div>
		<?php
	}
} else {

	$sector                  = get_post_meta( $current_post, 'facility_sector', true );
	$operational_region      = get_post_meta( $current_post, 'facility_operational_region', true );
	$organizational_type     = get_post_meta( $current_post, 'facility_organizational_type', true );
	$financing_type          = get_post_meta( $current_post, 'facility_financing_type', true );
	$funding_sources         = get_post_meta( $current_post, 'facility_funding_sources', true );
	$stage                   = get_post_meta( $current_post, 'facility_stage', true );
	$assets_under_management = get_post_meta( $current_post, 'facility_assets_under_management', true );
	$min_investment          = get_post_meta( $current_post, 'facility_min_investment', true );
	$max_investment          = get_post_meta( $current_post, 'facility_max_investment', true );
	$currency                = get_post_meta( $current_post, 'facility_currency', true );
	$num_financed_projects   = get_post_meta( $current_post, 'facility_num_financed_projects', true );
	$total_investment        = get_post_meta( $current_post, 'facility_total_investment', true );
	$website                 = get_post_meta( $current_post, 'facility_website', true );
	$email                   = get_post_meta( $current_post, 'facility_email', true );
	$phone                   = get_post_meta( $current_post, 'facility_phone', true );
	$description             = get_post_meta( $current_post, 'facility_description', true );
	$sustainability          = get_post_meta( $current_post, 'facility_sustainability', true );
	$established             = get_post_meta( $current_post, 'facility_established', true );
	$active_time             = get_post_meta( $current_post, 'facility_active_time', true );

	?>
	<style>

	</style>
	<div class="page-header">
		<h1><?php echo $title; ?></h1>

	</div>
	<div class="content">
		<form action="" id="primaryPostForm" method="POST">
			<h3>Criteria</h3>

			<label for="facility_update_sector"><?php _e( 'Sector', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="text" name="facility_update_sector"
			           value="<?php echo esc_attr( $sector ) ?>"/>

			<label for="facility_update_operational_region"><?php _e( 'Operational Regions', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="text" name="facility_update_operational_region"
			           value="<?php echo esc_attr( $operational_region ) ?>"/>

			<label for="facility_update_organizational_type"><?php _e( 'Organizational Type', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="text" name="facility_update_organizational_type"
			           value="<?php echo esc_attr( $organizational_type ) ?>"/>

			<label for="facility_update_financing_type"><?php _e( 'Financing Type', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="text" name="facility_update_financing_type"
			           value="<?php echo esc_attr( $financing_type ) ?>"/>

			<label for="facility_update_funding_sources"><?php _e( 'Funding Sources', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="text" name="facility_update_funding_sources"
			           value="<?php echo esc_attr( $funding_sources ) ?>"/>

			<label for="facility_update_stage"><?php _e( 'Stage', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="text" name="facility_update_stage"
			           value="<?php echo esc_attr( $stage ) ?>"/>

			<label
				for="facility_update_assets_under_management"><?php _e( 'Assets under management', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="number"
			           name="facility_update_assets_under_management"
			           value="<?php echo esc_attr( $assets_under_management ) ?>"/>

			<label for="facility_update_min_investment"><?php _e( 'Minimum Investment', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="number" name="facility_update_min_investment"
			           value="<?php echo esc_attr( $min_investment ) ?>"/>

			<label for="facility_update_max_investment"><?php _e( 'Maximum Investment', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="number" name="facility_update_max_investment"
			           value="<?php echo esc_attr( $max_investment ) ?>"/>

			<label for="facility_update_currency"><?php _e( 'Currency', 'ibs-plugin' ) ?></label>
			<br>
			<select style="width:100%" name="facility_update_currency" id="facility_update_currency">
				<?php include_once( 'currency.php' ) ?>
			</select>

			<label
				for="facility_update_num_financed_projects"><?php _e( 'N. Financed projects', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="number"
			           name="facility_update_num_financed_projects"
			           value="<?php echo esc_attr( $num_financed_projects ) ?>"/>

			<label for="facility_update_total_investment"><?php _e( 'Total Investment', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="number" name="facility_update_total_investment"
			           value="<?php echo esc_attr( $total_investment ) ?>"/>

			<label for="facility_update_description"><?php _e( 'Description', 'ibs-plugin' ) ?></label>
			<br><textarea class="form-control" style="width:100%" type="text" name="facility_update_description"
			><?php echo esc_attr( $description ) ?></textarea>

			<label for="facility_update_sustainability"><?php _e( 'Sustainability ', 'ibs-plugin' ) ?></label>
			<br><textarea class="form-control" style="width:100%" type="text" name="facility_update_sustainability"
			><?php echo esc_attr( $sustainability ) ?></textarea>

			<label for="facility_update_established"><?php _e( 'Established', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="text" name="facility_update_established"
			           value="<?php echo esc_attr( $established ) ?>"/>

			<label for="facility_update_active_time"><?php _e( 'Active time period of a fund', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="text" name="facility_update_active_time"
			           value="<?php echo esc_attr( $active_time ) ?>"/>

			<h3>Contact</h3>

			<label for="facility_update_website"><?php _e( 'Website', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="text" name="facility_update_website"
			           value="<?php echo esc_attr( $website ) ?>"/>

			<label for="facility_update_email"><?php _e( 'Email', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="email" name="facility_update_email"
			           value="<?php echo esc_attr( $email ) ?>"/>

			<label for="facility_update_phone"><?php _e( 'Phone', 'ibs-plugin' ) ?></label>
			<br><input class="form-control" style="width:100%" type="text" name="facility_update_phone"
			           value="<?php echo esc_attr( $phone ) ?>"/>

			<?php wp_nonce_field( 'post_nonce', 'post_nonce_field' ); ?>
			<hr>
			<input type="hidden" name="submitted" id="submitted" value="true"/>
			<button class="btn btn-primary" type="submit"><?php _e( 'Submit Update', 'framework' ) ?></button>
		</form>
		<script>
			jQuery("#facility_update_currency").val("<?php echo esc_attr($currency) ?>");
		</script>
	</div>

	<script>
		jQuery(document).on('submit', '#rate_form', function () {
			var $form = jQuery(this);
			jQuery.ajax({
				type: 'post',
				url: "<?php echo admin_url('admin-ajax.php?action=rate_facility'); ?>",
				data: $form.serialize(),
				dataType: 'html',
				success: function (response) {
					location.reload();
				}
			});
			return false;
		});
	</script>
	<?php
}
?>
<?php get_template_part('templates', 'footer'); ?>

