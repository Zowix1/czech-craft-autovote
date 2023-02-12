## VPS

```
apt install ufw
```

```
ufw enable
```

```
ufw allow 22
```

```
ufw status
```

```
apt install nodejs
```

```
apt install npm
```

```
apt install chromium-browser -y
```

```
apt update && apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

```
nějak si dostaň tu složku na VPS (třeba udělej repo na githubu, pak si jeste musis stahnout git: apt install git)

cd czech-craft-script
```

```
npm install
```

```
nano .env

vlož svůj API klíč
API_KEY=<klic>
```

```
npm i -g pm2
```

```
pm2 start --name czechCraft index.js
```

```
pm2 startup ubuntu
```
