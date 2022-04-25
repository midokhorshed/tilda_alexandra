/**
 * Плагин с подсказками предназначен для добавление подсказок при наведении(нажатии) на указанные элементы
 * Данный скрипт подлкючается в блоках T198 и в интерфейсе режима редактирования Zero Block
 */

/*

Tooltipster 3.3.0 | 2014-11-08
A rockin' custom tooltip jQuery plugin

Developed by Caleb Jacob under the MIT license http://opensource.org/licenses/MIT

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/* eslint-disable */

/* Github: https://github.com/calebjacob/tooltipster */

(function() {
	var pluginName = 'tooltipster';
	var defaults = {
			animation: 'fade',
			arrow: true,
			arrowColor: '',
			autoClose: true,
			content: null,
			contentAsHTML: false,
			contentCloning: true,
			debug: true,
			delay: 200,
			minWidth: 0,
			maxWidth: null,
			functionInit: function(origin, content) {},
			functionBefore: function(origin, continueTooltip) {
				continueTooltip();
			},
			functionReady: function(origin, tooltip) {},
			functionAfter: function(origin) {},
			hideOnClick: false,
			icon: '(?)',
			iconCloning: true,
			iconDesktop: false,
			iconTouch: false,
			iconTheme: 'tooltipster-icon',
			interactive: false,
			interactiveTolerance: 350,
			multiple: false,
			offsetX: 0,
			offsetY: 0,
			onlyOne: false,
			position: 'top',
			positionTracker: false,
			positionTrackerCallback: function(origin) {
				// the default tracker callback will close the tooltip when the trigger is
				// 'hover' (see https://github.com/iamceege/tooltipster/pull/253)
				if (this.option('trigger') === 'hover' && this.option('autoClose')) {
					this.hide();
				}
			},
			restoration: 'current',
			speed: 350,
			timer: 0,
			theme: 'tooltipster-default',
			touchDevices: true,
			trigger: 'hover',
			updateAnimation: true
		};

	function Plugin(element, options) {
		// list of instance variables
		this.bodyOverflowX;
		// stack of custom callbacks provided as parameters to API methods
		this.callbacks = {
			hide: [],
			show: []
		};
		this.checkInterval = null;
		// this will be the user content shown in the tooltip. A capital "C" is used because there is also a method called content()
		this.Content;
		// this is the original element which is being applied the tooltipster plugin
		this.element = element;
		// this will be the element which triggers the appearance of the tooltip on hover/click/custom events.
		// it will be the same as this.element if icons are not used (see in the options), otherwise it will correspond to the created icon
		this.elementProxy;
		this.elementProxyPosition;
		this.enabled = true;
		this.options = t_extend({}, defaults, options);
		this.mouseIsOverProxy = false;
		// a unique namespace per instance, for easy selective unbinding
		this.namespace = 'tooltipster-' + Math.round(Math.random() * 100000);
		// Status (capital S) can be either : appearing, shown, disappearing, hidden
		this.Status = 'hidden';
		this.timerHide = null;
		this.timerShow = null;
		// this will be the tooltip element (jQuery wrapped HTML element)
		this.tooltip;
		// for backward compatibility
		this.options.iconTheme = this.options.iconTheme.replace('.', '');
		this.options.theme = this.options.theme.replace('.', '');
		// save events
		this.windowEvents = {};
		this.documentEvents = {};
		this.elementProxyEvents = {};
		// launch
		this._init();
	}

	Plugin.prototype = {
		_init: function() {
			var self = this;

			// disable the plugin on old browsers (including IE7 and lower)
			if (document.querySelector) {
				// note : the content is null (empty) by default and can stay that way if the plugin remains initialized but not fed any content. The tooltip will just not appear.
				// let's save the initial value of the title attribute for later restoration if need be.
				var initialTitle = null;
				// it will already have been saved in case of multiple tooltips
				if (!self.element['tooltipster-initialTitle']) {
					initialTitle = self.element.getAttribute('title');

					// we do not want initialTitle to have the value "undefined" because of how jQuery's .data() method works
					if (!initialTitle) initialTitle = null;

					self.element['tooltipster-initialTitle'] = initialTitle;
				}

				// if content is provided in the options, its has precedence over the title attribute.
				// Note : an empty string is considered content, only 'null' represents the absence of content.
				// Also, an existing title="" attribute will result in an empty string content
				if (self.options.content !== null) {
					self._content_set(self.options.content);
				} else {
					self._content_set(initialTitle);
				}

				var customFunction = self.options.functionInit.call(self.element, self.element, self.Content);

				if (typeof customFunction !== 'undefined') self._content_set(customFunction);

				// strip the title off of the element to prevent the default tooltips from popping up
				self.element.removeAttribute('title');
				// to be able to find all instances on the page later (upon window events in particular)
				t_addClass(self.element, 'tooltipstered');

				// detect if we're changing the tooltip origin to an icon
				// note about this condition : if the device has touch capability and self.options.iconTouch is false, you'll have no icons event though you may consider your device as a desktop if it also has a mouse. Not sure why someone would have this use case though.
				if ((!deviceHasTouchCapability && self.options.iconDesktop) || (deviceHasTouchCapability && self.options.iconTouch)) {
					// Until it's done, the icon feature does not really make sense since the user still has most of the work to do by himself
					// if the icon provided is in the form of a string
					if (typeof self.options.icon === 'string') {
						// wrap it in a span with the icon class
						self.elementProxy = document.createElement('span');
						t_addClass(self.elementProxy, self.options.iconTheme);
						self.elementProxy.textContent = self.options.icon;
					} else {
						// if it is an object (sensible choice)
						// (deep) clone the object if iconCloning == true, to make sure every instance has its own proxy. We use the icon without wrapping, no need to. We do not give it a class either, as the user will undoubtedly style the object on his own and since our css properties may conflict with his own
						if (self.options.iconCloning) {
							self.elementProxy = self.options.icon.cloneNode(true);
						} else {
							self.elementProxy = self.options.icon;
						}
					}

					self.elementProxy.appendChild(self.element);
				} else {
					self.elementProxy = self.element;
				}

				// for 'click' and 'hover' triggers : bind on events to open the tooltip. Closing is now handled in _showNow() because of its bindings.
				// Notes about touch events :
					// - mouseenter, mouseleave and clicks happen even on pure touch devices because they are emulated. deviceIsPureTouch() is a simple attempt to detect them.
					// - on hybrid devices, we do not prevent touch gesture from opening tooltips. It would be too complex to differentiate real mouse events from emulated ones.
					// - we check deviceIsPureTouch() at each event rather than prior to binding because the situation may change during browsing
				if (self.options.trigger === 'hover') {
					// these binding are for mouse interaction only
					/**
					 * Save call event mouseenter for later removal
					 */
					function elementProxyMouseEnter() {
						if (!deviceIsPureTouch() || self.options.touchDevices) {

							self.mouseIsOverProxy = true;
							self._show();
						}
					}

					/**
					 * Save call event mouseleave for later removal
					 */
					function elementProxyMouseLeave() {
						if (!deviceIsPureTouch() || self.options.touchDevices) {
							self.mouseIsOverProxy = false;
						}
					}

					var elementProxyMouseEnterEvent = elementProxyMouseEnter.bind(self);
					var elementProxyMouseLeaveEvent = elementProxyMouseLeave.bind(self);

					self.elementProxyEvents['mouseenter'] = elementProxyMouseEnterEvent;
					self.elementProxyEvents['mouseleave'] = elementProxyMouseLeaveEvent;
					self.elementProxy.addEventListener('mouseenter', elementProxyMouseEnterEvent);
					self.elementProxy.addEventListener('mouseleave', elementProxyMouseLeaveEvent);

					// for touch interaction only
					if (deviceHasTouchCapability && self.options.touchDevices) {
						// for touch devices, we immediately display the tooltip because we cannot rely on mouseleave to handle the delay
						var elementProxyTouchStartEvent = self._showNow.bind(self, '');

						self.elementProxyEvents['touchstart'] = elementProxyTouchStartEvent;
						self.elementProxy.addEventListener('touchstart', elementProxyTouchStartEvent);
					}
				} else if (self.options.trigger === 'click') {
					// note : for touch devices, we do not bind on touchstart, we only rely on the emulated clicks (triggered by taps)
					/**
					 * Save call event click for later removal
					 */
					function elementProxyClick() {
						if (!deviceIsPureTouch() || self.options.touchDevices) {
							self._show();
						}
					}

					var elementProxyClickEvent = elementProxyClick.bind(self, '');

					self.elementProxyEvents['click'] = elementProxyClickEvent;
					self.elementProxy.addEventListener('touchstart', elementProxyClickEvent);
				}
			}
		},

		// this function will schedule the opening of the tooltip after the delay, if there is one
		_show: function() {
			var self = this;

			if (self.Status !== 'shown' && self.Status !== 'appearing') {
				if (self.options.delay) {
					self.timerShow = setTimeout(function() {
						// for hover trigger, we check if the mouse is still over the proxy, otherwise we do not show anything
						if (self.options.trigger === 'click' || (self.options.trigger === 'hover' && self.mouseIsOverProxy)) {
							self._showNow();
						}
					}, self.options.delay);
				} else {
					self._showNow();
				}
			}
		},

		// this function will open the tooltip right away
		_showNow: function(callback) {
			var self = this;
			var body = document.body || document.documentElement;
			// call our constructor custom function before continuing
			self.options.functionBefore.call(self.element, self.element, function() {
				// continue only if the tooltip is enabled and has any content
				if (self.enabled && self.Content !== null) {
					// save the method callback and cancel hide method callbacks
					if (callback) self.callbacks.show.push(callback);

					self.callbacks.hide = [];
					//get rid of any appearance timer
					clearTimeout(self.timerShow);
					self.timerShow = null;
					clearTimeout(self.timerHide);
					self.timerHide = null;

					// if we only want one tooltip open at a time, close all auto-closing tooltips currently open and not already disappearing
					if (self.options.onlyOne) {
						var tooltipstereds = document.querySelectorAll('.tooltipstered');

						for (var i = 0; i < tooltipstereds.length; i++) {
							var tooltipstered = tooltipstereds[i];

							if (tooltipstered !== self.element) {
								var arrId = tooltipstered['tooltipster-ns'];

								for (var j = 0; j < arrId.length; j++) {
									var instance = tooltipstered[arrId[j]];
									var status = instance.status();
									var autoClose = instance.option('autoClose');

									if (status !== 'hidden' && status !== 'disappearing' && autoClose) {
										instance.hide();
									}
								}
							};
						}
					}

					/**
			 		 * Calls custom functions after shown
					 */
					function finish() {
						self.Status = 'shown';

						// trigger any show method custom callbacks and reset them
						for (var i = 0; i < self.callbacks.show.length; i++) {
							self.callbacks.show[i].call(self.element);
						}

						self.callbacks.show = [];
					};

					// if this origin already has its tooltip open
					if (self.Status !== 'hidden') {
						// the timer (if any) will start (or restart) right now
						var extraTime = 0;
						// if it was disappearing, cancel that
						if (self.Status === 'disappearing') {
							self.Status = 'appearing';

							if (supportsTransitions()) {
								t_removeClass(self.tooltip, 'tooltipster-dying');
								t_addClass(self.tooltip, 'tooltipster-' + self.options.animation + '-show');

								self.tooltip.addEventListener('animationend', function() {
									finish();
								});
							} else {
								// in case the tooltip was currently fading out, bring it back to life
								t_fadeIn(self.tooltip, self.options.speed, finish);
							}
						} else if (self.Status === 'shown') {
							// if the tooltip is already open, we still need to trigger the method custom callback
							finish();
						}
					} else {
						// if the tooltip isn't already open, open that sucker up!
						self.Status = 'appearing';

						// the timer (if any) will start when the tooltip has fully appeared after its transition
						var extraTime = self.options.speed;

						// disable horizontal scrollbar to keep overflowing tooltips from jacking with it and then restore it to its previous value
						self.bodyOverflowX = getComputedStyle(body, null).overflowX;
						body.style.overflowX = 'hidden';

						// get some other settings related to building the tooltip
						var animation = 'tooltipster-' + self.options.animation;
						var animationSpeed = 	'-webkit-transition-duration: ' + self.options.speed +
												'ms; -webkit-animation-duration: ' + self.options.speed +
												'ms; -moz-transition-duration: ' + self.options.speed +
												'ms; -moz-animation-duration: ' + self.options.speed +
												'ms; -o-transition-duration: ' + self.options.speed +
												'ms; -o-animation-duration: ' + self.options.speed +
												'ms; -ms-transition-duration: ' + self.options.speed +
												'ms; -ms-animation-duration: ' + self.options.speed +
												'ms; transition-duration: ' + self.options.speed +
												'ms; animation-duration: ' + self.options.speed + 'ms;';
						var minWidth = self.options.minWidth ? 'min-width:' + Math.round(self.options.minWidth) + 'px;' : '';
						var maxWidth = self.options.maxWidth ? 'max-width:' + Math.round(self.options.maxWidth) + 'px;' : '';
						var pointerEvents = self.options.interactive ? 'pointer-events: auto;' : '';

						// build the base of our tooltip
						var div = document.createElement('div');

						t_addClass(div, 'tooltipster-base ' + self.options.theme);
						div.style = minWidth + ' ' + maxWidth + ' ' + pointerEvents + ' ' + animationSpeed;
						div.innerHTML = '<div class="tooltipster-content"></div>';

						self.tooltip = div;

						// only add the animation class if the user has a browser that supports animations
						if (supportsTransitions()) t_addClass(self.tooltip, animation);

						// insert the content
						self._content_insert();

						// attach
						body.appendChild(self.tooltip)

						// do all the crazy calculations and positioning
						self.reposition();

						// call our custom callback since the content of the tooltip is now part of the DOM
						self.options.functionReady.call(self.element, self.element, self.tooltip);

						// animate in the tooltip
						if (supportsTransitions()) {
							t_addClass(self.tooltip, animation + '-show');
							/**
							 * Save call event transitionend for later removal after animation completes
							 */
							function animationEvent() {
								finish();
								self.tooltip.removeEventListener('transitionend', animationEvent);
							}

							self.tooltip.addEventListener('transitionend', animationEvent);
						} else {
							self.tooltip.style.display = 'none';
							t_fadeIn(self.tooltip, self.options.speed, finish);
						}

						// will check if our tooltip origin is removed while the tooltip is shown
						self._interval_set();

						// save call function
						var windowEvent = self.reposition.bind(self);

						self.windowEvents['scrollResize'] = windowEvent;

						window.addEventListener('scroll', windowEvent);
						window.addEventListener('resize', windowEvent);

						// auto-close bindings
						if (self.options.autoClose) {
							// in case a listener is already bound for autoclosing (mouse or touch, hover or click), unbind it first
							var documentEvent = self.documentEvents['touchClick'];

							if (documentEvent) {
								body.removeEventListener('click', documentEvent);
								body.removeEventListener('touchstart', documentEvent);
								self.documentEvents['touchClick'] = '';
							}

							// save call function
							documentEvent = self.hide.bind(self, '');
							self.documentEvents['touchClick'] = documentEvent;

							// here we'll have to set different sets of bindings for both touch and mouse
							if (self.options.trigger === 'hover') {
								// if the user touches the body, hide
								if (deviceHasTouchCapability) {
									// timeout 0 : explanation below in click section
									setTimeout(function() {
										// we don't want to bind on click here because the initial touchstart event has not yet triggered its click event, which is thus about to happen
										body.addEventListener('touchstart', documentEvent);
									}, 0);
								}

								// if we have to allow interaction
								if (self.options.interactive) {
									// touch events inside the tooltip must not close it
									if (deviceHasTouchCapability) {
										self.tooltip.addEventListener('touchstart', function(event) {
											event = event || window.event;
											event.stopPropagation();
										});
									}

									// as for mouse interaction, we get rid of the tooltip only after the mouse has spent some time out of it
									var tolerance = null;

									/**
									 * Save call event mouseleave for later removal
									 */
									function elementProxyAcMouseLeave() {
										clearTimeout(tolerance);
										tolerance = setTimeout(function(){
											self.hide();
										}, self.options.interactiveTolerance);
									}

									/**
									 * Save call event mouseenter for later removal
									 */
									function elementProxyAcMouseEnter() {
										clearTimeout(tolerance);
									}

									var elementProxyAcMouseLeaveEvent = elementProxyAcMouseLeave.bind(self);
									var elementProxyAcMouseEnterEvent = elementProxyAcMouseEnter.bind(self);

									self.elementProxyEvents['mouseleaveac'] = elementProxyAcMouseLeaveEvent;
									self.elementProxyEvents['mouseenterac'] = elementProxyAcMouseEnterEvent;

									// hide after some time out of the proxy and the tooltip
									self.elementProxy.addEventListener('mouseleave', elementProxyAcMouseLeaveEvent);
									self.tooltip.addEventListener('mouseleave', elementProxyAcMouseLeaveEvent);
									self.elementProxy.addEventListener('mouseenter', elementProxyAcMouseEnterEvent);
									self.tooltip.addEventListener('mouseenter', elementProxyAcMouseEnterEvent);
								} else {
									// if this is a non-interactive tooltip, get rid of it if the mouse leaves
									var elementProxyAcMouseLeaveEvent = self.hide.bind(self, '');

									self.elementProxyEvents['mouseleaveac'] = elementProxyAcMouseLeaveEvent;
									self.elementProxy.addEventListener('mouseleave', elementProxyAcMouseLeaveEvent);
								}

								// close the tooltip when the proxy gets a click (common behavior of native tooltips)
								if (self.options.hideOnClick) {
									var elementProxyAcClickEvent = self.hide.bind(self, '');

									self.elementProxyEvents['clickac'] = elementProxyAcClickEvent;
									self.elementProxy.addEventListener('click', elementProxyAcClickEvent);
								}
							} else if (self.options.trigger === 'click') {
								// here we'll set the same bindings for both clicks and touch on the body to hide the tooltip
								// use a timeout to prevent immediate closing if the method was called on a click event and if options.delay == 0 (because of bubbling)
								setTimeout(function() {
									body.addEventListener('click', documentEvent);
									body.addEventListener('touchstart', documentEvent);
								}, 0);

								// if interactive, we'll stop the events that were emitted from inside the tooltip to stop autoClosing
								if (self.options.interactive) {
									// note : the touch events will just not be used if the plugin is not enabled on touch devices
									/**
									 * Reset default behavior on links
									 */
									function tooltipStopPropagation(event) {
										event = event || window.event;
										event.stopPropagation();
									}

									self.tooltip.addEventListener('click', tooltipStopPropagation);
									self.tooltip.addEventListener('touchstart', tooltipStopPropagation);
								}
							}
						}
					}

					// if we have a timer set, let the countdown begin
					if (self.options.timer > 0) {

						self.timerHide = setTimeout(function() {
							self.timerHide = null;
							self.hide();
						}, self.options.timer + extraTime);
					}
				}
			});
		},

		_interval_set: function() {
			var self = this;
			var body = document.body || document.documentElement;

			self.checkInterval = setInterval(function() {
				// if the tooltip and/or its interval should be stopped
				if (
					// if the origin has been removed
					!body.contains(self.element) ||
					// if the elementProxy has been removed
					!body.contains(self.elementProxy) ||
					// if the tooltip has been closed
					self.Status == 'hidden' ||
					// if the tooltip has somehow been removed
					!body.contains(self.tooltip)
				) {
					// remove the tooltip if it's still here
					if (self.Status === 'shown' || self.Status === 'appearing') self.hide();

					// clear this interval as it is no longer necessary
					self._interval_cancel();
				} else {
					// if everything is alright
					// compare the former and current positions of the elementProxy to reposition the tooltip if need be
					if (self.options.positionTracker) {
						var position = self._repositionInfo(self.elementProxy);
						var identical = false;

						// compare size first (a change requires repositioning too)
						if (t_areEqual(position.dimension, self.elementProxyPosition.dimension)) {

							// for elements with a fixed position, we track the top and left properties (relative to window)
							if (getComputedStyle(self.elementProxy, null).position === 'fixed') {
								if (t_areEqual(position.position, self.elementProxyPosition.position)) identical = true;
							} else {
								// otherwise, track total offset (relative to document)
								if (t_areEqual(position.offset, self.elementProxyPosition.offset)) identical = true;
							}
						}

						if (!identical) {
							self.reposition();
							self.options.positionTrackerCallback.call(self, self.element);
						}
					}
				}
			}, 200);
		},

		_interval_cancel: function() {
			clearInterval(this.checkInterval);
			// clean delete
			this.checkInterval = null;
		},

		_content_set: function(content) {
			// clone if asked. Cloning the object makes sure that each instance has its own version of the content (in case a same object were provided for several instances)
			// reminder : typeof null === object
			if (typeof content === 'object' && content !== null && this.options.contentCloning) {
				content = content.cloneNode(true);
			}

			this.Content = content;
		},

		_content_insert: function() {
			var self = this;
			var tooltipsterContent = self.tooltip.querySelector('.tooltipster-content');

			if (typeof self.Content === 'string' && !self.options.contentAsHTML) {
				tooltipsterContent.textContent = self.Content;
			} else {
				tooltipsterContent.innerHTML = self.Content;
			}
		},

		_update: function(content) {
			var self = this;
			// change the content
			self._content_set(content);

			if (self.Content !== null) {
				// update the tooltip if it is open
				if (self.Status !== 'hidden') {
					// reset the content in the tooltip
					self._content_insert();
					// reposition and resize the tooltip
					self.reposition();
					// if we want to play a little animation showing the content changed
					if (self.options.updateAnimation) {
						if (supportsTransitions()) {
							var strStyle = 'width:' +
								'-webkit-transition: all ' + self.options.speed + 'ms, width 0ms, height 0ms, left 0ms, top 0ms' +
								'-moz-transition: all ' + self.options.speed + 'ms, width 0ms, height 0ms, left 0ms, top 0ms' +
								'-o-transition: all ' + self.options.speed + 'ms, width 0ms, height 0ms, left 0ms, top 0ms' +
								'-ms-transition: all ' + self.options.speed + 'ms, width 0ms, height 0ms, left 0ms, top 0ms' +
								'transition: all ' + self.options.speed + 'ms, width 0ms, height 0ms, left 0ms, top 0ms';

							self.tooltip.setAttribute('style', strStyle);
							t_addClass(self.tooltip, 'tooltipster-content-changing');

							// reset the CSS transitions and finish the change animation
							setTimeout(function() {
								if (self.Status !== 'hidden') {
									t_removeClass(self.tooltip, 'tooltipster-content-changing');

									var strStyle = '-webkit-transition: ' + self.options.speed + 'ms' +
										'-moz-transition: ' + self.options.speed + 'ms' +
										'-o-transition: ' + self.options.speed + 'ms' +
										'-ms-transition: ' + self.options.speed + 'ms' +
										'transition: ' + self.options.speed + 'ms';

									// after the changing animation has completed, reset the CSS transitions
									setTimeout(function() {
										if (self.Status !== 'hidden') {
											self.tooltip.setAttribute('style', strStyle);
										}
									}, self.options.speed);
								}
							}, self.options.speed);
						} else {
							self.tooltip.fadeTo(self.options.speed, 0.5, function() {
								if (self.Status !== 'hidden') {
									self.tooltip.fadeTo(self.options.speed, 1);
								}
							});
						}
					}
				}
			} else {
				self.hide();
			}
		},

		_repositionInfo: function(element) {
			var elementRect = element.getBoundingClientRect();
			var elementStyle = getComputedStyle(element, null);

			return {
				dimension: {
					height: element.offsetHeight,
					width: element.offsetWidth
				},
				offset: {
					top: elementRect.top + window.pageYOffset,
					left: elementRect.left + window.pageXOffset
				},
				position: {
					left: parseInt(elementStyle.left),
					top: parseInt(elementStyle.top)
				}
			};
		},

		hide: function(callback) {
			var self = this;
			var body = document.body || document.documentElement;

			// save the method custom callback and cancel any show method custom callbacks
			if (callback) self.callbacks.hide.push(callback);
			self.callbacks.show = [];

			// get rid of any appearance timeout
			clearTimeout(self.timerShow);
			self.timerShow = null;
			clearTimeout(self.timerHide);
			self.timerHide = null;

			/**
			 * Calls custom functions after hiding
			 */
			function finishCallbacks() {
				// trigger any hide method custom callbacks and reset them
				for (var i = 0; i < self.callbacks.hide.length; i++) {
					self.callbacks.hide[i].call(self.element);
				}

				self.callbacks.hide = [];
			};

			// hide
			if (self.Status === 'shown' || self.Status === 'appearing') {
				self.Status = 'disappearing';

				/**
				 * Changing tooltip state status after hiding, removing element from DOM tree and removing all handlers
				 */
				function finish() {
					self.Status = 'hidden';

					// detach our content object first, so the next jQuery's remove() call does not unbind its event handlers
					if (typeof self.Content === 'object' && self.Content !== null) {
						if (self.Content && self.Content.parentElement) {
							self.Content = self.Content.parentElement.removeChild(self.Content);
						}
					}

					t_removeEl(self.tooltip);
					self.tooltip = null;

					// unbind orientationchange, scroll and resize listeners
					var windowEvent = self.windowEvents['scrollResize'];

					if (windowEvent) {
						window.removeEventListener('scroll', self.windowEvents['scrollResize']);
						window.removeEventListener('resize', self.windowEvents['scrollResize']);
						self.windowEvents['scrollResize'] = '';
					}

					// unbind any auto-closing click/touch listeners
					var documentEvent = self.documentEvents['touchClick'];

					if (documentEvent) {
						body.removeEventListener('click', documentEvent);
						body.removeEventListener('touchstart', documentEvent);
						self.documentEvents['touchClick'] = '';
					}

					body.style.overflowX = self.bodyOverflowX;
					// unbind any auto-closing hover listeners
					var elementProxyAcMouseLeaveEvent = self.elementProxyEvents['mouseleaveac'];
					var elementProxyAcMouseEnterEvent = self.elementProxyEvents['mouseenterac'];
					var elementProxyAcClickEvent = self.elementProxyEvents['clickac'];

					if (elementProxyAcMouseLeaveEvent) {
						self.elementProxy.removeEventListener('mouseleave', elementProxyAcMouseLeaveEvent);
						self.elementProxyEvents['mouseleaveac'] = '';
					}

					if (elementProxyAcMouseEnterEvent) {
						self.elementProxy.removeEventListener('mouseenter', elementProxyAcMouseEnterEvent);
						self.elementProxyEvents['mouseenterac'] = '';
					}

					if (elementProxyAcClickEvent) {
						self.elementProxy.removeEventListener('click', elementProxyAcClickEvent);
						self.elementProxyEvents['clickac'] = '';
					}

					// call our constructor custom callback function
					self.options.functionAfter.call(self.element, self.element);

					// call our method custom callbacks functions
					finishCallbacks();
				};

				if (supportsTransitions()) {
					t_removeClass(self.tooltip, 'tooltipster-' + self.options.animation + '-show');
					// for transitions only
					t_addClass(self.tooltip, 'tooltipster-dying');

					/* TODO: Скрыл анимацию скрытия тултипа, вызывается баг при быстрых наведениях,
						не успевает обновиться или обновляется не корректно статус элемента self.Status
						Необходимо создать контроллер остановок анимаций, который будет следить за анимацией
					*/
					// setTimeout(function() {
					finish();
					// }, self.options.speed);
				} else {
					/* TODO: также про анимцию */
					// t_fadeOut(self.tooltip, self.options.speed, finish);
					finish();
				}
			} else if (self.Status === 'hidden') {
				// if the tooltip is already hidden, we still need to trigger the method custom callback
				finishCallbacks();
			}

			return self;
		},

		// the public show() method is actually an alias for the private showNow() method
		show: function(callback) {
			this._showNow(callback);
			return this;
		},

		// 'update' is deprecated in favor of 'content' but is kept for backward compatibility
		update: function(c) {
			return this.content(c);
		},

		content: function(c) {
			// getter method
			if (typeof c === 'undefined') {
				return this.Content;
			} else {
				// setter method
				this._update(c);
				return this;
			}
		},

		reposition: function() {
			var self = this;
			// in case the tooltip has been removed from DOM manually
			var body = document.body || document.documentElement;

			if (body.contains(self.tooltip)) {
				// reset width
				self.tooltip.style.width = '';

				// find variables to determine placement
				self.elementProxyPosition = self._repositionInfo(self.elementProxy);

				var arrowReposition = null;
				var windowWidth = window.innerWidth;
				// shorthand
				var proxy = self.elementProxyPosition;
				var tooltipWidth = self.tooltip.offsetWidth;
				
				// Need to upload an image to get the correct height of the element
				var img = self.tooltip.querySelector('img');

				if (img) {
					var newImage = new Image();

					newImage.onload = function() {
						repositionCalc();
					};

					newImage.complete = function() {
						repositionCalc();
					}

					newImage.src = img.src;
				} else {
					repositionCalc();
				}

				function repositionCalc() {
					var tooltipHeight = self.tooltip.offsetHeight;
	
					// if this is an <area> tag inside a <map>, all hell breaks loose. Recalculate all the measurements based on coordinates
					if (self.elementProxy.tagName === 'AREA') {
						var areaShape = self.elementProxy.getAttribute('shape');
						var mapName = self.elementProxy.parentNode.getAttribute('name');
						var map = document.createElement('img');
	
						map.setAttribute('usemap', '#' + mapName);
	
						var mapRect = map.getBoundingClientRect();
						var mapOffsetLeft = mapRect.left + window.pageXOffset;
						var mapOffsetTop = mapRect.top + window.pageYOffset;
						var attrCoords = self.elementProxy.getAttribute('coords');
						var areaMeasurements = attrCoords ? attrCoords.split(',') : undefined;
	
						if (areaShape === 'circle') {
							var areaLeft = parseInt(areaMeasurements[0]);
							var areaTop = parseInt(areaMeasurements[1]);
							var areaWidth = parseInt(areaMeasurements[2]);
	
							proxy.dimension.height = areaWidth * 2;
							proxy.dimension.width = areaWidth * 2;
							proxy.offset.top = mapOffsetTop + areaTop - areaWidth;
							proxy.offset.left = mapOffsetLeft + areaLeft - areaWidth;
						} else if (areaShape === 'rect') {
							var areaLeft = parseInt(areaMeasurements[0]);
							var areaTop = parseInt(areaMeasurements[1]);
							var areaRight = parseInt(areaMeasurements[2]);
							var areaBottom = parseInt(areaMeasurements[3]);
	
							proxy.dimension.height = areaBottom - areaTop;
							proxy.dimension.width = areaRight - areaLeft;
							proxy.offset.top = mapOffsetTop + areaTop;
							proxy.offset.left = mapOffsetLeft + areaLeft;
						} else if (areaShape === 'poly') {
							var areaSmallestX = 0;
							var areaSmallestY = 0;
							var areaGreatestX = 0;
							var areaGreatestY = 0;
							var arrayAlternate = 'even';
	
							for (var i = 0; i < areaMeasurements.length; i++) {
								var areaNumber = parseInt(areaMeasurements[i]);
	
								if (arrayAlternate === 'even') {
									if (areaNumber > areaGreatestX) {
										areaGreatestX = areaNumber;
	
										if (i === 0) areaSmallestX = areaGreatestX;
									}
	
									if (areaNumber < areaSmallestX) areaSmallestX = areaNumber;
	
									arrayAlternate = 'odd';
								} else {
									if (areaNumber > areaGreatestY) {
										areaGreatestY = areaNumber;
	
										if (i === 1) areaSmallestY = areaGreatestY;
									}
	
									if (areaNumber < areaSmallestY) areaSmallestY = areaNumber;
	
									arrayAlternate = 'even';
								}
							}
	
							proxy.dimension.height = areaGreatestY - areaSmallestY;
							proxy.dimension.width = areaGreatestX - areaSmallestX;
							proxy.offset.top = mapOffsetTop + areaSmallestY;
							proxy.offset.left = mapOffsetLeft + areaSmallestX;
						} else {
							proxy.dimension.height = map.offsetHeight;
							proxy.dimension.width = map.offsetWidth;
							proxy.offset.top = mapOffsetTop;
							proxy.offset.left = mapOffsetLeft;
						}
					}
	
					// our function and global vars for positioning our tooltip
					var currentLeft = 0;
					var currentLeftMirror = 0;
					var currentTop = 0;
					var offsetY = parseInt(self.options.offsetY);
					var offsetX = parseInt(self.options.offsetX);
	
					// this is the arrow position that will eventually be used. It may differ from the position option if the tooltip cannot be displayed in this position
					practicalPosition = self.options.position;
	
					/**
					 * A function to detect if the tooltip is going off the screen horizontally. If so, reposition it!
					 */
					function dontGoOffScreenX() {
						var windowLeft = (window.pageXOffset || body.scrollLeft) - (body.clientLeft || 0);
	
						// if the tooltip goes off the left side of the screen, line it up with the left side of the window
						if ((currentLeft - windowLeft) < 0) {
							arrowReposition = currentLeft - windowLeft;
							currentLeft = windowLeft;
						}
	
						// if the tooltip goes off the right of the screen, line it up with the right side of the window
						if (((currentLeft + tooltipWidth) - windowLeft) > windowWidth) {
							arrowReposition = currentLeft - ((windowWidth + windowLeft) - tooltipWidth);
							currentLeft = (windowWidth + windowLeft) - tooltipWidth;
						}
					}
	
					/**
					 * A function to detect if the tooltip is going off the screen vertically. If so, switch to the opposite!
					 *
					 * @param {string} switchTo - switch to position
					 * @param {string} switchFrom - switch from position
					 */
					function dontGoOffScreenY(switchTo, switchFrom) {
						var windowScrollTop = window.pageYOffset;
						// if it goes off the top off the page
						if (((proxy.offset.top - windowScrollTop - tooltipHeight - offsetY - 12) < 0) && (switchFrom.indexOf('top') > -1)) {
							practicalPosition = switchTo;
						}
	
						// if it goes off the bottom of the page
						if (((proxy.offset.top + proxy.dimension.height + tooltipHeight + 12 + offsetY) > (windowScrollTop + window.innerHeight)) && (switchFrom.indexOf('bottom') > -1)) {
							practicalPosition = switchTo;
							currentTop = (proxy.offset.top - tooltipHeight) - offsetY - 12;
						}
					}
	
					if (practicalPosition === 'top') {
						var leftDifference = (proxy.offset.left + tooltipWidth) - (proxy.offset.left + proxy.dimension.width);
						currentLeft = (proxy.offset.left + offsetX) - (leftDifference / 2);
						currentTop = (proxy.offset.top - tooltipHeight) - offsetY - 12;
						dontGoOffScreenX();
						dontGoOffScreenY('bottom', 'top');
					}
	
					if (practicalPosition === 'top-left') {
						currentLeft = proxy.offset.left + offsetX;
						currentTop = (proxy.offset.top - tooltipHeight) - offsetY - 12;
						dontGoOffScreenX();
						dontGoOffScreenY('bottom-left', 'top-left');
					}
	
					if (practicalPosition === 'top-right') {
						currentLeft = (proxy.offset.left + proxy.dimension.width + offsetX) - tooltipWidth;
						currentTop = (proxy.offset.top - tooltipHeight) - offsetY - 12;
						dontGoOffScreenX();
						dontGoOffScreenY('bottom-right', 'top-right');
					}
	
					if (practicalPosition === 'bottom') {
						var leftDifference = (proxy.offset.left + tooltipWidth) - (proxy.offset.left + proxy.dimension.width);
						currentLeft = proxy.offset.left - (leftDifference / 2) + offsetX;
						currentTop = (proxy.offset.top + proxy.dimension.height) + offsetY + 12;
						dontGoOffScreenX();
						dontGoOffScreenY('top', 'bottom');
					}
	
					if (practicalPosition === 'bottom-left') {
						currentLeft = proxy.offset.left + offsetX;
						currentTop = (proxy.offset.top + proxy.dimension.height) + offsetY + 12;
						dontGoOffScreenX();
						dontGoOffScreenY('top-left', 'bottom-left');
					}
	
					if (practicalPosition === 'bottom-right') {
						currentLeft = (proxy.offset.left + proxy.dimension.width + offsetX) - tooltipWidth;
						currentTop = (proxy.offset.top + proxy.dimension.height) + offsetY + 12;
						dontGoOffScreenX();
						dontGoOffScreenY('top-right', 'bottom-right');
					}
	
					var tooltipStyle = getComputedStyle(self.tooltip, null);
	
					if (practicalPosition === 'left') {
						currentLeft = proxy.offset.left - offsetX - tooltipWidth - 12;
						currentLeftMirror = proxy.offset.left + offsetX + proxy.dimension.width + 12;
						var topDifference = (proxy.offset.top + tooltipHeight) - (proxy.offset.top + proxy.dimension.height);
						currentTop = proxy.offset.top - (topDifference / 2) - offsetY;
	
						// if the tooltip goes off boths sides of the page
						if ((currentLeft < 0) && ((currentLeftMirror + tooltipWidth) > windowWidth)) {
							var borderWidth = parseFloat(tooltipStyle.borderWidth) * 2;
							var newWidth = (tooltipWidth + currentLeft) - borderWidth;
	
							self.tooltip.style.width = newWidth + 'px';
							tooltipHeight = self.tooltip.offsetHeight;
							currentLeft = proxy.offset.left - offsetX - newWidth - 12 - borderWidth;
							topDifference = (proxy.offset.top + tooltipHeight) - (proxy.offset.top + proxy.dimension.height);
							currentTop = proxy.offset.top - (topDifference / 2) - offsetY;
						} else if (currentLeft < 0) {
							// if it only goes off one side, flip it to the other side
							currentLeft = proxy.offset.left + offsetX + proxy.dimension.width + 12;
							arrowReposition = 'left';
						}
					}
	
					if (practicalPosition == 'right') {
						currentLeft = proxy.offset.left + offsetX + proxy.dimension.width + 12;
						currentLeftMirror = proxy.offset.left - offsetX - tooltipWidth - 12;
						var topDifference = (proxy.offset.top + tooltipHeight) - (proxy.offset.top + proxy.dimension.height);
						currentTop = proxy.offset.top - (topDifference / 2) - offsetY;
	
						// if the tooltip goes off boths sides of the page
						if (((currentLeft + tooltipWidth) > windowWidth) && (currentLeftMirror < 0)) {
							var borderWidth = parseFloat(tooltipStyle.borderWidth) * 2;
							var newWidth = (windowWidth - currentLeft) - borderWidth;
	
							self.tooltip.style.width = newWidth + 'px';
							tooltipHeight = self.tooltip.outerHeight(false);
							topDifference = (proxy.offset.top + tooltipHeight) - (proxy.offset.top + proxy.dimension.height);
							currentTop = proxy.offset.top - (topDifference / 2) - offsetY;
						} else if ((currentLeft + tooltipWidth) > windowWidth) {
							// if it only goes off one side, flip it to the other side
							currentLeft = proxy.offset.left - offsetX - tooltipWidth - 12;
							arrowReposition = 'right';
						}
					}
	
					// if arrow is set true, style it and append it
					if (self.options.arrow) {
						var arrowClass = 'tooltipster-arrow-' + practicalPosition;
	
						// set color of the arrow
						if (self.options.arrowColor.length < 1) {
							var arrowColor = tooltipStyle.backgroundColor;
						} else {
							var arrowColor = self.options.arrowColor;
						}
	
						// if the tooltip was going off the page and had to re-adjust, we need to update the arrow's position
						if (!arrowReposition) {
							arrowReposition = '';
						} else if (arrowReposition === 'left') {
							arrowClass = 'tooltipster-arrow-right';
							arrowReposition = '';
						} else if (arrowReposition == 'right') {
							arrowClass = 'tooltipster-arrow-left';
							arrowReposition = '';
						} else {
							arrowReposition = 'left:' + Math.round(arrowReposition) + 'px;';
						}
	
						// building the logic to create the border around the arrow of the tooltip
						if ((practicalPosition === 'top') || (practicalPosition === 'top-left') || (practicalPosition === 'top-right')) {
							var tooltipBorderWidth = parseFloat(tooltipStyle.borderBottomWidth);
							var tooltipBorderColor = tooltipStyle.borderBottomColor;
						} else if ((practicalPosition === 'bottom') || (practicalPosition === 'bottom-left') || (practicalPosition === 'bottom-right')) {
							var tooltipBorderWidth = parseFloat(tooltipStyle.borderTopWidth);
							var tooltipBorderColor = tooltipStyle.borderTopColor;
						} else if (practicalPosition === 'left') {
							var tooltipBorderWidth = parseFloat(tooltipStyle.borderRightWidth);
							var tooltipBorderColor = tooltipStyle.borderRightColor;
						} else if (practicalPosition === 'right') {
							var tooltipBorderWidth = parseFloat(tooltipStyle.borderLeftWidth);
							var tooltipBorderColor = tooltipStyle.borderLeftColor;
						} else {
							var tooltipBorderWidth = parseFloat(tooltipStyle.borderTopWidth);
							var tooltipBorderColor = tooltipStyle.borderTopColor;
						}
	
						if (tooltipBorderWidth > 1) tooltipBorderWidth++;
	
						var arrowBorder = '';
	
						if (tooltipBorderWidth !== 0) {
							var arrowBorderSize = '';
							var arrowBorderColor = 'border-color: '+ tooltipBorderColor +';';
	
							if (arrowClass.indexOf('bottom') !== -1) {
								arrowBorderSize = 'margin-top: -' + Math.round(tooltipBorderWidth) + 'px;';
							} else if (arrowClass.indexOf('top') !== -1) {
								arrowBorderSize = 'margin-bottom: -' + Math.round(tooltipBorderWidth) + 'px;';
							} else if (arrowClass.indexOf('left') !== -1) {
								arrowBorderSize = 'margin-right: -' + Math.round(tooltipBorderWidth) + 'px;';
							} else if (arrowClass.indexOf('right') !== -1) {
								arrowBorderSize = 'margin-left: -' + Math.round(tooltipBorderWidth) + 'px;';
							}
	
							arrowBorder = '<span class="tooltipster-arrow-border" style="' + arrowBorderSize + ' ' + arrowBorderColor + ';"></span>';
						}
	
						// if the arrow already exists, remove and replace it
						var tooltipArrow = self.tooltip.querySelector('.tooltipster-arrow');
						t_removeEl(tooltipArrow);
	
						// build out the arrow and append it
						var arrowConstruct = '<div class="' + arrowClass + ' tooltipster-arrow" style="' + arrowReposition + '">' + arrowBorder + '<span style="border-color:' + arrowColor + ';"></span></div>';
						self.tooltip.insertAdjacentHTML('beforeend', arrowConstruct);
					}
	
					// position the tooltip
					self.tooltip.style.top = Math.round(currentTop) + 'px';
					self.tooltip.style.left = Math.round(currentLeft) + 'px';
				}
			}

			return self;
		},

		enable: function() {
			this.enabled = true;
			return this;
		},

		disable: function() {
			// hide first, in case the tooltip would not disappear on its own (autoClose false)
			this.hide();
			this.enabled = false;
			return this;
		},

		destroy: function() {
			var self = this;

			self.hide();
			// remove the icon, if any
			if (self.element !== self.elementProxy) {
				t_removeEl(self.elementProxy);
			}

			var elementProxyMouseEnterEvent = self.elementProxyEvents['mouseenter'];
			var elementProxyMouseLeaveEvent = self.elementProxyEvents['mouseleave'];
			var elementProxyTouchStartEvent = self.elementProxyEvents['touchstart'];
			var elementProxyClickEvent = self.elementProxyEvents['click'];

			if (elementProxyMouseEnterEvent) {
				self.element.removeEventListener('mouseenter', elementProxyMouseEnterEvent);
			}

			if (elementProxyMouseLeaveEvent) {
				self.element.removeEventListener('mouseleave', elementProxyMouseLeaveEvent);
			}

			if (elementProxyTouchStartEvent) {
				self.element.removeEventListener('touchstart', elementProxyTouchStartEvent);
			}

			if (elementProxyClickEvent) {
				self.element.removeEventListener('click', elementProxyClickEvent);
			}

			self.element[self.namespace] = '';

			var arrId = self.element['tooltipster-ns'];

			// if there are no more tooltips on this element
			if (arrId.length === 1) {
				// optional restoration of a title attribute
				var title = null;

				if (self.options.restoration === 'previous') {
					title = self.element['tooltipster-initialTitle'];
				} else if (self.options.restoration === 'current') {
					// old school technique to stringify when outerHTML is not supported
					if (typeof self.Content === 'string') {
						title = self.Content;
					} else {
						title = '<div></div>';
					}
				}

				if (title) self.element.setAttribute('title', title);

				// final cleaning
				t_removeClass(self.element, 'tooltipstered');
				self.element['tooltipster-ns'] = '';
				self.element['tooltipster-initialTitle'] = '';
			} else {
				// remove the instance namespace from the list of namespaces of tooltips present on the element
				var newArrId = [];

				for (var i = 0; i < arrId.length; i++) {
					var id = arrId[i];

					if (id !== self.namespace) newArrId.push(id);
				}

				self.element['tooltipster-ns'] = newArrId;
			}

			return self;
		},

		elementIcon: function() {
			return (this.element !== this.elementProxy) ? this.elementProxy : undefined;
		},

		elementTooltip: function() {
			return this.tooltip ? this.tooltip : undefined;
		},

		// public methods but for internal use only
		// getter if val is ommitted, setter otherwise
		option: function(event, val) {
			if (typeof val === 'undefined') {
				return this.options[event];
			} else {
				this.options[event] = val;

				return this;
			}
		},

		status: function() {
			return this.Status;
		}
	};

	// init native JavaScript
	window[pluginName] = function(element) {
		var args = [];

		for (var i = 1; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		initTooltip(element, args);
	}

	// init jQuery
	$.fn[pluginName] = function() {
		var self = this;
		var elements = [];

		for (var i = 0; i < self.length; i++) {
			elements.push(self[i]);
		}

		initTooltip(elements, arguments);
	}

	/**
	 * Init plugin tooltip
	 *
	 * @param {Node} element - element init
	 * @param {object} args - arguments options
	 * @returns {array || Node || boolean} - return value init or not init
	 */
	function initTooltip(element, args) {
		// for using in closures
		// if we are not in the context of jQuery wrapped HTML element(s) :
		// this happens when calling element.tooltipster('methodName or options') where element matches one or more elements
		if (element.length > 0) {
			// method calls
			if (typeof args[0] === 'string') {
				var symbols = '#*$~&';

				for (var i = 0; i < element.length; i++) {
					var currentElement = element[i];
					var arrId;

					arrId = currentElement['tooltipster-ns']

					var self = (arrId && arrId[0]) ? currentElement[arrId[0]] : null;

					if (self) {
						if (typeof self[args[0]] === 'function') {
							// note : args[1] and args[2] may not be defined
							var resp = self[args[0]](args[1], args[2]);
						} else {
							throw new Error('Unknown method .tooltipster("' + args[0] + '")');
						}

						// if the function returned anything other than the instance itself (which implies chaining)
						if (resp !== self) {
							symbols = resp;
							// return false to stop .each iteration on the first element matched by the selector
							return false;
						}
					} else {
						throw new Error('You called Tooltipster\'s "' + args[0] + '" method on an uninitialized element');
					}
				}

				return (symbols !== '#*$~&') ? symbols : element;
			} else {
				// first argument is undefined or an object : the tooltip is initializing
				var instances = [];
				// is there a defined value for the multiple option in the options object ?
				var multipleIsSet = args[0] && typeof args[0].multiple !== 'undefined';
				// if the multiple option is set to true, or if it's not defined but set to true in the defaults
				var multiple = (multipleIsSet && args[0].multiple) || (!multipleIsSet && defaults.multiple);
				// same for debug
				var debugIsSet = args[0] && typeof args[0].debug !== 'undefined';
				var debug = (debugIsSet && args[0].debug) || (!debugIsSet && defaults.debug);

				// initialize a tooltipster instance for each element if it doesn't already have one or if the multiple option is set, and attach the object to it
				for (var i = 0; i < element.length; i++) {
					var currentElement = element[i];
					var isInitPlugin = false;
					var instance = null;
					var arrId = currentElement['tooltipster-ns'];

					if (!arrId) {
						isInitPlugin = true;
					} else if (multiple) {
						isInitPlugin = true;
					} else if (debug) {
						// Tooltipster: one or more tooltips are already attached to this element: ignoring. Use the "multiple" option to attach more tooltips.
					}

					if (isInitPlugin) {
						instance = new Plugin(currentElement, args[0]);

						// save the reference of the new instance
						if (!arrId) arrId = [];

						arrId.push(instance.namespace);

						currentElement['tooltipster-ns'] = arrId;
						// save the instance itself
						currentElement[instance.namespace] = instance;
					}

					instances.push(instance);
				}

				return multiple ? instances : element;
			}
		}
	}

	/**
	 * Quick & dirty compare function
	 *
	 * @param {object} a - a comparison object
	 * @param {object} b - b comparison object
	 * @returns {boolean} - return
	 */
	function t_areEqual(a, b) {
		var same = true;

		for (var i = 0; i < a.length; i++) {
			if (typeof b[i] === 'undefined' || a[i] !== b[i]) {
				same = false;
				return false;
			}
		}

		return same;
	}

	var body = document.body || document.documentElement;

	// detect if this device can trigger touch events
	var deviceHasTouchCapability = !!('ontouchstart' in window);

	// we'll assume the device has no mouse until we detect any mouse movement
	var deviceHasMouse = false;

	body.addEventListener('mousemove', deviceHasMouseEvent);

	/**
	 * Check mouse event for cursor definitions
	 */
	function deviceHasMouseEvent() {
		deviceHasMouse = true;
		body.removeEventListener('mousemove', deviceHasMouseEvent);
	}

	/**
	 * Check touch device
	 *
	 * @returns {boolean} - return true/false
	 */
	function deviceIsPureTouch() {
		return (!deviceHasMouse && deviceHasTouchCapability);
	}

	/**
	 * Detecting support for CSS transitions
	 *
	 * @returns {boolean} - return true/false
	 */
	function supportsTransitions() {
		var	bodyStyle = body.style;
		var str = 'transition';
		var arrPrefix = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];

		if (typeof bodyStyle[str] === 'string') return true;

		str = str.charAt(0).toUpperCase() + str.substr(1);

		for (var i = 0; i < arrPrefix.length; i++) {
			if (typeof bodyStyle[arrPrefix[i] + str] == 'string') return true;
		}

		return false;
	}

	/**
	 * Objects together
	 *
	 * @param {object} out - object with objects
	 * @returns {object} - return objects together
	 */
	function t_extend(out) {
		out = out || {};

		for (var i = 1; i < arguments.length; i++) {
			if (!arguments[i])
				continue;

			for (var key in arguments[i]) {
				if (arguments[i].hasOwnProperty(key)) out[key] = arguments[i][key];
			}
		}

		return out;
	}

	/**
	 * Method classList.add for IE8+
	 *
	 * @param {Node} element - element add class
	 * @param {string} classNames - class name
	 */
	function t_addClass(element, classNames) {
		var arrClassNames = classNames.split(' ');

		for (var i = 0; i < arrClassNames.length; i++) {
			var className = arrClassNames[i];

			// HTML 5 compliant browsers
			if (document.body.classList) {
				element.classList.add(className);
			} else {
				// legacy browsers (IE<10) support
				element.className += (element.className ? ' ' : '') + className;
			}
		}
	}

	/**
	 * Method classList.remove for IE8+
	 *
	 * @param {Node} element - element remove class
	 * @param {string} className - class name
	 * @returns {void}
	 */
	function t_removeClass(element, className) {
		// HTML 5 compliant browsers
		if (document.body.classList) {
			element.classList.remove(className);
			return;
		}
		// legacy browsers (IE<10) support
		element.className = element.className.replace(new RegExp('(^|\\s+)' + className + '(\\s+|$)'), ' ').replace(/^\s+/, '').replace(/\s+$/, '');
	}

	/**
	 * Method remove() for IE8+
	 *
	 * @param {Node} element - remove element
	 */
	function t_removeEl(element) {
		if (element && element.parentNode) {
			element.parentNode.removeChild(element);
		}
	}

	/**
	 * Method fade in for IE8+
	 *
	 * @param {Node} element - element animation
	 * @param {number} duration - speed animation
	 * @param {Function} complete - call function after end animation
	 * @returns {void}
	 */
	function t_fadeIn(element, duration, complete) {
		var elementStyle = getComputedStyle(element, null);

		if (elementStyle.display !== 'block' || elementStyle.opacity === '1' || elementStyle.opacity === '') return;

		duration = parseInt(duration);

		var opacity = 0;
		var speed = duration > 0 ? duration / 10 : 40;

		element.style.opacity = opacity;
		element.style.display = 'block';

		var timer = setInterval(function() {
			element.style.opacity = opacity;
			opacity += 0.1;
			if (opacity >= 1.0) {
				clearInterval(timer);
				if (typeof complete === 'function') {
					complete();
				}
			}
		}, speed);
	}

	/**
	 * Method fade out for IE8+
	 *
	 * @param {Node} element - element animation
	 * @param {number} duration - speed animation
	 * @param {Function} complete - call function after end animation
	 * @returns {void}
	 */
	 function t_fadeOut(element, duration, complete) {
		var elementStyle = getComputedStyle(element, null);

		if (elementStyle.display === 'none' || elementStyle.opacity === '0') return;

		duration = parseInt(duration);

		var opacity = 1;
		var speed = duration > 0 ? duration / 10 : 40;
		var timer = setInterval(function () {
			element.style.opacity = opacity;
			opacity -= 0.1;
			if (opacity <= 0.1) {
				clearInterval(timer);
				element.style.display = 'none';
				element.style.opacity = null;
				if (typeof complete === 'function') {
					complete();
				}
			}
		}, speed);
	}
})();