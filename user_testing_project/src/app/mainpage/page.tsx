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
  const [clickData, setClickData] = useState<Array<{ size: number, time: number, distance: number, distanceMultiplier?: number, errors: number }>>([]);
  const [previousBoxPosition, setPreviousBoxPosition] = useState({ top: 0, left: 0 });
  const [currentErrors, setCurrentErrors] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [currentDistanceMultiplier, setCurrentDistanceMultiplier] = useState<number>(0.2);
  
  // Tracking for test completion
  const [testCompleted, setTestCompleted] = useState(false);
  
  // New states for tracking multiple tests
  const [testCount, setTestCount] = useState(0);
  const [allTestsData, setAllTestsData] = useState<Array<{ size: number, time: number, distanceMultiplier: number, errors: number, testNumber: number }>>([]); 
  const [userId, setUserId] = useState<string>('');
  const boxRef = useRef<HTMLDivElement>(null);

  // Constants for test configuration
  const redBoxSize = 18;
  const blueBoxSizes = [40, 90, 140];
  const distanceMultipliers = [0.2, 0.5, 0.8];
  const clicksPerTest = 18; // Number of clicks needed to complete a test

  // Generate a random user ID on first load
  useEffect(() => {
    // Generate a random user ID (8 characters)
    const randomUserId = Math.random().toString(36).substring(2, 10);
    setUserId(randomUserId);
    console.log(`User ID for this session: ${randomUserId}`);
  }, []);

  // Blue box size is randomly selected from the array of sizes
  const getNextBlueBoxSize = () => {
    const randomIndex = Math.floor(Math.random() * blueBoxSizes.length);
    return blueBoxSizes[randomIndex];
  };

  // Get the next position for the blue box based on the distance multiplier
  const getNextBlueBoxPosition = (blueBoxSize: number) => {
    const screenWidth = window.innerWidth;
    const centerX = (screenWidth - redBoxSize) / 2;
    const centerY = (window.innerHeight - redBoxSize) / 2;

    const randomIndex = Math.floor(Math.random() * distanceMultipliers.length);
    const distanceMultiplier = distanceMultipliers[randomIndex];

    setCurrentDistanceMultiplier(distanceMultiplier);

    const goLeft = Math.random() > 0.5;
    const distance = screenWidth * distanceMultiplier;
    const maxDistance = (screenWidth / 2) - blueBoxSize;
    const actualDistance = Math.min(distance, maxDistance);

    const xPosition = goLeft
      ? centerX - actualDistance - blueBoxSize / 2
      : centerX + actualDistance - blueBoxSize / 2;

    return {
      left: Math.max(0, Math.min(screenWidth - blueBoxSize, xPosition)),
      top: centerY - (blueBoxSize - redBoxSize) / 2
    };
  };

  // Calculate the distance between two boxes
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

  // Create and download CSV file with all test data
  const generateCSVFile = () => {
    // Add header row (removed distance_px column)
    const csvContent = [
      "user_id,test_number,size,time_ms,distance_multiplier,errors",
      ...allTestsData.map(point => 
        `${userId},${point.testNumber},${point.size},${point.time.toFixed(2)},${point.distanceMultiplier},${point.errors}`
      )
    ].join('\n');

    // Create a blob with the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `user_test_data_${userId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`CSV file generated with ${allTestsData.length} data points!`);
  };

  // Handle click event on the box
  const handleClick = () => {
    const clickSound = new Audio('/sounds/correct.mp3');
    clickSound.play();

    const currentTime = performance.now();

    // If this is the first click, start the timer and reset distances
    if (clicked === 0) {
      setMovementStartTime(currentTime);
      setTotalDistance(0);
      setLastClickTime(currentTime);
      setCurrentErrors(0);
      setTotalErrors(0);
      setTestCompleted(false);
      console.log(`Test ${testCount + 1} started!`);
    }

    let newClickCount = 0;
    if (!isRedBox) {
      // If the box is blue, calculate the distance and time since last click
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
          distanceMultiplier: currentDistanceMultiplier,
          errors: currentErrors
        };

        const updatedClickData = [...clickData, newDataPoint];
        setClickData(updatedClickData);

        console.log(`Recorded click: Size=${blueBoxSize}px, Time=${timeSinceLastClick.toFixed(2)}ms, Errors=${currentErrors}`);

        // Check if this is the last click of the test (blue click #9 = 18 total clicks)
        if (newClickCount === clicksPerTest && !testCompleted) {
          setTestCompleted(true);
          const endTime = currentTime;
          const totalTime = endTime - (movementStartTime || currentTime);

          console.log(`Test ${testCount + 1} completed with ${updatedClickData.length} blue box clicks`);
          console.log(`Time taken for test: ${totalTime.toFixed(2)} ms ✅`);
          console.log(`Total errors: ${totalErrors} misclicks 🚫`);

          const currentTestNumber = testCount + 1;
          
          // Add test number to each data point and store in all tests data
          const dataWithTestNumber = updatedClickData.map(point => ({
            size: point.size,
            time: point.time,
            distanceMultiplier: point.distanceMultiplier || currentDistanceMultiplier,
            errors: point.errors,
            testNumber: currentTestNumber
          }));
          
          setAllTestsData(prevData => [...prevData, ...dataWithTestNumber]);
          
          // Increment test count
          const newTestCount = currentTestNumber;
          setTestCount(newTestCount);

          // Show success message
          toast(`Test ${currentTestNumber} complete! Time: ${totalTime.toFixed(2)} ms, Errors: ${totalErrors}`);
          
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            
            // Check if we've completed all 10 tests
            if (newTestCount >= 10) {
              // Show final success message and generate CSV
              toast.success(`All 10 tests completed! Generating CSV file...`, {
                duration: 5000
              });
              
              // Short delay before generating the file to ensure UI updates
              setTimeout(() => {
                generateCSVFile();
              }, 1000);
            }
            
            resetTest();
          }, 3000);
        }
      }
    }

    setLastClickTime(currentTime);
    setPreviousBoxPosition({ ...position });

    const nextIsRedBox = !isRedBox;
    setIsRedBox(nextIsRedBox);
    setCurrentErrors(0);

    // Calculate the distance to the next box or put in center if red
    if (nextIsRedBox) {
      const centerX = (window.innerWidth - redBoxSize) / 2;
      const centerY = (window.innerHeight - redBoxSize) / 2;
      setPosition({ top: centerY, left: centerX });
    } else {
      const newBlueBoxSize = getNextBlueBoxSize();
      setBlueBoxSize(newBlueBoxSize);

      const newPosition = getNextBlueBoxPosition(newBlueBoxSize);
      setPosition(newPosition);
    }
  };

  // Reset the test to its initial state
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
    setTestCompleted(false);
  };

  // Handle forceful end of test
  const handleEndTest = () => {
    if (movementStartTime !== null && lastClickTime !== null) {
      const currentTime = performance.now();
      const totalTime = currentTime - movementStartTime;

      console.log(`Test ended early. Clicks: ${clicked}`);
      console.log(`Time taken: ${totalTime.toFixed(2)} ms`);
      console.log(`Total errors: ${totalErrors} misclicks 🚫`);

      toast(`Test ended early. Clicks: ${clicked}, Time: ${totalTime.toFixed(2)} ms, Errors: ${totalErrors}`, {
        duration: 2000
      });
      
      // Don't add incomplete tests to allTestsData
      
      setShowConfetti(false);
      resetTest();
    } else {
      toast.error("You haven't started the test yet!", {
        duration: 1500
      });
    }
  };

  // Mouse movement tracking
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

  // Initial setup
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
    setTestCompleted(false);
  }, []);

  const endButtonRef = useRef<HTMLButtonElement>(null);

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
    <div
      className="h-screen flex flex-col items-center"
      onClick={(e) => {
        // Only count errors when blue box is active (not red box)
        if (!isRedBox && !testCompleted) {
          const isBoxClick = boxRef.current?.contains(e.target as Node);
          const isEndButtonClick = endButtonRef.current?.contains(e.target as Node);

          if (!isBoxClick && !isEndButtonClick) {
            const errorSound = new Audio('/sounds/error.mp3');
            errorSound.play();

            setCurrentErrors(prev => prev + 1);
            setTotalErrors(prev => prev + 1);
          }
        }
      }}
    >
      {showConfetti && <Confetti />}
      <div className="font-semibold text-3xl font-[poppins] mt-6">
        Click on the box!
      </div>
      <p className="font-[poppins] text-gray-500">
        No of Clicks: {clicked} | Errors: {totalErrors} | Test: {testCount}/10
      </p>
      <p className="font-[poppins] text-gray-400 text-sm">
        User ID: {userId}
      </p>

      <div className="shadow-lg rounded-lg" style={squareStyle} onClick={handleClick} ref={boxRef}></div>
      <button
        ref={endButtonRef}
        onClick={handleEndTest}
        className="mt-4 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all font-[poppins]"
      >
        End Test
      </button>
      
      {testCount >= 10 && (
        <button
          onClick={generateCSVFile}
          className="mt-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-all font-[poppins]"
        >
          Download CSV Data
        </button>
      )}
    </div>
  );
}
