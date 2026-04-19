import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { ProductCard } from "../../component/product/ProductCard";


export function Shop() {
  const { products, addToCart } = useAppContext();
  const navigate = useNavigate();
  const searchQuery = "";
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category))],
    [products]
  );


  console.log("products", products)

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const next = products
      .filter((product) => category === "All" || product.category === category)
      .filter((product) => {
        if (!query) return true;
        return (
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        );
      });

    switch (sortBy) {
      case "price-low":
        next.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        next.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        next.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return next;
  }, [category, products, searchQuery, sortBy]);

  return (
    <section className="section section--shop">
      <div className="container shop-layout">
        <aside className="shop-sidebar">
          <div className="panel">
            <h3>Categories</h3>
            <div className="chip-list">
              {categories.map((item) => (
                <button
                  key={item}
                  className={item === category ? "chip chip--active" : "chip"}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="shop-main">
          <div className="section-heading shop-heading">
            <div className="catalogue">
              <br />
              <span className="eyebrow">Catalog</span>
              <h2>{filteredProducts.length} premium pieces ready to ship</h2>
              <p className="muted">
                {searchQuery
                  ? `Showing results for "${searchQuery}"`
                  : "Browse the full Kyklos collection."}
              </p>
            </div>
            <label className="select-wrap">
              <span>Sort &thinsp;</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="featured"> Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </label>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpen={(productId) => navigate(`/product/${productId}`)}
                onAdd={(item) => addToCart(item)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
