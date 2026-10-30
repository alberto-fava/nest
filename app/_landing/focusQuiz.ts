export const FOCUS_QUIZ_EVENT = "nest:focus-quiz";

export function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** Porta la mini-quiz al centro dello schermo (vedi MiniQuiz). */
export function focusQuiz() {
  window.dispatchEvent(new Event(FOCUS_QUIZ_EVENT));
}
