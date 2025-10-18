# 🎯 Complete IR Grid Testing Guide

## Overview
This guide provides step-by-step instructions to test the complete IR Grid functionality from admin dashboard to final report.

## 🚀 Quick Test Steps

### 1. Start the Application
```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the frontend
cd ..
npm run dev
```

### 2. Access Admin Dashboard
- Open browser: `http://localhost:5173/admin`
- You should see the admin dashboard with target lanes

### 3. Assign Shooter and Set Parameters
1. **Click on any target lane** (e.g., Lane 1)
2. **Assign a shooter**: 
   - Click "Assign Shooter" button
   - Select or create a shooter (e.g., "John Doe")
3. **Set Parameters**:
   - Click "Set Parameters" button
   - Choose **Session Type**: Practice or Test
   - Choose **Firing Mode**: "Untimed IR Shots" 
   - Set other parameters as needed
   - Click "Save Parameters"

### 4. Test IR Grid Input
After setting parameters with "Untimed IR Shots" mode:
1. **IR Grid Input Form** should automatically appear
2. **Enter test coordinate data** in the text area:
   ```
   200,200
   195,205
   205,195
   198,202
   202,198
   190,210
   210,190
   185,215
   215,185
   200,200
   ```
3. **Click "🎯 Process Shots"**
4. **Watch the magic happen**:
   - Red dots should appear on the target one by one (500ms delay between shots)
   - Each shot should be logged in the console
   - Analytics should be calculated automatically

### 5. Verify Results
After processing shots:
1. **Check Target Display**: Red dots should be visible on the target
2. **Check Console**: Should show shot processing logs
3. **Check Analytics**: Performance metrics should be calculated
4. **Check Final Report**: Should be generated automatically

### 6. Verify Database Storage
1. **Go to Shooter Profile**: `http://localhost:5173/shooter-profile`
2. **Select the shooter** you used for testing
3. **Verify session appears** with IR Grid badge (🔌)
4. **Click on session** to view details
5. **Verify Session Details Page** shows:
   - IR Grid firing mode
   - All shot coordinates
   - Performance analytics
   - Final report

## 🧪 Test Data Examples

### Basic Test (5 shots around center)
```
200,200
195,205
205,195
198,202
202,198
```

### Grouping Test (tight group)
```
200,200
201,201
199,199
200,201
201,200
```

### Scattered Test (wide spread)
```
150,150
250,150
150,250
250,250
200,200
```

### With Timestamps
```
200,200,1704067200000
195,205,1704067201000
205,195,1704067202000
198,202,1704067203000
202,198,1704067204000
```

## 🔍 What to Verify

### ✅ Frontend Verification
- [ ] "Untimed IR Shots" appears in firing mode dropdown
- [ ] IR Grid input form appears after setting parameters
- [ ] Red dots appear on target display
- [ ] Shot processing happens with visual timing
- [ ] Analytics are calculated and displayed
- [ ] Final report is generated

### ✅ Backend Verification
- [ ] Session is created with ir-grid firing mode
- [ ] Shot coordinates are saved to database
- [ ] Performance analytics are calculated and saved
- [ ] Final report is generated and saved

### ✅ Profile/Details Verification
- [ ] Session appears in shooter profile with IR Grid badge
- [ ] Session details page shows IR Grid mode
- [ ] All shots are displayed correctly
- [ ] Analytics and final report are shown

## 🐛 Troubleshooting

### Issue: "Untimed IR Shots" not appearing
- Check if session type is Practice or Test (not Grouping/Zeroing)
- Verify constants/shootingParameters.js has IR_GRID mode

### Issue: IR Grid input form not showing
- Check browser console for errors
- Verify parameters were saved correctly
- Check if firing mode is set to 'ir-grid'

### Issue: Red dots not appearing
- Check browser console for coordinate parsing errors
- Verify coordinate format (x,y per line)
- Check if onAddHit callback is working

### Issue: Analytics not calculated
- Check if shots are being added to bullets array
- Verify calculateZoneScore function is working
- Check browser console for calculation errors

### Issue: Database not saving
- Check server console for database errors
- Verify database connection is working
- Check if ir-grid enum value exists in database

## 🎉 Success Criteria

The test is successful when:
1. ✅ You can select "Untimed IR Shots" in admin dashboard
2. ✅ IR Grid input form appears and accepts coordinate data
3. ✅ Red dots appear on target display in real-time
4. ✅ Performance analytics are calculated automatically
5. ✅ Final report is generated with accuracy and MPI
6. ✅ Session data is stored in database correctly
7. ✅ Session appears in shooter profile with IR Grid badge
8. ✅ Session details page shows all data correctly

## 🔮 Next Steps

Once this basic workflow is working perfectly:
1. Connect real IR Grid hardware
2. Replace simulated coordinate string with real hardware data
3. Implement real-time hardware communication
4. Add hardware status monitoring
5. Implement automatic shot detection

---

**Ready to test? Follow the steps above and verify each checkpoint!** 🚀
