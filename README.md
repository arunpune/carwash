# carwash
<p align="center">
  <a href="http://washworld.dk/" target="blank"><img src="./washworld-logo.svg" alt="WashWorld Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

# WashWorld API

Welcome to the WashWorld API repository! This API is designed to provide seamless integration between WashWorld's internal systems and external applications. It offers a comprehensive set of endpoints for managing WashWorld's operations efficiently.

## Features

- **Integration**: Connect WashWorld's internal systems with external applications seamlessly.
- **Efficiency**: Streamline operations and automate tasks to enhance productivity.
- **Scalability**: Built on the NestJS framework, ensuring scalability and maintainability.
- **Security**: Implement secure authentication and access control measures to protect sensitive data.

## Setup

To set up this project locally, please follow these steps:

1. **Clone the repository to your local machine:**

   ```bash
   git clone https://github.com/arunpune/carwash.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd carwash
   ```
3. **Navigate to the backend directory:**

   ```bash
   cd washworld-backend
   ```
4. **Setup Postgres local server in your machine. eg: pgadmin**

5. **Create a .env file in the backend directory of the project with the following content:**

   ```env
   JWT_SECRET=<your-secret>
   DB_HOST=localhost
   DB_PORT=5432
   POSTGRES_USER=<your_postgres_username>
   POSTGRES_PASSWORD=<your_postgres_password>
   POSTGRES_DB=<your_database_name>
   NODE_ENV=development
   ```

   Replace `<your_postgres_username>`, `<your_postgres_password>`, `<your_database_name>` with your actual PostgreSQL credentials and `<your-secret>` with a secure secret.

   You can generate a secret by running the following command in your terminal:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
6. **Set up docker in your machine, eg: "Docker Desktop" if you are on windows**

7. **Start the PostgreSQL Docker container:**

   Ensure you have Docker and Docker Compose installed on your machine. Then, run the following command to start the PostgreSQL Docker container:

   ```bash
   docker-compose -p washworld-postgres up -d
   ```

   This command will start a Docker container with PostgreSQL using the settings defined in your `docker-compose.yml` file.

## Running Migrations & Seeds

To run migrations and set up your database schema, follow these steps:

1. **Install dependencies by running:**

   ```bash
   npm install
   ```

2. **Run the migrations:**

   ```bash
   npm run db:migrate
   ```

   This command will execute all pending migrations and apply changes to your database schema.

3. **Run the seeds:**

   ```bash
   npm run db:seed
   ```

   This command will insert the initial data needed for testing purposes as well as an admin user.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

WashWorld API is [MIT licensed](./LICENSE).




<p align="center">
  <a href="http://washworld.dk/" target="blank"><img src="./washworld-logo.svg" alt="WashWorld Logo" /></a>
</p>

# Washworld App - Expo/React-Native

WashWorld is a React Native application designed to simplify the process of booking car wash services. It allows users to schedule car washes in real-time and customize their service options through an intuitive mobile interface.

## Features

- **Real-Time Booking**: Schedule car washes instantly at your convenience.
- **Service Customization**: Choose from a variety of car wash options to meet your specific needs.
- **User-Friendly Interface**: Navigate the app with ease for a seamless user experience.


## Setup

To run this application locally, follow these steps:


2. **Navigate to the project directory:**

   ```bash
   cd washworld-mobile-app-main
   ```

3. **Create a .env file in the current directory of the project with the following content:**

   ```env
   HOST=<your_ip_address>
   ```

   Replace `<your_ip_address>` with your actual ip address found by running `ipconfig` or `ifconfig`.

4. **Install Dependencies:** Navigate to the project directory and install dependencies by running:

   ```bash
   npm install
   ```

5. **Run the Application:** Start the development server by running:

   ```bash
   npx expo start
   ```

6. **Run on iOS/Android:** Use Expo CLI or your preferred method to run the application on iOS or Android devices/emulators.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create your feature branch:

   ```bash
   git checkout -b feature/YourFeature
   ```

3. Commit your changes:

   ```bash
   git commit -am 'Add some feature'
   ```

4. Push to the branch:

   ```bash
   git push origin feature/YourFeature
   ```

5. Create a new Pull Request.

Please ensure your code adheres to the existing code style and conventions. Also, make sure to update the README with details of changes to the interface, including new environment variables, exposed ports, and useful file locations.

## License

This project is licensed under the MIT License.

## Acknowledgements

- This project was made possible thanks to the wonderful community and resources available for React Native development.
- Special thanks to contributors who have helped improve and maintain this project.

Feel free to reach out with any questions, feedback, or suggestions. Happy washes!

