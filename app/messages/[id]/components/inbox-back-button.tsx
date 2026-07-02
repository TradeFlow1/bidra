"use client";
import { useRouter } from "next/navigation";
export default function InboxBackButton() {
    const router = useRouter();
    return (<button type="button" onClick={() => {
            router.push("/messages");
            router.refresh();
        }}>
      Inbox
    </button>);
}
