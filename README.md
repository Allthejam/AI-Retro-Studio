# AI Retro Studio

Transform and revitalize your photos with the power of Google Generative AI and Firebase.

## Features

- **Photo Restoration**: Intelligently repairs cracks, scratches, and fading from vintage photos while preserving original composition.
- **Colorize Photo**: Accurately colorizes black-and-white photos with realistic, natural hues.
- **4K Upscaling**: Upscales and enhances low-resolution images to crisp high-definition quality.
- **Cartoonize**: Converts portraits and photos into stylized, vibrant cartoon artwork.
- **Cloud History & Sync**: Automatically uploads transformed images to Firebase Cloud Storage and tracks your transformation history in Cloud Firestore.
- **Secure Authentication**: User accounts with email and password via Firebase Authentication.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & Turbopack)
- **AI & GenAI**: [Genkit](https://firebase.google.com/docs/genkit) powered by Google Gemini (`gemini-2.5-flash-image`)
- **Backend**: [Firebase](https://firebase.google.com/) (Authentication, Cloud Firestore, Cloud Storage, App Hosting)
- **Styling**: Tailwind CSS, Radix UI components & Lucide icons

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Allthejam/AI-Retro-Studio.git
   cd AI-Retro-Studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:9005](http://localhost:9005) in your browser.

