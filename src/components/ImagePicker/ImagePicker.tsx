import styles from './ImagePicker.module.css';
import homeStyles from '../../../styles/Home.module.css';
import { useState } from 'react';

export default function ImagePicker({
  imagesUploadedRef,
}: {
  imagesUploadedRef: React.MutableRefObject<File[]>;
}) {
  const [imagesUploaded, setImagesUploaded] = useState<File[]>(
    imagesUploadedRef.current
  );

  const onDelete = (index: number) => {
    setImagesUploaded((prev) => {
      const newUploads = [...prev];
      newUploads.splice(index, 1);
      imagesUploadedRef.current = newUploads;
      return newUploads;
    });
  };

  const onAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = [];
    if (!e.target.files) return;
    for (let i = 0; i < e.target.files.length; i++) {
      files.push(e.target.files[i]);
    }
    setImagesUploaded((prev) => {
      imagesUploadedRef.current = [...prev, ...files];
      return [...prev, ...files];
    });
  };

  return (
    <>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={onAddImages}
        className={homeStyles.input}
      />
      <div className={homeStyles.grid}>
        {imagesUploaded.map((image, index) => (
          <div key={image.name + index} onClick={onDelete.bind(null, index)}>
            <img
              src={URL.createObjectURL(image)}
              className={styles.uploaded_image}
            />
          </div>
        ))}
      </div>
    </>
  );
}
