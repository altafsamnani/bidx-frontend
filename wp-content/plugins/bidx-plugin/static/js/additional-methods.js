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

} ( jQuery ) );
