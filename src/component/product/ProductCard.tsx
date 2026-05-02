import { useState } from "react";
import { Product } from "../../types";
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
  onAdd: (product: Product) => void | Promise<void>;
}

export function ProductCard({ product, onOpen, onAdd }: ProductCardProps) {
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    await onAdd(product);
    setAdding(false);
  };

  return (
    <article className="product-card">
      <button className="product-card__image-wrap" onClick={() => onOpen(product.id)}>
        <img className="product-card__image" src={product?.image} alt={product.name} />
        {product.stock < 10 ? <span className="pill pill--alert">Low Stock</span> : null}
      </button>
      <div className="product-card__body">
        <p className="product-card__rating">
          {ratingStars(product.rating)} <span>{product?.rating.toFixed(1)}</span>
        </p>
        <button className="product-card__title" onClick={() => onOpen(product.id)}>
          {product.name}
        </button>
        <div className="product-card__meta">
          <strong>{currency.format(product.price)}</strong>
          <button className="button button--dark" onClick={handleAdd} disabled={adding}>
            {adding ? <span className="product-card__spinner" /> : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
