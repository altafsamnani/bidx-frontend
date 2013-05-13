<div class="block-odd">
  <div class="container">

    <div class="">
      <h1><?php echo $view->data->displayName; ?></h1>
    </div>

    <div class="row-fluid">
      <div class="span8">
        <?php $view->render('view-member.phtml'); ?>
      </div>
      <div class="span4">
        <?php $view->render('view-group.phtml'); ?>
      </div>
    </div>


  </div>
</div>
