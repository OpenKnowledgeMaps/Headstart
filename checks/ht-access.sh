# !/bin/bash
# Checks that .htaccess file exists in the project-website folder and creates one if if it is not

cd .. || exit
cd project-website || exit

if [ ! -f .htaccess ]; then
    echo "\033[1;33m  Warning: .htaccess not found in the project-website folder. It will be created automatically."
    cp settings.htaccess .htaccess
    echo ".htaccess file created."
fi

cd .. || exit
cd Headstart || exit