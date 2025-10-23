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
          const layoutSelector = '.ant-layout.css-133v4sd';
          const sidebarSelector =
            'aside.ant-layout-sider.ant-layout-sider-dark.style_sider__Hlcz3.css-133v4sd';

          const layoutElements = Array.from(document.querySelectorAll(layoutSelector));
          const sidebarElements = Array.from(document.querySelectorAll(sidebarSelector));
          const mainSelector = 'main.ant-layout-content.css-133v4sd';
          const mainElements = Array.from(document.querySelectorAll(mainSelector));
          const headerElements = Array.from(document.querySelectorAll('header'));
          const footerElements = Array.from(document.querySelectorAll('footer'));
          const chatButtonSelector = 'div.style_chatButton__Gmdf9';
          const chatButtonElements = Array.from(document.querySelectorAll(chatButtonSelector));

          let layoutForced = 0;
          let layoutHad262 = 0;
          let sidebarHidden = 0;
          let mainAdjusted = 0;
          let mainHad64 = 0;
          let headersRemoved = 0;
          let footersRemoved = 0;
          let chatButtonsRemoved = 0;

          layoutElements.forEach((element) => {
            const inlineMargin = element.style.marginLeft?.trim();
            const computedMargin = window.getComputedStyle(element).marginLeft?.trim();
            const had262 = inlineMargin === '262px' || inlineMargin === '262' || computedMargin === '262px';
            const alreadyZero = computedMargin === '0px';

            if (!alreadyZero || had262) {
              element.style.setProperty('margin-left', '0px', 'important');
              layoutForced += 1;

              if (had262) {
                layoutHad262 += 1;
              }
            }
          });

          sidebarElements.forEach((element) => {
            const computedDisplay = window.getComputedStyle(element).display?.trim();
            const alreadyHidden = computedDisplay === 'none';

            element.style.setProperty('display', 'none', 'important');

            if (!alreadyHidden) {
              sidebarHidden += 1;
            }
          });

          mainElements.forEach((element) => {
            const inlineMarginTop = element.style.marginTop?.trim();
            const computedMarginTop = window.getComputedStyle(element).marginTop?.trim();
            const had64 = inlineMarginTop === '64px' || inlineMarginTop === '64' || computedMarginTop === '64px';
            const alreadyZeroTop = computedMarginTop === '0px';

            if (!alreadyZeroTop || had64) {
              element.style.setProperty('margin-top', '0px', 'important');
              mainAdjusted += 1;

              if (had64) {
                mainHad64 += 1;
              }
            }
          });

          headerElements.forEach((element) => {
            if (element.isConnected) {
              element.remove();
              headersRemoved += 1;
            }
          });

          footerElements.forEach((element) => {
            if (element.isConnected) {
              element.remove();
              footersRemoved += 1;
            }
          });

          chatButtonElements.forEach((element) => {
            if (element.isConnected) {
              element.remove();
              chatButtonsRemoved += 1;
            }
          });

          return {
            layoutTotal: layoutElements.length,
            layoutForced,
            layoutHad262,
            sidebarTotal: sidebarElements.length,
            sidebarHidden,
            mainTotal: mainElements.length,
            mainAdjusted,
            mainHad64,
            headersFound: headerElements.length,
            headersRemoved,
            footersFound: footerElements.length,
            footersRemoved,
            chatButtonsFound: chatButtonElements.length,
            chatButtonsRemoved
          };
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
