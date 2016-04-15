/* global bidx */
;( function( $ )
{
    "use strict";

    var $element                    = $( "#editEntrepreneur" )
    ,   $views                      = $element.find( ".view" )
    ,   $editForm                   = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets                   = $element.find( ".snippets" )

    ,   $btnSave
    ,   $btnCancel
    ,   $btnDeleteItem              = $( ".deleteEntityItem" )

    ,   $hideOnCreate               = $element.find( ".hideOnCreate" )

    ,   $btnAddPreviousBusiness     = $editForm.find( "[href$='#addPreviousBusiness']" )
    ,   $previousBusinessContainer  = $editForm.find( ".previousBusinessContainer" )

    ,   $fakecrop                   = $views.find( ".js-fakecrop img" )

    // ,   $focusIndustry              = $element.find( "[name='focusIndustry']" )

    ,   $toggles                    = $element.find( ".toggle" ).hide()
    ,   $togglePrevRunBusiness      = $element.find( "[name='prevRunBusiness']"      )

        // CV
        //
    ,   $cvControl                  = $editForm.find( ".cvControl" )
    ,   $cvContainer                = $cvControl.find( ".cvContainer" )
    ,   $cvControlGroup             = $cvContainer.find( ".form-group" )
    ,   $btnChangeCv                = $cvControl.find( "a[href$='changeCv']" )
    ,   $changeCvModal              = $cvControl.find( ".changeCvModal" )

        // Attachnents
        //
    ,   $attachmentsControl         = $editForm.find( ".attachmentsControl" )
    ,   $attachmentsContainer       = $attachmentsControl.find( ".attachmentsContainer" )
    ,   $btnAddAttachments          = $attachmentsControl.find( ".js-btn-add-attachments")
    ,   $addAttachmentsModal        = $( "#otherDocumentsModal" )

        // Industy Sectors
        //
    ,   $industrySectors         = $editForm.find( ".industrySectors" )

        // Since the data is coming from the member API, let's call the variable 'member'
        //
    ,   member
    ,   memberId
    ,   entrepreneurProfileId

    ,   state
    ,   currentView

    ,   snippets                    = {}

    ,   appName                     = "member"

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
    };

    // Setup function for doing work that should only be done once
    //
    function _oneTimeSetup()
    {
        _snippets();
        _previousBusiness();
        _cv();
        _attachments();

        // On any changes, how little doesn't matter, notify that we have a pending change
        // But no need to track the changes when doing a member data load
        //
        $editForm.bind( "change", function()
        {
            if ( currentView === "edit" )
            {
                bidx.common.addAppWithPendingChanges( appName );
            }
        } );

        // Disable disabled links
        //
        $element.delegate( "a.disabled", "click", function( e )
        {
            e.preventDefault();
        } );

        $btnDeleteItem.bind( "click", function( e )
        {
            e.preventDefault();

            var el          = $(this)
            ,   item        = el.parents( ".card-entityid" )
            ,   entityId    = item.data( "entityid" )
            ;

            bidx.common.notifyConfirm(
            {
                msg:        bidx.i18n.i( "itemDeletion" )
            ,   entityId:   entityId
            });

        } );

        // Populate the dropdowns with the values
        //
        // $focusIndustry.bidx_chosen(
        // {
        //     dataKey:            "industry"
        // });

        bidx.data.getContext( "businessOutcome", function( err, businessOutcomes )
        {
            var $businessOutcome    = snippets.$previousBusiness.find( "[name='businessOutcome']" )
            ,   $noValue            = $( "<option value='' />" )
            ;

            $noValue.i18nText( "selectOutcomeBusiness", appName );

            $businessOutcome.append( $noValue );

            bidx.utils.populateDropdown( $businessOutcome, businessOutcomes );
        } );

        // Run the industry widget on the selector
        //
        $industrySectors.industries();

        // Grab the snippets from the DOM
        //
        function _snippets()
        {
            snippets.$attachment        = $snippets.children( ".attachmentItem"       ).remove();
            snippets.$previousBusiness  = $snippets.children( ".previousBusinessItem" ).remove();
        }

        // Initialize previous business
        //
        function _previousBusiness()
        {
            // Instantiate reflowrower on the previousbusiness container
            //
            $previousBusinessContainer.reflowrower();

            // Update the UI to show the input / previous run business'
            //
            $togglePrevRunBusiness.change( function()
            {
                var value   = $togglePrevRunBusiness.filter( ":checked" ).val()
                ,   fn      = value === "true" ? "show" : "hide"
                ;

                $toggles.filter( ".togglePrevRunBusiness" )[ fn ]();
            } );

            // Add an empty previous business block
            //
            $btnAddPreviousBusiness.click( function( e )
            {
                e.preventDefault();

                _addPreviousBusiness();
            } );
        }

        // Initialize CV attachment controls
        //
        function _cv()
        {
            $btnChangeCv.click( function( e )
            {
                e.preventDefault();

                // Make sure the media app is within our modal container
                //
                $( "#media" ).appendTo( $changeCvModal.find( ".modal-body" ) );

                var $selectBtn = $changeCvModal.find(".btnSelectFile")
                ,   $cancelBtn = $changeCvModal.find(".btnCancelSelectFile");

                // Navigate the media app into list mode for selecting files
                //
                bidx.media.navigate(
                {
                    requestedState:         "list"
                ,   slaveApp:               true
                ,   selectFile:             true
                ,   multiSelect:            false
                ,   showEditBtn:            false
                ,   onlyImages:             false
                ,   btnSelect:              $selectBtn
                ,   btnCancel:              $cancelBtn
                ,   callbacks:
                    {
                        ready:                  function( state )
                        {
                            bidx.utils.log( "[entrepreneurprofile] ready in state", state );
                        }

                    ,   cancel:                 function()
                        {
                            // Stop selecting files, back to previous stage
                            //
                            $changeCvModal.modal('hide');
                        }

                    ,   success:                function( file )
                        {
                            bidx.utils.log( "[entrepreneurprofile] uploaded", file );

                            // NOOP.. the parent app is not interested in when the file is uploaded
                            // only when it is attached / selected
                        }

                    ,   select:               function( file )
                        {
                            bidx.utils.log( "[entrepreneurprofile] selected cv", file );

                            _addCv( file );

                            $changeCvModal.modal( "hide" );
                        }
                    }
                } );

                $changeCvModal.modal();
            } );
        }

        // Initialize attachments
        //
        function _attachments()
        {
            // Clicking the add files button will load the media library
            //
            $btnAddAttachments.click( function( e )
            {
                e.preventDefault();

                // Make sure the media app is within our modal
                //
                $( "#media" ).appendTo( $( "#otherDocumentsModal .modal-body" ) );

                var $selectBtn = $( "#otherDocumentsModal" ).find( ".btnSelectFile" );
                var $cancelBtn = $( "#otherDocumentsModal" ).find( ".btnCancelSelectFile" );

                // Navigate the media app into list mode for selecting files
                //
                bidx.media.navigate(
                {
                    requestedState:         "list"
                ,   slaveApp:               true
                ,   selectFile:             true
                ,   multiSelect:            true
                ,   showEditBtn:            false
                ,   onlyImages:             false
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
                            $addAttachmentsModal.modal('hide');
                        }

                    ,   success:                function( file )
                        {
                            bidx.utils.log( "[attachments] uploaded", file );

                            // NOOP.. the parent app is not interested in when the file is uploaded
                            // only when it is attached / selected
                        }

                    ,   select:               function( files )
                        {
                            bidx.utils.log( "[attachments] select", files );

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

                            $( "#otherDocumentsModal" ).modal('hide');
                        }
                    }
                } );
            } );

            // Instantiate reflowrower on the attachments container
            //
            $attachmentsContainer.reflowrower(
            {
                itemsPerRow:        2
            ,   itemClass:          "attachmentItem"
            } );

            $fakecrop.fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
        }
    }

    // Add the snippet for another run business
    //
    function _addPreviousBusiness( index, previousBusiness )
    {
        if ( !index )
        {
            index = $previousBusinessContainer.find( ".previousBusinessItem" ).length;
        }

        var $previousBusiness = snippets.$previousBusiness.clone()
        ,   inputNamePrefix = "previousBusiness[" + index + "]"
        ;

        if ( previousBusiness )
        {
            $.each( fields.previousBusiness, function( j, f )
            {
                var $input  = $previousBusiness.find( "[name='" + f + "']" )
                ,   value   = bidx.utils.getValue( previousBusiness, f )
                ;

                $input.each( function()
                {
                    bidx.utils.setElementValue( $( this ), value  );
                } );
            } );
            $previousBusiness.find( "[name='businessOutcome']" ).trigger( "chosen:updated" );
        }

        // Store the whole object in the DOM so we can later merge it with the changed values
        //
        $previousBusiness.data( "bidxData", previousBusiness );

        // Add it to the DOM
        //
        $previousBusinessContainer.reflowrower( "addItem", $previousBusiness );

        // Update all the input elements and prefix the names with the right index
        // So <input name="bla" /> from the snippet becomes <input name="foo[2].bla" />
        //
        $previousBusiness.find( "input, select, textarea" ).each( function( )
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
                case "company":
                    $input.rules( "add",
                    {
                        required:               true
                    } );
                break;
                case "businessOutcome":

                    // Chosen Dropdown
                    //
                    $input.chosen(
                    {
                        "search_contains":              true
                    ,   "disable_search_threshold":     10
                    ,   "width":                        "100%"
                    } );

                    $input.rules( "add",
                    {
                        required:               true
                    } );
                break;
                case "webSite":
                    $input.rules( "add",
                    {
                        urlOptionalProtocol:        true
                    } );
                break;

                default:
                    // NOOP
            }
        } );
    }

    // Add the CV to the screen (or show the 'there is no cv')
    //
    function _addCv( attachment )
    {
        var $hasCV              = $cvControl.find( ".hasCV" )
        ,   $noCV               = $cvControl.find( ".noCV" )
        ,   $deletedCV          = $cvControl.find( ".deletedCV" )
        ,   deletedDoc          = false
        ,   createdDateTime
        ;

        // Check if the file has been removed
        //
        var profileUploadId = bidx.utils.getValue( attachment, "bidxMeta.bidxUploadId" );

        if ( state !== "create" && !profileUploadId )
        {
            bidx.utils.warn( "entrepreneurprofile::_addCv: CV has been deleted!" );
            deletedDoc = true;
        }

        $cvContainer.data( "bidxData", attachment );

        if ( !attachment )
        {
            $deletedCV.hide();
            $hasCV.hide();
            $noCV.show();
        }
        else
        {
            if ( deletedDoc )
            {
                $deletedCV.show();
            }
            else
            {
                createdDateTime = bidx.utils.parseTimestampToDateStr( attachment.uploadedDateTime );

                $hasCV.find( ".documentName" ).text( attachment.documentName );
                $hasCV.find( ".createdDateTime" ).text( createdDateTime );
                $hasCV.find( ".downloadLink" ).attr( "href", attachment.document );

                $deletedCV.hide();
                $noCV.hide();
                $hasCV.show();
            }

            // Hide the error message (if any)
            //
            $cvControlGroup.find( "div.error" ).hide();
            $cvControlGroup.removeClass( "has-error" );
            $cvControlGroup.find( ".noCV" ).removeClass( "alert-danger" );
            $cvControl.prev().removeClass( "heading-error" );

        }
    }

    // Add the attachment to the screen, by cloning the snippet and populating it
    //
    function _addAttachment( attachment )
    {
        if ( attachment === null )
        {
            bidx.util.warn( "entrepreneurprofile::_addAttachment: attachment is null!" );
            return;
        }

        var $attachment         = snippets.$attachment.clone()
        ,   createdDateTime     = bidx.utils.parseTimestampToDateStr( attachment.uploadedDateTime )
        ,   $attachmentLink     = $attachment.find( ".documentLink" )
        ,   $attachmentImage    = $attachment.find( ".documentImage" )
        ,   $attachmentDefault  = $attachment.find( ".attachmentDefault" )
        ,   $attachmentMissing  = $attachment.find( ".attachmentMissing" )
        ,   deletedDoc          = false
        ;

        if ( !attachment.bidxMeta.bidxUploadId )
        {
            bidx.utils.warn( "entrepreneurprofile::_addAttachment: attachment has been deleted!" );
            deletedDoc = true;
        }
        else
        {
            $attachmentLink.attr( "href", attachment.document );
        }

        // Store the data so we can later use it to merge the updated data in
        //
        $attachment.data( "bidxData", attachment );

        $attachment.find( ".documentName"       ).text( attachment.documentName );
        $attachment.find( ".createdDateTime"    ).text( createdDateTime );

        $attachment.find( ".purpose"            ).text( attachment.purpose );
        $attachment.find( ".documentType"       ).text( bidx.data.i( attachment.documentType, "documentType" ) );

        // Check if attachment is an image
        if ( attachment.mimeType && attachment.mimeType.match( /^image/ ) )
        {
            $attachmentDefault.remove();
            $attachmentMissing.remove();

            $attachmentImage
                .attr( "src", attachment.document )
                .fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} )
            ;
        }
        else
        {
            $attachmentImage.remove();

            // Check if the file has been removed
            //
            if ( deletedDoc )
            {
                $attachment.find( ".documentName" ).text( bidx.i18n.i( "docDeleted" ) ).addClass( "text-danger" );
                $attachmentLink.remove();
            }
            else
            {
                $attachmentMissing.remove();
            }
        }

        $attachmentsContainer.reflowrower( "addItem", $attachment );
    }

    // Use the retrieved member object to populate the form and other screen elements
    //
    function _populateScreen()
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

        _addCv( bidx.utils.getValue( member, "bidxEntrepreneurProfile.cv" ) );

        // Attachments
        //
        var attachments         = bidx.utils.getValue( member, "bidxEntrepreneurProfile.attachment", true );

        if ( attachments)
        {
            $.each( attachments, function( idx, attachment )
            {
                bidx.utils.log( "attachment ", idx, attachment );
                _addAttachment( attachment );
            } );
        }

        // Fire of the toggle controls so the UI get's updated to it's current values
        //
        $togglePrevRunBusiness.trigger( "change" );

        if ( $.isFunction( $togglePrevRunBusiness.radio ))
        {
            $togglePrevRunBusiness.filter( ":checked" ).radio( "setState" );
        }

        // Industry Sectors
        //
        var data = bidx.utils.getValue( member, "bidxEntrepreneurProfile.focusIndustry", true );

        if ( data )
        {
            $industrySectors.industries( "populateInEditScreen",  data );
        }

        // Update the chosen components with our set values
        //
        // $focusIndustry.trigger( "chosen:updated" );
    }

    // Convert the form values back into the member object
    //
    function _getFormValues()
    {
        $.each( fields._root, function( i, f )
        {
            var $input  = $editForm.find( "[name='" + f + "']" )
            ,   value   = bidx.utils.getElementValue( $input )
            ;

            bidx.utils.setValue( member, "bidxEntrepreneurProfile." + f, value );
        } );

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

            bidx.utils.setValue( member, "bidxEntrepreneurProfile.focusIndustry", arr );
        }

        // Collect the nested objects
        //
        $.each( [ "previousBusiness"], function()
        {
            var nest                = this + "" // unbox
            ,   i                   = 0
            ,   count               = $editForm.find( "." + nest + "Item" ).length
            ,   memberPath          = "bidxEntrepreneurProfile." + nest
            ,   item                = []
            ;

            bidx.utils.setValue( member, memberPath, item );
            bidx.utils.setNestedStructure( item, count, nest, $editForm, fields[ nest ]  );

            // Now collect the removed items, clear the properties and push them to the list so the API will delete them
            //
            var $reflowContainer
            ,   removedItems
            ;

            switch ( nest )
            {
                case "previousBusiness":    $reflowContainer = $previousBusinessContainer;  break;

                default:
                    bidx.utils.error( "entrepreneurprofile, Unknown nest", nest );
            }

            if ( $reflowContainer )
            {
                removedItems = $reflowContainer.reflowrower( "getRemovedItems" );

                $.each( removedItems, function( idx, removedItem )
                {
                    var $removedItem    = $( removedItem )
                    ,   bidxData        = $removedItem.data( "bidxData" )
                    ;

                    if ( bidxData )
                    {
                        // Iterate over the properties and set all, but bidxMeta, to null
                        //
                        $.each( bidxData, function( prop )
                        {
                            if ( prop !== "bidxMeta" )
                            {
                                bidxData[ prop ] = null;
                            }
                        } );

                        item.push( bidxData );
                    }
                } );
            }
        } );

        // Fix the URL fields so they will be prefixed with http:// in case something valid was provided, but not having a protocol
        //
        var previousBusinesses     = bidx.utils.getValue( member, "bidxEntrepreneurProfile.previousBusiness", true );

        if ( previousBusinesses )
        {
            $.each( previousBusinesses, function( idx, previousBusiness )
            {
                previousBusiness.webSite = bidx.utils.prefixUrlWithProtocol( previousBusiness.webSite );
            } );
        }

        // Documents
        // Collect the whole situation from the DOM and set that array of bidxData items to be the new situation
        //
        var attachments = [];

        $attachmentsContainer.find( ".attachmentItem" ).each( function()
        {
            var $item           = $( this )
            ,   bidxData        = $item.data( "bidxData" )
            ;

            attachments.push( bidxData );
        } );

        bidx.utils.setValue( member, "bidxEntrepreneurProfile.attachment", attachments );

        // CV
        //
        var cv              = $cvContainer.data( "bidxData" )
        ;

        bidx.utils.setValue( member, "bidxEntrepreneurProfile.cv", cv );
    }

    // This is the startpoint
    //
    function _init()
    {
        // Reset any state
        //
        $previousBusinessContainer.reflowrower( "empty" );
        $attachmentsContainer.reflowrower( "empty" );
        $cvContainer.find( ".noCV"  ).hide();
        $cvContainer.find( ".hasCV" ).hide();

        $element.find( ":input" )
            .not( ":button, :submit, :reset" )
                .prop( "checked", false )
                .prop( "selected", false )
                .not( "[type='radio'], [type='checkbox']" )
                    .val( "" )
        ;

        // Inject the save and button into the controls
        //
        $btnSave    = $( "<a />", { "class": "btn btn-primary btn-sm disabled", href: "#save"    });
        $btnCancel  = $( "<a />", { "class": "btn btn-primary btn-sm disabled", href: "#cancel"  });

        $btnSave.i18nText( "btnSaveProfile" ).prepend( $( "<div />", { "class": "fa fa-check fa-above fa-big" } ) );
        $btnCancel.i18nText( "btnCancel" ).prepend( $( "<div />", { "class": "fa fa-times fa-above fa-big" } ) );

        bidx.controller.addControlButtons( [ $btnSave, $btnCancel ] );

        // Wire the submit button which can be anywhere in the DOM
        //
        $btnSave.click( function( e )
        {
            e.preventDefault();

            $editForm.submit();
        } );

        function _extraValidation()
        {
            var valid = true;

            var $cvErrorLabel
            ;

            // Custom validation, did we have a CV?
            //
            if ( !$cvContainer.data( "bidxData" ) )
            {
                valid = false;

                $cvErrorLabel = $cvControlGroup.find( "div.error" );

                if ( !$cvErrorLabel.length )
                {
                    $cvErrorLabel = $( "<div />", { "class": "error" } );
                    $cvControlGroup.append( $cvErrorLabel );
                }

                $cvErrorLabel
                    .text( bidx.i18n.i( 'frmNoCv', appName ))
                    .show();

                $cvControlGroup.addClass( "has-error" );
                $cvControlGroup.find( ".noCV" ).addClass( "alert-danger" );
                $cvControl.prev().addClass( "heading-error" );
            }

            return valid;
        }

        // Setup form
        //
        var $validator = $editForm.validate(
        {
            ignore: ".chosen-search input, .search-field input"
        ,   rules:
            {
                "summary":
                {
                    required:                   true
                ,   maxlength:                  900
                }
            // ,   "focusIndustry":
            //     {
            //         required:                   true
            //     }
            ,   "industrySectors":
                {
                    required:                   true
                }
            ,   "prevRunBusiness":
                {
                    required:                   true
                }
            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
            }
        ,   invalidHandler: function( event, validator )
            {
                // Make sure our extra validation implemetnation is always executed
                //
                // _extraValidation();
            }
        ,   submitHandler: function( e )
            {
                // if ( _extraValidation() )
                // {
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
                                bidx.utils.error( "problem parsing error response from entrepreneurProfile save" );
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
                // }
            }
        } );

        if ( state === "create" )
        {
            member =
            {
                bidxEntrepreneurProfile:
                {
                    bidxMeta:
                    {
                    }
                }
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
                        // Do we have edit perms?
                        //
                        var bidxMeta    = bidx.utils.getValue( response, "bidxEntrepreneurProfile.bidxMeta" ) || bidx.utils.getValue( response, "bidxEntrepreneurProfile" )
                        ,   canEdit     = bidx.utils.getValue( bidxMeta, "bidxCanEdit" )
                        ;

                        if ( !canEdit )
                        {
                            bidx.i18n.getItem( "noProfileEditPermission", function( err, label )
                            {
                                _showError( label );
                            } );

                            $btnCancel.removeClass( "disabled" );
                        }
                        else
                        {
                            member = response;

                            // Set the global (for this app) entrepreneurProfileId for convenience reasons
                            //
                            entrepreneurProfileId = bidx.utils.getValue( bidxMeta, "bidxEntityId" );

                            bidx.utils.log( "bidx::member", member );

                            _populateScreen();

                            $btnSave.removeClass( "disabled" );
                            $btnCancel.removeClass( "disabled" );

                            bidx.common.removeValidationErrors();

                            _showView( "edit" );
                        }
                    }
                ,   error:          function( jqXhr, textStatus )
                    {
                        var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                        _showError( "Something went wrong while retrieving the member: " + status );
                    }
                }
            );
        }
    }

    // Try to save the member to the API
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

        // Inform the API we are updating the member profile
        //
        var bidxMeta = member.bidxEntrepreneurProfile.bidxMeta ? member.bidxEntrepreneurProfile.bidxMeta : member.bidxEntrepreneurProfile;
        bidxMeta.bidxEntityType   = "bidxEntrepreneurProfile";

        // Update the member object
        //
        _getFormValues();

        bidx.utils.log( "about to save member", member );

        bidx.common.notifySave();

        bidxAPIParams   =
        {
            data:           member.bidxEntrepreneurProfile
        ,   groupDomain:    bidx.common.groupDomain
        ,   success:        function( response )
            {
                bidx.utils.log( bidxAPIService + "::success::response", response );

                bidx.common.closeNotifications();
                bidx.common.notifyRedirect();
                bidx.common.removeAppWithPendingChanges( appName );

                var url = document.location.href.split( "#" ).shift();

                // Maybe rs=true was already added, or not 'true' add it before reloading
                //
                var rs = bidx.utils.getQueryParameter( "rs", url );
                var redirect_to = bidx.utils.getQueryParameter( "redirect_to", url );


                if( redirect_to ) {
                    url = '/' + redirect_to;
                }

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
                bidx.common.closeNotifications();
            }
        };

        // Creating an entrepreneur is not possible via the member API, therefore the
        // raw Entity API is used for the creation of the entrepreneur
        //
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
    }

    // Private functions
    //
    function _showError( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    }

    function _showView( v )
    {
        currentView = v;

        $views.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();
    }

    // ROUTER
    //
    function navigate( options )
    {
        switch ( options.requestedState )
        {
            case "edit":
                bidx.utils.log( "EditEntrepreneur::AppRouter::edit", options.id, options.section );

                var updateHash      = false
                ,   isId            = ( options.id && options.id.match( /^\d+$/ ) )
                ;

                if ( options.id && !isId )
                {
                    options.section = options.id;
                    options.id      = memberId;

                    updateHash = true;
                }

                // No memberId set yet and not one explicitly provided? Use the one from the session
                //
                if ( !memberId && !isId )
                {
                    options.id = bidx.utils.getValue( bidxConfig, "session.id" );

                    updateHash = true;
                }

                if ( !( state === "edit" && options.id === memberId ) )
                {
                    memberId                = options.id;
                    entrepreneurProfileId   = null;
                    state                   = "edit";

                    $element.show();
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
                    var hash = "editMember/" + options.id;

                    if ( options.section )
                    {
                         hash += "/" + options.section;
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
                    return navigate( { requestedState: "edit" } );
                }
                else
                {
                    memberId    = null;
                    state       = "create";

                    $element.show();

                    _showView( "load" );

                    _init();
                }
            break;
        }
    }

    // Reset the app to it's initial state
    //
    function reset()
    {
        state = null;

        bidx.common.removeAppWithPendingChanges( appName );

        $(".type-bidx").find( ".total-error-message" ).hide();
    }

    // Engage!
    //
    _oneTimeSetup();

    // Expose
    //
    var entrepreneurprofile =
    {
        navigate:                   navigate
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
