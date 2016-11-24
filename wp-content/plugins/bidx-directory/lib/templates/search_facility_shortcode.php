<?php

$investment_max = Facility::get_post_meta_max_investment();
$investment_min = 0;
?>
<style>
	.slider-selection {
		background: #0C8ECF;
	}

	.slider.slider-horizontal {
		width: 100%;
	}

	#loading_info.loading {
		display: none;
	}

	#result_content.loading > * {
		opacity: 0.2;
	}

	#result_content.loading:before {
		padding: 22px;
		color: #000;
		width: 100%;
		box-sizing: border-box;
	}

	.page-numbers {
		display: inline-block;
		padding: 5px 10px;
		margin: 0 2px 0 0;
		border: 1px solid #eee;
		line-height: 1;
		text-decoration: none;
		border-radius: 2px;
		font-weight: 600;
	}

	.page-numbers.current, a.page-numbers:hover {
		background: #f9f9f9;
	}
</style>

<div class="row">
	<div class="col-sm-12 col-md-3">

		<form method="get" id="searchform" action="" role="search">
			<div class="page-header" style="margin: 0;">
				<h2 class="page-title"><?php printf( __( 'Filters', 'shape' ) ); ?></h2>
			</div>
			<label for="s" class="assistive-text"><?php _e( 'Search', 'ibs-plugin' ); ?></label>
			<input type="text" class="form-control" name="s"
			       value="<?php echo esc_attr( get_search_query() ); ?>"
			       id="s" placeholder="<?php esc_attr_e( 'Search &hellip;', 'ibs-plugin' ); ?>"/>
			<input type="hidden" name="post_type" value="facility"/>
			<label for="facility_sector"
			       class="assistive-text"><?php _e( 'Sector', 'ibs-plugin' ); ?></label>
			<select multiple style="width:100%" class="form-control" name="facility_sector[]"
			        id="facility_sector">
				<?php include_once 'parts/sector.php' ?>

			</select>
			<label for="facility_organizational_type"
			       class="assistive-text"><?php _e( 'Organizational type', 'ibs-plugin' ); ?></label>
			<select multiple style="width:100%" class="form-control" name="facility_organizational_type[]"
			        id="facility_organizational_type">
				<?php include_once 'parts/organisaions_type.php' ?>
			</select>

<!--			<label for="facility_country"-->
<!--			       class="assistive-text">--><?php //_e( 'Country', 'ibs-plugin' ); ?><!--</label>-->
<!--			<select multiple style="width:100%" class="form-control" name="facility_country[]"-->
<!--			        id="facility_country">-->
<!--				--><?php //include_once 'parts/country.php' ?>
<!--			</select>-->

<!--			<label for="facility_operational_region"-->
<!--			       class="assistive-text">--><?php //_e( 'Operational Region', 'ibs-plugin' ); ?><!--</label>-->
<!--			<select multiple style="width:100%" class="form-control" name="facility_operational_region[]"-->
<!--			        id="facility_operational_region">-->
<!--				--><?php //include_once 'parts/regions.php' ?>
<!--			</select>-->

			<label for="facility_country"
			       class="assistive-text"><?php _e( 'Country', 'ibs-plugin' ); ?></label>
			<select multiple style="width:100%" class="form-control" name="facility_country[]"
			        id="facility_country">
				<?php include_once 'parts/country.php' ?>
			</select>

			<label for="facility_financing_type"
			       class="assistive-text"><?php _e( 'Financing type', 'ibs-plugin' ); ?></label>
			<select multiple style="width:100%" class="form-control" name="facility_financing_type[]"
			        id="facility_financing_type">
				<?php include_once 'parts/financing_type.php' ?>

			</select>
			<label for="facility_stage"
			       class="assistive-text"><?php _e( 'Stage', 'ibs-plugin' ); ?></label>
			<select multiple style="width:100%" class="form-control" name="facility_stage[]"
			        id="facility_stage">
				<?php include_once 'parts/stage.php' ?>

			</select>
			<!--			<label for="facility_investment_min_max"-->
			<!--			       class="assistive-text">--><?php //_e( 'Investment', 'ibs-plugin' ); ?><!--</label>-->
			<!--			<input name="facility_investment_min_max" class="form-control col-md-12"-->
			<!--			       id="facility_investment_min_max" type="text" value="" data-slider-min="0"-->
			<!--			       data-slider-max="--><?php //echo $investment_max ? $investment_max : 0; ?><!--"-->
			<!--			       data-slider-step="100"-->
			<!--			       data-slider-value="[--><?php //echo $investment_min ? $investment_min : 0 ?><!--,-->
			<?php //echo $investment_max ? $investment_max : 0; ?><!--]"/>-->
			<!--			<label for="facility_currency"-->
			<!--			       class="assistive-text">--><?php //_e( 'Currency', 'ibs-plugin' ); ?><!--</label>-->
			<!--			<select multiple style="width:100%" class="form-control" name="facility_currency[]" id="facility_currency">-->
			<!--				--><?php //include_once 'parts/currency.php' ?>
			<!---->
			<!--			</select>-->
		</form>
	</div>
	<div class="col-sm-12 col-md-9">
		<div class="page-header" style="margin: 0;">
			<h2 class="page-title"><?php printf( __( 'Search Results', 'shape' ), '<span>' . get_search_query() . '</span>' ); ?></h2>
		</div>
		<div id="loading_info" class="alert alert-info loading" style="margin-top: 7px; margin-bottom: 8px;">
			<strong><i
					class="fa fa-refresh"></i>&nbsp; Loading New Facilities...</strong>
		</div>
		<div id="result_content"></div>
	</div>
</div>

<script>
	jQuery("select").select2({
		placeholder: "All",
		allowClear: true
	});
	jQuery("#facility_investment_min_max").slider({});

	jQuery(document).ready(function () {
		jQuery('#searchform').submit();
	});
	jQuery("input").on("change", function () {
		jQuery('#searchform').submit();
	});
	jQuery("input:text").on("keyup", function () {
		jQuery('#searchform').submit();
	});
	jQuery("select").on("change", function () {
		jQuery('#searchform').submit();
	});
	jQuery(function ($) {
		$('#result_content').on('click', '#pagination a', function (e) {
			e.preventDefault();
			var link = $(this).attr('href');
			var page = getParameterByName("paged", link);
			$('<input>').attr({
				type: 'hidden',
				id: 'paged',
				name: 'paged',
				value: page
			}).appendTo('#searchform');
			jQuery('#searchform').submit();
			jQuery('input').remove('#paged');


		});
	});
	jQuery(document).on('submit', '#searchform', function () {
		var $form = jQuery(this);
		var $content = jQuery('#result_content');
		var $loading = jQuery('#loading_info');

		jQuery.ajax({
			type: 'post',
			url: "<?php echo admin_url('admin-ajax.php?action=load_search_results'); ?>",
			data: $form.serialize(),
			dataType: 'html',
			beforeSend: function () {
				$content.addClass('loading');
				$loading.removeClass('loading');
			},
			success: function (response) {
				$content.removeClass('loading');
				$loading.addClass('loading');
				$content.html(response);
			}
		});
		return false;
	});

	function getParameterByName(name, url) {
		if (!url) url = window.location.href;
		url = url.toLowerCase(); // This is just to avoid case sensitiveness
		name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}
</script>

