// src/components/ConfigPanel.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import FormSection from "./FormSection";
import { createConfig, updateConfig, validateConfigData, getAllConfigs } from "../api/configApi";
import "../styles/ConfigPanel.css";

const ConfigPanel = ({ onConfigCreated }) => {
  const { getToken, isLoaded } = useAuth();

  // Create form states
  const [createForm, setCreateForm] = useState({
    scaleDown: 0.1,
    logoPosition: "bottom-right",
    logoFile: null,
    description: "",
    loading: false,
    error: null,
    success: null
  });

  // Update form states
  const [updateForm, setUpdateForm] = useState({
    scaleDown: 0.1,
    logoPosition: "bottom-right",
    logoFile: null,
    description: "",
    loading: false,
    error: null,
    success: null
  });

  // Available configs for updating
  const [availableConfigs, setAvailableConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [configsLoading, setConfigsLoading] = useState(false);

  // Load available configurations
  useEffect(() => {
    if (isLoaded) {
      loadConfigs();
    }
  }, [isLoaded]);

  const loadConfigs = async () => {
    setConfigsLoading(true);
    try {
      const token = await getToken();
      const configs = await getAllConfigs(token);
      setAvailableConfigs(configs.data || configs || []);
    } catch (error) {
      console.error('Failed to load configs:', error);
    } finally {
      setConfigsLoading(false);
    }
  };

  // Handle config selection for updating
  const handleConfigSelect = (configId) => {
    setSelectedConfigId(configId);
    const config = availableConfigs.find(c => c.id.toString() === configId);
    setSelectedConfig(config);
    
    if (config) {
      setUpdateForm(prev => ({
        ...prev,
        scaleDown: config.scaleDown || 0.1,
        logoPosition: config.logoPosition || "bottom-right",
        description: config.description || "",
        logoFile: null,
        error: null,
        success: null
      }));
    }
  };

  // Create configuration handler
  const handleCreateConfig = async () => {
    setCreateForm(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      if (!createForm.description.trim()) {
        throw new Error('Please enter a description');
      }

      const configData = {
        scaleDown: createForm.scaleDown,
        logoPosition: createForm.logoPosition,
        description: createForm.description.trim(),
        logoImage: createForm.logoFile
      };

      const validationErrors = validateConfigData(configData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      if (!createForm.logoFile) {
        throw new Error('Please select a logo image');
      }

      const token = await getToken();
      const result = await createConfig(configData, token);
      setCreateForm(prev => ({ 
        ...prev, 
        success: `Configuration created! ID: ${result.data.id}` 
      }));
      
      if (onConfigCreated) {
        onConfigCreated(result);
      }

      // Refresh configs list
      loadConfigs();

    } catch (err) {
      setCreateForm(prev => ({ ...prev, error: err.message }));
    } finally {
      setCreateForm(prev => ({ ...prev, loading: false }));
    }
  };

  // Update configuration handler
  const handleUpdateConfig = async () => {
    if (!selectedConfig) {
      setUpdateForm(prev => ({ ...prev, error: "Please select a configuration to update" }));
      return;
    }

    if (!updateForm.description.trim()) {
      setUpdateForm(prev => ({ ...prev, error: "Please enter a description" }));
      return;
    }

    setUpdateForm(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      const configData = {
        scaleDown: updateForm.scaleDown,
        logoPosition: updateForm.logoPosition,
        description: updateForm.description.trim(),
        logoImage: updateForm.logoFile
      };

      const validationErrors = validateConfigData(configData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const token = await getToken();
      const result = await updateConfig(selectedConfig.id, configData, token);
      setUpdateForm(prev => ({ 
        ...prev, 
        success: "Configuration updated successfully!" 
      }));
      
      if (onConfigCreated) {
        onConfigCreated(result);
      }

      // Refresh configs list
      loadConfigs();

    } catch (err) {
      setUpdateForm(prev => ({ ...prev, error: err.message }));
    } finally {
      setUpdateForm(prev => ({ ...prev, loading: false }));
    }
  };

  // Clear create form
  const clearCreateForm = () => {
    setCreateForm({
      scaleDown: 0.1,
      logoPosition: "bottom-right",
      logoFile: null,
      description: "",
      loading: false,
      error: null,
      success: null
    });
  };

  // Reset update form
  const resetUpdateForm = () => {
    if (selectedConfig) {
      setUpdateForm(prev => ({
        ...prev,
        scaleDown: selectedConfig.scaleDown || 0.1,
        logoPosition: selectedConfig.logoPosition || "bottom-right",
        description: selectedConfig.description || "",
        logoFile: null,
        error: null,
        success: null
      }));
    }
  };

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="config-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading authentication...
        </div>
      </div>
    );
  }

  return (
    <div className="config-container">
      <div className="config-panels-wrapper">
        <FormSection
          title="Create New Configuration"
          form={createForm}
          onSubmit={handleCreateConfig}
          onReset={clearCreateForm}
          submitText="Create Configuration"
          resetText="Clear"
          isUpdate={false}
          selectedConfigId={selectedConfigId}
          availableConfigs={availableConfigs}
          configsLoading={configsLoading}
          onConfigSelect={handleConfigSelect}
          setCreateForm={setCreateForm}
          setUpdateForm={setUpdateForm}
          selectedConfig={selectedConfig}
        />

        <FormSection
          title="Update Existing Configuration"
          form={updateForm}
          onSubmit={handleUpdateConfig}
          onReset={resetUpdateForm}
          submitText="Update Configuration"
          resetText="Reset"
          isUpdate={true}
          selectedConfigId={selectedConfigId}
          availableConfigs={availableConfigs}
          configsLoading={configsLoading}
          onConfigSelect={handleConfigSelect}
          setCreateForm={setCreateForm}
          setUpdateForm={setUpdateForm}
          selectedConfig={selectedConfig}
        />
      </div>
    </div>
  );
};

export default ConfigPanel;