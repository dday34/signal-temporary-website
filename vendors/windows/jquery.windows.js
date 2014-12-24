/*!
 * windows: a handy, loosely-coupled jQuery plugin for full-screen scrolling windows.
 * Version: 0.0.1
 * Original author: @nick-jonas
 * Website: http://www.workofjonas.com
 * Licensed under the MIT license
 */

;(function ( $, window, document, undefined ) {

    var that = this,
            pluginName = 'windows',
            defaults = {
                snapping: true,
                snapSpeed: 500,
                snapInterval: 1100,
                snapNextWindow: false,
                autoSnap: true,
                onScroll: function(){},
                onSnapComplete: function(){},
                onWindowEnter: function(){}
            },
            options = {},
            $w = $(window),
            s = 0, // scroll amount
            t = null, // timeout
            $windows = [];

    /**
     * Constructor
     * @param {jQuery Object} element       main jQuery object
     * @param {Object} customOptions        options to override defaults
     */
    function windows( element, customOptions ) {

        this.element = element;
        options = options = $.extend( {}, defaults, customOptions) ;
        this._defaults = defaults;
        this._name = pluginName;
        $windows.push(element);
        var isOnScreen = $(element).isOnScreen();
        $(element).data('onScreen', isOnScreen);
        if(isOnScreen) options.onWindowEnter($(element));

    }

    /**
     * Get ratio of element's visibility on screen
     * @return {Number} ratio 0-1
     */
    $.fn.ratioVisible = function(){
        var s = $w.scrollTop();
        if(!this.isOnScreen()) return 0;
        var curPos = this.offset();
        var curTop = curPos.top - s;
        var screenHeight = $w.height();
        var ratio = (curTop + screenHeight) / screenHeight;
        if(ratio > 1) ratio = 1 - (ratio - 1);
        return ratio;
    };

    /**
     * Is section currently on screen?
     * @return {Boolean}
     */
    $.fn.isOnScreen = function(){
        var s = $w.scrollTop(),
            screenHeight = $w.height(),
            curPos = this.offset(),
            curTop = curPos.top - s;
        return (curTop >= screenHeight || curTop <= -screenHeight) ? false : true;
    };

    /**
     * Get section that is mostly visible on screen
     * @return {jQuery el}
     */
    var _getCurrentWindow = $.fn.getCurrentWindow = function(){
        var maxPerc = 0,
            maxElem = $windows[0];
        $.each($windows, function(i){
            var perc = $(this).ratioVisible();
            if(Math.abs(perc) > Math.abs(maxPerc)){
                maxElem = $(this);
                maxPerc = perc;
            }
        });
        return $(maxElem);
    };

    /**
    * Snap to a specific window or to the current window if not specified
    * @return null
    */
    var _snapWindow = $.fn.snapWindow = function(windowElement, snapInterval){
        var scrollbar = new UserScrollDisabler();
        var snapInterval = snapInterval === undefined ? options.snapInterval : snapInterval;
        var windowElement = windowElement || _getCurrentWindow();


        // clear timeout if exists
        if(t){clearTimeout(t);}
        // check for when user has stopped scrolling, & do stuff
        if(options.snapping){
            t = setTimeout(function(){
                isAnimated = true;
                var $visibleWindow = windowElement, // visible window
                    scrollTo = $visibleWindow.offset().top, // top of visible window
                    completeCalled = false;
                // animate to top of visible window
                scrollbar.disable_scrolling();
                $('html:not(:animated),body:not(:animated)').animate({scrollTop: scrollTo }, options.snapSpeed, 'swing', function(){
                    isAnimated = false;
                    scrollbar.enable_scrolling();
                    if(!completeCalled){
                        if(t){clearTimeout(t);}
                        t = null;
                        completeCalled = true;
                        options.onSnapComplete($visibleWindow);
                    }
                });
            }, snapInterval);
        }
    };


    // PRIVATE API ----------------------------------------------------------

    var UserScrollDisabler = function() {
        // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
        // left: 37, up: 38, right: 39, down: 40
        this.scrollEventKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
        this.$window = $(window);
        this.$document = $(document);
    };

    var isAnimated = false;

    UserScrollDisabler.prototype = {
        disable_scrolling : function() {
            var t = this;
            t.$window.on("mousewheel.UserScrollDisabler DOMMouseScroll.UserScrollDisabler", this._handleWheel);
            t.$document.on("mousewheel.UserScrollDisabler touchmove.UserScrollDisabler", this._handleWheel);
            t.$document.on("keydown.UserScrollDisabler", function(event) {
                t._handleKeydown.call(t, event);
            });
        },

        enable_scrolling : function() {
            var t = this;
            t.$window.off(".UserScrollDisabler");
            t.$document.off(".UserScrollDisabler");
        },

        _handleKeydown : function(event) {
            for (var i = 0; i < this.scrollEventKeys.length; i++) {
                if (event.keyCode === this.scrollEventKeys[i]) {
                    event.preventDefault();
                    return;
                }
            }
        },

        _handleWheel : function(event) {
            event.preventDefault();
        }
    };

    /**
     * Window scroll event handler
     * @return null
     */
    var _onScroll = function(){
        if(!isAnimated){
            s = $w.scrollTop();

            if(options.autoSnap && !options.snapNextWindow){
                _snapWindow();
            }

            options.onScroll(s);

            // notify on new window entering
            $.each($windows, function(i){
                var $this = $(this),
                    isOnScreen = $this.isOnScreen();
                if(isOnScreen){
                    if(!$this.data('onScreen')){
                        if(options.snapNextWindow){
                            _snapWindow($this);                        
                        }
                        options.onWindowEnter($this);
                    } 
                }
                $this.data('onScreen', isOnScreen);
            });
        }
    };

    var _onResize = function(){
        _snapWindow();
    };


    /**
     * A really lightweight plugin wrapper around the constructor,
        preventing against multiple instantiations
     * @param  {Object} options
     * @return {jQuery Object}
     */
    $.fn[pluginName] = function ( options ) {

        $w.scroll(_onScroll);
        $w.resize(_onResize);

        return this.each(function(i) {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new windows( this, options ));
            }
        });
    };

})( jQuery, window, document );