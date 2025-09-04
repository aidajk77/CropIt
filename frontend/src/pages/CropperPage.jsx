import React from "react";
import ImageUploader from "../components/ImageUploader.jsx";
import ImageCropper from "../components/ImageCropper.jsx";
import PreviewArea from "../components/PreviewArea.jsx";
import GenerateButton from "../components/GenerateButton.jsx";

const CropperPage = () => {
  return (
    <div>
      <ImageUploader />
      <ImageCropper />
      <PreviewArea />
      <GenerateButton />
    </div>
  );
};

export default CropperPage;
