import {Request, Response} from "express";
import {getManager} from "typeorm";
import {Post} from "../entity/Post";

/**
 * Filters posts by category.
 */
export async function postFilterAction(request: Request, response: Response) {

    // get a post repository to perform operations with post
    const postRepository = getManager().getRepository(Post);

    // load posts by given category
    const post = await postRepository.findOne({ 
        where: { categories: request.params.category } 
    });

    // return loaded post
    response.send(post);
}
