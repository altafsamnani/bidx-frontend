( function( $ )
{
    var $element                        = $( "#media" )
    ,   $views                          = $element.find( ".view" )
    ,   $snippets                       = $element.find( ".snippets" )

    ,   $fileList                       = $element.find( "table.fileList tbody.files" )
    ,   $fileUpload                     = $element.find( "input.fileUpload" )

    ,   state
    ,   currentView
    ,   bidx                            = window.bidx
    ,   snippets                        = {}

    ,   appName                         = "media"
    ;

    // Grab the snippets from the DOM
    //
    snippets.$fileItem    = $snippets.children( "table.fileItem" ).find( "tr.fileItem" ).remove();

    function _addFile( file )
    {
        var $file = snippets.$fileItem.clone();

        $file.data( "bidxData", file );

        $file.find( ".name"             ).text( file.originalFilename );
        $file.find( ".purpose"          ).text( file.purpose );
        $file.find( ".documentType"     ).text( file.documentType ? bidx.data.i( file.documentType, "documentType" ) : "" );

        $fileList.append( $file );
    }

    // This is the startpoint
    //
    var _init = function()
    {
        // Reset any state
        //
        $fileList.empty();

        // Instantiate the file upload component
        //
        $fileUpload.fileUpload(
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
        ,   done: function( e, data )
            {
                bidx.utils.log( "[fileupload] Done", e, data );
            }
        ,   fail: function( e, data )
            {
                bidx.utils.error( "[fileupload] Error", e, data );
            }
        ,   progressall: function (e, data)
            {
                var progress = parseInt(data.loaded / data.total * 100, 10);

                bidx.utils.log( "progress", progress );

                // $('#progress .progress-bar').css(
                //     'width',
                //     progress + '%'
                // );
            }
        } );

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
                }
            ,   error:          function( jqXhr, textStatus )
                {
                    var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                    _showError( "Something went wrong while retrieving the current list of media: " + status );
                }
            }
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
        currentView = v;

        $views.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();
    };

    // ROUTER
    //
    var navigate = function( options )
    {
        bidx.utils.log( "[media] navigate", options );

        switch ( options.requestedState )
        {
            case "list":
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

    var reset = function()
    {
        state = null;
    };

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
    if ( $( "body.bidx-media" ).length && !bidx.utils.getValue(window, "location.hash").length )
    {
        document.location.hash = "#media/list";
    }

} ( jQuery ));
