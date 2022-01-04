// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.gtag('config', process.env.GOOGLE_ANALYTICS, {
    page_path: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
type EventOptions = {
  action: string;
  category: string;
  label: string;
  value: number;
};

export const event = (options: EventOptions): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.gtag('event', options.action, {
    event_category: options.category,
    event_label: options.label,
    value: options.value,
  });
};
