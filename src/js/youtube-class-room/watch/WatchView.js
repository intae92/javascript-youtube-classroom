import { createSavedClipTemplate } from "../../templates/videoClipTemplate.js";

import { PALLET } from "../../utils/constants.js";
import elements from "../../utils/elements.js";
import {
  hideElement,
  showElement,
  removeBackgroundColor,
  addBackgroundColor,
} from "../../utils/dom.js";

export default class WatchView {
  removeAllButtonColor() {
    removeBackgroundColor(elements.$watchLaterViewButton, PALLET.CYAN_100);
    removeBackgroundColor(elements.$watchedViewButton, PALLET.CYAN_100);
  }

  hideAllSection() {
    hideElement(elements.$notSaved);
    hideElement(elements.$notWatched);
    hideElement(elements.$watchLaterVideos);
    hideElement(elements.$watchedVideos);
  }

  markWatchLaterViewButton() {
    this.removeAllButtonColor();
    addBackgroundColor(elements.$watchLaterViewButton, PALLET.CYAN_100);
  }

  markWatchedViewButton() {
    this.removeAllButtonColor();
    addBackgroundColor(elements.$watchedViewButton, PALLET.CYAN_100);
  }

  appendSavedVideoClips(items) {
    const fragment = document.createDocumentFragment();

    items.forEach((item) => fragment.append(createSavedClipTemplate(item)));

    return fragment;
  }

  showNotSavedImg() {
    this.hideAllSection();
    showElement(elements.$notSaved);
  }

  showNotWatchedImg() {
    this.hideAllSection();
    showElement(elements.$notWatched);
  }

  showWatchLaterVideos(watchLaterVideos) {
    this.hideAllSection();
    showElement(elements.$watchLaterVideos);

    elements.$watchLaterVideos.innerHTML = "";
    elements.$watchLaterVideos.append(
      this.appendSavedVideoClips(watchLaterVideos)
    );
  }

  showWatchedVideos(watchedVideos) {
    this.hideAllSection();
    showElement(elements.$watchedVideos);

    elements.$watchedVideos.innerHTML = "";
    elements.$watchedVideos.append(this.appendSavedVideoClips(watchedVideos));
  }
}
