#!/bin/bash

# AES CRM Production Deployment Script
# Comprehensive deployment with monitoring, security, and performance optimizations

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="aes-crm"
BUILD_DIR="build"
DEPLOY_DIR="/var/www/aescrm.com"
BACKUP_DIR="/var/backups/aescrm"
NGINX_CONFIG="/etc/nginx/sites-available/aescrm.com"
SSL_CERT_PATH="/etc/letsencrypt/live/aescrm.com"
LOG_FILE="/var/log/aescrm-deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 18+ first."
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install npm first."
    fi
    
    # Check if nginx is installed
    if ! command -v nginx &> /dev/null; then
        error "nginx is not installed. Please install nginx first."
    fi
    
    # Check if certbot is installed (for SSL)
    if ! command -v certbot &> /dev/null; then
        warning "certbot is not installed. SSL certificates will not be automatically renewed."
    fi
    
    success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Install npm dependencies
    npm ci --production=false
    
    if [ $? -eq 0 ]; then
        success "Dependencies installed successfully"
    else
        error "Failed to install dependencies"
    fi
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Run unit tests
    npm run test:coverage
    
    if [ $? -eq 0 ]; then
        success "Tests passed"
    else
        error "Tests failed. Deployment aborted."
    fi
}

# Build application
build_application() {
    log "Building application for production..."
    
    # Clean previous build
    rm -rf $BUILD_DIR
    
    # Build with production optimizations
    NODE_ENV=production npm run build:production
    
    if [ $? -eq 0 ]; then
        success "Application built successfully"
    else
        error "Build failed. Deployment aborted."
    fi
    
    # Verify build
    if [ ! -d "$BUILD_DIR" ]; then
        error "Build directory not found. Build may have failed."
    fi
    
    # Check build size
    BUILD_SIZE=$(du -sh $BUILD_DIR | cut -f1)
    log "Build size: $BUILD_SIZE"
}

# Create backup
create_backup() {
    log "Creating backup of current deployment..."
    
    # Create backup directory if it doesn't exist
    mkdir -p $BACKUP_DIR
    
    # Create timestamped backup
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    if [ -d "$DEPLOY_DIR" ]; then
        cp -r $DEPLOY_DIR $BACKUP_PATH
        success "Backup created: $BACKUP_PATH"
    else
        warning "No existing deployment found to backup"
    fi
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    # Create deploy directory if it doesn't exist
    sudo mkdir -p $DEPLOY_DIR
    
    # Copy build files
    sudo cp -r $BUILD_DIR/* $DEPLOY_DIR/
    
    # Set proper permissions
    sudo chown -R www-data:www-data $DEPLOY_DIR
    sudo chmod -R 755 $DEPLOY_DIR
    
    # Set special permissions for service worker
    sudo chmod 644 $DEPLOY_DIR/sw.js
    
    success "Application deployed successfully"
}

# Configure nginx
configure_nginx() {
    log "Configuring nginx..."
    
    # Create nginx configuration
    sudo tee $NGINX_CONFIG > /dev/null <<EOF
server {
    listen 80;
    server_name aescrm.com www.aescrm.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name aescrm.com www.aescrm.com;
    
    # SSL configuration
    ssl_certificate $SSL_CERT_PATH/fullchain.pem;
    ssl_certificate_key $SSL_CERT_PATH/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://static.rocket.new https://application.rocket.new; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.supabase.com https://application.rocket.new; frame-src 'self' https://application.rocket.new; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;" always;
    
    # Root directory
    root $DEPLOY_DIR;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Cache control for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
    }
    
    # Cache control for HTML
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }
    
    # Service worker
    location /sw.js {
        expires 0;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }
    
    # API proxy (if needed)
    location /api/ {
        proxy_pass https://your-api-endpoint.com/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Main location
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    
    # Logging
    access_log /var/log/nginx/aescrm.access.log;
    error_log /var/log/nginx/aescrm.error.log;
}
EOF
    
    # Enable site
    sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
    
    # Test nginx configuration
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        success "Nginx configuration is valid"
    else
        error "Nginx configuration is invalid"
    fi
    
    # Reload nginx
    sudo systemctl reload nginx
    
    success "Nginx configured successfully"
}

# Setup SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    if command -v certbot &> /dev/null; then
        # Check if certificates exist
        if [ ! -f "$SSL_CERT_PATH/fullchain.pem" ]; then
            log "Obtaining SSL certificates..."
            sudo certbot certonly --nginx -d aescrm.com -d www.aescrm.com --non-interactive --agree-tos --email hello@postino.cc
            
            if [ $? -eq 0 ]; then
                success "SSL certificates obtained"
            else
                error "Failed to obtain SSL certificates"
            fi
        else
            success "SSL certificates already exist"
        fi
        
        # Setup auto-renewal
        log "Setting up SSL certificate auto-renewal..."
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        success "SSL auto-renewal configured"
    else
        warning "certbot not available. Please set up SSL certificates manually."
    fi
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring script
    sudo tee /usr/local/bin/aescrm-monitor.sh > /dev/null <<EOF
#!/bin/bash
# AES CRM Monitoring Script

# Check if application is responding
if curl -f -s https://aescrm.com/health > /dev/null; then
    echo "\$(date): Application is healthy" >> /var/log/aescrm-monitor.log
else
    echo "\$(date): Application is down" >> /var/log/aescrm-monitor.log
    # Send alert (implement your alerting system here)
fi

# Check disk space
DISK_USAGE=\$(df / | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 80 ]; then
    echo "\$(date): Disk usage is high: \$DISK_USAGE%" >> /var/log/aescrm-monitor.log
fi

# Check memory usage
MEMORY_USAGE=\$(free | awk 'NR==2{printf "%.2f", \$3*100/\$2}')
if (( \$(echo "\$MEMORY_USAGE > 80" | bc -l) )); then
    echo "\$(date): Memory usage is high: \$MEMORY_USAGE%" >> /var/log/aescrm-monitor.log
fi
EOF
    
    sudo chmod +x /usr/local/bin/aescrm-monitor.sh
    
    # Setup monitoring cron job
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/aescrm-monitor.sh") | crontab -
    
    success "Monitoring setup completed"
}

# Setup log rotation
setup_log_rotation() {
    log "Setting up log rotation..."
    
    sudo tee /etc/logrotate.d/aescrm > /dev/null <<EOF
/var/log/aescrm-deploy.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}

/var/log/aescrm-monitor.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}

/var/log/nginx/aescrm.*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF
    
    success "Log rotation configured"
}

# Run performance tests
run_performance_tests() {
    log "Running performance tests..."
    
    # Wait for deployment to be ready
    sleep 10
    
    # Test if application is responding
    if curl -f -s https://aescrm.com/health > /dev/null; then
        success "Application is responding"
    else
        error "Application is not responding"
    fi
    
    # Run Lighthouse performance test (if available)
    if command -v lighthouse &> /dev/null; then
        log "Running Lighthouse performance test..."
        lighthouse https://aescrm.com --output=html --output-path=/tmp/lighthouse-report.html --quiet
        success "Lighthouse test completed. Report saved to /tmp/lighthouse-report.html"
    else
        warning "Lighthouse not available. Install with: npm install -g lighthouse"
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Keep only last 10 backups
    cd $BACKUP_DIR
    ls -t | tail -n +11 | xargs -r rm -rf
    
    success "Old backups cleaned up"
}

# Main deployment function
main() {
    log "Starting AES CRM production deployment..."
    
    check_root
    check_prerequisites
    install_dependencies
    run_tests
    build_application
    create_backup
    deploy_application
    configure_nginx
    setup_ssl
    setup_monitoring
    setup_log_rotation
    run_performance_tests
    cleanup_old_backups
    
    success "Deployment completed successfully!"
    log "Application is available at: https://aescrm.com"
    log "Health check: https://aescrm.com/health"
    log "Monitoring logs: /var/log/aescrm-monitor.log"
}

# Run main function
main "$@"
