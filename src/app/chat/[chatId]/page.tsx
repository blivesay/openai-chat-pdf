import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import React from "react";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import ChatComponent from "@/components/ChatComponent";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/");
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
  const isPro = await checkSubscription();

  return (
    <div className="flex h-screen">
      <div className="flex w-full h-full overflow-auto">
        {/* sidebar */}
        <div className="flex-initial w-1/6 max-w-xs h-full">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} isPro={isPro} />
        </div>

        {/* pdf viewer */}
        <div className="flex-initial w-3/6 max-h-screen p-4">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
        </div>

        {/* chatbox */}
        <div className="flex-initial w-2/6 border-l-4 border-l-slate-200">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
