import { Notify } from 'notiflix/build/notiflix-notify-aio';

//simple LightBox
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
//
import { galleryItems } from '../js/gallery-items.js';

const gallery = document.querySelector('div.gallery');
const inputField = document.querySelector('input[name="searchQuery"]');
const loadMoreButton = document.querySelector('button.load-more');
const loadMoreAutomatic = document.querySelector('div.automatic-loading');

const imageLoaderChanger = document.querySelector('button.changer');
const form = document.querySelector('form');
const automaticScroll = () => {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};

let searchLimit = false;
let automaticLoading = true;

const observator = observeOn => {
  if (observeOn === true) {
    if (automaticLoading === true) {
      observer.observe(loadMoreAutomatic);
      loadMoreAutomatic.style.display = '';
      loadMoreButton.style.display = 'none';
    } else {
      loadMoreAutomatic.style.display = 'none';
      loadMoreButton.style.display = '';
      observer.unobserve(loadMoreAutomatic);
    }
  } else {
    observer.unobserve(loadMoreAutomatic);
    loadMoreButton.style.display = 'none';
    loadMoreAutomatic.style.display = 'none';
  }
};
let oldSearchedImage = '';
function renderImages(images) {
  console.log({ images });
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        likes,
        views,
        comments,
        downloads,
        tags,
      }) =>
        `
  <div class="gallery__card">
      <a class="gallery__item" href="${largeImageURL}">
        <img
        class="gallery__image"
        src="${webformatURL}"        
        loading="lazy"
        alt="${tags}"
     
      />
      </a>
  
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
     <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
          <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
</div>`
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
  observator(true);
}

const imageSearch = async event => {
  event.preventDefault();
  let searchedImage = inputField.value.trim();
  if (searchedImage === oldSearchedImage && (searchLimit = true)) {
    console.log(searchedImage, oldSearchedImage);
    return Notify.success(
      "We're sorry, but you've reached the end of search results."
    );
  }
  //oldSearchedImage = searchedImage;
  observator(false);
  window.scrollTo(0, 0);
  searchLimit = false;

  const { foundImages, page, per_page } = await galleryItems(searchedImage);
  const imagesData = await foundImages.data.hits;
  if (imagesData.length === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );

    return (gallery.innerHTML = '');
  }

  if (searchedImage != oldSearchedImage) {
    gallery.innerHTML = '';
    oldSearchedImage = searchedImage;
    Notify.success(`Hurray! We found ${foundImages.data.totalHits} images`);
  }
  if (
    foundImages.data.totalHits > 0 &&
    (page - 1) * per_page >= foundImages.data.totalHits
  ) {
    observator(false);
    searchLimit = true;
    return Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }

  return renderImages(imagesData);
};
const imageLoader = async () => {
  observator(false);
  let searchedImage = inputField.value.trim();
  const { foundImages, page, per_page } = await galleryItems(searchedImage);
  const imagesData = await foundImages.data.hits;
  console.log(
    'znalezione obrazki i wygenerowane',
    foundImages.data.totalHits,
    (page - 1) * per_page
  );
  if (
    foundImages.data.totalHits > 0 &&
    (page - 1) * per_page >= foundImages.data.totalHits
  ) {
    searchLimit = true;
    observer.unobserve(loadMoreButton);
    return Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
  if (imagesData.length === 0) {
    observer.unobserve(loadMoreButton);
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return (gallery.innerHTML = '');
  }

  if (searchedImage != oldSearchedImage) {
    gallery.innerHTML = '';
    oldSearchedImage = searchedImage;
    Notify.success(`Hurray! We found ${foundImages.data.totalHits} images`);
  }
  renderImages(imagesData);
  automaticScroll();
  return;
};
form.addEventListener('submit', imageSearch);
let lightbox = new SimpleLightbox('.gallery a');
let debounce = 0;
const observer = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;
  if (debounce + 1000 < Date.now()) {
    imageLoader();
    debounce = Date.now();
  }
});
loadMoreButton.addEventListener('click', () => imageLoader());
imageLoaderChanger.addEventListener('click', event => {
  const amountOfLoadedPIctures =
    document.querySelectorAll('div.gallery__card').length;
  if (automaticLoading === true) {
    automaticLoading = false;
    if (searchLimit === false && amountOfLoadedPIctures != 0) {
      observator(true);
    } else {
      observator(false);
    }
    event.currentTarget.textContent =
      'Loading more pictures on button at the bottom';
  } else {
    automaticLoading = true;
    if (searchLimit === false && amountOfLoadedPIctures != 0) {
      observator(true);
    } else {
      observator(false);
    }
    event.currentTarget.textContent = 'Automatic loading of images';
  }
});

loadMoreAutomatic.style.display = 'none';
loadMoreButton.style.display = 'none';
