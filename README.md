
# CodeCrafter: AI-Powered Interactive Learning Platform

CodeCrafter is a Next.js application designed to help users learn software development concepts and coding skills interactively with the assistance of Generative AI. Users can select topics and difficulty levels, receive coding or conceptual questions, submit their answers, and get instant feedback, solutions, and track their progress over time.

## ✨ Features

*   **AI-Powered Question Generation**:
    *   Generates coding and/or conceptual questions based on selected topic and difficulty.
    *   Provides concise, actionable hints for each question without revealing the direct solution.
    *   Supports "Coding Only", "Conceptual Only", or "Both Types" for a mixed challenge.
*   **AI-Driven Topic Suggestion**:
    *   Users can request an AI-suggested programming topic based on their chosen difficulty level, helping them discover new areas or overcome choice paralysis.
*   **Interactive Challenge Environment**:
    *   Dedicated challenge page (`/challenge`) dynamically loads questions based on dashboard selections.
    *   Separate input areas:
        *   **Code Editor Panel**: For writing and submitting code solutions, with clear, copy, and submit actions.
        *   **Conceptual Answer Panel**: For typing out textual answers to conceptual questions, with clear, copy, and submit actions.
    *   Ability to switch between coding and conceptual questions if "Both Types" was selected.
    *   Option to restart the current challenge with new questions for the same parameters or go back to the dashboard for new parameters.
*   **AI-Driven Grading & Feedback**:
    *   **Code Grading**: User-submitted code is evaluated by an AI for correctness, efficiency, and style, providing a score (out of 100) and constructive feedback.
    *   **Answer Grading**: Textual answers to conceptual questions are graded by an AI for correctness, clarity, and completeness, providing a score and feedback.
    *   Indicates whether the user passed or failed based on a predefined threshold (e.g., score >= 70).
*   **AI-Generated Solutions**:
    *   If a user fails a challenge (coding or conceptual), the AI automatically generates a correct solution and a detailed explanation.
    *   This solution is displayed immediately on the challenge page and saved with the history entry.
*   **User Authentication**:
    *   Secure sign-up and sign-in using Firebase Authentication (Email & Password).
    *   Protected routes ensure only authenticated users can access the dashboard, challenge page, history, and profile.
*   **Challenge History & Persistence**:
    *   All challenge attempts (passed or failed), including the topic, difficulty, question type, question, user's solution, AI grading (score, feedback), and the AI-generated solution (if applicable), are saved to Firestore.
    *   **History Page (`/history`)**: Logged-in users can view a chronological list of their past challenge attempts.
        *   Each entry displays key details and allows users to expand an accordion to see the full question, their submitted solution, AI feedback, and the AI-generated solution if available.
*   **User Profile & Progress Tracking**:
    *   **Profile Page (`/profile`)**: Logged-in users have a dedicated profile page displaying:
        *   **Overall Performance Statistics**: Total attempts, total passed, overall pass rate, and date range of activity.
        *   **Performance by Topic**: A table detailing attempts, passes, pass rate (with a progress bar), and last attempted date for each topic.
        *   **Performance by Difficulty**: A table detailing attempts, passes, and pass rate (with a progress bar) for Beginner, Intermediate, and Advanced levels.
*   **Gamification (Badges)**:
    *   Users earn badges for various achievements, such as:
        *   Passing their first challenge ("Initiate Programmer").
        *   Passing a set number of challenges at specific difficulty levels (e.g., "Beginner Challenger," "Intermediate Adept," "Advanced Virtuoso").
    *   Earned badges, along with their icons, names, descriptions, and earning dates, are displayed on the user's profile page.
    *   Achievements are stored in Firestore.
*   **Responsive & Modern UI**:
    *   Built with ShadCN UI components and styled with Tailwind CSS for a clean, modern, and responsive user experience across devices.
    *   Uses toast notifications for user feedback on actions like saving history, earning badges, or encountering errors.
    *   Custom favicon for brand identity.

## 🛠️ Tech Stack

*   **Framework**: Next.js (App Router)
*   **Language**: TypeScript
*   **UI**: React
*   **Styling**: Tailwind CSS
*   **UI Components**: ShadCN UI
*   **Generative AI**: Google Gemini models via Genkit
*   **Backend & Database**: Firebase (Authentication, Firestore)
*   **State Management**: React Context API (`AuthContext`), `useState`, `useEffect`
*   **Forms**: React Hook Form (implicitly via ShadCN or custom for simple inputs)
*   **Routing**: Next.js App Router
*   **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   npm or yarn
*   A Firebase project

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-folder-name>
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of your project by copying `.env.example` (if one exists) or by creating it manually. You'll need to populate it with your Firebase project configuration.

Example `.env` structure:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Genkit typically uses Google Cloud Project authentication or GOOGLE_API_KEY if set
# GOOGLE_API_KEY=your_google_ai_studio_api_key 
```

### 4. Firebase Setup

*   **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
*   **Add a Web App**: In your Firebase project settings, add a new Web App. Firebase will provide you with the configuration values (apiKey, authDomain, etc.) needed for your `.env` file.
*   **Enable Authentication**: In the Firebase console, navigate to "Authentication" (under Build) -> "Sign-in method" tab, and enable the "Email/Password" provider.
*   **Enable Firestore**: Navigate to "Firestore Database" (under Build) and create a database. Start in **test mode** for initial development (which has open security rules) or set up production rules immediately.
    *   **Security Rules for Firestore**: Ensure you have appropriate security rules. For development, you might start with more open rules, but for production, they should be secure. Example rules for `challengeHistory` and `userAchievements`:
        ```javascript
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /challengeHistory/{docId} {
              allow read: if request.auth != null && request.auth.uid == resource.data.userId;
              allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
              allow update, delete: if false;
            }
            match /userAchievements/{docId} {
              allow read: if request.auth != null && request.auth.uid == resource.data.userId;
              allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
              allow update, delete: if false;
            }
          }
        }
        ```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

This will start the Next.js development server, typically on `http://localhost:3000`.

### 6. Run Genkit (for AI features)

In a separate terminal, you may need to start the Genkit development server if you're actively developing or testing AI flows locally:

```bash
npm run genkit:dev
# or
npm run genkit:watch # (if you want it to watch for changes in AI flow files)
```
This typically starts Genkit on `http://localhost:3100`.

## 📄 Project Structure (Key Directories)

*   `src/app/`: Contains the main pages and layouts (App Router: `/`, `/challenge`, `/login`, `/history`, `/profile`).
*   `src/ai/`: Genkit AI flows and configuration.
    *   `flows/`: Individual AI flows (e.g., question generation, grading, solution generation, topic suggestion).
*   `src/components/`: Reusable UI components.
    *   `ui/`: ShadCN UI components.
    *   `layout/`: Layout components like `AppHeader` and `AppFooter`.
    *   `code-crafter/`: Application-specific components for the core CodeCrafter experience (e.g., `DifficultySelector`, `ChallengeDisplay`).
    *   `dynamic-lucide-icon.tsx`: Component to render Lucide icons by name.
*   `src/contexts/`: React Context providers (e.g., `AuthContext`).
*   `src/hooks/`: Custom React hooks (e.g., `useToast`, `useIsMobile`).
*   `src/lib/`: Utility functions, Firebase configuration (`firebase.ts`), achievement definitions (`achievements.ts`).
*   `public/`: Static assets (e.g., images, `favicon.png`).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is licensed under the MIT License (Assumed - update if different).
```