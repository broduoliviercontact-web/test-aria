// src/components/CharacterPortrait.jsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import "./CharacterPortrait.css";

/** Util: charge une image (dataURL / URL) dans un objet Image */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Util: recadre via canvas et renvoie un dataURL */
async function getCroppedDataUrl(imageSrc, cropPixels, outputType = "image/jpeg", quality = 0.92) {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  );

  return canvas.toDataURL(outputType, quality);
}

function CharacterPortrait({ imageUrl, onChangeImage }) {
  // URL input (sync avec imageUrl)
  const [urlInput, setUrlInput] = useState(imageUrl || "");
  useEffect(() => {
    setUrlInput(imageUrl || "");
  }, [imageUrl]);

  // Upload
  const fileInputRef = useRef(null);

  // Crop modal
  const [isCropping, setIsCropping] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const resetCropState = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const openCropperWithSrc = (src) => {
    setRawImageSrc(src);
    resetCropState();
    setIsCropping(true);
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const applyUrl = () => {
    const v = (urlInput || "").trim();
    if (!v) return;
    // Ici on ne recadre pas : on charge juste l’URL.
    onChangeImage(v);
  };

  const onPickFile = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Ici on ne recadre pas : on met directement le dataURL comme imageUrl.
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      onChangeImage(result);
    };
    reader.readAsDataURL(file);

    // reset pour pouvoir re-uploader le même fichier
    e.target.value = "";
  };

  const recropExisting = () => {
    if (!imageUrl) return;
    // On recroppe uniquement l’image déjà affichée
    openCropperWithSrc(imageUrl);
  };

  const cancelCrop = () => {
    setIsCropping(false);
    setRawImageSrc("");
    setCroppedAreaPixels(null);
  };

  const validateCrop = async () => {
    if (!rawImageSrc || !croppedAreaPixels) return;

    try {
      const croppedDataUrl = await getCroppedDataUrl(rawImageSrc, croppedAreaPixels, "image/jpeg", 0.92);
      onChangeImage(croppedDataUrl);
      cancelCrop();
    } catch (err) {
      console.error("Crop error:", err);
      alert(
        "Impossible de recadrer cette image. Si elle vient d’une URL externe, ça peut être bloqué (CORS)."
      );
    }
  };

  return (
    <section className="portrait-card">
      <h2 className="identity-title">Portrait</h2>

      <div className="portrait-frame">
        {imageUrl ? (
          <img src={imageUrl} alt="Portrait du personnage" className="portrait-img" />
        ) : (
          <div className="portrait-placeholder">
            Aucun portrait<br />
            Upload une image ou colle une URL
          </div>
        )}
      </div>

      {/* URL */}
      <input
        className="portrait-url-input"
        type="text"
        placeholder="URL de l'image (Google Drive / Imgur / Web)"
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
      />

      <div className="portrait-actions">
        <button type="button" className="portrait-upload-btn" onClick={applyUrl}>
          Charger depuis une URL
        </button>

      

        {imageUrl && (
          <>
            <button type="button" className="portrait-upload-btn portrait-primary" onClick={recropExisting}>
              Recadrer l’image
            </button>

          </>
        )}
      </div>

      {/* Input fichier caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFileChange}
      />

      {/* Modal crop */}
      {isCropping && (
        <div className="portrait-crop-overlay" role="dialog" aria-modal="true">
          <div className="portrait-crop-modal">
            <div className="portrait-crop-title">Recadrer le portrait</div>

            <div className="portrait-crop-area">
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4}
                cropShape="rect"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="portrait-crop-controls">
              <label className="portrait-crop-zoom">
                Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
              </label>

              <div className="portrait-crop-buttons">
                <button type="button" className="portrait-upload-btn" onClick={cancelCrop}>
                  Annuler
                </button>
                <button type="button" className="portrait-upload-btn portrait-primary" onClick={validateCrop}>
                  Valider le recadrage
                </button>
              </div>
            </div>

            <div className="portrait-crop-hint">
              Le recadrage ne passe que par “Recadrer l’image”.
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CharacterPortrait;
