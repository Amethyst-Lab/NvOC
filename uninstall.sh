#!/bin/bash

DOWNLOAD_DIR="/opt/NvOC"
DESKTOP_FILE_NAME="NvOC.desktop"
USER_DESKTOP_DIR="$HOME/.local/share/applications"


sudo rm -rf $DOWNLOAD_DIR

sudo systemctl disable --now nvoc.service

sudo rm -rf /etc/systemd/system/nvoc.service

rm -rf $USER_DESKTOP_DIR/$DESKTOP_FILE_NAME

echo "NvOC has been removed sucessfully"
echo "NvOC if your OC settings are still actives , rebooting your computer will clear it."

