<?php
/**
 * The main template.
 *
 * @package Ibs
 */
wp_register_style( 'css_rating', plugins_url( 'bidx-directory/assets/star-rating/star-rating.min.css' ) );
wp_enqueue_style( 'css_rating' );
wp_enqueue_script( 'script_rating', plugins_url( 'bidx-directory/assets/star-rating/star-rating.min.js' ), array( 'jquery' ) );

wp_register_style( 'single-facility', plugins_url( 'bidx-directory/assets/style-single-facility.css' ) );
wp_enqueue_style( 'single-facility' );

?>
<?php get_template_part( 'templates', 'header' ); ?>

<?php if ( have_posts() ) : the_post();
	global $post;

	$sector                  = get_post_meta( $post->ID, 'facility_sector', true );
	$operational_region      = get_post_meta( $post->ID, 'facility_operational_region', true );
	$organizational_type     = get_post_meta( $post->ID, 'facility_organizational_type', true );
	$financing_type          = get_post_meta( $post->ID, 'facility_financing_type', true );
	$funding_sources         = get_post_meta( $post->ID, 'facility_funding_sources', true );
	$stage                   = get_post_meta( $post->ID, 'facility_stage', true );
	$assets_under_management = get_post_meta( $post->ID, 'facility_assets_under_management', true );
	$min_investment          = get_post_meta( $post->ID, 'facility_min_investment', true );
	$max_investment          = get_post_meta( $post->ID, 'facility_max_investment', true );

	$min = is_numeric( $min_investment ) ? number_format_i18n( $min_investment ) : '---';
	$max = is_numeric( $max_investment ) ? number_format_i18n( $max_investment ) : '---';

	$currency       = get_post_meta( $post->ID, 'facility_currency', true );
	$description    = get_post_meta( $post->ID, 'facility_description', true );
	$sustainability = get_post_meta( $post->ID, 'facility_sustainability', true );

	$num_projects     = get_post_meta( $post->ID, 'facility_num_financed_projects', true );
	$total_investment = get_post_meta( $post->ID, 'facility_total_investment', true );
	$established      = get_post_meta( $post->ID, 'facility_established', true );
	$active_time      = get_post_meta( $post->ID, 'facility_active_time', true );

	$email = get_post_meta( $post->ID, 'facility_email', true );
	$phone = get_post_meta( $post->ID, 'facility_phone', true );

	$website = get_post_meta( $post->ID, 'facility_website', true ) ? get_post_meta( $post->ID, 'facility_website', true ) : $post->ID;

	$address      = get_post_meta( $post->post_parent, 'organisation_address', true );
	$country      = get_post_meta( $post->post_parent, 'organisation_country', true );
	$organisation = get_the_title( $post->post_parent );

	$views = get_post_meta( $post->ID, 'facility_views', true );

	if ( ! isset( $_SESSION[ 'facility-view-' . $post->ID ] ) ) {
		if ( is_numeric( $views ) ) {
			$views = $views + 1;
		} else {
			$views = 1;
		}
		update_post_meta( $post->ID, 'facility_views', $views );
		if ( ! session_id() ) {
			session_start();
		}
		$nonce = wp_create_nonce( 'facility-view-' . $post->ID );

		$_SESSION[ 'facility-view-' . $post->ID ] = $nonce;
	}

	$rate_number = get_post_meta( $post->ID, 'facility_rate_number', true );
	if ( ! is_numeric( $rate_number ) ) {
		$rate_number = 0;
	}
	$rate_average = get_post_meta( $post->ID, 'facility_rate_average', true );
	if ( ! is_numeric( $rate_average ) ) {
		$rate_average = 0;
	}
	update_post_meta( $post->ID, 'facility_rate_number', $rate_number );
	update_post_meta( $post->ID, 'facility_rate_average', $rate_average );
	?>
	<style>

	</style>
	<div class="page-header">
		<h1><?php the_title(); ?></h1>

	</div>
	<div class="content">
		<div class="organisation">
			<div class="row">
				<div class="col-md-8">
					<b>Organisation :</b> <?php echo $organisation ?>
					<br>
					<b>Type of Organisation :</b> <?php echo $organizational_type ?>
					<br>
					<b>Address : </b> <?php echo $address ?>
				</div>
				<div class="col-md-4">
					<form method="post" id="rate_form" action="">
						<b>Rate this opportunity</b>
						<br>

						<div style="display: inline-flex">
							<input value="<?php echo $rate_average ?>" id="input-rate" class="rating rating-loading"
							       data-min="0" data-max="5" data-step="0.5" name="rate_value"
							       data-size="xs" data-show-clear="false" data-show-caption="false"
								<?php if ( isset( $_SESSION[ 'facility-rate-' . $post->ID ] ) )
									echo 'data-disabled="true"' ?>
							>
							<input type="hidden" value="<?php echo $post->ID ?>" name="facility_id">
							<?php if ( ! isset( $_SESSION[ 'facility-rate-' . $post->ID ] ) ) { ?>
								<button id="btn_rate" type="submit" class="btn btn-success btn-xs"
								        style="float: right;">
									Rate
								</button>
							<?php } ?>
						</div>
						<br>Total votes : <span id="rate_number"><?php echo $rate_number ?></span>
					</form>
				</div>
			</div>
		</div>
		<hr>
		<div class="criteria">
			<div class="row">
				<div class="col-md-12">
					<h3>Criteria</h3>
				</div>
			</div>
			<dl class="dl-horizontal">
				<dt>Type of Finance:</dt>
				<dd><?php echo $financing_type ?></dd>
				<dt>Funding Sources:</dt>
				<dd><?php echo $funding_sources ?></dd>
				<dt>Stage:</dt>
				<dd><?php echo $stage ?></dd>
				<!--				<dt>Assets under management:</dt>-->
				<!--				<dd>--><?php //if ( $assets_under_management != "N/A" ) {
				//						echo $assets_under_management . ' ';
				//						echo $currency != "N/A" ? $currency : '';
				//					} else echo "---" ?><!--</dd>-->
				<!--				<dt>Financing -->
				<?php //echo $currency != "N/A" ? '(' . $currency . ')' : '' ?><!--:</dt>-->
				<!--				<dd><b>Min :</b> --><?php //echo $min ?><!-- &nbsp; &nbsp; <b>Max :</b> -->
				<?php //echo $max ?><!--</dd>-->
				<dt>Sectors:</dt>
				<dd><?php echo $sector ?></dd>
				<dt>Country:</dt>
				<dd><?php echo $country ?></dd>
				<dt>Countries covered:</dt>
				<dd><?php echo $operational_region ?></dd>
				<dt>Sustainability:</dt>
				<dd><?php echo $sustainability ?></dd>
				<dt>Description:</dt>
				<dd><?php echo $description ?></dd>
				<!--				<dt>N. Financed project:</dt>-->
				<!--				<dd>--><?php //echo $num_projects != "N/A" ? $num_projects : "---" ?><!--</dd>-->
				<!--				<dt>Total Investment:</dt>-->
				<!--				<dd>-->
				<?php //echo $total_investment != "N/A" ? $total_investment : '---' ?><!--</dd>-->
				<dt>Established:</dt>
				<dd><?php echo $established != "N/A" ? $established : "---" ?></dd>
				<dt>Active time:</dt>
				<dd><?php echo $active_time != "N/A" ? $active_time : '---' ?></dd>
			</dl>
		</div>
		<div class="contact">
			<h3>Contact</h3>

			<div class="row">
				<div class="col-md-6">
					<b>Website :</b> &nbsp;&nbsp;
					<a href="<?php echo $website ?>" target="_blank">

						<span style="width:100%; word-wrap:break-word; display:inline-block;"> <?php echo $website; ?>
							</span>
					</a>

				</div>
				<div class="col-md-6">
					<b>Phone :</b> &nbsp;&nbsp; <?php echo $phone ?>
				</div>
				<div class="col-md-6">
					<b>Email :</b> &nbsp;&nbsp; <?php echo $email ?>
				</div>
			</div>
		</div>
		<div class="footer" style="padding-top: 15px">
			<hr>
			<div class="row">
				<div class="col-md-4">
					<b>Created :</b> &nbsp;&nbsp; <?php echo get_the_date(); ?>
				</div>
				<div class="col-md-4">
					<b>Last modified :</b> &nbsp;&nbsp; <?php the_modified_date(); ?>
				</div>
				<div class="col-md-4">
					<b>Views :</b> &nbsp;&nbsp; <?php echo $views ? $views : 0 ?>
				</div>
			</div>
		</div>
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
endif;
?>
<?php get_template_part( 'templates', 'footer' ); ?>
