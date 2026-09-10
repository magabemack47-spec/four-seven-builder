<div align="center">

<!-- Animated Header -->
<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=900&size=50&duration=3000&pause=800&color=00FF41&background=00000000&center=true&vCenter=true&multiline=false&repeat=true&width=700&height=100&lines=%5B+FOUR+x+SEVEN+%5D;%5B+FS+TAPS+%5D;%5B+APP+%26+GAME+BUILDER+%5D;%5B+BUILD+FROM+YOUR+PHONE+%5D" alt="Typing SVG" />

<br>

<!-- Robot Hand Writing Animation -->
<svg width="700" height="200" viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="metal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e8e8e8"/>
      <stop offset="50%" stop-color="#8a8a8a"/>
      <stop offset="100%" stop-color="#4a4a4a"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Grid lines (tech background) -->
  <g opacity="0.15" stroke="#00ff41" stroke-width="0.5">
    <line x1="0" y1="50" x2="700" y2="50"/>
    <line x1="0" y1="100" x2="700" y2="100"/>
    <line x1="0" y1="150" x2="700" y2="150"/>
  </g>
  
  <!-- Text being "written" -->
  <text x="50" y="90" font-family="'Courier New', monospace" font-size="32" font-weight="900" fill="#00ff41" filter="url(#glow)">
    FOUR x SEVEN
    <animate attributeName="opacity" values="0;1;1;0" dur="6s" repeatCount="indefinite"/>
  </text>
  
  <!-- Cursor blinking -->
  <rect x="340" y="65" width="3" height="30" fill="#00ff41">
    <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite"/>
  </rect>
  
  <!-- Robot arm -->
  <g transform="translate(560, 20)">
    <animateTransform attributeName="transform" type="translate" 
      values="560,20; 560,20; 400,20; 340,20; 340,20; 400,20; 560,20; 560,20" 
      dur="6s" repeatCount="indefinite"/>
    
    <!-- Arm base -->
    <rect x="0" y="0" width="60" height="20" fill="url(#metal)" rx="3"/>
    
    <!-- Arm segment -->
    <rect x="55" y="5" width="30" height="10" fill="url(#metal)" rx="2"/>
    
    <!-- Hand/gripper -->
    <rect x="82" y="2" width="15" height="16" fill="#2a2a2a" rx="2"/>
    <rect x="94" y="0" width="4" height="6" fill="#e8e8e8" rx="1"/>
    <rect x="94" y="14" width="4" height="6" fill="#e8e8e8" rx="1"/>
    
    <!-- Joints (circles) -->
    <circle cx="30" cy="10" r="4" fill="#00ff41" opacity="0.8">
      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="82" cy="10" r="3" fill="#00ff41" opacity="0.8">
      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite"/>
    </circle>
  </g>
</svg>

<br>

<!-- Status badges -->
<a href="#"><img src="https://img.shields.io/badge/STATUS-ONLINE-00ff41?style=for-the-badge&labelColor=000000" /></a>
<a href="#"><img src="https://img.shields.io/badge/BUILD-GITHUB_ACTIONS-00ff41?style=for-the-badge&labelColor=000000&logo=githubactions&logoColor=00ff41" /></a>
<a href="#"><img src="https://img.shields.io/badge/PLATFORM-ANDROID-00ff41?style=for-the-badge&labelColor=000000&logo=android&logoColor=00ff41" /></a>
<a href="#"><img src="https://img.shields.io/badge/LICENSE-MIT-00ff41?style=for-the-badge&labelColor=000000" /></a>

</div>

---

<div align="center">

## ◆ WELCOME TO THE FUTURE ◆

**Build Android Apps & Games Directly From Your Phone**

*No Android Studio. No Java. No PC required.*

</div>

---

## 🤖 What Is This?

<img align="right" width="200" src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=14&duration=2000&pause=500&color=00FF41&background=00000000&center=false&vCenter=true&width=250&height=200&lines=%3E+Write+HTML+code;%3E+Tap+BUILD+APK;%3E+Wait+3+minutes;%3E+Download+APK;%3E+Install+on+phone;%3E+It+works!" />

**FOUR x SEVEN** is a fully serverless app builder that turns HTML/CSS/JavaScript into installable Android APKs — running entirely from your browser or phone.

Built with:
- ⚡ **Vercel** serverless functions for the API
- 🔨 **GitHub Actions** for the actual APK compilation  
- 📦 **Cordova** to wrap HTML into native Android
- 🎨 **Auto-generated icons** — no uploads needed

<br clear="right"/>

---

## ⚙️ How It Works

```mermaid
graph LR
    A[📱 You Write HTML] --> B[🌐 Builder Website]
    B --> C[⚡ Vercel API]
    C --> D[🔨 GitHub Actions]
    D --> E[📦 Cordova Build]
    E --> F[📱 Signed APK]
    F --> G[✅ Install on Phone]
    
    style A fill:#0a0a0a,stroke:#00ff41,color:#00ff41
    style B fill:#0a0a0a,stroke:#00ff41,color:#00ff41
    style C fill:#0a0a0a,stroke:#00ff41,color:#00ff41
    style D fill:#0a0a0a,stroke:#00ff41,color:#00ff41
    style E fill:#0a0a0a,stroke:#00ff41,color:#00ff41
    style F fill:#0a0a0a,stroke:#00ff41,color:#00ff41
    style G fill:#0a0a0a,stroke:#00ff41,color:#00ff41