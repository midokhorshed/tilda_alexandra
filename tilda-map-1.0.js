/* eslint-disable-next-line no-unused-vars */
function t_appendGoogleMap(recid, key) {
	if (typeof google === 'object' && typeof google.maps === 'object') {
		t_handleGoogleApiReady(recid);
	} else if (!window.googleapiiscalled) {
		var runfunc = 'window.t_handleGoogleApiReady_' + recid + ' = function () { t_handleGoogleApiReady("' + recid + '") }';
		eval(runfunc);

		var langPreferences = '';
		var mapLang = '';
		var tildaMapElement = document.querySelector('#rec' + recid + ' .t-map');
		var tildaMapElLang = tildaMapElement.getAttribute('data-map-language');
		if (tildaMapElement) {
			mapLang = tildaMapElLang || '';
		}
		if (mapLang && mapLang.length === 2) {
			langPreferences = '&language=' + mapLang;
		}

		var script = document.createElement('script');
		script.type = 'text/javascript';
		if (key) {
			script.src = 'https://maps.google.com/maps/api/js?key=' + key.trim() + '&callback=t_handleGoogleApiReady_' + recid + langPreferences;
		}
		document.body.appendChild(script);
		window.googleapiiscalled = true;
	} else {
		setTimeout(function () {
			t_appendGoogleMap(recid, key);
		}, 1000);
	}
}

function t_handleGoogleApiReady(recid) {
	var gmaps = document.querySelectorAll('#rec' + recid + ' .t-map');
	if (!gmaps.length) return false;
	Array.prototype.forEach.call(gmaps, function (gmap) {
		var arMarkers = window['arMapMarkers' + recid];
		var mapstyle = '[]';
		window.isDragMap = !window.isMobile;
		var mapStyleAttr = gmap.getAttribute('data-map-style');
		if (mapStyleAttr) {
			mapstyle = eval(mapStyleAttr);
		}
		var mapZoomAttr = gmap.getAttribute('data-map-zoom');
		var myLatLng = arMarkers.length > 0 ? new google.maps.LatLng(parseFloat(arMarkers[0].lat), parseFloat(arMarkers[0].lng)) : false;
		var myOptions = {
			zoom: parseInt(mapZoomAttr, 10),
			center: myLatLng,
			scrollwheel: false,
			gestureHandling: 'cooperative',
			zoomControl: true,
			styles: mapstyle
		};
		var map = new google.maps.Map(gmap, myOptions);
		var bounds = new google.maps.LatLngBounds();
		var marker;
		Array.prototype.forEach.call(arMarkers, function (el) {
			myLatLng = new google.maps.LatLng(parseFloat(el.lat), parseFloat(el.lng));
			marker = new google.maps.Marker({
				position: myLatLng,
				map: map,
				title: el.title
			});
			bounds.extend(myLatLng);
			if (el.descr) {
				t_map__attachInfoMessage(marker, el.descr);
			} else {
				t_map__attachInfoMessage(marker, el.title);
			}
		});

		function t_map__attachInfoMessage(marker, descr) {
			var textarea = document.createElement('textarea');
			textarea.innerHTML = descr;
			var infowindow = new google.maps.InfoWindow({
				content: textarea.textContent
			});
			marker.addListener('click', function () {
				infowindow.open(marker.get('map'), marker);
			});
		}

		if (arMarkers.length > 1) {
			map.fitBounds(bounds);
			var listener = google.maps.event.addListener(map, 'idle', function () {
				if (map.getZoom() > parseInt(mapZoomAttr, 10) || map.getZoom() === 0) {
					map.setZoom(parseInt(mapZoomAttr, 10));
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
			var zoom = parseInt(mapZoomAttr, 10);
			google.maps.event.trigger(map, 'resize');
			map.setCenter(center);
			if (arMarkers.length > 0) {
				map.fitBounds(bounds);
				if (zoom > 0 && (map.getZoom() > zoom || map.getZoom() == 0)) {
					map.setZoom(zoom);
				}
			}
		});

		gmap.addEventListener('displayChanged', function () {
			google.maps.event.trigger(map, 'resize');
		});
		gmap.addEventListener('sizechange', function () {
			google.maps.event.trigger(map, 'resize');
		});
	});
}

/* eslint-disable-next-line no-unused-vars */
function t_appendYandexMap(recid, key) {
	if (typeof ymaps === 'object' && typeof ymaps.Map === 'function') {
		t_handleYandexApiReady(recid);
	} else if (!window.yandexmapsapiiscalled) {
		var runfunc = 'window.t_handleYandexApiReady_' + recid + ' = function () { return t_handleYandexApiReady("' + recid + '") }';
		eval(runfunc);

		var mapLang = '';

		var tildaMapElement = document.querySelector('#rec' + recid + ' .t-map');
		var tildaMapElAttr = tildaMapElement.getAttribute('data-map-language');
		if (tildaMapElement) {
			switch (tildaMapElAttr) {
				case 'EN':
					mapLang = 'en_US';
					break;
				default:
					mapLang = 'ru_RU';
			}
		}

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://api-maps.yandex.ru/2.1/?lang=' + mapLang + '&coordorder=latlong&onload=t_handleYandexApiReady_' + recid;
		if (key) {
			script.src += '&apikey=' + key;
		}
		document.body.appendChild(script);
		window.yandexmapsapiiscalled = true;
	} else {
		setTimeout(function () {
			t_appendYandexMap(recid, key);
		}, 1000);
	}
}

function t_handleYandexApiReady(recid) {
	var ymapsArr = document.querySelectorAll('#rec' + recid + ' .t-map');
	if (!ymapsArr.length) return false;
	Array.prototype.forEach.call(ymapsArr, function (ymap) {
		var arMarkers = window['arMapMarkers' + recid];
		var mapZoomAttr = ymap.getAttribute('data-map-zoom');
		window.isDragMap = !window.isMobile;
		var myLatLng = arMarkers.length > 0 ? [parseFloat(arMarkers[0].lat), parseFloat(arMarkers[0].lng)] : false;
		var myOptions = {
			zoom: parseInt(mapZoomAttr, 10),
			center: myLatLng,
			scrollZoom: false,
			controls: ['typeSelector', 'zoomControl'],
			drag: window.isDragMap
		};
		var map = new ymaps.Map(ymap, myOptions);
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

		Array.prototype.forEach.call(Object.keys(mobilePanelStyles), function (name) {
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

		Array.prototype.forEach.call(arMarkers, function (marker) {
			var myLatlng = [parseFloat(marker.lat), parseFloat(marker.lng)];
			var textarea = document.createElement('textarea');
			textarea.innerHTML = marker.descr;
			myGroup.add(new ymaps.Placemark(myLatlng, {
				hintContent: marker.title,
				balloonContent: marker.descr ? textarea.textContent : marker.title
			}));
		});
		map.geoObjects.add(myGroup);

		var zoom = parseInt(mapZoomAttr, 10);
		if (arMarkers.length > 1) {
			map.setBounds(myGroup.getBounds(), {
				checkZoomRange: true,
				callback: function (err) {
					if (err) {
						return;
					}
					if (zoom > 0 && (map.getZoom() == 0 || map.getZoom() > zoom)) {
						map.setZoom(zoom);
					}
				}
			});
		} else if (zoom > 0 && (map.getZoom() == 0 || map.getZoom() > zoom)) {
			map.setZoom(zoom);
		}

		map.events.add('sizechange', function () {
			map.container.fitToViewport();

			if (arMarkers.length > 1) {
				map.setBounds(myGroup.getBounds(), {
					checkZoomRange: true,
					callback: function (err) {
						if (err) {
							return;
						}
						if (zoom > 0 && (map.getZoom() == 0 || map.getZoom() > zoom)) {
							map.setZoom(zoom);
						}
					}
				});
			} else if (zoom > 0 && (map.getZoom() == 0 || map.getZoom() > zoom)) {
				map.setZoom(zoom);
			}
		});
	});
}