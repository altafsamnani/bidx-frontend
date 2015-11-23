;( function ( $ )
{
    "use strict";

    var $element                     = $( "#join" )
    ,   $views                       = $element.find( ".view" )
    ,   $frmRegisterMember           = $element.find( ".viewRegister form" )
    ,   $frmBecomeInvestor           = $element.find( ".viewBecomeInvestor form" )
    ,   $frmBecomeMentor             = $element.find( ".viewBecomeMentor form" )
    ,   $frmBecomeEntrepreneur       = $element.find( ".viewBecomeEntrepreneur form" )

    ,   $viewRoles                   = $element.find( ".viewRoles" )
    ,   $registerRole                = $element.find( ".js-register-role" )

    // Prechecks
    ,   authenticated               = bidx.utils.getValue( bidxConfig, "authenticated" )
    ,   memberId                    = authenticated ? bidx.utils.getValue( bidxConfig, "session.id" )           : null
    ,   currentGroup                = authenticated ? bidx.utils.getValue( bidxConfig, "session.currentGroup" ) : null
    ,   joinedGroups                = authenticated ? bidx.utils.getValue( bidxConfig.session, "groups" )       : null
    ,   joinedCurrentGroup          = authenticated ? currentGroup in joinedGroups                              : false
    ,   hasGroups                   = authenticated ? Object.keys( joinedGroups ).length                        : false
    ,   hasEntrepreneurProfile      = authenticated ? bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxEntrepreneurProfile" ) : false
    ,   hasInvestorProfile          = authenticated ? bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxInvestorProfile" )     : false
    ,   hasMentorProfile            = authenticated ? bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxMentorProfile" )       : false
    ,   hasProfile                  = ( hasEntrepreneurProfile || hasInvestorProfile || hasMentorProfile ) ? true : false

    // Register
    ,   $memberCountry              = $frmRegisterMember.find( "[name='personalDetails.address.country']" )
    ,   $formfields                 = $frmRegisterMember.find( ":input" )
    ,   $addressCountry             = $formfields.filter( "[name='personalDetails.address.country']" )
    ,   $btnRegister                = $frmRegisterMember.find( ":submit" )
    ,   submitBtnLabel

    // Investor Form elements
    ,   $investorType               = $frmBecomeInvestor.find( "[name='investorType']" )
    ,   $institutionAddressCountry  = $frmBecomeInvestor.find( "[name='institutionAddress.country']" )
    ,   $focusSocialImpact          = $frmBecomeInvestor.find( "[name='focusSocialImpact']" )
    ,   $focusEnvImpact             = $frmBecomeInvestor.find( "[name='focusEnvImpact']" )
    ,   $investmentType             = $frmBecomeInvestor.find( "[name='investmentType']" )

    // Mentor Form elements
    ,   $focusLanguage              = $frmBecomeMentor.find( "[name='focusLanguage']" )
    ,   $focusExpertise             = $frmBecomeMentor.find( "[name='focusExpertise']" )
    ,   $toggleInput                = $frmBecomeMentor.find( ".toggleInput" )
    ,   $prefComm                   = $frmBecomeMentor.find( ".js-PreferredCommunication" )
    ,   $prefCommChkBoxes           = $prefComm.find( "[type='checkbox']" )

    // Entrepreneur Form elements
    ,   $expertiseNeeded            = $frmBecomeEntrepreneur.find( "[name='expertiseNeeded']" )
    ,   $countryOperation           = $frmBecomeEntrepreneur.find( "[name='countryOperation']" )
    ,   $reasonForSubmission        = $frmBecomeEntrepreneur.find( "[name='reasonForSubmission']" )
    ,   $yearSalesStarted           = $frmBecomeEntrepreneur.find( "[name='yearSalesStarted']" )

    // Role buttons
    ,   $registerRoleBtns           = $registerRole.find( "[role='button']" )

    // Save buttons
    ,   $btnSaveEntrepreneur        = $frmBecomeEntrepreneur.find( "#saveEntrepreneur" )
    ,   $btnSaveInvestor            = $frmBecomeInvestor    .find( "#saveInvestor" )
    ,   $btnSaveMentor              = $frmBecomeMentor      .find( "#saveMentor" )

    ,   $btnJoinGroup               = $element.find( "a[href$=#joinGroup]" )

    // Toggles
    ,   $toggles                    = $element.find( ".toggle" ).hide()
    ,   $toggleInvestsForInst       = $frmBecomeInvestor.find( "[name='investsForInst']" )
    ,   $toggleMentorsForInst       = $frmBecomeMentor.find( "[name='mentorsForInst']" )
    ,   $toggleExpertiseNeeded      = $frmBecomeEntrepreneur.find( "[name='mentorAdvisory']" )

    ,   role

    // member object serves also the businessSummary object
    ,   member                      = {}
    ,   bidxProfile
    ,   mentorProfileId
    ,   businessSummaryId           = null
    ,   businessSummary
    ,   appName                     = "auth"
    ;

    // Form fields
    //
    var fields =
    {
        _mentor:
        [
            'summary'
        ,   'focusLanguage'
        ,   'focusExpertise'
        ,   'skype'
        ,   'hangout'
        ,   'aim'
        ,   'icq'
        ,   'mentorsForInst'
        ,   'institutionName'
        ,   'institutionWebsite'
        ]

    ,   _investor:
        [
            'summary'
        ,   'investorType'
        ,   'institutionAddress.country'
        ,   'institutionAddress.cityTown'
        ,   'focusSocialImpact'
        ,   'focusEnvImpact'
        ,   'investmentType'
        ,   'typicalInvolvement'
        ,   'investsForInst'
        ,   'institutionName'
        ,   'institutionWebsite'
        ]

    ,   _entrepreneur:
        [
            'name'
        ,   'summary'
        ,   'reasonForSubmission'
        ,   'mentorAdvisory'
        ,   'expertiseNeeded'
        ,   'expertiseNeededDetail'
        ,   'countryOperation'
        ,   'yearSalesStarted'
        ,   'personalRole'
        ,   'personalExpertise'
        ,   'consumerType'
        ,   'financingNeeded'
        ,   'equityRetained'
        ]
    };

    // Setup function for doing work that should only be done once
    //
    function _oneTimeSetup()
    {
        // Populate the selects
        //
        $focusSocialImpact.bidx_chosen(
        {
            dataKey:            "socialImpact"
        });

        $focusEnvImpact.bidx_chosen(
        {
            dataKey:            "envImpact"
        });

        $investmentType.bidx_chosen(
        {
            dataKey:            "investmentType"
        });

        $institutionAddressCountry.bidx_chosen(
        {
            dataKey:            "country"
        ,   emptyValue:         bidx.i18n.i( "frmSelectFieldRequired" )
        });

        $investorType.bidx_chosen(
        {
            dataKey:            "investorType"
        ,   emptyValue:         bidx.i18n.i( "frmSelectFieldRequired" )
        });

        $focusExpertise.bidx_chosen(
        {
            dataKey:            "mentorExpertise"
        });

        $focusLanguage.bidx_chosen(
        {
            dataKey:            "language"
        });

        $reasonForSubmission.bidx_chosen(
        {
            dataKey:            "reasonForSubmission"
        ,   emptyValue:         bidx.i18n.i( "selectReasonForSubmission", appName )
        });

        $expertiseNeeded.bidx_chosen(
        {
            dataKey:            "mentorExpertise"
        });

        $countryOperation.bidx_chosen(
        {
            dataKey:            "country"
        });

        $memberCountry.bidx_chosen(
        {
            dataKey:            "country"
        ,   emptyValue:         bidx.i18n.i( "selectSingleOption", appName )
        });

        $yearSalesStarted.bidx_chosen();


        // The names of the browser's native checkbox and the text input must be the same
        //
        var _handleCheckboxChange = function( show, checkbox )
        {
            var fn = show ? "fadeIn" : "hide";

            $toggleInput.find( "input[type='text'][name='" + checkbox + "']" )[ fn ]();
        };

        $prefCommChkBoxes.change( function()
        {
            var $el     = $(this)
            ,   name    = $el[0].name
            ,   value   = name.split('.')[1]
            ,   ck      = $el.prop('checked')
            ;

            _handleCheckboxChange( ck, value );
        } );


        // Update the UI to show the input fields
        //
        var _handleToggleChange = function( show, group )
        {
            var fn = show ? "fadeIn" : "hide";

            $toggles.filter( ".toggle-" + group )[ fn ]();
        };

        $toggleInvestsForInst.change( function()
        {
            var value   = $toggleInvestsForInst.filter( "[checked]" ).val();

            _handleToggleChange( value === "true", "investsForInst" );
        } );

        $toggleMentorsForInst.change( function()
        {
            var value   = $toggleMentorsForInst.filter( "[checked]" ).val();

            _handleToggleChange( value === "true", "mentorsForInst" );
        } );

        $toggleExpertiseNeeded.change( function()
        {
            var value   = $toggleExpertiseNeeded.filter( "[checked]" ).val();

            _handleToggleChange( value === "true", "mentorAdvisory" );
        } );


        // Save buttons
        // + Adding the role based on the clicked button
        //
        $btnSaveEntrepreneur.click( function( e )
        {
            role = "entrepreneur";

            $frmBecomeEntrepreneur.submit();
        } );

        $btnSaveInvestor.click( function( e )
        {
            role = "investor";

            $frmBecomeInvestor.submit();
        } );

        $btnSaveMentor.click( function( e )
        {
            role = "mentor";

            $frmBecomeMentor.submit();
        } );

        $btnRegister.click( function( e )
        {
            role = "member";

            $frmRegisterMember.submit();
        } );

        // Show Role Form
        $registerRoleBtns.click( function( e )
        {
            var formView = $(this).attr('name');

            _showView( formView );
            _showParentView();
        } );

    }

    // Convert the form values back into the member object
    //
    function _getFormValues( role )
    {
        var $form
        ,   year            = bidx.common.getNow().getFullYear()
        ,   periodStartDate = year + "-01-01"
        ;

        switch ( role )
        {
            case "member":
                $form = $frmRegisterMember;
                fields = fields._member;
                bidxProfile = "bidxMemberProfile";
            break;

            case "entrepreneur":
                $form = $frmBecomeEntrepreneur;
                fields = fields._entrepreneur;
                bidxProfile = "bidxEntrepreneurProfile";
            break;

            case "investor":
                $form = $frmBecomeInvestor;
                fields = fields._investor;
                bidxProfile = "bidxInvestorProfile";
            break;

            case "mentor":
                $form = $frmBecomeMentor;
                fields = fields._mentor;
                bidxProfile = "bidxMentorProfile";
            break;


            default:
                // NOOP
                bidx.utils.warn( "join::_getFormValues: no role found!" );
        }

        // We don't a state in this app, always it is a new entity so we initialize the member object
        //
        member[bidxProfile] =
        {
            bidxMeta:
            {
                bidxEntityType: bidxProfile
            }
        };

        if ( role === "entrepreneur" )
        {
            businessSummary =
            {
                bidxMeta:
                {
                    bidxEntityType: "bidxBusinessSummary"
                }
            };

            // Default values
            //
            bidx.utils.setValue( member, "bidxEntrepreneurProfile.summary", ".." );
            bidx.utils.setValue( member, "bidxEntrepreneurProfile.prevRunBusiness", false );
            bidx.utils.setValue( member, "bidxEntrepreneurProfile.cv", {} );

            bidx.utils.setValue( businessSummary, "periodStartDate", periodStartDate );
            bidx.utils.setValue( businessSummary, "financialSummaries." + year + ".numberOfEmployees", 0 );
            bidx.utils.setValue( businessSummary, "financialSummaries." + year + ".operationalCosts", 0 );
            bidx.utils.setValue( businessSummary, "financialSummaries." + year + ".salesRevenue", 0 );
            bidx.utils.setValue( businessSummary, "financialSummaries." + year + ".totalIncome", 0 );

            $.each( fields, function( i, f )
            {
                var $input = $form.find( "[name^='" + f + "']" )
                ,   value  = bidx.utils.getElementValue( $input )
                ;

                if ( f === "financingNeeded" )
                {
                    bidx.utils.setValue( businessSummary, "financialSummaries." + year + ".financeNeeded", value );
                }

                bidx.utils.setValue( businessSummary, f, value );
            } );

        }
        else if ( role === "member" )
        {
            var memberProfile =
            {
                emailAddress:          $formfields.filter( "[name='username']" ).val()
            ,   personalDetails:
                {
                    firstName:         $formfields.filter( "[name='personalDetails.firstName']" ).val()
                ,   lastName:          $formfields.filter( "[name='personalDetails.lastName']" ).val()
                ,   address:
                    [
                        {
                            country:   $addressCountry.val()
                        }
                    ]
                }
            };

            bidx.utils.setValue( member, bidxProfile, memberProfile );
        }
        else
        {
            $.each( fields, function( i, f )
            {
                var $input = $form.find( "[name='" + f + "']" )
                ,   value  = bidx.utils.getElementValue( $input )
                ;

                // preferredCommunication fields
                if ( f === "skype" || f === "hangout" || f === "aim" || f === "icq" )
                {
                    bidx.utils.setValue( member, "bidxMentorProfile.preferredCommunication." + f, value );
                }
                else
                {
                    bidx.utils.setValue( member, bidxProfile + "." + f, value );
                }
            } );
        }
    }


    // This is the startpoint
    //
    function _init()
    {
        // Reset any state
        //
        $prefComm.find( "input[type='text']" ).hide();

        // Validate Member Register form
        //
        $frmRegisterMember.validate(
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

                // set button to disabled and set Wait text. We store the current label so we can reset it when an error occurs
                //

                submitBtnLabel = $btnRegister.text();
                $btnRegister.i18nText("btnPleaseWait");

                _handleFormSubmition( role );
            }
        } );


        // Validate Investor form
        //
        $frmBecomeInvestor.validate(
        {
            debug: false
        ,   ignore: ".chosen-search input, .search-field input"
        ,   rules:
            {
                "summary":
                {
                    required:               true
                }
            ,   "investorType":
                {
                    required:               true
                }
            ,   "investsForInst":
                {
                    required:               true
                }
            ,   "institutionName":
                {
                    required:               { depends: function () { return !$( ".toggle-investsForInst" ).is(':hidden'); } }
                }
            ,   "institutionWebsite":
                {
                    required:               { depends: function () { return !$( ".toggle-investsForInst" ).is(':hidden'); } }
            ,       urlOptionalProtocol:    true
                }
            ,   "institutionAddress.cityTown":
                {
                    required:               true
                }
            ,   "institutionAddress.country":
                {
                    required:               true
                }
            ,   "investmentType":
                {
                    required:               true
                }
            ,   "focusSocialImpact":
                {
                    required:               true
                }
            ,   "focusEnvImpact":
                {
                    required:               true
                }
            ,   "typicalInvolvement":
                {
                    required:               true
                }
            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
            }
        ,   submitHandler: function( e )
            {
                _handleFormSubmition( role );
            }
        } );

        // Validate Mentor form
        //
        $frmBecomeMentor.validate(
        {
            debug: false
        ,   ignore: ".chosen-search input, .search-field input"
        ,   rules:
            {
                "summary":
                {
                    required:               true
                }
            ,   "focusLanguage":
                {
                    required:               true
                }
            ,   "focusExpertise":
                {
                    required:               true
                }
            ,   "mentorsForInst":
                {
                    required:               true
                }
            ,   "institutionName":
                {
                    required:               { depends: function () { return !$( ".toggle-mentorsForInst" ).is(':hidden'); } }
                }
            ,   "institutionWebsite":
                {
                    required:               { depends: function () { return !$( ".toggle-mentorsForInst" ).is(':hidden'); } }
            ,       urlOptionalProtocol:    true
                }
            ,   "skype":
                {
                    required:               { depends: function() { return !$( "[type='text'][name='skype']" ).is(':hidden'); } }
                }
            ,   "hangout":
                {
                    required:               { depends: function() { return !$( "[type='text'][name='hangout']" ).is(':hidden'); } }
                }
            ,   "aim":
                {
                    required:               { depends: function() { return !$( "[type='text'][name='aim']" ).is(':hidden'); } }
                }
            ,   "icq":
                {
                    required:               { depends: function() { return !$( "[type='text'][name='icq']" ).is(':hidden'); } }
                }
            ,   "preferredCommunicationAll":
                {
                    required:               { depends: function()
                                                {
                                                    var hasCheckedCheckbox = true;
                                                    $.each( $prefCommChkBoxes, function( i, c ) {
                                                         if ( c.checked )
                                                         {
                                                            hasCheckedCheckbox = false;
                                                            $( "#preferredCommunicationAll" )
                                                                .attr( "checked" , true)
                                                                .removeClass('error')
                                                                .parent()
                                                                .removeClass('has-error');
                                                            return;
                                                         }
                                                    });
                                                    return hasCheckedCheckbox;
                                                }
                                            }
                }
            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
                "preferredCommunicationAll": bidx.i18n.i( "preferredCommunicationAll", appName )
            }
        ,   submitHandler: function( e )
            {
                _handleFormSubmition( role );
            }
        } );

        // Validate Entrepreneur form
        //
        $frmBecomeEntrepreneur.validate(
        {
            debug: false
        ,   ignore: ".chosen-search input, .search-field input"
        ,   rules:
            {
                "name":
                {
                    required:               true
                ,   maxlength:              30
                }
            ,   "summary":
                {
                    required:               true
                ,   maxlength:              900
                }
            ,   "reasonForSubmission":
                {
                    required:               true
                }
            ,   "mentorAdvisory":
                {
                    required:               true
                }
            ,   "expertiseNeeded":
                {
                    required:               { depends: function () { return !$( ".toggle-mentorAdvisory" ).is(':hidden'); } }
                }
            ,   "expertiseNeededDetail":
                {
                    required:               { depends: function () { return !$( ".toggle-mentorAdvisory" ).is(':hidden'); } }
                ,   maxlength:              300
                }
            ,   "countryOperation":
                {
                    required:               true
                }
            ,   "yearSalesStarted":
                {
                    required:               true
                }
            ,   "personalRole":
                {
                    required:               true
                ,   maxlength:              30
                }
            ,   "personalExpertise":
                {
                    required:               true
                ,   maxlength:              180
                }
            ,   "consumerType[]":
                {
                    required:               true
                }
            ,   "financingNeeded":
                {
                    required:               true
                ,   monetaryAmount:         true
                }
            ,   "equityRetained":
                {
                    required:               true
                ,   number:                 true
                ,   min:                    0
                ,   max:                    100
                }
            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
                "preferredCommunicationAll": bidx.i18n.i( "preferredCommunicationAll", appName )
            }
        ,   submitHandler: function( e )
            {
                _handleFormSubmition( role );
            }
        } );

    }

    var _handleFormSubmition = function( role )
    {
        var $btnSave;

        switch ( role )
        {
            case "member":
                $btnSave = $btnRegister;
            break;

            case "entrepreneur":
                $btnSave = $btnSaveEntrepreneur;
            break;

            case "investor":
                $btnSave = $btnSaveInvestor;
            break;

            case "mentor":
                $btnSave = $btnSaveMentor;
            break;

            default:
                // NOOP
                bidx.utils.warn( "join::_handleFormSubmition: no role found!" );
        }

        if ( $btnSave.hasClass( "disabled" ) )
        {
            return;
        }

        $btnSave.addClass( "disabled" );

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
                    bidx.utils.error( "problem parsing error response from investorProfile save" );
                }

                bidx.common.notifyError( "Something went wrong during save: " + response );


                $btnSave.removeClass( "disabled" );
            }
        } );

    };


    // Try to save to the API
    //
    function _save( params )
    {
        var bidxAPIService
        ,   bidxAPIParams
        ;
        if ( !member )
        {
            return;
        }

        // Update the member object
        //
        _getFormValues( role );

        bidx.common.notifySave();

        bidx.utils.log( "about to save member with role: " + role, member );

        bidxAPIParams   =
        {
            data:           ( role === "entrepreneur" ) ? businessSummary : member[bidxProfile]
        ,   groupDomain:    bidx.common.groupDomain
        ,   success:        function( response )
            {
                bidx.utils.log( bidxAPIService + "::success::response", response );

                if ( role !== "entrepreneur" )
                {
                    bidx.common.closeNotifications();
                }

                bidx.common.removeAppWithPendingChanges( appName );

                // Finally join the group with clicking a hidden button
                // This is used because it handles the redirection to front page
                // For entrepreneur the group joining is done in the special callback .call function
                //
                if ( role === "investor" || role === "mentor" )
                {
                    $btnJoinGroup.click();
                }
                else if ( role === "member" )
                {
                    $frmRegisterMember.hide();
                    $element.find( ".registerSuccess" ).removeClass( "hide" );
                }
                else
                {
                    _saveEntrepreneur(
                    {
                        error: function( jqXhr )
                        {
                            var response
                            ,   $btnSave = $btnSaveEntrepreneur // Not sure if needed
                            ;

                            try
                            {
                                // Not really needed for now, but just have it on the screen, k thx bye
                                //
                                response = JSON.stringify( JSON.parse( jqXhr.responseText ), null, 4 );
                            }
                            catch ( e )
                            {
                                bidx.utils.error( "problem parsing error response from investorProfile save" );
                            }

                            bidx.common.notifyError( "Something went wrong during save: " + response );

                            $btnSave.removeClass( "disabled" );
                        }
                    } );
                }
            }
        ,   error:          function( jqXhr, textStatus )
            {
                params.error( jqXhr );

                bidx.common.closeNotifications();
            }
        };

        // Creating an mentor is not possible via the member API, therefore the
        // raw Entity API is used for the creation of the entrepreneur
        //
        if ( role === "mentor" || role === "investor" )
        {
            bidxAPIService          = "entity.save";
        }
        else if ( role === "member" )
        {
            bidxAPIService          = "member.save";
        }
        else
        {
            bidxAPIService          = "businesssummary.save";
            bidxAPIParams.memberId  = memberId;
        }
        // Call that service!
        //
        bidx.api.call(
            bidxAPIService
        ,   bidxAPIParams
        );
    }

    // Try to save to the API
    //
    function _saveEntrepreneur( params )
    {
        var bidxAPIService = "entity.save"
        ,   bidxAPIParams
        ;

        bidx.utils.log( "about to save member with role: " + role, member );

        bidxAPIParams   =
        {
            data:           member.bidxEntrepreneurProfile
        ,   groupDomain:    bidx.common.groupDomain
        ,   success:        function( response )
            {
                bidx.utils.log( bidxAPIService + "::success::response", response );

                bidx.common.closeNotifications();

                bidx.common.removeAppWithPendingChanges( appName );

                // Finally join the group with clicking a hidden button
                // This is used because it handles the redirection to front page
                //
                $btnJoinGroup.click();
            }
        ,   error:          function( jqXhr, textStatus )
            {
                params.error( jqXhr );

                bidx.common.closeNotifications();
            }
        };

        // Call that service!
        //
        bidx.api.call(
            bidxAPIService
        ,   bidxAPIParams
        );
    }


    // generic view function. Hides all views and then shows the requested view
    //
    var _showView = function( view )
    {
        var $view = $views.hide().filter( bidx.utils.getViewName( view ) ).show();
    };

    var _showParentView = function( state )
    {
        $viewRoles.parents( ".view" ).show();
        $element.find( "a[href$="+state+"]" ).click();
    };

    // function _showError( msg )
    // {
    //     $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
    //     _showView( "error" );
    // }

    var navigate = function( options )
    {
        switch ( options.state )
        {
            case "register":
                _showView( options.state );
            break;

            case "auth":
            case "role":
            case "portal":
                if ( authenticated )
                {
                    if ( hasProfile )
                    {
                        if ( joinedCurrentGroup )
                        {
                         document.location = "/";
                        }
                        else
                        {
                            bidx.controller.updateHash("#join/portal", true, false);
                            options.state = "portal";
                            _showView( options.state );
                        }
                    }
                    else
                    {
                        bidx.controller.updateHash("#join/role", true, false);
                        options.state = "role";
                        _showView( options.state );
                    }
                }
                else
                {
                    bidx.controller.updateHash("#join/auth", true, false);
                    options.state = "auth";
                    _showView( options.state );

                    /****************** Temporary Linkedin message ****************/
                    var $linkedinNotice =   $element.find( '.info-linkedin')
                    ,   params          =   options.params
                    ,   isLinkedin      =   bidx.utils.getValue(params, 'linkedin')
                    ;
                    //Temporary Linkedin notice on remove password page, will be removed once backend is fixed
                    if( isLinkedin === "true")
                    {
                        $linkedinNotice     =   $linkedinNotice.removeClass('hide');
                    }
                    else
                    {
                        $linkedinNotice     =   $linkedinNotice.addClass('hide');
                    }
                    /****************** Temporary Linkedin message ****************/
                }
            break;

            case "becomeEntrepreneur":
            case "becomeInvestor":
            case "becomeMentor":
                if ( !authenticated )
                {
                    bidx.controller.updateHash("#join/auth", true, false);
                    options.state = "auth";
                    _showView( options.state );
                }
                else
                {
                    _showParentView( options.state );
                }

            break;

            default:
                // NOOP
                bidx.utils.warn( "join::navigate: no state found!" );
        }
    };


    // Engage!
    //
    _oneTimeSetup();

    _init();

    //expose
    var app =
    {
        $element:               $element
    ,   navigate:               navigate
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.join = app;

    // Hot Fix for BIDX-2400
    // http://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url
    //
    if ( window.location.hash && window.location.hash === '#_=_')
    {
        window.location.hash = '';
    }

    if ($("body.bidx-join").length && !bidx.utils.getValue(window, "location.hash").length)
    {
        if ( authenticated && hasProfile && joinedCurrentGroup )
        {
            document.location = "/";
        }
        else
        {
            document.location.hash = "#join/auth";
        }
    }

} ( jQuery ));
