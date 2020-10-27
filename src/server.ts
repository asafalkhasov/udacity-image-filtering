import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';
export function requireAuth(req: Request, res: Response, next: NextFunction){
    if(!req.headers || !req.headers.authorization){
        return res.status(401).send({message: "Authorization header required"});
    }
    const basicAuth = req.headers.authorization.split(" ");
    if(basicAuth.length != 2){
        return res.status(401).send({message: "Invalid token"});
    }
    const authToken = basicAuth[1];
    //Decode the token using base64 and split using :
    const decodedToken = Buffer.from(authToken, "base64").toString().split(":");
    if(decodedToken.length != 2){
        return res.status(401).send({message: "Invalid token"});
    }
    const [username, password] = decodedToken;
    if(username != "test" || password != "pass"){
        return res.status(401).send({message: "Invalid credentials"});
    }
    return next();
};

(async () => {

    // Init the Express application
    const app = express();

    // Set the network port
    const port = process.env.PORT || 8082;

    // Use the body parser middleware for post requests
    app.use(bodyParser.json());

    // TODO COMPLETED
    app.get("/filteredimage", requireAuth, async (req: Request, res: Response) => {
        const image_url = req.query.image_url as string;
        if (image_url == "") {
            res.status(400).send("image_url is required");
            return;
        }
        const filteredImage = await filterImageFromURL(image_url);
        res.status(200).sendFile(filteredImage, () => {
            //Delete the file
            deleteLocalFiles([filteredImage]);
        });
    });

    // Root Endpoint
    // Displays a simple message to the user
    app.get("/", async (req: Request, res: Response) => {
        res.send("try GET /filteredimage?image_url={{}}")
    });


    // Start the Server
    app.listen(port, () => {
        console.log(`server running http://localhost:${port}`);
        console.log(`press CTRL+C to stop server`);
    });
})();