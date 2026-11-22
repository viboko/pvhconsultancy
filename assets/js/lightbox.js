// Shows gallery photos full size, and plays gallery videos, over the page.
// Each tile is a link (marked data-lightbox) to its full-size image or its
// video file, so without JavaScript the link just opens that file. Video
// tiles are marked data-lightbox="video". Uses a modal <dialog>, which gives
// focus trapping and Escape-to-close for free.
(function () {
  "use strict";

  var links = Array.prototype.slice.call(
    document.querySelectorAll("a[data-lightbox]")
  );
  if (links.length === 0 || typeof HTMLDialogElement !== "function") {
    return;
  }

  var dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", "Gallery viewer");
  dialog.innerHTML =
    '<figure class="lightbox__figure">' +
    '<div class="lightbox__frame">' +
    '<img class="lightbox__image" alt="">' +
    '<video class="lightbox__video" controls playsinline preload="metadata" hidden></video>' +
    '<span class="lightbox__spinner" role="status"><span class="visually-hidden">Loading</span></span>' +
    "</div>" +
    '<figcaption class="lightbox__caption"></figcaption>' +
    "</figure>" +
    '<button type="button" class="lightbox__button lightbox__close" aria-label="Close">&times;</button>' +
    '<button type="button" class="lightbox__button lightbox__prev" aria-label="Previous">&lsaquo;</button>' +
    '<button type="button" class="lightbox__button lightbox__next" aria-label="Next">&rsaquo;</button>';
  document.body.appendChild(dialog);

  var frame = dialog.querySelector(".lightbox__frame");
  var image = dialog.querySelector(".lightbox__image");
  var video = dialog.querySelector(".lightbox__video");
  var caption = dialog.querySelector(".lightbox__caption");
  var prev = dialog.querySelector(".lightbox__prev");
  var next = dialog.querySelector(".lightbox__next");
  var current = 0;

  if (links.length < 2) {
    prev.hidden = true;
    next.hidden = true;
  }

  // Shows the spinner (and hides the photo) until the file has loaded.
  function setLoading(loading) {
    frame.classList.toggle("is-loading", loading);
  }

  // The item's aspect ratio, from the tile's data-width/height, so the
  // frame takes its final size before the file arrives.
  function setRatio(link) {
    var width = Number(link.getAttribute("data-width"));
    var height = Number(link.getAttribute("data-height"));
    if (width && height) {
      frame.style.setProperty("--ratio", String(width / height));
    } else {
      frame.style.removeProperty("--ratio");
    }
  }

  // Stops the video and drops its source, so it stops downloading too.
  function stopVideo() {
    video.pause();
    video.removeAttribute("src");
    video.removeAttribute("poster");
    video.load();
  }

  function show(index, autoplay) {
    current = (index + links.length) % links.length;
    var link = links[current];
    var isVideo = link.getAttribute("data-lightbox") === "video";

    stopVideo();
    image.removeAttribute("src");
    image.hidden = isVideo;
    video.hidden = !isVideo;
    setRatio(link);
    setLoading(true);

    if (isVideo) {
      var poster = link.getAttribute("data-poster");
      if (poster) {
        video.poster = poster;
      }
      video.src = link.href;
      if (autoplay) {
        var playing = video.play();
        if (playing && playing.catch) {
          playing.catch(function () {
            // Autoplay refused - the controls are there to start it.
            if (video.readyState > 0) {
              setLoading(false);
            }
          });
        }
      }
    } else {
      var thumb = link.querySelector("img");
      image.alt = thumb ? thumb.alt : "";
      image.src = link.href;
      // Already in the browser's cache: no load event may follow.
      if (image.complete && image.naturalWidth) {
        setLoading(false);
      }
    }

    caption.textContent = link.getAttribute("data-caption") || "";
    caption.hidden = !caption.textContent;
  }

  image.addEventListener("load", function () {
    setLoading(false);
  });
  image.addEventListener("error", function () {
    setLoading(false);
  });

  // The video is ready to show once its first frame (or, if it isn't
  // playing yet, its size and length) has loaded. If it later runs out of
  // data while playing, the spinner comes back until it can carry on.
  video.addEventListener("loadedmetadata", function () {
    if (video.paused) {
      setLoading(false);
    }
  });
  ["canplay", "playing", "error"].forEach(function (type) {
    video.addEventListener(type, function () {
      if (video.getAttribute("src")) {
        setLoading(false);
      }
    });
  });
  video.addEventListener("waiting", function () {
    if (video.getAttribute("src")) {
      setLoading(true);
    }
  });

  links.forEach(function (link, index) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      dialog.showModal();
      show(index, true);
    });
  });

  dialog.querySelector(".lightbox__close").addEventListener("click", function () {
    dialog.close();
  });
  prev.addEventListener("click", function () {
    show(current - 1);
  });
  next.addEventListener("click", function () {
    show(current + 1);
  });

  // Clicking the dark backdrop (the dialog itself, outside the photo and
  // buttons) closes it.
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener("keydown", function (event) {
    // Leave arrow keys to the video's own controls (seeking) when it has
    // focus.
    if (links.length < 2 || event.target === video) {
      return;
    }
    if (event.key === "ArrowLeft") {
      show(current - 1);
    } else if (event.key === "ArrowRight") {
      show(current + 1);
    }
  });

  // Stop any video, then return focus to the tile last viewed (which may
  // not be the one that was opened). Deferred so it runs after the
  // browser's own focus restore.
  dialog.addEventListener("close", function () {
    stopVideo();
    setTimeout(function () {
      links[current].focus();
    }, 0);
  });
})();
