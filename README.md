# full-stack-blog-application

A film club listings site built for The Park Tavern, Macclesfield — showcasing upcoming free screenings, organised into categories, with a curator login for managing the programme.

## Deployment

This app is deployed on [Render](https://render.com/)

- **Live site:** [https://full-stack-blog-application-4szt.onrender.com](https://full-stack-blog-application-4szt.onrender.com)
- **GitHub repository:** https://github.com/JudithKnight123/full-stack-blog-application
- **Render Video:** https://drive.google.com/file/d/1bfFJ5iim4rL8zo5FAul_VqoO-jxNjlR8/view?usp=sharing

## Features

- Curator registration, login, and logout (JWT-based authentication)
- Full CRUD for film listings — add, edit, and delete screenings
- Full CRUD for categories — add, edit, and delete the strands films are grouped under (e.g."Thursdays: Independent & World Cinema")
- Filter the homepage by category
- Content is fetched from the backend API and rendered dynamically — nothing on the page is hardcoded

## Technologies Used

- **Backend:** Node.js, Express
- **Database:** MySQL, accessed via Sequelize ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Frontend:** Vanilla HTML, CSS, and JavaScript (no framework) — communicates with the backend via `fetch` calls to the REST API

## Getting Started (Local Setup)

1. **Clone the repository**

   ```bash
   git clone https://github.com/JudithKnight123/full-stack-blog-application.git
   cd full-stack-blog-application
   ```

2. **Create a `.env` file** in the project root with the following variables:

   ```
   DB_DATABASE=posts_db
   DB_USERNAME=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_DIALECT=mysql
   DB_PORT=3306
   ```

3. **Create the MySQL database**

   ```bash
   mysql -u root -p
   ```

   ```sql
   CREATE DATABASE posts_db;
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Build the database tables**

   ```bash
   npm run rebuild
   ```

   Stop this once it's finished (Ctrl+C) — it only needs to run once, or again later if the data models change.

6. **(Optional) Seed the database with test data**

   ```bash
   npm run seed
   ```

7. **Run the application**

   ```bash
   npm start
   ```

8. **Visit the app in your browser**

   ```
   http://localhost:3001
   ```

## Usage

- Click **Curator** to register a new account or log in.
- Once logged in, use **+ Add film** to create a new screening, or the Edit/Delete buttons on any film card to manage existing ones.
- Use **Manage categories** to add, edit, or delete the categories films are grouped under.
- Click a category tab to filter the homepage to just that category, or **All screenings** to clear the filter.

## Project Structure

```
├── config/          # Database connection setup
├── models/          # Sequelize models (Post, Category, User)
├── routes/          # Express route handlers (REST API endpoints)
├── public/          # Frontend — HTML, CSS, and JavaScript
├── seeds/           # Optional seed data for local testing
└── server.js        # App entry point
```
