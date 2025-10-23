# Fix Margin Chrome Extension

This repository contains a Chrome extension that zeroes out the `margin-left` style for every element on the current page that matches the selector `.ant-layout.css-133v4sd`, hides the sidebar `aside` element rendered as `ant-layout-sider`, removes any page header that includes the `ant-layout-header` class, clears the top margin on the main layout content, and removes the floating chat button.

## How it works

1. Click the extension icon to open the popup.
2. Press **Apply page fixes**.
3. The extension injects a script into the active tab that sets `margin-left: 0 !important` on all matching layout elements, applies `display: none !important` to matching sidebars, removes every header that carries the `ant-layout-header` class along with any `footer` blocks, sets `margin-top: 0 !important` on the `main.ant-layout-content.css-133v4sd` elements, and removes floating chat buttons (`div.style_chatButton__Gmdf9`). The popup reports how many elements were updated, including how many layout elements originally had a `262px` margin and how many main content blocks started at `64px`.

## Loading the extension locally

1. Open **chrome://extensions** in Chrome.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the `extension` directory from this repository.
4. Pin the extension to the toolbar (optional) and use it as described above.

## Troubleshooting

- Chrome does not allow extensions to run on internal pages such as `chrome://extensions` or the Chrome Web Store. Switch to the application tab you want to adjust and try again.
- If the popup reports that Chrome cannot run on binary documents, you are likely viewing a PDF or downloaded file preview. Open the target web interface (an HTML page) before triggering the extension.

