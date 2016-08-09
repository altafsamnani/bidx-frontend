;( function ( $ )
{
    "use strict";

    var $element                =   $( "#expressForm" )
    ,   $industrySectors        =   $element.find( ".industrySectors" )
    ,   $expertiseNeeded        =   $element.find( "[name='expertiseNeeded']" )
    ,   $toggles                =   $element.find( ".toggle" ).hide()
    ,   $toggleExpertiseNeeded  =   $element.find( "[name='mentorAdvisory']" )
    ,   $countryOperation       =   $element.find( "[name='countryOperation']" )
    ,   bidx                    =   window.bidx
    ,   appName                 =   "expressform"
    ,   $btnSave
    ,   $btnCancel
    ,   $editControls           =   $element.find( ".editControls" )
    ,   $bsLogo                 =   $element.find( ".bsLogo" )
    ,   $bsLogoBtn              =   $bsLogo.find( "[href$='#addLogo']" )
    ,   $bsLogoRemoveBtn        =   $bsLogo.find( "[href$='#removeLogo']" )
    ,   $controlsForEdit        =   $editControls.find( ".viewEdit" )
    ,   $controlsForError       =   $editControls.find( ".viewError" )
    ,   $bsLogoModal            =   $bsLogo.find( ".addLogoImage" )
    ,   $logoContainer          =   $bsLogo.find( ".logoContainer" )
    ,   $stageBusiness          =   $element.find( "[name='stageBusinessDetail']" )
    ,   snippets                =   {}
    ,   $views                  =   $element.find( ".view" )
    ,   $modals                 =   $element.find( ".modalView" )
    ,   $modal
    ,   $affixInfoBar           =   $('.info-bar')
    ,   expressFormData         =   window.__bidxExpressForm
    ,   businessSummary         =   bidx.utils.getValue( expressFormData, 'business')
    ,   member                  =   ( bidxConfig.authenticated === false ) ? {} : bidx.utils.getValue( expressFormData, 'member')
    ,   personalDetails         =   bidx.utils.getValue( member, 'bidxMemberProfile.personalDetails')
    ,   $currentAddressCountry  =   $element.find( "[name='personalDetails.address[0].country']"         )
    ,   hasEntrepreneurProfile  =   bidx.utils.getValue ( member, "bidxEntrepreneurProfile" )
    ,   forms             =
        {
            generalOverview:
            {
                $el:                    $element.find( "#formExpressForm-GeneralOverview" )
            }
        ,   personalDetails:
            {
                $el:                    $element.find( "#formExpressForm-PersonalDetails" )
            }
        ,   mentoringDetails:
            {
                $el:                    $element.find( "#formExpressForm-MentoringDetails" )
            }
        }
    ,   state
    ,   currentView
    ,   businessSummaryId           = ( businessSummary ) ? bidx.utils.getValue( businessSummary, "bidxMeta.bidxEntityId" ) : null
    ,   icl_vars                    = window.icl_vars || {}
    ,   iclLanguage                 = bidx.utils.getValue( icl_vars, "current_language" )
    ,   currentLanguage             = (iclLanguage && iclLanguage !== 'en') ? '/' + iclLanguage : ''
    ;

    // Form fields
    //
    var fields =
    {
        "personalDetails":
        {
            "_root":
            [
                'firstName'
            ,   'lastName'
            ,   'gender'
            ,   'emailAddress'
            ,   'mobile'
            ,   'cityTown'
            ,   'country'
            ,   'linkedIn'
            ,   'landline'
            ]
        }
    ,   "generalOverview":
        {
            "_root":
            [
                "name"
            ,   "summary"
            ,   "externalVideoPitch"
            ,   "website"
            ,   "countryOperation"
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

 
    // Use the retrieved businessSummary entity to populate the form and other screen elements
    //
    function _populateScreen()
    {
        // Go iteratively over all the forms and there fields
        //
        var $input
        ,   $form
        ,   value
        ,   fp
        ,   rp
        ,   emailAddress    =   bidx.utils.getValue(personalDetails,'emailAddress' )
        ,   userName        =   bidx.utils.getValue(member,'member.username' )
        ;

        if( !emailAddress )
        {
            bidx.utils.setValue( personalDetails, 'emailAddress', userName );
        }

        $.each( fields, function( form, formFields )
        {
            $form       = forms[ form ].$el;

            if ( formFields._root )
            {
                $.each( formFields._root, function( i, f )
                {
                    if( form !== 'personalDetails' )
                    {
                        if( businessSummary )
                        {
                            value  = bidx.utils.getValue( businessSummary, f );

                            $input = $form.find( "[name='" + f + "']" );

                            bidx.utils.setElementValue( $input, value );
                        }
                    }
                    else
                    {
                        fp  =   f;

                        rp  =   f;

                        switch( f )
                        {
                            case 'mobile':
                            case 'landline':

                            f   =   'contactDetail[0].' + rp;

                            fp  =   'contactDetail.0.' + rp;

                            break;

                            case 'cityTown':

                            f   =   'address[0].cityTown';

                            fp  =   'address.0.cityTown';

                            break;

                          /*  case 'country':

                            f   =   'address[0].country';

                            fp  =   'address.0.country';

                            break; */

                        }

                        if( f !== 'country' ) //Default country from hidden field so
                        {
                            value  = bidx.utils.getValue( personalDetails, fp );

                            $input = $form.find( "[name='personalDetails." + f + "']" );

                            bidx.utils.setElementValue( $input, value );
                        }
                    }
                } );
            }
        } );

        if( businessSummary )
        {
            // Industry Sectors
            var data = bidx.utils.getValue( businessSummary, "industry", true );

            if ( data )
            {
                $industrySectors.industries( "populateInEditScreen",  data );
            }

            var logoImage = bidx.utils.getValue( businessSummary, "logo" );

            if ( logoImage && logoImage.document )
            {
                $logoContainer.empty();
                $logoContainer.append( "<img src='"+ logoImage.document +"' />" );
                $logoContainer.addClass( "logoPlaced" ).parent().find( "[href$='#removeLogo']" ).removeClass( "hide" );
            }
        }

        $expertiseNeeded.trigger( "chosen:updated" );
        $countryOperation.trigger( "chosen:updated" );
        $currentAddressCountry.trigger( "chosen:updated" );
    }

    // Try to save to the API
    //
    function _saveEntrepreneur( params )
    {
        var bidxAPIService = "entity.save"
        ,   bidxAPIParams
        ,   dataForEntrpreneurProfile
        ;

        dataForEntrpreneurProfile   =
        {
            bidxMeta:   {
                            bidxEntityType: "bidxEntrepreneurProfile"
                        }
        };

        bidxAPIParams   =
        {
            data:           dataForEntrpreneurProfile
        ,   groupDomain:    bidx.common.groupDomain
        ,   success:        function( response )
            {
                bidx.utils.log( bidxAPIService + "::success::response", response );

                bidx.common.closeNotifications();

                bidx.common.removeAppWithPendingChanges( appName );

                // Finally join the group with clicking a hidden button
                // This is used because it handles the redirection to front page
                
                //$btnJoinGroup.click();
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

    // Logo
    //
    $bsLogoBtn.click( function( e )
    {
        e.preventDefault();

        // Make sure the media app is within our modal container
        //
        $( "#media" ).appendTo( $bsLogoModal.find( ".modal-body" ) );

        var $selectBtn = $bsLogoModal.find( ".btnSelectFile" )
        ,   $cancelBtn = $bsLogoModal.find( ".btnCancelSelectFile" )
        ;

        // Navigate the media app into list mode for selecting files
        //
        bidx.media.navigate(
        {
            requestedState: "list"
        ,   slaveApp      :               true
        ,   selectFile    :             true
        ,   multiSelect   :            false
        ,   showEditBtn   :            false
        ,   onlyImages    :             true
        ,   btnSelect     :              $selectBtn
        ,   btnCancel     :              $cancelBtn
        ,   callbacks     :
            {
                ready:                  function( state )
                {
                    bidx.utils.log( "[logo] ready in state", state );
                }

            ,   cancel:                 function()
                {
                    // Stop selecting files, back to previous stage
                    //
                    $bsLogoModal.modal('hide');
                }

            ,   success:                function( file )
                {
                    bidx.utils.log( "[logo] uploaded", file );

                    // NOOP.. the parent app is not interested in when the file is uploaded
                    // only when it is attached / selected
                }

            ,   select:               function( file )
                {

                    bidx.utils.log( "[logo] selected profile picture", file );

                    $logoContainer.data( "bidxData", file );
                    $logoContainer.html( $( "<img />", { "src": file.document, "data-fileUploadId": file.fileUpload } ));
                    $logoContainer.addClass( "logoPlaced" ).parent().find( "[href$='#removeLogo']" ).removeClass( "hide" );

                    $bsLogoModal.modal( "hide" );
                }
            }
        });

        $bsLogoModal.modal();
    });

    $bsLogoRemoveBtn.click( function( e )
    {
        e.preventDefault();

        $logoContainer.find( "img" ).remove();
        $logoContainer.html( '<div class="icons-rounded"><i class="fa fa-suitcase text-primary-light"></i></div>' );
        $logoContainer.removeClass( "logoPlaced" ).parent().find( "[href$='#removeLogo']" ).addClass( "hide" );

        //businessSummary.logo = null;
    });

    // Setup initial form validation
    // f   =   'contactDetail[0].' + rp;

    function _doValidate()
    {
        // Only allow saving when all the sub forms are valid
        //
        var errorSave
        ,   errorMsg
        ,   anyInvalid = false;

        if( forms )
        {
            $.each( forms, function( name, form )
            {
                
                if ( !form.$el.valid() )
                {
                     anyInvalid = true;
                }
            } );
            if( !anyInvalid )
            {
                $views.filter( ".viewError" ).hide();
            }
        }
    }

    function _setupValidation()
    {
        forms.personalDetails.$el.validate(
        {
            ignore: ".genderRadio input"
        ,   rules:
            {
                "personalDetails.firstName":
                {
                    required:    true
                ,   maxlength:   60
                }
            ,   "personalDetails.lastName":
                {
                    required:    true
                ,   maxlength:   60
                }
            ,   "personalDetails.emailAddress":
                {
                    email:       true
                ,   required:    true
                }
             ,   "personalDetails.linkedIn":
                {
                    linkedIn:    true
                }
            ,   "personalDetails.contactDetail[0].mobile":
                {
                    phone:       true
                ,   minlength:   9
                }
            ,   "personalDetails.contactDetail[0].landline":
                {
                    phone:       true
                ,   minlength:   9
                }
            }
        ,   messages:
            {

            }
        ,   submitHandler:          function( e )
            {
                _doSave();
            }
        ,   onkeyup: function()
            {
                _doValidate()
            }
        } );

        forms.generalOverview.$el.validate(
        {
            ignore:         "#frmeditMedia input, #frmeditMedia select"
        ,   debug:          false
        ,   rules:
            {
                "focusIndustrySector[0]mainSector":
                {
                    required:      true
                }
            ,   "focusIndustrySector[0]subSector":
                {
                    required:      true
                }
            ,   "focusIndustrySector[0]endSector":
                {
                    required:      true
                }
            ,   name:
                {
                    required:               true
                ,   maxlength:              30
                }
            ,   summary:
                {
                    required:               true
                ,   maxlength:              900
                }
            ,   website:
                {
                    urlOptionalProtocol:        true
                }
            /*,   countryOperation:
                {
                    required:      true
                }*/
            ,   stageBusinessDetail:
                {
                    required:     true
                }
            }
        ,   messages:
            {

            }
        ,   submitHandler:          function( e )
            {
                _doSave();
            }
        ,   onkeyup: function()
            {
                _doValidate()
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
        ,   onkeyup: function()
            {
                _doValidate()
            }
        } );  
    }

    // private functions
    //
    function _oneTimeSetup()
    {
        if($affixInfoBar.length)
        {
            $('.info-bar').affix(
            {
                offset:
                {
                    top:    $('.info-bar').offset().top
                }
            });
        }

        _setupValidation();

        $industrySectors.industries();

        $stageBusiness.bidx_chosen(
        {
            dataKey:            "stageBusinessDetail"
        ,   emptyValue:         bidx.i18n.i( "frmSelectFieldRequired" )
        });

        $countryOperation.bidx_chosen(
        {
            dataKey:            "country"
        });

        $expertiseNeeded.bidx_chosen(
        {
            dataKey:            "mentorExpertise"
        });

        $currentAddressCountry.bidx_chosen(
        {
            dataKey:            "country"
        ,   emptyValue:         bidx.i18n.i( "frmSelectFieldRequired" )
        });

        $bsLogoRemoveBtn.click( function( e )
        {
            e.preventDefault();

            $logoContainer.find( "img" ).remove();
            $logoContainer.html( '<div class="icons-rounded"><i class="fa fa-suitcase text-primary-light"></i></div>' );
            $logoContainer.removeClass( "logoPlaced" ).parent().find( "[href$='#removeLogo']" ).addClass( "hide" );

            businessSummary.logo = null;
        } );

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


    }

    // Try to save the businessSummary to the API
    //
    function _doSave()
    {
        // Only allow saving when all the sub forms are valid
        //
        var errorSave
        ,   errorMsg
        ,   anyInvalid = false;

        if( forms )
        {
            bidx.utils.log('forms', forms);
            $.each( forms, function( name, form )
            {
                
                if ( !form.$el.valid() )
                {
                    errorMsg   =     bidx.i18n.i( "errorRequiredFields", appName );
                    bidx.utils.warn( "[ExpressForm] Invalid form", form.$el, form.$el.validate().errorList );
                    _showError( errorMsg );

                    anyInvalid = true;
                }
            } );
        }

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

        errorSave   =   function( jqXhr )
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
        };

        if ( bidxConfig.authenticated === false )
        {
            bidx.utils.log('Not logged in');

            _saveRegisterForm(
            {
                error:  errorSave
            } );
        }
        else
        {
            _save(
            {
                error:  errorSave
                
            } );
        }

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
                    var $input
                    ,   value
                    ,   fp
                    ,   rp
                    ,   country
                    ;

                    if( form === 'personalDetails' )
                    {
                        fp  =   f;

                        rp  =   f;

                        switch (f)
                        {
                            case 'cityTown':
                                f   =   'address[0].cityTown';

                                fp  =   'address.0.cityTown';

                                rp  =   'city';

                            break;

                            case 'country':
                            country = f;

                                f   =   'address[0].country';

                                fp  =   'address.0.country';

                                rp  =   'country';

                            break;

                            case 'mobile':
                            case 'landline':
                                f   =   'contactDetail[0].' + rp;

                                fp  =   'contactDetail.0.' + rp;

                                //rp  =   'mobile';

                            break;
                        }

                        $input = $form.find( "[name='personalDetails." + f + "']" );

                        value  = bidx.utils.getElementValue( $input );

                        if ( bidxConfig.authenticated === false )
                        {
                            bidx.utils.setValue( member, rp, value );
                            //Manual set username to create user first time, backend requirement
                            if( rp === 'emailAddress')
                            {
                                bidx.utils.setValue( member, 'username', value );
                            }
                        }
                        else
                        {
                            bidx.utils.setValue( member, "bidxMemberProfile.personalDetails." + fp, value );
                        }
                    }
                    else
                    {
                        $input = $form.find( "[name^='" + f + "']" );

                        value  = bidx.utils.getElementValue( $input );

                        if( !value && f === 'countryOperation' )
                        {
                            value  = 'IL';
                            bidx.utils.log('I am overwritten with Israel country operations');
                        }

                        bidx.utils.setValue( businessSummary, f, value );
                    }
                } );
            }

            if( form !== 'personalDetails' )
            {
                // Industry Sectors
                var endSectors = $industrySectors.find( "[name*='endSector']" );

                if ( endSectors )
                {
                    var arr = [];
                    $.each( endSectors, function(i, f)
                    {
                        var value   = bidx.utils.getElementValue( $(f) );

                        if ( value )
                        {
                            arr.push( value );
                        }
                    });

                    arr = $.map( arr, function( n )
                    {
                        return n;
                    });

                    bidx.utils.setValue( businessSummary, "industry", arr );
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
                    if ( nest !== "financialSummaries" )
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
            }
        } );

        // Fix the URL fields so they will be prefixed with http:// in case something valid was provided, but not having a protocol
        //
        if ( businessSummary.website )
        {
            businessSummary.website = bidx.utils.prefixUrlWithProtocol( businessSummary.website );
        }

        // Logo
        //
        var logoImageData = $logoContainer.data( "bidxData" );

        if ( logoImageData )
        {
            bidx.utils.setValue( businessSummary, "logo.fileUpload", logoImageData.fileUpload );
        }

    }

    function _saveRegisterForm( params )
    {
        var url
        ,   entities            =   []
        ,   businessEntity      =   {}
        ,   entrepreneurEntity  =   {}
        ,   postData            =   []
        ;

        // Update the business summary object
        //
        _getFormValues();

        // Make sure the entitytype is set correctly, probably only needed for 'create'
        //
        bidx.utils.setValue( businessSummary, "bidxMeta.bidxEntityType", "bidxBusinessSummary" );

        bidx.common.notifySave();

        
        bidx.utils.log( "About to save Member::: ", member );

        // Save the data to the API
        //
        entrepreneurEntity  =   {
                                    entity:    
                                    {
                                        bidxMeta: 
                                        {
                                            bidxEntityType:    "bidxEntrepreneurProfile"
                                        }
                                    }
                                };

        businessEntity      =   {
                                    entity:     businessSummary
                                ,   tags:       [{
                                                tagId:      'mekar'
                                            ,   visibility: "ANYONE"
                                            ,   groupId:    bidx.common.getCurrentGroupId( "currentGroup" )
                                            }]
                                };

        entities.push( entrepreneurEntity, businessEntity );

        postData    =   
        {
            member:     member
        ,   entities:   entities
        }

        bidx.utils.log( "About to Post data to Register::: ", postData ); 

        bidx.api.call(
            "register.register"
        ,   {
                // Undefined when creating the business summary
                //
                groupDomain:            bidx.common.groupDomain
            ,   data:                   postData
            ,   success:        function( response )
                {
                    bidx.utils.log( "businesssummary.save::success::response", response );
                    
                    var businessEntity
                    ,   businessEntityId
                    ,   bidxEntityType
                    ,   responseData    =   bidx.utils.getValue( response, "data" )
                    ,   groupId         =   bidx.common.getCurrentGroupId
                    ;

                    //Joining Group Now
                    //bidx.common.joinGroup( groupId );

                    businessEntity          =   _.find( responseData, function( response )
                                            {
                                                bidxEntityType    =   bidx.utils.getValue( response, 'bidxMeta.bidxEntityType');

                                                return bidxEntityType === 'bidxBusinessSummary';

                                            });

                    businessEntityId    =   bidx.utils.getValue(businessEntity, 'bidxMeta.bidxEntityId' );

                    bidx.common.closeNotifications();

                    bidx.common.removeAppWithPendingChanges( appName );

                    document.location.hash = "thankExpressForm";

                    /*_showModal(
                    {
                        view  : "fblike"
                    ,   callback: function()
                        {
                            bidx.common.notifyRedirect();

                            url = currentLanguage + "/expressform/" + businessEntityId + "?rs=true";

                            document.location.href = url;
                        }
                    } );*/
                }
            ,   error:          function( jqXhr )
                {
                    params.error( jqXhr );

                    bidx.common.closeNotifications();
                }
            }
        );
    }

    // Beware! validation should have been tested, this is just a function for callin the API for saving
    //
    function _save( params )
    {
        var url
        ,   memberData      =   {}
        ,   businessData    =   {}
        ,   entityData      =   []
        ;

        // Update the business summary object
        //
        _getFormValues();

        // Make sure the entitytype is set correctly, probably only needed for 'create'
        //
        bidx.utils.setValue( businessSummary, "bidxMeta.bidxEntityType", "bidxBusinessSummary" );

        bidx.common.notifySave();

        bidx.utils.log( "About to save BusinessSummary::: ", businessSummary );

        bidx.utils.log( "About to save Member::: ", member );

        // Save the data to the API
        //
        memberData      =   {
                                entity:     member.bidxMemberProfile
                            };

        businessData    =   {
                                entity:     businessSummary
                            ,   tags:       [{
                                                tagId:      'mekar'
                                            ,   visibility: "ANYONE"
                                            ,   groupId:    bidx.common.getCurrentGroupId( "currentGroup" )
                                            }]
                            };

        entityData.push( memberData, businessData);

        bidx.api.call(
            "entity.bulk"
        ,   {
                // Undefined when creating the business summary
                //
                businessSummaryId:      businessSummaryId
            ,   groupDomain:            bidx.common.groupDomain
            ,   data:                   entityData
            ,   success:        function( response )
                {
                    bidx.utils.log( "businesssummary.save::success::response", response );
                    
                    var businessEntity
                    ,   businessEntityId
                    ,   bidxEntityType
                    ,   responseData    =   bidx.utils.getValue( response, "data" )
                    ,   groupId         =   bidx.common.getCurrentGroupId
                    ;

                    //Joining Group Now
                    bidx.common.joinGroup( groupId );

                    businessEntity          =   _.find( responseData, function( response )
                                            {
                                                bidxEntityType    =   bidx.utils.getValue( response, 'bidxMeta.bidxEntityType');

                                                return bidxEntityType === 'bidxBusinessSummary';

                                            });

                    businessEntityId    =   bidx.utils.getValue(businessEntity, 'bidxMeta.bidxEntityId' );

                    if( !hasEntrepreneurProfile )    //If its first time & businessSummaryId
                    {
                        _saveEntrepreneur(
                        {
                            error: function( jqXhr )
                            {
                                var response
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


                            }
                        } );
                    }

                    bidx.common.closeNotifications();

                    bidx.common.removeAppWithPendingChanges( appName );

                    _showModal(
                    {
                        view  : "fblike"
                    ,   callback: function()
                        {
                            bidx.common.notifyRedirect();

                            url = currentLanguage + "/expressform/" + businessEntityId + "?rs=true";

                            document.location.href = url;
                        }
                    } );
                }
            ,   error:          function( jqXhr )
                {
                    params.error( jqXhr );

                    bidx.common.closeNotifications();
                }
            }
        );
    }

    // This is the startpoint for the edit state
    //
    function _init( state )
    {
        // Reset any state
        //


        var curYear         = bidx.common.getNow().getFullYear();

        // Inject the save and button into the controls
        //
        $btnSave    = $( "<a />", { "class": "btn btn-secondary", href: "#save"    });
        $btnCancel  = $( "<a />", { "class": "btn btn-secondary", href: "#viewExpressForm"});




        $btnCancel.bind( "click", function( e )
        {
            e.preventDefault();

            if( state === 'edit')
            {
                bidx.common.removeAppWithPendingChanges( appName );

                bidx.controller.updateHash( "#viewExpressForm", true );

                reset();

                bidx.common.removeValidationErrors();

                _showView( "show" );

            }
        } );

        $btnSave.bind( "click", function( e )
        {
            e.preventDefault();

            _doSave();
        } );


        $controlsForEdit.empty();

        if( state === 'create' )
        {
            $btnSave.i18nText( "btnSubmit" ).prepend( $( "<div />", { "class": "fa fa-check fa-above fa-big" } ) );

            $controlsForEdit.append(  $btnSave  );
        }
        else
        {
            $btnSave.i18nText( "btnSubmit" ).prepend( $( "<div />", { "class": "fa fa-check fa-above fa-big" } ) );

            $btnCancel.i18nText( "btnCancel" ).prepend( $( "<div />", { "class": "fa fa-times fa-above fa-big" } ) );

            $controlsForEdit.append( $btnCancel, $btnSave  );
        }

        _showView( "edit" );

        if( state !== 'edit')
        {
            businessSummary     = {};
        }

    }

    //  ################################## MODAL #####################################  \\


    //  show modal view with optionally and ID to be appended to the views buttons
    function _showModal( options )
    {
        var href
        ,   type
        ,   params = {};

       // bidx.utils.log("[mentoringrequest] show modal", options, $modals.filter( bidx.utils.getViewName ( options.view, "modal" )).find( ".bidx-modal") );

        $modal        = $modals.filter( bidx.utils.getViewName ( options.view, "modal" ) ).find( ".bidx-modal");

        $modal.find('.btn-expressform').on( 'click', function(evt)
        {
            var $this = $( this );

            /*if( $this.attr( "data-href") )
            {
                href = $this.attr( "data-href" );

                window.open(href, '_blank');
            }*/

            /*if (options && options.callback)
            {
                options.callback();
            }*/
        });

        if( options.callback )
        {
            //  to prevent duplicate attachments bind event only onces
            $modal.on( 'hidden.bs.modal', options.callback );
        }

        if( options.onShow )
        {

            $modal.on( 'show.bs.modal' ,options.onShow );
        }

         $modal.modal( {} );
    }


    //  closing of modal view state
    var _closeModal = function(options)
    {
        if ($modal)
        {
            if (options && options.unbindHide)
            {
                $modal.unbind('hide');
            }
            $modal.modal('hide');
        }
    };

    // Private functions
    //
    var _showError = function( msg )
    {
        var v   =   'error';
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        $views.filter( ".viewError" ).show();
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

    // ROUTER
    //
    function navigate( options )
    {
        var params  = options.params
        ;

        state   =   options.requestedState;

        if ( options.requestedState !== "edit" )
        {
            $element.removeClass( "edit" );
        }

        bidx.utils.log('options', options);

        if ( state !== "edit" )
        {
            $element.removeClass( "edit" );
        }

        switch ( state )
        {
            case 'landing':

            $affixInfoBar.hide();
            _showView( "show" );

            break;

            case 'thankyou':

            $affixInfoBar.hide();
            bidx.utils.log("I am in thank you");
            _showView( "thankyou" );

            break;
            case 'view':

                bidx.utils.log( "ExpressForm::AppRouter::view" );

                $affixInfoBar.show();

                _showView( "load" );

                if( businessSummaryId )
                {
                    _showView( "show" );
                }
                else
                {
                    bidx.controller.updateHash( "#createExpressForm", true );

                }

            break;

            case "create":

                var curYear         = bidx.common.getNow().getFullYear();

                bidx.utils.log( "ExpressForm::AppRouter::create" );

                _showView( "load" );

                $affixInfoBar.show();

                _init( state );

                if( bidxConfig.authenticated !== false )
                {
                    _populateScreen( );
                }


            break;

            case "edit":

                bidx.utils.log( "ExpressForm::AppRouter::edit" );
                 // Make sure the i18n translations for this app are available before initing
                //
                _showView( "load" );

                $affixInfoBar.show();

                _init( state );

                _populateScreen( );

                $element.addClass( "edit" );

            break;
        }
    }

    // Reset the whole application
    //
    function reset()
    {
        state = null;

        bidx.common.removeAppWithPendingChanges( appName );
    }

    // Initialize handlers
    //
    _oneTimeSetup();

    // Expose
    //
    var app =
    {
        navigate:   navigate
    ,   $element:   $element
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.expressform = app;


    // Only update the hash when user is authenticating and when there is no hash defined
    //
    if ( $( "body.bidx-expressform" ).length )
    {
        var initHash
        ,   bidxHash        =   bidx.utils.getValue( window, "location.hash" )
        ,   allowedHash     =   ['viewExpressForm', 'editExpressForm', 'createExpressForm']
        ;

        if( _.indexOf(allowedHash, bidxHash) === -1 )
        {
            initHash            =   "#createExpressForm";
        }

        if( businessSummary )
        {
           initHash            =   "#viewExpressForm";
        }

       document.location.hash = initHash;
    }

} ( jQuery ));
