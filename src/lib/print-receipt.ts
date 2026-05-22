/** Adds a body class so print CSS can isolate #registration-receipt on screen and in modals. */
export function printRegistrationReceipt(): void {
  document.body.classList.add("is-printing-receipt");
  const cleanup = () => {
    document.body.classList.remove("is-printing-receipt");
  };
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
}
