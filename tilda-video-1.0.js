if (document.readyState !== 'loading') {
  var tVideoLazy = document.querySelectorAll('.t-video-lazyload');
  if (tVideoLazy.length) {
    t_video_lazyload_init();
  }
} else {
  document.addEventListener('DOMContentLoaded', function () {
    var tVideoLazy = document.querySelectorAll('.t-video-lazyload');
    if (tVideoLazy.length) {
      t_video_lazyload_init();
    }
  });
}

function t_video_lazyload_init() {
  t_video_lazyload_add_video();
  window.addEventListener('scroll', t_throttle(t_video_lazyload_add_video, 300));
}

function t_video_lazyload_add_video() {
  var windowHeight = document.documentElement.clientHeight;
  var scrollDiffHeigth = 700;
  var tVideoLazyList = document.querySelectorAll('.t-video-lazyload');

  Array.prototype.forEach.call(tVideoLazyList, function (tVideoLazy) {
    var dataHeight = tVideoLazy.getAttribute('data-videolazy-height');
    var dataVideoId = tVideoLazy.getAttribute('data-videolazy-id');
    var dataVideoHash = tVideoLazy.getAttribute('data-videolazy-hash');
    var dataBlockId = tVideoLazy.getAttribute('data-blocklazy-id');
    var dataTwoBlockId = tVideoLazy.getAttribute('data-videolazy-two-id');
    var isVideoLoaded = tVideoLazy.getAttribute('data-videolazy-load');
    var dataVideoType = tVideoLazy.getAttribute('data-videolazy-type');

    var videoHeight = '100%';
    if (dataHeight && !(~dataHeight.indexOf('vh'))) {
      videoHeight = dataHeight;
    }
    var blockTop = tVideoLazy.getBoundingClientRect().top;
    var videoId = dataVideoId ? dataVideoId.trim() : '';
    var videoHash = dataVideoHash ? dataVideoHash.trim() : '';
    var blockId = dataBlockId || '';
    var videoTwoId = '';
    if (dataTwoBlockId) {
      videoTwoId = '_' + dataTwoBlockId + '_';
    }

    if (window.pageYOffset > blockTop - windowHeight - scrollDiffHeigth) {
      if (isVideoLoaded === 'false' && !tVideoLazy.classList.contains('t-video__isload')) {
        tVideoLazy.setAttribute('data-videolazy-load', 'true');
        switch (dataVideoType) {
          case 'youtube':
            videoId += ~videoId.indexOf('?') ? '&' : '?';
            tVideoLazy.insertAdjacentHTML('afterbegin', '<iframe id="youtubeiframe' + videoTwoId + blockId + '" width="100%" height="' + videoHeight + '" src="//youtube.com/embed/' + videoId + 'rel=0&fmt=18&html5=1&showinfo=0" frameborder="0" allowfullscreen></iframe>');
            break;
          case 'vimeo':
            var hashQueryStr = videoHash ? 'h=' + videoHash + '&' : '';
            tVideoLazy.insertAdjacentHTML('afterbegin', '<iframe src="//player.vimeo.com/video/' + videoId + '?' + hashQueryStr + 'title=0&byline=0&portrait=0&badge=0&color=ffffff" width="100%" height="' + videoHeight + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
            break;
        }
      }
    }
  });
}