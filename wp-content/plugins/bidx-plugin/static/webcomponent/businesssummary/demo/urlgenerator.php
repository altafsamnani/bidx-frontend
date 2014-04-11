<?php

require_once "settings.php"; 
$settingClass = new settings();

if(!empty($_POST)) {
	$host = ($_POST['url']) ? $_POST['url'] : false;
} else {
	$host = ($settingClass->is_ssl ()) ? 'https://' : 'http://'.$_SERVER['HTTP_HOST'];
}	

$groupName = $settingClass->get_bidx_subdomain( false, $host );

?>

<html>
	<head>
		<title><?php echo ucfirst($groupName);?> : URL Generator</title>
		    <link rel="stylesheet" href="<?php echo $host;?>/wp-content/themes/bidx-group-template/assets/css/bootstrap.css">   
    		<link rel="stylesheet" href="<?php echo $host;?>/wp-content/plugins/bidx-plugin/static/css/bidx-plugin.css">
	</head>
	<body>
		<div id="wrap">	
			<div >
				<div class="container">
					<div class="row"><div class="col-sm-12"><h1>Url generator for bidx web components</h1></div></div>				
					<div class="row">	
						<div class="col-sm-12">							
								<?php if(!$host) { ?>
									<div class="alert alert-danger">
							        	Please add URL.    
							    	</div>
						    	<?php } else { ?>
						    		<div class="alert alert-info">
							        	This url generator generates the url for skipso competition  
							    	</div>
						    	<?php }?>
				    	</div>
				    </div>
					<div class="row">			
						<div class="form-group <?php echo (!$host) ? 'has-error': '';?>">
							<form name="urlgenerator" method="post">
								<div class="col-sm-2"> <label> Enter the domain name </label></div>
								<div class="col-sm-6"><input class="form-control" type="url" name="url" placeholder="Please enter the url" /></div>
								<div class="col-sm-4"><input type="submit" value="Generate" class="btn btn-primary"/></div>
							</form>
						</div>
					</div>
					
					
						
            		<div class="row"><div class="col-sm-12"><h3> <?php echo ucfirst($groupName). ' webcomponent urls';?> </h3></div></div>
					
					<div class="row"><div class="col-sm-12"><h5> Group home page url </h5></div></div>
					<div class="row"><div class="col-sm-12"><div class="text-primary"> <?php echo $host;?>  </div></div></div>

					<div class="row">
						<div class="col-sm-12">							
							<div class="btn-group pull-right">
                        		<a class="btn btn-sm btn-primary" target="_blank" href="<?php echo $host.'/wp-content/plugins/bidx-plugin/static/webcomponent/businesssummary/demo/list-summary.php';?>"><i class="fa fa-pencil"></i> View demo</a>
                			</div>
                			<h5> Business summary dropdown url for skipso </h5>
						</div>
					</div>
					<div class="row"><div class="col-sm-12">
						<div class="text-primary"> <?php echo $host.'/wp-content/plugins/bidx-plugin/static/webcomponent/businesssummary/list-summary.js';?></div>
						<ul>
						<li>Add a select item to you html and add two specific attributes on the element
							<ul>
								<li>class="bidx-businesssummaryselector"</li>
								<li>data-bidxgroupdomain="<?php echo $groupName;?>"</li>
								<li>Example </li>
							</ul>
							<code>&lt;select class="bidx-businesssummaryselector" data-bidxgroupdomain="<?php echo $groupName;?>"&gt;&lt;option>Select Business&lt;/option&gt;&lt;select&gt;</code>
						</li>				
						<li>Load the script below the footer in the page.
							<code>
								&lt;script type="text/javascript"
							       src="<?php echo $host;?>/wp-content/plugins/bidx-plugin/static/webcomponent/businesssummary/list-summary.js"&gt;&lt;/script&gt;
							</code>		
						</li>
					</ul>
					</div></div>					
					<div class="row">
						<div class="col-sm-12">
							<div class="btn-group pull-right">
                        		<a class="btn btn-sm btn-primary" target="_blank" href="<?php echo $host.'/wp-content/plugins/bidx-plugin/static/webcomponent/businesssummary/demo/view-summary.php';?>"><i class="fa fa-pencil"></i> View demo</a>
                			</div>
							<h5> Business summary view url for skipso </h5>
							
						</div>
					</div>
					<div class="row"><div class="col-sm-12">
						<div class="text-primary"> <?php echo $host.'/wp-content/plugins/bidx-plugin/static/webcomponent/businesssummary/view-summary.js';?> </div>
						<ul>
	                        <li>Add a select item to you html and add two specific attributes on the element
	                            <ul>
	                                <li>class="bidx-viewBusinessSummary"</li>
	                                <li>data-bidxgroupid="8868" data-bidxgroupname="<?php echo $groupName;?>"</li>                                
	                            </ul>
	                            <code>&lt;div class="bidx-viewBusinessSummary" data-bidxgroupid="8868" data-bidxgroupname="<?php echo $groupName;?>" data-labeltag="label" data-valuetag="div" /&gt;</code>
	                        </li>
	                        <li>Load the script below the footer in the page.                
	                        <code>
	                            &lt;script type="text/javascript"
	                                       src="<?php echo $host;?>/wp-content/plugins/bidx-plugin/static/webcomponent/businesssummary/view-summary.js/"&gt;&lt;/script&gt;
	                        </code>
	                        </li>
                    	</ul>
					</div></div>

					<div class="row"><div class="col-sm-12"><h5> Logout url for Skipso </h5></div></div>
					<div class="row"><div class="col-sm-12"><div class="text-primary"> <?php echo $host.'/wp-admin/admin-ajax.php?action=bidx_signout&provider=skipso';?>  </div></div></div>
                	
					
				</div>
			</div>
		</div>
	</body>
</html>
