(function( $ )
{
    var months = [ "January", "Februari", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];


    function getQueryParameter( key )
    {
        var baseURL = decodeURI( document.location.href.replace( /\+/g, "%20" ) ).split( "#" )[ 0 ]
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
    }

    function getValue( obj, path, forceArray )
    {
        if ( typeof path === "undefined" )
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
    }

    /**
     * Safely set a JSON value on a certain path, regardless if that path exists or not
     */
    function setValue( obj, path, value )
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
    }

    function getGroupDomain()
    {
        return document.location.hostname.split( "." ).shift();
    }

    function getISODate( obj )
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
    }

    function parseISODate( str )
    {
        if ( !str )
        {
            return;
        }

        var obj =
        {
            y:      str.substr( 0, 4 )
        ,   m:      str.substr( 5, 2 )
        ,   d:      str.substr( 8, 2 )
        };

        return obj;
    }

    function parseTimestampToDateStr( ts )
    {
        if ( !ts )
        {
            return "";
        }

        var d       = new Date( parseInt( ts + "000", 10 ) )
        ,   result  = d.getDate() + " " + months[ d.getMonth() ] + " " + d.getFullYear()
        ;

        return result;
    }

    // Logger functions
    //
    function log()
    {
        if ( window[ "console" ] && console[ "log" ] && typeof console.log === "function" )
        {
            console.log.apply( console, arguments );
        }
    }

    function warn()
    {
        if ( window[ "console" ] && console[ "warn" ] &&  typeof console.warn === "function" )
        {
            console.warn.apply( console, arguments );
        }
    }

    function error()
    {
        if ( window[ "console" ] && console[ "error" ] && typeof console.error === "function" )
        {
            console.error.apply( console, arguments );
        }
    }


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
    ,   parseTimestampToDateStr:    parseTimestampToDateStr

    ,   log:                        log
    ,   warn:                       warn
    ,   error:                      error
    };
} ( jQuery ));
