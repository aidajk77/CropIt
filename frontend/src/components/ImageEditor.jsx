import React, { useState, useRef, useEffect } from "react";
import "../styles/ImageEditor.css";

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

  // Dynamic styles for crop overlays
  const getCropOverlayStyle = () => {
    if (!cropArea) return { display: 'none' };
    
    return {
      left: `${cropArea.x}px`,
      top: `${cropArea.y}px`,
      width: `${cropArea.width}px`,
      height: `${cropArea.height}px`,
    };
  };

  const getImageOverlayDisplay = () => {
    return cropArea ? {} : { display: 'none' };
  };

  return (
    <section className="editor-section">
      <h3 className="editor-title">Upload & Crop Image</h3>
      
      {!file ? (
        // Upload area
        <div>
          <div
            className="editor-upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="editor-upload-icon">📁</div>
            <p className="editor-upload-text">
              Drag & drop your PNG image here
            </p>
            <p className="editor-upload-subtext">
              or click to browse (PNG files only, max 50MB)
            </p>
          </div>
          
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/png" 
            onChange={handleFileChange}
            className="editor-file-input"
          />
        </div>
      ) : (
        // Image with crop functionality
        <div>
          <div className="editor-image-controls">
            <div className="editor-image-info">
              <p className="editor-file-name">
                ✅ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              {cropArea && (
                <p className="editor-crop-dimensions">
                  📏 Selected: {Math.round(cropArea.width)} × {Math.round(cropArea.height)} px
                </p>
              )}
            </div>
            <div className="editor-button-group">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="editor-button primary"
              >
                Change Image
              </button>
              {cropArea && (
                <button
                  onClick={clearCrop}
                  className="editor-button warning"
                >
                  Clear Crop
                </button>
              )}
              <button
                onClick={clearImage}
                className="editor-button danger"
              >
                Remove Image
              </button>
            </div>
          </div>

          <p className={`editor-crop-status ${cropArea ? 'ready' : 'waiting'}`}>
            {cropArea ? 
              "✅ Crop area selected! You can now generate preview or final image." : 
              "📏 Click and drag on the image to select the crop area"
            }
          </p>
          
          <div
            ref={containerRef}
            className={`editor-image-container ${isSelecting ? 'selecting' : 'ready'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={previewUrl}
              alt="Upload preview"
              className="editor-image"
              onLoad={handleImageLoad}
              draggable={false}
            />
            
            {/* Dark overlay outside crop area */}
            <div 
              className="editor-image-overlay" 
              style={getImageOverlayDisplay()} 
            />
            
            {/* Crop selection box */}
            <div 
              className="editor-crop-overlay" 
              style={getCropOverlayStyle()} 
            />
          </div>
          
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/png" 
            onChange={handleFileChange}
            className="editor-file-input"
          />
        </div>
      )}
      
      {error && (
        <div className="editor-error">
          ❌ {error}
        </div>
      )}
    </section>
  );
};

export default ImageEditor;