#!/bin/bash

# Portfolio Deployment Script
# This script builds and deploys the Saif Aljanahi portfolio to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Saif Aljanahi Portfolio"
BUILD_DIR="dist"
BACKUP_DIR="backups"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required commands exist
check_dependencies() {
    log_info "Checking dependencies..."
    
    commands=("node" "npm" "git")
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            log_error "$cmd is not installed or not in PATH"
            exit 1
        fi
    done
    
    log_success "All dependencies are available"
}

# Validate environment
check_environment() {
    log_info "Checking environment..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Are you in the project root?"
        exit 1
    fi
    
    # Check if .env exists for production builds
    if [ ! -f ".env" ] && [ ! -f ".env.production" ]; then
        log_warning "No environment file found. Make sure environment variables are set properly."
    fi
    
    log_success "Environment validation passed"
}

# Clean previous builds
clean_build() {
    log_info "Cleaning previous builds..."
    
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        log_success "Removed previous build directory"
    fi
    
    # Clean npm cache if needed
    npm cache clean --force &> /dev/null || true
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Check if node_modules exists and package.json is newer
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        npm ci
        log_success "Dependencies installed"
    else
        log_info "Dependencies are up to date"
    fi
}

# Run tests (if available)
run_tests() {
    log_info "Running tests..."
    
    # Check if test script exists
    if npm run test --dry-run &> /dev/null; then
        npm run test
        log_success "All tests passed"
    else
        log_warning "No test script found, skipping tests"
    fi
}

# Run linting
run_linting() {
    log_info "Running linter..."
    
    if npm run lint --dry-run &> /dev/null; then
        npm run lint
        log_success "Linting passed"
    else
        log_warning "No lint script found, skipping linting"
    fi
}

# Build for production
build_project() {
    log_info "Building project for production..."
    
    # Set production environment
    export NODE_ENV=production
    export VITE_APP_ENV=production
    
    # Build the project
    npm run build
    
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build failed - $BUILD_DIR directory not created"
        exit 1
    fi
    
    log_success "Project built successfully"
}

# Optimize build
optimize_build() {
    log_info "Optimizing build..."
    
    # Check build size
    build_size=$(du -sh "$BUILD_DIR" | cut -f1)
    log_info "Build size: $build_size"
    
    # Check for large files
    large_files=$(find "$BUILD_DIR" -type f -size +1M 2>/dev/null || true)
    if [ ! -z "$large_files" ]; then
        log_warning "Large files detected:"
        echo "$large_files"
    fi
    
    log_success "Build optimization complete"
}

# Validate build
validate_build() {
    log_info "Validating build..."
    
    # Check critical files
    critical_files=("index.html" "assets")
    for file in "${critical_files[@]}"; do
        if [ ! -e "$BUILD_DIR/$file" ]; then
            log_error "Critical file/directory missing: $file"
            exit 1
        fi
    done
    
    # Check for console.log in production (basic check)
    if grep -r "console\.log" "$BUILD_DIR" --include="*.js" &> /dev/null; then
        log_warning "console.log statements found in production build"
    fi
    
    log_success "Build validation passed"
}

# Deploy to Vercel (if vercel.json exists)
deploy_vercel() {
    if [ -f "vercel.json" ]; then
        log_info "Deploying to Vercel..."
        
        if command -v vercel &> /dev/null; then
            vercel --prod
            log_success "Deployed to Vercel"
        else
            log_warning "Vercel CLI not found. Install with: npm i -g vercel"
            log_info "You can manually deploy by:"
            log_info "1. Install Vercel CLI: npm i -g vercel"
            log_info "2. Run: vercel --prod"
        fi
    fi
}

# Deploy to Netlify (if netlify.toml exists)
deploy_netlify() {
    if [ -f "netlify.toml" ]; then
        log_info "Deploying to Netlify..."
        
        if command -v netlify &> /dev/null; then
            netlify deploy --prod --dir="$BUILD_DIR"
            log_success "Deployed to Netlify"
        else
            log_warning "Netlify CLI not found. Install with: npm i -g netlify-cli"
            log_info "You can manually deploy by:"
            log_info "1. Install Netlify CLI: npm i -g netlify-cli"
            log_info "2. Run: netlify deploy --prod --dir=$BUILD_DIR"
        fi
    fi
}

# Create deployment backup
create_backup() {
    log_info "Creating deployment backup..."
    
    mkdir -p "$BACKUP_DIR"
    backup_name="backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    tar -czf "$BACKUP_DIR/$backup_name" "$BUILD_DIR"
    log_success "Backup created: $BACKUP_DIR/$backup_name"
}

# Main deployment function
main() {
    log_info "Starting deployment of $PROJECT_NAME"
    log_info "========================================"
    
    # Run all deployment steps
    check_dependencies
    check_environment
    clean_build
    install_dependencies
    run_linting
    run_tests
    build_project
    optimize_build
    validate_build
    create_backup
    
    # Deploy to platforms
    deploy_vercel
    deploy_netlify
    
    log_success "========================================"
    log_success "Deployment completed successfully!"
    log_info "Build location: $BUILD_DIR"
    log_info "Build size: $(du -sh "$BUILD_DIR" | cut -f1)"
    
    # Show next steps
    echo ""
    log_info "Next steps:"
    log_info "1. Test the deployed application"
    log_info "2. Monitor performance and errors"
    log_info "3. Update DNS if needed"
    log_info "4. Verify SSL certificate"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --build-only   Only build, don't deploy"
        echo "  --no-tests     Skip running tests"
        echo "  --no-lint      Skip running linter"
        echo ""
        echo "Environment variables:"
        echo "  NODE_ENV       Set to 'production' for production builds"
        echo "  SKIP_TESTS     Set to 'true' to skip tests"
        echo "  SKIP_LINT      Set to 'true' to skip linting"
        exit 0
        ;;
    --build-only)
        log_info "Running build-only mode"
        check_dependencies
        check_environment
        clean_build
        install_dependencies
        [ "${SKIP_LINT:-}" != "true" ] && run_linting
        [ "${SKIP_TESTS:-}" != "true" ] && run_tests
        build_project
        optimize_build
        validate_build
        log_success "Build completed successfully!"
        exit 0
        ;;
    --no-tests)
        export SKIP_TESTS=true
        main
        ;;
    --no-lint)
        export SKIP_LINT=true
        main
        ;;
    "")
        main
        ;;
    *)
        log_error "Unknown option: $1"
        log_info "Use --help for usage information"
        exit 1
        ;;
esac 