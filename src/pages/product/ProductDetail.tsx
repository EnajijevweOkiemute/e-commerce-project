import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import "./product.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function ratingStars(rating: number) {
  return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, setProducts, currentUser, addToCart } = useAppContext();

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === id) || null,
    [products, id]
  );

  const submitReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || !selectedProduct) return;

    const formData = new FormData(event.currentTarget);
    const review = {
      id: String(Date.now()),
      userId: currentUser.id,
      userName: currentUser.name,
      rating: Number(formData.get("rating")),
      comment: String(formData.get("comment")),
      date: new Date().toISOString(),
    };

    const nextProducts = products.map((product) => {
      if (product.id !== selectedProduct.id) return product;

      const reviews = [...product.reviews, review];
      const rating =
        reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
      return { ...product, reviews, rating };
    });

    setProducts(nextProducts);
    localStorage.setItem("products", JSON.stringify(nextProducts));
    event.currentTarget.reset();
  };

  if (!selectedProduct) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h2>Product not found</h2>
          <button className="button button--dark" onClick={() => navigate("/shop")}>
            Back to Shop
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <button className="text-button" onClick={() => navigate("/shop")}>
          Back to shop
        </button>
        <div className="product-detail">
          <div className="product-detail__media">
            <img src={selectedProduct.image} alt={selectedProduct.name} />
          </div>
          <div className="product-detail__content">
            <p className="eyebrow">{selectedProduct.category}</p>
            <h2>{selectedProduct.name}</h2>
            <p className="product-card__rating">
              {ratingStars(selectedProduct.rating)}{" "}
              <span>
                {selectedProduct.rating.toFixed(1)} · {selectedProduct.reviews.length} reviews
              </span>
            </p>
            <p className="muted">{selectedProduct.description}</p>
            <div className="price-panel">
              <strong>{currency.format(selectedProduct.price)}</strong>
              <span>
                {selectedProduct.stock > 10
                  ? "In stock"
                  : `Only ${selectedProduct.stock} left`}
              </span>
            </div>
            <button
              className="button button--dark button--wide"
              onClick={() => addToCart(selectedProduct)}
            >
              Add to Cart
            </button>
          </div>
        </div>

        <div className="review-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Reviews</span>
              <h2>Customer feedback</h2>
            </div>
          </div>

          {currentUser ? (
            <form className="panel review-form" onSubmit={submitReview}>
              <label>
                Rating
                <select name="rating" defaultValue="5">
                  <option value="5">5</option>
                  <option value="4">4</option>
                  <option value="3">3</option>
                  <option value="2">2</option>
                  <option value="1">1</option>
                </select>
              </label>
              <label>
                Comment
                <textarea name="comment" rows={4} placeholder="Share your experience" required />
              </label>
              <button className="button button--dark" type="submit">
                Submit Review
              </button>
            </form>
          ) : (
            <div className="panel">
              <p className="muted">Sign in to leave a review.</p>
            </div>
          )}

          <div className="review-list">
            {selectedProduct.reviews.length ? (
              selectedProduct.reviews.map((review) => (
                <article className="panel review-card" key={review.id}>
                  <div className="review-card__head">
                    <div>
                      <strong>{review.userName}</strong>
                      <p className="product-card__rating">{ratingStars(review.rating)}</p>
                    </div>
                    <span className="muted">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p>{review.comment}</p>
                </article>
              ))
            ) : (
              <div className="panel">
                <p className="muted">No reviews yet. Be the first to review this item.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
