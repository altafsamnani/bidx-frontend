<?php 
/**
 * Utility class for the database interaction.
 * Works on a per competition basis. 
 * 
 * The registration table consists of these fields:
 * - competition_id 	 : post id of the competition  	 (key)
 * - user_id 			 : backend member of of the user (key)
 * - entity_id	 		 : id of the business            (optional)
 * - registration_date 	 : datetime of registration 	 (mandatory, default now)
 * - deregistration_date : datetime of de registration 	 (optional)
 * 
 * The scoring table consists of these fields:
 * - competition_id		 : post_id of the judge			 (key)
 * - entity_id			 : id of the business scored     (key)
 * - judge_id			 : id of the judge scoring       (mandatory)
 * - creation date		 : datetime of assignment 	     (mandatory, default now)
 * - scoring date		 : datetime of scoring 	 	     (optional)
 * - score				 : may be null when judge is assigned, but has not scored yet.
 * 
 * TODO  : change simple database table check to update function
 * 
 * @author Jaap Gorjup
 * @version 1.0
 */
class CompetitionDatabase {
	
	/** table names without prefix **/
	const REGISTRATION_TABLE_NAME = "competition_registration";
	const SCORING_TABLE_NAME 	  = "competition_scoring";
	
	var $postid;
	var $startdate;
	var $enddate;
	
	/**
	 * Singleton constructor
	 */
	public static function instance( $competition_id ) {
		static $inst = null;
		if ($inst === null) {
			$inst = new CompetitionDatabase( $competition_id );
		}
		return $inst;
	}
	
	/**
	 * Reads the competition information and stores it for checking purposes.
	 * Constructor is private thus forcing everything to start thru static methods.
	 * @param string $competition_id valid competition content type id
	 */
	private function __create( $competition_id ) {
		$this->postid    = $competition_id;
		$this->startdate = get_post_meta( $competition_id, BidxCompetition :: COMPETITION_START_KEY, true );
		$this->enddate   = get_post_meta( $competition_id, BidxCompetition :: COMPETITION_END_KEY, true );
	}
	
	/**
	 * Initializes the database. Should be executed at the initial of a plugin.
	 * - checks the database version.
	 * - if not available create the needed tables.
	 * - if lower version update the tables
	 * 
	 * Tables created are:
	 * - competition_registration
	 * - competition_scoring
	 */
	public static function initialize() {
		
		global $wpdb;			
		$sql = "
		CREATE TABLE ". $wpdb->prefix ."competition_registration ( 
			competition_id int NOT NULL,
			user_id int NOT NULL,
			entity_id int NULL,
			registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
			deregistration_date TIMESTAMP NULL,
			PRIMARY KEY (competition_id, user_id)	
		);
		CREATE TABLE ". $wpdb->prefix ."competition_scoring ( 
			competition_id int NOT NULL,
			entity_id int NOT NULL,
			judge_id int NOT NULL,
			creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
			scoring_date TIMESTAMP NULL,
			score int NULL,
			PRIMARY KEY (competition_id, entity_id, judge_id)	
		);";
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
			dbDelta( $sql );
	}
	
	/**
	 * Registers the user in a competition.
	 * Only possible when it is an existing competition.
	 * @param string $user_id valid API user_id as registered
	 * @param string $entity_id optional add the entity id of what the user is entering with
	 */
	public function register_user( $user_id, $entity_id = null ) {
		
		if ( $this->isCompetitionActive() ) {
			
			global $wpdb;
			$wpdb->insert( 
				$wpdb->prefix . $this->REGISTRATION_TABLE_NAME, 
				array( 
					'competition_id' => $this->post_id, 
					'user_id' => $user_id,
					'entity_id' => $entity_id,	
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

	 * @param string $user_id valid id of a competing user
	 */
	public function deregister_user( $user_id ) {
		
		if ( $this->is_competition_active() ) {
			global $wpdb;
			$wpdb->update(
				$wpdb->prefix . $this->REGISTRATION_TABLE_NAME,
				array(
					'deregistration_date' => 'CURRENT_TIMESTAMP', 
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
		
		if ( $this->is_competition_active() ) {
			global $wpdb;
			$sql = $wpdb->prepare( 'SELECT registration_date, deregistration_date FROM '. $wpdb->prefix .
									$this->REGISTRATION_TABLE_NAME.' WHERE competition_id = %s AND user_id=%s',
									$post_id, $user_id );
			$result = $wpdb->get_results( $sql, OBJECT );
			//is there no result ?
			if ( $result == null ) {
				return false;
			}
			//check if deregistration date is filled
			if ( isset( $result->deregistration_date ) || $result->deregistration_date != null ) {
				return false;
			}
			return true;
		}
		return false;
	}
	
	/**
	 * Returns a object array with all registration data for one competition
	 * And adds all the scoring information to it.
	 */
	public function get_competition_stats( ) {
		global $wpdb;
		$sql = $wpdb->prepare( 'SELECT * FROM '. $wpdb->prefix . $this->REGISTRATION_TABLE_NAME .' WHERE competition_id=%s', $postid );
		return $wpdb->get_results( $sql, OBJECT );
	}

	/**
	 * Returns a object array with summary data of the registration of the last $days per day with date label
	 * 
	 * select count(*) from wp_6_competition_registration where registration_date > ( CURRENT_TIMESTAMP - ( 60*60*24*30 ) );
	 */
	public function get_competition_user_count( $days ) {
		global $wpdb; 
		$sql = $wpdb->prepare( 'SELECT * FROM '. $wpdb->prefix . $this->REGISTRATION_TABLE_NAME .'where registration_date < ( CURRENT_TIMESTAMP - ( 60*60*24*%d ) ) AND competition_id=%s', $days, $postid );
		return $wpdb->get_var( $sql );
	}
	
	/**
	 * Returns an integer summarizing all active competition users per day.
	 * Can be useful for statistics, but that can be generated client side with a JSON dump.
	 */
	public function get_active_competition_day_stats( $total_days ) {
		
		$stats = array();
		while ($total_days > 0) {
			//calculate date and store that as index
			$stats[$total_days] = $this->get_competition_user_count( $total_days );
			$total_days--;
		}
		return $stats;
	}	

	/**
	 * Returns a total JSON data dump including available scores
	 */
	public function get_competition_dump_as_JSON( ) {
		
		global $wpdb;
		$sql = $wpdb->prepare( 'SELECT a.userid, a.entity_id, a.registration_date, a.deregistration_date, AVG(b.score) FROM '. 
								$wpdb->prefix . $this->REGISTRATION_TABLE_NAME . ' a '.
								$wpdb->prefix . $this->SCORING_TABLE_NAME . ' b '.			
								'where where a.competition_id=%s and a.entity_id = b.entity_id;', $postid );
		$result = $wpdb->get_results( $sql, OBJECT );		
		return json_encode( $result );
	}		
	
	/**
	 * Allows for scoring an entity
	 * 
	 * @param int $user_id
	 * @param int $judge_id
	 * @param int $score
	 */
	public function score_entry( $user_id, $judge_id, $entity_id, $score ) {
		
		global $wpdb;
		$wpdb->insert(
				$wpdb->prefix . $this->SCORING_TABLE_NAME,
				array(
						'competition_id' => $this->post_id,
						'user_id' => $user_id,
						'judge_id' => $judge_id,
						'entity_id' => $entity_id,
						'score' => $score
				)
		);
		
	}
	
	/**
	 * An entry can be assigned to a judge by calling this method.
	 * 
	 * @param int $user_id
	 * @param int $judge_id
	 */
	public function assign_entry( $user_id, $judge_id ) {
		
		global $wpdb;
		$wpdb->insert(
				$wpdb->prefix . $this->SCORING_TABLE_NAME,
				array(
						'competition_id' => $this->post_id,
						'user_id' => $user_id,
						'judge_id' => $judge_id,
						'entity_id' => $entity_id
				)
		);
	}
	
	/**
	 * Gets the total score for a user in a competition
	 * @param int $user_id
	 */
	public function get_total_score( $user_id ) {

		if ( $this->is_user_in_competition( ) ) {

			global $wpdb;
			$sql = $wpdb->prepare( 'SELECT count(*) FROM '. $wpdb->prefix . $this->SCORING_TABLE_NAME .
					'where competition_id=%s AND user_id=%s ', $postid, $user_id);
			return $wpdb->get_var( $sql );	
		} else {
			return new WPError("COMP0002","User not active in competition");
		}	
	}

	/**
	 * Check if the competition is active
	 * TODO check if variables can be set and if set values are dates
	 */
	private function is_competition_active( ) {
		
		$starttime = strtotime( $this->startdate );
		$endtime = strtotime( $this->startdate );
		$now = time();
		if ( ( $now-$starttime < 0 ) || ( $endtime-$now < 0 ) ) {
			return false;
		}
		return true;
	}
		
}

?>