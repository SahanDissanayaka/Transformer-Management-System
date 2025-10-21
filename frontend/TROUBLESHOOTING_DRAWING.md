# Drawing Not Working - Troubleshooting Guide

## Steps to Enable Drawing

### 1. Make Sure You Have a Thermal Image
- First, upload a thermal image or view an existing inspection
- The thermal image must be visible in the right panel

### 2. Enable Edit Mode
1. Look for the **"🛠️ Annotation Tools"** card above the images
2. Click the **"Enable Edit Mode"** button
3. The button should change to show **"✓ Edit Mode ON"** in purple/blue

### 3. Enable Draw Mode
1. After Edit Mode is enabled, a **"Draw New"** button will appear
2. Click the **"Draw New"** button
3. The button should change to show **"Drawing..."** in green
4. Your cursor should change to a crosshair when over the thermal image

### 4. Draw on the Image
1. Move your mouse over the thermal image
2. **Click and hold** the left mouse button
3. **Drag** to create a rectangle
4. **Release** the mouse button to complete the annotation
5. A dashed blue box should appear while you're dragging

## Common Issues & Solutions

### Issue 1: "Enable Edit Mode" button not showing
**Solution**: Make sure you have uploaded a thermal image first. The annotation toolbar only appears when a thermal image exists.

### Issue 2: Can't see the thermal image
**Solution**: 
- Check if the image upload was successful
- Look for any error messages in the red error banner
- Try uploading the image again

### Issue 3: "Draw New" button not appearing
**Solution**: You must click "Enable Edit Mode" first. The Draw New button only appears after Edit Mode is enabled.

### Issue 4: Cursor doesn't change to crosshair
**Solution**: 
- Make sure both "Edit Mode ON" and "Drawing..." are showing
- The cursor only changes when hovering directly over the thermal image area
- Refresh the page and try again

### Issue 5: Nothing happens when I click and drag
**Possible causes**:
1. **Not in Draw Mode**: Make sure "Drawing..." button is showing in green
2. **Wrong area**: Make sure you're clicking directly on the thermal image, not the background
3. **Box too small**: The minimum box size is 1% x 1% of the image. Try drawing a larger box

### Issue 6: Drawing disappears immediately
**Solution**: The box needs to be at least 1% of the image width and height. Draw a larger rectangle.

## Debug Mode

Open your browser's **Developer Console** (F12) and look for these messages when drawing:

- `"Starting to draw annotation"` - Should appear when you click
- `"Start coords: {x: 0.5, y: 0.5}"` - Shows where you started
- `"Completing drawing"` - Should appear when you release
- `"Bbox: [x1, y1, x2, y2]"` - Shows the coordinates
- `"Creating annotation"` - Confirms the annotation was created

If you don't see these messages, it means the mouse events aren't being captured.

## Visual Indicators

When working correctly, you should see:

### Edit Mode Enabled:
- ✅ Button shows "✓ Edit Mode ON" in purple background
- ✅ Zoom/rotation buttons are disabled
- ✅ Instructions show "Edit Mode: Click on an annotation..."

### Draw Mode Enabled:
- ✅ Button shows "✏️ Drawing..." in green background
- ✅ Instructions show "Draw Mode: Click and drag on the image..."
- ✅ Cursor changes to crosshair over the image
- ✅ A dashed blue rectangle appears while dragging

### Drawing Complete:
- ✅ A solid colored box appears with "👤" icon
- ✅ The annotation appears in the error cards list below
- ✅ Draw Mode automatically turns off
- ✅ You can click the new annotation to edit it

## Step-by-Step Test

Try this exact sequence:

1. **Upload thermal image**
   - Click "Submit Thermal" button
   - Wait for image to appear
   - ✓ You should see the thermal image in the right panel

2. **Enable Edit Mode**
   - Scroll up to find "🛠️ Annotation Tools" card
   - Click "Enable Edit Mode"
   - ✓ Button should turn purple and say "✓ Edit Mode ON"

3. **Enable Draw Mode**
   - Click "Draw New" button (appears after Edit Mode)
   - ✓ Button should turn green and say "✏️ Drawing..."

4. **Draw annotation**
   - Move mouse over the thermal image
   - ✓ Cursor should change to crosshair (+)
   - Click and hold left mouse button
   - ✓ Dashed blue box should start appearing
   - Drag to create a rectangle
   - ✓ Box should follow your mouse
   - Release mouse button
   - ✓ New annotation should appear

5. **Verify annotation created**
   - Scroll down to "Version 1 Errors" section
   - ✓ You should see a new error card
   - ✓ It should say "👤 Manually Added" when expanded

## Still Not Working?

If you've tried all the above and it still doesn't work:

1. **Refresh the page** and try again
2. **Clear browser cache** (Ctrl + F5)
3. **Try a different browser**
4. **Check browser console** for JavaScript errors (F12 → Console tab)
5. **Check Network tab** for failed API calls (F12 → Network tab)

## Report the Issue

If drawing still doesn't work, please provide:
- Browser name and version
- Screenshot of the page when in "Drawing..." mode
- Any error messages from the console
- Steps you followed

---

**Quick Checklist**:
- [ ] Thermal image is uploaded and visible
- [ ] "Enable Edit Mode" button clicked
- [ ] Button shows "✓ Edit Mode ON"
- [ ] "Draw New" button clicked  
- [ ] Button shows "✏️ Drawing..."
- [ ] Cursor changes to crosshair over image
- [ ] Click and drag creates dashed blue box
- [ ] Release creates annotation
