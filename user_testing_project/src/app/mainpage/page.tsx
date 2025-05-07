"use client";
import React, { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { toast } from 'sonner';

export default function Main() {
  const [clicked, setClicked] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [isRedBox, setIsRedBox] = useState(true);
  const [blueBoxSize, setBlueBoxSize] = useState(150);
  const [movementStartTime, setMovementStartTime] = useState<number | null>(null);
  const [lastMousePos, setLastMousePos] = useState<{ x: number, y: number } | null>(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);
  const [clickData, setClickData] = useState<Array<{ size: number, time: number, distance: number, errors: number }>>([]);
  const [previousBoxPosition, setPreviousBoxPosition] = useState({ top: 0, left: 0 });
  const [currentErrors, setCurrentErrors] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);

  const redBoxSize = 18;
  const blueBoxSizes = [40, 90, 140];

  // Define distance multipliers for positioning
  const distanceMultipliers = [0.2, 0.5, 0.8]; // close, medium, far (as percentage of screen width)

  const getNextBlueBoxSize = () => {
    const randomIndex = Math.floor(Math.random() * blueBoxSizes.length);
    return blueBoxSizes[randomIndex];
  };

  // New function to get the next position based on distances
  const getNextBlueBoxPosition = (blueBoxSize: number) => {
    // Get screen dimensions
    const screenWidth = window.innerWidth;
    const centerX = (screenWidth - redBoxSize) / 2;
    const centerY = (window.innerHeight - redBoxSize) / 2;

    // Choose a random distance multiplier
    const randomIndex = Math.floor(Math.random() * distanceMultipliers.length);
    const distanceMultiplier = distanceMultipliers[randomIndex];

    // Determine if box should go left or right of center (randomly)
    const goLeft = Math.random() > 0.5;

    // Calculate the position based on screen width and chosen distance
    const distance = screenWidth * distanceMultiplier;

    // Account for box size in positioning to prevent going off-screen
    const maxDistance = (screenWidth / 2) - blueBoxSize;
    const actualDistance = Math.min(distance, maxDistance);

    // Calculate the final position
    const xPosition = goLeft
      ? centerX - actualDistance - blueBoxSize / 2
      : centerX + actualDistance - blueBoxSize / 2;

    // Return position at same y-coordinate as red box
    return {
      left: Math.max(0, Math.min(screenWidth - blueBoxSize, xPosition)),
      top: centerY - (blueBoxSize - redBoxSize) / 2 // Align centers vertically
    };
  };

  const calculateBoxDistance = (pos1: { top: number, left: number }, pos2: { top: number, left: number }, size1: number, size2: number) => {
    const center1 = {
      x: pos1.left + size1 / 2,
      y: pos1.top + size1 / 2
    };

    const center2 = {
      x: pos2.left + size2 / 2,
      y: pos2.top + size2 / 2
    };

    const dx = center2.x - center1.x;
    const dy = center2.y - center1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleClick = () => {
    const clickSound = new Audio('/sounds/correct.mp3');
    clickSound.play();

    const currentTime = performance.now();

    if (clicked === 0) {
      setMovementStartTime(currentTime);
      setTotalDistance(0);
      setLastClickTime(currentTime);
      setTotalErrors(0);
      console.log('First click — timer started!');
    }

    let newClickCount = 0;
    if (!isRedBox) {
      newClickCount = clicked + 1;
      setClicked(newClickCount);

      if (lastClickTime !== null) {
        const timeSinceLastClick = currentTime - lastClickTime;

        const boxDistance = calculateBoxDistance(
          position,
          previousBoxPosition,
          blueBoxSize,
          redBoxSize
        );

        const newDataPoint = {
          size: blueBoxSize,
          time: timeSinceLastClick,
          distance: boxDistance,
          errors: currentErrors
        };

        // Update clickData with the new point
        const updatedClickData = [...clickData, newDataPoint];
        setClickData(updatedClickData);
        
        console.log(`Recorded click: Size=${blueBoxSize}px, Time=${timeSinceLastClick.toFixed(2)}ms, Distance=${boxDistance.toFixed(2)}px, Errors=${currentErrors}`);
        
        // Check for test completion after adding the data point
        if (newClickCount === 18 && movementStartTime !== null) {
          const endTime = currentTime;
          const totalTime = endTime - movementStartTime;

          // Use the updated clickData directly, not the state
          console.log(`Time taken for 18 clicks: ${totalTime.toFixed(2)} ms ✅`);
          console.log(`Total mouse movement distance: ${totalDistance.toFixed(2)} px 🧠`);
          console.log(`Total errors: ${totalErrors} misclicks 🚫`);
          
          // Format data for Excel
          const excelData = updatedClickData.map(point => 
            `${point.size},${point.time.toFixed(2)},${point.distance.toFixed(2)},${point.errors}`
          ).join('\n');
          
          console.log('Excel-formatted data:');
          console.log(excelData);
          
          toast(`18 clicks done! Time: ${totalTime.toFixed(2)} ms, Distance: ${totalDistance.toFixed(2)} px, Errors=${totalErrors}. If left move to your next test`);
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            resetTest();
          }, 5000);
        }
      }
    }

    setLastClickTime(currentTime);
    setPreviousBoxPosition({ ...position });
    
    const nextIsRedBox = !isRedBox;
    setIsRedBox(nextIsRedBox);
    setCurrentErrors(0);

    if (nextIsRedBox) {
      const centerX = (window.innerWidth - redBoxSize) / 2;
      const centerY = (window.innerHeight - redBoxSize) / 2;
      setPosition({ top: centerY, left: centerX });
    } else {
      const newBlueBoxSize = getNextBlueBoxSize();
      setBlueBoxSize(newBlueBoxSize);

      // Use the new positioning function instead of random positions
      const newPosition = getNextBlueBoxPosition(newBlueBoxSize);
      setPosition(newPosition);
    }
  };

  useEffect(() => {
    setBlueBoxSize(getNextBlueBoxSize());

    const centerX = (window.innerWidth - redBoxSize) / 2;
    const centerY = (window.innerHeight - redBoxSize) / 2;
    const centerPosition = { top: centerY, left: centerX };

    setClicked(0);
    setMovementStartTime(null);
    setLastClickTime(null);
    setClickData([]);
    setPosition(centerPosition);
    setPreviousBoxPosition(centerPosition);
    setIsRedBox(true);
    setTotalDistance(0);
    setLastMousePos(null);
    setCurrentErrors(0);
    setTotalErrors(0);
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;

      if (lastMousePos !== null) {
        const dx = clientX - lastMousePos.x;
        const dy = clientY - lastMousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        setTotalDistance(prev => prev + distance);
      }
      setLastMousePos({ x: clientX, y: clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [lastMousePos]);

  const boxRef = useRef<HTMLDivElement>(null);

  const squareStyle = {
    width: isRedBox ? `${redBoxSize}px` : `${blueBoxSize}px`,
    height: isRedBox ? `${redBoxSize}px` : `${blueBoxSize}px`,
    backgroundColor: isRedBox ? 'red' : 'skyblue',
    position: 'absolute' as const,
    top: position.top,
    left: position.left,
    cursor: 'pointer'
  };

  const resetTest = () => {
    const centerX = (window.innerWidth - redBoxSize) / 2;
    const centerY = (window.innerHeight - redBoxSize) / 2;
    const centerPosition = { top: centerY, left: centerX };

    setClicked(0);
    setMovementStartTime(null);
    setLastClickTime(null);
    setClickData([]);
    setPosition(centerPosition);
    setPreviousBoxPosition(centerPosition);
    setIsRedBox(true);
    setTotalDistance(0);
    setLastMousePos(null);
    setBlueBoxSize(getNextBlueBoxSize());
    setCurrentErrors(0);
    setTotalErrors(0);
  };

  const handleEndTest = () => {
    if (movementStartTime !== null && lastClickTime !== null) {
      const currentTime = performance.now();
      const totalTime = currentTime - movementStartTime;

      console.log(`Test ended early. Clicks: ${clicked}`);
      console.log(`Time taken: ${totalTime.toFixed(2)} ms`);
      console.log(`Total mouse movement distance: ${totalDistance.toFixed(2)} px`);
      console.log(`Total errors: ${totalErrors} misclicks 🚫`);
      
      // Format data for Excel
      const excelData = clickData.map(point => 
        `${point.size},${point.time.toFixed(2)},${point.distance.toFixed(2)},${point.errors}`
      ).join('\n');
      
      console.log('Excel-formatted data:');
      console.log(excelData);

      toast(`Test ended early. Clicks: ${clicked}, Time: ${totalTime.toFixed(2)} ms, Errors: ${totalErrors}`, {
        duration: 2000
      });
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        resetTest();
      }, 3000);
    } else {
      toast.error("You haven't started the test yet!", {
        duration: 1500
      });
    }
  };

  const endButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className="h-screen flex flex-col items-center"
      onClick={(e) => {
        const isBoxClick = boxRef.current?.contains(e.target as Node);
        const isEndButtonClick = endButtonRef.current?.contains(e.target as Node);

        if (!isBoxClick && !isEndButtonClick) {
          const errorSound = new Audio('/sounds/error.mp3');
          errorSound.play();

          setCurrentErrors(prev => prev + 1);
          setTotalErrors(prev => prev + 1);
        }
      }}
    >
      {showConfetti && <Confetti />}
      <div className="font-semibold text-3xl font-[poppins] mt-6">
        Click on the box!
      </div>
      <p className="font-[poppins] text-gray-500">
        No of Clicks: {clicked} | Errors: {totalErrors}
      </p>

      <div className="shadow-lg rounded-lg" style={squareStyle} onClick={handleClick} ref={boxRef}></div>
      <button
        ref={endButtonRef}
        onClick={handleEndTest}
        className="mt-4 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all font-[poppins]"
      >
        End Test
      </button>
    </div>
  );
}
