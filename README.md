# Migrating from TypeORM to Photon.js

This is a basic implementation of an Express application that uses [Photon JS](https://photonjs.prisma.io) for database access.

## How to use

### 1. Download files & install dependencies

Clone the repository:

```sh
git clone git@github.com:infoverload/migration_typeorm_photon.git
```

Install Node dependencies:

```sh
cd migration_typeorm_photon
npm install
```

### 2. Install the Prisma 2 CLI

To run the example, you need the [Prisma 2 CLI](https://github.com/prisma/prisma2/blob/master/docs/prisma-2-cli.md):

```sh
npm install -g prisma2
```

### 3. Set up database

This project uses [PostgreSQL](https://www.postgresql.org) as a database.

Set up your database and make sure the service is running.

Go to `prisma/schema.prisma` and put in your PostgreSQL credentials, the database name, and the name of the schema file.


### 4. Run the project

```sh
npm run start
```