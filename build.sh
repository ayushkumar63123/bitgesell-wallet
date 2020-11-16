#!/bin/bash

npm test &&


DIST_FOLDER=../bitgesell-wallet-js-frontend-core-dist

mkdir -p $DIST_FOLDER &&

cp -r public/* $DIST_FOLDER/ &&

babel \
src/utils.js \
src/app.js \
src/login/login.js \
src/welcome/welcome.js \
src/create-wallet/create-wallet.js \
src/set-password/set-password.js \
src/restore/restore.js \
src/my-addresses/my-addresses.js \
src/new-address/new-address.js \
src/transactions/transactions.js \
src/send/send.js \
-o $DIST_FOLDER/app.js &&

uglifyjs \
lib/1-jquery-3.2.1.min.js \
lib/2-jquery.dataTables.min.js \
lib/3-dataTables.bootstrap4.min.js \
lib/4-dataTables.responsive.min.js \
lib/5-responsive.bootstrap.min.js \
lib/bootstrap-native-v4.min.js \
lib/sweetalert2.min.js \
lib/dayjs.min.js \
lib/bootstrap-native-v4.min.js \
lib/sweetalert2.min.js \
lib/dayjs.min.js \
lib/qrcode.js \
lib/satoshi-bitcoin.js \
$DIST_FOLDER/app.js \
-c drop_console=true,toplevel=true -m toplevel=true -o $DIST_FOLDER/app.min.js &&

rm $DIST_FOLDER/app.js &&

html-minifier --collapse-whitespace --remove-comments \
src/header.html \
src/main.html \
src/my-addresses/my-addresses.html \
src/new-address/new-address.html \
src/transactions/transactions.html \
src/dashboard.html \
src/send/send.html \
src/footer.html \
src/welcome/welcome.html \
src/create-wallet/create-wallet.html \
src/restore/restore.html \
src/set-password/set-password.html \
src/login/login.html \
-o $DIST_FOLDER/index.html &&

cleancss \
lib/bootstrap.min.css \
lib/sweetalert2.min.css \
lib/animate.min.css \
lib/dataTables.bootstrap4.min.css \
lib/responsive.bootstrap4.min.css \
src/custom.css \
-o $DIST_FOLDER/custom.min.css --skip-rebase
