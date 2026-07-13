# Socia Gram — Secure Civic & Public Transportation Portal

Socia Gram is a secure, digital civic portal tailored for rural village governance. The platform empowers villagers to directly voice community challenges—such as infrastructure deterioration, sanitation lapses, water issues, and poor transport connectivity—while providing local government secretariats with a reliable admin dashboard to track, prioritize, and resolve complaints efficiently.

Developed by **P.Meghana**, this application is engineered to bridge communication gaps, accelerate civic resolution times, and elevate rural connectivity.

---

## 🌟 Core Features

### 1. Village Civic Issue Reporting
Citizens can formally report critical village infrastructure problems directly.
* **Categories Covered**: 
  * 🛣️ Damaged Roads
  * 🗑️ Garbage Accumulation
  * 💧 Water Supply Problems
  * 🏫 School & Public Building Maintenance
  * ⚡ Streetlights & Electricity Issues
  * 📍 Other Local Grievances
* **Evidence Upload**: Supports high-resolution camera captures or gallery uploads of local issues.
* **Smart Compression**: Automatically optimizes image files client-side before uploading to ensure efficient storage and minimal bandwidth consumption in low-connectivity areas.
* **Automatic Geolocation Tracking**: Automatically captures precise GPS coordinates (Latitude & Longitude) for accurate field validation.

### 2. Public Transportation & Bus Service Requests
Addresses the lack of connectivity in rural regions by allowing villagers to request new or improved transport routes.
* **Official Entry**: Villagers can select the **Public Transportation Request** mode.
* **Validation Evidence**: Required upload of the **Village Name Board / Board Signage** to authenticate the village location.
* **Detailed Metadata**: Captures essential details including **Village Name**, **6-digit PIN Code**, and automatic GPS location.
* **Request Description**: Optional input for citizens to specify bus route details, required timings, and passenger volumes (students, daily workers, elderly citizens, etc.).

### 3. Secure Aadhaar-Based Authentication
For maximum security and to eliminate spam or fraudulent requests, the portal includes secure citizen identification.
* **Aadhaar Integration**: Validates and stores 12-digit Aadhaar Card Numbers.
* **Strict Masking Rules**: 
  * For standard visitors: Aadhaar numbers are fully masked (`•••• •••• 1234`) to protect personal data.
  * For verified Admins & the citizen who submitted the report: The full Aadhaar number is displayed for verified official authentication.
* **Dedicated Inputs**: Features a secure, responsive, and numeric-only input form with interactive feedback icons.

### 4. Multilingual Localized Interface
To ensure usability across diverse rural populations, the portal is fully localized with single-click language toggle:
* **English** (Primary Admin & International Interface)
* **Telugu / తెలుగు** (Regional Localization)
* **Hindi / हिंदी** (National Localization)

### 5. Secretariat Admin Dashboard
A robust administration panel designed for village authorities to manage issues seamlessly.
* **Status Tracking**: Updates grievances from **Submitted** ➔ **In Progress** ➔ **Resolved**.
* **Search & Filters**: Instantly filters complaints by category, status, description, village name, and PIN code.
* **Resolution Notes & Verification**: Admins can enter resolution notes and upload "Before vs. After" visual evidence of resolved issues.

---

## 🛠️ Technology Stack

* **Frontend**: React 18 with Vite
* **Styling**: Tailwind CSS
* **Database & Auth**: Firebase Firestore & Firebase Authentication
* **Icons**: Lucide React
* **Type Safety**: TypeScript 5+

---

## 🛡️ Security & Privacy
* **Authorized Views Only**: Confidential details (reporter phone numbers, Aadhaar numbers) are securely stored. Non-owners and unauthenticated guests are restricted from viewing full citizen identifiers.
* **Aadhaar Protection**: Features secure client-side input validation preventing character leakage and enforces masked representation.
