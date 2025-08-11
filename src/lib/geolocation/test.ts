import { GeolocationService, calculateDistance, isWithinPerimeter } from './index';

export async function testGeolocationFeatures() {
  console.log('🧪 Testing CareClock Geolocation Features');
  
  const geoService = GeolocationService.getInstance();
  
  // Test 1: Check browser support
  console.log('✅ Browser support:', geoService.isSupported());
  
  // Test 2: Check permissions
  try {
    const permission = await geoService.checkPermissions();
    console.log('✅ Permission state:', permission);
  } catch (error) {
    console.log('❌ Permission check failed:', error);
  }
  
  // Test 3: Distance calculation
  const distance = calculateDistance(40.7589, -73.9851, 40.7614, -73.9776);
  console.log('✅ Distance calculation (NYC):', Math.round(distance), 'meters');
  
  // Test 4: Perimeter checking
  const withinPerimeter = isWithinPerimeter(40.7589, -73.9851, 40.7614, -73.9776, 500);
  console.log('✅ Within 500m perimeter:', withinPerimeter);
  
  // Test 5: Get current location (if permission granted)
  try {
    const position = await geoService.getCurrentPosition();
    console.log('✅ Current position:', {
      lat: position.latitude.toFixed(6),
      lng: position.longitude.toFixed(6),
      accuracy: Math.round(position.accuracy) + 'm'
    });
  } catch (error) {
    console.log('❌ Location access failed:', error);
  }
}

// Add to window for browser testing
if (typeof window !== 'undefined') {
  (window as any).testGeolocation = testGeolocationFeatures;
}
