/* eslint-disable-next-line no-unused-vars */
function t_appendGoogleMap(recid, key) {
	var grecid = recid;
	if (typeof google === 'object' && typeof google.maps === 'object') {
		t_handleGoogleApiReady(grecid);
	} else if (window.googleapiiscalled !== true) {
		var runfunc = 'window.t_handleGoogleApiReady_' + grecid + ' = function () { t_handleGoogleApiReady("' + grecid + '") }';
		eval(runfunc);

		var addParams = '',
			maplang = '';
		maplang = $('#rec' + recid).find('.t-map').data('map-language');
		if (maplang > '' && maplang.length == 2) {
			addParams = '&language=' + maplang;
		}

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://maps.google.com/maps/api/js?key=' + jQuery.trim(key) + '&callback=t_handleGoogleApiReady_' + grecid + addParams;
		document.body.appendChild(script);
		window.googleapiiscalled = true;
	} else {
		setTimeout(function () {
			t_appendGoogleMap(grecid, key);
		}, 1000);
	}
}

function t_handleGoogleApiReady(recid) {
	$('#rec' + recid).find('.t-map').each(function (index, Element) {
		var el = $(Element);
		var arMarkers = window['arMapMarkers' + recid];
		var mapstyle = '[]';
		window.isDragMap = window.isMobile ? false : true;

		if (el.attr('data-map-style') != '') {
			mapstyle = eval(el.attr('data-map-style'));
		}
		var myLatLng = arMarkers.length > 0 ? new google.maps.LatLng(parseFloat(arMarkers[0].lat), parseFloat(arMarkers[0].lng)) : false;
		var myOptions = {
			zoom: parseInt(el.attr('data-map-zoom'), 10),
			center: myLatLng,
			scrollwheel: false,
			gestureHandling: 'cooperative',
			/* draggable: window.isDragMap, */
			zoomControl: true,
			styles: mapstyle
		};

		var map = new google.maps.Map(Element, myOptions);

		var i, mrk, marker, markers = [];
		var bounds = new google.maps.LatLngBounds();
		for (i in arMarkers) {
			mrk = arMarkers[i];
			myLatLng = new google.maps.LatLng(parseFloat(mrk.lat), parseFloat(mrk.lng));
			marker = new google.maps.Marker({
				position: myLatLng,
				map: map,
				title: mrk.title
			});
			bounds.extend(myLatLng);

			if (mrk.descr > '') {
				attachInfoMessage(marker, mrk.descr);
			} else {
				attachInfoMessage(marker, mrk.title);
			}

			markers[markers.length] = marker;
			marker = '';
		}

		function attachInfoMessage(marker, descr) {
			var infowindow = new google.maps.InfoWindow({
				content: $('<textarea/>').html(descr).text()
			});

			marker.addListener('click', function () {
				infowindow.open(marker.get('map'), marker);
			});
		}

		if (arMarkers.length > 1) {
			map.fitBounds(bounds);
			var listener = google.maps.event.addListener(map, 'idle', function () {
				if (map.getZoom() > parseInt(el.attr('data-map-zoom'), 10) || map.getZoom() == 0) {
					map.setZoom(parseInt(el.attr('data-map-zoom')), 10);
				}
				if (map.getZoom() > 16) {
					map.setZoom(16);
				}
				google.maps.event.removeListener(listener);
			});
		}

		/* Resizing the map for responsive design */
		google.maps.event.addDomListener(window, 'resize', function () {
			var center = map.getCenter();
			var zoom = parseInt(el.attr('data-map-zoom'), 10);
			google.maps.event.trigger(map, 'resize');
			map.setCenter(center);

			if (arMarkers.length > 0) {
				map.fitBounds(bounds);
				if (zoom > 0 && (map.getZoom() > zoom || map.getZoom() == 0)) {
					map.setZoom(zoom);
				}
			}

		});

		el.on('displayChanged', function () {
			google.maps.event.trigger(map, 'resize');
		});

		el.on('sizechange', function () {
			google.maps.event.trigger(map, 'resize');
		});
	});
}

/* eslint-disable-next-line no-unused-vars */
function t_appendYandexMap(recid, key) {
	var yarecid = recid;
	if (typeof ymaps === 'object' && typeof ymaps.Map === 'function') {
		t_handleYandexApiReady(recid);
	} else if (window.yandexmapsapiiscalled !== true) {
		var runfunc = 'window.t_handleYandexApiReady_' + yarecid + ' = function () { return t_handleYandexApiReady("' + yarecid + '") }';
		eval(runfunc);

		var maplang;
		maplang = $('#rec' + recid).find('.t-map').data('map-language');
		if (maplang && maplang == 'EN') {
			maplang = 'en_US';
		} else {
			maplang = 'ru_RU';
		}

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://api-maps.yandex.ru/2.1/?lang=' + maplang + '&coordorder=latlong&onload=t_handleYandexApiReady_' + yarecid;
		if (key > '') {
			script.src = script.src + '&apikey=' + key;
		}
		document.body.appendChild(script);
		window.yandexmapsapiiscalled = true;
	} else {
		setTimeout(function () {
			t_appendYandexMap(yarecid, key);
		}, 1000);
	}
}

function t_handleYandexApiReady(recid) {

	$('#rec' + recid).find('.t-map').each(function (index, Element) {
		var el = $(Element);
		var arMarkers = window['arMapMarkers' + recid];
		window.isDragMap = window.isMobile ? false : true;

		var myLatlng = arMarkers.length > 0 ? [parseFloat(arMarkers[0].lat), parseFloat(arMarkers[0].lng)] : false;
		var myStates = {
			zoom: parseInt(el.attr('data-map-zoom'), 10),
			center: myLatlng,
			scrollZoom: false,
			controls: ['typeSelector', 'zoomControl'],
			drag: window.isDragMap
		};

		var map = new ymaps.Map(Element, myStates),
			i, mrk;
		var myGroup = new ymaps.GeoObjectCollection({});

		var eventsPane = map.panes.get('events');
		var eventsPaneEl = eventsPane.getElement();

		var mobilePanelText = {
			EN: 'Use two fingers to move the map',
			RU: 'Чтобы переместить карту проведите по ней двумя пальцами',
			FR: 'Utilisez deux doigts pour déplacer la carte',
			DE: 'Verschieben der Karte mit zwei Fingern',
			ES: 'Para mover el mapa, utiliza dos dedos',
			PT: 'Use dois dedos para mover o mapa',
			UK: 'Переміщуйте карту двома пальцями',
			JA: '地図を移動させるには指 2 本で操作します',
			ZH: '使用双指移动地图',
			PL: 'Przesuń mapę dwoma palcami',
			KK: 'Картаны екі саусақпен жылжытыңыз',
			IT: 'Utilizza due dita per spostare la mappa',
			LV: 'Lai pārvietotu karti, bīdiet to ar diviem pirkstiem',
		};

		var mobilePanelStyles = {
			alignItems: 'center',
			boxSizing: 'border-box',
			color: 'white',
			display: 'flex',
			justifyContent: 'center',
			fontSize: '22px',
			fontFamily: 'Arial,sans-serif',
			opacity: '0.0',
			padding: '25px',
			textAlign: 'center',
			transition: 'opacity .3s',
			touchAction: 'auto'
		};

		Object.keys(mobilePanelStyles).forEach(function (name) {
			eventsPaneEl.style[name] = mobilePanelStyles[name];
		});

		map.behaviors.disable('scrollZoom');
		if (window.isMobile) {
			map.behaviors.disable('drag');

			ymaps.domEvent.manager.add(eventsPaneEl, 'touchmove', function (event) {
				if (event.get('touches').length === 1) {
					eventsPaneEl.style.transition = 'opacity .3s';
					eventsPaneEl.style.background = 'rgba(0, 0, 0, .45)';
					eventsPaneEl.textContent = mobilePanelText[window.browserLang] || mobilePanelText['EN'];
					eventsPaneEl.style.opacity = '1';
				}
			});

			ymaps.domEvent.manager.add(eventsPaneEl, 'touchend', function () {
				eventsPaneEl.style.transition = 'opacity .8s';
				eventsPaneEl.style.opacity = '0';
			});
		}

		for (i in arMarkers) {
			mrk = arMarkers[i];
			myLatlng = [parseFloat(mrk.lat), parseFloat(mrk.lng)];

			myGroup.add(new ymaps.Placemark(myLatlng, {
				hintContent: mrk.title,
				balloonContent: mrk.descr > '' ? $('<textarea/>').html(mrk.descr).text() : mrk.title
			}));
		}
		map.geoObjects.add(myGroup);

		var zoom = parseInt(el.attr('data-map-zoom'), 10);
		if (arMarkers.length > 1) {
			map.setBounds(myGroup.getBounds(), {
				checkZoomRange: true
			}).done(function () {
				if (zoom > 0 && (map.getZoom() == 0 || map.getZoom() > zoom)) {
					map.setZoom(zoom);
				}
			});
		} else if (zoom > 0 && (map.getZoom() == 0 || map.getZoom() > zoom)) {
			map.setZoom(zoom);
		}

		map.events.add('sizechange', function () {
			map.container.fitToViewport();

			if (arMarkers.length > 1) {
				map.setBounds(myGroup.getBounds(), {
					checkZoomRange: true
				}).done(function () {
					if (zoom > 0 && (map.getZoom() == 0 || map.getZoom() > zoom)) {
						map.setZoom(zoom);
					}
				});
			} else if (zoom > 0 && (map.getZoom() == 0 || map.getZoom() > zoom)) {
				map.setZoom(zoom);
			}
		});
	});
}