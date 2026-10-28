# ⚡ GTM Injector Pro

> Instantly inject and test any Google Tag Manager (GTM) container on the fly with a modern, zero-config browser extension.

---

## 🌟 Overview

**GTM Injector Pro** is a powerful, lightweight, and developer-friendly Google Chrome Extension built with **Manifest V3**. It is designed for web developers, digital analysts, and QA engineers who need to test, audit, or debug Google Tag Manager implementations on any live website without altering the source code.

---

## ✨ Key Features

* 🚀 **MAIN-World Script Execution:** Safely injects GTM containers directly into the page's main context (`window.dataLayer`), seamlessly bypassing strict page-level Content Security Policy (CSP) restrictions.
* ⚡ **Persistent & Automatic:** Once enabled, it automatically injects your container across all page navigations and tabs without requiring manual re-injection.
* 🎨 **Minimalist Dark UI:** Features a sleek, modern, distraction-free dark neon interface with smooth tactile button micro-animations.
* 🔍 **Live In-Page Debug Banner:** A discreet, non-intrusive floating status banner in the bottom-right corner confirms your active container ID in real-time, complete with a quick one-click toggle to turn off.
* 🔒 **Privacy-First & Secure:** Zero third-party telemetry, no external CDN dependencies, and open-source code.

---

## 📖 How to Use

1. Click the **GTM Injector Pro** icon in your Chrome toolbar.
2. Enter your target **GTM Container ID** (e.g., `GTM-XXXXXXX`).
3. Click **Save & Inject** (or toggle the switch to **ON**). 
4. The extension instantly injects the container, updates the icon with a green status dot, and displays a subtle debug banner on the page.

---

## 🛠️ Local Installation & Development

1. Clone or download this repository as a `.zip` file and extract it.
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select your extension folder.