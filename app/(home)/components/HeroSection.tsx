import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>프로젝트 타이틀</h1>
      <p className={styles.subtitle}>
        해커톤 주제가 발표되면 이곳의 텍스트와 전역 색상을 변경하고 시작
        <br />
        {process.env.NEXT_PUBLIC_API_URL}
      </p>
      <button className="primary-button">서비스 시작하기</button>
    </section>
  );
}
