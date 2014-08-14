;( function ( $ )
{
    "use strict";
    var $mainElement         = $("#mentor-dashboard")
    ,   $mainViews           = $mainElement.find(".view")
    ,   $mainModals          = $mainElement.find(".modalView")
    ,   $mainModal
    ,   $editForm            = $mainElement.find( ".frmsendFeedback" )
    ,   $feedbackDropDown    = $mainElement.find( "[name='feedbackpurpose']" )

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

    ,   listDropdownFeedback =  [ "feedbackGeneral", "feedbackOverview", "feedbackBusiness", "feedbackTeam", "feedbackFinancial", "feedbackCompany", "feedbackMentoring", "feedbackDocument" ]

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

        // Populate the selects
        //

       /* $feedbackDropDown.bidx_chosen(
        {
            dataKey:            "feedback"
        });

        $feedbackDropDown.trigger( "chosen:updated" );*/

       /*******
        Add Dropdown Options for Recipients , Prepare dropdown
        *******/
        $options = $feedbackDropDown.find( "option" );

        if(listDropdownFeedback) {

            $.each( listDropdownFeedback, function( idx, bpIdx )
            {
                option = $( "<option/>",
                {
                    value: bpIdx
                } );
                option.text( bidx.i18n.i( bpIdx )  );

                listArrItems.push( option );
            } );
        }

        // add the options to the select
        $feedbackDropDown.append( listArrItems );

        // init bidx_chosen plugin
        $feedbackDropDown.bidx_chosen();
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

    function _initAddFeedback( options )
    {
        var $btnSave    = $mainElement.find('.btn-feedback-submit')
        ,   $btnCancel  = $mainElement.find('.btn-feedback-cancel')
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
        ,   rules:
            {
                "feedback":
                {
                    required:               true
                }
            }
        ,   submitHandler: function( e )
            {
                if ( $btnSave.hasClass( "disabled" ) )
                {
                    return;
                }

                $btnSave.addClass( "disabled" );
                $btnCancel.addClass( "disabled" );

                _closeMainModal(
                {
                    unbindHide: true
                } );

                _showMainModal(
                {
                    view  : "confirmFeedback"
                ,   params: options.params
                ,   onShow: function() // Changing hash on change because its onclick event so chagne feedback link will be pointing to current hash so need to change that
                    {
                        window.bidx.controller.updateHash("#dashboard/mentor", false, false);
                    }
                ,   onHide: function()
                    {
                        $btnSave.removeClass( "disabled" );
                        $btnCancel.removeClass( "disabled" );
                    }
                } );
            }
        } );
    }

    // this function prepares the message package for the API to accept
    //
    /*
            API expected format
            {
                "userIds": ["number"]
            ,   "subject": "string"
            ,   "content": "string"
            }
        */
    /*
    function _prepareFeedback( options )
    {


        var option
        ,   contentFeedback
        ,   params = options.params
        ,   subject
        ,   userArrItems = []
        ,   message = {} // clear message because it can still hold the reply content
        ;

        subject         = 'Feedback on ' +  bidx.utils.getElementValue( $feedbackDropDown );
        contentFeedback = bidx.utils.getElementValue( $editForm.find( "[name=feedback]" ) );
        userArrItems.push( params.requesterId );


        bidx.utils.setValue( message, "userIds", userArrItems );
        bidx.utils.setValue( message, "subject", subject );
        bidx.utils.setValue( message, "content", contentFeedback);

        return message;


    }
    */

    // actual sending of message to API
    //
    function _doSendFeedback( options )
    {
        //var key = "sendingMessage";



        var params  =   options.params
        ,   postData
        ,   message =   bidx.utils.getElementValue( $editForm.find( "[name=feedback]" ) )
        ,   scope   =   bidx.utils.getElementValue( $editForm.find( "[name=feedbackpurpose]" ) )
        ;

        if ( !message )
        {
            return;
        }

        postData =  {
                        commentorId:     params.commentorId
                    ,   comment:         message
                    ,   scope:           (scope) ? scope : 'feedbackGeneral'
                    };

        bidx.api.call(
            "feedback.create"
        ,   {
                groupDomain:              bidx.common.groupDomain
            ,   id:                       params.entityId
            ,   data:                     postData

            ,   success: function( response )
                {

                    bidx.utils.log( "[feedback] Feedback send", response );
                    //var key = "messageSent";

                    bidx.common.notifyCustomSuccess( bidx.i18n.i( "feedbackSent", appName ) );

                    if (options && options.callback)
                    {
                        options.callback();
                    }

                    bidx.controller.updateHash( "#mentoring/mentor", false, false );
                }

            ,   error: function( jqXhr, textStatus )
                {

                    var response = $.parseJSON( jqXhr.responseText);

                    // 400 errors are Client errors
                    //
                    if ( jqXhr.status >= 400 && jqXhr.status < 500)
                    {
                        bidx.utils.error( "Client  error occured", response );
                        _showMainError( "Something went wrong while sending the feedback: " + response.text );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        _showMainError( "Something went wrong while sending the feedback: " + response.text );
                    }

                    if (options && options.callback)
                    {
                        options.callback();
                    }

                }
            }
        );

    }

    function showMemberProfile( options )
    {
        var bidxMeta
        ,   item        = options.item
        ;

        if($.isEmptyObject( memberData[ item.commentorId ] ))
        {
            bidx.api.call(
                "member.fetch"
            ,   {
                    id:          item.commentorId
                ,   requesteeId: item.commentorId
                ,   groupDomain: bidx.common.groupDomain
                ,   success:        function( itemResult )
                    {
                        // now format it into array of objects with value and label

                        if ( !$.isEmptyObject(itemResult.bidxMemberProfile) )
                        {
                            //if( item.bidxEntityType == 'bidxBusinessSummary') {
                            bidxMeta       = bidx.utils.getValue( itemResult, "bidxMemberProfile.bidxMeta" );

                            if( bidxMeta  )
                            {
                                memberData[ item.commentorId ]   = itemResult.member.displayName;

                            }

                        }
                        //  execute callback if provided
                        if (options && options.callback)
                        {
                            options.callback( item );
                        }

                    }
                ,   error: function(jqXhr, textStatus)
                    {
                        return false;
                    }
                }
            );
        } else {

            //  execute callback if provided
            if (options && options.callback)
            {
                options.callback( item );
            }

        }



        return;

    }

    function _getMemberData ()
    {
        var  mentorMemberData
        ,   entrepreneurMemberData
        ,   groupOwnersArr = []
        ;

        // Add member that are already retrieved through entre/mentor calls
        mentorMemberData            = bidx.utils.getValue( bidx, "entrepreneurmentordashboard.memberData" );
        entrepreneurMemberData      = bidx.utils.getValue( bidx, "mentormentordashboard.memberData" );

        mentorMemberData            = (mentorMemberData) ? mentorMemberData : {};
        entrepreneurMemberData      = (entrepreneurMemberData) ? entrepreneurMemberData : {};

        //Add current user
        memberData                  = _.extend(mentorMemberData, entrepreneurMemberData);
        memberData [currentUserId ] =  bidx.common.getSessionValue( 'displayName' );

        // Add Groupowners
        groupOwnersArr = bidx.common.getSessionValue( 'groupOwners' );
        $.each( groupOwnersArr, function( index, item )
        {
            memberData [item.id ] =  item.displayName;
        } );

        return memberData;

    }

    function _replaceViewFeedbackContent (newListItem, item ) {

         newListItem = newListItem
                                            .replace( /%readEmailHref%/g, document.location.hash +  "/id=" + item.feedbackId )
                                            .replace( /%accordion-id%/g, ( item.feedbackId ) ? item.feedbackId: "" )
                                            .replace( /%emailRead%/g, ( !item.read ) ? "email-new" : "" )
                                            .replace( /%emailNew%/g, ( !item.read ) ? " <small>" + bidx.i18n.i( "feedbackNew", appName ) + "</small>" : "" )
                                            .replace( /%senderReceiverName%/g, item.senderReceiverName )
                                            .replace( /%dateSent%/g, bidx.utils.parseTimestampToDateTime( item.updated, "date" ) )
                                            .replace( /%timeSent%/g, bidx.utils.parseTimestampToDateTime( item.updated, "time" ) )
                                            .replace( /%comment%/g, item.comment )
                                    ;
        return newListItem;
    }

    function _prepareFeedbackListing( options )
    {

        var     $elementList
        ,       $filteredElementList
        ,       $scopeList
        ,       $orderedList = []
        ,       newScopeItem
        ,       $newScopeItem
        ,       scopeItem   =  $( "#feedback-scopeitem" ).html().replace( /(<!--)*(-->)*/g, "" )
        ,       $elements   =  options.elements;

        $elementList = _.indexBy($elements, 'updatedDate'); // First set the updateDate as a index ex [20140112] = value, [20140603] = value2


        if(listDropdownFeedback) {

            $.each( listDropdownFeedback, function( idx, bpIdx )
            {

                $filteredElementList = $elementList;

                $filteredElementList = _.where($filteredElementList , { scope: bpIdx }); // Find the element which matches scope ex feedbackGeneral, feedbackCompany etc , Underscore.js function

                if( $filteredElementList.length )
                {

                    newScopeItem     = scopeItem;

                    newScopeItem     = newScopeItem
                                      .replace( /%feedbackScopeName%/g, bidx.i18n.i( bpIdx ) )
                                      .replace( /%feedbackScopeId%/g, idx )
                                      ;

                    $newScopeItem    = $( newScopeItem );

                    $filteredElementList = _.pluck($filteredElementList, 'newListItem'); // Picku new list item to add html

                    $newScopeItem.find('.scopefeedback').append( $filteredElementList );

                    $orderedList.push( $newScopeItem );
                }

            } );
        }

        if( options && options.callback )
        {
            options.callback( $orderedList );
        }

    }


    function _doViewFeedbackRequest( options )
    {
            bidx.utils.log("[mail] get emails ", options );

            var $view                   = $mainModals.filter( bidx.utils.getViewName( options.view, "modal" ) )
            ,   $list                   = $view.find( ".list" )
            ,   listItem                =  $( "#feedback-listitem" ).html().replace( /(<!--)*(-->)*/g, "" )
            ,   $listEmpty              = $( $( "#feedback-empty") .html().replace( /(<!--)*(-->)*/g, "" ) )
            ,   $feedbackBtn            = $view.find( ".btn-feedback-submit" )
            ,   params                  = options.params
            ,   $d                      = $.Deferred()
            ,   messages
            ,   newListItem
            ;


            memberData = (memberData.length) ? memberData : _getMemberData( );

            bidx.api.call(
                "feedback.fetch"
            ,   {
                    id:                params.entityId
                ,   groupDomain:       bidx.common.groupDomain
                ,   success: function( response )
                    {
                        if( response )
                        {
                            bidx.utils.log("[feedback] following feedback received", response.data );
                            var item
                            ,   $element
                            ,   senderReceiverName
                            ,   $elements            = []
                            ,   counter             = 1
                            ,   feedbackLength      = (response.data) ? response.data.length : 0
                            ;

                            // clear listing
                            //
                            $list.empty();

                            // check if there are emails, otherwise show listEmpty
                            //
                            if( feedbackLength > 0 )
                            {
                                // loop through response
                                //
                                $.each( response.data, function( index, item )
                                {

                                    bidx.utils.log( 'id', currentUserId, 'comid', item.commentorId);

                                    showMemberProfile(
                                    {
                                        item     :   item
                                     ,  callback    :   function ( itemMember )
                                                        {
                                                            bidx.utils.log('itemMember', itemMember);
                                                            itemMember.senderReceiverName = memberData[ itemMember.commentorId ];
                                                            newListItem = listItem;
                                                            newListItem             = newListItem
                                                                                    .replace( /%readEmailHref%/g, document.location.hash +  "/id=" + itemMember.feedbackId )
                                                                                    .replace( /%accordion-id%/g, ( itemMember.feedbackId ) ? itemMember.feedbackId: "" )
                                                                                    .replace( /%emailRead%/g, ( !itemMember.read ) ? "email-new" : "" )
                                                                                    .replace( /%emailNew%/g, ( !itemMember.read ) ? " <small>" + bidx.i18n.i( "feedbackNew", appName ) + "</small>" : "" )
                                                                                    .replace( /%senderReceiverName%/g, itemMember.senderReceiverName )
                                                                                    .replace( /%dateSent%/g, bidx.utils.parseTimestampToDateTime( itemMember.updated, "date" ) )
                                                                                    .replace( /%timeSent%/g, bidx.utils.parseTimestampToDateTime( itemMember.updated, "time" ) )
                                                                                    .replace( /%comment%/g, itemMember.comment );

                                                            $element                =   {
                                                                                            newListItem: newListItem
                                                                                        ,   updatedDate: itemMember.updated
                                                                                        ,   scope      : ( itemMember.scope ) ? itemMember.scope : 'feedbackGeneral'
                                                                                        };

                                                            $elements.push( $element );

                                                            if( counter === feedbackLength )
                                                            {
                                                                _prepareFeedbackListing(
                                                                {
                                                                    elements:   $elements
                                                                ,   callback:   function( $orderedList )
                                                                                {
                                                                                    bidx.utils.log('ordereList', $orderedList );
                                                                                    $list.append( $orderedList );
                                                                                    $d.resolve( );
                                                                                }
                                                                } );

                                                            }

                                                            counter = counter + 1;

                                                        }
                                    } );

                                } );
                            } // end of handling emails from response
                            else
                            {
                                $list.append( $listEmpty );

                                $feedbackBtn.html( bidx.i18n.i( "feedbackAdd", appName ) );

                                $d.resolve( );
                            }
                            // execute callback if provided
                            //
                            if( options && options.callback )
                            {
                                options.callback( response);
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
                            _showMainError( "Something went wrong while retrieving the email(s): " + response.text );
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            _showMainError( "Something went wrong while retrieving the email(s): " + response.text );
                        }

                        $d.resolve( );

                    }
                }
            );

            return $d.promise( );
        }


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

    function _resetFeedbackForm()
        {

            //  reset formfield values
            //
            $editForm.find( ":input" ).val("");
            $feedbackDropDown.val();
            $feedbackDropDown.bidx_chosen();
            $editForm.validate().resetForm();

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

            case "addFeedback" :
                var $feedbackBtn = $mainElement.find( '.btn-feedback-submit' );

                _closeMainModal(
                {
                    unbindHide: true
                } );

                _initAddFeedback(
                    {
                        params: options.params
                    /*,   success: function()
                        {
                            //$feedbackDropDownBtn.addClass('disabled').i18nText("btnRequestSent");
                            _showMainSuccessMsg(bidx.i18n.i("statusRequest"));
                            window.bidx.controller.updateHash("#cancel");

                            _closeModal(
                            {
                                unbindHide: true
                            } );
                        }
                    ,   error: function()
                        {
                            $feedbackDropDownBtn.removeClass('disabled').i18nText('btnTryAgain');
                            window.bidx.controller.updateHash("#cancel");
                            _closeModal(
                            {
                                unbindHide: true
                            } );
                        }*/
                    } );


                _showMainModal(
                {
                    view  : "sendFeedback"
                ,   params: options.params
                /*,   onHide: function()
                    {
                        window.bidx.controller.updateHash("#mentoring/mentor", false, false);
                    }*/
                ,   onShow: function()
                    {
                       //_oneTimeSetup();


                    }

                } );


                break;

                case "sendFeedback" :

                var btnFeedbackText
                ,   $btnSave                  = $mainElement.find('.btn-feedback-submit')
                ,   $btnCancel                = $mainElement.find('.btn-feedback-cancel')
                ,   $btnConfirmFeedbackSave   = $mainElement.find('.btn-send-feedback')
                ,   $btnConfirmFeedbackCancel = $mainElement.find('.btn-cancel-feedback')
                ;

                btnFeedbackText = $btnConfirmFeedbackSave.text();


                $btnConfirmFeedbackSave.addClass( "disabled" ).i18nText("msgWaitForSave");
                $btnConfirmFeedbackCancel.addClass( "disabled" );


                _doSendFeedback(
                {
                    params: options.params
                ,   callback: function()
                    {
                        $btnSave.removeClass( "disabled" );
                        $btnCancel.removeClass( "disabled" );
                        $btnConfirmFeedbackSave.removeClass( "disabled" ).text( btnFeedbackText );
                        $btnConfirmFeedbackCancel.removeClass( "disabled" );
                        _resetFeedbackForm();
                        _closeMainModal(
                        {
                            unbindHide: true
                        } );

                    }
                } );

                break;

                case 'confirmFeedback' :

                _closeMainModal(
                {
                    unbindHide: true
                } );

                _showMainModal(
                {
                    view  : "confirmFeedback"
                ,   params: options.params
                /*,   onHide: function()
                    {
                        window.bidx.controller.updateHash("#mentoring/mentor", false, false);
                    }*/
                } );

                break;

                case 'viewFeedback' :

                _closeMainModal(
                {
                    unbindHide: true
                } );

                _doViewFeedbackRequest(
                {
                    params: options.params
                ,   view: 'listFeedback'
                /*,   callback: function()
                    {
                        _showMainModal(
                        {
                            view  : "listFeedback"
                        ,   params: options.params
                        } );

                    }*/
                } )
                .done( function(  )
                {
                    options.params.commentorId = currentUserId;
                    _showMainModal(
                        {
                            view  : "listFeedback"
                        ,   params: options.params
                        } );

                } );


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

