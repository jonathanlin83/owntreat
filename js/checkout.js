(function () {
  const quantityInput = document.getElementById('stand-quantity');
  const btnMinus = document.getElementById('stand-btn-minus');
  const btnPlus = document.getElementById('stand-btn-plus');
  const priceDisplay = document.getElementById('stand-total-price');
  const checkoutBtn = document.getElementById('stand-checkout-btn');

  if (!quantityInput || !btnMinus || !btnPlus || !priceDisplay || !checkoutBtn) return;

  const STANDARD_PRICE = 15;
  const BULK_PRICE = 12; // Placeholder bulk price for the UI
  let quantity = parseInt(quantityInput.value, 10) || 1;

  function updateDisplay() {
    quantityInput.value = quantity;
    
    // UI price calculation logic
    const currentPrice = quantity >= 15 ? BULK_PRICE : STANDARD_PRICE;
    priceDisplay.textContent = `$${(quantity * currentPrice).toFixed(2)}`;
    
    // Add a small label if bulk pricing is applied
    let bulkLabel = document.getElementById('bulk-discount-label');
    if (quantity >= 15) {
      if (!bulkLabel) {
        bulkLabel = document.createElement('span');
        bulkLabel.id = 'bulk-discount-label';
        bulkLabel.style.fontSize = '12px';
        bulkLabel.style.color = 'var(--color-pink)';
        bulkLabel.style.display = 'block';
        bulkLabel.textContent = 'Bulk discount applied!';
        priceDisplay.parentNode.appendChild(bulkLabel);
      }
    } else if (bulkLabel) {
      bulkLabel.remove();
    }

    // Limit logic
    if (quantity <= 1) {
      btnMinus.setAttribute('disabled', 'true');
    } else {
      btnMinus.removeAttribute('disabled');
    }
    
    if (quantity >= 100) {
      btnPlus.setAttribute('disabled', 'true');
    } else {
      btnPlus.removeAttribute('disabled');
    }
  }

  btnMinus.addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      updateDisplay();
    }
  });

  btnPlus.addEventListener('click', () => {
    if (quantity < 100) {
      quantity++;
      updateDisplay();
    }
  });

  // Handle direct input if the user types a number
  quantityInput.addEventListener('change', (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 100) val = 100;
    quantity = val;
    updateDisplay();
  });

  checkoutBtn.addEventListener('click', async () => {
    const originalText = checkoutBtn.textContent;
    checkoutBtn.textContent = 'Loading Stripe...';
    checkoutBtn.disabled = true;

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'nfc_stand',
          quantity: quantity
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to checkout');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error during checkout: ' + error.message);
      checkoutBtn.textContent = originalText;
      checkoutBtn.disabled = false;
    }
  });

  // Initialize
  updateDisplay();
})();

// Growth Plan Checkout
(function () {
  const growthBtn = document.getElementById('growth-plan-btn');
  if (!growthBtn) return;

  growthBtn.addEventListener('click', async () => {
    const originalText = growthBtn.textContent;
    growthBtn.textContent = 'Redirecting...';
    growthBtn.style.pointerEvents = 'none';
    growthBtn.style.opacity = '0.7';

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'growth_plan',
          quantity: 1
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to checkout');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error during checkout: ' + error.message);
      growthBtn.textContent = originalText;
      growthBtn.style.pointerEvents = 'auto';
      growthBtn.style.opacity = '1';
    }
  });
})();
