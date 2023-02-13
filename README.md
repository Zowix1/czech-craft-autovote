# czech-craft autovote

Povoluje automatické hlasování pro server na czech-craftu každé 2 hodiny.  
Využívá velmi dobře hodnocené placené API na řešení reCAPTCHY ([2captcha](https://2captcha.com/enterpage)).  
**3$ => ~1000 hlasů**

# Jak to spustit

Použijeme VPS s linuxem a distribucí ubuntu 20.04  
Tohle VPS si můžete koupit např na [something.host](https://cp.something.host) hostingu za 4€ / měsíc  
Jak se přihlásit do VPS najdete u something.host. Já osobně doporučuju používat **MobaXterm client**

Když jsme přihlášení za **root** uživatele můžeme pokračovat v bashi

## Command line v bashi

### Nainstalujeme firewall pro větší zabezpečení

```
apt install ufw
```

### Zapneme firewall

```
ufw enable
```

### Povolíme port pod kterým se připojujeme

```
ufw allow 22
```

### Zkontrolujeme že je všechno povolené

```
ufw status
```

### Nainstalujeme node.js

```
apt install nodejs
```

### Nainstalujeme npm

```
apt install npm
```

### Nainstalujeme potřebné instalace aby fungoval puppeteer

```
apt install chromium-browser -y
```

```
apt update && apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

### Zkopírujeme repository na naše VPS

1. Klikni na zelené tlačítko `<> Code`.
2. Vyber možnost HTTPS.
3. Zkopíruj si odkaz

```
apt install git
```

```
mkdir czech-craft-autovote
```

```
cd czech-craft-autovote
```

```
git clone <odkaz> .
```

### Nainstalujeme všechny potřebný knihovny

```
npm install
```

### Získáme API klíč

1. Na [2captcha](https://2captcha.com/enterpage) doplníme peníze, je na tobě kolik
   - mělo by se ti zobrazit na kolik requestů ti bude balance stačit
2. Pod `Account settings` by jsi měl mít API klíč, který si zkopíruj

```
nano .env
```

>       API_KEY=<api klíč>
>
> místo `<api klíč>` doplň svůj zkopírovaný klíč

Zmáčki `CTRL + O`  
Zmáčkni `ENTER`  
Zmáčkni `CTRL + X`

### Upravíme config

```
nano config.json
```

```json
{
  "sitekey": "6LdG2UkUAAAAALt2hHRqE7k0-9GR7XKYJKGaiqC6",
  // NEMĚNÍME - pouze pokud chcete použít kód pro jinou stránku než czech-craft

  "page_url": "https://czech-craft.eu/server/epes/vote/",
  // URL SERVERU PRO HLASOVÁNÍ (stránka kde se nachází reCAPTCHA)

  "api_submit_page": "http://2captcha.com/in.php",
  // NEMĚNÍME

  "api_retrive_page": "http://2captcha.com/res.php",
  // NEMĚNÍME

  "username_xpath": "/html/body/div[1]/div[1]/div/form/input[1]",
  // NEMĚNÍME

  "checkbox_xpath": "/html/body/div[1]/div[1]/div/form/div[1]/input",
  // NEMĚNÍME

  "button_xpath": "/html/body/div[1]/div[1]/div/form/button",
  // NEMĚNÍME

  "alert_class": ".alert.alert-error",
  // NEMĚNÍME

  "username": "Zowix",
  // VAŠE USERNAME

  "utc_minutes_offset": 60
  // Odchylka od UTC času v minutách (slouží pouze pro logování do konzole) - NEDŮLEŽITÉ
}
```

Zase vypneme nano editor stejně jako o krok dozadu

### Nainstalujeme pm2

`pm2` je knihovna, která nám pomůže hostovat tenhle script 24/7

```
npm i -g pm2
```

### Spustíme pm2

```
pm2 start --name ccAuto index.js
```

```
pm2 startup ubuntu
```

### Hotovo

Můžeme zkontrolovat zda všechno běží v pořádku pomocí

```
pm2 logs ccAuto
```

Pak můžeme opustit bash pomocí

```
exit
```

nebo

```
logout
```
