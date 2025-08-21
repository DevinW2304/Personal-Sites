// === FILE: zaNeedsScript.js ===

const cart = [];

function filterProducts(category) {
  const cards = document.querySelectorAll(".product-card");
  cards.forEach(card => {
    const cat = card.getAttribute("data-category");
    if (category === "all" || cat === category) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  renderCart();
  updateCartCount();
}

function renderCart() {
  const cartList = document.getElementById("cart-items");
  if (!cartList) return;

  cartList.innerHTML = "";
  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} x${item.qty} - $${item.price * item.qty}`;
    cartList.appendChild(li);
  });
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartBtn = document.getElementById("cart-button");
  if (cartBtn) cartBtn.textContent = `🛒 Cart (${count})`;
}

function initializeCatalog() {
  document.querySelectorAll(".product-card").forEach(card => {
    const name = card.querySelector("h3").textContent;
    const price = parseFloat(card.querySelector("p").textContent.replace("$", ""));
    const btn = card.querySelector("button");
    btn.onclick = () => addToCart(name, price);
  });

  updateCartCount();
  renderCart();
}
function toggleCart() {
  const sidebar = document.getElementById("cart-sidebar");
  sidebar.classList.toggle("open");
}
document.addEventListener("DOMContentLoaded", () => {
  const ageOverlay = document.getElementById("age-verification");
  const yesBtn = document.getElementById("age-yes");
  const noBtn = document.getElementById("age-no");

  // Check localStorage if user already verified
  //if(localStorage.getItem("ageVerified") === "true") {
    //ageOverlay.style.display = "none";
  //}

  yesBtn.addEventListener("click", () => {
    localStorage.setItem("ageVerified", "true");
    ageOverlay.style.display = "none";
  });

  noBtn.addEventListener("click", () => {
    alert("Sorry, you must be 21 or older to enter this site.");
    // Redirect to another page or close window
    window.location.href = "https://www.google.com";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("mode-toggle");

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    toggle.textContent = "☀️ Light Mode";
  }

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    toggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
});


document.addEventListener("DOMContentLoaded", initializeCatalog);