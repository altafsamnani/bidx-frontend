// Author:  msp
// Date:    18-11-2013

;( function ( $ )
{

    var $element                    = $( "#groupRegistration")
    ,   $frmRegistration            = $element.find( "form[name=registration]" )
    ,   $formfields                 = $frmRegistration.find( ":input" )
    ,   $btnSubmit                  = $( ".jsSave" )
    ,   $focusIndustry              = $frmRegistration.find( "[name='focusIndustry']" )
    ,   $focusSocialImpact          = $frmRegistration.find( "[name='focusSocialImpact']" )
    ,   $focusCountry               = $frmRegistration.find( "[name='focusCountry']" )
    ,   $toggles                    = $frmRegistration.find( ".toggle" ).hide()
    ,   $toggleFocusLocationType    = $frmRegistration.find( "[name='focusLocationType']" )
    ,   $focusReach                 = $frmRegistration.find( "[name='focusReach']" )
    ,   $personalDetailsLocation    = $frmRegistration.find( "[name='personalDetails.address']" )
    ;

    function _oneTimeSetup()
    {
        // initiate formvalidation for compose view
        //
        $frmRegistration.validate(
        {
            ignore: ".chosen-choices :input"
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
            ,   "personalDetails.address[0]":
                {
                    required:               true
                }
            ,   "description":
                {
                    required:               true
                }

            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
            }
        ,   submitHandler:  function()
            {
                if ( $btnSubmit.hasClass( "disabled" ) )
                {
                    return;
                }

                $btnSubmit.addClass( "disabled" );


                _doSend(
                {
                    error: function()
                    {
                        alert( "Something went wrong during submit" );

                        $btnSubmit.removeClass( "disabled" );

                    }
                } );
            }
        } );

        // enable bidx_location plugin
        //
        $personalDetailsLocation.bidx_location(
        {
            showMap:                true
        ,   initiallyShowMap:       false
        } );

        $focusReach.bidx_location(
        {
            showMap:                true
        ,   initiallyShowMap:       false
        ,   drawCircle:             true
        } );

        // initalize selectboxes from static data api and init Chosen plugin
        //

       $focusIndustry.bidx_chosen(
        {
            dataKey:            "industry"
        });

       $focusSocialImpact.bidx_chosen(
        {
            dataKey:            "socialImpact"
        });

       $focusCountry.bidx_chosen(
        {
            dataKey:            "country"
        });

        // initialize focus location toggle
        //
        $toggleFocusLocationType.change( function()
        {
            var value       = $toggleFocusLocationType.filter( "[checked]" ).val()
            ,   groupClass  = "toggle-focusLocationType"
            ;

            bidx.utils.log( "$toggleFocusLocationType::change", value );

            // FlatUI's radio plugin fires the change event for all radio's, but since
            // we check on [checked] only the change event for the newly selected
            // radio does have a value at this point. We could have written the code
            // so it will use the event for all radio's, but that will break when we
            // remove FlatUI
            //
            if ( value === undefined )
            {
                return;
            }

            $toggles.filter( "." + groupClass ).each( function()
            {
                var $block  = $( this )
                ,   fn      = $block.hasClass( groupClass + "-" + value )
                                ? "fadeIn"
                                : "hide"
                ;

                $block[ fn ]();
            } );
        } );


    }

    function _prepareMemberProfileData()
    {
        var data
        ,   personalLocationData = $personalDetailsLocation.bidx_location( "getLocationData");
        /*
            API expected format
            {
                "personalDetails":
                {
                    "firstName":                    ""
                    "lastName":                     "value"
                ,   "address":
                    [
                        {
                            "permanentAddress":     false
                        ,   "currentAddress":       false
                        ,   "cityTonw":             "value"
                        ,   "country":              "value"
                        ,   "coordinates":          "lat, long"
                        }
                    ]
                }
            }
        */
        data =
        {
            "personalDetails":
            {
                "firstName":    $formfields.filter( "[name='personalDetails.firstName']" ).val()
            ,   "lastName":     $formfields.filter( "[name='personalDetails.lastName']" ).val()
            }
        };

        if ( !$.isEmptyObject( personalLocationData ) )
        {
            data.personalDetails.address = [];
            data.personalDetails.address[ 0 ] = {};
            data.personalDetails.address[ 0 ].permanentAddress = false;
            data.personalDetails.address[ 0 ].currentAddress = false;
            data.personalDetails.address[ 0 ].cityTown = personalLocationData.cityTown;
            data.personalDetails.address[ 0 ].country = personalLocationData.country;
            data.personalDetails.address[ 0 ].coordinates = personalLocationData.coordinates;


        }

        return data;
    }

    function _prepareGroupProfileData()
    {
        var data
        ,   personalLocationData    = $personalDetailsLocation.bidx_location( "getLocationData" )
        ,   fields                  = [ "description", "slogan", "company", "website", "focusIndustry", "focusRole", "focusSocialImpact" ]
        ,   focusReach
        ,   value
        ;

        /*
            API expected format
            {
            ,   "description" : ""
            ,   "slogan" : ""
            ,   "company" : ""
            ,   "website" : ""
            ,   "focusIndustry:
                [
                     {
                         value: ""
                     ,   label: ""
                     }
                ]
            ,   "focusRole:
                [
                     {
                         value: ""
                     ,   label: ""
                     }
                ]

            ,   "focusSocialImpact:
                [
                     {
                         value: ""
                     ,   label: ""
                     }
                ]

            ,   "focusCountry:
                [
                     {
                         value: ""
                     ,   label: ""
                     }
                ]
            }
            ,   "focusCity:
                [
                     {
                         cityTown: ""
                     ,   country: "nl"
                     }
                ]
            ,   "focusReach":
                {
                    coordinates: ""
                ,   reach: 0
                }
            }
        */

        data = {};

        $.each( fields, function( i, f )
        {
            var $input  = $formfields.filter( "[name='" + f + "']" )
            ,   value   = bidx.utils.getElementValue( $input )
            ;

            bidx.utils.setValue( data, f, value );
        } );

        switch ( bidx.utils.getElementValue( $formfields.filter( "[name=focusLocationType]") ) )
        {
            case "country":
                data.focusCountry = $formfields.filter( "[name=focusCountry]" ).val();
            break;

            case "city":
                data.focusCity = $formfields.filter( "[name=focusCity]" ).tagsinput( "getValues" );
            break;

            case "reach":
                focusReach = $formfields.filter( "[name=focusReach]" ).bidx_location( "getLocationData" );

                // if the location plugin returned a location object that is not empty
                //
                if ( !$.isEmptyObject( focusReach ) )
                {
                    data.focusReach             = {};
                    data.focusReach.coordinates = focusReach.coordinates;
                    data.focusReach.reach       = focusReach.reach;
                }
            break;
        }

        return data;
    }

    function _doSend()
    {
        var memberData      = _prepareMemberProfileData()
        ,   groupData       = _prepareGroupProfileData()
        ,   memberProfileId = $formfields.filter( "[name='creatorProfileId']").val()
        ,   groupProfileId  = $formfields.filter( "[name='groupProfileId']").val()
        ;

        function _doSaveMember( cb )
        {

            bidx.api.call(
                "entity.save"
            ,   {
                    groupDomain:    bidx.common.groupDomain
                ,   entityId:             memberProfileId
                ,   data:           memberData

                ,   success: function( response )
                    {
                        if ( response.status === "OK" )
                        {
                            bidx.utils.log( "[member profile] updated", response );

                            // now execute callback
                            //
                            $.isFunction( cb )
                            {
                                cb();
                            }
                        }

                    }

                ,   error: function( jqXhr, textStatus )
                    {

                        var response = $.parseJSON( jqXhr.responseText);

                        // 400 errors are Client errors
                        //
                        if ( jqXhr.status >= 400 && jqXhr.status < 500)
                        {
                            bidx.utils.error( "Client  error occured", response );
                            _showError( "Something went wrong while storing the memberprofile: " + response.text );
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            _showError( "Something went wrong while storing the memberprofile: " + response.text );
                        }

                    }
                }
            );
        }

        function _doSaveGroup( cb )
        {

            bidx.api.call(
                "entity.save"
            ,   {
                    groupDomain:    bidx.common.groupDomain
                ,   entityId:       groupProfileId
                ,   data:           groupData

                ,   success: function( response )
                    {
                        if ( response.status === "OK" )
                        {
                            bidx.utils.log( "[group profile] updated", response );
                            // now execute callback
                            //
                            $.isFunction( cb )
                            {
                                cb();
                            }

                        }

                    }

                ,   error: function( jqXhr, textStatus )
                    {

                        var response = $.parseJSON( jqXhr.responseText);

                        // 400 errors are Client errors
                        //
                        if ( jqXhr.status >= 400 && jqXhr.status < 500)
                        {
                            bidx.utils.error( "Client  error occured", response );
                            _showError( "Something went wrong while storing the memberprofile: " + response.text );
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            _showError( "Something went wrong while storing the memberprofile: " + response.text );
                        }

                    }
                }
            );

        }

        // first save member, onSucess do save group
        //
        _doSaveMember( _doSaveGroup( function()
        {
            document.location = "/";
        } ) );
    }


    var navigate = function( options )
    {
        // nothing to see here, move along :p
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


    window.bidx.groupRegistration = app;

    _oneTimeSetup();


} ( jQuery ));
