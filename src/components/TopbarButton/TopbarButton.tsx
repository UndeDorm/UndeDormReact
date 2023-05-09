import React from 'react';
import styles from './TopbarButton.module.css';

interface TopbarButtonProps {
  title: string;
  onClick: () => void;
  disabled?: boolean;
}

const TopbarButton = ({
  title,
  onClick,
  disabled = false,
}: TopbarButtonProps) => {
  return (
    <button className={styles.button} onClick={onClick} disabled={disabled}>
      <p>{title}</p>
    </button>
  );
};

export default TopbarButton;
