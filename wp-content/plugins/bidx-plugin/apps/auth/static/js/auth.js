;( function ( $ )
{

    var $element                    = $( "#auth" )
    ,   $views                      = $element.find( ".view" )
    ;

    // generic view function. Hides all views and then shows the requested view
    //
    var _showView = function( view )
    {
        var $view = $views.hide().filter( bidx.utils.getViewName( view ) ).show();

    };


    //expose
    var app =
    {
        $element:               $element
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }


    window.bidx.auth = app;


    var navigate = function( options )
    {
        bidx.utils.log("routing options of Auth", options );

        // call the navigate of the child app
        //
        bidx[ options.section ].navigate( options );

        // show apps sub app state
        //
        bidx.controller.showAppState( "auth", options.section );

        // show the child apps view
        //
        _showView( options.section );
    };

    //expose
    var app =
    {
        navigate:               navigate
    ,   $element:               $element
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }


    window.bidx.auth = app;


    // Only update the hash when user is authenticating and when there is no hash defined
    //
    if ( $( "body.bidx-authentication" ).length && !bidx.utils.getValue( window, "location.hash" ) )
    {
        document.location.hash = "#auth/login";
    }



} ( jQuery ));
