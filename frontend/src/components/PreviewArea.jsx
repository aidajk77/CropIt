import React, { useState } from "react";
import { generatePreview } from "../api/imageApi.js";

const PreviewArea = ({ file, cropCoords }) => {
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
      // Call your backend API
      const imageUrl = await generatePreview({
        image: file,
        cropCoords: cropCoords
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
      URL.revokeObjectURL(previewUrl); // Clean up memory
    }
    setPreviewUrl(null);
    setError(null);
  };

  // Check if we can generate preview
  const canGeneratePreview = file && cropCoords && !loading;

  return (
    <section style={{ marginBottom: "2rem" }}>
      <h3>Preview (5% scale)</h3>
      <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
        Generate a small preview to see how your crop will look
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
          {loading ? "⏳ Generating..." : "🔍 Generate Preview"}
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
            🗑️ Clear
          </button>
        )}
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
          📁 Upload an image first to enable preview
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
          📏 Select a crop area to enable preview
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
            ✅ Preview generated successfully (scaled to 5%)
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

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#666" }}>
          <summary>Debug Info</summary>
          <pre style={{ fontSize: "0.7rem", overflow: "auto" }}>
            {JSON.stringify({
              hasFile: !!file,
              fileName: file?.name,
              hasCropCoords: !!cropCoords,
              cropCoords: cropCoords,
              hasPreview: !!previewUrl,
              loading,
              error
            }, null, 2)}
          </pre>
        </details>
      )}
    </section>
  );
};

export default PreviewArea;