import React, { useState } from "react";

const GenerateButton = ({ file, cropCoords, configId = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // API call function (inline to avoid import issues in artifact)
  const generateCroppedImage = async (imageData) => {
    const { image, cropCoords, configId } = imageData;
    
    const formData = new FormData();
    formData.append('cropCoords', JSON.stringify(cropCoords));
    formData.append('image', image);
    if (configId) {
      formData.append('configId', configId);
    }
    
    const response = await fetch('http://localhost:5000/api/image/generate', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || 'An error occurred';
      } catch {
        errorMessage = errorText || `HTTP ${response.status} - ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  // Download function
  const downloadImage = (imageUrl, filename = 'cropped-image.png') => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL after download
    setTimeout(() => URL.revokeObjectURL(imageUrl), 100);
  };

  const handleGenerate = async () => {
    if (!file || !cropCoords) {
      setError("Please upload an image and select a crop area first");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Generate the cropped image
      const imageUrl = await generateCroppedImage({
        image: file,
        cropCoords: cropCoords,
        configId: configId
      });
      
      // Auto-download the image
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `cropped-image-${timestamp}.png`;
      downloadImage(imageUrl, filename);
      
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error("Image generation failed:", err);
      setError(`Failed to generate image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Check if we can generate image
  const canGenerate = file && cropCoords && !loading;

  return (
    <section style={{ marginBottom: "2rem" }}>
      <h3>Generate Final Image</h3>
      <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
        {configId 
          ? "Generate full-quality cropped image with logo overlay"
          : "Generate full-quality cropped image (no logo applied)"
        }
      </p>
      
      <div style={{ marginBottom: "1rem" }}>
        <button 
          onClick={handleGenerate}
          disabled={!canGenerate}
          style={{
            backgroundColor: canGenerate ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "4px",
            cursor: canGenerate ? "pointer" : "not-allowed",
            fontSize: "1.1rem",
            fontWeight: "bold",
            opacity: canGenerate ? 1 : 0.6,
            minWidth: "200px"
          }}
        >
          {loading ? "🔄 Generating..." : "📥 Generate & Download"}
        </button>
      </div>

      {/* Status messages */}
      {!file && (
        <div style={{ 
          padding: "1rem", 
          backgroundColor: "#e9ecef", 
          borderRadius: "4px",
          color: "#6c757d",
          fontStyle: "italic"
        }}>
          📁 Upload an image first to enable generation
        </div>
      )}

      {file && !cropCoords && (
        <div style={{ 
          padding: "1rem", 
          backgroundColor: "#fff3cd", 
          borderRadius: "4px",
          color: "#856404",
          border: "1px solid #ffeaa7"
        }}>
          📏 Select a crop area to enable generation
        </div>
      )}

      {/* Error display */}
      {error && (
        <div style={{ 
          color: "red", 
          padding: "1rem", 
          backgroundColor: "#ffe6e6", 
          borderRadius: "4px",
          border: "1px solid #ffcccc",
          marginBottom: "1rem"
        }}>
          ❌ {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div style={{ 
          color: "#28a745", 
          padding: "1rem", 
          backgroundColor: "#d4edda", 
          borderRadius: "4px",
          border: "1px solid #c3e6cb",
          marginBottom: "1rem"
        }}>
          ✅ Image generated and downloaded successfully!
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div style={{ 
          padding: "2rem", 
          textAlign: "center",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          border: "1px solid #dee2e6"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔄</div>
          <p style={{ margin: 0, color: "#6c757d" }}>
            Generating your cropped image...
            <br />
            <small style={{ fontSize: "0.8rem" }}>
              {configId ? "Applying logo overlay and processing..." : "Processing image..."}
            </small>
          </p>
        </div>
      )}

      {/* Configuration info */}
      {configId && (
        <div style={{ 
          padding: "0.75rem", 
          backgroundColor: "#e7f3ff", 
          borderRadius: "4px",
          border: "1px solid #b8daff",
          fontSize: "0.9rem"
        }}>
          🎨 <strong>Logo config applied:</strong> ID {configId}
          <br />
          <small style={{ color: "#6c757d" }}>
            The generated image will include your configured logo overlay
          </small>
        </div>
      )}

      {/* Info box */}
      <div style={{ 
        padding: "1rem", 
        backgroundColor: "#f8f9fa", 
        borderRadius: "4px",
        fontSize: "0.9rem",
        color: "#6c757d",
        marginTop: "1rem"
      }}>
        <strong>💡 Note:</strong> The generated image will be:
        <ul style={{ marginTop: "0.5rem", marginBottom: 0, paddingLeft: "1.5rem" }}>
          <li>Full quality (no scaling applied)</li>
          <li>Cropped to your selected area</li>
          {configId && <li>Enhanced with your logo overlay</li>}
          <li>Automatically downloaded as PNG file</li>
        </ul>
      </div>

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#666" }}>
          <summary>Debug Info</summary>
          <pre style={{ fontSize: "0.7rem", overflow: "auto" }}>
            {JSON.stringify({
              hasFile: !!file,
              fileName: file?.name,
              hasCropCoords: !!cropCoords,
              cropCoords: cropCoords,
              configId: configId,
              canGenerate,
              loading,
              error,
              success
            }, null, 2)}
          </pre>
        </details>
      )}
    </section>
  );
};

export default GenerateButton;