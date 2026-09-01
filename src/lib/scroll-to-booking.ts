export function scrollToBookingSection(): void {
  document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
