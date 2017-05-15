namespace YoutubeTracker {

  interface YTPlayer extends YT.Player {
    [key: string]: any;
  }

  interface Mark {
    [key: string]: number;
  }

  var ytTracker = (function (document, window, config) {
    'use strict';
    window.onYouTubeIframeAPIReady = (function () {
      var cached = window.onYouTubeIframeAPIReady;
      return function (this: any) {
        if (cached) { cached.apply(this, arguments); }
        if (!navigator.userAgent.match(/MSIE [67]\./gi)) {
          init();
        }
      };
    })();

    //*****//
    // DO NOT EDIT ANYTHING BELOW THIS LINE EXCEPT CONFIG AT THE BOTTOM
    //*****//
    // Invoked by the YouTube API when it's ready
    function init() {
      var iframes: NodeListOf<HTMLIFrameElement> = document.getElementsByTagName('iframe');
      var embeds: NodeListOf<HTMLEmbedElement> = document.getElementsByTagName('embed');
      digestPotentialVideos(iframes);
      digestPotentialVideos(embeds);
    }

    var tag = document.createElement('script');
    tag.src = '//www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);

    // Take our videos and turn them into trackable videos with events
    function digestPotentialVideos(potentialVideos: NodeListOf<HTMLIFrameElement | HTMLEmbedElement>) {
      var i;
      for (i = 0; i < potentialVideos.length; i++) {
        var isYouTubeVideo = checkIfYouTubeVideo(potentialVideos[i]);
        if (isYouTubeVideo) {
          var normalizedYouTubeIframe = normalizeYouTubeIframe(potentialVideos[i]);
          addYouTubeEvents(normalizedYouTubeIframe);
        }
      }
    }

    // Determine if the element is a YouTube video or not   
    function checkIfYouTubeVideo(potentialYouTubeVideo: HTMLIFrameElement | HTMLEmbedElement) {
      // Exclude already decorated videos     
      if (potentialYouTubeVideo.getAttribute('data-gtm-yt')) {
        return false;
      }
      var potentialYouTubeVideoSrc = potentialYouTubeVideo.src || '';
      if (potentialYouTubeVideoSrc.indexOf('youtube.com/embed/') > -1 || potentialYouTubeVideoSrc.indexOf('youtube.com/v/') > -1) {
        return true;
      }
      return false;
    }

    // Turn embed objects into iframe objects and ensure they have the right parameters
    function normalizeYouTubeIframe(youTubeVideo: HTMLIFrameElement | HTMLEmbedElement) {
      var a = document.createElement('a');
      a.href = youTubeVideo.src;
      a.hostname = 'www.youtube.com';
      a.protocol = document.location.protocol;
      var tmpPathname = a.pathname.charAt(0) === '/' ? a.pathname : '/' + a.pathname;  // IE10 shim
      // For security reasons, YouTube wants an origin parameter set that matches our hostname
      var origin = window.location.protocol + '%2F%2F' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
      if (a.search.indexOf('enablejsapi') === -1) {
        a.search = (a.search.length > 0 ? a.search + '&' : '') + 'enablejsapi=1';
      }
      // Don't set if testing locally
      if (a.search.indexOf('origin') === -1 && window.location.hostname.indexOf('localhost') === -1) {
        a.search = a.search + '&origin=' + origin;
      }
      if (youTubeVideo.type === 'application/x-shockwave-flash') {
        var newIframe = document.createElement('iframe');
        newIframe.height = youTubeVideo.height;
        newIframe.width = youTubeVideo.width;
        tmpPathname = tmpPathname.replace('/v/', '/embed/');
        youTubeVideo.parentNode!.parentNode!.replaceChild(newIframe, youTubeVideo.parentNode!);
        youTubeVideo = newIframe;
      }
      a.pathname = tmpPathname;
      if (youTubeVideo.src !== a.href + a.hash) {
        youTubeVideo.src = a.href + a.hash;
      }
      youTubeVideo.setAttribute('data-gtm-yt', 'true');
      return youTubeVideo;
    }

    // Add event handlers for events emitted by the YouTube API
    function addYouTubeEvents(youTubeIframe: HTMLIFrameElement | HTMLEmbedElement) {
      youTubeIframe.pauseFlag = false;
      var videoId: string = youTubeIframe.src.match(/\/embed\/(.*)\?.*/)![1];
      let player = new YT.Player(youTubeIframe, { videoId: videoId });
      player.addEventListener('onStateChange', function (evt: YT.OnStateChangeEvent) {
        onStateChangeHandler(evt, youTubeIframe);
      });
    }

    // Returns key/value pairs of percentages: number of seconds to achieve
    function getMarks(duration: number): Mark {
      var marks: Mark = {};
      // For full support, we're handling Watch to End with percentage viewed
      if (config.events['Watch to End']) {
        marks['100%'] = duration * 99 / 100 - 1;
      }
      if (config.percentageTracking) {
        var points: number[] = [];
        var i;
        if (config.percentageTracking.each) {
          points = points.concat(config.percentageTracking.each);
        }
        for (i = 0; i < points.length; i++) {
          var point = points[i];
          var mark = point + '%';
          var time = duration * point / 100;
          marks[mark] = Math.floor(time);
        }
      }
      return marks;
    }

    function checkCompletion(player: YTPlayer, marks: Mark, videoId: string) {
      var currentTime = player.getCurrentTime();
      player[videoId] = player[videoId] || {};
      var key;
      for (key in marks) {
        if (marks[key] <= currentTime && !player[videoId][key]) {
          player[videoId][key] = true;
          fireAnalyticsEvent(videoId, key);
        }
      }
    }

    // Event handler for events emitted from the YouTube API
    function onStateChangeHandler(evt: YT.OnStateChangeEvent, youTubeIframe: HTMLIFrameElement | HTMLEmbedElement) {
      var stateIndex = evt.data; // number
      var player = evt.target;
      var targetVideoUrl = player.getVideoUrl();
      var targetVideoId = targetVideoUrl.match(/[?&]v=([^&#]*)/)![1];  // Extract the ID    
      var playerState = player.getPlayerState();
      var duration = player.getDuration();
      var marks = getMarks(duration);
      var playerStatesIndex = {
        '1': 'Play',
        '2': 'Pause'
      } as { [key: string]: string };
      var state: string = playerStatesIndex[stateIndex];
      youTubeIframe.playTracker = youTubeIframe.playTracker || {};
      if (playerState === 1 && !youTubeIframe.timer) {
        clearInterval(youTubeIframe.timer);
        youTubeIframe.timer = setInterval(function () {
          // Check every second to see if we've hit any of our percentage viewed marks
          checkCompletion(player, marks, youTubeIframe.videoId);
        }, 1000);
      } else {
        clearInterval(youTubeIframe.timer);
        youTubeIframe.timer = false;
      }
      // Playlist edge-case handler
      if (stateIndex === 1) {
        youTubeIframe.playTracker[targetVideoId] = true;
        youTubeIframe.videoId = targetVideoId;
        youTubeIframe.pauseFlag = false;
      }
      if (!youTubeIframe.playTracker[youTubeIframe.videoId]) {
        // This video hasn't started yet, so this is spam
        return false;
      }

      if (stateIndex === 1) {
        if (!youTubeIframe.playFlag) {
          youTubeIframe.playFlag = true;
        } else {
          // I want to fire play event only once
          return false;
        }
      }
      if (stateIndex === 2) {
        if (!youTubeIframe.pauseFlag) {
          youTubeIframe.pauseFlag = true;
        } else {
          // We don't want to fire consecutive pause events
          return false;
        }
      }
      // If we're meant to track this event, fire it
      if (config.events[state]) {
        fireAnalyticsEvent(youTubeIframe.videoId, state);
      }
      return undefined;
    }

    // Fire an event to Google Analytics or Google Tag Manager
    function fireAnalyticsEvent(videoId: string, state: string) {
      var videoUrl = 'https://www.youtube.com/watch?v=' + videoId;
      if (typeof window['dataLayer'] !== 'undefined') {
        window['dataLayer'].push({
          'event': 'youTubeTrack',
          'attributes': {
            'videoUrl': videoUrl,
            'videoAction': state
          }
        });
      }
    }
    return {
      init,
      digestPotentialVideos
    };
  })(document, window, {
    'events': {
      'Play': true,
      'Pause': false,
      'Watch to End': true
    } as { [key: string]: boolean; },
    'percentageTracking': {
      'each': [25, 50, 75, 95]
    }
  });
}
