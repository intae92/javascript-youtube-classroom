import VideoSaveManager from '../manager/VideoSaveManager.js';
import {
  isModalOpen,
  isModalCloseButton,
  isModalDimmedArea,
  isRecentKeywordLink,
  isRecentKeywordRemoveButton,
} from './elementValidator.js';
import { isEndOfScroll } from '../utils/DOM.js';
import { doThrottling } from '../utils/throttle.js';
import { MESSAGE, SCROLL_DELAY_TIME, MAX_VIDEO_STORAGE_CAPACITY } from '../constants.js';

export default class SearchController {
  constructor({ searchModel, searchView, searchService }) {
    this.searchModel = searchModel;
    this.searchView = searchView;
    this.searchService = searchService;
    this.videoSaveManager = new VideoSaveManager();
  }

  init() {
    this.attachEvents();
  }

  attachEvents() {
    this.searchView.$searchMenuButton.addEventListener('click', this.onShowModal.bind(this));
    this.searchView.$searchSection.addEventListener('click', this.onCloseModal.bind(this));
    document.body.addEventListener('keyup', this.onCloseModal.bind(this));
    this.searchView.$recentKeywords.addEventListener('click', this.onClickRecentKeyword.bind(this));
    this.searchView.$searchKeywordForm.addEventListener('submit', this.onRequestSearchKeyword.bind(this));
    this.searchView.$searchResultWrapper.addEventListener('click', this.onRequestSaveVideo.bind(this));
    this.searchView.$searchResultWrapper.addEventListener(
      'scroll',
      doThrottling(this.onRequestNextResult.bind(this), SCROLL_DELAY_TIME),
      { passive: true },
    );
  }

  onShowModal() {
    const recentKeywords = this.searchModel.getRecentKeywords();
    const mostRecentKeyword = recentKeywords[0] ?? '';

    this.searchView.renderVisibleModal(this.searchModel.videoCount, recentKeywords);
    if (mostRecentKeyword === '') {
      return;
    }
    this.searchModel.init(mostRecentKeyword);
    this.showSearchGroup();
  }

  onCloseModal({ key, target, currentTarget }) {
    if ((key === 'Escape' && isModalOpen(currentTarget)) || isModalDimmedArea(target) || isModalCloseButton(target)) {
      this.searchView.renderInvisibleModal();
    }
    this.searchView.$watchingMenuButton.click();
  }

  onClickRecentKeyword({ target }) {
    if (isRecentKeywordLink(target)) {
      const keyword = target.innerText;

      this.searchModel.init(keyword);
      this.searchView.init();
      this.showSearchGroup();
      return;
    }

    if (isRecentKeywordRemoveButton(target)) {
      const $keyword = target.closest('.recent-keyword');
      const keyword = $keyword.querySelector('.keyword-link').innerText;

      this.searchModel.removeRecentKeyword(keyword);
      this.searchView.removeRecentKeyword(this.searchModel.recentKeywords);
    }
  }

  onRequestSearchKeyword(e) {
    e.preventDefault();

    const keyword = e.target.elements['search-keyword-input'].value;

    if (keyword === '') {
      this.searchView.renderNotification(MESSAGE.NO_KEYWORD_IS_SUBMITTED);
      return;
    }
    this.searchModel.init(keyword);
    this.searchView.init();
    this.searchView.renderRecentKeywords(this.searchModel.getRecentKeywords());
    this.showSearchGroup();
  }

  onRequestNextResult() {
    if (!isEndOfScroll(this.searchView.$searchResultWrapper)) {
      return;
    }
    this.showSearchGroup();
  }

  onRequestSaveVideo({ target }) {
    if (!target.classList.contains('save-button')) {
      return;
    }
    if (target.classList.contains('saved')) {
      this.searchView.renderNotification(MESSAGE.VIDEO_IS_ALREADY_SAVED);
      return;
    }

    const savedCount = this.searchModel.videoCount;

    if (savedCount >= MAX_VIDEO_STORAGE_CAPACITY) {
      this.searchView.renderNotification(MESSAGE.STORAGE_CAPACITY_IS_FULL);
      return;
    }

    const targetVideoData = this.searchModel.getTargetVideoData(target.id);

    this.searchModel.saveVideo(targetVideoData);
    this.searchView.renderInvisibleSaveButton(target);
    this.searchView.renderSaveVideoCount(savedCount + 1);
    this.searchView.renderNotification(MESSAGE.VIDEO_IS_SAVED_SUCCESSFULLY);

    this.videoSaveManager.notify(targetVideoData);
  }

  showSearchGroup() {
    this.searchView.renderSkeleton();
    this.searchService
      .getSearchResultAsync()
      .then((result) => this.searchView.renderSearchResult(result))
      .catch(() => {
        this.searchView.init();
        this.searchView.renderNotification(MESSAGE.SEARCH_REQUEST_HAS_FAILED);
      });
  }
}