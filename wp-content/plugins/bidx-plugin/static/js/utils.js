(function( $ )
{
    "use strict";
    var iclVars             = window.icl_vars || {}
    ,   currentLanguage     = ( iclVars.current_language ) ? iclVars.current_language : 'en' // get the current language from sitepress if set
    ,   monthsName          = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
    ,   months              = (typeof datepicker === 'function') ? $.fn.datepicker.dates[currentLanguage].months : monthsName  // Coming from bootstrap datepicker[ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

    ;
    //months =
    // Normalize some input into the best possible / guessable form of a linkedin profile url
    //
    function normalizeLinkedInUrl( input )
    {
        var result = input;

        if ( input )
        {
            // Did we only get a username?
            //
            if ( /^[a-z0-9]{5,30}$/i.test( input ) )
            {
                result = "www.linkedin.com/in/" + input;
            }
            else if ( !/^http(s?):\/\//i.test( input ))
            {
                result = "http://" + input;
            }
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
        if ( !$el.length )
        {
            bidx.utils.warn( "bidx.utils.setElementValue, $el doesn't match elements!", $el, value );
            return;
        }

        var elType      = $el.attr( 'type' ) || $el[0].nodeName.toLowerCase()
        ,   dataType    = $el.attr( 'data-type' )
        ,   valueType   = $.type( value )
        ,   dateObj
        ,   date
        ;

        // Type coerce to string since all DOM control values are strings and we will later do a type strict comparison
        //
        if ( valueType === "boolean" || valueType === "number" )
        {
            value += "";
        }

        // When an data-type is defined on the HTML that has presendence over the handling of regular form inputs
        //
        if ( dataType === "date" )
        {
            if ( value )
            {
                dateObj = parseISODate( value );
                date    = new Date( dateObj.y, dateObj.m - 1, dateObj.d );

                $el.datepicker( "setUTCDate", date );
            }
        }
        else if ( dataType === "datetime" )
        {
            if ( value )
            {
                dateObj = parseISODate( value );
                date    = new Date( dateObj.y, dateObj.m - 1, dateObj.d );

                $el.datetimepicker( "setUTCDate", date );
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
                        $el.each( function()
                        {
                            var $this = $( this );

                            if ( $this.val() === value )
                            {
                                if ( $this.data( "radio" ) )
                                {
                                    $this.radio( "check" );
                                }
                                else
                                {
                                    $this.prop( "checked", true ); // Plz set it to false if error occurs somewhere, fixed for competition listing checkboxes
                                }
                            }
                        } );
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
                                var $f = $el.filter( "[value='" + v + "']" );

                                if ( $f.data( "checkbox" ) )
                                {
                                    $f.checkbox( "check" );
                                }
                                else
                                {
                                    $f.prop( "checked", true );
                                }
                            } );
                        }
                    break;

                    case 'select':

                        if ( $.type( value ) === "array" )
                        {
                            $.each( value, function( idx, v )
                            {
                                var $f = $el.find( "[value='" + v + "']" );

                                $f.prop( "selected", true );
                            } );
                        }
                        else
                        {
                            $el
                                .find( "[value='" + value + "']" )
                                .prop( "selected", true )
                            ;
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
                date    = $input.datepicker( "getUTCDate" );

                // BIDX-1620: datepicker returns Invalid date value when nothing is selected, this value will be converted to NaN value by the getIsoDate function
                //
                if ( date instanceof Date && isFinite( date ) )
                {
                    value   = getISODate( date );
                }
                else
                {
                    value = "";
                }

            break;
            case 'datetime':
                date    = $input.datetimepicker( "getUTCDate" );

                // BIDX-1620: datepicker returns Invalid date value when nothing is selected, this value will be converted to NaN value by the getIsoDate function
                //
                if ( date instanceof Date && isFinite( date ) )
                {
                    value   = getISODateTime( date );
                }
                else
                {
                    value = "";
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

        if ( $input.attr( "data-forcearray" ) === "true" && !$.isArray( value ))
        {
            value = [ value ];
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

    // Section: Deparam (from string)
    // Borrowed from: https://github.com/cowboy/jquery-bbq/blob/master/jquery.ba-bbq.js
    //
    // Method: jQuery.deparam
    //
    // Deserialize a params string into an object, optionally coercing numbers,
    // booleans, null and undefined values; this method is the counterpart to the
    // internal jQuery.param method.
    //
    // Usage:
    //
    // > jQuery.deparam( params [, coerce ] );
    //
    // Arguments:
    //
    //  params - (String) A params string to be parsed.
    //  coerce - (Boolean) If true, coerces any numbers or true, false, null, and
    //    undefined to their actual value. Defaults to false if omitted.
    //
    // Returns:
    //
    //  (Object) An object representing the deserialized params string.
    //
    var bidxDeparam = function ( params, coerce )
    {
        var obj = {},
        coerce_types = { 'true': !0, 'false': !1, 'null': null },
        decode = decodeURIComponent; // #msp: added decode shortcut which is used in original code

        // Iterate over all name=value pairs.
        $.each( params.replace( /\+/g, ' ' ).split( '&' ), function(j,v)
        {
            var param = v.split( '=' ),
            key = decode( param[0] ),
            val,
            cur = obj,
            i = 0,

            // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
            // into its component parts.
            keys = key.split( '][' ),
            keys_last = keys.length - 1;

            // If the first keys part contains [ and the last ends with ], then []
            // are correctly balanced.
            if ( /\[/.test( keys[0] ) && /\]$/.test( keys[ keys_last ] ) )
            {
                // Remove the trailing ] from the last keys part.
                keys[ keys_last ] = keys[ keys_last ].replace( /\]$/, '' );

                // Split first keys part into two parts on the [ and add them back onto
                // the beginning of the keys array.
                keys = keys.shift().split('[').concat( keys );

                keys_last = keys.length - 1;
            }
            else
            {
                // Basic 'foo' style key.
                keys_last = 0;
            }

            // Are we dealing with a name=value pair, or just a name?
            if ( param.length === 2 )
            {
                val = decode( param[1] );

                // Coerce values.
                if ( coerce )
                {
                  val = val && !isNaN(val)            ? +val              // number
                    : val === 'undefined'             ? undefined         // undefined
                    : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
                    : val;                                                // string
                }

                if ( keys_last )
                {
                  // Complex key, build deep object structure based on a few rules:
                  // * The 'cur' pointer starts at the object top-level.
                  // * [] = array push (n is set to array length), [n] = array if n is
                  //   numeric, otherwise object.
                  // * If at the last keys part, set the value.
                  // * For each keys part, if the current level is undefined create an
                  //   object or array based on the type of the next keys part.
                  // * Move the 'cur' pointer to the next level.
                  // * Rinse & repeat.
                  for ( ; i <= keys_last; i++ ) {
                    key = keys[i] === '' ? cur.length : keys[i];
                    cur = cur[key] = i < keys_last
                      ? cur[key] || ( keys[i+1] && isNaN( keys[i+1] ) ? {} : [] )
                      : val;
                  }

                }
                else
                {
                    // Simple key, even simpler rules, since only scalars and shallow
                    // arrays are allowed.

                    if ( $.isArray( obj[key] ) )
                    {
                        // val is already an array, so push on the next value.
                        obj[key].push( val );

                    }
                    else if ( obj[key] !== undefined )
                    {
                        // val isn't an array, but since a second value has been specified,
                        // convert val into an array.
                        obj[key] = [ obj[key], val ];

                    }
                    else
                    {
                        // val is a scalar.
                        obj[key] = val;
                    }
                }

            }
            else if ( key )
            {
                // No value was defined, so set something meaningful.
                obj[key] = coerce
                  ? undefined
                  : '';
            }
        } );

        return obj;
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


    var toTimeStamp    = function(strDate)
    {
        var datum = Date.parse(strDate);

        return datum/1000;
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

    var getISODateTime = function( obj )
    {
        var result = "";

        if ( !obj )
        {
            return result;
        }


        var y = obj.getFullYear()
        ,   m = obj.getMonth() + 1
        ,   d = obj.getDate() * 1
        ,   h = obj.getHours()
        ,   n = obj.getMinutes() < 10 ? "0" + obj.getMinutes() : obj.getMinutes()
        ,   s = obj.getSeconds() < 10 ? "0" + obj.getSeconds() : obj.getSeconds()
        ;

        if ( m < 10 )
        {
            m = "0" + m;
        }

        if ( d < 10 )
        {
            d = "0" + d;
        }

        result += y + "-" + m + "-" + d + "T" + h + ":" + n + ":" + s + "Z" ;

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
                result = d.getDate() + " " + months[ d.getMonth() ] + " " + d.getFullYear();
            break;

            case "time":
                result = obj.h + ":" + obj.n + ":" + obj.s;
            break;

            default:
                result = d.getDate() + " " + months[ d.getMonth() ] + " " + d.getFullYear() + " " + obj.h + ":" + obj.n + ":" + obj.s;
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
        ,   result  = d.getDate() + " " + months[ d.getMonth() ] + " " + d.getFullYear()
        ;

        return result;
    };

    var parseTimestampToDateTime = function( ts, format )
    {
        if ( !ts )
        {
            return "";
        }

        if( !format )
        {
            format = "datetime";
        }
        var d       = new Date( parseInt( ts + "000", 10 ) )
        ,   obj     =
            {
                y:      d.getFullYear()
            ,   m:      months[ d.getMonth()].toLowerCase()
            ,   d:      d.getDate()
            ,   h:      d.getHours()
            ,   n:      d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()
            ,   s:      d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds()
            }
        ,   result
        ;

        switch( format )
        {
            case "date":
                result = obj.d + " " + obj.m + " " + obj.y;
            break;

            case "time":
                result = obj.h + ":" + obj.n + ":" + obj.s;
            break;

            default:
                result = obj.d + " " + obj.m + " " + obj.y + " " + obj.h + ":" + obj.n + ":" + obj.s;
        }
        return result;
    };


    //  return view name. Expects v(iew) and optionally a c(lassname) which will be used to search for the view
    //
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
    ,   toTimeStamp:                toTimeStamp
    ,   getISODate:                 getISODate
    ,   getISODateTime:             getISODateTime
    ,   parseISODate:               parseISODate
    ,   parseISODateTime:           parseISODateTime
    ,   parseTimestampToDateStr:    parseTimestampToDateStr
    ,   parseTimestampToDateTime:   parseTimestampToDateTime
    ,   setElementValue:            setElementValue
    ,   getElementValue:            getElementValue
    ,   populateDropdown:           populateDropdown
    ,   setNestedStructure:         setNestedStructure
    ,   getViewName:                getViewName
    ,   generateId:                 generateId
    ,   prefixUrlWithProtocol:      prefixUrlWithProtocol
    ,   normalizeLinkedInUrl:       normalizeLinkedInUrl
    ,   bidxDeparam:                bidxDeparam
    ,   log:                        log
    ,   warn:                       warn
    ,   error:                      error
    };
} ( jQuery ));
