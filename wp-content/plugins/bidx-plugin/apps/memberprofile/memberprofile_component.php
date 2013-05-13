<!-- bidxAPI config wasn't loaded anymore properly, added it here to be at least before the js include of it but it should be fixed properly... -->
<script>
  window.bidx = bidx || {};
  window.bidx.api = {
    settings: {
              servicesPath:   '../../static/js/bidxAPI/services/'
            }
    };
</script>

<div class="block-odd">
  <div class="container">

    <div class="">
      <h1><?php echo $view->data->displayName; ?></h1>
    </div>

    <div class="row-fluid mainState mainStateShow">
      <div class="span8">
        <?php $view->render('view-member.phtml'); ?>
      </div>
      <div class="span4">
        <?php $view->render('view-group.phtml'); ?>
      </div>
    </div>

    <?php $view->render('edit-member.phtml'); ?>

  </div>
</div>
