
$( document ).ready(function() {

  // create a timer that turns the attention animations on and off
  $('.scroll-negative-margin').addClass('animated pulse infinite');
  window.setInterval(function(){
		$('.city-selection').addClass('animated pulse infinite');
		setTimeout(
			function() {
				$('.city-selection').removeClass('animated pulse infinite');
			}, 3000
		);
	}, 10000);  
    

		// remove scroll down once use starts scrolling
		$(window).on("scroll", function() {
			$('.scroll-down-indicator').fadeOut(3000, function() {
				// $('.scroll-negative-margin').remove();				
			});
			$(this).off("scroll")
		})

		//Slid away animation for newsletter sign up module
    $('.newsletter-sign-up-btn').on( "click", function(event) {
		  event.preventDefault()
		  $('.call-to-action-background').addClass('animated bounceOut')
			setTimeout(
			function() {
		  	$('.newsletter-form-wrapper').empty();
		  	$('.newsletter-statement').addClass('d-none')
		  	$('.newsletter-success').removeClass('d-none')
		  	$('.call-to-action-background').removeClass('bounceOut')
		  	$('.call-to-action-background').addClass('bounceIn')		 		    
			}, 1000);
			setTimeout(
			function() {
				$('.call-to-action-background').removeClass('bounceIn')
		  	$('.call-to-action-background').addClass('bounceOut')	
		  	setTimeout(function() {		  		
			  	// $('.call-to-action-background').remove();
		  	}, 1000)
			}, 5000)
			
		  $( this ).off("click")
		});
		// used to transition when user clicks their city
		$('.city-selection').on('click', function(event) {
			console.log("city btn clicked");
			// $('.main-wrap').addClass('animated bounceOutRight')
		})

		$('.item__image-area').on('click', function(e) {
			console.log("image clicked")
			$('.doggy-dropdown-wrapper').toggle();
		})

});