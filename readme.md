# Clan: Manglar
# Email: jose3012757124@gmailcom

# SPA - Event Management

This project is a web application that allows users to register if they haven't already, by entering a username and form. Data is stored locally in the browser using `localStorage`. This section displays a section where you can view and register for events. If you are an administrator, you can create, delete, and edit courses as desired.

## Features

- Form with username and password fields.
- Data saving in `localStorage` (persistent across page reloads).
- Automatic display of saved data on page reload.
- Modern, responsive design with CSS.
- Register for different events.
- CRUD events

## Technologies used

- HTML5
- CSS
- JavaScript (DOM, localStorage, etc.)
- vite

## How to use
1. Initially, you must start the server with the following commands: **npm i json-server** , press Enter, then **json-server --watch db.json** should appear. Index:

http://localhost:3000/


Static files:

Serving ./public directory if it exists


Endpoints:

http://localhost:3000/usuarios

http://localhost:3000/eventos

http://localhost:3000/inscripciones

1. Open the program file with localhost.
2. Open the VS Code terminal and type this command: npm run dev.
3. You should see something similar to **http://localhost:5173/**, press the Ctl key, and right-click on it.
4. Register as a user or administrator.
5. Click **Register** to log in.
6. Once you log in as a visitor or administrator, you can use the program's features.

## Notes

- Data saved in `localStorage` persists after closing or reloading the page.

## Possible Improvements

- Integration with a real database.
- Data export in CSV or PDF.
- Color themes or dark mode.

---

Riwi project made with HTML, CSS, and JavaScript.