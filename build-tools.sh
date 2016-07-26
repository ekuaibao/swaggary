#!/bin/bash

# 获取版本号
get_ver() {
  if [ "$VER" = "" ]; then
    VER=`git describe --tags --always $(git rev-parse HEAD)`
  fi
  echo $VER
}

# 打包并将文件移动到repo目录，需要指定输出文件夹路径
pack_and_move() {
  local FILE="$2-$(get_ver)-$(date +'%y%m%d-%H%M').tar.gz"
  tar -czf $REPO/$FILE -C $1 .
  echo "please use $FILE for deployment"
}
