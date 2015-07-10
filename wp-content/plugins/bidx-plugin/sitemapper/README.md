bidx SiteMapper
================

This is a script that should be run on the same server as bidx Frontend to generate sitemap files from bidx database. We use the db in bidx Data Warehouse here.

Configuration
--------------

Make sure to edit the configuration file, sitemapper.yml, and to include the right path. Then you can either run this script manually, or have run via cron job every night or so.

Running
--------

To run the script:

    $ python sitemapper.py

And to specify the configuration file path:

    $ python sitemapper.py -c sitemapper.yml

Author
-------

Tarek Amr [tarek@bidx.net](mailto:tarek@bidx.net?Subject=bidx%20SiteMapper)
