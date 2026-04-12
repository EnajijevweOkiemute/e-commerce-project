import { Product } from "../types";
import "./ProductCard.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function ratingStars(rating: number) {
  return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
}

interface ProductCardProps {
  product: Product;
  onOpen: (id: string) => void;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onOpen, onAdd }: ProductCardProps) {
  return (
    <article className="product-card">
      <button className="product-card__image-wrap" onClick={() => onOpen(product.id)}>
        <img className="product-card__image" src={product.image} alt={product.name} />
        {product.stock < 10 ? <span className="pill pill--alert">Low Stock</span> : null}
      </button>
      <div className="product-card__body">
        <p className="product-card__rating">
          {ratingStars(product.rating)} <span>{product.rating.toFixed(1)}</span>
        </p>
        <button className="product-card__title" onClick={() => onOpen(product.id)}>
          {product.name}
        </button>
        <p className="product-card__description">{product.description}</p>
        <div className="product-card__meta">
          <strong>{currency.format(product.price)}</strong>
          <button className="button button--dark" onClick={() => onAdd(product)}>
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
