# Fix Margin Chrome Extension

This repository contains a Chrome extension that zeroes out the `margin-left` style for every element on the current page that matches the selector `.ant-layout.css-133v4sd`.

## How it works

1. Click the extension icon to open the popup.
2. Press **Set margin-left to 0**.
3. The extension injects a script into the active tab that sets `margin-left: 0 !important` on all matching elements. If an element originally had a `margin-left` of `262px`, the popup will highlight how many were updated.

## Loading the extension locally

1. Open **chrome://extensions** in Chrome.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the `extension` directory from this repository.
4. Pin the extension to the toolbar (optional) and use it as described above.

## Troubleshooting

- Chrome does not allow extensions to run on internal pages such as `chrome://extensions` or the Chrome Web Store. Switch to the application tab you want to adjust and try again.
- If the popup reports that Chrome cannot run on binary documents, you are likely viewing a PDF or downloaded file preview. Open the target web interface (an HTML page) before triggering the extension.

