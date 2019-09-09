# Tutorial: Migrating from TypeORM to Photon.js

[TypeORM](https://typeorm.io/) and [Photon.js](https://photonjs.prisma.io/) both act as an abstraction layer between your application and your database, but each works differently under the hood and provides different types of abstractions. While migrating an ORM to Photon.js may be an investment, the Prisma engine allows you to write more explicit, clear, and performant code in the long run.  In this tutorial, we will compare both approaches for working with databases and walk through how to migrate from a TypeORM project to a Photon.js one.

|                         |TypeORM                                                                        | Photon.js                          |
|-------------------------|-------------------------------------------------------------------------------|------------------------------------|
|classification           |- ORM library                                                                  |- an auto-generated database client | 
|supported design patterns|- Active Record, Data Mapper                                                   |- Data Mapper                       |
|language support         |- JavaScript, TypeScript                                                       |- JavaScript, TypeScript, Go (soon) |
|database support         |- MySQL, MariaDB, Postgres,<br>SQLite, Oracle, sql.js,<br>Microsoft SQL Server |- MySQL, Postgres, with more to come|

[not sure if a Venn diagram would look nicer]

> **Note**: If you encounter any problems with this tutorial or any parts of Prisma 2, this is how you can get help: **create an issue on [GitHub](https://github.com/prisma/prisma2/issues)** or join the [`#prisma2-preview`](https://prisma.slack.com/messages/CKQTGR6T0/) channel on [Slack](https://slack.prisma.io/) to share your feedback directly. We also have a community forum on [Spectrum](https://spectrum.chat/prisma).

## Goals

This tutorial will show you how to achieve the following in your Photon.js project:
1. [Obtaining the database schema from your database](#1-introspect-the-existing-database-schema-from-the-TypeORM-project)
2. [Defining the data source](#2-Defining-the-data-source)
3. [Installing and importing the library](#3-Installing-and-importing-the-library)
4. [Setting up a connection](#4-Setting-up-a-connection)
5. [Modelling data](#5-Creating-data-models)
6. [Working with models](#6-Working-with-models)
7. [Working with relations](#7-Working-with-relations)
8. [Querying the database](#8-Querying-the-database)
9. [Working with transactions](#9-Working-with-transactions)

## Prerequisites

This tutorial assumes that you have some basic familiarity with:

- TypeScript
- Node.js
- PostgreSQL

You will use **TypeScript** with a **PostgreSQL** database in this tutorial. You can set up your PostgreSQL database [locally](https://www.robinwieruch.de/postgres-sql-macos-setup) or use a hosting provider such as [Heroku](https://elements.heroku.com/addons) or [Digital Ocean](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-18-04).

- Make sure that your database server is [running](https://tableplus.com/blog/2018/10/how-to-start-stop-restart-postgresql-server.html)
- Know your database server credentials
- Have a database created for the tutorial 

You will be migrating a REST API built with the [Express](https://expressjs.com/) framework.  The example project can be found in this [repository](https://github.com/infoverload/migration_typeorm_photon). 

Clone the repository and navigate to it:

```sh
git clone https://github.com/infoverload/migration_typeorm_photon
cd migration_typeorm_photon
```

The TypeORM version of the project can be found in the [`typeorm`](https://github.com/infoverload/migration_typeorm_photon/tree/typeorm) branch.  To switch to the branch, type:

```sh
git checkout typeorm
```

The finished Photon.js version of the project is in the [`master`](https://github.com/infoverload/migration_typeorm_photon/tree/master) branch. To switch to this branch, type:

```sh
git checkout master
```

## 1. Introspecting the existing database schema from the TypeORM project

Follow the instructions in the [README file](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/README.md) in the [`typeorm`](https://github.com/infoverload/migration_typeorm_photon/tree/typeorm) branch and get the project running against your PostgreSQL database. This sets up your database and defines the schema as defined in the TypeORM [entities](https://github.com/infoverload/migration_typeorm_photon/tree/typeorm/src/entity) of the project.  

Make sure that you have the [Prisma 2 CLI](https://github.com/prisma/prisma2/blob/master/docs/prisma2-cli.md) installed. The Prisma 2 CLI is available as the [`prisma2`](https://www.npmjs.com/package/prisma2) package on npm. You can install it as a global package on your machine by typing the following command in your terminal:

```sh
npm install -g prisma2
```

Now you are ready to [introspect](https://github.com/prisma/prisma2/blob/master/docs/introspection.md) the database from the TypeORM project.  Navigate outside of the current project directory so you can start a new project. In your terminal, type the command:

```sh
prisma2 init photonjs_app
```
This will initialize a new Prisma project name "photonjs_app" and start the init process:  

1. Under "Languages for starter kits", select `Blank project `.
2. Under "Supported databases", select `PostgreSQL`.
3. Under "PostgreSQL database credentials", fill in your database credentials and "Connect".
4. Under "Database options", select `Use existing PostgreSQL schema`.
5. Under "Non-empty schemas", select the schema that you want to introspect.  For PostgreSQL, the default schema is named `public`. 
6. Under "Prisma 2 tools", keep the default selections and hit "Confirm". 
7. Under "Photon is available in these languages", select `TypeScript`.
8. You can then choose to work with a "Demo script" or "Just the Prisma schema".  Choose the latter.  

The introspection process is now complete.  You should see a message like:
```
 SUCCESS  The introspect directory was created!
 SUCCESS  Prisma is connected to your database at localhost
```

If you explore the project directory, you will see: 
```
prisma
└── schema.prisma
```

The [Prisma schema file](https://github.com/prisma/prisma2/blob/master/docs/prisma-schema-file.md) is the main configuration file for your Prisma setup.  It holds the specifications and credentials for your database, your data model definitions, and generators.  The migration process to Photon.js will all begin from this file. 

When introspecting a database, Prisma currently only recognizes many-to-many relations that follow the Prisma conventions for relation tables.  So when you introspected the existing database schema from the TypeORM project, you may encounter a bug specifying "Model PostCategoriesCategory does not have an id field" if you type `prisma2 dev`.  

This is a known [limitation](https://github.com/prisma/prisma2/blob/master/docs/limitations.md). A workaround is to add a primary key id in the `PostCategoriesCategory` model manually in the [schema.prisma](https://github.com/infoverload/migration_typeorm_photon/blob/master/prisma/schema.prisma#L28) file like this:

```ts
model PostCategoriesCategory {
  id         Int           @id
}
```

Now in your terminal, type:

```sh
prisma2 dev
```
This launches the [development mode](https://github.com/prisma/prisma2/blob/master/docs/development-mode.md) and creates a [Prisma Studio](https://github.com/prisma/studio) endpoint for you.  Go to the endpoint (i.e. http://localhost:5555 ) and explore the generated Prisma schema visually in your browser. 


## 2. Specifying the data source

In the TypeORM project example, the data source and credentials can be defined in the [`ormconfig.json`](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/ormconfig.json) file:

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
In your Photon.js project, this will be automatically generated in your [`schema.prisma`](https://github.com/infoverload/migration_typeorm_photon/blob/master/prisma/schema.prisma) file from the introspection process:

```ts
datasource db {
  provider = "postgresql"
  url      = "postgresql://user:password@localhost:5432/database?schema=public"
}
```

## 3. Installing and importing the library

TypeORM is installed as a [node nodule](https://www.npmjs.com/package/typeorm) with `npm install`, whereas Photon.js is generated by the Prisma engine and provides a type-safe data access API for your data model.

Make sure you are in your `photonjs_app` project directory. Then, in your terminal, run: 

```sh
prisma2 generate
```

This parses the Prisma schema file to generate the right data source client code (from reading the `generator` definition): 

[schema.prisma](https://github.com/infoverload/migration_typeorm_photon/blob/master/prisma/schema.prisma)
```ts
generator photon {
  provider = "photonjs"
}
```
and generates a Photon.js client and a `photon` directory inside `node_modules/@generated`:

```
├── node_modules
│   └── @generated
│       └── photon
│           └── runtime
│               ├── index.d.ts
│               └── index.js
```

This is the default path but can be [customized](https://github.com/prisma/prisma2/blob/master/docs/photon/codegen-and-node-setup.md). It is best not to change the files in the generated directory because it will get overwritten.

Now you can import Photon.js in your project.  Create an `index.ts` file and import the library like this: 

```ts
import Photon from '@generated/photon'
```

## 4. Setting up a connection

In TypeORM, there are several ways to create a connection. The most simple and common way is to use `createConnection` and `createConnections` functions: 

[index.ts](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/src/index.ts)
```ts
import {createConnection} from "typeorm";

const connection: Connection = createConnection();

```

To achieve this in your Photon.js project, in your `index.ts` file, create a connection to your database by importing `Photon` and creating a new instance of it like this:

```ts
import Photon from '@generated/photon'

const photon = new Photon()
```
Now you can start using the `photon` instance and interact with your database programmatically with the generated Photon API.


## 5. Creating data models

In TypeORM, data models are called "entities".  It is recommended to define one entity class per file (as "entity schemas" which you can import later). This is why, in the example project, there is a [Category.ts](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/src/entity/Category.ts) file for the `Category` entity and a [Post.ts](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/src/entity/Post.ts) file for the `Post` entity.  TypeORM allows you to use your classes as database models and provides a declarative way to define what part of your model will become part of your database table. Entity is a class that maps to a database table. You can create an entity by defining a new class and mark it with `@Entity()`.  Each entity must have at least one primary column (`@PrimaryGeneratedColumn()`). Each entity class property you marked with `@Column` will be mapped to a database table column.  

In our sample TypeORM project:

[Category.ts](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/src/entity/Category.ts)
```ts
import {Entity} from "typeorm";

@Entity()
export class Category {

  @PrimaryGeneratedColumn()
    id: number;

  @Column()
  name: string;
}
```

[Post.ts](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/src/entity/Post.ts)
```ts
import {Entity} from "typeorm";

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

The data models above will be auto-generated from the introspection process in your Photon.js project. These model definitions are located in the Prisma schema.  Models represent the entities of your application domain, define the underlying database schema, and is the foundation for the auto-generated CRUD operations of the database client.

Take a look at your generated Prisma schema file ([example here](https://github.com/infoverload/migration_typeorm_photon/blob/master/prisma/schema.prisma)).  The `Category` and `Post` entities from the TypeORM project is translated to `Category` and `Post` models:

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

`Category` and `Post` are mapped to database tables. The fields are mapped to columns of the tables. Note that there is a many-to-many relation between `Category` and `Post` via the `PostCategoriesCategory` composite table and the `@id` directive indicates that this field is used as the _primary key_. 

If you change your datamodel, you can regenerate your Prisma client and all typings will be updated.

[Show the underlying SQL query]


## 6. Working with models

With TypeORM there are several ways to work with your data model. In this example, [`Repository`](https://typeorm.io/#/working-with-repository) is used as a collection of all operations for a concrete entity (in this case, `Post`).    

In the sample project, you first access a `Post` repository via the `getRepository` method so that you can perform operations against it.  Then, in your Express application route for the `/posts` endpoint, use the Post Repository's `find()` method to fetch all the posts from the database and send the result back. 

[index.ts](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/src/index.ts)
```ts
import "reflect-metadata";
import {createConnection} from "typeorm";
import {Request, Response} from "express";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Post} from "./entity/Post";

// connection settings are in the "ormconfig.json" file
createConnection().then(connection => {

    const postRepository = connection.getRepository(Post);

    app.get("/posts", async function(req: Request, res: Response) {
        const posts = await postRepository.find();
        res.send(posts);
    });

    // start Express server
    app.listen(3000);
    console.log("Express application is up and running on port 3000");

}).catch(error => console.log("Error: ", error));
```

//if you want to load an existing entity from the database and replace some of its properties you can use the following method:


To implement the same route and endpoint in your Photon.js project, go to your `index.ts` file, and in the `/posts` endpoint, fetch all the posts from the database with [`findMany`](https://github.com/prisma/prisma2/blob/master/docs/photon/api.md#findMany), a method exposed for the `Post` model with the generated Photon API.  Then send the results back.  Note that all of these methods are asynchronous and use callbacks so we can `await` the results of the operation.

```ts
import * as express from 'express'
import * as bodyParser from 'body-parser'
import Photon from '@generated/photon'

const app = express()
app.use(bodyParser.json())

const photon = new Photon()

app.get('/posts', async (req, res) => {
    const posts = await photon.posts.findMany()
    res.send(posts)
})

app.listen(3000, () =>
  console.log('Server is running on http://localhost:3000'),
)
```

<!-- Now let's implement the next route, which gets passed a call object and has the `id` parameter as a property, and a callback to which we can pass our returned post, filtered by the `id`, from Photon's `findOne` method for the `Post` model, with a null first parameter to indicate that there is no error:

```ts
const getPost = async(call: any, callback: any) => {
  const { id } = call.request
  const post = await photon.posts.findOne({
    where: {
      id,
    },
  })
  callback(null, { post })
} -->


## 7. Working with relations

https://typeorm.io/#/relations

- how does each one handle eager and lazy loading?
- TypeORM QueryBuilder vs Photon Filtering API
    - not really similar to ORMs and not comparable
- emphasize auto-generated db client!!
- abstraction that photon provides is even higher than query builder
- querybuilder is a thin abstraction and you still need to understand sql inorder to apply it
- photonjs abstracts sql so much you don't need to know it to be productive

eager loading in photon
- include, select


## 8. Querying the database
- translate db queries in TypeORM to Photon

https://typeorm.io/#/select-query-builder

- ACID 
    - what is it?
    - Photon does not support it but provides ways to achieve similar goals
- code examples (from this in TypeORM to this in Photon)
- example of transaction in TypeORM → translated to nested write in Photon API

https://github.com/prisma/prisma2/blob/transactions/docs/transactions.md


## 9. Working with transactions

- https://typeorm.io/#/transactions
- https://github.com/prisma/prisma2/blob/transactions/docs/transactions.md

## Summary
- what have you achieved?
- where can you look for further resources?
- links
