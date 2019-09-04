import {Request, Response} from "express";
import {getManager} from "typeorm";
import {Post} from "../entity/Post";

/**
 * Deletes post by a given id.
 */
export async function postDeleteAction(request: Request, response: Response) {

    // get a post repository to perform operations with post
    const postRepository = getManager().getRepository(Post);

    // find the post and remove it
    const result = await postRepository.delete({ 
        where: { id: request.params.id } 
    });

    return response.send(result);
    
}
