import React, { useState } from "react";
import ImageEditor from "../components/ImageEditor.jsx";
import PreviewArea from "../components/PreviewArea.jsx";
import GenerateButton from "../components/GenerateButton.jsx";
import ConfigSelector from "../components/ConfigSelector.jsx";

const CropperPage = () => {
  const [imageData, setImageData] = useState({
    file: null,
    previewUrl: null,
    cropCoords: null,
    isReady: false
  });

  const [selectedConfigId, setSelectedConfigId] = useState("");

  const handleImageAndCropReady = (data) => {
    setImageData(data);
    console.log('Image and crop data:', data);
  };

  const handleConfigSelect = (configId) => {
    setSelectedConfigId(configId);
    console.log('Selected config:', configId);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      
      <ImageEditor onImageAndCropReady={handleImageAndCropReady} />
      
      {imageData.isReady && (
        <>
          <ConfigSelector 
            onConfigSelect={handleConfigSelect}
            selectedConfigId={selectedConfigId}
          />
          <PreviewArea 
            file={imageData.file}
            cropCoords={imageData.cropCoords}
          />
          <GenerateButton 
            file={imageData.file}
            cropCoords={imageData.cropCoords}
          />
        </>
      )}
    </div>
  );
};

export default CropperPage;
