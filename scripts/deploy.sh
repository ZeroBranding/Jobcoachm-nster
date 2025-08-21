#!/bin/bash

# JobCoach Münster - Deployment Script
# Automatisiertes Deployment für verschiedene Umgebungen

set -e  # Exit bei Fehlern

# Konfiguration
PROJECT_NAME="jobcoach-muenster"
DOCKER_IMAGE="$PROJECT_NAME:latest"
BACKUP_DIR="/backups/$PROJECT_NAME"
LOG_FILE="/var/log/$PROJECT_NAME-deploy.log"

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging-Funktion
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Hilfe anzeigen
show_help() {
    cat << EOF
JobCoach Münster - Deployment Script

USAGE:
    $0 [COMMAND] [OPTIONS]

COMMANDS:
    docker      Deploy mit Docker
    vercel      Deploy zu Vercel
    server      Deploy zu traditionellem Server
    backup      Erstelle Backup
    rollback    Rollback zu vorheriger Version
    test        Führe Deployment-Tests durch
    help        Zeige diese Hilfe

OPTIONS:
    --env       Umgebung (production|staging|development)
    --force     Überspringe Sicherheitschecks
    --dry-run   Zeige was passieren würde, ohne zu deployen
    --backup    Erstelle Backup vor Deployment

EXAMPLES:
    $0 docker --env production --backup
    $0 vercel --env staging
    $0 test --env production
    $0 rollback

EOF
}

# Umgebungsvariablen laden
load_environment() {
    if [[ -f ".env" ]]; then
        source .env
        log "Environment variables loaded from .env"
    else
        warning "No .env file found, using defaults"
    fi
}

# Pre-Deployment Checks
pre_deploy_checks() {
    log "🔍 Running pre-deployment checks..."
    
    # Node.js Version prüfen
    if ! command -v node &> /dev/null; then
        error "Node.js not found. Please install Node.js 18+"
    fi
    
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $node_version -lt 18 ]]; then
        error "Node.js version $node_version found. Please upgrade to Node.js 18+"
    fi
    
    # Dependencies prüfen
    if [[ ! -d "node_modules" ]]; then
        log "📦 Installing dependencies..."
        npm ci
    fi
    
    # Legal Templates prüfen
    log "⚖️ Checking legal templates..."
    if ! node scripts/check-legal-templates.js; then
        error "Legal templates contain placeholders. Run 'npm run legal:update' first."
    fi
    
    # Tests ausführen (falls nicht --force)
    if [[ "$FORCE" != "true" ]]; then
        log "🧪 Running tests..."
        npm run test:e2e || error "E2E tests failed"
        npm run test:a11y || error "Accessibility tests failed"
        npm run security:audit || error "Security audit failed"
    fi
    
    success "Pre-deployment checks passed"
}

# Backup erstellen
create_backup() {
    if [[ "$BACKUP" == "true" ]] || [[ "$1" == "backup" ]]; then
        log "📦 Creating backup..."
        
        local timestamp=$(date +%Y%m%d-%H%M%S)
        local backup_path="$BACKUP_DIR/backup-$timestamp"
        
        mkdir -p "$backup_path"
        
        # Aktuelle Deployment-Dateien sichern
        if [[ -d "/var/www/$PROJECT_NAME" ]]; then
            tar -czf "$backup_path/website.tar.gz" -C "/var/www/$PROJECT_NAME" .
        fi
        
        # Docker-Image sichern (falls vorhanden)
        if docker image inspect "$DOCKER_IMAGE" &> /dev/null; then
            docker save "$DOCKER_IMAGE" | gzip > "$backup_path/docker-image.tar.gz"
        fi
        
        # Konfigurationsdateien sichern
        tar -czf "$backup_path/config.tar.gz" \
            /etc/nginx/sites-available/$PROJECT_NAME \
            /etc/ssl/certs/$PROJECT_NAME* \
            2>/dev/null || true
        
        success "Backup created: $backup_path"
        echo "$backup_path" > "$BACKUP_DIR/latest-backup"
    fi
}

# Docker Deployment
deploy_docker() {
    log "🐳 Starting Docker deployment..."
    
    # Image bauen
    log "🏗️ Building Docker image..."
    docker build -f docker/Dockerfile -t "$DOCKER_IMAGE" .
    
    # Alte Container stoppen
    if docker ps -q -f name="$PROJECT_NAME-web" | grep -q .; then
        log "🛑 Stopping existing container..."
        docker stop "$PROJECT_NAME-web"
        docker rm "$PROJECT_NAME-web"
    fi
    
    # Neuen Container starten
    log "🚀 Starting new container..."
    docker run -d \
        --name "$PROJECT_NAME-web" \
        --restart unless-stopped \
        -p 80:80 \
        -p 443:443 \
        -v "$PWD/docker/ssl:/etc/nginx/ssl:ro" \
        "$DOCKER_IMAGE"
    
    # Health Check
    log "🔍 Performing health check..."
    sleep 10
    
    if curl -f http://localhost/health &> /dev/null; then
        success "Docker deployment successful"
    else
        error "Health check failed"
    fi
}

# Vercel Deployment
deploy_vercel() {
    log "⚡ Starting Vercel deployment..."
    
    # Vercel CLI prüfen
    if ! command -v vercel &> /dev/null; then
        log "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Build für Production
    log "🏗️ Building for production..."
    npm run build
    
    # Deployment
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log "🚀 Deploying to production..."
        vercel --prod --confirm
    else
        log "🚀 Deploying to preview..."
        vercel --confirm
    fi
    
    success "Vercel deployment successful"
}

# Server Deployment
deploy_server() {
    log "🖥️ Starting server deployment..."
    
    # SSH-Verbindung prüfen
    if [[ -z "$SERVER_HOST" ]] || [[ -z "$SERVER_USER" ]]; then
        error "SERVER_HOST and SERVER_USER must be set in .env"
    fi
    
    # Build erstellen
    log "🏗️ Building for production..."
    npm run build
    
    # Dateien zum Server kopieren
    log "📤 Uploading files to server..."
    rsync -avz --delete \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='tests' \
        --exclude='.github' \
        dist/ \
        "$SERVER_USER@$SERVER_HOST:$SERVER_PATH"
    
    # Remote-Commands ausführen
    log "🔄 Restarting services on server..."
    ssh "$SERVER_USER@$SERVER_HOST" << EOF
        sudo systemctl reload nginx
        sudo systemctl status nginx --no-pager
EOF
    
    success "Server deployment successful"
}

# Deployment-Tests
run_deployment_tests() {
    log "🧪 Running deployment tests..."
    
    local test_url="${SITE_URL:-http://localhost}"
    
    # Basis-Erreichbarkeit
    log "🔍 Testing site availability..."
    if ! curl -f "$test_url" &> /dev/null; then
        error "Site not reachable at $test_url"
    fi
    
    # Security Headers
    log "🔒 Testing security headers..."
    local headers=$(curl -s -I "$test_url")
    
    if ! echo "$headers" | grep -i "x-frame-options" &> /dev/null; then
        warning "X-Frame-Options header missing"
    fi
    
    if ! echo "$headers" | grep -i "content-security-policy" &> /dev/null; then
        warning "Content-Security-Policy header missing"
    fi
    
    # Performance-Test
    if command -v lighthouse &> /dev/null; then
        log "⚡ Running Lighthouse performance test..."
        lighthouse "$test_url" \
            --only-categories=performance,accessibility \
            --chrome-flags="--headless" \
            --output=json \
            --output-path="./deployment-lighthouse.json" \
            --quiet
        
        local perf_score=$(cat deployment-lighthouse.json | jq -r '.categories.performance.score * 100')
        local a11y_score=$(cat deployment-lighthouse.json | jq -r '.categories.accessibility.score * 100')
        
        log "📊 Performance Score: ${perf_score}%"
        log "♿ Accessibility Score: ${a11y_score}%"
        
        if [[ $(echo "$perf_score < 90" | bc -l) -eq 1 ]]; then
            warning "Performance score below 90%"
        fi
        
        if [[ $(echo "$a11y_score < 95" | bc -l) -eq 1 ]]; then
            error "Accessibility score below 95%"
        fi
    fi
    
    success "Deployment tests completed"
}

# Rollback-Funktion
rollback() {
    log "🔄 Starting rollback..."
    
    if [[ ! -f "$BACKUP_DIR/latest-backup" ]]; then
        error "No backup found for rollback"
    fi
    
    local backup_path=$(cat "$BACKUP_DIR/latest-backup")
    
    if [[ ! -d "$backup_path" ]]; then
        error "Backup directory not found: $backup_path"
    fi
    
    # Docker Rollback
    if docker image inspect "$DOCKER_IMAGE-backup" &> /dev/null; then
        log "🐳 Rolling back Docker container..."
        docker stop "$PROJECT_NAME-web" || true
        docker rm "$PROJECT_NAME-web" || true
        docker tag "$DOCKER_IMAGE-backup" "$DOCKER_IMAGE"
        docker run -d --name "$PROJECT_NAME-web" -p 80:80 -p 443:443 "$DOCKER_IMAGE"
    fi
    
    # Server Rollback
    if [[ -f "$backup_path/website.tar.gz" ]]; then
        log "🖥️ Rolling back server files..."
        tar -xzf "$backup_path/website.tar.gz" -C "/var/www/$PROJECT_NAME"
        sudo systemctl reload nginx
    fi
    
    success "Rollback completed"
}

# Hauptfunktion
main() {
    local command="$1"
    shift
    
    # Parameter parsen
    while [[ $# -gt 0 ]]; do
        case $1 in
            --env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --force)
                FORCE="true"
                shift
                ;;
            --dry-run)
                DRY_RUN="true"
                shift
                ;;
            --backup)
                BACKUP="true"
                shift
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done
    
    # Standard-Werte setzen
    ENVIRONMENT="${ENVIRONMENT:-production}"
    FORCE="${FORCE:-false}"
    DRY_RUN="${DRY_RUN:-false}"
    BACKUP="${BACKUP:-false}"
    
    log "🚀 JobCoach Münster Deployment"
    log "Environment: $ENVIRONMENT"
    log "Command: $command"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "🏃 DRY RUN MODE - No actual changes will be made"
    fi
    
    # Umgebung laden
    load_environment
    
    # Command ausführen
    case $command in
        docker)
            create_backup
            if [[ "$DRY_RUN" != "true" ]]; then
                pre_deploy_checks
                deploy_docker
                run_deployment_tests
            fi
            ;;
        vercel)
            if [[ "$DRY_RUN" != "true" ]]; then
                pre_deploy_checks
                deploy_vercel
                run_deployment_tests
            fi
            ;;
        server)
            create_backup
            if [[ "$DRY_RUN" != "true" ]]; then
                pre_deploy_checks
                deploy_server
                run_deployment_tests
            fi
            ;;
        backup)
            create_backup backup
            ;;
        rollback)
            rollback
            ;;
        test)
            run_deployment_tests
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Unknown command: $command. Use '$0 help' for usage information."
            ;;
    esac
    
    success "🎉 Deployment completed successfully!"
}

# Script ausführen
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    if [[ $# -eq 0 ]]; then
        show_help
        exit 1
    fi
    
    main "$@"
fi