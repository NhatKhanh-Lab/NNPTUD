export function animateAddToCart(sourceElement: HTMLElement | null) {
  const target = document.getElementById('cart-button-anchor');
  if (!sourceElement || !target) return;

  const sourceRect = sourceElement.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const bubble = document.createElement('div');
  bubble.className = 'cart-fly-bubble';
  bubble.style.left = `${sourceRect.left + sourceRect.width / 2 - 10}px`;
  bubble.style.top = `${sourceRect.top + sourceRect.height / 2 - 10}px`;
  bubble.style.setProperty('--fly-x', `${targetRect.left - sourceRect.left}px`);
  bubble.style.setProperty('--fly-y', `${targetRect.top - sourceRect.top}px`);

  document.body.appendChild(bubble);
  window.setTimeout(() => bubble.remove(), 700);
}
