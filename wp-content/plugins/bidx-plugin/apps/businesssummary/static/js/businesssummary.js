( function( $ )
{
    var $element                    = $( "#businessSummary" )
    ,   $snippets                   = $element.find( ".snippets" )

    ,   $views                      = $element.find( ".view" )

    ,   $editControls               = $element.find( ".editControls" )
    ,   $controlsForEdit            = $editControls.find( ".viewEdit" )
    ,   $controlsForError           = $editControls.find( ".viewError" )

    ,   forms                       =
        {
            generalOverview:
            {
                $el:                    $element.find( "#frmBusinessSummary-GeneralOverview" )
            }
        ,   aboutYourBusiness:
            {
                $el:                    $element.find( "#frmBusinessSummary-AboutYourBusiness" )
            }
        ,   aboutYouAndYourTeam:
            {
                $el:                    $element.find( "#frmBusinessSummary-AboutYouAndYourTeam" )
            }
        }

    ,   $btnAddManagementTeam       = forms.aboutYouAndYourTeam.$el.find( "[href$='#addManagementTeam']" )
    ,   $managementTeamContainer    = forms.aboutYouAndYourTeam.$el.find( ".managementTeamContainer" )

    ,   businessSummary
    ,   businessSummaryId

    ,   state
    ,   currentView
    ,   bidx                        = window.bidx
    ,   snippets                    = {}

    ,   appName                     = "businesssummary"
    ;

    // Form fields
    //
    var fields =
    {
        "generalOverview":
        {
            "_root":
            [
                "name"
            ,   "slogan"
            ,   "summary"
            ,   "reasonForSubmission"
            ,   "equityRetained"
            ,   "financingNeeded"
            ,   "investmentType"
            ,   "summaryFinancingNeeded"
            ]
        }

    ,   "aboutYourBusiness":
        {
            "_root":
            [
                "industry"
            ,   "suggestedIndustry"
            ,   "productService"
            ,   "suggestedProductService"
            ,   "countryOperation"
            ,   "socialImpact"
            ,   "envImpact"
            ,   "consumerType"
            ]
        }

    ,   "aboutYouAndYourTeam":
        {
            "_root":
            [
                "personalRole"
            ,   "personalExpertise"
            ]

        ,   "_arrayFields":
            [
                "managementTeam"
            ]

        ,   "_reflowRowerFields":
            [
                "managementTeam"
            ]

        ,   "managementTeam":
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

    // Populate the dropdowns with the values
    //
    bidx.data.getContext( "reasonForSubmission", function( err, reasons )
    {
        var $reasonForSubmission    = forms.generalOverview.$el.find( "[name='reasonForSubmission']" )
        ,   $noValue                = $( "<option value='' />" )
        ;

        $reasonForSubmission.empty();

        $noValue.i18nText( "selectReasonForSubmission", appName );
        $reasonForSubmission.append( $noValue );

        bidx.utils.populateDropdown( $reasonForSubmission, reasons );
    } );


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
                var $input  = $managementTeam.find( "[name='" + f + "']" )
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


    // Use the retrieved businesSummary entity to populate the form and other screen elements
    //
    function _populateScreen()
    {
        $.each( fields, function( form, formFields )
        {
            var $form       = forms[ form ].$el;

            if ( formFields._root )
            {
                $.each( formFields._root, function( i, f )
                {
                    var $input = $form.find( "[name='" + f + "']" )
                    ,   value  = bidx.utils.getValue( businessSummary, f )
                    ;

                    $input.each( function()
                    {
                        // Value can be an array! Most likely we are targeting a
                        //
                        bidx.utils.setElementValue( $( this ), value );
                    } );
                } );
            }
        } );

        // Now the nested objects
        //
        var managementTeam = bidx.utils.getValue( businessSummary, "managementTeam", true );

        if ( managementTeam )
        {
            $.each( managementTeam, function( i, item )
            {
                _addManagementTeam( i, item );
            } );
        }
    }

    // Convert the form values back into the member object
    //
    function _getFormValues()
    {
        $.each( fields, function( form, formFields )
        {
            var $form       = forms[ form ].$el
            ;

            if ( formFields._root )
            {
                $.each( formFields._root, function( i, f )
                {
                    var $input = $form.find( "[name='" + f + "']" )
                    ,   value  = bidx.utils.getElementValue( $input )
                    ;

                    bidx.utils.setValue( businessSummary, f, value );
                } );
            }

            // Collect the nested objects
            //
            $.each( formFields, function( nest )
            {
                // unbox that value!
                //
                nest += "";

                // Properties that start with an _ are special properties and should be ignore
                //
                if ( nest.charAt( 0 ) === "_" )
                {
                    return;
                }

                var i                   = 0
                ,   arrayField          = formFields._arrayFields && $.inArray( nest, formFields._arrayFields ) !== -1
                ,   reflowrowerField    = formFields._reflowRowerFields && $.inArray( nest, formFields._reflowRowerFields ) !== -1
                ,   objectPath          = nest
                ,   item
                ,   count
                ;

                if ( arrayField )
                {
                    count   = $form.find( "." + nest + "Item" ).length;
                    item    = [];
                }
                else
                {
                    item    = {};
                }

                bidx.utils.setValue( businessSummary, objectPath, item );
                bidx.utils.setNestedStructure( item, count, nest, $form, formFields[ nest ]  );

                // Now collect the removed items, clear the properties and push them to the list so the API will delete them
                //
                var $reflowContainer
                ,   removedItems
                ;

                if ( reflowrowerField )
                {
                    $reflowContainer = $form.find( "." + nest + "Container" );

                    if ( $reflowContainer.length )
                    {
                        removedItems = $reflowContainer.reflowrower( "getRemovedItems" );

                        $.each( removedItems, function( idx, removedItem )
                        {
                            var $removedItem    = $( removedItem )
                            ,   bidxData        = $removedItem.data( "bidxData" )
                            ;

                            if ( bidxData )
                            {
                                // Iterate over the properties and set all, but bidxMeta, to null, except for array's, those must be set to an empty array...
                                //
                                $.each( bidxData, function( prop )
                                {
                                    if ( prop !== "bidxMeta" )
                                    {
                                        bidxData[ prop ] = $.type( bidxData[ prop ] ) === "array"
                                            ? []
                                            : null
                                        ;
                                    }
                                } );
                            }

                            item.push( bidxData );
                        } );
                    }
                }
            } );
        } );
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

            _doSave();
        } );


        $btnSave.i18nText( "btnSaveAndView" );
        $btnCancel.i18nText( "btnCancel" );

        $controlsForEdit.empty();
        $controlsForEdit.append( $btnSave, $btnCancel );

        $controlsForError.empty();
        $controlsForError.append( $btnCancel.clone( true ) );

        // General Overview
        //
        forms.generalOverview.$el.validate(
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
                _doSave();
            }
        } );

        // About your business
        //
        forms.aboutYourBusiness.$el.validate(
        {
            rules:
            {
                industry:
                {
                    tagsinputRequired:      true
                }
            ,   suggestedIndustry:
                {
                }
            ,   productService:
                {
                    tagsinputRequired:      true
                }
            ,   suggestedProductService:
                {
                }
            ,   countryOperation:
                {
                    tagsinputRequired:      true
                }
            ,   socialImpact:
                {
                }
            ,   envImpact:
                {
                }
            ,   consumerType:
                {
                    required:               true
                }
            }
        ,   messages:
            {

            }
        ,   submitHandler:          function( e )
            {
                _doSave();
            }
        } );

        // About you and your team
        //
        forms.aboutYouAndYourTeam.$el.validate(
        {
            rules:
            {
                personalRole:
                {
                    required:               true
                ,   maxlength:              30
                }
            ,   personalExpertise:
                {
                    required:               true
                ,   maxlength:              180
                }
            }
        ,   messages:
            {

            }
        ,   submitHandler:          function( e )
            {
                _doSave();
            }
        } );

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

        // Try to save the businessSummary to the API
        //
        function _doSave( params )
        {
            // Only allow saving when all the sub forms are valid
            //
            var anyInvalid = false;

            $.each( forms, function( name, form )
            {
                if ( !form.$el.valid() )
                {
                    anyInvalid = true;
                }
            } );

            if ( anyInvalid )
            {
                return;
            }

            if ( $btnSave.hasClass( "disabled" ) )
            {
                return;
            }

            $btnSave.addClass( "disabled" );
            $btnCancel.addClass( "disabled" );

            _save(
            {
                error: function( jqXhr )
                {
                    var response;

                    try
                    {
                        // Not really needed for now, but just have it on the screen, k thx bye
                        //
                        response = JSON.stringify( JSON.parse( jqXhr.responseText ), null, 4 );
                    }
                    catch ( e )
                    {
                        bidx.utils.error( "problem parsing error response from businessSummary save" );
                    }

                    bidx.common.notifyError( "Something went wrong during save: " + response );

                    $btnSave.removeClass( "disabled" );
                    $btnCancel.removeClass( "disabled" );
                }
            } );
        }
    }

    // Beware! validation should have been tested, this is just a function for callin the API for saving
    //
    function _save( params )
    {
        if ( !businessSummary )
        {
            return;
        }

        // Update the business summary object
        //
        _getFormValues();

        if ( businessSummary.stageBusiness )
        {
            businessSummary.stageBusiness = businessSummary.stageBusiness.toLowerCase();
        }


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

                    var url = document.location.href.split( "#" ).shift().split( "?" ).shift();

                    document.location.href = url + "?rs=true";
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
