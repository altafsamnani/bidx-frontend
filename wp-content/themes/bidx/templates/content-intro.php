	<!-- content starting here -->
	<div class="hero-block">
		<div class="top-border"></div>
		<div class="bottom-border"></div>
		<div class="container">
			<!-- <div class="shade-top"></div> -->
			<div class="hero">
				<div class="pay-off ">
					<div class="slider slide1">
						<h1>Create your business group online
							<span>Start connecting entrepreneurs with investors - today</span>
						</h1>

					</div>
					<div class="slider-nav">
						<ul>
							<li class="active"></li>
							<li></li>
							<li></li>

						</ul>
					</div>
				</div>

				<div class="signup">
					<!-- ##### Widget Signup Start ######-->
					<form class="fieldset">
						<div><!-- this div is necessary for container overflow issue IE7 -->
							<div class="title">Welcome offer! Contact us to create a Group for free.</div>

							<div class="formfield" data-validation='{"required":{"text":"This fields is mandatory"},"typecheck":[{"email":{"text":"This is not a valid e-mail address"}},{"custom":{"url":"/wp-admin/admin-ajax.php?action=bidx_request","apiurl":"members/validateUsername","apimethod":"get"}}]}'>
								<input type="email" name="username" placeholder="Your email address">
							</div>
							
							<div class="formfield" data-validation='{"required":{"text":"This field is mandatory"},"typecheck":[{"custom":{"url":"/wp-admin/admin-ajax.php?action=bidx_request","apiurl":"groups/validateGroupName","apimethod":"get"}}]}'>
								<input type="text" name="groupName" placeholder="Your group name" class="highlight" value="">
							</div>

							<div class="formfield" data-validation='{"required":{"text":"This fields is mandatory"}}'>
								<input type="text" name="country" placeholder="Country">

							</div>
							<a href="#" class="button primary jsCreateGroup">Request your group</a>
							<!--  
							<div class="login">
								Already registered your Group?
								<a href="/login" class="button secondary">Login</a>
							</div>
							-->
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
				    			url : '/wp-admin/admin-ajax.php?action=bidx_request',
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

				    		(function() {
				    			/*custom event to fix field positioning when validation kicks in*/
				    			var fs = $(".fieldset");

				    			var startMargin = parseInt(fs.css("margin-top").replace("px",""));
 								//when change occurs count error messages for this fieldset an calculate margin correction
					    		$(".fieldset :input").change(correctMargins);
					    		$(".jsCreateGroup").click(correctMargins);
				    			function correctMargins() {
				    				var removeMargin = 0;
					    			//exclude

									var fields = fs.find(":input").map(function(){
					    				return $(this).attr("name")}).each(function(i,name){
					    					var match = JSON.stringify($(".fieldset").form("getElement",name).validation).match(/"error":true/g);
					    				//	console.log(match);
					    					if(match != null)
					    						removeMargin += 10;
					    				});
			    					fs.animate({
										"margin-top":startMargin-removeMargin
									}, 'fast');
				    			}

							})();
						});
				    </script>
					<!-- ##### Widget Signup End ######-->
				</div>

			</div>
			<!-- <div class="shade-bottom"></div> -->

		</div><!-- end container -->
	</div>

	<div class="block-odd">
		<br/>
		<br/>
	</div>
	
	<div class="block-even" style="padding: 10px;">
		<div class="container">
			<div class="row-fluid text-center">
				<h1>Why Bidx?</h1>
				<p>If you help businesses in emerging markets to start, grow or find finance, then you need bidX.<br />
				We work for incubators, business schools, chambers of commerce, governments, banks, investment funds, accountants...</p>
			</div>
			<div class="row-fluid">
				<div class="span4 text-center" style="background-color:white; padding:10px">
					<h3>bidX solutions</h3>
					Support intermediaries up-scale services for their network of entrepreneurs, mentors and investors.
				</div>
				<div class="span4 text-center" style="background-color:white; padding:10px">
					<h3>bidX platform</h3>
					Offers access to a global entrepreneurship marketplace.
				</div>
				<div class="span4 text-center" style="background-color:white; padding:10px">
					<h3>bidX model</h3>
					Rewards your collaboration with the opportunity to generate revenue.
				</div>
			</div>
		</div>
	</div>
	
	<div class="block-odd">
		<br/>
		<br/>
	</div>	

	<div class="block-even" style="padding: 10px;">
		<div class="container">
			<div class="row-fluid text-center">
				<h1>How It Works</h1>
				<p>To grow your network of entrepreneurs, mentors and investors bidX invites you to create a Group.<br />
The Group is an online space aggregating tools to support, virtually, all your services from business idea rating to successful matchmaking.</p>
			</div>
			<div class="row-fluid">
				<div class="span4 thumbnail" style="background-color:white; padding:10px">
					<img src="/wp-content/themes/bidx/assets/css/FlatUI/images/icons/Key@2x.png"/>
					<h3>1. Free, fast and easy set-up</h3>
					<ul>
						<li>Submit a request to create a Group at bidX.net</li>
						<li>Customize and brand your Group page</li>
						<li>Invite members, social media followers and contacts to join your Group</li>
					</ul>
				</div>
				<div class="span4 thumbnail" style="background-color:white; padding:10px">
					<img class="" src="/wp-content/themes/bidx/assets/css/FlatUI/images/icons/Map@2x.png" />
					<h3>2. Source, Connect, Finance</h3>
					<ul>
						<li>Competition feature: Engage promising businesses and accelerate their growth</li>
						<li>Mentoring feature: Unleash the potential of entrepreneurs, connecting them with the highest rated mentors</li>
						<li>Matchmaking feature: Match the best businesses with committed investors</li>
					</ul>
				</div>
				<div class="span4 thumbnail" style="background-color:white; padding:10px">
					<img src="/wp-content/themes/bidx/assets/css/FlatUI/images/icons/Money@2x.png" />
					<h3>3. Generate revenuesl</h3>
					<ul>
						<li>Our solutions are not only innovative but also profitable. We offer a fair and transparent revenue sharing package</li>
						<li>We are actively looking out for functional and content partners to provide our clients with the best options</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	
	<div class="block-odd">
		<br/>
		<br/>
	</div>
	
	<div class="block-even" style="padding: 10px;">
		<div class="container">
			<div class="row-fluid text-center">
				<h1>Our Solutions</h1>
				<p>Is your bank or investment fund receiving many business plans every day? 
				We recommend the bidX Rating module to screen and select finance ready plans according 
				to your criteria. Does your incubator need innovative tools to reach and engage 
				entrepreneurs?  Use the bidX Competition feature - allowing you to manage a business plan competition, 
				including mentoring, vetting and jury coordination - to find and accelerate the finance of promising businesses in your region.</p>
				<p>All the community management tools you need are included; events, news, discussions, messaging. 
				Should your group want to engage investors, we will make sure your information is safe and secure. 
				The bidX Business Proposal is suggested to entrepreneurs that need to strengthen their idea into a strong proposal for finance.</p>
				<button>Our Features</button>
			</div>			
		</div>
	</div>		
			
	<div class="block-odd">
		<br/>
		<br/>
	</div>
	
	<div class="block-even" style="padding: 10px;">
		<div class="container">
			<div class="row-fluid text-center">
				<h1>NOT A SERVICE PROVIDER?</h1>
				<p>We do have solutions for entrepreneurs &amp; investors!</p>
			</div>
			<div class="row-fluid">
				<div class="span6" style="background-color:white; padding:10px">
					<h3>For Entrepreneurs</h3>
					If you are an entrepreneur and need to expose your business to investors 
					you are in the right place.<br />
					<br /> 	
					<strong>What's in it for me?</strong>
					<ul>
						<li>Use templates &amp; services to create finance ready Business Proposals</li>
						<li>Join Groups to generate leads for your business, network with like-minded professionals and find the expertise to grow your business</li>
						<li>Find and connect with mentors &amp; investors</li>
					</ul>
					<button>Entrepreneurs</button>
				</div>
				<div class="span6" style="background-color:white; padding:10px">
					<h3>For Investors</h3>
					As an investor you will have access to the best Business Proposals matching your preferences.<br />
					<br /> 	
					<strong>What's in it for me?</strong>
					<ul>
						<li>Get alerts of the latest relevant businesses based on your interests</li>
						<li>Find and Connect with entrepreneurs in selected areas</li>
						<li>Join Groups of Business and Finance service providers to network and generate leads</li>
					</ul>
					<button>Investors</button>				
				</div>				
			</div>			
		</div>
	</div>
			
	<div class="block-odd">
		<br/>
		<br/>
	</div>
		
		
	<?php add_action('wp_footer', 'addToFooter',200);

		function addToFooter() {
			$content = '<script type="text/javascript" src="/wp-content/themes/plugins/form.js"></script>';
			echo $content;
		}
	 ?>


