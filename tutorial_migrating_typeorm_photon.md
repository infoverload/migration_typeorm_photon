# Tutorial: Migrating from TypeORM to Photon

[TypeORM](https://typeorm.io/) and [Photon](https://photonjs.prisma.io/) both act as an abstraction layer between your application and your data source but also have different characteristics. In this tutorial, we will contrast and compare these two APIs and walk through how to migrate from a TypeORM project to a Photon one.

| TypeORM                         | Photon                              |
|---------------------------------|-------------------------------------|
|- a popular ORM library          |- an auto-generated database client  | 
|- supports Active Record and     |- supports Data Mapper patterns      |
|  Data Mapper patterns           |                                     | 
|- JavaScript, TypeScript         |- JavaScript, TypeScript, Go (soon)  |
|- supports MySQL, MariaDB,       |- supports MySQL, Postgres, with     |
|  Postgres, SQLite, Oracle,      |  to come                            |
|  Microsoft SQL Server, sql.js   |                                     |

[not sure if a Venn diagram would look nicer]

> **Note**: If you encounter any problems with this tutorial or any parts of Prisma 2, this is how you can get help: **create an issue on [GitHub](https://github.com/prisma/prisma2/issues)** or join the [`#prisma2-preview`](https://prisma.slack.com/messages/CKQTGR6T0/) channel on [Slack](https://slack.prisma.io/) to share your feedback directly. We also have a community forum on [Spectrum](https://spectrum.chat/prisma).

## Prerequisites
This tutorial assumes that you have some basic familiarity with:

- Typescript
- Node.js

You will use **TypeScript** with a **PostgreSQL** database in this tutorial. You can set up your PostgreSQL database locally or use a hosting provider such as [Heroku](https://elements.heroku.com/addons) or [Digital Ocean](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-18-04).

Make sure that your database server is [running](https://tableplus.com/blog/2018/10/how-to-start-stop-restart-postgresql-server.html).

You will follow along with this code [repository](https://github.com/infoverload/migration_typeorm_photon), starting with the `typeorm` [branch](https://github.com/infoverload/migration_typeorm_photon/tree/typeorm) and ending with the `master` [branch](https://github.com/infoverload/migration_typeorm_photon/tree/master).


## 1. Introspect the existing database schema from the TypeORM project

Follow the [README](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/README.md) in the `typeorm` [branch](https://github.com/infoverload/migration_typeorm_photon/tree/typeorm) and get the project running against the PostgreSQL database. This sets up your PostgreSQL database and defines the schema as defined in the TypeORM [entities](https://typeorm.io/#/entities). 

Make sure that you have the [Prisma 2 CLI](https://github.com/prisma/prisma2/blob/master/docs/prisma2-cli.md) installed. The Prisma 2 CLI is available as the [`prisma2`](https://www.npmjs.com/package/prisma2) package on npm. You can install it as a global package on your machine with the following command:

```sh
npm install -g prisma2
```

Now you are ready to introspect the database from the TypeORM project.  Type the command:

```sh
prisma2 init db_introspect
```
This will initialize a new Prisma2 project name "db_introspect" and start the init flow:  

- Under "Languages for starter kits", select `Blank project `.
- Under "Supported databases", select `PostgreSQL`.
- Under "PostgreSQL database credentials", fill in your database credentials and "Connect".
- Under "Database options", select `Use existing PostgreSQL schema`.
- Under "Non-empty schemas", select the schema that you want to introspect.  For PostgreSQL, the default schema is named `public`. 
- Under "Prisma 2 tools", keep the default selections and hit "Confirm". 
- Under "Photon is available in these languages", select `TypeScript`.
- You can then choose to work with a "Demo script" or "Just the Prisma schema".  Choose the latter.  

> **Note**: We are always looking to improve the Prisma2 CLI init flow and welcome your input.  Join the [`#prisma2-preview`](https://prisma.slack.com/messages/CKQTGR6T0/) channel on [Slack](https://slack.prisma.io/) to share your feedback directly! 

The introspection process is now complete. Navigate to the project directory  and you will see: 

```
prisma
└── schema.prisma
```

The [Prisma schema file](https://github.com/prisma/prisma2/blob/master/docs/prisma-schema-file.md) is the main configuration file for your Prisma setup. 

- talk about the relations bug and point to limitations

- many to many relationships correctly don't work in data model
- workaround is to add an primary key id manually
- or don't use many to many relationships
- link to the current limitations page


- show this many to many relationships
- point to the current limitation and how to get around it


## Defining our data source

In the TypeORM project, the data source and credentials are defined in the `ormconfig.json` file:

```ts
{
  "name": "default",
  "type": "postgres",
  "host": "localhost",
  "port": 5432,
  "username": "user",
  "password": "password",
  "database": "database",
  "synchronize": true,
  "logging": true
}
```
In your Photon project, this will be automatically set in your `schema.prisma` file from the introspection process:

```ts
datasource db {
  provider = "postgresql"
  url      = "postgresql://user:password@localhost:5432/database?schema=public"
}
```

## Setting up a connection

In TypeORM, you create a connection like this: 

```ts
```

In Photon, you create a connection in the prisma.schema file:

```ts
```

## Creating data models

- highlight the different data modelling
    - TypeORM: 
        - Entity is a class that maps to a database table. You can create an entity by defining a new class and mark it with @Entity():
    - Photon: prisma.schema
    - how does each define a new database table, columns, fields, primary key, relations


## Working with models



## Querying our data source


## Working with relations