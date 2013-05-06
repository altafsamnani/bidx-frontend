$( document ).ready( function()
{
    var $element        = $( "#memberEdit" )
    ,   $views          = $element.find( ".view" )
    ,   $editForm       = $views.filter( ".viewEdit" ).find( "form" )
    ,   member
    ,   memberId
    ,   groupDomain
    ,   bidx            = window.bidx
    ;

    // Form fields
    //
    var fields =
    {
        personalDetails:
        [
            'firstName'
        ,   'lastName'
        ,   'professionalTitle'
        ,   'gender'
        ,   'nationality'

        ,   'dateOfBirth'
        ,   'highestEducation'
        ,   'linkedIn'
        ,   'facebook'
        ,   'emailAddress'
        ,   'skype'
        ,   'twitter'
        ,   'language'
        ,   'motherLanguage'
        ,   'workingLanguage'
        ,   'ratingSpoken'
        ,   'ratingWritten'

        ,   'landline'
        ,   'mobile'
        ,   'fax'
        ]

    ,   address:
        [
            'eTR'
        ,   'street'
        ,   'streetNumber'
        ,   'neighborhood'
        ,   'cityTown'
        ,   'country'
        ,   'postalCode'
        ,   'postBox'
        ,   'coordinates'
        ]

    ,   languageDetail:
        [
            'language'
        ,   'motherLanguage'
        ,   'workingLanguage'
        ,   'ratingSpoken'
        ,   'ratingWritten'
        ]

    ,   contactDetail:
        [
            'landLine'
        ,   'mobile'
        ,   'fax'
        ]
    };

    var _setElementValue = function( $el, value )
    {
        var elType      = $el.attr( 'type' )
        ,   dataType    = $el.attr( 'data-type' )
        ,   dateObj
        ;

        if ( value === true )
        {
            value = "true";
        }
        else if ( value === false )
        {
            value = "false";
        }

        if ( dataType === "date" )
        {
            if ( value )
            {
                dateObj = bidx.utils.parseISODate( value );

                value = dateObj.m + "/" + dateObj.d + "/" + dateObj.y;
                $el.val( value );
            }

        }
        if ( elType )
        {
            switch( elType )
            {
                case 'radio':
                    // bewustte type-coercing for now
                    //
                    if ( $el.val() === value )
                    {
                        $el.prop( 'checked', true );
                    }
                    else
                    {
                        $el.prop( 'checked', false );
                    }
                break;

                case 'checkbox':
                    $el.prop( 'checked', !!value );
                break;

                case 'file':
                break;

                default:
                    $el.val( value || ( value === 0 ? "0" : "" ) );
            }
        }
        else if ( $el.is( 'input' ) || $el.is( 'select' ) || $el.is( 'textarea' ) )
        {
            $el.val( value || ( value === 0 ? '0' : '' ) );
        }
        else
        {
            $el.text( value || ( value === 0 ? '0' : '' ) );
        }
    };

    // Use the retrieved member object to populate the form elements
    //
    var _populateForm = function()
    {
        $.each( fields.personalDetails, function( i, f )
        {
            var $input  = $editForm.find( "[name='personalDetails." + f + "']" )
            ,   value   = bidx.utils.getValue( member, "personalDetails." + f )
            ;

            $input.each( function()
            {
                _setElementValue( $( this ), value );
            } );
        } );

        // Now the nested objects
        //
        $.each( [ "address", "languageDetail", "contactDetail" ], function()
        {
            var nest    = this
            ,   items   = bidx.utils.getValue( member, "personalDetails." + nest, true )
            ;

            $.each( items, function( i, item )
            {
                $.each( fields[ nest ], function( j, f )
                {
                    var $input  = $editForm.find( "[name='personalDetails." + nest + "[" + i + "]." + f + "']" )
                    ,   value   = bidx.utils.getValue( item, f )
                    ;

                    $input.each( function()
                    {
                        _setElementValue( $( this ), value  );
                    } );
                } );
            } );
        } );
    };

    // Convert the form values back into the member object
    //
    var _getFormValues = function()
    {
        var _getElementValue = function( $input )
        {
            var value
            ,   date
            ;

            switch ( $input.attr( 'data-type' ) )
            {
                // We need to get to ISO8601 => yyyy-mm-dd
                //
                case 'date':
                    date    = $input.datepicker( "getDate" );

                    if ( date )
                    {
                        value   = bidx.utils.getISODate( date );
                    }
                break;

                default:
                    value = $input.val();
            }

            if ( value === "true" )
            {
                value = true;
            }
            else if ( value === "false" )
            {
                value = false;
            }

            return value;
        };

        $.each( fields.personalDetails, function( i, f )
        {
            var $input  = $editForm.find( "[name='personalDetails." + f + "']" )
            ,   value   = _getElementValue( $input )
            ;

            bidx.utils.setValue( member, "personalDetails." + f, value );
        } );

        // Collect the nested objects
        //
        // Now the nested objects
        //
        $.each( [ "address", "languageDetail", "contactDetail" ], function()
        {
            var nest    = this
            ,   i       = 0
            ;

            // TODO: make i itterate

            $.each( fields[ nest ], function( j, f )
            {
                var path    = "personalDetails." + nest + "[" + i + "]." + f
                ,   $input  = $editForm.find( "[name='" + path + "']" )
                ,   value   = _getElementValue( $input )
                ;

                var item = bidx.utils.getValue( member, "personalDetails." + nest, true );

                if ( !item[ i ] )
                {
                    item[ i ] = {};
                }

                bidx.utils.setValue( item[ i ], f, value );
            } );
        } );
    };

    // This is the startpoint
    //
    var _init = function()
    {
        memberId    = bidx.utils.getQueryParameter( "memberProfileId" ) || bidx.utils.getValue( bidxConfig, "context.memberProfileId" );
        groupDomain = bidx.utils.getQueryParameter( "bidxGroupDomain" ) || bidx.utils.getGroupDomain();

        if ( !memberId )
        {
            _showError( "No member (profile) id found to be retrieved from API!" );
            return;
        }

        // Setup form
        //
        $editForm.form(
        {
            errorClass:     'error'
        ,   enablePlugins:  [ 'date', 'fileUpload' ]
        } );

        $editForm.submit( function( e )
        {
            e.preventDefault();

            var $btnSubmit = $editForm.find( ".btnSubmit" );

            if ( $btnSubmit.prop( "disbabled" ))
            {
                return;
            }

            $btnSubmit.prop( "disabled", true );

            _save(
            {
                error: function()
                {
                    $btnSubmit.prop( "disabled", false );
                    alert( "Something went wrong during save" );
                }
            } );
        } );

        // Attachments
        //
        var tplAttachment = $element.find( "#template_attachment" ).html().replace( /(<!--)|(-->)/ig, "" )
        ,   $attachments  = $element.find( "fieldset[name=attachments] > .group" )
        ;

        $attachments.append( tplAttachment );
        $attachments.find( ".add" ).on( "click", addSet );

        function addSet( e )
        {
            e.preventDefault();

            var $btnAdd = $( this );
            $btnAdd.after( tplAttachment );
            $btnAdd.remove();

            $attachments.find( ".add" ).on( "click", addSet );
        }

        // Fetch the member
        //
        bidx.api.call(
            "member.fetch"
        ,   {
                memberId:       memberId
            ,   groupDomain:    groupDomain
            ,   success:        function( response )
                {
                    member = response;

                    bidx.utils.log( "bidx::member", member );

                    _populateForm();

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

        // Remove profile picture
        //
        delete member.personalDetails.profilePicture;

        // Force current (0) set to be the current one
        //
        member.personalDetails.contactDetail = [
        {
            "currentContactDetails": true
        }];

        // Update the member object
        //
        _getFormValues();

        bidx.api.call(
            "member.save"
        ,   {
                memberId:       memberId
            ,   groupDomain:    groupDomain
            ,   data:           member
            ,   success:        function( response )
                {
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
    function _showError( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    }

    function _showView( v )
    {
        $views.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();
    }

    // ROUTER
    //
    var $btnEdit    = $( "[href$=#edit]" );

    var AppRouter = Backbone.Router.extend(
    {
        routes: {
            'edit':         'edit'
        ,   '*path':        'show'
        }
    ,   edit:           function()
        {
            $element.show();
            _showView( "load" );

            $btnEdit.hide();

            _init();
        }
    ,   show:           function()
        {
            $element.hide();
            $btnEdit.show();
        }
    } );

    var router = new AppRouter();
    Backbone.history.start();

    // Expose
    //
    var memberprofile =
    {
        // START DEV API
        //

        // END DEV API
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.memberprofile = memberprofile;
} );
