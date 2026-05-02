
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "https://ecommerceproject-webapi.fly.dev/api",
  paystackPublicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_50191286ee9ac89303e381b90149260c5c638c92",
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

export const getEnvVar = (key: keyof typeof config): string => {
  const value = config[key];
  if (typeof value === 'string') {
    return value;
  }
  return String(value);
};
