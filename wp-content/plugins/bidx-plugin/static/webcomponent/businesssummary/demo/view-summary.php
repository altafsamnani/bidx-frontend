<?php

require_once "settings.php"; 
$settingClass = new settings();

$ssl = ($settingClass->is_ssl ()) ? 'https://' : 'http://';
$host = $ssl.$_SERVER['HTTP_HOST'];
$groupName = $settingClass->get_bidx_subdomain();   

?>

<html>
<head>
    <title>demogroup : Find Business Summaries</title>
            <link rel="stylesheet" href="<?php echo $host;?>/wp-content/themes/bidx-group-template/assets/css/bootstrap.css">   
            <link rel="stylesheet" href="<?php echo $host;?>/wp-content/plugins/bidx-plugin/static/css/bidx-plugin.css">
    </head>
    <body>
        <div id="wrap"> 
            <div>
                <div class="container">
                    <h1>Business summary selector webcomponent</h1>
                    <p>This component is a Javascript file hosted at bidx that allows for external lookup of BusinessSummaries that are owned by the user.<br />
                    It automatically fills a html select fields with options.
                    </p>
                    <h3>How does it work?</h3>
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
                    <hr />

                    <h1><?php echo ucfirst($groupName);?></h1>
                    <p>Ensure that you are logged in on a bidx system</p>

                    <div class="containerSummary">
                        <div class="bidx-viewBusinessSummary" data-bidxgroupid="8868" data-bidxgroupname="<?php echo $groupName;?>" data-labeltag="label" data-valuetag="div" data-rowclass="skipsorow" data-mainclass="skipsomain" data-adjclass="skipsoadj" />
                            <img src='<?php echo $host;?>/wp-content/themes/bidx/assets/img/ajax-loader.gif'>
                        </div>
                    </div>

                    <!-- Original Js  8868
                    <script type="text/javascript" src="<?php echo $host;?>/wp-content/plugins/bidx-plugin/static/webcomponent/businesssummary/js/view-summary.js?ver=20131121"></script> -->

                    <!-- Proxy Js  -->
                    <script type="text/javascript" src="<?php echo $host;?>/wp-content/plugins/bidx-plugin/static/webcomponent/businesssummary/view-summary.js/"></script>
                </div>
            </div>
        </div>
    </body>
</html>