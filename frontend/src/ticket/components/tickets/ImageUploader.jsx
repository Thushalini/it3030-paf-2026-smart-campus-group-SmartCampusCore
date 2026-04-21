import { useState } from "react";
import "./ImageUploader.css";

export default function ImageUploader({ onChange, maxFiles = 3 }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    if (fileArray.length > maxFiles) {
      alert(`Cannot upload more than ${maxFiles} images`);
      return;
    }

    // Generate previews
    const newPreviews = fileArray.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setSelectedFiles(fileArray);
    setPreviews(newPreviews);
    onChange(fileArray);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onChange(newFiles);
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFiles([...e.target.files])}
      />

      {previews.length > 0 && (
        <div className="file-preview-list">
          {previews.map((preview, idx) => (
            <div key={idx} className="file-preview">
              <img src={preview.url} alt={`Preview ${idx + 1}`} />
              <button
                type="button"
                className="remove-file"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="file-info">
          {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}