import React, { useState } from "react";

const PreviewArea = ({ file, cropCoords, configId }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API call function (inline to match your pattern)
  const generatePreview = async (imageData) => {
    const { image, cropCoords, configId } = imageData;
    
    const formData = new FormData();
    formData.append('cropCoords', JSON.stringify(cropCoords));
    formData.append('image', image);
    if (configId) {
      formData.append('configId', configId);
    }
    
    const response = await fetch('http://localhost:5000/api/image/preview', {
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

  const handlePreview = async () => {
    if (!file || !cropCoords) {
      setError("Please upload an image and select a crop area first");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Call your backend API with configId
      const imageUrl = await generatePreview({
        image: file,
        cropCoords: cropCoords,
        configId: configId
      });
      
      setPreviewUrl(imageUrl);
    } catch (err) {
      console.error("Preview generation failed:", err);
      setError(`Failed to generate preview: ${err.message}`);
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

  const canGeneratePreview = file && cropCoords && !loading;

  return (
    <section style={{ marginBottom: "2rem" }}>
      <h3>Preview (5% scale)</h3>
      <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
        Generate a small preview to see how your crop will look
        {configId && " (with logo overlay)"}
      </p>
      
      <div style={{ marginBottom: "1rem" }}>
        <button 
          onClick={handlePreview}
          disabled={!canGeneratePreview}
          style={{
            backgroundColor: canGeneratePreview ? "#28a745" : "#6c757d",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: canGeneratePreview ? "pointer" : "not-allowed",
            fontSize: "1rem",
            marginRight: "10px",
            opacity: canGeneratePreview ? 1 : 0.6
          }}
        >
          {loading ? "Generating..." : "Generate Preview"}
        </button>
        
        {previewUrl && (
          <button 
            onClick={clearPreview}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Logo info */}
      {configId && (
        <div style={{ 
          padding: "0.75rem", 
          backgroundColor: "#e7f3ff", 
          borderRadius: "4px",
          marginBottom: "1rem",
          fontSize: "0.9rem"
        }}>
          Logo configuration selected: {configId}
        </div>
      )}

      {/* Status messages */}
      {!file && (
        <div style={{ 
          padding: "1rem", 
          backgroundColor: "#e9ecef", 
          borderRadius: "4px",
          color: "#6c757d",
          fontStyle: "italic"
        }}>
          Upload an image first to enable preview
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
          Select a crop area to enable preview
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
          {error}
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
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
          <p style={{ margin: 0, color: "#6c757d" }}>Generating preview...</p>
        </div>
      )}

      {/* Preview display */}
      {previewUrl && !loading && (
        <div style={{ 
          padding: "1rem", 
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          border: "1px solid #dee2e6"
        }}>
          <p style={{ 
            color: "#28a745", 
            fontWeight: "bold", 
            marginBottom: "1rem",
            margin: "0 0 1rem 0"
          }}>
            Preview generated successfully (scaled to 5%)
            {configId && " with logo overlay"}
          </p>
          
          <div style={{ textAlign: "center" }}>
            <img 
              src={previewUrl} 
              alt="Preview" 
              style={{ 
                maxWidth: "100%",
                border: "2px solid #007bff",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }} 
            />
          </div>
          
          <p style={{ 
            fontSize: "0.8rem", 
            color: "#6c757d", 
            textAlign: "center",
            marginTop: "0.5rem",
            margin: "0.5rem 0 0 0"
          }}>
            This is a scaled-down preview. The final image will be full quality.
          </p>
        </div>
      )}
    </section>
  );
};

export default PreviewArea;