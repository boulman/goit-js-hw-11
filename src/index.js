import { Notify } from 'notiflix/build/notiflix-notify-aio';
import 'notiflix/dist/notiflix-3.2.6.min.css';
const { default: axios } = require('axios');
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const elements = {
  form: document.querySelector('.search-form'),
  list: document.querySelector('.js-list'),
  guard: document.querySelector('.js-guard'),
};
let page = 1;
let currentSearch = '';

elements.form.addEventListener('submit', handleSubmit);
var gallery = new SimpleLightbox('.gallery a', {});
const observer = new IntersectionObserver(handleIntersect, {
  rootMargin: '400px',
});

async function handleSubmit(e) {
  e.preventDefault();
  currentSearch = e.currentTarget.elements.searchQuery.value.replaceAll(
    ' ',
    '+'
  );
  try {
    const { data } = await getImages(currentSearch);
    if (!data.hits.length) {
      throw new Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
    console.log(data.hits);
    elements.list.innerHTML = createMarkup(data.hits);
    gallery.refresh();
    observer.observe(elements.guard);
  } catch (error) {
    Notify.failure(error.message);
  } finally {
    elements.form.reset();
  }
}

async function getImages(searchQuery) {
  const BASE_URL = 'https://pixabay.com/api/';
  const params = new URLSearchParams({
    key: '39305799-292385ae54204aba3384f6c5e',
    image_type: 'photo',
    safesearch: true,
    orientation: 'horizontal',
    q: searchQuery,
    per_page: '40',
    page: page,
  });
  return await axios.get(`${BASE_URL}?${params}`);
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        views,
        downloads,
        likes,
        comments,
        tags,
        largeImageURL,
      }) => `<a href="${largeImageURL}"><div class="photo-card" data-source="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
  <div class="info">
    <p class="info-item">
      <b>Likes </b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${views}
    </p>
    <p class="info-item">
      <b>Comments </b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads </b>${downloads}
    </p>
  </div>
  </div></a>`
    )
    .join('');
}

async function handleIntersect() {
  page += 1;
  try {
    const { data } = await getImages(currentSearch);
    elements.list.insertAdjacentHTML('beforeend', createMarkup(data.hits));
    gallery.refresh();
  } catch (error) {
    Notify.failure(error.message);
  }
}
