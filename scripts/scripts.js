jQuery(document).ready(function() {

    if($(window).width()<768 || Modernizr.touch){ // We are on mobile phone
        // Disable smooth scrolling animation
        jQuery('.window').windows({
            snapping: true,
            snapSpeed: 600,
            snapInterval: 0,
            snapNextWindow: false,
            autoSnap: false,
            onScroll: function(scrollPos){
                // scrollPos:Number
            },
            onSnapComplete: function($el){
                // after window ($el) snaps into place
            },
            onWindowEnter: function($el){
                // when new window ($el) enters viewport
            }
        });
    }
    else{
        // Initialise fadein animations 
        var wow = new WOW().init();

        // Initialise smooth scrolling animation
        jQuery('.window').windows({
            snapping: true,
            snapSpeed: 600,
            snapInterval: 0,
            snapNextWindow: true,
            autoSnap: true,
            onScroll: function(scrollPos){
                // scrollPos:Number
            },
            onSnapComplete: function($el){
                // after window ($el) snaps into place
            },
            onWindowEnter: function($el){
                // when new window ($el) enters viewport
            }
        });
    }

    // Scrolling to first page when click on next arrow
    jQuery('.next').click(function(){
    	jQuery('.window').snapWindow(jQuery('#page1'), 0);
    });
} );