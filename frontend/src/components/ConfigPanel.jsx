import React, { useState } from "react";
import { createConfig } from "../api/configApi.js";

const ConfigPanel = ({ onConfigCreated }) => {
  const [scaleDown, setScaleDown] = useState(0.1);
  const [logoPosition, setLogoPosition] = useState("bottom-right");
  const [logoFile, setLogoFile] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleCreateConfig = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!logoFile) {
        throw new Error('Please select a logo image');
      }

      if (logoFile.type !== 'image/png') {
        throw new Error('Logo must be a PNG image');
      }

      if (scaleDown <= 0 || scaleDown > 0.25) {
        throw new Error('Scale down must be between 0.01 and 0.25');
      }

      const result = await createConfig({
        scaleDown: scaleDown,
        logoPosition: logoPosition,
        description: description,
        logoImage: logoFile
      });

      setSuccess(`Configuration created! ID: ${result.data.id}`);
      
      if (onConfigCreated) {
        onConfigCreated(result.data);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setScaleDown(0.1);
    setLogoPosition("bottom-right");
    setLogoFile(null);
    setDescription("");
    setError(null);
    setSuccess(null);
  };

  return (
    <div style={{ 
      backgroundColor: "white", 
      padding: "2rem", 
      borderRadius: "8px", 
      border: "1px solid #ddd",
      maxWidth: "600px"
    }}>
      <h3>Create Logo Configuration</h3>
      
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
          Scale Down (0.01 - 0.25):
        </label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          max="0.25"
          value={scaleDown}
          onChange={(e) => setScaleDown(parseFloat(e.target.value) || 0.01)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
        <small style={{ color: "#666" }}>
          How much to scale the logo (0.1 = 10% of original size)
        </small>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
          Logo Position:
        </label>
        <select
          value={logoPosition}
          onChange={(e) => setLogoPosition(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        >
          <option value="top-left">Top Left</option>
          <option value="top-right">Top Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="bottom-right">Bottom Right</option>
          <option value="center">Center</option>
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
          Description (optional):
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Company watermark"
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
          Logo Image (PNG only):
        </label>
        <input
          type="file"
          accept="image/png"
          onChange={(e) => setLogoFile(e.target.files[0])}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
        {logoFile && (
          <div style={{ 
            marginTop: "0.5rem", 
            padding: "0.5rem", 
            backgroundColor: "#f0f8ff", 
            borderRadius: "4px" 
          }}>
            <p style={{ margin: 0, color: "green" }}>
              ✅ {logoFile.name} ({(logoFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div style={{ 
          color: "red", 
          padding: "1rem", 
          backgroundColor: "#ffebee", 
          borderRadius: "4px",
          marginBottom: "1rem"
        }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{ 
          color: "green", 
          padding: "1rem", 
          backgroundColor: "#e8f5e8", 
          borderRadius: "4px",
          marginBottom: "1rem"
        }}>
          ✅ {success}
        </div>
      )}

      {loading && (
        <div style={{ 
          padding: "1rem", 
          backgroundColor: "#f5f5f5", 
          borderRadius: "4px",
          textAlign: "center",
          marginBottom: "1rem"
        }}>
          ⏳ Creating configuration...
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={handleCreateConfig}
          disabled={!logoFile || loading}
          style={{
            backgroundColor: logoFile && !loading ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "4px",
            cursor: logoFile && !loading ? "pointer" : "not-allowed",
            fontSize: "1rem",
            flex: 1
          }}
        >
          {loading ? "Creating..." : "Create Configuration"}
        </button>

        <button
          onClick={clearForm}
          disabled={loading}
          style={{
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            padding: "12px 16px",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem"
          }}
        >
          Clear
        </button>
      </div>

      {logoFile && (
        <div style={{ 
          marginTop: "1rem", 
          padding: "1rem", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "4px" 
        }}>
          <h4 style={{ margin: "0 0 0.5rem 0" }}>Preview:</h4>
          <img 
            src={URL.createObjectURL(logoFile)} 
            alt="Logo preview" 
            style={{ 
              maxWidth: "150px", 
              maxHeight: "75px",
              border: "1px solid #ddd"
            }} 
          />
          <p style={{ fontSize: "0.9rem", color: "#666", margin: "0.5rem 0 0 0" }}>
            Will be scaled to {(scaleDown * 100).toFixed(0)}% and positioned at {logoPosition}
          </p>
        </div>
      )}

      <div style={{ 
        marginTop: "1rem", 
        padding: "1rem", 
        backgroundColor: "#e7f3ff", 
        borderRadius: "4px",
        fontSize: "0.9rem" 
      }}>
        <strong>💡 How to use:</strong>
        <ol style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.5rem" }}>
          <li>Upload a PNG logo</li>
          <li>Set scale and position</li>
          <li>Click "Create Configuration"</li>
          <li>Copy the generated ID</li>
          <li>Use ID in Image Cropper for logo overlay</li>
        </ol>
      </div>
    </div>
  );
};

export default ConfigPanel;