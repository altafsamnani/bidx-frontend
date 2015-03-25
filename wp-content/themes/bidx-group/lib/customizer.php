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
						'title' => __( 'Logo and Slogan', 'roots' ),
						'description' => __( 'Configure logo images and the site slogan here.', 'roots' ),
						'priority' => 10,
				)
		);
		$wp_customize->add_setting( 'main_logo_selector' );
		$wp_customize->add_control(
				new WP_Customize_Image_Control(
						$wp_customize,
						'main_logo_selector',
						array(
								'label'      => __( 'Upload your main logo', 'roots' ),
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
								'label'      => __( 'Upload your mobile logo', 'roots' ),
								'section'    => 'logo_settings',
								'settings'   => 'mobile_logo_selector',
								'context'    => 'mobile_logo_settings'
						)
				)
		);			
		$wp_customize->add_setting( 'favicon_image' );
		$wp_customize->add_control(
				new WP_Customize_Image_Control(
						$wp_customize,
						'favicon_image',
						array(
								'label'      => __( 'Upload your favicon', 'roots' ),
								'section'    => 'logo_settings',
								'settings'   => 'favicon_image',
								'context'    => 'favicon_settings'
						)
				)
		);
		$wp_customize->add_setting( 'slogan' );
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'slogan',
						array(
								'label'          => __( 'Slogan', 'roots' ),
								'section'        => 'logo_settings',
								'settings'       => 'slogan',
								'type'           => 'text'
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
						'title' => __( 'Color Settings', 'roots' ),
						'description' => __( 'Configure colors here.', 'roots' ),
						'priority' => 20,
				)
		);
		$wp_customize->add_setting( 'brand-primary', array(
 		        'default'           => '#3498db', //brand-primary
		        'sanitize_callback' => 'sanitize_hex_color',
		        'capability'        => 'edit_theme_options',
 		        'type'              => 'option', 
		));
		$wp_customize->add_control( new WP_Customize_Color_Control(
				$wp_customize,
				'brand-primary',
				array(
						'label'      => __( 'Main Color', 'roots' ),
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
						'label'      => __( 'Secondary Color', 'roots' ),
						'section'    => 'color_settings',
						'settings'   => 'brand-secondary',
				) )
		);
		$wp_customize->add_setting( 'brand-background-color', array(
		        'default'           => '#FFF',
		        'sanitize_callback' => 'sanitize_hex_color',
		        'capability'        => 'edit_theme_options',
		        'type'              => 'option', 
		));
		$wp_customize->add_control( new WP_Customize_Color_Control(
				$wp_customize,
				'brand-background-color',
				array(
						'label'      => __( 'Background Color', 'roots' ),
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
				'brand-background-color-image',
				array(
						'label'      => __( 'Background Image', 'roots' ),
						'section'    => 'color_settings',
						'settings'   => 'brand-background-color-image',
						'context'    => 'brand-background-color-image'
				) )
		);

		$wp_customize->add_setting( 'main_logo_selector' );
		$wp_customize->add_control(
				new WP_Customize_Image_Control(
						$wp_customize,
						'main_logo_selector',
						array(
								'label'      => __( 'Upload your main logo', 'roots' ),
								'section'    => 'logo_settings',
								'settings'   => 'main_logo_selector',
								'context'    => 'main_logo_settings'
						)
				)
		);

		$wp_customize->add_setting( 'brand-full-pattern', array(
				        'default'     => 'full',
						'capability'  => 'edit_theme_options',
						'type'        => 'option',
		));
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'brand-full-pattern',
						array(
								'label'           => __( 'Fullscreen or Pattern (needs a Background Image)', 'roots' ),
								'section'         => 'color_settings',
								'settings'        => 'brand-full-pattern',
								'type'            => 'radio',
								'choices'         => array(
										'full'    => __( 'Fullscreen background image' ),
										'pattern' => __( 'Pattern background image' )
								)
						)
				)
		);
		$wp_customize->add_setting('main_menu_invert');
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'main_menu_invert',
						array(
								'label'          => __( 'Invert Main Menu colors', 'roots' ),
								'section'        => 'color_settings',
								'settings'       => 'main_menu_invert',
								'type'           => 'checkbox',
								'std'         	 => '1'
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
						'title' => __( 'Font Settings', 'roots' ),
						'description' => __( 'Configure fonts here.', 'roots' ),
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
								'label'          => __( 'Font Size', 'roots' ),
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


		// http://www.awwwards.com/20-best-web-fonts-from-google-web-fonts-and-font-face.html
		// http://somadesign.ca/demos/better-google-fonts/
		// Text
		$wp_customize->add_setting( 'text_font',
									array(
								        'default'      => 'Lato',
								        'capability'   => 'edit_theme_options',
        								'type'         => 'option',			
								    ));
		$fonts = array();		
		$fonts[] = array(
					"title" => "Ubuntu Condensed",
					"location" => "Ubuntu+Condensed",
					"cssDeclaration" => "'Ubuntu Condensed', sans-serif",
					"cssClass" => "ubuntuCondensed"
			);		
		$fonts[] = array(
						"title" => "Lato",
						"location" => "Lato",
						"cssDeclaration" => "'Lato', sans-serif",
						"cssClass" => "lato"		
		);
		$fonts[] = array(
						"title" => "Source Sans Pro",
						"location" => "Source+Sans+Pro",
						"cssDeclaration" => "'Source Sans Pro', sans-serif",
						"cssClass" => "source-sans-pro"		
		);
		$fonts[] = array(
						"title" => "Open Sans",
						"location" => "Open+Sans",
						"cssDeclaration" => "'Open Sans', sans-serif",
						"cssClass" => "open-sans"
		);
		$fonts[] = array(
						"title" => "PT Sans",
						"location" => "PT+Sans",
						"cssDeclaration" => "'PT Sans', sans-serif",
						"cssClass" => "pt-sans"
		);
		$customFontFamilies = new Google_Font_Collection( $fonts );
		$wp_customize->add_control( 
				new Google_Font_Picker_Custom_Control( $wp_customize, 'text_font', array(
				'label'             => __( 'Font Family', 'roots' ),
				'section'           => 'font_settings',
				'settings'          => 'text_font',
				'choices'           => $customFontFamilies->getFontFamilyNameArray(),
				'fonts'             => $customFontFamilies
		) ) );

		// Headings
		$wp_customize->add_setting( 'headings_font',
									array(
								        'default'      => 'PT Sans',
								        'capability'   => 'edit_theme_options',
        								'type'         => 'option',
								    ));
		$fonts = array();		
		$fonts[] = array(
					"title" => "Ubuntu Condensed",
					"location" => "Ubuntu+Condensed",
					"cssDeclaration" => "'Ubuntu Condensed', sans-serif",
					"cssClass" => "ubuntuCondensed"
			);		
		$fonts[] = array(
						"title" => "Lato",
						"location" => "Lato",
						"cssDeclaration" => "'Lato', sans-serif",
						"cssClass" => "lato"		
		);
		$fonts[] = array(
						"title" => "Fjalla One",
						"location" => "Fjalla+One",
						"cssDeclaration" => "'Fjalla One', sans-serif",
						"cssClass" => "fjalla"		
		);
		$fonts[] = array(
						"title" => "Rufina",
						"location" => "Rufina",
						"cssDeclaration" => "'Rufina', sans-serif",
						"cssClass" => "rufina"		
		);
		$fonts[] = array(
						"title" => "Source Sans Pro",
						"location" => "Source+Sans+Pro",
						"cssDeclaration" => "'Source Sans Pro', sans-serif",
						"cssClass" => "source-sans-pro"		
		);
		$fonts[] = array(
						"title" => "Open Sans",
						"location" => "Open+Sans",
						"cssDeclaration" => "'Open Sans', sans-serif",
						"cssClass" => "open-sans"
		);
		$fonts[] = array(
						"title" => "Josefin Slab",
						"location" => "Josefin+Slab",
						"cssDeclaration" => "'Josefin Slab', sans-serif",
						"cssClass" => "josefin-slab"
		);
		$fonts[] = array(
						"title" => "Arvo",
						"location" => "Arvo",
						"cssDeclaration" => "'Arvo', sans-serif",
						"cssClass" => "arvo"
		);
		$fonts[] = array(
						"title" => "Vollkorn",
						"location" => "Vollkorn",
						"cssDeclaration" => "'Vollkorn', sans-serif",
						"cssClass" => "vollkorn"
		);
		$fonts[] = array(
						"title" => "Abril Fatface",
						"location" => "Abril+Fatface",
						"cssDeclaration" => "'Abril Fatface', sans-serif",
						"cssClass" => "abril-fatface"
		);
		$fonts[] = array(
						"title" => "PT Sans",
						"location" => "PT+Sans",
						"cssDeclaration" => "'PT Sans', sans-serif",
						"cssClass" => "pt-sans"
		);
		$fonts[] = array(
						"title" => "Old Standard TT",
						"location" => "Old+Standard+TT",
						"cssDeclaration" => "'Old Standard TT', serif",
						"cssClass" => "old-standard-tt"
		);
		$customFontFamilies = new Google_Font_Collection( $fonts );
		$wp_customize->add_control( 
				new Google_Font_Picker_Custom_Control( $wp_customize, 'headings_font', array(
				'label'             => __( 'Font Family', 'roots' ),
				'section'           => 'font_settings',
				'settings'          => 'headings_font',
				'choices'           => $customFontFamilies->getFontFamilyNameArray(),
				'fonts'             => $customFontFamilies
		) ) );


		// Menu
		$wp_customize->add_setting( 'menu_font',
									array(
								        'default'      => 'Ubuntu Condensed',
								        'capability'   => 'edit_theme_options',
        								'type'         => 'option',			
								    ));
		$fonts = array();		
		$fonts[] = array(
					"title" => "Ubuntu Condensed",
					"location" => "Ubuntu+Condensed",
					"cssDeclaration" => "'Ubuntu Condensed', sans-serif",
					"cssClass" => "ubuntuCondensed"
			);		
		$fonts[] = array(
						"title" => "Lato",
						"location" => "Lato",
						"cssDeclaration" => "'Lato', sans-serif",
						"cssClass" => "lato"		
		);
		$fonts[] = array(
						"title" => "Fjalla One",
						"location" => "Fjalla+One",
						"cssDeclaration" => "'Fjalla One', sans-serif",
						"cssClass" => "fjalla"		
		);
		$fonts[] = array(
						"title" => "Rufina",
						"location" => "Rufina",
						"cssDeclaration" => "'Rufina', sans-serif",
						"cssClass" => "rufina"		
		);
		$fonts[] = array(
						"title" => "Source Sans Pro",
						"location" => "Source+Sans+Pro",
						"cssDeclaration" => "'Source Sans Pro', sans-serif",
						"cssClass" => "source-sans-pro"		
		);
		$fonts[] = array(
						"title" => "Open Sans",
						"location" => "Open+Sans",
						"cssDeclaration" => "'Open Sans', sans-serif",
						"cssClass" => "open-sans"
		);
		$fonts[] = array(
						"title" => "Josefin Slab",
						"location" => "Josefin+Slab",
						"cssDeclaration" => "'Josefin Slab', sans-serif",
						"cssClass" => "josefin-slab"
		);
		$fonts[] = array(
						"title" => "Arvo",
						"location" => "Arvo",
						"cssDeclaration" => "'Arvo', sans-serif",
						"cssClass" => "arvo"
		);
		$fonts[] = array(
						"title" => "Vollkorn",
						"location" => "Vollkorn",
						"cssDeclaration" => "'Vollkorn', sans-serif",
						"cssClass" => "vollkorn"
		);
		$fonts[] = array(
						"title" => "Abril Fatface",
						"location" => "Abril+Fatface",
						"cssDeclaration" => "'Abril Fatface', sans-serif",
						"cssClass" => "abril-fatface"
		);
		$fonts[] = array(
						"title" => "PT Sans",
						"location" => "PT+Sans",
						"cssDeclaration" => "'PT Sans', sans-serif",
						"cssClass" => "pt-sans"
		);
		$fonts[] = array(
						"title" => "Old Standard TT",
						"location" => "Old+Standard+TT",
						"cssDeclaration" => "'Old Standard TT', serif",
						"cssClass" => "old-standard-tt"
		);
		$customFontFamilies = new Google_Font_Collection( $fonts );
		$wp_customize->add_control( 
				new Google_Font_Picker_Custom_Control( $wp_customize, 'menu_font', array(
				'label'             => __( 'Font Family', 'roots' ),
				'section'           => 'font_settings',
				'settings'          => 'menu_font',
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
						'title' => __( 'Alignment Settings', 'roots' ),
						'description' => __( 'Alignment of your elements.', 'roots' ),
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
								'label'          => __( 'Page Width', 'roots' ),
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
									    )
								    );
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'logo_alignment',
						array(
								'label'          => __( 'Logo Alignment', 'roots' ),
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
									    )
								    );
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'sidebar_alignment',
						array(
								'label'          => __( 'Sidebar alignment', 'roots' ),
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
		$wp_customize->add_setting('front_top_width');
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'front_top_width',
						array(
								'label'          => __( 'Fixed Width Front Top', 'roots' ),
								'section'        => 'alignment_settings',
								'settings'       => 'front_top_width',
								'type'           => 'checkbox',
								'std'         	 => '1'
							)
				)
		);
		$wp_customize->add_setting('front_bottom_width');
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'front_bottom_width',
						array(
								'label'          => __( 'Fixed Width Front Bottom', 'roots' ),
								'section'        => 'alignment_settings',
								'settings'       => 'front_bottom_width',
								'type'           => 'checkbox',
								'std'         	 => '1'
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
						'title' => __( 'Social Network', 'roots' ),
						'description' => __( 'Configure your social networks', 'roots' ),
						'priority' => 50,
				)
		);
		$wp_customize->add_setting( 'facebook_url' );
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'facebook_url',
						array(
								'label'          => __( 'Facebook URL', 'roots' ),
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
								'label'          => __( 'LinkedIN URL', 'roots' ),
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
								'label'          => __( 'Twitter Handle', 'roots' ),
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
						'title' => __( 'Analytics Settings', 'roots' ),
						'description' => __( 'Configure your online analytics here', 'roots' ),
						'priority' => 60,
				)
		);
		$wp_customize->add_setting( 'google_analytics' );
		$wp_customize->add_control(
				new WP_Customize_Control(
						$wp_customize,
						'google_analytics',
						array(
								'label'          => __( 'Google Analytics code', 'roots' ),
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
	
	/**
	 * --------------------
	 * Configure WP-Less for using customizer data --> whenever theme panel data has changed.
	 * Keep in mind that the customizer data is stored and when css file not available a recompile is needed
	 * (Is this handled by WP_less)
	 *
	 * Is done after plugins have been loaded.
	 *
	 * TODO : wp-less not loaded ?? fallback to less.js but ensure that a warning is shown
	 * For less fallback do ensure variables are set in JavaScript
	 *
	 ** <script>
	 *less.modifyVars({
	 *'@buttonFace': '#5B83AD',
	 *'@buttonText': '#D9EEF2'
	 *});
*	
	 *less = {
	 *env: "development", //production caches in localstorage
	 *logLevel: 2,
	 *async: false,
	 *fileAsync: false,
	 *poll: 1000,
	 *functions: {},
	 *dumpLineNumbers: "comments",
	 *relativeUrls: false,
	 *globalVars: {
	 *var1: '"string value"',
	 *var2: 'regular value'
	 *},
	 *rootpath: ":/a.com/"
	 *};
*	
*	
	 *</script>
	 **/
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
	
	public static function set_page_attributes_for_less( )
	{
		$WPLessPlugin = WPLessPlugin::getInstance( );
		$variables = array (
			'color-main' => get_option( 'brand-primary' ) ? get_option( 'brand-primary' ) : '#222222',
			'brand-primary' => get_option( 'brand-primary' ) ? get_option( 'brand-primary' ) : '#222222',
			'color-secondary' => get_option( 'brand-secondary' ) ? get_option( 'brand-secondary' ) : '#aaaaaa',
			'color-background' => get_option( 'brand-background-color' ) ? get_option( 'brand-background-color' ) : '#fff',
			'bg-image' => "'".get_option( 'brand-background-color-image' )."'",
			'text-font' => get_option( 'text_font' ) ? get_option( 'text_font' ) : "Lato",
			'headings-font' => get_option( 'headings_font' ) ? get_option( 'headings_font' ) : "Lato",
			'menu-font' => get_option( 'menu_font' ) ? get_option( 'menu_font' ) : "Lato",
		);
		
		$WPLessPlugin -> setVariables( $variables );
	}
	
	
}

// Register the bidx specific customizer items
add_action( 'customize_register', array( 'Bidx_Group_Customizer' , 'register' )  );

// Enqueue live preview javascript in Theme Customizer admin screen
add_action( 'customize_preview_init' , array( 'Bidx_Group_Customizer' , 'live_preview' ) );

// Add the customizer values to the WP_less environment adding them as variables
add_action( 'init', array( 'Bidx_Group_Customizer' , 'set_page_attributes_for_less' ) ); 

?>
