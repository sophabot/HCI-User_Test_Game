# HCI-User_Test_Game

# Fitts' Law Experimental Study


## 📌 Overview

This project tests **[Fitts' Law](https://lawsofux.com/fittss-law/)** — a predictive model of human movement, used to estimate the time required to move to a target area. We developed an interactive application that records a user's speed and accuracy when clicking on randomly placed targets of varying sizes and distances. The experiment involves 10 participants completing 180 trials each.

The goal: to collect performance data and analyze whether Fitts' Law holds true across varying configurations.

---

## 🧪 Experimental Design

- **Participants**: 10 individuals (18+ years old, no assistive devices)
- **Trials per Participant**: 18 (9 unique configurations × 20 trials)
- **Configurations**:  
  - 3 Target Sizes (Small, Medium, Large)  
  - 3 Distances (Near, Medium, Far)  
  - 2 Directions (Left, Right)
- **Target**: Rectangular clickable area
- **Cursor Start**: Center of screen each trial
- **Data Recorded per Trial**:
  - Target size, distance, direction
  - Time taken to successfully click
  - Number of errors (misclicks)
  - Cursor movement distance

---

## 🖥️ Application Features

- Consent screen with informed agreement
- Randomized configuration shuffling
- Real-time feedback after each trial
- Early exit with data discard
- Unique anonymized participant ID
- Results saved as CSV files for easy analysis
- Graceful handling of retries, timeouts, and input validation

---

## 🔧 Tech Stack

- **Frontend**:  HTML/CSS/JS, React
- **Backend / Logic**:  Python, Node.js]

---

## 📊 Data Analysis

Collected data includes:
- Trial setup (target size, distance, direction)
- Completion time in milliseconds
- Number of errors
- Movement distance (optional)




