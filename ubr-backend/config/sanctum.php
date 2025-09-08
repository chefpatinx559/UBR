@@ .. @@
     'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
         '%s%s',
         'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
-        Sanctum::currentApplicationUrlWithPort()
+        Sanctum::currentApplicationUrlWithPort() . ',localhost:5173,localhost:5174'
     ))),
 
     /*
@@ .. @@
     'expiration' => null,
 
     /*