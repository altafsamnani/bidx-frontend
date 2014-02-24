<?php get_header(); ?>

<div id="contact" class="main-wrapper">
    <section id="google-map" class="section google-map pad-top-0">
        <iframe width="100%" height="350" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?f=q&amp;source=s_q&amp;hl=el&amp;geocode=&amp;q=Bidx+B.V.,+De+Ruijterkade,+Amsterdam,+Nederland&amp;aq=0&amp;oq=De+Ruijterkade+bidx&amp;sll=52.381467,4.896212&amp;sspn=0.038979,0.090809&amp;ie=UTF8&amp;hq=&amp;hnear=&amp;ll=52.377863,4.905407&amp;spn=0.006295,0.006295&amp;t=m&amp;iwloc=A&amp;output=embed"></iframe>
    </section>

    <section id="contact-us" class="pad-25">
        <div class="container">
            <div class="row">
                <div class="col-md-4">
                    <div class="visit-us pad-top-25">
                        <div class="subpage-title">
                            <h5><i class="fa fa-compass"></i> Visit Us</h5>
                        </div>
                        <address>
                            <strong>bidX BV</strong><br>
                            De Ruijterkade, 107<br>
                            Amsterdam, 1011 AB<br>
                        </address>
                    </div>
                    <div class="contact-numbers pad-top-25">
                        <div class="subpage-title">
                            <h5><i class="fa fa-phone"></i> Contact</h5>
                        </div>
                        <address>
                            Phone: (123) 456-7890<br>
                            Fax: (123) 456-7890<br>
                            <a href="mailto:info@bidx.net">info@bidx.net</a>
                        </address>
                    </div>
                </div>
                <div class="col-md-8">
                	<?php if ( have_posts() ) while ( have_posts() ) : the_post(); ?>
                    <div class="contact-form pad-25">
                        <div class="subpage-title">
                            <h5>Get In Touch</h5>
                        </div>
                        <div class="row">
							<div class="col-md-12">
	                        	<?php the_content(); ?>
	                        </div>
                        </div>
                        <!-- row-fluid -->
                    </div>
                    <?php endwhile; ?>
                    <!-- /.contact-form -->
                </div>
            </div>
            <!-- /.row -->
        </div>
        <!-- /.container -->
    </section>
    <!-- /#contact-us -->
</div>
<!-- /.main-wrapper -->

<?php get_footer(); ?>
