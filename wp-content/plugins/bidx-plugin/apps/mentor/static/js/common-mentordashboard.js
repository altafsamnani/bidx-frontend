;( function ( $ )
{
    "use strict";
    var $mainElement         = $("#mentor-dashboard")
    ,   $mainViews           = $mainElement.find(".view")
    ,   $mainModals          = $mainElement.find(".modalView")
    ,   $mainModal

    ,   $bpElement           = $("#businessSummary")
    ,   $mainBpViews         = $bpElement.find(".view")

    ,   $element             = $mainElement.find(".mentor-mentordashboard")
    ,   $views               = $element.find(".view")
    ,   bidx                 = window.bidx
    ,   $modals              = $element.find(".modalView")
    ,   $modal
    ,   currentGroupId       = bidx.common.getCurrentGroupId( "currentGroup ")
    ,   currentUserId        = bidx.common.getCurrentUserId( "id" )
    ,   appName              = 'mentor'
    ,   memberData           = {}

    ;

    function _oneTimeSetup()
    {
        var option
        ,   listArrItems = []
        ,   $options
        ;

        //  disabled links
        //
        $element.delegate( "a.disabled", "click", function( e )
        {
            e.preventDefault();
        } );

    }

     var getMentoringRequest = function(options)
    {

        bidx.api.call(
            "mentorRelationships.get"
        ,   {
                id:              bidx.common.getCurrentUserId( "id" )
            ,   groupDomain:     bidx.common.groupDomain
            ,   success: function( result )
                {
                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback( result );
                    }


                }
                , error: function(jqXhr, textStatus)
                {

                    var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                     _showMainError("Something went wrong while retrieving contactlist of the member: " + status);


                }
            }
        );

        return ;
    };


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

                       // uriStatus = document.location.href.split( "#" ).shift() + "?smsg=9" + '#mentoring/mentor';

                        //bidx.controller.updateHash(uriStatus, true, true);
                       // bidx.controller.doSuccess( uriStatus,false);



                        window.bidx.controller.updateHash( params.updateHash, true );

                        if (options && options.callback)
                        {
                            options.callback();
                        }

                    }

                }

            ,   error: function( jqXhr, textStatus )
                {

                    if (options && options.error)
                    {
                        options.error( jqXhr );
                    }

                }
            }
        );
    }

    // this function mutates the relationship between two contacts. Possible mutations for relationship: action=[ignore / accept]
    //
    function _doMutateMentoringRequest( options )
    {

        var uriStatus
        ,   smsg
        ,   updateHash
        ,   params = options.params
        ,   postData = {}
        ;

        postData =  {
                        initiatorId:     params.initiatorId
                    ,   status:     params.action
                    ,   reason:     params.type
                    };
         //uriStatus = document.location.href.split( "#" ).shift() + "?smsg=8&sparam=" + window.btoa('action=' + params.action) + '#mentoring/mentor';
         //document.location.href = uriStatus;
        //bidx.controller.updateHash(uriStatus, true, true);
        //bidx.controller.doSuccess( uriStatus,false);

        //return;
        bidx.api.call(
             "mentorRelationships.mutate"
        ,   {
                groupDomain:            bidx.common.groupDomain
            ,   entityId:               params.entityId
            ,   data:                   postData
            ,   success: function( response )
                {
                    bidx.utils.log("[mentor] mutated a contact",  response );
                    if ( response && response.status === "OK" )
                    {

                        //  execute callback if provided

                        updateHash  =   (params.redirect) ? params.redirect : '#mentoring/mentor';

                        window.bidx.controller.updateHash( updateHash, true );

                        if (options && options.callback)
                        {
                            options.callback();
                        }

                    }

                }

            ,   error: function( jqXhr, textStatus )
                {

                    var response = $.parseJSON( jqXhr.responseText);

                    if (options && options.error)
                    {
                        options.error();
                    }

                }
            }
        );
    }


    function _doCancelMentoringRequest( options )
    {

        var uriStatus
        ,   statusMsg
        ,   params = options.params
        ;

         //uriStatus = document.location.href.split( "#" ).shift() + "?smsg=8&sparam=" + window.btoa('action=' + params.action) + '#mentoring/mentor';
         //document.location.href = uriStatus;
        //bidx.controller.updateHash(uriStatus, true, true);
        //bidx.controller.doSuccess( uriStatus,false);

        //return;

        bidx.api.call(
             "mentorRelationships.cancel"
        ,   {
                groupDomain:    bidx.common.groupDomain
            ,   entityId:       params.entityId
            ,   success:        function( response )
                                {
                                    bidx.utils.log("[mentor] mutated a contact",  response );
                                    if ( response && response.status === "OK" )
                                    {

                                        //  execute callback if provided
                                        // uriStatus = document.location.href.split( "#" ).shift() + "?smsg=10" + '#mentoring/mentor';

                                        //bidx.controller.updateHash(uriStatus, true, true);
                                        //bidx.controller.doSuccess( uriStatus,false);
                                        statusMsg   =   (params.action === 'stop') ? 'statusStop' : 'statusCancel';

                                        _showMainSuccessMsg(bidx.i18n.i(statusMsg));

                                         window.bidx.controller.updateHash("#mentoring/mentor", true);

                                        if (options && options.callback)
                                        {
                                            options.callback();
                                        }

                                    }

                                }

            ,   error:          function( jqXhr, textStatus )
                                {

                                    var response = $.parseJSON( jqXhr.responseText);

                                    // 400 errors are Client errors
                                    //
                                    if ( jqXhr.status >= 400 && jqXhr.status < 500)
                                    {
                                        bidx.utils.error( "Client  error occured", response );
                                        _showMainError( "Something went wrong while updating a relationship: " + response.code );
                                    }
                                    // 500 erors are Server errors
                                    //
                                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                                    {
                                        bidx.utils.error( "Internal Server error occured", response );
                                        _showMainError( "Something went wrong while updating a relationship: " + response.code );
                                    }

                                    if (options && options.callback)
                                    {
                                        options.callback();
                                    }

                                }
            }
        );
    }


    //  ################################## MODAL #####################################  \\


    /*************** Main Views *************************/

    //  show modal view with optionally and ID to be appended to the views buttons
    function _showMainModal( options )
    {
        var href
        ,   replacedModal
        ,   action
        ,   redirect
        ,   actionKey
        ,   actionMsg
        ,   btnKey
        ,   btnTxt
        ,   params = {}
        ;

        if(options.params)
        {
            params  =   options.params;
            action  =   options.params.action;
            redirect =   bidx.utils.getValue(options.params, 'redirect');
        }

        bidx.utils.log("[dashboard] show modal", options );

        $mainModal        = $mainModals.filter( bidx.utils.getViewName ( options.view, "modal" ) ).find( ".bidx-modal");

        if( action )
        {
            // Modal popup message
            action      =   action.replace( /ed/g, '');
            actionKey   =   'modal' + action.substring(0,1).toUpperCase() + action.substring(1); // ex 'modalAccept, modalCancel, modalIgnore', 'modalStop'
            actionMsg   =   bidx.i18n.i( actionKey ) ;
           // bidx.utils.log("action", bidx.utils.getViewName ( options.view, "modal" )  );
            $mainModal.find(".modal-body").empty().append( actionMsg );

            //Modal Primary Button Text
            btnKey      =   'modalBtn' + action.substring(0,1).toUpperCase() + action.substring(1); // ex 'modalBtnAccept, modalBtnCancel, modalBtnIgnore', 'modalBtnStop'
            btnTxt      =   bidx.i18n.i( btnKey );
            $mainModal.find(".btn-primary").html(btnTxt);

            //Modal header change
            $mainModal.find("#myModalLabel").html(btnTxt);

            //Change the cancel button link if refresh exists
            if( redirect )
            {
                $mainModal.find(".btn-request-cancel").attr( 'href' , redirect + '/cancel=true') ;
            }
        }

        $mainModal.find( ".btn-primary[href], .btn-cancel[href]" ).each( function()
        {
            var $this = $( this );

            href = $this.attr( "data-href" ) + $.param( params ) ;

            $this.attr( "href", href );
        } );

        if( options.onHide )
        {
            //  to prevent duplicate attachments bind event only onces
            $mainModal.on( 'hidden.bs.modal', options.onHide );
        }

        if( options.onShow )
        {

            $mainModal.on( 'show.bs.modal' ,options.onShow );
        }

        $mainModal.modal( {} );

    }

    //  closing of modal view state
    var _closeMainModal = function(options)
    {
        if ($mainModal)
        {
            if (options && options.unbindHide)
            {
                $mainModal.unbind('hide');
            }
            $mainModal.modal('hide');
        }
    };

    var _showMainView = function(view, showAll)
    {

        //  show title of the view if available
        if (!showAll)
        {
            $mainViews.hide();
        }
         var $mainView = $mainViews.filter(bidx.utils.getViewName(view)).show();
    };
    var _showBpView = function(view, showAll)
    {

        //  show title of the view if available
        if (!showAll)
        {
            $mainBpViews.hide();
        }
         var $mainView = $mainBpViews.filter(bidx.utils.getViewName(view)).show();
    };

    var _showMainHideView = function(view, hideview)
    {

        $mainViews.filter(bidx.utils.getViewName(hideview)).hide();
        var $mainView = $mainViews.filter(bidx.utils.getViewName(view)).show();

    };

    var _hideMainView = function(hideview)
    {
        $mainViews.filter(bidx.utils.getViewName(hideview)).hide();
    };

    // display generic error view with msg provided
    //
    function _showMainError( msg )
    {
        $mainViews.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showMainView( "error" , true);
    }
    // display generic error view with msg provided
    //
    function _showBpError( msg )
    {
        $mainBpViews.filter( "#businessSummaryCollapse-MentoringDetails .viewError" ).append( msg ).show();
       // _showBpView( "error" , true);
    }

    function _hideBpError(msg)
    {
        $mainBpViews.filter( "#businessSummaryCollapse-MentoringDetails .viewError" ).hide();
    }
     // Private functions
    //
    function _showMainSuccessMsg( msg , hideview )
    {
        if( hideview ) {
            $mainViews.filter(bidx.utils.getViewName(hideview)).hide();
        }

        $mainViews.filter( ".viewMainsuccess" ).find( ".successMsg" ).text( msg );
        _showMainView( "mainsuccess" );
    }
    function _showBpSuccessMsg( msg , hideview )
    {
        if( hideview ) {
            $mainBpViews.filter(bidx.utils.getViewName(hideview)).hide();
        }

        $mainBpViews.filter( ".viewMainsuccess" ).find( ".successMsg" ).text( msg );
        _showBpView( "mainsuccess" );
    }

    // ROUTER


    //var navigate = function( requestedState, section, id )
    var navigate = function(options)
    {
        bidx.utils.log("routing options", options);
        var state
        ,   updateHash
        ;

        state  = options.state;



        switch (state)
        {
            /*case "load" :

                _showView("load");
                break;

             case "help" :
                 _menuActivateWithTitle(".Help","My mentor Helppage");
                _showView("help");
                break;*/

            case "cancel":

                _closeMainModal(
                {
                    unbindHide: true
                } );

                window.bidx.controller.updateHash("#cancel", false, true);

            break;

            case "confirmRequest":

                _hideBpError(); // Remove previous occured error

                _closeMainModal(
                {
                    unbindHide: true
                } );

                _showMainModal(
                {
                    view  : "confirmRequest"
                ,   params: options.params
                ,   onHide: function()
                    {
                        updateHash  = bidx.utils.getValue( options.params, 'redirect' );

                        if( !updateHash )
                        {
                            updateHash  = '#mentoring/mentor';
                            window.bidx.controller.updateHash( updateHash, false, false );

                        }

                    }
                } );

                break;

            case "confirmInitiateMentoring": /***** Mentor this plan Start functionlaity **/

                _hideBpError(); // Remove previous occured error
                _closeMainModal(
                {
                    unbindHide: true
                } );

                if( options.params ) {
                    bidx.utils.log('insideconfirm request');
                    _showMainModal(
                    {
                        view  : "confirmRequest"
                    ,   params: options.params
                    ,   onHide: function()
                        {
                           // window.bidx.controller.updateHash("#mentoring/mentor", false, false);
                        }
                    } );
                }
            break;

            case "sendRequest":
                var btnHtml
                ,   $mentorButton
                ,   params = options.params
                ,   smsg
                ,   action = params.action
                ;

                action = (params.action) ? params.action : 'default';

                $mentorButton = $mainElement.find( '.btn-request' );
                btnHtml = $mentorButton.text();
                $mentorButton.addClass( "disabled" ).i18nText("msgWaitForSave");

                _showMainView("loadrequest", true);

                switch( action )
                {

                    case 'cancel':
                    case 'stop':

                        _doCancelMentoringRequest(
                        {
                            params: params
                        ,   callback: function()
                            {
                                _showMainHideView("respond", "loadrequest");
                                $mentorButton.removeClass( "disabled" );
                                $mentorButton.text(btnHtml);
                                _closeMainModal(
                                {
                                    unbindHide: true
                                } );

                            }
                        } );

                    break;

                    case 'send':

                        params.updateHash = '#mentoring/mentor';

                         _doCreateMentorRequest(
                        {
                            params: params
                        ,   callback: function()
                            {
                                _showMainSuccessMsg(bidx.i18n.i("statusRequest"));
                                _showMainHideView("match", "loadrequest");
                                $mentorButton.removeClass( "disabled" );
                                $mentorButton.text(btnHtml);
                                _closeMainModal(
                                {
                                    unbindHide: true
                                } );

                            }
                        ,   error:  function(jqXhr)
                            {
                                var response = $.parseJSON( jqXhr.responseText);
                                bidx.utils.error( "Client  error occured", response );
                                _showMainError( bidx.i18n.i("errorRequest") + response.text);
                                 _hideMainView( 'loadrequest');
                                $mentorButton.removeClass( "disabled" );
                                $mentorButton.text(btnHtml);
                                _closeMainModal(
                                {
                                    unbindHide: true
                                } );
                            }
                        } );
                    break;

                    case 'sendFrmBp': // this is initiated from edit businesssummary-->mentor tab
                        params.updateHash = '#loadMentors';

                         _doCreateMentorRequest(
                        {
                            params: params
                        ,   callback: function()
                            {
                               _showBpSuccessMsg(bidx.i18n.i("statusRequest"));
                                $mentorButton.removeClass( "disabled" );
                                $mentorButton.text(btnHtml);
                                _closeMainModal(
                                {
                                    unbindHide: true
                                } );

                            }
                        ,   error:  function(jqXhr)
                            {
                                var response = $.parseJSON( jqXhr.responseText);
                                bidx.utils.error( "Client  error occured", response );
                                _showBpError( bidx.i18n.i("errorRequest") + response.text);
                                _hideMainView( 'loadrequest');
                                $mentorButton.removeClass( "disabled" );
                                $mentorButton.text(btnHtml);
                                _closeMainModal(
                                {
                                    unbindHide: true
                                } );

                            }
                        } );

                    break;

                    default:
                        _doMutateMentoringRequest(
                        {
                            params: params
                        ,   callback: function()
                            {
                                smsg       = (action === 'accepted') ? 'statusAccept' : 'statusIgnore';
                                _showMainSuccessMsg(bidx.i18n.i(smsg));

                                _showMainHideView("respond", "loadrequest");
                                $mentorButton.removeClass( "disabled" );
                                $mentorButton.text(btnHtml);
                                _closeMainModal(
                                {
                                    unbindHide: true
                                } );

                            }
                        ,   error: function(jqXhr)
                            {
                                var response = $.parseJSON( jqXhr.responseText);
                                bidx.utils.error( "Client  error occured", response );
                                _showBpError( bidx.i18n.i("errorRequest") + response.text);
                                _showMainHideView("respond", "loadrequest");
                                $mentorButton.removeClass( "disabled" );
                                $mentorButton.text(btnHtml);
                                _closeMainModal(
                                {
                                    unbindHide: true
                                } );
                            }
                        } );

                    break;
                }

                break;

            case 'mentor' :
                getMentoringRequest(
                {
                    list: "match"
                ,   view: "match"
                ,   callback: function( result )
                    {

                        var isMentor = bidx.utils.getValue( bidxConfig.session, "wp.entities.bidxMentorProfile" );

                        if ( isMentor )
                        {
                           options.result = result;

                            bidx.mentormentordashboard.navigate( options );
                        }

                        var isEntrepreneur = bidx.utils.getValue( bidxConfig.session, "wp.entities.bidxEntrepreneurProfile" );

                        if ( isEntrepreneur )
                        {
                            options.result = result;

                            bidx.entrepreneurmentordashboard.navigate( options );

                        }
                        /*_showHideView("respond", "loadrespond");
                        _showHideView("wait",    "loadwait");
                        _showHideView("ongoing", "loadongoing");
                        _showHideView("renew",   "loadrenew");
                        _showHideView("ended",   "loadended");*/



                    }
                } );

                break;
         }
    };

    _oneTimeSetup();

    //expose
    var mentoring =
            {
                navigate: navigate
              , $element: $element
            };


    if (!window.bidx)
    {
        window.bidx = {};
    }

    window.bidx.commonmentordashboard = mentoring;

    //Initialize Handlers
    //_initHandlers();


    if ($("body.bidx-mentor-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {

        document.location.hash = "#mentoring/mentor";
    }


}(jQuery));

