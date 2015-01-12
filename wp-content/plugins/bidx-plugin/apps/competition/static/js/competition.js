/* global bidx */
;( function( $ )
{
    "use strict";

    var $element                    = $( "#competitionSummary" )
    ,   $snippets                   = $element.find( ".snippets" )

    ,   $views                      = $element.find( ".view" )

    ,   $editControls               = $element.find( ".editControls" )

    ,   $industry                   = $element.find( "[name='industry']" )
    ,   $expertiseNeeded            = $element.find( "[name='expertiseNeeded']" )
    ,   $productService             = $element.find( "[name='productService']" )
    ,   $regional                   = $element.find( "[name='regional']" )
    ,   $visibilityDropdown         = $element.find( "[name='visibility']" )

    ,   $reasonForSubmission        = $element.find( "[name='reasonForSubmission']" )
    ,   $envImpact                  = $element.find( "[name='envImpact']" )
    ,   $socialImpact               = $element.find( "[name='socialImpact']" )
    ,   $yearSalesStarted           = $element.find( "[name='yearSalesStarted']" )

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
        ,   management:
            {
                $el:                    $element.find( "#frmCompetition-Management" )
            }
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

        // Logo
        //
    ,   $bsLogo                             = $element.find( ".bsLogo" )
    ,   $bsLogoBtn                          = $bsLogo.find( "[href$='#addLogo']" )
    ,   $bsLogoModal                        = $bsLogo.find( ".addLogoImage" )
    ,   $logoContainer                      = $bsLogo.find( ".logoContainer" )



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
            ,   "summary"

                // This is actually an array in the data model, but presented as a dropdown in the UI designs.
                // Conflict!
                // We need to force it to be an array when sending into the API
                // After disucssion with Jeroen created BIDX-1435 to request any non-array value to be interpreted as an array by the API,
                // but until that is available, send in reasonforSubmsision as an array
                //
            ,   "startdate"
            ,   "enddate"
            ]
        }
    ,   "management":
        {
            "_root":
            [
                "visibility"
            ]
        }

    ,   "aboutParticipants":
        {
            "_root":
            [
                "industry"
            // ,   "suggestedIndustry"
            // ,   "productService"
            // ,   "suggestedProductService"
            ,   "regional"
            ,   "socialImpact"
            ,   "envImpact"
            ,   "consumerType"
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

        // Populate the dropdowns with the values
        //
        forms.generalOverview.$el.find( "[name='reasonForSubmission']" ).bidx_chosen(
        {
            dataKey:            "reasonForSubmission"
        ,   emptyValue:         bidx.i18n.i( "selectReasonForSubmission", appName )
        });


        // $productService.bidx_chosen(
        // {
        //     dataKey:            "productService"
        // });

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
            /* altaf
            snippets.$managementTeam        = $snippets.children( ".managementTeamItem" ).remove();
            snippets.$financialSummaries    = $financialSummary.find( ".snippets" ).find( ".financialSummariesItem" ).remove();
            snippets.$company               = $snippets.find( "table tr.companyItem"    ).remove();
            snippets.$attachment            = $snippets.children( ".attachmentItem"    ).remove(); */

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
            } );
            // About your business
            //
            forms.aboutParticipants.$el.validate(
            {
                debug:          false
            ,   ignore:         ""
            ,   rules:
                {
                    industry:
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


        // Logo
        //
        $bsLogoBtn.click( function( e )
        {
            e.preventDefault();

            // Make sure the media app is within our modal container
            //
            $( "#media" ).appendTo( $bsLogoModal.find( ".modal-body" ) );

            var $selectBtn = $bsLogoModal.find( ".btnSelectFile" )
            ,   $cancelBtn = $bsLogoModal.find( ".btnCancelSelectFile" )
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
                        bidx.utils.log( "[logo] ready in state", state );
                    }

                ,   cancel:                 function()
                    {
                        // Stop selecting files, back to previous stage
                        //
                        $bsLogoModal.modal('hide');
                    }

                ,   success:                function( file )
                    {
                        bidx.utils.log( "[logo] uploaded", file );

                        // NOOP.. the parent app is not interested in when the file is uploaded
                        // only when it is attached / selected
                    }

                ,   select:               function( file )
                    {
                        bidx.utils.log( "[logo] selected profile picture", file );

                        $logoContainer.data( "bidxData", file );
                        $logoContainer.html( $( "<img />", { "src": file.document, "data-fileUploadId": file.fileUpload } ));

                        $bsLogoModal.modal( "hide" );
                    }
                }
            } );

            $bsLogoModal.modal();
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
    }

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





    // Use the retrieved competitionSummary entity to populate the form and other screen elements
    //
    function _populateScreen()
    {
        // Go iteratively over all the forms and there fields
        //
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

        // Industry Sectors
        //
        var data = bidx.utils.getValue( competitionSummary, "industry", true );

        if ( data )
        {
            $industrySectors.industries( "populateInEditScreen",  data );
        }

        var logoImage = bidx.utils.getValue( competitionSummary, "logo" );

        if ( logoImage )
        {
            $logoContainer.empty();
            $logoContainer.append( "<img src='"+ logoImage.document +"' />");
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
        var attachment = bidx.utils.getValue( competitionSummary, "attachment", true );

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
        $expertiseNeeded.trigger( "chosen:updated" );
        $productService.trigger( "chosen:updated" );
        $regional.trigger( "chosen:updated" );
        $reasonForSubmission.trigger( "chosen:updated" );
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

                bidx.utils.setValue( competitionSummary, "industry", arr );
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

        bidx.utils.setValue( competitionSummary, "attachment", attachments );

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

        // Logo
        //
        var logoImageData = $logoContainer.data( "bidxData" );

        if ( logoImageData )
        {
            bidx.utils.setValue( competitionSummary, "logo.fileUpload", logoImageData.fileUpload );
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

    /*
        {
            "searchTerm"    :   "text:*"
        ,   "maxResult"     :   10
        ,   "offset"        :   0
        ,   "entityTypes"   :   [
                                    {
                                        "type": "bidxMentorProfile"
                                    }
                                ]
        ,   "scope"         :   "local"
        ,   "filters": [
                        "-ownerId:4321"
                        ]
        }
    */
    function _getSearchCriteria ( params ) {

        var q
        ,   sort
        ,   criteria
        ,   criteriaQ
        ,   paramFilter
        ,   search
        ,   valueExpertiseNeeded
        ,   filterExpertiseNeeded   = ''
        ,   sep                     = ''
        ,   facetFilters            = []
        ,   filters                 = []
        ,   sortQuery               = []
        ,   criteriaSort            = []
        ,   entityFilters           = CONSTANTS.ENTITY_TYPES
        ;

        // 1. Search paramete
        // ex searchTerm:text:altaf
        //
        // See if its coming from the search page itself(if) or from the top(else)
        //

        // 2. Sort criteria
        // ex sort:["field":"entity", "order": asc ]
        //
        sort = bidx.utils.getValue( params, 'sort' );

        if( sort )
        {

            $.each( sort, function( sortField, sortOrder )
            {
                criteriaSort.push( {
                                            "field" : sortField
                                        ,   "order":  sortOrder
                                    });


            } );

        }

        // 3. Filter
        // ex facetFilters:["0": "facet_language:fi" ]
        //


        valueExpertiseNeeded        =   bidx.utils.getElementValue( $expertiseNeeded );

        entityFilters[0].filters    =   [];

        if(valueExpertiseNeeded)
        {
            filterExpertiseNeeded   =   'focusExpertise:(';

            $.each( valueExpertiseNeeded, function( idx, item )
            {
                filterExpertiseNeeded   +=   sep + item;
                sep                     =   ' OR ';
            });

            filterExpertiseNeeded   +=   ')';

            entityFilters[0].filters = [filterExpertiseNeeded]; //Uncomment when bas fixes the expetise filter
        }

         //Exclude current user and active mentors from the criteria
        //1 Exclude current user
        if ( loggedInMemberId )
        {
            filters.push('-ownerId:' + loggedInMemberId);
        }
        //Exclude active users
        if ( active )
        {
            $.each( active , function ( id, item)
            {
                filters.push('-ownerId:' + item.mentorId);
            });
        }

        search =    {
                        criteria    :   {
                                            "searchTerm"    :   "text:*"
                                        ,   "facetFilters"  :   facetFilters
                                        ,   "sort"          :   criteriaSort
                                        ,   "maxResult"     :   tempLimit
                                        ,   "offset"        :   paging.search.offset
                                        ,   "entityTypes"   :   entityFilters
                                        ,   "filters"       :   filters
                                        ,   "scope"         :   "local"
                                        }
                    };


        return search;

    }

    // This function is a collection of callbacks for the contact categories. It is meant to execute contact-category specific code
    //
    function _getContactsCallback( $listItem, params )
    {
        //      $listItem    = jQuery object of the contact category listItem
        // active, wait, respond
        var $matchBtn
        ,   $acceptBtn
        ,   hrefMatch
        ,   filteredRequest
        ,   initiatorId
        ,   mentorId                =   params.mentorId
        ,   isActiveRequest         =   params.isActiveRequest
        ,   requestId
        ,   waitArr                 =   []
        ,   respondArr              =   []
        ,   rejectMentorArr         =   []
        ,   rejectEntrepreneurArr   =   []
        ,   isWaitingRequest
        ,   isRespondRequest
        ,   isRejectByEntrepreneur
        ,   isRejectByMentor
        ,   contextBpId             =   bidxConfig.context.competitionSummaryId
        ,   actionData
        ;

        if(!isActiveRequest)
        {
            waitArr                 =   _.pluck (   wait,   'mentorId' );

            respondArr              =   _.pluck (   respond,  'mentorId' );

            rejectMentorArr         =   _.pluck (   rejectByMentor,  'mentorId' );

            rejectEntrepreneurArr   =   _.pluck (   rejectByEntrepreneur,  'mentorId' );

            isWaitingRequest        =   _.contains( waitArr,    mentorId );

            isRespondRequest        =   _.contains( respondArr,    mentorId );

            isRejectByEntrepreneur  =   _.contains( rejectEntrepreneurArr,    mentorId );

            isRejectByMentor        =   _.contains( rejectMentorArr,    mentorId );
        }

        switch(true)
        {

            case isWaitingRequest:
                actionData  = $("#send-mentor-action").html().replace(/(<!--)*(-->)*/g, "");
                $listItem.find( '.action' ).empty( ).append( actionData );

                /***************Request sent**************************/
                $matchBtn   =   $listItem.find( ".btn-bidx-send");
                $matchBtn.removeClass('btn-success').addClass('disabled btn-info').i18nText("btnRequestSent");
            break;

            case isRejectByEntrepreneur:
                actionData  = $("#send-mentor-action").html().replace(/(<!--)*(-->)*/g, "");
                $listItem.find( '.action' ).empty( ).append( actionData );

                /***************Request sent**************************/
                $matchBtn   =   $listItem.find( ".btn-bidx-send");
                $matchBtn.removeClass('btn-success').addClass('disabled btn-info').i18nText("btnRequestRejectedByEntrepreneur");
            break;

            case isRejectByMentor:
                actionData  = $("#send-mentor-action").html().replace(/(<!--)*(-->)*/g, "");
                $listItem.find( '.action' ).empty( ).append( actionData );

                /***************Request sent**************************/
                $matchBtn   =   $listItem.find( ".btn-bidx-send");
                $matchBtn.removeClass('btn-success').addClass('disabled btn-info').i18nText("btnRequestRejectedByMentor");
            break;

            case isRespondRequest:
                filteredRequest =   _.findWhere(    respond
                                                ,   {
                                                        mentorId:   mentorId
                                                    ,   entityId:   parseInt(contextBpId)
                                                    }
                                                );
                initiatorId     =   filteredRequest.initiatorId;
                requestId       =   filteredRequest.requestId;
                actionData  = $("#respond-mentor-action").html().replace(/(<!--)*(-->)*/g, "");
                $listItem.find( '.action' ).empty( ).append( actionData );

                /***************Accept request**************************/
                $acceptBtn   =   $listItem.find( ".btn-bidx-accept");
                hrefMatch   =   $acceptBtn.attr( "data-href" );

                /* 1 Accept Link */
                hrefMatch   =   hrefMatch
                        .replace( /%entityId%/g,    contextBpId )
                        .replace( /%mentorId%/g,    mentorId )
                        .replace( /%requestId%/g,    requestId)
                        ;

                $acceptBtn.attr( "href", hrefMatch );

                /***************Accept request**************************/
                $matchBtn   =   $listItem.find( ".btn-bidx-ignore");
                hrefMatch   =   $matchBtn.attr( "data-href" );

                /* 2 Ignore Link */
                hrefMatch   =   hrefMatch
                        .replace( /%entityId%/g,    contextBpId )
                        .replace( /%mentorId%/g,    mentorId )
                        .replace( /%requestId%/g,    requestId)
                        ;

                $matchBtn.attr( "href", hrefMatch );
            break;

            case isActiveRequest:
                filteredRequest =   _.findWhere(    active
                                                ,   {
                                                        mentorId:   mentorId
                                                    ,   entityId:   parseInt(contextBpId)
                                                    }
                                                );
                initiatorId     =   filteredRequest.initiatorId;
                requestId       =   filteredRequest.requestId;
                actionData  = $("#active-mentor-action").html().replace(/(<!--)*(-->)*/g, "");
                $listItem.find( '.action' ).empty( ).append( actionData );

                $matchBtn   =   $listItem.find( ".btn-bidx-reject");
                hrefMatch   =   $matchBtn.attr( "data-href" );

                /*************Cancel request*******************/
                hrefMatch   =   hrefMatch
                        .replace( /%requestId%/g,    requestId)
                        .replace( /%entityId%/g,    contextBpId )
                      //  .replace( /%mentorId%/g,    mentorId )
                      //  .replace( /%initiatorId%/g, initiatorId )
                        ;

                $matchBtn.attr( "href", hrefMatch );
            break;

            default:
                actionData  = $("#send-mentor-action").html().replace(/(<!--)*(-->)*/g, "");
                $listItem.find( '.action' ).empty( ).append( actionData );

                $matchBtn   =   $listItem.find( ".btn-bidx-send");
                hrefMatch   =   $matchBtn.attr( "data-href" );

                /*************Send request*******************/
                hrefMatch   =   hrefMatch
                        .replace( /%entityId%/g,    contextBpId )
                        .replace( /%mentorId%/g,    mentorId )
                        .replace( /%initiatorId%/g, loggedInMemberId )
                        ;

                $matchBtn.attr( "href", hrefMatch );
            break;
        }

        return ;
    }

     function _doSearchListing( options )
    {
        var snippet          = $("#mentor-snippet").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty       = $("#empty-mentors").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listError       = $("#error-mentor").html().replace(/(<!--)*(-->)*/g, "")
        ,   loaderSnippet    = $("#load-mentor").html().replace(/(<!--)*(-->)*/g, "")
        ,   response         = options.response
        ,   $list            = $element.find("." + options.list)
        ,   $listMatchList
        ,   emptyVal         = ''
        ,   counter          = 1
        ,   pagerOptions    = {}
        ,   $listItem
        ,   listItem
        ,   mentorId
        ,   memberId
        ,   entityId
        ,   profilePic
        ,   memberProfile
        ,   personalDetails
        ,   contactPicture
        ,   memberCountry
        ,   imageWidth
        ,   imageLeft
        ,   imageTop
        ,   country
        ,   isEntrepreneur
        ,   isMentor
        ,   isInvestor
        ,   countHtml
        ,   isCurrentUserInList
        ,   cbParams        =  {}
        ,   $requestMentoringBtn
        ,   $d              =  $.Deferred()
        ,   responseLength
        ;

        if ( response.docs && response.docs.length )
        {
            // if ( response.totalMembers > currentPage size  --> show paging)
            //
            $list.empty();

            responseLength      = response.docs.length;

            pagerOptions  =
            {
                currentPage:            ( paging.search.offset / tempLimit  + 1 ) // correct for api value which starts with 0
            ,   totalPages:             Math.ceil( response.numFound / tempLimit )
            ,   numberOfPages:          CONSTANTS.NUMBER_OF_PAGES_IN_PAGINATOR
            ,   useBootstrapTooltip:    true

            ,   itemContainerClass:     function ( type, page, current )
                {
                    return ( page === current ) ? "active" : "pointer-cursor";
                }

            ,   onPageClicked:          function( e, originalEvent, type, page )
                {
                    bidx.utils.log("Page Clicked", page);

                    // Force it to scroll to top of the page before the removal and addition of the results
                    //
                    $(document).scrollTop(0);

                    // update internal page counter for businessSummaries
                    //
                    paging.search.offset = ( page - 1 ) * tempLimit;

                    //_showAllView( "loadmatch" );

                     _getMentorMatches(
                    {
                        params  :   {
                                        q           :   options.q
                                    ,   sort        :   options.sort
                                    }
                    ,   cb      :   function()
                                    {
                                        //_hideView( "loadmatch" );
                                        _showAllView( "pager" );
                                        tempLimit = CONSTANTS.SEARCH_LIMIT;
                                    }
                    });
                }
            };

            tempLimit = response.docs.length;

            if( response.numFound )
            {
                /*isCurrentUserInList =   _.findWhere (   response.docs
                                                    ,   {
                                                            ownerId:   loggedInMemberId.toString()
                                                        }
                                                    );
                response.numFound   =   ( !$.isEmptyObject(isCurrentUserInList) ) ? response.numFound - 1 : response.numFound ;*/

                countHtml = bidx.i18n.i( "matchCount", appName ).replace( /%count%/g,  response.numFound);

                $searchPagerContainer.find('.pagerTotal').empty( ).append('<h5>' + countHtml + '</h5>');

                $searchPagerContainer.find('.pagerTotal').empty().append('<h5>' + response.numFound + ' results found</h5>');
            }

            $searchPager.bootstrapPaginator( pagerOptions );

            // create member listitems
            //
            $.each( response.docs, function( idx, item )
            {
                mentorId    = bidx.utils.getValue( item, "ownerId" );

                if( mentorId !== loggedInMemberId.toString() )
                {
                    listItem = loaderSnippet
                                .replace( /%contactId%/g, mentorId );

                    $list.append( listItem );

                    showMemberProfile(
                    {
                        ownerId     :   mentorId
                    ,   callback    :   function ( itemMember, itemMemberId )
                                        {
                                            $listMatchList      =   $list.find('.member' + itemMemberId );

                                            if(itemMember)
                                            {
                                                memberId        =   bidx.utils.getValue( itemMember,        "member.bidxMeta.bidxMemberId" );
                                                memberProfile   =   bidx.utils.getValue( itemMember,        "bidxMemberProfile" );
                                                personalDetails =   bidx.utils.getValue( itemMember,        "bidxMemberProfile.personalDetails" );
                                                profilePic      =   bidx.utils.getValue( personalDetails,   "profilePicture" );
                                                memberCountry   =   bidx.utils.getValue( personalDetails,   "address.0.country");
                                                isEntrepreneur  =   bidx.utils.getValue( itemMember,        "bidxEntrepreneurProfile" );
                                                isInvestor      =   bidx.utils.getValue( itemMember,        "bidxInvestorProfile" );
                                                isMentor        =   bidx.utils.getValue( itemMember,        "bidxMentorProfile" );

                                                /* Profile Picture */
                                                if ( profilePic )
                                                {
                                                    imageWidth  = bidx.utils.getValue( profilePic, "width" );
                                                    imageLeft   = bidx.utils.getValue( profilePic, "left" );
                                                    imageTop    = bidx.utils.getValue( profilePic, "top" );
                                                    contactPicture = '<div class="img-cropper"><img class="media-object" style="width:'+ imageWidth +'px; left:-'+ imageLeft +'px; top:-'+ imageTop +'px;" src="' + profilePic.document + '"></div>';
                                                }
                                                else
                                                {
                                                    contactPicture = "<div class='icons-rounded pull-left'><i class='fa fa-user text-primary-light'></i></div>";
                                                }

                                                /* Member Country */
                                                if(memberCountry)
                                                {

                                                    bidx.data.getItem(memberCountry, 'country', function(err, labelCountry)
                                                    {
                                                        country    =  labelCountry;
                                                    });
                                                }
                                                // duplicate snippet source and replace all placeholders (not every snippet will have all of these placeholders )
                                                //
                                                listItem = snippet
                                                    .replace( /%pictureUrl%/g,          contactPicture )
                                                    .replace( /%contactId%/g,           memberId                 ? memberId : emptyVal )
                                                    .replace( /%contactName%/g,         itemMember.member.displayName               ? itemMember.member.displayName : emptyVal)
                                                    .replace( /%professionalTitle%/g,   personalDetails.professionalTitle   ? personalDetails.professionalTitle     : emptyVal )
                                                    .replace( /%country%/g,             country            ? country   : "" )
                                                    .replace( /%role_entrepreneur%/g,   ( isEntrepreneur )  ? bidx.i18n.i( 'entrepreneur' )    : '' )
                                                    .replace( /%role_investor%/g,       ( isInvestor )      ? bidx.i18n.i( 'investor' )   : '' )
                                                    .replace( /%role_mentor%/g,         ( isMentor )        ? bidx.i18n.i( 'mentor' )   : '' )
                                                    ;



                                                $listItem                = $( listItem );
                                                //$requestMentoringBtn     = $listItem.find( '.btn-mentoring' );

                                                //$requestMentoringBtn.addClass('disabled').i18nText("btnRequestSent");

                                                if( options && options.cb )
                                                {
                                                    // call Callback with current contact item as this scope and pass the current $listitem
                                                    //
                                                    cbParams = {
                                                                    mentorId    : memberId
                                                                };

                                                    options.cb( $listItem,  cbParams );

                                                    $listItem.find( '.viewRequestmentor').show( );
                                                }
                                                //  add mail element to list

                                            } else
                                            {
                                                $listItem = $listError;
                                            }

                                            $listMatchList.empty().append( $listItem );


                                            if( counter === responseLength )
                                            {

                                                $d.resolve( );
                                            }

                                             counter = counter + 1;
                                        }
                    } );
                } else
                {
                    counter = counter + 1;
                }

            });
        }
        else
        {
            $list.empty();

            $list.append($listEmpty);

            _hideView( "pager" );

            $d.resolve( );
        }

        return $d.promise( );


        // execute cb function
        //

    }

    function _getMentorMatches( options )
    {
        var search
        ;

        search = _getSearchCriteria( options.params );

        bidx.api.call(
            "search.get"
        ,   {
                    groupDomain:          bidx.common.groupDomain
                ,   data:                 search.criteria
                ,   success: function( response )
                    {
                        bidx.utils.log("[searchList] retrieved results ", response );
                         _doSearchListing(
                        {
                            response    :   response
                        ,   q           :   search.q
                        ,   sort        :   search.sort
                        ,   criteria    :   search.criteria
                        ,   list        :   'mentor-match-list'
                        ,   cb          :   function( $listItem, params )
                                            {
                                                _getContactsCallback( $listItem, params );
                                            }
                        } )
                        .done(  function(  )
                        {
                            //  execute callback if provided
                            if (response.numFound && options && options.cb)
                            {
                                options.cb(  );
                            }
                        } );

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
                            _showError( "Something went wrong while retrieving the members relationships: " + responseText );
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            _showError( "Something went wrong while retrieving the members relationships: " + responseText );
                        }

                    }
            }
        );
    }

    function _getActiveMentors( options )
    {
            var snippet          = $("#mentor-snippet").html().replace(/(<!--)*(-->)*/g, "")
            ,   $listEmpty       = $("#empty-active-mentors").html().replace(/(<!--)*(-->)*/g, "")
            ,   loaderSnippet    = $("#load-mentor").html().replace(/(<!--)*(-->)*/g, "")
            ,   actionData       = $("#active-mentor-action").html().replace(/(<!--)*(-->)*/g, "")
            ,   $list            = $element.find("." + options.list)
            ,   emptyVal         = ''
            ,   counter          = 1
            ,   $listItem
            ,   listItem
            ,   mentorId
            ,   memberId
            ,   entityId
            ,   profilePic
            ,   memberProfile
            ,   personalDetails
            ,   contactPicture
            ,   memberCountry
            ,   imageWidth
            ,   imageLeft
            ,   imageTop
            ,   country
            ,   isEntrepreneur
            ,   isMentor
            ,   isInvestor
            ,   cbParams        =  {}
            ,   $d              =  $.Deferred()
            ,   responseLength
            ;

            bidx.api.call(
                "mentorRelationships.get"
            ,   {
                    id:              loggedInMemberId
                ,   groupDomain:     bidx.common.groupDomain
                ,   success: function( response )
                    {
                        $list.empty();

                        if ( response && response.length )

                        {
                            active  =   [];
                            wait    =   [];
                            respond =   [];

                            $.each( response , function ( idx, itemResponse)
                            {
                                //Cast to string for comparison
                                entityId = itemResponse.entityId.toString();

                                if( entityId === bidxConfig.context.competitionSummaryId )
                                {
                                    if ( ( itemResponse.status  === 'accepted' ) &&
                                         ( itemResponse.mentorId    !== loggedInMemberId )
                                         )
                                    {

                                        active.push( itemResponse );
                                    }
                                    else if ( ( itemResponse.status      === 'requested' ) &&
                                         ( itemResponse.mentorId    !== loggedInMemberId ) &&
                                         ( itemResponse.initiatorId === loggedInMemberId ) )
                                    {

                                        wait.push( itemResponse );
                                    }
                                    else if( ( itemResponse.status      === 'requested' ) &&
                                             ( itemResponse.mentorId    !== loggedInMemberId ) &&
                                             ( itemResponse.initiatorId !== loggedInMemberId ) )
                                    {

                                        respond.push( itemResponse );
                                    }
                                    else if( ( itemResponse.status      === 'rejected' ) &&
                                             ( itemResponse.mentorId    !== loggedInMemberId ) &&
                                             ( itemResponse.initiatorId !== loggedInMemberId ) )
                                    {

                                        rejectByEntrepreneur.push( itemResponse );
                                    }
                                    else if( ( itemResponse.status      === 'rejected' ) &&
                                             ( itemResponse.mentorId    !== loggedInMemberId ) &&
                                             ( itemResponse.initiatorId === loggedInMemberId ) )
                                    {

                                        rejectByMentor.push( itemResponse );
                                    }
                                }
                            });

                            responseLength = active.length;

                            if( responseLength )
                            {

                                $.each( active , function ( idx, item)
                                {
                                    mentorId    = bidx.utils.getValue( item, "mentorId" );

                                     listItem = loaderSnippet
                                                .replace( /%contactId%/g, mentorId );

                                     $list.append( listItem );

                                     showMemberProfile(
                                    {
                                        ownerId     :   mentorId
                                     ,  callback    :   function ( itemMember, itemMemberId )
                                                        {
                                                            if(itemMember)
                                                            {
                                                                memberId        =   bidx.utils.getValue( itemMember, "member.bidxMeta.bidxMemberId" );
                                                                memberProfile   =   bidx.utils.getValue( itemMember, "bidxMemberProfile" );
                                                                personalDetails =   bidx.utils.getValue( itemMember, "bidxMemberProfile.personalDetails" );
                                                                profilePic      =   bidx.utils.getValue( personalDetails, "profilePicture" );
                                                                memberCountry   =   bidx.utils.getValue( personalDetails, "address.0.country");
                                                                isEntrepreneur   = bidx.utils.getValue( itemMember, "bidxEntrepreneurProfile" );
                                                                isInvestor       = bidx.utils.getValue( itemMember, "bidxInvestorProfile" );
                                                                isMentor         = bidx.utils.getValue( itemMember, "bidxMentorProfile" );

                                                                /* Profile Picture */
                                                                if ( profilePic )
                                                                {
                                                                    imageWidth  = bidx.utils.getValue( profilePic, "width" );
                                                                    imageLeft   = bidx.utils.getValue( profilePic, "left" );
                                                                    imageTop    = bidx.utils.getValue( profilePic, "top" );
                                                                    contactPicture = '<div class="img-cropper"><img class="media-object" style="width:'+ imageWidth +'px; left:-'+ imageLeft +'px; top:-'+ imageTop +'px;" src="' + profilePic.document + '"></div>';
                                                                }
                                                                else
                                                                {
                                                                    contactPicture = "<div class='icons-rounded pull-left'><i class='fa fa-user text-primary-light'></i></div>";
                                                                }

                                                                /* Member Country */
                                                                if(memberCountry)
                                                                {

                                                                    bidx.data.getItem(memberCountry, 'country', function(err, labelCountry)
                                                                    {
                                                                        country    =  labelCountry;
                                                                    });
                                                                }
                                                                // duplicate snippet source and replace all placeholders (not every snippet will have all of these placeholders )
                                                                //
                                                                listItem = snippet
                                                                    .replace( /%pictureUrl%/g,          contactPicture )
                                                                    .replace( /%contactId%/g,           memberId                 ? memberId : emptyVal )
                                                                    .replace( /%contactName%/g,         itemMember.member.displayName               ? itemMember.member.displayName : emptyVal)
                                                                    .replace( /%professionalTitle%/g,   personalDetails.professionalTitle   ? personalDetails.professionalTitle     : emptyVal )
                                                                    .replace( /%country%/g,             country            ? country   : "" )
                                                                    .replace( /%role_entrepreneur%/g,   ( isEntrepreneur )  ? bidx.i18n.i( 'entrepreneur' )    : '' )
                                                                    .replace( /%role_investor%/g,       ( isInvestor )      ? bidx.i18n.i( 'investor' )   : '' )
                                                                    .replace( /%role_mentor%/g,         ( isMentor )        ? bidx.i18n.i( 'mentor' )   : '' )
                                                                    .replace( /%action%/g,   actionData)
                                                                ;

                                                                $listItem = $( listItem );

                                                                if( options && options.cb )
                                                                {
                                                                    cbParams = {
                                                                                    mentorId:           memberId
                                                                                ,   isActiveRequest:    true
                                                                                ,   requestId:          item.requestId
                                                                                };

                                                                    options.cb( $listItem,  cbParams );

                                                                    $listItem.find( '.viewRequestmentor').show( );
                                                                }
                                                                //  add mail element to list

                                                            }

                                                            $list.find('.member' + memberId ).empty().append( $listItem );

                                                            if( counter === responseLength )
                                                            {

                                                                $d.resolve( );
                                                            }

                                                             counter = counter + 1;
                                                        }
                                    } );
                                });
                            }
                            else
                            {
                                $list.append($listEmpty);

                                $d.resolve( );
                            }
                        }
                        else
                        {
                            $list.append($listEmpty);

                            $d.resolve( );
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

                         _showError("Something went wrong while retrieving contactlist of the member: " + status);

                         //  execute callback if provided
                        if (options && options.callback)
                        {
                            options.callback();
                        }
                    }
                }
            );
        return $d;

    }



    // This is the startpoint for the edit state
    //
    function _init( state )
    {
        // Reset any state
        //


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
                    _getMentorRequests( );
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

    // Retrieve the list of companies of the currently logged in user
    //
    // @returns promise
    //
    function _getCompanies()
    {
        var $d = $.Deferred();

        // Fetch the business summary
        //
        bidx.api.call(

            "memberCompanies.fetch"
        ,   {
                memberId:           bidx.common.getCurrentUserId()
            ,   groupDomain:        bidx.common.groupDomain

            ,   success: function( response )
                {
                    bidx.utils.log( "[Member Companies] fetch", competitionSummaryId, response );

                    companies = response;

                    $d.resolve();
                }
            ,   error:          function( jqXhr, textStatus )
                {
                    var status  = bidx.utils.getValue( jqXhr, "status" ) || textStatus
                    ,   msg     = "Something went wrong while retrieving the companies: " + status
                    ,   error   = new Error( msg )
                    ;

                    _showError( msg );

                    $d.reject( error );
                }
            }
        );

        return $d;
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

        if ( competitionSummary.stageBusiness )
        {
            competitionSummary.stageBusiness = competitionSummary.stageBusiness.toLowerCase();
        }

        // PM-187: Create call should set the periodStartDate to the first januari of the year the businessummary is created
        //
        if ( state === "create" )
        {
            competitionSummary.periodStartDate = bidx.common.getNow().getFullYear() + "-01-01";
        }

        // Make sure the entitytype is set correctly, probably only needed for 'create'
        //
        bidx.utils.setValue( competitionSummary, "bidxMeta.bidxEntityType", "bidxcompetitionSummary" );

        bidx.common.notifySave();

        // Save the data to the API
        //
        bidx.api.call(
            "competitionSummary.save"
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
                    var url = currentLanguage + "/competitionSummary/" + competitionSummaryId + "?rs=true";

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


                if( !cancel )
                {
                    _showAllView( "mentor" );

                    _getActiveMentors(
                    {
                        list:   'mentor-active-list'
                    ,   cb:     function( $listItem, params )
                                {
                                    _getContactsCallback( $listItem, params );
                                }
                    });

                    if( competitionSummaryId )
                    {
                        _showAllView( "matchingmentors" );
                         _getMentorMatches(
                        {
                            list:   'mentor-match-list'
                        ,   cb  :   function ( )
                                    {
                                        _showAllView( "pager" );
                                    }
                        });
                    }
                }

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
