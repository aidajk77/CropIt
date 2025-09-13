import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { getAllConfigs } from "../api/configApi";
import "../styles/ConfigSelector.css";

const ConfigSelector = ({ onConfigSelect, selectedConfigId }) => {
  const { getToken, isLoaded } = useAuth();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoaded) {
      loadConfigs();
    }
  }, [isLoaded]);

  const loadConfigs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      const result = await getAllConfigs(token);
      setConfigs(result.data || result || []);
    } catch (err) {
      setError('Error loading configurations: Sign in to access your saved logo configurations');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="selector-container">
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          Loading authentication...
        </div>
      </div>
    );
  }

  return (
    <div className="selector-container">
      <h3 className="selector-title">Logo Overlay (Optional)</h3>
      
      {loading && <p className="selector-loading">Loading configurations...</p>}
      
      {error && (
        <div className="selector-error">
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <>
          {configs.length === 0 ? (
            <div className="selector-no-configs">
              No logo configurations found. Create one in the Configuration page first.
            </div>
          ) : (
            <div>
              <label className="selector-label">
                Select Logo Configuration:
              </label>
              <select
                className="selector-select"
                value={selectedConfigId}
                onChange={(e) => onConfigSelect(e.target.value)}
              >
                <option value="">No logo (plain crop)</option>
                {configs.map(config => (
                  <option key={config.id} value={config.id}>
                    {config.description || `${config.logoPosition} - ${(config.scaleDown * 100).toFixed(0)}% scale`}
                  </option>
                ))}
              </select>
              
              {selectedConfigId && (
                <div className="selector-selected-info">
                  🎨 Logo will be applied to your final image
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ConfigSelector;