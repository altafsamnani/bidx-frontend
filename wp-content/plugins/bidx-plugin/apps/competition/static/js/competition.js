/* global bidx */
;( function( $ )
{
    "use strict";

    var competitionVars             = window.__bidxCompetition || {}
    ,   applicationObj
    ,   $element                    = $( "#competitionSummary" )
    ,   $snippets                   = $element.find( ".snippets" )

    ,   $views                      = $element.find( ".view" )

    ,   $editControls               = $element.find( ".editControls" )

    ,   $industry                   = $element.find( "[name='competitionIndustry']" )

    ,   $regional                   = $element.find( "[name='competitionCountry']" )
    ,   $visibilityDropdown         = $element.find( "[name='visibility']" )

    ,   $gender                     = $element.find( "[name='competitionGender']" )
    ,   $envImpact                  = $element.find( "[name='competitionEnvImpact']" )
    ,   $socialImpact               = $element.find( "[name='competitionSocialImpact']" )

    ,   $btnSave
    ,   $btnCancel
    ,   $btnFullAccessRequest       = $element.find( ".bidxRequestFullAccess")
    ,   $bidxAccessRequestPending   = $element.find( ".bidxAccessRequestPending")
    ,   $btnParticipate             = $element.find( ".btn-participate")
    ,   $btnApply                   = $element.find( ".btn-apply")


    ,   $videoWrapper               = $element.find( ".video-wrapper" )

    ,   $controlsForEdit            = $editControls.find( ".viewEdit" )
    ,   $controlsForError           = $editControls.find( ".viewError" )

    ,   $ratingWrapper              = $element.find( ".rating-wrapper" )
    ,   $ratingAverage              = $ratingWrapper.find( ".rating-average" )
    ,   $ratingVote                 = $ratingWrapper.find( ".rating-vote" )
    ,   $ratingTotalVoters          = $ratingWrapper.find( ".rating-total-voters-count" )
    ,   $ratingUserLabel            = $ratingWrapper.find( ".rating-user-label" )
    ,   $ratingScore                = $ratingWrapper.find( ".rating-score" )
    ,   $ratingNoScore              = $ratingWrapper.find( ".rating-no-score" )
    ,   $raty                       = $ratingWrapper.find( ".raty" )

    ,   $fakecrop                   = $views.find( ".bidx-profilepicture img" )

    ,   loggedInMemberId            = bidx.common.getCurrentUserId()

    ,   $businessSummary            = $element.find( "[name='businessSummary']" )
    ,   listDropdownBp              = bidx.utils.getValue( bidxConfig, "session.wp.entities.bidxBusinessSummary" )

    ,   active                      = []
    ,   wait                        = []
    ,   respond                     = []
    ,   rejectByEntrepreneur        = []
    ,   rejectByMentor              = []


    ,   forms                       =
        {
            generalOverview:
            {
                $el:                    $element.find( "#frmCompetition-GeneralOverview" )
            }
        /*,   management:
            {
                $el:                    $element.find( "#frmCompetition-Management" )
            }*/
        ,   aboutParticipants:
            {
                $el:                    $element.find( "#frmCompetition-AboutParticipants" )
            }
        }


        // Cover Image
        //
    ,   $coverImage                         = $element.find( ".competitionCover" )
    ,   $coverImageBtn                      = $coverImage.find( "[href$='#coverImage']" )
    ,   $coverRemoveBtn                     = $coverImage.find( "[href$='#coverRemove']" )
    ,   $coverImageModal                    = $coverImage.find( ".coverModal" )
    ,   $coverImageContainer                = $coverImage.find( ".coverImageContainer" )

        // competitionLogo
        //
    ,   $bscompetitionLogo                             = $element.find( ".bscompetitionLogo" )
    ,   $bscompetitionLogoBtn                          = $bscompetitionLogo.find( "[href$='#addcompetitionLogo']" )
    ,   $bscompetitionLogoModal                        = $bscompetitionLogo.find( ".addcompetitionLogoImage" )
    ,   $competitionLogoContainer                      = $bscompetitionLogo.find( ".competitionLogoContainer" )



        // Mentoring Details
        //
    ,   $toggles                            = $element.find( ".toggle" ).hide()

        // Buttons under to control the add company form

        // Documents component
        //
    ,   $documents                          = $element.find( "#competitionSummaryCollapse-Documents" )
    ,   $btnAddFiles                        = $documents.find( "a[href$='addFiles']" )
    ,   $addFiles                           = $documents.find( ".addFiles" )
    ,   $attachmentContainer                = $documents.find( ".attachmentContainer" )

        // Edit document modal
        //
    ,   $editDocument                       = $element.find( ".js-edit-document" )

        // Industy Sectors
        //
    ,   $industrySectors                    = $element.find( ".industrySectors" )

    ,   visibilityArr                       = ['public','closed','invited']

    ,   currentUserBusinessSummaryList      = []
    ,   competitionSummary
    ,   competitionSummaryId

    ,   companies

    ,   state
    ,   currentView
    ,   snippets                    = {}

    ,   appName                     = "competition"


    ,   $searchPagerContainer   = $element.find( "#incomingRequests" ).find( ".pagerContainer")
    ,   $searchPager            = $searchPagerContainer.find( ".pager" )

    ,   paging                      =
        {
            search:
            {
                offset:         0
            ,   totalPages:     null
            }
        }
    ;

    if ( !$.isEmptyObject(competitionVars) )
    {
        applicationObj              = bidx.utils.getValue( competitionVars, 'applications');
    }

    // Constants
    //
    var CONSTANTS =
        {
            SEARCH_LIMIT:                       4
        ,   NUMBER_OF_PAGES_IN_PAGINATOR:       10
        ,   LOAD_COUNTER:                       0
        ,   VISIBLE_FILTER_ITEMS:               4 // 0 index (it will show +1)
        ,   ENTITY_TYPES:                       [
                                                    {
                                                        "type": "bidxMentorProfile"
                                                    }
                                                ]
        }

    ,   tempLimit = CONSTANTS.SEARCH_LIMIT

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
            ,   "description"

                // This is actually an array in the data model, but presented as a dropdown in the UI designs.
                // Conflict!
                // We need to force it to be an array when sending into the API
                // After disucssion with Jeroen created BIDX-1435 to request any non-array value to be interpreted as an array by the API,
                // but until that is available, send in reasonforSubmsision as an array
                //
            ,   "startDateTime"
            ,   "endDateTime"
            ]
        }
    /*,   "management":
        {
            "_root":
            [
                "visibility"
            ]
        }
    */
    ,   "aboutParticipants":
        {
            "_root":
            [
                "competitionIndustry"
            ,   "competitionCountry"
            ,   "competitionSocialImpact"
            ,   "competitionEnvImpact"
            ]
        }
    };

    // Setup function for doing work that should only be done once
    //
    function _oneTimeSetup()
    {
         var option
         ,   bpLength
         ,   visibilityArrItems  =   [ ]
         ;
        _competitionTimer();
        _snippets();
        _setupValidation();
        _coverImage();
        _documents();
        _loadMyApplications( ); // Load My applications now

        if( $businessSummary )
        {
            _showAllView( "participate" ); // Display participate Bar

            $businessSummary.chosen({
                                        placeholder_text_single : bidx.i18n.i( "msgWaitForSave" )
                                    ,   width                   : "100%"
                                    ,   disable_search_threshold : 10
                                    });
            bpLength    = _.size(listDropdownBp); //Have to add the condition because when user is mentor and viewing normal profile then we dont want to populate dropdown

            if( bpLength )
            {
                _getBusinessPlans( )
                .done( function( listBpItems )
                {
                    $businessSummary.append( listBpItems );
                    $businessSummary.trigger( "chosen:updated" );

                } );
            }

            $btnParticipate.click( function( e )
            {
                e.preventDefault();
                _showAllView('apply');
                _hideView( 'participate');

            });
        }

        // On any changes, how little doesn't matter, notify that we have a pending change
        // But no need to track the changes when doing a member data load
        //
        $element.bind( "change", function()
        {
            if ( currentView === "edit" )
            {
                bidx.common.addAppWithPendingChanges( appName );
            }
        } );

        $regional.bidx_chosen(
        {
            dataKey:            "country"
        });

        $envImpact.bidx_chosen(
        {
            dataKey:            "envImpact"
        });

        $socialImpact.bidx_chosen(
        {
            dataKey:            "socialImpact"
        });

        // Run the industry widget on the selector
        //
        $industrySectors.industries();
        // Collect snippets from the DOM
        // sort the array, if not empty

        $.each( visibilityArr, function( idx, listVisibility )
        {
            option = $( "<option/>",
            {
                value: listVisibility
            } );

            option.text( bidx.i18n.i(listVisibility ,appName) );

            visibilityArrItems.push( option );
        } );

        // add the options to the select
        $visibilityDropdown.append( visibilityArrItems );

        // init bidx_chosen plugin
        $visibilityDropdown.bidx_chosen();

        function _snippets()
        {
            // Grab the snippets from the DOM
            //

            snippets.$attachment            = $snippets.children( ".attachmentItem"    ).remove();

            // Did we find all of the snippets?
            // Not really app logic, but just a protection / early warning system
            //
            $.each( snippets, function( prop, $snippet )
            {
                if ( !$snippet.length )
                {
                    bidx.utils.error( "[competitionSummary] Snippet not found! ", prop );
                }
            } );
        }

        // Setup initial form validation
        //
        function _setupValidation()
        {
            // General Overview
            //
            forms.generalOverview.$el.validate(
            {
                ignore:         ""
            ,   debug:          false
            ,   rules:
                {
                    name:
                    {
                        required:               true
                    ,   maxlength:              30
                    }
                ,   summary:
                    {
                        maxlength:              900
                    }
                ,   startdate:
                    {
                        // TODO: datepicker validation
                    }
                ,   enddate:
                    {
                       // TODO: datepicker validation

                    }
                }
            ,   messages:
                {

                }
            ,   submitHandler:          function( e )
                {
                    _doSave();
                }
            } );
            /*
            forms.management.$el.validate(
            {
                debug:          false
            ,   ignore:         ""
            ,   rules:
                {
                    visibility:
                    {
                        required:      true
                    }
                }
            } ); */
            // About your business
            //
            forms.aboutParticipants.$el.validate(
            {
                debug:          false
            ,   ignore:         ""
            ,   rules:
                {
                    competitionIndustry:
                    {
                        // required:      true
                    }
                ,   regional:
                    {
                        // required:      true
                    }
                }
            ,   messages:
                {

                }
            ,   submitHandler:          function( e )
                {
                    _doSave();
                }
            } );
        }

        function _coverImage()
        {
            $coverImageContainer.cover();

            $coverImageBtn.click( function( e )
            {
                e.preventDefault();

                // Make sure the media app is within our modal container
                //
                $( "#media" ).appendTo( $coverImageModal.find( ".modal-body" ) );

                var $selectBtn = $coverImageModal.find(".btnSelectFile")
                ,   $cancelBtn = $coverImageModal.find(".btnCancelSelectFile");

                // Navigate the media app into list mode for selecting files
                //
                bidx.media.navigate(
                {
                    requestedState:         "list"
                ,   slaveApp:               true
                ,   selectFile:             true
                ,   multiSelect:            false
                ,   showEditBtn:            false
                ,   btnSelect:              $selectBtn
                ,   btnCancel:              $cancelBtn
                ,   callbacks:
                    {
                        ready:                  function( state )
                        {
                            bidx.utils.log( "[Cover Image] ready in state", state );
                        }

                    ,   cancel:                 function()
                        {
                            // Stop selecting files, back to previous stage
                            //
                            $coverImageModal.modal('hide');
                        }

                    ,   success:                function( file )
                        {
                            bidx.utils.log( "[Cover Image] uploaded", file );

                            // NOOP.. the parent app is not interested in when the file is uploaded
                            // only when it is attached / selected
                        }

                    ,   select:               function( file )
                        {
                            bidx.utils.log( "[Cover Image] selected cover", file );

                            $coverImageContainer.data( "bidxData", file );

                            $coverImageModal.modal( "hide" );

                            if ( $coverImageContainer.find( "img" ).length )
                            {
                                $coverImageContainer.cover( "updateCover", file );
                            }
                            else
                            {
                                $coverImageContainer.cover( "constructHtml", file );
                            }

                        }
                    }
                } );

                $coverImageModal.modal();
            } );

            $coverRemoveBtn.click( function( e )
            {
                e.preventDefault();

                $coverImageContainer.find( "img" ).remove();

                competitionSummary.competitionLogo = null;
            } );

        }


        // competitionLogo
        //
        $bscompetitionLogoBtn.click( function( e )
        {
            e.preventDefault();

            // Make sure the media app is within our modal container
            //
            $( "#media" ).appendTo( $bscompetitionLogoModal.find( ".modal-body" ) );

            var $selectBtn = $bscompetitionLogoModal.find( ".btnSelectFile" )
            ,   $cancelBtn = $bscompetitionLogoModal.find( ".btnCancelSelectFile" )
            ;

            // Navigate the media app into list mode for selecting files
            //
            bidx.media.navigate(
            {
                requestedState:         "list"
            ,   slaveApp:               true
            ,   selectFile:             true
            ,   multiSelect:            false
            ,   showEditBtn:            false
            ,   btnSelect:              $selectBtn
            ,   btnCancel:              $cancelBtn
            ,   callbacks:
                {
                    ready:                  function( state )
                    {
                        bidx.utils.log( "[competitionLogo] ready in state", state );
                    }

                ,   cancel:                 function()
                    {
                        // Stop selecting files, back to previous stage
                        //
                        $bscompetitionLogoModal.modal('hide');
                    }

                ,   success:                function( file )
                    {
                        bidx.utils.log( "[competitionLogo] uploaded", file );

                        // NOOP.. the parent app is not interested in when the file is uploaded
                        // only when it is attached / selected
                    }

                ,   select:               function( file )
                    {
                        bidx.utils.log( "[competitionLogo] selected profile picture", file );

                        $competitionLogoContainer.data( "bidxData", file );
                        $competitionLogoContainer.html( $( "<img />", { "src": file.document, "data-filebusinessPlanEntityId": file.fileUpload } ));

                        $bscompetitionLogoModal.modal( "hide" );
                    }
                }
            } );

            $bscompetitionLogoModal.modal();
        } );



// TEMP - REPLACE THIS WITH THE REAL DATA
//
var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substrRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        // the typeahead jQuery plugin expects suggestions to a
        // JavaScript object, refer to typeahead docs for more info
        matches.push({ value: str });
      }
    });

    cb(matches);
  };
};

var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
  'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

$('.typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 1
},
{
  name: 'states',
  displayKey: 'value',
  source: substringMatcher(states)
}).removeClass( "disabled" ).removeAttr( "disabled" );
//
// TEMP - REPLACE THIS WITH THE REAL DATA



        // Setup the Documents component
        //
        function _documents()
        {
            $( window.bidx ).bind( "updated.media", function( e, data )
            {
                var businessPlanEntityId = bidx.utils.getValue( data, "bidxMeta.bidxbusinessPlanEntityId" );

                if ( !businessPlanEntityId )
                {
                    bidx.utils.error( "No businessPlanEntityId found on updated media event!", data );
                    return;
                }

                $attachmentContainer.find( "[data-businessPlanEntityId='" + businessPlanEntityId + "']" ).each( function()
                {
                    var $attachment     = $( this )
                    ,   attachment      = $attachment.data( "bidxData" )
                    ;

                    $.each( [ "purpose", "documentType" ], function( i, prop )
                    {
                        attachment[ prop ] = data[ prop ];
                    } );

                    _updateAttachment( $attachment, attachment );
                } );
            } );

            // Clicking the add files button will load the media library
            //
            $btnAddFiles.click( function( e )
            {
                e.preventDefault();

                // Make sure the media app is within our modal
                //
                $( "#media" ).appendTo( $addFiles.find( ".modal-body" ) );

                var $selectBtn = $documents.find(".btnSelectFile");
                var $cancelBtn = $documents.find(".btnCancelSelectFile");

                // Navigate the media app into list mode for selecting files
                //
                bidx.media.reset();
                bidx.media.navigate(
                {
                    requestedState:         "list"
                ,   slaveApp:               true
                ,   selectFile:             true
                ,   multiSelect:            true
                ,   showEditBtn:            false
                ,   btnSelect:              $selectBtn
                ,   btnCancel:              $cancelBtn
                ,   callbacks:
                    {
                        ready:                  function( state )
                        {
                            bidx.utils.log( "[documents] ready in state", state );
                        }

                    ,   cancel:                 function()
                        {
                            // Stop selecting files, back to previous stage
                            //
                            $addFiles.modal('hide');
                        }

                    ,   success:                function( file )
                        {
                            bidx.utils.log( "[documents] uploaded", file );

                            // NOOP.. the parent app is not interested in when the file is uploaded
                            // only when it is attached / selected
                        }

                    ,   select:               function( files )
                        {
                            bidx.utils.log( "[documents] select", files );

                            // Attach the file to the entity
                            // By adding it to the reflowrower we can pick it up as soon
                            // as the entity is created or saved. The reflowrower keeps a list of
                            // added items
                            //

                            if ( files )
                            {
                                $.each( files, function( idx, file )
                                {
                                    _addAttachment( file );
                                } );
                            }

                            $addFiles.modal('hide');
                        }
                    }
                } );

                $addFiles.modal();
            } );

            // Setup an 'edit' button per document
            //
            $attachmentContainer.delegate( "a[href$=#editDocument]", "click", function( e )
            {
                e.preventDefault();

                var $btn        = $( this )
                ,   $item       = $btn.closest( ".attachmentItem" )
                ,   doc         = $item.data( "bidxData" )
                ;

                _editDocument( doc );
            } );

            // Initiate the reflowrower for the attachment list
            //
            $attachmentContainer.reflowrower(
            {
                itemsPerRow:        2
            ,   itemClass:          "attachmentItem"
            } );

        }

        if ( $videoWrapper )
        {
            $videoWrapper.fitVids();
        }

        if ( $fakecrop )
        {
            $fakecrop.fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
        }


        $('#table_id').DataTable(
            {
                "aoColumns": [
                    { "bSortable": false },
                    null,
                    null,
                    null,
                    null
                ],
                "bPaginate": false,
                tableTools: {
                    "sRowSelect": "multi",
                    "aButtons": [ "select_all", "select_none" ]
                }

            });
        }

/* Formatting function for row details - modify as you need */
function format ( d ) {
    // `d` is the original data object for the row
    return '<h4>Assessors Recommendations</h4>'+
    '<div>'+
        '<div class="row">'+
            '<div class="col-sm-4">'+d.assessor_1.name+'</div>'+
            '<div class="col-sm-2">Score: '+d.assessor_1.score+'</div>'+
            '<div class="col-sm-6">Recommendation: '+d.assessor_1.recommendation+'</div>'+
        '</div>'+
        '<p class="bottom-border"><i class="fa fa-pencil-square-o"></i> '+d.assessor_1.explanation+'</p>'+
    '</div>'+
    '<div>'+
        '<div class="row">'+
            '<div class="col-sm-4">'+d.assessor_2.name+'</div>'+
            '<div class="col-sm-2">Score: '+d.assessor_2.score+'</div>'+
            '<div class="col-sm-6">Recommendation: '+d.assessor_2.recommendation+'</div>'+
        '</div>'+
        '<p class="bottom-border"><i class="fa fa-pencil-square-o"></i> '+d.assessor_2.explanation+'</p>'+
    '</div>'+
    '<div>'+

        '<div class="set-actions">'+
            '<label class="inline">Mark as:</label>'+
            '<div class="radio inline-radio">'+
                '<input type="radio" value="finalist" id="radio-finalist" name="assessorRecommendation" data-toggle="radio" />'+
                '<label for="radio-finalist"><span></span>FINALIST</label>'+
            '</div>'+

            '<div class="radio inline-radio">'+
                '<input type="radio" value="notFinalist" id="radio-notFinalist" name="assessorRecommendation" data-toggle="radio" />'+
                '<label for="radio-notFinalist"><span></span>NOT FINALIST</label>'+
            '</div>'+

            '<div class="text-right">'+
                '<a href="#" class="btn btn-primary btn-md info-action">Set</a>'+
            '</div>'+
        '</div>'+

    '</div>'+
    '<hr>'+
    '<div>'+
        '<div class="hide-overflow">'+
            '<label class="inline">Qualification:</label>'+
            '<div class="radio inline-radio">'+
                '<input type="radio" value="acceptApplication" id="radio-accept" name="applicationQualification" data-toggle="radio" />'+
                '<label for="radio-finalist"><span></span>ACCEPT</label>'+
            '</div>'+

            '<div class="radio inline-radio">'+
                '<input type="radio" value="rejectApplication" id="radio-reject" name="applicationQualification" data-toggle="radio" />'+
                '<label for="radio-notFinalist"><span></span>REJECT</label>'+
            '</div>'+
        '</div>'+
        '<div class="clearboth">'+
            '<select class="selectAssessors" multiple>'+
                '<option value="">Assessor 1</option>'+
                '<option value="">Assessor 2</option>'+
                '<option value="">Assessor 3</option>'+
                '<option value="">Assessor 4</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
                '<option value="">Assessor 5</option>'+
            '</select>'+
        '</div>'+

        '<textarea type="text" class="form-control" name="rejection" placeholder="Explain your rejection"></textarea>'+

        '<div class="text-right">'+
            '<a href="#" class="btn btn-primary btn-md info-action">Set</a>'+
            '<a href="#" class="btn btn-primary btn-md info-action">Assign</a>'+
        '</div>'+

    '</div>'+
    '</div>'+

    '</div>';
}

$(document).ready(function() {
    var table = $('#example').DataTable( {
        "bPaginate": true,
        "data":     [
        {
            business: "System Architect",
            entrepreneur: "Tiger Nixon",
            score: "320",
            state: "withdrawn",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Accountant",
            entrepreneur: "Garrett Winters",
            score: "170",
            state: "applied",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Junior Technical Author",
            entrepreneur: "Ashton Cox",
            score: "86",
            state: "submitted",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Senior Javascript Developer",
            entrepreneur: "Cedric Kelly",
            score: "433",
            state: "winner",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Accountant",
            entrepreneur: "Airi Satou",
            score: "162",
            state: "finalist",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Integration Specialist",
            entrepreneur: "Brielle Williamson",
            score: "372",
            state: "winner",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Sales Assistant",
            entrepreneur: "Herrod Chandler",
            score: "137",
            state: "withdrawn",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Integration Specialist",
            entrepreneur: "Rhona Davidson",
            score: "327",
            state: "notWinner",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Javascript Developer",
            entrepreneur: "Colleen Hurst",
            score: "205",
            state: "submitted",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Software Engineer",
            entrepreneur: "Sonya Frost",
            score: "103",
            state: "withdrawn",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Office Manager",
            entrepreneur: "Jena Gaines",
            score: "90",
            state: "finalist",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Support Lead",
            entrepreneur: "Quinn Flynn",
            score: "342",
            state: "notFinalist",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Regional Director",
            entrepreneur: "Charde Marshall",
            score: "470",
            state: "finalist",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Senior Marketing Designer",
            entrepreneur: "Haley Kennedy",
            score: "313",
            state: "winner",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Regional Director",
            entrepreneur: "Tatyana Fitzpatrick",
            score: "385",
            state: "notWinner",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Marketing Designer",
            entrepreneur: "Michael Silva",
            score: "198",
            state: "withdrawn",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Chief Financial Officer (CFO)",
            entrepreneur: "Paul Byrd",
            score: "725",
            state: "notWinner",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Systems Administrator",
            entrepreneur: "Gloria Little",
            score: "237",
            state: "withdrawn",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Software Engineer",
            entrepreneur: "Bradley Greer",
            score: "132",
            state: "winner",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Personnel Lead",
            entrepreneur: "Dai Rios",
            score: "217",
            state: "winner",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Development Lead",
            entrepreneur: "Jenette Caldwell",
            score: "345",
            state: "applied",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Chief Marketing Officer (CMO)",
            entrepreneur: "Yuri Berry",
            score: "675",
            state: "submitted",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Pre-Sales Support",
            entrepreneur: "Caesar Vance",
            score: "106",
            state: "applied",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Sales Assistant",
            entrepreneur: "Doris Wilder",
            score: "85",
            state: "withdrawn",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Chief Executive Officer (CEO)",
            entrepreneur: "Angelica Ramos",
            score: "10",
            state: "submitted",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Developer",
            entrepreneur: "Gavin Joyce",
            score: "92",
            state: "notWinner",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Regional Director",
            entrepreneur: "Jennifer Chang",
            score: "357",
            state: "notWinner",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Software Engineer",
            entrepreneur: "Brenden Wagner",
            score: "206",
            state: "withdrawn",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Chief Operating Officer (COO)",
            entrepreneur: "Fiona Green",
            score: "850",
            state: "notWinner",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Regional Marketing",
            entrepreneur: "Shou Itou",
            score: "163",
            state: "applied",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Integration Specialist",
            entrepreneur: "Michelle House",
            score: "95",
            state: "applied",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Developer",
            entrepreneur: "Suki Burks",
            score: "114",
            state: "submitted",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Technical Author",
            entrepreneur: "Prescott Bartlett",
            score: "145",
            state: "applied",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Team Leader",
            entrepreneur: "Gavin Cortez",
            score: "235",
            state: "finalist",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Post-Sales support",
            entrepreneur: "Martena Mccray",
            score: "324",
            state: "withdrawn",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Marketing Designer",
            entrepreneur: "Unity Butler",
            score: "85",
            state: "submitted",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Office Manager",
            entrepreneur: "Howard Hatfield",
            score: "164",
            state: "finalist",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Secretary",
            entrepreneur: "Hope Fuentes",
            score: "109",
            state: "notWinner",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Financial Controller",
            entrepreneur: "Vivian Harrell",
            score: "452",
            state: "submitted",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Office Manager",
            entrepreneur: "Timothy Mooney",
            score: "136",
            state: "finalist",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Director",
            entrepreneur: "Jackson Bradshaw",
            score: "645",
            state: "finalist",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Support Engineer",
            entrepreneur: "Olivia Liang",
            score: "234",
            state: "applied",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Software Engineer",
            entrepreneur: "Bruno Nash",
            score: "163",
            state: "applied",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Support Engineer",
            entrepreneur: "Sakura Yamamoto",
            score: "139",
            state: "submitted",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Developer",
            entrepreneur: "Thor Walton",
            score: "98",
            state: "notFinalist",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Support Engineer",
            entrepreneur: "Finn Camacho",
            score: "87",
            state: "submitted",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Data Coordinator",
            entrepreneur: "Serge Baldwin",
            score: "138",
            state: "winner",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Software Engineer",
            entrepreneur: "Zenaida Frank",
            score: "125",
            state: "notWinner",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Software Engineer",
            entrepreneur: "Zorita Serrano",
            score: "115",
            state: "withdrawn",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Junior Javascript Developer",
            entrepreneur: "Jennifer Acosta",
            score: "75",
            state: "notFinalist",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Sales Assistant",
            entrepreneur: "Cara Stevens",
            score: "145",
            state: "applied",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Regional Director",
            entrepreneur: "Hermione Butler",
            score: "356",
            state: "applied",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Systems Administrator",
            entrepreneur: "Lael Greer",
            score: "103",
            state: "submitted",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Developer",
            entrepreneur: "Jonas Alexander",
            score: "86",
            state: "notWinner",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Regional Director",
            entrepreneur: "Shad Decker",
            score: "183",
            state: "finalist",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Javascript Developer",
            entrepreneur: "Michael Bruce",
            score: "183",
            state: "withdrawn",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        },
        {
            business: "Customer Support",
            entrepreneur: "Donna Snider",
            score: "112",
            state: "applied",
            assessor_1: {
                name: "Assessor 1 Full Name",
                score: "3",
                recommendation: "notFinalist",
                explanation: "This is dummy text for explanation"
            },
            assessor_2: {
                name: "Assessor 2 Full Name",
                score: "4",
                recommendation: "finalist",
                explanation: "This is dummy text for explanation of the second Assessor"
            },
        }
    ]
,
        "columns": [
            {
                "className":      'details-control',
                "orderable":      false,
                "data":           null,
                "defaultContent": '<i class="fa fa-plus-square-o"></i>'
            },
            { "data": "business" },
            { "data": "entrepreneur" },
            { "data": "score" },
            { "data": "state" }
        ],
        "order": [[1, 'asc']],
        "fnRowCallback": function( nRow, aData, iDisplayIndex )
        {
            nRow.className = aData.state;
            return nRow;
        }
    } );

    // Add event listener for opening and closing details
    $('#example tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );

        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
            tr.next().removeClass('extrapanel');
            $(this).find('.fa').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
        }
        else {
            // Open this row
            row.child( format(row.data()) ).show();
            tr.addClass('shown');
            if ( tr.hasClass( "withdrawn" ) )
            {
                tr.next().addClass('extrapanel withdrawn');
            }
            else
            {
                tr.next().addClass('extrapanel');
            }

            $(this).find('.fa').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');

            tr.next().find( ".selectAssessors" ).bidx_chosen();
        }
    } );

        $( ".dataTables_length select" ).bidx_chosen();

} );

    var _handleToggleChange = function( show, group )
    {
        var fn = show ? "fadeIn" : "hide";

        $toggles.filter( ".toggle-" + group )[ fn ]();
    };




    // Open the media library in edit mode for a specific file
    //
    function _editDocument( doc )
    {
        var $modal = $editDocument;

        // Make sure the media app is within our modal
        //
        $( "#media" ).appendTo( $modal.find( ".modal-body" ) );

        // Navigate the media app into list mode for selecting files
        //
        bidx.media.reset();
        bidx.media.navigate(
        {
            requestedState:         "edit"
        ,   onlyEdit:               true
        ,   slaveApp:               true
        ,   selectFile:             true
        ,   multiSelect:            true
        ,   showEditBtn:            false
        ,   showDeleteBtn:          false
        ,   showDownloadBtn:        false

        ,   id:                     doc.bidxMeta.bidxbusinessPlanEntityId

        ,   callbacks:
            {
                ready:                  function( state )
                {
                    bidx.utils.log( "[documents] ready in state", state );
                }

            ,   cancel:                 function()
                {
                    // Stop selecting files, back to previous stage
                    //
                    $modal.modal('hide');
                }

            ,   success:                function( file )
                {
                    bidx.utils.log( "[documents] updated", file );



                    $modal.modal('hide');
                }
            }
        } );

        $modal.modal();
    }

    // Add an attachment to the screen
    //
    function _addAttachment( attachment )
    {
        if ( attachment === null )
        {
            bidx.util.warn( "competitionSummary::_addAttachmentToScreen: attachment is null!" );
            return;
        }

        var $attachment         = snippets.$attachment.clone();

        _updateAttachment( $attachment, attachment );

        $attachmentContainer.reflowrower( "addItem", $attachment );
    }

    function _updateAttachment( $attachment, attachment )
    {
        var createdDateTime     = bidx.utils.parseTimestampToDateStr( attachment.uploadedDateTime )
        ,   $documentLink       = $attachment.find( ".documentLink" )
        ,   $documentImage      = $attachment.find( ".documentImage" )
        ,   $documentDefault    = $attachment.find( ".attachmentDefault" )
        ,   $documentMissing    = $attachment.find( ".attachmentMissing" )
        ,   deletedDoc          = false
        ;

        if ( !attachment.bidxMeta.bidxbusinessPlanEntityId )
        {
            bidx.utils.warn( "competitionSummary::_updateAttachment: attachment has been deleted!" );
            deletedDoc = true;
        }

        // Store the data so we can later use it to merge the updated data in
        //
        $attachment.data( "bidxData", attachment );

        // Set the upload ID on the DOM so we can find this later when we get an update from the media library
        //
        $attachment.attr( "data-businessPlanEntityId", bidx.utils.getValue( attachment, "fileUpload" ));

        $attachment.find( ".documentName"       ).text( attachment.documentName );
        $attachment.find( ".createdDateTime"    ).text( createdDateTime );
        $attachment.find( ".purpose"            ).text( attachment.purpose );
        $attachment.find( ".documentType"       ).text( bidx.data.i( attachment.documentType, "documentType" ) );

        if ( attachment.mimeType && attachment.mimeType.match( /^image/ ) )
        {
            $documentDefault.remove();
            $documentMissing.remove();

            $documentImage
                .attr( "src", attachment.document )
                .fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} )
            ;
        }
        else
        {
            $documentImage.remove();

            // Check if the file has been removed
            //
            if ( deletedDoc )
            {
                $attachment.find( ".documentName" ).text( bidx.i18n.i( "docDeleted" ) ).addClass( "text-danger" );
                $documentLink.remove();
            }
            else
            {
                $documentMissing.remove();
            }
        }

        $documentLink.attr( "href", attachment.document );

    }


    function _competitionTimer (  )
    {
        var countTime = $element.find('.counter' );

        countTime.each( function()
        {
            var el = $(this)
            ,   datatime = el.attr('data-time')
            ;

            countdown( datatime, el );

            setInterval( function()
                        {
                            countdown( datatime, el );
                        }, 1000)
            ;
        });

        function countdown ( datatime, el )
        {

            var now = new moment()
            ,   then = moment.unix( datatime )
            ,   ms = then.diff(now, 'milliseconds', true)
            ,   days = Math.floor(moment.duration(ms).asDays())
            ,   then = then.subtract('days', days)
            ,   ms = then.diff(now, 'milliseconds', true)
            ,   hours = Math.floor(moment.duration(ms).asHours())
            ,   then = then.subtract('hours', hours)
            ,   ms = then.diff(now, 'milliseconds', true)
            ,   minutes = Math.floor(moment.duration(ms).asMinutes())
            ,   then = then.subtract('minutes', minutes)
            ,   ms = then.diff(now, 'milliseconds', true)
            ,   seconds = Math.floor(moment.duration(ms).asSeconds())
            ;

            el.find('.days').text(days);
            el.find('.hours').text(hours);
            el.find('.minutes').text(minutes);
            el.find('.seconds').text(seconds);
        }
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

                                currentUserBusinessSummaryList.push (   {
                                                                            'entityId' : item.bidxMeta.bidxEntityId
                                                                        ,   'data'     : item
                                                                     } );

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



    // Use the retrieved competitionSummary entity to populate the form and other screen elements
    //
    function _populateScreen()
    {
        // Go iteratively over all the forms and there fields
        //
        var dateTimeValue
        ;
        $.each( fields, function( form, formFields )
        {
            var $form       = forms[ form ].$el;

            if ( formFields._root )
            {
                $.each( formFields._root, function( i, f )
                {
                    var $input = $form.find( "[name^='" + f + "']" )
                    ,   value  = bidx.utils.getValue( competitionSummary, f )
                    ;

                    bidx.utils.setElementValue( $input, value );
                } );
            }
        } );


        //Gender
        var genderValue = bidx.utils.getValue( competitionSummary, "competitionGender" );

        if ( genderValue && genderValue.length === 2 )
        {
            genderValue = 'both';
        }
        else
        {
            genderValue = _.first(genderValue);
        }

        bidx.utils.setElementValue( $gender, genderValue );

        // Industry Sectors
        var data = bidx.utils.getValue( competitionSummary, "competitionIndustry", true );

        if ( data )
        {
            $industrySectors.industries( "populateInEditScreen",  data );
        }

        var competitionLogoImage = bidx.utils.getValue( competitionSummary, "competitionLogo" );

        if ( competitionLogoImage )
        {
            $competitionLogoContainer.empty();
            $competitionLogoContainer.append( "<img src='"+ competitionLogoImage.document +"' />");
        }


        var coverImage = bidx.utils.getValue( competitionSummary, "competitionLogo" );

        if ( coverImage )
        {
            $coverImageContainer.cover( "repositionCover" );
        }
        else
        {
            $coverImageContainer.cover( "constructEmpty" );
        }

        // Documents are not using a form, just a reflowrower
        //
        var attachment = bidx.utils.getValue( competitionSummary, "competitionDocument", true );

        if ( attachment )
        {
            var attached            = $attachmentContainer.find( ".attachmentItem" )
            ,   attachmentExists    = []
            ;

            // Prevent documents to be added again by checking the previously added data attribute "data-businessPlanEntityId"
            //
            if ( attached.length ) {
                $.each( attached, function( idx, a )
                {
                    var bidxbusinessPlanEntityId = $(this).context.dataset.businessplanentityid;
                    if ( $.inArray( bidxbusinessPlanEntityId, attachmentExists ) === -1 )
                    {
                        attachmentExists.push( bidxbusinessPlanEntityId );
                    }
                } );
            }

            $.each( attachment, function( idx, a )
            {
                if ( $.inArray( a.fileUpload.toString(), attachmentExists ) === -1 )
                {
                    _addAttachment( a );
                }
            } );
        }

        // Update the chosen components with our set values
        //
        $industry.trigger( "chosen:updated" );
        $regional.trigger( "chosen:updated" );
        $envImpact.trigger( "chosen:updated" );
        $socialImpact.trigger( "chosen:updated" );
    }

    // Convert the form values back into the member object
    //
    function _getFormValues()
    {
        // Iterate over the form fields, not all fields are using forms. Financial Summary
        // is a repeating list, but not a
        //
        $.each( fields, function( form, formFields )
        {
            var $form       = forms[ form ].$el
            ;

            // Unbox
            //
            form += "";

            if ( formFields._root )
            {
                $.each( formFields._root, function( i, f )
                {
                    var $input = $form.find( "[name^='" + f + "']" )
                    ,   value  = bidx.utils.getElementValue( $input )
                    ;

                    bidx.utils.setValue( competitionSummary, f, value );
                } );
            }

            //Gender
            var genderValue = bidx.utils.getElementValue( $gender );

            if( genderValue === 'both' )
            {
                genderValue = ['m','f'];
            }


            bidx.utils.setValue( competitionSummary, 'competitionGender', genderValue );

            // Industry Sectors
            var endSectors = $industrySectors.find( "[name*='endSector']" );

            if ( endSectors )
            {
                var arr = [];
                $.each( endSectors, function(i, f)
                {
                    var value   = bidx.utils.getElementValue( $(f) );

                    if ( value )
                    {
                        arr.push( value );
                    }
                });

                arr = $.map( arr, function( n )
                {
                    return n;
                });

                bidx.utils.setValue( competitionSummary, "competitionIndustry", arr );
            }


            // Collect the nested objects
            //
            $.each( formFields, function( nest )
            {
                // unbox that value!
                //
                nest += "";

                // Properties that start with an _ are special properties and should be ignore
                //
                if ( nest.charAt( 0 ) === "_" )
                {
                    return;
                }

                var i                   = 0
                ,   arrayField          = formFields._arrayFields && $.inArray( nest, formFields._arrayFields ) !== -1
                ,   reflowrowerField    = formFields._reflowRowerFields && $.inArray( nest, formFields._reflowRowerFields ) !== -1
                ,   objectPath          = nest
                ,   item
                ,   count
                ;


                if ( arrayField )
                {
                    count   = $form.find( "." + nest + "Item" ).length;
                    item    = [];
                }
                else
                {
                    item    = {};
                }

                bidx.utils.setValue( competitionSummary, objectPath, item );
                bidx.utils.setNestedStructure( item, count, nest, $form, formFields[ nest ]  );


                // Now collect the removed items, clear the properties and push them to the list so the API will delete them
                //
                var $reflowContainer
                ,   removedItems
                ;

                if ( reflowrowerField )
                {
                    $reflowContainer = $form.find( "." + nest + "Container" );

                    if ( $reflowContainer.length )
                    {
                        removedItems = $reflowContainer.reflowrower( "getRemovedItems" );

                        $.each( removedItems, function( idx, removedItem )
                        {
                            var $removedItem    = $( removedItem )
                            ,   bidxData        = $removedItem.data( "bidxData" )
                            ;

                            if ( bidxData )
                            {
                                // Iterate over the properties and set all, but bidxMeta, to null, except for array's, those must be set to an empty array...
                                //
                                $.each( bidxData, function( prop )
                                {
                                    if ( prop !== "bidxMeta" )
                                    {
                                        bidxData[ prop ] = $.type( bidxData[ prop ] ) === "array"
                                            ? []
                                            : null
                                        ;
                                    }
                                } );
                            }

                            item.push( bidxData );
                        } );
                    }
                }
            } );
        } );

        // Documents
        // Collect the whole situation from the DOM and set that array of bidxData items to be the new situation
        //
        var attachments = [];

        $attachmentContainer.find( ".attachmentItem" ).each( function()
        {
            var $item       = $( this )
            ,   bidxData    = $item.data( "bidxData" )
            ;

            attachments.push( bidxData );
        } );

        bidx.utils.setValue( competitionSummary, "competitionDocument", attachments );

        // Cover Image
        //
        var coverImageData = $coverImageContainer.data( "bidxData" )
        ,   coverImgTopPos = $coverImageContainer.length ? parseInt( $coverImageContainer.find( "img" ).css( "top" ), 10) : false
        ;

        if ( coverImageData )
        {
            bidx.utils.setValue( competitionSummary, "competitionLogo.fileUpload", coverImageData.fileUpload );
    }

        if ( coverImgTopPos )
        {
            if ( coverImgTopPos <= 0 )
            {
                bidx.utils.setValue( competitionSummary, "competitionLogo.top", coverImgTopPos );
            }
            else
            {
                bidx.utils.setValue( competitionSummary, "competitionLogo.top", 0 );
            }
        }

        // competitionLogo
        //
        var competitionLogoImageData = $competitionLogoContainer.data( "bidxData" );

        if ( competitionLogoImageData )
        {
            bidx.utils.setValue( competitionSummary, "competitionLogo.fileUpload", competitionLogoImageData.fileUpload );
        }
    }

    function showEntity( options )
    {
        var  bidxMeta
        ;

        bidx.api.call(
            "entity.fetch"
        ,   {
                entityId:       options.entityId
            ,   groupDomain:    bidx.common.groupDomain
            ,   success:        function( itemSummary )
                {
                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject(itemSummary) )
                    {

                        bidxMeta       = bidx.utils.getValue( itemSummary, "bidxMeta" );

                        if( bidxMeta && bidxMeta.bidxEntityType === options.entityType )
                        {

                            //  execute callback if provided
                            if (options && options.callback)
                            {
                                options.callback( itemSummary );
                            }

                        }
                    }

                }
            ,   error: function(jqXhr, textStatus)
                {
                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback( false );
                    }
                    return false;
                }
            }
        );

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
                        //if( item.bidxEntityType == 'bidxcompetitionSummary') {
                        bidxMeta       = bidx.utils.getValue( item, "bidxMemberProfile.bidxMeta" );

                        if( bidxMeta  )
                        {
                            //  execute callback if provided
                            if (options && options.callback)
                            {
                                options.callback( item, options.ownerId );
                            }
                        }

                    }

                }
            ,   error: function(jqXhr, textStatus)
                {

                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback( false, options.ownerId );
                    }

                }
            }
        );
    }

    // This is the startpoint for the edit state
    //
    function _init( state )
    {
        // Reset any state
        $addFiles.hide();

        var curYear         = bidx.common.getNow().getFullYear();

        // Inject the save and button into the controls
        //
        $btnSave    = $( "<a />", { "class": "btn btn-primary disabled", href: "#save"    });
        $btnCancel  = $( "<a />", { "class": "btn btn-primary disabled", href: "#viewCompetition"  });



        $btnCancel.bind( "click", function( e )
        {
            e.preventDefault();

            // In case of a create there doesn't seem to be logical place to go back to, for now just go to the main page
            //
            if ( state === "create" )
            {
                // Add a redirect note, because the response from the webserver / wp / php is very slow
                //
                bidx.common.notifyRedirect();

                // @TODO: whereto in case of cancel of a competitionSummary create?
                //
                document.location.href = "/";
            }
            else
            {
                bidx.common.removeAppWithPendingChanges( appName );
                bidx.controller.updateHash( "#viewCompetition", true );

                reset();

                bidx.common.removeValidationErrors();

                _showView( "show" );

            }

            $coverImageContainer.cover( "disable" );
        } );

        $btnSave.bind( "click", function( e )
        {
            e.preventDefault();

            _doSave();
        } );

        $btnSave.i18nText( ( state === "create" ? "btnSave" : "btnSave" ) ).prepend( $( "<div />", { "class": "fa fa-check fa-above fa-big" } ) );
        $btnCancel.i18nText( "btnCancel" ).prepend( $( "<div />", { "class": "fa fa-times fa-above fa-big" } ) );

        $controlsForEdit.empty();
        $controlsForEdit.append( $btnSave, $btnCancel );

        $controlsForError.empty();
        $controlsForError.append( $btnCancel.clone( true ) );

        if ( state === "edit" )
        {

            _getCompetitionSummary()
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

                    _showAllView( "mentor" );
                    _showAllView( "matchingmentors" );

                })
            ;
        }
        else
        {
            competitionSummary     = {};



            $btnSave.removeClass( "disabled" );
            $btnCancel.removeClass( "disabled" );

            _showView( "edit" );

        }

    }


    // Retrieve the business summary by ID
    //
    // @returns promise
    //
    function _getCompetitionSummary()
    {
        var $d = $.Deferred();

        // Fetch the business summary
        //
        bidx.api.call(
            "competition.fetch"
        ,   {
                competitionSummaryId:  competitionSummaryId
            ,   groupDomain:        bidx.common.groupDomain

            ,   success: function( response )
                {
                    bidx.utils.log( "[competitionSummary] fetch", competitionSummaryId, response );

                    // Do we have edit perms?
                    //
                    var bidxMeta    = bidx.utils.getValue( response, "data.bidxMeta" )
                    ,   canEdit     = bidx.utils.getValue( bidxMeta, "bidxCanEdit" )
                    ,   msg
                    ;

                    if ( !canEdit )
                    {
                        msg = bidx.i18n.i( "noEditPermission" );
                        _showError( msg );

                        $d.reject( new Error( msg ) );
                    }
                    else
                    {
                        competitionSummary = response.data;

                        bidx.utils.log( "bidx::competitionSummary", competitionSummary );

                        $d.resolve();
                    }
                }
            ,   error:          function( jqXhr, textStatus )
                {
                    var status  = bidx.utils.getValue( jqXhr, "status" ) || textStatus
                    ,   msg     = "Something went wrong while retrieving the business summary: " + status
                    ,   error   = new Error( msg )
                    ;

                    _showError( msg );

                    $d.reject( error );
                }
            }
        );

        return $d;
    }

    // Try to save the competitionSummary to the API
    //
    function _doSave()
    {
        // Only allow saving when all the sub forms are valid
        //
        var anyInvalid = false;

        if ( bidxConfig.authenticated === false )
        {
            bidx.utils.log('Not logged in');
        }

        $.each( forms, function( name, form )
        {
            if ( !form.$el.valid() )
            {
                bidx.utils.warn( "[competitionSummary] Invalid form", form.$el, form.$el.validate().errorList );

                anyInvalid = true;
            }
        } );

        if ( anyInvalid )
        {
            return;
        }

        if ( $btnSave.hasClass( "disabled" ) )
        {
            return;
        }

        $btnSave.addClass( "disabled" );
        $btnCancel.addClass( "disabled" );

        _save(
        {
            error: function( jqXhr )
            {
                var response;

                try
                {
                    // Not really needed for now, but just have it on the screen, k thx bye
                    //
                    response = JSON.stringify( JSON.parse( jqXhr.responseText ), null, 4 );
                }
                catch ( e )
                {
                    bidx.utils.error( "problem parsing error response from competitionSummary save" );
                }

                bidx.common.notifyError( "Something went wrong during save: " + response );

                // Offer a login modal if not authecticated
                if ( jqXhr.status === 401 )
                {
                    $( ".loginModal" ).modal();
                }

                $btnSave.removeClass( "disabled" );
                $btnCancel.removeClass( "disabled" );
            }
        } );
    }

    function _appendCardValuesOld( options )
    {
        var listItem
        ,   $listItem
        ,   countryOperation
        ,   entrpreneurIndustry
        ,   entrpreneurReason
        ,   country
        ,   industry
        ,   reason
        ,   item
        ,   businessData
        ,   bidxMeta
        ,   isEntrepreneur
        ,   isInvestor
        ,   isMentor
        ,   emptyVal        = ''
        ,   entityId        = options.entityId
        ,   $list           = $element.find("." + options.list)
        ,   snippet         = $("#entrpreneur-card-snippet").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listError      = $("#error-card").html().replace(/(<!--)*(-->)*/g, "")
        ;

        businessData       =  _.findWhere( currentUserBusinessSummaryList, { 'entityId' : parseInt(entityId, 10) } );

        bidxMeta           = businessData.data.bidxMeta;

        item               = businessData.data;

        isEntrepreneur   = bidx.utils.getValue( item, "bidxEntrepreneurProfile" );
        isInvestor       = bidx.utils.getValue( item, "bidxInvestorProfile" );
        isMentor         = bidx.utils.getValue( item, "bidxMentorProfile" );

        if ( !$.isEmptyObject(item) )
        {
             countryOperation  = bidx.utils.getValue( item, "countryOperation");

            if(countryOperation)
            {

                bidx.data.getItem(countryOperation, 'country', function(err, labelCountry)
                {
                    country    =   labelCountry;
                });
            }

            entrpreneurIndustry = bidx.utils.getValue( item, "industry");

            if(entrpreneurIndustry)
            {
                bidx.data.getItem(entrpreneurIndustry, 'industry', function(err, labelIndustry)
                {
                   industry = labelIndustry;
                });
            }

            entrpreneurReason = bidx.utils.getValue( item, "reasonForSubmission");

            if(entrpreneurReason)
            {
                bidx.data.getItem(entrpreneurReason, 'reasonForSubmission', function(err, labelReason)
                {
                   reason = labelReason;
                });
            }

            listItem    =   snippet
                            .replace( /%entityId%/g,                    entityId   ? entityId     : emptyVal )
                            .replace( /%bidxOwnerDisplayName%/g,        bidxMeta.bidxOwnerDisplayName   ? bidxMeta.bidxOwnerDisplayName     : emptyVal )
                            .replace( /%bidxRatingAverage%/g,           bidxMeta.bidxRatingAverage   ? bidxMeta.bidxRatingAverage     : emptyVal )
                            .replace( /%completeness%/g,                item.completeness   ? item.completeness     : emptyVal )
                            .replace( /%name%/g,                        item.name   ? item.name     : emptyVal )
                            .replace( /%summary%/g,                     item.summary   ? item.summary     : emptyVal )
                            .replace( /%bidxLastUpdateDateTime%/g,      bidxMeta.bidxLastUpdateDateTime  ? bidx.utils.parseTimestampToDateStr(bidxMeta.bidxLastUpdateDateTime) : emptyVal )
                            .replace( /%role_entrepreneur%/g,           bidx.i18n.i( 'entrepreneur' ) )
                            .replace( /%countryOperation%/g,            country )
                            .replace( /%industry%/g,                    industry )
                            .replace( /%reasonForSubmission%/g,         reason )
                            .replace( /%financingNeeded%/g,             item.financingNeeded   ? item.financingNeeded     : emptyVal )
                            ;

            $listItem   =   $(listItem);
        }
        else
        {
            $listItem = $listError;
        }

        $list.empty().append( $listItem );

        _showAllView('ownCard');


    }

    function _appendCardValues( options )
    {
        var listItem
        ,   $listItem
        ,   countryOperation
        ,   entrpreneurIndustry
        ,   entrpreneurReason
        ,   country
        ,   industry
        ,   reason
        ,   item
        ,   businessData
        ,   bidxMeta
        ,   isEntrepreneur
        ,   isInvestor
        ,   isMentor
        ,   emptyVal        = ''
        ,   entityId        = options.entityId
        ,   $list           = $element.find("." + options.list)
        ,   snippet         = $("#entrpreneur-card-snippet").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listError      = $("#error-card").html().replace(/(<!--)*(-->)*/g, "")
        ,   $ratingWrapper
        ,   $raty
        ,   $infoAction
        ;

        businessData       =  _.findWhere( applicationObj, { 'entityId' : parseInt(entityId, 10) } );

        bidxMeta           = businessData.bidxMeta;


        if ( !$.isEmptyObject(bidxMeta) )
        {

            listItem    =   snippet
                            .replace( /%entityId%/g,                    entityId                        ? entityId     : emptyVal )
                            .replace( /%bidxOwnerId/g,                  bidxMeta.bidxOwnerDisplayName )
                            .replace( /%bidxOwnerDisplayName%/g,        bidxMeta.bidxOwnerDisplayName   ? bidxMeta.bidxOwnerDisplayName     : emptyVal )
                            .replace( /%bidxRatingAverage%/g,           bidxMeta.bidxRatingAverage      ? bidxMeta.bidxRatingAverage     : emptyVal )
                            .replace( /%bidxRatingCount%/g,             bidxMeta.bidxRatingCount        ? bidxMeta.bidxRatingCount     : emptyVal )
                            .replace( /%bidxEntityDisplayName%/g,       bidxMeta.bidxEntityDisplayName  ? bidxMeta.bidxEntityDisplayName     : emptyVal )
                            .replace( /%created%/g,                     businessData.created            ? bidx.utils.parseTimestampToDateStr(businessData.created) : emptyVal )
                            .replace( /%status%/g,                      bidx.i18n.i(businessData.status ,appName))
                            ;

            $listItem   =   $(listItem);

            /* Assign Next Action According to Role */
            $infoAction  = $listItem.find( ".info-action");


            /* Displaying Rating Star Logic */
            $ratingWrapper              = $listItem.find( ".rating-wrapper" );
            $raty                       = $ratingWrapper.find( ".raty" );

            $raty.raty({
                starType: 'i',
                readOnly: true,
                // TODO Arjan remove or translate?
                hints:  ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
                score:  bidxMeta.bidxRatingAverage

            });
        }
        else
        {
            $listItem = $listError;
        }

        $list.append( $listItem );

        _showAllView('ownCard');


    }

    function _updatePlanStatusToCompetition( params )
    {
        bidx.api.call(
            "competition.assignPlanToCompetition"
        ,   {
                competitionId:  params.competitionId
            ,   groupDomain:    bidx.common.groupDomain
            ,   data:           params.data
            ,   method:         "POST"
            ,   success:        function( response )
                {
                    // Do we have edit perms?
                    //
                    bidx.utils.log('response',response);
                    _hideView('apply');
                    _showAllView('success');

                    _appendCardValues( {
                                            list:       'viewOwnCard'
                                        ,   entityId:   params.data.entityId
                                        });


                }

                , error: function(jqXhr, textStatus)
                {
                    var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    _showError("Something went wrong while applying for the competition for entityId: " + params.data.entityId);
                }
            }
        );
    }

    $btnApply.click( function( e )
    {
        e.preventDefault();

        var orgText
        ,   confirmTimer
        ,   params
        ,   businessPlanEntityId    =   $businessSummary.val()
        ;

        if ( !businessPlanEntityId )
        {
            bidx.utils.error( "[businesssummary] No businesssummary id, unable to apply!", businessPlanEntityId );
            return;
        }



        function startConfirmTimer( $btn, orgText )
        {
            confirmTimer = setTimeout( function( )
            {
                $btn.text( orgText );
                $btn.data( "confirm", false );

                $btn.removeClass( "btn-danger" );

            }, 5000 );
        }

        if ( $btnApply.data( "confirm" ) )
        {
            clearTimeout( confirmTimer );

            params  =   {
                            competitionId   :   competitionSummaryId
                        ,   data            :   {
                                                    entityId    :   businessPlanEntityId
                                                ,   status      :   'APPLIED'
                                                }
                        }
                    ;
            _updatePlanStatusToCompetition( params );

        }
        else
        {
            orgText = $btnApply.text();

            $btnApply.data( "confirm", true );

            $btnApply.addClass( "btn-danger" );
            $btnApply.i18nText( "btnConfirm" );

            startConfirmTimer( $btnApply, orgText );
        }
    });

    // Beware! validation should have been tested, this is just a function for callin the API for saving
    //
    function _save( params )
    {
        var currentLanguage
        ,   icl_vars
        ;

        if ( !competitionSummary )
        {
            return;
        }

        // Update the business summary object
        //
        _getFormValues();

        // PM-187: Create call should set the periodStartDate to the first januari of the year the businessummary is created
        //


        bidx.common.notifySave();

        // Save the data to the API
        //
        bidx.api.call(
            "competition.save"
        ,   {
                // Undefined when creating the business summary
                //
                competitionSummaryId:      competitionSummaryId
            ,   groupDomain:            bidx.common.groupDomain
            ,   data:                   competitionSummary
            ,   success:        function( response )
                {
                    bidx.utils.log( "competitionSummary.save::success::response", response );

                    var bidxMeta = bidx.utils.getValue( response, "data.bidxMeta" );

                    if ( state === "create" )
                    {
                        competitionSummaryId = bidx.utils.getValue( bidxMeta, "bidxEntityId" );
                    }

                    bidx.common.closeNotifications();
                    bidx.common.notifyRedirect();

                    bidx.common.removeAppWithPendingChanges( appName );

                    icl_vars                    = window.icl_vars || {};
                    currentLanguage             = bidx.utils.getValue( icl_vars, "current_language" );
                    currentLanguage             = (currentLanguage && currentLanguage !== 'en') ? '/' + currentLanguage : '';
                    var url = currentLanguage + "/competition/" + competitionSummaryId + "?rs=true";

                    document.location.href = url;

//                    var url = document.location.href.split( "#" ).shift();
//                    // Maybe rs=true was already added, or not 'true' add it before reloading
//                    //
//                    var rs = bidx.utils.getQueryParameter( "rs", url );
//                    var redirect_to = bidx.utils.getQueryParameter( "redirect_to", url );
//
//
//                    if( redirect_to ) {
//                        url = '/' + redirect_to;
//                    }
//
//                    if ( !rs || rs !== "true" )
//                    {
//                        url += ( url.indexOf( "?" ) === -1 ) ? "?" : "&";
//                        url += "rs=true";
//                    }
//
//                    document.location.href = url;

                }
            ,   error:          function( jqXhr )
                {
                    params.error( jqXhr );

                    bidx.common.closeNotifications();
                }
            }
        );
    }

    function _loadMyApplications()
    {
        var myApplicationsAny
        ;

        $.each( listDropdownBp, function( idx, entityId )
        {
            myApplicationsAny = _.findWhere( applicationObj, { 'entityId' : parseInt(entityId, 10) } );

            if ( !$.isEmptyObject(myApplicationsAny) )
            {
                _appendCardValues( {
                                    list:       'viewOwnCard'
                                ,   entityId:   entityId
                                });

                bidx.utils.log('myApplicationsAny', myApplicationsAny);
            }
        });
    }

    // Private functions
    //
    var _showError = function( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    };

    var _showView = function( v )
    {
        currentView = v;
        $views.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();

        if ( currentView === "show" )
        {
            $element.find( ".total-error-message" ).hide();
        }
    };
    var _showAllView = function ( view )
    {
        var $view = $views.filter( bidx.utils.getViewName( view ) ).show();
    };

    var _hideView = function( hideview )
    {
        $views.filter(bidx.utils.getViewName(hideview)).hide();
    };

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

                bidx.utils.log( "competitionSummary::AppRouter::view" );

                competitionSummaryId    =   bidx.utils.getValue( bidxConfig, "context.competitionId" );

                if(cancel)
                {
                    _hideView ( 'apply' ) ;
                    _showAllView ( 'participate' ) ;
                    bidx.controller.updateHash ( "#viewCompetition", false );
                }

                break;

            case 'apply':



                break;
            case 'load':
                bidx.utils.log( "competitionSummary::AppRouter::load", params );

                // Hide common-mentordashboard.js mentor ex click on cacncel modal box etc
                $( ".bidx-modal").unbind('hide');
                $( ".bidx-modal").modal('hide');




            break;
            case "edit":
                bidx.utils.log( "competitionSummary::AppRouter::edit", options.id, options.section );

                var newcompetitionSummaryId
                ,   splatItems
                ,   updateHash      = false
                ,   isId            = ( options.id && options.id.match( /^\d+$/ ) )
                ;

                if ( options.id && !isId )
                {
                    options.section = options.id;
                    options.id      = competitionSummaryId;

                    updateHash = true;
                }


                if ( !( state === "edit" && options.id === competitionSummaryId ) )
                {
                    competitionSummaryId   = options.id;
                    state               = "edit";

                    _showView( "load" );

                    // Make sure the i18n translations and static data api items for this app are available before initing
                    //
                    bidx.i18n.load( [ "__global", appName ] )
                        .then( function()
                        {
                            return bidx.data.load( [ "country" ] );
                        } )
                        .done( function()
                        {
                            _init( state );
                        } );
                }

                $element.addClass( "edit" );

                if ( updateHash )
                {
                    var hash = "editcompetitionSummary/" + options.id;

                    if ( options.section )
                    {
                         hash += "/" + options.section;
                    }

                    return hash;
                }

            break;

            case "create":
                bidx.utils.log( "CreatecompetitionSummary::AppRouter::create" );

                competitionSummaryId   = null;
                state               = "create";

                _showView( "load" );

                // Make sure the i18n translations for this app are available before initing
                //
                bidx.i18n.load( [ "__global", appName ] )
                    .done( function()
                    {
                        _init( state );
                    } );
            break;
        }
    }

    // Reset the whole application
    //
    function reset()
    {
        state = null;

        bidx.common.removeAppWithPendingChanges( appName );

    }

    // Engage!
    //
    _oneTimeSetup();

    // Expose
    //
    var app =
    {
        navigate:                   navigate
    ,   reset:                      reset

    ,   $element:                   $element

        // START DEV API
        //
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.competition = app;


    // if hash is empty and there is not path in the uri, load #home
    //
    if ($("body.bidx-competition").length && !bidx.utils.getValue(window, "location.hash").length)
    {
        window.location.hash = "#viewCompetition";
    }
} ( jQuery ));
