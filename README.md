# wrsbmkg-mstdn
Bot tidak Resmi WRS-BMKG yang digunakan untuk menerima Peringatan Gempa yang dirasakan, dan gempa realtime.

## Menyiapkan bot
Pertama, siapkan modul-modul yang dibutuhkan
```
$ npm install
```

Kemudian, Copy file `.env.example` menjadi `.env`
```
$ cp .env.example .env
```

Edit file `.env`, dan isi kolom yang dibutuhkan:
```
# Alamat server mastodon. Contoh: https://mastodon.example
SERVER_URL=

# Token Akses yang anda buat di https://mstdn.id/settings/applications
ACCESS_TOKEN=

# Visibility, Bisa saja "public", "unlisted", "private", atau "direct".
VISIBILITY=unlisted
```

## Menjalankan bot
```
node index.js
```

Atau jika anda mau menjalankan bot di background,
```
tmux new sh -c 'while true; do node index.js; done'
```
