
"use client"
import React, { useEffect, useState } from 'react';



export default function Main() {
    const [clicked, setClicked] = useState(0)
    const [position, setPosition] = useState({ top: 0, left: 0 });
    

    const handleClick = ()=>{
        if (clicked == 18){
            alert('18 clicks completed')
        }
        const maxX = window.innerWidth - 100
        const maxY = window.innerHeight - 100
        setClicked(clicked+1)

        let newX, newY
        // Repeat until we get a different position
        do{
            newX = Math.floor(Math.random()* maxX);
            newY = Math.floor(Math.random()* maxY)

        } while (newX === position.left && newY === position.top)
        setPosition({top: newY, left: newX }); 
        
    }

    useEffect(()=>{
        const centerX = (window.innerWidth-100)/2;
        const centerY = (window.innerHeight-100)/2;
        setClicked(0);
        setPosition({top: centerY, left: centerX})
    }, [])
    const squareStyle = {
          width: '150px',
          height: '150px',
          backgroundColor: 'skyblue',
          position: 'absolute',
          top: position.top,
          left: position.left,
        };
  return (
    
    <div className="h-screen flex flex-col items-center ">
        <div className="font-semibold text-3xl font-[poppins] mt-6 ">
            Click on the box! 
        </div>
        <p className="font-[poppins] text-gray-500"> No of Clicks : {clicked}</p>
        <div className='shadow-lg rounded-lg' style={squareStyle} onClick={handleClick}></div>
    </div>



  );
}