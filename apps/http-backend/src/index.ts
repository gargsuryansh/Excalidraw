import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from "./middleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors())

app.post("/signup", async (req, res) => {

    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data?.username,
                // TODO: Hash the pw
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        })
        res.json({
            userId: user.id
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists with this username"
        })
    }
})

app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }

    // TODO: Compare the hashed pws here
    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
            password: parsedData.data.password
        }
    })

    if (!user) {
        res.status(403).json({
            message: "Not authorized"
        })
        return;
    }

    const token = jwt.sign({
        userId: user?.id
    }, JWT_SECRET);

    res.json({
        token
    })
})

app.post("/room", middleware, async (req, res) => {
   const parsedData = CreateUserSchema.safeParse(req.body);
   if (!parsedData.success){
    res.json({
        message: "Incorrect inputs"
    })
    return;
   }
   
   //@ts-ignore
   const userId = req.userId;

   try{const room = await prismaClient.room.create({
    data: {
        slug:parsedData.data.name,
        adminId: userId,

    }
   })
res.json({
    roomId: room.id
})
} 
catch(e){
    res.status(411).json({
        message: "Room already exists"
    })
}
})

app.get("/chats/roomId",async (req,res)=>{
try{
    // @ts-ignore
    const roomId = Number(req.params.roomId);
    const message = await prismaClient.chat.findMany({
        where:{
            roomId: roomId
        },
        orderBy:{
            id:"desc"
        },
        take:1000
    });

    res.json({
        message
    })

}

catch(e){
    console.log(e);
    res.json({
        message: []
    })

}
})

app.get("/room/:slug", async (req , res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });

    res.json({
        room
    })
})
app.listen(3001);