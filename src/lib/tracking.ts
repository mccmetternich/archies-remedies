/**
 * Track an external link click
 * Used for Buy Now buttons and other external links
 */
export async function trackClick(params: {
  destinationUrl: string;
  productId?: string;
  productSlug?: string;
}): Promise<void> {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'click',
        ...params,
      }),
    });
  } catch {
    // Silently fail - tracking shouldn't break the site
  }
}

/**
 * Create an onClick handler that tracks and then navigates
 * Use this for Buy buttons and external links
 */
export function createTrackedLinkHandler(params: {
  destinationUrl: string;
  productId?: string;
  productSlug?: string;
  openInNewTab?: boolean;
}): (e: React.MouseEvent) => void {
  return (e: React.MouseEvent) => {
    e.preventDefault();

    // Track the click
    trackClick({
      destinationUrl: params.destinationUrl,
      productId: params.productId,
      productSlug: params.productSlug,
    });

    // Navigate after a small delay to ensure tracking fires
    setTimeout(() => {
      if (params.openInNewTab) {
        window.open(params.destinationUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = params.destinationUrl;
      }
    }, 100);
  };
}
