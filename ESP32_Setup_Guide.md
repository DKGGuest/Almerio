# ESP32 Setup Guide for IR Grid Testing

## 🎯 Overview
This guide will help you set up your ESP32 to simulate an IR Grid system and test communication with the shooting application.

## 📋 Prerequisites
- ESP32 development board
- USB cable (connected to COM13)
- Arduino IDE installed
- ESP32 board package installed in Arduino IDE

## 🔧 Step 1: Arduino IDE Setup

### Install ESP32 Board Package (if not already done):
1. Open Arduino IDE
2. Go to **File → Preferences**
3. Add this URL to "Additional Board Manager URLs":
   ```
   https://dl.espressif.com/dl/package_esp32_index.json
   ```
4. Go to **Tools → Board → Boards Manager**
5. Search for "ESP32" and install "ESP32 by Espressif Systems"

### Configure for your ESP32:
1. Go to **Tools → Board → ESP32 Arduino**
2. Select your ESP32 board (e.g., "ESP32 Dev Module")
3. Set **Port** to **COM13**
4. Set **Upload Speed** to **115200**
5. Set **CPU Frequency** to **240MHz**

## 🚀 Step 2: Upload Test Sketch

1. **Open the sketch file**: `ESP32_IR_Grid_Test.ino`
2. **Verify the code** (click checkmark button)
3. **Upload to ESP32** (click arrow button)
4. **Wait for upload** to complete

## 📡 Step 3: Test Communication

### Open Serial Monitor:
1. Go to **Tools → Serial Monitor**
2. Set baud rate to **9600**
3. Set line ending to **"Newline"**

### You should see:
```
ESP32 IR Grid Simulator Ready
Commands:
  SHOT - Send random shot coordinates
  STATUS - Show system status
  AUTO_ON - Enable automatic shot simulation
  AUTO_OFF - Disable automatic shot simulation
  RESET - Reset system
Ready for commands...
```

### Test Commands:
```bash
# Type these in Serial Monitor:
STATUS          # Check ESP32 status
SHOT           # Send a random shot
150,200        # Send specific coordinates
AUTO_ON        # Enable automatic shots every 5 seconds
AUTO_OFF       # Disable automatic shots
```

## 🎮 Step 4: Test with Shooting Application

### Start the Application:
1. **Close Arduino IDE Serial Monitor** (important!)
2. **Start backend server**:
   ```bash
   cd server
   node server.js
   ```
3. **Start frontend**:
   ```bash
   npm run dev
   ```

### Create IR Grid Session:
1. Open browser: `http://localhost:5173`
2. Create new session:
   - Session Type: **Practice**
   - Firing Mode: **Untimed IR Shots**
3. Start the session

### Expected Results:
- 🔌 **IR Grid status**: Should show "Connected"
- 🔴 **Red dots**: Should appear on target when ESP32 sends coordinates
- 📊 **Shot data**: Automatically saved to database

## 🔍 Troubleshooting

### If "IR Grid Disconnected":
1. **Check COM port**: Make sure ESP32 is on COM13
2. **Close other programs**: Arduino IDE Serial Monitor must be closed
3. **Reset ESP32**: Press the RESET button on your ESP32
4. **Check baud rate**: Ensure both ESP32 and app use 9600 baud

### If no shots appear:
1. **Check ESP32 output**: Use Arduino Serial Monitor to verify ESP32 is sending data
2. **Verify format**: ESP32 should send "x,y" format (e.g., "150,200")
3. **Check session**: Must use "Untimed IR Shots" firing mode

### If upload fails:
1. **Hold BOOT button** on ESP32 while uploading
2. **Try different USB cable**
3. **Check driver**: Install CP210x USB driver if needed

## 📊 Data Format

Your ESP32 should send coordinates in this format:
```
150,200
180,220
200,200
```

Each line represents one shot with X,Y coordinates (0-400 range).

## 🔧 Customization

### Modify Shot Frequency:
Change this line in the Arduino code:
```cpp
const unsigned long SHOT_INTERVAL = 5000; // milliseconds
```

### Modify Coordinate Range:
Change these lines:
```cpp
int x = random(50, 350);  // X range
int y = random(50, 350);  // Y range
```

### Add Your IR Grid Hardware:
When you connect real IR Grid sensors to ESP32:
1. Replace `sendRandomShot()` with actual sensor reading
2. Connect IR sensors to ESP32 GPIO pins
3. Modify code to read sensor interrupts
4. Send real coordinates instead of random ones

## 🎯 Next Steps

1. **Test ESP32 communication** with the shooting app
2. **Verify shot detection** works correctly
3. **Connect actual IR Grid hardware** to ESP32
4. **Modify code** to read real sensor data
5. **Calibrate coordinates** to match your target size

## 📞 Support

If you encounter issues:
1. Check ESP32 is properly connected to COM13
2. Verify Arduino IDE can communicate with ESP32
3. Ensure shooting application server is running
4. Check that no other programs are using COM13

---

**Ready to test!** Upload the sketch to your ESP32 and start the shooting application to see real-time shot detection in action! 🎯
