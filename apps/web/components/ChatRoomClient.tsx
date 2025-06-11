"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({
    messages,
    id
}:{
    id:string;
    messages:{messages:string}[];
}){

    const [chats , setChats] =useState(messages);
    const [currentMessages , setCurrentMessages] = useState("");
    //@ts-ignore
    const [socket , loading] = useSocket();

    useEffect(() => {
        if(socket && !loading){

            socket.send(JSON.stringify({
                type: "join_room",
                roomId: id

            }))
            socket.onmessage = (event:any) => {
                const parsedData = JSON.parse(event.data);

                if(parsedData.type === "chat"){
                    setChats( c => [...c, {messages:parsedData.messages}]);

                }
            }
        }

    },[socket , loading , id])


    return <div>
        {messages.map(m => <div>{m.messages}</div>)}
        <input type="text" value={currentMessages} onChange={e => {
            setCurrentMessages(e.target.value);
        }}></input>
        <button onClick={() => {
            socket?.send(JSON.stringify({
                type: "chat",
                roomId: id,
                messages: currentMessages
            }))

            setCurrentMessages("");
        }}>Send Message</button>
    </div>
}