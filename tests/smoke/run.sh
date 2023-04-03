#!/usr/bin/env bash

cwd=$(dirname "$0")
targets=( cjs esm )
status=0

for target in "${targets[@]}"
do
 
    echo "==== Testing $target build ===="

    pushd "$cwd/$target" > /dev/null
    echo "▶️ Installing..."
    touch yarn.lock
    yarn install --no-immutable > /dev/null
    echo "▶️ Copying dist..."
    rm -rf "./node_modules/bandersnatch/dist"
    cp -r "../../../dist" "./node_modules/bandersnatch"
    cp "../../../package.json" "./node_modules/bandersnatch"
    yarn install --no-immutable > /dev/null
    echo "▶️ Running test script..."
    actual=$(yarn test ok 2>&1)
    expected=ok
    if [ "$actual" = "$expected" ]; then
        echo "✅"
    else
        echo "❌"
        echo -e "\nExpected:\n\n$expected"
        echo -e "\nActual:\n\n$actual\n"
        status=1
    fi
    popd > /dev/null

done

exit $status
