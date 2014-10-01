/**
 * TODO Sakis code formatter? (I only added the HTML to avoid my Eclipse formatter from merging all into one line.)
 * 
 * Commenting, including private notes, administrator annotations, and
 * mentor/investor feedback.
 * 
 * This app triggers its own Backbone routing, by taking control over all links
 * that define the following attributes:
 * 
 * <ul>
 * <li>href="#commenting" or href="#commenting/viewComments" to view comments</li>
 * <li>href="#commenting/writeComment" to write new comments</li>
 * <li>entity: data-entityid=123 or href="#commenting/.../entityId=123"</li>
 * <li>scopes for new comments and display:
 * data-scopes="general,bsOverview,bsFinancial"</li>
 * <li>scopes for new comment, but display all:
 * data-scopes="*general,bsOverview,bsFinancial"</li>
 * <li>optional: data-setcount=true to rewrite the link text if comments exist</li>
 * <li>optional: data-setdisplay=true to show/hide the link based on the user's
 * visibilities and the optional value for data-visibilty</li>
 * <li>optional visibilities to include:
 * data-visibilities="private,groupAdmin,mentor,investor" (will be converted
 * into a proper API enum value)</li>
 * <li>or, optional visibilities to exclude:
 * data-visibilities="!private,groupAdmin"</li>
 * </ul>
 * 
 * This approach allows for using multiple links, possibly for the same entity,
 * on a single page. When the app is initialized, it will:
 * 
 * <ul>
 * <li>Search for all data-setcounts links, if needed call the API to
 * determine the current counts and add those numbers to the link texts</li>
 * <li>Search for all href="#commenting/..." links, and bind their onclick to
 * its own routing, to ensure this works nicely within other apps</li>
 * </ul>
 * 
 * As for the server load, calling the API from the client is not more expensive
 * than having WordPress do that on page load. However, it implies the comments
 * cannot be indexed by search engines, and that the user's browser might use
 * some more data traffic.
 * 
 */
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
        _createFeedbackPanelStructure();

        _getFeedbackComments(
                        { params :
                            {
                                entityId  : entityId
                            }
                        });

        _showHideFeedbackPanel( ".btn-feedback" );

        _hideAlerts();

        _selectVisibility();
    }

    function _selectVisibility()
    {
        $body.delegate( ".feedback-visibilities button" , "click", function( e )
        {
            e.preventDefault();

            var $el = $(this)
            ,   $visibilitiesGroup = $el.closest( ".feedback-visibilities" )
            ;

            if ( !$el.hasClass( "active" ) )
            {
                $visibilitiesGroup.find( "button" ).removeClass( "active" );
                $el.addClass( "active" );
            }
        });
    }

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
            ,   txt             = $feedbackBox.is( ":visible" ) ? bidx.i18n.i( "showFeedback" ) : bidx.i18n.i( "hideFeedback" )
            ;

            if ( $feedbackBox.hasClass( "hide" ) )
            {
                $feedbackBox.removeClass( "hide" );
                $feedbackScope.removeClass( "col-sm-12" ).addClass( "col-sm-8 hidden-xs" );
                $attachmentItem.removeClass( "col-md-4" ).addClass( "col-md-6" );
            }
            else
            {
                $feedbackBox.addClass( "hide" );
                $feedbackScope.removeClass( "col-sm-8 hidden-xs" ).addClass( "col-sm-12" );
                $attachmentItem.removeClass( "col-md-6" ).addClass( "col-md-4" );
            }

            $el.find( "span" ).text( txt );
            $feedbackPanel.find(".panel-body").css( { overflow: 'hidden' } );
        });
    }

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

    function _hideAlerts()
    {
        $body.delegate( ".feedback-notifications .close" , "click", function( e )
        {
            e.preventDefault();
            $(this).parent().addClass( "hide" );
        });
    }

    function _createVisibilities( roles )
    {
        var $el = $( ".feedback-visibilities" )
        ,   btnText;

        $.each( roles, function( index, role )
        {
            switch (role)
            {
                case "PRIVATE":
                        btnText = bidx.i18n.i( "visiblePrivate" );
                    break;

                case "MENTOR" :
                        btnText = bidx.i18n.i( "visibleMentor" );
                    break;

                case "INVESTOR" :
                        btnText = bidx.i18n.i( "visibleInvestor" );
                    break;

                case "PUBLIC" :
                        btnText = bidx.i18n.i( "visiblePublic" );
                    break;

                case "GROUPADMIN" :
                        btnText = bidx.i18n.i( "visibleGroupadmin" );
                    break;
            }

            $el.append
                    (
                        $( "<div />", { "class": "btn-group" } )
                        .append
                        (
                            $( "<button />", { "class": "btn btn-warning btn-xs", text: btnText, "data-visibility": role })
                        )
                    );
        });
    }

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
        ,   $addFeedbackBtn       = $( "<button />", { "class": "btn btn-primary btn-add-feedback btn-sm btn-block", "data-purpose": "addFeedback", html: bidx.i18n.i( "addNewFeedback" ) } )
        ,   $textarea             = $( "<textarea />", { "class": "form-control" } )
        ,   $divCol12             = $( "<div />", { "class": "col-sm-12 feedback-scope" } )
        ,   $divRow               = $( "<div />", { "class": "row" } )
        ,   $cancelFeedbackBtn    = $( "<button />", { "class": "btn btn-link btn-cancel-feedback btn-xs pull-right", "data-purpose": "cancelFeedback", html: bidx.i18n.i( "btnCancel" ) } )
        ,   $submitFeedbackBtn    = $( "<button />", { "class": "btn btn-success btn-submit-feedback btn-xs pull-left", "data-purpose": "submitFeedback", html: bidx.i18n.i( "submitFeedback" ) } )
        ,   $visibilities         = $( "<div />", { "class": "btn-group btn-group-justified feedback-visibilities" } )
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
                                            $visibilities
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
            var $panelHeading  = $(panel).find( ".panel-heading" ).first()
            ,   $panelShowView = $(panel).find( ".panel-body .viewShow" )
            ,   panelScope     = "bs" + $panelHeading.find( "a" ).attr("href").split("-")[1]
            ;

            $panelHeading.append( $btnFeedbackSnippet.clone() );

            $panelShowView
                .wrapInner( $divCol12.clone() )
                .wrapInner( $divRow.clone() )
                .children().first()
                .append( $feedbackBoxSnippet.clone() );

            $panelShowView.find( ".feedback-box" ).attr( "data-scope", panelScope );
        });
    }

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

    function _parseComment( comment )
    {
        var $htmlParser = $( "<div/>", { "class": "feedback-temp-parse-comment", html: comment } );

        return $htmlParser.text().replace( /\n/g, "<br/>" );
    }

    function _unParseComment( comment )
    {
        var $htmlParser = $( "<div/>", { "class": "feedback-temp-unparse-comment", html: comment } );

        return $htmlParser.text().replace( /<br\s*[\/]?>/gi, "\n" );
    }

    function _showFeedbackSubmitionForm( $elem )
    {
        $elem.$feedbackSubmitBox.removeClass( "hide" );
        $elem.$element.hide();
        $elem.$textarea.focus();
    }

    function _hideFeedbackSubmitionForm( $elem )
    {
        $elem.$feedbackSubmitBox.addClass( "hide" );
        $elem.$element.show();
    }

    function _submitFeedbackPost( $elem )
    {
        var toRemoveId
        ,   postData   = {
                             commentorId:     currentUserId
                         ,   comment:         $elem.message
                         ,   scope:           $elem.scope
                         ,   visibility:      $elem.visibility
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

    function _destroyFeedbackPost( feedbackId, $elem )
    {
            var postData  =  {
                                feedbackId:     feedbackId
                             };

            _doDestroyFeedback( postData, $elem );
    }

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

    function _resetFeedbackSubmitForm ( $elem )
    {
        if ( !$elem.$feedbackVisibilities.find( "button" ).hasClass( "active" ) )
        {
            $elem.$feedbackVisibilities.find( "button" ).first().addClass( "active" );
        }

        $elem.$btnSubmitFeedback.removeClass( "disabled" );
        $elem.$textarea.val( "" ).attr( "disabled" , false);
        $elem.$feedbackSubmitBox.addClass( "hide" );
        $elem.$feedbackBox.find( ".btn-edit-feedback" ).removeClass( "disabled" );
        $elem.$feedbackBox.find( ".btn-delete-feedback" ).removeClass( "disabled" );
        $elem.$feedbackBox.find( ".feedback-post" ).removeClass( "feedback-to-remove" );
        $elem.$btnAddFeedback.show();
    }

    function _handleNotificationMessages( $elem, state )
    {
        $elem.$notifications.find( ".alert" ).removeClass( "hide" ).addClass( "hide" );

        switch (state)
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

    // actual sending of message to API -> SAKIS
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

    // actual sending of message to API -> SAKIS
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

    //Gets the comments from cache, or invokes the API to get them, using
    //the current user's access rights.
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
                    if( response.data.feedbacks )
                    {
                        bidx.utils.log( "[commenting] following comments received", response.data );

                        $.each( response.data.feedbacks , function( index, feedback )
                        {
                            _createFeedbackPost( feedback );
                        });


                    }
                        _createVisibilities( response.data.allowedVisibilities );
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

    function _getTargetedParams( elem )
    {
        var $elem = $(elem)
        ,   $feedbackPanel          = $elem.closest(".panel-feedback")
        ,   $feedbackBox            = $feedbackPanel.find(".feedback-box")
        ,   $feedbackSubmitBox      = $feedbackPanel.find(".feedback-submit")
        ,   $feedbackPost           = $elem.closest( ".feedback-post" )
        ,   $feedbackVisibilities   = $feedbackBox.find( ".feedback-visibilities" )
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
        ,   visibility              = $feedbackPanel.find( ".feedback-visibilities .active" ).attr( "data-visibility" )
        ,   message                 = $textarea.val()
        ,   params
        ;

        params =
        {
            entityId                : entityId
        ,   scope                   : scope
        ,   visibility              : visibility
        ,   message                 : message
        ,   feedbackId              : feedbackId
        ,   comment                 : comment

        ,   $feedbackPanel          : $feedbackPanel
        ,   $feedbackBox            : $feedbackBox
        ,   $feedbackSubmitBox      : $feedbackSubmitBox
        ,   $feedbackPost           : $feedbackPost
        ,   $feedbackVisibilities   : $feedbackVisibilities
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

