
<?php
    $host = $_SERVER['HTTP_HOST'];
    $http = ( $_SERVER['HTTPS'] == 'on') ? 'https://' : 'http://' ;
    $url = $http.$host;
    Header("content-type: application/javascript");
    ob_start();
 ?>

{
    "name" : "bidx-plugin",
    "slug" : "bidx-plugin",
    "download_url" : "<?php echo $url;?>/wp-content/bidx-plugin.zip",
    "version" : "0.1.3",
    "author" : "bidX development team",
    "sections" : {
        "description" : "Wordpress plugin for adding bidX functionality to a website."
    }
}

<?php
    $result = ob_get_clean();
    // Compess the result before to echoing it
    echo $result;
?>