( function( $ )
{
    var $element                    = $( "#editEntrepreneur" )
    ,   $views                      = $element.find( ".view" )
    ,   $editForm                   = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets                   = $element.find( ".snippets" )

    ,   $attachments                = $editForm.find( ".attachments" )

    ,   $btnAddPreviousBusiness     = $editForm.find( "[href$='#addPreviousBusiness']" )
    ,   $previousBusinessContainer  = $editForm.find( ".previousBusinessContainer" )

    ,   $cvContainer                = $editForm.find( ".cvContainer" )

    ,   $toggles                    = $element.find( ".toggle" ).hide()
    ,   $togglePrevRunBusiness      = $element.find( "[name='prevRunBusiness']"      )


        // Since the data is coming from the member API, let's call the variable 'member'
        //
    ,   member
    ,   memberId
    ,   entrepreneurProfileId
    ,   bidx            = window.bidx
    ,   snippets        = {}
    ;

    // Form fields
    //
    var fields =
    {
        _root:
        [
            "summary"
        ,   "focusIndustry"
        ,   "prevRunBusiness"
        ]

    ,   previousBusiness:
        [
            "company"
        ,   "businessOutcome"
        ,   "webSite"
        ]
    };

    var focusIndustryOptions =
    [
        {
        "value" : "agriFood",
        "label" : "Agriculture and food"
      }, {
        "value" : "utilities.biogas",
        "label" : "Biogas"
      }, {
        "value" : "manufacturing.chemical",
        "label" : "Chemical"
      }, {
        "value" : "services.cultureMedia",
        "label" : "Culture media"
      }, {
        "value" : "agriFood.distribution",
        "label" : "Distribution"
      }, {
        "value" : "services.education",
        "label" : "Education"
      }, {
        "value" : "manufacturing.electronics",
        "label" : "Electronics"
      }, {
        "value" : "utilities.energyDistribution",
        "label" : "Energy distribution"
      }, {
        "value" : "utilities.energyStorage",
        "label" : "Energy storage"
      }, {
        "value" : "manufacturing.equipement",
        "label" : "Equipement"
      }, {
        "value" : "services.finance",
        "label" : "Finance"
      }, {
        "value" : "agriFood.fishery",
        "label" : "Fishery"
      }, {
        "value" : "agriFood.foodProcessing",
        "label" : "Food processing"
      }, {
        "value" : "agriFood.forestry",
        "label" : "Forestry"
      }, {
        "value" : "manufacturing.furniture",
        "label" : "Furniture"
      }, {
        "value" : "ict.hardware",
        "label" : "Hardware"
      }, {
        "value" : "services.healthCare",
        "label" : "Health care"
      }, {
        "value" : "services.housing",
        "label" : "Housing"
      }, {
        "value" : "utilities.hydroEnergy",
        "label" : "Hydro energy"
      }, {
        "value" : "ict",
        "label" : "ICT"
      }, {
        "value" : "services.insurance",
        "label" : "Insurance"
      }, {
        "value" : "utilities.irrigation",
        "label" : "Irrigation"
      }, {
        "value" : "services.legal",
        "label" : "Legal"
      }, {
        "value" : "manufacturing.machinery",
        "label" : "Machinery"
      }, {
        "value" : "manufacturing",
        "label" : "Manufacturing"
      }, {
        "value" : "manufacturing.metal",
        "label" : "Metal"
      }, {
        "value" : "ict.mobile",
        "label" : "Mobile"
      }, {
        "value" : "agriFood.primaryAgriculture",
        "label" : "Primary agriculture"
      }, {
        "value" : "agriFood.dairy",
        "label" : "Primary agriculture"
      }, {
        "value" : "utilities.recycling",
        "label" : "Recycling"
      }, {
        "value" : "services.recycling",
        "label" : "Recycling"
      }, {
        "value" : "manufacturing.recycling",
        "label" : "Recycling"
      }, {
        "value" : "utilities.renewableEnergy",
        "label" : "Renewable energy"
      }, {
        "value" : "services.research",
        "label" : "Research"
      }, {
        "value" : "services.retail",
        "label" : "Retail"
      }, {
        "value" : "utilities.sanitation",
        "label" : "Sanitation"
      }, {
        "value" : "services",
        "label" : "Services"
      }, {
        "value" : "ict.services",
        "label" : "Services"
      }, {
        "value" : "ict.software",
        "label" : "Software"
      }, {
        "value" : "utilities.solarEnergy",
        "label" : "Solar energy"
      }, {
        "value" : "agriFood.storage",
        "label" : "Storage"
      }, {
        "value" : "manufacturing.textiles",
        "label" : "Textiles"
      }, {
        "value" : "services.tourism",
        "label" : "Tourism"
      }, {
        "value" : "services.transport",
        "label" : "Transport"
      }, {
        "value" : "utilities",
        "label" : "Utilities"
      }, {
        "value" : "utilities.waste",
        "label" : "Waste"
      }, {
        "value" : "utilities.water",
        "label" : "Water"
      }, {
        "value" : "services.wholesale",
        "label" : "Wholesale"
      }, {
        "value" : "utilities.windEnergy",
        "label" : "Wind energy"
      }
    ];

    var businessOutcomeOptions =
    [
        {
            "value" : "stillInvolved",
            "label" : "I am still involved with the company"
          }, {
            "value" : "leftCompany",
            "label" : "I left the company"
          }, {
            "value" : "soldCompany",
            "label" : "I sold the company"
          }, {
            "value" : "dissolvedCompany",
            "label" : "The company was dissolved"
          }, {
            "value" : "companyBankrupt",
            "label" : "The company went bankrupt"
          }
    ];

    // Grab the snippets from the DOM
    //
    snippets.$attachment        = $snippets.children( ".attachmentItem"         ).remove();
    snippets.$previousBusiness  = $snippets.children( ".previousBusinessItem"   ).remove();


    // Populate the dropdowns with the values, TODO: fetch the options from the server
    //
    var $focusIndustry = $editForm.find( "[name='focusIndustry']" );
    $focusIndustry.append( $( "<option value='' />" ).text( "Select your focus industry" ));

    $.each( focusIndustryOptions, function( i, option )
    {
        var $option = $(
            "<option />"
        ,   {
                value:      option.value
            }
        ).text( option.label );

        $focusIndustry.append( $option );
    } );

    var $businessOutcome = snippets.$previousBusiness.find( "[name='businessOutcome']" );
    $businessOutcome.append( $( "<option value='' />" ).text( "Select the outcome of this business" ));

    $.each( businessOutcomeOptions, function( i, option )
    {
        var $option = $(
            "<option />"
        ,   {
                value:      option.value
            }
        ).text( option.label );

        $businessOutcome.append( $option );
    } );


    // Disable disabled links
    //
    $element.delegate( "a.disabled", "click", function( e )
    {
        e.preventDefault();
    } );

    // Update the UI to show the input / previous run business'
    //
    $togglePrevRunBusiness.change( function()
    {
        var value   = $togglePrevRunBusiness.filter( "[checked]" ).val()
        ,   fn      = value === "true" ? "show" : "hide"
        ;

        $toggles.filter( ".togglePrevRunBusiness" )[ fn ]();
    } );

    // Wire up the delete button for the previous busienss. Since this is a dynamic built up list we are delegating it
    //
    $previousBusinessContainer.delegate( "[href$=#removePreviousBusiness]", "click", function( e )
    {
        e.preventDefault();

        var $btn                    = $( this )
        ,   $previousBusinessItem   = $btn.closest( ".previousBusinessItem" )
        ;

        $previousBusinessItem.remove();
    } );

    // Add the snippet for another run business
    //
    var _addPreviousBusiness = function( index, previousBusiness )
    {
        if ( !index )
        {
            index = $previousBusinessContainer.find( ".previousBusinessItem" ).length;
        }

        var $previousBusiness = snippets.$previousBusiness.clone()
        ,   inputNamePrefix = "previousBusiness[" + index + "]"
        ;

        // Update all the input elements and prefix the names with the right index
        // So <input name="bla" /> from the snippet becomes <input name="foo[2].bla" />
        //
        $previousBusiness.find( "input, select, textarea" ).each( function( )
        {
            var $input = $( this );

            $input.prop( "name", inputNamePrefix + "." + $input.prop( "name" ) );
        } );

        if ( previousBusiness )
        {
            $.each( fields.previousBusiness, function( j, f )
            {
                var $input  = $previousBusiness.find( "[name='" + inputNamePrefix + "." + f + "']" )
                ,   value   = bidx.utils.getValue( previousBusiness, f )
                ;

                $input.each( function()
                {
                    bidx.utils.setElementValue( $( this ), value  );
                } );
            } );
        }

        // Find a row that has room or add a new row
        //
        var $rowWithRoom;
        $previousBusinessContainer.children( ".row-fluid" ).each( function( )
        {
            var $row = $( this );

            if ( $row.children().length < 3 )
            {
                $rowWithRoom = $row;
                return false;
            }
        } );

        if ( !$rowWithRoom )
        {
            $rowWithRoom = $( "<div />", { "class": "row-fluid" } );

            $previousBusinessContainer.append( $rowWithRoom );
        }

        $rowWithRoom.append( $previousBusiness );
    };

    // Add an empty previous business block
    //
    $btnAddPreviousBusiness.click( function( e )
    {
        e.preventDefault();

        _addPreviousBusiness();
    } );


    // Add the CV to the screen (or show the 'there is no cv')
    //
    var _addCVToScreen = function( attachment )
    {
        var $hasCV              = $cvContainer.find( ".hasCV" )
        ,   $noCV               = $cvContainer.find( ".noCV" )
        ,   uploadedDateTime
        ,   imageSrc
        ;

        if ( !attachment )
        {
            $hasCV.hide();
            $noCV.show();
        }
        else
        {
            uploadedDateTime    = bidx.utils.parseTimestampToDateStr( attachment.uploadedDateTime );

            $hasCV.find( ".documentName"       ).text( attachment.documentName );
            $hasCV.find( ".uploadedDateTime"   ).text( uploadedDateTime );

            $hasCV.find( ".documentLink" ).attr( "href", attachment.document );

            $hasCV.show();
            $noCV.hide();
        }
    };


    // Use the retrieved member object to populate the form and other screen elements
    //
    var _populateScreen = function()
    {
        // Start by setting the toggles false, will switch to true if needed
        //
        $togglePrevRunBusiness.filter( "[value='false']" ).prop( "checked", true );

        $.each( fields._root, function( i, f )
        {
            var $input  = $editForm.find( "[name='" + f + "']" )
            ,   value   = bidx.utils.getValue( member, "bidxEntrepreneurProfile." + f )
            ;

            $input.each( function()
            {
                bidx.utils.setElementValue( $( this ), value );
            } );
        } );

        // Setup the hidden fields used in the file upload
        //
        $editForm.find( "[name='domain']"                   ).val( bidx.common.groupDomain );
        $editForm.find( "[name='entrepreneurProfileId']"    ).val( entrepreneurProfileId );

        // Now the nested objects
        //
        var previousBusiness = bidx.utils.getValue( member, "bidxEntrepreneurProfile.previousBusiness", true );

        if ( previousBusiness )
        {
            $.each( previousBusiness, function( i, item )
            {
                _addPreviousBusiness( i, item );
            } );
        }

        _addCVToScreen( bidx.utils.getValue( member, "bidxEntrepreneurProfile.cv" ) );

        // Attachments
        //
        var attachments         = bidx.utils.getValue( member, "bidxEntrepreneurProfile.attachment", true );

        if ( attachments)
        {
            $.each( attachments, function( idx, attachment )
            {
                bidx.utils.log( "attachment", attachment );
                _addAttachmentToScreen( attachment );
            } );
        }

        // Fire of the toggle controls so the UI get's updated to it's current values
        //
        $togglePrevRunBusiness.trigger( "change" );

        if ( $.isFunction( $togglePrevRunBusiness.radio ))
        {
            $togglePrevRunBusiness.filter( ":checked" ).radio( "setState" );
        }
    };

    // Add the attachment to the screen, by cloning the snippet and populating it
    //
    var _addAttachmentToScreen = function( attachment )
    {
        if ( attachment === null )
        {
            bidx.util.warn( "entrepreneurprofile::_addAttachmentToScreen: attachment is null!" );
            return;
        }


        var $attachmentList     = $attachments.find( ".attachmentList" )
        ,   $attachment         = snippets.$attachment.clone()

        ,   uploadedDateTime    = bidx.utils.parseTimestampToDateStr( attachment.uploadedDateTime )
        ,   imageSrc
        ;

        $attachment.data( "attachment", attachment );

        $attachment.find( ".documentName"       ).text( attachment.documentName );
        $attachment.find( ".uploadedDateTime"   ).text( uploadedDateTime );

        imageSrc =  attachment.mimeType.match( /^image/ )
            ? attachment.document
            : "/wp-content/plugins/bidx-plugin/static/img/iconViewDocument.png";

        $attachment.find( ".documentImage" ).attr( "src", imageSrc );

        $attachment.find( ".documentLink" ).attr( "href", attachment.document );

        $attachmentList.append( $attachment );
    };


    // Convert the form values back into the member object
    //
    var _getFormValues = function()
    {
        $.each( fields._root, function( i, f )
        {
            var $input  = $editForm.find( "[name='" + f + "']" )
            ,   value   = bidx.utils.getElementValue( $input )
            ;

            bidx.utils.setValue( member, "bidxEntrepreneurProfile." + f, value );
        } );

        // Collect the nested objects
        // !! only written to handle nested objects that are arrays !!
        //
        var nest        = "previousBusiness"
        ,   i           = 0
        ,   count       = $editForm.find( ".previousBusinessItem" ).length
        ,   memberPath  = "bidxEntrepreneurProfile." + nest
        ,   item        = bidx.utils.getValue( member, memberPath, true )
        ;

        // Property not existing? Add it as an empty array holding an empty object
        //
        if ( !item )
        {
            item = [ {} ];
            bidx.utils.setValue( member, memberPath, item );
        }

        for ( i = 0; i < count; i++ )
        {
            if ( !item[ i ] )
            {
                item[ i ] = {};
            }

            $.each( fields[ nest ], function( j, f )
            {
                var inputPath   = nest + "[" + i + "]." + f
                ,   $input      = $editForm.find( "[name='" + inputPath + "']" )
                ,   value       = bidx.utils.getElementValue( $input )
                ;

                bidx.utils.setValue( item[ i ], f, value );
            } );
        }
    };

    // This is the startpoint
    //
    var _init = function()
    {
        // Reset any state
        //
        $previousBusinessContainer.empty();
        $cvContainer.find( ".noCV"  ).hide();
        $cvContainer.find( ".hasCV" ).hide();



        // Inject the save and button into the controls
        //
        var $btnSave    = $( "<a />", { class: "btn btn-primary disabled", href: "#save"    })
        ,   $btnCancel  = $( "<a />", { class: "btn btn-primary disabled", href: "#cancel"  })
        ;

        $btnSave.text( "Save profile" );
        $btnCancel.text( "Cancel" );

        bidx.controller.addControlButtons( [ $btnSave, $btnCancel ] );

        // Wire the submit button which can be anywhere in the DOM
        //
        $btnSave.click( function( e )
        {
            e.preventDefault();

            $editForm.submit();
        } );

        // Setup form
        //
        $editForm.form(
        {
            errorClass:     'error'
        ,   enablePlugins:  [ 'fileUpload' ]
        } );

        $editForm.submit( function( e )
        {
            e.preventDefault();

            var valid = $editForm.form( "validateForm" );

            if ( !valid || $btnSave.hasClass( "disabled" ) )
            {
                return;
            }

            $btnSave.addClass( "disabled" );
            $btnCancel.addClass( "disabled" );

            _save(
            {
                error: function()
                {
                    alert( "Something went wrong during save" );

                    $btnSave.removeClass( "disabled" );
                    $btnCancel.removeClass( "disabled" );
                }
            } );
        } );

        // Attachments
        //
        $attachments.delegate( "a[href$=#deleteAttachment]", "click", function( e )
        {
            e.preventDefault();

            var $btn            = $( this )
            ,   $attachment     = $btn.closest( ".attachmentItem" )
            ,   attachment      = $attachment.data( "attachment" )
            ,   documentId      = attachment.bidxEntityId
            ;

            if ( $btn.hasClass( "disabled" ))
            {
                return;
            }

            $btn.addClass( ".disabled" );

            bidx.api.call(
                "entityDocument.destroy"
            ,   {
                    entityId:           entrepreneurProfileId
                ,   documentId:         documentId
                ,   groupDomain:        bidx.common.groupDomain
                ,   success:            function( response )
                    {
                        bidx.utils.log( "bidx::entityDocument::destroy::success", response );

                        $attachment.remove();
                    }
                ,   error:            function( jqXhr, textStatus )
                    {
                        bidx.utils.log( "bidx::entityDocument::destroy::error", jqXhr, textStatus );

                        alert( "Problems deleting attachment" );

                        $btn.removeClass( ".disabled" );
                    }
                }
            );
        } );

        // Fetch the member
        //
        bidx.api.call(
            "member.fetch"
        ,   {
                memberId:       memberId
            ,   groupDomain:    bidx.common.groupDomain
            ,   success:        function( response )
                {
                    member = response;

                    // Set the global (for this app) entrepeneurProfileId for convenience reasons
                    //
                    entrepreneurProfileId = bidx.utils.getValue( member, "bidxEntrepreneurProfile.bidxEntityId" );

                    bidx.utils.log( "bidx::member", member );

                    _populateScreen();

                    $btnSave.removeClass( "disabled" );
                    $btnCancel.removeClass( "disabled" );

                    _showView( "edit" );

                }
            ,   error:          function( jqXhr, textStatus )
                {
                    var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                    _showError( "Something went wrong while retrieving the member: " + status );
                }
            }
        );
    };

    // Try to save the member to the API
    //
    var _save = function( params )
    {
        if ( !member )
        {
            return;
        }

        // Inform the API we are updating the member profile
        //
        member.bidxEntityType = "bidxEntrepreneurProfile";

        // Update the member object
        //
        _getFormValues();

        bidx.api.call(
            "member.save"
        ,   {
                memberId:       memberId
            ,   groupDomain:    bidx.common.groupDomain
            ,   data:           member.bidxEntrepreneurProfile
            ,   success:        function( response )
                {
                    bidx.utils.log( "member.save::success::response", response );

                    var url = document.location.href.split( "#" ).shift();

                    document.location.href = url;
                }
            ,   error:          function( jqXhr )
                {
                    params.error( jqXhr );
                }
            }
        );
    };

    // Private functions
    //
    var _showError = function( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    };

    var _showView = function( v )
    {
        $views.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();
    };

    // ROUTER
    //
    var state;


    var navigate = function( requestedState, section, id, cb )
    {
        switch ( requestedState )
        {
            case "edit":
                bidx.utils.log( "EditEntrepreneur::AppRouter::edit", id, section );

                var updateHash      = false
                ,   isId            = ( id && id.match( /^\d+$/ ) )
                ;

                if ( id && !isId )
                {
                    section = id;
                    id      = memberId;

                    updateHash = true;
                }

                // No memberId set yet and not one explicitly provided? Use the one from the session
                //
                if ( !memberId && !isId )
                {
                    id = bidx.utils.getValue( bidxConfig, "session.id" );

                    updateHash = true;
                }

                if ( !( state === "edit" && id === memberId ) )
                {
                    memberId                = id;
                    entrepreneurProfileId   = null;
                    state                   = "edit";

                    $element.show();
                    _showView( "load" );

                    _init();
                }

                if ( updateHash )
                {
                    var hash = "editMember/" + id;

                    if ( section )
                    {
                         hash += "/" + section;
                    }

                    return hash;
                }

            break;
        }
    };


    var attachmentUploadDone = function( err, result )
    {
        bidx.utils.log( "attachmentUploadDone", err, result );

        if ( err )
        {
            alert( "Problem uploading attachment" );
        }
        else
        {
            _addAttachmentToScreen( result.data );

            // Clear the input by cloneing it
            //
            var $input = result.el;

            $input.replaceWith( $input.clone( true ) );
        }
    };

    var cvUploadDone = function( err, result )
    {
        bidx.utils.log( "cvUploadDone", err, result );

        if ( err )
        {
            alert( "Problem uploading attachment" );
        }
        else
        {
            _addCVToScreen( result.data );

            // Clear the input by cloneing it
            //
            var $input = result.el;

            $input.replaceWith( $input.clone( true ) );
        }
    };

    var reset = function()
    {
        state = null;
    };

    // Expose
    //
    var entrepreneurprofile =
    {
        attachmentUploadDone:       attachmentUploadDone
    ,   cvUploadDone:               cvUploadDone
    ,   navigate:                   navigate
    ,   reset:                      reset

    ,   $element:                   $element

        // START DEV API
        //

        // END DEV API
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.entrepreneurprofile = entrepreneurprofile;
} ( jQuery ));
