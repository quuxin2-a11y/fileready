# Security checklist

Tick items as you go. Items marked ✅ are already done in the code.

## A. Before the first upload
- ✅ No passwords, keys or tokens in any file (the business plan password is not in the repo).
- ✅ Security policy and documents added (SECURITY.md and the four security files).
- ✅ Content Security Policy on the app, guide and website.
- ✅ PIN stored as a salted PBKDF2 hash with attempt limits and auto-lock.
- ✅ Android backups of app data turned off in the build.
- [ ] Demo files are fictional only (no real client documents anywhere in the repo).

## B. GitHub account and repository (do once, right after creating the repo)
- [ ] Turn on two-factor authentication: Profile → **Settings** → **Password and authentication**.
- [ ] Repo → **Settings** → **Code security** (or **Security**):
  - [ ] **Private vulnerability reporting** → Enable.
  - [ ] **Dependabot alerts** → Enable.
  - [ ] **Secret scanning** and **Push protection** → Enable (if shown).
- [ ] Repo → **Settings** → **Actions** → **General** → Workflow permissions: **Read repository contents** (the workflow asks for write access itself).
- [ ] Repo → **Settings** → **Branches** → add a rule for `main`: block force pushes and deletion.

## C. Before giving the app to any firm
- [ ] Add the `SIGNING_PASSWORD` secret and save the same password in your password manager (the workflow makes and stores the key).
- [ ] After the first signed build, confirm `signing/release.jks.enc` appears in the repo and the Releases page shows a fingerprint.
- [ ] Copy the fingerprint into your records; give it to firms that ask how to verify the app.
- [ ] Test on the phone: PIN, wrong-PIN wait, auto-lock after 2 minutes, fingerprint unlock, text recognition.
- [ ] Confirm backups are off: Android **Settings** → **Google** → **Backup** shows no FileReady data.
- [ ] Run the court demo and deal demo; check every redaction by searching the built PDF for the hidden text.
- [ ] Re-check the 21 state rule packs still marked "compiled" before selling in those states.
- [ ] Prepare answers for the firm's security questionnaire using SECURITY_ARCHITECTURE.md (no server, no upload, data on device).

## D. Every release
- [ ] Update CHANGELOG.md and the version number.
- [ ] Bump the cache name in `sw.js`.
- [ ] Review Dependabot alerts; update vendored libraries if a security fix is out.
- [ ] Run the demos: check, fix all, redaction, build, signature packets, signed pages, checklist, Word clean, compare.
- [ ] Check the browser console for Content Security Policy errors.
- [ ] Confirm the Actions build is green, the release shows the same certificate fingerprint as before, and the APK installs over the old one.
- [ ] Re-read THREAT_MODEL.md if the release adds network use, storage, sharing or accounts.

## E. Next security work (from SECURITY_REQUIREMENTS.md)
- [ ] DH-8 Encrypt stored files with a key protected by the Android Keystore or the PIN.
- [ ] DH-9 Optional "block screenshots" setting.
- [ ] IN-5 File size and zip-bomb limits.
- [ ] WB-5 Self-host the text-recognition files (or add integrity hashes).
- [ ] AN-4 Content Security Policy inside the Android app.
- [ ] SC-2 Lockfile with exact versions for the build.

## F. If something goes wrong
1. Confirm the report privately (Security tab → advisories).
2. Fix it in a private fork or branch, then release.
3. Publish the advisory with the fixed version and update CHANGELOG.md.
4. If client data may have been exposed, tell affected firms promptly so they can meet their own notice duties.
