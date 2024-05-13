## 手順

1. s3 作成
2. cloudfront ディストリビューションを作成して oac で s3 とつなげる。
3. linux で秘密鍵と公開鍵を作成

```
openssl genrsa -out private_key.pem 2048
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

公開鍵をパラメーターストアに登録

```
aws ssm put-parameter --name "signed-cookie-pub" --value "$(cat public_key.pem)" --type String --overwrite
```

秘密鍵をパラメーターストアに登録

```
aws secretsmanager create-secret --name "signed-cookie-secret" --secret-string "$(base64 ./private_key.pem)"
```

4. cloudfront にキーペアに公開鍵を登録
5. キーグループに 4 を登録
6. cloudfront のビヘイビア
   1. パスパターンの`*.jpg`を指定。
   2. ビュワーアクセスを制御する → 5 を選択
7. 署名付きクッキー用のポリシーを作成
