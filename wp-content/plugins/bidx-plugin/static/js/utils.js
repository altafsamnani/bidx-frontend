(function( $ )
{
    var months = [ "January", "Februari", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

    // Normalize some input into the best possible / guessable form of a linkedin profile url
    //
    function normalizeLinkedInUrl( input )
    {
        var result = input;

        // Did we only get a username?
        //
        if ( /^[a-z0-9]{5,30}$/i.test( input ) )
        {
            result = "https://www.linkedin.com/in/" + input;
        }
        else if ( !/^http(s?):\/\//i.test( input ))
        {
            result = "https://" + input;
        }

        return result;
    }

    // Convenience function for populating a <select />
    //
    var populateDropdown = function( $el, values )
    {
        if ( !values || $.type( values ) !== "array" )
        {
            return;
        }

        $.each( values, function( i, option )
        {
            var $option = $(
                "<option />"
            ,   {
                    value:      option.value
                }
            ).text( option.label );

            $el.append( $option );
        } );
    };

    // Convenience function for merging back in the values of a nested structure
    // into an API retrieved object from a form
    //
    var setNestedStructure = function( obj, count, nest, $container, fields  )
    {
        var i
        ,   inputPathPrefix = nest
        ;

        if ( $.isArray( obj ))
        {
            for ( i = 0; i < count; i++ )
            {
                inputPathPrefix = nest + "[" + i + "]";

                if ( !obj[ i ] )
                {
                    obj[ i ] = {};
                }

                _itterateFieldsForItem( obj[ i ] );
            }
        }
        else
        {
            inputPathPrefix = nest;

            // Find the wrapper of this object
            //
            _itterateFieldsForItem( obj );
        }


        function _itterateFieldsForItem( item )
        {
            var containerDataRetrieved = false;

            $.each( fields, function( j, f )
            {
                // TODO: make properly recursive, only one layer of nested-nested objects now
                //
                if ( $.type( f ) === "object" )
                {
                    $.each( f, function( k, v )
                    {
                        var inputPath   = inputPathPrefix + "." + k
                        ,   isArray     = false
                        ,   myItem      = item
                        ;

                        // Is it an array?
                        //
                        var fieldPathParts = k.match( /([.\w]+)\[(\d+)\]/ );

                        if ( fieldPathParts )
                        {
                            isArray     = true;
                            myItem      = bidx.utils.getValue( item, fieldPathParts[ 1 ], true );

                            if ( !myItem )
                            {
                                myItem = [ {} ];
                                bidx.utils.setValue( item, fieldPathParts[ 1 ], myItem );
                            }
                        }

                        $.each( v, function( j, f )
                        {
                            var $input      = $container.find( "[name='" + inputPath + "." + f + "']" )
                            ,   value       = bidx.utils.getElementValue( $input )
                            ;

                            if ( !containerDataRetrieved && $input.length )
                            {
                                $.extend( item, $input.closest( "." + ( nest.split( "." ).pop() ) + "Item" ).data( "bidxData" ) );
                                containerDataRetrieved = true;
                            }

                            if ( isArray )
                            {
                                // TODO: itterate, but index 0 is ok'ish for now
                                //
                                bidx.utils.setValue( myItem[ 0 ], f, value );
                            }
                            else
                            {
                                bidx.utils.setValue( myItem, k + "." + f, value );
                            }
                        } );
                    } );
                }
                else
                {
                    var inputPath   = inputPathPrefix + "." + f
                    ,   $input      = $container.find( "[name='" + inputPath + "']" )
                    ,   value       = bidx.utils.getElementValue( $input )
                    ;

                    if ( !containerDataRetrieved && $input.length )
                    {
                        $.extend( item, $input.closest( "." + ( nest.split( "." ).pop() ) + "Item" ).data( "bidxData" ) );
                        containerDataRetrieved = true;
                    }

                    bidx.utils.setValue( item, f, value );
                }
            } );
        }

    };

    // Set the value of an form element. All the funky / special component handling is done here.
    //
    var setElementValue = function( $el, value )
    {
        var elType      = $el.attr( 'type' )
        ,   dataType    = $el.attr( 'data-type' )
        ,   dateObj
        ;

        // Convert booleans to their string versions
        //
        if ( value === true )
        {
            value = "true";
        }
        else if ( value === false )
        {
            value = "false";
        }

        // When an data-type is defined on the HTML that has presendence over the handling of regular form inputs
        //
        if ( dataType === "date" )
        {
            if ( value )
            {
                dateObj = parseISODate( value );

                value = dateObj.d + " " + months[ dateObj.m - 1 ] + " " + dateObj.y;
                $el.val( value );
            }
        }
        else if ( dataType === "tagsinput" )
        {
            if ( value )
            {
                $el.tagsinput( "setValues", value );
            }
        }
        else if ( $el.hasClass( "btn-group" ))
        {
            // Value should be an array
            //
            if ( !$.isArray( value ) && typeof value !== "undefined" )
            {
                value = [ value ];
            }

            if ( value )
            {
                $.each( value, function( idx, v )
                {
                    var $button = $el.find( "[value='" + v + "']" );

                    $button.addClass( "active" );
                } );
            }
        }
        else
        {
            // Regular form inputs
            //
            if ( elType )
            {
                switch( elType )
                {
                    case 'radio':
                        if ( $el.val() === value )
                        {
                            if ( $el.data( "radio" ) )
                            {
                                $el.filter( "[value='" + value + "']" ).radio( "check" );
                            }
                            else
                            {
                                $el.click();
                            }
                        }
                        else if ( typeof value !== "undefined" && value !== "" )
                        {
                            // noop
                        }
                    break;

                    case 'checkbox':
                        $el.each( function()
                        {
                            var $this = $( this );

                            // If the checkbox plugin is used, use that to uncheck, otherwise just the native property
                            //
                            if ( $this.data( "checkbox" ) )
                            {
                                $this.checkbox( "uncheck" );
                            }
                            else
                            {
                                $this.prop( "checked", false );
                            }
                        } );

                        if ( $.type( value ) === "array" )
                        {
                            $.each( value, function( idx, v )
                            {
                                $el.filter( "[value='" + v + "']" ).checkbox( "check" );
                            } );
                        }
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
        }
    };

    // Get the values back from the input element
    //
    var getElementValue = function( $input )
    {
        var values
        ,   value
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
                    value   = getISODate( date );
                }
            break;

            case 'tagsinput':
                values = $input.tagsinput( "getValues" );

                value = $.map(
                    values
                ,   function( v )
                    {
                        return $.type( v ) === "object" ? v.value : v;
                    }
                );

            break;

            default:

                if ( $input.hasClass( "btn-group" ) )
                {
                    var toggleType = $input.data( "toggle" );

                    if ( toggleType === "buttons-checkbox" )
                    {
                        value = [];
                        $input.find( ".active" ).each( function()
                        {
                            var $btn = $( this );

                            value.push( $btn.attr( "value" ) );
                        } );
                    }
                    else if ( toggleType === "buttons-radio" )
                    {
                        value = $input.find( ".active" ).attr( "value" );
                    }
                }
                else
                {
                    switch ( $input.attr( "type" ) )
                    {
                        case "radio":
                            value = $input.filter( ":checked" ).val();
                        break;

                        case "checkbox":
                            if ( $input.length > 1 )
                            {
                                value = [];

                                $input.each( function()
                                {
                                    var $cb = $( this );

                                    if ( $cb.is( ":checked" ) )
                                    {
                                        value.push( $cb.val() );
                                    }
                                } );
                            }
                            else
                            {
                                value = $input.is( ":checked" ) ? $input.val() : null;
                            }
                        break;

                        default:
                            value = $input.val();
                    }
                }
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

    // Retrieve the value of a specific URL parameter
    //
    var getQueryParameter = function( key, url )
    {
        if ( !url )
        {
            url = document.location.href;
        }

        var baseURL = decodeURI( url.replace( /\+/g, "%20" ) ).split( "#" )[ 0 ]
        ,   parts   = baseURL.split( "?" )
        ,   result
        ,   params
        ,   param
        ,   i
        ;

        if ( parts.length > 1 )
        {
            params = parts[ 1 ].split( "&" );
            for( i = 0; i < params.length; i++ )
            {
                param = params[ i ].split( "=" );
                if ( key === param[ 0 ] )
                {
                    result = decodeURIComponent( param[ 1 ] );
                }
            }
        }

        return result;
    };

    // Get safely a value from a JS object by specifying the property path as
    // a string
    //
    var getValue = function( obj, path, forceArray )
    {
        if ( typeof path === "undefined" || !obj )
        {
            return;
        }

        var aPath = path.split( "." )
        ,   value = obj
        ,   key   = aPath.shift()
        ;

        while( typeof value !== "undefined" && value !== null && key )
        {
            value = value[ key ];
            key   = aPath.shift();
        }
        value = ( 0 === aPath.length ) ? value : undefined;

        if ( !$.isArray( value ) && typeof value !== "undefined" && forceArray )
        {
            value = [ value ];
        }

        return value;
    };

    /**
     * Safely set a JSON value on a certain path, regardless if that path exists or not
     */
    var setValue = function( obj, path, value )
    {
        var aPath   = path.split( "." )
        ,   key     = aPath.shift()
        ,   prevKey
        ;

        while ( key )
        {
            if ( !obj[ key ] )
            {
                obj[ key ] = {};
            }

            prevKey = key;
            key     = aPath.shift();

            if ( key )
            {
                obj     = obj[ prevKey ];
            }
        }

        obj[ prevKey ] = value;
    };

    var getGroupDomain = function()
    {
        return document.location.hostname.split( "." ).shift();
    };

    var getISODate = function( obj )
    {
        var result = "";

        if ( !obj )
        {
            return result;
        }

        var y = obj.getFullYear()
        ,   m = obj.getMonth() + 1
        ,   d = obj.getDate() * 1
        ;

        if ( m < 10 )
        {
            m = "0" + m;
        }

        if ( d < 10 )
        {
            d = "0" + d;
        }

        result += y + "-" + m + "-" + d;

        return result;
    };

    var parseISODate = function( str )
    {
        if ( !str )
        {
            return;
        }

        var obj =
        {
            y:      parseInt( str.substr( 0, 4 ), 10 )
        ,   m:      parseInt( str.substr( 5, 2 ), 10 )
        ,   d:      parseInt( str.substr( 8, 2 ), 10 )
        };

        return obj;
    };

    var parseISODateTime = function( str, format )
    {
        if ( !str )
        {
            return;
        }

        if( !format )
        {
            format = "datetime";
        }

        var obj =
            {
                y:      parseInt( str.substr( 0, 4 ), 10 )
            ,   m:      parseInt( str.substr( 5, 2 ), 10 )
            ,   d:      parseInt( str.substr( 8, 2 ), 10 )
            ,   h:      str.substr( 11,2 )
            ,   n:      str.substr( 14,2 )
            ,   s:      str.substr( 17,2 )
            }
        ,   d      = new Date( obj.y, obj.m, obj.d )
        ,   result
        ;

        switch( format )
        {
            case "date":
                result = d.getDate() + " " + months[ d.getMonth()-1 ] + " " + d.getFullYear();
            break;

            case "time":
                result = obj.h + ":" + obj.n + ":" + obj.s;
            break;

            default:
                result = d.getDate() + " " + months[ d.getMonth()-1 ] + " " + d.getFullYear() + " " + obj.h + ":" + obj.n + ":" + obj.s;
        }

        return result;
    };


    var parseTimestampToDateStr = function( ts )
    {
        if ( !ts )
        {
            return "";
        }

        var d       = new Date( parseInt( ts + "000", 10 ) )
        ,   result  = d.getDate() + " " + months[ d.getMonth()-1 ] + " " + d.getFullYear()
        ;
        return result;
    };

    //  Removes ID(s) from hash string
    var removeIdFromHash = function ( str ){
        var newHash = [];

        $.each( str.split( "/" ), function( idx, item )
        {
            if( !item.match( /^\d+$/ ) )
            {
                newHash.push( item );
            }
            else
            {
                //replace matched ID for empty string so that the / delimeting of the HREF stays consistent
                newHash.push( "" );
            }
        } );

        return newHash.join( "/" );
    };

    //  return view name. Expects v(iew) and optionally a c(lass)
    var getViewName = function ( v, c )
    {
        return ( c ? ( "." + c ) : ".view" ) + v.charAt( 0 ).toUpperCase() + v.substr( 1 );
    };

    var generateId = function()
    {
        return "bidx" + new Date().getTime() + "X" + Math.floor( Math.random() * 10000000 );
    };

    // Make sure the url always starts with a protocol. Use http:// by default
    //
    var prefixUrlWithProtocol = function( url )
    {
        var RE_STARTS_WITH_PROTOCOL = /:\/\//
        ;

        if ( url && !RE_STARTS_WITH_PROTOCOL.test( url ))
        {
            url = "http://" + url;
        }

        return url;
    };

    // Logger functions
    //
    var log = function()
    {
        if ( window[ "console" ] && console[ "log" ] && typeof console.log === "function" )
        {
            console.log.apply( console, arguments );
        }
    };

    var warn = function()
    {
        if ( window[ "console" ] && console[ "warn" ] &&  typeof console.warn === "function" )
        {
            console.warn.apply( console, arguments );
        }
    };

    var error = function()
    {
        if ( window[ "console" ] && console[ "error" ] && typeof console.error === "function" )
        {
            console.error.apply( console, arguments );
        }
    };


    // Exports
    //
    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.utils =
    {
        getQueryParameter:          getQueryParameter
    ,   getValue:                   getValue
    ,   setValue:                   setValue
    ,   getGroupDomain:             getGroupDomain
    ,   getISODate:                 getISODate
    ,   parseISODate:               parseISODate
    ,   parseISODateTime:           parseISODateTime
    ,   parseTimestampToDateStr:    parseTimestampToDateStr
    ,   setElementValue:            setElementValue
    ,   getElementValue:            getElementValue
    ,   populateDropdown:           populateDropdown
    ,   setNestedStructure:         setNestedStructure
    ,   removeIdFromHash:           removeIdFromHash
    ,   getViewName:                getViewName
    ,   generateId:                 generateId
    ,   prefixUrlWithProtocol:      prefixUrlWithProtocol
    ,   normalizeLinkedInUrl:       normalizeLinkedInUrl

    ,   log:                        log
    ,   warn:                       warn
    ,   error:                      error
    };
} ( jQuery ));
