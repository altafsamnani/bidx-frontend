/* global bidx */
;( function( $ )
{
    "use strict";

    var $element                    =   $( ".bidx-evaluation" )
    ,   $snippets                   =   $element.find( ".snippets" )
    ,   $views                      =   $element.find( ".view" )
    ,   $editControls               =   $element.find( ".editControls" )
    ,   $evalList                   =   $element.find( ".eval-list" )
    ,   $likeBtn                    =   $element.find( ".likeBtn")
    ,   $btnRecommend               =   $likeBtn.find('.btn-recommend')
    ,   icl_vars                    =   window.icl_vars || {}
    ,   iclLanguage                 =   bidx.utils.getValue( icl_vars, "current_language" )
    ,   currentLanguage             =   (iclLanguage && iclLanguage !== 'en') ? '/' + iclLanguage : ''
    ,   competitionVars             =   window.__bidxCompetition || {}
    ,   applicationObj
    ,   actorsObj
    ,   competitionBidxMeta
    ,   businessSummary
    ,   bpCounter                   =   0
    ,   loggedInMemberId            =   bidx.common.getCurrentUserId()
    ,   loggedInUserBpRoleAction    =   { } 

    ,   appName                     =   "evaluation"

    ,   forms                       =
        {
            generalOverview:
            {
                $el:                    $element.find( "#frmBusinessSummary-GeneralOverview" )
            }
        ,   aboutYourBusiness:
            {
                $el:                    $element.find( "#frmBusinessSummary-AboutYourBusiness" )
            }
        ,   aboutYouAndYourTeam:
            {
                $el:                    $element.find( "#frmBusinessSummary-AboutYouAndYourTeam" )
            }
        ,   financialDetails:
            {
                $el:                    $element.find( "#frmBusinessSummary-FinancialDetails" )
            }
        ,   companyDetails:
            {
                $el:                    $element.find( "#frmBusinessSummary-CompanyDetails" )
            }
        ,   mentoringDetails:
            {
                $el:                    $element.find( "#frmBusinessSummary-MentoringDetails" )
            }
        }

    ;

    // Form fields
    //
    var fields =
    {
        "generalOverview":
        {
            "_root":
            [
                "name"
            ,   "slogan"
            ,   "summary"

                // This is actually an array in the data model, but presented as a dropdown in the UI designs.
                // Conflict!
                // We need to force it to be an array when sending into the API
                // After disucssion with Jeroen created BIDX-1435 to request any non-array value to be interpreted as an array by the API,
                // but until that is available, send in reasonforSubmsision as an array
                //
            ,   "reasonForSubmission"
            ,   "externalVideoPitch"
            ,   "externalAudioPitch"
            ]
        }

    ,   "aboutYourBusiness":
        {
            "_root":
            [
                // "industry"
            // ,   "suggestedIndustry"
            // ,   "productService"
            // ,   "suggestedProductService"
                "countryOperation"
            ,   "socialImpact"
            ,   "envImpact"
            ,   "consumerType"
            ]
        }

    ,   "aboutYouAndYourTeam":
        {
            "_root":
            [
                "personalRole"
            ,   "personalExpertise"
            ]

        ,   "_arrayFields":
            [
                "managementTeam"
            ]

        ,   "_reflowRowerFields":
            [
                "managementTeam"
            ]

        ,   "managementTeam":
            [
                "firstName"
            ,   "lastName"
            ,   "role"
            ,   "expertise"
            ,   "linkedIn"
            ]
        }

    ,   "financialDetails":
        {
            "_arrayFields":
            [
                "financialSummaries"
            ]

        ,   "_root":
            [
                "yearSalesStarted"
            ,   "equityRetained"
            ,   "investmentType"
            ,   "summaryFinancingNeeded"
            ]

        ,   "financialSummaries":
            [
                "financeNeeded"
            ,   "numberOfEmployees"
            ,   "operationalCosts"
            ,   "salesRevenue"
            //  totalIncome is a derived field, but not a input
            ]
        }

    ,   "mentoringDetails":
        {
            "_root":
            [
                "mentorAdvisory"
            ,   "expertiseNeeded"
            ,   "expertiseNeededDetail"
            ]
        }
    };

    // Setup function for doing work that should only be done once
    //
    function _oneTimeSetup( )
    {
         

    }

    function isBusinessPlanForRecommendation ( response )
    {

        var competitionRoundStatus
        ,   isCompetitionManager
        ,   currentPhaseReview
        ,   competitionRecommendation
        ,   isHavingAssessorReview
        ,   isHavingJudgeReview
        ,   reviews                     =   response.reviews
        ,   status                      =   response.status
        ,   recommendation              =   bidx.i18n.i( 'statusPending' )
        ,   reviewRating                =   0
        ,   loggedInCompetitionRoles    =   competitionBidxMeta.bidxCompetitionRoles
        ,   competitionRoundStatus      =   bidx.utils.getValue( competitionBidxMeta, 'bidxCompetitionRoundStatus')
        ,   entityId            =   bidx.utils.getValue( response, 'entityId')
        ,   showBpPlan                  =   false
        ;

        isCompetitionManager        =   _.contains( loggedInCompetitionRoles, 'COMPETITION_ADMIN');

        bidx.utils.log( 'competitionRoundStatus', competitionRoundStatus);


        if( competitionRoundStatus === 'ASSESSMENT' )
        {
            isHavingAssessorReview      =   _.findWhere(    reviews
                                                        ,   {
                                                                role:   "COMPETITION_ASSESSOR"
                                                            ,   userId: loggedInMemberId
                                                        }  );

            competitionRecommendation   =   bidx.utils.getValue( isHavingAssessorReview, 'competitionRecommendation');

            if( isHavingAssessorReview 
               // && !competitionRecommendation 
               )
            {
                showBpPlan                      =   true;
                
                loggedInUserBpRoleAction[ entityId ]    =   
                {
                    role:   "COMPETITION_ASSESSOR"
                ,   action: "FINALIST"
                };  
            }
        }
        else if( competitionRoundStatus === 'JUDGING' )
        {
            isHavingJudgeReview         =   _.findWhere(    reviews
                                                        ,   {
                                                                role:   "COMPETITION_JUDGE"
                                                            ,   userId: loggedInMemberId
                                                            }  );

            competitionRecommendation   =   bidx.utils.getValue( isHavingJudgeReview, 'competitionRecommendation');

            if( isHavingJudgeReview 
             //   && !competitionRecommendation 
            )
            {
                showBpPlan     =   true;

                loggedInUserBpRoleAction[ entityId ]    =   
                {
                    role:   "COMPETITION_JUDGE"
                ,   action: "WINNER"
                }; 

            }

        }

        return  showBpPlan;
    }


    var _loadBusinesses  = function ( options )
    {
        bidx.utils.log('competitionBidxMeta', competitionBidxMeta);
         bidx.utils.log( 'applicationObj', applicationObj);

        var reviews
        ,   entityId
        ,   displayBpPlan
        ,   bulkPlanIds = [ ]
        ;

        $.each( applicationObj, function( idx, response )
        {
            reviews             =   response.reviews;

            if( reviews.length  )
            {
                entityId            =   bidx.utils.getValue( response, 'entityId');
               /* bidxMeta            =   bidx.utils.getValue( response, 'bidxMeta');
                business            =   bidx.utils.getValue( bidxMeta, 'bidxEntityDisplayName');
                entrepreneur        =   bidx.utils.getValue( bidxMeta, 'bidxOwnerDisplayName');
                ownerId             =   bidx.utils.getValue( bidxMeta, 'bidxOwnerId');
                rating              =   bidx.utils.getValue( bidxMeta, 'bidxRatingAverage');

                businessData        = '<a href="' + bidx.common.url('businesssummary') + entityId +  '" target="_blank">' + business + '</a>';
                entrepreneurData    = '<a href="' + bidx.common.url('member') + ownerId + '" target="_blank">' + entrepreneur + '</a>';
*/
                displayBpPlan       =  isBusinessPlanForRecommendation( response );

                if( displayBpPlan )
                {
                    bidx.utils.log( 'responseeee', response );
                    bulkPlanIds.push( { id: entityId })
                }
                
            }

        });

        //  execute callback if provided
        if ( options && options.callback )
        {
            options.callback( 
            {
                data:   bulkPlanIds
            } );
        }
    }

    var _loadCompetitionVars = function ( competitionVars )
    {
        if ( !$.isEmptyObject( competitionVars) )
        {
            applicationObj              = bidx.utils.getValue( competitionVars, 'applications');

            actorsObj                   = bidx.utils.getValue( competitionVars, 'actors');

            competitionBidxMeta         = bidx.utils.getValue( competitionVars, 'bidxMeta');

        }
    };

    var parseVideoUrl = function ( $videoItem, url )
    {
        $videoItem.html(function(i, html) 
        {
            address = html.replace(/(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g, '<iframe src="http://www.youtube.com/embed/$1" frameborder="0" allowfullscreen id="videoPlayer" ></iframe>').replace(/(?:http:\/\/)?(?:www\.)?(?:vimeo\.com)\/(.+)/g, '<iframe id="videoPlayer" src="//player.vimeo.com/video/$1" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');    
            return address;
        } );
    }
    

    function _replaceBusinessData(  )
    {

        var $listItem
        ,   $financeItem   
        ,   $attachItem 
        ,   $attachmentItem
        ,   listItem
        ,   replacedList
        ,   externalVideoPitch
        ,   $entityElement
        ,   snippit
        ,   financeSnippit
        ,   tmpFinanceSnippit
        ,   tmpAttachSnippit
        ,   attachmentSnippit
        ,   item
        ,   emptyVal                =   ''
        ,   financeEmptyVal         =   0
        ,   conditionalElementArr   =   { }
        ,   countryOperation
        ,   entrpreneurIndustry
        ,   entrpreneurReason
        ,   financialSummaries
        ,   financeItem
        ,   attachItem
        ,   $el
        ,   $raty
        ,   $ratingWrapper
        ,   logo
        ,   logoDocument
        ,   cover
        ,   coverDocument
        ,   owner
        ,   country
        ,   industry
        ,   reason
        ,   rating
        ,   item            
        ,   bidxMeta        
        ,   completeness   
        ,   company        
        ,   logo
        ,   logoDocument
        ,   cover
        ,   coverDocument
        ,   lastUpdatedDateTime
        ,   videoPitch
        ,   $videoWrapper
        ,   audioPitch
        ,   audioWrapper
        ,   dataArr
        ,   i18nItem    
        ,   offset
        ,   attachment
        ,   documentType
        ,   coverTop
        ,   conditionalElementArr
        ;


        bpCounter  =   ( bpCounter === businessSummary.length ) ? 0 : bpCounter;


        item    =   businessSummary[ bpCounter ];

        bpCounter++;

        bidxMeta        =   bidx.utils.getValue(item, 'bidxMeta');
        completeness    =   bidx.utils.getValue(bidxMeta, 'bidxCompletionMesh');
        company         =  bidx.utils.getValue(item, 'company');

        $evalList.empty( );

       // $financeItem.empty( );

        bidx.utils.log('$evallist', bpCounter, item);

        $entityElement      =   $("#bp-snippet");
        snippit             =   $entityElement.html().replace(/(<!--)*(-->)*/g, "");
        financeSnippit      =   $('#financial-snippet').html().replace(/(<!--)*(-->)*/g, "");
        attachmentSnippit   =   $('#attachment-snippet').html().replace(/(<!--)*(-->)*/g, "");
        
        countryOperation    =   bidx.utils.getValue( item, "countryOperation");
        lastUpdatedDateTime =   bidx.utils.getValue(bidxMeta, 'bidxLastUpdateDateTime')
        financialSummaries  =   bidx.utils.getValue( item, "financialSummaries");
        attachment          =   bidx.utils.getValue( item, "attachment");
 
        dataArr   =   
        {
            'industry'          :   'industry'   
        ,   'socialImpact'      :   'socialImpact'
        ,   'envImpact'         :   'envImpact'
        ,   'language'          :   'language'    
        ,   'countryOperation'  :   'country'
        ,   'consumerType'      :   'consumerType'
        ,   'stageBusiness'     :   'stageBusiness' 
        ,   'expertiseNeeded'   :   'mentorExpertise'
        };
        
        bidx.data.getStaticDataVal (
        {
                dataArr     : dataArr
            ,   item        : item
            ,   callback   : function (label) 
                            {
                                i18nItem = label;
                            }
        });

        // search for placeholders in snippit
        //
        
        
        listItem = snippit
            .replace( /%entityId%/g,                bidx.utils.getValue(bidxMeta, 'bidxEntityId') )
            //.replace( /%userId%/g,              bidx.utils.getValue(bidxMeta, 'bidxOwnerId') )
            .replace( /%name%/g,                    item.name   ? item.name : emptyVal )
            .replace( /%bidxOwnerDisplayName%/g,    bidx.utils.getValue(bidxMeta, 'bidxOwnerDisplayName') )
            .replace( /%slogan%/g,                  item.slogan   ? item.slogan : emptyVal )
            .replace( /%summary%/g,                 item.summary   ? item.summary : emptyVal )
            .replace( /%modified%/g,                lastUpdatedDateTime  ? bidx.utils.parseTimestampToDateStr(lastUpdatedDateTime, "date") : emptyVal )
            .replace( /%country%/g,                 i18nItem.countryOperation )
            .replace( /%industry%/g,                i18nItem.industry )
            .replace( /%reasonForSubmission%/g,     reason )
            .replace( /%financingNeeded%/g,         bidx.utils.formatNumber(item.financingNeeded)   ? bidx.utils.formatNumber(item.financingNeeded) + " " + bidx.i18n.i('usd') : emptyVal )
            .replace( /%companyRegistration%/g ,    ( !$.isEmptyObject( company ) && company.registered ) ? 'Yes' : 'No')
            .replace( /%yearSalesStarted%/g,        item.yearSalesStarted )
            .replace( /%bidxRatingAverage%/g,       bidx.utils.getValue(bidxMeta, 'bidxRatingAverage') ) 
            .replace( /%bidxCompletionMesh%/g,      ( completeness ) ? completeness + '%' : '' ) 
            .replace( /%iexternalAudioPitch%/g,     ( item.externalAudioPitch ) ? item.externalAudioPitch  : '' ) 
            .replace( /%stageBusiness%/g,           ( item.stageBusiness ) ? item.stageBusiness  : '' ) 
            .replace( /%envImpact%/g,               ( item.envImpact ) ? item.envImpact  : '' ) 
            .replace( /%socialImpact%/g,            ( item.socialImpact ) ? item.socialImpact  : '' ) 
            .replace( /%consumerType%/g,            ( item.consumerType ) ? item.consumerType  : '' ) 
            .replace( /%expertiseNeeded%/g,         i18nItem.expertiseNeeded   ? i18nItem.expertiseNeeded     : emptyVal )
            .replace( /%expertiseNeededDetail%/g,   i18nItem.expertiseNeededDetail   ? i18nItem.expertiseNeededDetail     : emptyVal )
                  ;


        logo         =   bidx.utils.getValue( item, "logo");
        logoDocument =   bidx.utils.getValue( item, "logo.url");

        cover         =  bidx.utils.getValue( item, "cover");
        coverDocument =  bidx.utils.getValue( item, "cover.url"); 

        //if ( logo && logoDocument )
        //{
            listItem    = listItem.replace( /%logoDocument%/g, (logoDocument) ? logoDocument : '#' );
        //}
        
        //{
            coverTop    =   bidx.utils.getValue( item, "cover.top"); 
            listItem    =   listItem
                                .replace( /%coverDocument%/g, (coverDocument) ? coverDocument : '#'  )
                                .replace( /%coverTop%/g, coverTop )
        //}

        $listItem       =   $(listItem);
    
        //Iterate Financial Summaries
        if( financialSummaries )
        {
        $financeItem        =   $listItem.find('.financeBody');

            $.each( financialSummaries, function( year, financeData )
            {
                tmpFinanceSnippit   =   financeSnippit;
                financeItem         =   tmpFinanceSnippit
                                        .replace( /%year%/g,                    year )
                                        .replace( /%revenue%/g,         financeData.salesRevenue        ?   financeData.salesRevenue : financeEmptyVal )     
                                        .replace( /%operationalCost%/g, financeData.operationalCosts    ?   financeData.operationalCosts : financeEmptyVal )
                                        .replace( /%totalIncome%/g,     financeData.totalIncome         ?   financeData.totalIncome : financeEmptyVal )
                                        .replace( /%financeNeeded%/g,   financeData.financeNeeded       ?   financeData.financeNeeded : financeEmptyVal )
                                        .replace( /%employees%/g,       financeData.numberOfEmployees   ?   financeData.numberOfEmployees : financeEmptyVal )
                                        ; 
                
                $financeItem.append( $("tr").add( financeItem ));

            });
        }

        if( attachment )
        {
            //Iterate Attachment
            $attachmentItem        =   $listItem.find('.attachmentBody');
            
            $.each( attachment, function( idx, attachmentData )
            {

                tmpAttachSnippit   =   attachmentSnippit;



                documentType       =   attachmentData.documentType    ?   bidx.data.i( attachmentData.documentType, "documentType" ) : emptyVal;

                attachItem         =   tmpAttachSnippit
                                        .replace( /%document%/g,        attachmentData.document        ?   attachmentData.document : emptyVal )     
                                        .replace( /%documentName%/g,    attachmentData.documentName    ?   attachmentData.documentName : emptyVal )
                                        .replace( /%purpose%/g,         attachmentData.purpose         ?   attachmentData.purpose : '-' )
                                        .replace( /%documentType%/g,    documentType )      
                                        ; 

                $attachItem     =   $("").add( attachItem );

                $attachmentItem.append( $attachItem );
            });
        }

        
        videoPitch      =   bidx.utils.getValue( item, 'externalVideoPitch' );

        if( videoPitch )
        {
            $videoWrapper   =   $listItem.find( 'video-wrapper');

            parseVideoUrl( $videoWrapper, videoPitch );

            $videoWrapper.removeClass('hide');
        }

        audioPitch      =   bidx.utils.getValue( item, 'externalAudioPitch' );

        if( audioPitch )
        {
            $audioWrapper   =   $listItem.find('.audioPitch');

            $audioWrapper.removeClass('hide');

        }
        
        if ( logo && logoDocument )
        {
            $listItem.find('.logoImage').removeClass('hide');
        }
        
        if ( cover && coverDocument )
        {
            $listItem.find('.coverImageContainer').removeClass('hide');
        }


        /* Displaying Rating Star Logic */
        $ratingWrapper              = $listItem.find( ".rating-wrapper" );
        $raty                       = $ratingWrapper.find( ".raty" );
        rating                      = bidx.utils.getValue(item, 'rating')

        if( rating )
        {
            $raty.raty({
                starType: 'i',
                readOnly: true,
                // TODO Arjan remove or translate?
                hints:  ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
                score:  rating.toFixed(1)

        });
        }

        logo = bidx.utils.getValue( item, "logo");
        logoDocument = bidx.utils.getValue( item, "logo.url");

        cover = bidx.utils.getValue( item, "cover");
        coverDocument = bidx.utils.getValue( item, "cover.url");

        if ( logo && logoDocument )
        {
            placeBusinessThumb( $listItem, logoDocument );
        }
        else if ( cover && coverDocument )
        {
            placeBusinessThumb( $listItem, coverDocument );
        }

        

        //Set the Like Btn Dislike Btn Business id to process onclick
        $btnRecommend.data('id', bidxMeta.bidxEntityId);

        conditionalElementArr =
        {
           'summary'            :   "summary"
        ,  'company'            :   "company"
        ,  'financialSummaries' :   'financialSummaries'
        ,  'mentorAdvisory'     :   'mentorAdvisory'
        ,  'attachment'         :   'attachment'
        ,  'industry'           :   'industry'
        ,  'countryOperation'   :   'countryOperation' 
        ,  'socialImpact'       :   'socialImpact'
        ,  'envImpact'          :   'envImpact'
        ,  'consumerType'       :   'consumerType'
        };

        $likeBtn.removeClass('hide');

        showElements(
        {
            elementArr: conditionalElementArr
        ,   result:     item
        ,   listItem:   $listItem
        ,   callback:   function( listItem )
            {

                $evalList.hide().append( listItem ).fadeIn(1000 , function() 
                {
                    
                });
            }
        });

    }

    function _assignRecommendationForCompetition( options )
    {
        var entityId    =   options.entityId
        ;

        bidx.api.call(
            "competition.updateRecommendationForCompetition"
        ,   {
                competitionId:  options.competitionId
            ,   entityId:       entityId
            ,   groupDomain:    bidx.common.groupDomain
            ,   data:           options.data
            ,   success:        function( response )
                {
                    //  execute callback if provided
                    if (options && options.success)
                    {
                        options.success( response.data );
                    }
                }

            ,   error: function(jqXhr, textStatus)
                {
                    var errorMsg
                    ,   statusMsg
                    ,   $cardHeader     = $element.find( ".cardHeader" + entityId )
                    ,   snippetError    = $("#errorapp-card").html().replace(/(<!--)*(-->)*/g, "")
                    ,   status          = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    errorMsg = status + ' ' + bidx.i18n.i( "ERROR_ASSIGNACTOR", appName) + entityId  ;

                    statusMsg = snippetError
                                .replace( /%errorMsg%/g, errorMsg)
                                .replace( /%entityId%/g, entityId);

                    $cardHeader.empty().prepend($(statusMsg));

                    _showAllView('errorCard' + entityId );

                    if (options && options.error)
                    {
                        options.error( );
                    }
                }
            }
        );
    }

    function _likeDislikeClick()
    {
        // Recommend plan by clicking Like/Dislike Button
        //

        $btnRecommend.click( function( e )
        {
            e.preventDefault();

            var $this                   =   $(this)
            ,   competitionSummaryId    =   competitionBidxMeta.bidxCompetitionId
            ,   businessId              =   $this.data('id')
            ,   roleAction              =   loggedInUserBpRoleAction[ businessId ]
            ,   data
            ,   role
            ,   action
            ;

            data    =   {
                            "role":           roleAction.role,
                            "recommendation": roleAction.action,
                            "comment":        'Added by App',
                          //  "rating":         rating
                        };

            _assignRecommendationForCompetition(
            {
                competitionId:  competitionSummaryId
            ,   entityId:       businessId
            ,   data:           data
            ,   success:       function( data )
                {
                   _replaceBusinessData( );

                }
            ,   error:           function ( )
                {
                    $btnAction.text( orgText ).removeClass('disabled');
                }
            } );
        } );
    }

    // Retrieve the business summary by ID
    //
    // @returns promise
    //
    function _getBulkBusinessSummaries( options )
    {
        var data    =   options.data
        ;

        // Fetch the business summary
        //
        bidx.api.call(
            "entity.getBulk"
        ,   {   
                data:           data
            ,   groupDomain:    bidx.common.groupDomain

            ,   success: function( response )
                {
                   
                    businessSummary = response.data;

                    _replaceBusinessData( );

                    bidx.utils.log( "bidx::businessSummary", businessSummary );

        
                }
            ,   error:          function( jqXhr, textStatus )
                {
                    var status  = bidx.utils.getValue( jqXhr, "status" ) || textStatus
                    ,   msg     = "Something went wrong while retrieving the business summary: " + status
                    ,   error   = new Error( msg )
                    ;

                    _showError( msg );

         
                }
            }
        );
    }

    var showElements = function( options ) {

        var elementArr      = options.elementArr // elementArr is used for conditional element display ex. Linkedin exist then only display
        ,   result          = options.result
        ,   $listItem       = options.listItem
        ,   $listViews      = $listItem.find(".view")
        ,   itemRow
        ;

        $.each(elementArr, function(clsKey, clsVal)
        {
            itemRow = bidx.utils.getValue( result, clsVal );
            if ( itemRow )
            {
                _showElement(clsKey, $listViews); // elementArr is used for conditional element display ex. Linkedin exist then only display
            }
        });

        // If callback set use it
        //
        if (options && options.callback)
        {
            options.callback( $listItem  );
        }

    };

    var _showElement = function(view, $listViews)
    {
        //  show title of the view if available
         var $mainView = $listViews.filter(bidx.utils.getViewName(view)).show();
    };
    


    function _init(  )
    {

        //_getApplicantIds( );

        var option
         ,   visibilityArrItems  =   [ ]
         ;

         _loadCompetitionVars( competitionVars );

         _loadBusinesses( 
         { 
            callback : function( options )
            {

                _getBulkBusinessSummaries( options );
                _likeDislikeClick();
            }
          }); 

        /*_getBusinessSummary()
        .then( function()
        {
            return _getCompanies();
        })
        .fail( function()
        {
            $btnCancel.removeClass( "disabled" );
        })
        .done( function()
        {
            _populateScreen();

            $btnSave.removeClass( "disabled" );
            $btnCancel.removeClass( "disabled" );

            bidx.common.removeValidationErrors();

            _showView( "edit" );
            //_getMentorRequests( );
            _showAllView( "mentor" );
            _showAllView( "matchingmentors" );

        } ); */


    }

    // ROUTER
    //
    function navigate( options )
    {
        var params  = options.params
        ,   cancel  = bidx.utils.getValue( params, 'cancel')
        ;

        if ( options.requestedState !== "edit" )
        {
            $element.removeClass( "edit" );
        }

        switch ( options.requestedState )
        {
            case 'view':

               bidx.utils.log( "businessSummary::AppRouter::view" );
                // Make sure the i18n translations and static data api items for this app are available before initing
                //
                bidx.i18n.load( [ "__global", appName ] )
                .then( function()
                {
                    return bidx.data.load( [ "country" ] );
                } )
                .done( function()
                {
                    _init(  );
                } );

            break;

            }
    }

    // Engage!
    //
    _oneTimeSetup();

    // Expose
    //
    var app =
    {
        navigate:                   navigate
    //,   reset:                      reset

    ,   $element:                   $element

        // START DEV API
        //
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.evaluation = app;


    // if hash is empty and there is not path in the uri, load #home
    //
    if ($("body.bidx-evaluation").length && !bidx.utils.getValue(window, "location.hash").length)
    {
        window.location.hash = "#viewEvaluationBusiness";
    }
} ( jQuery ));