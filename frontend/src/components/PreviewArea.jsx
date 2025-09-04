import React, { useState } from "react";

const PreviewArea = () => {
  const [previewUrl, setPreviewUrl] = useState(null);

  const handlePreview = () => {
    // Later: call backend /api/image/preview
    setPreviewUrl("https://via.placeholder.com/200x150.png?text=Preview");
  };

  return (
    <section style={{ marginBottom: "1rem" }}>
      <h3>Preview</h3>
      <button onClick={handlePreview}>Generate Preview</button>
      {previewUrl && (
        <div>
          <img src={previewUrl} alt="Preview" style={{ marginTop: "10px" }} />
        </div>
      )}
    </section>
  );
};

export default PreviewArea;
