<?php include '../functions/form.php'; //custom form json to html converter ?>
<form>
<?php generateFormFields("entity","firstname,lastname,email"); ?>
</form>

<script type="text/javascript">
	$(function(){
		
		$("form").form({
			callToAction : '.jsSave',
			errorClass : 'error',
			url : '/wp-admin/admin-ajax.php?action=bidx_register',
			enablePlugins: ['date','location'],
			beforeSubmit : function () {
				document.location = "/group-creation-success/"
			}
		});
	});
</script>
<script src="https://maps.googleapis.com/maps/api/js?v=3&sensor=false&libraries=places"></script>
