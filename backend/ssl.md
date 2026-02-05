Nginx’li VPS’te Let’s Encrypt wildcard SSL (ücretsiz) almak için genel yöntem: DNS-01 doğrulama + certbot. Örnek domain: ornekdomain.com.

1. Certbot’u kur
Ubuntu/Debian varsayıyorum (farklı ise söyle):

sudo apt update
sudo apt install certbot
2. Wildcard sertifika iste
Aşağıdaki komutta domainini değiştir:

sudo certbot certonly --manual --preferred-challenges dns -d "ornekdomain.com" -d "*.ornekdomain.com"
Sana ekranda şu tarz bir çıktı verecek:

> Please deploy a DNS TXT record under the name
> _acme-challenge.ornekdomain.com
> with the following value:
> uzun-bir-token-değeri

3. DNS TXT kaydını ekle
Domaininin DNS yönetimine git (Hostinger DNS ya da nerede yönetiyorsan):

Type: TXT
Name/Host: _acme-challenge
Value: (certbot’un verdiği uzun değer)
TTL: 300 veya mümkün olan en düşük
DNS’in yayılmasını bekle (genelde birkaç dakika). Kontrol için (lokal bilgisayarından):

nslookup -q=TXT _acme-challenge.ornekdomain.com
Çıktıda verdiğin TXT değeri görünmeli.

Sonra terminalde certbot’un beklediği ekranda Enter’a bas.

Başarılı olursa şöyle bir yol verecek:

/etc/letsencrypt/live/ornekdomain.com/fullchain.pem
/etc/letsencrypt/live/ornekdomain.com/privkey.pem
4. Nginx’e tanımla
Site config’inde (örnek):

server {
 listen 443 ssl http2;
 listen [::]:443 ssl http2;
 server_name ornekdomain.com .ornekdomain.com;

 ssl_certificate /etc/letsencrypt/live/ornekdomain.com/fullchain.pem;
 ssl_certificate_key /etc/letsencrypt/live/ornekdomain.com/privkey.pem;

 root /var/www/ornekdomain.com/public;
 index index.php index.html index.htm;
}
server {
 listen 80;
 listen [::]:80;
 server_name ornekdomain.com .ornekdomain.com;
 return 301 https://$host$request_uri;
}
Sonra:

sudo nginx -t
sudo systemctl reload nginx
5. Otomatik yenileme
DNS-01 manuel olduğundan, tam otomatik yenileme için genelde API’li bir eklenti (Cloudflare, hPanel DNS API vb.) kullanmak gerekir. Şimdilik 90 günde bir aynı işlemi tekrar edebilirsin veya bana:

Domain hangi DNS’te yönetiliyor? (Hostinger, Cloudflare vb.)
diye yazarsan, o sağlayıcıya özel tam otomatik yenileme kurulumunu da gösterebilirim.


*.benimadresim.com şeklinde alabilirmiyim

Kodee
Evet, *.benimadresim.com şeklinde wildcard SSL sertifikası alabilirsin; teknik olarak doğru form budur.
Let’s Encrypt ile alırken komutta şu şekilde yazman yeterli:

sudo certbot certonly --manual --preferred-challenges dns \
 -d "benimadresim.com" -d "*.benimadresim.com"
Önemli nokta:

*.benimadresim.com tüm alt alan adlarını kapsar (blog.benimadresim.com, shop.benimadresim.com vb.),
ama kök domaini (benimadresim.com) tek başına kapsamaz; bu yüzden yukarıdaki gibi hem kök domaini hem wildcard’ı istemen gerekir.