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



} ( jQuery ) );
