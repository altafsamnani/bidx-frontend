<div class="block-odd">
	<div class="container">
		
		<?php get_template_part('templates/page', 'header'); ?>
		
		<?php while (have_posts()) : the_post(); ?>
		  <?php
       //the_content();
      $bidxUname = urldecode($wp_query->query_vars['buname']);
      $bidxGid   = urldecode($wp_query->query_vars['bgid']);
      $bidxGroupName   = urldecode($wp_query->query_vars['bname']);
      
      $content = get_the_content( );
      $content = apply_filters('the_content', $content);
      $content = str_replace(']]>', ']]&gt;', $content);
      $content = str_replace('[!EMAIL!]', $bidxUname, $content);
      $content = str_replace('[!GROUPNAME!]', $bidxGroupName, $content);
      echo $content;

      ?>
		  <?php wp_link_pages(array('before' => '<nav class="pagination">', 'after' => '</nav>')); ?>
		<?php endwhile; ?>
	</div>
</div>

<script type="text/javascript">
	$(function(){
		$("form").form({
			callToAction : '.jsCreateGroup',
			errorClass : 'error',
			url : '/handler',
			enablePlugins: ['date','slider']
		});
	});
</script>


<?php add_action('wp_footer', 'addToFooter',200);

	function addToFooter() {
		$content = '<script type="text/javascript" src="/wp-content/themes/plugins/form.js"></script>';
		echo $content;
	}
 ?>


