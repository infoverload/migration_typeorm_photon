import "reflect-metadata";
import {createConnection} from "typeorm";
import {Request, Response} from "express";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Post} from "./entity/Post";

// connection settings are in the "ormconfig.json" file
createConnection().then(connection => {

    const postRepository = connection.getRepository(Post);

    // create and setup express app
    const app = express();
    app.use(bodyParser.json());

    // register routes
    app.get("/posts", async function(req: Request, res: Response) {
        const posts = await postRepository.find();
        res.send(posts);
    });

    app.get("/posts/:category", async function(req: Request, res: Response) {
        const posts = await postRepository.findOne({ 
            where: { categories: req.params.category } 
        });
        return res.send(posts);
    });

    app.get("/posts/:id", async function(req: Request, res: Response) {
        // load a post by a given post id
        const post = await postRepository.findOne(req.params.id);

        // if post was not found return 404 to the client
        if (!post) {
            res.status(404);
            res.end();
            return;
        }
        return res.send(post);
    });

    app.post("/posts", async function(req: Request, res: Response) {
        const newPost = await postRepository.create(req.body);
        await postRepository.save(newPost);
        return res.send(newPost);
    });

    app.put("/posts/:id", async function(req: Request, res: Response) {
        // load a post by a given post id
        const post = await postRepository.findOne(req.params.id);

        // if post was not found return 404 to the client
        if (!post) {
            res.status(404);
            res.end();
            return;
        }

        await postRepository.merge(post, req.body);
        const result = await postRepository.save(post);
        return res.send(result);
    });

    app.delete("/posts/:id", async function(req: Request, res: Response) {
        // find the post and remove it
        const result = await postRepository.delete(req.params.id);
        return res.send(result);
    });
    
    // start Express server
    app.listen(3000);
    console.log("Express application is up and running on port 3000");

}).catch(error => console.log("Error: ", error));
