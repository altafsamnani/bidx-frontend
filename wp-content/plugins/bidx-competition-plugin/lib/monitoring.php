<?php

/**
 * 
 * @author Jaap Gorjup
 */
class CompetitionMonitoring {
	
	/**
	 * Adds the monitoring function to the admin menu
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'register_monitoring_page' ) );
	}
	
	/**
	 * Registers the monitoring page
	 */
	function register_monitoring_page() {
			
		add_submenu_page( 'edit.php?post_type=competition', //parent slug
		'Competition Monitoring', 							//page title
		'Monitoring',										//menu title
		'editor',											//capability
		'competition-monitoring-page',						//menu-slug
		array( &$this, 'monitoring_page_callback')			//callback function
		);
	}

	/**
	 * Creates the Mentoring Page.
	 * TODO : make pane spaces in this page and assign panes to it
	 * 3 blocks on top with graphics
	 * data table below
	 */
	function monitoring_page_callback() {
	
		echo '<div class="wrap"><div id="icon-tools" class="icon32"></div>';
		echo '<h2>'.__( 'Competition Monitoring', 'bidx_competition' ).'</h2>';
			
		if ( isset( $_REQUEST['competition_id'] ) ) {
			
			$competition_id = $_REQUEST['competition_id'];
			$post = get_post( $competition_id );
			$jsonDump = CompetitionDatabase :: instance() -> get_competition_dump_as_JSON();
			?>
			<script>var monitordata=<?php echo $jsonDump;?> ;</script>
			<?php
			//TODO build data array in Javascript based on the jsonDump :
			//possible views :
			// registrations in time (per day) + totals
			// scoring % status (piechart)
			// current toplist (data table)
			?>
				<h3>Name: <?php echo $post->post_name ?></h3>
				<p><?php echo $post->post_excerpt ?></p>		
				<script type="text/javascript" src="https://www.google.com/jsapi"></script>
			    <script type="text/javascript">
			      var dump = <?php echo $jsonDump ?>;
			      google.load("visualization", "1", {packages:["corechart"]});
			      google.setOnLoadCallback(drawChart);
			      function drawChart() {
			        var data = google.visualization.arrayToDataTable([
			          ['week', 'Registrations', 'Deregistrations'],
			          ['week 22',  90,      2],
			          ['week 23',  160,     6],
			          ['week 24',  180,     6],
			          ['week 25',  190,     9]
			        ]);
			
			        var options = {
			          title: 'Registrations'
			        };
			
			        var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
			        chart.draw(data, options);
			      }
			    </script>
      			<div id="chart_div" class="postbox" style="width: 700px; height: 500px;"></div>
					<?php 
		} else {
				?>
				<div id="message" class="updated">
					<p><strong>Info</strong> There was no competition selected to report on.</p>
				</div>
			<?php 
		}		
	}					
}


/**
 * 
 */
class UserMonitorMetabox extends StatisticsMetabox {

}

/**
 * Registration over time view 
 */
class RegistrationMonitorMetabox extends StatisticsMetabox {

}

/**
 * Piechart overview about scored percentage
 */
class ScoreOverviewMetabox extends StatisticsMetabox {

}

/**
 * Uses the ..... presentation of the registered user data
 */
class DataFieldMetabox extends StatisticsMetabox {

}


/**
 * Baseclass for metaboxes that use Google Analytics
 *
 */
abstract class StatisticsMetabox {

	private $unique_id = null;

	/**
	 * Construct the Statistics
	 * @param string $unique_id needed to make the panel uniquely steerable
	 */
	public function __construct( $unique_id ) {
		$this -> unique_id = $unique_id;
	}


	/**
	 * Loads the Google basis. Might be useful for everything instead of loading Google Maps only
	 * load them when needed by Javascript.
	 */
	protected function addGoogleCharts() {
		wp_register_script ('js-api', '//www.google.com/jsapi', array (), '20140620', TRUE);
		//include generic setup class file with all the specifics in it.!!!
	}

	/**
	 * Move this static Javascripts
	 * @return string
	 */
	protected function configScript() {

		// google.load("visualization", "1", {packages:["corechart"]});
		// google.setOnLoadCallback(drawChart);
		// function drawChart() {
		// 	var data = google.visualization.arrayToDataTable([
		// 			['week', 'Registrations', 'Deregistrations'],
		// 			['week 22',  90,      2],
		// 			['week 23',  160,     6],
		// 			['week 24',  180,     6],
		// 			['week 25',  190,     9]
		// 			]);

		// 	var options = {
		// 		title: 'Registrations'
		// 	};

		// 	var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
		// 	chart.draw(data, options);

		return "";
	}

}



?>