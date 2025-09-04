import React from "react";

const GenerateButton = () => {
  const handleGenerate = () => {
    // Later: call backend /api/image/generate
    alert("Generate clicked! (This will download cropped image)");
  };

  return (
    <section style={{ marginBottom: "1rem" }}>
      <button onClick={handleGenerate}>Generate Cropped Image</button>
    </section>
  );
};

export default GenerateButton;
