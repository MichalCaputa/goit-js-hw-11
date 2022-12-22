const axios = require('axios').default;
import { Notify } from 'notiflix/build/notiflix-notify-aio';
let page = 1;
let per_page = 20;
let oldImage;
const API_KEY = '32265971-d67ec7699f5bfc85107bf3eda';
export const galleryItems = async image => {
  console.log('zapytanie', image);
  if (image != oldImage) {
    page = 1;
    oldImage = image;
  }
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${API_KEY}=${image}&image_type=photo&per_page=${per_page}&page=${page}&orientation=horizontal&safesearch=true`
    );
    page++;
    return { foundImages: response, page, per_page };
  } catch (error) {
    Notify.failure(error.message);
    return error;
  }
};
