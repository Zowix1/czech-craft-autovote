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
