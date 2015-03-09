;( function ( $ )
{

    var $element                    = $( "#auth" )
    ,   $views                      = $element.find( ".view" )
    ;

    // generic view function. Hides all views and then shows the requested view
    //
    var _showView = function( view )
    {
        // BIDX-2837 Very quick and dirty workaround for MEK/GESR
        // BEWARE: see the very same hack in auth.php and login.php; also see comments about
        // the #join/role URL fragment in that first file.
	// DISABLED
	//
        // if ( bidx.common.groupDomain === "gesr" ) 
        //{
            // If the domain has 2 subdomains such as gesr.demo.bidx.net, then assume beta testing.
        //    var isGesrBeta = window.location.host.split(".").length > 2;
        //    document.location.href = window.location.protocol + "//" + window.location.host + 
        //        "/bidx-soca/bidxauth?id=http://gesr.net/" + (isGesrBeta ? "beta" : "") + "#join/role";
        //    return;
        //}

        var $view = $views.hide().filter( bidx.utils.getViewName( view ) ).show();

    };

    var navigate = function( options )
    {
        bidx.utils.log("routing options of Auth", options );

        // call the navigate of the child app; this may fail if the hash is wrong (like if
        // the hash was not removed/changed when doing the redirection dance for bidx-soca)
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
