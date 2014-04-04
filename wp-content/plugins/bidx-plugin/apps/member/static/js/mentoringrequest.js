;( function( $ )
{
    "use strict";

    var $element                            = $( "#mentoringRequest" )
    ,   $views                              = $element.find( ".view" )
    ,   $editForm                           = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets                           = $element.find( ".snippets" )


    ,   $modals                             = $element.find( ".modalView" )
    ,   $modal

    ,   $elementMyprofile                   = $(".member")
    ,   $viewsMyprofile                     = $elementMyprofile.find( ".view" )


    ,   $focusIndustry                      = $element.find( "[name='mentoringIndustry']" )

    ,   member
    ,   memberId
    ,   mentorProfileId
    ,   state
    ,   currentView

    ,   appName                             = "member"
    ;


    // this function mutates the relationship between two contacts. Possible mutations for relationship: action=[ignore / accept]
    //
    function _doCreateMentorRequest( options )
    {

        var uriStatus
        ,   params  = options.params
        ,   bpClass = '.bp-' + options.params.businessid
        ;

         //uriStatus = document.location.href.split( "#" ).shift() + "?smsg=8&sparam=" + window.btoa('action=sent') ;
         //document.location.href = uriStatus;
        //bidx.controller.updateHash(uriStatus, true, true);
        //bidx.controller.doSuccess( uriStatus,true);

        //return;

        bidx.api.call(
             "mentorRelationships.create"
        ,   {
                groupDomain:            bidx.common.groupDomain
            ,   requesteeId:            params.id
            ,   data:
                {
                    "type":             "mentor"
                }

            ,   success: function( response )
                {
                    bidx.utils.log("[mentor] created a mentor relationship",  response );
                    if ( response && response.status === "OK" )
                    {
                        //  execute callback if provided
                        //uriStatus = document.location.href.split( "#" ).shift() + "?smsg=8&sparam=" + window.btoa('action=sent') ;

                        //bidx.controller.updateHash(uriStatus, true, true);
                        //bidx.controller.doSuccess( uriStatus,true);

                        if (options && options.callback)
                        {
                            options.callback();
                        }

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
                        _showMainError( bidx.i18n.i("errorRequest") + response.text);
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        _showMainError( bidx.i18n.i("errorRequest") + response.text);
                    }

                    $elementMyprofile.find( bpClass ).removeClass('disabled').i18nText('btnTryAgain');

                }
            }
        );
    }


    var fields =
    {
        _root:
        [
            'summary'
        ,   'mentoringIndustry'
        ]
    };

        // Setup function for doing work that should only be done once
    //
    function _oneTimeSetup()
    {


        // Disable disabled links
        //
        $element.delegate( "a.disabled", "click", function( e )
        {
            e.preventDefault();
        } );

        // Populate the selects
        //

        $focusIndustry.bidx_chosen(
        {
            dataKey:            "industry"
        });

        $focusIndustry.trigger( "chosen:updated" );
    }




    // Use the retrieved member object to populate the form and other screen elements
    //
    function _populateScreen()
    {
        $.each( fields._root, function( i, f )
        {
            var $input  = $editForm.find( "[name='" + f + "']" )
            ,   value   = bidx.utils.getValue( member, "bidxMentorProfile." + f )
            ;

            $input.each( function()
            {
                // Value can be an array! Most likely we are targeting a
                //
                bidx.utils.setElementValue( $( this ), value );
            } );
        } );

        // Update the chosen components with our set values
        //
        $focusIndustry.trigger( "chosen:updated" );



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

            bidx.utils.setValue( member, "bidxMentorProfile." + f, value );
        } );
    }



    // This is the startpoint
    //
    function _init()
    {
        var $btnSave    = $( "<a />", { "class": "btn btn-primary disabled", href: "#save"    })
        ,   $btnCancel  = $( "<a />", { "class": "btn btn-primary disabled", href: "#cancel"  })
        ;

        $btnSave.i18nText( "btnSaveProfile" );
        $btnCancel.i18nText( "btnCancel" );

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
        var $validator = $editForm.validate(
        {
            debug: true
        ,   ignore: ".chosen-search input, .search-field input"
        ,   rules:
            {
                "summary":
                {
                    required:               true
                }
            ,   "focusIndustry":
                {
                    required:               true
                }
            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
                "preferredCommunicationAll": "Please check one of the above"
            ,   "referencesAll": "Please fill your LinkedIn profile url or upload at least one document"
            }
        ,   submitHandler: function( e )
            {
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
                            bidx.utils.error( "problem parsing error response from mentorProfile save" );
                        }

                        bidx.common.notifyError( "Something went wrong during save: " + response );

                        $btnSave.removeClass( "disabled" );
                        $btnCancel.removeClass( "disabled" );
                    }
                } );
            }
        } );
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
        var bidxMeta = member.bidxMentorProfile.bidxMeta;
        bidxMeta.bidxEntityType   = "bidxMentorProfile";

        // Update the member object
        //
        _getFormValues();

        bidx.common.notifySave();

        bidx.utils.log( "about to save member", member );

        bidxAPIParams   =
        {
            data:           member.bidxMentorProfile
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
                var rs          = bidx.utils.getQueryParameter( "rs", url );
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

        // Creating an mentor is not possible via the member API, therefore the
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

    //  ################################## MODAL #####################################  \\


    //  show modal view with optionally and ID to be appended to the views buttons
    function _showModal( options )
    {
        var href
        ,   replacedModal
        ,   type
        ,   params = {};

        if(options.params)
        {
            params = options.params;
            type = options.params.type;
        }

       // bidx.utils.log("[mentoringrequest] show modal", options, $modals.filter( bidx.utils.getViewName ( options.view, "modal" )).find( ".bidx-modal") );

        $modal        = $modals.filter( bidx.utils.getViewName ( options.view, "modal" ) ).find( ".bidx-modal");

        /*replacedModal = $modal.html()
                        .replace( /%type%/g, type );

        $modal.html(  replacedModal );*/

        $modal.find( ".btn-primary[href]" ).each( function()
        {
            var $this = $( this );

            href = $this.attr( "data-href" ) + $.param( params ) ;

            $this.attr( "href", href );
        } );



        if( options.onHide )
        {
            //  to prevent duplicate attachments bind event only onces
            $modal.on( 'hidden.bs.modal', options.onHide );
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
    function _showError( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    }

    // Private functions
    //
    function _showMainError( msg, hideview )
    {
        if( hideview ) {
            $viewsMyprofile.filter(bidx.utils.getViewName(hideview)).hide();
        }

        $viewsMyprofile.filter( ".viewMainerror" ).find( ".errorMsg" ).text( msg );
        _showMainView( "mainerror" );
    }

    // Private functions
    //
    function _showMainSuccessMsg( msg , hideview )
    {
        if( hideview ) {
            $viewsMyprofile.filter(bidx.utils.getViewName(hideview)).hide();
        }

        $viewsMyprofile.filter( ".viewMainsuccess" ).find( ".successMsg" ).text( msg );
        _showMainView( "mainsuccess" );
    }

    function _showMainView( v )
    {
        currentView = v;

        $viewsMyprofile.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();
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
        //requestedState, section, id, cb
        switch ( options.requestedState )
        {

            case "confirmRequest": /***** Mentor this plan Start functionlaity **/

                _closeModal(
                {
                    unbindHide: true
                } );

                if( options.params ) {
                    _showModal(
                    {
                        view  : "confirmRequest"
                    ,   params: options.params
                    ,  /* onHide: function()
                        {
                          window.bidx.controller.updateHash("#cancel", false, true);
                        }*/
                    } );
                }
            break;

            case "cancelRequest":

                _closeModal(
                {
                    unbindHide: true
                } );

                window.bidx.controller.updateHash("#cancel", false, true);

            break;

            case "sendRequest":
                var bpClass       = '.bp-' + options.params.businessid
                ,   $mentorButton = $elementMyprofile.find( bpClass );

                _closeModal(
                {
                    unbindHide: true
                } );

                //_showRequestView("loadrequest", true);
               $mentorButton.addClass('disabled').i18nText("msgWaitForSave");


                _doCreateMentorRequest(
                {
                    params: options.params
                ,   callback: function()
                    {

                        $mentorButton.addClass('disabled').i18nText("btnRequestSent");
                        _showMainSuccessMsg(bidx.i18n.i("statusRequest"));

                    }
                } );

            break;  /***** Mentor this plan End functionlaity **/



           case "confirmMentoringRequest": /***** Request mentoring this plan Start functionlaity **/

                _closeModal(
                {
                    unbindHide: true
                } );

                if( options.params ) {
                    _showModal(
                    {
                        view  : "confirmMentoringRequest"
                    ,   params: options.params
                    ,   onShow: function()
                        {
                             _oneTimeSetup();

                        }
                    } );
                }
            break;

        }
    }

    // Reset the app back to it's initial state
    //
    function reset()
    {
        state = null;

        bidx.common.removeAppWithPendingChanges( appName );
    }

    // Engage!
    //
    // _oneTimeSetup();

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

    window.bidx.mentoringrequest = app;
} ( jQuery ));
