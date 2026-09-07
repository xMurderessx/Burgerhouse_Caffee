(function () {
    'use strict';

    function initializeApp() {
        const SHIPPING_COST = 15;
        let cart = [];
        let currentProduct = {
            title: '',
            basePrice: 0,
            quantity: 1
        };

        const elements = {
            notificationContainer: document.getElementById('notification-container'),
            themeToggleButton: document.getElementById('theme-toggle-btn'),
            hamburgerButton: document.getElementById('hamburger-btn'),
            mainNav: document.getElementById('main-nav'),
            cartBadge: document.querySelector('.cart-badge'),
            cartToggleButton: document.getElementById('cart-toggle-btn'),
            cartDrawer: document.getElementById('cart-drawer'),
            cartCloseButton: document.querySelector('.cart-drawer__close'),
            cartItemsContainer: document.getElementById('cart-items-container'),
            cartSubtotal: document.getElementById('cart-subtotal'),
            cartTotal: document.getElementById('cart-total'),
            cartError: document.getElementById('cart-error-msg'),
            checkoutButton: document.getElementById('checkout-btn'),
            checkoutModal: document.getElementById('checkout-modal'),
            checkoutCloseButton: document.getElementById('close-checkout'),
            checkoutForm: document.getElementById('checkout-form'),
            trackingModal: document.getElementById('tracking-modal'),
            trackingCloseButton: document.getElementById('close-tracking'),
            trackingCode: document.getElementById('track-code'),
            infoModal: document.getElementById('info-modal'),
            infoCloseButton: document.getElementById('close-info'),
            infoTitle: document.getElementById('info-title'),
            infoDescription: document.getElementById('info-desc'),
            infoQuantity: document.getElementById('info-cantidad'),
            infoPrice: document.getElementById('info-total-price'),
            infoAddButton: document.getElementById('info-add-btn'),
            infoIncrementButton: document.getElementById('info-btn-sumar'),
            infoDecrementButton: document.getElementById('info-btn-restar'),
            loginButton: document.getElementById('login-btn'),
            loginModal: document.getElementById('login-modal'),
            loginCloseButton: document.getElementById('close-login'),
            loginForm: document.getElementById('login-form'),
            heroOrderButton: document.getElementById('hero-order-btn'),
            menuSection: document.getElementById('menu')
        };

        const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
        const productCards = Array.from(document.querySelectorAll('.product-card'));
        const extraCheckboxes = Array.from(document.querySelectorAll('.extra-checkbox'));

        function parsePrice(value) {
            const cleanedValue = String(value || '').replace(/[^\d.]/g, '');
            const parsedPrice = Number.parseFloat(cleanedValue);

            return Number.isFinite(parsedPrice) ? parsedPrice : 0;
        }

        function formatPrice(value) {
            const safeValue = Number.isFinite(value) ? value : 0;
            return `Bs. ${safeValue.toFixed(2)}`;
        }

        function showNotification(message, isError) {
            const container = elements.notificationContainer;
            if (!container) return;

            const notification = document.createElement('div');
            notification.className = isError ? 'notification error' : 'notification';
            notification.textContent = String(message || '');
            container.appendChild(notification);

            window.setTimeout(function () {
                if (notification.parentNode) notification.remove();
            }, 3000);
        }

        function openDialog(dialog) {
            if (!dialog || typeof dialog.showModal !== 'function') return false;

            try {
                if (!dialog.open) dialog.showModal();
                return true;
            } catch (error) {
                return false;
            }
        }

        function closeDialog(dialog) {
            if (!dialog || typeof dialog.close !== 'function') return false;

            try {
                if (dialog.open) dialog.close();
                return true;
            } catch (error) {
                return false;
            }
        }

        function getCardData(card) {
            if (!card) return { title: 'Producto', price: 0, description: '' };

            const titleElement = card.querySelector('h3');
            const priceElement = card.querySelector('.price');

            return {
                title: titleElement && titleElement.textContent ? titleElement.textContent.trim() : 'Producto',
                price: parsePrice(priceElement ? priceElement.textContent : ''),
                description: card.getAttribute('data-desc') || ''
            };
        }

        function getExtraTotal() {
            return extraCheckboxes.reduce(function (total, checkbox) {
                if (!checkbox || !checkbox.checked) return total;
                return total + parsePrice(checkbox.getAttribute('data-price'));
            }, 0);
        }

        function updateInfoModalPrice() {
            const quantity = Math.max(1, Number.parseInt(currentProduct.quantity, 10) || 1);
            const total = (currentProduct.basePrice + getExtraTotal()) * quantity;

            if (elements.infoQuantity) elements.infoQuantity.textContent = String(quantity);
            if (elements.infoPrice) elements.infoPrice.textContent = total.toFixed(2);
        }

        function addToCart(title, price, quantity) {
            const safeTitle = String(title || 'Producto').trim() || 'Producto';
            const safePrice = Number.isFinite(price) ? price : 0;
            const safeQuantity = Math.max(1, Number.parseInt(quantity, 10) || 1);
            const existingItem = cart.find(function (item) {
                return item.title === safeTitle && item.price === safePrice;
            });

            if (existingItem) {
                existingItem.quantity += safeQuantity;
            } else {
                cart.push({
                    title: safeTitle,
                    price: safePrice,
                    quantity: safeQuantity
                });
            }

            renderCart();
        }

        function createCartButton(label, action, index, className) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = className;
            button.dataset.cartAction = action;
            button.dataset.index = String(index);
            button.textContent = label;
            return button;
        }

        function renderCart() {
            const totalItems = cart.reduce(function (total, item) {
                return total + (Number.isFinite(item.quantity) ? item.quantity : 0);
            }, 0);

            if (elements.cartBadge) elements.cartBadge.textContent = String(totalItems);

            const subtotal = cart.reduce(function (total, item) {
                const price = Number.isFinite(item.price) ? item.price : 0;
                const quantity = Number.isFinite(item.quantity) ? item.quantity : 0;
                return total + price * quantity;
            }, 0);

            if (elements.cartSubtotal) elements.cartSubtotal.textContent = formatPrice(subtotal);
            if (elements.cartTotal) {
                elements.cartTotal.textContent = formatPrice(cart.length > 0 ? subtotal + SHIPPING_COST : 0);
            }

            const container = elements.cartItemsContainer;
            if (!container) return;

            container.replaceChildren();

            if (cart.length === 0) {
                const emptyMessage = document.createElement('p');
                emptyMessage.className = 'cart__empty-msg';
                emptyMessage.textContent = 'Tu carrito esta vacio.';
                container.appendChild(emptyMessage);
                return;
            }

            if (elements.cartError) elements.cartError.classList.add('hidden');

            cart.forEach(function (item, index) {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.style.cssText = 'margin-bottom:15px; padding-bottom:15px; border-bottom:1px solid var(--border-color);';

                const header = document.createElement('div');
                header.style.cssText = 'display:flex; justify-content:space-between; gap:12px; margin-bottom:5px;';

                const title = document.createElement('span');
                title.style.cssText = 'font-weight:bold; font-size:0.9rem;';
                title.textContent = item.title;

                const itemTotal = document.createElement('span');
                itemTotal.textContent = formatPrice(item.price * item.quantity);

                const controls = document.createElement('div');
                controls.style.cssText = 'display:flex; gap:10px; align-items:center;';

                const decreaseButton = createCartButton('-', 'decrease', index, 'btn-restar btn btn--secondary');
                decreaseButton.style.cssText = 'padding:2px 8px; cursor:pointer;';

                const quantity = document.createElement('span');
                quantity.textContent = String(item.quantity);

                const increaseButton = createCartButton('+', 'increase', index, 'btn-sumar btn btn--secondary');
                increaseButton.style.cssText = 'padding:2px 8px; cursor:pointer;';

                const removeButton = createCartButton('x', 'remove', index, 'btn-eliminar');
                removeButton.style.cssText = 'color:red; background:none; border:none; margin-left:auto; font-weight:bold; cursor:pointer;';
                removeButton.setAttribute('aria-label', `Eliminar ${item.title}`);

                header.append(title, itemTotal);
                controls.append(decreaseButton, quantity, increaseButton, removeButton);
                itemElement.append(header, controls);
                container.appendChild(itemElement);
            });
        }

        function handleCartControl(event) {
            const target = event.target instanceof Element ? event.target.closest('[data-cart-action]') : null;
            if (!target) return;

            const index = Number.parseInt(target.dataset.index || '', 10);
            const action = target.dataset.cartAction;
            if (!Number.isInteger(index) || !cart[index]) return;

            if (action === 'increase') {
                cart[index].quantity += 1;
            } else if (action === 'decrease') {
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
            } else if (action === 'remove') {
                cart.splice(index, 1);
            } else {
                return;
            }

            renderCart();
        }

        if (elements.themeToggleButton) {
            elements.themeToggleButton.addEventListener('click', function () {
                document.body.classList.toggle('dark-mode');
                const icon = elements.themeToggleButton.querySelector('i');
                if (!icon) return;

                icon.classList.toggle('fa-moon', !document.body.classList.contains('dark-mode'));
                icon.classList.toggle('fa-sun', document.body.classList.contains('dark-mode'));
            });
        }

        if (elements.hamburgerButton && elements.mainNav) {
            elements.hamburgerButton.addEventListener('click', function () {
                elements.mainNav.classList.toggle('active');
                elements.hamburgerButton.classList.toggle('active');
            });

            document.querySelectorAll('.nav__link').forEach(function (link) {
                link.addEventListener('click', function () {
                    elements.mainNav.classList.remove('active');
                    elements.hamburgerButton.classList.remove('active');
                });
            });
        }

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                const filter = button.getAttribute('data-filter') || 'all';

                filterButtons.forEach(function (filterButton) {
                    filterButton.classList.toggle('active', filterButton === button);
                });

                productCards.forEach(function (card) {
                    const matchesFilter = filter === 'all' || card.getAttribute('data-category') === filter;
                    card.style.display = matchesFilter ? 'flex' : 'none';
                });
            });
        });

        document.querySelectorAll('.btn-add').forEach(function (button) {
            button.addEventListener('click', function (event) {
                const target = event.currentTarget instanceof Element ? event.currentTarget : null;
                const card = target ? target.closest('.product-card') : null;
                const product = getCardData(card);

                addToCart(product.title, product.price, 1);
                showNotification(`\u00a1${product.title} anadido al carrito!`, false);
            });
        });

        if (elements.cartItemsContainer) {
            elements.cartItemsContainer.addEventListener('click', handleCartControl);
        }

        if (elements.cartToggleButton && elements.cartDrawer) {
            elements.cartToggleButton.addEventListener('click', function () {
                elements.cartDrawer.classList.add('open');
            });
        }

        if (elements.cartCloseButton && elements.cartDrawer) {
            elements.cartCloseButton.addEventListener('click', function () {
                elements.cartDrawer.classList.remove('open');
            });
        }

        if (elements.checkoutButton) {
            elements.checkoutButton.addEventListener('click', function () {
                if (cart.length === 0) {
                    if (elements.cartError) elements.cartError.classList.remove('hidden');
                    showNotification('\u00a1Error: el carrito esta vacio!', true);
                    return;
                }

                if (elements.cartError) elements.cartError.classList.add('hidden');
                if (elements.cartDrawer) elements.cartDrawer.classList.remove('open');

                if (!openDialog(elements.checkoutModal)) {
                    showNotification('No fue posible abrir el formulario de pago.', true);
                }
            });
        }

        if (elements.checkoutCloseButton) {
            elements.checkoutCloseButton.addEventListener('click', function () {
                closeDialog(elements.checkoutModal);
            });
        }

        if (elements.trackingCloseButton) {
            elements.trackingCloseButton.addEventListener('click', function () {
                closeDialog(elements.trackingModal);
            });
        }

        if (elements.checkoutForm) {
            elements.checkoutForm.addEventListener('submit', function (event) {
                event.preventDefault();

                if (cart.length === 0) {
                    showNotification('\u00a1Error: el carrito esta vacio!', true);
                    return;
                }

                closeDialog(elements.checkoutModal);

                if (elements.trackingCode) {
                    const code = Math.floor(1000 + Math.random() * 9000);
                    elements.trackingCode.textContent = `#${code}`;
                }

                if (!openDialog(elements.trackingModal)) {
                    showNotification('Pedido confirmado. No se pudo abrir el seguimiento.', false);
                } else {
                    showNotification('\u00a1Compra exitosa! Gracias por tu pedido.', false);
                }

                cart = [];
                renderCart();
                elements.checkoutForm.reset();
            });
        }

        document.querySelectorAll('.btn-info').forEach(function (button) {
            button.addEventListener('click', function (event) {
                const target = event.currentTarget instanceof Element ? event.currentTarget : null;
                const card = target ? target.closest('.product-card') : null;
                const product = getCardData(card);

                currentProduct = {
                    title: product.title,
                    basePrice: product.price,
                    quantity: 1
                };

                if (elements.infoTitle) elements.infoTitle.textContent = product.title;
                if (elements.infoDescription) elements.infoDescription.textContent = product.description;

                extraCheckboxes.forEach(function (checkbox) {
                    checkbox.checked = false;
                });

                updateInfoModalPrice();

                if (!openDialog(elements.infoModal)) {
                    showNotification('No fue posible abrir los detalles del producto.', true);
                }
            });
        });

        if (elements.infoCloseButton) {
            elements.infoCloseButton.addEventListener('click', function () {
                closeDialog(elements.infoModal);
            });
        }

        if (elements.infoIncrementButton) {
            elements.infoIncrementButton.addEventListener('click', function () {
                currentProduct.quantity += 1;
                updateInfoModalPrice();
            });
        }

        if (elements.infoDecrementButton) {
            elements.infoDecrementButton.addEventListener('click', function () {
                currentProduct.quantity = Math.max(1, currentProduct.quantity - 1);
                updateInfoModalPrice();
            });
        }

        extraCheckboxes.forEach(function (checkbox) {
            checkbox.addEventListener('change', updateInfoModalPrice);
        });

        if (elements.infoAddButton) {
            elements.infoAddButton.addEventListener('click', function () {
                if (!currentProduct.title) {
                    showNotification('Selecciona un producto antes de anadirlo.', true);
                    return;
                }

                const selectedExtras = extraCheckboxes.reduce(function (names, checkbox) {
                    if (!checkbox.checked) return names;

                    const label = checkbox.closest('label');
                    const name = label && label.textContent ? label.textContent.split('(')[0].trim() : '';
                    if (name) names.push(name);
                    return names;
                }, []);
                const itemName = selectedExtras.length > 0
                    ? `${currentProduct.title} (+ ${selectedExtras.join(', ')})`
                    : currentProduct.title;
                const unitPrice = currentProduct.basePrice + getExtraTotal();

                addToCart(itemName, unitPrice, currentProduct.quantity);
                closeDialog(elements.infoModal);
                showNotification(`\u00a1${currentProduct.title} anadido al pedido!`, false);
            });
        }

        if (elements.loginButton) {
            elements.loginButton.addEventListener('click', function () {
                if (!openDialog(elements.loginModal)) {
                    showNotification('No fue posible abrir el inicio de sesion.', true);
                }
            });
        }

        if (elements.loginCloseButton) {
            elements.loginCloseButton.addEventListener('click', function () {
                closeDialog(elements.loginModal);
            });
        }

        if (elements.loginForm) {
            elements.loginForm.addEventListener('submit', function (event) {
                event.preventDefault();
                closeDialog(elements.loginModal);
                elements.loginForm.reset();
                showNotification('\u00a1Sesion iniciada con exito!', false);
            });
        }

        if (elements.heroOrderButton && elements.menuSection) {
            elements.heroOrderButton.addEventListener('click', function () {
                elements.menuSection.scrollIntoView({ behavior: 'smooth' });
            });
        }

        renderCart();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
}());
