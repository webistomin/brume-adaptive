var navToggle = document.querySelector('.page-header__toggle');
var navMain = document.querySelector('.main-nav');

navToggle.addEventListener('click', function() {
  if (navMain.classList.contains('main-nav--closed')) {
    navMain.classList.remove('main-nav--closed');
    navMain.classList.add('main-nav--opened');
    navToggle.classList.add('page-header__toggle--opened')
  } else {
    navMain.classList.add('main-nav--closed');
    navMain.classList.remove('main-nav--opened');
    navToggle.classList.remove('page-header__toggle--opened');
  }
});

!function(e,t){"use strict";"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?module.exports=t():e.MediaBox=t()}(this,function(){"use strict";var e=function(t){return this&&this instanceof e?!!t&&(this.selector=t instanceof NodeList?t:document.querySelectorAll(t),this.root=document.querySelector("body"),void this.run()):new e(t)};return e.prototype={run:function(){Array.prototype.forEach.call(this.selector,function(e){e.addEventListener("click",function(t){t.preventDefault();var o=this.parseUrl(e.getAttribute("href"));this.render(o),this.events()}.bind(this),!1)}.bind(this)),this.root.addEventListener("keyup",function(e){27===(e.keyCode||e.which)&&this.close(this.root.querySelector(".mediabox-wrap"))}.bind(this),!1)},template:function(e,t){var o;for(o in t)t.hasOwnProperty(o)&&(e=e.replace(new RegExp("{"+o+"}","g"),t[o]));return e},parseUrl:function(e){var t,o={};return(t=e.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/))?(o.provider="youtube",o.id=t[2]):(t=e.match(/https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/))?(o.provider="vimeo",o.id=t[3]):(o.provider="Unknown",o.id=""),o},render:function(e){var t,o;if("youtube"===e.provider)t="https://www.youtube.com/embed/"+e.id;else{if("vimeo"!==e.provider)throw new Error("Invalid video URL");t="https://player.vimeo.com/video/"+e.id}o=this.template('<div class="mediabox-wrap" role="dialog" aria-hidden="false"><div class="mediabox-content" role="document" tabindex="0"><span id="mediabox-esc" class="mediabox-close" aria-label="close" tabindex="1"></span><iframe src="{embed}?autoplay=1" frameborder="0" allowfullscreen></iframe></div></div>',{embed:t}),this.lastFocusElement=document.activeElement,this.root.insertAdjacentHTML("beforeend",o),document.body.classList.add("stop-scroll")},events:function(){var e=document.querySelector(".mediabox-wrap"),t=document.querySelector(".mediabox-content");e.addEventListener("click",function(t){(t.target&&"SPAN"===t.target.nodeName&&"mediabox-close"===t.target.className||"DIV"===t.target.nodeName&&"mediabox-wrap"===t.target.className||"mediabox-content"===t.target.className&&"IFRAME"!==t.target.nodeName)&&this.close(e)}.bind(this),!1),document.addEventListener("focus",function(e){t&&!t.contains(e.target)&&(e.stopPropagation(),t.focus())},!0),t.addEventListener("keypress",function(t){13===t.keyCode&&this.close(e)}.bind(this),!1)},close:function(e){if(null===e)return!0;var t=null;t&&clearTimeout(t),e.classList.add("mediabox-hide"),t=setTimeout(function(){var e=document.querySelector(".mediabox-wrap");null!==e&&(document.body.classList.remove("stop-scroll"),this.root.removeChild(e),this.lastFocusElement.focus())}.bind(this),500)}},e});
MediaBox('.mediabox');

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return factory(root);
    });
  } else if (typeof exports === 'object') {
    module.exports = factory(root);
  } else {
    root.SmoothScroll = factory(root);
  }
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function (window) {

  'use strict';

  //
  // Default settings
  //

  var defaults = {
    // Selectors
    ignore: '[data-scroll-ignore]',
    header: null,
    topOnEmptyHash: true,

    // Speed & Easing
    speed: 500,
    clip: true,
    offset: 0,
    easing: 'easeInOutCubic',
    customEasing: null,

    // History
    updateURL: true,
    popstate: true,

    // Custom Events
    emitEvents: true
  };


  //
  // Utility Methods
  //

  /**
   * Check if browser supports required methods
   * @return {Boolean} Returns true if all required methods are supported
   */
  var supports = function () {
    return (
      'querySelector' in document &&
      'addEventListener' in window &&
      'requestAnimationFrame' in window &&
      'closest' in window.Element.prototype
    );
  };

  /**
   * Merge two or more objects. Returns a new object.
   * @param {Object}   objects  The objects to merge together
   * @returns {Object}          Merged values of defaults and options
   */
  var extend = function () {

    // Variables
    var extended = {};

    // Merge the object into the extended object
    var merge = function (obj) {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          extended[prop] = obj[prop];
        }
      }
    };

    // Loop through each object and conduct a merge
    for (var i = 0; i < arguments.length; i++) {
      merge(arguments[i]);
    }

    return extended;

  };

  /**
   * Check to see if user prefers reduced motion
   * @param  {Object} settings Script settings
   */
  var reduceMotion = function (settings) {
    if ('matchMedia' in window && window.matchMedia('(prefers-reduced-motion)').matches) {
      return true;
    }
    return false;
  };

  /**
   * Get the height of an element.
   * @param  {Node} elem The element to get the height of
   * @return {Number}    The element's height in pixels
   */
  var getHeight = function (elem) {
    return parseInt(window.getComputedStyle(elem).height, 10);
  };

  /**
   * Decode a URI, with error check
   * @param  {String} hash The URI to decode
   * @return {String}      A decoded URI (or the original string if an error is thrown)
   */
  var decode = function (hash) {
    var decoded;
    try {
      decoded = decodeURIComponent(hash);
    } catch(e) {
      decoded = hash;
    }
    return decoded;
  };

  /**
   * Escape special characters for use with querySelector
   * @author Mathias Bynens
   * @link https://github.com/mathiasbynens/CSS.escape
   * @param {String} id The anchor ID to escape
   */
  var escapeCharacters = function (id) {

    // Remove leading hash
    if (id.charAt(0) === '#') {
      id = id.substr(1);
    }

    var string = String(id);
    var length = string.length;
    var index = -1;
    var codeUnit;
    var result = '';
    var firstCodeUnit = string.charCodeAt(0);
    while (++index < length) {
      codeUnit = string.charCodeAt(index);
      // Note: there’s no need to special-case astral symbols, surrogate
      // pairs, or lone surrogates.

      // If the character is NULL (U+0000), then throw an
      // `InvalidCharacterError` exception and terminate these steps.
      if (codeUnit === 0x0000) {
        throw new InvalidCharacterError(
          'Invalid character: the input contains U+0000.'
        );
      }

      if (
        // If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
      // U+007F, […]
        (codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
        // If the character is the first character and is in the range [0-9]
        // (U+0030 to U+0039), […]
        (index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
        // If the character is the second character and is in the range [0-9]
        // (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
        (
          index === 1 &&
          codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
          firstCodeUnit === 0x002D
        )
      ) {
        // http://dev.w3.org/csswg/cssom/#escape-a-character-as-code-point
        result += '\\' + codeUnit.toString(16) + ' ';
        continue;
      }

      // If the character is not handled by one of the above rules and is
      // greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
      // is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
      // U+005A), or [a-z] (U+0061 to U+007A), […]
      if (
        codeUnit >= 0x0080 ||
        codeUnit === 0x002D ||
        codeUnit === 0x005F ||
        codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
        codeUnit >= 0x0041 && codeUnit <= 0x005A ||
        codeUnit >= 0x0061 && codeUnit <= 0x007A
      ) {
        // the character itself
        result += string.charAt(index);
        continue;
      }

      // Otherwise, the escaped character.
      // http://dev.w3.org/csswg/cssom/#escape-a-character
      result += '\\' + string.charAt(index);

    }

    // Return sanitized hash
    var hash;
    try {
      hash = decodeURIComponent('#' + result);
    } catch(e) {
      hash = '#' + result;
    }
    return hash;

  };

  /**
   * Calculate the easing pattern
   * @link https://gist.github.com/gre/1650294
   * @param {String} type Easing pattern
   * @param {Number} time Time animation should take to complete
   * @returns {Number}
   */
  var easingPattern = function (settings, time) {
    var pattern;

    // Default Easing Patterns
    if (settings.easing === 'easeInQuad') pattern = time * time; // accelerating from zero velocity
    if (settings.easing === 'easeOutQuad') pattern = time * (2 - time); // decelerating to zero velocity
    if (settings.easing === 'easeInOutQuad') pattern = time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time; // acceleration until halfway, then deceleration
    if (settings.easing === 'easeInCubic') pattern = time * time * time; // accelerating from zero velocity
    if (settings.easing === 'easeOutCubic') pattern = (--time) * time * time + 1; // decelerating to zero velocity
    if (settings.easing === 'easeInOutCubic') pattern = time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1; // acceleration until halfway, then deceleration
    if (settings.easing === 'easeInQuart') pattern = time * time * time * time; // accelerating from zero velocity
    if (settings.easing === 'easeOutQuart') pattern = 1 - (--time) * time * time * time; // decelerating to zero velocity
    if (settings.easing === 'easeInOutQuart') pattern = time < 0.5 ? 8 * time * time * time * time : 1 - 8 * (--time) * time * time * time; // acceleration until halfway, then deceleration
    if (settings.easing === 'easeInQuint') pattern = time * time * time * time * time; // accelerating from zero velocity
    if (settings.easing === 'easeOutQuint') pattern = 1 + (--time) * time * time * time * time; // decelerating to zero velocity
    if (settings.easing === 'easeInOutQuint') pattern = time < 0.5 ? 16 * time * time * time * time * time : 1 + 16 * (--time) * time * time * time * time; // acceleration until halfway, then deceleration

    // Custom Easing Patterns
    if (!!settings.customEasing) pattern = settings.customEasing(time);

    return pattern || time; // no easing, no acceleration
  };

  /**
   * Determine the document's height
   * @returns {Number}
   */
  var getDocumentHeight = function () {
    return Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
  };

  /**
   * Calculate how far to scroll
   * Clip support added by robjtede - https://github.com/cferdinandi/smooth-scroll/issues/405
   * @param {Element} anchor       The anchor element to scroll to
   * @param {Number}  headerHeight Height of a fixed header, if any
   * @param {Number}  offset       Number of pixels by which to offset scroll
   * @param {Boolean} clip         If true, adjust scroll distance to prevent abrupt stops near the bottom of the page
   * @returns {Number}
   */
  var getEndLocation = function (anchor, headerHeight, offset, clip) {
    var location = 0;
    if (anchor.offsetParent) {
      do {
        location += anchor.offsetTop;
        anchor = anchor.offsetParent;
      } while (anchor);
    }
    location = Math.max(location - headerHeight - offset, 0);
    if (clip) {
      location = Math.min(location, getDocumentHeight() - window.innerHeight);
    }
    return location;
  };

  /**
   * Get the height of the fixed header
   * @param  {Node}   header The header
   * @return {Number}        The height of the header
   */
  var getHeaderHeight = function (header) {
    return !header ? 0 : (getHeight(header) + header.offsetTop);
  };

  /**
   * Update the URL
   * @param  {Node}    anchor  The anchor that was scrolled to
   * @param  {Boolean} isNum   If true, anchor is a number
   * @param  {Object}  options Settings for Smooth Scroll
   */
  var updateURL = function (anchor, isNum, options) {

    // Bail if the anchor is a number
    if (isNum) return;

    // Verify that pushState is supported and the updateURL option is enabled
    if (!history.pushState || !options.updateURL) return;

    // Update URL
    history.pushState(
      {
        smoothScroll: JSON.stringify(options),
        anchor: anchor.id
      },
      document.title,
      anchor === document.documentElement ? '#top' : '#' + anchor.id
    );

  };

  /**
   * Bring the anchored element into focus
   * @param {Node}     anchor      The anchor element
   * @param {Number}   endLocation The end location to scroll to
   * @param {Boolean}  isNum       If true, scroll is to a position rather than an element
   */
  var adjustFocus = function (anchor, endLocation, isNum) {

    // Is scrolling to top of page, blur
    if (anchor === 0) {
      document.body.focus();
    }

    // Don't run if scrolling to a number on the page
    if (isNum) return;

    // Otherwise, bring anchor element into focus
    anchor.focus();
    if (document.activeElement !== anchor) {
      anchor.setAttribute('tabindex', '-1');
      anchor.focus();
      anchor.style.outline = 'none';
    }
    window.scrollTo(0 , endLocation);

  };

  /**
   * Emit a custom event
   * @param  {String} type    The event type
   * @param  {Object} options The settings object
   * @param  {Node}   anchor  The anchor element
   * @param  {Node}   toggle  The toggle element
   */
  var emitEvent = function (type, options, anchor, toggle) {
    if (!options.emitEvents || typeof window.CustomEvent !== 'function') return;
    var event = new CustomEvent(type, {
      bubbles: true,
      detail: {
        anchor: anchor,
        toggle: toggle
      }
    });
    document.dispatchEvent(event);
  };


  //
  // SmoothScroll Constructor
  //

  var SmoothScroll = function (selector, options) {

    //
    // Variables
    //

    var smoothScroll = {}; // Object for public APIs
    var settings, anchor, toggle, fixedHeader, headerHeight, eventTimeout, animationInterval;


    //
    // Methods
    //

    /**
     * Cancel a scroll-in-progress
     */
    smoothScroll.cancelScroll = function (noEvent) {
      cancelAnimationFrame(animationInterval);
      animationInterval = null;
      if (noEvent) return;
      emitEvent('scrollCancel', settings);
    };

    /**
     * Start/stop the scrolling animation
     * @param {Node|Number} anchor  The element or position to scroll to
     * @param {Element}     toggle  The element that toggled the scroll event
     * @param {Object}      options
     */
    smoothScroll.animateScroll = function (anchor, toggle, options) {

      // Local settings
      var animateSettings = extend(settings || defaults, options || {}); // Merge user options with defaults

      // Selectors and variables
      var isNum = Object.prototype.toString.call(anchor) === '[object Number]' ? true : false;
      var anchorElem = isNum || !anchor.tagName ? null : anchor;
      if (!isNum && !anchorElem) return;
      var startLocation = window.pageYOffset; // Current location on the page
      if (animateSettings.header && !fixedHeader) {
        // Get the fixed header if not already set
        fixedHeader = document.querySelector(animateSettings.header);
      }
      if (!headerHeight) {
        // Get the height of a fixed header if one exists and not already set
        headerHeight = getHeaderHeight(fixedHeader);
      }
      var endLocation = isNum ? anchor : getEndLocation(anchorElem, headerHeight, parseInt((typeof animateSettings.offset === 'function' ? animateSettings.offset(anchor, toggle) : animateSettings.offset), 10), animateSettings.clip); // Location to scroll to
      var distance = endLocation - startLocation; // distance to travel
      var documentHeight = getDocumentHeight();
      var timeLapsed = 0;
      var start, percentage, position;

      /**
       * Stop the scroll animation when it reaches its target (or the bottom/top of page)
       * @param {Number} position Current position on the page
       * @param {Number} endLocation Scroll to location
       * @param {Number} animationInterval How much to scroll on this loop
       */
      var stopAnimateScroll = function (position, endLocation) {

        // Get the current location
        var currentLocation = window.pageYOffset;

        // Check if the end location has been reached yet (or we've hit the end of the document)
        if (position == endLocation || currentLocation == endLocation || ((startLocation < endLocation && window.innerHeight + currentLocation) >= documentHeight)) {

          // Clear the animation timer
          smoothScroll.cancelScroll(true);

          // Bring the anchored element into focus
          adjustFocus(anchor, endLocation, isNum);

          // Emit a custom event
          emitEvent('scrollStop', animateSettings, anchor, toggle);

          // Reset start
          start = null;
          animationInterval = null;

          return true;

        }
      };

      /**
       * Loop scrolling animation
       */
      var loopAnimateScroll = function (timestamp) {
        if (!start) { start = timestamp; }
        timeLapsed += timestamp - start;
        percentage = (timeLapsed / parseInt(animateSettings.speed, 10));
        percentage = (percentage > 1) ? 1 : percentage;
        position = startLocation + (distance * easingPattern(animateSettings, percentage));
        window.scrollTo(0, Math.floor(position));
        if (!stopAnimateScroll(position, endLocation)) {
          animationInterval = window.requestAnimationFrame(loopAnimateScroll);
          start = timestamp;
        }
      };

      /**
       * Reset position to fix weird iOS bug
       * @link https://github.com/cferdinandi/smooth-scroll/issues/45
       */
      if (window.pageYOffset === 0) {
        window.scrollTo(0, 0);
      }

      // Update the URL
      updateURL(anchor, isNum, animateSettings);

      // Emit a custom event
      emitEvent('scrollStart', animateSettings, anchor, toggle);

      // Start scrolling animation
      smoothScroll.cancelScroll(true);
      window.requestAnimationFrame(loopAnimateScroll);

    };

    /**
     * If smooth scroll element clicked, animate scroll
     */
    var clickHandler = function (event) {

      // Don't run if the user prefers reduced motion
      if (reduceMotion(settings)) return;

      // Don't run if right-click or command/control + click
      if (event.button !== 0 || event.metaKey || event.ctrlKey) return;

      // Check if event.target has closest() method
      // By @totegi - https://github.com/cferdinandi/smooth-scroll/pull/401/
      if(!('closest' in event.target))return;

      // Check if a smooth scroll link was clicked
      toggle = event.target.closest(selector);
      if (!toggle || toggle.tagName.toLowerCase() !== 'a' || event.target.closest(settings.ignore)) return;

      // Only run if link is an anchor and points to the current page
      if (toggle.hostname !== window.location.hostname || toggle.pathname !== window.location.pathname || !/#/.test(toggle.href)) return;

      // Get an escaped version of the hash
      var hash = escapeCharacters(decode(toggle.hash));

      // Get the anchored element
      var anchor = settings.topOnEmptyHash && hash === '#' ? document.documentElement : document.querySelector(hash);
      anchor = !anchor && hash === '#top' ? document.documentElement : anchor;

      // If anchored element exists, scroll to it
      if (!anchor) return;
      event.preventDefault();
      smoothScroll.animateScroll(anchor, toggle);

    };

    /**
     * Animate scroll on popstate events
     */
    var popstateHandler = function (event) {

      // Only run if state is a popstate record for this instantiation
      if (!history.state.smoothScroll || history.state.smoothScroll !== JSON.stringify(settings)) return;

      // Only run if state includes an anchor
      if (!history.state.anchor) return;

      // Get the anchor
      var anchor = document.querySelector(escapeCharacters(decode(history.state.anchor)));
      if (!anchor) return;

      // Animate scroll to anchor link
      smoothScroll.animateScroll(anchor, null, {updateURL: false});

    };

    /**
     * On window scroll and resize, only run events at a rate of 15fps for better performance
     */
    var resizeThrottler = function (event) {
      if (!eventTimeout) {
        eventTimeout = setTimeout(function() {
          eventTimeout = null; // Reset timeout
          headerHeight = getHeaderHeight(fixedHeader); // Get the height of a fixed header if one exists
        }, 66);
      }
    };

    /**
     * Destroy the current initialization.
     */
    smoothScroll.destroy = function () {

      // If plugin isn't already initialized, stop
      if (!settings) return;

      // Remove event listeners
      document.removeEventListener('click', clickHandler, false);
      window.removeEventListener('resize', resizeThrottler, false);
      window.removeEventListener('popstate', popstateHandler, false);

      // Cancel any scrolls-in-progress
      smoothScroll.cancelScroll();

      // Reset variables
      settings = null;
      anchor = null;
      toggle = null;
      fixedHeader = null;
      headerHeight = null;
      eventTimeout = null;
      animationInterval = null;

    };

    /**
     * Initialize Smooth Scroll
     * @param {Object} options User settings
     */
    smoothScroll.init = function (options) {

      // feature test
      if (!supports()) throw 'Smooth Scroll: This browser does not support the required JavaScript methods and browser APIs.';

      // Destroy any existing initializations
      smoothScroll.destroy();

      // Selectors and variables
      settings = extend(defaults, options || {}); // Merge user options with defaults
      fixedHeader = settings.header ? document.querySelector(settings.header) : null; // Get the fixed header
      headerHeight = getHeaderHeight(fixedHeader);

      // When a toggle is clicked, run the click handler
      document.addEventListener('click', clickHandler, false);

      // If window is resized and there's a fixed header, recalculate its size
      if (fixedHeader) {
        window.addEventListener('resize', resizeThrottler, false);
      }

      // If updateURL and popState are enabled, listen for pop events
      if (settings.updateURL && settings.popstate) {
        window.addEventListener('popstate', popstateHandler, false);
      }

    };


    //
    // Initialize plugin
    //

    smoothScroll.init(options);


    //
    // Public APIs
    //

    return smoothScroll;

  };

  return SmoothScroll;

});

var scroll = new SmoothScroll('a[data-scroll]:not([data-tab])');

!(function(t,e){"function"==typeof define&&define.amd?define([],e(t)):"object"==typeof exports?module.exports=e(t):t.tabby=e(t)})("undefined"!=typeof global?global:this.window||this.global,(function(t){"use strict";var e,o,n={},a="querySelector"in document&&"addEventListener"in t&&"classList"in document.createElement("_")&&"onhashchange"in t,r={selectorToggle:"[data-tab]",selectorToggleGroup:"[data-tabs]",selectorContent:"[data-tabs-pane]",selectorContentGroup:"[data-tabs-content]",toggleActiveClass:"active",contentActiveClass:"active",initClass:"js-tabby",stopVideo:!0,callback:function(){}},c=function(t,e,o){if("[object Object]"===Object.prototype.toString.call(t))for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&e.call(o,t[n],n,t);else for(var a=0,r=t.length;a<r;a++)e.call(o,t[a],a,t)},s=function(){var t={},e=!1,o=0,n=arguments.length;"[object Boolean]"===Object.prototype.toString.call(arguments[0])&&(e=arguments[0],o++);for(var a=function(o){for(var n in o)Object.prototype.hasOwnProperty.call(o,n)&&(e&&"[object Object]"===Object.prototype.toString.call(o[n])?t[n]=s(!0,t[n],o[n]):t[n]=o[n])};o<n;o++){var r=arguments[o];a(r)}return t},i=function(t,e){for(Element.prototype.matches||(Element.prototype.matches=Element.prototype.matchesSelector||Element.prototype.mozMatchesSelector||Element.prototype.msMatchesSelector||Element.prototype.oMatchesSelector||Element.prototype.webkitMatchesSelector||function(t){for(var e=(this.document||this.ownerDocument).querySelectorAll(t),o=e.length;--o>=0&&e.item(o)!==this;);return o>-1});t&&t!==document;t=t.parentNode)if(t.matches(e))return t;return null},l=function(t){"#"===t.charAt(0)&&(t=t.substr(1));for(var e,o=String(t),n=o.length,a=-1,r="",c=o.charCodeAt(0);++a<n;){if(e=o.charCodeAt(a),0===e)throw new InvalidCharacterError("Invalid character: the input contains U+0000.");r+=e>=1&&e<=31||127==e||0===a&&e>=48&&e<=57||1===a&&e>=48&&e<=57&&45===c?"\\"+e.toString(16)+" ":e>=128||45===e||95===e||e>=48&&e<=57||e>=65&&e<=90||e>=97&&e<=122?o.charAt(a):"\\"+o.charAt(a)}return"#"+r},u=function(t,e){if(e.stopVideo&&!t.classList.contains(e.contentActiveClass)){var o=t.querySelector("iframe"),n=t.querySelector("video");if(o){var a=o.src;o.src=a}n&&n.pause()}},d=function(e,o){if(!e.hasAttribute("data-tab-no-focus")){if(!e.classList.contains(o.contentActiveClass))return void(e.hasAttribute("data-tab-focused")&&e.removeAttribute("tabindex"));var n={x:t.pageXOffset,y:t.pageYOffset};e.focus(),document.activeElement.id!==e.id&&(e.setAttribute("tabindex","-1"),e.setAttribute("data-tab-focused",!0),e.focus()),t.scrollTo(n.x,n.y)}},f=function(t,e){var o=i(t,e.selectorToggleGroup);if(o){var n,a=o.querySelectorAll(e.selectorToggle);c(a,(function(o){return o.hash===t.hash?(o.classList.add(e.toggleActiveClass),n=i(o,"li"),void(n&&n.classList.add(e.toggleActiveClass))):(o.classList.remove(e.toggleActiveClass),n=i(o,"li"),void(n&&n.classList.remove(e.toggleActiveClass)))}))}},v=function(t,e){var o=document.querySelector(l(t));if(o){var n=i(o,e.selectorContentGroup);if(n){var a=n.querySelectorAll(e.selectorContent);c(a,(function(o){return o.id===t.substring(1)?(o.classList.add(e.contentActiveClass),void d(o,e)):(o.classList.remove(e.contentActiveClass),u(o,e),void d(o,e))}))}}};n.toggleTab=function(t,o,n){var a=s(e||r,n||{}),c=document.querySelectorAll(l(t));v(t,a),o&&f(o,a),a.callback(c,o)};var h=function(a){var r=t.location.hash;if(o&&(o.id=o.getAttribute("data-tab-id"),o=null),r){var c=document.querySelector(e.selectorToggle+'[href*="'+r+'"]');n.toggleTab(r,c)}},b=function(n){if(0===n.button&&!n.metaKey&&!n.ctrlKey){var a=i(n.target,e.selectorToggle);if(a&&a.hash){if(a.hash===t.location.hash)return void n.preventDefault();o=document.querySelector(a.hash),o&&(o.setAttribute("data-tab-id",o.id),o.id="")}}},m=function(t){if(o=i(t.target,e.selectorContent),o&&!o.classList.contains(e.contentActiveClass)){var n=o.id;o.setAttribute("data-tab-id",n),o.setAttribute("data-tab-no-focus",!0),o.id="",location.hash=n}};return n.destroy=function(){e&&(document.documentElement.classList.remove(e.initClass),document.removeEventListener("click",b,!1),document.removeEventListener("focus",m,!0),t.removeEventListener("hashchange",h,!1),e=null,o=null)},n.init=function(o){a&&(n.destroy(),e=s(r,o||{}),document.documentElement.classList.add(e.initClass),document.addEventListener("click",b,!1),document.addEventListener("focus",m,!0),t.addEventListener("hashchange",h,!1),h())},n}));
tabby.init();
