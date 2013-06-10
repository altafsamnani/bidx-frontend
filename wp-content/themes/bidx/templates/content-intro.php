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
							foreach ( $images as $id => $image ) { ?>
							<li data-target="#introCarousel" data-slide-to="<?php echo $count ?>"
							<?php if ($count == 0) { ?> class="active" <?php } $count++; ?>></li>
						<?php } ?>
						</ol>
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
						<?php } ?>
						</div>
					</div>
				</div>

				<div class="span4">
					<div class="signup well">
						<!-- ##### Widget Signup Start ######-->
						<form class="fieldset" method="post" action="/register">
							<div><!-- this div is necessary for container overflow issue IE7 -->
								<h3>Welcome offer! Contact us to create a Group for free.</h3>

								<div class="formfield control-group" data-validation='{"required":{"text":"This fields is mandatory"},"typecheck":[{"email":{"text":"This is not a valid e-mail address"}},{"custom":{"url":"/wp-admin/admin-ajax.php?action=bidx_request","apiurl":"members/validateUsername","apimethod":"get"}}]}'>
									<input type="email" name="username" placeholder="Your email address">
								</div>

								<div class="formfield control-group" data-validation='{"required":{"text":"This field is mandatory"},"typecheck":[{"custom":{"url":"/wp-admin/admin-ajax.php?action=bidx_request","apiurl":"groups/validateGroupName","apimethod":"get"}}]}'>
									<input type="text" name="groupName" placeholder="Your group name">
								</div>

								<div class="formfield control-group" data-validation='{"required":{"text":"This fields is mandatory"}}'>
									<input type="text" name="country" placeholder="Country">
								</div>

								<a href="#" class="btn btn-block btn-primary jsCreateGroup">Submit your request</a>
							</div>
						</form>

						<div class="group-creation-progress">
							<div class="text">Your request is sent.</div>
							<div class="loader"></div>
							<div class="text sub">Our service desk will contact you soon.</div>
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
//					    			url : '/wp-admin/admin-ajax.php?action=bidx_request',
					    			apiurl : 'groups',
					    			apimethod : 'post',
					    			beforeSubmit : function(){
										var $this=$(".fieldset");
							    		$this.fadeOut("fast", function(){
							    			$(".group-creation-progress").fadeIn('fast');
							    		});
					    			},
					    			//custom error message for frontend registration in case group creation fails
					    			error: function(data){
					    				$(".group-creation-progress").html("<div class=\"text sub\">Group creation failed. Please reload the page and try again.<br/> If the problem persists, please contact us.");
					    				if(data.text) {
					    					$(".group-creation-progress").append(data.text);
					    				}
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

	<div class="container content-block">
		<div class="row-fluid text-center">
			<h2>Why bidX?</h2>
			<p>If you help businesses in emerging markets to start, grow or find finance, then you need bidX.<br />
			We work for incubators, business schools, chambers of commerce, governments, banks, investment funds, accountants...</p>
		</div>
		<div class="row-fluid">
			<div class="span4 usp-block bidx-well">
				<h3 class="title"><span class="fui-check"></span> bidX solutions</h3>
				Support intermediaries up-scale services for their network of entrepreneurs, mentors and investors.
			</div>
			<div class="span4 usp-block bidx-well">
				<h3 class="title"><span class="fui-check"></span> bidX platform</h3>
				Offers access to a global entrepreneurship marketplace.
			</div>
			<div class="span4 usp-block bidx-well">
				<h3 class="title"><span class="fui-check"></span> bidX model</h3>
				Rewards your collaboration with the opportunity to generate revenue.
			</div>
		</div>

		<hr />
	</div>

	<div class="container content-block howitworks">
		<div class="row-fluid text-center">
			<h2>How It Works</h2>
			<p>To grow your network of entrepreneurs, mentors and investors bidX invites you to create a Group.<br />
The Group is an online space aggregating tools to support, virtually, all your services from business idea rating to successful matchmaking.</p>
		</div>
		<div class="row-fluid">
			<div class="span4 howitworks-block howitworks-block-freefasteasysetup">
				<div class="text-center">
					<span class="howitworks-freefasteasysetup"></span>
				</div>
				<h3 class="title">1. Free, fast and easy set-up</h3>
				<ul class="unstyled bidx-bullet-list">
					<li><span class="fui-check"></span> Submit a request to create a Group at bidX.net</li>
					<li><span class="fui-check"></span> Customize and brand your Group page</li>
					<li><span class="fui-check"></span> Invite members, social media followers and contacts to join your Group</li>
				</ul>
			</div>
			<div class="span4 howitworks-block howitworks-block-sourceconnectfinance">
				<div class="text-center">
					<span class="howitworks-sourceconnectfinance"></span>
				</div>
				<h3 class="title">2. Source, Connect, Finance</h3>
				<ul class="unstyled bidx-bullet-list">
					<li><span class="fui-check"></span> Competition feature: Engage promising businesses and accelerate their growth</li>
					<li><span class="fui-check"></span> Mentoring feature: Unleash the potential of entrepreneurs, connecting them with the highest rated mentors</li>
					<li><span class="fui-check"></span> Matchmaking feature: Match the best businesses with committed investors</li>
				</ul>
			</div>
			<div class="span4 howitworks-block howitworks-block-generaterevenues">
				<div class="text-center">
					<span class="howitworks-generaterevenues"></span>
				</div>
				<h3 class="title">3. Generate revenues</h3>
				<ul class="unstyled bidx-bullet-list">
					<li><span class="fui-check"></span> Our solutions are not only innovative but also profitable. We offer a fair and transparent revenue sharing package</li>
					<li><span class="fui-check"></span> We are actively looking out for functional and content partners to provide our clients with the best options</li>
				</ul>
			</div>
		</div>

		<hr />
	</div>

	<div class="container content-block">
		<div class="row-fluid text-center">
			<h2>Our Solutions</h2>
			<p>Is your bank or investment fund receiving many business plans every day?
			We recommend the bidX Rating module to screen and select finance ready plans according
			to your criteria. Does your incubator need innovative tools to reach and engage
			entrepreneurs?  Use the bidX Competition feature - allowing you to manage a business plan competition,
			including mentoring, vetting and jury coordination - to find and accelerate the finance of promising businesses in your region.</p>
			<p>All the community management tools you need are included; events, news, discussions, messaging.
			Should your group want to engage investors, we will make sure your information is safe and secure.
			The bidX Business Proposal is suggested to entrepreneurs that need to strengthen their idea into a strong proposal for finance.</p>
			<a href="/features" class="btn btn-primary btn-large">Our Features<i class="fui-arrow-right pull-right"></i></a>
		</div>

		<hr />
	</div>

	<div class="container content-block notaserviceprovider">
		<div class="text-center">
			<h2>Not a service provider?</h2>
			<p>We do have solutions for entrepreneurs &amp; investors!</p>
		</div>
		<div class="row-fluid">
			<div class="span6 bidx-well notaserviceprovider-block">
				<h3 class="title">For Entrepreneurs</h3>
				<p>If you are an entrepreneur and need to expose your business to investors
				you are in the right place.</p>
				<h5 class="subtitle">What's in it for me?</h5>
				<ul class="unstyled bidx-bullet-list">
					<li><span class="fui-check"></span> Use templates &amp; services to create finance ready Business Proposals</li>
					<li><span class="fui-check"></span> Join Groups to generate leads for your business, network with like-minded professionals and find the expertise to grow your business</li>
					<li><span class="fui-check"></span> Find and connect with mentors &amp; investors</li>
				</ul>
				<a href="/entrepreneurs" class="btn btn-primary">Entrepreneurs <i class="fui-arrow-right pull-right"></i></a>
			</div>
			<div class="span6 bidx-well notaserviceprovider-block">
				<h3 class="title">For Investors</h3>
				<p>As an investor you will have access to the best Business Proposals matching your preferences.</p>
				<h5 class="subtitle">What's in it for me?</h5>
				<ul class="unstyled bidx-bullet-list">
					<li><span class="fui-check"></span> Get alerts of the latest relevant businesses based on your interests</li>
					<li><span class="fui-check"></span> Find and Connect with entrepreneurs in selected areas</li>
					<li><span class="fui-check"></span> Join Groups of Business and Finance service providers to network and generate leads</li>
				</ul>
				<a href="/investors" class="btn btn-primary">Investors <i class="fui-arrow-right pull-right"></i></a>
			</div>
		</div>
	</div>
