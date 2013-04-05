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
							<div class="title">Start your free 3 week trial today</div>
						
							<div class="formfield" data-validation='{"required":{"text":"This field is mandatory"},"custom":{"url":"/customhandler","text":"Custom check went wrong"}}'>
								<input type="text" name="groupname" placeholder="Your group name" class="highlight">
							</div>
														
							<div class="formfield" data-validation='{"required":{"text":"This fields is mandatory"},"email":{"text":"This is not a valid e-mail address"},"custom":{"url":"/customhandler","text":"Custom check went wrong"}}'>
								<input type="email" name="email" placeholder="Your email address" >
							</div>
					
							<div class="formfield" data-validation='{"required":{"text":"This fields is mandatory"}}'>
								<input type="password" name="password" placeholder="Your password">
								
							</div>
							<a href="#" class="button primary jsCreateGroup">Create your group</a>
							<div class="login">
								Already registered your Group?
								<a href="#" class="button secondary">Login</a>
							</div>
						</div>
					</form>
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
				    			url : '/handler/creategroup', //the handler where to post to

				    		});

				    		(function() {
				    			/*custom event to fix field positioning when validation kicks in*/
				    			var fs = $(".fieldset");
				    			var startMargin = parseInt(fs.css("margin-top").replace("px",""));
 								//when change occurs count error messages for this fieldset an calculate margin correction
					    		$(".fieldset :input").change(function(){
					    			var removeMargin = 0;
									var fields = fs.find(":input").map(function(){
					    				return $(this).attr("name")}).each(function(i,name){
					    					var match = JSON.stringify($(".fieldset").form("getElement",name).validation).match(/"error":true/g);
					    					if(match != null)
					    						removeMargin += 10;
					    				});
			    					fs.animate({
										"margin-top":startMargin-removeMargin
									}, 'fast');
					    		});
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
	
	<?php add_action('wp_footer', 'addToFooter',200);

		function addToFooter() {
			$content = '<script type="text/javascript" src="/'.THEME_PATH.'/assets/js/form.js"></script>';
			echo $content;
		}
	 ?>


