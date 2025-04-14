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

    const newClickCount = clicked + 1;
    setClicked(newClickCount);

    if (newClickCount === 18) {
      toast('18 clicks done! All set to go!✨✨✅')
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
    setPosition({ top: centerY, left: centerX });
    setIsRedBox(true); 
  }, []);

  const squareStyle = {
    width: isRedBox ? `${redBoxSize}px` : `${blueBoxSize}px`,
    height: isRedBox ? `${redBoxSize}px` : `${blueBoxSize}px`,
    backgroundColor: isRedBox ? 'red' : 'skyblue',
    position: 'absolute',
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
