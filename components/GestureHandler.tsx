import React, { useEffect, useRef, useState } from 'react';
import { useTreeStore } from '../store';
import { AppState } from '../types';

// Accessing the global variable loaded via CDN in index.html
declare global {
  interface Window {
    vision: any;
  }
}

const GestureHandler: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setHandGesture, setAppState, setCameraReady } = useTreeStore();
  const [loading, setLoading] = useState(true);
  const lastVideoTimeRef = useRef(-1);
  const requestRef = useRef<number>();

  useEffect(() => {
    let gestureRecognizer: any;
    let runningMode = "VIDEO";

    const createGestureRecognizer = async () => {
      try {
        const vision = await window.vision.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        gestureRecognizer = await window.vision.GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: runningMode
        });
        setLoading(false);
      } catch (error) {
        console.error("Error loading MediaPipe:", error);
      }
    };

    createGestureRecognizer();

    const enableCam = async () => {
      if (!videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", predictWebcam);
        setCameraReady(true);
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    };

    const predictWebcam = async () => {
      if (!gestureRecognizer || !videoRef.current) return;

      if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = videoRef.current.currentTime;
        const results = gestureRecognizer.recognizeForVideo(videoRef.current, Date.now());

        if (results.gestures.length > 0) {
          const gestureName = results.gestures[0][0].categoryName;
          const handLandmarks = results.landmarks[0];
          
          // Calculate centroid (simplified to wrist or index)
          // 0 is wrist, 9 is middle finger mcp. Let's use 9 for center of palm approx.
          const x = 1 - handLandmarks[9].x; // Mirror x
          const y = handLandmarks[9].y;

          setHandGesture({
            gesture: gestureName,
            x,
            y
          });

          // Logic mapping
          if (gestureName === "Open_Palm") {
            setAppState(AppState.CHAOS);
          } else if (gestureName === "Closed_Fist") {
            setAppState(AppState.FORMED);
          }
        } else {
             setHandGesture({ gesture: 'None', x: 0.5, y: 0.5 });
        }
      }
      requestRef.current = requestAnimationFrame(predictWebcam);
    };

    if (!loading) {
      enableCam();
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return (
    <div className="fixed bottom-4 right-4 z-50 overflow-hidden rounded-xl border-2 border-gold-500 shadow-[0_0_20px_rgba(197,160,89,0.3)]">
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-32 h-24 object-cover transform -scale-x-100 transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-80'}`}
        />
        {loading && <div className="absolute inset-0 flex items-center justify-center bg-black text-gold-300 text-xs font-serif">Initializing AI...</div>}
    </div>
  );
};

export default GestureHandler;
