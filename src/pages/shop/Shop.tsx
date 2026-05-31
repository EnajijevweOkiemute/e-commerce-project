import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { ProductCard } from "../../component/product/ProductCard";
import "./shop.css";
import { apiFetchAllProducts, apiProductToProduct, fetchCategories } from "../../utils/productApi";

const PRODUCTS_PER_PAGE = 9;

export function Shop() {
  const { addToCart, products, setProducts } = useAppContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") ?? "";
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [, setFetchError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResult, apiProducts] = await Promise.all([
          fetchCategories().catch(() => []),
          apiFetchAllProducts(),
        ]);
        const productList = apiProducts.map((apiProduct) => apiProductToProduct(apiProduct));
        const categoryNames = new Set([
          ...categoriesResult.map((cat) => cat.name),
          ...productList.map((product) => product.category),
        ]);

        setCategories(["All", ...categoryNames]);
        setProducts((previousProducts) => {
          const existingProducts = new Map(
            previousProducts.map((product) => [product.id, product]),
          );
          return apiProducts.map((apiProduct) =>
            apiProductToProduct(apiProduct, existingProducts.get(apiProduct.id)),
          );
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setProducts]);

  const updateSearchQuery = (value: string) => {
    const query = value.trim();
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (query) {
        nextParams.set("search", query);
      } else {
        nextParams.delete("search");
      }
      return nextParams;
    });
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSearchQuery(searchTerm);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setSearchTerm(nextValue);
    updateSearchQuery(nextValue);
  };

  const activeSearchQuery = searchTerm.trim();
  const filteredProducts = useMemo(() => {
    const query = activeSearchQuery.toLowerCase();
    const next = products
      ?.filter((product) => category === "All" || product.category === category)
      ?.filter((product) => {
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
  }, [activeSearchQuery, category, products, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSearchQuery, category, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (activePage - 1) * PRODUCTS_PER_PAGE,
    activePage * PRODUCTS_PER_PAGE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <section className="section section--shop">
        <div className="container">
          <p>Loading products...</p>
        </div>
      </section>
    );
  }

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
              <span className="eyebrow">Catalog</span>
              <h2>{filteredProducts?.length} premium pieces ready to ship</h2>
              <p className="muted">
                {activeSearchQuery
                  ? `Showing results for "${activeSearchQuery}"`
                  : "Browse the full Kyklos collection."}
              </p>
            </div>

            <div className="shop-heading__actions">
              <form className="shop-search" onSubmit={handleSearch}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </form>

              <label className="select-wrap">
                <span className="select-wrap__label">Sort by</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </label>
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts?.length === 0 ? (
              <p className="shop-empty">No products available.</p>
            ) : (
              paginatedProducts.map((product) => (
                <ProductCard
                  key={product?.id}
                  product={product}
                  onOpen={(productId) => navigate(`/product/${productId}`)}
                  onAdd={(item) => addToCart(item)}
                />
              ))
            )}
          </div>

          {filteredProducts.length > PRODUCTS_PER_PAGE && (
            <nav className="shop-pagination" aria-label="Shop product pages">
              <button
                className="shop-pagination__button"
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={activePage === 1}
              >
                Previous
              </button>
              <div className="shop-pagination__numbers">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    className={`shop-pagination__number ${page === activePage ? "shop-pagination__number--active" : ""}`}
                    type="button"
                    key={page}
                    aria-current={page === activePage ? "page" : undefined}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className="shop-pagination__button"
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={activePage === totalPages}
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
