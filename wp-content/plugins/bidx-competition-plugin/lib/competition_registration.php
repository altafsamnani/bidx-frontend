<?php 

/**
 * Creates the custom table.
 * Should be called during ::load
 */
function table_install () {
	global $wpdb;
	$table_name = $wpdb->prefix . "competition_registration";
	$sql = "CREATE TABLE $table_name (
		user_id mediumint(9) NOT NULL AUTO_INCREMENT,
		competition_id mediumint(9),
		time datetime NOT NULL,
		UNIQUE KEY id (user_id, competition_id)
		);";
	
	require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
	dbDelta( $sql );	
	add_option( "bidx_competition_db_version", "1.0" );
}

/**
 * 
 * @param unknown $competition_id
 * @param unknown $user_id
 */
function add_competition_registration( $competition_id, $user_id ) {
	global $wpdb;
	$wpdb->insert( $table_name, array( 'time' => current_time('mysql'), 
									   'user_id' => $user_id, 
									   'competition_id' => $competition_id ) 
				 );
}

/**
 * 
 * @param unknown $competition_id
 * @param unknown $user_id
 */
function remove_competition_registration( $competition_id, $user_id ) {
	global $wpdb;
	$wpdb->delete( $table_name, array( 'user_id' => $user_id,
									   'competition_id' => $competition_id )
	);
}

?>