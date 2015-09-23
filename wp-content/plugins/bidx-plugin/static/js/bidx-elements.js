// bidx-elements.js is a miscelaneous home for Views
//
( function( $ )
{
    "use strict";

    var bidx                = window.bidx || {}
    ,   bidxConfig          = window.bidxConfig || {}
    ;

    var placeLogoThumb = function( item, size )
    {
        var thumb
        ,   logo
        ,   logoDocument
        ,   cover
        ,   coverDocument
        ,   cropDimensions
        ,   imgSize = {}
        ;

        if ( size === "sm" )
        {
            imgSize.class = "img-cropper-sm pull-left";
            imgSize.default = "icons-rounded-sm pull-left";
            cropDimensions = 50;
        }
        else
        {
            imgSize.class = "img-cropper";
            imgSize.default = "icons-rounded";
            cropDimensions = 90;
        }


        logo = bidx.utils.getValue( item, "logo");
        logoDocument = bidx.utils.getValue( item, "logo.document");

        cover = bidx.utils.getValue( item, "cover");
        coverDocument = bidx.utils.getValue( item, "cover.document");


        if ( logo && logoDocument )
        {
            thumb = $( "<div />", { "class": imgSize.class } )
                        .append
                        (
                            $( "<img />", { "src": logoDocument, "class": "center-img" })
                        );
        }
        else if ( cover && coverDocument )
        {
            thumb = $( "<div />", { "class": imgSize.class } )
                        .append
                        (
                            $( "<img />", { "src": coverDocument, "class": "center-img" })
                        );
        }
        else
        {
            thumb = $( "<div />", { "class": imgSize.default } )
                        .append
                        (
                            $( "<i />", { "class": "fa fa-suitcase text-primary-light" } )
                        );
        }

        thumb.find( "img" ).fakecrop( {fill: true, wrapperWidth: cropDimensions, wrapperHeight: cropDimensions} );

        return thumb;
    };

    var placeProfileThumbSmall = function( memberInfo )
    {
        var thumb
        ,   profilePicture = bidx.utils.getValue( memberInfo, "profilePicture")
        ;

        if ( profilePicture )
        {
            thumb = $( "<div />", { "class": "img-cropper-sm pull-left" } )
                        .append
                        (
                            $( "<img />", { "src": profilePicture, "class": "center-img" })
                        );

        }
        else
        {
            thumb = $( "<div />", { "class": "icons-rounded-sm pull-left" } )
                        .append
                        (
                            $( "<i />", { "class": "fa fa-user text-primary-light" })
                        );
        }

        thumb.find( "img" ).fakecrop( {fill: true, wrapperWidth: 50, wrapperHeight: 50} );

        return thumb;
    };

    var businessThumb = function( entityid )
    {
        var thumb
        ,   logo
        ,   logoDocument
        ,   cover
        ,   coverDocument
        ,   cropDimensions
        ,   imgSize = {}
        ;

        imgSize.class = "img-cropper-sm pull-left";
        imgSize.default = "icons-rounded-sm pull-left";
        cropDimensions = 50;

        logo = bidx.common.tmpData.businesses[entityid].logo;
        logoDocument = logo ? bidx.common.tmpData.businesses[entityid].logo.document : null;

        cover = bidx.common.tmpData.businesses[entityid].cover;
        coverDocument = cover ? bidx.common.tmpData.businesses[entityid].cover.document : null;

        if ( logo && logoDocument )
        {
            thumb = $( "<div />", { "class": imgSize.class } )
                        .append
                        (
                            $( "<img />", { "src": logoDocument, "class": "center-img" })
                        );
        }
        else if ( cover && coverDocument )
        {
            thumb = $( "<div />", { "class": imgSize.class } )
                        .append
                        (
                            $( "<img />", { "src": coverDocument, "class": "center-img" })
                        );
        }
        else
        {
            thumb = $( "<div />", { "class": imgSize.default } )
                        .append
                        (
                            $( "<i />", { "class": "fa fa-suitcase text-primary-light" } )
                        );
        }

        thumb.find( "img" ).fakecrop( {fill: true, wrapperWidth: cropDimensions, wrapperHeight: cropDimensions} );

        return thumb;
    };

    var profileThumb = function( memberid )
    {
        var thumb
        ,   profilePicture  = bidx.common.tmpData.members[memberid].profilePicture
                            ? bidx.common.tmpData.members[memberid].profilePicture
                            : null
        ;

        if ( profilePicture )
        {
            thumb = $( "<div />", { "class": "img-cropper-sm pull-left" } )
                        .append
                        (
                            $( "<img />", { "src": profilePicture, "class": "center-img" })
                        );

        }
        else
        {
            thumb = $( "<div />", { "class": "icons-rounded-sm pull-left" } )
                        .append
                        (
                            $( "<i />", { "class": "fa fa-user text-primary-light" })
                        );
        }

        thumb.find( "img" ).fakecrop( {fill: true, wrapperWidth: 50, wrapperHeight: 50} );

        return thumb;
    };

    var _getStaticDataVal = function ( data )
    {
        var dataArr
        ,   i18nItem
        ;

        dataArr =   {       'industry'             : 'industry'
                        ,   'countryOperation'     : 'country'
                        ,   'stageBusiness'        : 'stageBusiness'
                        ,   'productService'       : 'productService'
                        ,   'envImpact'            : 'envImpact'
                        ,   'consumerType'         : 'consumerType'
                        ,   'investmentType'       : 'investmentType'
                        ,   'investorType'         : 'investorType'
                        ,   'summaryRequestStatus' : 'summaryRequestStatus'
                        ,   'legalFormBusiness'    : 'legalForm'
                    };

        bidx.data.getStaticDataVal(
        {
            dataArr    : dataArr
          , item       : data
          , callback   : function (label) {
                            i18nItem = label;
                         }
        });
    };

    var businessCardView = function ( item )
    {
        var card;

        _getStaticDataVal( item );

        card =
            $( "<div />", { "class": "cardView", "data-bsid": item.bidxMeta.bidxEntityId } )
                .append
                (
                    $( "<div />", { "class": "cardHeader hide-overflow" } )
                    .append
                    (
                        $( "<div />", { "class": "info-cell pull-left" + ( item.bidxMeta.bidxCompletionMesh ? "" : " hide" ), "html": bidx.i18n.i( "bsCompleted" ) + ": " + item.bidxMeta.bidxCompletionMesh + "%" } )
                    )
                    .append
                    (
                        $( "<div />", { "class": "info-cell pull-left", "html": bidx.i18n.i( "bsFinanceNeeded" ) + ": " + item.financingNeeded + " USD" } )
                    )
                    .append
                    (
                        $( "<a />", { "href": "/businesssummary/" + item.bidxMeta.bidxEntityId, "class": "btn btn-primary btn-xs pull-right info-action main-margin-half", "html": bidx.i18n.i( "bsViewBusiness" ) } )
                    )
                )
                .append
                (
                    $( "<div />", { "class": "cardContent main-padding" } )
                    .append
                    (
                        $( "<div />", { "class": "cardTop" } )
                        .append
                        (
                            $( "<div />", { "class": "row" } )
                            .append
                            (
                                $( "<div />", { "class": "col-sm-3" } )
                                .append
                                (
                                    $( "<a />", { "href": "/businesssummary/" + item.bidxMeta.bidxEntityId, "class": "pull-left main-margin-half", "data-role": "businessImage" } )
                                    .append
                                    (
                                        placeLogoThumb( item )
                                    )
                                )
                            )
                            .append
                            (
                                $( "<div />", { "class": "col-sm-9" } )
                                .append
                                (
                                    $( "<h3 />", { "class": "top-0", "html": item.name } )
                                )
                                .append
                                (
                                    $( "<h4 />" )
                                    .append
                                    (
                                        $( "<span />", { "class": "bs-slogan", "html": item.slogan } )
                                    )
                                )
                                .append
                                (
                                    $( "<table />", { "class": "table table-condensed table-bottom-border" } )
                                    .append
                                    (
                                        $( "<tbody />" )
                                        .append
                                        (
                                            $( "<tr />" )
                                            .append
                                            (
                                                $( "<td />", { "html": bidx.i18n.i( "bsBusinessStage" ) })
                                            )
                                            .append
                                            (
                                                $( "<td />", { "html": item.stageBusiness })
                                            )
                                        )
                                        .append
                                        (
                                            $( "<tr />" )
                                            .append
                                            (
                                                $( "<td />", { "html": bidx.i18n.i( "bsYearSalesStarted" ) })
                                            )
                                            .append
                                            (
                                                $( "<td />", { "html": item.yearSalesStarted })
                                            )
                                        )
                                        .append
                                        (
                                            $( "<tr />", { "class": (item.industry ? "" : " hide") })
                                            .append
                                            (
                                                $( "<td />", { "html": bidx.i18n.i( "bsIndustry" ) })
                                            )
                                            .append
                                            (
                                                $( "<td />", { "html": item.industry })
                                            )
                                        )
                                        .append
                                        (
                                            $( "<tr />", { "class": (item.countryOperation ? "" : " hide") })
                                            .append
                                            (
                                                $( "<td />", { "html": bidx.i18n.i( "bsCountryBusiness" ) })
                                            )
                                            .append
                                            (
                                                $( "<td />", { "html": item.countryOperation })
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            ;

        return card;
    };

    var companyCardView = function ( item )
    {
        var card;

        _getStaticDataVal( item );

        card =
            $( "<div />", { "class": "cardView", "data-compid": item.bidxMeta.bidxEntityId } )
                .append
                (
                    $( "<div />", { "class": "cardHeader hide-overflow" } )
                    .append
                    (
                        $( "<div />", { "class": "info-cell pull-left" + (item.dateCompanyEstab ? "" : " hide"), "html": bidx.i18n.i( "cmDateRegistration" ) + ": " + item.dateCompanyEstab } )
                    )
                    .append
                    (
                        $( "<a />", { "href": "/company/" + item.bidxMeta.bidxEntityId, "class": "btn btn-primary btn-xs pull-right info-action main-margin-half", "html": bidx.i18n.i( "cmCompany" ) } )
                    )
                )
                .append
                (
                    $( "<div />", { "class": "cardContent main-padding" } )
                    .append
                    (
                        $( "<div />", { "class": "cardTop" } )
                        .append
                        (
                            $( "<div />", { "class": "row" } )
                            .append
                            (
                                $( "<div />", { "class": "col-sm-3" } )
                                .append
                                (
                                    $( "<a />", { "href": "/company/" + item.bidxMeta.bidxEntityId, "class": "pull-left main-margin-half", "data-role": "businessImage" } )
                                    .append
                                    (
                                        placeLogoThumb( item )
                                    )
                                )
                            )
                            .append
                            (
                                $( "<div />", { "class": "col-sm-9" } )
                                .append
                                (
                                    $( "<h3 />", { "class": "top-0", "html": item.name } )
                                )
                                .append
                                (
                                    $( "<p />", { "class": (item.website ? "" : " hide") })
                                    .append
                                    (
                                        $( "<a />", { "href": item.website, "target": "_blank", "html": item.website } )
                                    )
                                )
                                .append
                                (
                                    $( "<table />", { "class": "table table-condensed table-bottom-border" } )
                                    .append
                                    (
                                        $( "<tbody />" )
                                        .append
                                        (
                                            $( "<tr />", { "class": (item.registrationNumber ? "" : " hide") })
                                            .append
                                            (
                                                $( "<td />", { "html": bidx.i18n.i( "cmRegistrationNumber" ) })
                                            )
                                            .append
                                            (
                                                $( "<td />", { "html": item.registrationNumber })
                                            )
                                        )
                                        .append
                                        (
                                            $( "<tr />", { "class": (item.fiscalNumber ? "" : " hide") })
                                            .append
                                            (
                                                $( "<td />", { "html": bidx.i18n.i( "cmFiscalNumber" ) })
                                            )
                                            .append
                                            (
                                                $( "<td />", { "html": item.fiscalNumber })
                                            )
                                        )
                                        .append
                                        (
                                            $( "<tr />", { "class": (item.legalFormBusiness ? "" : " hide") })
                                            .append
                                            (
                                                $( "<td />", { "html": bidx.i18n.i( "cmFLegalFormBusiness" ) })
                                            )
                                            .append
                                            (
                                                $( "<td />", { "html": item.legalFormBusiness })
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            ;

        return card;
    };

    var constructActionBox = function ( data, memberInfo )
    {
        var box
        ,   $memberLink
        ,   $memberThumb
        ,   $actions
        ,   $message
        ;

        if ( memberInfo )
        {
            $memberThumb = bidx.construct.placeProfileThumbSmall( memberInfo );
        }

        $memberLink = $( "<a />", { "href": "/member/" + data.user.id, "html": data.user.name } );

        if ( data.status === "pending" )
        {
            $message = $( "<span />", { "html": " " + bidx.i18n.i( "wantsFullAccess" )  } );
            $actions =
                $( "<span />" )
                    .append
                    (
                        $( "<button />", { "class": "btn btn-xs btn-success", "data-btn": "accept", "html": bidx.i18n.i( "btnAccept" ) } )
                    )
                    .append( "&nbsp;" )
                    .append
                    (
                        $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "reject", "html": bidx.i18n.i( "btnReject" ) } )
                    )
            ;
        }

        if ( data.status === "granted" )
        {
            $message = $( "<span />", { "html": " " + bidx.i18n.i( "hasFullAccess" )  } );
        }

        box =
            $( "<div />", { "class": "alert alert-sm hide-overflow bg-" + bidx.common.capitalizeFirstLetter( data.status ), "data-investorid": data.user.id } )
                .append
                (
                    $( "<div />", { "class": "pull-left" } )
                        .append
                        (
                            $memberThumb
                        )
                        .append
                        (
                            $memberLink
                        )
                        .append
                        (
                            $message
                        )
                )
                .append
                (
                    $( "<div />", { "class": "pull-right investor-actions" } )
                        .append
                        (
                            $actions
                        )
                )
            ;

        $(box).find( ".img-cropper-sm img" ).fakecrop( {fill: true, wrapperWidth: 50, wrapperHeight: 50} );

        return box;
    };

    var actionBox = function ( data, reason )
    {
        var box
        ,   dataAttr
        ,   dataid
        ,   status
        ,   theReason = data.relChecks && data.relChecks.reason ? data.relChecks.reason : reason
        ,   contact
        ;

        switch ( theReason )
        {
            case "mentor":

                dataAttr    = "data-requestid";
                dataid      = data.request.requestId;
                status      = data.request.status;

            break;

            case "investor":

                dataAttr    = "data-investorid";
                dataid      = data.user.id;
                status      = data.status;

            break;

            case "contact":

                contact         = bidx.utils.getValue(data, "contact");

                dataAttr    = "data-contactmemberid";
                dataid      = data.id;
                status      = bidx.utils.getValue(contact, "status");

                if( status === 'PENDING')
                {
                    status = 'requested';
                }
                else if( status === 'CONNECTED')
                {
                    status = 'accepted';
                }

            break;

            case "business":

                dataAttr    = "data-bsid";
                dataid      = data.bidxMeta.bidxEntityId;
                status      = "Pending";

            break;

            case "access":

                dataAttr    = "data-ownerid";
                dataid      = data.owner.id;
                status      = "Pending";

            break;
        }

        box =
            $( "<div />", { "class": "alert alert-sm hide-overflow bg-" + bidx.common.capitalizeFirstLetter( status ) } ).attr( dataAttr, dataid)
                .append
                (
                    $( "<div />", { "class": "pull-left" } )
                    .append
                    (
                        $( "<span />", { "class": "alert-message" } )
                    )
                )
            ;

        return box;
    };

    var actionButtons = function ( data, reason )
    {
        var $actions
        ,   $html = $( "<div />", { "class": "pull-right activity-actions" } )
        ,   theReason = data.relChecks && data.relChecks.reason ? data.relChecks.reason : reason
        ;

        switch ( theReason )
        {
            case "mentor":

                switch ( data.request.status )
                {
                    case "accepted":

                        $actions = $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "stop", "html": bidx.i18n.i( "btnStopMentor" ) } );

                    break;

                    case "requested":

                        if ( data.relChecks.isThereRelationship && data.relChecks.isTheInitiator )
                        {
                            $actions =
                                $( "<span />" )
                                    .append
                                    (
                                        $( "<button />", { "class": "btn btn-xs btn-success", "data-btn": "cancel", "html": bidx.i18n.i( "btnCancelRequest" ) } )
                                    )
                                    // .append( "&nbsp;" )
                                    // .append
                                    // (
                                    //     $( "<button />", { "class": "btn btn-xs btn-warning", "data-btn": "remind", "html": bidx.i18n.i( "btnRemind" ) } )
                                    // )
                            ;
                        }
                        else
                        {
                            $actions =
                                $( "<span />" )
                                    .append
                                    (
                                        $( "<button />", { "class": "btn btn-xs btn-success", "data-btn": "accept", "html": bidx.i18n.i( "btnAccept" ) } )
                                    )
                                    .append( "&nbsp;" )
                                    .append
                                    (
                                        $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "reject", "html": bidx.i18n.i( "btnReject" ) } )
                                    )
                            ;
                        }

                    break;

                    case "rejected":

                        $actions = $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "removeAlert", "html": bidx.i18n.i( "btnDismiss" ) } );

                    break;
                }

            break;

            case "investor":

                switch ( data.status )
                {
                    case "pending":

                        $actions =
                            $( "<span />" )
                                .append
                                (
                                    $( "<button />", { "class": "btn btn-xs btn-success", "data-btn": "acceptAccess", "html": bidx.i18n.i( "btnAccept" ) } )
                                )
                                .append( "&nbsp;" )
                                .append
                                (
                                    $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "rejectAccess", "html": bidx.i18n.i( "btnReject" ) } )
                                )
                        ;

                    break;

                    case "granted":

                        // Uncomment when it is ready
                        // $actions = $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "removeAccess", "html": bidx.i18n.i( "btnRemoveAccess" ) } );

                    break;

                    case "rejected":

                        $actions = $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "removeAlert", "html": bidx.i18n.i( "btnDismiss" ) } );

                    break;
                }

            break;

            case "contact":
                var contact         = bidx.utils.getValue(data, "contact")
                ,   isTheInitiator  = !bidx.utils.getValue(contact, "isInitiator")
                ,   status          = bidx.utils.getValue(contact, "status")
                ;

                switch ( status )
                {
                    case "CONNECTED":

                            $actions = $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "connectstop", "html": bidx.i18n.i( "btnStopConnect" ) } );

                    break;

                    case "PENDING":

                        if ( isTheInitiator )
                        {
                            $actions =
                                $( "<span />" )
                                    .append
                                    (
                                        $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "connectcancel", "html": bidx.i18n.i( "btnCancelRequest" ) } )
                                    ,   "&nbsp;"
                                    ,   $( "<button />", { "class": "btn btn-xs btn-warning", "data-btn": "connectremind", "html": bidx.i18n.i( "btnRemind" ) } )
                                    )
                            ;
                        }
                        else
                        {
                            $actions =
                                $( "<span />" )
                                    .append
                                    (
                                        $( "<button />", { "class": "btn btn-xs btn-success", "data-btn": "connectaccept", "html": bidx.i18n.i( "btnAccept" ) } )
                                    )
                                    .append( "&nbsp;" )
                                    .append
                                    (
                                        $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "connectreject", "html": bidx.i18n.i( "btnReject" ) } )
                                    )
                            ;
                        }

                    break;
                }

            break;

            case "business":

                $actions = $( "<button />", { "class": "btn btn-xs btn-warning", "data-btn": "requestForMentorBusiness", "html": bidx.i18n.i( "btnRequest" ) } );

            break;

            case "stopped":

                $actions = $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "removeAlert", "html": bidx.i18n.i( "btnDismiss" ) } );

            break;

            case "access":

                $actions = $( "<button />", { "class": "btn btn-xs btn-warning", "data-btn": "requestFullAccess", "html": bidx.i18n.i( "btnRequestAccess" ) } );

            break;

            case "offer":

                $actions = $( "<button />", { "class": "btn btn-xs btn-mentor", "data-btn": "offerMentoringDash", "html": bidx.i18n.i( "offerMentoring" ) } );

            break;

        }

        $html.append( $actions );

        return $html;
    };

    var memberLink = function ( memberid )
    {
        var $memberLink;

        $memberLink =
            $( "<a />", { "href": "/member/" + memberid } )
            .append
            (
                $( "<strong />", { "html": bidx.common.tmpData.members[memberid].name } )
            )
        ;

        return $memberLink;
    };

    var businessLink = function ( entityid )
    {
        var $businessLink;

        $businessLink =
            $( "<a />", { "href": "/member/" + entityid } )
            .append
            (
                $( "<strong />", { "html": bidx.common.tmpData.businesses[entityid].name } )
            )
        ;

        return $businessLink;
    };

    var actionMessage = function ( data, reason )
    {
        var $message
        ,   text
        ,   theReason = data.relChecks && data.relChecks.reason ? data.relChecks.reason : reason
        ;

        switch ( theReason )
        {
            case "mentor":

                switch ( data.request.status )
                {
                    case "accepted":

                        if ( data.relChecks.isThereRelationship && ( bidx.globalChecks.isOwnBusiness() || bidx.globalChecks.isOwnProfile() || bidx.globalChecks.isEntrepreneurDashboard() || bidx.globalChecks.isMentorDashboard() || bidx.globalChecks.isInvestorDashboard() ) )
                        {
                            text = " " + bidx.i18n.i( "isMentoring" );
                        }
                        else
                        {
                            text = data.relChecks.showBusinessInfo ? text = bidx.i18n.i( "isMentoring" ) + " " : text = bidx.i18n.i( "youAreMentoring" );
                        }

                    break;

                    case "requested":

                        if ( data.relChecks.isThereRelationship && data.relChecks.isTheInitiator )
                        {
                            if ( data.relChecks.isTheMentor )
                            {
                                text = bidx.globalChecks.isInvestorDashboard() ? bidx.i18n.i( "youAskedMentorFrom" ) + " " :  bidx.i18n.i( "youAskedMentor" ) + " ";
                            }
                            else if ( !data.relChecks.isTheMentor && !bidx.globalChecks.isOwnProfile() && data.relChecks.showBusinessInfo )
                            {
                                text = bidx.i18n.i( "youAskedMentorForBusiness" ) + " ";
                            }
                            else
                            {
                                text = bidx.i18n.i( "youAskedFromMentor" ) + " ";
                            }
                        }
                        else if ( data.relChecks.isTheMentor && bidx.globalChecks.isInvestorDashboard() && !data.relChecks.isTheInitiator )
                        {
                            text = " " + bidx.i18n.i( "wantsYouToMentor" );
                        }
                        else
                        {
                            text = data.relChecks.showBusinessInfo ? text = " " + bidx.i18n.i( "mentorAskedYou" ) + " " : text = " " + bidx.i18n.i( "wantsToMentor" );
                        }

                    break;

                    case "rejected":

                            text = " " + bidx.i18n.i( "userRejected" );

                    break;

                    case "stopped":

                            if ( (!bidx.globalChecks.isOwnBusiness() && bidx.globalChecks.isBusinessPage() ) || ( bidx.globalChecks.isProfilePage() && !bidx.globalChecks.isOwnProfile() && $( "#tab-entrepreneur" ).length ) )
                            {
                                text = bidx.i18n.i( "youCancelledMentoring" ) + " ";
                            }
                            else if ( bidx.globalChecks.isProfilePage() && !bidx.globalChecks.isOwnProfile() )
                            {
                                text = bidx.i18n.i( "mentorYouCancelledForBusiness" ) + " ";
                            }
                            else
                            {
                                text = bidx.i18n.i( "youStoppedMentor" ) + " ";
                            }

                    break;

                    case "offerMentoring":

                            text = " " + bidx.i18n.i( "offerMentoring" );

                    break;

                }

            break;

            case "investor":

                if ( data.status === "pending" ) { text =  " " + bidx.i18n.i( "wantsFullAccess" ); }
                if ( data.status === "granted" ) { text =  " " + bidx.i18n.i( "hasFullAccess" ); }
                if ( data.status === "rejected" ) { text =  " " + bidx.i18n.i( "userRejected" ); }
                if ( data.status === "requested" ) { text = bidx.i18n.i( "youRequestedAccessFrom" ) + " "; }
                if ( data.status === "recommended" ) { text = bidx.i18n.i( "requestAccessBusiness" ) + " "; }

            break;

            case "contact":

                var labelTxt
                ,   contact         = bidx.utils.getValue(data, "contact")
                ,   isTheInitiator  = bidx.utils.getValue(contact, "isInitiator")
                ,   status          = bidx.utils.getValue(contact, "status")
                ;

                switch ( status )
                {
                    case "CONNECTED":

                        text = " " + bidx.i18n.i( "youAreInContact" );
                    break;

                    case "PENDING":

                        text =  " " ;
                        if( isTheInitiator )
                        {
                            labelTxt = 'wantsToConnect';
                        }
                        else
                        {
                            labelTxt = 'youAskedConnection';
                        }

                        text =  " " +  bidx.i18n.i( labelTxt );

                    break;
                }

            break;

            case "business":

                text = bidx.i18n.i( "requestMentoringBusiness" ) + " ";

            break;

            case "investorDash":

                if ( data.status === "pending" ) { text = bidx.i18n.i( "youRequestedAccessFrom" ) + " "; }
                if ( data.status === "granted" ) { text = bidx.i18n.i( "youHaveAccessFrom" ) + " "; }

            break;

            case "offerMentoring":

                text = bidx.i18n.i( "offerMentoringTo" ) + " ";

            break;
        }

        $message = $( "<span />", { "html": text } );

        return $message;
    };

    // Expose
    //
    if ( !window.bidx )
    {
        window.bidx = bidx;
    }

    bidx.construct =
    {
        businessCardView:          businessCardView
    ,   companyCardView:           companyCardView
    ,   actionBox:                 actionBox
    ,   actionButtons:             actionButtons
    ,   memberLink:                memberLink
    ,   businessLink:              businessLink
    ,   actionMessage:             actionMessage
    ,   businessThumb:             businessThumb
    ,   profileThumb:              profileThumb

    ,   placeLogoThumb:                     placeLogoThumb
    ,   placeProfileThumbSmall:             placeProfileThumbSmall
    };

} ( jQuery ));
