import React, { useState } from "react";

const ImageUploader = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <section style={{ marginBottom: "1rem" }}>
      <h3>Upload Image</h3>
      <input type="file" accept="image/png" onChange={handleFileChange} />
      {file && (
        <div>
          <p>Selected: {file.name}</p>
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            style={{ maxWidth: "300px", marginTop: "10px" }}
          />
        </div>
      )}
    </section>
  );
};

export default ImageUploader;
