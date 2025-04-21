"use client";
import React, { useEffect, useState } from 'react';
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
  const [clickData, setClickData] = useState<Array<{size: number, time: number}>>([]);

  // Box sizes
  const redBoxSize = 10;
  const minBlueBoxSize = 20;
  const maxBlueBoxSize = 160;

  // Generate random size for blue box
  const getRandomBlueBoxSize = () => {
    return Math.floor(Math.random() * (maxBlueBoxSize - minBlueBoxSize + 1)) + minBlueBoxSize;
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
        const newDataPoint = {
          size: blueBoxSize,
          time: timeSinceLastClick
        };
        setClickData(prev => [...prev, newDataPoint]);
        console.log(`Recorded click: Size=${blueBoxSize}px, Time=${timeSinceLastClick.toFixed(2)}ms`);
      }
    }
    
    // Update last click time regardless of box color
    setLastClickTime(currentTime);

    if (newClickCount === 18 && movementStartTime !== null) {
      const endTime = currentTime;
      const totalTime = endTime - movementStartTime;

      console.log(`Time taken for 18 clicks: ${totalTime.toFixed(2)} ms ✅`);
      console.log(`Total mouse movement distance: ${totalDistance.toFixed(2)} px 🧠`);
      console.log('Recorded data points:', clickData);
      toast(`18 clicks done! Time: ${totalTime.toFixed(2)} ms, Distance: ${totalDistance.toFixed(2)} px`);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }

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
      
      // Random position for blue box (using new size)
      const maxX = window.innerWidth - newBlueBoxSize;
      const maxY = window.innerHeight - newBlueBoxSize;

      let newX, newY;
      do {
        newX = Math.floor(Math.random() * maxX);
        newY = Math.floor(Math.random() * maxY);
      } while (newX === position.left && newY === position.top);

      setPosition({ top: newY, left: newX });
    }
  };

  useEffect(() => {
    setBlueBoxSize(getRandomBlueBoxSize());
    
    const centerX = (window.innerWidth - redBoxSize) / 2; 
    const centerY = (window.innerHeight - redBoxSize) / 2; 
    setClicked(0);
    setMovementStartTime(null);  // Reset timer on page load
    setLastClickTime(null);      // Reset last click time
    setClickData([]);            // Reset collected data
    setPosition({ top: centerY, left: centerX });
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

  const squareStyle = {
    width: isRedBox ? `${redBoxSize}px` : `${blueBoxSize}px`,
    height: isRedBox ? `${redBoxSize}px` : `${blueBoxSize}px`,
    backgroundColor: isRedBox ? 'red' : 'skyblue',
    position: 'absolute' as const,
    top: position.top,
    left: position.left,
    cursor: 'pointer'
  };

  return (
    <div className="h-screen flex flex-col items-center">
        {showConfetti && <Confetti />}
      <div className="font-semibold text-3xl font-[poppins] mt-6">
        Click on the box!
      </div>
      <p className="font-[poppins] text-gray-500">
        No of Clicks: {clicked}
      </p>
    
      <div className="shadow-lg rounded-lg" style={squareStyle} onClick={handleClick}></div>
    </div>
  );
}
