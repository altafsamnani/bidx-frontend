/* global bidx */
;( function( $ )
{
    "use strict";

    var $element                    = $( "#competitionSummary" )
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
    ,   $coverImage                         = $element.find( ".businessCover" )
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
         ,   visibilityArrItems  =   [ ]
         ;
        _competitionTimer();
        _snippets();
        _setupValidation();
        _coverImage();
        _documents();

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

                competitionSummary.cover = null;
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
                        $competitionLogoContainer.html( $( "<img />", { "src": file.document, "data-fileUploadId": file.fileUpload } ));

                        $bscompetitionLogoModal.modal( "hide" );
                    }
                }
            } );

            $bscompetitionLogoModal.modal();
        } );


        // Setup the Documents component
        //
        function _documents()
        {
            $( window.bidx ).bind( "updated.media", function( e, data )
            {
                var uploadId = bidx.utils.getValue( data, "bidxMeta.bidxUploadId" );

                if ( !uploadId )
                {
                    bidx.utils.error( "No uploadId found on updated media event!", data );
                    return;
                }

                $attachmentContainer.find( "[data-uploadId='" + uploadId + "']" ).each( function()
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
                itemsPerRow:        3
            ,   itemClass:          "attachmentItem"
            } );

        }

        // bind Full Accesss Request button
        // only for users not owning the current summary ( summary owners do not get this button rendered )
        //
        if ( $btnFullAccessRequest )
        {
                $btnFullAccessRequest.click( function( e )
                {
                    e.preventDefault();
                    _doAccessRequest();
                } );
        }


        // bind Rating stars
        // only for users not owning the current summary ( summary owners do not get this button rendered )
        //
        if ( $ratingVote )
        {
            $raty.raty({
                cancel   : true,
                starType : 'i',
                // TODO Arjan remove or translate?
                hints       : ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
                click: function( value )
                {
                    var scope = null
                    ,   comment = null;

                    bidx.common.rate( bidxConfig.context.competitionSummaryId, scope, value, comment, function( data )
                    {
                        var count = data.totals.count;
                        bidx.utils.log('data.userRating', data);
                        $ratingUserLabel.text( bidx.i18n.i( data.userRating ? "ratingUserLabel" : "ratingUserLabelNone", appName ) );

                        $ratingAverage.text(data.totals.average ? data.totals.average : "?" );
                        $ratingTotalVoters.text(data.totals.count);

                        if ( data.totals.average )
                        {
                            $ratingScore.removeClass( "hide" );
                            $ratingNoScore.addClass( "hide" );
                        }
                        else
                        {
                            $ratingNoScore.removeClass( "hide" );
                            $ratingScore.addClass( "hide" );
                        }
                    } );
                },
                score: function()
                {
                    return $(this).attr('data-rating');
                }

            });
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

        '<div class="">'+
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

    '</div>';
}

$(document).ready(function() {
    var table = $('#example').DataTable( {
        "bPaginate": false,
        "data":     [
        {
            business: "System Architect",
            entrepreneur: "Tiger Nixon",
            score: "320",
            state: "Withdrawn",
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
            state: "Applied",
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
            state: "Submitted",
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
            state: "Winner",
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
            state: "Finalist",
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
            state: "Winner",
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
            state: "Withdrawn",
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
            state: "Not Winner",
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
            state: "Submitted",
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
            state: "Withdrawn",
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
            state: "Finalist",
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
            state: "Not Finalist",
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
            state: "Finalist",
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
            state: "Winner",
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
            state: "Not Winner",
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
            state: "Withdrawn",
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
            state: "Not Winner",
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
            state: "Withdrawn",
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
            state: "Winner",
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
            state: "Winner",
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
            state: "Applied",
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
            state: "Submitted",
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
            state: "Applied",
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
            state: "Withdrawn",
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
            state: "Submitted",
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
            state: "Not Winner",
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
            state: "Not Winner",
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
            state: "Withdrawn",
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
            state: "Not Winner",
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
            state: "Applied",
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
            state: "Applied",
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
            state: "Submitted",
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
            state: "Applied",
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
            state: "Finalist",
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
            state: "Withdrawn",
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
            state: "Submitted",
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
            state: "Finalist",
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
            state: "Not Winner",
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
            state: "Submitted",
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
            state: "Finalist",
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
            state: "Finalist",
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
            state: "Applied",
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
            state: "Applied",
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
            state: "Submitted",
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
            state: "Not Finalist",
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
            state: "Submitted",
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
            state: "Winner",
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
            state: "Not Winner",
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
            state: "Withdrawn",
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
            state: "Not Finalist",
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
            state: "Applied",
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
            state: "Applied",
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
            state: "Submitted",
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
            state: "Not Winner",
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
            state: "Finalist",
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
            state: "Withdrawn",
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
            state: "Applied",
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
        "order": [[1, 'asc']]
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
            tr.next().addClass('extrapanel');
            $(this).find('.fa').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
        }
    } );
} );

    var _handleToggleChange = function( show, group )
    {
        var fn = show ? "fadeIn" : "hide";

        $toggles.filter( ".toggle-" + group )[ fn ]();
    };


    // Do a full access request for this competitionSummary
    //
    function _doAccessRequest()
    {
        bidx.api.call(
             "competitionSummaryRequestAccess.send"
        ,   {
                groupDomain:            bidx.common.groupDomain
            ,   id:                     bidxConfig.context.competitionSummaryId
            ,   success: function( response )
                {
                    if ( response.status === "OK" )
                    {
                        // show Pending button and hide Send button
                        //
                        $bidxAccessRequestPending.toggleClass( "hide" );
                        $btnFullAccessRequest.toggleClass( "hide" );
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
                        _showError( "Something went wrong sending the access request: " + response.text );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        _showError( "Something went wrong sending the access request: " + response.text );
                    }

                }
            }
        );
    }

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

        ,   id:                     doc.bidxMeta.bidxUploadId

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

        if ( !attachment.bidxMeta.bidxUploadId )
        {
            bidx.utils.warn( "competitionSummary::_updateAttachment: attachment has been deleted!" );
            deletedDoc = true;
        }

        // Store the data so we can later use it to merge the updated data in
        //
        $attachment.data( "bidxData", attachment );

        // Set the upload ID on the DOM so we can find this later when we get an update from the media library
        //
        $attachment.attr( "data-uploadId", bidx.utils.getValue( attachment, "fileUpload" ));

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


        var coverImage = bidx.utils.getValue( competitionSummary, "cover" );

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

            // Prevent documents to be added again by checking the previously added data attribute "data-uploadid"
            //
            if ( attached.length ) {
                $.each( attached, function( idx, a )
                {
                    var bidxUploadId = $(this).context.dataset.uploadid;

                    if ( $.inArray( bidxUploadId, attachmentExists ) === -1 )
                    {
                        attachmentExists.push( bidxUploadId );
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
            bidx.utils.setValue( competitionSummary, "cover.fileUpload", coverImageData.fileUpload );
    }

        if ( coverImgTopPos )
        {
            if ( coverImgTopPos <= 0 )
            {
                bidx.utils.setValue( competitionSummary, "cover.top", coverImgTopPos );
            }
            else
            {
                bidx.utils.setValue( competitionSummary, "cover.top", 0 );
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

                // No competitionSummaryId set yet and not one explicitly provided? Use the one from the bidxConfig.context
                //
                if ( !competitionSummaryId && !isId )
                {
                    options.id = bidx.utils.getValue( bidxConfig, "bidxcompetitionSummary" );

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
