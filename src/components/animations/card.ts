import { delay } from "@/utils";

export function removeCard(id: string, onComplete?: () => Promise<void>) {
  const button = document.querySelector(
    `button[id="library-${id}"]`
  ) as HTMLButtonElement;

  if (!button) {
    onComplete?.();
  }
  button.style.transition = "opacity 0.3s ease-out, transform 0.3s ease-out";
  button.style.opacity = "0";
  button.style.transform = "scale(0.5)";

  button.addEventListener(
    "transitionend",
    async () => {
      await onComplete?.();
      button.style.transition = "none";
      button.style.transform = "scale(1)";
      button.style.opacity = "1";
      await delay(10);
      button.style.removeProperty("transition");
      button.style.removeProperty("opacity");
      button.style.removeProperty("transform");
    },
    { once: true }
  );
}
