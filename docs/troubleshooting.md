# Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### Node.js Version Mismatch
**Problem**: Build fails with version-related errors
**Solution**: 
```bash
# Check your Node.js version
node --version

# Install Node.js 18 or higher
nvm install 18
nvm use 18
```

#### Package Installation Failures
**Problem**: `npm install` fails with permission or network errors
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall packages
npm install
```

### Build Issues

#### TypeScript Compilation Errors
**Problem**: Build fails with TypeScript errors
**Solution**:
1. Check for missing type definitions
2. Verify import paths are correct
3. Run type checking separately:
```bash
npx tsc --noEmit
```

#### Path Generation Failures
**Problem**: Path generation scripts fail during build
**Solution**:
```bash
# Run path generation manually
npm run generate-module-paths
npm run generate-submodule-paths
npm run generate-carddeck-paths
npm run generate-workout-category-paths
npm run generate-workout-subcategory-paths
```

#### Memory Issues During Build
**Problem**: Build process runs out of memory
**Solution**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Runtime Issues

#### Data Loading Failures
**Problem**: Training modules or data don't load properly
**Solution**:
1. Check browser console for errors
2. Verify data files exist in correct locations
3. Check network tab for failed requests
4. Clear browser cache and reload

#### Audio Not Playing
**Problem**: Sound effects don't work
**Solution**:
1. Check browser audio permissions
2. Verify audio files exist in `src/assets/sounds/`
3. Check audio format compatibility
4. Test with different browsers

#### Performance Issues
**Problem**: Application is slow or unresponsive
**Solution**:
1. Check browser performance tab
2. Look for memory leaks
3. Verify data caching is working
4. Consider reducing concurrent animations

### Development Issues

#### Hot Reload Not Working
**Problem**: Changes don't appear during development
**Solution**:
```bash
# Restart development server
npm run dev

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

#### Import Errors
**Problem**: Cannot resolve module imports
**Solution**:
1. Check file paths are correct
2. Verify file extensions are included
3. Check tsconfig.json path mappings
4. Restart TypeScript service in your editor

### Component Issues

#### Components Not Rendering
**Problem**: React components don't appear or render incorrectly
**Solution**:
1. Check React DevTools
2. Verify component props are correct
3. Check for JavaScript errors in console
4. Verify component export/import statements

#### State Management Issues
**Problem**: Zustand stores not updating properly
**Solution**:
1. Check store subscriptions
2. Verify state mutations are immutable
3. Use React DevTools for Zustand
4. Check for stale closures

### Data Issues

#### Training Data Not Loading
**Problem**: Training modules or workouts don't appear
**Solution**:
1. Check data file structure matches TypeScript interfaces
2. Verify JSON files are valid
3. Check data loader cache
4. Clear application cache

#### Schedule Data Corruption
**Problem**: Workout schedules become corrupted
**Solution**:
1. Check localStorage for corrupted data
2. Clear application data:
```javascript
localStorage.clear()
```
3. Verify schedule data structure
4. Check for concurrent modifications

### Browser Compatibility

#### Unsupported Browser Features
**Problem**: Application doesn't work in older browsers
**Solution**:
1. Check browser support matrix
2. Add necessary polyfills
3. Update browserslist configuration
4. Test in target browsers

#### CSS Issues
**Problem**: Styling appears broken
**Solution**:
1. Check CSS module imports
2. Verify CSS custom properties support
3. Check for CSS specificity conflicts
4. Use browser developer tools

### Deployment Issues

#### Build Artifacts Missing
**Problem**: Built application missing files
**Solution**:
1. Check build output in `dist/` folder
2. Verify all assets are included
3. Check Vite configuration
4. Ensure all imports are resolved

#### Environment Variables Not Working
**Problem**: Environment variables not available
**Solution**:
1. Check variable naming (must start with `VITE_`)
2. Verify `.env` file location
3. Check deployment platform environment settings
4. Restart development server

### Performance Debugging

#### Memory Leaks
**Problem**: Application memory usage increases over time
**Solution**:
1. Use browser Memory tab
2. Check for detached DOM nodes
3. Verify event listeners are cleaned up
4. Monitor Zustand store subscriptions

#### Slow Loading
**Problem**: Application takes too long to load
**Solution**:
1. Check network tab for slow requests
2. Optimize bundle size
3. Implement code splitting
4. Use lazy loading for components

## Debugging Tools

### Browser Developer Tools
- Console: Check for JavaScript errors
- Network: Monitor API requests and asset loading
- Performance: Analyze runtime performance
- Memory: Debug memory usage and leaks

### VS Code Extensions
- TypeScript Hero
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Bracket Pair Colorizer

### React DevTools
- Install React Developer Tools browser extension
- Monitor component state and props
- Debug React rendering issues

## Getting Help

### Before Asking for Help
1. Check this troubleshooting guide
2. Search existing GitHub issues
3. Check browser console for errors
4. Try reproducing the issue in a clean environment

### When Reporting Issues
Include:
- Operating system and version
- Browser and version
- Node.js version
- Exact error messages
- Steps to reproduce
- Expected vs actual behavior

### Support Channels
- GitHub Issues for bug reports
- Discussions for questions
- Development team for urgent issues

## Common Error Messages

### "Module not found"
- Check file paths and extensions
- Verify file exists in correct location
- Check import statement syntax

### "Cannot read property of undefined"
- Check for null/undefined values
- Add proper error handling
- Verify data structure

### "Permission denied"
- Check file permissions
- Run with appropriate user privileges
- Check security restrictions

### "Network error"
- Check internet connection
- Verify server is running
- Check firewall settings
