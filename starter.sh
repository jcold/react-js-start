export StarterPath=$(pwd) && alias workflow-starter=" cp $StarterPath/webpack* .; cp $StarterPath/package.json .; cp $StarterPath/gulpfile* .; cp $StarterPath/.gitignore .; cp $StarterPath/.npmignore .; cp $StarterPath/README.md .; cp -r $StarterPath/src .; mkdir build prebuild; git init; "
