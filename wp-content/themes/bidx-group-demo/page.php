<?php 
	if ( is_front_page() ) {
		get_template_part('templates/content', 'intro'); 	
	}
	else {
		get_template_part('templates/page', 'header');
		get_template_part('templates/content', 'page'); 
	}
?>