<!-- bidxAPI config wasn't loaded anymore properly, added it here to be at least before the js include of it but it should be fixed properly... -->
<script>
  window.bidx = window.bidx || {};
  window.bidx.api = {
    settings: {
              servicesPath:   '/wp-content/plugins/bidx-plugin/static/js/bidxAPI/services/'
            }
    };
</script>

<style>
  .pageHeader {
    position:           fixed;
    top:                120px;
    padding-top:        10px;
    height:             60px;
    background-color:   #fff;
    z-index:            1010;
  }

  .pageHeader .editControls {
    position:           absolute;
    bottom:             10px;
    right:              0px;
  }

  .pageHeader .editControls a {
    margin-left:        4px;
  }

  body {
    padding-top:        190px;
  }

  span.scrollPositionMarker {
    top:                -190px;
  }
</style>

<div class="block-odd">
    <div class="pageHeader clearfix">
      <div class="container clearfix">
        <h1 class="pull-left">Member profile</h1>
        <div class="editControls"></div>
      </div>
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
