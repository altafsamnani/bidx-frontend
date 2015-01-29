;( function ( $ )
{

    var $element                    = $( "#auth" )
    ,   $views                      = $element.find( ".view" )
    ;

    // generic view function. Hides all views and then shows the requested view
    //
    var _showView = function( view )
    {
        debugger;
        // BIDX-2837 Very quick and dirty workaround for MEK/GESR
        // BEWARE: see the very same hack in auth.php
        if ( bidx.common.groupDomain === 'gesr' ) 
        {
            document.location.href = "http://demogroup.demo.bidx.net/bidx-soca/bidxauth?id=http://gesr.net/beta";
            return;
        }

        var $view = $views.hide().filter( bidx.utils.getViewName( view ) ).show();

    };

    var navigate = function( options )
    {
        bidx.utils.log("routing options of Auth", options );

        // call the navigate of the child app
        //
        bidx[ options.state ].navigate( options );

        // show apps sub app state
        //
        bidx.controller.showAppState( "auth", options.state );

        // show the child apps view
        //
        _showView( options.state );
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
