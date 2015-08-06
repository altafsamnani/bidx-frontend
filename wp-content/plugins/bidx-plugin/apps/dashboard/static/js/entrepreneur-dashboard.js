;(function($)
{
    "use strict";
    var $element          = $("#entrepreneur-dashboard")
    ,   $views            = $element.find( ".view" )
    ,   $elementHelp      = $element.find( ".startpage" )
    ,   $tabBusinesses    = $element.find( "#tab-businesses" )
    ,   $tabCompanies     = $element.find( "#tab-companies" )
    ,   $tabInvestors     = $element.find( "#tab-interested-investors" )
    ,   $tabMentors       = $element.find( "#tab-interested-mentors" )
    ,   $firstPage        = $element.find( "input[name='firstpage']" )
    ,   bidx              = window.bidx
    ,   currentUserId     = bidx.common.getSessionValue( "id" )
    ;

    var fetchBusinesses = function ( options )
    {
        bidx.api.call(
            "businesssummary.fetch"
            ,   {
                    groupDomain:    bidx.common.groupDomain
                ,   async      :    false
                ,   success: function( response )
                    {

                        // now format it into array of objects with value and label
                        if( response && response.data && response.data.received )
                        {
                            // bidx.utils.log("THE RESPONSE:::: fetchBusinesses:::: ", response.data.received);
                            
                            var databsids = [];

                            $.each( response.data.received, function( id, item )
                            {
                                // bidx.utils.log("THE ITEM OWNER:::: fetchBusinesses:::: ", item.owner.displayName);

                                $.each( item.authorizations, function( id, auth )
                                {
                                    // bidx.utils.log("THE AUTH:::: fetchBusinesses:::: ", id, auth);

                                    if ( $tabMentors.length && auth.accessType === "MENTOR" && auth.status !== "rejected" )
                                    {

                                        $tabMentors.append( bidx.construct.constructBusinessCardView( item.entity ) );

                                        databsids.push( item.entity.bidxMeta.bidxEntityId.toString() );
                                    }
                                    
                                    if ( $tabInvestors.length && auth.accessType === "INVESTOR" && auth.status !== "rejected" && item.owner.id === currentUserId )
                                    {
                                        bidx.utils.log("fetchBusinesses:::: auth:::: item:::: ", auth, item);
                                        $tabInvestors.append( bidx.construct.constructBusinessCardView( item.entity ) );

                                        $tabInvestors.find( ".cardFooter" ).last()
                                            .append( bidx.construct.constructActionBox( auth ) )
                                        ;
                                    }
                                });
                            });

                            if ( $tabMentors.find('.cardView').length )
                            {
                                bidx.commonmentordashboard.getMentoringRequest(
                                {
                                    callback: function( result )
                                    {
                                        bidx.commonmentordashboard.checkMentoringRelationship( result, databsids );
                                    }
                                } );
                            }



                        }
                    }

                , error: function(jqXhr, textStatus)
                {
                    var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    _showError("Something went wrong while retrieving investorslist of the member: " + status);
                }
            }
        );
    };


    //public functions

    var getInvestors = function(options)
    {
        var snippit       = $("#entrepreneur-investorsitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   emptySnippit  = $("#entrepreneur-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   $list         = $(".investors.entrepreneur-investors")
        ,   $btn
        ,   entityId
        ,   dataArr
        ,   investorId
        ,   entityStatus
        ,   completionMess
        ,   accessParams
        ,   listItem
        ,   i18nItem
        ,   investorType
        ,   emptyVal      = "*"
        ,   toRemove
        ,   logo
        ,   logoDocument
        ,   cover
        ,   coverDocument
        ,   $el
        ,   $listItem
        ,   $bsid
        ;

        bidx.api.call(
            "businesssummary.fetch"
            ,   {
                    groupDomain:    bidx.common.groupDomain
                ,   async      :    false
                ,   success: function( response )
                    {

                    //clear listing
                    $list.empty();
                    // now format it into array of objects with value and label
                    if( response && response.data && response.data.received )
                    {
                        dataArr =   {       'industry'             : 'industry'
                                        ,   'countryOperation'     : 'country'
                                        ,   'stageBusiness'        : 'stageBusiness'
                                        ,   'productService'       : 'productService'
                                        ,   'envImpact'            : 'envImpact'
                                        ,   'consumerType'         : 'consumerType'
                                        ,   'investmentType'       : 'investmentType'
                                        // ,   'investorType'         : 'investorType'
                                        ,   'summaryRequestStatus' : 'summaryRequestStatus'
                                    };

                        $.each(response.data.received, function(id, item)
                        {
                            entityId        = item.entity.bidxMeta.bidxEntityId;
                            investorId      = item.owner.id;
                            entityStatus    = item.entity.bidxMeta.bidxEntityStatus;
                            completionMess  = item.entity.bidxMeta.bidxCompletionMesh;


                            /* Setting data to get the final values */
                            // item.businessSummary.investorType = item.investor.investorType;
                            // item.businessSummary.summaryRequestStatus = item.status;

                            bidx.data.getStaticDataVal(
                            {
                                dataArr    : dataArr
                              , item       : item.entity
                              , callback   : function (label) {
                                                i18nItem = label;
                                             }
                            });

                            // Add Default image if there is no image attached to the bs
                            var addDefaultImage = function( el )
                            {
                                $element.find('.' + el).html('<div class="icons-rounded pull-left"><i class="fa fa-suitcase text-primary-light"></i></div>');
                            };


                            //search for placeholders in snippit
                            listItem = snippit
                                .replace( /%accordion-id%/g,      entityId   ? entityId     : emptyVal )
                                .replace( /%bidxEntityId%/g,      entityId  ? entityId     : emptyVal )
                                .replace( /%name%/g,      i18nItem.name   ? i18nItem.name     : emptyVal )
                                .replace( /%industry%/g,       i18nItem.industry    ? i18nItem.industry      : emptyVal )
                                .replace( /%status%/g,       i18nItem.summaryRequestStatus    ? i18nItem.summaryRequestStatus   : emptyVal )
                                .replace( /%countryOperation%/g,     i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                                .replace( /%bidxLastUpdateDateTime%/g, item.entity.bidxMeta.bidxLastUpdateDateTime    ? bidx.utils.parseTimestampToDateStr(item.entity.bidxMeta.bidxLastUpdateDateTime) : emptyVal )
                                .replace( /%slogan%/g,      i18nItem.slogan   ? i18nItem.slogan     : emptyVal )
                                .replace( /%summary%/g,      i18nItem.summary   ? i18nItem.summary     : emptyVal )
                                .replace( /%reasonForSubmission%/g,       i18nItem.reasonForSubmission    ? i18nItem.reasonForSubmission      : emptyVal )
                                .replace( /%bidxOwnerId%/g, i18nItem.bidxOwnerId    ? i18nItem.bidxOwnerId      : emptyVal )
                                .replace( /%creator%/g, i18nItem.creator    ? i18nItem.creator      : emptyVal )
                                .replace( /%productService%/g, i18nItem.productService    ? i18nItem.productService      : emptyVal )
                                .replace( /%financingNeeded%/g,      i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyVal )
                                .replace( /%completionMess%/g,      completionMess   ? completionMess + '%'    : emptyVal )
                                .replace( /%yearSalesStarted%/g,      i18nItem.yearSalesStarted   ? i18nItem.yearSalesStarted  : emptyVal )
                                .replace( /%stageBusiness%/g,     i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyVal )
                                .replace( /%envImpact%/g,      i18nItem.envImpact   ? i18nItem.envImpact     : emptyVal )
                                // .replace( /%investorType%/g,       i18nItem.investorType    ? i18nItem.investorType      : emptyVal )
                                .replace( /%consumerType%/g,      i18nItem.consumerType   ? i18nItem.consumerType     : emptyVal )
                                .replace( /%investmentType%/g,      i18nItem.investmentType   ? i18nItem.investmentType     : emptyVal )
                                .replace( /%summaryFinancingNeeded%/g,      i18nItem.summaryFinancingNeeded   ? i18nItem.summaryFinancingNeeded     : emptyVal )
                                // .replace( /%displayName%/g,      item.investor.displayName   ? item.investor.displayName : emptyVal )
                                .replace( /%investorId%/g,      investorId   ? investorId    : emptyVal )
                               // .replace( /%document%/g,      (!$.isEmptyObject( item.businessSummary.company ) && !$.isEmptyObject( item.businessSummary.company.logo ) && !$.isEmptyObject( item.businessSummary.company.logo.document ) ) ? item.businessSummary.company.logo.document     :  addDefaultImage('js-document') )
                                ;


                            // Remove the js selector
                            $listItem = $(listItem);

                            toRemove = $listItem.find( "td:contains("+emptyVal+"), .bs-slogan:contains("+emptyVal+")" );
                            toRemove.each( function( index, el)
                            {
                                $(el).parent().remove();
                            });


                            logo = bidx.utils.getValue( item, "businessSummary.logo");
                            logoDocument = bidx.utils.getValue( item, "businessSummary.logo.document");

                            cover = bidx.utils.getValue( item, "businessSummary.cover");
                            coverDocument = bidx.utils.getValue( item, "businessSummary.cover.document");


                            if ( logo && logoDocument )
                            {
                                placeBusinessThumb( $listItem, logoDocument );
                            }
                            else if ( cover && coverDocument )
                            {
                                placeBusinessThumb( $listItem, coverDocument );
                            }

                            //  add main element to list
                            $list.append( $listItem );

                            //  load checkbox plugin on element
                            if(item.status === 'pending')
                            {
                                $btn   = $list.find( '[data-summaryid="' + entityId + '"][data-investorid="' + investorId + '"]' );

                                if ( $btn )
                                {
                                    $btn.click( function( e )
                                    {
                                        var $this = $(this);
                                        e.preventDefault();
                                        accessParams = {   'id'           :  $this.data('summaryid')
                                                        ,  'investorId'   :  $this.data('investorid')
                                                        ,  'action'       :  $this.data('btn')
                                                        };

                                        bidx.common._notify(
                                        {
                                            text:       bidx.i18n.i( "btnConfirm" )
                                        ,   modal:      true
                                        ,   type:       "confirm"
                                        ,   layout:     "center"
                                        ,   buttons:
                                            [
                                                {
                                                    addClass:       "btn btn-primary"
                                                ,   text:           bidx.i18n.i("btnOk")
                                                ,   onClick: function( $noty )
                                                    {
                                                        _doGrantRequest( accessParams, function( err )
                                                        {
                                                            if ( err )
                                                            {
                                                                alert( err );
                                                            }
                                                            else
                                                            {
                                                                bidx.common.notifyRedirect();

                                                                var statusMsg = (accessParams.action ==='accept') ? 6 : 7;

                                                                document.location.href = bidx.common.url( 'entrepreneur-dashboard') + "?smsg=" + statusMsg;
                                                            }
                                                        });

                                                        $noty.close();
                                                    }
                                                }
                                            ,   {
                                                    addClass:       "btn btn-danger"
                                                ,   text:           bidx.i18n.i("btnCancel")
                                                ,   onClick: function( $noty )
                                                    {
                                                        $noty.close();
                                                    }
                                                }
                                            ]
                                        } );
                                    } );
                                }
                            }
                            else
                            {
                                var controlButtons = '.btn-' + entityId + '-' +  investorId ;
                                $list.find(controlButtons).addClass('hide');
                            }
                        } );
                    }
                    else
                    {
                        $list.append(emptySnippit);
                    }

                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback();
                    }
                }

                , error: function(jqXhr, textStatus)
                {
                    var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    _showError("Something went wrong while retrieving investorslist of the member: " + status);
                }
            }
        );
    };


    var getMentors = function(options)
    {
        var snippit       = $("#entrepreneur-mentorsitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   emptySnippit  = $("#entrepreneur-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   $list         = $("." + options.list)
        ,   $btn
        ,   entityId
        ,   dataArr
        ,   investorId
        ,   accessParams
        ,   listItem
        ,   i18nItem
        ,   investorType
        ,   emptyVal      = "*"
        ,   toRemove
        ,   logo
        ,   logoDocument
        ,   cover
        ,   coverDocument
        ,   $el
        ,   $listItem
        ;

        bidx.api.call(
            "businesssummary.fetch"
            ,   {
                    groupDomain:    bidx.common.groupDomain
                ,   async      :    false
                ,   success: function( response )
                    {
                    // bidx.utils.log("getMentors ----- the response::::", response);

                    //clear listing
                    $list.empty();

                    // now format it into array of objects with value and label
                    if( response && response.data && response.data.received )
                    {
                        dataArr =   {       'industry'             : 'industry'
                                        ,   'countryOperation'     : 'country'
                                        ,   'stageBusiness'        : 'stageBusiness'
                                        ,   'productService'       : 'productService'
                                        ,   'envImpact'            : 'envImpact'
                                        ,   'consumerType'         : 'consumerType'
                                        ,   'investmentType'       : 'investmentType'
                                        ,   'investorType'         : 'investorType'
                                        ,   'summaryRequestStatus' : 'summaryRequestStatus'
                                    };

                        $.each(response.data.received, function(id, item)
                        {
                            // bidx.utils.log("getMentors ----- the ITEM::::", item);
                            entityId    =   item.businessSummary.bidxMeta.bidxEntityId;
                            investorId  =   item.investor.id;

                            /* Setting data to get the final values */
                            item.businessSummary.investorType = item.investor.investorType;
                            item.businessSummary.summaryRequestStatus = item.status;

                            bidx.data.getStaticDataVal(
                            {
                                dataArr    : dataArr
                              , item       : item.businessSummary
                              , callback   : function (label) {
                                                i18nItem = label;
                                             }
                            });

                            //search for placeholders in snippit
                            listItem = snippit
                                .replace( /%accordion-id%/g,      entityId   ? entityId     : emptyVal )
                                .replace( /%bidxEntityId%/g,      entityId  ? entityId     : emptyVal )
                                .replace( /%name%/g,      i18nItem.name   ? i18nItem.name     : emptyVal )
                                .replace( /%industry%/g,       i18nItem.industry    ? i18nItem.industry      : emptyVal )
                                .replace( /%status%/g,       i18nItem.summaryRequestStatus    ? i18nItem.summaryRequestStatus   : emptyVal )
                                .replace( /%countryOperation%/g,     i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                                .replace( /%bidxLastUpdateDateTime%/g, item.businessSummary.bidxMeta.bidxLastUpdateDateTime    ? bidx.utils.parseTimestampToDateStr(item.businessSummary.bidxMeta.bidxLastUpdateDateTime) : emptyVal )
                                .replace( /%slogan%/g,      i18nItem.slogan   ? i18nItem.slogan     : emptyVal )
                                .replace( /%summary%/g,      i18nItem.summary   ? i18nItem.summary     : emptyVal )
                                .replace( /%reasonForSubmission%/g,       i18nItem.reasonForSubmission    ? i18nItem.reasonForSubmission      : emptyVal )
                                .replace( /%bidxOwnerId%/g, i18nItem.bidxOwnerId    ? i18nItem.bidxOwnerId      : emptyVal )
                                .replace( /%creator%/g, i18nItem.creator    ? i18nItem.creator      : emptyVal )
                                .replace( /%productService%/g, i18nItem.productService    ? i18nItem.productService      : emptyVal )
                                .replace( /%financingNeeded%/g,      i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyVal )
                                .replace( /%yearSalesStarted%/g,      i18nItem.yearSalesStarted   ? i18nItem.yearSalesStarted  : emptyVal )
                                .replace( /%stageBusiness%/g,     i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyVal )
                                .replace( /%envImpact%/g,      i18nItem.envImpact   ? i18nItem.envImpact     : emptyVal )
                                .replace( /%investorType%/g,       i18nItem.investorType    ? i18nItem.investorType      : emptyVal )
                                .replace( /%consumerType%/g,      i18nItem.consumerType   ? i18nItem.consumerType     : emptyVal )
                                .replace( /%investmentType%/g,      i18nItem.investmentType   ? i18nItem.investmentType     : emptyVal )
                                .replace( /%summaryFinancingNeeded%/g,      i18nItem.summaryFinancingNeeded   ? i18nItem.summaryFinancingNeeded     : emptyVal )
                                .replace( /%displayName%/g,      item.investor.displayName   ? item.investor.displayName : emptyVal )
                                .replace( /%investorId%/g,      investorId   ? investorId    : emptyVal )
                                ;


                            // Remove the js selector
                            $listItem = $(listItem);

                            toRemove = $listItem.find( "td:contains("+emptyVal+"), .bs-slogan:contains("+emptyVal+")" );
                            toRemove.each( function( index, el)
                            {
                                $(el).parent().remove();
                            });


                            logo = bidx.utils.getValue( item, "businessSummary.logo");
                            logoDocument = bidx.utils.getValue( item, "businessSummary.logo.document");

                            cover = bidx.utils.getValue( item, "businessSummary.cover");
                            coverDocument = bidx.utils.getValue( item, "businessSummary.cover.document");


                            if ( logo && logoDocument )
                            {
                                placeBusinessThumb( $listItem, logoDocument );
                            }
                            else if ( cover && coverDocument )
                            {
                                placeBusinessThumb( $listItem, coverDocument );
                            }

                            //  add mail element to list
                            $list.append( $listItem );

                            //  load checkbox plugin on element
                            if(item.status === 'pending')
                            {
                                $btn   = $list.find( '[data-summaryid="' + entityId + '"][data-investorid="' + investorId + '"]' );

                                if ( $btn )
                                {
                                    $btn.click( function( e )
                                    {
                                        var $this = $(this);
                                        e.preventDefault();
                                        accessParams = {   'id'           :  $this.data('summaryid')
                                                        ,  'investorId'   :  $this.data('investorid')
                                                        ,  'action'       :  $this.data('btn')
                                                        };

                                        bidx.common._notify(
                                        {
                                            text:       bidx.i18n.i( "btnConfirm" )
                                        ,   modal:      true
                                        ,   type:       "confirm"
                                        ,   layout:     "center"
                                        ,   buttons:
                                            [
                                                {
                                                    addClass:       "btn btn-primary"
                                                ,   text:           "Ok"
                                                ,   onClick: function( $noty )
                                                    {

                                                       bidx.utils.log(accessParams);
                                                        _doGrantRequest( accessParams, function( err )
                                                        {
                                                            if ( err )
                                                            {
                                                                alert( err );
                                                            }
                                                            else
                                                            {
                                                                bidx.common.notifyRedirect();
                                                                var statusMsg = (accessParams.action ==='accept') ? 6 : 7;
                                                                var url = document.location.protocol
                                                                    + "//"
                                                                    + document.location.hostname
                                                                    + ( document.location.port ? ":" + document.location.port : "" )
                                                                    + '/entrepreneur-dashboard/'
                                                                    + "?smsg=" + statusMsg
                                                                ;

                                                                document.location.href = url;
                                                            }
                                                        });

                                                        $noty.close();
                                                    }
                                                }
                                            ,   {
                                                    addClass:       "btn btn-danger"
                                                ,   text:           "Cancel"
                                                ,   onClick: function( $noty )
                                                    {
                                                        $noty.close();
                                                    }
                                                }
                                            ]
                                        } );
                                    } );
                                }
                            }
                            else
                            {
                                var controlButtons = '.btn-' + entityId + '-' +  investorId ;
                                $list.find(controlButtons).addClass('hide');
                            }
                        } );
                    }
                    else
                    {
                        $list.append(emptySnippit);
                    }

                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback();
                    }
                }

                , error: function(jqXhr, textStatus)
                {
                    var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    _showError("Something went wrong while retrieving investorslist of the member: " + status);
                }
            }
        );
    };

    var getMemberBusinesses = function( options )
    {
        bidx.api.call(
            "member.fetch"
        ,   {
                memberId:       currentUserId
            ,   groupDomain:    bidx.common.groupDomain
            ,   success:        function( response )
                {
                    // Do we have edit perms?
                    //
                    var entities    = bidx.utils.getValue( response, "entities" )
                    ,   companies   = bidx.utils.getValue( response, "companies" )
                    ;

                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject( entities ) )
                    {
                        $.each( entities, function(idx, item)
                        {
                            var bidxMeta = bidx.utils.getValue( item, "bidxMeta" );

                            if ( bidxMeta && bidxMeta.bidxEntityType === 'bidxBusinessSummary' )
                            {
                                $tabBusinesses.append( bidx.construct.constructBusinessCardView( item ) );
                            }
                        } );
                    }

                    if ( !$.isEmptyObject( companies ) )
                    {
                        $.each( companies, function(idx, item)
                        {
                            var bidxMeta = bidx.utils.getValue( item, "bidxMeta" );

                            if ( bidxMeta && bidxMeta.bidxEntityType === 'bidxCompany' )
                            {
                                $tabCompanies.append( bidx.construct.constructCompanyCardView( item ) );
                            }
                        } );
                    }
                }

                , error: function(jqXhr, textStatus)
                {
                    var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    _showError("Something went wrong while retrieving investorslist of the member: " + status);
                }
            }
        );
    };



    // Perform an API call to join the group
    //
    var _doGrantRequest = function( params, cb )
    {

        bidx.api.call(
            "businesssummaryGrantAccess.send"
        ,   {
                groupDomain:            bidx.common.groupDomain
            ,   id:                     params.id
            ,   investorId:             params.investorId
            ,   extraUrlParameters:
                [
                    {
                        label:          "action"
                    ,   value:          params.action
                    }
                ]
            ,   success:            function( response )
                {
                    bidx.utils.log( "bidx::requestAccess::save::success", response );

                    cb();
                }
            ,   error:            function( jqXhr, textStatus )
                {
                    bidx.utils.log( "bidx::requestAccess::save::error", jqXhr, textStatus );

                    cb( new Error( "Problem granting access" ) );
                }
            }
        );
    };

    var getBusinessesAndCompanies = function(options)
    {

        var snippit       = $("#entrepreneur-businessitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   emptySnippit  = $("#entrepreneur-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   $list         = $("." + options.list)
        ,   emptyList     = true
        ,   listItem
        ,   $listItem
        ,   i18nItem
        ,   emptyVal      = "*"
        ,   toRemove
        ,   logo
        ,   logoDocument
        ,   cover
        ,   coverDocument
        ,   $el
        ;

        bidx.api.call(
            "member.fetch"
        ,   {
                memberId:       currentUserId
            ,   groupDomain:    bidx.common.groupDomain
            ,   success:        function( response )
                {
                    bidx.utils.log('getBusinessesAndCompanies:::::::::::', response);
                    // Do we have edit perms?
                    //
                    var entities    = bidx.utils.getValue( response, "entities" );
                    var companies   = bidx.utils.getValue( response, "companies" );

                    //clear listing
                    $list.empty();

                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject(entities) )
                    {

                        $.each(entities, function(idx, item)
                        {
                            //if( item.bidxEntityType == 'bidxBusinessSummary') {
                            var bidxMeta = bidx.utils.getValue( item, "bidxMeta" );

                            if( bidxMeta && bidxMeta.bidxEntityType === 'bidxBusinessSummary' )
                            {

                                var dataArr = {  'industry'         : 'industry'
                                               , 'countryOperation' : 'country'
                                               , 'stageBusiness'    : 'stageBusiness'
                                               , 'envImpact'        : 'envImpact'
                                               , 'consumerType'     : 'consumerType'
                                               , 'investmentType'   : 'investmentType'
                                             };

                                bidx.data.getStaticDataVal(
                                {
                                    dataArr    : dataArr
                                  , item       : item
                                  , callback   : function (label) {
                                                    i18nItem = label;
                                                 }
                                });

                                //search for placeholders in snippit
                                listItem = snippit
                                    .replace( /%accordion-id%/g,      bidxMeta.bidxEntityId   ? bidxMeta.bidxEntityId     : emptyVal )
                                    .replace( /%bidxEntityId%/g,      bidxMeta.bidxEntityId   ? bidxMeta.bidxEntityId     : emptyVal )
                                    .replace( /%name%/g,      i18nItem.name   ? i18nItem.name     : emptyVal )
                                    .replace( /%industry%/g,       i18nItem.industry    ? i18nItem.industry      : emptyVal )
                                    .replace( /%completeness%/g,       i18nItem.completeness    ? i18nItem.completeness      : emptyVal )
                                    .replace( /%countryOperation%/g,     i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                                    .replace( /%financingNeeded%/g,      i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyVal )
                                    .replace( /%yearSalesStarted%/g,       i18nItem.yearSalesStarted    ? i18nItem.yearSalesStarted      : emptyVal )
                                    .replace( /%stageBusiness%/g,     i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyVal )
                                    .replace( /%bidxLastUpdateDateTime%/g,     bidxMeta.bidxLastUpdateDateTime  ? bidx.utils.parseTimestampToDateStr(bidxMeta.bidxLastUpdateDateTime) : emptyVal )
                                    .replace( /%slogan%/g,      i18nItem.slogan   ? i18nItem.slogan     : emptyVal )
                                    .replace( /%summary%/g,      i18nItem.summary   ? i18nItem.summary     : emptyVal )
                                    .replace( /%reasonForSubmission%/g,       i18nItem.reasonForSubmission    ? i18nItem.reasonForSubmission      : emptyVal )
                                    .replace( /%envImpact%/g,      i18nItem.envImpact   ? i18nItem.envImpact     : emptyVal )
                                    .replace( /%consumerType%/g,      i18nItem.consumerType   ? i18nItem.consumerType     : emptyVal )
                                    .replace( /%investmentType%/g,      i18nItem.investmentType   ? i18nItem.investmentType     : emptyVal )
                                    .replace( /%summaryFinancingNeeded%/g,      i18nItem.summaryFinancingNeeded   ? i18nItem.summaryFinancingNeeded     : emptyVal )
                                    ;

                                $listItem = $(listItem);

                                toRemove = $listItem.find( "td:contains("+emptyVal+"), .bs-slogan:contains("+emptyVal+")" );
                                toRemove.each( function( index, el)
                                {
                                    $(el).parent().remove();
                                });
                                
                                logo = bidx.utils.getValue( item, "logo");
                                logoDocument = bidx.utils.getValue( item, "logo.document");

                                cover = bidx.utils.getValue( item, "cover");
                                coverDocument = bidx.utils.getValue( item, "cover.document");

                                if ( logo && logoDocument )
                                {
                                    placeBusinessThumb( $listItem, logoDocument );
                                }
                                else if ( cover && coverDocument )
                                {
                                    placeBusinessThumb( $listItem, coverDocument );
                                }

                                $list.append( $listItem );

                                emptyList = false;

                            }

                        });

                    }
                    if(emptyList)
                    {

                        $list.append(emptySnippit);
                    }

                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback();
                    }
                }

                , error: function(jqXhr, textStatus)
                {
                    var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    _showError("Something went wrong while retrieving investorslist of the member: " + status);
                }
            }
        );
    };

    var _showView = function(view, showAll)
    {

        //  show title of the view if available
        if (!showAll)
        {
            $views.hide();
        }
         var $view = $views.filter(bidx.utils.getViewName(view)).show();
    };

    var _showMainView = function(view, hideview)
    {

        $views.filter(bidx.utils.getViewName(hideview)).hide();
        var $view = $views.filter(bidx.utils.getViewName(view)).show();

    };

    // display generic error view with msg provided
    //
    function _showError( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    }

    function _menuActivateWithTitle ( menuItem,pageTitle)
    {
        //Remove active class from li and add active class to current menu
        $element.find(".limenu").removeClass('active').filter(menuItem).addClass('active');
        /*Empty page title and add currentpage title
        $element.find(".pagetitle").empty().append(pageTitle); */
    }

    // ROUTER

    //var navigate = function( requestedState, section, id )
    var navigate = function(options)
    {
        var state;

        state = options.state;

        switch (state)
        {
            case "load" :

                _showView("load");

                break;

            case "help" :
                _menuActivateWithTitle(".Help","My entrepreneur helppage");
                _showView("help");
                break;

            case "entrepreneur":

                _menuActivateWithTitle(".Dashboard","My entrepreneur dashboard");
                _showView("load");
                _showView("loadinvestors",true);
                _showView("loadmentors",true);

                // getBusinessesAndCompanies(
                // {
                //     list: "business"
                //   , view: "business"
                //   , callback: function()
                //     {
                //         _showMainView("business", "load");

                //     }
                // });


                //  getInvestors(
                // {
                //     list: "investors"
                //   , view: "investors"
                //   , callback: function()
                //     {

                //         _showMainView("investors", "loadinvestors");

                //     }
                // });

                //  getMentors(
                // {
                //     list: "mentors"
                //   , view: "mentors"
                //   , callback: function()
                //     {

                //         _showMainView("mentors", "loadmentors");

                //     }
                // });

                break;
        }
    };

                //  getInvestors(
                // {
                //     callback: function()
                //     {
                //         _showMainView("investors", "loadinvestors");
                //     }
                // });

                 fetchBusinesses();
                 getMemberBusinesses();

    //expose
    var dashboard =
            {
                navigate: navigate
              , $element: $element
            };


    if (!window.bidx)
    {
        window.bidx = {};
    }

    window.bidx.dashboard = dashboard;

    //Initialize Handlers
    //_initHandlers();


    if ($("body.bidx-entrepreneur-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {
        document.location.hash = "#dashboard/entrepreneur";
    }


}(jQuery));

