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
    <div className="rounded-2xl border border-[#EDE9FE] bg-[#FBF9FF] p-5 shadow-[0_16px_44px_rgba(43,16,85,0.06)]">
      {status ? (
        <div className="mb-4 rounded-2xl border border-[#EDE9FE] bg-[#F5F3FF] px-4 py-3 text-sm font-black text-[#6D28D9]">
          {status}
        </div>
      ) : null}

      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#F5F3FF] text-3xl font-black text-[#6D28D9] shadow-[0_14px_34px_rgba(43,16,85,0.12)]">
        {avatarUrl ? <Image src={avatarUrl} alt="" width={128} height={128} className="h-full w-full object-cover" /> : fallback}
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label className="block">
          <span className="text-sm font-black">Profile picture</span>
          <input ref={inputRef} name="avatar" type="file" accept="image/*" className="mt-2 block w-full text-sm font-semibold text-[#62516F] file:mr-3 file:rounded-xl file:border-0 file:bg-[#F5F3FF] file:px-4 file:py-2 file:text-sm file:font-black file:text-[#6D28D9]" />
        </label>

        <button type="submit" disabled={isWorking} className="bd-btn bd-btn-primary h-11 w-full rounded-2xl px-5 text-sm font-black !text-white disabled:cursor-not-allowed disabled:opacity-60">
          {isWorking ? "Working..." : "Upload picture"}
        </button>

        {avatarUrl ? (
          <button type="button" disabled={isWorking} onClick={deleteAvatar} className="bd-btn bd-btn-secondary h-11 w-full rounded-2xl px-5 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60">
            Delete picture
          </button>
        ) : null}
      </form>
    </div>
  );
}
