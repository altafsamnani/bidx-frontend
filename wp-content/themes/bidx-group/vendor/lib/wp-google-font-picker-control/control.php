<?php
/**
 * Google_Font_Picker_Custom_Control Class
**/
class Google_Font_Picker_Custom_Control extends WP_Customize_Control
{
	public $fonts;

	/**
	 * Enqueue the styles and scripts
	**/
	public function enqueue()
	{
		// styles
		wp_register_style( 'font-picker-custom-control', plugins_url( 'assets/style.css', __FILE__ ));
		wp_enqueue_style( 'font-picker-custom-control' );
	
		// scripts
		wp_register_script( 'font-picker-custom-control', plugins_url( 'assets/script.js', __FILE__ ));
		wp_enqueue_script( 'font-picker-custom-control' );
	}

	/**
	 * Render the content on the theme customizer page
	**/
	public function render_content()
	{
		if ( empty( $this->choices ) )
		{
			// if there are no choices then don't print anything
			return;
		}

		//print links to css files
		$this->fonts->printThemeCustomizerCssLocations();

		//print css to display individual fonts
		$this->fonts->printThemeCustomizerCssClasses();

		echo '<hr>';

		switch ($this->id) {
			case 'text_font':
				echo '<span class="customize-control-title">Text Font</span>';
				break;
			case 'headings_font':
				echo '<span class="customize-control-title">Headings Font</span>';
				break;
			case 'menu_font':
				echo '<span class="customize-control-title">Menu Font</span>';
				break;
			
			default:
				echo '<span class="customize-control-title">Choose a Font</span>';
				break;
		}
		?>
		<div class="fontPickerCustomControl">
			<select <?php $this->link(); ?>>
				<?php
				foreach ( $this->choices as $value => $label )
					echo '<option style="font-family:'.$label.', sans serif;" value="' . esc_attr( $label ) . '"' . selected( $this->value(), $value, false ) . '>' . $label . '</option>';
				?>
			</select>
			<!-- <div class="fancyDisplay"> -->
				<!-- <ul> -->
<?php
					// $cssClassArray = $this->fonts->getCssClassArray();
					// foreach ($cssClassArray as $key => $value)
					// {
?>
						<!-- <li class="<?= $value; ?>"><?php //echo $key ?></li> -->
<?php
					// }
?>
				<!-- </ul> -->
			<!-- </div> -->
		</div>
		<?php
	}
}
