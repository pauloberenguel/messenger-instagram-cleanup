# Social Inbox Cleaners

Tampermonkey userscripts that automate the deletion of visible conversations from **Facebook Messenger** and **Instagram Direct** through the website interface.

> **Warning: These scripts perform destructive actions.** Deleted conversations may not be recoverable. Test with one or two unimportant conversations before processing a larger inbox. Use the pause or stop controls whenever the interface behaves unexpectedly.

## Features

The scripts provide a small control panel with **Start**, **Pause/Resume**, and **Stop** controls. They process one conversation at a time, wait between actions, and attempt to recover when the website needs additional time to update.

The scripts do not request or store passwords, cookies, access tokens, or API keys. They interact with the controls rendered in the current browser tab. They are not official Meta products.

## Files

| File | Purpose |
| --- | --- |
| `messenger-delete-history.user.js` | Deletes conversations from the user's Facebook Messenger inbox. Marketplace is skipped when it is detected. |
| `instagram-delete-history.user.js` | Deletes conversations from the user's Instagram Direct inbox. The Stories area is excluded. |

## Requirements

You need a desktop browser and the [1]. You must already be signed in to the relevant Facebook or Instagram account in the same browser.

## Installation

1. Install Tampermonkey from its official website.

1. Open the Tampermonkey dashboard.

1. Create a new userscript, or open an existing script that you want to replace.

1. Remove the default template.

1. Copy the complete contents of the relevant `.user.js` file into the editor.

1. Save the script with `Ctrl+S`.

1. Open or reload the relevant inbox page.

The scripts do not start automatically. This is intentional: you must review the page before starting a destructive run.

## Usage

### Facebook Messenger

Open [2] or [3], make sure the conversation list is visible, and click **Start** in the control panel. The script skips the Marketplace entry when it can identify it. Press `Esc`, click **Pause**, or click **Stop** if anything looks wrong.

### Instagram Direct

Open the [4] and click **Start**. The script ignores the Stories strip and targets the three-dot menu for each conversation. It then selects **Delete** and confirms the second **Delete** action in the dialog.

Keep the inbox tab visible while the script runs. Website layouts can change, and the script may stop when the page requires manual scrolling, a login check, a confirmation, or an interface update.

## What deletion means

These scripts remove conversations from the current user's inbox through the website interface. They do not guarantee removal of copies held by other participants. They cannot remove screenshots, exports, notifications, or messages that another person has already retained.

Deleting an inbox conversation is different from deleting individual messages for everyone. The available actions depend on the platform, account, conversation type, and current interface.

## Safety and privacy

Do not publish or commit any of the following files or values:

- passwords or recovery codes;

- browser cookies or session tokens;

- exported browser profiles;

- HAR files or network recordings;

- private screenshots or account identifiers;

- personal messages or downloaded account data.

A HAR file can contain temporary session data and private request information even when it does not visibly show a password. If a session recording was shared publicly, log out of the affected account, revoke active sessions where available, and sign in again.

Use a private test account or a small, disposable set of conversations when validating changes. Never run the script unattended until you have verified its behavior with the current website layout.

## Limitations

The scripts depend on the current HTML structure and visible controls of Facebook and Instagram. They may stop working after a website redesign, language change, accessibility-label change, lazy-loading change, or account-specific interface experiment.

The scripts do not use a stable public deletion API. They cannot guarantee that every archived, restricted, requested, group, business, or hidden conversation will be processed. A successful run means that the visible interface actions completed; it does not prove that every copy of every message was erased from the platform.

## Troubleshooting

If the script opens a conversation instead of opening its three-dot menu, stop it immediately and do not let it continue. Reload the inbox and verify that you installed the latest version from this repository.

If the script pauses after a batch, scroll the inbox manually, wait for additional conversations to load, and start a new run. If the page displays a verification prompt, login screen, error dialog, or rate-limit message, stop the script and complete the platform's own flow manually.

When reporting a bug, include the platform, browser, interface language, and a description of the visible state. Do not attach cookies, HAR files, account exports, or private screenshots.

## Disclaimer

This project is provided for personal use and educational purposes. It is offered **as is**, without warranties. You are responsible for reviewing each action and for complying with the terms and policies that apply to your account and region. The project is not affiliated with, sponsored by, or endorsed by Meta, Facebook, Instagram, or Tampermonkey.

## License

This project is released under the MIT License. The repository includes the LICENSE file containing the standard MIT License text.

## References

[1]: "Tampermonkey official website"  https://www.tampermonkey.net/ 

[2]: "Facebook Messenger" https://www.facebook.com/messages/ 

[3]: "Messenger.com" https://www.messenger.com/ 

[4]: "Instagram Direct inbox" https://www.instagram.com/direct/inbox/

[5]: "Meta Help Center: Delete messages or chats on Messenger" https://www.facebook.com/help/messenger-app/194400311449172 
