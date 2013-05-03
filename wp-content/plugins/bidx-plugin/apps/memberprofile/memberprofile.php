<?php
require_once( '../generic.php' );
require_once( '../../services/session-service.php' );

/* Checks session and injects the js code */
$sessionObj = new SessionService();

$sessionObj->isLoggedIn();

function register_memberprofile_bidx_ui_libs()
{
wp_register_script( 'memberprofile', plugins_url( 'static/js/memberprofile.js', __FILE__ ), array(bootstrap), '20130501', TRUE );
wp_enqueue_script( 'memberprofile' );

wp_register_style( 'memberprofile', plugins_url( 'static/css/memberprofile.css', __FILE__ ), array('bootstrap','bootstrap-responsive'), '20130501', 'all' );
wp_enqueue_style( 'memberprofile' );
}
add_action('wp_enqueue_scripts', 'register_memberprofile_bidx_ui_libs');
?>
<h1>Memberprofile</h1>

<p class="lead">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce eget tristique dui. 
Curabitur feugiat bibendum ipsum vitae porta. Fusce tempus turpis a eros elementum at dignissim libero vulputate. 
Sed tempus vulputate lorem, sed rutrum orci varius in. Suspendisse gravida pharetra libero, non egestas risus blandit eget. 
Ut sed iaculis sem. Fusce blandit condimentum malesuada.</p>

<p>Phasellus id tortor et leo pellentesque gravida. Praesent in felis eget risus bibendum vehicula nec non tellus. 
Vivamus sem justo, aliquam at mattis sed, varius vitae turpis. Integer id auctor felis. 
Mauris tincidunt eros dui, aliquam congue erat. Proin viverra arcu sed tortor egestas vitae lobortis nunc ultrices. 
Proin aliquam tellus eget urna mollis bibendum. Nunc dapibus nisi quis neque porttitor id tincidunt velit pharetra. 
Duis eu blandit felis.</p>

<p>Curabitur sodales vestibulum magna, a varius nisl auctor vitae. Nunc rutrum arcu et augue sagittis ac pulvinar neque vulputate. 
Sed nulla ante, luctus sed commodo vel, scelerisque in magna. Pellentesque sodales, augue sit amet tempus auctor, 
lorem nisi interdum metus, quis viverra lacus libero nec nulla. Morbi interdum urna eu leo tincidunt vehicula. 
Aliquam erat volutpat. Nulla auctor est ut nibh vehicula sed iaculis nunc ultricies. 
In vehicula velit at lacus imperdiet mattis. Nam posuere eros at lacus fringilla eu lacinia arcu imperdiet. 
Duis tempus nibh eget nibh dapibus sed ultricies elit pulvinar. In placerat pharetra nisl. 
Sed elit tortor, dapibus a feugiat vehicula, pellentesque ut massa. 
Maecenas vulputate magna dictum tellus luctus eu tincidunt neque faucibus. 
Maecenas porta, elit at eleifend blandit, lorem augue mattis elit, in viverra mi lectus vitae justo. 
Quisque pulvinar augue quis purus malesuada at volutpat est dapibus.</p>

<p>Integer libero dolor, ullamcorper in varius nec, condimentum vitae dui. Integer ullamcorper laoreet metus, 
aliquet iaculis nisi imperdiet vel. Sed varius felis in massa sollicitudin pulvinar. Donec nec urna pulvinar lectus 
porttitor pharetra. Praesent velit est, commodo non ultricies ac, rhoncus non ante. Quisque sed odio leo. 
Cras non nulla sed enim blandit condimentum. Morbi in sem felis, non pretium mi. 
Aliquam viverra vulputate mi a mollis. Aenean viverra venenatis porttitor. 
Ut laoreet sapien non purus dictum at malesuada augue volutpat. Cum sociis natoque penatibus et magnis dis parturient montes, 
nascetur ridiculus mus. Integer ultricies ipsum eget libero adipiscing dignissim. Morbi arcu elit, lobortis sed convallis sed, 
auctor non nibh.</p>

<p>Etiam vel diam mauris. Sed vestibulum bibendum purus, vel commodo massa pulvinar quis. Nam eleifend odio vel ante malesuada 
auctor. Sed eleifend auctor semper. Morbi sed ultricies nisl. Praesent hendrerit, metus vitae ultricies porta, urna mauris 
ultricies enim, in vulputate ante elit eget elit. Suspendisse at lacus dapibus enim euismod rutrum. 
Aliquam lacinia felis quis elit iaculis fringilla. Nulla facilisi. Suspendisse potenti. 
Cras arcu neque, elementum at feugiat nec, aliquet vel nunc. Nulla vel rhoncus quam. Maecenas molestie, eros ac rutrum 
dignissim, mi libero vestibulum turpis, in molestie nisi lorem bibendum arcu. 
Nullam et est ac nulla placerat cursus non ut neque.</p>