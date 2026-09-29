# Ultra-HD Smooth Demonstration Recorder for Synthera DAKSH-01

$ErrorActionPreference = "Continue"

Write-Host "=========================================="
Write-Host " Preparing Clean App Environment          "
Write-Host "=========================================="

# Clean restart to ensure 0 state residue
adb shell am force-stop com.currentlyapp
Start-Sleep -Seconds 1
adb shell am start -n com.currentlyapp/.MainActivity
Start-Sleep -Seconds 4

# Remove old recording
adb shell rm -f /sdcard/daksh01_demo.mp4

Write-Host "=========================================="
Write-Host " Recording High-Definition Demo Video     "
Write-Host "=========================================="

# Start high-bitrate 10Mbps screen recording (90 seconds)
$recordJob = Start-Job -ScriptBlock {
    adb shell screenrecord --size 720x1600 --bit-rate 10000000 --time-limit 90 /sdcard/daksh01_demo.mp4
}

Start-Sleep -Seconds 3

# ----------------------------------------------------------------------
# 1. DASHBOARD & LIVE KINEMATICS (0s - 20s)
# ----------------------------------------------------------------------
Write-Host "[1/7] Dashboard: Live Vitals & Kinematic Actuation"

# Pause on initial Dashboard telemetry
Start-Sleep -Seconds 2

# Tap [ OPEN ] (Smooth movement to 0°)
Write-Host "  -> Tap OPEN"
adb shell input tap 160 430
Start-Sleep -Seconds 3

# Tap [ CLOSE ] (Movement towards 63°)
Write-Host "  -> Tap CLOSE"
adb shell input tap 360 430
Start-Sleep -Milliseconds 900

# Tap [ STOP ] (Emergency Stop halt immediately)
Write-Host "  -> Tap EMERGENCY STOP"
adb shell input tap 570 430
Start-Sleep -Seconds 2

# Scroll down smoothly to show EMG Oscilloscope & Battery
Write-Host "  -> Showing Live EMG Oscilloscope & Dual-Cell Battery"
adb shell input swipe 360 1200 360 500 500
Start-Sleep -Seconds 3
adb shell input swipe 360 1200 360 500 500
Start-Sleep -Seconds 3

# Scroll back up to top
adb shell input swipe 360 400 360 1200 500
Start-Sleep -Milliseconds 900
adb shell input swipe 360 400 360 1200 500
Start-Sleep -Milliseconds 900

# ----------------------------------------------------------------------
# 2. CONTROLS STUDIO & GRIP PRESETS (20s - 40s)
# ----------------------------------------------------------------------
Write-Host "[2/7] Control Studio: Tactile Presets & Angle Stepper"
adb shell input tap 270 1460
Start-Sleep -Seconds 2

# Tap Presets one by one with distinct pauses
Write-Host "  -> Grip Presets: Fist, Point, Pinch, Lateral"
adb shell input tap 130 860
Start-Sleep -Milliseconds 1400
adb shell input tap 290 860
Start-Sleep -Milliseconds 1400
adb shell input tap 450 860
Start-Sleep -Milliseconds 1400
adb shell input tap 600 860
Start-Sleep -Milliseconds 1400

# Stepper Nudge: +5°, +5°, -1°
Write-Host "  -> Fine Stepper Nudges"
adb shell input tap 640 980
Start-Sleep -Milliseconds 900
adb shell input tap 640 980
Start-Sleep -Milliseconds 900
adb shell input tap 270 980
Start-Sleep -Milliseconds 900

# ----------------------------------------------------------------------
# 3. OPERATING MODES: EMG & AUTO (40s - 55s)
# ----------------------------------------------------------------------
Write-Host "[3/7] Operating Modes: EMG & Auto Cycles"

# Switch to EMG BIO Mode
adb shell input tap 360 1130
Start-Sleep -Seconds 2

# Scroll down to show test flex button
adb shell input swipe 360 1200 360 800 400
Start-Sleep -Milliseconds 900

# Trigger simulated contraction burst
Write-Host "  -> Trigger Simulated Muscle Flex (280µV)"
adb shell input tap 360 970
Start-Sleep -Seconds 3

# Switch to AUTO Mode
Write-Host "  -> Switch to AUTO Cyclic Routine"
adb shell input swipe 360 800 360 1200 400
Start-Sleep -Milliseconds 800
adb shell input tap 590 1130
Start-Sleep -Seconds 4

# ----------------------------------------------------------------------
# 4. CALIBRATION WIZARD (55s - 70s)
# ----------------------------------------------------------------------
Write-Host "[4/7] Calibration Wizard: 3-Step Physical Limits"
adb shell input swipe 360 1200 360 600 400
Start-Sleep -Milliseconds 900
# Tap Actuator Calibration Wizard banner
adb shell input tap 360 1160
Start-Sleep -Seconds 2

# Step 1: Open Limit (0°) -> Save & Next
Write-Host "  -> Calibration Step 1: Open Limit"
adb shell input tap 590 770
Start-Sleep -Milliseconds 700
adb shell input tap 360 960
Start-Sleep -Seconds 2

# Step 2: Closed Limit (63°) -> Save & Next
Write-Host "  -> Calibration Step 2: Closed Limit"
adb shell input tap 590 770
Start-Sleep -Milliseconds 700
adb shell input tap 360 990
Start-Sleep -Seconds 2

# Step 3: Review & Commit
Write-Host "  -> Calibration Step 3: Review & Commit"
adb shell input tap 360 1010
Start-Sleep -Seconds 1
# Dismiss alert popup cleanly
adb shell input keyevent 4
Start-Sleep -Milliseconds 900
# Return to Controls if back key didn't exit modal
adb shell input tap 60 90
Start-Sleep -Milliseconds 900

# ----------------------------------------------------------------------
# 5. DIAGNOSTIC LOGS (70s - 78s)
# ----------------------------------------------------------------------
Write-Host "[5/7] Diagnostic Logs: Categorized Event Stream"
adb shell input tap 450 1460
Start-Sleep -Seconds 2

# Tap Category Filters: COMMAND, SENSOR, SYSTEM, ALL
adb shell input tap 200 160
Start-Sleep -Milliseconds 900
adb shell input tap 320 160
Start-Sleep -Milliseconds 900
adb shell input tap 440 160
Start-Sleep -Milliseconds 900
adb shell input tap 80 160
Start-Sleep -Milliseconds 900

# ----------------------------------------------------------------------
# 6. SETTINGS & TEST BENCH (78s - 85s)
# ----------------------------------------------------------------------
Write-Host "[6/7] Device Settings: Theme Toggle & Hardware Test Bench"
adb shell input tap 610 1460
Start-Sleep -Seconds 2

# Switch to Light Theme
Write-Host "  -> Toggle Light Theme"
adb shell input tap 540 760
Start-Sleep -Seconds 2

# Switch back to Cyber Dark Theme
Write-Host "  -> Toggle Cyber Dark Theme"
adb shell input tap 180 760
Start-Sleep -Seconds 2

# ----------------------------------------------------------------------
# 7. RETURN TO DASHBOARD HOME (85s - 90s)
# ----------------------------------------------------------------------
Write-Host "[7/7] Returning to Live Dashboard"
adb shell input tap 120 1460
Start-Sleep -Seconds 3

Write-Host "Waiting for recording process to finalize..."
Wait-Job $recordJob -Timeout 15
Receive-Job $recordJob

# Pull high-definition video from device
Write-Host "Pulling video from device..."
adb pull /sdcard/daksh01_demo.mp4 ./daksh01_demo.mp4

# Copy to artifacts directory
Copy-Item -Path "./daksh01_demo.mp4" -Destination "C:\Users\HP\.gemini\antigravity-ide\brain\a1ace9f7-8578-478e-ac07-122ad5211ad2\daksh01_demo.mp4" -Force

Write-Host "=========================================="
Write-Host " Ultra-HD Demo Video Ready!               "
Write-Host " Path: ./daksh01_demo.mp4                 "
Write-Host "=========================================="
