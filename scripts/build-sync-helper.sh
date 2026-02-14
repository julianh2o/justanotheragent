#!/bin/bash
# Build script for Outreach Sync Helper
# Creates a macOS app bundle and packages it as a DMG for distribution

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SYNC_HELPER_DIR="$PROJECT_ROOT/messages_sync_helper"
OUTPUT_DIR="$PROJECT_ROOT/resources"

echo "Building Outreach Sync Helper..."

cd "$SYNC_HELPER_DIR"

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt -q

# Create ICNS icon from PNG if it doesn't exist or PNG is newer
ASSETS_DIR="$SYNC_HELPER_DIR/assets"
PNG_ICON="$ASSETS_DIR/icon.png"
ICNS_ICON="$ASSETS_DIR/icon.icns"

if [ ! -f "$ICNS_ICON" ] || [ "$PNG_ICON" -nt "$ICNS_ICON" ]; then
    echo "Creating ICNS icon..."
    ICONSET_DIR="$ASSETS_DIR/icon.iconset"
    mkdir -p "$ICONSET_DIR"

    # Generate required icon sizes using sips
    for size in 16 32 64 128 256 512; do
        sips -z $size $size "$PNG_ICON" --out "$ICONSET_DIR/icon_${size}x${size}.png" > /dev/null 2>&1
        # Create @2x versions for Retina
        double=$((size * 2))
        if [ $double -le 1024 ]; then
            sips -z $double $double "$PNG_ICON" --out "$ICONSET_DIR/icon_${size}x${size}@2x.png" > /dev/null 2>&1
        fi
    done

    # Convert iconset to icns
    iconutil -c icns "$ICONSET_DIR" -o "$ICNS_ICON"
    rm -rf "$ICONSET_DIR"
    echo "ICNS icon created."
fi

# Clean previous build
rm -rf build dist

# Build the app
echo "Running py2app..."
python setup.py py2app --quiet

# Create output directory
mkdir -p "$OUTPUT_DIR"

APP_NAME="Outreach Sync Helper"

# Sign the app bundle (ad-hoc signing for distribution without Apple Developer ID)
echo "Signing app bundle..."
codesign --force --deep --sign - "dist/$APP_NAME.app"

# Create DMG
echo "Creating DMG..."
DMG_NAME="$APP_NAME.dmg"
DMG_PATH="$OUTPUT_DIR/$DMG_NAME"

# Remove old DMG if exists
rm -f "$DMG_PATH"

# Create a temporary directory for DMG contents
DMG_TEMP="$SYNC_HELPER_DIR/dmg_temp"
rm -rf "$DMG_TEMP"
mkdir -p "$DMG_TEMP"
cp -R "dist/$APP_NAME.app" "$DMG_TEMP/"

# Create symlink to Applications folder
ln -s /Applications "$DMG_TEMP/Applications"

# Create the DMG
hdiutil create -volname "$APP_NAME" -srcfolder "$DMG_TEMP" -ov -format UDZO "$DMG_PATH"

# Clean up
rm -rf "$DMG_TEMP"

echo "Build complete: $DMG_PATH"
