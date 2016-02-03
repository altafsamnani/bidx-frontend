
<?php $post_categories = wp_get_post_categories( $post->ID ); ?>

<time class="published time" datetime="<?php echo get_the_time('c'); ?>"><?php echo get_the_date(); ?></time>

<?php if ( $post_categories ): ?>
    <div class="time"><span><?php _e('Categories','bidxplugin'); ?></span>: <span class="wp-categories"><?php the_category(', '); ?></span></div>
<?php endif; ?>

<div class="time"><span><?php the_tags( 'Tags: ', ', ', '<br />' ); ?></span></div>
<hr>

