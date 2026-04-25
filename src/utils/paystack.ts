import { config } from "../config/env";

interface PaystackPopup {
  openIframe: () => void;
}

interface PaystackSetupOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref: string;
  metadata?: Record<string, unknown>;
  callback: (response: {
    reference: string;
    trans: string;
    transaction: string;
  }) => void;
  onClose?: () => void;
}

interface PaystackGlobal {
  setup: (options: PaystackSetupOptions) => PaystackPopup;
}

declare global {
  interface Window {
    PaystackPop?: PaystackGlobal;
  }
}

const PAYSTACK_SCRIPT_ID = "paystack-inline-script";

export function getPaystackPublicKey() {
  return config.paystackPublicKey;
}

export async function loadPaystackScript() {
  if (window.PaystackPop) {
    return window.PaystackPop;
  }

  const existingScript = document.getElementById(
    PAYSTACK_SCRIPT_ID,
  ) as HTMLScriptElement | null;
  if (existingScript) {
    await waitForPaystack();
    return window.PaystackPop;
  }
  return new Promise<PaystackGlobal | undefined>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = PAYSTACK_SCRIPT_ID;
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;

    script.onload = () => {
      waitForPaystack()
        .then(() => resolve(window.PaystackPop))
        .catch(reject);
    };

    script.onerror = () => {
      reject(
        new Error(
          "Failed to load Paystack script. Please check your internet connection.",
        ),
      );
    };

    document.body.appendChild(script);
  });
}

function waitForPaystack() {
  return new Promise<void>((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    let attempts = 0;
    const maxAttempts = 50;
    const interval = 100;

    const timer = window.setInterval(() => {
      attempts += 1;

      if (window.PaystackPop) {
        window.clearInterval(timer);
        resolve();
        return;
      }

      if (attempts >= maxAttempts) {
        window.clearInterval(timer);
        reject(
          new Error(
            "Paystack did not initialize. Please refresh the page and try again.",
          ),
        );
      }
    }, interval);
  });
}
