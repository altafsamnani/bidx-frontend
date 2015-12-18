<?php

// register widget
add_action( 'widgets_init', function()
{
    register_widget( 'Competition_Counter_Widget' );
});

class Competition_Counter_Widget extends WP_Widget {

    ///////////////////////////
    // Initialise the widget //
    ///////////////////////////
    function Competition_Counter_Widget()
    {
        $this->WP_Widget
        (
            'competition_counter',
            __('Counter'),
            array
            (
                'name' => ': : Bidx Competition Counter ',
                'classname' => 'widget-competition-counter',
                'description' => __( "Use this widget to create a Counter for an existing Competition" )
            )
        );
    }

    // The admin form for the widget
    ///////////////////////////
    // Setup the form fields //
    ///////////////////////////
    function form( $instance )
    {
        if ( $instance )
        {
            $title              = $instance['title'];
            $competitiontitle   = $instance['competitiontitle'];
            $competitiondesc    = $instance['competitiondesc'];
            $competitiondate    = $instance['competitiondate'];
            $competitionlink    = $instance['competitionlink'];
            $style              = $instance['style'];

        }
        else
        {
            $title ='';
            $competitiondate ='';
            $competitionlink ='';
            $style = 'flat';
        }
?>

        <p>
            <p><?php _e('Use this widget to create a Counter for an existing Competition', 'wp_widget_plugin'); ?></p>
            <br>
            <label for="<?php echo $this->get_field_id('title'); ?>"><?php _e('Widget Title:', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo $title; ?>" />
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('competitiontitle'); ?>"><?php _e('Competition Title:', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('competitiontitle'); ?>" name="<?php echo $this->get_field_name('competitiontitle'); ?>" type="text" value="<?php echo $competitiontitle; ?>" />
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('competitiondesc'); ?>"><?php _e('Competition Description:', 'wp_widget_plugin'); ?></label>
            <textarea class="widefat" id="<?php echo $this->get_field_id('competitiondesc'); ?>" name="<?php echo $this->get_field_name('competitiondesc'); ?>" value="<?php echo $competitiondesc; ?>"><?php echo $competitiondesc; ?></textarea>
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('competitiondate'); ?>"><?php _e('End Date and Time: (required)', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('competitiondate'); ?>" name="<?php echo $this->get_field_name('competitiondate'); ?>" type="text" placeholder="2015-03-19T00:00:00Z" value="<?php echo $competitiondate; ?>" />
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('competitionlink'); ?>"><?php _e('Link to Competition page:', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('competitionlink'); ?>" name="<?php echo $this->get_field_name('competitionlink'); ?>" type="text" placeholder="http://www.mycompetition.com" value="<?php echo $competitionlink; ?>" />
        </p>
        <p>
            <label for="<?php echo $this->get_field_id( 'style' ); ?>"><?php _e( 'Counter Style:', 'bidxplugin' ); ?></label>
            <select name="<?php echo $this->get_field_name( 'style' ) ?>" id="<?php echo $this->get_field_id( 'style' ) ?>">
<?php
                $styles = array(
                    __( 'Circle', 'bidxplugin' ) => 'circle',
                    __( 'Flat', 'bidxplugin' ) => 'flat',
                );
                foreach ( $styles as $key => $value )
                {
                    printf(
                        '<option value="%s" %s >%s</option>',
                        $value,
                        $value == $style ? 'selected="selected"' : '',
                        $key
                    );
                }
?>
            </select>
        </p>

<?php


    } // END: function form( $instance )

    //////////////////////////////////////////////////////////////////
    // The update function to insert the chosen values in to the db //
    //////////////////////////////////////////////////////////////////
    function update( $new_instance, $old_instance )
    {
        $instance = $old_instance;
        $instance['title'] =  $new_instance['title'];
        $instance['competitiontitle'] = $new_instance['competitiontitle'];
        $instance['competitiondesc'] =  $new_instance['competitiondesc'];
        $instance['competitiondate'] = $new_instance['competitiondate'];
        $instance['competitionlink'] = $new_instance['competitionlink'];
        $instance['style'] = $new_instance['style'];
        return $instance;
    }

    /////////////////////////////////////////
    // The front end display of the widget //
    /////////////////////////////////////////
    function widget($args, $instance) {
        extract( $args );
        $competitiontitle = $instance['competitiontitle'];
        $competitiondesc = $instance['competitiondesc'];
        $competitiondate = $instance['competitiondate'];
        $competitionlink = $instance['competitionlink'];
        $style = $instance['style'];

        // these are the widget options
        $widget_id = $args['widget_id'];

        // Region Check
        $active_region = $args['id'];
        $add_container = false;
        if  ( ( $active_region === 'pub-front-top' || $active_region === 'priv-front-top' ) && get_theme_mod( 'front_top_width' ) !== true )
        {
            $add_container = true;
        }

        if  ( ( $active_region === 'pub-front-bottom' || $active_region === 'priv-front-bottom' ) && get_theme_mod( 'front_bottom_width' ) !== true )
        {
            $add_container = true;
        }

        echo $before_widget;

        if ( $add_container ) :
?>
            <div class="container">
<?php
        endif;

        echo $this -> render_content( $competitiontitle, $competitiondesc, $competitiondate, $competitionlink, $style );

        if ( $add_container ) :
?>
            </div>
<?php
        endif;

        echo $after_widget;
    }


    /**
     * Output rendering for the widget and for the shortcode
     */
    function render_content( $competitiontitle, $competitiondesc, $competitiondate, $competitionlink = "", $style='circle' ) {

        if ( empty( $competitiondate ) )
        {
?>
            <div class="alert alert-danger">
                <blockquote>
                    <p><?php _e( 'Fill in the "End Date and Time" field','bidxplugin' ); ?></p>
                </blockquote>
                <p>For example: <strong>2015-03-19T00:00:00Z</strong></p>
            </div>
<?php
        }
        else
        {
            $this->timestamp = strtotime($competitiondate);
?>
            <div class="competition">
<?php
                if ( $competitiontitle ) :
?>
                    <h2><?php echo $competitiontitle ?></h2>
<?php
                endif;

                if ( $competitiondesc ) :
?>
                    <p><?php echo $competitiondesc ?></p>
<?php
                endif;
?>
<?php
                if ( $this->timestamp < time() )
                {
?>
                    <div class="alert alert-warning">
                        <strong><i class="fa fa-exclamation-triangle"></i> <?php _e( 'This competition has expired','bidxplugin' ); ?></strong>
                    </div>
                    <!-- <a class="btn btn-secondary btn-block" href="/competition/<?php echo $competitionlink; ?>/"><?php _e( 'Visit our competition overview','bidxplugin' ); ?> </a> -->
<?php
                }
                else
                {
                    add_action( 'wp_print_footer_scripts', array( &$this, 'add_clock_footer_scripts' ) );
?>
                    <div class="counter hide-overflow text-center <?php echo $style ?>" data-time="<?php echo $this->timestamp ?>">
                        <div class="counter-block">
                            <div class="days counter-number"></div>
                            <div class="counter-text"><?php _e( 'DAYS','bidxplugin' ); ?></div>
                        </div>
                        <div class="counter-block">
                            <div class="hours counter-number"></div>
                            <div class="counter-text"><?php _e( 'HOURS','bidxplugin' ); ?></div>
                        </div>
                        <div class="counter-block">
                            <div class="minutes counter-number"></div>
                            <div class="counter-text"><?php _e( 'MINUTES','bidxplugin' ); ?></div>
                        </div>
                        <div class="counter-block">
                            <div class="seconds counter-number"></div>
                            <div class="counter-text"><?php _e( 'SECONDS','bidxplugin' ); ?></div>
                        </div>
                    </div>
<?php
                    if ( $competitionlink ):
?>
                        <a class="btn btn-secondary btn-block" href="<?php echo $competitionlink; ?>"><?php _e( 'View Now','bidxplugin' ); ?></a>
<?php
                    endif;
                }
?>
            </div>
<?php
        }
    }

    /**
     * Adds the extra javascripts on the bottom for the widget
     */
    function add_clock_footer_scripts() {

        echo "<script src='//cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.2/moment.min.js'></script>";
        echo "<script>
        $( document ).ready(function() {

                var countTime = $( '.competition .counter' );

                countTime.each( function()
                {
                    var el = $(this)
                    ,   datatime = el.attr('data-time')
                    ;

                    countdown( datatime, el );

                    setInterval( function() { countdown( datatime, el ) }, 1000);
                });

                function countdown ( datatime, el )
                {
                    var now = new moment()
                    ,   then = moment.unix( datatime )
                    ,   ms = then.diff(now, 'milliseconds', true)
                    ,   days = Math.floor(moment.duration(ms).asDays())
                    ,   then = then.subtract('days', days)
                    ,   ms = then.diff(now, 'milliseconds', true)
                    ,   hours = Math.floor(moment.duration(ms).asHours())
                    ,   then = then.subtract('hours', hours)
                    ,   ms = then.diff(now, 'milliseconds', true)
                    ,   minutes = Math.floor(moment.duration(ms).asMinutes())
                    ,   then = then.subtract('minutes', minutes)
                    ,   ms = then.diff(now, 'milliseconds', true)
                    ,   seconds = Math.floor(moment.duration(ms).asSeconds())
                    ;

                    el.find('.days').text(days);
                    el.find('.hours').text(hours);
                    el.find('.minutes').text(minutes);
                    el.find('.seconds').text(seconds);
                }
        });

        </script>";
    }


} // END: class HotTopics
