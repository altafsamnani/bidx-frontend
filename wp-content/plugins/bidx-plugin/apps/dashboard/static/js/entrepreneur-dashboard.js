;(function($)
{
    "use strict";
    var $element            =   $( "#entrepreneur-dashboard" )
    ,   $views              =   $element.find( ".view" )
    ,   $elementHelp        =   $element.find( ".startpage" )
    ,   $tabBusinesses      =   $element.find( "#tab-businesses" )
    ,   $tabCompanies       =   $element.find( "#tab-companies" )
    ,   $tabGroups          =   $element.find( "#tab-groups" )
    ,   $tabRecMentors      =   $element.find( "#tab-recommended-mentors" )
    ,   $tabInvestors       =   $element.find( "#tab-interested-investors" )
    ,   $tabMentors         =   $element.find( "#tab-interested-mentors" )
    ,   $firstPage          =   $element.find( "input[name='firstpage']" )
    ,   emptySnippet        =   $("#empty-message").html().replace(/(<!--)*(-->)*/g, "")
    ,   bidx                =   window.bidx
    ,   currentUserId       =   bidx.common.getSessionValue( "id" )
    ,   userBusinesses      =   bidxConfig.session.wp.entities.bidxBusinessSummary
    ,   userBsArray         =   []
    ,   membersDataId       =   []
    ,   authItems           =   []
    ,   appName             =   "dashboard"
    ;

    var getUserBusinesses = function ( userBusinesses )
    {
        if( !$.isEmptyObject( userBusinesses ) )
        {
            $.each( userBusinesses, function( i, bs )
            {
                 userBsArray.push( bs );
            });
        }
        else
        {
            _msgForEmptyBusiness();
        }
    };

    var populateRecMentors = function ( response )
    {
        var $listItem
        ,   listItem
        ,   conditionalElementArr
        ,   $entityElement          = $("#member-profile-listitem")
        ,   snippit                 = $entityElement.html().replace(/(<!--)*(-->)*/g, "")
        ,   i18nItem
        ,   emptyVal                =   ''
        ,   $elImage                = $entityElement.find( "[data-role = 'memberImage']" )
        ,   allLanguages            = ''
        ,   montherLanguage         = ''
        ,   country                 = ''
        ,   industry                = ''
        ,   isGroupAdmin            = bidx.common.isGroupAdmin()
        ,   image
        ,   imageWidth
        ,   imageLeft
        ,   imageTop
        ,   highestEducation
        ,   gender
        ,   isEntrepreneur
        ,   isInvestor
        ,   investorMemberId
        ,   isMentor
        ,   cityTown
        ,   sepCountry
        ,   memberCountry
        ,   entrpreneurFocusIndustry
        ,   tagging
        ,   taggingMentor
        ,   taggingInvestor
        ,   mentorTaggingId
        ,   investorTaggingId
        ,   roles
        ,   loggedInMemberId = bidx.common.getCurrentUserId()
        ,   currentInvestorId = bidx.common.getInvestorProfileId()
        ,   displayInvestorProfile  = ( $.inArray("GroupOwner", roles) !== -1 || $.inArray("GroupAdmin", roles) !== -1 || currentInvestorId ) ? true : false
        ;

        $.each (response.found, function(i, item){

            i18nItem        =   item.member;
            roles           = bidx.utils.getValue( i18nItem, "roles" );
            isEntrepreneur  = ( $.inArray("entrepreneur", roles) !== -1 ) ? true : false;
            isMentor        = ( $.inArray("mentor", roles) !== -1 ) ? true : false;
            isInvestor      = ( $.inArray("investor", roles) !== -1 ) ? true : false;

            investorMemberId = bidx.utils.getValue( i18nItem, "userId" );
            // cityTown         = bidx.utils.getValue( i18nItem, "cityTown");
            memberCountry    = bidx.utils.getValue( i18nItem, "country");
            tagging          = bidx.common.getAccreditation( i18nItem );

            // Member Role
            //
            if(i18nItem.highestEducation)
            {
                bidx.data.getItem(i18nItem.highestEducation, 'education', function(err, label)
                {
                    highestEducation = label;
                });
            }
            if(i18nItem.gender)
            {

                bidx.data.getItem(i18nItem.gender, 'gender', function(err, labelGender)
                {
                    gender = labelGender;
                });
            }
            if(memberCountry)
            {

                bidx.data.getItem(memberCountry, 'country', function(err, labelCountry)
                {
                    sepCountry =  (cityTown) ? ', ' : '';
                    country    =  sepCountry + labelCountry;
                });
            }

            // Language is handled specially
            //
            var languageDetail      = bidx.utils.getValue( i18nItem, "language", true );

    
            if ( languageDetail )
            {
                var     sep             = ''
                ,   langLength      = languageDetail.length
                ,   langLabel       = ''
                ,   langCount       = 1
                ;

                $.each( languageDetail, function( i, langObj )
                {
                    langCount++;
                    langLabel = bidx.common.getLanguageLabelByValue( langObj );
                    allLanguages +=  sep + langLabel;
                    sep           = (langCount !== langLength) ? ', ' : ' and ';

                } );
            }

            if(i18nItem.motherLanguage)
            {
                montherLanguage =  bidx.common.getLanguageLabelByValue( i18nItem.motherLanguage );
            }
    
            entrpreneurFocusIndustry = bidx.utils.getValue( i18nItem, "bidxEntrepreneurProfile.focusIndustry");
            if(entrpreneurFocusIndustry)
            {
                bidx.data.getItem(entrpreneurFocusIndustry, 'industry', function(err, focusIndustry)
                {
                    industry = bidx.i18n.i( 'interestedIn', appName ) + ': ' + focusIndustry;
                });
            }

            // search for placeholders in snippit
            //
            listItem = snippit
                .replace( /%userId%/g,              i18nItem.userId )
                .replace( /%name%/g,                i18nItem.name )
                .replace( /%modified%/g,            i18nItem.modified  ? bidx.utils.parseISODateTime(i18nItem.modified, "date") : emptyVal )
                .replace( /%professionalTitle%/g,   i18nItem.title   ? i18nItem.title     : emptyVal )
                .replace( /%role_entrepreneur%/g,   ( isEntrepreneur )  ? bidx.i18n.i( 'entrepreneur' )    : '' )
                .replace( /%role_investor%/g,       ( isInvestor && displayInvestorProfile )      ? bidx.i18n.i( 'investor' )   : '' )
                .replace( /%role_mentor%/g,         ( isMentor )        ? bidx.i18n.i( 'mentor' )   : '' )
                .replace( /%gender%/g,              i18nItem.gender   ? gender    : emptyVal )
                .replace( /%highestEducation%/g,    i18nItem.highestEducation   ? highestEducation    : emptyVal )
                .replace( /%language%/g,            allLanguages )
                .replace( /%mothertongue%/g,        montherLanguage )
                .replace( /%city%/g,                ( cityTown ) ? cityTown : emptyVal )
                .replace( /%country%/g,             ( country )  ? country : emptyVal )
                .replace( /%interest%/g,            industry )
                ;

            $listItem     = $(listItem);

            var roleLabel = $listItem.find( ".bidx-label" );
            $.each( roleLabel, function( index, val )
            {
                if ( $(this).text() === "" )
                {
                    $(this).remove();
                }
            });

            /* tagging */
            if(isMentor)
            {
                mentorTaggingId     =   'hide';
                taggingMentor       =   bidx.utils.getValue(tagging, 'mentor' );

                if( !_.isUndefined(taggingMentor) )
                {
                    mentorTaggingId     =   (taggingMentor.tagId === 'accredited' ) ? 'fa-bookmark'  :   'fa-ban';
                }

                $listItem.find('.fa-mentor').addClass( mentorTaggingId );
            }
            if( ( isInvestor && isGroupAdmin) || ( investorMemberId === loggedInMemberId ) )
            {
                investorTaggingId   =   'hide';
                taggingInvestor     =   bidx.utils.getValue(tagging, 'investor' );

                if( !_.isUndefined(taggingInvestor) )
                {
                    investorTaggingId   =   (taggingInvestor.tagId === 'accredited' ) ? 'fa-bookmark'  :   'fa-ban';
                }

                $listItem.find('.fa-investor').addClass( investorTaggingId );
            }

            // Member Image
            //
            image       = bidx.utils.getValue( i18nItem, "picture.url" );

            if (image)
            {
                imageWidth  = bidx.utils.getValue( i18nItem, "picture.width" );
                imageLeft   = bidx.utils.getValue( i18nItem, "picture.left" );
                imageTop    = bidx.utils.getValue( i18nItem, "picture.top" );
                $listItem.find( "[data-role = 'memberImage']" ).html( '<div class="img-cropper"><img src="' + image + '" style="width:'+ imageWidth +'px; left:-'+ imageLeft +'px; top:-'+ imageTop +'px;" alt="" /></div>' );

            }

            conditionalElementArr =
            {
                'professionalTitle' :   'title'
            ,   'gender'            :   'gender'
            ,   'motherTongue'      :   'motherLanguage'
            ,   'langauge'          :   'language'
            ,   'highestEducation'  :   'highestEducation'
            ,   'country'           :   'country'
            };

            $.each(conditionalElementArr, function(clsKey, clsVal)
            {
                var itemRow = bidx.utils.getValue( i18nItem, clsVal );
                if ( itemRow )
                {
                    $listItem.find(bidx.utils.getViewName(clsKey)).show();
                }
            });

            $tabRecMentors.append( $listItem );
        });

        _hideView('loadrecmentors');

    }

    var showRecMentors = function()
    {
        var item;

        bidx.api.call(
            "search.found"
        ,   {
                groupDomain: bidx.common.groupDomain
            ,   data: {
                          "searchTerm"    :   "basic: \"roberts\""
                      ,   "sort"          :   []
                      ,   "maxResult"     :   10
                      ,   "offset"        :   0
                      ,   "entityType"    :   ["bdxmember"]
                      }
            ,   success: function(response)
                {
                    populateRecMentors(response);
                }
            ,   error: function(jqXhr, textStatus)
                {
                    bidx.utils.log("error", jqXhr);
                }
            }
        );
    }

    var showGroups = function()
    {
        var groups = bidxConfig.session.groups
        ,   tabGroupMsg
        ;

        for ( var key in groups )
        {
            $tabGroups.append(bidx.construct.groupCardView(groups[key]));
        }

        _hideView('loadgroups');
    }

    //public functions
    //

    var fetchBusinesses = function ( options )
    {
        var $d = $.Deferred();

        bidx.api.call(
            "businesssummary.fetch"
            ,   {
                    groupDomain:    bidx.common.groupDomain
                ,   success: function( response )
                    {
                        if ( response && response.data && response.data.received )
                        {
                            $.each( response.data.received, function( id, item )
                            {
                                getAuthMembers( item );

                                authItems.push( item );

                                bidx.common.addToTempBusinesses( item.entity );

                            });
                        }
                        $d.resolve( );
                    }

                , error: function(jqXhr, textStatus)
                {
                    var status  = bidx.utils.getValue(jqXhr, "status") || textStatus
                    ,   msg     = "Something went wrong while retrieving members: " + status
                    ,   error   = new Error( msg )
                    ;

                    _showError("Something went wrong while retrieving investorslist of the member: " + status);

                    $d.reject( error );
                }
            }
        );

        return $d.promise( );
    };

    var fetchCompanies = function( options )
    {
        var tabCompanyMsg
        ;

        bidx.api.call(
            "company.fetchAll"
        ,   {
                groupDomain:    bidx.common.groupDomain
            ,   success:        function ( response )
                {
                    if ( !$.isEmptyObject( response ) )
                    {
                        $.each( response, function( idx, item )
                        {
                            var bidxMeta = bidx.utils.getValue( item, "bidxMeta" );

                            if ( bidxMeta && bidxMeta.bidxEntityType === 'bidxCompany' )
                            {
                                tabCompanyMsg   =   bidx.construct.companyCardView( item );

                                $tabCompanies.append( tabCompanyMsg );
                            }
                        } );
                    }
                    else
                    {
                        tabCompanyMsg    =  emptySnippet
                                            .replace( /%msg%/g, bidx.i18n.i("noCompany", appName ) )
                                            .replace( /%btnLink%/g, bidx.common.url('company') + '#createCompany' )
                                            .replace( /%btnMsg%/g, bidx.i18n.i("newCompany", appName ) );

                        $tabCompanies.append( tabCompanyMsg );

                    }

                    _hideView('loadcompanies');
                }

            ,   error:          function( jqXhr, textStatus )
                {
                    var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                    _showError( "Something went wrong while retrieving the company: " + status );
                }
            }
        );
    };

    var getAuthMembers = function ( item )
    {
        $.each( item.authorizations, function( id, auth )
        {
            if ( $.inArray( auth.user.id, membersDataId) === -1 && bidx.common.checkMemberExists( auth.user.id ) === false  )
            {
                membersDataId.push( auth.user.id );
            }
        });
    };

    var constructAlertBoxes = function ( authItems )
    {
        $.each( authItems, function( id, item )
        {
            $.each( item.authorizations, function( id, auth )
            {
                var $bsEl = $( '*[data-bsid="'+ item.entity.bidxMeta.bidxEntityId +'"]' );

                if ( auth.status !== "rejected" )
                {
                    if ( auth.accessType === "INVESTOR" && auth.status !== "rejected" && item.owner.id === currentUserId )
                    {
                        $bsEl.append
                        (
                            bidx.construct.actionBox( auth, "investor" )
                            .append
                            (
                                bidx.construct.actionButtons( auth, "investor" )
                            )
                        );

                        $bsEl.last().find( ".alert-message" ).last()
                            .prepend
                            (
                                bidx.construct.profileThumb( auth.user.id )
                            )
                            .append
                            (
                                bidx.construct.memberLink( auth.user.id, auth.user )
                            ,   bidx.construct.actionMessage( auth, "investor" )
                            );
                    }
                }
            });
        });
    };

    // Perform an API call to Grant Access
    //
    var _doGrantRequest = function( params, cb )
    {

        bidx.api.call(
            "businesssummaryGrantAccess.send"
        ,   {
                groupDomain:            bidx.common.groupDomain
            ,   id:                     parseInt( params.params.id, 10)
            ,   investorId:             parseInt( params.params.investorId, 10)
            ,   extraUrlParameters:
                [
                    {
                        label:          "action"
                    ,   value:          params.params.action
                    }
                ]
            ,   success:            function( response )
                {
                    bidx.utils.log( "bidx::requestAccess::save::success", response );

                    var investorId      = response.data.investor.id
                    ,   businessesid    = response.data.businessSummary.bidxMeta.bidxEntityId
                    ,   $bsEl           = $( '*[data-bsid="'+ businessesid +'"]' )
                    ,   data            = {}
                    ;

                    data.status = params.params.action === "reject" ? "rejected" : "granted";
                    data.user   = investorId;
                    data.action = params.params.action;

                    //  execute callback if provided
                    if (params && params.callback)
                    {
                        params.callback();
                    }
                }
            ,   error:            function( jqXhr, textStatus )
                {
                    bidx.utils.log( "bidx::requestAccess::save::error", jqXhr, textStatus );

                    cb( new Error( "Problem granting access" ) );
                }
            }
        );
    };

    var _msgForEmptyBusiness = function ()
    {
        var tabBusinessMsg
        ;

        tabBusinessMsg  =   emptySnippet
                                        .replace( /%msg%/g, bidx.i18n.i("noBusiness", appName ) )
                                        .replace( /%btnLink%/g, bidx.common.url('businesssummary') + '#createBusinessSummary' )
                                        .replace( /%btnMsg%/g, bidx.i18n.i("newBusiness", appName ) );

        $tabBusinesses.append( tabBusinessMsg );
    };

    var _showView = function(view, showAll)
    {
        //  show title of the view if available
        if (!showAll)
        {
            $views.hide();
        }

        var $view = $views.filter(bidx.utils.getViewName( view )).show();
    };

    var _hideView = function(view, showAll)
    {
        var $view = $views.filter(bidx.utils.getViewName(view)).hide();
    };

    // var _showMainView = function(view, hideview)
    // {

    //     $views.filter(bidx.utils.getViewName(hideview)).hide();
    //     var $view = $views.filter(bidx.utils.getViewName(view)).show();

    // };

    // display generic error view with msg provided
    //
    function _showError( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    }

    getUserBusinesses( userBusinesses );

    if ( userBsArray.length )
    {
        var businesses
        ,   tabBusinessMsg
        ;

        _showView('load');

        fetchBusinesses()
        .then( function()
        {
            bidx.common.getEntities( userBsArray )
            .then( function( )
            {
                businesses  =   bidx.common.tmpData.businesses;

                _hideView('load');

                if( $.isEmptyObject(businesses) )
                {
                    _msgForEmptyBusiness( );
                }
                else // If no business then add an empty message
                {
                    $.each( businesses, function( i, item)
                    {
                        $tabBusinesses.append( bidx.construct.businessCardView( item ) );
                    });
                }

                if ( membersDataId.length )
                {
                    bidx.common.getMembersSummaries( { data: { "userIdList": membersDataId } } )
                    .done( function(  )
                    {
                        constructAlertBoxes( authItems );

                    } );
                }
                else
                {
                    constructAlertBoxes( authItems );
                }

                bidx.commonmentordashboard.getMentoringRequest()
                .then( function (requests )
                {
                    bidx.common.mentoringrequests = requests;
                    bidx.commonmentordashboard.checkMentoringRelationship( requests, "mentor", userBsArray, authItems );
                });
            });
        });
    }

    if ( $tabCompanies.length )
    {
        _showView('loadcompanies', true);

        fetchCompanies();
    }

    if ( $tabRecMentors.length )
    {
        _showView('loadrecmentors', true);

        showRecMentors();
    }

    if ( $tabGroups.length )
    {
        _showView('loadgroups', true);

        showGroups();
    }

    //expose
    var dashboard =
            {
                // navigate: navigate
                $element: $element
            ,   doGrantRequest: _doGrantRequest
            };


    if (!window.bidx)
    {
        window.bidx = {};
    }

    window.bidx.entrepreneurDashboard = dashboard;


    if ($("body.bidx-entrepreneur-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {
        // document.location.hash = "#dashboard/entrepreneur";
    }


}(jQuery));

