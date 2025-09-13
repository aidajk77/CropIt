import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { generateCroppedImage, downloadImage, validateImageData } from "../api/imageApi";
import "../styles/GenerateButton.css";

const GenerateButton = ({ file, cropCoords, configId = null }) => {
  const { getToken, isLoaded } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!file || !cropCoords) {
      setError("Please upload an image and select a crop area first");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    
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
      const imageUrl = await generateCroppedImage(imageData, token);
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `cropped-image-${timestamp}.png`;
      downloadImage(imageUrl, filename);
      
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error("Image generation failed:", err);
      setError(`Failed to generate image: Sign in to download your cropped image`);
    } finally {
      setLoading(false);
    }
  };

  // Check if we can generate image (also need authentication to be loaded)
  const canGenerate = file && cropCoords && !loading && isLoaded;

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <section className="generate-section">
        <h3 className="generate-title">Generate Final Image</h3>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          Loading authentication...
        </div>
      </section>
    );
  }

  return (
    <section className="generate-section">
      <h3 className="generate-title">Generate Final Image</h3>
      <p className="generate-description">
        {configId 
          ? "Generate full-quality cropped image with logo overlay"
          : "Generate full-quality cropped image (no logo applied)"
        }
      </p>
      
      <div className="generate-button-wrapper">
        <button 
          className={`generate-button ${canGenerate ? 'enabled' : 'disabled'}`}
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          {loading ? "🔄 Generating..." : "📥 Generate & Download"}
        </button>
      </div>

      {/* Status messages */}
      {!file && (
        <div className="generate-status-no-file">
          📁 Upload an image first to enable generation
        </div>
      )}

      {file && !cropCoords && (
        <div className="generate-status-no-crop">
          📏 Select a crop area to enable generation
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="generate-error">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="generate-success">
          ✅ Image generated and downloaded successfully!
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="generate-loading">
          <div className="generate-loading-icon">🔄</div>
          <p className="generate-loading-text">
            Generating your cropped image...
            <br />
            <small className="generate-loading-subtext">
              {configId ? "Applying logo overlay and processing..." : "Processing image..."}
            </small>
          </p>
        </div>
      )}

      {/* Configuration info */}
      {configId && (
        <div className="generate-config-info">
          🎨 <strong>Logo config applied:</strong> ID {configId}
          <br />
          <small className="generate-config-subtext">
            The generated image will include your configured logo overlay
          </small>
        </div>
      )}
    </section>
  );
};

export default GenerateButton;