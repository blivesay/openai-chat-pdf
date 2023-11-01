"use client";

import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { MessageCircle, PlusCircle } from "lucide-react";
import SubscriptionButton from "./SubscriptionButton";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

const ChatSideBar = ({ chats, chatId, isPro }: Props) => {
  return (
    <div className="w-full h-full p-4 text-gray-200 bg-gray-900">
      {/* new chat button  */}
      <Link href="/">
        <Button className="w-full border-dashed border-white border">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </Link>
      {/* chat list  */}
      <div className="flex max-h-screen overflow-auto pb-20 flex-col gap-2 mt-4">
        {/* map chats  */}
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn("rounded-lg p-3 text-slate-300 flex items-center", {
                "bg-blue-600 text-white": chat.id === chatId,
                "hover:text-white": chat.id !== chatId,
              })}
            >
              <MessageCircle className="mr-2" />
              <p className="w-full text-sm">{chat.pdfName}</p>
            </div>
          </Link>
        ))}
      </div>
      <div>
        <SubscriptionButton isPro={isPro} />
      </div>
    </div>
  );
};

export default ChatSideBar;
