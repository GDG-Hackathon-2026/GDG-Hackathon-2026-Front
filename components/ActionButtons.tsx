"use client";

import { Copy, Download, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./ActionButtons.module.css";

interface ActionButtonsProps {
  content: string;
}

export default function ActionButtons({ content }: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("클립보드에 복사되었습니다.");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("복사에 실패했습니다.");
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "ai-response.txt";
    document.body.appendChild(element);
    element.click();
    toast.success("파일 다운로드가 시작되었습니다.");
  };

  return (
    <div className={styles.actionGroup}>
      <button className={styles.actionBtn} onClick={handleCopy}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "복사됨" : "복사"}
      </button>
      <button className={styles.actionBtn} onClick={handleDownload}>
        <Download size={14} />
        내보내기
      </button>
    </div>
  );
}
