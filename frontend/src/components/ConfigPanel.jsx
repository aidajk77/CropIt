import React, { useState } from "react";

const ConfigPanel = () => {
  const [scaleDown, setScaleDown] = useState(0.1);
  const [logoPosition, setLogoPosition] = useState("bottom-right");
  const [logoFile, setLogoFile] = useState(null);

  return (
    <section>
      <h3>Configuration</h3>

      <label>
        Scale Down (max 0.25):
        <input
          type="number"
          step="0.01"
          max="0.25"
          value={scaleDown}
          onChange={(e) => setScaleDown(parseFloat(e.target.value))}
        />
      </label>

      <br />

      <label>
        Logo Position:
        <select
          value={logoPosition}
          onChange={(e) => setLogoPosition(e.target.value)}
        >
          <option value="top-left">Top Left</option>
          <option value="top-right">Top Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="bottom-right">Bottom Right</option>
        </select>
      </label>

      <br />

      <label>
        Logo Image:
        <input
          type="file"
          accept="image/png"
          onChange={(e) => setLogoFile(e.target.files[0])}
        />
      </label>

      {logoFile && <p>Selected Logo: {logoFile.name}</p>}
    </section>
  );
};

export default ConfigPanel;
