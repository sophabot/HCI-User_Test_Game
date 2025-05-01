"use client";
import React, { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti'
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
  const [clickData, setClickData] = useState<Array<{size: number, time: number, distance: number}>>([]);
  const [previousBoxPosition, setPreviousBoxPosition] = useState({ top: 0, left: 0 });


  // Box sizes
  const redBoxSize = 10;
  const minBlueBoxSize = 20;
  const maxBlueBoxSize = 160;

  // Generate random size for blue box
  const getRandomBlueBoxSize = () => {
    return Math.floor(Math.random() * (maxBlueBoxSize - minBlueBoxSize + 1)) + minBlueBoxSize;
  };

  // Calculate distance between two box centers
  const calculateBoxDistance = (pos1: { top: number, left: number }, pos2: { top: number, left: number }, size1: number, size2: number) => {

    const center1 = {
      x: pos1.left + size1 / 2,
      y: pos1.top + size1 / 2
    };
    
    const center2 = {
      x: pos2.left + size2 / 2,
      y: pos2.top + size2 / 2
    };
    
    // Calculate distance using cool formula 
    const dx = center2.x - center1.x;
    const dy = center2.y - center1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleClick = () => {
    // Play ding sound on correct click
    const clickSound = new Audio('/sounds/correct.mp3');
    clickSound.play();

    const currentTime = performance.now();

    if (clicked === 0) {
      setMovementStartTime(currentTime);
      setTotalDistance(0);
      setLastClickTime(currentTime);
      console.log('First click — timer started!');
    }

    let newClickCount = 0;
    if (!isRedBox) {
      newClickCount = clicked + 1;
      setClicked(newClickCount);
      
      // Record data point for blue box click
      if (lastClickTime !== null) {
        const timeSinceLastClick = currentTime - lastClickTime;
        
        const boxDistance = calculateBoxDistance(
          position,           // Current blue box pos
          previousBoxPosition, // Middle pos
          blueBoxSize,        // Current blue box size
          redBoxSize
        );
        
        const newDataPoint = {
          size: blueBoxSize,
          time: timeSinceLastClick,
          distance: boxDistance
        };
        
        setClickData(prev => [...prev, newDataPoint]);
        console.log(`Recorded click: Size=${blueBoxSize}px, Time=${timeSinceLastClick.toFixed(2)}ms, Distance=${boxDistance.toFixed(2)}px`);
      }
    }
    
    // Update last click time regardless of box color
    setLastClickTime(currentTime);

    if (newClickCount === 3 && movementStartTime !== null) {
      const endTime = currentTime;
      const totalTime = endTime - movementStartTime;

      console.log(`Time taken for 18 clicks: ${totalTime.toFixed(2)} ms ✅`);
      console.log(`Total mouse movement distance: ${totalDistance.toFixed(2)} px 🧠`);
      console.log('Recorded data points:', clickData);
      toast(`18 clicks done! Time: ${totalTime.toFixed(2)} ms, Distance: ${totalDistance.toFixed(2)} px. If left move to your next test`);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        resetTest();
      }, 5000);
    }

    // Save current pos before changing it
    setPreviousBoxPosition({ ...position });

    // Toggle between center box and random generated pos
    const nextIsRedBox = !isRedBox;
    setIsRedBox(nextIsRedBox);

    if (nextIsRedBox) {
      const centerX = (window.innerWidth - redBoxSize) / 2;
      const centerY = (window.innerHeight - redBoxSize) / 2;
      setPosition({ top: centerY, left: centerX });
    } else {
      const newBlueBoxSize = getRandomBlueBoxSize();
      setBlueBoxSize(newBlueBoxSize);
      
      // Random position for blue box 
      const safeTopOffset = 100; // Keep blue box away from top
      const maxX = window.innerWidth - newBlueBoxSize;
      const maxY = window.innerHeight - newBlueBoxSize;

      let newX, newY;
      do {
        newX = Math.floor(Math.random() * maxX);
        newY = Math.floor(Math.random() * (maxY - safeTopOffset)) + safeTopOffset;
      } while (newX === position.left && newY === position.top); //shifting it down

      setPosition({ top: newY, left: newX });
    }
  };

  useEffect(() => {
    setBlueBoxSize(getRandomBlueBoxSize());
    
    const centerX = (window.innerWidth - redBoxSize) / 2; 
    const centerY = (window.innerHeight - redBoxSize) / 2; 
    const centerPosition = { top: centerY, left: centerX };
    
    setClicked(0);
    setMovementStartTime(null);      // Reset timer on page load
    setLastClickTime(null);          // Reset last click time
    setClickData([]);                // Reset collected data
    setPosition(centerPosition);
    setPreviousBoxPosition(centerPosition);
    setIsRedBox(true);
    setTotalDistance(0);
    setLastMousePos(null); 
  }, []);

  // Mouse distance tracking effect
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

  //to reset once 18 clicks are done per trial
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
    setBlueBoxSize(getRandomBlueBoxSize());
  };
  
  

  const handleEndTest = () => {
    if (movementStartTime !== null && lastClickTime !== null) {
      const currentTime = performance.now();
      const totalTime = currentTime - movementStartTime;
  
      console.log(`Test ended early. Clicks: ${clicked}`);
      console.log(`Time taken: ${totalTime.toFixed(2)} ms`);
      console.log(`Total mouse movement distance: ${totalDistance.toFixed(2)} px`);
      console.log('Recorded data points:', clickData);
  
      toast(`Test ended early. Clicks: ${clicked}, Time: ${totalTime.toFixed(2)} ms`, {
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
    
    <div className="h-screen flex flex-col items-center"
    onClick={(e) => {
      const isBoxClick = boxRef.current?.contains(e.target as Node);
      const isEndButtonClick = endButtonRef.current?.contains(e.target as Node);
    
      if (!isBoxClick && !isEndButtonClick) {
        const errorSound = new Audio('/sounds/error.mp3');
        errorSound.play();
        toast.error("Wrong place! ❌", { duration: 900 });
      }
    }}
    >
        {showConfetti && <Confetti />}
      <div className="font-semibold text-3xl font-[poppins] mt-6">
        Click on the box!
      </div>
      <p className="font-[poppins] text-gray-500">
        No of Clicks: {clicked}
      </p>
    
      <div className="shadow-lg rounded-lg" style={squareStyle} onClick={handleClick} ref= {boxRef}></div>
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
