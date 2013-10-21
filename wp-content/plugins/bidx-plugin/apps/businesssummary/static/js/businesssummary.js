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
        ,   companyDetails:
            {
                $el:                    $element.find( "#frmBusinessSummary-CompanyDetails" )
            }
        }

        // Financial Summary / Details
        //
    ,   $financialSummary               = $element.find( ".financialSummary")
    ,   $financialSummaryYearsContainer = $financialSummary.find( ".fs-col-years" )

        // Managament Team
        //
    ,   $btnAddManagementTeam       = forms.aboutYouAndYourTeam.$el.find( "[href$='#addManagementTeam']" )
    ,   $managementTeamContainer    = forms.aboutYouAndYourTeam.$el.find( ".managementTeamContainer" )

        // Company Details
        //
    ,   $companyDetails             = $element.find( "#businessSummaryAccordion-CompanyDetails" )
    ,   $hasCompany                 = forms.companyDetails.$el.find( "input[name='hasCompany']" )
    ,   $doesHaveCompany            = forms.companyDetails.$el.find( ".doesHaveCompany" )
    ,   $companiesTable             = $doesHaveCompany.find( "table" )
    ,   $addNewCompany              = $companyDetails.find( ".addNewCompany")
    ,   $btnAddNewCompany           = $companyDetails.find( "a[href$='addNewCompany']" )

        // Buttons under to control the add company form
        //
    ,   $btnAddCompany              = $companyDetails.find( "a[href$='addCompany']" )
    ,   $btnCancelAddCompany        = $companyDetails.find( "a[href$='cancelAddCompany']" )

        // Documents component
        //
    ,   $documents                  = $element.find( "#businessSummaryAccordion-Documents" )
    ,   $btnAddFiles                = $documents.find( "a[href$='addFiles']" )
    ,   $addFiles                   = $documents.find( ".addFiles" )
    ,   $attachmentContainer        = $documents.find( ".attachmentContainer" )

    ,   businessSummary
    ,   businessSummaryId

    ,   companies

    ,   state
    ,   currentView
    ,   bidx                        = window.bidx
    ,   snippets                    = {}

    ,   appName                     = "businesssummary"

        // Object used to expose functions on
        //
    ,   financialSummary            =
        {
            deletedYears:               {}
        }
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

    // Setup function for doing work that should only be done once
    //
    function _oneTimeSetup()
    {
        _snippets();
        _setupValidation();
        _financialSummary();
        _managementTeam();
        _companyDetails();
        _documents();

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
            snippets.$managementTeam        = $snippets.children( ".managementTeamItem" ).remove();
            snippets.$financialSummaries    = $financialSummary.find( ".snippets" ).find( ".financialSummariesItem" ).remove();
            snippets.$company               = $snippets.find( "table tr.companyItem"    ).remove();
            snippets.$attachment            = $snippets.children( ".attachmentItem"    ).remove();
        }

        // Setup initial form validation
        //
        function _setupValidation()
        {
            // General Overview
            //
            forms.generalOverview.$el.validate(
            {
                ignore:         ""
            ,   rules:
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
                ,   financingNeeded:
                    {
                        required:               true
                    ,   monetaryAmount:         true
                    }
                ,   "investmentType[]":
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
                ignore:         ""
            ,   rules:
                {
                    industry:
                    {
                        tagsinputRequired:      true
                    }
                ,   productService:
                    {
                        tagsinputRequired:      true
                    }
                ,   countryOperation:
                    {
                        tagsinputRequired:      true
                    }
                ,   "consumerType[]":
                    {
                        required:      true
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
                ignore:                 ""
            ,   rules:
                {
                    yearSalesStarted:
                    {
                        required:               true
                    }
                }

            ,   messages:
                {

                }

            ,   submitHandler:        function( e )
                {
                    _doSave();
                }
            } );

            // Company details
            //
            forms.companyDetails.$el.validate(
            {
                ignore:                 ""
            ,   rules:
                {
                    hasCompany:
                    {
                        required:               true
                    }
                ,   company:
                    {
                        required:               function() { return $hasCompany.filter( ":checked" ).val() === "true"; }
                    }
                }

            ,   messages:
                {

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
            // FinancialSummary
            //
            var $btnNext        = $financialSummary.find( "a[href$=#next]" )
            ,   $btnPrev        = $financialSummary.find( "a[href$=#prev]" )
            ,   $btnAddPrev     = $financialSummary.find( "a[href$=#addPreviousYear]" )
            ,   $btnAddNext     = $financialSummary.find( "a[href$=#addNextYear]" )

            ,   curYear         = bidx.common.getNow().getFullYear()
            ;

            // Add on year to the left
            //
            $financialSummary.delegate( "a[href$=#addPreviousYear]", "click", function( e )
            {
                e.preventDefault();

                _addFinancialSummaryYear( "prev" );
            } );

            // Add on year to the right
            //
            $financialSummary.delegate( "a[href$=#addNextYear]", "click", function( e )
            {
                e.preventDefault();

                _addFinancialSummaryYear( "next" );
            } );

            // Delete the year
            //
            $financialSummary.delegate( "a[href$=#deleteYear]", "click", function( e )
            {
                e.preventDefault();

                var $financialSummariesItem = $( this ).closest( ".financialSummariesItem" )
                ,   year                    = parseInt( $financialSummariesItem.attr( "data-year" ), 10 )
                ;

                _deleteFinancialSummaryYear( year );
            } );

            // Navigate one year to the left
            //
            $financialSummary.delegate( "a[href$=#prev]", "click", function( e )
            {
                e.preventDefault();

                _navigateYear( "prev" );
            } );

            // Navigate one year to the right
            //
            $financialSummary.delegate( "a[href$=#next]", "click", function( e )
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

            // Itterate over the server side rendered year items
            //
            $financialSummaryYearsContainer.find( ".financialSummariesItem:not(.addItem)" ).each( function( )
            {
                var $yearItem   = $( this )
                ,   year        = parseInt( $yearItem.attr( "data-year" ), 10 )
                ;

                _setupValidationForYearItem( $yearItem );

                // Show the delete button on the last / first year in case the year is not current year
                //
                if ( state === "edit" )
                {
                    if ( $yearItem.hasClass( "first" ) && year < curYear )
                    {
                        $yearItem.find( ".btnDelete" ).show();
                    }
                    else if ( $yearItem.hasClass( "last" ) && year > curYear )
                    {
                        $yearItem.find( ".btnDelete" ).show();
                    }
                }
            } );

            // Setup validation on a specific year item
            //
            function _setupValidationForYearItem( $yearItem )
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
                ,   year
                ,   yearLabel
                ,   $otherYear
                ,   otherYear
                ,   $marker
                ;

                // What is the year we are going to add?
                //
                if ( direction === "prev" )
                {
                    $marker     = $financialSummaryYearsContainer.find( ".addItem:first" );
                    $otherYear  = $marker.next();
                    otherYear   = parseInt( $otherYear.attr( "data-year" ), 10 );

                    // Is there no other year? This can only happen when there are absolutely none year items in the DOM
                    //
                    if ( !otherYear )
                    {
                        year        = curYear;
                        yearLabel   = bidx.i18n.i( "currentYear", appName );
                    }
                    else
                    {
                        year        = otherYear - 1;
                        yearLabel   = bidx.i18n.i( "actuals", appName );
                    }
                }
                else
                {
                    $marker     = $financialSummaryYearsContainer.find( ".addItem:last" );
                    $otherYear  = $marker.prev();
                    otherYear   = parseInt( $otherYear.attr( "data-year" ), 10 );

                    if ( !otherYear )
                    {
                        year        = curYear;
                        yearLabel   = bidx.i18n.i( "currentYear", appName );
                    }
                    else
                    {
                        year        = otherYear + 1;
                        yearLabel   = bidx.i18n.i( "forecast", appName );
                    }
                }

                // Add administration of the item
                //
                $item.attr( "data-year", year );
                $item.addClass( "new" );

                // Set content in the header
                //
                $item.find( ".year"         ).text( year );
                $item.find( ".yearLabel"    ).text( yearLabel );

                // Move the available delete year button to the new year
                //
                $otherYear.find( ".btnDelete" ).hide();
                $item.find( ".btnDelete" ).show();

                if ( direction === "prev" )
                {
                    $otherYear.removeClass( "first" );
                    $item.addClass( "first" );

                    $marker.after( $item );
                }
                else
                {
                    $otherYear.removeClass( "last" );
                    $item.addClass( "last" );

                    $marker.before( $item );
                }

                // Rename all the input elements to include the year
                //
                $item.find( "input" ).each( function( )
                {
                    var $input      = $( this )
                    ,   name        = $input.prop( "name" )
                    ,   newName     = name.replace( "[]", "[" + year + "]" )
                    ;

                    $input.prop( "name", newName );
                } );

                _setupValidationForYearItem( $item );

                financialSummary.selectYear( year );
            }

            // Delete the year from the DOM and administer it's deleting so we can communicate it as being delete to the
            // API
            //
            function _deleteFinancialSummaryYear( year )
            {
                var $year          = $financialSummaryYearsContainer.find( ".financialSummariesItem[data-year='" + year + "']" )
                ,   newYear
                ,   $newYear       = $year.next()
                ;

                // What to select as a new year?
                //
                if ( !$newYear.is( ".addItem" ) )
                {
                    newYear = year + 1;
                }
                else
                {
                    $newYear = $year.prev();

                    if ( !$newYear.is( ".addItem" ) )
                    {
                        newYear = year - 1;
                    }
                    else
                    {
                        $newYear = undefined;
                    }
                }

                // Now we know what we are to move next to, remove it from the DOM
                //
                $year.remove();
                financialSummary.deletedYears[ year ] = true;

                if ( $newYear )
                {
                    // If it isn't the current year, show the delete button on the new year
                    //
                    if ( newYear !== curYear && state === "edit" )
                    {
                        $newYear.find( ".btnDelete" ).show();
                    }

                    if ( newYear )
                    {
                        financialSummary.selectYear( newYear );
                    }
                }
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
            function selectYear( year )
            {
                var $years          = $financialSummaryYearsContainer.find( ".financialSummariesItem" )
                ,   $selectedYear   = $years.filter( ".selected" )
                ,   $visibleItems   = $years.filter( ":visible" )
                ,   $yearItem       = $years.filter( "[data-year='" + year + "']" )
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

                // Responsive design decision. Is the year hugely smaller than the container?
                // Seems to be more correct than testing for css display property which sometimes just says it's
                // block while it isn't
                //
                if ( $yearItem.width() + 100 < $yearItem.parent().width()  )
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
                ,   otherYear
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
                $otherYear  = $selectedYear[ direction ]( ":not(.addItem)" );
                otherYear   = parseInt( $otherYear.attr( "data-year" ), 10 );

                financialSummary.selectYear( otherYear );
            }

            // Expose financial summary fucntinos
            //
            financialSummary.selectYear = selectYear;
        }

        // Setup the Company Details component
        //
        function _companyDetails()
        {
            $hasCompany.change( function( e )
            {
                var value   = $hasCompany.filter( "[checked]" ).val()
                ,   fn      = value === "true" ? "fadeIn" : "hide"
                ;

                $doesHaveCompany[ fn ]();
            } );

            $btnAddNewCompany.click( function( e )
            {
                e.preventDefault();

                var $btn = $( this );
                $btn.hide();

                $btnAddCompany.removeClass( "disabled" );
                $btnCancelAddCompany.removeClass( "disabled" );

                bidx.company.navigate(
                {
                    requestedState:     "create"
                ,   slaveApp:           true
                ,   callbacks:
                    {
                        success:            function( company )
                        {
                            _addCompany( null, company );

                            $addNewCompany.hide();
                            $btn.show();
                        }
                    ,   error:              function()
                        {
                            $btnAddCompany.removeClass( "disabled" );
                            $btnCancelAddCompany.removeClass( "disabled" );
                        }
                    ,   ready:              function()
                        {
                            $btnAddCompany.removeClass( "disabled" );
                            $btnCancelAddCompany.removeClass( "disabled" );
                        }
                    ,   saving:             function()
                        {
                            $btnAddCompany.addClass( "disabled" );
                            $btnCancelAddCompany.addClass( "disabled" );
                        }
                    }
                } );

                $addNewCompany.fadeIn();
            } );

            // Validate and if valid, save the company
            //
            $btnAddCompany.click( function( e )
            {
                e.preventDefault();

                if ( $btnAddCompany.hasClass( "disabled" ) )
                {
                    return;
                }

                bidx.company.save();
            } );

            // Cancel adding the company, hide the add company form and return to the previous state
            //
            $btnCancelAddCompany.click( function( e )
            {
                e.preventDefault();

                if ( $btnCancelAddCompany.hasClass( "disabled" ) )
                {
                    return;
                }

                $addNewCompany.hide();
                $btnAddNewCompany.show();
            } );

        }

        // Setup the Documents component
        //
        function _documents()
        {
            // Clicking the add files button will load the media library
            //
            $btnAddFiles.click( function( e )
            {
                e.preventDefault();

                var $btn = $( this );
                $btn.hide();

                // Navigate the media app into list mode for selecting files
                //
                bidx.media.navigate(
                {
                    requestedState:         "list"
                ,   slaveApp:               true
                ,   selectFile:             true
                ,   multiSelect:            true
                ,   callbacks:
                    {
                        ready:                  function( state )
                        {
                            bidx.utils.log( "[documents] ready in state", state );
                        }

                    ,   cancel:                 function()
                        {
                            // Stop selecting files, back to previous stage
                            //
                            $btn.show();
                            $addFiles.hide();
                        }

                    ,   success:                function( file )
                        {
                            bidx.utils.log( "[documents] uploaded", file );

                            // NOOP.. the parent app is not interested in when the file is uploaded
                            // only when it is attached / selected
                        }

                    ,   select:               function( files )
                        {
                            bidx.utils.log( "[documents] select", files );

                            // Attach the file to the entity
                            // By adding it to the reflowrower we can pick it up as soon
                            // as the entity is created or saved. The reflowrower keeps a list of
                            // added items
                            //

                            if ( files )
                            {
                                $.each( files, function( idx, file )
                                {
                                    _addAttachment( file );
                                } );
                            }

                            $btn.show();
                            $addFiles.hide();
                        }
                    }
                } );

                $addFiles.fadeIn();
            } );

            // Initiate the reflowrower for the attachment list
            //
            $attachmentContainer.reflowrower(
            {
                itemsPerRow:        3
            ,   itemClass:          "attachmentItem"
            } );
        }
    }

    // Add an attachment to the screen
    //
    function _addAttachment( attachment )
    {
        if ( attachment === null )
        {
            bidx.util.warn( "businesssummary::_addAttachmentToScreen: attachment is null!" );
            return;
        }

        var $attachment         = snippets.$attachment.clone()
        ,   uploadedDateTime    = bidx.utils.parseTimestampToDateStr( attachment.uploadedDateTime )
        ,   imageSrc
        ;

        // Store the data so we can later use it to merge the updated data in
        //
        $attachment.data( "bidxData", attachment );

        $attachment.find( ".documentName"       ).text( attachment.documentName );
        $attachment.find( ".uploadedDateTime"   ).text( uploadedDateTime );
        $attachment.find( ".purpose"            ).text( attachment.purpose );
        $attachment.find( ".documentType"       ).text( bidx.data.i( attachment.documentType, "documentType" ) );

        imageSrc = ( attachment.mimeType && attachment.mimeType.match( /^image/ ) )
            ? attachment.document
            : "/wp-content/plugins/bidx-plugin/static/img/iconViewDocument.png";

        $attachment.find( ".documentImage"  ).attr( "src", imageSrc );
        $attachment.find( ".documentLink"   ).attr( "href", attachment.document );

        $attachmentContainer.reflowrower( "addItem", $attachment );
    }

    // Add a company row to the table of existing companies
    //
    function _addCompany( index, company )
    {
        if ( !index )
        {
            index = $companiesTable.find( "tbody .companyItem" ).length;
        }

        var $company        = snippets.$company.clone()
        ,   hasEmployees
        ,   location        = []
        ,   country
        ,   cityTown
        ;

        // Are we adding an investment with data or just an empty item?
        //
        if ( company )
        {
            $company.find( ".companyName"   ).text( bidx.utils.getValue( company, "name" ) );
            $company.find( ".registered"    ).text( bidx.utils.getValue( company, "registered" ) === true ? bidx.i18n.i( 'yes' ) : bidx.i18n.i( 'no' ) );

            hasEmployees = !!bidx.utils.getValue( company, "numPermFemaleEmpl" ) ||
                !!bidx.utils.getValue( company, "numPermMaleEmpl" ) ||
                !!bidx.utils.getValue( company, "numTempMaleEmpl" ) ||
                !!bidx.utils.getValue( company, "numTempFemaleEmpl" )
            ;

            $company.find( ".employees"     ).text( hasEmployees ? bidx.i18n.i( 'yes' ) : bidx.i18n.i( 'no' ) );

            // CityTown
            //
            cityTown = bidx.utils.getValue( company, "statutoryAddress.cityTown" );

            if ( cityTown )
            {
                location.push( cityTown );
            }

            // Country
            //
            country = bidx.utils.getValue( company, "statutoryAddress.country" );

            if ( country )
            {
                location.push( bidx.data.i( country, "country" ));
            }

            $company.find( ".location"      ).text( location.join( ", " ) );
        }

        // Store the data in the DOM for later referal / merging
        //
        $company.data( "bidxData", company );

        // Instantiate radio controls
        //
        $company
            .find( "input[name='company']" )
            .radio()
            .attr( "value", bidx.utils.getValue( company, "bidxMeta.bidxEntityId" ))
        ;

        $companiesTable.find( "tbody" ).append( $company );
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
        // Repoulate the companies table, this data is not coming from the business summary but from a seperate API call
        //
        $companiesTable.find( "tbody" ).empty();

        if ( companies )
        {
            $.each( companies, function( idx, company )
            {
                _addCompany( idx, company );
            } );
        }

        // Go itteratively over all the forms and there fields
        //
        $.each( fields, function( form, formFields )
        {
            var $form       = forms[ form ].$el;

            if ( formFields._root )
            {
                $.each( formFields._root, function( i, f )
                {
                    var $input = $form.find( "[name^='" + f + "']" )
                    ,   value  = bidx.utils.getValue( businessSummary, f )
                    ;

                    bidx.utils.setElementValue( $input, value );
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

        var companyId   = bidx.utils.getValue( businessSummary, "company.bidxMeta.bidxEntityId" );

        if ( companyId )
        {
            bidx.utils.setElementValue( $hasCompany, "true" );
            bidx.utils.setElementValue( $companiesTable.find( "[name='company']" ), companyId );
        }
        else
        {
            bidx.utils.setElementValue( $hasCompany, false );
        }

        // Documents are not using a form, just a reflowrower
        //
        var attachment = bidx.utils.getValue( businessSummary, "attachment", true );

        if ( attachment )
        {
            $.each( attachment, function( idx, a )
            {
                _addAttachment( a );
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
                    var $input = $form.find( "[name^='" + f + "']" )
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

                    // Is there anything in the deleted years object that is not present in the new situation?
                    //
                    var newYears            = $.map( item, function( v, k ) { return k; } )
                    ,   deletedYears        = $.map( financialSummary.deletedYears, function( v, k ) { return k; } )
                    ;

                    $.grep( deletedYears, function( y )
                    {
                        if ( $.inArray( y, newYears ) === -1 )
                        {
                            bidx.utils.log( "[businesssummary] deleted year", y );
                            item[ y ] = null;
                        }
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

        // Did the user select that there is a company for this business summary and if so, what company was selected?
        //
        var $selectedCompany = $companiesTable.find( "input[name='company']:checked" ).closest( ".companyItem" )
        ,   company
        ,   companyId
        ;

        if ( $hasCompany.filter( ":checked" ).val() === "true" && $selectedCompany.length )
        {
            company     = $selectedCompany.data( "bidxData" );
            companyId   = bidx.utils.getValue( company, "bidxMeta.bidxEntityId" );

            businessSummary.company = companyId;
        }
        else
        {
            businessSummary.company = null;
        }
    }

    // This is the startpoint for the edit state
    //
    function _init()
    {
        // Reset any state
        //
        financialSummary.deletedYears = {};

        $doesHaveCompany.hide();
        $addNewCompany.hide();
        $addFiles.hide();

        bidx.utils.setElementValue( $hasCompany, "false" );

        var curYear         = bidx.common.getNow().getFullYear();

        // Inject the save and button into the controls
        //
        $btnSave    = $( "<a />", { class: "btn btn-primary disabled", href: "#save"    });
        $btnCancel  = $( "<a />", { class: "btn btn-primary disabled", href: "#cancel"  });

        $btnCancel.bind( "click", function( e )
        {
            e.preventDefault();

            // In case of a create there doesn't seem to be logical place to go back to, for now just go to the main page
            //
            if ( state === "create" )
            {
                // Add a redirect note, because the response from the webserver / wp / php is very slow
                //
                bidx.common.notifyRedirect();

                // @TODO: whereto in case of cancel of a businesssummary create?
                //
                document.location.href = "/";
            }
            else
            {
                bidx.common.removeAppWithPendingChanges( appName );
                bidx.controller.updateHash( "" );

                reset();

                _showView( "show" );
            }
        } );

        $btnSave.bind( "click", function( e )
        {
            e.preventDefault();

            _doSave();
        } );

        $btnSave.i18nText( ( state === "create" ? "btnAddAndView" : "btnSaveAndView" ) );
        $btnCancel.i18nText( "btnCancel" );

        $controlsForEdit.empty();
        $controlsForEdit.append( $btnSave, $btnCancel );

        $controlsForError.empty();
        $controlsForError.append( $btnCancel.clone( true ) );

        // Show the delete year buttons on the first/last year
        //
        var $firstYear  = $financialSummaryYearsContainer.find( ".financialSummariesItem:not(.addItem):first" )
        ,   $lastYear   = $financialSummaryYearsContainer.find( ".financialSummariesItem:not(.addItem):last"  )
        ,   firstYear   = parseInt( $firstYear.attr( "data-year" ), 10 )
        ,   lastYear    = parseInt( $lastYear.attr( "data-year" ), 10 )
        ;

        if ( firstYear < curYear )
        {
            $firstYear.find( ".btnDelete" ).show();
        }

        if ( lastYear > curYear )
        {
            $lastYear.find( ".btnDelete" ).show();
        }

        if ( state === "edit" )
        {
            _getBusinessSummary()
                .then( function()
                {
                    return _getCompanies();
                })
                .fail( function()
                {
                    $btnCancel.removeClass( "disabled" );
                })
                .done( function()
                {
                    _populateScreen();

                    $btnSave.removeClass( "disabled" );
                    $btnCancel.removeClass( "disabled" );

                    _showView( "edit" );
                })
            ;
        }
        else
        {
            businessSummary     = {};

            _getCompanies()
                .fail( function()
                {
                    $btnCancel.removeClass( "disabled" );
                } )
                .done( function()
                {
                    _populateScreen();

                    $btnSave.removeClass( "disabled" );
                    $btnCancel.removeClass( "disabled" );

                    _showView( "edit" );
                } )
            ;
        }
    }

    // Retrieve the list of companies of the currently logged in user
    //
    // @returns promise
    //
    function _getCompanies()
    {
        var $d = $.Deferred();

        // Fetch the business summary
        //
        bidx.api.call(
            "memberCompanies.fetch"
        ,   {
                memberId:           bidx.common.getSessionValue( "id" )
            ,   groupDomain:        bidx.common.groupDomain

            ,   success: function( response )
                {
                    bidx.utils.log( "[Member Companies] fetch", businessSummaryId, response );

                    companies = response;

                    $d.resolve();
                }
            ,   error:          function( jqXhr, textStatus )
                {
                    var status  = bidx.utils.getValue( jqXhr, "status" ) || textStatus
                    ,   msg     = "Something went wrong while retrieving the companies: " + status
                    ,   error   = new Error( msg )
                    ;

                    _showError( msg );

                    $d.reject( error );
                }
            }
        );

        return $d;
    }

    // Retrieve the business summary by ID
    //
    // @returns promise
    //
    function _getBusinessSummary()
    {
        var $d = $.Deferred();

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
                    ,   msg
                    ;

                    if ( !canEdit )
                    {
                        msg = bidx.i18n.i( "noEditPermission" );
                        _showError( msg );

                        $d.reject( new Error( msg ) );
                    }
                    else
                    {
                        businessSummary = response;

                        bidx.utils.log( "bidx::businessSummary", businessSummary );

                        $d.resolve();
                    }
                }
            ,   error:          function( jqXhr, textStatus )
                {
                    var status  = bidx.utils.getValue( jqXhr, "status" ) || textStatus
                    ,   msg     = "Something went wrong while retrieving the business summary: " + status
                    ,   error   = new Error( msg )
                    ;

                    _showError( msg );

                    $d.reject( error );
                }
            }
        );

        return $d;
    }

    // Try to save the businessSummary to the API
    //
    function _doSave()
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
            businessSummary.periodStartDate = bidx.common.getNow().getFullYear() + "-01-01";
        }

        // Make sure the entitytype is set correctly, probably only needed for 'create'
        //
        bidx.utils.setValue( businessSummary, "bidxMeta.bidxEntityType", "bidxBusinessSummary" );

        bidx.common.notifySave();

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

                    var bidxMeta = bidx.utils.getValue( response, "data.bidxMeta" );

                    if ( state === "create" )
                    {
                        businessSummaryId = bidx.utils.getValue( bidxMeta, "bidxEntityId" );
                    }

                    bidx.common.closeNotifications();
                    bidx.common.notifyRedirect();

                    bidx.common.removeAppWithPendingChanges( appName );

                    var url = "/businesssummary/" + businessSummaryId + "?rs=true";

                    document.location.href = url;
                }
            ,   error:          function( jqXhr )
                {
                    params.error( jqXhr );

                    bidx.common.closeNotifications();
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
    function navigate( options )
    {
        if ( options.requestedState !== "edit" )
        {
            $element.removeClass( "edit" );
        }

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

                    // Make sure the i18n translations and static data api items for this app are available before initing
                    //
                    bidx.i18n.load( [ "__global", appName ] )
                        .then( function()
                        {
                            return bidx.data.load( [ "country" ] );
                        } )
                        .done( function()
                        {
                            _init();
                        } );
                }

                $element.addClass( "edit" );

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
    }

    // Reset the whole application
    //
    function reset()
    {
        state = null;

        bidx.common.removeAppWithPendingChanges( appName );

        // Remove any created years that haven't been saved and select the current year
        //
        $financialSummaryYearsContainer.find( ".financialSummariesItem.new" ).remove();

        var year     = bidx.common.getNow().getFullYear()
        ,   $year    = $financialSummaryYearsContainer.find( ".financialSummariesItem[data-year='" + year + "']" )
        ;

        // No current year??
        // Select the last one...
        //
        if ( $year.length === 0 )
        {
            $year   = $financialSummaryYearsContainer.find( ".financialSummariesItem:not(.addItem):last" );
            year    = $year.attr( "data-year" );
        }

        financialSummary.selectYear( year );
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

    window.bidx.businesssummary = app;
} ( jQuery ));
