"use client";
import styles from "./PageLoader.module.css";

export default function PageLoader({ message = "جاري التحميل..." }: { message?: string }) {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loaderContent}>
        <div className={styles.spinner}>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
        </div>
        <p className={styles.loaderText}>{message}</p>
      </div>
    </div>
  );
}
