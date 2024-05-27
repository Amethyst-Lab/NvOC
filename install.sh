#!/bin/bash


URL="https://amethystlab.org/software/nvoc/nvoc-latest.tar.xz"  
DOWNLOAD_DIR="/opt/NvOC"
DESKTOP_FILE_NAME="NvOC.desktop"
USER_DESKTOP_DIR="$HOME/.local/share/applications"


if [ -d "$DOWNLOAD_DIR" ]; then
  sudo rm -rf "$DOWNLOAD_DIR"
fi


sudo mkdir -p $DOWNLOAD_DIR

wget $URL -O /tmp/software.tar.xz


sudo tar -xf /tmp/software.tar.xz -C $DOWNLOAD_DIR


mkdir -p $USER_DESKTOP_DIR
cat <<EOL > $USER_DESKTOP_DIR/$DESKTOP_FILE_NAME
[Desktop Entry]
Version=1.0
Type=Application
Name=NvOC
Exec=/opt/NvOC/nvoc
Icon=/opt/NvOC/NVOClogo.png
StartupWMClass=nvoc
Terminal=false
Categories=Utility;
EOL


chmod +x $USER_DESKTOP_DIR/$DESKTOP_FILE_NAME


echo "NvOC has been installed sucessfully"

