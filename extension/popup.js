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

    if (response.total === 0) {
      setStatus('No matching elements found.');
      return;
    }

    if (response.updated === 0) {
      setStatus('Matching elements found, but none had a 262px margin.');
      return;
    }

    setStatus(
      `Updated ${response.updated} element(s) that originally had a 262px margin (out of ${response.total}).`
    );
  });
});
