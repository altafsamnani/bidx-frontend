;( function ( $ )
{
    "use strict";
    var $body               = $( "body" )
    ,   $mainElement        = $( "#commenting" )
    
    ,   bidx                = window.bidx
    ,   currentGroupId      = bidx.common.getCurrentGroupId( "currentGroup ")
    ,   currentUserId       = bidx.common.getCurrentUserId( "id" )
    ,   entityId            = parseInt( $( "#businessSummary" ).attr("data-bsid"), 10 )
    ,   appName             = "commenting"

    ,   $panelFeedback      = $( ".panel-feedback" )

    ;

    function _oneTimeSetup()
    {
        // Starting point, get feedback object to determine if user can view / add / edit or not
        //
        _getFeedbackComments(
                        { params :
                            {
                                entityId  : entityId
                            }
                        });

        _hideAlerts();
    }

    // Function to show / hide the feedback panel by clicking in the Feedback / Hide Feedback that appears on the right side of the panel-heading title
    //
    function _showHideFeedbackPanel( element )
    {
        var $btnFeedback = $( element );
        
        $btnFeedback.on('click', function()
        {
            var $el = $(this)
            ,   $feedbackPanel  = $el.closest(".panel-feedback")
            ,   $feedbackBox    = $feedbackPanel.find(".feedback-box")
            ,   $feedbackScope  = $feedbackPanel.find(".feedback-scope")
            ,   $attachmentItem = $feedbackScope.find(".attachmentItem")
            ,   $halfs          = $feedbackPanel.find(".feedback-scope .row > div")
            ,   txt             = $feedbackBox.is( ":visible" ) ? bidx.i18n.i( "showFeedback" ) : bidx.i18n.i( "hideFeedback" )
            ;

            if ( $feedbackBox.hasClass( "hide" ) )
            {
                $feedbackBox.removeClass( "hide" );
                $feedbackScope.removeClass( "col-sm-12" ).addClass( "col-sm-8 hidden-xs" );
                $attachmentItem.removeClass( "col-md-6" ).addClass( "col-md-12" );
                $halfs.removeClass( "col-sm-6" ).addClass( "col-sm-12" );
            }
            else
            {
                $feedbackBox.addClass( "hide" );
                $feedbackScope.removeClass( "col-sm-8 hidden-xs" ).addClass( "col-sm-12" );
                $attachmentItem.removeClass( "col-md-12" ).addClass( "col-md-6" );
                $halfs.removeClass( "col-sm-12" ).addClass( "col-sm-6" );
            }

            $el.find( "span" ).text( txt );
            $feedbackPanel.find(".panel-body").css( { overflow: 'hidden' } );
        });
    }

    // Listen and handle all the buttons within the feedback panel
    // Buttons: "Add new feedback", "Cancel", "Submit feedback", "Delete" and "Edit"
    //
    function _handleClicked()
    {
        var $clickedBtn = $( ".btn-add-feedback, .btn-cancel-feedback, .btn-submit-feedback, .btn-delete-feedback, .btn-edit-feedback" );

        $clickedBtn.on('click', function( e )
        {
            e.preventDefault();

            var $el = $( this )
            ,   purpose = $el.attr( "data-purpose" )
            ,   target = _getTargetedParams( $el )
            ;

            switch (purpose)
            {
                case "addFeedback":

                    _handleNotificationMessages( target, "" );

                    _resetFeedbackSubmitForm( target );

                    _showFeedbackSubmitionForm( target );

                    break;

                case "cancelFeedback" :

                    _resetFeedbackSubmitForm( target );

                    _hideFeedbackSubmitionForm( target );

                    break;

                case "submitFeedback" :

                    _submitFeedbackPost( target );

                    break;

                case "deleteFeedback" :

                    _handleNotificationMessages( target, "" );

                    _destroyFeedbackPost( target.feedbackId, target );

                    break;

                case "editFeedback" :

                    _handleNotificationMessages( target, "" );

                    _editFeedbackPost( target );

                    break;
            }
        });
    }

    // General function to close alerts by clicking (X)
    //
    function _hideAlerts()
    {
        $body.delegate( ".feedback-notifications .close" , "click", function( e )
        {
            e.preventDefault();
            $(this).parent().addClass( "hide" );
        });
    }

    // Create the wrappers and insert the feedback in each panel that has the "panel-feedback" class 
    //
    function _createFeedbackPanelStructure()
    {
        var $btnFeedbackSnippet   = $( "<button />", { "class": "btn btn-warning btn-xs btn-feedback" })
                                    .prepend
                                    (
                                        $("<i/>", { "class": "fa fa-comments" })
                                    )
                                    .append
                                    (
                                        $("<span/>", { text: bidx.i18n.i( "showFeedback" ) })
                                    )
        ,   $addFeedbackBtn       = $( "<button />", { "class": "btn btn-primary btn-add-feedback btn-sm btn-block bottom-margin-lineheight", "data-purpose": "addFeedback", html: bidx.i18n.i( "addNewFeedback" ) } )
        ,   $textarea             = $( "<textarea />", { "class": "form-control" } )
        ,   $divCol12             = $( "<div />", { "class": "col-sm-12 feedback-scope" } )
        ,   $divRow               = $( "<div />", { "class": "row" } )
        ,   $cancelFeedbackBtn    = $( "<button />", { "class": "btn btn-link btn-cancel-feedback btn-xs pull-right", "data-purpose": "cancelFeedback", html: bidx.i18n.i( "btnCancel" ) } )
        ,   $submitFeedbackBtn    = $( "<button />", { "class": "btn btn-success btn-submit-feedback btn-xs pull-left", "data-purpose": "submitFeedback", html: bidx.i18n.i( "submitFeedback" ) } )
        ,   $feedbackBoxSnippet   = $( "<div />", { "class": "col-sm-4 main-padding feedback-box bg-warning hide" } )
                                    .append
                                    (
                                        $( "<div />", { "class": "feedback-notifications" } )
                                        .append
                                        (
                                            $( "<div />", { "class": "feedback-notification-success-add alert alert-success hide", html: bidx.i18n.i( "successAddingMsgFeedback" ) } )
                                            .append
                                            (
                                                 $( "<button />", { "class": "close", "type": "button" })
                                                .append
                                                (
                                                    $( "<span />", { "aria-hidden": "true", html: "&times;" })
                                                )
                                            )
                                        )
                                        .append
                                        (
                                            $( "<div />", { "class": "feedback-notification-success-delete alert alert-info hide", html: bidx.i18n.i( "successDeletingMsgFeedback" ) } )
                                            .append
                                            (
                                                 $( "<button />", { "class": "close", "type": "button" })
                                                .append
                                                (
                                                    $( "<span />", { "aria-hidden": "true", html: "&times;" })
                                                )
                                            )
                                        )
                                        .append
                                        (
                                            $( "<div />", { "class": "feedback-notification-error alert alert-danger hide", html: bidx.i18n.i( "errorMsgFeedback" ) } )
                                            .append
                                            (
                                                 $( "<button />", { "class": "close", "type": "button" })
                                                .append
                                                (
                                                    $( "<span />", { "aria-hidden": "true", html: "&times;" })
                                                )
                                            )
                                        )
                                    )
                                    .append
                                    (
                                        $addFeedbackBtn
                                    )
                                    .append
                                    (
                                        $( "<div />", { "class": "feedback-submit hide-overflow hide" } )
                                        .append
                                        (
                                            $textarea
                                        )
                                        .append
                                        (
                                            $submitFeedbackBtn
                                        )
                                        .append
                                        (
                                            $cancelFeedbackBtn
                                        )
                                    )
                                    .append
                                    (
                                        $( "<div />", { "class": "feedback-posts" } )
                                    )
        ;

        $.each( $panelFeedback, function( index, panel )
        {
            var $tabPane  = $(panel).first()
            ,   $showView = $tabPane.find( ".feedback-tabs" )
            ,   tabScope  = "bs" + $tabPane.find( ".feedback-tabs" ).attr("id").split("-")[1]
            ;

            $tabPane.append( $btnFeedbackSnippet.clone() );

            $showView
                .wrapInner( $divCol12.clone() )
                .wrapInner( $divRow.clone() )
                .children().first()
                .append( $feedbackBoxSnippet.clone() );

            $showView.find( ".feedback-box" ).attr( "data-scope", tabScope );
        });

        // Run this only if there are feedback panels created
        //
        _showHideFeedbackPanel( ".btn-feedback" );
    }

    // Create the structure of a post, accepts the feedback object by iteration or new created post
    //
    function _createFeedbackPost( feedback )
    {
        var $html = $("<div/>", { "class": "feedback-post", "data-feedbackid": feedback.feedbackId })
                    .append
                    (
                        $("<div/>", { "class": "feedback-commentor" })
                        .append
                        (
                            $("<strong/>")
                            .append
                            (
                                $("<small/>")
                                .append
                                (
                                    $("<span/>", { "class": "feedback-date", text: bidx.utils.parseTimestampToDateTime( feedback.created, "date" ) + " by " })
                                )
                                .append
                                (
                                    $("<a/>", { "class": "feedback-commentor-name", href: "/member/" + feedback.commentorId, text: feedback.commentorDisplayName })
                                )
                            )
                        )
                    )
        ;

        if ( feedback.canDelete )
        {
            $html.find( ".feedback-commentor" )
            .append
            (
                $("<div/>", { "class": "feedback-actions pull-right" })
                .append
                (
                    $("<button/>", { "class": "btn btn-xs btn-success btn-edit-feedback", "data-purpose": "editFeedback" })
                    .append
                    (
                        $("<i/>", { "class": "fa fa-pencil" })
                    )
                )
                .append
                (
                    $("<span/>", { html: "&nbsp;" })
                )
                .append
                (
                    $("<button/>", { "class": "btn btn-xs btn-danger btn-delete-feedback", "data-purpose": "deleteFeedback" })
                    .append
                    (
                        $("<i/>", { "class": "fa fa-trash-o" })
                    )
                )
            );
        }

        $html
            .append(
            $("<div/>", { "class": "feedback-comment" })
                .append
                (
                    _parseComment ( feedback.comment )
                )
            );

        $('*[data-scope="'+feedback.scope+'"]').find( ".feedback-posts" ).prepend( $html.fadeIn( "slow" ) );
    }

    // Regular expression to change "returns" to <breaks> || Used in post listing
    //
    function _parseComment( comment )
    {
        var $htmlParser = $( "<div/>", { "class": "feedback-temp-parse-comment", html: comment } );

        return $htmlParser.text().replace( /\n/g, "<br/>" );
    }

    // Regular expression to change <breaks> to "returns" || Used in post editing
    //
    function _unParseComment( comment )
    {
        var $htmlParser = $( "<div/>", { "class": "feedback-temp-unparse-comment", html: comment } );

        return $htmlParser.text().replace( /<br\s*[\/]?>/gi, "\n" );
    }

    // Show the textarea to write a feedback
    //
    function _showFeedbackSubmitionForm( $elem )
    {
        $elem.$feedbackSubmitBox.removeClass( "hide" );
        $elem.$element.hide();
        $elem.$textarea.focus();
    }

    // Hide the textarea
    //
    function _hideFeedbackSubmitionForm( $elem )
    {
        $elem.$feedbackSubmitBox.addClass( "hide" );
        $elem.$element.show();
    }

    // Prepare the post for submiting
    //
    function _submitFeedbackPost( $elem )
    {
        var toRemoveId
        ,   postData   = {
                             commentorId:     currentUserId
                         ,   comment:         $elem.message
                         ,   scope:           $elem.scope
                         }
        ;

        toRemoveId = $elem.$feedbackBox.find( ".feedback-to-remove" ).length ? $elem.$feedbackBox.find( ".feedback-to-remove" ).data( "feedbackid" ) : false;

        if ( $elem.message )
        {
            $elem.$btnSubmitFeedback.addClass( "disabled" );
            $elem.$textarea.attr( "disabled" , true);

            _doPostFeedback( postData, $elem, toRemoveId );
        }
    }

    // Delete the post
    //
    function _destroyFeedbackPost( feedbackId, $elem )
    {
            var postData  =  {
                                feedbackId:     feedbackId
                             };

            _doDestroyFeedback( postData, $elem );
    }

    // Fake edit the post by copying a new instance in the textarea, creating new post in order to appear at the top and on success delete the one that has the class "feedback-to-remove"
    //
    function _editFeedbackPost( target )
    {
        if ( target.$feedbackSubmitBox.hasClass( "hide" ) )
        {
            target.$btnAddFeedback.click();
        }

        target.$textarea.val( _unParseComment( target.comment ) );

        target.$feedbackBox.find( ".btn-edit-feedback" ).removeClass( "disabled" );
        target.$feedbackBox.find( ".btn-delete-feedback" ).removeClass( "disabled" );
        target.$feedbackBox.find( ".feedback-post" ).removeClass( "feedback-to-remove" );

        target.$feedbackPost.addClass( "feedback-to-remove" );
        target.$btnDeleteFeedback.addClass( "disabled" );
        target.$btnEditFeedback.addClass( "disabled" );
    }

    // The initial state of a textarea
    //
    function _resetFeedbackSubmitForm ( $elem )
    {
        $elem.$btnSubmitFeedback.removeClass( "disabled" );
        $elem.$textarea.val( "" ).attr( "disabled" , false);
        $elem.$feedbackSubmitBox.addClass( "hide" );
        $elem.$feedbackBox.find( ".btn-edit-feedback" ).removeClass( "disabled" );
        $elem.$feedbackBox.find( ".btn-delete-feedback" ).removeClass( "disabled" );
        $elem.$feedbackBox.find( ".feedback-post" ).removeClass( "feedback-to-remove" );
        $elem.$btnAddFeedback.show();
    }

    // Show a notification message according the action that was taken
    //
    function _handleNotificationMessages( $elem, state )
    {
        if ( $elem )
        {
            $elem.$notifications.find( ".alert" ).removeClass( "hide" ).addClass( "hide" );
    
            if ( state )
            {
                switch ( state )
                {
                    case "added":

                        $elem.$notiAdded.removeClass( "hide" );

                        break;

                    case "deleted" :

                        $elem.$notiDeleted.removeClass( "hide" );

                        break;

                    case "error" :

                        $elem.$notiError.removeClass( "hide" );

                        break;
                }
            }
        }

    }

    // actual sending of message to API || POST
    //
    function _doPostFeedback( postData, $elem, toRemoveId )
    {
        if ( !postData.comment )
        {
            return;
        }

        bidx.api.call(
            "feedback.create"
        ,   {
                groupDomain:              bidx.common.groupDomain
            ,   id:                       entityId
            ,   data:                     postData

            ,   success: function( response )
                {
                    bidx.utils.log( "[commenting] Comment sent", response );

                    if ( toRemoveId )
                    {
                        _destroyFeedbackPost( toRemoveId, false );
                    }

                    _createFeedbackPost( response.data );

                    var $newAddedFeedback  = $( "[data-feedbackid="+ response.data.feedbackId +"]" )
                    ,   $btnDeleteFeedback = $newAddedFeedback.find( ".btn-delete-feedback" )
                    ,   $btnEditFeedback   = $newAddedFeedback.find( ".btn-edit-feedback" )
                    ;

                    $btnDeleteFeedback.on('click', function()
                    {
                        _destroyFeedbackPost( response.data.feedbackId, _getTargetedParams( this ) );
                    });

                    $btnEditFeedback.on('click', function()
                    {
                        _editFeedbackPost( _getTargetedParams( this ) );
                    });

                    _resetFeedbackSubmitForm( $elem );

                    _handleNotificationMessages( $elem, "added" );
                }

            ,   error: function( jqXhr, textStatus )
                {
                    var response = $.parseJSON( jqXhr.responseText);

                    // 400 errors are Client errors
                    //
                    if ( jqXhr.status >= 400 && jqXhr.status < 500)
                    {
                        bidx.utils.error( "Client  error occured", response );
                        // _showMainError( "Something went wrong while sending the feedback: " + response.text );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        // _showMainError( "Something went wrong while sending the feedback: " + response.text );
                    }

                    _resetFeedbackSubmitForm( $elem );

                    _handleNotificationMessages( $elem, "error" );
                }
            }
        );
    }

    // actual sending of message to API || DELETE
    //
    function _doDestroyFeedback( postData, $elem )
    {
        if ( !postData )
        {
            return;
        }

        bidx.api.call(
            "feedback.cancel"
        ,   {
                groupDomain:              bidx.common.groupDomain
            ,   id:                       entityId
            ,   data:                     postData

            ,   success: function( response )
                {
                    bidx.utils.log( "[commenting] Comment destroyed ", postData.feedbackId );

                    $('*[data-feedbackid="'+postData.feedbackId+'"]').fadeOut( "slow", function() { this.remove(); } );

                    _handleNotificationMessages( $elem, "deleted" );
                }

            ,   error: function( jqXhr, textStatus )
                {
                    var response = $.parseJSON( jqXhr.responseText);

                    // 400 errors are Client errors
                    //
                    if ( jqXhr.status >= 400 && jqXhr.status < 500)
                    {
                        bidx.utils.error( "Client  error occured", response );
                        // _showMainError( "Something went wrong while sending the feedback: " + response.text );

                        _handleNotificationMessages( $elem, "error" );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        // _showMainError( "Something went wrong while sending the feedback: " + response.text );

                        _handleNotificationMessages( $elem, "error" );
                    }
                }
            }
        );
    }

    // Call to the API || GET
    //
    function _getFeedbackComments( options )
    {

        var params                  = options.params
        ,   $d                      = $.Deferred()
        ;

        bidx.utils.log( "[commenting] fetching comments ", options );

        bidx.api.call(
            "feedback.fetch"
        ,   {
                id:                entityId
            ,   groupDomain:       bidx.common.groupDomain
            ,   success: function( response )
                {
                    if ( response.data.canCreate )
                    {
                        _createFeedbackPanelStructure();
                    }

                    if ( response.data.feedbacks )
                    {
                        bidx.utils.log( "[commenting] following comments received", response.data );

                        $.each( response.data.feedbacks , function( index, feedback )
                        {
                            _createFeedbackPost( feedback );
                        });


                    }
                        _handleClicked();
                }

            ,   error: function( jqXhr, textStatus )
                {

                    var response = $.parseJSON( jqXhr.responseText );

                    if ( jqXhr.status >= 400 && jqXhr.status < 500 )
                    {
                        bidx.utils.error( "Client  error occured", response );
                        // _showMainError( "Something went wrong while retrieving the comments: " + response.text );
                    }

                    if ( jqXhr.status >= 500 && jqXhr.status < 600 )
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        // _showMainError( "Something went wrong while retrieving the comments: " + response.text );
                    }

                    $d.reject();
                }
            }
        );

        return $d.promise();
    }

    // Get the parameters based on the $(this) element. Note that not all the elements or the variables are filled, sometimes they are empty or falsy but that's fine.
    //
    function _getTargetedParams( elem )
    {
        var $elem = $(elem)
        ,   $feedbackPanel          = $elem.closest(".panel-feedback")
        ,   $feedbackBox            = $feedbackPanel.find(".feedback-box")
        ,   $feedbackSubmitBox      = $feedbackPanel.find(".feedback-submit")
        ,   $feedbackPost           = $elem.closest( ".feedback-post" )
        ,   $textarea               = $feedbackPanel.find( ".feedback-submit textarea" )
        ,   $btnAddFeedback         = $feedbackPanel.find( ".btn-add-feedback" )
        ,   $btnSubmitFeedback      = $feedbackPanel.find( ".btn-submit-feedback" )
        ,   $btnDeleteFeedback      = $feedbackPost.find( ".btn-delete-feedback" )
        ,   $btnEditFeedback        = $feedbackPost.find( ".btn-edit-feedback" )
        ,   $notifications          = $feedbackBox.find( ".feedback-notifications" )
        ,   $notiAdded              = $notifications.find( ".feedback-notification-success-add" )
        ,   $notiDeleted            = $notifications.find( ".feedback-notification-success-delete" )
        ,   $notiError              = $notifications.find( ".feedback-notification-error" )
        ,   comment                 = $feedbackPost.find( ".feedback-comment" ).html()
        ,   feedbackId              = $feedbackPost.attr( "data-feedbackid" )
        ,   scope                   = $feedbackBox.attr( "data-scope" )
        ,   message                 = $textarea.val()
        ,   params
        ;

        params =
        {
            entityId                : entityId
        ,   scope                   : scope
        ,   message                 : message
        ,   feedbackId              : feedbackId
        ,   comment                 : comment

        ,   $feedbackPanel          : $feedbackPanel
        ,   $feedbackBox            : $feedbackBox
        ,   $feedbackSubmitBox      : $feedbackSubmitBox
        ,   $feedbackPost           : $feedbackPost
        ,   $textarea               : $textarea
        ,   $btnAddFeedback         : $btnAddFeedback
        ,   $btnSubmitFeedback      : $btnSubmitFeedback
        ,   $btnDeleteFeedback      : $btnDeleteFeedback
        ,   $btnEditFeedback        : $btnEditFeedback
        ,   $notifications          : $notifications
        ,   $notiAdded              : $notiAdded
        ,   $notiDeleted            : $notiDeleted
        ,   $notiError              : $notiError
        ,   $element                : $elem

        };

        return params;
    }

    //expose
    // var commenting =
    //         {
    //             navigate    : navigate
    //         ,   refresh     : _setCountsAndDisplays
    //         };


    // if (!window.bidx)
    // {
    //     window.bidx = {};
    // }
    // window.bidx.commenting = commenting;

    // Make sure the i18n translations for this app are available before initing
    //
    bidx.i18n.load( [ "__global", appName ] )
            .done( function()
            {
                if ( $panelFeedback )
                {
                    _oneTimeSetup();
                }
            } );

}(jQuery));

