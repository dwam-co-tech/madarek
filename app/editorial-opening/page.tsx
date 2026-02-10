"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const issueId = searchParams.get("issueId") ||
      (typeof window !== "undefined" ? localStorage.getItem("selectedIssueId") : null);

    const targetUrl = issueId
      ? `/section/editorial-opening?issueId=${issueId}`
      : "/section/editorial-opening";

    router.replace(targetUrl);
  }, [router, searchParams]);

  return (
    <div style={{
      display: "grid",
      placeItems: "center",
      minHeight: "100vh",
      background: "var(--beige-100)",
      color: "var(--brown-800)"
    }}>
      جاري التحويل...
    </div>
  );
}

export default function EditorialOpeningRedirect() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <RedirectContent />
    </Suspense>
  );
}
