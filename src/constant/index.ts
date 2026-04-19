export const mockProducts = [
  {
    id: "1",
    name: "Classic Leather Watch",
    price: 299,
    category: "Watches",
    image: "https://images.unsplash.com/photo-1590691820318-8cc33afb725e?w=1200&auto=format&fit=crop",
    description: "Elegant timepiece with genuine leather strap and sapphire crystal.",
    stock: 15,
    rating: 4.8,
    reviews: [],
  },
  {
    id: "2",
    name: "Modern Steel Watch",
    price: 349,
    category: "Watches",
    image: "https://images.unsplash.com/photo-1630071634094-64b2d5b40c57?w=1200&auto=format&fit=crop",
    description: "Contemporary design with stainless steel bracelet and automatic movement.",
    stock: 12,
    rating: 4.9,
    reviews: [],
  },
  {
    id: "3",
    name: "Luxury Chronograph",
    price: 599,
    category: "Watches",
    image: "https://images.unsplash.com/photo-1628911774602-74a0cfee9b0d?w=1200&auto=format&fit=crop",
    description: "Premium chronograph with multiple complications and water resistance.",
    stock: 8,
    rating: 5,
    reviews: [],
  },
  {
    id: "4",
    name: "Smart Watch Pro",
    price: 449,
    category: "Watches",
    image: "https://images.unsplash.com/photo-1627313433626-74587705e4c7?w=1200&auto=format&fit=crop",
    description: "Advanced smartwatch with health tracking and GPS functionality.",
    stock: 20,
    rating: 4.7,
    reviews: [],
  },
  {
    id: "5",
    name: "Designer Sunglasses",
    price: 249,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&auto=format&fit=crop",
    description: "Premium polarized sunglasses with UV protection and a lightweight frame.",
    stock: 25,
    rating: 4.6,
    reviews: [],
  },
  {
    id: "6",
    name: "Leather Briefcase",
    price: 399,
    category: "Bags",
    image: "https://images.unsplash.com/photo-1706798784016-bd91c6ef0cd3?w=1200&auto=format&fit=crop",
    description: "Handcrafted leather briefcase with multiple compartments.",
    stock: 10,
    rating: 4.9,
    reviews: [],
  },
  {
    id: "7",
    name: "Luxury Wallet Set",
    price: 179,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1649197812819-f287b307b6e1?w=1200&auto=format&fit=crop",
    description: "Premium leather wallet and cardholder set with RFID protection.",
    stock: 30,
    rating: 4.5,
    reviews: [],
  },
  {
    id: "8",
    name: "Classic Brown Watch",
    price: 279,
    category: "Watches",
    image: "https://images.unsplash.com/photo-1590767333590-4c502c63e2de?w=1200&auto=format&fit=crop",
    description: "Timeless design with brown leather strap and a minimalist dial.",
    stock: 18,
    rating: 4.7,
    reviews: [],
  },
];

export const collections = [
  {
    title: "Luxury Watches",
    image: "https://images.unsplash.com/photo-1628911774602-74a0cfee9b0d?w=1200&auto=format&fit=crop",
    description: "Timeless elegance on your wrist",
  },
  {
    title: "Premium Accessories",
    image: "https://images.unsplash.com/photo-1649197812819-f287b307b6e1?w=1200&auto=format&fit=crop",
    description: "Complete your sophisticated look",
  },
  {
    title: "Designer Bags",
    image: "https://images.unsplash.com/photo-1706798784016-bd91c6ef0cd3?w=1200&auto=format&fit=crop",
    description: "Crafted for the modern professional",
  },
];

export const metrics = [
  {
    value: "100%",
    title: "Authentic",
    description: "Every product is guaranteed authentic with certification.",
  },
  {
    value: "30 Days",
    title: "Returns",
    description: "Risk-free returns within 30 days of purchase.",
  },
  {
    value: "24/7",
    title: "Support",
    description: "Premium customer service always at your disposal.",
  },
];

export const seedStorage = () => {
  if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify(mockProducts));
  }
  if (!localStorage.getItem("orders")) {
    localStorage.setItem("orders", JSON.stringify([]));
  }

  if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", JSON.stringify([]));
  }

  if (!localStorage.getItem("passwordResetTokens")) {
    localStorage.setItem("passwordResetTokens", JSON.stringify([]));
  }

  if (!localStorage.getItem("passwordResetEmails")) {
    localStorage.setItem("passwordResetEmails", JSON.stringify([]));
  }

  if (!localStorage.getItem("notifications")) {
    localStorage.setItem("notifications", JSON.stringify([]));
  }
};
