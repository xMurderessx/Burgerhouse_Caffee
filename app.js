document.addEventListener('DOMContentLoaded', () => {
    let carrito = [];
    
    // ==========================================
    // NOTIFICACIONES FLOTANTES
    // ==========================================
    function showNotification(message, isError = false) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notif = document.createElement('div');
        notif.className = 'notification' + (isError ? ' error' : '');
        notif.textContent = message;
        container.appendChild(notif);

        setTimeout(() => {
            notif.remove();
        }, 3000);
    }

    // ==========================================
    // MODO OSCURO MANUAL Y AUTOMÁTICO
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                if (document.body.classList.contains('dark-mode')) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            }
        });
    }

    // ==========================================
    // MENÚ HAMBURGUESA RESPONSIVO (MÓVIL / TABLET)
    // ==========================================
    const btnMenu = document.getElementById('hamburger-btn');
    const mainNav = document.getElementById('main-nav');

    if (btnMenu && mainNav) {
        btnMenu.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            btnMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                btnMenu.classList.remove('active');
            });
        });
    }

    // ==========================================
    // FILTROS DEL MENÚ
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ==========================================
    // CARRITO Y MODALES
    // ==========================================
    const badgeCarrito = document.querySelector('.cart-badge');
    const btnToggleCarrito = document.getElementById('cart-toggle-btn');
    const cajonCarrito = document.getElementById('cart-drawer');
    const contenedorItems = document.getElementById('cart-items-container');
    const totalElemento = document.getElementById('cart-total');
    const subtotalElemento = document.getElementById('cart-subtotal');
    const cartErrorMsg = document.getElementById('cart-error-msg');

    // Añadir directo desde la tarjeta
    document.querySelectorAll('.btn-add').forEach(boton => {
        boton.addEventListener('click', (e) => {
            const tarjeta = e.target.closest('.product-card');
            const titulo = tarjeta.querySelector('h3') ? tarjeta.querySelector('h3').innerText : 'Producto';
            const precioTexto = tarjeta.querySelector('.price') ? tarjeta.querySelector('.price').innerText : '0';
            
            // Extrae solo números y decimales de forma segura
            const precio = parseFloat(precioTexto.replace(/[^\d.]/g, '')) || 0; 
            
            agregarAlCarrito(titulo, precio, 1);
            showNotification(`¡${titulo} agregado al carrito!`);
        });
    });

    function agregarAlCarrito(titulo, precio, cantidad) {
        const existente = carrito.find(item => item.titulo === titulo);
        if (existente) existente.cantidad += cantidad;
        else carrito.push({ titulo, precio, cantidad });
        actualizarCarrito();
    }

    function actualizarCarrito() {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        if (badgeCarrito) badgeCarrito.innerText = totalItems;

        if (carrito.length === 0) {
            if (contenedorItems) contenedorItems.innerHTML = '<p class="cart__empty-msg">Tu carrito está vacío.</p>';
            if (totalElemento) totalElemento.innerText = 'Bs. 0.00';
            if (subtotalElemento) subtotalElemento.innerText = 'Bs. 0.00';
            return;
        }

        // Si hay productos, ocultar mensaje de error si estaba visible
        if (cartErrorMsg) cartErrorMsg.classList.add('hidden');

        if (contenedorItems) contenedorItems.innerHTML = '';
        let subtotal = 0;

        carrito.forEach((item, index) => {
            subtotal += (item.precio * item.cantidad);
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.style.cssText = "margin-bottom:15px; padding-bottom:15px; border-bottom:1px solid var(--border-color);";
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span style="font-weight:bold; font-size:0.9rem;">${item.titulo}</span>
                    <span>Bs. ${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button type="button" class="btn-restar btn btn--secondary" data-index="${index}" style="padding:2px 8px; cursor:pointer;">−</button>
                    <span>${item.cantidad}</span>
                    <button type="button" class="btn-sumar btn btn--secondary" data-index="${index}" style="padding:2px 8px; cursor:pointer;">+</button>
                    <button type="button" class="btn-eliminar" data-index="${index}" style="color:red; background:none; border:none; margin-left:auto; font-weight:bold; cursor:pointer;">×</button>
                </div>
            `;
            if (contenedorItems) contenedorItems.appendChild(div);
        });

        if (subtotalElemento) subtotalElemento.innerText = `Bs. ${subtotal.toFixed(2)}`;
        if (totalElemento) totalElemento.innerText = `Bs. ${(subtotal + 15).toFixed(2)}`;
        asignarEventosControles();
    }

    function asignarEventosControles() {
        document.querySelectorAll('.btn-sumar').forEach(btn => btn.addEventListener('click', (e) => {
            carrito[e.target.dataset.index].cantidad++;
            actualizarCarrito();
        }));
        document.querySelectorAll('.btn-restar').forEach(btn => btn.addEventListener('click', (e) => {
            const idx = e.target.dataset.index;
            if (carrito[idx].cantidad > 1) carrito[idx].cantidad--;
            else carrito.splice(idx, 1);
            actualizarCarrito();
        }));
        document.querySelectorAll('.btn-eliminar').forEach(btn => btn.addEventListener('click', (e) => {
            carrito.splice(e.target.dataset.index, 1);
            actualizarCarrito();
        }));
    }

    if (btnToggleCarrito && cajonCarrito) {
        btnToggleCarrito.addEventListener('click', () => cajonCarrito.classList.add('open'));
        const closeCartBtn = document.querySelector('.cart-drawer__close');
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', () => cajonCarrito.classList.remove('open'));
        }
    }

    // Checkout & Tracking con Validación de Carrito Vacío
    const modalCheckout = document.getElementById('checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const modalTracking = document.getElementById('tracking-modal');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (carrito.length === 0) {
                if (cartErrorMsg) cartErrorMsg.classList.remove('hidden');
                showNotification('¡Error: El carrito está vacío!', true);
                return;
            }
            if (cartErrorMsg) cartErrorMsg.classList.add('hidden');
            if (cajonCarrito) cajonCarrito.classList.remove('open');
            if (modalCheckout) modalCheckout.showModal();
        });
    }

    const closeCheckout = document.getElementById('close-checkout');
    const closeTracking = document.getElementById('close-tracking');
    if (closeCheckout && modalCheckout) closeCheckout.addEventListener('click', () => modalCheckout.close());
    if (closeTracking && modalTracking) closeTracking.addEventListener('click', () => modalTracking.close());

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (modalCheckout) modalCheckout.close();
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            
            const trackCodeEl = document.getElementById('track-code');
            if (trackCodeEl) trackCodeEl.innerText = `#${randomCode}`;
            
            if (modalTracking) modalTracking.showModal();
            showNotification('¡Compra exitosa! Gracias por tu pedido.');
            carrito = [];
            actualizarCarrito();
            checkoutForm.reset();
        });
    }

    // Modal Info Producto con Extras y Cantidades
    const modalInfo = document.getElementById('info-modal');
    const closeInfoBtn = document.getElementById('close-info');
    let currentProduct = null;
    let currentBasePrice = 0;
    let currentQty = 1;
    const checkboxesExtras = document.querySelectorAll('.extra-checkbox');

    document.querySelectorAll('.btn-info').forEach(boton => {
        boton.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            currentProduct = card.querySelector('h3') ? card.querySelector('h3').innerText : 'Producto';
            
            const precioTexto = card.querySelector('.price') ? card.querySelector('.price').innerText : '0';
            currentBasePrice = parseFloat(precioTexto.replace(/[^\d.]/g, '')) || 0;
            currentQty = 1;

            const infoTitleEl = document.getElementById('info-title');
            const infoDescEl = document.getElementById('info-desc');
            const infoCantEl = document.getElementById('info-cantidad');

            if (infoTitleEl) infoTitleEl.innerText = currentProduct;
            if (infoDescEl) infoDescEl.innerText = card.getAttribute('data-desc') || '';
            if (infoCantEl) infoCantEl.innerText = currentQty;

            checkboxesExtras.forEach(cb => cb.checked = false);
            actualizarPrecioModalInfo();
            if (modalInfo) modalInfo.showModal();
        });
    });

    if (closeInfoBtn && modalInfo) {
        closeInfoBtn.addEventListener('click', () => modalInfo.close());
    }

    const btnSumarInfo = document.getElementById('info-btn-sumar');
    const btnRestarInfo = document.getElementById('info-btn-restar');
    
    if (btnSumarInfo) {
        btnSumarInfo.addEventListener('click', () => {
            currentQty++;
            const infoCantEl = document.getElementById('info-cantidad');
            if (infoCantEl) infoCantEl.innerText = currentQty;
            actualizarPrecioModalInfo();
        });
    }

    if (btnRestarInfo) {
        btnRestarInfo.addEventListener('click', () => {
            if (currentQty > 1) {
                currentQty--;
                const infoCantEl = document.getElementById('info-cantidad');
                if (infoCantEl) infoCantEl.innerText = currentQty;
                actualizarPrecioModalInfo();
            }
        });
    }

    checkboxesExtras.forEach(cb => {
        cb.addEventListener('change', actualizarPrecioModalInfo);
    });

    function actualizarPrecioModalInfo() {
        let extrasTotal = 0;
        checkboxesExtras.forEach(cb => {
            if (cb.checked) extrasTotal += parseFloat(cb.getAttribute('data-price') || 0);
        });
        const totalUnitario = currentBasePrice + extrasTotal;
        const totalFinal = totalUnitario * currentQty;
        const totalPriceEl = document.getElementById('info-total-price');
        if (totalPriceEl) totalPriceEl.innerText = totalFinal.toFixed(2);
    }

    const infoAddBtn = document.getElementById('info-add-btn');
    if (infoAddBtn && modalInfo) {
        infoAddBtn.addEventListener('click', () => {
            let extrasTotal = 0;
            let extrasNombres = [];
            checkboxesExtras.forEach(cb => {
                if (cb.checked) {
                    extrasTotal += parseFloat(cb.getAttribute('data-price') || 0);
                    const labelText = cb.parentElement ? cb.parentElement.innerText.trim().split('(')[0].trim() : '';
                    if (labelText) extrasNombres.push(labelText);
                }
            });

            const precioUnitarioConExtras = currentBasePrice + extrasTotal;
            const nombreConExtras = extrasNombres.length > 0 ? `${currentProduct} (+ ${extrasNombres.join(', ')})` : currentProduct;

            agregarAlCarrito(nombreConExtras, precioUnitarioConExtras, currentQty);
            modalInfo.close();
            showNotification(`¡${currentProduct} añadido al pedido!`);
        });
    }

    // Botones de login básicos
    const loginBtn = document.getElementById('login-btn');
    const loginModal = document.getElementById('login-modal');
    const closeLogin = document.getElementById('close-login');
    const loginForm = document.getElementById('login-form');

    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', () => loginModal.showModal());
    }
    if (closeLogin && loginModal) {
        closeLogin.addEventListener('click', () => loginModal.close());
    }
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (loginModal) loginModal.close();
            showNotification('¡Sesión iniciada con éxito!');
            loginForm.reset();
        });
    }

    const heroOrderBtn = document.getElementById('hero-order-btn');
    if (heroOrderBtn) {
        heroOrderBtn.addEventListener('click', () => {
            const menuSection = document.getElementById('menu');
            if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
});