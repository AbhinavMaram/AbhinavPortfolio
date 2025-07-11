# Abhinav - Personal Portfolio

## Table of Contents

  * [About the Project](#about-the-project)
  * [Features](#features)
  * [Technologies Used](#technologies-used)
  * [Setup and Installation](#setup-and-installation)
      * [Frontend](#frontend)
      * [Backend (Contact Form)](#backend-contact-form)
  * [Usage](#usage)
  * [Deployment](#deployment)
  * [Contact](#contact)

## About the Project

This is my personal portfolio website, a Full Stack Developer specializing in C#, .NET, Angular, React, and Azure. The site serves as a comprehensive showcase of my professional experience, skills, and projects, providing an interactive platform for potential employers and collaborators to learn more about my work and capabilities.

## Features

  * **Responsive Design**: Optimized for seamless viewing across various devices, from desktops to mobile phones.
  * **Dynamic Sections**: Dedicated sections for:
      * **About Me**: An introduction to my professional background.
      * **Experience**: Details of my work history.
      * **Education**: Information on my academic qualifications.
      * **Skills**: A categorized overview of my technical proficiencies in Backend Development, Frontend Development, and Cloud & DevOps.
      * **Projects**: Showcasing key projects like a "Personal Finance Tracker" and "Campus Resource Booking System".
      * **Contact**: A form for easy communication.
  * **Interactive UI**:
      * Smooth scroll navigation for easy access to different sections.
      * Fade-in and "pop-up" animations for content sections and individual cards on scroll.
      * Hover effects on project, skill, and education cards for an enhanced user experience.
      * Toggleable Dark Mode for user preference.
  * **Contact Form**: Functional contact form powered by an Azure Function backend.
  * **Resume Download**: Direct link to download my professional resume.

## Technologies Used

This project is built using a modern web stack, featuring:

**Frontend:**

  * **HTML5**: Structure of the web pages.
  * **Tailwind CSS**: A utility-first CSS framework for rapid and responsive styling.
  * **JavaScript**: For interactive elements, scroll animations (Intersection Observer), dark mode toggle, and mobile navigation.
  * **Custom CSS**: For specific styling and animations.

**Backend (for Contact Form):**

  * **.NET (C#)**: Used for the Azure Function responsible for handling contact form submissions.
  * **Azure Functions**: Serverless computing platform for the contact form API.
  * **SendGrid**: Used for sending emails from the contact form.

## Setup and Installation

To run this project locally, follow these steps:

### Frontend

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AbhinavMaram/AbhinavPortfolio.git
    cd AbhinavPortfolio/frontend
    ```
2.  **Install dependencies (if any, typically for Tailwind CSS JIT/CLI):**
    ```bash
    npm install
    # or yarn install
    ```
3.  **Build/Watch Tailwind CSS:**
    ```bash
    # For development (watches for changes)
    npm run watch
    # For production build
    npm run build
    ```
4.  **Open `index.html`:** Simply open the `index.html` file in your web browser.

### Backend (Contact Form)

The backend is an Azure Function. To set it up locally or deploy:

1.  **Navigate to the backend directory:**
    ```bash
    cd ../backend/ContactFunction
    ```
2.  **Ensure .NET SDK is installed.**
3.  **Restore dependencies:**
    ```bash
    dotnet restore
    ```
4.  **Run locally (requires Azure Functions Core Tools):**
    ```bash
    func start
    ```
5.  **Configure Environment Variables**: The Azure Function will likely require environment variables for SendGrid API keys or other secrets. These should be set up in `local.settings.json` for local development and in the Azure Function App's configuration settings for deployment.

## Usage

Navigate through the site using the top navigation bar. On mobile, use the hamburger menu to access navigation links. Scroll down to view different sections, and hover over cards in the Skills, Projects, and Education sections for interactive effects. Use the "Get In Touch" button or the contact form to send a message.

## Deployment

This portfolio is deployed as an [Azure Static Web App](https://www.google.com/search?q=https://azure.microsoft.com/en-us/products/app-service/static-web-apps/). The continuous integration/continuous deployment (CI/CD) pipeline is configured via GitHub Actions. Any push to the `main` branch will trigger a build and deploy the latest changes to Azure.

## Contact

Feel free to reach out with any questions or collaboration opportunities\! You can use the contact form on the website or connect with me via:

  * **Email:** maramabhi2309@outlook.com
  * **LinkedIn:** https://www.linkedin.com/in/abhinav-reddy-452a34364/

-----
