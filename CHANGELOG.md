# Changelog

## 1.2.0 (November 2026)
- Security: Content Security Policy on the app, guide and website; PIN now a salted PBKDF2 hash with attempt limits and auto-lock after 2 minutes away; Android backups of app data turned off; text recognition on the web loads only from cdn.jsdelivr.net.
- Android release signing: the build creates and stores an encrypted release key, signs every APK, and publishes the certificate fingerprint and a checksum. Updates install over the old version.
- Security documents: SECURITY.md, SECURITY_REQUIREMENTS.md, THREAT_MODEL.md, SECURITY_ARCHITECTURE.md, SECURITY_CHECKLIST.md.
- Signed pages back into documents: add a returned signature packet and FileReady matches each signed page (by page footer or page order) and makes the executed version. Several signers on one page are kept as counterparts.
- Closing checklist linked to the binder: tabs, who is responsible, status and signature counts; share as a PDF or add it to the binder after the index.
- New Aurora look: animated glow background, glass cards, moving edge light, new buttons and navigation. Classic look still in Settings.
- Business plan firm search: custom requests note on every profile.

## 1.1.0 (November 2026)
- Word (.docx) files: checks, removes tracked changes, comments and author names, and redacts text.
- Text recognition (OCR) on the device for scanned pages.
- Compare two versions (PDF or Word) and save a redline PDF.
- Firm settings: export and import one settings file.
- 29 state rule packs and D.C. re-checked against official rule text; the rest are labeled.
- Guide: password-protected business plan with a firm search and pitch builder.

## 1.0.0 (November 2026)
- On-device PDF checks: text under black boxes, sensitive numbers (SSN, tax ID, account and card numbers, birth dates, driver's license, passport, A-numbers, minors' and victims' names, medical terms), blank, sideways and duplicate pages, page size, scanned pages, size limits, hidden data, fonts, file names.
- Fixes with undo: true redaction that keeps the rest of the page searchable, remove blank pages, turn pages upright, scrub hidden data, fit to page size, split to size limit, embed fonts.
- Builder: exhibit cover sheets and labels, index with Bates ranges, Bates numbering, bookmarks, scrub, split.
- Business mode: contract checks (placeholders, amount words vs numbers, missing exhibits and schedules, broken section references, blank signer names, mixed currencies, ambiguous dates), closing binders, signature packets, redaction list.
- Rule packs: 50 states and D.C., federal courts, USPTO, and data-protection flags for the EU, UK, India, Canada, Brazil, Singapore, Australia and Japan.
- Page viewer with highlighted problems, page tools, search across exhibits, check report PDF.
- Welcome screens, PIN and fingerprint lock, light mode, large text, haptics, offline use.
- Website (site.html) and interactive guide (guide.html).
