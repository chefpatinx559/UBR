@@ .. @@
     'name' => env('APP_NAME', 'Laravel'),
 
     /*
@@ .. @@
     'timezone' => 'Africa/Abidjan',
 
     /*
@@ .. @@
     'locale' => 'fr',
 
     /*
@@ .. @@
     'fallback_locale' => 'en',
 
     /*
@@ .. @@
     'faker_locale' => 'fr_FR',
 
+    /*
+    |--------------------------------------------------------------------------
+    | UBR Specific Configuration
+    |--------------------------------------------------------------------------
+    */
+
+    'min_age' => env('UBR_MIN_AGE', 20),
+    'max_photos' => env('UBR_MAX_PHOTOS', 6),
+    'admin_token' => env('UBR_ADMIN_TOKEN', 'monSuperTokenSecret'),
+    'matching_radius' => env('UBR_MATCHING_RADIUS', 50),
+    'verification_required' => env('UBR_VERIFICATION_REQUIRED', true),
+
     /*