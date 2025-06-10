
import React, { useState, useEffect, useRef } from 'react';
import { HotspotQuestion, HotspotArea, UserAnswerType } from '../types';

interface HotspotQuestionUIProps {
  question: HotspotQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null; // Clicked hotspotId
  showCorrectAnswer?: boolean;
}

export const HotspotQuestionUI: React.FC<HotspotQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer,
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [userClickCoords, setUserClickCoords] = useState<{x: number, y: number} | null>(null); // Store actual click for display

  useEffect(() => {
    const imgElement = imageRef.current;
    if (imgElement) {
      const handleResize = () => {
        if (imgElement.naturalWidth > 0 && imgElement.naturalHeight > 0) { // Ensure image is loaded
          setImageSize({ width: imgElement.offsetWidth, height: imgElement.offsetHeight });
        }
      };
      
      if (imgElement.complete) { // If image already loaded
          handleResize();
      } else {
          imgElement.onload = handleResize;
      }
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [question.imageUrl]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showCorrectAnswer || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const clickXPercent = (clickX / rect.width) * 100;
    const clickYPercent = (clickY / rect.height) * 100;

    setUserClickCoords({ x: clickXPercent, y: clickYPercent });

    let clickedHotspotId: string | null = null;
    for (const hotspot of question.hotspots) {
      if (isPointInHotspot(clickXPercent, clickYPercent, hotspot)) {
        clickedHotspotId = hotspot.id;
        break; 
      }
    }
    onAnswerChange(clickedHotspotId); 
  };
  
  const isPointInHotspot = (px: number, py: number, hotspot: HotspotArea): boolean => {
    const [coord1, coord2, coord3, coord4] = hotspot.coords; // All coords are percentages
    if (hotspot.shape === 'rect') { // x, y, width, height
      return px >= coord1 && px <= coord1 + coord3 && py >= coord2 && py <= coord2 + coord4;
    } else if (hotspot.shape === 'circle') { // cx, cy, radius
      const distSq = (px - coord1) ** 2 + (py - coord2) ** 2;
      return distSq <= coord3 ** 2;
    }
    return false;
  };


  return (
    <div className="relative w-full max-w-2xl mx-auto" onClick={handleImageClick}>
      <img
        ref={imageRef}
        src={question.imageUrl}
        alt={question.imageAltText || 'Hotspot image'}
        className={`w-full h-auto rounded-md ${!showCorrectAnswer ? 'cursor-pointer' : 'cursor-default'} select-none`}
        style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}
        draggable={false}
      />
      {imageSize && question.hotspots.map(hotspot => {
        const [c1, c2, c3, c4] = hotspot.coords; // percentages
        let style: React.CSSProperties = {
          position: 'absolute',
          pointerEvents: 'none', // Click handled by parent
          border: '2px dashed transparent',
          boxSizing: 'border-box',
        };

        if (hotspot.shape === 'rect') {
          style.left = `${c1}%`;
          style.top = `${c2}%`;
          style.width = `${c3}%`;
          style.height = `${c4}%`;
          style.borderRadius = '4px';
        } else if (hotspot.shape === 'circle') {
          style.left = `${c1 - c3}%`; // cx - r
          style.top = `${c2 - c3}%`;  // cy - r
          style.width = `${c3 * 2}%`; // diameter
          style.height = `${c3 * 2}%`;// diameter
          style.borderRadius = '50%';
        }
        
        let displayHotspot = false;
        if (showCorrectAnswer) {
            displayHotspot = true;
            const isCorrectHotspot = question.correctHotspotIds.includes(hotspot.id);
            const isUserClickedThisHotspot = userAnswer === hotspot.id;

            if (isCorrectHotspot && isUserClickedThisHotspot) {
                style.backgroundColor = 'rgba(74, 222, 128, 0.5)'; // Green, correct and clicked
                style.borderColor = 'rgb(34, 197, 94)';
            } else if (isCorrectHotspot && !isUserClickedThisHotspot) {
                style.backgroundColor = 'rgba(59, 130, 246, 0.4)'; // Blue, correct but not clicked
                style.borderColor = 'rgb(37, 99, 235)';
            } else if (!isCorrectHotspot && isUserClickedThisHotspot) {
                 // User clicked an incorrect hotspot, this one is not it, so just a faint border maybe if we show all
                 // But the actual clicked incorrect hotspot will be handled by userClickCoords marker
                 // So we don't need special style here for non-correct, non-clicked.
            } else {
                 // Not correct, not clicked - make it very subtle or don't show
                 style.borderColor = 'rgba(100, 116, 139, 0.3)'; // Faint gray
                 style.backgroundColor = 'rgba(100, 116, 139, 0.1)';
            }
        }


        return displayHotspot ? <div key={hotspot.id} style={style} /> : null;
      })}
      
      {/* Show user's click marker when answers are revealed */}
      {showCorrectAnswer && userClickCoords && imageSize && (
         (() => {
            const isClickCorrect = userAnswer !== null && question.correctHotspotIds.includes(userAnswer as string);
            const markerColor = isClickCorrect ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'; // Green or Red
            return (
                <div style={{
                    position: 'absolute',
                    left: `${userClickCoords.x}%`,
                    top: `${userClickCoords.y}%`,
                    width: '12px',
                    height: '12px',
                    backgroundColor: markerColor,
                    borderRadius: '50%',
                    border: '2px solid white',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    boxShadow: '0 0 5px rgba(0,0,0,0.5)'
                }} title={`Your click (${isClickCorrect? 'Correct':'Incorrect'})`}/>
            );
         })()
      )}
    </div>
  );
};
