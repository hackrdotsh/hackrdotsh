// The page has no loading overlay any more, so entrance animations start as
// soon as their component mounts.
export function onPageReady(fn: () => void) {
  fn();
  return () => {};
}
