export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type CheckoutParams = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  onSuccess: (response: RazorpaySuccessResponse) => void | Promise<void>;
  onDismiss?: () => void;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: { error: { description: string } }) => void) => void;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout is only available in the browser."));
  }
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay.")));
      if (window.Razorpay) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay."));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export async function openRazorpayCheckout(params: CheckoutParams): Promise<void> {
  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new Error("Razorpay checkout failed to load.");
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: params.keyId,
      amount: params.amount,
      currency: params.currency,
      name: params.name,
      description: params.description,
      order_id: params.orderId,
      prefill: params.prefill,
      theme: { color: "#ea580c" },
      handler: async (response: RazorpaySuccessResponse) => {
        try {
          await params.onSuccess(response);
          resolve();
        } catch (e) {
          reject(e);
        }
      },
      modal: {
        ondismiss: () => {
          params.onDismiss?.();
          reject(new Error("PAYMENT_DISMISSED"));
        },
      },
    });

    rzp.on("payment.failed", (response) => {
      reject(new Error(response.error?.description || "Payment failed."));
    });

    rzp.open();
  });
}
