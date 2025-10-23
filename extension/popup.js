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
  setStatus('Applying margin fix...');
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

    if (layoutTotal === 0 && sidebarTotal === 0) {
      setStatus('No matching layout or sidebar elements found.');
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

    setStatus(messages.join(' '));
  });
});
