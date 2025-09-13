import React from "react";

const FormSection = ({ 
  title, 
  form, 
  onSubmit, 
  onReset, 
  submitText, 
  resetText, 
  isUpdate = false,
  selectedConfigId,
  availableConfigs,
  configsLoading,
  onConfigSelect,
  setCreateForm,
  setUpdateForm,
  selectedConfig
}) => (
  <div className="config-form-section">
    <h3 className="config-form-title">{title}</h3>
    
    {isUpdate && (
      <div className="config-form-group">
        <label className="config-label">
          Select Configuration to Update:
        </label>
        <select
          className="config-select"
          value={selectedConfigId}
          onChange={(e) => onConfigSelect(e.target.value)}
          disabled={configsLoading}
        >
          <option value="">Choose configuration...</option>
          {availableConfigs.map(config => (
            <option key={config.id} value={config.id}>
              {config.description || `Config ${config.id}`} - {config.logoPosition}
            </option>
          ))}
        </select>
        {configsLoading && <small className="config-small-text">Loading configurations...</small>}
      </div>
    )}

    <div className="config-form-group">
      <label className="config-label">
        Scale Down (0.01 - 0.25):
      </label>
      <input
        className="config-input"
        type="number"
        step="0.01"
        min="0.01"
        max="0.25"
        value={form.scaleDown}
        onChange={(e) => {
          const setter = isUpdate ? setUpdateForm : setCreateForm;
          setter(prev => ({ ...prev, scaleDown: parseFloat(e.target.value) || 0.01 }));
        }}
      />
      <small className="config-small-text">
        Scale logo to {(form.scaleDown * 100).toFixed(0)}% of original size
      </small>
    </div>

    <div className="config-form-group">
      <label className="config-label">
        Logo Position:
      </label>
      <select
        className="config-select"
        value={form.logoPosition}
        onChange={(e) => {
          const setter = isUpdate ? setUpdateForm : setCreateForm;
          setter(prev => ({ ...prev, logoPosition: e.target.value }));
        }}
      >
        <option value="top-left">Top Left</option>
        <option value="top-right">Top Right</option>
        <option value="bottom-left">Bottom Left</option>
        <option value="bottom-right">Bottom Right</option>
        <option value="center">Center</option>
      </select>
    </div>

    <div className="config-form-group">
      <label className="config-label">
        Description:
      </label>
      <input
        className="config-input"
        type="text"
        value={form.description}
        onChange={(e) => {
          const setter = isUpdate ? setUpdateForm : setCreateForm;
          setter(prev => ({ ...prev, description: e.target.value }));
        }}
        placeholder="e.g., Company watermark"
      />
    </div>

    <div className="config-form-group">
      <label className="config-label">
        Logo Image (PNG only){isUpdate ? " - Optional" : ""}:
      </label>
      <input
        className="config-input"
        type="file"
        accept="image/png"
        onChange={(e) => {
          const setter = isUpdate ? setUpdateForm : setCreateForm;
          setter(prev => ({ ...prev, logoFile: e.target.files[0] }));
        }}
      />
      {form.logoFile && (
        <div className="config-file-info">
          <p className="config-file-info-text">
             {form.logoFile.name} ({(form.logoFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        </div>
      )}
      {isUpdate && !form.logoFile && selectedConfig && (
        <div className="config-current-logo-info">
          Current logo will be kept if no new file is selected
        </div>
      )}
    </div>

    {form.error && (
      <div className="config-error">
         {form.error}
      </div>
    )}

    {form.success && (
      <div className="config-success">
         {form.success}
      </div>
    )}

    {form.loading && (
      <div className="config-loading">
        ⏳ {isUpdate ? "Updating..." : "Creating..."}
      </div>
    )}

    <div className="config-button-group">
      <button
        className="config-primary-button"
        onClick={onSubmit}
        disabled={
          (!isUpdate && (!form.logoFile || !form.description.trim())) || 
          (isUpdate && (!selectedConfig || !form.description.trim())) || 
          form.loading
        }
      >
        {form.loading ? (isUpdate ? "Updating..." : "Creating...") : submitText}
      </button>

      <button
        className="config-secondary-button"
        onClick={onReset}
        disabled={form.loading}
      >
        {resetText}
      </button>
    </div>

    {form.logoFile && (
      <div className="config-preview-section">
        <h5 className="config-preview-title">Preview:</h5>
        <img 
          className="config-preview-image"
          src={URL.createObjectURL(form.logoFile)} 
          alt="Logo preview" 
        />
        <p className="config-preview-text">
          {(form.scaleDown * 100).toFixed(0)}% scale, {form.logoPosition} position
        </p>
      </div>
    )}

    {isUpdate && !form.logoFile && selectedConfig && selectedConfig.logoData && (
      <div className="config-preview-section">
        <h5 className="config-preview-title">Current Logo:</h5>
        <img 
          className="config-preview-image"
          src={`data:image/png;base64,${selectedConfig.logoData}`}
          alt="Current logo" 
        />
        <p className="config-preview-text">
          {(form.scaleDown * 100).toFixed(0)}% scale, {form.logoPosition} position
        </p>
      </div>
    )}
  </div>
);

export default FormSection;