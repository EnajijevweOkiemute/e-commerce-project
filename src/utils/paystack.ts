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
  callback: (response: { reference: string; trans: string; transaction: string }) => void;
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
  return import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";
}

export async function loadPaystackScript() {
  if (window.PaystackPop) {
    return window.PaystackPop;
  }

  const existingScript = document.getElementById(PAYSTACK_SCRIPT_ID) as HTMLScriptElement | null;

  if (existingScript) {
    await waitForPaystack();
    return window.PaystackPop;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = PAYSTACK_SCRIPT_ID;
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Paystack."));
    document.body.appendChild(script);
  });

  await waitForPaystack();
  return window.PaystackPop;
}

function waitForPaystack() {
  return new Promise<void>((resolve, reject) => {
    let attempts = 0;

    const timer = window.setInterval(() => {
      attempts += 1;
      if (window.PaystackPop) {
        window.clearInterval(timer);
        resolve();
      }

      if (attempts > 30) {
        window.clearInterval(timer);
        reject(new Error("Paystack did not initialize."));
      }
    }, 150);
  });
}
