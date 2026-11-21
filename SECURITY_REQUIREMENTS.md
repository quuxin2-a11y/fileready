# Security requirements

Status: **Done** = built and tested in a browser; **Partial** = built, with a gap noted; **Planned** = not built yet; **Untested** = built but not yet tested on a phone.

Last reviewed: November 2026 (version 1.2).

## 1. Data handling
| ID | Requirement | Status |
|---|---|---|
| DH-1 | Documents are processed only on the device. No document content is sent over the network. | Done |
| DH-1a | Online research is opt-in per search; only the keywords shown on screen are sent, to the USPTO Open Data Portal or CourtListener. | Done, untested against the live services |
| DH-1b | Built-in research keys come from GitHub Secrets at build time and are never committed. Users can replace them with their own keys, stored only on their device and never exported. | Done |
| DH-2 | No account, analytics, ads or tracking. | Done |
| DH-3 | Files leave the device only when the user taps Share or Save. | Done |
| DH-4 | Original files are never changed. Every fix creates a new version that can be undone. | Done |
| DH-5 | Settings exported for the firm never include the PIN, the PIN hash or any document. | Done |
| DH-6 | "Delete all data" removes every filing, file, version, output and setting. | Done |
| DH-7 | Android app data is excluded from cloud and device-to-device backups. | Done (build setting), Untested |
| DH-8 | Files stored in the app are encrypted with a key protected by the Android Keystore or the PIN. | Planned |
| DH-9 | Optional "block screenshots" setting for the Android app. | Planned |

## 2. Access control
| ID | Requirement | Status |
|---|---|---|
| AC-1 | Optional PIN lock when the app opens. | Done |
| AC-2 | PIN stored only as a salted, slow hash (PBKDF2-SHA256, 60,000 rounds, random 16-byte salt). For a 4-digit PIN the attempt limits are the main protection, so the round count is kept low enough to unlock instantly. Older hashes are upgraded on the next unlock. | Done |
| AC-3 | After 5 wrong PINs, a wait starts at 30 seconds and doubles, up to 1 hour. | Done |
| AC-4 | The app locks again after 2 minutes in the background. | Done |
| AC-5 | PIN only: no fingerprint or face unlock, so no biometric plugin is included. | Done |
| AC-6 | The PIN is refused if secure browser cryptography is unavailable (no weak fallback). | Done |

## 3. Untrusted input (PDF and Word files from other parties)
| ID | Requirement | Status |
|---|---|---|
| IN-1 | PDFs are parsed with pdf.js with script evaluation off (`isEvalSupported: false`). | Done |
| IN-2 | PDF JavaScript, attachments and form actions are never run. The scrub removes them from output files. | Done |
| IN-3 | All text taken from documents is escaped before it is shown on screen. | Done |
| IN-4 | Word files are read as data (XML inside a zip). Macros are never run. | Done |
| IN-5 | Limits on file size and on unpacked size of Word files (zip bombs). | Planned |
| IN-6 | Encrypted or broken files are reported, not crashed on. | Done |

## 4. Redaction and output integrity
| ID | Requirement | Status |
|---|---|---|
| RO-1 | Redaction removes the underlying text, not just covers it: the page is rebuilt as an image with boxes burned in, and only text outside the boxes is kept. | Done |
| RO-2 | Every output can be re-checked in one tap; text under black boxes is flagged. | Done |
| RO-3 | Built files carry no author names, comments, attachments or scripts when "Scrub" is on. | Done |
| RO-4 | Signed pages are only put into documents after the user checks each match. Each update is a new version. | Done |
| RO-5 | The check report lists every change made in FileReady. | Done |
| RO-6 | Word redaction replaces the text with X characters across all runs; re-check required. | Partial (body text; headers, footers and footnotes to be verified) |

## 5. Web version
| ID | Requirement | Status |
|---|---|---|
| WB-1 | Content Security Policy: scripts only from the app and cdn.jsdelivr.net (text recognition); connections only to the app, that CDN, api.uspto.gov and www.courtlistener.com (research); no objects, frames, forms or base changes. | Done |
| WB-2 | Guide and website: CSP with no outside connections. | Done |
| WB-3 | No referrer sent when opening outside links. | Done |
| WB-4 | Served only over HTTPS (GitHub Pages). | Done when Pages is turned on |
| WB-5 | Text-recognition files self-hosted, or loaded with integrity hashes (SRI). | Planned |

## 6. Android app
| ID | Requirement | Status |
|---|---|---|
| AN-1 | Only bundled files are loaded; no remote web content inside the app. | Done |
| AN-2 | No cleartext (http) traffic. | Done (Android default) |
| AN-3 | Release builds signed with a private release key. The key is created once by the build, stored in the repo only encrypted (AES-256, PBKDF2 600,000 rounds), and unlocked with the SIGNING_PASSWORD secret. The certificate fingerprint and a checksum are published with each release. | Done, untested until the first build |
| AN-4 | Content Security Policy inside the app, tested with Capacitor's bridge. | Planned |
| AN-6 | Version number increases with every build so updates install over the old app. | Done |
| AN-5 | Only the permissions needed: no camera, contacts, location or storage permissions. The internet permission (a Capacitor default) is used only to open links the user taps. | Done |

## 7. Supply chain and build
| ID | Requirement | Status |
|---|---|---|
| SC-1 | Libraries vendored at fixed versions: pdf.js 6.2.108, pdf-lib 1.17.1, JSZip 3.10.1. | Done |
| SC-2 | Build-time packages pinned to exact versions with a lockfile. | Partial (major versions pinned) |
| SC-3 | Dependabot alerts and secret scanning turned on for the repository. | Planned (repo settings) |
| SC-4 | No secrets committed to the repository. The business plan password is never stored in it. | Done |
| SC-5 | Third-party licenses listed. | Done (LICENSE) |

## 8. Business plan (guide)
| ID | Requirement | Status |
|---|---|---|
| BP-1 | Plan text stored only encrypted (AES-256-GCM, PBKDF2-SHA256 310,000 rounds, random salt and IV). | Done |
| BP-2 | Password is random and at least 20 characters, shared only privately. | Done |
| BP-3 | Changing the password re-encrypts the plan; old copies in Git history stay readable with the old password. | Known limit |
