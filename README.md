# Task Scheduler

Task Scheduler is a powerful and flexible application designed to help you manage your recurring tasks and reminders with ease. It features a user-friendly interface, robust backend, and a variety of features to keep you organized and on track.

## Features

-   **Task Management:** Create, edit, delete, and mark tasks as complete.
-   **Recurring Tasks:** Set up tasks to repeat daily, weekly, or monthly.
-   **Reminders:** Get notified before your tasks are due.
-   **Calendar View:** Visualize your tasks in a calendar format.
-   **Lunar Calendar:** View and interact with dates in both Gregorian and lunar formats.
-   **User Authentication:** Secure user registration and login system.
-   **Admin Panel:** A comprehensive dashboard for administrators to manage users, tasks, and application settings.
-   **Email Notifications:** Receive email reminders for your tasks and verify your email address.
-   **Multi-language Support:** Available in English, Vietnamese, and Chinese.

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [Shadcn UI](https://ui.shadcn.com/)
-   **Database:** [MySQL](https://www.mysql.com/)
-   **Authentication:** [JWT](https://jwt.io/)
-   **Email:** [Nodemailer](https://nodemailer.com/)
-   **Package Manager:** [npm](https://www.npmjs.com/)

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18 or higher)
-   [npm](https://www.npmjs.com/) (comes with Node.js)
-   A running [MySQL](https://www.mysql.com/) instance

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://your-repository-url.git
    cd task-scheduler
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Environment Configuration

Create a `.env.local` file in the root of the project and add the following environment variables. Replace the placeholder values with your actual credentials.

```
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database credentials
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_DATABASE=your_database_name

# Admin credentials for the application
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password

# SMTP credentials for sending emails
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password

# Domain for email links
DOMAIN=your_domain.com
```

### Database Initialization

Run the following command to create the necessary tables in your database:

```bash
node scripts/init-database.js
```

This script will also create a default admin user and a sample user.

### Running the Application

-   **Development mode:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

-   **Production mode:**
    ```bash
    npm run build
    npm start
    ```

## Usage

-   **User:** Register a new account or log in with an existing one to start managing your tasks.
-   **Admin:** Access the admin panel at `/admin` and log in with the admin credentials you set in the `.env.local` file.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.