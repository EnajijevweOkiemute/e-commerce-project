# Kyklos E-Commerce

A modern, professional e-commerce platform built with React, TypeScript, and Vite.

## Features

- 🛍️ Product browsing and shopping cart
- 👤 User authentication (Login/Signup)
- 💳 Secure payment integration with Paystack
- 📦 Order management and tracking
- 👨‍💼 Admin dashboard for product and order management
- 📱 Fully responsive design
- 🎨 Professional UI with luxury brand aesthetic

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd e-commerce-project
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
# Paystack Configuration
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here

# API Configuration
VITE_API_BASE_URL=https://ecommerceproject-webapi.fly.dev/api/v1
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_PAYSTACK_PUBLIC_KEY` | Your Paystack public key for payment processing | Yes |
| `VITE_API_BASE_URL` | Backend API base URL | Yes |

**Getting a Paystack Public Key:**
1. Sign up at [Paystack](https://dashboard.paystack.com/#/signup)
2. Navigate to Settings > API Keys & Webhooks
3. Copy your Public Key (starts with `pk_test_` for test mode or `pk_live_` for live mode)

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── component/       # Reusable components
│   ├── auth/       # Authentication components
│   ├── footer/     # Footer component
│   ├── header/     # Header and navigation
│   ├── product/    # Product-related components
│   └── ui/         # UI components (Toast, etc.)
├── config/         # Configuration files
│   └── env.ts      # Environment variables
├── constant/       # Constants and mock data
├── context/        # React context providers
├── layout/         # Layout components
├── pages/          # Page components
│   ├── adminDashBoard/
│   ├── cart/
│   ├── checkout/
│   ├── customerDashboard/
│   ├── forgotPassword/
│   ├── home/
│   ├── login/
│   ├── orders/
│   ├── product/
│   ├── resetPassword/
│   ├── shop/
│   └── signup/
├── types/          # TypeScript type definitions
└── utils/          # Utility functions

```

## Features Overview

### Customer Features
- Browse products by category
- Add items to cart
- Secure checkout with Paystack
- Order history and tracking
- User profile management

### Admin Features
- Product management (Create, Update, Delete)
- Order management
- Inventory tracking
- Revenue analytics

## Technologies Used

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** CSS Modules
- **Payment Gateway:** Paystack
- **State Management:** React Context API
- **Storage:** LocalStorage

## Security Notes

- Never commit your `.env` file to version control
- Use test keys during development
- Switch to live keys only in production
- Keep your API keys secure and rotate them regularly

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.
