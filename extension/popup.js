const fixButton = document.getElementById('fixButton');
const statusEl = document.getElementById('status');

const formatErrorMessage = (message) => {
  if (!message) {
    return 'Unknown error occurred.';
  }

  if (/Binary files are not supported/i.test(message)) {
    return 'Chrome cannot run extension scripts on binary documents (e.g. PDF previews). Open the web page you want to fix and try again.';
  }

  return message;
};

const setStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
};

fixButton?.addEventListener('click', () => {
  setStatus('Applying page fixes...');
  fixButton.disabled = true;

  chrome.runtime.sendMessage({ type: 'FIX_MARGIN' }, (response) => {
    fixButton.disabled = false;

    if (chrome.runtime.lastError) {
      setStatus(formatErrorMessage(chrome.runtime.lastError.message), true);
      return;
    }

    if (!response?.success) {
      setStatus(formatErrorMessage(response?.error), true);
      return;
    }

    const layoutTotal = response.layoutTotal ?? 0;
    const layoutForced = response.layoutForced ?? 0;
    const layoutHad262 = response.layoutHad262 ?? 0;
    const sidebarTotal = response.sidebarTotal ?? 0;
    const sidebarHidden = response.sidebarHidden ?? 0;
    const mainTotal = response.mainTotal ?? 0;
    const mainAdjusted = response.mainAdjusted ?? 0;
    const mainHad64 = response.mainHad64 ?? 0;
    const headersFound = response.headersFound ?? 0;
    const headersRemoved = response.headersRemoved ?? 0;
    const footersFound = response.footersFound ?? 0;
    const footersRemoved = response.footersRemoved ?? 0;
    const chatButtonsFound = response.chatButtonsFound ?? 0;
    const chatButtonsRemoved = response.chatButtonsRemoved ?? 0;

    if (
      layoutTotal === 0 &&
      sidebarTotal === 0 &&
      mainTotal === 0 &&
      headersFound === 0 &&
      footersFound === 0 &&
      chatButtonsFound === 0
    ) {
      setStatus('No matching elements found.');
      return;
    }

    const messages = [];

    if (layoutTotal > 0) {
      if (layoutForced > 0) {
        let layoutMessage = `Set margin-left to 0 on ${layoutForced}/${layoutTotal} layout element(s)`;

        if (layoutHad262 > 0) {
          layoutMessage += ` (${layoutHad262} originally had 262px).`;
        } else {
          layoutMessage += '.';
        }

        messages.push(layoutMessage);
      } else {
        messages.push(`Layout elements already had margin-left 0 (${layoutTotal}).`);
      }
    }

    if (sidebarTotal > 0) {
      if (sidebarHidden > 0) {
        messages.push(`Hid ${sidebarHidden}/${sidebarTotal} sidebar(s).`);
      } else {
        messages.push(`Sidebar elements were already hidden (${sidebarTotal}).`);
      }
    }

    if (mainTotal > 0) {
      if (mainAdjusted > 0) {
        let mainMessage = `Set margin-top to 0 on ${mainAdjusted}/${mainTotal} main content element(s)`;

        if (mainHad64 > 0) {
          mainMessage += ` (${mainHad64} originally had 64px).`;
        } else {
          mainMessage += '.';
        }

        messages.push(mainMessage);
      } else {
        messages.push(`Main content elements already had margin-top 0 (${mainTotal}).`);
      }
    }

    if (headersFound > 0) {
      if (headersRemoved > 0) {
        messages.push(`Removed ${headersRemoved}/${headersFound} header element(s).`);
      } else {
        messages.push(`Header element(s) were already removed (${headersFound}).`);
      }
    }

    if (footersFound > 0) {
      if (footersRemoved > 0) {
        messages.push(`Removed ${footersRemoved}/${footersFound} footer element(s).`);
      } else {
        messages.push(`Footer element(s) were already removed (${footersFound}).`);
      }
    }

    if (chatButtonsFound > 0) {
      if (chatButtonsRemoved > 0) {
        messages.push(`Removed ${chatButtonsRemoved}/${chatButtonsFound} chat button(s).`);
      } else {
        messages.push(`Chat button element(s) were already removed (${chatButtonsFound}).`);
      }
    }

    setStatus(messages.join(' '));
  });
});
