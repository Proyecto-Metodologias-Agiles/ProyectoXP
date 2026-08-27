// ============================================================================
// 1. CATÁLOGO DE PRODUCTOS (DATOS INICIALES)
// ============================================================================
const PRODUCTS_DATA = [
  {
    id: "PROD-01",
    name: "Laptop Titan Pro 16\"",
    category: "Laptops",
    price: 1299.99,
    stock: 6,
    icon: "💻",
    description: "Procesador Octa-Core de última generación, 32GB RAM DDR5 y 1TB SSD NVMe para máximo rendimiento.",
  },
  {
    id: "PROD-02",
    name: "Ultrabook Air Slim 14\"",
    category: "Laptops",
    price: 849.50,
    stock: 8,
    icon: "💻",
    description: "Diseño ultradelgado en aluminio anodizado, pantalla 2.8K OLED y batería de hasta 18 horas.",
  },
  {
    id: "PROD-03",
    name: "Monitor Gamer Curvo 27\" 165Hz",
    category: "Monitores",
    price: 320.00,
    stock: 4,
    icon: "🖥️",
    description: "Resolución QHD 1440p, curvatura 1500R inmersiva, 1ms de respuesta y soporte HDR400.",
  },
  {
    id: "PROD-04",
    name: "Monitor Profesional 4K 32\"",
    category: "Monitores",
    price: 499.99,
    stock: 3,
    icon: "🖥️",
    description: "Panel IPS con calibración de color 99% DCI-P3, puerto USB-C con entrega de energía de 90W.",
  },
  {
    id: "PROD-05",
    name: "Teclado Mecánico RGB Custom",
    category: "Accesorios",
    price: 89.90,
    stock: 15,
    icon: "⌨️",
    description: "Switches mecánicos lubricados de fábrica, estructura gasket mount e iluminación RGB por tecla.",
  },
  {
    id: "PROD-06",
    name: "Mouse Inalámbrico Ultra-Light",
    category: "Accesorios",
    price: 45.00,
    stock: 20,
    icon: "🖱️",
    description: "Sensor óptico 26K DPI, peso pluma de 58g y conexión inalámbrica de baja latencia 2.4GHz.",
  },
  {
    id: "PROD-07",
    name: "Auriculares Noise Cancelling ANC",
    category: "Audio",
    price: 180.00,
    stock: 7,
    icon: "🎧",
    description: "Cancelación activa de ruido inteligente, audio de alta resolución con códec LDAC y 40h de autonomía.",
  },
  {
    id: "PROD-08",
    name: "Micrófono de Estudio USB",
    category: "Audio",
    price: 75.00,
    stock: 10,
    icon: "🎙️",
    description: "Patrón polar cardioide, brazo articulado metálico y filtro anti-pop integrado para transmisiones claras.",
  },
  {
    id: "PROD-09",
    name: "Disco SSD NVMe Gen4 2TB",
    category: "Almacenamiento",
    price: 140.00,
    stock: 12,
    icon: "💾",
    description: "Velocidades de lectura de hasta 7450 MB/s, disipador de grafeno y compatibilidad con PC y consolas.",
  },
  {
    id: "PROD-10",
    name: "Hub USB-C 8 en 1 con HDMI 4K",
    category: "Accesorios",
    price: 35.50,
    stock: 18,
    icon: "🔌",
    description: "Carcasa de aluminio, puerto HDMI 4K@60Hz, Gigabit Ethernet, lector SD/TF y carga PD 100W.",
  }
];

// ============================================================================
// 2. DEFINICIÓN DE REGLAS DE CUPONES Y DESCUENTOS
// ============================================================================
const COUPONS_DATA = {
  "DESC10": {
    code: "DESC10",
    type: "PORCENTUAL",
    value: 10,
    minAmount: 0,
    desc: "10% de descuento directo en cualquier compra"
  },
  "SUPER50": {
    code: "SUPER50",
    type: "MONTO_FIJO",
    value: 50,
    minAmount: 150,
    desc: "$50 de descuento directo en compras desde $150"
  },
  "BIENVENIDA20": {
    code: "BIENVENIDA20",
    type: "PORCENTUAL",
    value: 20,
    minAmount: 200,
    desc: "20% de descuento en compras de $200 o más"
  },
  "VERANO30": {
    code: "VERANO30",
    type: "PORCENTUAL",
    value: 30,
    minAmount: 300,
    desc: "30% de descuento en compras de $300 o más"
  },
  "DESCUENTOFACIL": {
    code: "DESCUENTOFACIL",
    type: "PORCENTUAL",
    value: 15,
    minAmount: 100,
    desc: "15% de descuento a partir de $100"
  }
};

// ============================================================================
// 3. ESTADO GLOBAL DEL CLIENTE
// ============================================================================
const state = {
  cart: {},           // { [productId]: quantity }
  activeCoupon: null, // Objeto de cupón o null
  activeCategory: "all",
  searchQuery: "",
  taxRate: 0.16,      // 16% IVA
};

// ============================================================================
// 4. PERSISTENCIA EN LOCALSTORAGE
// ============================================================================
function loadStateFromStorage() {
  try {
    const savedCart = localStorage.getItem("xp_cart");
    if (savedCart) {
      state.cart = JSON.parse(savedCart);
    }
    const savedCoupon = localStorage.getItem("xp_coupon");
    if (savedCoupon && COUPONS_DATA[savedCoupon]) {
      state.activeCoupon = COUPONS_DATA[savedCoupon];
    }
  } catch (e) {
    console.warn("No se pudo cargar el estado desde localStorage", e);
  }
}

function saveStateToStorage() {
  try {
    localStorage.setItem("xp_cart", JSON.stringify(state.cart));
    if (state.activeCoupon) {
      localStorage.setItem("xp_coupon", state.activeCoupon.code);
    } else {
      localStorage.removeItem("xp_coupon");
    }
  } catch (e) {
    console.warn("No se pudo guardar el estado en localStorage", e);
  }
}

// ============================================================================
// 5. MOTOR DE CÁLCULO DE TOTALES (Lógica idéntica a Python)
// ============================================================================
function calculateTotals() {
  let subtotal = 0;
  let totalItemsCount = 0;

  for (const [productId, quantity] of Object.entries(state.cart)) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (product && quantity > 0) {
      subtotal += product.price * quantity;
      totalItemsCount += quantity;
    }
  }
  subtotal = Math.round(subtotal * 100) / 100;

  // Validación y cálculo de descuento
  let discount = 0;
  if (state.activeCoupon && subtotal > 0) {
    if (subtotal >= state.activeCoupon.minAmount) {
      if (state.activeCoupon.type === "PORCENTUAL") {
        discount = subtotal * (state.activeCoupon.value / 100);
      } else {
        discount = state.activeCoupon.value;
      }
      discount = Math.min(discount, subtotal);
      discount = Math.round(discount * 100) / 100;
    } else {
      // Subtotal cayó por debajo del monto mínimo
      showToast(`El cupón ${state.activeCoupon.code} requiere compra mínima de $${state.activeCoupon.minAmount}. Se ha retirado.`, "error");
      state.activeCoupon = null;
    }
  } else {
    state.activeCoupon = null;
  }

  const taxableBase = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
  const tax = Math.round(taxableBase * state.taxRate * 100) / 100;
  const total = Math.round((taxableBase + tax) * 100) / 100;

  return {
    subtotal,
    discount,
    taxableBase,
    tax,
    total,
    totalItemsCount,
    isEmpty: totalItemsCount === 0
  };
}

// ============================================================================
// 6. ACCIONES DEL CARRITO
// ============================================================================
function addToCart(productId, quantity = 1) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) {
    showToast("Producto no encontrado.", "error");
    return;
  }

  const currentQty = state.cart[productId] || 0;
  const targetQty = currentQty + quantity;

  if (targetQty > product.stock) {
    showToast(`Stock insuficiente. Solo hay ${product.stock} unidades de '${product.name}'.`, "error");
    return;
  }

  state.cart[productId] = targetQty;
  saveStateToStorage();
  updateCartUI();
  animateCartBadge();
  showToast(`¡'${product.name}' agregado al carrito!`, "success");
}

function updateQuantity(productId, newQty) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }

  if (newQty > product.stock) {
    showToast(`Stock máximo alcanzado (${product.stock} unidades).`, "error");
    return;
  }

  state.cart[productId] = newQty;
  saveStateToStorage();
  updateCartUI();
}

function removeFromCart(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (state.cart[productId]) {
    delete state.cart[productId];
    saveStateToStorage();
    updateCartUI();
    if (product) {
      showToast(`'${product.name}' eliminado del carrito.`, "info");
    }
  }
}

function emptyCart() {
  state.cart = {};
  state.activeCoupon = null;
  saveStateToStorage();
  updateCartUI();
  showToast("El carrito ha sido vaciado por completo.", "info");
}

function applyCoupon(code) {
  if (!code || !code.trim()) {
    showCouponFeedback("Por favor escribe un código de cupón.", "error");
    return;
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = COUPONS_DATA[cleanCode];

  if (!coupon) {
    showCouponFeedback(`El código '${cleanCode}' no es válido.`, "error");
    return;
  }

  const totals = calculateTotals();
  if (totals.isEmpty) {
    showCouponFeedback("Agrega productos al carrito antes de aplicar un cupón.", "error");
    return;
  }

  if (totals.subtotal < coupon.minAmount) {
    showCouponFeedback(`Este cupón requiere una compra mínima de $${coupon.minAmount.toFixed(2)}.`, "error");
    return;
  }

  state.activeCoupon = coupon;
  saveStateToStorage();
  updateCartUI();
  showCouponFeedback(`¡Cupón ${coupon.code} aplicado correctamente!`, "success");
  showToast(`Cupón '${coupon.code}' aplicado (-${coupon.desc})`, "success");
}

function removeCoupon() {
  state.activeCoupon = null;
  saveStateToStorage();
  updateCartUI();
  showCouponFeedback("Cupón retirado.", "info");
  showToast("Cupón de descuento retirado.", "info");
}

// ============================================================================
// 7. RENDERIZADO DEL DOM Y UI
// ============================================================================
function renderProducts() {
  const grid = document.getElementById("products-grid");
  const countLabel = document.getElementById("products-count");
  const noProductsMsg = document.getElementById("no-products-msg");

  const filtered = PRODUCTS_DATA.filter(product => {
    const matchesCategory = state.activeCategory === "all" || product.category.toLowerCase() === state.activeCategory.toLowerCase();
    const query = state.searchQuery.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query) || product.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  countLabel.textContent = `Mostrando ${filtered.length} de ${PRODUCTS_DATA.length} productos`;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    noProductsMsg.classList.remove("hidden");
    return;
  }

  noProductsMsg.classList.add("hidden");
  grid.innerHTML = filtered.map(product => {
    const inCartQty = state.cart[product.id] || 0;
    const availableStock = product.stock - inCartQty;
    const isLowStock = product.stock <= 4;

    return `
      <article class="product-card" id="card-${product.id}">
        <div class="product-visual">
          <span class="product-badge-category">${product.category}</span>
          <span class="product-badge-stock ${isLowStock ? 'badge-low-stock' : 'badge-in-stock'}">
            ${isLowStock ? `¡Solo ${product.stock} disp!` : `${product.stock} en stock`}
          </span>
          <span class="product-icon-art">${product.icon}</span>
        </div>
        <div class="product-body">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-desc">${product.description}</p>
        </div>
        <div class="product-footer">
          <div class="product-price-box">
            <span class="price-label">Precio</span>
            <span class="product-price">$${product.price.toFixed(2)}</span>
          </div>
          <button class="btn btn-primary btn-add-cart" onclick="addToCart('${product.id}')" ${availableStock <= 0 ? 'disabled' : ''}>
            ${availableStock <= 0 ? 'Agotado' : '⚡ Agregar'}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function updateCartUI() {
  const totals = calculateTotals();

  // Badges y contadores
  const cartBadge = document.getElementById("cart-badge");
  const drawerCount = document.getElementById("drawer-items-count");
  cartBadge.textContent = totals.totalItemsCount;
  drawerCount.textContent = `${totals.totalItemsCount} ${totals.totalItemsCount === 1 ? 'producto' : 'productos'} seleccionados`;

  const emptyState = document.getElementById("cart-empty-state");
  const itemsList = document.getElementById("cart-items-list");
  const cartFooter = document.getElementById("cart-footer");

  if (totals.isEmpty) {
    emptyState.classList.remove("hidden");
    itemsList.classList.add("hidden");
    cartFooter.classList.add("hidden");
    itemsList.innerHTML = "";
    return;
  }

  emptyState.classList.add("hidden");
  itemsList.classList.remove("hidden");
  cartFooter.classList.remove("hidden");

  // Render items en el drawer
  itemsList.innerHTML = Object.entries(state.cart).map(([productId, quantity]) => {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return "";
    const itemSubtotal = (product.price * quantity).toFixed(2);

    return `
      <div class="cart-item" id="cart-item-${product.id}">
        <div class="cart-item-icon">${product.icon}</div>
        <div class="cart-item-details">
          <div class="cart-item-name" title="${product.name}">${product.name}</div>
          <div class="cart-item-unit-price">$${product.price.toFixed(2)} c/u</div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="updateQuantity('${product.id}', ${quantity - 1})" title="Disminuir">-</button>
            <span class="qty-val">${quantity}</span>
            <button class="qty-btn" onclick="updateQuantity('${product.id}', ${quantity + 1})" ${quantity >= product.stock ? 'disabled' : ''} title="Aumentar">+</button>
          </div>
        </div>
        <div class="cart-item-subtotal-box">
          <span class="cart-item-subtotal">$${itemSubtotal}</span>
          <button class="cart-item-delete" onclick="removeFromCart('${product.id}')" title="Eliminar ítem">🗑️</button>
        </div>
      </div>
    `;
  }).join("");

  // Desglose de totales
  document.getElementById("summary-subtotal").textContent = `$${totals.subtotal.toFixed(2)}`;

  const discountRow = document.getElementById("summary-discount-row");
  const discountAmount = document.getElementById("summary-discount");
  if (totals.discount > 0) {
    discountRow.classList.remove("hidden");
    discountAmount.textContent = `-$${totals.discount.toFixed(2)}`;
  } else {
    discountRow.classList.add("hidden");
  }

  document.getElementById("summary-taxable").textContent = `$${totals.taxableBase.toFixed(2)}`;
  document.getElementById("summary-tax").textContent = `$${totals.tax.toFixed(2)}`;
  document.getElementById("summary-total").textContent = `$${totals.total.toFixed(2)}`;

  // Estado del Cupón
  const couponBadge = document.getElementById("coupon-active-badge");
  const couponInputGroup = document.querySelector(".coupon-input-group");
  if (state.activeCoupon && totals.discount > 0) {
    couponBadge.classList.remove("hidden");
    couponInputGroup.classList.add("hidden");
    document.getElementById("active-coupon-code").textContent = state.activeCoupon.code;
    document.getElementById("active-coupon-desc").textContent = `(${state.activeCoupon.desc})`;
  } else {
    couponBadge.classList.add("hidden");
    couponInputGroup.classList.remove("hidden");
  }

  // Re-render catálogo si hay botones que deshabilitar por stock
  renderProducts();
}

function showCouponFeedback(message, type) {
  const el = document.getElementById("coupon-feedback");
  el.textContent = message;
  el.className = `coupon-feedback feedback-${type}`;
  el.classList.remove("hidden");
  setTimeout(() => {
    el.classList.add("hidden");
  }, 4000);
}

function animateCartBadge() {
  const badge = document.getElementById("cart-badge");
  badge.classList.remove("badge-pop");
  void badge.offsetWidth; // Trigger reflow
  badge.classList.add("badge-pop");
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const icons = {
    success: "✅",
    error: "⚠️",
    info: "💡"
  };

  toast.innerHTML = `<span>${icons[type] || '✨'}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(15px)";
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// ============================================================================
// 8. GESTIÓN DE MODALES Y CHECKOUT
// ============================================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("hidden");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("hidden");
}

function openCartDrawer() {
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-drawer-overlay").classList.remove("hidden");
}

function closeCartDrawer() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-drawer-overlay").classList.add("hidden");
}

function prepareCheckoutModal() {
  const totals = calculateTotals();
  if (totals.isEmpty) {
    showToast("Tu carrito está vacío.", "error");
    return;
  }

  const itemsContainer = document.getElementById("checkout-items-summary");
  itemsContainer.innerHTML = Object.entries(state.cart).map(([productId, quantity]) => {
    const p = PRODUCTS_DATA.find(item => item.id === productId);
    return `
      <div class="checkout-summary-item">
        <span>${p.name} x${quantity}</span>
        <strong>$${(p.price * quantity).toFixed(2)}</strong>
      </div>
    `;
  }).join("");

  const totalsBox = document.getElementById("checkout-totals");
  totalsBox.innerHTML = `
    <div class="breakdown-row"><span>Subtotal:</span><span>$${totals.subtotal.toFixed(2)}</span></div>
    ${totals.discount > 0 ? `<div class="breakdown-row discount-row"><span>Descuento (${state.activeCoupon.code}):</span><span class="text-success">-$${totals.discount.toFixed(2)}</span></div>` : ''}
    <div class="breakdown-row"><span>IVA (16%):</span><span>$${totals.tax.toFixed(2)}</span></div>
    <div class="breakdown-divider"></div>
    <div class="breakdown-row total-row"><span>Total a Pagar:</span><span class="total-amount">$${totals.total.toFixed(2)}</span></div>
  `;

  closeCartDrawer();
  openModal("checkout-modal");
}

function processCheckoutOrder() {
  const form = document.getElementById("checkout-form");
  const name = document.getElementById("buyer-name").value.trim();
  const email = document.getElementById("buyer-email").value.trim();
  const address = document.getElementById("buyer-address").value.trim();
  const method = document.getElementById("payment-method").selectedOptions[0].text;

  if (!name || !email || !address) {
    showToast("Por favor completa los campos obligatorios.", "error");
    return;
  }

  const totals = calculateTotals();
  const orderId = "XP-" + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });

  const receiptBox = document.getElementById("receipt-details");
  receiptBox.innerHTML = `
    <div class="receipt-row"><strong>Folio de Orden:</strong> <code>${orderId}</code></div>
    <div class="receipt-row"><strong>Fecha y Hora:</strong> ${now}</div>
    <div class="receipt-row"><strong>Cliente:</strong> ${name} (${email})</div>
    <div class="receipt-row"><strong>Dirección:</strong> ${address}</div>
    <div class="receipt-row"><strong>Método de Pago:</strong> ${method}</div>
    <div class="breakdown-divider"></div>
    <div class="receipt-row"><strong>Subtotal:</strong> $${totals.subtotal.toFixed(2)}</div>
    ${totals.discount > 0 ? `<div class="receipt-row text-success"><strong>Descuento (${state.activeCoupon.code}):</strong> -$${totals.discount.toFixed(2)}</div>` : ''}
    <div class="receipt-row"><strong>IVA (16%):</strong> $${totals.tax.toFixed(2)}</div>
    <div class="receipt-row total-row" style="font-size: 1.15rem; color: #fff; margin-top: 0.4rem;">
      <strong>Total Pagado:</strong> $${totals.total.toFixed(2)}
    </div>
  `;

  // Actualizar stock local de los productos comprados
  for (const [id, qty] of Object.entries(state.cart)) {
    const prod = PRODUCTS_DATA.find(p => p.id === id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - qty);
    }
  }

  // Vaciar carrito tras la compra
  state.cart = {};
  state.activeCoupon = null;
  saveStateToStorage();
  updateCartUI();

  closeModal("checkout-modal");
  openModal("receipt-modal");
  showToast("¡Pedido confirmado con éxito!", "success");
}

// ============================================================================
// 9. EVENT LISTENERS E INICIALIZACIÓN
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  loadStateFromStorage();
  renderProducts();
  updateCartUI();

  // Drawer Carrito
  document.getElementById("open-cart-btn").addEventListener("click", openCartDrawer);
  document.getElementById("close-cart-btn").addEventListener("click", closeCartDrawer);
  document.getElementById("cart-drawer-overlay").addEventListener("click", closeCartDrawer);
  document.getElementById("start-shopping-btn").addEventListener("click", closeCartDrawer);

  // Cupones
  document.getElementById("apply-coupon-btn").addEventListener("click", () => {
    const input = document.getElementById("coupon-input");
    applyCoupon(input.value);
    input.value = "";
  });

  document.getElementById("coupon-input").addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      applyCoupon(e.target.value);
      e.target.value = "";
    }
  });

  document.getElementById("remove-coupon-btn").addEventListener("click", removeCoupon);

  // Chips de cupones rápidos
  document.querySelectorAll(".coupon-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const code = chip.getAttribute("data-code");
      applyCoupon(code);
      openCartDrawer();
    });
  });

  // Búsqueda
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search-btn");

  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.trim();
    if (state.searchQuery.length > 0) {
      clearSearchBtn.classList.remove("hidden");
    } else {
      clearSearchBtn.classList.add("hidden");
    }
    renderProducts();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    state.searchQuery = "";
    clearSearchBtn.classList.add("hidden");
    renderProducts();
    searchInput.focus();
  });

  // Filtro de categorías
  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.activeCategory = btn.getAttribute("data-category");
      renderProducts();
    });
  });

  document.getElementById("reset-filter-btn").addEventListener("click", () => {
    searchInput.value = "";
    state.searchQuery = "";
    state.activeCategory = "all";
    clearSearchBtn.classList.add("hidden");
    document.querySelectorAll(".category-btn").forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-category") === "all");
    });
    renderProducts();
  });

  // Vaciar carrito modal
  document.getElementById("empty-cart-btn").addEventListener("click", () => {
    openModal("confirm-empty-modal");
  });

  document.getElementById("confirm-empty-action-btn").addEventListener("click", () => {
    emptyCart();
    closeModal("confirm-empty-modal");
  });

  // Modal XP info
  document.getElementById("xp-info-btn").addEventListener("click", () => {
    openModal("xp-modal");
  });

  // Cerrar modales genéricos
  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-close-modal");
      closeModal(modalId);
    });
  });

  // Checkout y Recibo
  document.getElementById("checkout-btn").addEventListener("click", prepareCheckoutModal);
  document.getElementById("process-order-btn").addEventListener("click", processCheckoutOrder);
  document.getElementById("close-receipt-btn").addEventListener("click", () => {
    closeModal("receipt-modal");
  });
});
