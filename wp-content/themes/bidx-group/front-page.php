front-page.php

<?php
    if ( $authenticated )
    {
?>
        <div class="region-top">
            <?php dynamic_sidebar('priv-front-top'); ?>
        </div>
        <div class="region-body">
            <?php dynamic_sidebar('priv-front-body'); ?>
        </div>
        <div class="region-side">
            <?php dynamic_sidebar('priv-front-side'); ?>
        </div>
        <div class="region-bottom">
            <?php dynamic_sidebar('priv-front-bottom'); ?>
        </div>
<?php        
    }
    else
    {
?>
        <div class="region-top">
            <?php dynamic_sidebar('pub-front-top'); ?>
        </div>
        <div class="region-body">
            <?php dynamic_sidebar('pub-front-body'); ?>
        </div>
        <div class="region-side">
            <?php dynamic_sidebar('pub-front-side'); ?>
        </div>
        <div class="region-bottom">
            <?php dynamic_sidebar('pub-front-bottom'); ?>
        </div>
<?php 
    }
?>

