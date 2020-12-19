deno bundle -c ./tsconfig.json src/gasissue.ts ./tmp/gasissue.js
sed s/import\(/import2\(/ ./tmp/gasissue.js > ./tmp/gasissue_replacedimport.js
cat ./src/gasglobal.js ./tmp/gasissue_replacedimport.js > ./dist/index.js