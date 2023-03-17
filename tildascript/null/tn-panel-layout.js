function panelSettings__drawLayout($panel, $el, elem_id, type) {
	var res = window.tn.curResolution;
	var recid = $('.tn-artboard').attr('data-record-id');

	var isBtnsCopypasteShow = +res < 1200 ? ' style="display:none;"' : '';

	var styleCopyBtn =
		elem__getFieldValue($el, 'animstyle') === '' &&
		elem__getFieldValue($el, 'animprx') === '' &&
		elem__getFieldValue($el, 'animfix') === ''
			? ' style="display:none;"'
			: '';
	var stylePasteBtn = localStorage.getItem('tzerobasicanimation') === null ? ' style="display:none;"' : '';

	// prettier-ignore
	wire =
		'<div class="sui-panel__section sui-panel__section-alignelem" data-section-name="alignelem">' +
			'<table class="sui-panel__table" style="height:40px; padding-top:5px;">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control="alignelem"></div>' +
					'</td>' +
				'</tr>' +
			'</table>' +
		'</div>';

	// prettier-ignore
	wire +=
		'<div class="sui-panel__section sui-panel__section-pos" data-section-name="pos">' +
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group sui-form-group-pos-twocoldiv" data-control-field="left" data-control-value=""></div>' +
					'</td>' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group sui-form-group-untis" data-control-field="leftunits" data-control-value=""></div>' +
					'</td>' +
					'<td class="sui-panel__td sui-panel__2col-space"></td>' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group sui-form-group-pos-twocoldiv" data-control-field="top" data-control-value=""></div>' +
					'</td>' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group sui-form-group-untis" data-control-field="topunits" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>' +
			'<table class="sui-panel__table	sui-panel__padd_b-10" style="margin-top:-5px;">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group sui-form-group-width" data-control-field="width" data-control-value=""></div>' +
					'</td>' +
					'<td class="sui-panel__td" style="width:30px;">' +
						'<div class="sui-form-group sui-form-group-untis" data-control-field="widthunits" data-control-value=""></div>' +
					'</td>';

	if (panelSettings__checkSettingsShow(type, ['shape', 'button', 'video', 'html', 'gallery'], 'several')) {
		// prettier-ignore
		wire +=
			'<td class="sui-panel__td sui-panel__2col-space"></td>' +
			'<td class="sui-panel__td">' +
				'<div class="sui-form-group sui-form-group-pos-twocoldiv" data-control-field="height" data-control-value=""></div>' +
			'</td>' +
			'<td class="sui-panel__td">' +
				'<div class="sui-form-group sui-form-group-untis" data-control-field="heightunits" data-control-value=""></div>' +
			'</td>';
	} else {
		// prettier-ignore
		wire +=
			'<td class="sui-panel__td" style="display:none;width:1px;">' +
				'<div class="sui-form-group" data-control-field="height" data-control-value=""></div>' +
			'</td>';
	}

	// prettier-ignore
	wire +=
				'</tr>' +
			'</table>';

	if (window.tn.multi_edit && (!group__isSelectedOnlyGroups() || $('.tn-group__selected').length > 1)) {
		// prettier-ignore
		wire +=
		'<table class="sui-panel__table sui-panel__padd_b-10" style="margin-top:-5px;">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group sui-form-group-pos-twocoldiv" data-control-field="horizontalpadding" data-control-value="">' +
						'<table>' +
							'<tr>' +
								'<td>' +
									'<label class="sui-label sui-label_horizontalpadding">' +
									'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="12"	viewBox="0 0 14 12" fill="none">' +
										'<path d="M7 3v6" stroke="#000"/>' +
										'<path d="M0 .5h2.5v11H0M14 .5h-2.5v11h2" stroke="#B6B6B6"/>' +
									'</svg>' +
									'</label>' +
								'</td>' +
								'<td style="width:100%;">' +
									'<div class="sui-input-slider-div">' +
										'<input type="text" value="" name="horizontalpadding" class="sui-input" autocomplete="off">' +
									'</div>' +
									'<div class="sui-slider-relwrapper">' +
										'<div class="sui-slider-abswrapper">' +
											'<div class="sui-slider"></div>' +
										'</div>' +
									'</div>' +
								'</td>' +
							'</tr>' +
						'</table>' +
					'</div>' +
				'</td>' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group sui-form-group-pos-twocoldiv" data-control-field="verticalpadding" data-control-value="">' +
						'<table>' +
							'<tr>' +
								'<td>' +
									'<label class="sui-label sui-label_verticalpadding">' +
										'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14" fill="none">' +
											'<path d="M9 7H3" stroke="#000"/>' +
											'<path d="M11.5 0v2.5H.5V0M11.5 14v-2.5H.5v2" stroke="#B6B6B6"/>' +
										'</svg>' +
									'</label>' +
								'</td>' +
								'<td style="width:100%;">' +
									'<div class="sui-input-slider-div">' +
										'<input type="text" value="" name="verticalpadding" class="sui-input" autocomplete="off">' +
									'</div>' +
									'<div class="sui-slider-relwrapper">' +
										'<div class="sui-slider-abswrapper">' +
											'<div class="sui-slider"></div>' +
										'</div>' +
									'</div>' +
								'</td>' +
							'</tr>' +
						'</table>' +
					'</div>' +
				'</td>' +
			'</tr>' +
		'</table>';
	}

	// prettier-ignore
	wire +=
		'<table class="sui-panel__table sui-panel__toggleContainerFields" style="margin-top:-5px; margin-bottom:-15px;">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group sui-form-group__container-togler" onClick="panelSettings__showcontainerfields()">+ Container<span class="sui-containers-togler__container"></span> (x<span class="sui-containers-togler__axisx"></span>, y<span class="sui-containers-togler__axisy"></span>)</div>' +
					'</td>' +
				'</tr>' +
			'</table>' +
		'</div>' +
		'<div class="sui-panel__section sui-panel_hidden sui-panel__section-container" data-section-name="container" style="margin-top:-10px;">' +
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group sui-form-group__hint">Define the element’s orientation area: grid area or the entire browser window, and set the origin position.</div>' +
					'</td>' +
				'</tr>' +
			'</table>' +
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="container" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>' +
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="axisx" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>' +
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="axisy" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>' +
		'</div>';

	if (group__isSelectedOnlyGroups()) {
		// prettier-ignore
		wire +=
			'<div class="tn-right-box__header">' +
				'<span class="tn-right-box__caption">Elements In Group</span>' +
			'</div>';
	}

	if (panelSettings__checkSettingsShow(type, 'button', 'uniq')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-link" data-section-name="button-link">' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="caption" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="link" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="linktarget" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="relnofollow" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="buttonstat" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>';

		if (!group__isSelectedOnlyGroups()) {
			// prettier-ignore
			wire +=
				'<div class="sui-form-group__hint sui-form-group__hint_buttonstat" data-stat-id="/tilda/click/rec' + recid + '/button' + elem_id + '">' +
					'Button click displays in analytic system as page view:<br>/tilda/click/rec' + recid + '/button' + elem_id +
				'</div>';
		}

		wire += '</div>';
	}

	// Show section for selected elements if one of the types is shape, button or tooltip, and sshow for one selected button
	if (
		(window.tn.multi_edit &&
			panelSettings__checkSettingsShow(type, ['shape', 'button', 'tooltip'], 'several') &&
			(type.length !== 1 || type[0] === 'button')) ||
		(!window.tn.multi_edit && panelSettings__checkSettingsShow(type, 'button', 'uniq'))
	) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-button" data-section-name="button">' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="bgcolor" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	if (panelSettings__checkSettingsShow(type, 'video', 'uniq')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-video" data-section-name="video">' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="vidtype" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="youtubeid" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="vimeoid" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="vimeohash" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="mp4video" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
			'</table>' +
			'</div>';

		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-videosett" data-section-name="videosett">' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="autoplay" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="showinfo" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="mute" data-control-value=""></div>' +
							'<p class="sui-panel-mute-autoplay-message sui-form-group__hint" ' + (elem__getFieldValue($el, 'autoplay') === 'y' ? '' : 'style="display:none;"') + '>Modern browsers do not allow use autoplay with sound</p>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="loop" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="startsec" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="endsec" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	if (panelSettings__checkSettingsShow(type, 'tooltip', 'uniq')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-pin" data-section-name="pin">' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="pinicon" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="pincolor" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="bgcolor" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="bordercolor" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="borderwidth" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>' +
			'<div class="sui-panel__section sui-panel__section-bgimg">' +
				'<label class="sui-label sui-label_title">Pin image</label>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="bgimg" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	if (panelSettings__checkSettingsShow(type, 'gallery', 'uniq')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-gallery-imgs" data-section-name="imgs">' +
				'<label class="sui-label sui-label_title">Images</label>' +
				'<table class="sui-panel__table">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="imgs" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	if (panelSettings__checkSettingsShow(type, 'gallery', 'uniq')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-gallery-settings" data-section-name="settings">' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_stretch" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_imgposition" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_loop" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_speed" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_autoplay" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="zoomable" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';

		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-arrows" data-section-name="arrows">' +
				'<label class="sui-label sui-label_title">Arrows</label>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_arrowcontrols" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_arrowtype" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_arrowsize" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_arrowlinesize" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_arrowborder" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_arrowcolor" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_arrowbgcolor" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_arrowbgopacity" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_arrowcolorhover" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_arrowbgcolorhover" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_arrowbgopacityhover" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_arrowhmargin" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_arrowalign" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_arrowvmargin" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_arrowbetweenmargin" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';

		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-dots" data-section-name="dots">' +
				'<label class="sui-label sui-label_title">Dots</label>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_dotscontrols" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_dotssize" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_dotsbgcolor" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_dotsbgcoloractive" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_dotsvmargin" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_dotshmargin" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';

		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-playicon" data-section-name="playicon">' +
				'<label class="sui-label sui-label_title">Play icon<div class="sui-label-ask tooltip" data-tooltip="Icon for playing video will appear, <br> when you specify video id"></div></label>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_playiconsize" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_playiconcolor" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	if (panelSettings__checkSettingsShow(type, ['text', 'button', 'tooltip', 'gallery'], 'several')) {
		wire += '<div class="sui-panel__section sui-panel__section-font" data-section-name="font">';

		if (!window.tn.multi_edit && type === 'gallery') wire += '<label class="sui-label sui-label_title">Caption</label>';

		// prettier-ignore
		wire +=
			'<table class="sui-panel__table sui-panel__padd_b-10" ' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="align" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>' +
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="color" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>' +
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="fontsize" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>' +
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="fontfamily" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>' +
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="fontweight" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>' +
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="variationweight" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>' +
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="lineheight" data-control-value=""></div>' +
					'</td>' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="letterspacing" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>' +
			'<table class="sui-panel__table sui-panel__padd_b-10"' +
				'<tr class="sui-panel__tr"' +
					'<td class="sui-panel__td"' +
					'<div class="sui-form-group" data-control-field="lettercase" data-control-value=""></div' +
					'</td' +
				'</tr>' +
			'</table>';

		if (panelSettings__checkSettingsShow(type, 'gallery', 'uniq')) {
			// prettier-ignore
			wire +=
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_captiontopmargin" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="slds_captionwidth" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>';
		}

		// prettier-ignore
		wire += '</div>';
	}

	if (panelSettings__checkSettingsShow(type, 'image', 'uniq')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-image" data-section-name="image">' +
				'<label class="sui-label sui-label_title">Image</label>' +
				'<table class="sui-panel__table">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="img" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	if (panelSettings__checkSettingsShow(type, 'shape', 'uniq')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-bgcolor" data-section-name="bgcolor">' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="bgcolor" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="figure" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>' +
			'<div class="sui-panel__section sui-panel__section-bgimg" data-section-name="bgimg">' +
				'<label class="sui-label sui-label_title">Background image</label>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="bgimg" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="bgattachment" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="bgposition" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="zoomable" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="lazyoff" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	if (panelSettings__checkSettingsShow(type, 'video', 'uniq')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-bgimg" data-section-name="bgimg">' +
				'<label class="sui-label sui-label_title">Cover image</label>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="bgimg" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	if (panelSettings__checkSettingsShow(type, 'html', 'uniq')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-code" data-section-name="code">' +
				'<label class="sui-label sui-label_title">HTML Code</label>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control="code" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	if (panelSettings__checkSettingsShow(type, 'vector', 'uniq')) {
		if (window.tn.curResolution == window.tn.topResolution) {
			// prettier-ignore
			wire +=
				'<div class="sui-panel__section sui-panel__section-vectorjson" data-section-name="vectorjson">' +
				'<label class="sui-label sui-label_title">Vector Editor</label>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
				'<div class="sui-form-group" data-control="vectorjson" data-control-value=""></div>' +
				'</td>' +
				'</tr>' +
				'</table>' +
				'</div>';
		}
	}

	if (panelSettings__checkSettingsShow(type, 'form', 'uniq')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-inputs" data-section-name="inputs">' +
				'<label class="sui-label sui-label_title">Inputs</label>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control="inputs" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10" style="display:none;">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="inputs" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control="receivers" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10" style="display:none;">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="receivers" data-control-value=""></div>' +
							'<div class="sui-form-group" data-control-field="receivers_names" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';

		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-formstyle" data-section-name="formstyle">' +
				'<label class="sui-label sui-label_title">Form style</label>' +
			'</div>';

		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-formbuttonstyle" data-section-name="formbuttonstyle">' +
				'<label class="sui-label sui-label_title">Button</label>' +
			'</div>';
	}

	wire += '<div class="sui-panel__section sui-panel__section-other" data-section-name="other">';

	if (panelSettings__checkSettingsShow(type, ['html', 'form', 'vector'], 'except')) {
		// prettier-ignore
		wire +=
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="opacity" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>';
	}

	if (panelSettings__checkSettingsShow(type, ['html', 'tooltip', 'form', 'vector'], 'except')) {
		// prettier-ignore
		wire +=
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="rotate" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>';
	}

	// prettier-ignore
	wire +=
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="zindex" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control="actions" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>';

	if (panelSettings__checkSettingsShow(type, ['shape', 'button'], 'several')) {
		// prettier-ignore
		wire +=
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="pevent" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>';
	}

	if (panelSettings__checkSettingsShow(type, ['text', 'image', 'shape', 'button', 'vector'], 'several')) {
		// prettier-ignore
		wire +=
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="effectstype" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>' +
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
				'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
						'<div class="sui-form-group" data-control-field="effectsvalue" data-control-value=""></div>' +
					'</td>' +
				'</tr>' +
			'</table>';
	}

	// prettier-ignore
	wire +=
		'<table class="sui-panel__table sui-panel__padd_b-10" style="display:none;">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="lock" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10" style="display:none;">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="invisible" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="classname" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
	'</div>';

	if (panelSettings__checkSettingsShow(type, ['text', 'image', 'shape'], 'several')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-link" data-section-name="link">' +
				'<label class="sui-label sui-label_title">Link</label>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="link" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="linktarget" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="relnofollow" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>';
		if (panelSettings__checkSettingsShow(type, ['image', 'shape'], 'several')) {
			// prettier-ignore
			wire +=
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="buttonstat" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>';
			if (!group__isSelectedOnlyGroups()) {
				// prettier-ignore
				wire += '<div class="sui-form-group__hint sui-form-group__hint_buttonstat" data-stat-id="/tilda/click/rec' + recid + '/button' + elem_id + '">' +
					'Button click displays in analytic system as page view:<br>/tilda/click/rec' + recid + '/button' + elem_id +
				'</div>';
			}
		}
		wire += '</div>';
	}

	if (panelSettings__checkSettingsShow(type, ['image', 'shape', 'button', 'gallery'], 'several')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-border" data-section-name="border">' +
				'<label class="sui-label sui-label_title">Border</label>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="bordercolor" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="borderwidth" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="borderradius" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="borderstyle" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	if (panelSettings__checkSettingsShow(type, ['text', 'html', 'form', 'vector'], 'except')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-shadow" data-section-name="shadow">' +
				'<label class="sui-label sui-label_title">Shadow</label>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="shadowcolor" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="shadowopacity" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="shadowx" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="shadowy" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="shadowblur" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="shadowspread" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	if (panelSettings__checkSettingsShow(type, 'text', 'uniq')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-tag" data-section-name="tag">' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="tag" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="pevent" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	if (panelSettings__checkSettingsShow(type, 'image', 'uniq')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-tag" data-section-name="tag">' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="alt" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="zoomable" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="lazyoff" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="pevent" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	if (panelSettings__checkSettingsShow(type, 'button', 'uniq')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-button-hover" data-section-name="hover">' +
			'<label class="sui-label sui-label_title">Hover</label>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="bgcolorhover" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="colorhover" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="bordercolorhover" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="speedhover" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	if (panelSettings__checkSettingsShow(type, 'tooltip', 'uniq')) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-tip" data-section-name="tip">' +
				'<label class="sui-label sui-label_title">Tip settings</label>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="tipposition" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="tipopen" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="tipbgcolor" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="tipradius" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="tipshadowblur" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="tipwidth" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>' +
			'<div class="sui-panel__section sui-panel__section-tipimg" data-section-name="tipimg">' +
				'<label class="sui-label sui-label_title">Tip image</label>' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control-field="tipimg" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	// prettier-ignore
	wire +=
		'<div class="sui-panel__section sui-panel__section-anim" data-section-name="anim">' +
			'<div class="sui-header-wrapper">' +
				'<label class="sui-label sui-label_title">Basic animation</label>' +
				'<div class="sui-copypaste-wrapper"' + isBtnsCopypasteShow + '>';

	// prettier-ignore
	wire +=
		'<div class="sui-copy-btn sui-copy-btn-basic tooltip" data-tooltip="Copy animation to clipboard"' + styleCopyBtn + '>' +
			'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 12.5h-9m0 0l3-3m-3 3l3 3M17.5 10V5.5H14m3.5 9.5v4.5h-13v-14H8" stroke="#9F9F9F"/><rect x="8.5" y="4.5" width="5" height="2" rx=".5" stroke="#9F9F9F"/></svg>' +
		'</div>';

	// prettier-ignore
	wire +=
		'<div class="sui-paste-btn sui-paste-btn-basic tooltip" data-tooltip="Paste animation from clipboard"' + stylePasteBtn + '>' +
			'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 19.5H4.5v-14H8M17.5 7V5.5H13" stroke="#9F9F9F"/><rect x="8.5" y="4.5" width="5" height="2" rx=".5" stroke="#9F9F9F"/><path fill-rule="evenodd" clip-rule="evenodd" d="M20 19h-8v-9h5v3h3v6zm1-6v7H11V9h7l3 3v1z" fill="#9F9F9F"/></svg>' +
		'</div>';

	// prettier-ignore
	wire +=
		'</div>' +
		'</div>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="animstyle" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="animduration" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="animdistance" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="animscale" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="animdelay" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="animtriggeroffset" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10" style="padding-bottom:20px">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control="animtest"></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="animprx" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10" style="padding-bottom:20px;">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="animprxs" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="animprxdx" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10" style="padding-bottom:20px;">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="animprxdy" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="animfix" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10" style="padding-bottom:20px;display:none;">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="animfixtrgofst" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="animfixdist" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
	'</div>';

	// prettier-ignore
	wire +=
				'<div class="sui-panel__section sui-panel__section-sbsopenbtn" data-section-name="sbsopenbtn">' +
					'<table class="sui-panel__table sui-panel__padd_b-10">' +
						'<tr class="sui-panel__tr">' +
							'<td class="sui-panel__td">' +
								'<div class="sui-form-group" data-control="sbsopenbtn" data-control-value=""></div>' +
							'</td>' +
						'</tr>' +
					'</table>' +
				'</div>';

	if (res < 1200) {
		// prettier-ignore
		wire +=
			'<div class="sui-panel__section sui-panel__section-animmobile" data-section-name="animmobile">' +
				'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<div class="sui-form-group" data-control="animmobile" data-control-value=""></div>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>' +
			'<div class="sui-panel__section sui-panel__section-animmobilediff" data-section-name="animmobilediff">' +
				'<table class="sui-panel__table">' +
					'<tr class="sui-panel__tr">' +
						'<td class="sui-panel__td">' +
							'<p class="sui-form-group__hint">Selected group has different mobile animation properties. Please set the same mobile animation option for each element.</p>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>';
	}

	$panel.append(wire);
}

function panelSettings__drawAlignContextMenu() {
	// prettier-ignore
	var str =
	'<div class="tn-contextmenu-box_align">' +
		'<div class="tn-contextmenu-box__section">' +
			'<div class="tn-contextmenu-box__item tn-contextmenu-box__item_tidyup">' +
				'<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
					'<path stroke="#7B7B84" d="M.5.5h5v5h-5zM.5 8.5h5v5h-5zM8.5.5h5v5h-5zM8.5 8.5h5v5h-5z"/>' +
				'</svg>' +
				'<span>Tidy Up</span>' +
			'</div>' +
		'</div>' +

		'<div class="tn-contextmenu-box__section">' +
			'<div class="tn-contextmenu-box__section-title">Distribute Spacing</div>' +
			'<div class="tn-contextmenu-box__item tn-contextmenu-box__item_verticalspacing">' +
			'<svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
				'<path d="M9 7H3" stroke="#FCFCFC"/>' +
				'<path d="M11.5 0v2.5H.5V0M11.5 14v-2.5H.5v2" stroke="#7B7B84"/>' +
			'</svg>' +
			'<span>Vertical Spacing</span>' +
			'</div>' +
			'<div class="tn-contextmenu-box__item tn-contextmenu-box__item_horizontalspacing">' +
			'<svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">' +
				'<path d="M7 3v6" stroke="#FCFCFC"/>' +
				'<path d="M0 .5h2.5v11H0M14 .5h-2.5v11h2" stroke="#7B7B84"/>' +
			'</svg>' +
			'<span>Horizontal Spacing</span>' +
			'</div>' +
		'</div>' +

		'<div class="tn-contextmenu-box__section">' +
			'<div class="tn-contextmenu-box__section-title">Distribute Edges</div>' +
			'<div class="tn-contextmenu-box__item tn-contextmenu-box__item_leftedges">' +
				'<svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">' +
					'<path d="M0 11.5h6.5v-9H0M10 10.5h4.5v-7H10" stroke="#7B7B84"/>' +
					'<path d="M0 0v14h1V0H0zM9 0v14h1V0H9z" fill="#fff"/>' +
				'</svg>' +
				'<span>Left Edges</span>' +
			'</div>' +
			'<div class="tn-contextmenu-box__item tn-contextmenu-box__item_verticalcenters">' +
				'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" fill="none">' +
					'<path d="M13 3V0h-1v3h1zM13 14v-3h-1v3h1zM4 14v-2H3v2h1zM4 2V0H3v2h1z" fill="#fff"/>' +
					'<path d="M15.5 3.5h-6v7h6v-7zM6.5 2.5h-6v9h6v-9z" stroke="#7B7B84"/>' +
				'</svg>' +
				'<span>Vertical Centers</span>' +
			'</div>' +
			'<div class="tn-contextmenu-box__item tn-contextmenu-box__item_rightedges">' +
				'<svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">' +
					'<path d="M15 11.5H8.5v-9H15M5 10.5H.5v-7H5" stroke="#7B7B84"/>' +
					'<path d="M15 0v14h-1V0h1zM6 0v14H5V0h1z" fill="#fff"/>' +
				'</svg>' +
				'<span>Right Edges</span>' +
			'</div>' +
			'<div class="tn-contextmenu-box__item tn-contextmenu-box__item_topedges">' +
				'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 14 16" fill="none">' +
					'<path d="M2.5 0v6.5h9V0M3.5 10v5.5h7V10" stroke="#7B7B84"/>' +
					'<path d="M14 0H0v1h14V0zM14 9H0v1h14V9z" fill="#fff"/>' +
				'</svg>' +
				'<span>Top Edges</span>' +
			'</div>' +
			'<div class="tn-contextmenu-box__item tn-contextmenu-box__item_horizontalcenters">' +
				'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 14 16" fill="none">' +
					'<path d="M2 3H0v1h2V3zM14 3h-2v1h2V3zM3 12H0v1h3v-1zM14 12h-3v1h3v-1z" fill="#fff"/>' +
					'<path d="M2.5 6.5v-6h9v6h-9zM3.5 9.5v6h7v-6h-7z" stroke="#7B7B84"/>' +
				'</svg>' +
				'<span>Horizontal Centers</span>' +
			'</div>' +
			'<div class="tn-contextmenu-box__item tn-contextmenu-box__item_bottomedges">' +
				'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 14 16" fill="none">' +
					'<path d="M2.5 16V9.5h9V16M3.5 6V.5h7V6" stroke="#7B7B84"/>' +
					'<path d="M14 16H0v-1h14v1zM14 7H0V6h14v1z" fill="#fff"/>' +
				'</svg>' +
				'<span>Bottom Edges</span>' +
			'</div>' +
		'</div>' +

	'</div>';

	return str;
}
