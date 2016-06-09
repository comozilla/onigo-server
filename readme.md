# sphero-joystick

![](https://docs.google.com/drawings/d/1izzy4NO9N6wnBPxxaT6xdnkyV2dwE7FlXRnXC9kviX4/pub?w=700&h=366)

## About
SpheroをJoystickで動かします。  
sphero-websocket を使用しています。  
node.js サーバーとWebSocketで通信し、信号を送っています。

## 準備

### モジュールをインストール
```
$ npm install
```

### Spheroのシリアルポートを取得し、設定を書き替える

sphero-ws-config.js 内
```
wsPort: <ポート名>
```

### Sphero サーバーを起動
```
$ npm run server
```

テストモード（実際に接続はせず、ログ出力のみ）でもできます。
```
$ npm run server-test
```

### Browser-sync サーバーを起動

```
$ npm run browser-sync
```

