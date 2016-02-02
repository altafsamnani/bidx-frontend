;( function ( $ )
{
    "use strict";

    var $element                    = $( "#expressform" )
    ,   $frmexpressform            = $element.find( "#formexpressform" )
    ,   $industrySectors            = $element.find( "#industrySectors" )
    ,   bidx                        = window.bidx
    ,   appName                     = "expressform"

        // Logo
        //
    ,   $bsLogo                             = $element.find( ".bsLogo" )
    ,   $bsLogoBtn                          = $bsLogo.find( "[href$='#addLogo']" )
    ,   $bsLogoRemoveBtn                    = $bsLogo.find( "[href$='#removeLogo']" )
    ,   $bsLogoModal                        = $bsLogo.find( ".addLogoImage" )
    ,   $logoContainer                      = $bsLogo.find( ".logoContainer" )
    ;


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
        ,   onlyImages:             true
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
                    $logoContainer.addClass( "logoPlaced" ).parent().find( "[href$='#removeLogo']" ).removeClass( "hide" );

                    $bsLogoModal.modal( "hide" );
                }
            }
        });

        $bsLogoModal.modal();
    });

    $bsLogoRemoveBtn.click( function( e )
    {
        e.preventDefault();

        $logoContainer.find( "img" ).remove();
        $logoContainer.html( '<div class="icons-rounded"><i class="fa fa-suitcase text-primary-light"></i></div>' );
        $logoContainer.removeClass( "logoPlaced" ).parent().find( "[href$='#removeLogo']" ).addClass( "hide" );

        //businessSummary.logo = null;
    });


    // private functions
    //
    function _oneTimeSetup()
    {
        $industrySectors.industries();

        $frmexpressform.validate(
        {
            ignore: ""
        ,   debug:  true
        ,   rules:
            {
                "firstName":
                {
                    required:               true
                }
            ,   "lastName":
                {
                    required:               true
                }
            ,   "gender":
                {
                    required:               true
                }
            ,   "phone":
                {
                    required:               true
                }
            ,   "bpname":
                {
                    required:               true
                }
            ,   "description":
                {
                    required:               true
                }
            ,   "city":
                {
                    required:               true
                }
            ,   "financingNeeded":
                {
                    required:               true
                }
            ,   "salesRevenue_2012":
                {
                    required:               true
                }
            ,   "salesRevenue_2013":
                {
                    required:               true
                }
            ,   "salesRevenue_2014":
                {
                    required:               true
                }
            ,   "salesRevenue_2015":
                {
                    required:               true
                }
            ,   "salesRevenue_2016":
                {
                    required:               true
                }
            ,   "employees_2012":
                {
                    required:               true
                }
            ,   "employees_2013":
                {
                    required:               true
                }
            ,   "employees_2014":
                {
                    required:               true
                }
            ,   "employees_2015":
                {
                    required:               true
                }
            ,   "employees_2016":
                {
                    required:               true
                }
            ,   "focusIndustrySector[0]mainSector":
                {
                    required:      true
                }
            ,   "focusIndustrySector[0]subSector":
                {
                    required:      true
                }
            ,   "focusIndustrySector[0]endSector":
                {
                    required:      true
                }
            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
            }
        ,   submitHandler:  function()
            {
                /*
                if ( $btnRegister.hasClass( "disabled" ) )
                {
                    bidx.utils.log("button disabled");
                    return;
                }

                // set button to disabled and set Wait text. We store the current label so we can reset it when an error occurs
                //
                $btnRegister.addClass( "disabled" );
                submitBtnLabel = $btnRegister.text();
                $btnRegister.i18nText("btnPleaseWait");

                _doRegister(
                {
                    error: function( jqXhr )
                    {
                        $btnRegister.removeClass( "disabled" )
                            .text( submitBtnLabel )
                        ;
                    }
                } );
                */
            }
        });
    }

    // Expose
    //
    var app =
    {
        $element:               $element
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.expressform = app;

    // Initialize handlers
    //
    _oneTimeSetup();

    // Only update the hash when user is authenticating and when there is no hash defined
    //
    //if ( ($( "body.bidx-expressform" ).length || $( "body.bidx-sso-authentication" )) && !bidx.utils.getValue( window, "location.hash" ) )
    //{
    //    document.location.hash = "#expressform";
    //}

    // if there is a hash defined in the window scope, nagivate to this has
    //
    if ( bidx.utils.getValue( window, "__bidxHash" ) )
    {
        document.location.hash = window.__bidxHash;
    }

} ( jQuery ));
