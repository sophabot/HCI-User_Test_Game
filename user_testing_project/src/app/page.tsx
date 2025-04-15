"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Preloader from '@/components/ui/preloader';

export default function TermsPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true) //for the preloader

  useEffect(() => {
    // Fake loading time (like 2 seconds)for the preloader to load
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  const handleAccept = () => {
    // Store acceptance in localStorage to remember across sessions
    localStorage.setItem('termsAccepted', 'true');
    router.push('/mainpage');
  };

  if (loading) {
    return <Preloader/>; 
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 bg-gray-50 ">
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-4xl font-extrabold mb-4 text-center font-[poppins] text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-300 to-sky-400 drop-shadow-[0_1px_6px_rgba(147,197,253,0.6)]">
      Welcome!
      </h1>

        <h1 className="text-3xl font-bold mb-6 text-center font-[poppins]">Terms and Conditions</h1>
        
        <div className="border border-gray-200 p-4 mb-6 h-64 overflow-y-auto rounded">
          <div className="text-gray-700 space-y-4 font-[poppins]">
            <p>
              Please read the following informed consent document. If you consent to the study, 
              click "I have read and accept the terms and conditions," and "Continue to Game." If you do not consent and 
              would like to cancel your participation in the study, do not move on.
            </p>
            
            <h2 className="text-xl font-bold mt-4">Project Title: CS470 HCI – Fitts' Law study</h2>
            
            <div className="mt-3">
              <h3 className="font-bold">Research Team:</h3>
              <ul className="list-disc pl-5">
                <li>Group Member 1 (email.address@mnsu.edu)</li>
                <li>Group Member 2 (email.address@mnsu.edu)</li>
                <li>Group Member 3 (email.address@mnsu.edu)</li>
                <li>Group Member 4 (email.address@mnsu.edu)</li>
              </ul>
            </div>
            
            <p>
              Thank you for agreeing to participate in this research study! This document provides 
              important information about what you will be asked to do during the research study, 
              about the risks and benefits of the study, and about your rights as a research subject. 
              If you have any questions about or do not understand something in this document, you 
              should ask questions to the members of the research team listed above. Do not agree to 
              participate in this research study unless the research team has answered your questions 
              and you decide that you want to be part of this study.
            </p>
            
            <p>
              The purpose of this research study is to evaluate how accurately a user can click on 
              differently-sized circles on screen. During the study, you will be randomly presented with [what?]. 
              There will be a total of [how many] trials, and each trial will take anywhere from [minimum time] 
              to [maximum time] seconds, depending on your speed. The entire study should take no longer 
              than [maximum aggregate time of 180 tests] minutes to complete.
            </p>
            
            <div className="mt-3">
              <h3 className="font-bold">To participate in this study, you must:</h3>
              <ul className="list-disc pl-5">
                <li>Criterion 1</li>
                <li>Criterion 2</li>
              </ul>
            </div>
            
            <p>
              To collect data, our software will record how much you move the mouse, how long it takes 
              you to successfully complete each trial, and whether you make any errors. This information 
              will be recorded anonymously, and no personally identifiable information will be collected.
            </p>
            
            <p>
              You will not be compensated for your participation in this study. We do not believe there 
              are any direct benefits to you based on your participation in the study. We do not anticipate 
              any significant risks in your participating in this study.
            </p>
            
            <p>
              You may end your participation in the study at any time. If you wish to end your participation, 
              please notify one of the researchers. If you decide to end your participation early, any results 
              collected by the software for your session will not be saved.
            </p>
            
            <p>
              By consenting, you hereby acknowledge that you are at least 18 years of age, and that 
              you are (other inclusion criteria). You also indicate that you agree to the following statement:
            </p>
            
            <p className="italic font-[poppins]">
              "I have read this consent form and I understand the risks, benefits, and procedures involved 
              with participation in this research study. I hereby agree to participate in this research study."
            </p>
          </div>
        </div>
        
        <div className="flex items-center mb-6">
          <input 
            type="checkbox" 
            id="accept" 
            className="mr-2"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <label htmlFor="accept" className="text-gray-800 font-[poppins]">
            I have read and accept the terms and conditions
          </label>
        </div>
        
        <button 
          onClick={handleAccept} 
          disabled={!accepted}
          className={`w-full py-2 px-4 rounded-md transition duration-200 font-[poppins] ${
            accepted 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Game
        </button>
      </div>
    </div>
  );
}