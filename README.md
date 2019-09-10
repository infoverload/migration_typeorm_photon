# Migrating from TypeORM to Photon.js

This is a basic implementation of an Express application that uses [TypeORM](https://typeorm.io).

## How to use

### 1. Download files & install dependencies

Clone the repository:

```sh
git clone git@github.com:infoverload/migration_typeorm_photon.git
```

Make sure you are in the `typeorm` branch:

```sh
cd migration_typeorm_photon
git checkout typeorm
```

Install Node dependencies:

```sh
npm install
```

### 2. Set up database

This project uses [PostgreSQL](https://www.postgresql.org) as a database.

Set up your database and make sure the service is running.

Edit `ormconfig.json` and change your database configuration (you can also change a database type, but don't forget to install specific database drivers).


### 3. Run the project

```sh
npm run start
```
