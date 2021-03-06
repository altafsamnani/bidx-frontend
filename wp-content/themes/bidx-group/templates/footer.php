<?php
    $session = BidxCommon::$staticSession;

    $has_social           = false;
    $rightSideFooterColSm = 'col-sm-12';
    if ( get_theme_mod( 'facebook_url' ) || get_theme_mod( 'linkedin_url' ) || get_theme_mod( 'twitter_handle' ) )
    {
        $has_social = true;
        $rightSideFooterColSm = 'col-sm-8';
    }

if( !$session->external && !$session->webapp )
{
?>

<footer>
    <div class="page-footer bg-primary-dark">
        <div class="container">
            <div class="footer-bar row">
<?php
            if ( $has_social ) :
?>
                <div class="col-sm-4">
                    <div class="follow-us pull-left"><?php _e( 'Follow us', 'bidxplugin' ) ?></div>
                    <div class="btn-group">
<?php
                        if ( get_theme_mod( 'facebook_url' ) )
                        {
?>
                            <a target="_blank" href="<?php echo get_theme_mod( 'facebook_url' ); ?>"><i class="fa fa-facebook-square"></i></a>
<?php
                        }

                        if ( get_theme_mod( 'linkedin_url' ) )
                        {
?>
                            <a target="_blank" href="<?php echo get_theme_mod( 'linkedin_url' ); ?>"><i class="fa fa-linkedin-square"></i></a>
<?php
                        }

                        if ( get_theme_mod( 'twitter_handle' ) )
                        {
?>
                            <a target="_blank" href="//twitter.com/<?php echo get_theme_mod( 'twitter_handle' ); ?>"><i class="fa fa-twitter-square"></i></a>
<?php
                        }
?>

                    </div>
                </div>
<?php
            endif;
?>

                <div class="<?php echo $rightSideFooterColSm;?> text-right">
                    <div class="copyright">&copy; <?php echo date("Y") ?> bidx.net  <?php _e( 'All rights reserved','bidxplugin' ) ?></div>
                    <div class="inline-list footer-menu">
                        <div><a href="<?php echo _l('terms-of-service');?>" target="_blank"><?php _e('Terms of service','bidxplugin')?></a></div>
                        <div><a href="<?php echo _l('privacy');?>"><?php _e('Privacy','bidxplugin')?></a></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</footer>
<?php 
} 
?>


<div class="loginModal modal fade">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h3><?php _e('Your session expired, login to continue', 'bidxplugin' ); ?></h3>
            </div>
            <div class="modal-body">
                <div id="frmLoginModal">
                    <div class="form-group">
                        <label class=""><?php _e('Email address','bidxplugin');?></label>
                        <input type="email" class="form-control" name="shownusername" value="<?php echo $session->data->username ?>" disabled />
                    </div>
                    <div class="form-group">
                        <label class=""><?php _e('Password','bidxplugin');?></label>
                        <input type="password" class="form-control" name="password" placeholder="<?php _e('Enter your password','bidxplugin');?>" />
                    </div>
                    <input type="email" class="hide" name="username" value="<?php echo $session->data->username ?>" />

                    <div class="error-separate alert alert-danger"></div>
                    <button type="submit" class="btn btn-primary js-relogin"><?php _e('Login','bidxplugin');?></button>
                </div>
            </div>
        </div>
    </div>
</div>



<?php wp_footer(); ?>

