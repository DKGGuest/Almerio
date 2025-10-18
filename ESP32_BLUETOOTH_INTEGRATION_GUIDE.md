# 🎯 ESP32 Bluetooth Integration - Complete Guide

## ✅ **Current Status: FULLY IMPLEMENTED**

Your ESP32 Bluetooth integration is already complete and ready to use! Here's how to activate and use it:

## 🔧 **Setup Instructions**

### **1. Environment Configuration**
Create/update your `.env` file in the server directory:

```env
# Enable IR Grid service
IR_GRID_ENABLED=true

# ESP32 Serial Port (adjust for your system)
IR_GRID_PORT=COM13

# Baud rate (must match ESP32 code)
IR_GRID_BAUD_RATE=9600
```

### **2. ESP32 Hardware Setup**
Your ESP32 should be:
- ✅ **Connected via USB/Serial** (Classic Bluetooth via Serial)
- ✅ **Running the provided Arduino code** (`ESP32_IR_Grid_Test.ino`)
- ✅ **Sending coordinates** in format: `X,Y` (e.g., `150,200`)

### **3. Server Startup**
```bash
cd server
npm start
```

**Expected logs:**
```
🎯 Initializing IR Grid service...
🔌 Initializing IR Grid service on port COM13 at 9600 baud
✅ IR Grid service initialized successfully
🎯 IR Grid service: Connected
```

## 🎯 **How to Use Real-Time ESP32 Data**

### **Step 1: Set Up Session in Admin Dashboard**
1. Go to: `http://localhost:5173/dashboard`
2. **Assign shooter name**
3. **Set shooting parameters**:
   - **Session Type**: Practice/Test
   - **Firing Mode**: **"Untimed IR Shots"** ← This activates ESP32 mode
   - **Weapon Type**: Your choice
   - **Target Type**: Your choice
   - **Position**: Your choice
   - **Target Distance**: Your choice

### **Step 2: Automatic Real-Time Display**
- ✅ **WebSocket connects automatically** when firing mode is "Untimed IR Shots"
- ✅ **Red dots appear in real-time** as ESP32 sends coordinates
- ✅ **Shots are saved to database** automatically
- ✅ **Session tracking** works automatically

### **Step 3: ESP32 Data Flow**
```
ESP32 Hardware → Serial/USB → Server (irGridService) → WebSocket → Admin Dashboard → Red Dots
```

## 📡 **Data Format**

### **ESP32 Output Format**
```
X,Y
```
**Examples:**
- `200,200` → Center of target
- `150,250` → Left and down from center
- `300,100` → Right and up from center

### **Coordinate System**
- **ESP32 Range**: 0-400 (matches target display)
- **Target Center**: (200, 200)
- **Target Display**: 400x400 pixel coordinate space

## 🧪 **Testing the Integration**

### **Test 1: ESP32 Simulator**
```bash
# In server directory
node test-esp32.cjs
```

This will:
- ✅ Connect to ESP32 on COM13
- ✅ Send test commands
- ✅ Generate random coordinates every 5 seconds
- ✅ Show received data

### **Test 2: API Simulation**
```bash
# Simulate a single shot
curl -X POST http://localhost:3001/api/ir-grid/simulate-shot \
  -H "Content-Type: application/json" \
  -d '{"x": 200, "y": 200}'

# Simulate batch of 5 shots
curl -X POST http://localhost:3001/api/ir-grid/simulate-batch/test-session \
  -H "Content-Type: application/json" \
  -d '{"count": 5}'
```

### **Test 3: Check Service Status**
```bash
curl http://localhost:3001/api/ir-grid/status
```

**Expected response:**
```json
{
  "connected": true,
  "activeSessions": 0,
  "serviceEnabled": true,
  "portPath": "COM13",
  "baudRate": 9600
}
```

## 🔍 **Troubleshooting**

### **Issue 1: ESP32 Not Connected**
**Symptoms:** `IR Grid service: Disconnected`

**Solutions:**
1. Check COM port: `IR_GRID_PORT=COM13` (adjust for your system)
2. Check ESP32 is plugged in and powered
3. Verify baud rate matches: `IR_GRID_BAUD_RATE=9600`
4. Check ESP32 Arduino code is uploaded and running

### **Issue 2: No Real-Time Red Dots**
**Symptoms:** ESP32 connected but no dots appear

**Solutions:**
1. Ensure firing mode is **"Untimed IR Shots"**
2. Check browser console for WebSocket connection
3. Verify ESP32 is sending data (check server logs)
4. Test with API simulation first

### **Issue 3: WebSocket Not Connecting**
**Symptoms:** Console shows WebSocket connection errors

**Solutions:**
1. Ensure server is running on port 3001
2. Check firewall settings
3. Verify WebSocket endpoint: `ws://localhost:3001/ws`

## 📊 **Real-Time Features**

### **Automatic Session Management**
- ✅ **Session starts** when firing mode is "Untimed IR Shots"
- ✅ **Shots are tracked** by session ID
- ✅ **Database saves** happen automatically
- ✅ **Session ends** when user stops or changes mode

### **Live Analytics**
- ✅ **Shot count** updates in real-time
- ✅ **Accuracy calculations** update with each shot
- ✅ **Performance metrics** calculated automatically
- ✅ **Final report** generated when session ends

### **Visual Feedback**
- ✅ **Red dots** appear immediately when ESP32 sends data
- ✅ **Shot numbering** tracks sequence
- ✅ **Score calculation** happens in real-time
- ✅ **Target zones** show hit locations

## 🎯 **Expected User Experience**

1. **Setup**: User selects "Untimed IR Shots" firing mode
2. **Connection**: WebSocket connects automatically
3. **Shooting**: ESP32 detects shots and sends coordinates
4. **Display**: Red dots appear immediately on target display
5. **Tracking**: All shots saved to database with session info
6. **Analytics**: Real-time performance calculations
7. **Completion**: Session data available in Session Details

## ✅ **Success Indicators**

### **Server Logs:**
```
🎯 IR Grid shot received: {x: 200, y: 200}
💾 IR Grid shot saved to database with ID: 123
🔌 Broadcasting to WebSocket clients
```

### **Browser Console:**
```
🎯 IR shot received: {x: 200, y: 200}
🔴 RENDERING IR Grid bullet: {x: 200, y: 200, isIRShot: true}
```

### **Visual Confirmation:**
- ✅ Red dots appear on target display
- ✅ Shot counter increases
- ✅ Accuracy percentage updates
- ✅ Session data saves properly

## 🚀 **Ready to Use!**

Your ESP32 Bluetooth integration is **fully implemented and ready**. Just:

1. **Enable** IR Grid service in `.env`
2. **Connect** ESP32 to correct COM port
3. **Select** "Untimed IR Shots" firing mode
4. **Watch** red dots appear in real-time!

**The system is production-ready for real-time ESP32 shooting data!** 🎯
