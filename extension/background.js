const RESTRICTED_PROTOCOLS = ['chrome:', 'chrome-extension:', 'edge:', 'about:', 'devtools:'];
const RESTRICTED_HOSTS = ['chrome.google.com', 'microsoftedge.microsoft.com'];
const BINARY_DOCUMENT_MESSAGE = 'Chrome cannot run extension scripts on binary documents (e.g. PDF previews). Open the web page you want to fix and try again.';
const RESTRICTED_PAGE_MESSAGE = 'Chrome blocks extensions from modifying this page. Switch to the target application tab and try again.';

const getFriendlyError = (message) => {
  if (!message) {
    return 'Unknown error occurred.';
  }

  if (/Binary files are not supported/i.test(message)) {
    return BINARY_DOCUMENT_MESSAGE;
  }

  if (/Cannot access contents of url/i.test(message)) {
    return RESTRICTED_PAGE_MESSAGE;
  }

  return message;
};

const parseUrl = (urlString) => {
  if (!urlString) {
    return null;
  }

  try {
    return new URL(urlString);
  } catch (error) {
    return null;
  }
};

const getRestrictionMessage = (urlString) => {
  const parsed = parseUrl(urlString);
  if (!parsed) {
    return null;
  }

  if (RESTRICTED_PROTOCOLS.includes(parsed.protocol) || RESTRICTED_HOSTS.includes(parsed.hostname)) {
    return RESTRICTED_PAGE_MESSAGE;
  }

  if (/\.pdf($|[?#])/i.test(parsed.pathname)) {
    return BINARY_DOCUMENT_MESSAGE;
  }

  return null;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'FIX_MARGIN') {
    return;
  }

  (async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const [tab] = tabs;

      if (!tab?.id) {
        sendResponse({ success: false, error: 'No active tab found.' });
        return;
      }

      const restrictionMessage = getRestrictionMessage(tab.url);
      if (restrictionMessage) {
        sendResponse({ success: false, error: restrictionMessage });
        return;
      }

      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const elements = document.querySelectorAll('.ant-layout.css-133v4sd');
          let matchedOriginal = 0;
          let updated = 0;

          elements.forEach((element) => {
            const computed = window.getComputedStyle(element).marginLeft;
            if (computed === '262px') {
              matchedOriginal += 1;
              element.style.setProperty('margin-left', '0px', 'important');
              updated += 1;
            }
          });

          return { total: elements.length, matchedOriginal, updated };
        }
      });

      sendResponse({ success: true, ...result?.result });
    } catch (error) {
      console.error('Failed to fix margin:', error);
      sendResponse({ success: false, error: getFriendlyError(error?.message) });
    }
  })();

  return true;
});
