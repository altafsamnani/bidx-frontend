<?php

require_once( ABSPATH . WPINC . '/class-wp-customize-control.php' );

/**
 * Theme customizer
 * Contains methods for customizing the theme customization screen.
 * 
 * TODO : add font selector
 * TODO : background color or background image selector
 * TODO : hide site tagline settings and frontpage settings
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

		//remove tagline
		$wp_customize->remove_section( 'title_tagline');
		$wp_customize->remove_section( 'static_front_page');
		
		//add widget customizer
		add_theme_support( 'widget-customizer' );
		
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
						'priority' => 10,
				)
		);
		$wp_customize->add_setting( 'main_logo_selector' );
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
		$wp_customize->add_setting( 'mobile_logo_selector' );
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
		$wp_customize->add_setting( 'favicon_selector' );
		$wp_customize->add_control(
				new WP_Customize_Image_Control(
						$wp_customize,
						'favicon_selector',
						array(
								'label'      => __( 'Upload your favicon', 'bidx_group_theme' ),
								'section'    => 'logo_settings',
								'settings'   => 'favicon_selector',
								'context'    => 'favicon_settings'
						)
				)
		);
		
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
						'priority' => 20,
				)
		);
		$wp_customize->add_setting( 'brand-primary', array(
		        'default'           => '#3498db', //
		        'sanitize_callback' => 'sanitize_hex_color',
		        'capability'        => 'edit_theme_options',
		        'type'              => 'option', 
		));
		$wp_customize->add_control( new WP_Customize_Color_Control(
				$wp_customize,
				'brand-primary',
				array(
						'label'      => __( 'Main Color', 'bidx_group_theme' ),
						'section'    => 'color_settings',
						'settings'   => 'brand-primary',
				) )
		);
		$wp_customize->add_setting( 'brand-secondary', array(
		        'default'           => '#1abc9c', //brand-secondary
		        'sanitize_callback' => 'sanitize_hex_color',
		        'capability'        => 'edit_theme_options',
		        'type'              => 'option', 
		));
		$wp_customize->add_control( new WP_Customize_Color_Control(
				$wp_customize,
				'secondary_color_selector',
				array(
						'label'      => __( 'Secondary Color', 'bidx_group_theme' ),
						'section'    => 'color_settings',
						'settings'   => 'brand-secondary',
				) )
		);
		$wp_customize->add_setting( 'brand-background-color', array(
		        'default'           => '000',
		        'sanitize_callback' => 'sanitize_hex_color',
		        'capability'        => 'edit_theme_options',
		        'type'              => 'option', 
		));
		$wp_customize->add_control( new WP_Customize_Color_Control(
				$wp_customize,
				'brand-background-color',
				array(
						'label'      => __( 'Background Color', 'bidx_group_theme' ),
						'section'    => 'color_settings',
						'settings'   => 'brand-background-color',
				) )
		);	
		$wp_customize->add_setting( 'brand-background-color-image', array(
				        'default'     => '',
						'capability'  => 'edit_theme_options',
						'type'        => 'option',
		));
		$wp_customize->add_control( new WP_Customize_Image_Control(
				$wp_customize,
				'background_image_selector',
				array(
						'label'      => __( 'Background Image', 'bidx_group_theme' ),
						'section'    => 'color_settings',
						'settings'   => 'brand-background-color-image',
						'context'    => 'brand-background-color-image'
				) )
		);				
		$wp_customize->add_setting( 'brand-text-tone', array(
				        'default'     => 'dark',
						'capability'  => 'edit_theme_options',
						'type'        => 'option',
		));
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'brand-text-tone',
						array(
								'label'          => __( 'Dark or light text', 'bidx_group_theme' ),
								'section'        => 'color_settings',
								'settings'       => 'brand-text-tone',
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
	 * 
	 * FIXME custom and native fonts support instead of only Google
	 * TODO language selector default setting not in dropdown
	 * TODO optimize screen usage to make size and font selector cleaner
	 * TODO Use local/native and external like https://edgewebfonts.adobe.com/
	 * http://www.rvo.nl/sites/all/themes/custom/agnl_theme/font/rijksoverheidsansheading-regular_2_0.woff
	 * 
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
						'priority' => 30,
				)
		);
		
		$wp_customize->add_setting( 'font_size',
							array(
						        'default'        => 'medium',
								'capability'     => 'edit_theme_options',
								'type'           => 'option',
						    ));
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'font_size',
						array(
								'label'          => __( 'Font Size', 'bidx_group_theme' ),
								'section'        => 'font_settings',
								'settings'       => 'font_size',
								'type'           => 'radio',
								'choices'        => array(
										'large'  => __( 'Large' ),
										'medium' => __( 'Medium' ),
										'small'  => __( 'Small' )
								)
						)
				)
		);

		$wp_customize->add_setting( 'font_family',
									array(
								        'default'      => 'Lato',
								        'capability'   => 'edit_theme_options',
        								'type'         => 'option',			
								    ));		
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
	 * Alignment settings
	 * 
	 * TODO defaulting ????
	 * 
	 * @param WP_Customize $wp_customize
	 */	
	private static function bidx_alignment_customizer( $wp_customize ) {
	
		$wp_customize -> add_section(
				'alignment_settings',
				array(
						'title' => __( 'Alignment Settings', 'bidx_group_theme' ),
						'description' => __( 'Alignment of your elements.', 'bidx_group_theme' ),
						'priority' => 40,
				)
		);
		$wp_customize->add_setting( 'page_width_selector',
				array(
						'default'      => 'full'
				));
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'page_width_selector',
						array(
								'label'          => __( 'Page Width', 'bidx_group_theme' ),
								'section'        => 'alignment_settings',
								'settings'       => 'page_width_selector',
								'type'           => 'select',
								'choices'        => array(
										'full'   => __( 'Full' ),
										'1040'   => __( '1040px' ),
										'940'    => __( '940px' )
								)
						)
				)
		);
				
		$wp_customize->add_setting( 'logo_alignment',
									array(
										'capability'   => 'edit_theme_options',
								        'default'      => 'left',
										'type'         => 'option',
								    ));
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
		$wp_customize->add_setting( 'sidebar_alignment',
									array(
										'capability'   => 'edit_theme_options',
								        'default'      => 'right',
										'type'         => 'option',
								    ));
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
						'priority' => 50,
				)
		);
		$wp_customize->add_setting( 'facebook_url' );
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
		$wp_customize->add_setting( 'linkedin_url' );
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
		$wp_customize->add_setting( 'twitter_handle' );
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
						'priority' => 60,
				)
		);
		$wp_customize->add_setting( 'google_analytics' );
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
		$WPLessPlugin = WPLessPlugin::getInstance( );
		//disable the less compiler
		
		//add configuration js file to environment
		//enqueue less.js javascript
		
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
add_action( 'customize_preview_init' , array( 'Bidx_Group_Customizer' , 'live_preview' ) );

?>