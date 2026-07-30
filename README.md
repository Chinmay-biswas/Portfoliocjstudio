# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Coding Progress

Open **Admin -> GitHub**, **Codeforces**, or **LeetCode** and paste either a public username or a full profile URL for that platform. Each platform has its own public section, navigation link, content settings, and visibility/source control. Save the portfolio settings, then use **Refresh all live data** to populate the MongoDB cache immediately. The public portfolio refreshes stale data automatically using the shared configured interval.

Public profile data works without a key. To show GitHub's full contributions calendar instead of the public-events fallback, add `GITHUB_TOKEN` to the server environment. Keep that token in the server `.env` file only; it is never sent to the browser or stored in portfolio content.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
