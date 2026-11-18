const waitForPDFJS = () => {
  if (window.PDFViewerApplication) {
    window.PDFViewerApplication.initializedPromise.then(() => {
      const script = document.createElement('script');
      script.src = 'https://hypothes.is/embed.js';
      document.body.appendChild(script);
    });
  } else {
    setTimeout(waitForPDFJS, 50);
  }
};
waitForPDFJS();