const itemsSection = document.querySelector('.items');
const cartSection = document.querySelector('.cart');
const olCartSection = document.querySelector('.cart__items');

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

const totalPrice = document.createElement('span');
totalPrice.className = 'total-price';
cartSection.appendChild(totalPrice);

// Fonte: https://stackoverflow.com/questions/3612744/remove-insignificant-trailing-zeros-from-a-number
const getTotalPrice = () => {
  const itemsHTMLCollection = document.querySelectorAll('.cart__item');
  const items = [...itemsHTMLCollection];
  const prices = [];
  items.forEach((item) => {
    const findPrice = item.innerText.split('$');
    prices.push(parseFloat(findPrice[1]));
  });
  if (items.length === 0) {
    totalPrice.innerText = '';
  } else {
    const price = prices.reduce((acc, curr) => acc + curr, 0);
    totalPrice.innerText = parseFloat(price);
  }
};

function saveItemsInLocalStorage() {
  const itemsHTMLCollection = document.querySelectorAll('.cart__item');
  const items = [...itemsHTMLCollection];
  const cartItemsInLocalStorage = [];
  items.forEach((item) => {
    const itemObj = {
      className: item.className,
      innerText: item.innerText,
      id: item.id,
    };
    cartItemsInLocalStorage.push(itemObj);
  });
  localStorage.setItem('items', JSON.stringify(cartItemsInLocalStorage));
}

function cartItemClickListener(event) {
  saveItemsInLocalStorage();
  event.path[0].remove();
  getTotalPrice();
}

function createCartItemElement({ id, title, price }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.id = id;
  li.innerText = `SKU: ${id} | NAME: ${title} | PRICE: $${price}`;
  li.addEventListener('click', cartItemClickListener);
  olCartSection.appendChild(li);
  return li;
}

async function addToCartCallback(e) {
  const itemId = e.path[1].firstChild.innerText;
  try {
    const response = await fetch(`https://api.mercadolibre.com/items/${itemId}`);
    const itemData = await response.json();
    createCartItemElement(itemData);
    saveItemsInLocalStorage();
  } catch (error) {
    console.log('Erro ao repassar itens para o carrinho!');
  }
  getTotalPrice();
}

function getAddToCartBtnListener() {
  const addBtn = document.getElementsByClassName('item__add');
  const addToCartBtnArray = [...addBtn];
  addToCartBtnArray.forEach((btn) => btn.addEventListener('click', (e) => addToCartCallback(e)));
}

const getItems = async () => {
  try {
    const response = await fetch('https://api.mercadolibre.com/sites/MLB/search?q=$computador');
    const computers = await response.json();
    computers.results.forEach(({ id, title, thumbnail }) => {
      const item = { sku: id, name: title, image: thumbnail };
      const createItem = createProductItemElement(item);
  
      itemsSection.appendChild(createItem);
    });
  } catch (error) {
    console.log('Erro ao receber os dados dos Itens');
  }
  await document.querySelector('.loading').remove();
  getAddToCartBtnListener();
};

function loadLocalStorage() {
  if (localStorage.getItem('items')) {
    const itemsInLocalStorageCart = JSON.parse(localStorage.getItem('items'));
    itemsInLocalStorageCart.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'cart__item';
      li.innerText = item.innerText;
      li.id = item.id;
      li.addEventListener('click', cartItemClickListener);
      olCartSection.appendChild(li);
      getTotalPrice();
    });
  }
}

function clearCart() {
  const cartItems = [...document.getElementsByClassName('cart__item')];
  cartItems.forEach((item) => {
    olCartSection.firstElementChild.remove();
  });
  totalPrice.innerText = '';
}

const btnClear = document.querySelector('.empty-cart');
btnClear.addEventListener('click', clearCart);

window.onload = () => { 
  getItems();
  loadLocalStorage();
};
