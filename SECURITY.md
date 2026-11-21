# FileReady security

FileReady handles client documents for law firms. This page summarizes how the app protects them, what it does not protect against yet, and how to report a problem.

**Short version:** documents are read, checked, fixed and built on the device. There is no FileReady server, account or upload. The optional research tools send only search words the user approves to public legal databases. The main risks are on the device itself (a lost phone, cloud backups, other apps) and in the code supply chain. Both are covered below.

## Reporting a vulnerability
- Use GitHub's private reporting: **Security** tab of this repository → **Report a vulnerability**. Please do not open a public issue for security problems.
- Include what you found, the steps to reproduce it, and which version (web or Android, and the version in Settings).
- Expect a first reply within 5 business days. Fixes for confirmed issues are released as soon as they are ready and noted in [CHANGELOG.md](CHANGELOG.md).
- Please give us a reasonable time to fix an issue before publishing it.

## Supported versions
Only the latest release (the `latest` APK and the current web version) receives security fixes.

## What FileReady does
- No network use for documents. Files never leave the device unless the user taps Share or Save.
- Strict Content Security Policy in the web version: scripts only from the app itself (and the pinned text-recognition engine), no outside connections except that engine, no plugins or frames.
- PDFs are opened with pdf.js with script evaluation turned off. Text from documents is escaped before it is shown.
- True redaction: redacted pages are rebuilt as images with the boxes burned in, and only the text outside the boxes is kept. Every fix is re-checked.
- Hidden data scrub: author names, comments, form fields, attachments and scripts in PDFs; tracked changes, comments, hidden text and author names in Word files.
- App lock: 4-digit PIN stored only as a salted PBKDF2-SHA256 hash (60,000 rounds), 5 tries before a growing wait, locks again after 2 minutes in the background.
- Android: app data is excluded from cloud and device-to-device backups.
- Android: release builds are signed with a private release key, so updates install over the old version and the app can be verified.
- Business plan in the guide: encrypted with AES-256-GCM, key from the password with PBKDF2-SHA256 (310,000 rounds), decrypted only in the reader's browser.

## Verify the Android app
Every release APK is signed with the FileReady release key. The **Releases** page shows the certificate's SHA-256 fingerprint and a checksum file (`fileready.apk.sha256`). A firm's IT team can confirm the APK with `apksigner verify --print-certs fileready.apk` and compare the fingerprint. Only download FileReady from this repository's Releases page.

## Online research (optional)
- Patent check and case search send **only the search words shown on screen** to the USPTO Open Data Portal or CourtListener, and only when the user taps Search. Documents are never sent.
- For an invention not yet filed, even keywords can reveal something. Users can remove words before searching, or skip the online search.
- Until FileReady is sold, the app and website include the owner's research keys, injected at build time from GitHub Secrets. Anyone can extract a key from a public app or website, so these keys are treated as low-value: they can be rate-limited or revoked and replaced. Users can enter their own keys in Settings, which replace the built-in ones.

## Known limits
- Files saved in the app are protected by Android's app sandbox and the phone's own encryption, not by a separate FileReady key. Anyone who can unlock the phone and open the app can read them. See [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) for the plan.
- FileReady flags common problems. It does not guarantee that every piece of sensitive information is found. A person must review every filing.

## Security documents
- [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md): what the app must do, with status.
- [THREAT_MODEL.md](THREAT_MODEL.md): what we protect, from whom, and how.
- [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md): how the pieces fit and where data lives.
- [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md): steps for the repository, each release and firm reviews.
- [PRIVACY.md](PRIVACY.md): privacy policy.
