/* global bidx */
;( function ( $ )
{
    "use strict";

    //global parameters
    var $element             =  $(".monitoring")
    ,   $views               =  $element.find(".view")
    ,   $userTableSelector   =  $element.find(".user-table")
    ,   tableData
    ,   table
    ,   tableOptions
    ,   userTable
    ,   totalRow
    ,   listMember           =  {}
    ,   CONSTANTS =
        {
            SEARCH_LIMIT:                       10
        ,   NUMBER_OF_PAGES_IN_PAGINATOR:       10
        ,   LOAD_COUNTER:                       0
        ,   VISIBLE_FILTER_ITEMS:               4 // 0 index (it will show +1)
        ,   ENTITY_TYPES:                       [
                                                    {
                                                        "type": "bdxMember"
                                                    }
                                                ]
        ,   ROLES:                              [
                                                    {
                                                        "role": "mentor"
                                                    },
                                                    {
                                                        "role": "investor"
                                                    },
                                                    {
                                                        "role": "entrepreneur"
                                                    }
                                                ]
        }

    ,   tempLimit           =   CONSTANTS.SEARCH_LIMIT
    ,   appName              =   'monitoring'
    ,   paging               =
        {
            search:
            {
                offset:         0
            ,   totalPages:     null
            }
        }
    ,   tableHeader     =   [
                                {
                                    "data"  : "firstName"
                                }
                            ,   {
                                    "data"  : "lastName"
                                }
                            ,   {
                                    "data"  : "roles"
                                }
                            ,   {
                                    "data"  : "created"
                                }
                            ]
    ,   PIECHARTOPTIONS      =  {
                                    chartArea:      {'left': '0'}
                                ,   legend:         { 'position': 'labeled'}
                                ,   title:          bidx.i18n.i('userRolesTitle', appName)
                                ,   is3D:           true
                                }
    ,   MAX_RESULT           = 10
    ;

    function _getLanguageLabelByValue( value )
    {
            var label
            ,   languages;

            // Retrieve the list of languages from the data api
            //
            bidx.data.getContext( "language", function( err, data )
            {
                languages = data;
            });

            $.each( languages, function( i, item )
            {
                if ( item.value === value )
                {
                    label = item.label;
                }
            } );

            return label;
    }

    function _addDetailedInfo ( type, data )
    {
            bidx.utils.log('onClick +',data);

            var result
            ,   summary
            ,   listItem
            ,   industry            =   ''
            ,   item                =   data.item
            ,   dateTime            =   bidx.utils.getValue(item, 'bidxMemberProfile.bidxMeta.bidxCreationDateTime')
            ,   resultFromColumn    =   data.result // Use already calculated for column display in _addMemberDataToTable through createdRow
            ,   $listItem
            ;


            switch( type )
            {
                case 'Personal' :

                var $entityElement      =   $("#member-profile-listitem")
                ,   snippitPersonal     =   $entityElement.html().replace(/(<!--)*(-->)*/g, "")
                ,   $elImage            =   $entityElement.find( "[data-role = 'memberImage']" )
                ,   bidxMeta            =   bidx.utils.getValue( item, "bidxMemberProfile.bidxMeta" )
                ,   listItemPersonal
                ,   $listItemPersonal
                ,   allLanguages        =   ''
                ,   montherLanguage     =   ''
                ,   country             =   ''
                ,   reason              =   ''
                ,   emptyValPersonal    =   ''
                ,   image
                ,   imageWidth
                ,   imageLeft
                ,   imageTop
                ,   personalDetails     = item.bidxMemberProfile.personalDetails
                ,   highestEducation
                ,   gender
                ,   isEntrepreneur      =   bidx.utils.getValue( item, "bidxEntrepreneurProfile" )
                ,   isInvestor          =   bidx.utils.getValue( item, "bidxInvestorProfile" )
                ,   isMentor            =   bidx.utils.getValue( item, "bidxMentorProfile" )
                ,   languageDetail      = bidx.utils.getValue( personalDetails, "languageDetail", true )
                ,   cityTown            =   bidx.utils.getValue( personalDetails, "address.0.cityTown")
                ,   sepCountry
                ,   memberCountry       =   bidx.utils.getValue( personalDetails, "address.0.country")
                ;


                if(personalDetails.highestEducation)
                {
                    bidx.data.getItem(personalDetails.highestEducation, 'education', function(err, label)
                    {
                       highestEducation = label;
                    });
                }
                if(personalDetails.gender)
                {
                    bidx.data.getItem(personalDetails.gender, 'gender', function(err, labelGender)
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
                if ( languageDetail )
                {
                    var     sep             = ''
                        ,   sepMotherLang   = ''
                        ,   langLength      = languageDetail.length
                        ,   langLabel       = ''
                        ,   langCount       = 1
                        ;

                    $.each( languageDetail, function( i, langObj )
                    {
                        langCount++;
                        langLabel = _getLanguageLabelByValue( langObj.language );
                        allLanguages +=  sep + langLabel;
                        sep           = (langCount !== langLength) ? ', ' : ' and ';

                        if(langObj.motherLanguage)
                        {
                            montherLanguage +=  sepMotherLang + langLabel;
                            sepMotherLang  = ', ';
                        }

                    } );

                }


                    // search for placeholders in snippit
                //
                listItemPersonal = snippitPersonal
                    .replace( /%memberId%/g,            bidxMeta.bidxOwnerId   ? bidxMeta.bidxOwnerId     : emptyValPersonal )
                    .replace( /%firstName%/g,           personalDetails.firstName   ? personalDetails.firstName     : emptyValPersonal )
                    .replace( /%lastName%/g,            personalDetails.lastName   ? personalDetails.lastName    : emptyValPersonal )
                    .replace( /%professionalTitle%/g,   personalDetails.professionalTitle   ? personalDetails.professionalTitle     : emptyValPersonal )
                    .replace( /%role_entrepreneur%/g,   ( isEntrepreneur )  ? bidx.i18n.i( 'entrepreneur' )    : '' )
                    .replace( /%role_investor%/g,       ( isInvestor  )      ? bidx.i18n.i( 'investor' )   : '' )
                    .replace( /%role_mentor%/g,         ( isMentor )        ? bidx.i18n.i( 'mentor' )   : '' )
                    .replace( /%gender%/g,              personalDetails.gender   ? gender    : emptyValPersonal )
                    .replace( /%dateOfBirth%/g,         personalDetails.dateOfBirth   ? bidx.utils.parseISODateTime( personalDetails.dateOfBirth, 'date' )    : emptyValPersonal )
                    .replace( /%highestEducation%/g,    personalDetails.highestEducation   ? highestEducation    : emptyValPersonal )
                    .replace( /%language%/g,            allLanguages )
                    .replace( /%motherLanguage%/g,      montherLanguage )
                    .replace( /%city%/g,                ( cityTown ) ? cityTown : emptyValPersonal )
                    .replace( /%country%/g,             ( country )  ? country : emptyValPersonal )

                    .replace( /%emailAddress%/g,        personalDetails.emailAddress   ? personalDetails.emailAddress  : emptyValPersonal )
                    .replace( /%mobile%/g,              (!$.isEmptyObject(personalDetails.contactDetail))   ? bidx.utils.getValue( personalDetails, "contactDetail.0.mobile")    : emptyValPersonal )
                    .replace( /%landLine%/g,            (!$.isEmptyObject(personalDetails.contactDetail))   ? bidx.utils.getValue( personalDetails, "contactDetail.0.landLine")     : emptyValPersonal )
                    .replace( /%facebook%/g,            personalDetails.facebook   ? personalDetails.facebook    : emptyValPersonal )
                    .replace( /%twitter%/g,             personalDetails.twitter   ? personalDetails.twitter    : emptyValPersonal )
                    .replace (/%fa-user%/g,             'fa-user')
                    ;

                $listItemPersonal   =   $(listItemPersonal);

                if( isEntrepreneur )
                {
                    $listItemPersonal.find('.bidx-entrepreneur').show();
                }
                if( isInvestor )
                {
                    $listItemPersonal.find('.bidx-investor').show();
                }
                if( isMentor)
                {
                    $listItemPersonal.find('.bidx-mentor').show();
                }

                // Member Image
                image       = bidx.utils.getValue( personalDetails, "profilePicture" );

                if (image && image.document)
                {

                    imageWidth  = bidx.utils.getValue( image, "width" );
                    imageLeft   = bidx.utils.getValue( image, "left" );
                    imageTop    = bidx.utils.getValue( image, "top" );
                    $listItemPersonal.find( "[data-role = 'memberImage']" ).html( '<div class="img-cropper"><img src="' + image.document + '" style="width:'+ imageWidth +'px; left:-'+ imageLeft +'px; top:-'+ imageTop +'px;" alt="" /></div>' );

                }

                $listItem = $listItemPersonal;

                break;

                case 'Entrepreneur':

                    var bidxEntrepreneurProfile     =   bidx.utils.getValue(item, 'bidxEntrepreneurProfile')
                    ,   entrpreneurFocusIndustry    =   bidx.utils.getValue( bidxEntrepreneurProfile, "focusIndustry")
                    ,   snippitEntrepreneur         =   $("#entrepreneur-listitem").html().replace(/(<!--)*(-->)*/g, "")
                    ,   snippitBp                   =   $("#entrepreneur-businessitem").html().replace(/(<!--)*(-->)*/g, "")
                    ,   entities                    =   bidx.utils.getValue( item, "entities" )
                    ,   emptyValEntrepreneur        =   "-"
                    ,   listItemEntrepreneur
                    ,   listItemBp
                    ,   listAllBp                   =   ''
                    ,   $listItemBp
                    ,   $listItemEntrepreneur
                    ,   i18nItem
                    ,   externalVideoPitch
                    ,   $el
                    ,   $listAllBp                  = $('<div>')
                    ,   showBpTitle                 = false
                    ;

                    summary                         =   bidx.utils.getValue(bidxEntrepreneurProfile, 'summary');

                    if(entrpreneurFocusIndustry)
                    {
                        bidx.data.getItem(entrpreneurFocusIndustry, 'industry', function(err, focusIndustry)
                                                                                {
                                                                                   industry =  focusIndustry;
                                                                                });

                    }

                    listItemEntrepreneur = snippitEntrepreneur
                                    .replace( /%summary%/g,                     summary   ? summary     : emptyValEntrepreneur )
                                    .replace( /%interestedIn%/g,                industry  ? industry    : emptyValEntrepreneur )
                    ;

                    $listItemEntrepreneur = $(listItemEntrepreneur);

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
                                listItemBp = snippitBp
                                    .replace( /%accordion-id%/g,            bidxMeta.bidxEntityId   ? bidxMeta.bidxEntityId     : emptyValEntrepreneur )
                                    .replace( /%entityId%/g,                bidxMeta.bidxEntityId   ? bidxMeta.bidxEntityId     : emptyValEntrepreneur )
                                    .replace( /%name%/g,                    i18nItem.name   ? i18nItem.name     : emptyValEntrepreneur )
                                    .replace( /%industry%/g,                i18nItem.industry    ? i18nItem.industry      : emptyValEntrepreneur )
                                    .replace( /%countryOperation%/g,        i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyValEntrepreneur )
                                    .replace( /%financingNeeded%/g,         i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyValEntrepreneur )
                                    .replace( /%yearSalesStarted%/g,        i18nItem.yearSalesStarted    ? i18nItem.yearSalesStarted      : emptyValEntrepreneur )
                                    .replace( /%stageBusiness%/g,           i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyValEntrepreneur )
                                    .replace( /%bidxLastUpdateDateTime%/g,  bidxMeta.bidxLastUpdateDateTime  ? bidx.utils.parseTimestampToDateStr(bidxMeta.bidxLastUpdateDateTime) : emptyValEntrepreneur )
                                    .replace( /%slogan%/g,                  i18nItem.slogan   ? i18nItem.slogan     : emptyValEntrepreneur )
                                    .replace( /%summary%/g,                 i18nItem.summary   ? i18nItem.summary     : emptyValEntrepreneur )
                                    .replace( /%reasonForSubmission%/g,     i18nItem.reasonForSubmission    ? i18nItem.reasonForSubmission      : emptyValEntrepreneur )
                                    .replace( /%envImpact%/g,               i18nItem.envImpact   ? i18nItem.envImpact     : emptyValEntrepreneur )
                                    .replace( /%consumerType%/g,            i18nItem.consumerType   ? i18nItem.consumerType     : emptyValEntrepreneur )
                                    .replace( /%investmentType%/g,          i18nItem.investmentType   ? i18nItem.investmentType     : emptyValEntrepreneur )
                                    .replace( /%summaryFinancingNeeded%/g,  i18nItem.summaryFinancingNeeded   ? i18nItem.summaryFinancingNeeded     : emptyValEntrepreneur )
                                    ;

                                $listItemBp = $(listItemBp);

                                externalVideoPitch = bidx.utils.getValue( item, "externalVideoPitch");

                                if ( externalVideoPitch )
                                {
                                    $el         = $listItemBp.find("[data-role='businessImage']");
                                    _addVideoThumb( externalVideoPitch, $el );
                                }

                                $listAllBp.append( $listItemBp );

                                showBpTitle = true;
                            }

                        });

                        //Show Bp title if it exists through flag
                        if( showBpTitle )
                        {
                            $listItemEntrepreneur.find('.bpTitle').show( );
                        }

                        $listItemEntrepreneur.find ( '.entrepreneur-businessitem' ).replaceWith( $listAllBp );

                    }
                    bidx.utils.log('listItemEntrepreneur', $listItemEntrepreneur);

                    $listItem = $listItemEntrepreneur;

                    break;

                case 'Investor':

                    var i18nInvestor
                    ,   emptyValInvestor    =   ''
                    ,   snippitInvestor     =   $("#investor-listitem").html().replace(/(<!--)*(-->)*/g, "")
                    ,   bidxInvestorProfile =   bidx.utils.getValue(item, 'bidxInvestorProfile')
                    ,   summaryInvestor     =   bidx.utils.getValue(bidxInvestorProfile, 'summary')
                    ,   investorType        =   bidx.utils.getValue( bidxInvestorProfile, "investorType")
                    ,   dataArr             =   {
                                                    'focusIndustry':'industry'   ,
                                                    'focusSocialImpact': 'socialImpact',
                                                    'focusEnvImpact': 'envImpact',
                                                    'focusLanguage':'language'    ,
                                                    'focusCountry':'country',
                                                    'focusConsumerType':'consumerType',
                                                    'focusStageBusiness':'stageBusiness',
                                                    'focusGender':'gender' ,
                                                    'investmentType':'investmentType'
                                              }
                    ;

                    bidx.data.getStaticDataVal(
                     {
                         dataArr    : dataArr
                       , item       : bidxInvestorProfile
                       , callback   : function (label) {
                                         i18nInvestor = label;
                                      }
                     });

                    if( investorType)
                    {
                        investorType    =   bidx.i18n.i( investorType ) ;
                    }

                     //search for placeholders in snippit
                     listItem = snippitInvestor
                         .replace( /%summary%/g,                summary   ? summary     : emptyValInvestor )
                         .replace( /%investorType%/g,           investorType   ? investorType     : emptyValInvestor )
                         .replace( /%focusIndustry%/g,          i18nInvestor.focusIndustry   ? i18nInvestor.focusIndustry     : emptyValInvestor )
                         .replace( /%focusSocialImpact%/g,      i18nInvestor.focusSocialImpact   ? i18nInvestor.focusSocialImpact     : emptyValInvestor )
                         .replace( /%focusEnvImpact%/g,         i18nInvestor.focusEnvImpact    ? i18nInvestor.focusEnvImpact      : emptyValInvestor )
                         .replace( /%focusLanguage%/g,          i18nInvestor.focusLanguage  ? i18nInvestor.focusLanguage    : emptyValInvestor )
                         .replace( /%focusCountry%/g,           i18nInvestor.focusCountry   ? i18nInvestor.focusCountry     : emptyValInvestor )
                         .replace( /%focusConsumerType%/g,      i18nInvestor.focusConsumerType    ? i18nInvestor.focusConsumerType      : emptyValInvestor )
                         .replace( /%focusStageBusiness%/g,     i18nInvestor.focusStageBusiness  ? i18nInvestor.focusStageBusiness    : emptyValInvestor )
                         .replace( /%focusGender%/g,            i18nInvestor.focusGender    ? i18nInvestor.focusGender      : emptyValInvestor )
                         .replace( /%investmentType%/g,         i18nInvestor.investmentType  ? i18nInvestor.investmentType    : emptyValInvestor )
                         .replace( /%totalInvestment%/g,        i18nInvestor.totalInvestment   ? i18nInvestor.totalInvestment     : emptyValInvestor )
                         .replace( /%minInvestment%/g,          i18nInvestor.minInvestment    ? i18nInvestor.minInvestment      : emptyValInvestor )
                         .replace( /%maxInvestment%/g,          i18nInvestor.maxInvestment  ? i18nInvestor.maxInvestment    : emptyValInvestor )
                         .replace( /%totalInvestment%/g,        i18nInvestor.totalInvestment   ? i18nInvestor.totalInvestment     : emptyValInvestor )
                         .replace( /%additionalPreferences%/g,  i18nInvestor.additionalPreferences    ? i18nInvestor.additionalPreferences      : emptyValInvestor )
                         .replace( /%maxInvestment%/g,          i18nInvestor.maxInvestment  ? i18nInvestor.maxInvestment    : emptyValInvestor )
                      ;

                    $listItem = $(listItem);

                    break;

                    case 'Mentor':

                    var listItemMentor
                    ,   i18nMentor
                    ,   emptyValMentor      =   ''
                    ,   snippitMentor       =   $("#mentor-listitem").html().replace(/(<!--)*(-->)*/g, "")
                    ,   bidxMentorProfile   =   bidx.utils.getValue(item, 'bidxMentorProfile')
                    ,   institutionName     =   bidx.utils.getValue( bidxMentorProfile, "institutionName")
                    ,   institutionWebsite  =   bidx.utils.getValue( bidxMentorProfile, "institutionWebsite")
                    ,   summaryMentor       =   bidx.utils.getValue( bidxMentorProfile, 'summary')
                    ,   addPreferences      =   bidx.utils.getValue( bidxMentorProfile, "focusPreferences.0")
                    ,   dataArrMentor       =   {
                                                    'focusIndustry':'industry'   ,
                                                    'focusSocialImpact': 'socialImpact',
                                                    'focusEnvImpact': 'envImpact',
                                                    'focusLanguage':'language'    ,
                                                    'focusCountry':'country',
                                                    'focusConsumerType':'consumerType',
                                                    'focusStageBusiness':'stageBusiness',
                                                    'focusGender':'gender' ,
                                                    'focusExpertise':'mentorExpertise'
                                              }
                    ;
                    bidx.utils.log('addPreferences', addPreferences);
                    bidx.data.getStaticDataVal(
                     {
                         dataArr    : dataArrMentor
                       , item       : bidxMentorProfile
                       , callback   : function (label) {
                                         i18nMentor = label;
                                      }
                     });

                     //search for placeholders in snippit
                     listItemMentor = snippitMentor
                         .replace( /%summary%/g,                summaryMentor   ? summaryMentor     : emptyValMentor )
                         .replace( /%institutionName%/g,        bidxMentorProfile.institutionName   ? bidxMentorProfile.institutionName     : emptyValMentor )
                         .replace( /%institutionWebsite%/g,     bidxMentorProfile.institutionWebsite   ? bidxMentorProfile.institutionWebsite     : emptyValMentor )
                         .replace( /%focusGender%/g,            i18nMentor.focusGender    ? i18nMentor.focusGender      : emptyValMentor )
                         .replace( /%focusStageBusiness%/g,     i18nMentor.focusStageBusiness  ? i18nMentor.focusStageBusiness    : emptyValMentor )
                         .replace( /%focusLanguage%/g,          i18nMentor.focusLanguage  ? i18nMentor.focusLanguage    : emptyValMentor )
                         .replace( /%focusSocialImpact%/g,      i18nMentor.focusSocialImpact   ? i18nMentor.focusSocialImpact     : emptyValMentor )
                         .replace( /%focusEnvImpact%/g,         i18nMentor.focusEnvImpact    ? i18nMentor.focusEnvImpact      : emptyValMentor )
                         .replace( /%focusCountry%/g,           i18nMentor.focusCountry   ? i18nMentor.focusCountry     : emptyValMentor )
                         .replace( /%focusIndustry%/g,          i18nMentor.focusIndustry    ? i18nMentor.focusIndustry      : emptyValMentor )
                         .replace( /%focusExpertise%/g,         i18nMentor.focusExpertise    ? i18nMentor.focusExpertise      : emptyValMentor )
                         .replace( /%additionalPreferences%/g,  (addPreferences)     ? addPreferences      : emptyValMentor )
                    ;


                    $listItem = $(listItemMentor);

                    break;
            }

            return $listItem;
    }

    function _renderTableRow( label, value)
    {
            var tdHtml = ''
            ;
            if( value && value !== 'undefined')
            {
                tdHtml  =

                    '<td>' + bidx.i18n.i( label, appName ) + '</td>'+
                    '<td>' + value + '</td>'
                ;
            }

            return tdHtml;
    }

    function _buildUserListingSearchCriteria ( data, criteria )
    {
            var search
            ,   entityType      =   bidx.utils.getValue(criteria, 'entityType')
            ,   filters         =   bidx.utils.getValue(criteria, 'filters')
            ,   genericFilters  =   bidx.utils.getValue(criteria, 'genericFilters')
            ,   maxResult       =   bidx.utils.getValue(criteria, 'maxResult')
            ,   facetsVisible   =   bidx.utils.getValue(criteria, 'facetsVisible')
            ,   filterEntity    =   $('.entity_type').val()
            ,   sort            =   bidx.utils.getValue(criteria, 'sort')
            ,   order           =   data.order
            ,   orderIndex
            ,   sortArr         =   []
            .   filterArr       =   []
            ,   offset          =   bidx.utils.getValue(criteria, 'offset')
            ,   criteriaQ       =   bidx.utils.getValue(data.search, 'value') //1. Setting Q Search Regex
            ,   q               =   (criteriaQ) ? criteriaQ : '*'
            ;

            if( order )
            {
                $.each( order , function ( orderKey, orderValue)
                {
                    orderIndex  =  orderValue.column - 1;
                    sortArr.push({
                                    "field" : tableHeader[ orderIndex ].data
                                ,   "order" : orderValue.dir
                                });
                });
            }

            if( filterEntity )
            {
                genericFilters  =   {"role" : filterEntity};
            }

            /*sort            :   [
                                                            {
                                                                "field": "created"
                                                            ,   "order": "asc"
                                                            }
                                                        ]*/

            search =    {
                        criteria    :   {
                                            "searchTerm"    :   "basic:" + q
                                        ,   "facetsVisible" :   facetsVisible
                                        ,   "offset"        :   data.start
                                        ,   "maxResult"     :   data.length
                                        ,   "entityType"    :   ["bdxMember"]
                                        ,   "scope"         :   "LOCAL"
                                        //,   "filters"       :   (filters)           ? filters       : []
                                        ,   "sort"          :   (sortArr.length)    ? sortArr        : []
                                        ,   "genericFilters":   (genericFilters)    ? genericFilters : {}
                                        }
                        };

            return search;
    }

    function _addMemberDataToTable( options )
    {
            var item            =   options.item
            ,   row             =   options.row
            ,   dateTime        =   bidx.utils.getValue(item, 'bidxMemberProfile.bidxMeta.bidxCreationDateTime')
            ,   roles           =   item.bidxMemberProfile.roles.split(",")
            ,   roleNames
            ,   formatRole
            ,   bidxXmlLabel
            ,   result          =   []
            ,   colDataArr      =   []
            ,   cellValue
            ,   spanLabel
            ;



            //Calculate Roles make entrepeneur to bidxEntrepreneurProfile to lookinto xml file and return propler value
            roleNames = _.map(roles, function(roleName)
                        {
                            formatRole      =   roleName.substring(0,1).toUpperCase() + roleName.substring(1);
                            bidxXmlLabel    =   roleName;
                            spanLabel       = "<span class='label bidx-label bidx-" + roleName + "'>" +  bidx.i18n.i( bidxXmlLabel, appName )  + "</span>";
                            return spanLabel;
                        });

            result  =   {
                            firstName   :   "<a target='_blank' href='/member/" + item.member.bidxMeta.bidxMemberId    +   "'>" + item.bidxMemberProfile.personalDetails.firstName +"</a>"
                        ,   lastName    :   "<a target='_blank' href='/member/" + item.member.bidxMeta.bidxMemberId    +   "'>" + item.bidxMemberProfile.personalDetails.lastName +"</a>"
                        ,   roles       :   roleNames.join( ' ')
                        ,   created     :   bidx.utils.parseTimestampToDateTime(dateTime.toString(), "date")
                        };

            $.each( tableHeader , function ( indexLabel, objLabel)
            {
                cellValue  =  result [ objLabel.data ];
                indexLabel ++;

                $('td:eq(' + indexLabel +')', row).html( cellValue );
            });

            return result;
    }

    function showMemberProfile( options )
    {
        var bidxMeta
        ;

        bidx.api.call(
            "member.fetch"
        ,   {
                id:          options.ownerId
            ,   requesteeId: options.ownerId
            ,   groupDomain: bidx.common.groupDomain
            ,   success:        function( item )
                {
                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject(item.bidxMemberProfile) )
                    {
                        //if( item.bidxEntityType == 'bidxBusinessSummary') {
                        bidxMeta       = bidx.utils.getValue( item, "bidxMemberProfile.bidxMeta" );

                        if( bidxMeta  )
                        {
                            //  execute callback if provided
                            if (options && options.callback)
                            {
                                options.callback( item );
                            }
                        }

                    }

                }
            ,   error: function(jqXhr, textStatus)
                {
                    //  execute callback if provided
                    if (options && options.error)
                    {
                        options.error( );
                    }
                    return false;
                }
            }
        );
    }

    function _getLatestUsers ( options )
    {
        var search
        ,   $entityDiv
        ,   snippitEntity
        ,   responseLength
        ,   responseDocs
        ,   numFound
        ,   page            =   bidx.utils.getValue(options, 'page')
        ,   counter         =   1
        ,   $d              =   $.Deferred()
        ,   fromTime        =   bidx.utils.toTimeStamp('Fri, 18 Jul 2014 09:41:42')
        ,   displayStartRow =   paging.search.offset
        ,   loadStartRow    =   paging.search.offset
        ,   criteria        =   {
                                    "entityType": ["bdxMember"]
                                ,   facetOptionsEnable   :   false
                                }
        ;

        userTable   =   $userTableSelector.DataTable (
                        {
                            "processing":           true
                        ,   "serverSide":           true
                        ,   "deferRender":          false
                        ,   "bDeferRender":         false
                        //, "bPaginate":            false
                        ,   "bLengthChange":        true
                       // , "bStateSave":           true
                     //   , "stripeClasses":        [ 'strip1', 'strip2', 'strip3' ]
                        ,   "pageLength":           CONSTANTS.SEARCH_LIMIT
                        ,   "pagingType":           "full_numbers"
                        //, "iDeferLoading":        20
                        ,   "dom":                  'l<"toolbar">frtip'
                        ,   "order":                [[4, 'desc']] // Default Sorting
                        ,   "columnDefs":           [
                                                        { "targets": 1, "orderable": false }
                                                    ,   { "targets": 2, "orderable": false }
                                                    ,   { "targets": 3, "orderable": false }
                                                    ] // Disable sorting
                        ,   "columns":              $.merge ( [
                                                    {
                                                        "class":          'details-control',
                                                        "orderable":      false,
                                                        "data":           null,
                                                        "defaultContent": ''
                                                    }], tableHeader)
                        ,   "fnPreDrawCallback" :   function(oSettings)
                                                    {
                                                        //To enable next/last button its needed
                                                        //why start,end is not done here because it depends on the click and those value we get in fnInfoCallback not here!!
                                                        oSettings._iRecordsTotal    =   totalRow;
                                                        oSettings._iRecordsDisplay  =   totalRow;

                                                    }
                        /*, "language":             {
                                                        "infoFiltered": " - filtering from _MAX_ records"
                                                        ,   "infoEmpty":    "No entries to show"
                                                        ,   "info":         "Showing page _PAGE_ of _PAGES_"
                                                        ,   "paginate":     {
                                                                                "first"     :   "First"
                                                                            ,   "last"      :   "Last"
                                                                            ,   "previous"  :   "Previous"
                                                                            ,   "next"      :   "Next"
                                                                            }
                                                    }*/
                        /*, "fnDrawCallback":       function(oSettings)
                                                    {
                                                        bidx.utils.log('oSettings',oSettings);
                                                        oSettings._iRecordsTotal = 100;

                                                        return oSettings;
                                                    }*/
                        ,   "fnInfoCallback":       function( oSettings, iStart, iEnd, iMax, iTotal, sPre )
                                                    {
                                                        var jsonStart       =   iStart
                                                        ,   jsonEnd         =   iStart + oSettings._iDisplayLength - 1
                                                        ,   bottomMsg
                                                        ,   snippitBottom   =   bidx.i18n.i('paginationSnippit', appName)
                                                        ;

                                                        if( jsonEnd > totalRow)
                                                        {
                                                            jsonEnd = totalRow;
                                                        }

                                                        oSettings._iDisplayStart    =   jsonStart - 1;
                                                        //oSettings._iDisplayLength   =   CONSTANTS.SEARCH_LIMIT;
                                                        bottomMsg = snippitBottom
                                                                    .replace( /%from%/g,    iStart )
                                                                    .replace( /%to%/g,      jsonEnd )
                                                                    .replace( /%total%/g,   totalRow )
                                                                    ;

                                                        return bottomMsg;
                                                    }
                        ,   "createdRow":           function( row, data, dataIndex )
                                                    {
                                                        var ownerId             =   $( row ).data( 'ownerId' )
                                                        ,   existedItemMember   =   $.inArray( listMember, ownerId); // Check if it was already fetched then render it directly

                                                        if( existedItemMember != -1)
                                                        {
                                                            data.item   = existedItemMember; // itemmember-->row Data to get values when click on + through td.details-control

                                                            data.result =   _addMemberDataToTable(
                                                                                                    {
                                                                                                        item:   existedItemMember
                                                                                                    ,   row:    row
                                                                                                    });
                                                        }
                                                        else
                                                        {
                                                            showMemberProfile(
                                                            {
                                                                ownerId     :   ownerId
                                                            ,   callback    :   function ( itemMember )
                                                                                {
                                                                                    data.item  = itemMember; // itemmember-->row Data to get values when click on + through td.details-control

                                                                                    if( itemMember )
                                                                                    {

                                                                                        listMember[ ownerId ] = itemMember;
                                                                                    }

                                                                                    data.result =   _addMemberDataToTable(
                                                                                                    {
                                                                                                        item:   itemMember
                                                                                                    ,   row:    row
                                                                                                    });
                                                                                }

                                                            ,   error       :   function (  )
                                                                                {
                                                                                    $( row ).addClass('error');
                                                                                    $('td:eq(1)', row).removeClass().html( 'Error loading the data' );

                                                                                }
                                                            } );
                                                        }
                                                    }
                        ,   "ajax":
                            {
                                 "url":             bidx.api.getUrl("/api/v1/nnsearch",false,bidx.common.groupDomain)
                            ,    "type":            "POST"
                            ,    "contentType":     "application/json; charset=utf-8"
                            ,    "dataType":        "json"

                            ,    "data":            function ( data )
                                                    {

                                                        bidx.utils.log('data-for-server',data);

                                                        search      = _buildUserListingSearchCriteria( data, criteria );

                                                        data        =  { };

                                                        $.each( search.criteria , function ( criteriaKey, criteriaVal)
                                                        {
                                                            data[criteriaKey] = criteriaVal;
                                                        });

                                                        return JSON.stringify( data );
                                                    }

                            ,    "dataSrc":         function ( json )
                                                    {
                                                        bidx.utils.log('data-response',json);
                                                        var result      = { }
                                                        ,   resultArr   = []
                                                        ,   ownerId
                                                        ,   defaultValue
                                                        ,   docs        = json.data
                                                        ;
                                                        if( docs.total > 0 )
                                                        {
                                                            $.each( docs.found , function ( docsKey, docsValue)
                                                            {
                                                                ownerId     =   docsValue.properties.userId;
                                                                //resultArr.push( [json.data.docs[i].ownerId,  json.data.docs[i].modified,  json.data.docs[i].entityType ] );

                                                                //resultArr.push(['Loading']);
                                                                result  =   {
                                                                                "DT_RowData"    :   { 'ownerId' :  ownerId } // It wont be visible in HTML but its set
                                                                            ,   "DT_RowClass"   :   'row_' + ownerId
                                                                            };

                                                                $.each( tableHeader , function ( indexLabel, objLabel)
                                                                {
                                                                    defaultValue    =   '';

                                                                    if(objLabel.data === 'firstName')
                                                                    {
                                                                        defaultValue = 'Loading';
                                                                    }

                                                                    result[ objLabel.data ] = defaultValue;
                                                                });

                                                                resultArr.push( result );
                                                            });
                                                        }

                                                        totalRow = json.data.numFound;

                                                        return resultArr;
                                                    }
                            }
                        });

        /********** Filter Handling *************/
        $entityDiv      =   $element.find( "#entity-listitem" );
        snippitEntity   =   $entityDiv.html().replace(/(<!--)*(-->)*/g, "");
        $element.find("div.toolbar").html(snippitEntity);
        $element.find('.entity_type').on('click', function( e )
        {
            e.preventDefault();
            userTable.draw();
        } );

        $userTableSelector.find('tbody').on('click', 'td.details-control', function ( )
        {
            var personalInfo    = ''
            ,   entrepeneurInfo = ''
            ,   mentorInfo      = ''
            ,   investorInfo
            ,   allInfo
            ,   isMember
            ,   isEntrepreneur
            ,   isInvestor
            ,   isMentor
            ,   tr                  =   $(this).closest('tr')
            ,   row                 =   userTable.row( tr )
            ,   data                =   row.data()
            ,   item                =   data.item
            ,   $allInfo            =   $('<div>')
            ;

            if ( row.child.isShown() )
            {
                // This row is already open - close it
                row.child.hide();

                tr.removeClass('shown');
            }
            else
            {
                // Open this row
                isMember            =   bidx.utils.getValue( item, "bidxMemberProfile" );
                isEntrepreneur      =   bidx.utils.getValue( item, "bidxEntrepreneurProfile" );
                isInvestor          =   bidx.utils.getValue( item, "bidxInvestorProfile" );
                isMentor            =   bidx.utils.getValue( item, "bidxMentorProfile" );

                if ( isMember )
                {
                    personalInfo    =    _addDetailedInfo('Personal', data );
                }

                if ( isEntrepreneur )
                {
                   entrepeneurInfo  =  _addDetailedInfo('Entrepreneur', data );
                }

                if( isMentor )
                {
                    mentorInfo      =   _addDetailedInfo('Mentor', data );
                }

                if( isInvestor )
                {
                    investorInfo    =   _addDetailedInfo('Investor', data );
                }

                $allInfo.append (   personalInfo
                                ,   entrepeneurInfo
                                ,   mentorInfo
                                ,   investorInfo
                                );

                row.child(  $allInfo ).show();

                tr.addClass('shown');
            }
        } );

        $d.resolve();

        return $d.promise();
    }


    function _createRegionsMap( response, type )
    {
        // Create the data table.
        var label
        ,   chart
        ,   options
        ,   facets          =   []
        ,   listItem        =   []
        ,   facetList       =   {}
        ,   data
        ,   countryLabel    =   bidx.i18n.i('facet_country',appName)
        ,   growthLabel     =   bidx.i18n.i('chart_growth', appName)
        ,   countryNameLabel =  bidx.i18n.i('name', appName)
        ,   labelName
        ;

        if ( response.facets && response.facets.length )
        {
            facets      =   response.facets;
            facetList   =   _.findWhere( facets, { field :   type });

            listItem.push( [countryLabel, countryNameLabel, growthLabel ] );

            $.each( facetList.values, function( idx, item )
            {
                labelName   =   bidx.data.i( item.option, "country" );
                label       =   item.option;

                listItem.push( [ label, labelName, item.count] );

            } );

            data = google.visualization.arrayToDataTable( listItem );
        }


        // Set chart option

        options     =   {
                            title   :               bidx.i18n.i('regionTitle', appName)
                        };
                        //,   sizeAxis:             { minValue: 0, maxValue: 100 }
                        //,   magnifyingGlass:        {enable: true, zoomFactor: 5.0}
                        //,   displayMode:          'markers'
                        //,   colorAxis:            {colors: ['#e7711c', '#4374e0']} // orange to blue
                        //,   colorAxis:              {colors: ['#00853f', '#000000', '#e31b23']}
                        //,   colorAxis:              {minValue: 0,  colors: ['#FF0000', '#00FF00']}
                        //,   backgroundColor:        '#FFFFF'
                        //,   datalessRegionColor:    '#ecf1ee'


        chart = new google.visualization.GeoChart(document.getElementById('country_geo_chart'));

        chart.draw(data, options);
    }

    function _createRolesChart( response, type )
    {
        // Create the data table.
        var label
        ,   labelNoCount
        ,   memberProfileCount  =   0
        ,   roleProfilecount    =   0
        ,   noRoleProfileCount
        ,   facets              =   []
        ,   listItem            =   []
        ,   facetList           =   {}
        ,   data                =   new google.visualization.DataTable()
        ,   userRoles           =   [ 'entrepreneur', 'mentor', 'investor', 'member']
        ;

        data.addColumn('string', 'Roles');
        data.addColumn('number', 'Users');

        if ( response.facets && response.facets.length )
        {
            facets      =   response.facets;
            facetList   =   _.findWhere( facets, { field :   type });

            $.each( facetList.values, function( idx, item )
            {
                if( $.inArray( item.option, userRoles ) !== -1 )
                {
                    if ( item.option === 'member' )
                    {
                        memberProfileCount = item.count;
                    }
                    else
                    {
                        label   =   bidx.i18n.i( item.option, appName );

                        listItem.push( [ label, item.count] );

                        roleProfilecount = roleProfilecount + item.count;
                    }
                }
            } );

            /* No Profile Count */
            labelNoCount        =   bidx.i18n.i( 'memberOnlyLbl', appName );
            noRoleProfileCount  =   memberProfileCount - roleProfilecount;
            if( noRoleProfileCount > 0)
            {
                listItem.push( [ labelNoCount, noRoleProfileCount] );
            }

            data.addRows( listItem );

            _showView("approx", true );
        }

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('role_pie_chart'));

        chart.draw(data, PIECHARTOPTIONS);
    }

    function _getSearchTotals( options )
    {
        var criteria    =   {
                                "searchTerm": "basic:*",
                                "entityType": ["bdxmember"],
                                "scope": "LOCAL"
                            };

        bidx.api.call(
            "search.found"
        ,   {
                    groupDomain:        bidx.common.groupDomain
                ,   data:               criteria
                ,   success: function( response )
                    {
                        bidx.utils.log("[searchList] retrieved results ", response );

                        // Set a callback to run when the Google Visualization API is loaded.
                        _createRolesChart( response, "role" );

                        _createRegionsMap( response, "country" );

                        if (options && options.callback)
                        {
                            options.callback(  );
                        }

                    }
                    ,
                    error: function( jqXhr, textStatus )
                    {

                        var response = $.parseJSON( jqXhr.responseText)
                        ,   responseText = response && response.text ? response.text : "Status code " + jqXhr.status
                        ;

                        // 400 errors are Client errors
                        //
                        if ( jqXhr.status >= 400 && jqXhr.status < 500)
                        {
                            bidx.utils.error( "Client  error occured", response );
                            if (options && options.error)
                            {
                                options.error( responseText );
                            }
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            if (options && options.error)
                            {
                                options.error( responseText );
                            }
                        }

                    }
            }
        );

        return ;
    }

    function _createUsersLineChart( params )
    {
        var data
        ,   chart
        ,   newUser
        ,   login
        ,   dateSplit
        ,   formattedDate
        ,   $container      =   document.getElementById('user_line_chart')
        ,   graphData       =   []
        ,   eventRegister   =   bidx.utils.getValue(params.responseRegister,   'events')
        ,   eventLogin      =   bidx.utils.getValue(params.responseLogin,      'events')
        ,   keysRegister    =   _.keys( eventRegister ) // Keys of registrations ex 2014-02-02
        ,   keysLogin       =   _.keys( eventLogin )     // Keys of Login ex 2014-02-02
        ,   alldateKeys     =   _.union( keysRegister, keysLogin).reverse() // Common keys for iteration
        ,   options         =   {
                                    title: 'Weekly logins'
                                }
        ;

        if ( alldateKeys.length )
        {
            /* Old Registration + Logins
            graphData.push( ['Day', 'New Users', 'Logins'] );*/
            graphData.push( ['Day', 'Logins'] );

            $.each( alldateKeys, function( idx, date )
            {
                // newUser    =   ($.isEmptyObject(eventRegister[date])) ? eventRegister[date] : 0;
                // login      =   ($.isEmptyObject(eventLogin[date])) ? eventLogin[date] : 0;

                 newUser        =   bidx.utils.getValue(eventRegister, date);
                 login          =   bidx.utils.getValue(eventLogin, date);
                 login          =   ( login ) ? login : 0;
                 newUser        =   ( newUser ) ? newUser : 0;
                 dateSplit      = date.split("-");
                 formattedDate  = dateSplit.reverse().join('-');

                 /* Old Registration + Logins
                 graphData.push( [formattedDate, newUser, login] );*/
                 graphData.push( [formattedDate, login] );
            } );

            data = google.visualization.arrayToDataTable(graphData);

            chart = new google.visualization.LineChart($container);

            chart.draw(data, options);
        }
        else
        {
           $container.innerHTML =  bidx.i18n.i('noData', appName);
        }
    }

    function _createBpBarChart( response, type )
    {
        var data
        ,   chart
        ,   $container  =   document.getElementById('bp_bar_chart')
        ,   eventData   =   response.events
        ,   graphData   =   []
        ,   options     =   {
                                title: 'Weekly performance'
                            ,   vAxis: {title: 'Day',  titleTextStyle: {color: 'red'}}
                            ,   width: 600
                            ,   height: 400
                            }
        ;

        graphData.push( ['Day', 'New Business Summaries'] );

        if(!$.isEmptyObject(eventData) )
        {

            $.each( eventData, function( date, count )
            {
                graphData.push( [date, count] );
            });

            data    = google.visualization.arrayToDataTable(graphData);

            chart   = new google.visualization.BarChart($container);

            chart.draw(data, options);
        }
        else
        {
           $container.innerHTML = bidx.i18n.i('noData', appName);
        }
    }

    function _getStatistics ( options )
    {
        var extraUrlParameters  =
        [
            {
                label: "eventName"
            ,   value: options.eventName
            }
        ,   {
                label: "days"
            ,   value: options.days
                //value: "type:bidxMemberProfile+AND+groupIds:" + '2' + searchName
            }
        ]
        ;

        bidx.api.call(
            "statistics.fetch"
        ,   {
                    groupDomain:            bidx.common.groupDomain
                ,   extraUrlParameters:     extraUrlParameters
                ,   success: function( response )
                    {
                        bidx.utils.log("[statistics] retrieved results ", response );

                        if (options && options.callback)
                        {
                            options.callback( response );
                        }

                    }
                    ,
                    error: function( jqXhr, textStatus )
                    {

                        var response = $.parseJSON( jqXhr.responseText)
                        ,   responseText = response && response.text ? response.text : "Status code " + jqXhr.status
                        ;

                        // 400 errors are Client errors
                        //
                        if ( jqXhr.status >= 400 && jqXhr.status < 500)
                        {
                            bidx.utils.error( "Client  error occured", response );
                            if (options && options.error)
                            {
                                options.error( responseText );
                            }
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            if (options && options.error)
                            {
                                options.error( responseText );
                            }
                        }
                    }
            }
        );

        return ;
    }

    function _getData ()
    {
        // 1. Load Country Geo Chart & Load User Role Pie Chart
        _showView("loadcountrygeochart", true );

        _showView("loaduserrolepiechart", true );

        _getSearchTotals(
        {
            callback :  function( )
                        {
                            _hideView("loadcountrygeochart");
                            _hideView("loaduserrolepiechart");
                        }
        ,   error   :   function ( responseText )
                        {
                            _hideView("loadcountrygeochart");
                            _hideView("loaduserrolepiechart");
                            _showError( 'geoChartError', "Something went wrong while retrieving the search data: " + responseText );
                            _showError( 'pieChartError', "Something went wrong while retrieving the search data: " + responseText );
                        }
        });


        // 2. Load Latest uers  in Table
        _showView("loadusertablechart", true );

        _getLatestUsers( )
        .done( function( )
        {
            _hideView("loadusertablechart");
        })
        .fail( function ( responseText )
        {
            _hideView("loadusertablechart");
            _showError( 'userTableError', responseText );
        });

        // 3. Load Business Summary Chart
        _showView("loadbpbarchart", true );
        _getStatistics(
        {
            eventName   :   'businessSummaryCreate'
        ,   days        :   7
        ,   callback    :   function( response )
                            {
                                // Set a callback to run when the Google Visualization API is loaded.
                                _createBpBarChart( response );
                                _hideView("loadbpbarchart");
                            }
        ,   error   :   function ( responseText )
                        {
                            _hideView("loadbpbarchart");
                            _showError( 'barChartError', "Something went wrong while retrieving the search data: " + responseText );

                        }
        });

        // 4. Load Login and Registered users Chart
        _showView("loaduserlinechart", true );
        _getStatistics(
        {
            eventName   :   'registerMember'
        ,   days        :   30
        ,   callback    :   function( responseRegister )
                            {
                                // Set a callback to run when the Google Visualization API is loaded.
                                _getStatistics(
                                {
                                    eventName   :   'loginUser'
                                ,   days        :   30
                                ,   callback    :   function( responseLogin )
                                                    {
                                                        // Set a callback to run when the Google Visualization API is loaded.
                                                        _createUsersLineChart(
                                                        {
                                                            responseRegister:   responseRegister
                                                        ,   responseLogin:      responseLogin
                                                        } );
                                                        _hideView("loaduserlinechart");
                                                    }
                                ,   error       :   function ( responseText )
                                    {
                                        _hideView("loaduserlinechart");
                                        _showError( 'lineChartError', "Something went wrong while retrieving the search data: " + responseText );

                                    }
                                });
                            }
        ,   error       :   function ( responseText )
                            {
                                _hideView("loaduserlinechart");
                                _showError( 'lineChartError', "Something went wrong while retrieving the search data: " + responseText );

                            }
        });
    }

    var _showView = function(view, showAll)
    {

        //  show title of the view if available
        if (!showAll)
        {
            $views.hide();
        }
         var $view = $views.filter(bidx.utils.getViewName(view)).show();
    }

    var _hideView = function( hideview )
    {
        $views.filter(bidx.utils.getViewName(hideview)).hide();
    }

    function _showError( view, msg )
    {
        $views.filter(bidx.utils.getViewName(view)).find( ".errorMsg" ).text( msg );
        _showView( view, true );
    }

    function _init()
    {
        google.load("visualization", "1.0", {packages:["corechart","table"]});

        google.setOnLoadCallback(_getData);
    }

    _init();


}(jQuery));
