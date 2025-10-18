# 🎯 ESP32 Bluetooth Setup Guide

## ✅ **Current Status**
Your ESP32 is successfully connected via Bluetooth and sending data:
```
Bullet Hit Coordinate (0, 0) at Time: 11:24:30 Date: 9/10/2025
Bullet Hit Coordinate (0, 1) at Time: 11:24:30 Date: 9/10/2025
```

I've updated the server to parse this exact format! Now let's connect it to your web application.

## 🔧 **Step 1: Find Your Bluetooth COM Port**

### **Windows Method 1: Device Manager**
1. Press `Win + X` → Select **Device Manager**
2. Expand **Ports (COM & LPT)**
3. Look for your ESP32 device (might be named "Standard Serial over Bluetooth link" or "ESP32_BulletGrid")
4. Note the COM port number (e.g., COM5, COM7, COM8)

### **Windows Method 2: Bluetooth Settings**
1. Go to **Settings** → **Devices** → **Bluetooth & other devices**
2. Find your **ESP32_BulletGrid** device
3. Click **More Bluetooth options**
4. Go to **COM Ports** tab
5. Note the **Outgoing** COM port number

### **Windows Method 3: Command Line**
```cmd
mode
```
Look for COM ports in the output.

## 🔧 **Step 2: Configure Your Server**

### **Update .env File**
In your `server` directory, create/update `.env` file:

```env
# Enable IR Grid service
IR_GRID_ENABLED=true

# Use your Bluetooth COM port (replace COM5 with your actual port)
IR_GRID_PORT=COM5

# Baud rate for Bluetooth communication
IR_GRID_BAUD_RATE=9600

# Database configuration
DB_PATH=./shooting_range.db
```

**Important:** Replace `COM5` with your actual Bluetooth COM port!

## 🔧 **Step 3: Start the Server**

```bash
cd server
npm install
npm start
```

### **Expected Server Logs:**
```
🎯 Initializing IR Grid service...
🔌 Initializing IR Grid service on port COM5 at 9600 baud
✅ IR Grid service initialized successfully
🎯 IR Grid service: Connected
🚀 Shooting Range Dashboard Server running on port 3001
```

### **When ESP32 Sends Data:**
```
📡 IR Grid data received: Bullet Hit Coordinate (0, 0) at Time: 11:24:30 Date: 9/10/2025
🔍 Parsing IR data: Bullet Hit Coordinate (0, 0) at Time: 11:24:30 Date: 9/10/2025
📡 ESP32 Bluetooth format detected: { x: 0, y: 0, timeStr: '11:24:30', dateStr: '9/10/2025' }
🎯 Parsed IR shot: { x: 0, y: 0, timestamp: 1728467070000, source: 'ESP32_Bluetooth' }
🔌 Broadcasting to WebSocket clients
```

## 🔧 **Step 4: Use in Web Application**

### **1. Open Admin Dashboard**
```
http://localhost:5173/dashboard
```

### **2. Set Up Session**
1. **Assign shooter name**
2. **Set shooting parameters**:
   - **Session Type**: Practice or Test
   - **Firing Mode**: **"Untimed IR Shots"** ← This is crucial!
   - **Weapon Type**: Your choice
   - **Target Type**: Your choice
   - **Position**: Your choice
   - **Target Distance**: Your choice

### **3. Watch Real-Time Display**
- ✅ **Red dots appear automatically** as ESP32 sends coordinates
- ✅ **WebSocket connects** when firing mode is "Untimed IR Shots"
- ✅ **Shots are saved** to database automatically
- ✅ **Analytics update** in real-time

## 🧪 **Step 5: Test the Connection**

### **Test 1: Check Server Status**
```bash
curl http://localhost:3001/api/ir-grid/status
```

**Expected Response:**
```json
{
  "connected": true,
  "activeSessions": 0,
  "serviceEnabled": true,
  "portPath": "COM5",
  "baudRate": 9600
}
```

### **Test 2: Manual Shot Simulation**
```bash
curl -X POST http://localhost:3001/api/ir-grid/simulate-shot \
  -H "Content-Type: application/json" \
  -d '{"x": 200, "y": 200}'
```

This should make a red dot appear at the center of your target display.

## 🔍 **Troubleshooting**

### **Issue 1: Server Can't Connect to COM Port**
**Error:** `❌ Failed to initialize IR Grid service`

**Solutions:**
1. **Check COM port number** in Device Manager
2. **Close your Bluetooth terminal app** (only one app can use the COM port at a time)
3. **Try different COM ports** (COM3, COM4, COM5, etc.)
4. **Restart Bluetooth connection** on ESP32

### **Issue 2: No Data Received**
**Symptoms:** Server connects but no data logs appear

**Solutions:**
1. **Ensure ESP32 is sending data** (check your terminal app)
2. **Verify baud rate** matches (9600)
3. **Check ESP32 code** is running and transmitting
4. **Try restarting** both ESP32 and server

### **Issue 3: Data Format Not Recognized**
**Symptoms:** Data received but not parsed

**Check server logs for:**
```
⚠️ Unrecognized IR data format: [your data]
```

**Solution:** The parser now handles your exact format:
```
Bullet Hit Coordinate (X, Y) at Time: HH:MM:SS Date: DD/MM/YYYY
```

### **Issue 4: Red Dots Don't Appear**
**Symptoms:** Data parsed but no visual display

**Solutions:**
1. **Ensure firing mode** is "Untimed IR Shots"
2. **Check browser console** for WebSocket connection
3. **Verify WebSocket** is connecting to `ws://localhost:3001/ws`

## 🎯 **Data Flow Diagram**

```
ESP32 → Bluetooth → COM Port → irGridService → WebSocket → Admin Dashboard → Red Dots
```

## ✅ **Success Indicators**

### **Server Console:**
```
📡 ESP32 Bluetooth format detected: { x: 150, y: 200 }
🎯 Parsed IR shot: { x: 150, y: 200, source: 'ESP32_Bluetooth' }
🔌 Broadcasting to WebSocket clients
```

### **Browser Console:**
```
🎯 IR shot received: {x: 150, y: 200}
🔴 RENDERING IR Grid bullet: {x: 150, y: 200, isIRShot: true}
```

### **Visual Confirmation:**
- ✅ Red dots appear on target display
- ✅ Shot counter increases
- ✅ Real-time coordinate display

## 🚀 **Next Steps**

1. **Find your Bluetooth COM port**
2. **Update .env with correct COM port**
3. **Start server**
4. **Set firing mode to "Untimed IR Shots"**
5. **Watch ESP32 data appear as red dots!**

**Your ESP32 Bluetooth integration is ready to work in real-time!** 🎯
