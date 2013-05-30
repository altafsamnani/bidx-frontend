<div class="block-odd">
    <div class="pageHeader clearfix">
      <div class="container clearfix">
        <h1 class="pull-left"><?php echo ($view->data->isMyProfile) ? 'My Profile' : ucwords($view->data->member->displayName); ?></h1>
        <div class="editControls btn-group"></div>
      </div>
    </div>

    <div class="row-fluid mainState mainStateShow">
      <div class="span8">
        <?php $view->render('view-member.phtml'); ?>
        <?php $view->render('view-entrepreneur.phtml'); ?>
      </div>
      <div class="span4 sidebar">
        <?php $view->render('view-group.phtml'); ?>
      </div>
    </div>

    <?php $view->render('edit-member.phtml'); ?>
</div>
