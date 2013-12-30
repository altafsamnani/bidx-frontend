<?php get_template_part('templates/page', 'header'); ?>
<div class="container">
	<div class="row">&nbsp;</div>
	<div class="row">
		<div class="alert alert-danger col-sm-8 col-sm-offset-2">
			<button type="button" class="close fa fa-times" data-dismiss="alert"></button>
			<h3>Error</h3>
	        <p><?php _e('Sorry, but the page you were trying to view does not exist.', 'roots'); ?></p>
	        <p><?php _e('It looks like this was the result of either:', 'roots'); ?></p>
			<ul>
			  <li><?php _e('a mistyped address', 'roots'); ?></li>
			  <li><?php _e('an out-of-date link', 'roots'); ?></li>
			</ul>
			<a href="javascript:window.history.back()" class="btn btn-danger btn-wide">Go Back</a>
	        <a href="/search/q=<?php $_SERVER['REQUEST_URI'] ?>" class="btn btn-wide">Search for it</a>
	    </div>
	</div>
</div>
