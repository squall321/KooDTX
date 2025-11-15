#!/bin/bash
# Bundle Size Analysis Script
# Phase 167: Analyze bundle size and identify optimization opportunities

set -e

echo "📦 Bundle Size Analysis"
echo "======================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo -e "${RED}Error: npx not found. Please install Node.js${NC}"
    exit 1
fi

# Function to analyze Android bundle
analyze_android() {
    echo -e "${YELLOW}Analyzing Android bundle...${NC}"

    # Generate bundle
    npx react-native bundle \
        --platform android \
        --dev false \
        --entry-file index.js \
        --bundle-output android-release.bundle \
        --sourcemap-output android-release.bundle.map

    # Get bundle size
    BUNDLE_SIZE=$(du -h android-release.bundle | cut -f1)
    echo -e "${GREEN}Android bundle size: ${BUNDLE_SIZE}${NC}"

    # Visualize bundle
    if command -v npx react-native-bundle-visualizer &> /dev/null; then
        echo "Opening bundle visualizer..."
        npx react-native-bundle-visualizer \
            --bundle android-release.bundle \
            --map android-release.bundle.map
    fi

    # Clean up
    rm -f android-release.bundle android-release.bundle.map
}

# Function to analyze iOS bundle
analyze_ios() {
    echo -e "${YELLOW}Analyzing iOS bundle...${NC}"

    # Generate bundle
    npx react-native bundle \
        --platform ios \
        --dev false \
        --entry-file index.js \
        --bundle-output ios-release.bundle \
        --sourcemap-output ios-release.bundle.map

    # Get bundle size
    BUNDLE_SIZE=$(du -h ios-release.bundle | cut -f1)
    echo -e "${GREEN}iOS bundle size: ${BUNDLE_SIZE}${NC}"

    # Visualize bundle
    if command -v npx react-native-bundle-visualizer &> /dev/null; then
        echo "Opening bundle visualizer..."
        npx react-native-bundle-visualizer \
            --bundle ios-release.bundle \
            --map ios-release.bundle.map
    fi

    # Clean up
    rm -f ios-release.bundle ios-release.bundle.map
}

# Function to find duplicate dependencies
find_duplicates() {
    echo -e "${YELLOW}Finding duplicate dependencies...${NC}"

    if command -v npm &> /dev/null; then
        npm dedupe --dry-run || true
    fi
}

# Function to analyze node_modules size
analyze_node_modules() {
    echo -e "${YELLOW}Analyzing node_modules size...${NC}"

    if [ -d "node_modules" ]; then
        NODE_MODULES_SIZE=$(du -sh node_modules | cut -f1)
        echo -e "${GREEN}node_modules size: ${NODE_MODULES_SIZE}${NC}"

        # List largest packages
        echo ""
        echo "Top 10 largest packages:"
        du -sh node_modules/* 2>/dev/null | sort -rh | head -10
    else
        echo -e "${RED}node_modules not found${NC}"
    fi
}

# Function to check for large libraries
check_large_libraries() {
    echo -e "${YELLOW}Checking for large libraries...${NC}"

    # Common large libraries to watch for
    LARGE_LIBS=("moment" "lodash" "@tensorflow" "rxjs")

    for lib in "${LARGE_LIBS[@]}"; do
        if [ -d "node_modules/$lib" ]; then
            SIZE=$(du -sh "node_modules/$lib" 2>/dev/null | cut -f1)
            echo -e "${YELLOW}Found: ${lib} (${SIZE})${NC}"
            echo "  Consider alternatives or tree-shaking"
        fi
    done
}

# Function to generate size report
generate_report() {
    echo -e "${YELLOW}Generating size report...${NC}"

    REPORT_FILE="bundle-size-report.txt"

    {
        echo "Bundle Size Analysis Report"
        echo "Generated: $(date)"
        echo "=============================="
        echo ""

        # Android
        echo "Android Bundle:"
        npx react-native bundle \
            --platform android \
            --dev false \
            --entry-file index.js \
            --bundle-output android-temp.bundle \
            &> /dev/null || true
        if [ -f "android-temp.bundle" ]; then
            du -h android-temp.bundle
            rm android-temp.bundle
        fi
        echo ""

        # iOS
        echo "iOS Bundle:"
        npx react-native bundle \
            --platform ios \
            --dev false \
            --entry-file index.js \
            --bundle-output ios-temp.bundle \
            &> /dev/null || true
        if [ -f "ios-temp.bundle" ]; then
            du -h ios-temp.bundle
            rm ios-temp.bundle
        fi
        echo ""

        # node_modules
        echo "node_modules:"
        if [ -d "node_modules" ]; then
            du -sh node_modules
        fi
        echo ""

        # Package count
        echo "Installed packages:"
        if [ -f "package.json" ]; then
            DEPS=$(cat package.json | grep -c '":' || echo "0")
            echo "$DEPS dependencies listed"
        fi

    } > "$REPORT_FILE"

    echo -e "${GREEN}Report saved to ${REPORT_FILE}${NC}"
    cat "$REPORT_FILE"
}

# Main menu
show_menu() {
    echo ""
    echo "Select analysis type:"
    echo "1) Android bundle"
    echo "2) iOS bundle"
    echo "3) Both platforms"
    echo "4) Find duplicates"
    echo "5) Analyze node_modules"
    echo "6) Check large libraries"
    echo "7) Generate full report"
    echo "8) All analyses"
    echo "0) Exit"
    echo ""
}

# Parse command line arguments
if [ "$#" -eq 0 ]; then
    # Interactive mode
    while true; do
        show_menu
        read -p "Enter choice: " choice

        case $choice in
            1) analyze_android ;;
            2) analyze_ios ;;
            3) analyze_android; analyze_ios ;;
            4) find_duplicates ;;
            5) analyze_node_modules ;;
            6) check_large_libraries ;;
            7) generate_report ;;
            8)
                analyze_android
                analyze_ios
                find_duplicates
                analyze_node_modules
                check_large_libraries
                generate_report
                ;;
            0) exit 0 ;;
            *) echo -e "${RED}Invalid choice${NC}" ;;
        esac

        echo ""
        read -p "Press Enter to continue..."
    done
else
    # Command line mode
    case "$1" in
        android) analyze_android ;;
        ios) analyze_ios ;;
        both) analyze_android; analyze_ios ;;
        duplicates) find_duplicates ;;
        node-modules) analyze_node_modules ;;
        large-libs) check_large_libraries ;;
        report) generate_report ;;
        all)
            analyze_android
            analyze_ios
            find_duplicates
            analyze_node_modules
            check_large_libraries
            generate_report
            ;;
        *)
            echo "Usage: $0 {android|ios|both|duplicates|node-modules|large-libs|report|all}"
            exit 1
            ;;
    esac
fi

echo ""
echo -e "${GREEN}Analysis complete!${NC}"
