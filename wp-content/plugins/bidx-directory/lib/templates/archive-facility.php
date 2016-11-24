<?php
/**
 * The template for displaying Archive pages
 *
 * Used to display archive-type pages if nothing more specific matches a query.
 * For example, puts together date-based pages if no date.php file exists.
 *
 * If you'd like to further customize these archive views, you may create a
 * new template file for each specific one. For example, Twenty Fourteen
 * already has tag.php for Tag archives, category.php for Category archives,
 * and author.php for Author archives.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package WordPress
 * @subpackage Twenty_Fourteen
 * @since Twenty Fourteen 1.0
 */

get_header(); ?>
    <div class="row">
        <?php if (have_posts()) : ?>
            <?php
            // Start the Loop.
            while (have_posts()) : the_post();
                global $post;
                $image_url = wp_get_attachment_image_src(get_post_thumbnail_id(), 'post_image');
                $website = get_post_meta($post->ID, 'facility_website', true) ? get_post_meta($post->ID, 'facility_website', true) : $post->ID;
                $contact_person = get_post_meta($post->ID, 'facility_contact_person', true);
                $contact_email = get_post_meta($post->ID, 'facility_contact_email', true);
                $contact_phone = get_post_meta($post->ID, 'facility_contact_phone', true);
                $address = get_post_meta($post->ID, 'facility_address', true);
                $city_hq = get_post_meta($post->ID, 'facility_city_hq', true);
                $country_hq = get_post_meta($post->ID, 'facility_country_hq', true);
                ?>

                <div class="col-sm-4 col-md-4">
                    <div class="thumbnail">
                        <img class="subpage-customimg"
                             src="<?php echo $image_url[0]; ?>"
                             alt="<?php the_title(); ?>"
                             style="height: 200px"
                        />

                        <div class="caption">
                            <h3><?php the_title(); ?></h3>

                            <p>
                                <?php
                                echo $contact_person . '<br>';
                                echo '<a href="' . $website . '">' . $website . '</a><br>';
                                echo $contact_email . '<br>';
                                echo $address . ', ';
                                echo $city_hq . ' - ';
                                echo $country_hq;
                                ?>
                            </p>

                            <p>
                                <a href="<?php the_permalink(); ?>" class="btn btn-primary"
                                   role="button">View</a>
                            </p>
                        </div>
                    </div>
                </div>
                <?php
            endwhile;
        else :
            // If no content, include the "No posts found" template.
            get_template_part('content', 'none');

        endif;
        ?>
    </div>
<?php

get_footer();
