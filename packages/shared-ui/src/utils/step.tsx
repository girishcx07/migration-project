/**
 * Compute Tailwind width class for a desktop column.
 * - 1 visible step  → full width
 * - 2 visible steps → 50/50
 * - 3+ visible steps → equal thirds
 */
export function desktopColWidth(totalVisible: number): string {
  if (totalVisible <= 1) return "w-full";
  if (totalVisible === 2) return "w-[calc(50%-0.375rem)]";
  return "w-[calc(33.333%-0.5rem)]";
}

/** Derive mobile slide direction class from step progression */
export function mobileSlideClass(
  cardIdx: number,
  currentStep: number,
): "current" | "past" | "future" {
  if (currentStep === cardIdx) return "current";
  if (currentStep > cardIdx) return "past";
  return "future";
}
