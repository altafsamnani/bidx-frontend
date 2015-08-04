/* global bidx */
;( function ( $ )
{
    var $element                    = $( "#register" )
    ,   $frmRegister                = $element.find( "#frmRegister" )
    ,   $formfields                 = $frmRegister.find( ":input" )
    ,   $addressCountry             = $formfields.filter( "[name='personalDetails.address.country']" )

    ,   $btnRegister                = $frmRegister.find( ":submit" )

    ,   appName                     = "register"
    ,   userPreferences             = {}
    ,   submitBtnLabel
    ,   location
    ;

    // private functions
    //
    function _oneTimeSetup()
    {
        $addressCountry.bidx_chosen(
        {
            dataKey:            "country"
        ,   emptyValue:         bidx.i18n.i( "frmSelectFieldRequired" )
        });

        // set validation and submitHandler
        //
        $frmRegister.validate(
        {
            ignore: ""
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
                    ,   paramKey:           "username"

                    }
                }
            ,   "personalDetails.address.country":
                {
                    required:               true
                }
            ,   "personalDetails.address.cityTown":
                {
                    required:               true
                }
            ,   "acceptTerms":
                {
                    required:               true
                }
            ,   "preventSpam":
                {
                    required:               true
                }

            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
                "acceptTerms": ""
            ,   "preventSpam": ""
            }
        ,   submitHandler:  function()
            {
                if ( $btnRegister.hasClass( "disabled" ) )
                {
                    bidx.utils.log("button disabled");
                    return;
                }

                // set button to disabled and set Wait text. We store the current label so we can reset it when an error occurs
                //
                $btnRegister.addClass( "disabled" );
                submitBtnLabel = $btnRegister.text();
                // $btnRegister.i18nText("btnPleaseWait");

                _doRegister(
                {
                    error: function( jqXhr )
                    {
                        $btnRegister.removeClass( "disabled" )
                            .text( submitBtnLabel )
                        ;
                    }
                } );
            }
        } );

        $("[type=checkbox]").checkbox();
    }


    function _doRegister( params )
    {
        // Build up the data for the member request
        //
        var member =
        {
            emailAddress:               $formfields.filter( "[name='username']" ).val()
        ,   personalDetails:
            {
                firstName:              $formfields.filter( "[name='personalDetails.firstName']" ).val()
            ,   lastName:               $formfields.filter( "[name='personalDetails.lastName']" ).val()
            ,   address:
                [
                    {
                        country:            $addressCountry.val()
                    ,   cityTown:           $formfields.filter( "[name='personalDetails.address.cityTown']" ).val()
                    }
                ]
            }
        ,   userPreferences:                userPreferences
        };


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

                }
            ,   error:          function( jqXhr )
                {
                    params.error( jqXhr );
                }
            }
        );
    }

    // ROUTER
    //
    var state;

    var navigate = function( options )
    {
        bidx.utils.log("routing of Register", options );

        if(  options.params && options.params.firstLogin )
        {
            bidx.utils.setValue( userPreferences, "firstLoginUrl", options.params.firstLogin );
            bidx.utils.setValue( userPreferences, "firstLoginGroup", bidxConfig.groupName );
            bidx.utils.log(userPreferences);
        }
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
    _oneTimeSetup();

    //var test = $("body").find('[class^="/\sregister-as-member\d+\s/"]').length;
    // Only update the hash when user is authenticating and when there is no hash defined
    //
    var $register = $("body").attr('class').match(/register-as-/);

    if( $register ) {

        if ( $register.length && !bidx.utils.getValue(window, "location.hash" ) )
        {

            // if there is a hash defined in the window scope, nagivate to this has
            //
            if ( bidx.utils.getValue( window, "__bidxHash" ) )
            {
                bidx.utils.log(document.location);
                document.location.hash = window.__bidxHash;
            }
            // load default
            //
            else
            {
                document.location.hash = "#register";
            }
        }

    }


} ( jQuery ));
