( function( $ )
{
    var $element                    = $( "#editEntrepreneur" )
    ,   $views                      = $element.find( ".view" )
    ,   $editForm                   = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets                   = $element.find( ".snippets" )

    ,   $hideOnCreate                   = $element.find( ".hideOnCreate" )

    ,   $attachmentsContainer       = $editForm.find( ".attachmentsContainer" )
    ,   $cvContainer                = $editForm.find( ".cvContainer" )

    ,   $btnAddPreviousBusiness     = $editForm.find( "[href$='#addPreviousBusiness']" )
    ,   $previousBusinessContainer  = $editForm.find( ".previousBusinessContainer" )

    ,   $toggles                    = $element.find( ".toggle" ).hide()
    ,   $togglePrevRunBusiness      = $element.find( "[name='prevRunBusiness']"      )


        // Since the data is coming from the member API, let's call the variable 'member'
        //
    ,   member
    ,   memberId
    ,   entrepreneurProfileId
    ,   bidx            = window.bidx
    ,   snippets        = {}
    ;

    // Form fields
    //
    var fields =
    {
        _root:
        [
            "summary"
        ,   "focusIndustry"
        ,   "prevRunBusiness"
        ]

    ,   previousBusiness:
        [
            "company"
        ,   "businessOutcome"
        ,   "webSite"
        ]

    ,   attachment:
        [
            "purpose"
        ,   "documentType"
        ]
    };


    // Grab the snippets from the DOM
    //
    snippets.$attachment        = $snippets.children( ".attachmentItem"         ).remove();
    snippets.$previousBusiness  = $snippets.children( ".previousBusinessItem"   ).remove();

    bidx.data.getItem( "businessOutcome", function( err, businessOutcomes )
    {
        var $businessOutcome = snippets.$previousBusiness.find( "[name='businessOutcome']" );
        $businessOutcome.append( $( "<option value='' />" ).text( "Select the outcome of this business" ));

        bidx.utils.populateDropdown( $businessOutcome, businessOutcomes );
    } );

    bidx.data.getItem( "documentType", function( err, documentTypes )
    {
        var $documentType = snippets.$attachment.find( "[name='documentType']" );
        $documentType.append( $( "<option value='' />" ).text( "Select the type" ));

        bidx.utils.populateDropdown( $documentType, documentTypes );
    } );

    // Disable disabled links
    //
    $element.delegate( "a.disabled", "click", function( e )
    {
        e.preventDefault();
    } );

    // Instantiate reflowrower on the previousbusiness container
    //
    $previousBusinessContainer.reflowrower();

    // Update the UI to show the input / previous run business'
    //
    $togglePrevRunBusiness.change( function()
    {
        var value   = $togglePrevRunBusiness.filter( "[checked]" ).val()
        ,   fn      = value === "true" ? "show" : "hide"
        ;

        $toggles.filter( ".togglePrevRunBusiness" )[ fn ]();
    } );

    // Add the snippet for another run business
    //
    var _addPreviousBusiness = function( index, previousBusiness )
    {
        if ( !index )
        {
            index = $previousBusinessContainer.find( ".previousBusinessItem" ).length;
        }

        var $previousBusiness = snippets.$previousBusiness.clone()
        ,   inputNamePrefix = "previousBusiness[" + index + "]"
        ;

        // Update all the input elements and prefix the names with the right index
        // So <input name="bla" /> from the snippet becomes <input name="foo[2].bla" />
        //
        $previousBusiness.find( "input, select, textarea" ).each( function( )
        {
            var $input = $( this );

            $input.prop( "name", inputNamePrefix + "." + $input.prop( "name" ) );
        } );

        if ( previousBusiness )
        {
            $.each( fields.previousBusiness, function( j, f )
            {
                var $input  = $previousBusiness.find( "[name='" + inputNamePrefix + "." + f + "']" )
                ,   value   = bidx.utils.getValue( previousBusiness, f )
                ;

                $input.each( function()
                {
                    bidx.utils.setElementValue( $( this ), value  );
                } );
            } );
        }

        $previousBusinessContainer.reflowrower( "addItem", $previousBusiness );
    };

    // Add an empty previous business block
    //
    $btnAddPreviousBusiness.click( function( e )
    {
        e.preventDefault();

        _addPreviousBusiness();
    } );

    // Instantiate reflowrower on the attachments container
    //
    $attachmentsContainer.reflowrower(
    {
        itemsPerRow:        3
    ,   removeItemOverride: function( $item, cb )
        {
            var attachment      = $item.data( "attachment" )
            ,   documentId      = attachment.bidxEntityId
            ;

            bidx.api.call(
                "entityDocument.destroy"
            ,   {
                    entityId:           entrepreneurProfileId
                ,   documentId:         documentId
                ,   groupDomain:        bidx.common.groupDomain
                ,   success:            function( response )
                    {
                        bidx.utils.log( "bidx::entityDocument::destroy::success", response );
                        bidx.common.notifySuccess( "Attachment deleted" );

                        cb();

                        $attachmentsContainer.reflowrower( "removeItem", $item, true );
                    }
                ,   error:            function( jqXhr, textStatus )
                    {
                        bidx.utils.log( "bidx::entityDocument::destroy::error", jqXhr, textStatus );

                        alert( "Problems deleting attachment" );

                        cb();
                    }
                }
            );
        }
    } );


    // Add the CV to the screen (or show the 'there is no cv')
    //
    var _addCVToScreen = function( attachment )
    {
        var $hasCV              = $cvContainer.find( ".hasCV" )
        ,   $noCV               = $cvContainer.find( ".noCV" )
        ,   uploadedDateTime
        ,   imageSrc
        ;

        if ( !attachment )
        {
            $hasCV.hide();
            $noCV.show();
        }
        else
        {
            uploadedDateTime    = bidx.utils.parseTimestampToDateStr( attachment.uploadedDateTime );

            $hasCV.find( ".documentName"       ).text( attachment.documentName );
            $hasCV.find( ".uploadedDateTime"   ).text( uploadedDateTime );

            $hasCV.find( ".documentLink" ).attr( "href", attachment.document );

            $hasCV.show();
            $noCV.hide();
        }
    };

    // Add the attachment to the screen, by cloning the snippet and populating it
    //
    var _addAttachmentToScreen = function( index, attachment )
    {
        if ( !attachment )
        {
            bidx.util.warn( "entrepreneurprofile::_addAttachmentToScreen: attachment is null!" );
            return;
        }

        if ( !index )
        {
            index = $attachmentsContainer.find( ".attachmentItem" ).length;
        }

        var $attachment         = snippets.$attachment.clone()
        ,   uploadedDateTime    = bidx.utils.parseTimestampToDateStr( attachment.uploadedDateTime )
        ,   inputNamePrefix     = "attachment[" + index + "]"
        ,   imageSrc
        ;

        // Update all the input elements and prefix the names with the right index
        // So <input name="bla" /> from the snippet becomes <input name="foo[2].bla" />
        //
        $attachment.find( "input, select, textarea" ).each( function( )
        {
            var $input = $( this );

            $input.prop( "name", inputNamePrefix + "." + $input.prop( "name" ) );
        } );

        $attachment.data( "attachment", attachment );

        $attachment.find( ".documentName"       ).text( attachment.documentName );
        $attachment.find( ".uploadedDateTime"   ).text( uploadedDateTime );

        var $purpose       = $attachment.find( "[name$='.purpose']" )
        ,   $documentType  = $attachment.find( "[name$='.documentType']" )
        ;

        bidx.utils.setElementValue( $purpose,       attachment.purpose );
        bidx.utils.setElementValue( $documentType,  attachment.documentType );

        imageSrc =  attachment.mimeType.match( /^image/ )
            ? attachment.document
            : "/wp-content/plugins/bidx-plugin/static/img/iconViewDocument.png";

        $attachment.find( ".documentImage" ).attr( "src", imageSrc );
        $attachment.find( ".documentLink"  ).attr( "href", attachment.document );

        $attachmentsContainer.reflowrower( "addItem", $attachment );
    };


    // Use the retrieved member object to populate the form and other screen elements
    //
    var _populateScreen = function()
    {
        // Start by setting the toggles false, will switch to true if needed
        //
        $togglePrevRunBusiness.filter( "[value='false']" ).prop( "checked", true );

        $.each( fields._root, function( i, f )
        {
            var $input  = $editForm.find( "[name='" + f + "']" )
            ,   value   = bidx.utils.getValue( member, "bidxEntrepreneurProfile." + f )
            ;

            $input.each( function()
            {
                bidx.utils.setElementValue( $( this ), value );
            } );
        } );

        // Setup the hidden fields used in the file upload
        //
        $editForm.find( "[name='domain']"                   ).val( bidx.common.groupDomain );
        $editForm.find( "[name='entrepreneurProfileId']"    ).val( entrepreneurProfileId );

        // Now the nested objects
        //
        var previousBusiness = bidx.utils.getValue( member, "bidxEntrepreneurProfile.previousBusiness", true );

        if ( previousBusiness )
        {
            $.each( previousBusiness, function( i, item )
            {
                _addPreviousBusiness( i, item );
            } );
        }

        _addCVToScreen( bidx.utils.getValue( member, "bidxEntrepreneurProfile.cv" ) );

        // Attachments
        //
        var attachments         = bidx.utils.getValue( member, "bidxEntrepreneurProfile.attachment", true );

        if ( attachments)
        {
            $.each( attachments, function( idx, attachment )
            {
                bidx.utils.log( "attachment", attachment );
                _addAttachmentToScreen( idx, attachment );
            } );
        }

        // Fire of the toggle controls so the UI get's updated to it's current values
        //
        $togglePrevRunBusiness.trigger( "change" );

        if ( $.isFunction( $togglePrevRunBusiness.radio ))
        {
            $togglePrevRunBusiness.filter( ":checked" ).radio( "setState" );
        }
    };


    // Convert the form values back into the member object
    //
    var _getFormValues = function()
    {
        $.each( fields._root, function( i, f )
        {
            var $input  = $editForm.find( "[name='" + f + "']" )
            ,   value   = bidx.utils.getElementValue( $input )
            ;

            bidx.utils.setValue( member, "bidxEntrepreneurProfile." + f, value );
        } );

        // Collect the nested objects
        // !! only written to handle nested objects that are arrays !!
        //
        $.each( [ "previousBusiness", "attachment" ], function()
        {
            var nest        = this
            ,   i           = 0
            ,   count       = $editForm.find( "." + nest + "Item" ).length
            ,   memberPath  = "bidxEntrepreneurProfile." + nest
            ,   item        = bidx.utils.getValue( member, memberPath, true )
            ;

            // Property not existing? Add it as an empty array holding an empty object
            //
            if ( !item )
            {
                item = [ {} ];
                bidx.utils.setValue( member, memberPath, item );
            }

            for ( i = 0; i < count; i++ )
            {
                if ( !item[ i ] )
                {
                    item[ i ] = {};
                }

                $.each( fields[ nest ], function( j, f )
                {
                    var inputPath   = nest + "[" + i + "]." + f
                    ,   $input      = $editForm.find( "[name='" + inputPath + "']" )
                    ,   value       = bidx.utils.getElementValue( $input )
                    ;

                    bidx.utils.setValue( item[ i ], f, value );
                } );
            }
        } );
    };

    // This is the startpoint
    //
    var _init = function()
    {
        // Reset any state
        //
        $previousBusinessContainer.reflowrower( "empty" );
        $attachmentsContainer.reflowrower( "empty" );
        $cvContainer.find( ".noCV"  ).hide();
        $cvContainer.find( ".hasCV" ).hide();



        // Inject the save and button into the controls
        //
        var $btnSave    = $( "<a />", { class: "btn btn-primary disabled", href: "#save"    })
        ,   $btnCancel  = $( "<a />", { class: "btn btn-primary disabled", href: "#cancel"  })
        ;

        $btnSave.text( "Save profile" );
        $btnCancel.text( "Cancel" );

        bidx.controller.addControlButtons( [ $btnSave, $btnCancel ] );

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
        ,   enablePlugins:  [ 'fileUpload' ]
        } );

        $editForm.submit( function( e )
        {
            e.preventDefault();

            var valid = $editForm.form( "validateForm" );

            if ( !valid || $btnSave.hasClass( "disabled" ) )
            {
                return;
            }

            $btnSave.addClass( "disabled" );
            $btnCancel.addClass( "disabled" );

            _save(
            {
                error: function()
                {
                    alert( "Something went wrong during save" );

                    $btnSave.removeClass( "disabled" );
                    $btnCancel.removeClass( "disabled" );
                }
            } );
        } );

        if ( state === "create" )
        {
            member =
            {
                bidxEntrepreneurProfile: {}
            };

            $hideOnCreate.hide();

            // Make sure all the components are brought to live
            //
            _populateScreen();

            $btnSave.removeClass( "disabled" );
            $btnCancel.removeClass( "disabled" );

            _showView( "edit" );
        }
        else if ( state === "edit" )
        {
            $hideOnCreate.show();

            // Fetch the member
            //
            bidx.api.call(
                "member.fetch"
            ,   {
                    memberId:       memberId
                ,   groupDomain:    bidx.common.groupDomain
                ,   success:        function( response )
                    {
                        member = response;

                        // Set the global (for this app) entrepeneurProfileId for convenience reasons
                        //
                        entrepreneurProfileId = bidx.utils.getValue( member, "bidxEntrepreneurProfile.bidxEntityId" );

                        bidx.utils.log( "bidx::member", member );

                        _populateScreen();

                        $btnSave.removeClass( "disabled" );
                        $btnCancel.removeClass( "disabled" );

                        _showView( "edit" );

                    }
                ,   error:          function( jqXhr, textStatus )
                    {
                        var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                        _showError( "Something went wrong while retrieving the member: " + status );
                    }
                }
            );
        }
    };

    // Try to save the member to the API
    //
    var _save = function( params )
    {
        if ( !member )
        {
            return;
        }

        // Inform the API we are updating the member profile
        //
        member.bidxEntityType                           = "bidxEntrepreneurProfile";
        member.bidxEntrepreneurProfile.bidxEntityType   = "bidxEntrepreneurProfile";

        // Update the member object
        //
        _getFormValues();

        bidx.utils.log( "about to save member", member );

        var bidxAPIService
        ,   bidxAPIParams   =
            {
                data:           member.bidxEntrepreneurProfile
            ,   groupDomain:    bidx.common.groupDomain
            ,   success:        function( response )
                {
                    bidx.utils.log( bidxAPIService + "::success::response", response );

                    bidx.common.notifyRedirect();

                    var url = document.location.href.split( "#" ).shift();

                    // Maybe rs=true was already added, or not 'true' add it before reloading
                    //
                    var rs = bidx.utils.getQueryParameter( "rs", url );

                    if ( !rs || rs !== "true" )
                    {
                        url += ( url.indexOf( "?" ) === -1 ) ? "?" : "&";
                        url += "rs=true";
                    }

                    document.location.href = url;
                }
            ,   error:          function( jqXhr, textStatus )
                {
                    params.error( jqXhr );
                }
            };

        if ( state === "create" )
        {
            bidxAPIService          = "entity.save";
        }
        else
        {
            bidxAPIService          = "member.save";
            bidxAPIParams.memberId  = memberId;
        }

        // Call that service!
        //
        bidx.api.call(
            bidxAPIService
        ,   bidxAPIParams
        );
    };

    // Private functions
    //
    var _showError = function( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    };

    var _showView = function( v )
    {
        $views.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();
    };

    // ROUTER
    //
    var state;


    var navigate = function( requestedState, section, id, cb )
    {
        switch ( requestedState )
        {
            case "edit":
                bidx.utils.log( "EditEntrepreneur::AppRouter::edit", id, section );

                var updateHash      = false
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

                if ( !( state === "edit" && id === memberId ) )
                {
                    memberId                = id;
                    entrepreneurProfileId   = null;
                    state                   = "edit";

                    $element.show();
                    _showView( "load" );

                    _init();
                }

                if ( updateHash )
                {
                    var hash = "editMember/" + id;

                    if ( section )
                    {
                         hash += "/" + section;
                    }

                    return hash;
                }

            break;

            case "create":
                bidx.utils.log( "EditEntrepreneur::AppRouter::create" );

                // Protect against 'double creation' it is only allowed to have
                // one investor profile
                //
                if ( bidx.controller.getEntrepreneurProfileId() )
                {
                    return navigate( "edit" );
                }
                else
                {
                    memberId    = null;
                    state       = "create";

                    $element.show();

                    // Create the investor profile by doing a POST
                    // We *need* this for the fileupload to work
                    //
                    _showView( "load" );

                    _init();
                }

            break;


        }
    };


    // function called by file upload plugin when attachment upload is done
    //
    var attachmentUploadDone = function( err, result )
    {
        bidx.utils.log( "attachmentUploadDone", err, result );

        if ( err )
        {
            alert( "Problem uploading attachment" );
        }
        else
        {
            bidx.common.notifySuccess( "Attachment upload done" );

            _addAttachmentToScreen( null, result.data );
        }
    };

    // function called by file upload plugin when cv upload is done
    //
    var cvUploadDone = function( err, result )
    {
        bidx.utils.log( "cvUploadDone", err, result );

        if ( err )
        {
            alert( "Problem uploading attachment" );
        }
        else
        {
            _addCVToScreen( result.data );
        }
    };

    var reset = function()
    {
        state = null;
    };

    // Expose
    //
    var entrepreneurprofile =
    {
        attachmentUploadDone:       attachmentUploadDone
    ,   cvUploadDone:               cvUploadDone
    ,   navigate:                   navigate
    ,   reset:                      reset

    ,   $element:                   $element

        // START DEV API
        //

        // END DEV API
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.entrepreneurprofile = entrepreneurprofile;
} ( jQuery ));
