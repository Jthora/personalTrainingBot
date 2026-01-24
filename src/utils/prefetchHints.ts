const requestIdle = (cb: () => void) => {
  if (typeof (window as any).requestIdleCallback === 'function') {
    (window as any).requestIdleCallback(cb, { timeout: 2000 });
  } else {
    setTimeout(cb, 300);
  }
};

const appendLink = (init: Partial<HTMLLinkElement>) => {
  const link = document.createElement('link');
  Object.assign(link, init);
  document.head.appendChild(link);
};

export const scheduleManifestPrefetch = () => {
  requestIdle(() => {
    appendLink({
      rel: 'prefetch',
      href: '/training_modules_manifest.json',
      as: 'fetch',
      crossOrigin: 'anonymous',
    });
  });
};
