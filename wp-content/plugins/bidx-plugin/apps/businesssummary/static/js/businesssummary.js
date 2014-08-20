/* global bidx */
;( function( $ )
{
    "use strict";

    var $element                    = $( "#businessSummary" )
    ,   $snippets                   = $element.find( ".snippets" )

    ,   $views                      = $element.find( ".view" )

    ,   $editControls               = $element.find( ".editControls" )

    ,   $industry                   = $element.find( "[name='industry']" )
    ,   $expertiseNeeded            = $element.find( "[name='expertiseNeeded']" )
    ,   $productService             = $element.find( "[name='productService']" )
    ,   $countryOperation           = $element.find( "[name='countryOperation']" )

    ,   $reasonForSubmission        = $element.find( "[name='reasonForSubmission']" )
    ,   $envImpact                  = $element.find( "[name='envImpact']" )
    ,   $socialImpact               = $element.find( "[name='socialImpact']" )
    ,   $yearSalesStarted           = $element.find( "[name='yearSalesStarted']" )

    ,   $btnSave
    ,   $btnCancel
    ,   $btnFullAccessRequest       = $editControls.find( ".bidxRequestFullAccess")
    ,   $bidxAccessRequestPending   = $editControls.find( ".bidxAccessRequestPending")

    ,   $videoWrapper               = $element.find( ".video-wrapper" )

    ,   $controlsForEdit            = $editControls.find( ".viewEdit" )
    ,   $controlsForError           = $editControls.find( ".viewError" )

    ,   $fakecrop                   = $views.find( ".bidx-profilepicture img" )

    ,   $tabMentor                  = $element.find( "#businessSummaryCollapse-MentoringDetails" )

    ,   loggedInMemberId            = bidx.common.getCurrentUserId()

    ,   active                      = []
    ,   wait                        = []
    ,   respond                     = []
    ,   rejectByEntrepreneur        = []
    ,   rejectByMentor              = []


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
        ,   mentoringDetails:
            {
                $el:                    $element.find( "#frmBusinessSummary-MentoringDetails" )
            }
        }

        // Financial Summary / Details
        //
    ,   $financialSummary                   = $element.find( ".financialSummary")
    ,   $financialSummaryYearsContainer     = $financialSummary.find( ".fs-col-years" )

        // Managament Team
        //
    ,   $btnAddManagementTeam               = forms.aboutYouAndYourTeam.$el.find( "[href$='#addManagementTeam']" )
    ,   $managementTeamContainer            = forms.aboutYouAndYourTeam.$el.find( ".managementTeamContainer" )
    ,   $managementTeamProfilePictureModal  = forms.aboutYouAndYourTeam.$el.find( ".managementTeamProfilePictureModal")

        // Company Details
        //
    ,   $companyDetails                     = $element.find( "#businessSummaryCollapse-CompanyDetails" )
    ,   $hasCompany                         = forms.companyDetails.$el.find( "input[name='hasCompany']" )
    ,   $doesHaveCompany                    = forms.companyDetails.$el.find( ".doesHaveCompany" )
    ,   $companiesTable                     = $doesHaveCompany.find( "table" )
    ,   $addNewCompany                      = $companyDetails.find( ".addNewCompany")
    ,   $btnAddNewCompany                   = $companyDetails.find( "a[href$='addNewCompany']" )

        // Mentoring Details
        //
    ,   $toggles                            = $element.find( ".toggle" ).hide()
    ,   $toggleExpertiseNeeded              = $element.find( "[name='mentorAdvisory']" )

        // Buttons under to control the add company form
        //
    ,   $btnAddCompany                      = $companyDetails.find( "a[href$='addCompany']" )
    ,   $btnCancelAddCompany                = $companyDetails.find( "a[href$='cancelAddCompany']" )

        // Documents component
        //
    ,   $documents                          = $element.find( "#businessSummaryCollapse-Documents" )
    ,   $btnAddFiles                        = $documents.find( "a[href$='addFiles']" )
    ,   $addFiles                           = $documents.find( ".addFiles" )
    ,   $attachmentContainer                = $documents.find( ".attachmentContainer" )

        // Edit document modal
        //
    ,   $editDocument                       = $element.find( ".js-edit-document" )

    ,   businessSummary
    ,   businessSummaryId

    ,   companies

    ,   state
    ,   currentView
    ,   snippets                    = {}

    ,   appName                     = "businesssummary"

        // Object used to expose functions on
        //
    ,   financialSummary            =
        {
            deletedYears:               {}
        }
    ,   $searchPagerContainer   = $element.find( "#incomingRequests" ).find( ".pagerContainer")
    ,   $searchPager            = $searchPagerContainer.find( ".pager" )

    ,   paging                      =
        {
            search:
            {
                offset:         0
            ,   totalPages:     null
            }
        }
    ;
    // Constants
    //
    var CONSTANTS =
        {
            SEARCH_LIMIT:                       4
        ,   NUMBER_OF_PAGES_IN_PAGINATOR:       10
        ,   LOAD_COUNTER:                       0
        ,   VISIBLE_FILTER_ITEMS:               4 // 0 index (it will show +1)
        ,   ENTITY_TYPES:                       [
                                                    {
                                                        "type": "bidxMentorProfile"
                                                    }
                                                ]
        }

    ,   tempLimit = CONSTANTS.SEARCH_LIMIT

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

                // This is actually an array in the data model, but presented as a dropdown in the UI designs.
                // Conflict!
                // We need to force it to be an array when sending into the API
                // After disucssion with Jeroen created BIDX-1435 to request any non-array value to be interpreted as an array by the API,
                // but until that is available, send in reasonforSubmsision as an array
                //
            ,   "reasonForSubmission"
            ,   "equityRetained"
            // ,   "financingNeeded"
            ,   "investmentType"
            ,   "summaryFinancingNeeded"
            ,   "externalVideoPitch"
            ,   "externalAudioPitch"
            ]
        }

    ,   "aboutYourBusiness":
        {
            "_root":
            [
                "industry"
            // ,   "suggestedIndustry"
            ,   "productService"
            // ,   "suggestedProductService"
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
            ,   "linkedIn"
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

    ,   "mentoringDetails":
        {
            "_root":
            [
                "mentorAdvisory"
            ,   "expertiseNeeded"
            ,   "expertiseNeededDetail"
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
        forms.generalOverview.$el.find( "[name='reasonForSubmission']" ).bidx_chosen(
        {
            dataKey:            "reasonForSubmission"
        ,   emptyValue:         bidx.i18n.i( "selectReasonForSubmission", appName )
        });

        $industry.bidx_chosen(
        {
            dataKey:            "industry"
        });

        $expertiseNeeded.bidx_chosen(
        {
            dataKey:            "mentorExpertise"
        });

        $productService.bidx_chosen(
        {
            dataKey:            "productService"
        });

        $countryOperation.bidx_chosen(
        {
            dataKey:            "country"
        });

        $envImpact.bidx_chosen(
        {
            dataKey:            "envImpact"
        });

        $socialImpact.bidx_chosen(
        {
            dataKey:            "socialImpact"
        });

        forms.financialDetails.$el.find( "[name='yearSalesStarted']" ).bidx_chosen();

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

            // Did we find all of the snippets?
            // Not really app logic, but just a protection / early warning system
            //
            $.each( snippets, function( prop, $snippet )
            {
                if ( !$snippet.length )
                {
                    bidx.utils.error( "[BusinessSummary] Snippet not found! ", prop );
                }
            } );
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
            ,   debug:          false
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
                        maxlength:              900
                    }
                ,   reasonForSubmission:
                    {
                        // required:               true
                    }
                ,   equityRetained:
                    {
                        // number:                 true
                        min:                    0
                    ,   max:                    100
                    }
                ,   financingNeeded:
                    {
                        // required:               true
                        monetaryAmount:         true
                    }
                ,   "investmentType[]":
                    {
                        // required:               true
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
                debug:          false
            ,   ignore:         ""
            ,   rules:
                {
                    industry:
                    {
                        // required:      true
                    }
                ,   productService:
                    {
                        // required:      true
                    }
                ,   countryOperation:
                    {
                        // required:      true
                    }
                ,   "consumerType[]":
                    {
                        // required:      true
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
                ignore:         ""
            ,   debug:          false
            ,   rules:
                {
                    personalRole:
                    {
                        // required:               true
                        maxlength:              30
                    }
                ,   personalExpertise:
                    {
                        // required:               true
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

            // Financial Details
            //
            forms.financialDetails.$el.validate(
            {
                ignore:                 ""
            ,   debug:                  false
            ,   rules:
                {
                    yearSalesStarted:
                    {
                        // required:               true
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
            ,   debug:                  false
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

            // Financial Details
            //
            forms.mentoringDetails.$el.validate(
            {
                ignore:                 ""
            ,   debug:                  false
            ,   rules:
                {
                    mentorAdvisory:
                    {
                        // required:               true
                    }
                ,   expertiseNeeded:
                    {
                        required:               { depends: function () { return !$( ".toggle-mentorAdvisory" ).is(':hidden'); } }
                    }
                ,   expertiseNeededDetail:
                    {
                        required:               { depends: function () { return !$( ".toggle-mentorAdvisory" ).is(':hidden'); } }
                    ,   maxlength:              300
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

            // Profile picture selection
            // Each member block has it's own button, but a single modal is reused
            //
            $managementTeamContainer.delegate( "a[href$='#changeProfilePicture']", "click", function( e )
            {
                e.preventDefault();

                var $btn                        = $( this )
                ,   $managementTeamItem         = $btn.closest( ".managementTeamItem" )
                ,   $profilePictureContainer    = $managementTeamItem.find( ".profilePictureContainer")
                ;

                // Make sure the media app is within our modal
                //
                $( "#media" ).appendTo( $managementTeamProfilePictureModal.find( ".modal-body" ) );

                var $selectBtn = $managementTeamProfilePictureModal.find( ".btnSelectFile" )
                ,   $cancelBtn = $managementTeamProfilePictureModal.find( ".btnCancelSelectFile" )
                ;

                // Navigate the media app into list mode for selecting files
                //
                bidx.media.reset();
                bidx.media.navigate(
                {
                    requestedState:         "list"
                ,   slaveApp:               true
                ,   selectFile:             true
                ,   multiSelect:            false
                ,   showEditBtn:            false
                ,   btnSelect:              $selectBtn
                ,   btnCancel:              $cancelBtn
                ,   callbacks:
                    {
                        ready:                  function( state )
                        {
                            bidx.utils.log( "[management team profile picture] ready in state", state );
                        }

                    ,   cancel:                 function()
                        {
                            // Stop selecting files, back to previous stage
                            //
                            $addFiles.modal('hide');
                        }

                    ,   success:                function( file )
                        {
                            bidx.utils.log( "[management team profile picture] uploaded", file );

                            // NOOP.. the parent app is not interested in when the file is uploaded
                            // only when it is attached / selected
                        }

                    ,   select:               function( file )
                        {
                            bidx.utils.log( "[management team profile picture] select", file );

                            $profilePictureContainer.replaceWith( $( "<img />", { src: file.document }));

                            var managementTeam = $managementTeamItem.data( "bidxData" );

                            managementTeam.profilePicture = file;

                            $managementTeamProfilePictureModal.modal('hide');
                        }
                    }
                } );

                $managementTeamProfilePictureModal.modal();
            } );

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
                        // required:               true
                        monetaryAmount:         true

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

                $item.find( ".totalIncome .viewEdit" ).text( "$ " + totalIncome );
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
            $( window.bidx ).bind( "updated.media", function( e, data )
            {
                var uploadId = bidx.utils.getValue( data, "bidxMeta.bidxUploadId" );

                if ( !uploadId )
                {
                    bidx.utils.error( "No uploadId found on updated media event!", data );
                    return;
                }

                $attachmentContainer.find( "[data-uploadId='" + uploadId + "']" ).each( function()
                {
                    var $attachment     = $( this )
                    ,   attachment      = $attachment.data( "bidxData" )
                    ;

                    $.each( [ "purpose", "documentType" ], function( i, prop )
                    {
                        attachment[ prop ] = data[ prop ];
                    } );

                    _updateAttachment( $attachment, attachment );
                } );
            } );

            // Clicking the add files button will load the media library
            //
            $btnAddFiles.click( function( e )
            {
                e.preventDefault();

                // Make sure the media app is within our modal
                //
                $( "#media" ).appendTo( $addFiles.find( ".modal-body" ) );

                var $selectBtn = $documents.find(".btnSelectFile");
                var $cancelBtn = $documents.find(".btnCancelSelectFile");

                // Navigate the media app into list mode for selecting files
                //
                bidx.media.reset();
                bidx.media.navigate(
                {
                    requestedState:         "list"
                ,   slaveApp:               true
                ,   selectFile:             true
                ,   multiSelect:            true
                ,   showEditBtn:            false
                ,   btnSelect:              $selectBtn
                ,   btnCancel:              $cancelBtn
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
                            $addFiles.modal('hide');
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

                            $addFiles.modal('hide');
                        }
                    }
                } );

                $addFiles.modal();
            } );

            // Setup an 'edit' button per document
            //
            $attachmentContainer.delegate( "a[href$=#editDocument]", "click", function( e )
            {
                e.preventDefault();

                var $btn        = $( this )
                ,   $item       = $btn.closest( ".attachmentItem" )
                ,   doc         = $item.data( "bidxData" )
                ;

                _editDocument( doc );
            } );

            // Initiate the reflowrower for the attachment list
            //
            $attachmentContainer.reflowrower(
            {
                itemsPerRow:        3
            ,   itemClass:          "attachmentItem"
            } );

        }

        // bind Full Accesss Request button
        // only for users not owning the current summary ( summary owners do not get this button rendered )
        //
        if ( $btnFullAccessRequest )
        {
                $btnFullAccessRequest.click( function( e )
                {
                    e.preventDefault();
                    _doAccessRequest();
                } );
        }

        if ( $videoWrapper )
        {
            $videoWrapper.fitVids();
        }

        $fakecrop.fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
    }

    var _handleToggleChange = function( show, group )
    {
        var fn = show ? "fadeIn" : "hide";

        $toggles.filter( ".toggle-" + group )[ fn ]();
    };

    // Update the UI to show the input / previous run business'
    //
    $toggleExpertiseNeeded.change( function()
    {
        var value   = $toggleExpertiseNeeded.filter( "[checked]" ).val();

        _handleToggleChange( value === "true", "mentorAdvisory" );
        _handleToggleChange( value === "true", "mentorMatches" );

    } );


    // Do a full access request for this businessSummar
    //
    function _doAccessRequest()
    {
        bidx.api.call(
             "businesssummaryRequestAccess.send"
        ,   {
                groupDomain:            bidx.common.groupDomain
            ,   id:                     bidxConfig.context.businessSummaryId
            ,   success: function( response )
                {
                    if ( response.status === "OK" )
                    {
                        // show Pending button and hide Send button
                        //
                        $bidxAccessRequestPending.toggleClass( "hide" );
                        $btnFullAccessRequest.toggleClass( "hide" );
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
                        _showError( "Something went wrong sending the access request: " + response.text );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        _showError( "Something went wrong sending the access request: " + response.text );
                    }

                }
            }
        );
    }

    // Open the media library in edit mode for a specific file
    //
    function _editDocument( doc )
    {
        var $modal = $editDocument;

        // Make sure the media app is within our modal
        //
        $( "#media" ).appendTo( $modal.find( ".modal-body" ) );

        // Navigate the media app into list mode for selecting files
        //
        bidx.media.reset();
        bidx.media.navigate(
        {
            requestedState:         "edit"
        ,   onlyEdit:               true
        ,   slaveApp:               true
        ,   selectFile:             true
        ,   multiSelect:            true
        ,   showEditBtn:            false
        ,   showDeleteBtn:          false
        ,   showDownloadBtn:        false

        ,   id:                     doc.bidxMeta.bidxUploadId

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
                    $modal.modal('hide');
                }

            ,   success:                function( file )
                {
                    bidx.utils.log( "[documents] updated", file );



                    $modal.modal('hide');
                }
            }
        } );

        $modal.modal();
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

        var $attachment         = snippets.$attachment.clone();

        _updateAttachment( $attachment, attachment );

        $attachmentContainer.reflowrower( "addItem", $attachment );
    }

    function _updateAttachment( $attachment, attachment )
    {
        var createdDateTime     = bidx.utils.parseTimestampToDateStr( attachment.uploadedDateTime )
        ,   $documentLink       = $attachment.find( ".documentLink" )
        ,   $documentImage      = $attachment.find( ".documentImage" )
        ,   $documentDefault    = $attachment.find( ".attachmentDefault" )
        ,   $documentMissing    = $attachment.find( ".attachmentMissing" )
        ,   deletedDoc          = false
        ;

        if ( !attachment.bidxMeta.bidxUploadId )
        {
            bidx.utils.warn( "businesssummary::_updateAttachment: attachment has been deleted!" );
            deletedDoc = true;
        }

        // Store the data so we can later use it to merge the updated data in
        //
        $attachment.data( "bidxData", attachment );

        // Set the upload ID on the DOM so we can find this later when we get an update from the media library
        //
        $attachment.attr( "data-uploadId", bidx.utils.getValue( attachment, "fileUpload" ));

        $attachment.find( ".documentName"       ).text( attachment.documentName );
        $attachment.find( ".createdDateTime"    ).text( createdDateTime );
        $attachment.find( ".purpose"            ).text( attachment.purpose );
        $attachment.find( ".documentType"       ).text( bidx.data.i( attachment.documentType, "documentType" ) );

        if ( attachment.mimeType && attachment.mimeType.match( /^image/ ) )
        {
            $documentDefault.remove();
            $documentMissing.remove();

            $documentImage
                .attr( "src", attachment.document )
                .fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} )
            ;
        }
        else
        {
            $documentImage.remove();

            // Check if the file has been removed
            //
            if ( deletedDoc )
            {
                $attachment.find( ".documentName" ).text( bidx.i18n.i( "docDeleted" ) ).addClass( "text-danger" );
                $documentLink.remove();
            }
            else
            {
                $documentMissing.remove();
            }
        }

        $documentLink.attr( "href", attachment.document );

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
            .find( "input[name='companyList']" )
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

            // Profile picture is special and is it's own entity
            //
            if ( managementTeam.profilePicture )
            {
                $managementTeam.find( ".profilePictureContainer" )
                    .append( $( "<img />", { src: managementTeam.profilePicture.document } ));
            }
        }
        else
        {
            managementTeam = {};
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

                // case "linkedIn":
                //     $input.rules( "add",
                //     {
                //         linkedIn:               true
                //     } );
                // break;

                default:
                    // NOOP
            }
        } );
    }

    // Use the retrieved businessSummary entity to populate the form and other screen elements
    //
    function _populateScreen()
    {
        // Repopulate the companies table, this data is not coming from the business summary but from a seperate API call
        //
        $companiesTable.find( "tbody" ).empty();

        if ( companies )
        {
            $.each( companies, function( idx, company )
            {
                _addCompany( idx, company );
            } );
        }

        // Go iteratively over all the forms and there fields
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
            bidx.utils.setElementValue( $companiesTable.find( "[name='companyList']" ), companyId );
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
            var attached            = $attachmentContainer.find( ".attachmentItem" )
            ,   attachmentExists    = []
            ;

            // Prevent documents to be added again by checking the previously added data attribute "data-uploadid"
            //
            if ( attached.length ) {
                $.each( attached, function( idx, a )
                {
                    var bidxUploadId = $(this).context.dataset.uploadid;

                    if ( $.inArray( bidxUploadId, attachmentExists ) === -1 )
                    {
                        attachmentExists.push( bidxUploadId );
                    }
                } );
            }

            $.each( attachment, function( idx, a )
            {
                if ( $.inArray( a.fileUpload.toString(), attachmentExists ) === -1 )
                {
                    _addAttachment( a );
                }
            } );
        }

        // Update the chosen components with our set values
        //
        $industry.trigger( "chosen:updated" );
        $expertiseNeeded.trigger( "chosen:updated" );
        $productService.trigger( "chosen:updated" );
        $countryOperation.trigger( "chosen:updated" );
        $reasonForSubmission.trigger( "chosen:updated" );
        $envImpact.trigger( "chosen:updated" );
        $socialImpact.trigger( "chosen:updated" );
        $yearSalesStarted.trigger( "chosen:updated" );
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

        $item.find( ".totalIncome .viewEdit" ).text("$ " + data[ "totalIncome" ]);
    }

    // Convert the form values back into the member object
    //
    function _getFormValues()
    {
        // Iterate over the form fields, not all fields are using forms. Financial Summary
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

        // Normalize the linkedIn username / url for the management team members
        //
        var managementTeam      = bidx.utils.getValue( businessSummary, "managementTeam", true );

        if ( managementTeam )
        {
            $.each( managementTeam, function( idx, managementTeamMember )
            {
                var linkedIn;

                if ( managementTeamMember.linkedIn )
                {
                    linkedIn = bidx.utils.normalizeLinkedInUrl( managementTeamMember.linkedIn );

                    managementTeamMember.linkedIn = linkedIn;
                }
            } );
        }

        // Did the user select that there is a company for this business summary and if so, what company was selected?
        //
        var $selectedCompany = $companiesTable.find( "input[name='companyList']:checked" ).closest( ".companyItem" )
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

        // Documents
        // Collect the whole situation from the DOM and set that array of bidxData items to be the new situation
        //
        var attachments = [];

        $attachmentContainer.find( ".attachmentItem" ).each( function()
        {
            var $item       = $( this )
            ,   bidxData    = $item.data( "bidxData" )
            ;

            attachments.push( bidxData );
        } );

        bidx.utils.setValue( businessSummary, "attachment", attachments );
    }

    function showEntity( options )
    {
        var  bidxMeta
        ;

        bidx.api.call(
            "entity.fetch"
        ,   {
                entityId:       options.entityId
            ,   groupDomain:    bidx.common.groupDomain
            ,   success:        function( itemSummary )
                {
                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject(itemSummary) )
                    {

                        bidxMeta       = bidx.utils.getValue( itemSummary, "bidxMeta" );

                        if( bidxMeta && bidxMeta.bidxEntityType === options.entityType )
                        {

                            //  execute callback if provided
                            if (options && options.callback)
                            {
                                options.callback( itemSummary );
                            }

                        }
                    }

                }
            ,   error: function(jqXhr, textStatus)
                {
                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback( false );
                    }
                    return false;
                }
            }
        );

    }


    function showMemberProfile( options )
    {
        var bidxMeta
        ;

        bidx.api.call(
            "member.fetch"
        ,   {
                id:          options.ownerId
            ,   requesteeId: options.ownerId
            ,   groupDomain: bidx.common.groupDomain
            ,   success:        function( item )
                {
                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject(item.bidxMemberProfile) )
                    {
                        //if( item.bidxEntityType == 'bidxBusinessSummary') {
                        bidxMeta       = bidx.utils.getValue( item, "bidxMemberProfile.bidxMeta" );

                        if( bidxMeta  )
                        {
                            //  execute callback if provided
                            if (options && options.callback)
                            {
                                options.callback( item, options.ownerId );
                            }
                        }

                    }

                }
            ,   error: function(jqXhr, textStatus)
                {

                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback( false, options.ownerId );
                    }

                }
            }
        );
    }

    /*
        {
            "searchTerm"    :   "text:*"
        ,   "maxResult"     :   10
        ,   "offset"        :   0
        ,   "entityTypes"   :   [
                                    {
                                        "type": "bidxMentorProfile"
                                    }
                                ]
        ,   "scope"         :   "local"
        ,   "filters": [
                        "-ownerId:4321"
                        ]
        }
    */
    function _getSearchCriteria ( params ) {

        var q
        ,   sort
        ,   criteria
        ,   criteriaQ
        ,   paramFilter
        ,   search
        ,   valueExpertiseNeeded
        ,   filterExpertiseNeeded   = ''
        ,   sep                     = ''
        ,   facetFilters            = []
        ,   filters                 = []
        ,   sortQuery               = []
        ,   criteriaSort            = []
        ,   entityFilters           = CONSTANTS.ENTITY_TYPES
        ;

        // 1. Search paramete
        // ex searchTerm:text:altaf
        //
        // See if its coming from the search page itself(if) or from the top(else)
        //

        // 2. Sort criteria
        // ex sort:["field":"entity", "order": asc ]
        //
        sort = bidx.utils.getValue( params, 'sort' );

        if( sort )
        {

            $.each( sort, function( sortField, sortOrder )
            {
                criteriaSort.push( {
                                            "field" : sortField
                                        ,   "order":  sortOrder
                                    });


            } );

        }

        // 3. Filter
        // ex facetFilters:["0": "facet_language:fi" ]
        //


        valueExpertiseNeeded        =   bidx.utils.getElementValue( $expertiseNeeded );

        entityFilters[0].filters    =   [];

        if(valueExpertiseNeeded)
        {
            filterExpertiseNeeded   =   'focusExpertise:(';

            $.each( valueExpertiseNeeded, function( idx, item )
            {
                filterExpertiseNeeded   +=   sep + item;
                sep                     =   ' OR ';
            });

            filterExpertiseNeeded   +=   ')';

            entityFilters[0].filters = [filterExpertiseNeeded]; //Uncomment when bas fixes the expetise filter
        }

         //Exclude current user and active mentors from the criteria
        //1 Exclude current user
        if ( loggedInMemberId )
        {
            filters.push('-ownerId:' + loggedInMemberId);
        }
        //Exclude active users
        if ( active )
        {
            $.each( active , function ( id, item)
            {
                filters.push('-ownerId:' + item.mentorId);
            });
        }

        search =    {
                        criteria    :   {
                                            "searchTerm"    :   "text:*"
                                        ,   "facetFilters"  :   facetFilters
                                        ,   "sort"          :   criteriaSort
                                        ,   "maxResult"     :   tempLimit
                                        ,   "offset"        :   paging.search.offset
                                        ,   "entityTypes"   :   entityFilters
                                        ,   "filters"       :   filters
                                        ,   "scope"         :   "local"
                                        }
                    };


        return search;

    }

    // This function is a collection of callbacks for the contact categories. It is meant to execute contact-category specific code
    //
    function _getContactsCallback( $listItem, params )
    {
        //      $listItem    = jQuery object of the contact category listItem
        // active, wait, respond
        var $matchBtn
        ,   $acceptBtn
        ,   hrefMatch
        ,   filteredRequest
        ,   initiatorId
        ,   mentorId                =   params.mentorId
        ,   isActiveRequest         =   params.isActiveRequest
        ,   waitArr                 =   []
        ,   respondArr              =   []
        ,   rejectMentorArr         =   []
        ,   rejectEntrepreneurArr   =   []
        ,   isWaitingRequest
        ,   isRespondRequest
        ,   isRejectByEntrepreneur
        ,   isRejectByMentor
        ,   contextBpId             =   bidxConfig.context.businessSummaryId
        ,   actionData
        ;

        if(!isActiveRequest)
        {
            waitArr                 =   _.pluck (   wait,   'mentorId' );

            respondArr              =   _.pluck (   respond,  'mentorId' );

            rejectMentorArr         =   _.pluck (   rejectByMentor,  'mentorId' );

            rejectEntrepreneurArr   =   _.pluck (   rejectByEntrepreneur,  'mentorId' );

            isWaitingRequest        =   _.contains( waitArr,    mentorId );

            isRespondRequest        =   _.contains( respondArr,    mentorId );

            isRejectByEntrepreneur  =   _.contains( rejectEntrepreneurArr,    mentorId );

            isRejectByMentor        =   _.contains( rejectMentorArr,    mentorId );
        }

        switch(true)
        {

            case isWaitingRequest:
                actionData  = $("#send-mentor-action").html().replace(/(<!--)*(-->)*/g, "");
                $listItem.find( '.action' ).empty( ).append( actionData );

                /***************Request sent**************************/
                $matchBtn   =   $listItem.find( ".btn-bidx-send");
                $matchBtn.removeClass('btn-success').addClass('disabled btn-info').i18nText("btnRequestSent");
            break;

            case isRejectByEntrepreneur:
                actionData  = $("#send-mentor-action").html().replace(/(<!--)*(-->)*/g, "");
                $listItem.find( '.action' ).empty( ).append( actionData );

                /***************Request sent**************************/
                $matchBtn   =   $listItem.find( ".btn-bidx-send");
                $matchBtn.removeClass('btn-success').addClass('disabled btn-info').i18nText("btnRequestRejectedByEntrepreneur");
            break;

            case isRejectByMentor:
                actionData  = $("#send-mentor-action").html().replace(/(<!--)*(-->)*/g, "");
                $listItem.find( '.action' ).empty( ).append( actionData );

                /***************Request sent**************************/
                $matchBtn   =   $listItem.find( ".btn-bidx-send");
                $matchBtn.removeClass('btn-success').addClass('disabled btn-info').i18nText("btnRequestRejectedByMentor");
            break;

            case isRespondRequest:
                filteredRequest =   _.findWhere(    respond
                                                ,   {
                                                        mentorId:   mentorId
                                                    ,   entityId:   parseInt(contextBpId)
                                                    }
                                                );
                initiatorId     =   filteredRequest.initiatorId;
                bidx.utils.log('initiatorId', initiatorId);
                actionData  = $("#respond-mentor-action").html().replace(/(<!--)*(-->)*/g, "");
                $listItem.find( '.action' ).empty( ).append( actionData );

                /***************Accept request**************************/
                $acceptBtn   =   $listItem.find( ".btn-bidx-accept");
                hrefMatch   =   $acceptBtn.attr( "data-href" );

                /* 1 Accept Link */
                hrefMatch   =   hrefMatch
                        .replace( /%entityId%/g,    contextBpId )
                        .replace( /%mentorId%/g,    mentorId )
                        .replace( /%initiatorId%/g, initiatorId )
                        ;

                $acceptBtn.attr( "href", hrefMatch );

                /***************Accept request**************************/
                $matchBtn   =   $listItem.find( ".btn-bidx-ignore");
                hrefMatch   =   $matchBtn.attr( "data-href" );

                /* 1 Accept Link */
                hrefMatch   =   hrefMatch
                        .replace( /%entityId%/g,    contextBpId )
                        .replace( /%mentorId%/g,    mentorId )
                        .replace( /%initiatorId%/g, initiatorId )
                        ;

                $matchBtn.attr( "href", hrefMatch );
            break;

            case isActiveRequest:
                filteredRequest =   _.findWhere(    active
                                                ,   {
                                                        mentorId:   mentorId
                                                    ,   entityId:   parseInt(contextBpId)
                                                    }
                                                );
                initiatorId     =   filteredRequest.initiatorId;

                actionData  = $("#active-mentor-action").html().replace(/(<!--)*(-->)*/g, "");
                $listItem.find( '.action' ).empty( ).append( actionData );

                $matchBtn   =   $listItem.find( ".btn-bidx-reject");
                hrefMatch   =   $matchBtn.attr( "data-href" );

                /*************Cancel request*******************/
                hrefMatch   =   hrefMatch
                        .replace( /%entityId%/g,    contextBpId )
                        .replace( /%mentorId%/g,    mentorId )
                        .replace( /%initiatorId%/g, initiatorId )
                        ;

                $matchBtn.attr( "href", hrefMatch );
            break;

            default:
                actionData  = $("#send-mentor-action").html().replace(/(<!--)*(-->)*/g, "");
                $listItem.find( '.action' ).empty( ).append( actionData );

                $matchBtn   =   $listItem.find( ".btn-bidx-send");
                hrefMatch   =   $matchBtn.attr( "data-href" );

                /*************Send request*******************/
                hrefMatch   =   hrefMatch
                        .replace( /%entityId%/g,    contextBpId )
                        .replace( /%mentorId%/g,    mentorId )
                        .replace( /%initiatorId%/g, loggedInMemberId )
                        ;

                $matchBtn.attr( "href", hrefMatch );
            break;
        }

        return ;
    }

     function _doSearchListing( options )
    {
        var snippet          = $("#mentor-snippet").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty       = $("#empty-mentors").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listError       = $("#error-mentor").html().replace(/(<!--)*(-->)*/g, "")
        ,   loaderSnippet    = $("#load-mentor").html().replace(/(<!--)*(-->)*/g, "")
        ,   response         = options.response
        ,   $list            = $element.find("." + options.list)
        ,   $listMatchList
        ,   emptyVal         = ''
        ,   counter          = 1
        ,   pagerOptions    = {}
        ,   $listItem
        ,   listItem
        ,   mentorId
        ,   memberId
        ,   entityId
        ,   profilePic
        ,   memberProfile
        ,   personalDetails
        ,   contactPicture
        ,   memberCountry
        ,   imageWidth
        ,   imageLeft
        ,   imageTop
        ,   country
        ,   isEntrepreneur
        ,   isMentor
        ,   isInvestor
        ,   countHtml
        ,   isCurrentUserInList
        ,   cbParams        =  {}
        ,   $requestMentoringBtn
        ,   $d              =  $.Deferred()
        ,   responseLength
        ;

        if ( response.docs && response.docs.length )
        {
            // if ( response.totalMembers > currentPage size  --> show paging)
            //
            $list.empty();

            responseLength      = response.docs.length;

            pagerOptions  =
            {
                currentPage:            ( paging.search.offset / tempLimit  + 1 ) // correct for api value which starts with 0
            ,   totalPages:             Math.ceil( response.numFound / tempLimit )
            ,   numberOfPages:          CONSTANTS.NUMBER_OF_PAGES_IN_PAGINATOR
            ,   useBootstrapTooltip:    true

            ,   itemContainerClass:     function ( type, page, current )
                {
                    return ( page === current ) ? "active" : "pointer-cursor";
                }

            ,   onPageClicked:          function( e, originalEvent, type, page )
                {
                    bidx.utils.log("Page Clicked", page);

                    // Force it to scroll to top of the page before the removal and addition of the results
                    //
                    $(document).scrollTop(0);

                    // update internal page counter for businessSummaries
                    //
                    paging.search.offset = ( page - 1 ) * tempLimit;

                    //_showAllView( "loadmatch" );

                     _getMentorMatches(
                    {
                        params  :   {
                                        q           :   options.q
                                    ,   sort        :   options.sort
                                    }
                    ,   cb      :   function()
                                    {
                                        //_hideView( "loadmatch" );
                                        _showAllView( "pager" );
                                        tempLimit = CONSTANTS.SEARCH_LIMIT;
                                    }
                    });
                }
            };

            tempLimit = response.docs.length;

            if( response.numFound )
            {
                /*isCurrentUserInList =   _.findWhere (   response.docs
                                                    ,   {
                                                            ownerId:   loggedInMemberId.toString()
                                                        }
                                                    );
                response.numFound   =   ( !$.isEmptyObject(isCurrentUserInList) ) ? response.numFound - 1 : response.numFound ;*/

                countHtml = bidx.i18n.i( "matchCount", appName ).replace( /%count%/g,  response.numFound);

                $searchPagerContainer.find('.pagerTotal').empty( ).append('<h5>' + countHtml + '</h5>');

                $searchPagerContainer.find('.pagerTotal').empty().append('<h5>' + response.numFound + ' results found</h5>');
            }

            $searchPager.bootstrapPaginator( pagerOptions );

            // create member listitems
            //
            $.each( response.docs, function( idx, item )
            {
                mentorId    = bidx.utils.getValue( item, "ownerId" );

                if( mentorId !== loggedInMemberId.toString() )
                {
                    listItem = loaderSnippet
                                .replace( /%contactId%/g, mentorId );

                    $list.append( listItem );

                    showMemberProfile(
                    {
                        ownerId     :   mentorId
                    ,   callback    :   function ( itemMember, itemMemberId )
                                        {
                                            $listMatchList      =   $list.find('.member' + itemMemberId );

                                            if(itemMember)
                                            {
                                                memberId        =   bidx.utils.getValue( itemMember,        "member.bidxMeta.bidxMemberId" );
                                                memberProfile   =   bidx.utils.getValue( itemMember,        "bidxMemberProfile" );
                                                personalDetails =   bidx.utils.getValue( itemMember,        "bidxMemberProfile.personalDetails" );
                                                profilePic      =   bidx.utils.getValue( personalDetails,   "profilePicture" );
                                                memberCountry   =   bidx.utils.getValue( personalDetails,   "address.0.country");
                                                isEntrepreneur  =   bidx.utils.getValue( itemMember,        "bidxEntrepreneurProfile" );
                                                isInvestor      =   bidx.utils.getValue( itemMember,        "bidxInvestorProfile" );
                                                isMentor        =   bidx.utils.getValue( itemMember,        "bidxMentorProfile" );

                                                /* Profile Picture */
                                                if ( profilePic )
                                                {
                                                    imageWidth  = bidx.utils.getValue( profilePic, "width" );
                                                    imageLeft   = bidx.utils.getValue( profilePic, "left" );
                                                    imageTop    = bidx.utils.getValue( profilePic, "top" );
                                                    contactPicture = '<div class="img-cropper"><img class="media-object" style="width:'+ imageWidth +'px; left:-'+ imageLeft +'px; top:-'+ imageTop +'px;" src="' + profilePic.document + '"></div>';
                                                }
                                                else
                                                {
                                                    contactPicture = "<div class='icons-rounded pull-left'><i class='fa fa-user text-primary-light'></i></div>";
                                                }

                                                /* Member Country */
                                                if(memberCountry)
                                                {

                                                    bidx.data.getItem(memberCountry, 'country', function(err, labelCountry)
                                                    {
                                                        country    =  labelCountry;
                                                    });
                                                }
                                                // duplicate snippet source and replace all placeholders (not every snippet will have all of these placeholders )
                                                //
                                                listItem = snippet
                                                    .replace( /%pictureUrl%/g,          contactPicture )
                                                    .replace( /%contactId%/g,           memberId                 ? memberId : emptyVal )
                                                    .replace( /%contactName%/g,         itemMember.member.displayName               ? itemMember.member.displayName : emptyVal)
                                                    .replace( /%professionalTitle%/g,   personalDetails.professionalTitle   ? personalDetails.professionalTitle     : emptyVal )
                                                    .replace( /%country%/g,             country            ? country   : "" )
                                                    .replace( /%role_entrepreneur%/g,   ( isEntrepreneur )  ? bidx.i18n.i( 'entrepreneur' )    : '' )
                                                    .replace( /%role_investor%/g,       ( isInvestor )      ? bidx.i18n.i( 'investor' )   : '' )
                                                    .replace( /%role_mentor%/g,         ( isMentor )        ? bidx.i18n.i( 'mentor' )   : '' )
                                                    ;



                                                $listItem                = $( listItem );
                                                //$requestMentoringBtn     = $listItem.find( '.btn-mentoring' );

                                                //$requestMentoringBtn.addClass('disabled').i18nText("btnRequestSent");

                                                if( options && options.cb )
                                                {
                                                    // call Callback with current contact item as this scope and pass the current $listitem
                                                    //
                                                    cbParams = {
                                                                    mentorId    : memberId
                                                                };

                                                    options.cb( $listItem,  cbParams );

                                                    $listItem.find( '.viewRequestmentor').show( );
                                                }
                                                //  add mail element to list

                                            } else
                                            {
                                                $listItem = $listError;
                                            }

                                            $listMatchList.empty().append( $listItem );


                                            if( counter === responseLength )
                                            {

                                                $d.resolve( );
                                            }

                                             counter = counter + 1;
                                        }
                    } );
                } else
                {
                    counter = counter + 1;
                }

            });
        }
        else
        {
            $list.empty();

            $list.append($listEmpty);

            _hideView( "pager" );

            $d.resolve( );
        }

        return $d.promise( );


        // execute cb function
        //

    }

    function _getMentorMatches( options )
    {
        var search
        ;

        search = _getSearchCriteria( options.params );

        bidx.api.call(
            "search.get"
        ,   {
                    groupDomain:          bidx.common.groupDomain
                ,   data:                 search.criteria
                ,   success: function( response )
                    {
                        bidx.utils.log("[searchList] retrieved results ", response );
                         _doSearchListing(
                        {
                            response    :   response
                        ,   q           :   search.q
                        ,   sort        :   search.sort
                        ,   criteria    :   search.criteria
                        ,   list        :   'mentor-match-list'
                        ,   cb          :   function( $listItem, params )
                                            {
                                                _getContactsCallback( $listItem, params );
                                            }
                        } )
                        .done(  function(  )
                        {
                            //  execute callback if provided
                            if (response.numFound && options && options.cb)
                            {
                                options.cb(  );
                            }
                        } );

                    }
                    ,
                    error: function( jqXhr, textStatus )
                    {

                        var response = $.parseJSON( jqXhr.responseText)
                        ,   responseText = response && response.text ? response.text : "Status code " + jqXhr.status
                        ;

                        // 400 errors are Client errors
                        //
                        if ( jqXhr.status >= 400 && jqXhr.status < 500)
                        {
                            bidx.utils.error( "Client  error occured", response );
                            _showError( "Something went wrong while retrieving the members relationships: " + responseText );
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            _showError( "Something went wrong while retrieving the members relationships: " + responseText );
                        }

                    }
            }
        );
    }

    function _getActiveMentors( options )
    {
            var snippet          = $("#mentor-snippet").html().replace(/(<!--)*(-->)*/g, "")
            ,   $listEmpty       = $("#empty-mentors").html().replace(/(<!--)*(-->)*/g, "")
            ,   loaderSnippet    = $("#load-mentor").html().replace(/(<!--)*(-->)*/g, "")
            ,   actionData       = $("#active-mentor-action").html().replace(/(<!--)*(-->)*/g, "")
            ,   $list            = $element.find("." + options.list)
            ,   emptyVal         = ''
            ,   counter          = 1
            ,   $listItem
            ,   listItem
            ,   mentorId
            ,   memberId
            ,   entityId
            ,   profilePic
            ,   memberProfile
            ,   personalDetails
            ,   contactPicture
            ,   memberCountry
            ,   imageWidth
            ,   imageLeft
            ,   imageTop
            ,   country
            ,   isEntrepreneur
            ,   isMentor
            ,   isInvestor
            ,   cbParams        =  {}
            ,   $d              =  $.Deferred()
            ,   responseLength
            ;

            bidx.api.call(
                "mentorRelationships.get"
            ,   {
                    id:              loggedInMemberId
                ,   groupDomain:     bidx.common.groupDomain
                ,   success: function( response )
                    {
                        $list.empty();

                        if ( response && response.length )

                        {
                            active  =   [];
                            wait    =   [];
                            respond =   [];

                            $.each( response , function ( idx, itemResponse)
                            {
                                //Cast to string for comparison
                                entityId = itemResponse.entityId.toString();

                                if( entityId === bidxConfig.context.businessSummaryId )
                                {
                                    if ( ( itemResponse.status  === 'accepted' ) &&
                                         ( itemResponse.mentorId    !== loggedInMemberId )
                                         )
                                    {

                                        active.push( itemResponse );
                                    }
                                    else if ( ( itemResponse.status      === 'requested' ) &&
                                         ( itemResponse.mentorId    !== loggedInMemberId ) &&
                                         ( itemResponse.initiatorId === loggedInMemberId ) )
                                    {

                                        wait.push( itemResponse );
                                    }
                                    else if( ( itemResponse.status      === 'requested' ) &&
                                             ( itemResponse.mentorId    !== loggedInMemberId ) &&
                                             ( itemResponse.initiatorId !== loggedInMemberId ) )
                                    {

                                        respond.push( itemResponse );
                                    }
                                    else if( ( itemResponse.status      === 'rejected' ) &&
                                             ( itemResponse.mentorId    !== loggedInMemberId ) &&
                                             ( itemResponse.initiatorId !== loggedInMemberId ) )
                                    {

                                        rejectByEntrepreneur.push( itemResponse );
                                    }
                                    else if( ( itemResponse.status      === 'rejected' ) &&
                                             ( itemResponse.mentorId    !== loggedInMemberId ) &&
                                             ( itemResponse.initiatorId === loggedInMemberId ) )
                                    {

                                        rejectByMentor.push( itemResponse );
                                    }
                                }
                            });

                            responseLength = active.length;

                            if( responseLength )
                            {

                                $.each( active , function ( idx, item)
                                {
                                    mentorId    = bidx.utils.getValue( item, "mentorId" );

                                     listItem = loaderSnippet
                                                .replace( /%contactId%/g, mentorId );

                                     $list.append( listItem );

                                     showMemberProfile(
                                    {
                                        ownerId     :   mentorId
                                     ,  callback    :   function ( itemMember, itemMemberId )
                                                        {
                                                            if(itemMember)
                                                            {
                                                                memberId        =   bidx.utils.getValue( itemMember, "member.bidxMeta.bidxMemberId" );
                                                                memberProfile   =   bidx.utils.getValue( itemMember, "bidxMemberProfile" );
                                                                personalDetails =   bidx.utils.getValue( itemMember, "bidxMemberProfile.personalDetails" );
                                                                profilePic      =   bidx.utils.getValue( personalDetails, "profilePicture" );
                                                                memberCountry   =   bidx.utils.getValue( personalDetails, "address.0.country");
                                                                isEntrepreneur   = bidx.utils.getValue( itemMember, "bidxEntrepreneurProfile" );
                                                                isInvestor       = bidx.utils.getValue( itemMember, "bidxInvestorProfile" );
                                                                isMentor         = bidx.utils.getValue( itemMember, "bidxMentorProfile" );

                                                                /* Profile Picture */
                                                                if ( profilePic )
                                                                {
                                                                    imageWidth  = bidx.utils.getValue( profilePic, "width" );
                                                                    imageLeft   = bidx.utils.getValue( profilePic, "left" );
                                                                    imageTop    = bidx.utils.getValue( profilePic, "top" );
                                                                    contactPicture = '<div class="img-cropper"><img class="media-object" style="width:'+ imageWidth +'px; left:-'+ imageLeft +'px; top:-'+ imageTop +'px;" src="' + profilePic.document + '"></div>';
                                                                }
                                                                else
                                                                {
                                                                    contactPicture = "<div class='icons-rounded pull-left'><i class='fa fa-user text-primary-light'></i></div>";
                                                                }

                                                                /* Member Country */
                                                                if(memberCountry)
                                                                {

                                                                    bidx.data.getItem(memberCountry, 'country', function(err, labelCountry)
                                                                    {
                                                                        country    =  labelCountry;
                                                                    });
                                                                }
                                                                // duplicate snippet source and replace all placeholders (not every snippet will have all of these placeholders )
                                                                //
                                                                listItem = snippet
                                                                    .replace( /%pictureUrl%/g,          contactPicture )
                                                                    .replace( /%contactId%/g,           memberId                 ? memberId : emptyVal )
                                                                    .replace( /%contactName%/g,         itemMember.member.displayName               ? itemMember.member.displayName : emptyVal)
                                                                    .replace( /%professionalTitle%/g,   personalDetails.professionalTitle   ? personalDetails.professionalTitle     : emptyVal )
                                                                    .replace( /%country%/g,             country            ? country   : "" )
                                                                    .replace( /%role_entrepreneur%/g,   ( isEntrepreneur )  ? bidx.i18n.i( 'entrepreneur' )    : '' )
                                                                    .replace( /%role_investor%/g,       ( isInvestor )      ? bidx.i18n.i( 'investor' )   : '' )
                                                                    .replace( /%role_mentor%/g,         ( isMentor )        ? bidx.i18n.i( 'mentor' )   : '' )
                                                                    .replace( /%action%/g,   actionData)
                                                                ;

                                                                $listItem = $( listItem );

                                                                if( options && options.cb )
                                                                {
                                                                    cbParams = {
                                                                                    mentorId:           memberId
                                                                                ,   isActiveRequest:    true
                                                                                };

                                                                    options.cb( $listItem,  cbParams );

                                                                    $listItem.find( '.viewRequestmentor').show( );
                                                                }
                                                                //  add mail element to list

                                                            }

                                                            $list.find('.member' + memberId ).empty().append( $listItem );

                                                            if( counter === responseLength )
                                                            {

                                                                $d.resolve( );
                                                            }

                                                             counter = counter + 1;
                                                        }
                                    } );
                                });
                            }
                            else
                            {
                                $list.append($listEmpty);

                                $d.resolve( );
                            }
                        }
                        else
                        {
                            $list.append($listEmpty);

                            $d.resolve( );
                        }

                        //  execute callback if provided
                        if (options && options.callback)
                        {
                            options.callback();
                        }

                    }
                    , error: function(jqXhr, textStatus)
                    {

                        var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                         _showError("Something went wrong while retrieving contactlist of the member: " + status);

                         //  execute callback if provided
                        if (options && options.callback)
                        {
                            options.callback();
                        }
                    }
                }
            );
        return $d;

    }

    function _getMentorRequests ( options )
    {
        var $mentorPanel        =   $element.find("#businessSummaryCollapse-MentoringDetails")
        ,   $mentorRequest      =   $mentorPanel.find('.mentor-active-list')
        ,   $mentorMatchRequest =   $mentorPanel.find('.mentor-match-list')
        ,   isMentorListEmpty   =   ($.trim( $mentorRequest.html()) === '') ? true : false
        ,   isMentorMatchEmpty  =   ($.trim( $mentorMatchRequest.html()) === '') ? true : false
        ,   showMatch           =   bidx.utils.getValue(options, 'showMatch')
        ;

        _showAllView( "mentor" );

        if(showMatch !== 'hide') //If its not view and in edit state then show matches
        {
            _showAllView( "matchingmentors" );
        }

        if( isMentorListEmpty )
        {
            _getActiveMentors(
            {
                list:   'mentor-active-list'
            ,   cb:     function( $listItem, params )
                        {
                            _getContactsCallback( $listItem, params );

                            if(isMentorMatchEmpty && showMatch !== 'hide') //If its not view and in edit state and not loaded then load matches
                            {
                                 _getMentorMatches(
                                {
                                    list:   'mentor-match-list'
                                ,   cb  :   function ( )
                                            {
                                                _showAllView( "pager" );
                                            }
                                });

                            }
                        }
            });
        }
        else if(isMentorMatchEmpty && showMatch !== 'hide') //If acitve members loaded in view and now in edit state then show matches
        {
         _getMentorMatches(
                            {
                                list:   'mentor-match-list'
                            ,   cb  :   function ( )
                                        {
                                            _showAllView( "pager" );
                                        }
                            });
        }


    }

    function _getMentors( options )
    {

        $tabMentor.on( "shown.bs.collapse", function ()
        {
            _handleToggleChange( "true", "mentorMatches" );
            _getMentorRequests( options );
        });
    }

    // This is the startpoint for the edit state
    //
    function _init( state )
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
        $btnCancel  = $( "<a />", { class: "btn btn-primary disabled", href: "#loadMentors"  });


        if( state === 'edit')
        {
            $tabMentor.on( "shown.bs.collapse", function ()
            {
                _getMentorRequests( );
            });
        }

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
                bidx.controller.updateHash( "#loadMentors", true );

                reset();

                bidx.common.removeValidationErrors();

                _showView( "show" );

                /* Show active/matching mentors */
                _showAllView( "mentor" );
                _hideView( "matchingmentors" );
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

            $expertiseNeeded.on('change', function(evt, params) {
                //Reset the search result offset and limit
                tempLimit               = CONSTANTS.SEARCH_LIMIT ;
                paging.search.offset    = CONSTANTS.LOAD_COUNTER;

                _getMentorMatches(
                {
                    list:   'mentor-match-list'
                ,   cb  :   function ( )
                            {
                                _showAllView( "pager" );
                            }
                });
            });

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

                    bidx.common.removeValidationErrors();

                    _showView( "edit" );
                    _getMentorRequests( );
                    _showAllView( "mentor" );
                    _showAllView( "matchingmentors" );

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
                memberId:           bidx.common.getCurrentUserId()
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
            "businesssummary.fetch"
        ,   {
                businessSummaryId:  businessSummaryId
            ,   groupDomain:        bidx.common.groupDomain

            ,   success: function( response )
                {
                    bidx.utils.log( "[BusinessSummary] fetch", businessSummaryId, response );

                    // Do we have edit perms?
                    //
                    var bidxMeta    = bidx.utils.getValue( response, "data.bidxMeta" )
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
                        businessSummary = response.data;

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

        if ( bidxConfig.authenticated === false )
        {
            bidx.utils.log('Not logged in');
        }

        $.each( forms, function( name, form )
        {
            if ( !form.$el.valid() )
            {
                bidx.utils.warn( "[BusinessSummary] Invalid form", form.$el, form.$el.validate().errorList );

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

                // Offer a login modal if not authecticated
                if ( jqXhr.status === 401 )
                {
                    $( ".loginModal" ).modal();
                }

                $btnSave.removeClass( "disabled" );
                $btnCancel.removeClass( "disabled" );
            }
        } );
    }

    // Beware! validation should have been tested, this is just a function for callin the API for saving
    //
    function _save( params )
    {
        var currentLanguage
        ,   icl_vars
        ;

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
            "businesssummary.save"
        ,   {
                // Undefined when creating the business summary
                //
                businessSummaryId:      businessSummaryId
            ,   groupDomain:            bidx.common.groupDomain
            ,   data:                   businessSummary
            ,   success:        function( response )
                {
                    bidx.utils.log( "businesssummary.save::success::response", response );

                    var bidxMeta = bidx.utils.getValue( response, "data.bidxMeta" );

                    if ( state === "create" )
                    {
                        businessSummaryId = bidx.utils.getValue( bidxMeta, "bidxEntityId" );
                    }

                    bidx.common.closeNotifications();
                    bidx.common.notifyRedirect();

                    bidx.common.removeAppWithPendingChanges( appName );

                    icl_vars                    = window.icl_vars || {};
                    currentLanguage             = bidx.utils.getValue( icl_vars, "current_language" );
                    currentLanguage             = (currentLanguage && currentLanguage !== 'en') ? '/' + currentLanguage : '';
                    var url = currentLanguage + "/businesssummary/" + businessSummaryId + "?rs=true";

                    document.location.href = url;

//                    var url = document.location.href.split( "#" ).shift();
//                    // Maybe rs=true was already added, or not 'true' add it before reloading
//                    //
//                    var rs = bidx.utils.getQueryParameter( "rs", url );
//                    var redirect_to = bidx.utils.getQueryParameter( "redirect_to", url );
//
//
//                    if( redirect_to ) {
//                        url = '/' + redirect_to;
//                    }
//
//                    if ( !rs || rs !== "true" )
//                    {
//                        url += ( url.indexOf( "?" ) === -1 ) ? "?" : "&";
//                        url += "rs=true";
//                    }
//
//                    document.location.href = url;

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

        if ( currentView === "show" )
        {
            $element.find( ".total-error-message" ).hide();
        }
    };
    var _showAllView = function ( view )
    {
        var $view = $views.filter( bidx.utils.getViewName( view ) ).show();
    };

    var _hideView = function( hideview )
    {
        $views.filter(bidx.utils.getViewName(hideview)).hide();
    };

    // ROUTER
    //
    function navigate( options )
    {
        var params  = options.params
        ,   cancel  = bidx.utils.getValue( params, 'cancel')
        ;

        if ( options.requestedState !== "edit" )
        {
            $element.removeClass( "edit" );
        }

        switch ( options.requestedState )
        {
            case 'view':

               bidx.utils.log( "businessSummary::AppRouter::view" );

               _getMentors({
                    showMatch : 'hide'
                });

            break;

            case 'load':
                bidx.utils.log( "businessSummary::AppRouter::load", params );

                // Hide common-mentordashboard.js mentor ex click on cacncel modal box etc
                $( ".bidx-modal").unbind('hide');
                $( ".bidx-modal").modal('hide');


                if( !cancel )
                {
                    _showAllView( "mentor" );

                    _getActiveMentors(
                    {
                        list:   'mentor-active-list'
                    ,   cb:     function( $listItem, params )
                                {
                                    _getContactsCallback( $listItem, params );
                                }
                    });

                    if( businessSummaryId )
                    {
                        _showAllView( "matchingmentors" );
                         _getMentorMatches(
                        {
                            list:   'mentor-match-list'
                        ,   cb  :   function ( )
                                    {
                                        _showAllView( "pager" );
                                    }
                        });
                    }
                }

            break;
            case "edit":
                bidx.utils.log( "businessSummary::AppRouter::edit", options.id, options.section );

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
                            _init( state );
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
                bidx.utils.log( "CreateBusinessSummary::AppRouter::create" );

                businessSummaryId   = null;
                state               = "create";

                _showView( "load" );

                // Make sure the i18n translations for this app are available before initing
                //
                bidx.i18n.load( [ "__global", appName ] )
                    .done( function()
                    {
                        _init( state );
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


    // if hash is empty and there is not path in the uri, load #home
    //
    if ($("body.bidx-businesssummary").length && !bidx.utils.getValue(window, "location.hash").length)
    {
        window.location.hash = "#viewBusinessSummary";
    }
} ( jQuery ));
