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

The introspection process is now complete.  

- talk about `prisma2 dev` briefly

Navigate to the project directory  and you will see: 

```
prisma
└── schema.prisma
```

The [Prisma schema file](https://github.com/prisma/prisma2/blob/master/docs/prisma-schema-file.md) is the main configuration file for your Prisma setup.  It holds the specifications and credentials for our data source, our data model definitions, and generators.  The migration process to Photon will all begin from this file. 


## Defining our data source

In the TypeORM project, the data source and credentials are defined in the [`ormconfig.json`](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/ormconfig.json) file:

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
In your Photon project, this will be automatically set in your [`schema.prisma`](https://github.com/infoverload/migration_typeorm_photon/blob/master/prisma/schema.prisma) file from the introspection process:

```ts
datasource db {
  provider = "postgresql"
  url      = "postgresql://user:password@localhost:5432/database?schema=public"
}
```

## Installing and importing the library

TypeORM and Photon are both installed as node modules. When you run `prisma2 generate`, this will read the `generator` definition in your Prisma schema:

```ts
generator photon {
  provider = "photonjs"
}
```
and generate a Photon client. A `photon` directory is generated inside `node_modules/@generated`:

├── node_modules
│   └── @generated
│       └── photon
│           └── runtime
│               ├── index.d.ts
│               └── index.js

This is the default path but can be [customized](https://github.com/prisma/prisma2/blob/master/docs/photon/codegen-and-node-setup.md). It is best not to change the files in the generated directory because it will get overwritten.

Now we can import Photon in our code like this:

```ts
import Photon from '@generated/photon'
```

## Setting up a connection

In TypeORM, you create a connection like this: 

```ts
import {createConnection} from "typeorm";

createConnection().then(connection => {
    // application code goes here
}).catch(error => console.log("Error: ", error));
```

In Photon, you create a connection like this:

```ts
import Photon from '@generated/photon'

const photon = new Photon()
```
Now you can start using the `photon` instance and start interacting with your data source. 

## Creating data models

In TypeORM, data models are called `entities`.  It is recommended to define one entity class per file. TypeORM allows you to use your classes as database models and provides a declarative way to define what part of your model will become part of your database table. Entity is a class that maps to a database table. You can create an entity by defining a new class and mark it with @Entity(), like this:

```ts
import {Column, PrimaryGeneratedColumn, Entity} from "typeorm";

@Entity()
export class Category {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

}
```

```ts
import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Post {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column("text")
    text: string;

    @ManyToMany(type => Category, {
        cascade: true
    })
    @JoinTable()
    categories: Category[];
}
```

In our Photon project, these model definitions are located in the Prisma schema. 

Next, we define our [model definitions](https://github.com/prisma/prisma2/blob/master/docs/data-modeling.md). Models represent the entities of our application domain, define the underlying database schema, and is the foundation for the auto-generated CRUD operations of the database client.

Let's define a simple `User` and `Post` model to our schema file:

```ts
model Category {
  id                     Int                      @id
  name                   String
  postCategoriesCategory PostCategoriesCategory[]

  @@map("category")
}

model Post {
  id                     Int                      @id
  postCategoriesCategory PostCategoriesCategory[]
  text                   String
  title                  String

  @@map("post")
}

model PostCategoriesCategory {
  id         Int           @id
  categoryId Category
  postId     Post

  @@map("post_categories_category")
}
```

`Category` and `Post` will each be mapped to database tables. The fields will be mapped to columns of the tables. Note that there is a many-to-many relation between `Category` and `Post` via the `PostCategoriesCategory` composite table and the `@id` directive indicates that this field is used as the _primary key_. 

When introspecting a database, the Prisma 2 engine currently only recognizes many-to-many relations that follow the Prisma conventions for relation tables.  So when you [introspected](https://github.com/prisma/prisma2/blob/master/docs/introspection.md) the existing database schema from the TypeORM project, you will encounter a bug specifying "Model PostCategoriesCategory does not have an id field".  

This is a known [limitation](https://github.com/prisma/prisma2/blob/master/docs/limitations.md). A workaround is to add a primary key id in the `PostCategoriesCategory` model manually:

```ts
model PostCategoriesCategory {
  id         Int           @id
}

```

If you change your datamodel, you can just regenerate your Prisma client and all typings will be updated.

## Working with models


## Querying our data source
- translate db queries in TypeORM to Photon
- ACID 
    - what is it?
    - Photon does not support it but provides ways to achieve similar goals
- code examples (from this in TypeORM to this in Photon)
- example of transaction in TypeORM → translated to nested write in Photon API

## Working with relations
- how does each one handle eager and lazy loading?
- TypeORM QueryBuilder vs Photon Filtering API
    - not really similar to ORMs and not comparable
- emphasize auto-generated db client!!
- abstraction that photon provides is even higher than query builder
- querybuilder is a thin abstraction and you still need to understand sql inorder to apply it
- photonjs abstracts sql so much you don't need to know it to be productive

eager loading in photon
- include, select

## Summary
- what have we achieved?
- where can you look for further resources?
- links