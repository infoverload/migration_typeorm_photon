import {postGetAllAction} from "./controller/PostGetAllAction";
import {postGetByIdAction} from "./controller/PostGetByIdAction";
import {postSaveAction} from "./controller/PostSaveAction";

/**
 * All application routes.
 */
export const AppRoutes = [
    {
        path: "/posts",
        method: "get",
        action: postGetAllAction
    },
    {
        path: "/posts/:category",
        method: "get",
        action: postFilterAction
    },
    {
        path: "/posts/:id",
        method: "get",
        action: postGetByIdAction
    },
    {
        path: "/posts",
        method: "post",
        action: postSaveAction
    },
    {
        path: "/posts/:id",
        method: "put",
        action: postUpdateAction
    },
    {
        path: "/posts/:id",
        method: "delete",
        action: postDeleteAction
    }
];


