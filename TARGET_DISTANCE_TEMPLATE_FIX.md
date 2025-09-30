# Target Distance Template Fix

## Issue Identified ✅ FIXED

**Problem**: 
- Target Distance parameter in SessionDetailsPage was showing template names instead of actual distances
- The display was inconsistent across different firing modes
- Should show actual distance values from TARGET_TEMPLATES like in untimed firing mode

**Root Cause**: 
- Code was trying to display `template_name` instead of looking up the actual `distance` from TARGET_TEMPLATES
- No proper lookup mechanism to get distance from template ID or name

---

## Solution Implemented

### 1. **Added TARGET_TEMPLATES Import** (line 13)
```javascript
import { TARGET_TEMPLATES } from '../components/TargetTemplateSelector';
```

### 2. **Created Helper Function** (lines 104-128)
```javascript
// Helper function to get target distance from TARGET_TEMPLATES
const getTargetDistanceFromTemplate = () => {
  // First, try to get template_id from parameters
  const templateId = sessionData?.parameters?.template_id;
  if (templateId) {
    const template = TARGET_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      return template.distance; // Returns actual distance like "10m", "25m", etc.
    }
  }

  // Fallback: try to get template_name and match it
  const templateName = sessionData?.parameters?.template_name || sessionData?.finalReport?.template_name;
  if (templateName) {
    const template = TARGET_TEMPLATES.find(t => t.name === templateName);
    if (template) {
      return template.distance;
    }
  }

  // Final fallback: use target_distance parameter if available
  if (sessionData?.parameters?.target_distance) {
    return `${sessionData.parameters.target_distance}m`;
  }

  return 'N/A';
};
```

### 3. **Updated Target Distance Display** (lines 599-603)
**Before**:
```javascript
{/* Target Distance (showing template name) */}
<span style={{ fontWeight: '600' }}>
  {sessionData?.parameters?.template_name || 
   sessionData?.finalReport?.template_name || 
   (sessionData?.parameters?.target_distance ? `${sessionData.parameters.target_distance}m` : 'N/A')}
</span>
```

**After**:
```javascript
{/* Target Distance (from TARGET_TEMPLATES) */}
<span style={{ fontWeight: '600' }}>{getTargetDistanceFromTemplate()}</span>
```

### 4. **Enhanced Debugging** (lines 144-153)
Added comprehensive logging to track template lookup process:
```javascript
console.log('🎯 Target distance lookup:', {
  templateId: data?.parameters?.template_id,
  templateName: data?.parameters?.template_name,
  targetDistance: data?.parameters?.target_distance,
  availableTemplates: TARGET_TEMPLATES.map(t => ({ id: t.id, name: t.name, distance: t.distance }))
});
```

---

## TARGET_TEMPLATES Structure

### **Template Examples**:
```javascript
{
  id: 'air-pistol-10m',
  name: '10m',
  diameter: 130,
  distance: '10m',  // ← This is what we now display
  caliber: '4.5mm air pistol',
  description: 'Standard 10-ring target for air pistol competition'
},
{
  id: 'pistol-25m-precision',
  name: '25m',
  diameter: 120,
  distance: '25m',  // ← This is what we now display
  caliber: '.22 LR rimfire',
  description: 'Precision pistol target for 25m competition'
}
```

### **Lookup Priority**:
1. **Primary**: `template_id` → find template → return `template.distance`
2. **Secondary**: `template_name` → find template → return `template.distance`
3. **Tertiary**: `target_distance` parameter → return `${target_distance}m`
4. **Final**: Return 'N/A'

---

## Expected Results

### **Before Fix**:
- **Untimed Mode**: Showed template names (inconsistent)
- **Timed Mode**: Showed "N/A" or template names
- **Snap Mode**: Showed "N/A" or template names
- **Moving Mode**: Showed "N/A" or template names

### **After Fix**:
- **All Firing Modes**: Show actual distance from TARGET_TEMPLATES
- **Examples**:
  - Template ID `air-pistol-10m` → Shows "10m"
  - Template ID `pistol-25m-precision` → Shows "25m"
  - Template ID `rifle-50m` → Shows "50m"
  - Template ID `air-rifle-10m` → Shows "10m"
  - Template ID `custom` → Shows "Variable"

---

## Technical Benefits

### **1. Consistency**
- All firing modes now show distance values consistently
- Same lookup logic across all session types

### **2. Accuracy**
- Shows actual target distance from authoritative source (TARGET_TEMPLATES)
- No more guessing from template names or parameter values

### **3. Robustness**
- Multiple fallback mechanisms ensure display always works
- Graceful degradation when template data unavailable

### **4. Maintainability**
- Single source of truth for template distances
- Easy to update distances by modifying TARGET_TEMPLATES

---

## Files Modified

### `src/components/SessionDetailsPage.jsx`

**Line 13**: Added TARGET_TEMPLATES import
**Lines 104-128**: Added getTargetDistanceFromTemplate() helper function
**Lines 599-603**: Updated Target Distance display to use template lookup
**Lines 144-153**: Enhanced debugging for template lookup verification

---

## Testing Verification

### **Test All Firing Modes**:
1. **Untimed**: Verify shows correct distance from template
2. **Timed**: Verify shows correct distance from template
3. **Snap**: Verify shows correct distance from template
4. **Moving**: Verify shows correct distance from template

### **Test Template Scenarios**:
1. **Valid Template ID**: Should show template.distance
2. **Valid Template Name**: Should show template.distance
3. **Only Target Distance**: Should show target_distance + "m"
4. **No Template Data**: Should show "N/A"

### **Console Verification**:
- Check browser console for template lookup debugging info
- Verify template ID/name resolution is working correctly
- Confirm distance values match TARGET_TEMPLATES

The Target Distance parameter now consistently shows actual distance values from TARGET_TEMPLATES across all firing modes, providing accurate and reliable distance information in the session details.
