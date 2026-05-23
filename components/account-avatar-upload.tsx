'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type AccountAvatarUploadProps = {
  avatarUrl: string | null;
  fallback: string;
};

export default function AccountAvatarUpload({ avatarUrl, fallback }: AccountAvatarUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  function clearInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.type = "text";
      inputRef.current.type = "file";
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setIsWorking(true);
    setStatus(null);

    try {
      const response = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setStatus(data?.error || "Could not upload profile picture.");
        return;
      }

      clearInput();
      setStatus("Profile picture updated.");
      router.refresh();
      window.setTimeout(() => setStatus(null), 3000);
    } finally {
      setIsWorking(false);
    }
  }

  async function deleteAvatar() {
    setIsWorking(true);
    setStatus(null);

    try {
      const response = await fetch("/api/account/avatar/delete", {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setStatus(data?.error || "Could not delete profile picture.");
        return;
      }

      clearInput();
      setStatus("Profile picture deleted.");
      router.refresh();
      window.setTimeout(() => setStatus(null), 3000);
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
      {status ? (
        <div className="mb-4 rounded-2xl border border-[#C7D2FE] bg-[#EEF2FF] px-4 py-3 text-sm font-black text-[#4F46E5]">
          {status}
        </div>
      ) : null}

      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#EEF2FF] text-3xl font-black text-[#4F46E5] shadow-sm">
        {avatarUrl ? <Image src={avatarUrl} alt="" width={128} height={128} className="h-full w-full object-cover" /> : fallback}
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label className="block">
          <span className="text-sm font-black">Profile picture</span>
          <input ref={inputRef} name="avatar" type="file" accept="image/*" className="mt-2 block w-full text-sm font-semibold text-[#475569] file:mr-3 file:rounded-xl file:border-0 file:bg-[#EEF2FF] file:px-4 file:py-2 file:text-sm file:font-black file:text-[#4F46E5]" />
        </label>

        <button type="submit" disabled={isWorking} className="h-11 w-full rounded-2xl bg-[#4F46E5] px-5 text-sm font-black !text-white hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60 disabled:!text-white">
          {isWorking ? "Working..." : "Upload picture"}
        </button>

        {avatarUrl ? (
          <button type="button" disabled={isWorking} onClick={deleteAvatar} className="h-11 w-full rounded-2xl border border-[#CBD5E1] bg-white px-5 text-sm font-black text-[#4F46E5] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60 hover:bg-[#F5F3FF]">
            Delete picture
          </button>
        ) : null}
      </form>
    </div>
  );
}
