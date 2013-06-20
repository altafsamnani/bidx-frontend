<?php
wp_enqueue_script ('bidx-form');
$blog_title = strtolower(get_bloginfo());

// Remove this code after next release
$group_anonymous_login = $blog_title . 'groupanonymous';

if (!username_exists ($group_anonymous_login)) {
    $blog_id = get_current_blog_id ();
    $group_password = $blog_title . 'bidxGeeks9';
    $new_user_caps_anonymous = array ('read' => true);
    $new_role_added = add_role ('groupanonymous', 'Group Anonymous', $new_user_caps_anonymous);

    $group_anonymous_email = $blog_title . '_anonymous@bidx.net';
    //Add Group Member Role
    $user_id_anonymous = wpmu_create_user ($group_anonymous_login, $group_password, $group_anonymous_email);
    add_user_to_blog ($blog_id, $user_id_anonymous, 'groupanonymous');
}

?>
<div class="block-odd">
    <div class="container">

        <?php while (have_posts ()) : the_post (); ?>
            <?php
            echo bidx_get_status_msgs();
            the_content ();
            ?>
        <?php endwhile; ?>

    </div>
</div>

