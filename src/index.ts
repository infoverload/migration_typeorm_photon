import "reflect-metadata";
import {createConnection} from "typeorm";
import {Post} from "./entity/Post";
import {Category} from "./entity/Category";

// connection settings are in the "ormconfig.json" file
createConnection().then(async connection => {

    const category1 = new Category();
    category1.name = "TypeScript";
    await connection.manager.save(category1);

    const category2 = new Category();
    category2.name = "Programming";
    await connection.manager.save(category2);

    const post = new Post();
    post.title = "Migrate from TypeORM to PhotonJS";
    post.text = `It is easy to migrate from TypeORM to PhotonJS!`;
    post.categories = [category1, category2];

    await connection.manager.save(post);

    console.log("Post has been saved: ", post);

}).catch(error => console.log("Error: ", error));
