;( function( $ )
{
    "use strict";

    var $element                            = $( "#mentoringRequest" )
    ,   $views                              = $element.find( ".view" )
    ,   $editForm                           = $element.find( ".frmrequestMentor" )
    ,   $snippets                           = $element.find( ".snippets" )


    ,   $modals                             = $element.find( ".modalView" )
    ,   $modal

    ,   $elementMyprofile                   = $(".member")
    ,   $viewsMyprofile                     = $elementMyprofile.find( ".view" )


    ,   $focusIndustry                      = $element.find( "[name='mentoringIndustry']" )
    ,   $businessSummary                    = $element.find( "[name='businessSummary']" )
    ,   $requestMentoringBtn                = $elementMyprofile.find( '.btn-mentoring' )

    ,   listDropdownBp                      = bidx.utils.getValue( bidxConfig, "session.wp.entities.bidxBusinessSummary" )

    ,   member
    ,   loggedInMemberId                    = bidx.utils.getValue( bidxConfig, "session.id" )
    ,   visitingMemberPageId                = bidx.utils.getValue( bidxConfig, "context.memberId" )


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
        ,   params      = options.params
        ,   initiatorId = bidx.utils.getValue(params, 'initiatorId')
        ,   mentorId    = bidx.utils.getValue(params, 'mentorId')
        ;

         //uriStatus = document.location.href.split( "#" ).shift() + "?smsg=8&sparam=" + window.btoa('action=sent') ;
         //document.location.href = uriStatus;
        //bidx.controller.updateHash(uriStatus, true, true);
        //bidx.controller.doSuccess( uriStatus,true);

        //return;

        bidx.api.call(
             "mentorRelationships.create"
        ,   {
                groupDomain :   bidx.common.groupDomain
            ,   entityid    :   params.entityId
            ,   data        :   {
                                    "initiatorId" :   parseInt(initiatorId)
                                ,   "mentorId"    :   parseInt(mentorId)
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

                    if (options && options.error)
                    {
                        options.error();
                    }

                }
            }
        );
    }


    function _getBusinessPlans(  )
    {
        var option
        ,   bpLength    = _.size(listDropdownBp)
        ,   counter     = 0
        ,   promises    = []
        ,   listBpItems = []
        ,   $d          = $.Deferred()
        ;



            $.each( listDropdownBp, function( idx, entityId )
            {
                bidx.api.call(
                    "entity.fetch"
                ,   {
                        entityId    :   entityId
                    ,   groupDomain :   bidx.common.groupDomain
                    ,   success:        function( item )
                        {
                            // now format it into array of objects with value and label

                            if ( !$.isEmptyObject(item) )
                            {
                                option  =   $( "<option/>",
                                            {
                                                value: entityId
                                            } );

                                option.text( item.name );

                                listBpItems.push( option );

                                counter = counter + 1;

                                if(counter === bpLength )
                                {
                                    $d.resolve( listBpItems );
                                }

                            }
                        }

                    ,   error: function(jqXhr, textStatus)
                        {
                            var response = $.parseJSON( jqXhr.responseText);

                            bidx.utils.log("Error retrieving the data for entityid", entityId);

                            counter = counter + 1;

                            if(counter === bpLength )
                            {

                                $d.resolve( listBpItems );
                            }
                        }
                    });
            } );

            return $d.promise();
    }

    // Setup function for doing work that should only be done once
    //
    function _populateDefaultData()
    {

        //  disabled links
        $element.delegate( "a.disabled", "click", function( e )
        {
            e.preventDefault();
        } );

        // Populate the selects
        if( $focusIndustry )
        {
            $focusIndustry.bidx_chosen(
            {
                dataKey:            "industry"
            });

            $focusIndustry.trigger( "chosen:updated" );
        }
       /*******
        Add Dropdown Options for Recipients , Prepare dropdown
        *******/
        if( $businessSummary )
        {
            $businessSummary.chosen({
                                        placeholder_text_single : bidx.i18n.i( "msgWaitForSave" )
                                    ,   width                   : "95%"
                                    ,   disable_search_threshold : 10
                                    });

            if ( visitingMemberPageId !== loggedInMemberId  )
            {

                getMentoringRequest(
                {
                    callback    :   function()
                                    {
                                        var bpLength    = _.size(listDropdownBp); //Have to add the condition because when user is mentor and viewing normal profile then we dont want to populate dropdown
                                        if( bpLength )
                                        {
                                            _getBusinessPlans( )
                                            .done( function( listBpItems )
                                            {

                                                bidx.utils.log('listBpItems',listBpItems);
                                                $businessSummary.append( listBpItems );
                                                $businessSummary.trigger( "chosen:updated" );

                                            } );
                                        }
                                    }
                });
            }
        }
    }


    // This is the startpoint
    //
    function _initMentorRequest( options )
    {
        var $btnSave    = $element.find('.btnRequestSubmit')
        ,   $btnCancel  = $element.find('.btnRequestCancel')
        ,   origBpLength = _.size(listDropdownBp)
        ,   btnHtml
        ,   businessPlanEntityId
        ,   newBpLength
        ;

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
            debug: false
        ,   ignore: ".chosen-search input"
        ,   rules:
            {
                "summary":
                {
                    required:               true
                }
            }
        ,   messages:
            {
                "businessSummary": "Please choose one of the business summary"
            }
        ,   submitHandler: function( e )
            {
                if ( $btnSave.hasClass( "disabled" ) )
                {
                    return;
                }

                btnHtml              = $btnSave.text();
                businessPlanEntityId = $element.find( "[name='businessSummary']" ).val();

                $btnSave.addClass( "disabled" ).i18nText("msgWaitForSave");
                $btnCancel.addClass( "disabled" );


                _doCreateMentorRequest(
                {
                    params:
                    {
                        mentorId    :   options.params.mentorId
                    ,   initiatorId :   options.params.initiatorId
                    ,   entityId    :   businessPlanEntityId
                    }
                ,   callback: function()
                    {
                        $btnSave.removeClass( "disabled" );
                        $btnCancel.removeClass( "disabled" );
                        $btnSave.text(btnHtml);

                        bidx.utils.log('listDropdownBp',listDropdownBp);
                        bidx.utils.log('businessPlanEntityId',businessPlanEntityId);
                        listDropdownBp = _.omit(listDropdownBp, businessPlanEntityId );
                        bidx.utils.log('newlistDropdownBp',listDropdownBp);


                        $businessSummary.find("option[value='" + businessPlanEntityId + "']").remove();
                        $businessSummary.trigger('chosen:updated');

                        newBpLength    = _.size(listDropdownBp); // After iteration new length

                        if( origBpLength && newBpLength === 0 )
                        {
                            $requestMentoringBtn.addClass('disabled').i18nText("btnRequestSent");
                        }
                        else {

                        }
                        $requestMentoringBtn.removeClass('hide');

                        if (options && options.success)
                        {
                            options.success();
                        }


                    }
                ,   error: function()
                    {
                        $btnSave.removeClass( "disabled" );
                        $btnCancel.removeClass( "disabled" );
                        $btnSave.text(btnHtml);

                        if (options && options.error)
                        {
                            options.error();
                        }
                    }
                } );

            }
        } );
    }

    function getMentoringRequest (options)
    {
            var mentorId
            ,   entityId
            ,   initiatorId
            ,   bpClass
            ,   $mentorButton
            ,   isEntityExist
            ,   newBpLength
            ,   origBpLength = _.size(listDropdownBp)
            ;

            bidx.api.call(
                "mentorRelationships.get"
            ,   {
                    requesterId:              loggedInMemberId
                ,   groupDomain:              bidx.common.groupDomain
                ,   success: function( response )
                    {
                        // now format it into array of objects with value and label
                        //
                        $.each( response , function ( idx, item)
                        {
                            mentorId        = item.mentorId;
                            initiatorId     = item.initiatorId;
                            entityId        = item.entityId;

                            if ( mentorId === loggedInMemberId )
                            {
                                bpClass         = '.bp-' + entityId;
                                $mentorButton   = $elementMyprofile.find( bpClass );
                                if($mentorButton)
                                {
                                    $mentorButton.addClass('disabled').i18nText("btnRequestSent");
                                }
                            }

                            if (initiatorId === loggedInMemberId && origBpLength)
                            {
                                bidx.utils.log('listDropdownBp',listDropdownBp);
                                isEntityExist = listDropdownBp [ entityId ];

                                if(isEntityExist)
                                {
                                    listDropdownBp = _.omit(listDropdownBp, JSON.stringify(entityId) ); // removed the match value from listDropdownBp, using underscore function make sure its included

                                }
                            }
                        });

                        newBpLength    = _.size(listDropdownBp); // After iteration new length

                        if( origBpLength && newBpLength === 0 )
                        {
                            $requestMentoringBtn.addClass('disabled').i18nText("btnRequestSent");
                        }

                        $requestMentoringBtn.removeClass('hide');

                        //  execute callback if provided
                        if (options && options.callback)
                        {
                            options.callback();
                        }

                    }
                    , error: function(jqXhr, textStatus)
                    {

                        var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                         _showMainError("Something went wrong while retrieving contactlist of the member: " + status);

                         //  execute callback if provided
                        if (options && options.callback)
                        {
                            options.callback();
                        }
                    }
                }
            );

    };


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
            if( $this.attr( "data-href") ){
                href = $this.attr( "data-href" ) + $.param( params ) ;

                $this.attr( "href", href );
            }
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

    function _showAllView( view )
    {
        bidx.utils.log(view);
        $viewsMyprofile.filter( bidx.utils.getViewName( view ) ).show();
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
                    ,   params:
                        {
                            mentorId    :   loggedInMemberId
                        ,   initiatorId :   loggedInMemberId
                        ,   entityId    :   options.params.entityId
                        }
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
                var bpClass       = '.bp-' + options.params.entityId
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
                ,   error: function()
                    {
                        $elementMyprofile.find( bpClass ).removeClass('disabled').i18nText('btnTryAgain');
                    }
                } );

            break;  /***** Mentor this plan End functionlaity **/

           case "confirmMentoringRequest": /***** Request mentoring this plan Start functionlaity **/
                var $requestMentoringBtn = $elementMyprofile.find( '.btn-mentoring' );

                _closeModal(
                {
                    unbindHide: true
                } );

                if( !listDropdownBp )
                {
                    _showModal(
                    {
                        view  : "nobusinesssummary"

                    } );

                }
                else if( options.params )
                {
                    _initMentorRequest(
                    {
                        params:
                        {
                            mentorId    :   options.params.mentorId
                        ,   initiatorId :   loggedInMemberId
                        }
                    ,   success: function()
                        {


                            _showMainSuccessMsg(bidx.i18n.i("statusRequest"));
                            window.bidx.controller.updateHash("#cancel");

                            _closeModal(
                            {
                                unbindHide: true
                            } );
                        }
                    ,   error: function()
                        {
                            $requestMentoringBtn.removeClass('disabled').i18nText('btnTryAgain');
                            window.bidx.controller.updateHash("#cancel");
                            _closeModal(
                            {
                                unbindHide: true
                            } );
                        }
                    } );

                    _showModal(
                    {
                        view  : "confirmMentoringRequest"
                    ,   params: options.params
                    ,   onShow: function()
                        {
                             //_populateDefaultData();


                        }
                    } );
                }

            break;

            default: /***** Fetch mentoring request **/


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
    _populateDefaultData();

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


    // if hash is empty and there is not path in the uri, load #home
    //
    if ($("body.bidx-member_profile").length && !bidx.utils.getValue(window, "location.hash").length)
    {
       // window.location.hash = "#member";
    }


} ( jQuery ));
