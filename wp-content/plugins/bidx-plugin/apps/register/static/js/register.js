;( function ( $ )
{
    var $element                    = $( "#register" )
    ,   $frmRegister                = $element.find( "#frmRegister" )
    ,   $btnRegister                = $frmRegister.find( ":submit" )
    ,   bidx                        = window.bidx
    ,   appName                     = "register"
    ;

    // private functions

    var _initHandlers = function()
    {

        // enable location plugin
        //
        $frmRegister.form(
        {
                errorClass : 'error',
                enablePlugins: [ 'location' ]
        } );

        // set validation and submitHandler
        //
        $frmRegister.validate(
        {
            ignore: ":hidden"
        ,   debug:  false
        ,   rules:
            {
                "personalDetails.firstName":
                {
                    required:               true
                }
            ,   "personalDetails.lastName":
                {
                    required:               true
                }
            ,   "username":
                {
                    required:               true
                ,   email:                  true
                ,   remoteBidxApi:
                    {
                        url:                "validateUsername.fetch"

                    }

                }
            ,   "address":
                {
                    required:               true
                ,
                }

            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
            }
        ,   submitHandler:  function()
            {
                if ( $btnRegister.hasClass( "disabled" ) )
                {
                    bidx.utils.log("button disabled");
                    return;
                }

                $btnRegister.addClass( "disabled" );

                _doRegister(
                {
                    error: function( jqXhr )
                    {
                        $btnRegister.removeClass( "disabled" );
                    }
                } );
            }
        } );


    };


    var _doRegister = function( porams )
    {


        // Build up the data for the member request
        //
        var member =
        {
            emailAddress:                   $frmRegister.find( "[name='username']" ).val()
        ,   personalDetails:
                {
                    firstName:              $frmRegister.find( "[name='personalDetails.firstName']" ).val()
                ,   lastName:               $frmRegister.find( "[name='personalDetails.lastName']" ).val()
                }
        };

        // Currently, address is required, so this is a bit of an unlogical test. Wouldn't be surprised it will
        // be gone
        //
        if ( $frmRegister.find( "[name='address']" ).val() )
        {

            // Finding the hidden fields is a hack, just search for the fields *ENDING* with names we are looking for
            // Just to not have to change the location.js plugin
            //
            member.personalDetails.address =
            [
                    {
                        coordinates:            $frmRegister.find( "[name$=location]" ).val()
                    ,   postalCode:             $frmRegister.find( "[name$=postalCode]" ).val()
                    ,   country:                $frmRegister.find( "[name$=country]" ).val()
                    ,   cityTown:               $frmRegister.find( "[name$=cityTown]" ).val()
                    ,   neighborhood:           $frmRegister.find( "[name$=neighborhood]" ).val()
                    ,   streetNumber:           $frmRegister.find( "[name$=streetNumber]" ).val()
                    ,   street:                 $frmRegister.find( "[name$=street]" ).val()
                    }
            ];
        }

        bidx.api.call(
            "member.save"
        ,   {
                groupDomain:    bidx.common.groupDomain
            ,   data:           member
            ,   success:        function( response )
                {
                    bidx.utils.log( "member.save::success::response", response );

                    // Go to group dashboard
                    //
                    var $urlparam = $frmRegister.find( "[name='urlparam']" );

                    $frmRegister.hide();
                    $element.find( ".registerSuccess" ).removeClass( "hide" );
                    var urlparam = $urlparam.length
                        ? $urlparam.val()
                        : "";
                    var url = window.location.protocol + "//" + window.location.host + "?smsg=4&rs=true&sparam=" + urlparam;
                    window.location.href = url;
                }
            ,   error:          function( jqXhr )
                {
                    $btnRegister.removeClass( "disabled" );

                    alert( "Problem while registering" );
                }
            }
        );
    };



    // generic view function. Hides all views and then shows the requested view
    //
/*    var _showView = function( view )
    {

        var $view = $views.hide().filter( bidx.utils.getViewName( view ) ).show();

    };*/

    // ROUTER

    var state;

    var navigate = function( options )
    {
        bidx.utils.log("routing options", options );

     //   _showView( "register" );


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


    window.bidx.register = app;

    // Initialize handlers
    _initHandlers();

    // Only update the hash when user is authenticating and when there is no hash defined
    //
    if ( $( "body.bidx-register" ).length && !bidx.utils.getValue(window, "location.hash" ) )
    {
        document.location.hash = "#register";
    }

    // if there is a hash defined in the window scope, nagivate to this has
    //
    if ( bidx.utils.getValue( window, "__bidxHash" ) )
    {
        document.location.hash = window.__bidxHash;
    }

} ( jQuery ));
