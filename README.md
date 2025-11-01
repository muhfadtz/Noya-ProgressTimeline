
# Noya - Research Progress Tracker

**Noya** is a sleek, modern, and responsive web application designed to help researchers, students, and professionals track their project progress with ease. Built with a multi-space system, it allows users to manage multiple research projects simultaneously, each with its own dedicated timeline.

Track your research journey, simply.

## ✨ Key Features

- **Authentication**: Secure user login and registration with email/password and Google Sign-In.
- **Multi-Space System**: Create and manage separate "spaces" for each research project, keeping your work organized.
- **Interactive Timeline**: Log your progress and next steps in a clean, chronological timeline view for each space.
- **Markdown Support**: Add detailed notes to your progress reports using Markdown for rich text formatting, including code snippets, lists, and links.
- **Pin Important Spaces**: Pin your most active or important spaces to the top of your dashboard for quick access.
- **CRUD Operations**: Full Create, Read, Update, and Delete functionality for both spaces and progress reports.
- **Custom Dialogs**: A consistent and user-friendly experience with custom-built dialogs for all actions, including confirmations for destructive actions.
- **Fully Responsive**: A mobile-first design that looks and works great on all devices, from desktops to smartphones.
- **Dynamic Date Entry**: Log progress for the current date automatically or select a past date for retroactive entries.

## 🚀 Tech Stack

- **Frontend**: React.js
- **Backend & Database**: Firebase (Firestore, Authentication)
- **Styling**: Tailwind CSS for a utility-first CSS framework.
- **Icons**: Lucide React for a beautiful and consistent icon set.
- **Markdown Rendering**: `react-markdown` with `remark-gfm` for GitHub Flavored Markdown support.
- **Routing**: React Router for client-side routing.

## 📁 Project Structure

```
/
├── public/
├── src/
│   ├── components/
│   │   ├── pages/         # Page components (LoginPage, SpacesPage, etc.)
│   │   ├── ui.tsx         # Reusable UI components (Button, Card, Dialog)
│   │   ├── Icons.tsx      # Custom SVG icon component
│   │   └── Layout.tsx     # Main application layout with navbars
│   ├── contexts/          # React contexts (Auth, Theme)
│   ├── services/
│   │   └── firebase.ts    # Firebase configuration and service functions
│   ├── App.tsx            # Main app component with routing
│   ├── index.tsx          # Entry point of the React app
│   └── types.ts           # TypeScript type definitions
├── index.html
└── README.md
```

## ⚙️ Running the Application

This application is designed to run in an environment where Firebase environment variables are pre-configured, such as Google's AI Studio. The Firebase configuration is included in `src/services/firebase.ts`.

1.  Ensure you have a Firebase project set up with Firestore and Authentication enabled.
2.  Replace the `firebaseConfig` object in `src/services/firebase.ts` with your own project's configuration.
3.  The application uses `esbuild` or a similar bundler that supports JSX and TypeScript. In a standard setup, you would run:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
