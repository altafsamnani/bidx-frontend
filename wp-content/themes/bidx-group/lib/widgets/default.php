<?php 
// DEFAULT WIDGET ACTIVATION
//
function set_default_theme_widgets ( $old_theme, $WP_theme = null ) {


    ////////////////////////////
    // Query the posts to check if there is already one with the title "Welcome" 
    //
    $args = array(
                  'post_type' => 'post',
                  'post_status' => 'any',
                  'posts_per_page' => -1,
                );

    $posts_query = new WP_Query($args);

    $def_post_exists = false;
    while ($posts_query->have_posts()) : $posts_query->the_post();
    if ( !$def_post_exists && $posts_query->post->post_title === "Welcome" )
    {
        $def_post_exists = true;
    }
    endwhile;


    wp_reset_postdata();

    // If there is no default post then go ahead and add it
    //
    if ( !$def_post_exists )
    {

        // Create post object
        //
        $my_post = array(
          'post_title'    => 'Welcome',
          'post_content'  => 'Welcome to our Portal, here you can do many things. First you should edit this post by clicking edit in the Posts Section from the admin panel.',
          'post_status'   => 'publish',
          'post_author'   => 2, // Hacky way for empty "Author" field
          'post_category' => array(0)
        );
        // Insert the post into the database
        //
        wp_insert_post( $my_post );
    }

    // Get "Welcome" post in order to preselect it in the Bidx Post widget
    //
    $welcome_post = get_page_by_title( "Welcome", "OBJECT", "post" );

    // Load the default widgets
    //
    $add_to_sidebar = [
            'pub-front-top'
        ,   'pub-front-body'
        ,   'pub-front-side'
        ,   'pub-front-bottom'
        ,   'pub-member-side'
        ,   'priv-front-top'
        ,   'priv-front-body'
        ,   'priv-front-side'
        ,   'priv-front-bottom'
        ,   'priv-member-side'
    ];

    $sidebar_options = array();
    $sidebar_options['wp_inactive_widgets'] = array();
    $count = 0;

    // if(!isset($sidebar_options[$add_to_sidebar]))
    // {
    //     $sidebar_options[$add_to_sidebar] = array('_multiwidget'=>1);
    // }


    // Add widget to sidebar:
    // 
    $widget_name = 'carousel_widget';
    $widgets = get_option('widget_'.$widget_name);
    $sidebar_options[$add_to_sidebar[0]][] = $widget_name.'-'.$count;
    $widgets[$count] = array(
        'title' => 'Caroussel',
    );
    $count++;
    $sidebar_options[$add_to_sidebar[5]][] = $widget_name.'-'.$count;
    $widgets[$count] = array(
        'title' => 'Caroussel',
    );
    $count++;
    update_option('widget_'.$widget_name,$widgets);

    // Add widget to sidebar:
    //
    $widget_name = 'button_widget';
    $widgets = get_option('widget_'.$widget_name);
    if(!is_array($widgets))$widgets = array();
    $count = count($widgets)+1;
    $sidebar_options[$add_to_sidebar[3]][] = $widget_name.'-'.$count;
    $widgets[$count] = array(
        'title' => 'More Button',
        'buttontext' => 'Find out more',
        'buttonlink' => '/welcome',
        'buttonblock' => 'checked="checked"',
        'buttonalign' => 'text-center',
        'buttonstyle' => 'btn-primary',
        'buttonsize' => 'btn-xl',
    );
    $count++;
    update_option('widget_'.$widget_name,$widgets);

    // Add widget to sidebar:
    // 
    $widget_name = 'promo_widget';
    $widgets = get_option('widget_'.$widget_name);
    $sidebar_options[$add_to_sidebar[0]][] = $widget_name.'-'.$count;
    $widgets[$count] = array(
        'title' => 'Promo Widget',
        'promotext' => 'Customize the layout',
        'promolink' => '/wp-admin/customize.php',
        'promobold' => '',
        'promoalign' => 'text-center',
    );
    $count++;
    update_option('widget_'.$widget_name,$widgets);


    // Add widget to sidebar:
    // 
    $widget_name = 'latest_businesses_widget';
    $widgets = get_option('widget_'.$widget_name);
    $sidebar_options[$add_to_sidebar[6]][] = $widget_name.'-'.$count;
    $widgets[$count] = array(
        'title' => 'Latest Businesses',
    );
    $count++;
    update_option('widget_'.$widget_name,$widgets);

    // Add widget to sidebar:
    // 
    $widget_name = 'latest_members_widget';
    $widgets = get_option('widget_'.$widget_name);
    $sidebar_options[$add_to_sidebar[6]][] = $widget_name.'-'.$count;
    $widgets[$count] = array(
        'title' => 'Latest Members',
    );
    $count++;
    update_option('widget_'.$widget_name,$widgets);

    // Add widget to sidebar:
    // 
    $widget_name = 'latest_posts_widget';
    $widgets = get_option('widget_'.$widget_name);
    $sidebar_options[$add_to_sidebar[6]][] = $widget_name.'-'.$count;
    $widgets[$count] = array(
        'title' => 'News and Events',
    );
    $count++;
    update_option('widget_'.$widget_name,$widgets);

    // Add widget to sidebar:
    // 
    $widget_name = 'start_here_widget';
    $widgets = get_option('widget_'.$widget_name);
    $sidebar_options[$add_to_sidebar[2]][] = $widget_name.'-'.$count;
    $widgets[$count] = array(
        'title' => 'Start here button',
    );
    $count++;
    update_option('widget_'.$widget_name,$widgets);

    // Add widget to sidebar:
    // 
    $widget_name = 'post_widget';
    $widgets = get_option('widget_'.$widget_name);
    $sidebar_options[$add_to_sidebar[1]][] = $widget_name.'-'.$count;
    $widgets[$count] = array(
        'title' => 'One post',
        'post_id' => $welcome_post->ID,
    );
    $count++;
    update_option('widget_'.$widget_name,$widgets);

    // Add widget to sidebar:
    // 
    $widget_name = 'multicolumn_widget';
    $widgets = get_option('widget_'.$widget_name);
    $sidebar_options[$add_to_sidebar[3]][] = $widget_name.'-'.$count;
    $widgets[$count] = array(
        'columns' => 3,
        'items' => 2,
        'has_bg' => 'checked="checked"',
        'bg_color' => 'bg-primary-darker',
        'col1' => 'Latest Members',
        'col2' => 'Latest Business Summaries',
        'col3' => 'Latest Posts',
    );
    $count++;
    update_option('widget_'.$widget_name,$widgets);

    // Add widget to sidebar:
    // 
    // $widget_name = 'sponsors_widget';
    // $widgets = get_option('widget_'.$widget_name);
    // $sidebar_options[$add_to_sidebar[3]][] = $widget_name.'-'.$count;
    // $widgets[$count] = array(
    //     'title' => 'Sponsors',
    // );
    // $count++;
    // update_option('widget_'.$widget_name,$widgets);
    
    // Add widget to sidebar:
    // 
    // $widget_name = 'videoBox_widget';
    // $widgets = get_option('widget_'.$widget_name);
    // $sidebar_options[$add_to_sidebar[0]][] = $widget_name.'-'.$count;
    // $widgets[$count] = array(
    //     'title' => 'tehre',
    // );
    // $count++;
    // update_option('widget_'.$widget_name,$widgets);

    update_option('sidebars_widgets',$sidebar_options);

}
add_action('after_switch_theme', 'set_default_theme_widgets');


