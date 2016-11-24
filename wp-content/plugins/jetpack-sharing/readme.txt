=== JP Sharing ===
Contributors: wpjp
Tags: share, sharing, sharedaddy, buttons, icons, social, email, facebook, google+, twitter, pinterest, linkedin, reddit, tumblr, jetpack, pocket, press this, print
Requires at least: 3.5
Tested up to: 4.5
Stable tag: 3.9.6
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Share content with Facebook, Twitter, and many more.

== Description ==

>_This plugin will is no longer maintained._
>_Feel free to fork it._

Just the [Sharing](http://jetpack.me/support/sharing/) module from [Jetpack](http://wordpress.org/plugins/jetpack/).

All credits go to [Jetpack developers](https://jetpack.com/about/). Just saved you the trouble of taking [Sharing](http://jetpack.me/support/sharing/) module out of Jetpack and making it into an independent plugin.

= But.. Why? =

* Why not?
* Privacy?
* Boilerplate?

= Similar Plugins =

* [JP Sharing](http://wordpress.org/plugins/jetpack-sharing/) - Share content with Facebook, Twitter, and many more.
* [JP Widget Visibility](http://wordpress.org/plugins/jetpack-widget-visibility/) - Control what pages your widgets appear on.
* [JP Markdown](http://wordpress.org/plugins/jetpack-markdown/) - Write in Markdown, publish in HTML.
* [JP Custom CSS](http://wordpress.org/plugins/jp-custom-css/) - Customize your site’s CSS without modifying your theme.
* [JP Gravatar Hovercards](http://wordpress.org/plugins/jetpack-gravatar-hovercards/) - Show a pop-up business card of your users' gravatar profiles in comments.
* [JP Omnisearch](http://wordpress.org/plugins/jetpack-omnisearch/) - A single search box, that lets you search many different things.

== Changelog ==

= 3.9.6 =

* New sharing button: let users share your content using Skype.
* Added a new filter to customize the default OpenGraph description.

= 3.8 =

* Enhancement: Added a possibility to opt-out of sharing for a single post
* Enhancement: Added bbPress support
* Enhancement: Added more configuration to the Likes modal
* Enhancement: Made the reddit button open a new tab
* Enhancement: Removed unused files
* Enhancement: Updated the Google logo
* Enhancement: New filter to choose if sharing meta box should be shown.
* Enhancement: New filter to allow sharing button markup to be editable.
* Enhancement: New filter to allow you to specify a custom Facebook app ID.
* Bug Fix: Added a thumbnail image to OpenGraph tags on pages with DailyMotion embeds
* Bug Fix: Fixed Twitter Cards tags escaping
* Bug Fix: Made OpenGraph tags for title and description use proper punctuation
* Bug Fix: Made sure Likes can be disabled on the front page
* Bug Fix: Fixed OpenGraph tags for Instagram embeds
* Bug Fix: Fixed compatibility issues with bbPress
* Bug Fix: Use full SSL Pinterest url instead of protocol relative.
* Bug Fix: Fixed plus signs appearing in tweets shared from iOS.

= 3.6 =

* Enhancement: Retire StumbleUpon
* Enhancement: Upgrade to reCAPTCHA 2.0 for Email Sharing
* Enhancement: LinkedIn always uses https for share counts. (saved extra http request)
* Bug Fix: Fix Facebook share button not showing for Australian & Canadian locale

= 3.5.3 =

* Enhancement: Reduce spam through email sharing
* Bug Fix: Styling fixes
* Enhancement: Changes Facebook share count method per Facebook API change
* Bug Fix: Changes Facebook share count endpoint
* Security Hardening: Remove Genericons example.html file.

= 3.4.1 =

* Enhancement : Add custom service name as a class
* Enhancement : display name of custom service in link title
* Enhancement : Remove default post types for showing share links
* Enhancement : use Jetpack version number when enqueing sharing.js
* Bug Fix : Open sharing in same window
* Bug Fix: Including sharing account on Pinterest unofficial buttons as well.
* Bug Fix: Properly version external assets by Jetpack release version.
* Enhancement: add new jetpack_sharing_counts filter for option to turn off sharing counts.
* Enhancement: Use the Site Logo Theme Tool and the Site Icon as fallbacks for image tags.
* Bug Fix: Prevent duplicate @ in shared Tweets.

= 3.2.1 =

* Enqueue Genericons on static front page as well if selected.

= 3.2 =

* Bug Fix: Fixed styles.
* Dutch translation by Bierleeuw.

= 3.1 =

* Portuguese translation by [Celso Azevedo](http://www.wptotal.com/)
* Update to 3.1
* Change plugin name to "JP Sharing" in response to Jetpack team request.
* Improved RTL support
* Updated Genericons to version 3.1, new icons for website, ellipsis, foursquare, x-post, sitemap, hierarchy and paintbrush.
* Bugfix: Pinterest adds attribute to display share count.
* Bug Fix: Respect an empty sharing title.
* Bug Fix: Share buttons now appear in the bbPress forms.
* Bug Fix: Support for multiple meta html tag og:image values.


= 3.0.1 =

* Enhancement: New look
* Bugfix: Ensure Sharing settings persist when Bulk Editing a post
* Swedish translation by Max Beta.
* Bugfix: Notice Use of undefined constant JETPACK__VERSION

= 2.9.3 =

* Update to Jetpack 2.9.3

= 2.9 =

* Update to Jetpack 2.9:
* Add filter sharing_display_link
* Add get_share_title function and filter
* Display buttons on CPT archive pages
* Adding keyboard accessibility to sharing buttons config page

= 2.7 = 

* Update to Jetpack 2.7

= 2.5 =

* Initial release

== Upgrade Notice ==

= 3.2 =
Bugfixes and Dutch translation.

= 3.1 =
Bugfixes, improved RTL support, added Portuguese translation, and Updated Genericons to version 3.1.