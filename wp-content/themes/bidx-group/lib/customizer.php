<?php

require_once( ABSPATH . WPINC . '/class-wp-customize-control.php' );

/**
 * Theme customizer
 * Contains methods for customizing the theme customization screen.
 * 
 * TODO : add font selector
 * TODO : background color or background image selector
 * TODO : remove site tagline settings and frontpage settings
 * TODO : add widget selector
 *
 * @link http://codex.wordpress.org/Theme_Customization_API
 * @author Jaap Gorjup
 */
class Bidx_Group_Customizer {

	/**
	 * Constructor which hooks into 'customize_register' (available as of WP 3.4) and allows
	 * you to add new sections and controls to the Theme Customize screen.
	 * 
	 * Note: Enabling instant preview requires custom javascript. See live_preview() for more.
	 *  
	 * @see add_action('customize_register',$func)
	 * @param WP_Customize $wp_customize
	 */
	public static function register( $wp_customize ) {

		Bidx_Group_Customizer :: bidx_logo_customizer( $wp_customize );
		Bidx_Group_Customizer :: bidx_color_customizer( $wp_customize );
		Bidx_Group_Customizer :: bidx_fonts_customizer( $wp_customize );
		Bidx_Group_Customizer :: bidx_alignment_customizer( $wp_customize );
		Bidx_Group_Customizer :: bidx_social_customizer( $wp_customize );
		Bidx_Group_Customizer :: bidx_analytics_customizer( $wp_customize );

	}

	/**
	 * Logo settings
	 * @param WP_Customize $wp_customize
	 */
	private static function bidx_logo_customizer( $wp_customize ) {
	
		$wp_customize -> add_section(
				'logo_settings',
				array(
						'title' => __( 'Logo Settings', 'bidx_group_theme' ),
						'description' => __( 'Configure logo images here.', 'bidx_group_theme' ),
						'priority' => 35,
				)
		);
		$wp_customize->add_setting('main_logo_selector');
		$wp_customize->add_control(
				new WP_Customize_Image_Control(
						$wp_customize,
						'main_logo_selector',
						array(
								'label'      => __( 'Upload your main logo', 'bidx_group_theme' ),
								'section'    => 'logo_settings',
								'settings'   => 'main_logo_selector',
								'context'    => 'main_logo_settings'
						)
				)
		);
		$wp_customize->add_setting('mobile_logo_selector');
		$wp_customize->add_control(
				new WP_Customize_Image_Control(
						$wp_customize,
						'mobile_logo_selector',
						array(
								'label'      => __( 'Upload your mobile logo', 'bidx_group_theme' ),
								'section'    => 'logo_settings',
								'settings'   => 'mobile_logo_selector',
								'context'    => 'mobile_logo_settings'
						)
				)
		);		
		$wp_customize->add_setting('favicon_selector');
	
	}
	
	/**
	 * Color settings
	 * @param WP_Customize $wp_customize
	 */
	private static function bidx_color_customizer( $wp_customize ) {
	
		$wp_customize -> add_section(
				'color_settings',
				array(
						'title' => __( 'Color Settings', 'bidx_group_theme' ),
						'description' => __( 'Configure colors here.', 'bidx_group_theme' ),
						'priority' => 35,
				)
		);
		$wp_customize->add_setting('main_color_selector');
		$wp_customize->add_control( new WP_Customize_Color_Control(
				$wp_customize,
				'main_color_selector',
				array(
						'label'      => __( 'Main Color', 'bidx_group_theme' ),
						'section'    => 'color_settings',
						'settings'   => 'main_color_selector',
				) )
		);
		$wp_customize->add_setting('secondary_color_selector');
		$wp_customize->add_control( new WP_Customize_Color_Control(
				$wp_customize,
				'secondary_color_selector',
				array(
						'label'      => __( 'Secondary Color', 'bidx_group_theme' ),
						'section'    => 'color_settings',
						'settings'   => 'secondary_color_selector',
				) )
		);
	
		//background color or background image selector here : WP_Customize_Background_Image_Control()
		
		$wp_customize->add_setting('text_dark_or_light');
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'text_dark_or_light',
						array(
								'label'          => __( 'Dark or light theme version?', 'bidx_group_theme' ),
								'section'        => 'color_settings',
								'settings'       => 'text_dark_or_light',
								'type'           => 'radio',
								'choices'        => array(
										'dark'   => __( 'Dark' ),
										'light'  => __( 'Light' )
								)
						)
				)
		);
	
	}
		
		
	/**
	 * Font settings
	 * @param WP_Customize $wp_customize
	 */
	private static function bidx_fonts_customizer( $wp_customize ) {
	   
		require_once( get_template_directory() . '/vendor/lib/wp-google-font-picker-control/google-font.php' );
		require_once( get_template_directory() . '/vendor/lib/wp-google-font-picker-control/google-font-collection.php' );
		require_once( get_template_directory() . '/vendor/lib/wp-google-font-picker-control/control.php' );
		
		$wp_customize -> add_section(
				'font_settings',
				array(
						'title' => __( 'Font Settings', 'bidx_group_theme' ),
						'description' => __( 'Configure fonts here.', 'bidx_group_theme' ),
						'priority' => 35,
				)
		);

		$wp_customize->add_setting('font_family');
		
		$customFontFamilies;

		$fonts[] = array(
					"title" => "Ubuntu Condensed",
					"location" => "Ubuntu+Condensed",
					"cssDeclaration" => "'Ubuntu Condensed', sans-serif",
					"cssClass" => "ubuntuCondensed"
			);
		
		$fonts[] = array (
						"title" => "Lato",
						"location" => "Lato",
						"cssDeclaration" => "'Lato', sans-serif",
						"cssClass" => "lato"		
		);
		$customFontFamilies = new Google_Font_Collection( $fonts );


		$wp_customize->add_control( 
				new Google_Font_Picker_Custom_Control( $wp_customize, 'font_family_control', array(
				'label'             => __( 'Font Family', 'bidx_group_theme' ),
				'section'           => 'font_settings',
				'settings'          => 'font_family',
				'choices'           => $customFontFamilies->getFontFamilyNameArray(),
				'fonts'             => $customFontFamilies
		) ) );
	
	}

	/**
	 * Returns a select list of Google fonts
	 * Feel free to edit this, update the fallbacks, etc.
	 */
	function options_typography_get_google_fonts() {

		return array(
				'Arvo, serif' => 'Arvo',
				'Copse, sans-serif' => 'Copse',
				'Droid Sans, sans-serif' => 'Droid Sans',
				'Droid Serif, serif' => 'Droid Serif',
				'Lobster, cursive' => 'Lobster',
				'Nobile, sans-serif' => 'Nobile',
				'Open Sans, sans-serif' => 'Open Sans',
				'Oswald, sans-serif' => 'Oswald',
				'Pacifico, cursive' => 'Pacifico',
				'Rokkitt, serif' => 'Rokkit',
				'PT Sans, sans-serif' => 'PT Sans',
				'Quattrocento, serif' => 'Quattrocento',
				'Raleway, cursive' => 'Raleway',
				'Ubuntu, sans-serif' => 'Ubuntu',
				'Yanone Kaffeesatz, sans-serif' => 'Yanone Kaffeesatz'		
		);
	}
	
	
	/**
	 * Alignment settings
	 * @param WP_Customize $wp_customize
	 */	
	private static function bidx_alignment_customizer( $wp_customize ) {
	
		$wp_customize -> add_section(
				'alignment_settings',
				array(
						'title' => __( 'Alignment Settings', 'bidx_group_theme' ),
						'description' => __( 'Alignment of your elements.', 'bidx_group_theme' ),
						'priority' => 35,
				)
		);
		$wp_customize->add_setting('logo_alignment');
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'logo_alignment',
						array(
								'label'          => __( 'Logo Alignment', 'bidx_group_theme' ),
								'section'        => 'alignment_settings',
								'settings'       => 'logo_alignment',
								'type'           => 'radio',
								'choices'        => array(
										'left'   => __( 'Left' ),
										'middle' => __( 'Middle' ),
										'right'  => __( 'Right' )
								)
						)
				)
		);
		$wp_customize->add_setting('sidebar_alignment');
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'sidebar_alignment',
						array(
								'label'          => __( 'Sidebar alignment', 'bidx_group_theme' ),
								'section'        => 'alignment_settings',
								'settings'       => 'sidebar_alignment',
								'type'           => 'radio',
								'choices'        => array(
										'left'   => __( 'Left' ),
										'middle' => __( 'Middle' ),
										'right'  => __( 'Right' )
								)
						)
				)
		);
	
	}
		
	
	/**
	 * Social networks settings
	 * @param WPCustomizer $wp_customize
	 */
	private static function bidx_social_customizer( $wp_customize ) {
	
		$wp_customize -> add_section(
				'social_settings',
				array(
						'title' => __( 'Social Network', 'bidx_group_theme' ),
						'description' => __( 'Configure your social networks', 'bidx_group_theme' ),
						'priority' => 35,
				)
		);
		$wp_customize->add_setting('facebook_url');
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'facebook_url',
						array(
								'label'          => __( 'Facebook URL', 'bidx_group_theme' ),
								'section'        => 'social_settings',
								'settings'       => 'facebook_url',
								'type'           => 'text'
						)
				)
		);
		$wp_customize->add_setting('linkedin_url');
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'linkedin_url',
						array(
								'label'          => __( 'LinkedIN URL', 'bidx_group_theme' ),
								'section'        => 'social_settings',
								'settings'       => 'linkedin_url',
								'type'           => 'text'
						)
				)
		);
		$wp_customize->add_setting('twitter_handle');
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'twitter_handle',
						array(
								'label'          => __( 'Twitter Handle', 'bidx_group_theme' ),
								'section'        => 'social_settings',
								'settings'       => 'twitter_handle',
								'type'           => 'text'
						)
				)
		);
		
	}
		
	/**	
	 * Settings for analytics
	 * 
	 * TODO ideally a linkable list of UA codes with an event type
	 * 
	 * @param WP_Customize $wp_customize
	 */
	private static function bidx_analytics_customizer( $wp_customize ) {
	
		$wp_customize -> add_section(
				'analytics_settings',
				array(
						'title' => __( 'Analytics Settings', 'bidx_group_theme' ),
						'description' => __( 'Configure your online analytics here', 'bidx_group_theme' ),
						'priority' => 35,
				)
		);
		$wp_customize->add_setting('google_analytics');
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'google_analytics',
						array(
								'label'          => __( 'Google Analytics code', 'bidx_group_theme' ),
								'section'        => 'analytics_settings',
								'settings'       => 'google_analytics',
								'type'           => 'text'
						)
				)
		);
		
	}
	
	/**
	 * This outputs the javascript needed to automate the live settings preview.
	 * Also keep in mind that this function isn't necessary unless your settings
	 * are using 'transport'=>'postMessage' instead of the default 'transport'
	 * => 'refresh'
	 *
	 * TODO : check impact with default transport, but postMessage could be useful for 
	 * TODO : add custom less compile with adjusted variables here
	 * Override the values and have the css built using a custom name
	 *
	 * @see add_action('customize_preview_init',$func)
	 * @link http://www.simonthepiman.co.uk/using-less-on-a-wordpress-site-my-thoughts/
	 */
	public static function live_preview() {
		
		//SOLUTION HERE IS TO USE less.js AND NOT COMPILE LESS IN THIS CASE 
		//
		
// 		wp_enqueue_script(
// 			'mytheme-themecustomizer', // Give the script a unique ID
// 			get_template_directory_uri() . '/assets/js/theme-customizer.js', // Define the path to the JS file
// 			array(  'jquery', 'customize-preview' ), // Define dependencies
// 			'', // Define a version (optional) 
// 			true // Specify whether to put in footer (leave this true)
// 		);
		
	}
	
	
}

//Register the bidx specific customizer items
add_action( 'customize_register', array( 'Bidx_Group_Customizer' , 'register' )  );

// Enqueue live preview javascript in Theme Customizer admin screen
add_action( 'customize_preview_init' , array( 'MBidx_Group_Customizer' , 'live_preview' ) );

?>