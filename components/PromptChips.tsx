import styles from "./PromptChips.module.css";

interface PromptChipsProps {
  onChipClick: (text: string) => void;
}

const RECOMMENDATIONS = [
  "✨ 이력서 핵심 역량 요약하기",
  "💡 해커톤 아이디어 브레인스토밍",
  "🔥 기술 면접 예상 질문 5가지",
  "📝 코드 리뷰 및 리팩토링 제안",
];

export default function PromptChips({ onChipClick }: PromptChipsProps) {
  return (
    <div className={styles.chipContainer}>
      {RECOMMENDATIONS.map((text) => (
        <button
          key={text}
          className={styles.chip}
          onClick={() => onChipClick(text)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
