import { useState } from "react";

export default function ImageUploader({ onChange, maxFiles = 3 }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFiles = (files) => {
    if (files.length > maxFiles) {
      alert(`Cannot upload more than ${maxFiles} images`);
      return;
    }
    setSelectedFiles(files);
    onChange(files);
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFiles([...e.target.files])}
      />
      {/* TODO: show thumbnails and size warnings */}
    </div>
  );
}
