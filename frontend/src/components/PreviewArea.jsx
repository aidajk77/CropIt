import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { generatePreview, validateImageData } from "../api/imageApi";
import "../styles/PreviewArea.css";

const PreviewArea = ({ file, cropCoords, configId }) => {
  const { getToken, isLoaded } = useAuth();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePreview = async () => {
    if (!file || !cropCoords) {
      setError("Please upload an image and select a crop area first");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Prepare image data
      const imageData = {
        image: file,
        cropCoords: cropCoords,
        configId: configId
      };

      const validationErrors = validateImageData(imageData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const token = await getToken();
      const imageUrl = await generatePreview(imageData, token);
      
      setPreviewUrl(imageUrl);
    } catch (err) {
      console.error("Preview generation failed:", err);
      setError(`Failed to generate preview: Sign in to generate your cropped image`);
    } finally {
      setLoading(false);
    }
  };

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
  };

  const canGeneratePreview = file && cropCoords && !loading && isLoaded;

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <section className="preview-section">
        <h3 className="preview-title">Preview (5% scale)</h3>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          Loading authentication...
        </div>
      </section>
    );
  }

  return (
    <section className="preview-section">
      <h3 className="preview-title">Preview (5% scale)</h3>
      <p className="preview-description">
        Generate a small preview to see how your crop will look
        {configId && " (with logo overlay)"}
      </p>
      
      <div className="preview-button-wrapper">
        <button 
          className={`preview-button ${canGeneratePreview ? 'enabled' : 'disabled'}`}
          onClick={handlePreview}
          disabled={!canGeneratePreview}
        >
          {loading ? "Generating..." : "Generate Preview"}
        </button>
        
        {previewUrl && (
          <button 
            className="preview-clear-button"
            onClick={clearPreview}
          >
            Clear
          </button>
        )}
      </div>

      {/* Logo info */}
      {configId && (
        <div className="preview-config-info">
          Logo configuration selected: {configId}
        </div>
      )}

      {/* Status messages */}
      {!file && (
        <div className="preview-status-no-file">
          Upload an image first to enable preview
        </div>
      )}

      {file && !cropCoords && (
        <div className="preview-status-no-crop">
          Select a crop area to enable preview
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="preview-error">
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="preview-loading">
          <div className="preview-loading-icon">⏳</div>
          <p className="preview-loading-text">Generating preview...</p>
        </div>
      )}

      {/* Preview display */}
      {previewUrl && !loading && (
        <div className="preview-result">
          <p className="preview-success-text">
            Preview generated successfully (scaled to 5%)
            {configId && " with logo overlay"}
          </p>
          
          <div className="preview-image-container">
            <img 
              className="preview-image"
              src={previewUrl} 
              alt="Preview" 
            />
          </div>
          
          <p className="preview-image-note">
            This is a scaled-down preview. The final image will be full quality.
          </p>
        </div>
      )}
    </section>
  );
};

export default PreviewArea;