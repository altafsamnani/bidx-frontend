/* global bidx */
( function( $ )
{
    var $element                        = $( "#media" )
    ,   $views                          = $element.find( ".view" )
    ,   $snippets                       = $element.find( ".snippets" )
    ,   $viewEdit                       = $views.filter( ".viewEdit" )
    ,   $editForm                       = $viewEdit.find( "form" )

    ,   $dropzone                       = $element.find( ".dropzone" )
    ,   $fileList                       = $element.find( "table.fileList tbody.files" )
    ,   $fileUpload                     = $element.find( "input.fileUpload" )

    ,   $selectControls                 = $element.find( ".selectControls" )

    ,   $btnSave                        = $editForm.find( ".btnSave" )
    ,   $btnCancel                      = $editForm.find( ".btnCancel" )
    ,   $btnDelete                      = $editForm.find( ".btnDelete" )

    ,   state
    ,   currentView
    ,   snippets                        = {}

    ,   appName                         = "media"
    ,   slaveApp                        = false

    ,   callbacks                       = null

    ,   settings                        =
        {
            selectFile:                     false
        }

        // Object containing the upload details
        //
    ,   upload
    ,   uploadId
    ;

    // Grab the snippets from the DOM
    //
    snippets.$fileItem    = $snippets.children( "table.fileItem" ).find( "tr.fileItem" ).remove();

    function _oneTimeSetup()
    {
        // Drag/drop class administration. Can be used to highlight / animate.
        //
        var dropzoneTimeout;
        $( document ).bind( "dragover", function (e)
        {
            if ( !dropzoneTimeout )
            {
                $dropzone.addClass( "in" );
            }
            else
            {
                clearTimeout( dropzoneTimeout );
            }

            var found   = false
            ,   node    = e.target
            ;

            do
            {
                if ( node === $dropzone[0] )
                {
                    found = true;
                    break;
                }
                node = node.parentNode;
            }
            while ( node !== null );

            if ( found )
            {
                $dropzone.addClass( "hover" );
            }
            else
            {
                $dropzone.removeClass( "hover" );
            }

            dropzoneTimeout = setTimeout( function()
            {
                dropzoneTimeout = null;
                $dropzone.removeClass( "in hover" );
            }, 100);
        } );

        // Disable default browser drag/drop behaviour
        //
        $( document ).bind( "drop dragover", function (e)
        {
            e.preventDefault();
        } );

        // In slave mode we should handle going to edit mode ourselves
        //
        $fileList.delegate( ".btnEdit", "click", function( e )
        {
            var $btn
            ,   id
            ;

            if ( slaveApp )
            {
                e.preventDefault();

                $btn    = $( this );
                id      = $btn.attr( "href" ).split( "/" ).pop();

                navigate(
                {
                    requestedState:         "edit"
                ,   id:                     id
                } );
            }
        } );

        // Select a file and callback it's value
        //
        $selectControls.find( ".btnSelectFile" ).click( function( e )
        {
            e.preventDefault();
        } );

        // Cancel the attempt to select a file
        //
        $selectControls.find( ".btnCancelSelectFile" ).click( function( e )
        {
            e.preventDefault();

            if ( callbacks )
            {
                callbacks.cancel();
            }
            else
            {
                bidx.utils.warn( "[media] cancel select file pressed, but no callback defined... " );
            }
        } );

        // Populate dropdown using the static data
        //
        bidx.data.getContext( "documentType", function( err, documentTypes )
        {
            var $documentType   = $editForm.find( "select[name='documentType']" )
            ,   $noValue        = $( "<option value='' />" )
            ;

            $noValue.i18nText( "selectDocumentType" );

            $documentType.append( $noValue );

            bidx.utils.populateDropdown( $documentType, documentTypes );
        } );

        // Instantiate the file upload component (be careful! the 'old' plugin was fileUpload with a capital U)
        //
        $fileUpload.fileupload(
        {
            url:            "/api/v1/upload"
        ,   formData:       function( form )
            {
                var extraFields =
                [
                    {
                        "name":         "purpose"
                    ,   "value":        ""
                    }
                ,   {
                        "name":         "documentType"
                    ,   "value":        "other"
                    }
                ];

                return extraFields;
            }

        ,   dropZone:       $element.find( ".dropzone" )

            // New file is added to the fileupload
            //
        ,   add: function( e, data )
            {
                bidx.utils.log( "[fileupload] Add", e, data );

                var file            = {}
                ,   originalFiles   = bidx.utils.getValue( data, "originalFiles", true )
                ;

                if ( originalFiles )
                {
                    file.originalFilename = originalFiles[ 0 ].name;
                }

                data.context = _addFile( file, true );

                // Start the upload
                //
                data.submit();
            }

        ,   done: function( e, data )
            {
                bidx.utils.log( "[fileupload] Done", e, data );

                bidx.common.notifySuccess( bidx.i18n.i( "attachmentUploadDone" ) );

                var file = bidx.utils.getValue( data, "result.data" );

                _updateFile( data.context, file );

                data.context.find( ".done"      ).show();
                data.context.find( ".uploading" ).hide();
            }

        ,   fail: function( e, data )
            {
                bidx.utils.error( "[fileupload] Error", e, data );

                bidx.common.notifyError( bidx.i18n.i( "attachmentUploadError" ) + ": " + bidx.utils.getValue( data, "errorThrown" ));

                // Cleanup
                //
                if ( data.context && data.context.length )
                {
                    data.context.remove();
                }
            }

        ,   progress: function (e, data)
            {
                var progress    = parseInt(data.loaded / data.total * 100, 10)
                ,   $progress   = data.context.find( ".progress .bar" )
                ;

                $progress.css( "width", progress + "%" );
            }
        } );

        // Save button in edit state
        //
        $btnSave.click( function( e )
        {
            e.preventDefault();

            _save();
        } );

        // Cancel button in Edit state
        //
        $btnCancel.click( function( e )
        {
            if ( slaveApp )
            {
                e.preventDefault();

                navigate(
                {
                    requestedState: "list"
                });
            }
        } );

        // Delete button
        //
        $btnDelete.click( function( e )
        {
            e.preventDefault();

            if ( !uploadId )
            {
                bidx.utils.error( "[media] No upload id, unable to delete!", uploadId );
                return;
            }

            var orgText
            ,   confirmTimer
            ;

            function startConfirmTimer( $btn, orgText )
            {
                confirmTimer = setTimeout( function( )
                {
                    $btn.text( orgText );
                    $btn.data( "confirm", false );

                    $btn.removeClass( "btn-large" );

                }, 5000 );
            }

            if ( $btnDelete.data( "confirm" ) )
            {
                clearTimeout( confirmTimer );

                _deleteUpload( function( err )
                {
                    // Back to the listing when succesfully deleted the attachment
                    //
                    if ( !err )
                    {
                        if ( !slaveApp )
                        {
                            bidx.controller.updateHash( "media/list", true );
                        }
                        else
                        {
                            navigate(
                            {
                                requestedState: "list"
                            } );
                        }
                    }
                });
            }
            else
            {
                orgText = $btnDelete.text();

                $btnDelete.data( "confirm", true );

                $btnDelete.addClass( "btn-large" );
                $btnDelete.i18nText( "btnConfirm" );

                startConfirmTimer( $btnDelete, orgText );
            }
        } );

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
    }

    // Actually delete the file from the API
    //
    function _deleteUpload( cb )
    {
        bidx.api.call(
            "upload.destroy"
        ,   {
                id:                 uploadId
            ,   groupDomain:        bidx.common.groupDomain
            ,   success:            function( response )
                {
                    bidx.utils.log( "[media] upload destroy::success", response );

                    bidx.i18n.getItem( "attachmentDeleted", function( err, label )
                    {
                        bidx.common.notifySuccess( label );
                    });

                    cb();
                }
            ,   error:            function( jqXhr, textStatus )
                {
                    bidx.utils.error( "[media] upload destroy::error", jqXhr, textStatus );

                    bidx.i18n.getItem( "errAttachmentDelete", function( err, label )
                    {
                        alert( label );
                    } );

                    cb( new Error( "Problem deleting file" ) );
                }
            }
        );
    }

    // Add file container to the DOM
    //
    function _addFile( file, uploading )
    {
        var $file           = snippets.$fileItem.clone( true )
        ,   $uploading      = $file.find( ".uploading" )
        ,   $done           = $file.find( ".done" )
        ,   $tdSelectFile   = $file.find( "td.selectFile" )
        ,   $cbContainer
        ,   $radioContainer
        ,   $input
        ;

        // Show the UI control for selecting the file to be uploaded
        //
        if ( settings.selectFile )
        {
            $cbContainer     = $tdSelectFile.find( ".multiSelectCheckbox"    );
            $radioContainer  = $tdSelectFile.find( ".multiSelectRadio"       );

            // When multiselect show the checkbox, otherwise the radio
            //
            if ( settings.multiSelect )
            {
                $input = $cbContainer.find( "input" );
                $input.val( file.id );

                $input.checkbox();

                $cbContainer.show();
                $radioContainer.hide();
            }
            else
            {
                $input = $radioContainer.find( "input" );
                $input.val( file.id );

                $input.radio();

                $cbContainer.hide();
                $radioContainer.show();
            }

            $tdSelectFile.show();
        }

        // New or existing file?
        //
        if ( uploading )
        {
            $uploading.show();
            $done.hide();
        }
        else
        {
            $uploading.hide();
            $done.show();
        }

        _updateFile( $file, file );

        $fileList.append( $file );

        return $file;
    }

    // Update data of an existing file container in the DOM
    //
    function _updateFile( $container, file )
    {
        var imageSrc = ( file && file.mimeType && file.mimeType.match( /^image/ ) )
            ? file.document
            : "/wp-content/plugins/bidx-plugin/static/img/iconViewDocument.png"
        ;

        $container.data( "bidxData", file );

        if ( file )
        {
            $container.find( ".name"            ).text( file.originalFilename );
            $container.find( ".purpose"         ).text( file.purpose );
            $container.find( ".documentType"    ).text( file.documentType ? bidx.data.i( file.documentType, "documentType" ) : "" );

            $container.find( ".documentImage"   ).attr( "src",      imageSrc );
            $container.find( ".documentLink"    ).attr( "href",     file.document );

            $container.find( ".btnEdit"         ).attr( "href",     "#media/edit/" + file.id );
        }
    }

    // Populate the edit / details state of a single media file
    //
    function _populateEditScreen()
    {
        if ( !upload )
        {
            bidx.utils.warn( "[media] requested to populate edit screen, but no upload data was available!" );
            return;
        }

        var created = bidx.utils.parseTimestampToDateStr( upload.created )
        ;

        // Form items
        //
        var $purpose        = $editForm.find( "[name='purpose']" )
        ,   $documentType   = $editForm.find( "[name='documentType']" )
        ;

        bidx.utils.setElementValue( $purpose,       upload.purpose );
        bidx.utils.setElementValue( $documentType,  upload.documentType );

        // Readonly items
        //
        var $details        = $viewEdit.find( ".fileDetails" );

        $details.find( ".created"       ).text( created );
        $details.find( ".filename"      ).text( upload.documentName );
        $details.find( ".size"          ).text( upload.size );
        $details.find( ".contentType"   ).text( upload.mimeType );

        $details.find( ".btnDownload"   ).attr( "href", upload.document );
    }

    // Merge the form back into the data object
    //
    function _getFormValues()
    {
        $.each( [ "purpose", "documentType" ], function( i, f )
        {
            var $input  = $editForm.find( "[name='" + f + "']" )
            ,   value   = bidx.utils.getElementValue( $input )
            ;

            bidx.utils.setValue( upload, f, value );
        } );
    }

    // Try to save the member to the API
    //
    function _save( params )
    {
        if ( !upload )
        {
            bidx.utils.error( "[media] saving media, but don't have any data to save!" );

            return;
        }

        // Update the member object
        //
        _getFormValues();

        if ( !slaveApp )
        {
            bidx.common.notifySave();
        }

        bidx.api.call(
            "upload.save"
        ,   {
                id:             uploadId
            ,   groupDomain:    bidx.common.groupDomain
            ,   data:           upload
            ,   success:        function( response )
                {
                    bidx.utils.log( "[media] upload.save::success::response", response );

                    if ( callbacks )
                    {
                        callbacks.success( response.data );
                    }

                    if ( !slaveApp )
                    {
                        bidx.common.notifyRedirect();
                        bidx.common.removeAppWithPendingChanges( appName );

                        bidx.controller.updateHash( "#media/list", true );
                    }
                }
            ,   error:          function( jqXhr )
                {
                    bidx.utils.error( "[media] upload.save::error", jqXhr );
                    bidx.common.notifyError( "Problem updating media" );

                    // If running as a slave app, notify the change via a callback
                    //
                    if ( callbacks )
                    {
                        callbacks.error();
                    }
                }
            }
        );
    }

    // This is the startpoint for the list state
    //
    function _initList( cb )
    {
        // Reset any state
        //
        $fileList.empty();

        // Fetch the current library
        //
        bidx.api.call(
            "upload.fetch"
        ,   {
                groupDomain:    bidx.common.groupDomain
            ,   success:        function( response )
                {
                    bidx.utils.log( "[media] response", response );

                    $.each( response, function( idx, file )
                    {
                        _addFile( file );
                    } );

                    _showView( "list" );

                    if ( cb )
                    {
                        cb();
                    }
                }
            ,   error:          function( jqXhr, textStatus )
                {
                    var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                    _showError( "Something went wrong while retrieving the current list of media: " + status );
                }
            }
        );
    }

    // this is the startpoint for the edit state
    //
    function _initEdit( cb )
    {
        upload = null;

        $btnSave.i18nText( "btnSave" );
        $btnCancel.i18nText( "btnCancel" );

        // Fetch the requested file
        //
        bidx.api.call(
            "upload.fetch"
        ,   {
                groupDomain:    bidx.common.groupDomain
            ,   id:             uploadId
            ,   success:        function( response )
                {
                    bidx.utils.log( "[media] response", response );

                    upload = response;

                    _populateEditScreen();

                    _showView( "edit" );

                    if ( cb )
                    {
                        cb();
                    }
                }
            ,   error:          function( jqXhr, textStatus )
                {
                    var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                    _showError( "Something went wrong while retrieving the requested media: " + status );
                }
            }
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
        bidx.utils.log( "[media] navigate", options );

        if ( state === options.requestedState )
        {
            bidx.utils.log( "[media] doing nothing, same state as we are already in" );
            return;
        }

        // Set the slave mode when the navigate is called with a slaveApp mode
        //
        if ( typeof options.slaveApp !== "undefined" )
        {
            slaveApp = options.slaveApp;
        }

        if ( typeof options.selectFile !== "undefined" )
        {
            settings.selectFile     = options.selectFile;
            settings.multiSelect    = options.multiSelect || false;
        }

        // Register callbacks
        //
        if ( options.callbacks )
        {
            callbacks =
            {
                success:    options.callbacks.success   || function() {}
            ,   ready:      options.callbacks.ready     || function() {}
            ,   error:      options.callbacks.error     || function() {}
            ,   cancel:     options.callbacks.cancel    || function() {}
            ,   select:     options.callbacks.select    || function() {}
            };
        }

        // Make sure the i18n translations for this app are available before initing
        //
        bidx.i18n.load( [ "__global", appName ] )
            .done( function()
            {
                bidx.utils.log( "[media] i18n loaded" );

                switch ( options.requestedState )
                {
                    case "list":
                        _showView( "load" );

                        _initList( function()
                        {
                            $element.show();

                            // When callbacks is defined all callbacks exist
                            //
                            if ( callbacks )
                            {
                                callbacks.ready( options.requestedState );
                            }
                        });
                    break;

                    case "edit":

                        uploadId = options.id;
                        upload   = null;

                        _showView( "load" );

                        _initEdit( function()
                        {
                            $element.show();

                            // When callbacks is defined all callbacks exist
                            //
                            if ( callbacks )
                            {
                                callbacks.ready( options.requestedState );
                            }
                        } );
                    break;
                }
            }
        );
    }

    // Bring back the app to an initial state
    //
    function reset()
    {
        state       = null;
        slaveApp    = null;
        callbacks   = null;

        settings.selectFile     = false;
        settings.multiSelect    = false;

        bidx.common.removeAppWithPendingChanges( appName );
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
        // END DEV API
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.media = app;

    // Only update the hash when user is authenticating and when there is no hash defined
    //
    if ( $( "body.bidx-media" ).length && !bidx.utils.getValue( window, "location.hash" ).length )
    {
        document.location.hash = "#media/list";
    }

} ( jQuery ));
