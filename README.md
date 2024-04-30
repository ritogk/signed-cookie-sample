## 手順

1. s3 作成
2. cloudfront ディストリビューションを作成して oac で s3 とつなげる。
3. linux で秘密鍵と公開鍵を作成

```
openssl genrsa -out private_key.pem 2048
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

4. cloudfront にキーペアに公開鍵を登録
5. キーグループに 4 を登録
6. cloudfront のビヘイビア
   1. パスパターンの`*.jpg`を指定。
   2. ビュワーアクセスを制御する → 5 を選択
7. 署名付きクッキー用のポリシーを作成

```
vim policy
```

```json
{
  "Statement": [
    {
      "Resource": "https://d2cm0ep8pjmdbf.cloudfront.net/*",
      "Condition": {
        "DateLessThan": {
          "AWS:EpochTime": 1714521600
        }
      }
    }
  ]
}
```

8. 署名付き用の cookie を生成  
   `CloudFront-Policy`：空白文字や改行を削除し、base64 エンコードされた json 形式のポリシーステートメント

```bash
cat policy | tr -d "\n" | tr -d " \t\n\r" | openssl base64 -A | tr -- '+=/' '-_~'
```

`CloudFront-Signature`：base64 エンコードされ、事前準備で作成した秘密鍵で署名されたポリシーステートメン

```bash
cat policy | tr -d "\n" | tr -d " \t\n\r" | openssl sha1 -sign private_key.pem | openssl base64 -A | tr -- '+=/' '-_~'
```

`CloudFront-Key-Pair-Id`：事前準備で作成したパブリックキーの ID

9. 署名付きクッキーを使用して DL

```bash
curl -H 'Cookie: CloudFront-Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kMnYyd3NtaGE0MzhvaS5jbG91ZGZyb250Lm5ldC8qIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzE0NTIxNjAwfX19XX0_;CloudFront-Signature=P6PEtGG9vCi0tNeCv6B-2JwisYuJMKtQ3W~5n2evUPQ~iB7tSatLIEz9bnGYTBlgIqJ8vCBjIm6RZBzDZmQptsAWFs~LgXGKxHZK1WkFOHXNwVPV~eOZ4LUHWt3BXv7qaBJU9SueQvQVoBm98u2ps1ZrLEuvTz3yavGgMfG7ZFesFH4dcU5Pa5HqDCZ0rNpQFcT07axTD1NlVMWlSFVvJalVy5XnX7T56GXkVg9KplS6cMl7uzDtjz~r7d-cgXPqpl~rekt7KMwdV2S7aCqrCzHC2p~-uVk8pE2~4PdE~Z5o40OP-v6yVaqGyX44SlWiUuCFaElKzHLXdBTBT1jACA__;CloudFront-Key-Pair-Id=K3S6GDCHITS3LL' https://d2v2wsmha438oi.cloudfront.net/images.jpg --output images.jpg
```
