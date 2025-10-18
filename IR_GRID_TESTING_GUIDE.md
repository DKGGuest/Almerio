# 🎯 IR Grid Complete End-to-End Testing Guide

This guide demonstrates the **complete IR Grid functionality** from start to finish using **simulated data** - no hardware required!

## 🚀 Quick Start (5 Minutes)

### Step 1: Start the Application
```bash
# Terminal 1: Start Backend Server
cd server
node server.js

# Terminal 2: Start Frontend (new terminal)
npm run dev
```

### Step 2: Run the Complete Test
```bash
# Terminal 3: Run End-to-End Test (new terminal)
node run-ir-grid-test.js
```

### Step 3: View Results in Browser
1. Open: `http://localhost:5173`
2. Go to **Shooter Profile** page
3. Look for **"IR Grid Demo User"**
4. Click on the IR Grid session (🔌 icon + red badge)
5. View the **Session Details** page

---

## 📋 What the Test Does

### 🎯 **Complete Workflow Simulation:**
1. **Creates a test shooter** ("IR Grid Demo User")
2. **Creates an IR Grid session** with proper parameters
3. **Simulates realistic shooting patterns** (6-8 shots with timestamps)
4. **Displays shots in real-time** as red dots on target
5. **Stores all data** in database with proper IR Grid formatting
6. **Verifies data appears** correctly in Shooter Profile and Session Details

### 📊 **Realistic Shot Patterns:**
- **Bullseye Grouping**: Tight center shots
- **Vertical Line**: Sight adjustment pattern  
- **Horizontal Spread**: Windage testing
- **Corner Shots**: Range testing
- **Random Grouping**: Realistic shooting variation

---

## 🧪 Test Options

### Option 1: Complete Test (Recommended)
```bash
node run-ir-grid-test.js
```
- Creates full session with realistic timing
- Sends 6-8 shots over 10-15 seconds
- Shows complete workflow

### Option 2: Quick Batch Test
```bash
node run-ir-grid-test.js batch
```
- Sends 5 shots rapidly
- Completes in under 10 seconds
- Good for quick verification

### Option 3: Manual API Testing
```bash
# Create session first, then:
curl -X POST http://localhost:3001/api/ir-grid/simulate-batch/SESSION_ID \
  -H "Content-Type: application/json" \
  -d '{"count": 5}'
```

---

## 🔍 Frontend Verification Checklist

### ✅ **Shooter Profile Page**
- [ ] IR Grid session appears in session list
- [ ] 🔌 Icon visible next to session
- [ ] Red "IR GRID" badge displayed
- [ ] Session type shows as "Practice" or "Test"
- [ ] Firing mode shows as "Untimed IR Shots"

### ✅ **Session Details Page**
- [ ] Red "IR GRID" badge next to firing mode
- [ ] **IR Grid Parameters** section visible
- [ ] Shots table shows all IR Grid shots
- [ ] Shot rows have **red background highlighting**
- [ ] 🔌 Icons appear next to shot numbers
- [ ] **"IR GRID"** badges in Data Source column
- [ ] Coordinates display correctly (X, Y values)
- [ ] Timestamps show proper IR Grid timing

### ✅ **Real-Time Display (During Simulation)**
- [ ] Target display shows "IR Grid Connected" status
- [ ] Red dots appear on target as shots are sent
- [ ] Dots appear at correct coordinates
- [ ] Shot counter increments properly

---

## 📊 Expected Test Output

```
🎯 IR Grid Complete Test Starting...
====================================

👤 Creating test shooter...
   ✅ Shooter created: ID 123

🎯 Creating IR Grid session...
   ✅ Session created: ID 456

⚙️  Configuring IR Grid parameters...
   ✅ IR Grid parameters configured

🚀 Starting IR Grid simulation...
   ✅ Simulation started!
   📊 Pattern: Bullseye Group
   🎯 Total shots: 6
   ⏱️  Interval: 1000ms

⏳ Monitoring simulation progress...
   ⏳ Running... (1 shots sent)
   ⏳ Running... (3 shots sent)
   ⏳ Running... (6 shots sent)
   ✅ Simulation completed!

🔍 Verifying results...
   ✅ Total shots stored: 6
   🔌 IR Grid shots: 6
   📊 Sample shot: (200, 200)
   👤 IR Grid sessions in profile: 1

✅ IR Grid Test Completed Successfully! 🎯
```

---

## 🎮 Interactive Testing

### Real-Time Shot Simulation
While the test is running, you can:

1. **Watch the target display** in your browser
2. **See red dots appear** as each shot is simulated
3. **Monitor the shot counter** increment
4. **Observe the "Connected" status** indicator

### Manual Shot Testing
```bash
# Send individual shots:
curl -X POST http://localhost:3001/api/ir-grid/simulate-shot \
  -H "Content-Type: application/json" \
  -d '{"x": 200, "y": 200}'

# Check simulation status:
curl http://localhost:3001/api/ir-grid/simulate-status
```

---

## 🔧 Troubleshooting

### ❌ "Connection refused" Error
```bash
# Make sure server is running:
cd server && node server.js

# Check if port 3001 is available:
netstat -ano | findstr :3001
```

### ❌ No shots appearing in frontend
1. **Check browser console** for WebSocket errors
2. **Verify session has IR Grid firing mode**
3. **Ensure frontend is connected** to localhost:5173

### ❌ Database errors
1. **Check database connection** in server logs
2. **Verify .env file** has correct database settings
3. **Run database migrations** if needed

### ❌ Test script fails
1. **Ensure server is running** before running test
2. **Check Node.js version** (requires Node 14+)
3. **Verify no firewall** blocking localhost connections

---

## 🎯 Advanced Testing Scenarios

### Scenario 1: Multiple Sessions
```bash
# Run test multiple times to create several IR Grid sessions
node run-ir-grid-test.js
node run-ir-grid-test.js batch
node run-ir-grid-test.js
```

### Scenario 2: Different Session Types
Modify the test script to create:
- **Test sessions** (for performance remarks)
- **Grouping sessions** (for accuracy analysis)
- **Different target distances** (25M, 50M, 100M)

### Scenario 3: High-Volume Testing
```bash
# Send many shots quickly:
curl -X POST http://localhost:3001/api/ir-grid/simulate-batch/SESSION_ID \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'
```

---

## 📈 Performance Verification

### Database Performance
- ✅ All shots stored with correct timestamps
- ✅ IR Grid shots marked with `time_phase = 'IR_GRID'`
- ✅ Session parameters saved correctly
- ✅ Shooter profile updated properly

### Frontend Performance  
- ✅ Real-time updates without lag
- ✅ Smooth red dot animations
- ✅ Responsive UI during shot simulation
- ✅ Correct data display in all views

### WebSocket Performance
- ✅ Real-time shot broadcasting
- ✅ Connection status updates
- ✅ No message loss during simulation
- ✅ Proper cleanup after session ends

---

## 🎯 Success Criteria

**✅ Test passes if you can:**
1. **See IR Grid sessions** in Shooter Profile with proper badges
2. **View detailed session data** with red highlighting and IR Grid formatting
3. **Watch real-time shot simulation** with red dots appearing on target
4. **Verify all data** is correctly stored and displayed
5. **Navigate between pages** and see consistent IR Grid indicators

**🎉 When everything works, you'll have a fully functional IR Grid system ready for hardware integration!**

---

## 🔗 Next Steps

1. **✅ Complete this test** to verify software functionality
2. **🔌 Connect ESP32** hardware for real data input
3. **📡 Connect IR Grid sensors** to ESP32
4. **🎯 Calibrate coordinates** to match your target setup
5. **🚀 Deploy to production** environment

**Ready to test? Run `node run-ir-grid-test.js` and watch the magic happen!** ✨
