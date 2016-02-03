<!-- 
	Grabs page content marked as homepage for logged-in or public.
	The selector is defined in the lib/init.php file so the location can be set per page.
	
	TODO : NEEDS TO BE MOVED TO HOMEPAGE definition 
	This needs to be a standard page
	
	
-->
<?php 

$args = array(
		'post_type'	 	 => 'page'
	  , 'posts_per_page' => -1
 	  , 'meta_query' => array( 
        	array(
            	'key'   => '_wp_page_template', 
            	'value' => 'template-homepage.php'
        	)	
    	)
	  , 'orderby' => 'menu_order'
	  , 'order' => 'DESC' 	
	);

$query = new WP_Query($args);

echo '<div class="main-content">';
if ( $the_query->have_posts() ) {
	
	while ( $the_query->have_posts() ) {
		
		$the_query->the_post();
		
		$meta = get_post_custom();
		if ( ( is_loggedin()  && $meta['logged-in-homepage'] === 'true' ) || 
			 ( !is_loggedin() && $meta['public-homepage'] === 'true' ) ) {
			
			echo '<article><div>' . the_post() . '</div></article>';
			
		} 	
	}
	
} else {
	// no posts found message
	echo "<div class='errormessage'>".  __( "No posts assigned to this homepage.", bid-textdomain ) ."</div>";
}
echo '</div>';

/* Restore original Post Data */
wp_reset_postdata();


?>