$(document).ready(function () {
	$(window).keydown(function (e) {
		tn_console('!!key:' + e.keyCode);
		if (window.tn_flag_settings_ui_focus) {
			tn_console('tn_flag_settings_ui_focus==true');
			return '';
		}
		if (window.tu_flag_widget_ui_focus) {
			tn_console('tu_flag_widget_ui_focus==true');
			return '';
		}

		var $el = $('.tn-elem__selected');
		if (!e.shiftKey && !e.metaKey && !e.altKey && e.keyCode == 38) {
			tn_console('up');
			if (typeof $el == 'undefined' || $el.length === 0) {
				e.preventDefault();
				return '';
			}
			if ($el.length > 1) {
				tn_undo__Add('elems_selected_move');
			} else {
				tn_undo__Add('elem_move', $el);
			}
			elem__selected__offsetMove(0, -1);
			tn_set_lastChanges();
			e.preventDefault();
			return false;
		}

		if (e.shiftKey && e.keyCode == 38) {
			tn_console('shift + up');
			if (typeof $el == 'undefined' || $el.length === 0) {
				e.preventDefault();
				return '';
			}
			if ($el.length > 1) {
				tn_undo__Add('elems_selected_move');
			} else {
				tn_undo__Add('elem_move', $el);
			}
			elem__selected__offsetMove(0, -10);
			tn_setRulersPosition();
			tn_set_lastChanges();
			e.preventDefault();
			return false;
		}

		if ((e.metaKey || e.altKey) && e.keyCode == 38) {
			tn_console('meta + up');
			if (typeof $el == 'undefined' || $el.length === 0) {
				e.preventDefault();
				return '';
			}
			if ($el.attr('data-elem-type') == 'text') {
				if ($el.length > 1) {
					tn_undo__Add('elems_selected_save');
				} else {
					tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
				}
				elem__selected__lineheightChange(-0.1);
				tn_setRulersPosition();
				tn_set_lastChanges();
				tn_setOutlinePosition('selected');
				tn_hideOutline('hover');
				e.preventDefault();
			}
			return false;
		}

		if (!e.shiftKey && !e.metaKey && !e.altKey && e.keyCode == 40) {
			tn_console('downn');
			if (typeof $el == 'undefined' || $el.length === 0) {
				e.preventDefault();
				return '';
			}
			if ($el.length > 1) {
				tn_undo__Add('elems_selected_move');
			} else {
				tn_undo__Add('elem_move', $el);
			}
			elem__selected__offsetMove(0, +1);
			tn_set_lastChanges();
			e.preventDefault();
			return false;
		}

		if (e.shiftKey && e.keyCode == 40) {
			tn_console('shift + down');
			if (typeof $el == 'undefined' || $el.length === 0) {
				e.preventDefault();
				return '';
			}
			if ($el.length > 1) {
				tn_undo__Add('elems_selected_move');
			} else {
				tn_undo__Add('elem_move', $el);
			}
			elem__selected__offsetMove(0, +10);
			tn_setRulersPosition();
			tn_set_lastChanges();
			e.preventDefault();
			return false;
		}

		if ((e.metaKey || e.altKey) && e.keyCode == 40) {
			tn_console('meta + down');
			if (typeof $el == 'undefined' || $el.length === 0) {
				e.preventDefault();
				return '';
			}
			if ($el.attr('data-elem-type') == 'text') {
				if ($el.length > 1) {
					tn_undo__Add('elems_selected_save');
				} else {
					tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
				}
				elem__selected__lineheightChange(+0.1);
				tn_setRulersPosition();
				tn_set_lastChanges();
				tn_setOutlinePosition('selected');
				tn_hideOutline('hover');
				e.preventDefault();
			}
			return false;
		}

		if (!e.shiftKey && !e.metaKey && !e.altKey && e.keyCode == 37) {
			tn_console('left');
			if (typeof $el == 'undefined' || $el.length === 0) {
				e.preventDefault();
				return '';
			}
			if ($el.length > 1) {
				tn_undo__Add('elems_selected_move');
			} else {
				tn_undo__Add('elem_move', $el);
			}
			elem__selected__offsetMove(-1, 0);
			tn_set_lastChanges();
			e.preventDefault();
			return false;
		}

		if (e.shiftKey && e.keyCode == 37) {
			tn_console('shift+left');
			if (typeof $el == 'undefined' || $el.length === 0) {
				e.preventDefault();
				return '';
			}
			if ($el.length > 1) {
				tn_undo__Add('elems_selected_move');
			} else {
				tn_undo__Add('elem_move', $el);
			}
			elem__selected__offsetMove(-10, 0);
			tn_setRulersPosition();
			tn_set_lastChanges();
			e.preventDefault();
			return false;
		}

		if ((e.metaKey || e.altKey) && e.keyCode == 37) {
			tn_console('meta + left');
			if (typeof $el == 'undefined' || $el.length === 0) {
				e.preventDefault();
				return '';
			}
			if ($el.attr('data-elem-type') == 'text') {
				if ($el.length > 1) {
					tn_undo__Add('elems_selected_save');
				} else {
					tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
				}
				elem__selected__letterspacingChange(-0.5);
				tn_setRulersPosition();
				tn_set_lastChanges();
				tn_setOutlinePosition('selected');
				tn_hideOutline('hover');
				e.preventDefault();
			}
			return false;
		}

		if (!e.shiftKey && !e.metaKey && !e.altKey && e.keyCode == 39) {
			tn_console('right');
			if (typeof $el == 'undefined' || $el.length === 0) {
				e.preventDefault();
				return '';
			}
			if ($el.length > 1) {
				tn_undo__Add('elems_selected_move');
			} else {
				tn_undo__Add('elem_move', $el);
			}
			elem__selected__offsetMove(+1, 0);
			tn_set_lastChanges();
			e.preventDefault();
			return false;
		}

		if (e.shiftKey && e.keyCode == 39) {
			tn_console('shift+right');
			if (typeof $el == 'undefined' || $el.length === 0) {
				e.preventDefault();
				return '';
			}
			if ($el.length > 1) {
				tn_undo__Add('elems_selected_move');
			} else {
				tn_undo__Add('elem_move', $el);
			}
			elem__selected__offsetMove(+10, 0);
			tn_setRulersPosition();
			tn_set_lastChanges();
			e.preventDefault();
			return false;
		}

		if ((e.metaKey || e.altKey) && e.keyCode == 39) {
			tn_console('meta + right');
			if (typeof $el == 'undefined' || $el.length === 0) {
				e.preventDefault();
				return '';
			}
			if ($el.attr('data-elem-type') == 'text') {
				if ($el.length > 1) {
					tn_undo__Add('elems_selected_save');
				} else {
					tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
				}
				elem__selected__letterspacingChange(+0.5);
				tn_setRulersPosition();
				tn_set_lastChanges();
				tn_setOutlinePosition('selected');
				tn_hideOutline('hover');
				e.preventDefault();
			}
			return false;
		}

		if (!(e.metaKey || e.ctrlKey) && (e.keyCode == 8 || e.keyCode == 46)) {
			tn_console('del');
			if (typeof $el == 'undefined' || $el.length === 0) {
				return '';
			}
			if ($el.length > 1) {
				tn_undo__Add('elems_selected_delete');
			} else {
				tn_undo__Add('elem_delete', $el);
			}
			elem__Delete($el);
			tn_set_lastChanges();
			floor__mousedown();
			return false;
		}

		if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.keyCode == 90) {
			tn_console('meta+shift+Z');

			e.preventDefault();

			tn_undo('redo');

			if ($('.tn-elem__selected, .tn-group__selected').length) {
				tn_setOutlinePosition('selected');

				tn_destroyTidyControls();
				tn_createSpacingControls();
			}

			tn_figma__checkAmazonImages();

			return false;
		}

		if ((e.metaKey || e.ctrlKey) && e.keyCode == 90) {
			tn_console('meta+Z');

			e.preventDefault();

			tn_undo();

			if ($('.tn-elem__selected, .tn-group__selected').length) {
				tn_setOutlinePosition('selected');

				tn_destroyTidyControls();
				tn_createSpacingControls();
			}

			tn_figma__checkAmazonImages();

			return false;
		}

		if (!(e.metaKey || e.ctrlKey) && e.keyCode == 9) {
			tn_console('Tab');
			tn_tab();
			e.preventDefault();
			return false;
		}

		if ((e.metaKey || e.ctrlKey) && e.keyCode == 83) {
			tn_console('meta+s');
			/* artboard__Save__toLS(); */
			artboard__Save__toDB('');
			e.preventDefault();
			return false;
		}

		if ((e.metaKey || e.ctrlKey) && e.keyCode == 87) {
			tn_console('meta+w');
			$('.tn-close-btn').trigger('click');
			e.preventDefault();
			return false;
		}

		//switch resolutions hotkeys (cmd+numbers)
		var maxi = window.tn.screens_cnt;
		if (maxi > 9) maxi = 9;
		for (var i = 0; i < maxi; i++) {
			if ((e.metaKey || e.ctrlKey) && e.keyCode == 49 + i) {
				tn_console('meta + ' + (i + 1));
				goResolutionMode(window.tn.screens[i]);
				e.preventDefault();
				return false;
			}
		}

		if ((e.metaKey || e.ctrlKey) && e.key == '0') {
			tn_console('meta + 0');
			e.preventDefault();
			tn_zoomReset();
			return false;
		}

		if ((e.metaKey || e.ctrlKey) && e.key == '-') {
			tn_console('meta + -');
			e.preventDefault();
			tn_zoomOut();
			return false;
		}

		if ((e.metaKey || e.ctrlKey) && e.key == '=') {
			tn_console('meta + =');
			e.preventDefault();
			tn_zoomIn();
			return false;
		}

		if (!(e.metaKey || e.ctrlKey) && e.keyCode == 187) {
			tn_console('+');
			if (typeof $el == 'undefined' || $el.length === 0) {
				e.preventDefault();
				return '';
			}
			if ($el.length > 1) {
				tn_undo__Add('elems_selected_save', $el);
			} else {
				tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
			}

			tn_hideOutline('hover');

			elem__selected__makeBigger(+1);
			tn_set_lastChanges();
			e.preventDefault();
			return false;
		}

		if (!(e.metaKey || e.ctrlKey) && e.keyCode == 189) {
			tn_console('-');
			if (typeof $el == 'undefined' || $el.length === 0) {
				e.preventDefault();
				return '';
			}
			if ($el.length > 1) {
				tn_undo__Add('elems_selected_save', $el);
			} else {
				tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
			}

			tn_hideOutline('hover');

			elem__selected__makeBigger(-1);
			tn_set_lastChanges();
			e.preventDefault();
			return false;
		}

		if (!(e.metaKey || e.ctrlKey) && e.keyCode >= 48 && e.keyCode <= 57) {
			tn_console('key: 0-9');
			var v = 1;
			if (e.keyCode == 48) {
				v = 1;
			} else {
				v = (e.keyCode - 48) / 10;
			}
			if (typeof $el == 'undefined' || $el.length === 0) {
				return '';
			}
			if ($el.length > 1) {
				tn_undo__Add('elems_selected_save', $el);
			} else {
				tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
			}
			elem__setFieldValue($el, 'opacity', v, 'render', 'updateui', '');
			tn_set_lastChanges();
			return false;
		}

		if (((e.metaKey || e.ctrlKey) && e.keyCode == 186) || (!(e.metaKey || e.ctrlKey) && e.keyCode == 71)) {
			tn_console('meta + ; or G');
			tn_toggleGrid();
			ab__control__toggle__update('grid_show');
			e.preventDefault();
			return false;
		}

		if (!(e.metaKey || e.ctrlKey) && e.keyCode == 70) {
			tn_console('f');
			tn_toggleUI();
			ab__control__toggle__update('ui_show');
			e.preventDefault();
			return false;
		}

		if (e.keyCode == 27) {
			tn_console('escape');
			var $tnShortcuts = $('.tn-shortcuts');
			if ($tnShortcuts.length) {
				$tnShortcuts.remove();
			}
			var $tnDialog = $('.tn-dialog');
			if ($tnDialog.length) {
				$tnDialog.remove();
			}
			allelems__unselect();
			addmenu__close();
			moremenu__close();
			return false;
		}

		if ((e.metaKey || e.ctrlKey) && e.keyCode == 67) {
			tn_console('meta+c');
			elem__selected__buf__Copy();
			e.preventDefault();
			return false;
		}

		if ((e.metaKey || e.ctrlKey) && e.keyCode == 86) {
			tn_console('meta+v');
			elem__selected__buf__Paste();
			tn_set_lastChanges();
			e.preventDefault();
			return false;
		}

		// if (!(e.metaKey || e.ctrlKey) && e.keyCode == 65) {
		// tn_console('a');
		// tn_testAnimation();
		// e.preventDefault();
		//     return false;
		// }

		if (!(e.metaKey || e.ctrlKey) && e.keyCode == 80) {
			tn_console('p');
			tn_anim__playAll();
			e.preventDefault();
			return false;
		}

		if ((e.metaKey || e.ctrlKey) && e.keyCode == 65) {
			tn_console('meta + a');
			allelems__selectall();
			e.preventDefault();
			return false;
		}

		if (!(e.metaKey || e.ctrlKey) && e.keyCode == 76) {
			tn_console('L');
			if (typeof $el == 'undefined' || $el.length === 0) {
				e.preventDefault();
				return '';
			}
			tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
			tn_elem__lock();
			tn_set_lastChanges();
			e.preventDefault();
			return false;
		}

		if ((e.metaKey || e.ctrlKey) && e.keyCode == 76) {
			tn_console('meta+L');
			panelLayers__showhide();
			ab__control__toggle__update('layers_show');
			e.preventDefault();
			return false;
		}

		if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.keyCode == 72) {
			tn_console('meta+h');
			guide__add('', 'h');
			ab__control__toggle__update('guides_show');
			e.preventDefault();
			return false;
		}

		if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.keyCode == 72) {
			tn_console('meta+shift+h');
			guide__add('', 'v');
			ab__control__toggle__update('guides_show');
			e.preventDefault();
			return false;
		}

		if ((e.metaKey || e.ctrlKey) && e.keyCode == 79) {
			tn_console('meta+o');
			tn_openrecords__showpopup();
			e.preventDefault();
			return false;
		}

		if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.keyCode == 71) {
			tn_console('meta+g');
			group__create();
			e.preventDefault();
			return false;
		}
		if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.keyCode == 71) {
			tn_console('meta+shift+g');
			group__unmake();
			panelSettings__openTimeout();
			e.preventDefault();
			return false;
		}

		if (e.keyCode === 18) {
			e.preventDefault();
			var selectedLength = $el.length;
			var dragElsLength = $('.ui-draggable-dragging').length;

			window.isAltDown = true;

			if (selectedLength && !dragElsLength) {
				tn_setRulersPosition();
				tn_showRulers();
			}
		}

		if (e.keyCode === 16) {
			window.isShiftDown = true;
		}

		if (e.keyCode === 17) {
			window.isCtrlDown = true;
		}

		if (e.keyCode === 32) {
			tn_console('space');
			e.preventDefault();
			tn_showMoveShape();
			window.isSpaceDown = true;
		}
	});

	$(document).on('keyup', function (e) {
		if (e.keyCode === 18) {
			window.isAltDown = false;
			tn_hideRulers();
		}

		if (e.keyCode === 16) {
			window.isShiftDown = false;
		}

		if (e.keyCode === 17) {
			window.isCtrlDown = false;
		}

		if (e.keyCode === 32) {
			tn_hideMoveShape();
			window.isSpaceDown = false;
		}
	});
});
