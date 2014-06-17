<?php 
/**
 * ORM class for the database interaction.
 * 
 * The table consists of these fields:
 * - competition_id 	 : post id of the competition  	 (key)
 * - user_id 			 : backend member of of the user (key)
 * - registration_date 	 : datetime of registration 	 (mandatory, default now)
 * - deregistration_date : datetime of de registration 	 (optional)
 * 
 * FIXME : activation leads to a character return warning (??)
 * TODO  : change simple database table check to update function
 * 
 * @author Jaap Gorjup
 * @version 1.0
 */
class CompetitionRegistration {
	
	/** table name without prefix **/
	const REGISTRATION_TABLE_NAME = "competition_registration";
	
	var $postid;
	var $startdate;
	var $enddate;
	
	/**
	 * Initializes the database. Should be executed at the initial of a plugin.
	 * - checks the database version.
	 * - if not available create the needed tables.
	 * - if lower version update the tables
	 */
	public static function initialize() {
		global $wpdb;	
		
		$tablename = $wpdb->prefix . "competition_registration";	

		if($wpdb->get_var("SHOW TABLES LIKE '$tablename'") != $tablename) {
			
			$sql = "CREATE TABLE $tablename ( 
				competition_id int NOT NULL,
				user_id int NOT NULL,
				registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
				deregistration_date TIMESTAMP NULL,
				KEY id (competition_id, user_id)	
			);";
			
			require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
			dbDelta( $sql );
		}
	}

	/**
	 * Reads the competition information and stores it for checking purposes
	 * @param unknown $competition_id
	 */
	public function __create( $competition_id ) {
		$this->postid    = $competition_id;
		$this->startdate = get_post_meta( $competition_id, 'competition_startdate', true );
		$this->enddate   = get_post_meta( $competition_id, 'competition_enddate', true );
	}
	
	/**
	 * Registers the user in a competition.
	 * Only possible when it is an existing competition.
	 * @param string $user_id valid API user_id as registered
	 */
	public function registerUser( $user_id ) {
		if ( $this->isCompetitionActive() ) {
			global $wpdb;
			$wpdb->insert( 
				$wpdb->prefix . "competition_registration", 
				array( 
					'competition_id' => $this->post_id, 
					'user_id' => $user_id,
				)
			);
		}
		else {
			return new WPError("COMP0001","Competition is not active");
		}
	}
	
	/**
	 * Deregisters a user in the competition.
	 * Only possible when it is an existing competition.
	 * The registration is not removed!
	 * 
	 * TODO : set the sql timestamp of today
	 * 
	 * @param unknown $user_id
	 */
	public function deregisterUser( $user_id ) {
		if ( $this->isCompetitionActive() ) {
			global $wpdb;
			$wpdb->update(
				$wpdb->prefix . "competition_registration",
				array(
					'deregistration_date' => 'now', 
				),
				array(
					'competition_id' => $this->post_id,
					'user_id' => $user_id,						
				)
			);
			return true;
		}
		else {
			return new WPError("COMP0001","Competition is not active");
		}
	}
	
	/**
	 * Validates if the current user is in an active competition
	 * 
	 * @param string $competition_id
	 * @param string $user_id
	 */
	public function is_user_in_competition( $user_id ) {
		if ( $this->isCompetitionActive() ) {
			global $wpdb;
			$sql = $wpdb->prepare( 'SELECT registration_date, deregistration_date FROM '. $wpdb->prefix 
									. 'competition_registration WHERE competition_id = %s AND user_id=%s',
									$post_id, $user_id );
			$result = $wpdb->get_results( $sql, OBJECT );
			if ( $result ) {
				return false;
			}
			//check if deregistration date is filled
			
			return true;
		}
		return false;
	}
	
	/**
	 * Returns a object array with all registration data for one competition
	 */
	public function getCompetitionStats( ) {
		$sql = $wpdb->prepare( 'SELECT * FROM '. $wpdb->prefix . "competition_registration" .' WHERE competition_id=%s', $postid );
		return $wpdb->get_results( $sql, OBJECT );
	}

	/**
	 * Returns an integer summarizing all active competition users
	 */
	public function getActiveCompetitionUsers( ) {
		$sql = $wpdb->prepare( 'SELECT count(*) FROM '. $wpdb->prefix . "competition_registration" .' WHERE competition_id=%s', $postid );
		return $wpdb->get_var( $sql );
	}	
	
	/**
	 * Function for the administrators to perform admin actions independent of every check.
	 * TODO utility function for in the WP admin
	 */
	public function maintenance( $action, $data) {
	}
	
	/**
	 * Check if the competition is active
	 * TODO check if variables can be set and if set values are dates
	 */
	private function isCompetitionActive( ) {
		$starttime = strtotime($this->startdate);
		$endtime = strtotime($this->startdate);
		$now = time();
		if ( ( $now-$starttime < 0 ) || ( $endtime-$now < 0 ) ) {
			return false;
		}
		return true;
	}
		
}

?>