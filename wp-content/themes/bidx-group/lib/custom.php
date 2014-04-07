<?php

// We can split up these files in individual parts


/**
 * Bidx initial setup for post management functions 
 */

// Adds a meta box to the post editing screen
function bidx_homepage_meta() {
	add_meta_box( 'bidx_meta', 
				  __( 'Homepage Settings', 'bidx-textdomain' ), 
				  'bidx_homepage_callback', 
				  'page',
				  'side' );
}
add_action( 'add_meta_boxes', 'bidx_homepage_meta' );

// Outputs the content of the meta box only when the right template has been chosen
function bidx_homepage_callback( $post ) {
	wp_nonce_field( basename( __FILE__ ), 'bidx_nonce' );
	$bidx_stored_meta = get_post_meta( $post->ID );
	
	// check if the template is ok
	//if (is_page_template('template-homepage.php')) {
	
	?>
    <p>
        <label for="meta-text" class="bidx-row-title"><?php _e( 'Public Homepage', 'bidx-textdomain' )?></label>
        <input type="text" name="public-homepage" id="meta-text" value="<?php if ( isset ( $bidx_stored_meta['public-homepage'] ) ) echo $bidx_stored_meta['public-homepage'][0]; ?>" />
    </p>
    <p>
        <label for="meta-text" class="bidx-row-title"><?php _e( 'Logged In Homepage', 'bidx-textdomain' )?></label>
        <input type="text" name="logged-in-homepage" id="meta-text" value="<?php if ( isset ( $bidx_stored_meta['logged-in-homepage'] ) ) echo $bidx_stored_meta['logged-in-homepage'][0]; ?>" />
    </p>
    <?php
	//}
}

// Saves the custom meta input
function bidx_homepage_save( $post_id ) {

	// Checks save status
	$is_autosave = wp_is_post_autosave( $post_id );
	$is_revision = wp_is_post_revision( $post_id );
	$is_valid_nonce = ( isset( $_POST[ 'bidx_nonce' ] ) 
						&& wp_verify_nonce( $_POST[ 'bidx_nonce' ], basename( __FILE__ ) ) ) ? 'true' : 'false';

	// Exits script depending on save status
	if ( $is_autosave || $is_revision || !$is_valid_nonce ) {
		return;
	}

	// Checks for input and sanitizes/saves if needed
	if( isset( $_POST[ 'public-homepage' ] ) ) {
		update_post_meta( $post_id, 'public-homepage', sanitize_text_field( $_POST[ 'public-homepage' ] ) );
	}
	if( isset( $_POST[ 'logged-in-homepage' ] ) ) {
		update_post_meta( $post_id, 'logged-in-homepage', sanitize_text_field( $_POST[ 'logged-in-homepage' ] ) );
	}

}
add_action( 'save_post', 'bidx_homepage_save' );

/**
 * Bidx Theme Control Panel --> to activation.php
 */



