<?php


$view -> render('view-member.phtml');


?>
<div class="block-odd">
	<div class="container">

		<div class="">
			<h1>member-profile</h1>
		</div>

		<a class="btn btn-primary" href="#edit">Edit</a>


<?php $view -> render('edit-member.phtml'); ?>
	</div>
</div>
