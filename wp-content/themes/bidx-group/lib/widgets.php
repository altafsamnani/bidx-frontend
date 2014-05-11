<?php
/**
 * Register sidebars and widgets
 */
function bidx_widgets_init() {

	//Public Homepage
	register_sidebar(array(
	'name'          => __('Sidebar Public Homepage', 'bidx_group_theme'),
	'id'            => 'sidebar-public-homepage',
	'before_widget' => '<section class="widget %1$s %2$s">',
	'after_widget'  => '</section>',
	'before_title'  => '<h3>',
	'after_title'   => '</h3>',
	));
	register_sidebar(array(
	'name'          => __('Public Homepage Full Header', 'bidx_group_theme'),
	'id'            => 'header-public-homepage',
	'before_widget' => '<section class="widget %1$s %2$s">',
	'after_widget'  => '</section>',
	'before_title'  => '<h3>',
	'after_title'   => '</h3>',
	));
	register_sidebar(array(
	'name'          => __('Public Homepage Body Content', 'bidx_group_theme'),
	'id'            => 'public-homepage-body',
	'before_widget' => '<section class="widget %1$s %2$s">',
	'after_widget'  => '</section>',
	'before_title'  => '<h3>',
	'after_title'   => '</h3>',
	));

	//Logged-in Homepage
	register_sidebar(array(
	'name'          => __('Sidebar Logged-in Homepage', 'bidx_group_theme'),
	'id'            => 'sidebar-loggedin-homepage',
	'before_widget' => '<section class="widget %1$s %2$s">',
	'after_widget'  => '</section>',
	'before_title'  => '<h3>',
	'after_title'   => '</h3>',
	));	
	
	
	
	
	//Member page sidebar
	register_sidebar(array(
	'name'          => __('Public Memberpage Sidebar', 'bidx_group_theme'),
	'id'            => 'sidebar-public-memberpage',
	'before_widget' => '<section class="widget %1$s %2$s">',
	'after_widget'  => '</section>',
	'before_title'  => '<h3>',
	'after_title'   => '</h3>',
	));	
	register_sidebar(array(
	'name'          => __('Loggedin Memberpage Sidebar', 'bidx_group_theme'),
	'id'            => 'sidebar-loggedin-memberpage',
	'before_widget' => '<section class="widget %1$s %2$s">',
	'after_widget'  => '</section>',
	'before_title'  => '<h3>',
	'after_title'   => '</h3>',
	));	
  	
  	//Footer
	register_sidebar(array(
	'name'          => __('Footer', 'bidx_group_theme'),
	'id'            => 'footer',
	'before_widget' => '<section class="widget %1$s %2$s">',
	'after_widget'  => '</section>',
	'before_title'  => '<h3>',
	'after_title'   => '</h3>',
	));
  	
	register_widget('Bidx_Widget');
}
add_action('widgets_init', 'bidx_widgets_init');

/**
 * --------------------------
 * bidx Widgets list
 *  
 * User Interface
 * 1] Caroussel widget (stand-alone, select from media and optionally add call-to-action)
 * 2] Endorsement widget (public endorsement information)
 * 3] Big Quote widget (creates a big quote with name)
 * 4] Post widget (select any post and add it)
 * 5] Start Now or Join	
 * 
 * Information
 * 1] bidx group changes (selector for members / businessplans / changes / all + view-type + amount 3-5)
 * 2] active competitions (integrates with XML feed from Skipso)
 * 3] bidx conversion widget (logged-in for access plan / profile + create new)
 * 4] bidx search widget (quick access to search function)
 * 5] bidx maps search widget (map view from a central location in a range)
 * 
 * --------------------------
 */



/**
 * Example vCard widget
 */
class Bidx_Widget extends WP_Widget {
  private $fields = array(
    'title'          => 'Title (optional)',
    'street_address' => 'Street Address',
    'locality'       => 'City/Locality',
    'region'         => 'State/Region',
    'postal_code'    => 'Zipcode/Postal Code',
    'tel'            => 'Telephone',
    'email'          => 'Email'
  );

  function __construct() {
    $widget_ops = array('classname' => 'widget_roots_vcard', 'description' => __('Use this widget to add a vCard', 'roots'));

    $this->WP_Widget('widget_roots_vcard', __('Roots: vCard', 'roots'), $widget_ops);
    $this->alt_option_name = 'widget_roots_vcard';

    add_action('save_post', array(&$this, 'flush_widget_cache'));
    add_action('deleted_post', array(&$this, 'flush_widget_cache'));
    add_action('switch_theme', array(&$this, 'flush_widget_cache'));
  }

  function widget($args, $instance) {
    $cache = wp_cache_get('widget_roots_vcard', 'widget');

    if (!is_array($cache)) {
      $cache = array();
    }

    if (!isset($args['widget_id'])) {
      $args['widget_id'] = null;
    }

    if (isset($cache[$args['widget_id']])) {
      echo $cache[$args['widget_id']];
      return;
    }

    ob_start();
    extract($args, EXTR_SKIP);

    $title = apply_filters('widget_title', empty($instance['title']) ? __('vCard', 'roots') : $instance['title'], $instance, $this->id_base);

    foreach($this->fields as $name => $label) {
      if (!isset($instance[$name])) { $instance[$name] = ''; }
    }

    echo $before_widget;

    if ($title) {
      echo $before_title, $title, $after_title;
    }
  ?>
    <p class="vcard">
      <a class="fn org url" href="<?php echo home_url('/'); ?>"><?php bloginfo('name'); ?></a><br>
      <span class="adr">
        <span class="street-address"><?php echo $instance['street_address']; ?></span><br>
        <span class="locality"><?php echo $instance['locality']; ?></span>,
        <span class="region"><?php echo $instance['region']; ?></span>
        <span class="postal-code"><?php echo $instance['postal_code']; ?></span><br>
      </span>
      <span class="tel"><span class="value"><?php echo $instance['tel']; ?></span></span><br>
      <a class="email" href="mailto:<?php echo $instance['email']; ?>"><?php echo $instance['email']; ?></a>
    </p>
  <?php
    echo $after_widget;

    $cache[$args['widget_id']] = ob_get_flush();
    wp_cache_set('widget_roots_vcard', $cache, 'widget');
  }

  function update($new_instance, $old_instance) {
    $instance = array_map('strip_tags', $new_instance);

    $this->flush_widget_cache();

    $alloptions = wp_cache_get('alloptions', 'options');

    if (isset($alloptions['widget_roots_vcard'])) {
      delete_option('widget_roots_vcard');
    }

    return $instance;
  }

  function flush_widget_cache() {
    wp_cache_delete('widget_roots_vcard', 'widget');
  }

  function form($instance) {
    foreach($this->fields as $name => $label) {
      ${$name} = isset($instance[$name]) ? esc_attr($instance[$name]) : '';
    ?>
    <p>
      <label for="<?php echo esc_attr($this->get_field_id($name)); ?>"><?php _e("{$label}:", 'roots'); ?></label>
      <input class="widefat" id="<?php echo esc_attr($this->get_field_id($name)); ?>" name="<?php echo esc_attr($this->get_field_name($name)); ?>" type="text" value="<?php echo ${$name}; ?>">
    </p>
    <?php
    }
  }
}
