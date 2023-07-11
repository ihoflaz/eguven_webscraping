# eguven_webscraping

## Kurulum

Projenin kurulumunu gerçekleştirmek için aşağıdaki adımları izleyin:

1. Projeyi yerel makinenize kopyalayın:

    ```bash
    git clone https://github.com/ihoflaz/eguven_webscraping.git
    cd eguven_webscraping
    ```

2. Projedeki bağımlılıkları yükleyin:

    ```bash
    npm install
    ```

3. Prisma şemasını oluşturun:

    ```bash
    npx prisma db push
    ```

   Bu komut, `schema.prisma` dosyasını okur ve belirttiğiniz şemaya göre veritabanınızı oluşturur veya günceller. `schema.prisma` dosyası, uygulamanızın veritabanı şemasını ve Prisma istemcisini tanımlar. Bu dosya, veritabanınıza ve tablolarınıza nasıl erişeceğinizi belirtir.

4. Prisma istemcisini oluşturun:

    ```bash
    npx prisma generate
    ```

   Bu komut, veritabanıyla etkileşim sağlayabilecek bir Prisma istemcisi oluşturur.

5. Uygulamayı başlatın:

    ```bash
    nodemon --exec npm start
    ```

   Bu komut, uygulamanızı başlatır ve herhangi bir değişiklik olduğunda uygulamanızı yeniden başlatır.

Şimdi, uygulamanız http://localhost:3000 adresinde çalışıyor olmalıdır.

## Kullanım

Uygulamayı kullanmaya başlamadan önce, bir yönetici hesabı oluşturmanız ve bu hesapla giriş yapmanız gerekir. Daha sonra, yönetici hesabınızla yeni bir şirket oluşturabilir ve bu şirkete kullanıcılar ekleyebilirsiniz. Kullanıcılar, kendi hesaplarına giriş yaptıktan sonra e-imza oluşturabilirler.

```javascript
const data = {
    "companyName": "admin",
    "companyAddress": "admin",
    "companyPhone": "0",
    "firstName": "admin",
    "lastName": "admin",
    "email": "admin@admin.com",
    "phone": "0",
    "password": "admin"
};

const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
});
```
Bu hesapla giriş yaptıktan sonra, yönetici hesabınızla yeni bir şirket oluşturabilir ve bu şirkete kullanıcılar ekleyebilirsiniz. Kullanıcılar, kendi hesaplarına giriş yaptıktan sonra e-imza oluşturabilirler.

## Veri Tabanını Sıfırlama

İhtiyaç Halinde veritabanını sıfırlamak için aşağıdaki komutu çalıştırın:

 ```bash
npx prisma migrate reset
 ```