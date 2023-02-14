const productDOM = document.querySelector('#product-item');
const btns = document.querySelectorAll('#product-btn');
const cartItems = document.querySelector('#cart-item-count');
const cartTotal = document.querySelector('#cart-total');
const cardContent = document.querySelector('#card-content');
const cartDOM = document.querySelector('#cart');
const cartBtn = document.querySelector('#cart-btn');
const closeCart = document.querySelector('#close-cart');
const navOpen = document.querySelector('#nav-open');
const navClose = document.querySelector('#nav-close');
const navMenu = document.querySelector('#nav-menu');
const clearCartBtn = document.querySelector('#clear-btn');
const scrollUP = document.querySelector('#scroll-up');
const sections = document.querySelectorAll('section[id]');
const searchForm = document.querySelector('#searchForm');
const Input = document.querySelector('#search-input');


//cart
let cart = [];
//buttons
let buttonDOM;
class Products {
    async getProducts() {
        try {
            let result = await fetch('products.json');
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image }
            })

            return products;
        } catch (error) {
            console.log(error);
        }
    }
}


class UI {

    displayProducts(products) {

        let result = '';
        products.forEach(product => {
            result += `
                <div class="product__card" id="product-card">
                <div class="product__data1">
                    <img class="product__img" src=${product.image} alt=" product image " />
                    <div class="product__react">
                        <i class="fa-regular fa-heart"></i>
                    </div>
                </div>
                <div class="product__data2">
                    <div>
                        <p class="product__item-title">${product.title}</p>
                        <button class="product__btn" id="add-product" data-id=${product.id}>Add to Cart</button>
                    </div>
                    <h3 class="product__price">$${product.price}</h3>
                </div>
            </div>
                `

        });
        productDOM.innerHTML = result;

    }

    searchProduct(event) {
        event.preventDefault();
        const InputValue = Input.value;
        const searchQuery = InputValue.trim().toLowerCase();
        let getTitles = document.querySelectorAll('.product__item-title');


        getTitles.forEach(getTitle => {
            if (!getTitle.textContent.toLowerCase().trim().includes(searchQuery)) {
                getTitle.parentElement.parentElement.parentElement.parentElement.removeChild(getTitle.parentElement.parentElement.parentElement);
            }
        })
    }



    getAddProductButtons() {
        const buttons = [...document.querySelectorAll('#add-product')];
        buttonDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
                button.classList.add('product-incart')
            }
            button.addEventListener('click', (event) => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                button.classList.add('product-incart')
                    // get product from product
                let cartItem = {...Storage.getProduct(id), amount: 1 };
                // add product to the cart
                cart = [...cart, cartItem];
                // save cart in local storage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValues(cart);
                // add cart item
                this.addCartItem(cartItem);
                // diplay cart item
            })
        })
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;

    }
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('card__data');
        div.innerHTML = ` 
        <img class="cart__img" src=${item.image} alt="" />
        <div>
            <p class="cart__name">${item.title}</p>
            <p class="cart__price">$${item.price}</p>
            <p class="remove__item" data-id=${item.id}>remove</p>
        </div>
        <div class="cart__icon">
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item__count">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
        cardContent.appendChild(div);
    }

    showCart() {
        cartDOM.classList.add('show-cart')
    };

    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populate(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCart.addEventListener('click', this.hideCart);
        navOpen.addEventListener('click', this.openMenu);
        navClose.addEventListener('click', this.closeMenu);
        window.addEventListener('scroll', this.scrolUP);
        window.addEventListener('scroll', this.scrollActive);
        searchForm.addEventListener('submit', this.searchProduct);
        Input.addEventListener('keyup', this.reloadwindow);
    }

    populate(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    hideCart() {
        cartDOM.classList.remove('show-cart');
    }

    openMenu() {
        navMenu.classList.add('show-menu')
    }
    closeMenu() {
        navMenu.classList.remove('show-menu')
    }

    scrolUP() {
        if (this.scrollY > 100) {
            this.scrollY >= 350 ? scrollUP.classList.add('scroll-up') : scrollUP.classList.remove('scroll-up');
        }
    }

    scrollActive() {
        const scrollY = window.pageYOffset;
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight,
                sectionTop = current.offsetTop - 30,
                sectionId = current.getAttribute('id'),
                sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                sectionsClass.classList.add('active')
            } else {
                sectionsClass.classList.remove('active')
            }
        });

    }

    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });
        cardContent.addEventListener('click', event => {
            if (event.target.classList.contains('remove__item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cardContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);

            } else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmout = event.target;
                let id = addAmout.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmout.nextElementSibling.innerText = tempItem.amount;
            } else if (event.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cardContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        })
    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while (cardContent.children.length > 0) {
            cardContent.removeChild(cardContent.children[0])
        }
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerText = 'Add to cart';
        button.classList.remove('product-incart')
    }

    getSingleButton(id) {
        return buttonDOM.find(button => button.dataset.id === id);
    }
}


class Storage {
    static saveProduct(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let product = JSON.parse(localStorage.getItem('products'));
        return product.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products()
        // setup app
    ui.setupAPP();
    // get all product
    products.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProduct(products);
    }).then(() => {
        ui.getAddProductButtons();
        ui.cartLogic();

    });

});