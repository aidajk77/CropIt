import React, { useState, useEffect } from "react";
import { getAllConfigs } from "../api/configApi.js"; 

const ConfigSelector = ({ onConfigSelect, selectedConfigId }) => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAllConfigs();
      // Handle the response structure from your API
      setConfigs(response.data || response || []);
    } catch (err) {
      setError('Error loading configurations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      marginBottom: "2rem", 
      padding: "1.5rem", 
      backgroundColor: "#f8f9fa", 
      borderRadius: "8px",
      border: "1px solid #dee2e6"
    }}>
      <h3 style={{ marginTop: 0 }}>Logo Overlay (Optional)</h3>
      
      {loading && <p>Loading configurations...</p>}
      
      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <>
          {configs.length === 0 ? (
            <div style={{ 
              padding: "1rem", 
              backgroundColor: "#fff3cd", 
              borderRadius: "4px",
              color: "#856404"
            }}>
              No logo configurations found. Create one in the Configuration page first.
            </div>
          ) : (
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Select Logo Configuration:
              </label>
              <select
                value={selectedConfigId}
                onChange={(e) => onConfigSelect(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
              >
                <option value="">No logo (plain crop)</option>
                {configs.map(config => (
                  <option key={config.id} value={config.id}>
                    {config.description || `${config.logoPosition} - ${(config.scaleDown * 100).toFixed(0)}% scale`}
                  </option>
                ))}
              </select>
              
              {selectedConfigId && (
                <div style={{ 
                  marginTop: "1rem", 
                  padding: "0.75rem", 
                  backgroundColor: "#e7f3ff", 
                  borderRadius: "4px",
                  fontSize: "0.9rem"
                }}>
                  🎨 Logo will be applied to your final image
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={loadConfigs}
            disabled={loading}
            style={{
              marginTop: "1rem",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Refreshing..." : "Refresh Configs"}
          </button>
        </>
      )}
    </div>
  );
};

export default ConfigSelector;