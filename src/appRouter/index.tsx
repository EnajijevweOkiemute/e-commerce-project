import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "../pages/home/Home";
import { Shop } from "../pages/shop/Shop";
import { ProductDetail } from "../pages/product/ProductDetail";
import { Cart } from "../pages/cart/Cart";
import { Checkout } from "../pages/checkout/Checkout";
import { Orders } from "../pages/orders/Orders";
import { Login } from "../pages/login/Login";
import { SignUp } from "../pages/signup/SignUp";
import Layout from "../layout/Layout";


export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
