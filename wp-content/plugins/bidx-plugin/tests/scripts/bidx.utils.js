( function()
{
    QUnit.module( "normalizeLinkedInUrl" );

    QUnit.test( "username ok", function()
    {
        var input;

        QUnit.equal(
            bidx.utils.normalizeLinkedInUrl( "abcde" )
        ,   "https://www.linkedin.com/in/abcde"
        );

        QUnit.equal(
            bidx.utils.normalizeLinkedInUrl( "abcdefghijklmnopqrstuvwxyz" )
        ,   "https://www.linkedin.com/in/abcdefghijklmnopqrstuvwxyz"
        );

        QUnit.equal(
            bidx.utils.normalizeLinkedInUrl( "abcdefghijklmnopqrstuvwxyzabcd" )
        ,   "https://www.linkedin.com/in/abcdefghijklmnopqrstuvwxyzabcd"
        );

        QUnit.equal(
            bidx.utils.normalizeLinkedInUrl( "abcdefghijklmnopqrstuvwxyzabcd" )
        ,   "https://www.linkedin.com/in/abcdefghijklmnopqrstuvwxyzabcd"
        );

        input = "www.linkedin.com/pub/hamish-drewry/0/923/238";
        QUnit.equal(
            bidx.utils.normalizeLinkedInUrl( input )
        ,   "https://" + input
        );

        input = "linkedin.com/pub/hamish-drewry/0/923/238";
        QUnit.equal(
            bidx.utils.normalizeLinkedInUrl( input )
        ,   "https://" + input
        );

        input = "uk.linkedin.com/pub/hamish-drewry/0/923/238";
        QUnit.equal(
            bidx.utils.normalizeLinkedInUrl( input )
        ,   "https://" + input
        );

        input = "http://www.linkedin.com/in/marry";
        QUnit.equal(
            bidx.utils.normalizeLinkedInUrl( input )
        ,   input
        );

        input = "www.linkedin.com/in/marry";
        QUnit.equal(
            bidx.utils.normalizeLinkedInUrl( input )
        ,   "https://" + input
        );

        input = "linkedin.com/in/marry";
        QUnit.equal(
            bidx.utils.normalizeLinkedInUrl( input )
        ,   "https://" + input
        );

        input = "marry";
        QUnit.equal(
            bidx.utils.normalizeLinkedInUrl( input )
        ,   "https://www.linkedin.com/in/" + input
        );

        input = "nl.linkedin.com/in/marry";
        QUnit.equal(
            bidx.utils.normalizeLinkedInUrl( input )
        ,   "https://" + input
        );
    } );
} ());

