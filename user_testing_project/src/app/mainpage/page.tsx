"use client";
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti'
import { toast } from 'sonner';

export default function Main() {
  const [clicked, setClicked] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClick = () => {
    // Play ding sound on click
    const clickSound = new Audio('/sounds/ding-12662.mp3');
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


    const maxX = window.innerWidth - 150;
    const maxY = window.innerHeight - 150;

    let newX, newY;
    do {
      newX = Math.floor(Math.random() * maxX);
      newY = Math.floor(Math.random() * maxY);
    } while (newX === position.left && newY === position.top);

    setPosition({ top: newY, left: newX });
  };

  useEffect(() => {
    const centerX = (window.innerWidth - 100) / 2;
    const centerY = (window.innerHeight - 100) / 2;
    setClicked(0);
    setPosition({ top: centerY, left: centerX });
  }, []);

  const squareStyle = {
    width: '150px',
    height: '150px',
    backgroundColor: 'skyblue',
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
