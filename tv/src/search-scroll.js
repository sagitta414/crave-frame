// Silk owns document scrolling; other platforms retain the recipe/search ScrollView.
export function resetSearchScroll(doc, scrollView) {
 if (doc?.querySelector('[aria-modal="true"], [data-testid="phone-dialog"]')) return false;
 if (doc?.documentElement?.getAttribute('data-silk-page') === 'true') {
  const page = doc.scrollingElement || doc.documentElement;
  if (!page) return false;
  page.scrollTop = 0;
  return true;
 }
 if (!scrollView?.scrollTo) return false;
 scrollView.scrollTo({y:0,animated:false});
 return true;
}
