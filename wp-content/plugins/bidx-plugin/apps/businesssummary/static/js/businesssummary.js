( function( $ )
{
    var $element                    = $( "#businessSummary" )
    ,   $snippets                   = $element.find( ".snippets" )

    ,   $views                      = $element.find( ".view" )

    ,   $editControls               = $element.find( ".editControls" )

    ,   $btnSave
    ,   $btnCancel

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
        ,   financialDetails:
            {
                $el:                    $element.find( "#frmBusinessSummary-FinancialDetails" )
            }
        }

    ,   $financialSummary               = $element.find( ".financialSummary")
    ,   $financialSummaryYearsContainer = $financialSummary.find( ".fs-col-years" )

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

    ,   "financialDetails":
        {
            "_arrayFields":
            [
                "financialSummaries"
            ]

        ,   "_root":
            [
                "yearSalesStarted"
            ]

        ,   "financialSummaries":
            [
                "financeNeeded"
            ,   "numberOfEmployees"
            ,   "operationalCosts"
            ,   "salesRevenue"
            //  totalIncome is a derived field, but not a input
            ]
        }
    };


    function _oneTimeSetup()
    {
        _snippets();
        _setupValidation();
        _financialSummary();
        _managementTeam();

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

        // Collect snippets from the DOM
        //
        function _snippets()
        {
            // Grab the snippets from the DOM
            //
            snippets.$managementTeam       = $snippets.children( ".managementTeamItem"   ).remove();
            snippets.$financialSummaries   = $financialSummary.find( ".snippets" ).find( ".financialSummariesItem" ).remove();
        }

        // Setup initial form validation
        //
        function _setupValidation()
        {
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
                        maxlength:              140
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
                        maxlength:              300
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

            // Financial Details
            //
            forms.financialDetails.$el.validate(
            {
                rules:
                {
                    yearSalesStarted:
                    {
                        required:               true
                    }
                }

            ,   noIcon:                 true

            ,   messages:
                {

                }

            ,   errorPlacement:         function( $error, $element )
                {
                    // NOOP, no error messsage
                }

            ,   submitHandler:        function( e )
                {
                    _doSave();
                }
            } );
        }

        // Setup the management team components
        //
        function _managementTeam()
        {
            // Instantiate the reflowrower components
            //
            $managementTeamContainer.reflowrower( { itemsPerRow: 2 } );

            // Add an empty previous business block
            //
            $btnAddManagementTeam.click( function( e )
            {
                e.preventDefault();

                _addManagementTeam();
            } );
        }

        // Setup the financial summary component
        //
        function _financialSummary()
        {
            // FinancialSummmary
            //
            var $btnNext        = $financialSummary.find( "a[href$=#next]" )
            ,   $btnPrev        = $financialSummary.find( "a[href$=#prev]" )
            ,   $btnAddPrev     = $financialSummary.find( "a[href$=#addPreviousYear]" )
            ,   $btnAddNext     = $financialSummary.find( "a[href$=#addNextYear]" )
            ;

            // Add on year to the left
            //
            $btnAddPrev.click( function( e )
            {
                e.preventDefault();

                _addFinancialSummaryYear( "prev" );
            } );

            // Add on year to the right
            //
            $btnAddNext.click( function( e )
            {
                e.preventDefault();

                _addFinancialSummaryYear( "next" );
            } );


            // Navigate one year to the left
            //
            $btnPrev.click( function( e )
            {
                e.preventDefault();

                _navigateYear( "prev" );
            } );

            // Navigate one year to the right
            //
            $btnNext.click( function( e )
            {
                e.preventDefault();

                _navigateYear( "next" );
            } );

            // Calculate the totalincome when the salesRevenue and/or operationalCosts change
            //
            $financialSummaryYearsContainer.delegate( "input[name^='salesRevenue'],input[name^='operationalCosts']", "change", function()
            {
                var $input  = $( this )
                ,   $item   = $input.closest( ".financialSummariesItem" )
                ;

                _calculateTotalIncome( $item );
            } );

            $financialSummaryYearsContainer.find( ".financialSummariesItem:not(.addItem)" ).each( function( )
            {
                var $yearItem = $( this );

                _setupValidation( $yearItem );
            } );

            // Setup validation on a specific year item
            //
            function _setupValidation( $yearItem )
            {
                // Shortcut it for now by treating all the inputs the same
                //
                $yearItem.find( "input" ).each( function( )
                {
                    var $input          = $( this )
                    ,   name            = $input.prop( "name" )
                    ;

                    $input.rules( "add",
                    {
                        required:               true
                    ,   monetaryAmount:         true

                    ,   messages:
                        {
                            required:               ""
                        ,   monetaryAmount:         ""
                        }
                    } );
                } );
            }

            // Add a financial year item
            //
            function _addFinancialSummaryYear( direction )
            {
                var $item       = snippets.$financialSummaries.clone()
                ,   curYear     = bidx.common.getNow().getFullYear()
                ,   year
                ,   yearLabel
                ,   otherYear
                ,   $marker
                ;

                // What is the year we are going to add?
                //
                if ( direction === "prev" )
                {
                    $marker = $financialSummaryYearsContainer.find( ".addItem:first" );

                    otherYear = $marker.next().data( "year" );

                    if ( !otherYear )
                    {
                        year        = curYear;
                        yearLabel   = "Current year";
                    }
                    else
                    {
                        year        = otherYear - 1;
                        yearLabel   = "Actuals";
                    }
                }
                else
                {
                    $marker = $financialSummaryYearsContainer.find( ".addItem:last" );

                    otherYear = $marker.prev().data( "year" );

                    if ( !otherYear )
                    {
                        year        = curYear;
                        yearLabel   = "Current year";
                    }
                    else
                    {
                        year        = otherYear + 1;
                        yearLabel   = "Projected";
                    }

                }

                $item.data( "year", year );
                $item.find( ".year" ).text( year );
                $item.find( ".yearLabel" ).text( yearLabel );

                if ( direction === "prev" )
                {
                    $marker.after( $item );
                }
                else
                {
                    $marker.before( $item );
                }

                _setupValidation( $item );

                _selectYear( $item );
            }

            // Calculate the new total income
            //
            function _calculateTotalIncome( $item )
            {
                var salesRevenue        = parseInt( $item.find( "input[name^='salesRevenue']"     ).val(), 10 ) || 0
                ,   operationalCosts    = parseInt( $item.find( "input[name^='operationalCosts']" ).val(), 10 ) || 0
                ,   totalIncome         = salesRevenue - operationalCosts
                ;

                $item.find( ".totalIncome .viewEdit" ).text( totalIncome );
            }

            // Select a certain year, update the selected state, show the correct years and disable/enable the buttons
            //
            function _selectYear( $yearItem )
            {
                var $years          = $financialSummaryYearsContainer.find( ".financialSummariesItem" )
                ,   $selectedYear   = $years.filter( ".selected" )
                ,   $visibleItems   = $years.filter( ":visible" )
                ,   $prevItem       = $yearItem.prev()
                ,   $nextItem       = $yearItem.next()
                ;

                $selectedYear.removeClass( "selected" );
                $yearItem.addClass( "selected" );

                // Hide all and show conditional the new situation
                //
                $years.hide();

                // Show at least the newly selected year
                //
                $yearItem.show();

                // Responsive design decision, how many items are currently visible? 3 or 1
                //
                if ( $visibleItems.length > 1 )
                {
                    $nextItem.show();
                    $prevItem.show();
                }

                if ( $prevItem.is( ".addItem" ) )
                {
                    $btnPrev.addClass( "disabled" );
                }
                else
                {
                    $btnPrev.removeClass( "disabled" );
                }

                if ( $nextItem.is( ".addItem" ) )
                {
                    $btnNext.addClass( "disabled" );
                }
                else
                {
                    $btnNext.removeClass( "disabled" );
                }
            }

            // Either navigate next or prev
            // Beware, direction is used as a jquery DOM function in this method
            //
            function _navigateYear( direction )
            {
                var $selectedYear   = $financialSummaryYearsContainer.find( ".financialSummariesItem.selected" )
                ,   $otherYear
                ,   $btn
                ;

                switch ( direction )
                {
                    case "next":
                        $btn = $btnNext;
                    break;

                    case "prev":
                        $btn = $btnPrev;
                    break;

                    default:
                        // NOOP
                        bidx.utils.warn( appName + "::_navigateYear: unknown direction: " + direction );
                }

                if ( !$btn || !$btn.length || $btn.hasClass( "disabled" ) )
                {
                    return;
                }

                // What is the year item we want to navigate to?
                //
                $otherYear = $selectedYear[ direction ]( ":not(.addItem)" );

                _selectYear( $otherYear );
            }
        }
    }

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

    // Use the retrieved businessSummary entity to populate the form and other screen elements
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

        // Financial Summaries is an object of which the keys are years and the body is the financial summary
        // for that year
        //
        // Since the HTML is already there, rendered by PHP, we just have to update the fields with the latest values
        // You could argue why this is needed and not just use the 'view rendering time' values, but doing this now
        // ensures the values are as up to date as possible.
        //
        var financialSummaries = bidx.utils.getValue( businessSummary, "financialSummaries" );

        if ( financialSummaries )
        {
            $.each( financialSummaries, function( year, data )
            {
                var $yearItem = $financialSummaryYearsContainer.find( "[data-year='" + year + "']" );

                _updateFinancialSummariesItem( $yearItem, data );
            } );
        }
    }

    // Update the pre-rendered dom elements for the financial summarie
    //
    function _updateFinancialSummariesItem( $item, data )
    {
        $.each( fields.financialDetails.financialSummaries, function( idx, f )
        {
            var value = data[ f ] || "";

            $item.find( "[name^='" + f + "']" ).val( value );
        } );

        $item.find( ".totalIncome .viewEdit" ).text( data[ "totalIncome" ]);
    }

    // Convert the form values back into the member object
    //
    function _getFormValues()
    {
        // Itterate over the form fields, not all fields are using forms. Financial Summary
        // is a repeating list, but not a
        //
        $.each( fields, function( form, formFields )
        {
            var $form       = forms[ form ].$el
            ;

            // Unbox
            //
            form += "";

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

                // @TODO: make it generic for 'object type' like financialSummaries is
                //
                if ( nest === "financialSummaries" )
                {
                    item = {};
                    bidx.utils.setValue( businessSummary, objectPath, item );

                    $form.find( ".financialSummariesItem" ).each( function( idx, financialSummariesItem )
                    {
                        var $financialSummariesItem = $( financialSummariesItem )
                        ,   year                    = $financialSummariesItem.data( "year" )
                        ;

                        // Make sure we have an actual year by parsing it to a number
                        //
                        year = parseInt( year, 10 );

                        if ( !year )
                        {
                            return;
                        }

                        item[ year ] = {};

                        $.each( formFields[ nest ], function( i, f )
                        {
                            var $input  = $financialSummariesItem.find( "[name^='" + f + "']" )
                            ,   value   = bidx.utils.getElementValue( $input )
                            ;

                            item[ year ][ f ] = value;
                        } );
                    } );
                }
                else
                {
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
                }

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
        $btnSave    = $( "<a />", { class: "btn btn-primary disabled", href: "#save"    });
        $btnCancel  = $( "<a />", { class: "btn btn-primary disabled", href: "#cancel"  });

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

        // PM-187: Create call should set the periodStartDate to the first januari of the year the businessummary is created
        //
        if ( state === "create" )
        {
            businessSummary.periodStartDate = bidx.utils.getISODate( bidx.common.getNow() );
        }

        // Save the data to the API
        //
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
                bidx.utils.log( "EditBusinessSummary::AppRouter::edit", options.id, options.section );

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

            case "create":
                bidx.utils.log( "EditBusinessSummary::AppRouter::create" );

                businessSummaryId   = null;
                state               = "create";

                _showView( "load" );

                // Make sure the i18n translations for this app are available before initing
                //
                bidx.i18n.load( [ "__global", appName ] )
                    .done( function()
                    {
                        _init();
                    } );
            break;
        }
    };

    function reset()
    {
        state = null;
    }

    // Engage!
    //
    _oneTimeSetup();

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
