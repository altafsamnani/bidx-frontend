<?php 

if( $wp_query->post->post_type !== 'bidx' )
{
    if ( $authenticated )
    {
        dynamic_sidebar('priv-member-side');
    }
    else
    {
        dynamic_sidebar('pub-member-side');
    }
}
?>

