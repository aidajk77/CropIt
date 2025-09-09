import React, { useState, useRef, useEffect } from "react";

const ImageEditor = ({ onImageAndCropReady }) => {
  // Image upload state
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  
  // Crop selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [cropArea, setCropArea] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Reset crop when new image is uploaded
  useEffect(() => {
    setCropArea(null);
    setImageLoaded(false);
    notifyParent();
  }, [file]);

  // Notify parent when image or crop changes
  const notifyParent = () => {
    if (onImageAndCropReady) {
      const cropCoords = cropArea && imageRef.current ? getCropCoordinates() : null;
      onImageAndCropReady({
        file: file,
        previewUrl: previewUrl,
        cropCoords: cropCoords,
        isReady: !!(file && cropCoords)
      });
    }
  };

  // Update parent whenever crop area changes
  useEffect(() => {
    notifyParent();
  }, [cropArea, file, previewUrl]);

  const processFile = (selectedFile) => {
    setError(null);
    
    if (!selectedFile) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file type
    if (selectedFile.type !== 'image/png') {
      setError('Please select a PNG image file');
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 50MB');
      return;
    }

    // Create preview URL
    const imageUrl = URL.createObjectURL(selectedFile);
    
    setFile(selectedFile);
    setPreviewUrl(imageUrl);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const clearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setCropArea(null);
    setImageLoaded(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Crop functionality
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const getRelativeCoordinates = (event) => {
    const image = imageRef.current;
    if (!image) return null;

    const imageRect = image.getBoundingClientRect();
    const x = event.clientX - imageRect.left;
    const y = event.clientY - imageRect.top;
    
    return {
      x: Math.max(0, Math.min(x, image.offsetWidth)),
      y: Math.max(0, Math.min(y, image.offsetHeight))
    };
  };

  const handleMouseDown = (event) => {
    if (!imageLoaded) return;
    
    const coords = getRelativeCoordinates(event);
    if (!coords) return;
    
    setStartPoint({ x: coords.x, y: coords.y });
    setIsSelecting(true);
    setCropArea(null);
  };

  const handleMouseMove = (event) => {
    if (!isSelecting || !startPoint || !imageLoaded) return;
    
    const coords = getRelativeCoordinates(event);
    if (!coords) return;
    
    const newCropArea = {
      x: Math.min(startPoint.x, coords.x),
      y: Math.min(startPoint.y, coords.y),
      width: Math.abs(coords.x - startPoint.x),
      height: Math.abs(coords.y - startPoint.y)
    };
    
    setCropArea(newCropArea);
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    
    setIsSelecting(false);
    
    if (cropArea && cropArea.width > 5 && cropArea.height > 5) {
      // Keep the crop area
    } else {
      // Clear invalid crop area
      setCropArea(null);
    }
  };

  const getCropCoordinates = () => {
    if (!cropArea || !imageRef.current) return null;
    
    const image = imageRef.current;
    const scaleX = image.naturalWidth / image.offsetWidth;
    const scaleY = image.naturalHeight / image.offsetHeight;
    
    return [
      Math.round(cropArea.x * scaleX),
      Math.round(cropArea.y * scaleY),
      Math.round(cropArea.width * scaleX),
      Math.round(cropArea.height * scaleY)
    ];
  };

  const clearCrop = () => {
    setCropArea(null);
    setStartPoint(null);
    setIsSelecting(false);
  };

  // Styling helpers
  const getCropOverlayStyle = () => {
    if (!cropArea) return { display: 'none' };
    
    return {
      position: 'absolute',
      left: `${cropArea.x}px`,
      top: `${cropArea.y}px`,
      width: `${cropArea.width}px`,
      height: `${cropArea.height}px`,
      border: '2px solid #007bff',
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      pointerEvents: 'none',
      zIndex: 10
    };
  };

  const getImageOverlayStyle = () => {
    if (!cropArea) return { display: 'none' };
    
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      pointerEvents: 'none',
      zIndex: 5
    };
  };

  return (
    <section style={{ marginBottom: "2rem" }}>
      <h3>Upload & Crop Image</h3>
      
      {!file ? (
        // Upload area
        <div>
          <div
            style={{
              border: "2px dashed #ccc",
              borderRadius: "8px",
              padding: "3rem 2rem",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "#f9f9f9",
              transition: "border-color 0.3s ease"
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📁</div>
            <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              Drag & drop your PNG image here
            </p>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>
              or click to browse (PNG files only, max 50MB)
            </p>
          </div>
          
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/png" 
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      ) : (
        // Image with crop functionality
        <div>
          <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: "green", fontWeight: "bold", margin: 0 }}>
                ✅ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              {cropArea && (
                <p style={{ color: "#666", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
                  📏 Selected: {Math.round(cropArea.width)} × {Math.round(cropArea.height)} px
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                Change Image
              </button>
              {cropArea && (
                <button
                  onClick={clearCrop}
                  style={{
                    backgroundColor: "#ffc107",
                    color: "black",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.9rem"
                  }}
                >
                  Clear Crop
                </button>
              )}
              <button
                onClick={clearImage}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                Remove Image
              </button>
            </div>
          </div>

          <p style={{ 
            color: cropArea ? "#28a745" : "#666", 
            fontSize: "0.9rem", 
            marginBottom: "1rem",
            fontStyle: cropArea ? "normal" : "italic"
          }}>
            {cropArea ? 
              "✅ Crop area selected! You can now generate preview or final image." : 
              "📏 Click and drag on the image to select the crop area"
            }
          </p>
          
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              display: 'inline-block',
              cursor: isSelecting ? 'crosshair' : 'crosshair',
              border: '2px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              maxWidth: '100%'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={previewUrl}
              alt="Upload preview"
              style={{
                maxWidth: "100%",
                maxHeight: "600px",
                display: "block",
                userSelect: 'none',
                pointerEvents: 'none'
              }}
              onLoad={handleImageLoad}
              draggable={false}
            />
            
            {/* Dark overlay outside crop area */}
            <div style={getImageOverlayStyle()} />
            
            {/* Crop selection box */}
            <div style={getCropOverlayStyle()} />
          </div>
          
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/png" 
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      )}
      
      {error && (
        <div style={{ 
          color: "red", 
          marginTop: "1rem", 
          padding: "12px", 
          backgroundColor: "#ffe6e6", 
          borderRadius: "4px",
          border: "1px solid #ffcccc"
        }}>
          ❌ {error}
        </div>
      )}
    </section>
  );
};

export default ImageEditor;