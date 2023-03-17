(function tn_createDraggableZoomSnapExtension($) {
	var dragPlugins = $.ui.draggable.prototype.plugins.drag;

	$.ui.draggable.prototype.plugins.drag = dragPlugins.filter(function (plugin) {
		var pluginName = plugin[0];

		return !pluginName.includes('snap');
	});

	$.ui.plugin.add('draggable', 'snap', {
		start(event, ui, i) {
			var o = i.options;

			i.snapElements = [];

			$(o.snap.constructor !== String ? o.snap.items || ':data(ui-draggable)' : o.snap).each(function () {
				var $t = $(this);
				var $o = $t.offset();
				if (this !== i.element[0]) {
					i.snapElements.push({
						item: this,
						width: $t.outerWidth() * window.tn.zoom,
						height: $t.outerHeight() * window.tn.zoom,
						top: $o.top,
						left: $o.left,
					});
				}
			});
		},
		drag(event, ui, inst) {
			var ts;
			var bs;
			var ls;
			var rs;
			var l;
			var r;
			var t;
			var b;
			var i;
			var first;
			var o = inst.options;
			var d = o.snapTolerance;
			var x1 = ui.offset.left;
			var x2 = x1 + inst.helperProportions.width * window.tn.zoom;
			var y1 = ui.offset.top;
			var y2 = y1 + inst.helperProportions.height * window.tn.zoom;

			for (i = inst.snapElements.length - 1; i >= 0; i--) {
				l = inst.snapElements[i].left - inst.margins.left * window.tn.zoom;
				r = l + inst.snapElements[i].width;
				t = inst.snapElements[i].top - inst.margins.top * window.tn.zoom;
				b = t + inst.snapElements[i].height;

				if (
					x2 < l - d ||
					x1 > r + d ||
					y2 < t - d ||
					y1 > b + d ||
					!$.contains(inst.snapElements[i].item.ownerDocument, inst.snapElements[i].item)
				) {
					if (inst.snapElements[i].snapping) {
						if (inst.options.snap.release) {
							inst.options.snap.release.call(
								inst.element,
								event,
								$.extend(inst._uiHash(), {snapItem: inst.snapElements[i].item}),
							);
						}
					}
					inst.snapElements[i].snapping = false;
					// eslint-disable-next-line no-continue
					continue;
				}

				if (o.snapMode !== 'inner') {
					ts = Math.abs(t - y2) <= d;
					bs = Math.abs(b - y1) <= d;
					ls = Math.abs(l - x2) <= d;
					rs = Math.abs(r - x1) <= d;
					if (ts) {
						ui.position.top = inst._convertPositionTo('relative', {
							top: t - inst.helperProportions.height * window.tn.zoom,
							left: 0,
						}).top;
					}
					if (bs) {
						ui.position.top = inst._convertPositionTo('relative', {top: b, left: 0}).top;
					}
					if (ls) {
						ui.position.left = inst._convertPositionTo('relative', {
							top: 0,
							left: l - inst.helperProportions.width * window.tn.zoom,
						}).left;
					}
					if (rs) {
						ui.position.left = inst._convertPositionTo('relative', {top: 0, left: r}).left;
					}
				}

				first = ts || bs || ls || rs;

				if (o.snapMode !== 'outer') {
					ts = Math.abs(t - y1) <= d;
					bs = Math.abs(b - y2) <= d;
					ls = Math.abs(l - x1) <= d;
					rs = Math.abs(r - x2) <= d;
					if (ts) {
						ui.position.top = inst._convertPositionTo('relative', {
							top: t,
							left: 0,
						}).top;
					}
					if (bs) {
						ui.position.top = inst._convertPositionTo('relative', {
							top: b - inst.helperProportions.height * window.tn.zoom,
							left: 0,
						}).top;
					}
					if (ls) {
						ui.position.left = inst._convertPositionTo('relative', {
							top: 0,
							left: l,
						}).left;
					}
					if (rs) {
						ui.position.left = inst._convertPositionTo('relative', {
							top: 0,
							left: r - inst.helperProportions.width * window.tn.zoom,
						}).left;
					}
				}

				if (!inst.snapElements[i].snapping && (ts || bs || ls || rs || first)) {
					if (inst.options.snap.snap) {
						inst.options.snap.snap.call(
							inst.element,
							event,
							$.extend(inst._uiHash(), {
								snapItem: inst.snapElements[i].item,
							}),
						);
					}
				}
				inst.snapElements[i].snapping = ts || bs || ls || rs || first;
			}
		},
	});
})(jQuery);

(function tn_createLockCenterOnResizableExtention($) {
	var isMac = navigator.platform.toLowerCase().includes('mac');

	$.extend($.ui.resizable.prototype.options, {
		centerLock: true,
	});

	$.ui.plugin.add('resizable', 'centerLock', {
		start: function (event) {
			var inst = $(this).data('ui-resizable');
			var mouseEvent = event.originalEvent;

			inst.lockedCenter = isMac ? mouseEvent.metaKey : mouseEvent.ctrlKey;
		},
		resize: function (event, ui) {
			var inst = $(this).data('ui-resizable');
			var mouseEvent = event.originalEvent;
			var offsetLeft = (ui.size.width - ui.originalSize.width) / 2;
			var offsetTop = (ui.size.height - ui.originalSize.height) / 2;

			inst.lockedCenter = isMac ? mouseEvent.metaKey : mouseEvent.ctrlKey;

			if (inst.lockedCenter) {
				ui.position.left = ui.originalPosition.left - offsetLeft;
				ui.position.top = ui.originalPosition.top - offsetTop;
			}
		},
	});
})(jQuery);

(function tn_createSnapOnResizeExtention($) {
	$.extend($.ui.resizable.prototype.options, {
		snapTolerance: 6,
		snapMode: 'both',
	});

	$.ui.plugin.add('resizable', 'snap', {
		start: function () {
			var $this = $(this);
			var inst = $this.data('ui-resizable');
			var snap = inst.options.snap;

			inst.outerWidth = inst.helper.outerWidth() - inst.size.width;
			inst.outerHeight = inst.helper.outerHeight() - inst.size.height;
			inst.leftMargin = getLeftMargin($this);
			inst.topMargin = getTopMargin($this);
			inst.coords = [];

			$(typeof snap == 'string' ? snap : ':data(ui-resizable)').each(function () {
				if (
					this === inst.element[0] ||
					this === inst.helper[0] ||
					$(this).hasClass('tn-elem__selected') ||
					$(this).hasClass('tn-group__selected')
				)
					return;

				var $el = $(this);
				var position = $el.position();
				var left = position.left + getLeftMargin($el);
				var top = position.top + getTopMargin($el);
				var groupid = this.dataset.fieldGroupidValue;
				var group;
				var groupPosition;

				if (groupid) {
					group = $('#' + groupid);
					groupPosition = group.position();

					left += groupPosition.left;
					top += groupPosition.top;
				}

				inst.coords.push({
					left: left,
					top: top,
					right: left + $el.outerWidth(),
					bottom: top + $el.outerHeight(),
				});
			});
		},
		resize: function () {
			var leftSnap = [];
			var topSnap = [];
			var widthSnap = [];
			var heightSnap = [];
			var inst = $(this).data('ui-resizable');
			var axes = inst.axis.split('');
			var snapTolerance = inst.options.snapTolerance;
			var snapMode = inst.options.snapMode;
			var left = inst.position.left + inst.leftMargin;
			var _left = left - snapTolerance;
			var top = inst.position.top + inst.topMargin;
			var _top = top - snapTolerance;
			var right = left + inst.size.width + inst.outerWidth;
			var _right = right + snapTolerance;
			var bottom = top + inst.size.height + inst.outerHeight;
			var _bottom = bottom + snapTolerance;

			$.each(inst.coords, function () {
				var coords = this;
				var width = Math.min(_right, coords.right) - Math.max(_left, coords.left);
				var height = Math.min(_bottom, coords.bottom) - Math.max(_top, coords.top);

				if (width < 0 || height < 0) return;

				$.each(axes, function (i, axis) {
					if (snapMode == 'outer') {
						switch (axis) {
							case 'w':
							case 'e':
								if (width > snapTolerance * 2) return;
								break;
							case 'n':
							case 's':
								if (height > snapTolerance * 2) return;
						}
					} else if (snapMode == 'inner') {
						switch (axis) {
							case 'w':
							case 'e':
								if (width < snapTolerance * 2) return;
								break;
							case 'n':
							case 's':
								if (height < snapTolerance * 2) return;
						}
					}

					switch (axis) {
						case 'w':
							leftSnap.push(getCoordOffset(left - coords.left, left - coords.right, snapTolerance));
							break;
						case 'n':
							topSnap.push(getCoordOffset(top - coords.top, top - coords.bottom, snapTolerance));
							break;
						case 'e':
							widthSnap.push(getCoordOffset(right - coords.left, right - coords.right, snapTolerance));
							break;
						case 's':
							heightSnap.push(getCoordOffset(bottom - coords.top, bottom - coords.bottom, snapTolerance));
					}
				});
			});

			if (inst.options.alsoResize) {
				var resizeElements =
					typeof inst.options.alsoResize === 'string' ? $(inst.options.alsoResize) : inst.options.alsoResize;
			}

			var offset;
			var widthOffset;
			var heightOffset;
			var leftOffset;
			var topOffset;

			var allSnaps = [];
			var minSnap;
			var maxSnap;

			allSnaps = allSnaps.concat(widthSnap, heightSnap, leftSnap, topSnap);

			minSnap = Math.min.apply(Math, allSnaps);
			maxSnap = Math.max.apply(Math, allSnaps);

			if (minSnap !== 0 || maxSnap !== 0) {
				inst.isSnapped = true;
			} else {
				inst.isSnapped = false;
			}

			if (heightSnap.length) {
				widthOffset = getMinOffset(widthSnap);
				offset = getMinOffset(heightSnap);

				inst.size.height += offset;

				if (inst.lockedCenter) {
					inst.position.top -= offset;
					inst.size.height += offset;
				}

				if ((inst.options.aspectRatio || window.isShiftDown) && !widthOffset) {
					inst.size.width += offset;

					if (inst.lockedCenter) {
						inst.size.width += offset;
						inst.position.left -= offset;
					}
				}

				if (resizeElements) {
					resizeElements.each(function (i, el) {
						$(el).css('height', $(el).height() + offset);
					});
				}
			}

			if (widthSnap.length) {
				heightOffset = getMinOffset(heightSnap);
				offset = getMinOffset(widthSnap);

				inst.size.width += offset;

				if (inst.lockedCenter) {
					inst.position.left -= offset;
					inst.size.width += offset;
				}

				if ((inst.options.aspectRatio || window.isShiftDown) && !window.isSelectedTextOnly) {
					if (!heightOffset) {
						inst.size.height += offset;

						if (inst.lockedCenter) {
							inst.size.height += offset;
							inst.position.top -= offset;
						}
					}
				}

				if (resizeElements) {
					resizeElements.each(function (i, el) {
						$(el).css('width', $(el).width() + offset);
					});
				}
			}

			if (leftSnap.length) {
				heightOffset = getMinOffset(heightSnap);
				offset = getMinOffset(leftSnap);

				inst.position.left += offset;
				inst.size.width -= offset;

				if (inst.lockedCenter) {
					inst.size.width -= offset;
				}

				if ((inst.options.aspectRatio || window.isShiftDown) && !window.isSelectedTextOnly) {
					if (heightSnap.length) {
						heightOffset = getMinOffset(heightSnap);
						inst.position.left -= heightOffset;

						if (heightOffset) {
							inst.size.width += offset;
							inst.position.left -= offset;

							if (inst.lockedCenter) {
								inst.position.left -= offset;
								inst.size.width += offset;
							}
						} else {
							inst.size.height -= offset;

							if (inst.lockedCenter) {
								inst.size.height -= offset;
								inst.position.top += offset;
							}
						}
					} else {
						topOffset = getMinOffset(topSnap);

						if (!topOffset) {
							inst.position.top += offset;
							inst.size.height -= offset;

							if (inst.lockedCenter) {
								inst.size.height -= offset;
							}
						}
					}
				}

				if (resizeElements) {
					resizeElements.each(function (i, el) {
						$(el).css({
							'left': $(el).position().left + offset,
							'width': $(el).width() - offset,
						});
					});
				}
			}

			if (topSnap.length) {
				offset = getMinOffset(topSnap);

				inst.position.top += offset;
				inst.size.height -= offset;

				if (inst.lockedCenter) {
					inst.size.height -= offset;
				}

				if ((inst.options.aspectRatio || window.isShiftDown) && !window.isSelectedTextOnly) {
					if (widthSnap.length) {
						widthOffset = getMinOffset(widthSnap);
						inst.position.top -= widthOffset;

						if (widthOffset) {
							inst.size.height += offset;
							inst.position.top -= offset;

							if (inst.lockedCenter) {
								inst.position.top -= offset;
								inst.size.height += offset;
							}
						} else {
							inst.size.width -= offset;

							if (inst.lockedCenter) {
								inst.size.width -= offset;
								inst.position.left += offset;
							}
						}
					} else {
						leftOffset = getMinOffset(leftSnap);

						if (!leftOffset) {
							inst.position.left += offset;
							inst.size.width -= offset;

							if (inst.lockedCenter) {
								inst.size.width -= offset;
							}
						}
					}
				}

				if (resizeElements) {
					resizeElements.each(function (i, el) {
						$(el).css({
							'top': $(el).position().top + offset,
							'height': $(el).height() - offset,
						});
					});
				}
			}
		},
	});

	function getCoordOffset(leftTop, rightBottom, snapTolerance) {
		return Math.abs(leftTop) < snapTolerance ? -leftTop : Math.abs(rightBottom) < snapTolerance ? -rightBottom : 0;
	}

	function getMinOffset(array) {
		return array.sort(function (a, b) {
			return !a ? 1 : !b ? -1 : Math.abs(a) - Math.abs(b);
		})[0];
	}

	function getLeftMargin(el) {
		return parseInt(el.css('margin-left'), 10) || 0;
	}

	function getTopMargin(el) {
		return parseInt(el.css('margin-top'), 10) || 0;
	}

	function patch(func, afterFunc, beforeFunc) {
		var fn = $.ui.resizable.prototype[func];
		$.ui.resizable.prototype[func] = function () {
			if (beforeFunc) beforeFunc.apply(this, arguments);
			fn.apply(this, arguments);
			if (afterFunc) afterFunc.apply(this, arguments);
		};
	}

	patch('_mouseStop', null, function () {
		if (this._helper) {
			this.position = {
				left: parseInt(this.helper.css('left'), 10) || 0.1,
				top: parseInt(this.helper.css('top'), 10) || 0.1,
			};
			this.size = {
				width: this.helper.outerWidth(),
				height: this.helper.outerHeight(),
			};
		}
	});

	patch('_mouseStart', function () {
		if (this._helper) {
			this.size = {
				width: this.size.width - (this.helper.outerWidth() - this.helper.width()),
				height: this.size.height - (this.helper.outerHeight() - this.helper.height()),
			};
			this.originalSize = {
				width: this.size.width,
				height: this.size.height,
			};
		}
	});

	patch('_renderProxy', function () {
		if (this._helper) {
			this.helper.css({
				left: this.elementOffset.left,
				top: this.elementOffset.top,
				width: this.element.outerWidth(),
				height: this.element.outerHeight(),
			});
		}
	});

	var resizeEv = $.ui.resizable.prototype.plugins.resize;

	$.each(resizeEv, function (i, v) {
		if (v[0] == 'ghost') {
			resizeEv.splice(i, 1);
			return false;
		}
	});

	$.each($.ui.resizable.prototype.plugins.start, function (i, v) {
		if (v[0] == 'ghost') {
			var fn = v[1];
			v[1] = function () {
				fn.apply(this, arguments);
				$(this).data('ui-resizable').ghost.css({
					width: '100%',
					height: '100%',
				});
			};
			return false;
		}
	});
})(jQuery);

(function tn_createAlignControlsOnDragExtention($) {
	$.extend($.ui.draggable.prototype.options, {
		hideTidyControls: true,
	});

	$.ui.plugin.add('draggable', 'hideTidyControls', {
		start: function () {
			if ($(this).hasClass('tn-elem') || $(this).hasClass('tn-group')) tn_destroyTidyControls();
			if ($(this).hasClass('tn-tidy-control')) spacingControls__removeShowOnHoverEvent();
		},
		drag: function () {
			if ($(this).hasClass('tn-tidy-control')) tn_hideOutline('hover');
		},
		stop: function () {
			setTimeout(function () {
				if ($(this).hasClass('tn-elem') || $(this).hasClass('tn-group')) tn_createSpacingControls();
			}, 1);
			if ($(this).hasClass('tn-tidy-control')) spacingControls__addShowOnHoverEvent();
		},
	});
})(jQuery);

(function tn_createAlignControlsOnResizeExtention($) {
	$.extend($.ui.resizable.prototype.options, {
		hideTidyControls: true,
	});

	$.ui.plugin.add('resizable', 'hideTidyControls', {
		start: function () {
			if ($(this).hasClass('tn-outline')) tn_destroyTidyControls();
		},
		stop: function () {
			setTimeout(function () {
				if ($(this).hasClass('tn-outline')) tn_createSpacingControls();
			}, 1);
		},
	});
})(jQuery);
