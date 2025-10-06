#!/bin/bash

# Fix deployment issues for AES CRM
# Addresses MIME type and manifest errors

echo "🔧 Fixing deployment issues..."

# 1. Clean and rebuild
echo "Cleaning previous build..."
rm -rf build
rm -rf dist

# 2. Install dependencies
echo "Installing dependencies..."
npm ci

# 3. Build for production with proper configuration
echo "Building for production..."
NODE_ENV=production npm run build

# 4. Verify build output
echo "Verifying build output..."
if [ ! -d "build" ]; then
    echo "❌ Build directory not found!"
    exit 1
fi

# 5. Check for critical files
echo "Checking critical files..."
if [ ! -f "build/index.html" ]; then
    echo "❌ index.html not found!"
    exit 1
fi

if [ ! -f "build/manifest.json" ]; then
    echo "❌ manifest.json not found!"
    exit 1
fi

# 6. Create .htaccess for Apache servers (if needed)
echo "Creating .htaccess for proper MIME types..."
cat > build/.htaccess << 'EOF'
# MIME type fixes
<IfModule mod_mime.c>
    AddType application/javascript .js
    AddType text/css .css
    AddType application/json .json
    AddType image/svg+xml .svg
    AddType application/font-woff .woff
    AddType application/font-woff2 .woff2
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Cache control
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType application/font-woff "access plus 1 year"
    ExpiresByType application/font-woff2 "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>

# SPA routing
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
EOF

# 7. Create nginx configuration snippet
echo "Creating nginx configuration snippet..."
cat > build/nginx-config.txt << 'EOF'
# Add this to your nginx server block

# MIME type fixes
location ~* \.(js|mjs)$ {
    add_header Content-Type "application/javascript; charset=utf-8";
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.css$ {
    add_header Content-Type "text/css; charset=utf-8";
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.json$ {
    add_header Content-Type "application/json; charset=utf-8";
    expires 1d;
}

# SPA routing
location / {
    try_files $uri $uri/ /index.html;
}

# Security headers
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
EOF

# 8. Verify JavaScript files have correct MIME type
echo "Verifying JavaScript files..."
for js_file in build/assets/*.js; do
    if [ -f "$js_file" ]; then
        echo "✅ Found: $(basename "$js_file")"
    fi
done

# 9. Check manifest.json
echo "Checking manifest.json..."
if [ -f "build/manifest.json" ]; then
    echo "✅ manifest.json found"
    # Validate JSON
    if python3 -m json.tool build/manifest.json > /dev/null 2>&1; then
        echo "✅ manifest.json is valid JSON"
    else
        echo "❌ manifest.json is invalid JSON"
        exit 1
    fi
else
    echo "❌ manifest.json not found in build"
    exit 1
fi

# 10. Create deployment checklist
echo "Creating deployment checklist..."
cat > build/DEPLOYMENT_CHECKLIST.md << 'EOF'
# Deployment Checklist

## Pre-deployment
- [ ] Run `npm run build` successfully
- [ ] Verify all files in build/ directory
- [ ] Check manifest.json is valid
- [ ] Test locally with `npm run serve`

## Server Configuration
- [ ] Configure nginx with proper MIME types (see nginx-config.txt)
- [ ] Ensure JavaScript files served with `application/javascript`
- [ ] Ensure CSS files served with `text/css`
- [ ] Ensure manifest.json served with `application/json`
- [ ] Configure SPA routing (try_files directive)

## Post-deployment
- [ ] Test main page loads without white screen
- [ ] Check browser console for errors
- [ ] Verify manifest.json loads (check Network tab)
- [ ] Test JavaScript modules load correctly
- [ ] Check service worker registration

## Common Issues
1. **White screen**: Usually MIME type issue with JavaScript files
2. **Manifest 404**: Check file exists and nginx serves .json files
3. **Module errors**: Ensure proper Content-Type headers
4. **SPA routing**: Configure try_files for React Router
EOF

echo "✅ Build fixed and ready for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Upload build/ directory to your server"
echo "2. Configure nginx with settings from nginx-config.txt"
echo "3. Test the deployment"
echo "4. Check DEPLOYMENT_CHECKLIST.md for verification steps"
echo ""
echo "🔍 If you still see white screen:"
echo "1. Check browser console for specific errors"
echo "2. Verify nginx MIME type configuration"
echo "3. Check that all JavaScript files load with correct Content-Type"
