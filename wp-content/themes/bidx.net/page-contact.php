<?php get_header(); ?>

<div id="contact" class="main-wrapper">
    <section id="google-map" class="section google-map pad-top-0 hidden-xs">
        <iframe width="100%" height="350" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2435.929267368065!2d4.89511565171756!3d52.3717025548616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c609b091127e0f%3A0x549a45b9e10cab71!2sBidx+B.V.!5e0!3m2!1sen!2snl!4v1459767498773"></iframe>
    </section>
    <section id="google-map" class="section google-map pad-top-0 visible-xs">
        <iframe width="100%" height="180" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2435.929267368065!2d4.89511565171756!3d52.3717025548616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c609b091127e0f%3A0x549a45b9e10cab71!2sBidx+B.V.!5e0!3m2!1sen!2snl!4v1459767498773"></iframe>
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
                            <strong>bidx BV</strong><br/>
                            Oudezijds Achterburgwal 141E<br/>
                            Amsterdam, 1012 DG<br/>
                        </address>
                    </div>
                    <div class="contact-numbers pad-top-25">
                        <div class="subpage-title">
                            <h5><i class="fa fa-phone"></i> Contact</h5>
                        </div>
                        <address>
                            Phone: +31 202 181 060<br>
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
