// Shows gallery photos full size over the page. Each photo is a link
// (marked data-lightbox) to its full-size image, so without JavaScript the
// link just opens the image. Uses a modal <dialog>, which gives focus
// trapping and Escape-to-close for free.
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
  dialog.setAttribute("aria-label", "Photo viewer");
  dialog.innerHTML =
    '<figure class="lightbox__figure">' +
    '<img class="lightbox__image" alt="">' +
    '<figcaption class="lightbox__caption"></figcaption>' +
    "</figure>" +
    '<button type="button" class="lightbox__button lightbox__close" aria-label="Close">&times;</button>' +
    '<button type="button" class="lightbox__button lightbox__prev" aria-label="Previous photo">&lsaquo;</button>' +
    '<button type="button" class="lightbox__button lightbox__next" aria-label="Next photo">&rsaquo;</button>';
  document.body.appendChild(dialog);

  var image = dialog.querySelector(".lightbox__image");
  var caption = dialog.querySelector(".lightbox__caption");
  var prev = dialog.querySelector(".lightbox__prev");
  var next = dialog.querySelector(".lightbox__next");
  var current = 0;

  if (links.length < 2) {
    prev.hidden = true;
    next.hidden = true;
  }

  function show(index) {
    current = (index + links.length) % links.length;
    var link = links[current];
    var thumb = link.querySelector("img");
    image.src = link.href;
    image.alt = thumb ? thumb.alt : "";
    caption.textContent = link.getAttribute("data-caption") || "";
    caption.hidden = !caption.textContent;
  }

  links.forEach(function (link, index) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      show(index);
      dialog.showModal();
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
    if (links.length < 2) {
      return;
    }
    if (event.key === "ArrowLeft") {
      show(current - 1);
    } else if (event.key === "ArrowRight") {
      show(current + 1);
    }
  });

  // Return focus to the photo last viewed (which may not be the one that
  // was opened). Deferred so it runs after the browser's own focus restore.
  dialog.addEventListener("close", function () {
    setTimeout(function () {
      links[current].focus();
    }, 0);
  });
})();
