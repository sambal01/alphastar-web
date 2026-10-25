window.ALPHASTAR_WEBSITE_CONFIG = Object.freeze({
  siteName: 'Alphastar',
  siteUrl: 'https://alphastarkasiglahan.com/',
  apiBaseUrl: window.ALPHASTAR_API_BASE_URL || '',
  androidApkUrl: window.ALPHASTAR_ANDROID_APK_URL || 'downloads/Alphastar-1.0.59-build60.apk',
  androidApkRelease: window.ALPHASTAR_ANDROID_APK_URL ? null : Object.freeze({
    version: '1.0.59', build: 60, bytes: 95763080,
    filename: 'Alphastar-1.0.59-build60.apk',
    url: 'downloads/Alphastar-1.0.59-build60.apk', testing: true
  }),
  firebase: {
    apiKey: 'AIzaSyDovlYRntcWR9RbPRVE3Bvtj_zxy14houI',
    appId: '1:269434063894:web:877eebdb44ead72c837937',
    authDomain: 'alpha-star-clinic-mobile.firebaseapp.com',
    databaseURL: 'https://alpha-star-clinic-mobile-default-rtdb.firebaseio.com',
    messagingSenderId: '269434063894',
    projectId: 'alpha-star-clinic-mobile',
    storageBucket: 'alpha-star-clinic-mobile.firebasestorage.app'
  },
  firebaseProjectId: 'alpha-star-clinic-mobile',
  firebaseProjectName: 'Alpha-Star-Clinic-Mobile',
  firebaseHostingUrl: 'https://alpha-star-clinic-mobile.web.app',
  firebaseDatabaseUrl: 'https://alpha-star-clinic-mobile-default-rtdb.firebaseio.com'
});
