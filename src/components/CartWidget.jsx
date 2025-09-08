export default function CartWidget({ count = 0 }) {
  return (
    <a href="/cart" className="cart" aria-label="Carrito">
      <span className="cart-icon" role="img" aria-label="carrito">🛒</span>
      {count > 0 && (
        <span className="cart-badge" aria-label={`${count} items`}>
          {count}
        </span>
      )}
    </a>
  );
}
