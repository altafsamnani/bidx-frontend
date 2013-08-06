function handleSearch(response) {
	var bounds = new google.maps.LatLngBounds();
	for (var doc_id in response.data.docs) {
		
	  var doc = response.data.docs[doc_id];
	  
	  switch (doc.type) {
		  case 'bidxMemberProfile': 
			  var location = doc.focuslocation_p;
			  var title = doc.name_s;
			  var icon = 'member_icon.png';
			  var content = doc.slogan_t;
			  break;
		  case 'bidxEntrepreneurProfile':
			  var location = doc.focuslocation_p;
			  var title = doc.name_s;
			  var icon = 'entrepreneur_icon.png';
			  var content = doc.slogan_t;
			  break;
		  case 'bidxInvestorProfile':
			  var location = doc.focuslocation_p;
			  var title = doc.name_s;
			  var icon = 'investor_icon.png';
			  var content = doc.slogan_t;
			  break;
		  case 'bidxCompany':
			  var location = doc.focuslocation_p;
			  var title = doc.name_s;
			  var icon = 'company_icon.png';
			  var content = doc.slogan_t;
			  break;					  
		  case 'bidxBusinessSummary':
			  var location = doc.focuslocation_p;
			  var title = doc.name_s;
			  var icon = 'business_icon.png';
			  var content = doc.slogan_t;
			  break;					  					  					  
		  case 'bidxBusinessGroup':
			  var location = doc.focuslocation_p;
			  var title = doc.name_s;
			  var icon = 'business_group_icon.png';
			  var content = doc.slogan_t;
			  break;
	  }
	  //add data to map
	  var loc = location.split(',');
	  var myLatlng = new google.maps.LatLng(loc[0], loc[1]);

	  var infowindow = new google.maps.InfoWindow({
		      content: content
	   }); 
	
	  var marker = new google.maps.Marker({
	      position: myLatlng,
	      map: map,
	      animation: google.maps.Animation.DROP,
	      flat: true,
	 	  icon: icon ,     
	      title: title,
	      infoWindowIndex : doc_id	
	  });

	  bounds.extend(myLatlng);
	  
	  google.maps.event.addListener(marker, 'click', function() {
		  infowindow.open(map, this);
	  });

	  map.fitBounds(bounds);
	}
}

var map;
function activateMaps(id) {
	map = new google.maps.Map(document.getElementById(id), {
	    mapTypeId: google.maps.MapTypeId.ROADMAP,
	    center: new google.maps.LatLng(52.377823, 4.905385),
	    zoom: 15
	});
	google.maps.event.addDomListener(window, 'load', initialize);	
}