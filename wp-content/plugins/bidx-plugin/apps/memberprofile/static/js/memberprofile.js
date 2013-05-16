$( document ).ready( function()
{
    var $element        = $( "#editMember" )
    ,   $controls       = $( ".editControls" )
    ,   $views          = $element.find( ".view" )
    ,   $editForm       = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets       = $element.find( ".snippets" )

    ,   $languageList       = $editForm.find( ".languageList" )
    ,   $btnAddLanguage     = $editForm.find( ".btnAddLanguage" )
    ,   $inputAddLanguage   = $editForm.find( "input[name='addLanguage']" )

    ,   member
    ,   memberId
    ,   groupDomain
    ,   bidx            = window.bidx
    ,   snippets        = {}

    ;

    var $mainStates     = $( ".mainState" )

    ;

    // Form fields
    //
    var fields =
    {
        personalDetails:
        [
            'firstName'
        ,   'lastName'
        ,   'professionalTitle'
        ,   'gender'
        ,   'nationality'

        ,   'dateOfBirth'
        ,   'highestEducation'
        ,   'linkedIn'
        ,   'facebook'
        ,   'emailAddress'
        ,   'skype'
        ,   'twitter'
        ,   'language'
        ,   'motherLanguage'
        ,   'workingLanguage'
        ,   'ratingSpoken'
        ,   'ratingWritten'

        ,   'landline'
        ,   'mobile'
        ,   'fax'
        ]

    ,   address:
        [
            'eTR'
        ,   'street'
        ,   'streetNumber'
        ,   'neighborhood'
        ,   'cityTown'
        ,   'country'
        ,   'postalCode'
        ,   'postBox'
        ,   'coordinates'
        ]

    ,   languageDetail:
        [
            'language'
        ,   'motherLanguage'
        ,   'workingLanguage'
        ,   'ratingSpoken'
        ,   'ratingWritten'
        ]

    ,   contactDetail:
        [
            'landLine'
        ,   'mobile'
        ,   'fax'
        ]
    };


    var languages = [
        {
        key: "sq",
        value: "Albanian"
        },
        {
        key: "ar",
        value: "Arabic"
        },
        {
        key: "be",
        value: "Belarusian"
        },
        {
        key: "bg",
        value: "Bulgarian"
        },
        {
        key: "ca",
        value: "Catalan"
        },
        {
        key: "zh",
        value: "Chinese"
        },
        {
        key: "hr",
        value: "Croatian"
        },
        {
        key: "cs",
        value: "Czech"
        },
        {
        key: "da",
        value: "Danish"
        },
        {
        key: "nl",
        value: "Dutch"
        },
        {
        key: "en",
        value: "English"
        },
        {
        key: "et",
        value: "Estonian"
        },
        {
        key: "fi",
        value: "Finnish"
        },
        {
        key: "fr",
        value: "French"
        },
        {
        key: "de",
        value: "German"
        },
        {
        key: "el",
        value: "Greek"
        },
        {
        key: "iw",
        value: "Hebrew"
        },
        {
        key: "hi",
        value: "Hindi"
        },
        {
        key: "hu",
        value: "Hungarian"
        },
        {
        key: "is",
        value: "Icelandic"
        },
        {
        key: "in",
        value: "Indonesian"
        },
        {
        key: "ga",
        value: "Irish"
        },
        {
        key: "it",
        value: "Italian"
        },
        {
        key: "ja",
        value: "Japanese"
        },
        {
        key: "ko",
        value: "Korean"
        },
        {
        key: "lv",
        value: "Latvian"
        },
        {
        key: "lt",
        value: "Lithuanian"
        },
        {
        key: "mk",
        value: "Macedonian"
        },
        {
        key: "ms",
        value: "Malay"
        },
        {
        key: "mt",
        value: "Maltese"
        },
        {
        key: "no",
        value: "Norwegian"
        },
        {
        key: "pl",
        value: "Polish"
        },
        {
        key: "pt",
        value: "Portuguese"
        },
        {
        key: "ro",
        value: "Romanian"
        },
        {
        key: "ru",
        value: "Russian"
        },
        {
        key: "sr",
        value: "Serbian"
        },
        {
        key: "sk",
        value: "Slovak"
        },
        {
        key: "sl",
        value: "Slovenian"
        },
        {
        key: "es",
        value: "Spanish"
        },
        {
        key: "sv",
        value: "Swedish"
        },
        {
        key: "th",
        value: "Thai"
        },
        {
        key: "tr",
        value: "Turkish"
        },
        {
        key: "uk",
        value: "Ukrainian"
        },
        {
        key: "vi",
        value: "Vietnamese"
        }
    ];

    // Grab the snippets from the DOM
    //
    snippets.$language = $snippets.children( ".languageItem" ).remove();

    // Object for maintaining a list of currently selected languages, for optimizations only
    //
    var addedLanguages = {};

    // Initialize the autocompletes
    //
    $inputAddLanguage.typeahead(
        {
            source:         function( query )
            {
                return _.map( languages, function( language ) { return language.value; } )
            }
        ,   matcher:        function( item )
            {
                if ( addedLanguages[ item ] )
                {
                    return false;
                }

                return true;
            }
        }
    ).removeAttr( "disabled" );

    // Figure out the key of the to be added language
    //
    $btnAddLanguage.click( function( e )
    {
        // Determine if the value is in the list of languages, and if, add it to the list of added languages
        //
        var language        = $inputAddLanguage.val()
        ,   key
        ;

        key = _getLanguageKeyByValue( language );

        if ( key )
        {
            $inputAddLanguage.val( "" );

            addedLanguages[ language ] = true;

            _addLanguageDetailToList( { language: key, motherLanguage: false } );
        }

    } ).removeAttr( "disabled" );

    // Remove the language from the list
    //
    $languageList.delegate( ".btnRemoveLanguage", "click", function( e )
    {
        e.preventDefault();

        var $languageItem   = $( this ).closest( ".languageItem" )
        ,   languageDetail  = $languageItem.data( "languageDetail" )
        ,   languageValue   = _getLanguageValueByKey( languageDetail.language )
        ;

        delete addedLanguages[ languageValue ];

        $languageItem.remove();
    } );

    // Update the languages, and only set the clicked one to be the mother language
    //
    $languageList.delegate( ".btnSetMotherLanguage", "click", function( e )
    {
        e.preventDefault();

        var $btn            = $( this )
        ,   $languageItem   = $btn.closest( ".languageItem" )
        ;

        // Unset motherLanguage on all the languages first
        //
        $languageList.find( ".languageItem" ).each( function()
        {
            var $item           = $( this )
            ,   languageDetail  = $item.data( "languageDetail" )
            ;

            languageDetail.motherLanguage = false;

            $item.data( "languageDetail", languageDetail );

            $item.find( ".btnSetMotherLanguage"     ).show();
            $item.find( ".isCurrentMotherLanguage"  ).hide();
        } );

        // And set the motherLanguage on this item to true
        //
        var languageDetail = $languageItem.data( "languageDetail" );

        languageDetail.motherLanguage = true;
        $languageItem.data( "languageDetail", languageDetail );

        $languageItem.find( ".isCurrentMotherLanguage"  ).show();
        $languageItem.find( ".btnSetMotherLanguage"     ).hide();
    } );

    // Convenience function for translating a language key to it's description
    //
    var _getLanguageValueByKey = function( key )
    {
        var value;

        $.each( languages, function( i, item )
        {
            if ( item.key === key )
            {
                value = item.value;
            }
        } );

        return value;
    };

    // Convenience function for translating a language description to it's key
    //
    var _getLanguageKeyByValue = function( value )
    {
        var key;

        $.each( languages, function( i, item )
        {
            if ( item.value === value )
            {
                key = item.key;
            }
        } );

        return key;
    }

    var _setElementValue = function( $el, value )
    {
        var elType      = $el.attr( 'type' )
        ,   dataType    = $el.attr( 'data-type' )
        ,   dateObj
        ;

        if ( value === true )
        {
            value = "true";
        }
        else if ( value === false )
        {
            value = "false";
        }

        if ( dataType === "date" )
        {
            if ( value )
            {
                dateObj = bidx.utils.parseISODate( value );

                value = dateObj.m + "/" + dateObj.d + "/" + dateObj.y;
                $el.val( value );
            }

        }
        if ( elType )
        {
            switch( elType )
            {
                case 'radio':
                    // bewustte type-coercing for now
                    //
                    if ( $el.val() === value )
                    {
                        $el.prop( 'checked', true );
                    }
                    else
                    {
                        $el.prop( 'checked', false );
                    }
                break;

                case 'checkbox':
                    $el.prop( 'checked', !!value );
                break;

                case 'file':
                break;

                default:
                    $el.val( value || ( value === 0 ? "0" : "" ) );
            }
        }
        else if ( $el.is( 'input' ) || $el.is( 'select' ) || $el.is( 'textarea' ) )
        {
            $el.val( value || ( value === 0 ? '0' : '' ) );
        }
        else
        {
            $el.text( value || ( value === 0 ? '0' : '' ) );
        }
    };

    // Use the retrieved member object to populate the form elements
    //
    var _populateForm = function()
    {
        $.each( fields.personalDetails, function( i, f )
        {
            var $input  = $editForm.find( "[name='personalDetails." + f + "']" )
            ,   value   = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails." + f )
            ;

            $input.each( function()
            {
                _setElementValue( $( this ), value );
            } );
        } );

        // Now the nested objects
        //
        $.each( [ "address", "contactDetail" ], function()
        {
            var nest    = this
            ,   items   = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails." + nest, true )
            ;

            if ( items )
            {
                $.each( items, function( i, item )
                {
                    $.each( fields[ nest ], function( j, f )
                    {
                        var $input  = $editForm.find( "[name='personalDetails." + nest + "[" + i + "]." + f + "']" )
                        ,   value   = bidx.utils.getValue( item, f )
                        ;

                        $input.each( function()
                        {
                            _setElementValue( $( this ), value  );
                        } );
                    } );
                } );
            }
        } );

        // Language is handled specially
        //
        var languageDetail       = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.languageDetail", true );

        if ( languageDetail )
        {
            $.each( languageDetail, function( i, language )
            {
                _addLanguageDetailToList( language );
            } );
        }
    };

    // Add an item to the language list and render the HTML for it
    //
    var _addLanguageDetailToList = function( languageDetail )
    {
        var $language       = snippets.$language.clone()
        ,   languageDescr   = ""
        ;

        languageDescr = _getLanguageValueByKey( languageDetail.language );

        if ( languageDescr )
        {
            addedLanguages[ languageDescr ] = true;
        }

        $language.find( ".languageDescr" ).text( languageDescr );

        if ( languageDetail.motherLanguage )
        {
            $language.find( ".btnSetMotherLanguage" ).hide();
        }
        else
        {
            $language.find( ".isCurrentMotherLanguage" ).hide();
        }

        $language.data( "languageDetail", languageDetail );

        $languageList.append( $language );
    };

    // Convert the form values back into the member object
    //
    var _getFormValues = function()
    {
        var _getElementValue = function( $input )
        {
            var value
            ,   date
            ;

            switch ( $input.attr( 'data-type' ) )
            {
                // We need to get to ISO8601 => yyyy-mm-dd
                //
                case 'date':
                    date    = $input.datepicker( "getDate" );

                    if ( date )
                    {
                        value   = bidx.utils.getISODate( date );
                    }
                break;

                default:
                    switch ( $input.attr( "type" ) )
                    {
                        case "radio":
                            value = $input.filter( ":checked" ).val();
                        break;

                        case "checkbox":
                            value = $input.is( ":checked" ) ? $input.val() : null;
                        break;

                        default:
                            value = $input.val();
                    }
            }


            if ( value === "true" )
            {
                value = true;
            }
            else if ( value === "false" )
            {
                value = false;
            }

            return value;
        };

        $.each( fields.personalDetails, function( i, f )
        {
            var $input  = $editForm.find( "[name='personalDetails." + f + "']" )
            ,   value   = _getElementValue( $input )
            ;

            bidx.utils.setValue( member, "bidxMemberProfile.personalDetails." + f, value );
        } );

        // Collect the nested objects
        //
        $.each( [ "address", "contactDetail" ], function()
        {
            var nest    = this
            ,   i       = 0
            ;

            // TODO: make i itterate

            $.each( fields[ nest ], function( j, f )
            {
                var path    = "personalDetails." + nest + "[" + i + "]." + f
                ,   $input  = $editForm.find( "[name='" + path + "']" )
                ,   value   = _getElementValue( $input )
                ;

                var item = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails." + nest, true );

                // When undefined, leave it untouched for now...
                //
                if ( item )
                {
                    if ( !item[ i ] )
                    {
                        item[ i ] = {};
                    }

                    bidx.utils.setValue( item[ i ], f, value );
                }
            } );
        } );

        // Language Detail is handled specially
        //
        var languageDetail = [];

        $languageList.find( ".languageItem" ).each( function()
        {
            var $languageItem   = $( this )
            ,   data            = $languageItem.data( "languageDetail" )
            ;

            languageDetail.push( data );
        } );

        // This is a hack to handle the situation where we need to pad the languageDetail array to 'remove' items if we end up
        // PUT'ing a shorter list than we got we need to pad it up to original length
        //
        // var currentLanguageDetail           = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.languageDetail", true )
        // ,   originalLanguageDetailLength    = 0
        // ;

        // if ( currentLanguageDetail )
        // {
        //     originalLanguageDetailLength = currentLanguageDetail.length;
        // }

        // while ( languageDetail.length < originalLanguageDetailLength )
        // {
        //     languageDetail.push( {} );
        // }

        bidx.utils.setValue( member, "bidxMemberProfile.personalDetails.languageDetail", languageDetail );
    };

    // This is the startpoint
    //
    var _init = function()
    {
        // Reset any state
        //
        $controls.empty();
        addedLanguages = [];
        $languageList.empty();

        // Inject the save and button into the controls
        //
        var $btnSave    = $( "<a />", { class: "btn btn-primary", href: "#save",   disabled: "true" } )
        ,   $btnCancel  = $( "<a />", { class: "btn btn-primary", href: "#cancel", disabled: "true" } )
        ;

        $btnSave.text( "Save profile" );
        $btnCancel.text( "Cancel" );

        $controls.append( $btnSave );
        $controls.append( $btnCancel );

        // Wire the submit button which can be anywhere in the DOM
        //
        $btnSave.click( function( e )
        {
            e.preventDefault();

            $editForm.submit();
        } );

        // Setup form
        //
        $editForm.form(
        {
            errorClass:     'error'
        ,   enablePlugins:  [ 'date', 'fileUpload' ]
        } );

        $editForm.submit( function( e )
        {
            e.preventDefault();

            if ( $btnSave.prop( "disabled" ))
            {
                return;
            }

            $btnSave.prop( "disabled", true );
            $btnCancel.prop( "disabled", true );

            _save(
            {
                error: function()
                {
                    alert( "Something went wrong during save" );

                    $btnSave.removeAttr( "disabled" );
                    $btnCancel.removeAttr( "disabled" );
                }
            } );
        } );

        // Attachments
        //
        var tplAttachment = $element.find( "#template_attachment" ).html().replace( /(<!--)|(-->)/ig, "" )
        ,   $attachments  = $element.find( "fieldset[name=attachments] > .group" )
        ;

        $attachments.append( tplAttachment );
        $attachments.find( ".add" ).on( "click", addSet );

        function addSet( e )
        {
            e.preventDefault();

            var $btnAdd = $( this );
            $btnAdd.after( tplAttachment );
            $btnAdd.remove();

            $attachments.find( ".add" ).on( "click", addSet );
        }

        // Fetch the member
        //
        bidx.api.call(
            "member.fetch"
        ,   {
                memberId:       memberId
            ,   groupDomain:    groupDomain
            ,   success:        function( response )
                {
                    member = response;

                    bidx.utils.log( "bidx::member", member );

                    _populateForm();

                    $btnSave.removeAttr( "disabled" );
                    $btnCancel.removeAttr( "disabled" );

                    _showView( "edit" );
                }
            ,   error:          function( jqXhr, textStatus )
                {
                    var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                    _showError( "Something went wrong while retrieving the member: " + status );
                }
            }
        );
    };

    // Try to save the member to the API
    //
    var _save = function( params )
    {
        if ( !member )
        {
            return;
        }

        // Remove profile picture
        //
        if ( bidx.utils.getValue( member, "member.bidxMemberProfile.personalDetails.profilePicture" ) )
        {
            delete member.bidxMemberProfile.personalDetails.profilePicture;
        }

        // Force current (0) set to be the current one
        //
        var contactDetail = bidx.utils.getValue( member, "member.bidxMemberProfile.personalDetails.contactDetail", true );

        if ( contactDetail && contactDetail.length )
        {
            member.personalDetails.contactDetail = [
            {
                "currentContactDetails": true
            }];
        }

        // Update the member object
        //
        _getFormValues();

        bidx.api.call(
            "member.save"
        ,   {
                memberId:       memberId
            ,   groupDomain:    groupDomain
            ,   data:           member
            ,   success:        function( response )
                {
                    bidx.utils.log( "member.save::success::response", response );

                    var url = document.location.href.split( "#" ).shift();

                    document.location.href = url;
                }
            ,   error:          function( jqXhr )
                {
                    params.error( jqXhr );
                }
            }
        );
    };

    // Private functions
    //
    function _showError( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    }

    function _showView( v )
    {
        $views.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();
    }

    function _showMainState( s )
    {
        $mainStates.hide().filter( ".mainState" + s.charAt( 0 ).toUpperCase() + s.substr( 1 ) ).show();
    }

    // ROUTER
    //
    var state;

    // Router for main state
    //
    var AppRouter = Backbone.Router.extend(
    {
        routes: {
            'editMember(/:id)(/:section)':    'edit'
        ,   'cancel':                       'show'
        ,   '*path':                        'show'
        }
    ,   edit:           function( id, section )
        {
            bidx.utils.log( "EditMember::AppRouter::edit", id, section );

            _showMainState( "editMember" );

            groupDomain = bidx.utils.getQueryParameter( "bidxGroupDomain" ) || bidx.utils.getValue( bidxConfig, "context.bidxGroupDomain" ) || bidx.utils.getGroupDomain();

            var newMemberId
            ,   splatItems
            ,   updateHash      = false
            ,   isId            = ( id && id.match( /^\d+$/ ) )
            ;

            if ( id && !isId )
            {
                section = id;
                id      = memberId;

                updateHash = true;
            }

            // No memberId set yet and not one explicitly provided? Use the one from the session
            //
            if ( !memberId && !isId )
            {
                id = bidx.utils.getValue( bidxConfig, "session.id" );

                updateHash = true;
            }

            if ( updateHash )
            {
                var hash = "editMember/" + id;

                if ( section )
                {
                     hash += "/" + section;
                }

                this.navigate( hash );
            }

            if ( state === "edit" && id === memberId )
            {
                return;
            }

            memberId = id;
            state = "edit";

            $element.show();
            _showView( "load" );

            _init();

            // Update the navigational links
            //
        }
    ,   show:           function( section )
        {
            bidx.utils.log( "EditMember::AppRouter::show", section );

            if ( state === "show" )
            {
                return;
            }

            state = "show";

            $element.hide();

            _showMainState( "show" );

            $controls.empty();
        }
    } );

    var router = new AppRouter();
    Backbone.history.start();

    // Expose
    //
    var memberprofile =
    {
        // START DEV API
        //

        // END DEV API
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.memberprofile = memberprofile;
} );
