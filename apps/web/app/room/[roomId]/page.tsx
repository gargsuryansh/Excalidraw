import axios from"axios";

async function getRoom(slug: string) {
  const response = await axios.get(`${process.env.BACKEND_URL}/room/${slug}`);
  return response.data.id;
}

export default async function ChatRoom({
    params
}:{
    params:{slug:string}
}
){
    const slug = await params.slug;
    const roomId = await getRoom(slug);
//@ts-ignore
    return <ChatRoom id={roomId}></ChatRoom>


}