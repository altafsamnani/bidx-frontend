<?php
	wp_enqueue_script( 'bidx-form' );
?>

	<!-- content starting here -->
	<div class="hero-block">

		<div class="container">
			<div class="row-fluid">

				<div class="span8">
					<div id="introCarousel" class="carousel slide">
						<?php
						$images = get_children(
									array(
									'post_parent' => $post->ID,
									'post_status' => 'inherit',
									'post_type' => 'attachment',
									'post_mime_type' => 'image',
									'order' => 'ASC',
									'orderby' => 'menu_order' )
									);
						?>
						<ol class="carousel-indicators">
<?php

						$count = 0;
						foreach ( $images as $id => $image ) {
?>
							<li data-target="#introCarousel" data-slide-to="<?php echo $count ?>" <?php if ($count == 0) { ?> class="active" <?php } $count++; ?>></li>
<?php
						}
?>
						</ol>


		                <!-- Carousel nav -->
		                <a class="carousel-control left" href="#introCarousel" data-slide="prev">&lsaquo;</a>
		                <a class="carousel-control right" href="#introCarousel" data-slide="next">&rsaquo;</a>

						<!-- Carousel items -->
						<div class="carousel-inner">
						<?php
							$count = 0;
							foreach ( $images as $id => $image ) {
								$img = wp_get_attachment_image_src( $image->ID, 400 );
						?>
							<div class="item <?php if ($count == 0) { ?>active<?php } $count++; ?>">
								<img class="img-rounded" src="<?php echo $img[0] ?>" />
							    <div class="carousel-caption img-rounded">

									<h4><?php echo $image -> post_title ?></h4>
			                    	<p><?php echo $image -> post_content ?></p>
			                    </div>
							</div>
<?php
							}
?>
						</div>
					</div>
				</div>

				<div class="span4">
					<div class="signup well">
						<!-- ##### Widget Signup Start ######-->
						<form class="fieldset" method="post" action="/register">
							<div><!-- this div is necessary for container overflow issue IE7 -->
								<h3><?php _e('Join bidX! Create your group','bidxtheme');?></h3>

								<div class="formfield control-group" data-validation='{"required":{"text":"<?php _e('This fields is mandatory')?>"},"typecheck":[{"email":{"text":"<?php _e('This is not a valid e-mail address')?>"}},{"custom":{"url":"/wp-admin/admin-ajax.php?action=bidx_request","apiurl":"members/validateUsername","apimethod":"get"}}]}'>
									<input type="email" name="username" placeholder="<?php _e('Your email address','bidxtheme');?>">
								</div>

								<div class="formfield control-group" data-validation='{"required":{"text":"<?php _e('This field is mandatory')?>"},"typecheck":[{"custom":{"url":"/wp-admin/admin-ajax.php?action=bidx_request","apiurl":"groups/validateGroupName","apimethod":"get"}}]}'>
									<input type="text" name="groupName" placeholder="<?php _e('Your group name','bidxtheme');?>">
								</div>

								<div class="formfield control-group" data-validation='{"required":{"text":"<?php _e('This fields is mandatory')?>"}}'>
									<input type="text" name="country" placeholder="<?php _e('Country','bidxtheme');?>">
								</div>

								<a href="#" class="btn btn-block btn-primary jsCreateGroup"><?php _e("Submit your request",'bidxtheme');?></a>
							</div>
						</form>

						<div class="group-creation-progress">
							<div class="text"><?php _e('Your request is being processed','bidxtheme');?></div>

							<div class="text sub"><?php _e('Thank you for your patience','bidxtheme');?></div>
						</div>
                        <div class="group-creation-success">
							<div class="text"><?php _e('You request has been sent','bidxtheme');?></div>

							<div class="text sub"><?php _e('Our service desk will contact you soon','bidxtheme');?></div>
						</div>

						<script type="text/javascript">

					    	$(function(){
					    		/*
					    			if handler sends back response it can include the following json:
					    			{
										status: 'OK',
										redirect:'<URL to redirect too>'
									},
									{ //not yet implemented
										status: 'ERROR',
										fields: [{field:fieldname,error:errormessage}[,]]
									}
					    		*/

					    		$(".fieldset").form({
					    			callToAction : '.jsCreateGroup', // the selector for submit button
					    			errorClass : 'error', //the css class used as error message
					    			url : '/wp-admin/admin-ajax.php?action=bidx_staffmail',
					    			beforeSubmit : function(){
										var $this=$(".fieldset");
							    		$this.fadeOut("fast", function(){
							    			$(".group-creation-progress").fadeIn('fast');
							    		});
					    			},
                                    success : function(data){

                                        var $success=$(".group-creation-progress");
                                        $success.hide();
							    			$(".group-creation-success").fadeIn('fast');

					    			},
					    			//custom error message for frontend registration in case group creation fails
					    			error: function(data){
					    				$(".group-creation-progress").html("<div class=\"text sub\"><?php _e('Group creation failed. Please reload the page and try again. If the problem persists, please contact us','bidxtheme')?>");

					    			}
					    		});
							});
					    </script>
						<!-- ##### Widget Signup End ######-->
					</div>
				</div><!-- end span4 -->
			</div><!-- end row-fluid -->
		</div><!-- end container -->
	</div>

<div class="container content-block howitworks">
		<div class="row-fluid text-left">
			<h2 ><?php _e('It’s all about growing businesses and creating jobs','bidxtheme');?></h2>
			<p class="text-left">
				<?php _e('If your goal is to grow, start or finance businesses in emerging markets, then bidX offers you an online solution to improve your results and impact.','bidxtheme');?>
				<?php printf(__('bidX is powered by BiD Network.  60,000 online members from 90 countries, 1500 mentors, 200 investors, 822 businesses started and grown, 130 businesses financed with over $17 million. 6500 jobs created.','bidxtheme'), '<br/>'); ?>
			</p>
			<p class="text-left">
				<?php printf( __( 'Use bidX to create your own online community, using your own brand, identity and language. Decide on your Group’s focus: a city, country, sector or industry.  Invite entrepreneurs to submit or create their business plans. Connect them with mentors, investors, and advisors. If your businesses are seeking export opportunities or international finance and advice, through bidX they can connect to our global network of online groups.', 'bidxtheme' ), '<br/>'); ?>
			</p>

		</div>
		<div class="row-fluid">
			<div class="text-center">
			<em><h5><?php _e('bidX provides the tools – you drive your network ','bidxtheme');?></em></h5>
			</div>
		</div>
		<div class="row-fluid">
			<div class="span4 howitworks-block howitworks-block-freefasteasysetup">
				<div class="text-center">
					<span class="howitworks-freefasteasysetup"></span>
				</div>
				<h3 class="title"><?php _e('1. Free, fast and easy set-up','bidxtheme');?></h3>
				<ul class="bidx-list-checks">
					<li><?php _e('Request a Group at bidX.net','bidxtheme');?></li>
					<li><?php _e('Customize your group page according to your specific brand','bidxtheme');?></li>
					<li><?php _e('Invite members, social media followers and contacts to join your group','bidxtheme');?></li>
					<li><?php _e('Grow your entrepreneurial ecosystem locally and worldwide!','bidxtheme');?></li>
				</ul>
			</div>
			<div class="span4 howitworks-block howitworks-block-sourceconnectfinance">
				<div class="text-center">
					<span class="howitworks-sourceconnectfinance"></span>
				</div>
				<h3 class="title"><?php _e('2. Source, Connect, Finance','bidxtheme');?></h3>
				<ul class="bidx-list-checks">
					<li><?php _e('Competitions: Engage promising businesses and accelerate their growth','bidxtheme');?></li>
					<li><?php _e('Mentoring: Connect your entrepreneurs with valuable free advice','bidxtheme');?></li>
					<li><?php _e('Matchmaking: Match the best businesses with committed investors','bidxtheme');?></li>
				</ul>
			</div>
			<div class="span4 howitworks-block howitworks-block-generaterevenues">
				<div class="text-center">
					<span class="howitworks-generaterevenues"></span>
				</div>
				<h3 class="title"><?php _e('3. Generate revenues','bidxtheme');?></h3>
				<ul class="bidx-list-checks">
					<li><?php _e('In 2014 you will be able to generate revenues through your group. bidX will be launching a scheme to share its revenues with Group moderators in a fair and transparent way.','bidxtheme');?></li>
				</ul>
			</div>
		</div>

		<hr />
	</div>


	<div class="container content-block">
		<div class="row-fluid text-center">
			<h2><?php _e('Ideal solutions','bidxtheme');?></h2>
			<p><?php _e('For entrepreneurs, investors, incubators, chambers of commerce, banks, investment funds...and more.','bidxtheme');?></p>
		</div>
		<div class="row-fluid">
			<div class="span4 usp-block bidx-well">
				<h3 class="title"><span class="fui-check"></span> <?php _e('Governments & Cities','bidxtheme');?></h3>
				<?php printf( __( 'Usually the parts of an entrepreneurial ecosystem are there, but they need to connected. Use bidX to integrate the players needed to grow businesses in your country or city. Also use bidX to monitor the growth of bidX Entrepreneurship groups in your country, province or city. %1$sContact%2$s', 'bidxtheme' ), '<a href="mailto:info@bidx.net">', '</a>' ); ?>
			</div>
			<div class="span4 usp-block bidx-well">
				<h3 class="title"><span class="fui-check"></span> <?php _e('Financial Sector','bidxtheme');?></h3>
				<?php printf( __( 'Banks, investment funds or business angel groups reject around 80%% of applicants. Use bidX to filter and rate the best business plans. Let your high potential businesses get access to mentoring. But also share dealflow: what a bank considers too risky, may be the ideal proposition for an investor. %1$sContact%2$s', 'bidxtheme' ), '<a href="mailto:info@bidx.net">', '</a>' ); ?>
			</div>
			<div class="span4 usp-block bidx-well">
				<h3 class="title"><span class="fui-check"></span> <?php _e('Incubators & Advisors','bidxtheme');?></h3>
				<?php printf( __( 'Use bidX to grow your network of businesses in need of advice and support. Offer them new services, international connections and importantly get them prepared for and matched with financiers. With bidX you will soon be able to generate a healthy revenue stream. %1$sContact%2$s', 'bidxtheme' ), '<a href="mailto:info@bidx.net">', '</a>' ); ?>
			</div>
		</div>
		<div class="row-fluid">
			<div class="span12 text-center">
				<?php _e('Grow your local businesses and create new jobs. Your economy depends on it!','bidxtheme');?>
			</div>
		</div>
		<hr />
	</div>


	<div class="container content-block oursolutions">
		<div class="row-fluid text-center">
			<h2><?php _e('We offer','bidxtheme');?></h2>
		</div>
		<div class="row-fluid">
			<div class="span4 usp-block bidx-well">
				<div>
					<strong><?php _e('Access to Knowledge','bidxtheme');?></strong>
				</div>
				<div class="sprite arrow-down solutions-arrow"></div>
				<div>
					<?php _e('We provide business plan templates, free mentoring, online tutorials and templates and Q&A functionality.','bidxtheme');?>
				</div>
			</div>
			<div class="span4 usp-block bidx-well">
				<div>
					<strong><?php _e('Access to Finance','bidxtheme');?></strong>
				</div>
				<div class="sprite arrow-down solutions-arrow"></div>
				<div>
					<?php _e('Financiers set their preferences and get alerts on business plans that are rated, filtered and match.','bidxtheme');?>
				</div>
			</div>
			<div class="span4 usp-block bidx-well">
				<div>
					<strong><?php _e('Access to Markets','bidxtheme');?></strong>
				</div>
				<div class="sprite arrow-down solutions-arrow"></div>
				<div>
					<?php _e('Find buyers and sellers near you. Find importers and exporters internationally. Gain market intelligence. Advertise your goods.','bidxtheme');?>
				</div>
			</div>
		</div>
		<div class="text-center">
			<a href="/features" class="btn btn-bidx-blue"><?php _e('View our services','bidxtheme');?><i class="fui-arrow-right pull-right"></i></a>
		</div>
		<hr />
	</div>

	<div class="container content-block ">
		<div class="text-left">
			<h2><?php _e('Why bidX - Our story','bidxtheme');?></h2>

		</div>
		<div class="row-fluid">
			<div class="span12 ">
				<p class="text-left">

				<?php printf(__('Over 80%% of the new jobs in any economy are created by fewer than 10%% of the companies operating in it. These are the small and medium sized businesses that grow consistently year after year. %1$s%1$sBidx is a web-services company with a mission. We aim to integrate the often fragmented entrepreneurial ecosystems in countries thereby unleashing the growth potential of small fast growing businesses','bidxtheme'), '<br/>'); ?>
				</p>
			</div>
		</div>
		<div class="text-center">
			<a href="/about" class="btn btn-bidx-blue"><?php _e('About us','bidxtheme');?><i class="fui-arrow-right pull-right"></i></a>
		</div>
		<hr />
	</div>

