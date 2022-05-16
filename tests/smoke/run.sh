#!/usr/bin/env bash

cwd=$(dirname "$0")
targets=( cjs esm )
status=0

for target in "${targets[@]}"
do
 
    echo "==== Testing $target build ===="

    pushd "$cwd/$target"
    echo "▶️ Installing..."
    touch yarn.lock
    yarn install
    echo "▶️ Copying lib..."
    rm -rf "./node_modules/bandersnatch/lib"
    cp -r "../../../lib" "./node_modules/bandersnatch"
    cp "../../../package.json" "./node_modules/bandersnatch"
    yarn install
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
    popd

done

exit $status
