( function( $ )
{
    var $element                    = $( "#businessSummary" )
    ,   $snippets                   = $element.find( ".snippets" )

    ,   $views                      = $element.find( ".view" )

    ,   $editControls               = $element.find( ".editControls" )
    ,   $controlsForEdit            = $editControls.find( ".viewEdit" )
    ,   $controlsForError           = $editControls.find( ".viewError" )

    ,   $frmGeneralOverview         = $element.find( "#frmBusinessSummary-GeneralOverview" )
    ,   $frmAboutYourBusiness       = $element.find( "#frmBusinessSummary-AboutYourBusiness" )
    ,   $frmAboutYouAndYourTeam     = $element.find( "#frmBusinessSummary-AboutYouAndYourTeam" )

    ,   $btnAddManagementTeam       = $frmAboutYouAndYourTeam.find( "[href$='#addManagementTeam']" )
    ,   $managementTeamContainer    = $frmAboutYouAndYourTeam.find( ".managementTeamContainer" )

    ,   businessSummary
    ,   businessSummaryId

    ,   state
    ,   currentView
    ,   bidx                        = window.bidx
    ,   snippets                    = {}

    ,   appName                     = "businesssummary"

    ;

    var fields =
    {
        "generalOverview":
        {

        }

    ,   "aboutYourBusiness":
        {

        }

    ,   "aboutYouAndYourTeam":
        {
            "managementTeam":
            [
                "firstName"
            ,   "lastName"
            ,   "role"
            ,   "expertise"
            ]
        }
    };

    // Grab the snippets from the DOM
    //
    snippets.$managementTeam       = $snippets.children( ".managementTeamItem"   ).remove();

    // On any changes, how little doesn't matter, notify that we have a pending change
    // But no need to track the changes when doing a member data load
    //
    $element.bind( "change", function()
    {
        if ( currentView === "edit" )
        {
            bidx.common.addAppWithPendingChanges( appName );
        }
    } );


    // Instantiate the reflowrower components
    //
    $managementTeamContainer.reflowrower( { itemsPerRow: 2 } );

    // Add the snippet for a previous investment
    //
    function _addManagementTeam( index, managementTeam )
    {
        if ( !index )
        {
            index = $managementTeamContainer.find( ".managementTeamItem" ).length;
        }

        var $managementTeam = snippets.$managementTeam.clone()
        ,   inputNamePrefix = "managementTeam[" + index + "]"
        ;

        // Are we adding an investment with data or just an empty item?
        //
        if ( managementTeam )
        {
            $.each( fields.aboutYouAndYourTeam.managementTeam, function( j, f )
            {
                var $input  = $managementTeam.find( "[name='" + inputNamePrefix + "." + f + "']" )
                ,   value   = bidx.utils.getValue( managementTeam, f )
                ;

                $input.each( function()
                {
                    bidx.utils.setElementValue( $( this ), value  );
                } );
            } );
        }

        // Store the data in the DOM for later referal / merging
        //
        $managementTeam.data( "bidxData", managementTeam );

        // Add it to the DOM!
        //
        $managementTeamContainer.reflowrower( "addItem", $managementTeam );

        // Update all the input elements and prefix the names with the right index
        // So <input name="bla" /> from the snippet becomes <input name="foo[2].bla" />
        //
        $managementTeam.find( "input, select, textarea" ).each( function( )
        {
            var $input          = $( this )
            ,   baseName        = $input.prop( "name" )
            ,   newName         = inputNamePrefix + "." + baseName
            ;

            $input.prop( "name", newName );

            // Notify the form validator of the new elements
            // Use 'orgName' since that is consistent over each itteration
            //
            switch ( baseName )
            {
                case "firstName":
                case "lastName":
                    $input.rules( "add",
                    {
                        required:               true
                    } );
                break;

                case "role":
                    $input.rules( "add",
                    {
                        required:               true
                    } );
                break;

                case "expertise":
                    $input.rules( "add",
                    {
                        required:               true
                    } );
                break;

                default:
                    // NOOP
            }
        } );
    }

    // Add an empty previous business block
    //
    $btnAddManagementTeam.click( function( e )
    {
        e.preventDefault();

        _addManagementTeam();
    } );


    // Use the retrieved member object to populate the form and other screen elements
    //
    function _populateScreen()
    {

    }

    // Convert the form values back into the member object
    //
    function _getFormValues()
    {

    }

    // This is the startpoint for the edit state
    //
    function _init()
    {
        // Reset any state
        //
        // Inject the save and button into the controls
        //
        var $btnSave    = $( "<a />", { class: "btn btn-primary disabled", href: "#save"    })
        ,   $btnCancel  = $( "<a />", { class: "btn btn-primary disabled", href: "#cancel"  })
        ;

        $btnCancel.bind( "click", function( e )
        {
            e.preventDefault();

            bidx.common.removeAppWithPendingChanges( appName );
            bidx.controller.updateHash( "" );

            reset();

            _showView( "show" );
        } );

        $btnSave.bind( "click", function( e )
        {
            e.preventDefault();

            alert( "todo" );

            // @TODO: are all forms valid?
            // _save();
        } );


        $btnSave.i18nText( "btnSaveAndView" );
        $btnCancel.i18nText( "btnCancel" );

        $controlsForEdit.empty();
        $controlsForEdit.append( $btnSave, $btnCancel );

        $controlsForError.empty();
        $controlsForError.append( $btnCancel.clone( true ) );

        // General Overview
        //
        $frmGeneralOverview.validate(
        {
            rules:
            {
                name:
                {
                    required:               true
                ,   maxlength:              30
                }
            ,   slogan:
                {
                    maxlength:              90
                }
            ,   summary:
                {
                    required:               true
                ,   maxlength:              900
                }
            ,   reasonForSubmission:
                {
                    required:               true
                }
            ,   equityRetained:
                {
                    required:               true
                ,   digits:                 true
                ,   min:                    0
                ,   max:                    100
                }
            ,   financeNeeded:
                {
                    required:               true
                ,   monetaryAmount:         true
                }
            ,   investmentType:
                {
                    required:               true
                }
            ,   summaryFinancingNeeded:
                {
                    maxlength:              180
                }
            }
        ,   messages:
            {

            }
        ,   submitHandler:          function( e )
            {

            }
        } );

        // About your business
        //
        $frmAboutYourBusiness.validate(
        {
            rules:
            {

            }
        ,   messages:
            {

            }
        ,   submitHandler:          function( e )
            {

            }
        } );

        // About you and your team
        //
        $frmAboutYouAndYourTeam.validate(
        {
            rules:
            {

            }
        ,   messages:
            {

            }
        ,   submitHandler:          function( e )
            {

            }
        } );

        // var $validator = $editForm.validate(
        // {
        //     rules:
        //     {
        //     }
        // ,   messages:
        //     {
        //         // Anything that is app specific, the general validations should have been set
        //         // in common.js already
        //     }
        // ,   submitHandler:  function()
        //     {
        //         if ( $btnSave.hasClass( "disabled" ) )
        //         {
        //             return;
        //         }

        //         $btnSave.addClass( "disabled" );
        //         $btnCancel.addClass( "disabled" );

        //         _save(
        //         {
        //             error: function( jqXhr )
        //             {
        //                 var response;

        //                 try
        //                 {
        //                     // Not really needed for now, but just have it on the screen, k thx bye
        //                     //
        //                     response = JSON.stringify( JSON.parse( jqXhr.responseText ), null, 4 );
        //                 }
        //                 catch ( e )
        //                 {
        //                     bidx.utils.error( "problem parsing error response from memberProfile save" );
        //                 }

        //                 bidx.common.notifyError( "Something went wrong during save: " + response );

        //                 $btnSave.removeClass( "disabled" );
        //                 $btnCancel.removeClass( "disabled" );
        //             }
        //         } );
        //     }
        // } );

        // Fetch the business summary
        //
        bidx.api.call(
            "entity.fetch"
        ,   {
                entityId:           businessSummaryId
            ,   groupDomain:        bidx.common.groupDomain

            ,   success: function( response )
                {
                    bidx.utils.log( "[BusinessSummary] fetch", businessSummaryId, response );

                    // Do we have edit perms?
                    //
                    var bidxMeta    = bidx.utils.getValue( response, "bidxMeta" )
                    ,   canEdit     = bidx.utils.getValue( bidxMeta, "bidxCanEdit" )
                    ;

                    if ( !canEdit )
                    {
                        bidx.i18n.getItem( "noEditPermission", function( err, label )
                        {
                            _showError( label );
                        } );

                        $btnCancel.removeClass( "disabled" );
                    }
                    else
                    {
                        businessSummary = response;

                        bidx.utils.log( "bidx::businessSummary", businessSummary );

                        _populateScreen();

                        $btnSave.removeClass( "disabled" );
                        $btnCancel.removeClass( "disabled" );

                        _showView( "edit" );
                    }
                }
            ,   error:          function( jqXhr, textStatus )
                {
                    var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                    _showError( "Something went wrong while retrieving the businessSummary: " + status );
                }
            }
        );
    }

    // Try to save the businessSummary to the API
    //
    function _save( params )
    {
        if ( !businessSummary )
        {
            return;
        }

        // Only allow saving when all the sub forms are valid
        //
        if ( !$frmGeneralOverview.valid() || !$frmAboutYourBusiness.valid() || !$frmAboutYouAndYourTeam.valid() )
        {
            return;
        }

        // Update the business summary object
        //
        _getFormValues();

        bidx.api.call(
            "entity.save"
        ,   {
                entityId:       businessSummaryId
            ,   groupDomain:    bidx.common.groupDomain
            ,   data:           businessSummary
            ,   success:        function( response )
                {
                    bidx.utils.log( "entity.save::success::response", response );

                    bidx.common.notifyRedirect();
                    bidx.common.removeAppWithPendingChanges( appName );

                    var url = document.location.href.split( "#" ).shift();

                    document.location.href = url;
                }
            ,   error:          function( jqXhr )
                {
                    params.error( jqXhr );
                }
            }
        );
    }

    // Private functions
    //
    var _showError = function( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    };

    var _showView = function( v )
    {
        currentView = v;

        $views.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();
    };

    // ROUTER
    //
    var navigate = function( options )
    {
        switch ( options.requestedState )
        {
            case "edit":
                bidx.utils.log( "EditBusinessSummarys::AppRouter::edit", options.id, options.section );

                var newBusinessSummaryId
                ,   splatItems
                ,   updateHash      = false
                ,   isId            = ( options.id && options.id.match( /^\d+$/ ) )
                ;

                if ( options.id && !isId )
                {
                    options.section = options.id;
                    options.id      = businessSummaryId;

                    updateHash = true;
                }

                // No businessSummaryId set yet and not one explicitly provided? Use the one from the bidxConfig.context
                //
                if ( !businessSummaryId && !isId )
                {
                    options.id = bidx.utils.getValue( bidxConfig, "bidxBusinessSummary" );

                    updateHash = true;
                }

                if ( !( state === "edit" && options.id === businessSummaryId ) )
                {
                    businessSummaryId   = options.id;
                    state               = "edit";

                    _showView( "load" );

                    // Make sure the i18n translations for this app are available before initing
                    //
                    bidx.i18n.load( [ "__global", appName ] )
                        .done( function()
                        {
                            _init();
                        } );
                }

                if ( updateHash )
                {
                    var hash = "editBusinessSummary/" + options.id;

                    if ( options.section )
                    {
                         hash += "/" + options.section;
                    }

                    return hash;
                }
            break;
        }
    };

    function reset()
    {
        state = null;
    }

    // Expose
    //
    var app =
    {
        navigate:                   navigate
    ,   reset:                      reset

    ,   $element:                   $element

        // START DEV API
        //
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.businessSummary = app;
} ( jQuery ));
