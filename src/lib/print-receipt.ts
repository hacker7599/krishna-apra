const PRINT_ROOT_ID = "registration-receipt-print-root";

let printInFlight = false;

/** Adds a body class and optional print-root clone so only one receipt is laid out for print. */
export function printRegistrationReceipt(): void {
  if (printInFlight) return;

  const source = document.getElementById("registration-receipt");
  if (!source) {
    window.print();
    return;
  }

  printInFlight = true;
  document.body.classList.add("is-printing-receipt");

  const existingRoot = document.getElementById(PRINT_ROOT_ID);
  existingRoot?.remove();

  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");

  const root = document.createElement("div");
  root.id = PRINT_ROOT_ID;
  root.setAttribute("aria-hidden", "true");
  root.appendChild(clone);
  document.body.appendChild(root);

  const cleanup = () => {
    document.getElementById(PRINT_ROOT_ID)?.remove();
    document.body.classList.remove("is-printing-receipt");
    printInFlight = false;
  };

  const onAfterPrint = () => {
    window.clearTimeout(safetyTimer);
    cleanup();
  };

  window.addEventListener("afterprint", onAfterPrint, { once: true });
  const safetyTimer = window.setTimeout(onAfterPrint, 120_000);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.print();
    });
  });
}
