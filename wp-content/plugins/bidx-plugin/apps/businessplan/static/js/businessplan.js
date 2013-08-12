( function( $ )
{
    var $element                    = $( "#editBusinessSummary" )
    ,   $views                      = $element.find( ".view" )
    ,   $editForm                   = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets                   = $element.find( ".snippets" )


    ,   businessSummary
    ,   businessSummaryId

    ,   state
    ,   bidx                        = window.bidx
    ,   snippets                    = {}
    ;

        // Form fields
        //
    var fields =
    {

    };

    // Grab the snippets from the DOM
    //
    snippets.$personalDetails       = $snippets.children( ".personalDetailsItem" ).remove();

    // Build the screen using the current businessSummary object
    //
    var _populateScreen = function()
    {

    };

    // Convert the current form values back into the businessSummary object
    //
    var _getFormValues = function()
    {

    };

    // Startpoint of this app, will be called on every start of a scenario
    //
    var _init = function()
    {
        // Reset any state
        //

        // Add buttons to controller
        //
        var $btnSave    = $( "<a />", { class: "btn btn-primary disabled", href: "#save"    })
        ,   $btnCancel  = $( "<a />", { class: "btn btn-primary disabled", href: "#cancel"  })
        ;

        // bidx.controller.addControlButtons( [ $btnSAve, $btnCancel ] );

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

        bidx.api.call(
            "entity.fetch"
        ,   {
                entityId:           businessSummaryId
            ,   groupDomain:        bidx.common.groupDomain
            ,   success:            function( response )
                {
                    businessSummary = response;

                    bidx.utils.log( "bidx::businessSummary", businessSummary );

                    _populateScreen();

                    $btnSave.removeClass( "disabled" );
                    $btnCancel.removeClass( "disabled" );

                    _showView( "edit" );
                }
            ,   error:              function( jqXhr, textStatus )
                {
                    var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                    _showError( "Something went wrong while retrieving the business summary: " + status );
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
        $views.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();
    };


    // ROUTER
    //


    var navigate = function( options )
    {
        bidx.utils.log("NAVIGATE OPTIONS", options );

        switch ( options.requestedState )
        {
            case "edit":
                bidx.utils.log( "EditBusinessSummary::AppRouter::edit", options.id, options.part, options.section );

                var newBusinessSummaryId
                ,   splatItems
                ,   updateHash      = false
                ,   isId            = ( options.id && options.id.match( /^\d+$/ ) )
                ;

                // TODO: implement the handling of parts
                if ( !options.part )
                {
                    options.part = "BusinessSummary";
                }

                if ( options.id && !isId )
                {
                    options.section = options.id;
                    options.id      = businessSummaryId;

                    updateHash = true;
                }

                // No businessSummaryId set yet and not one explicitly provided? Use the one from the session
                //
                if ( !businessSummaryId && !isId )
                {
                    options.id = bidx.utils.getValue( bidxConfig, "context.bidxBusinessSummary" );

                    updateHash = true;
                }

                if ( !( state === "edit" && options.id === businessSummaryId ) )
                {
                    businessSummaryId   = options.id;
                    state               = "edit";

                    $element.show();
                    _showView( "load" );

                    _init();
                }

                if ( updateHash )
                {
                    var hash = "editBusinessSummary/" + options.id + "/" + options.part;

                    if ( options.section )
                    {
                         hash += "/" + options.section;
                    }

                    return hash;
                }
            break;

            case "financialDetails":
                _showView( options.requestedState );
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

    window.bidx.businessSummary = app;

} ( jQuery ));
