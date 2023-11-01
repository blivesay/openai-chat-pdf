import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs";
import Link from "next/link";
import { LogIn } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { checkSubscription } from "@/lib/subscription";
import SubscriptionButton from "@/components/SubscriptionButton";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  const isPro = await checkSubscription();

  let lastChat = null;
  if (userId) {
    lastChat = await db.select().from(chats).where(eq(chats.userId, userId));
    if (lastChat) {
      lastChat = lastChat.pop();
    }
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-orange-100 to-teal-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
          <div className="flex mt-2">
            {isAuth && lastChat && (
              <Link href={`/chat/${lastChat.id}`}>
                <Button className="text-white bg-slate-700" variant="outline">
                  Go to Chats
                </Button>
              </Link>
            )}
            <SubscriptionButton isPro={isPro} />
          </div>

          <p className="max-w-xl mt-1 text-lg text-slate-600">
            Join millions of students, researchers, and professionals to
            instantly answer questions and understand research, using AI.
          </p>
          <div className="w-full mt-4">
            {isAuth ? (
              <FileUpload />
            ) : (
              <Link href="/sign-in">
                <Button>
                  Login to get started
                  <LogIn className="w-5 ml-2 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
