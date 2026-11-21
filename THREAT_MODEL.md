# FileReady threat model

Method: list what we protect, who might attack it, where the trust boundaries are, then go through STRIDE (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege) and rank the risks.

Last reviewed: November 2026 (version 1.2). Review again after any feature that adds network use, storage, accounts or sharing.

## 1. What we protect
| Asset | Why it matters |
|---|---|
| Client documents (filings, exhibits, contracts, signed pages) | Confidential and privileged. Disclosure can harm clients and breach court rules. |
| Correct redaction | A bad redaction is a public leak of Social Security numbers, minors' names and account numbers. |
| Integrity of built filings and executed documents | A wrong page or wrong signature page in a filing or closing set is a legal error. |
| PIN and lock | Stops a casual person with the phone from opening client files. |
| Firm settings file | Holds the firm's redaction list (client and deal names). |
| App code and build | If tampered with, every user is affected. |
| Business plan | Commercially sensitive (pricing, prospects). |

## 2. Who might attack, and how likely
| Actor | Example | Likelihood |
|---|---|---|
| Person with the phone | Lost or stolen phone, or a family member | Medium |
| Opposing party or outsider sending files | A crafted PDF or Word file meant to crash the app or run code | Low to medium |
| Other apps on the phone | Malware reading shared files or the screen | Low |
| Cloud backup exposure | Phone backups that include app data | Medium (fixed in build) |
| Network attacker | Public Wi-Fi | Low (no document traffic) |
| Supply-chain attacker | Compromised library, CDN or GitHub Action | Low, high impact |
| GitHub account takeover | Stolen password or token | Low, high impact |
| The user, by mistake | Sending the wrong version, trusting a missed number | High |

## 3. Trust boundaries
1. **The device** — everything inside the app is trusted; the network is not used for documents.
2. **Incoming files** — every PDF and Word file is untrusted input.
3. **Share / Save** — data leaves FileReady's control here.
4. **Web version's CDN** — text-recognition code and language file come from cdn.jsdelivr.net.
5. **Build pipeline** — GitHub Actions downloads packages from npm and builds the APK.
6. **Public repository and GitHub Pages** — anyone can read the code and the encrypted business plan.

## 4. STRIDE
| Category | Threat | Mitigation | Status |
|---|---|---|---|
| Spoofing | Someone opens the app on an unlocked phone | PIN with slow hash, attempt limits, auto-lock, fingerprint | Done (fingerprint untested) |
| Spoofing | Fake FileReady APK sent to a firm | Release signing key; certificate fingerprint and checksum published on the Releases page | Done, untested |
| Tampering | Crafted PDF changes what is shown or hides text | Checks run on extracted text and page images; text under boxes flagged | Done |
| Tampering | Wrong signed page put into a document | Footer match or page order, user checks each match, new version with undo | Done |
| Information disclosure | Signing key stolen from the repo | Key encrypted with AES-256 and PBKDF2 (600,000 rounds); password only in GitHub Secrets and the owner's password manager | Done |
| Tampering | Compromised library or build step | Vendored fixed versions; pinned major versions; Dependabot | Partial |
| Repudiation | "Who changed this filing?" | Change log per filing, included in the check report | Done |
| Information disclosure | Bad redaction leaks data | True redaction (rebuild page), re-check, text-under-box detection | Done |
| Information disclosure | Hidden metadata, comments, tracked changes | Scrub for PDF and Word | Done |
| Information disclosure | Lost phone exposes stored files | App sandbox, phone encryption, PIN lock | Partial (no app-level encryption yet) |
| Information disclosure | Cloud backup includes client files | Backups turned off in the Android build | Done, untested |
| Information disclosure | Screenshots or recent-apps preview show client data | Optional block-screenshots setting | Planned |
| Information disclosure | Injected script sends data out (web) | Strict CSP blocks outside connections and scripts | Done |
| Information disclosure | Firm settings file shared too widely | It holds no documents or PIN; warn that it holds client names | Partial |
| Information disclosure | Business plan read from the public repo | AES-256-GCM with a strong random password | Done |
| Denial of service | Huge or zip-bomb files freeze the app | File size and unpacked size limits | Planned |
| Elevation of privilege | Script inside a PDF runs | pdf.js eval off, PDF JavaScript never run, scrub removes it | Done |
| Elevation of privilege | Malicious Word macro | Macros are never run; Word files read as XML | Done |

## 5. Top risks, ranked
1. **Missed sensitive data or a user mistake** — the app flags common patterns but cannot find everything. *Mitigation:* clear "review required" wording, check report, re-check after fixes, firm redaction list.
2. **Lost or shared phone** — files are readable once the phone and app are open. *Mitigation now:* PIN, auto-lock, backups off. *Next:* encryption at rest with the Android Keystore.
3. **Signing key loss or theft** — whoever has the key and password can sign look-alike updates; losing it means users must uninstall to update. *Mitigation:* key stored only encrypted, strong password in GitHub Secrets and a password manager, fingerprint published.
4. **Supply chain** — npm packages and the OCR CDN. *Next:* lockfile, self-hosted OCR files, Dependabot.
5. **Malformed files** — crashes or freezes. *Next:* size limits and timeouts.

## 6. Out of scope
- A phone that is already rooted or infected with malware.
- Security of email, cloud drives or e-filing portals after a file is shared.
- Court or counterparty systems.
