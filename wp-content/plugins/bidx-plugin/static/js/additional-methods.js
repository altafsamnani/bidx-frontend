(function( $ )
{
    // https://support.skype.com/en/faq/FA94/what-is-a-skype-name
    //
    // Your Skype Name must have between 6 and 32 characters. It must start with a letter and can contain only letters, numbers and the following punctuation marks:
    //  full stop (.)
    //  comma (,)
    //  dash (-)
    //  underscore (_)
    //
    $.validator.addMethod( "skypeUsername", function(value, element, param)
    {
        if ( this.optional( element ))
        {
            return true;
        }

        return /^[a-z][a-z0-9.,_-]{5,31}$/i.test( value );

    }, "Not a valid Skype username" );

    // http://help.linkedin.com/app/answers/detail/a_id/87
    // 5 - 30 letters or numbers. Please do not use spaces, symbols, or special characters.
    //
    // BIDX-1162 makes this even a bit more complex
    // @TODO: implement rules as specified in BIDX-1162
    //
    $.validator.addMethod( "linkedInUsername", function(value, element, param)
    {
        if ( this.optional( element ))
        {
            return true;
        }

        return /^[a-z0-9]{5,30}$/i.test( value );

    }, "Not a valid LinkedIn username" );

    // http://www.labnol.org/internet/change-facebook-page-username/21449/
    //
    $.validator.addMethod( "facebookUsername", function(value, element, param)
    {
        if ( this.optional( element ))
        {
            return true;
        }

        return /^[a-z0-9.]{5,}$/i.test( value );

    }, "Not a valid Facebook username" );

    // http://support.twitter.com/articles/101299-why-can-t-i-register-certain-usernames#
    // 1-15 characters
    // letters and underscores
    //
    $.validator.addMethod( "twitterUsername", function(value, element, param)
    {
        if ( this.optional( element ))
        {
            return true;
        }

        return /^[a-z0-9_]{1,15}$/i.test( value );

    }, "Not a valid Twitter username" );

    // Alias number for now to validate monetary amount
    //

    $.validator.addMethod( "monetaryAmount", function( value, element, param)
    {
        if ( this.optional( element ))
        {
            return true;
        }

        return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
    }, "Not a valid monetary amount" );


    // Since bidx-tagsinput is special input control we cannot simply say "required"
    // This requires special handling
    //
    $.validator.addMethod( "tagsinputRequired", function( value, element, param )
    {
        var values = $( element ).tagsinput( "getValues" );

        return !!values.length;
    }, "This field is required" );

    // Since bidx-tagsinput is special input control we cannot simply say "min" or something
    // This requires special handling
    //
    $.validator.addMethod( "tagsinputMinItems", function( value, element, param )
    {
        var values = $( element ).tagsinput( "getValues" );

        return values.length > param;
    }, "Min items default text " );

    // Since we want to allow urls without the protocol (but it should be added before submitting it to the API!)
    // this validator is the same as in the jquery.validate.js but adjusted for the optional protocol
    //
    $.validator.addMethod( "urlOptionalProtocol", function( value, element, param )
    {
        // contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
        return this.optional(element) || /^((https?|s?ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
    }, "Protocal is optional" );


    // bidx remoteApi call: expects cb function in param
    //
    $.validator.addMethod( "remoteApi", function( value, element, param )
    {
        if ( this.optional(element) ) {
            return "dependency-mismatch";
        }

        if( param.cb )
        {
            return param.cb.call( this, value, element, param );
        }
        else
        {
            bidx.utils.warn( "No callback defined for remoteApi validation rule" );
            return false;
        }
    }, "Default message remoteApi" );

} ( jQuery ) );
