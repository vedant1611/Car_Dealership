# DriveStock - Car Dealership Inventory System

Welcome to **DriveStock**, a modern, premium Car Dealership Inventory System. This full-stack application provides a seamless, robust, and beautiful interface for dealership administrators to manage their vehicle fleet, process purchases, and restock inventory efficiently.

## Project Overview

DriveStock is built using a modern, scalable tech stack, heavily emphasizing a strict **Test-Driven Development (TDD)** approach from inception to completion.

- **Backend:** Powered by **FastAPI** and **PostgreSQL**. The backend exposes a fast, asynchronous RESTful API with built-in validation, JWT-based authentication, and robust CRUD operations. 
- **Frontend:** A Single Page Application (SPA) built with **React**, **Vite**, and **Tailwind CSS**. It features a custom, premium minimalist UI ("glossy dark" inputs, clean white cards, tabbed interfaces) that feels incredibly snappy and responsive.
- **Methodology:** Every feature, from database schemas to React component rendering, was developed using Red-Green-Refactor cycles. The project boasts extensive automated test suites (using `pytest` for the backend and `vitest`/RTL for the frontend) ensuring enterprise-grade stability and zero regressions during UI overhauls.

## Screenshots

Below is a preview of the DriveStock aesthetic:

- **Screenshot 1**
  ![Screenshot 1](https://github.com/user-attachments/assets/2b5a9a70-5851-42de-9a2d-ca76a9a2735b)

- **Screenshot 2**
  ![Screenshot 2](https://github.com/user-attachments/assets/01db6dc3-8abf-4e5a-ace5-703d709c2ab7)

- **Screenshot 3**
  ![Screenshot 3](https://github.com/user-attachments/assets/5285e450-23f5-42ad-b65e-fd8b394680eb)

## Setup Instructions

The entire system is fully containerized using Docker, making local deployment simple and reproducible. 

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Car_Dealership
   ```

2. **Build and Start the Application**
   We use a multi-stage Docker build to spin up the PostgreSQL database, the FastAPI backend, and the Nginx-served frontend simultaneously.

   ```bash
   # Build the frontend and backend images
   docker-compose build frontend
   
   # Spin up the entire stack in detached mode
   docker-compose up -d
   ```

3. **Access the Application**
   - **Frontend UI:** Open your browser and navigate to `http://localhost:8080`.
   - **Backend API Docs:** Explore the interactive Swagger UI at `http://localhost:8000/docs`.

*(Note: Ensure you have Docker and docker-compose installed on your machine before running the above commands.)*

## My AI Usage

### Tools Used
- **Gemini:** Used for architectural brainstorming, complex Tailwind UI redesign, and debugging state logic.
- **Antigravity:** Used for automated code generation, TDD test writing, and direct repository commits.

### How they were used
AI was utilized as a dedicated pair-programming partner throughout this project. It helped generate initial boilerplate code and rapidly debug React modal state issues (specifically tracking down and resolving a disappearing VIN/Year bug). Furthermore, AI was instrumental in implementing a premium minimalist UI, translating visual reference mockups into pixel-perfect Tailwind CSS components. Throughout the entire process, the AI was guided to ensure strict adherence to the Red-Green-Refactor testing cycle, updating and fixing the Vitest suite alongside every DOM change.

### Reflection
Working alongside AI dramatically accelerated the development lifecycle. It handled the tedious scaffolding and rapid CSS prototyping, which allowed me to focus on high-level architecture and ensuring a flawless user experience. More importantly, using an AI pair-programmer did not mean sacrificing quality; it actually helped maintain exceptionally high test coverage and allowed for the rapid, fearless iteration of enterprise-grade features without risking regressions.
