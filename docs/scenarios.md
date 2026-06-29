# STEMVERSE — 20 DUNYO, 20 QAHROMON, 20 YECHIM

> Har bir dars — bu siz bosh qahramon bo'lgan bir hikoya.
> Dunyoda muammo yuz beradi. Uni faqat siz hal qila olasiz.
> Yechim — Arduino sxemangizni yig'ish va kod yozish orqali topiladi.
> Siz qurilmani ishlatganingizda, virtual dunyo o'zgaradi.

---

## 🌆 1-DUNYO: ENERGY CITY — "So'nggi chiroq"

### Voqea

Shahar **Energy City** — bir paytlar yorug' va quvnoq bo'lgan bu joy, hozir **zulmatga botgan**. Elektr stansiyasi noma'lum sababdan ishlamay qoldi. Odamlar uylarida qorong'ida o'tiribdi. Ko'chalar bo'm-bo'sh. Tramvaylar harakatlanmaydi. Bolalar maktabga bora olmayapti. Shahar **sizning yordamingizga muhtoj**.

### Siz kimsiz?

Siz **Electra** — shaharning yagona energetik muhandisisiz. Elektr tizimini qayta tiklash uchun sizdan boshqa hech kim bu bilimga ega emas. Sizning qo'lingizda — Arduino, bir necha komponentlar va shaharni qutqarish uchun cheklangan vaqt.

### Sxemani yig'ish

> **Siz yig'ishingiz kerak:**
> - LED → 220Ω rezistor → Arduino pin 13
> - Tugma → Arduino pin 2 (pull-down)
> - Potensiometr → Arduino A0

Arduino'ni kompyuterga ulaysiz. Kod yozasiz. LED yonadi. Şeş... u o'chdi. Yana yonadi. Yana o'chdi. **Bu yorug'lik signali!**

### Kulminatsiya

Birinchi marta LED yonganda — Energy City da **bitta chiroq yonadi**. Odamlar derazalardan mo'ralaydi. LED ikkinchi marta yonganda — **tramvay harakatlanadi**. Keyingi har bir blink bilan ko'proq binolar yorishadi, odamlar ko'chalarga chiqadi.

Potensiometrni burasiz — **shahar energiya tarmog'i jonlanadi**. Tugmani bossangiz — **tramvay gudogi eshitiladi**.

5 marta LED yondi. **Shahar to'liq yorishdi.** Odamlar bayram qilmoqda. Siz — **qahramonsiz**.

---

## 🚦 2-DUNYO: TRAFFIC LIGHT — "Chorrahadagi xaos"

### Voqea

Katta shaharning markaziy chorrahasi butunlay **tartibsizlikka botgan**. Svetafor bir necha kundan beri ishlamaydi. Mashinalar to'xtovsiz signal chalishmoqda. Piyodalar yo'lni kesib o'tolmayapti. Ikkita avtohalokat yuz berdi. Kimdir jabrlanmasdan oldin **chora ko'rish kerak**.

### Siz kimsiz?

Siz **Travis** — shahar yo'l harakat muhandisisiz. O'zingiz bilan favqulodda svetafor tizimini olib kelgansiz — 3 xil rangdagi LED va boshqaruv tugmasi. Faqat uni o'rnatish va sozlash qoldi.

### Sxemani yig'ish

Qizil, sariq va yashil LED'larni Arduino'ga ulaysiz. Ularning har biri — svetaforning bir ko'zi. Tugma — piyodalar o'tish tugmasi.

Siz kod yozasiz. **Qizil yonadi** — mashinalar to'xtaydi, piyodalar o'tadi. **Yashil yonadi** — transport harakatlanadi. **Sariq** — ogohlantirish.

### Kulminatsiya

Chorraha jonlandi. Mashinalar tartibli harakatlanmoqda. Piyodalar tugma bosadi — svetafor ularga yo'l beradi. 10 marta to'liq sikl boshqarildi — **hech qanday avtohalokat yuz bermadi**. Shahar hokimi sizni shaxsan tabriklaydi.

Sizning svetaforingiz — **shahar qutqaruvchisi**.

---

## 🎨 3-DUNYO: COLOR MAGIC — "Sehrgar ustaxonasi"

### Voqea

**Kroma** shahrida ranglar asta-sekin yo'qolmoqda. Avval qizil, keyin ko'k, keyin yashil... Dunyo kul rangga aylanib bormoqda. Odamlar ranglarni unutayapti. Bola chizgan rasm — faqat qora va oq. Shaharning **ranglar sehrgari** g'oyib bo'lgan. Uning ustaxonasida faqat bitta asbob qolgan — **RGB mikser**.

### Siz kimsiz?

Siz **Mira** — sehrgarning shogirdisiz. Ustoz g'oyib bo'lgach, ranglarni qaytarish vazifasi sizga yuklandi. Sizning qurolingiz — RGB LED va 3 ta potensiometr. Ularni aralashtirib, dunyoga ranglarni qaytarishingiz mumkin.

### Sxemani yig'ish

RGB LED (qizil, yashil, ko'k — 3 ta pin) va 3 ta potensiometrni Arduino'ga ulaysiz. Har bir potensiometr — bir rang.

### Kulminatsiya

Potensiometrlarni burasiz. **Qizil paydo bo'ladi!** Yashil qo'shiladi — **sariq!** Ko'k bilan aralashadi — **millionlab ranglar!** Ekranda sizning rangingiz va target rang ko'rsatiladi. 90% o'xshashlikka erishsangiz — **Kroma shahri ranglarni qaytarib oladi**.

Ustoz qaytib keladi va sizni chinakam sehrgar deb ataydi.

---

## 💡 4-DUNYO: LIGHT SHOW — "Yulduz sahnasi"

### Voqea

Butun galaktika bo'ylab sayohat qiluvchi musiqa festivali **StarFest** bugun sizning shahringizga keldi. Millionlab tomoshabin yig'ildi. Sahna tayyor. Ovoz tizimi sozlangan. Faqat bitta muammo bor — **yorug'lik shousi uchun DJ ketma-ket**. Eskisi kasal bo'lib qoldi va sizdan boshqa hech kim LED pattern'larini bilmaydi.

### Siz kimsiz?

Siz **Lumina** — mahalliy klublarda o'ynovchi yosh DJ'siz. Sizning qo'lingizda — 4 ta LED va tugma. Bu sizning eng katta shousingiz bo'ladi.

### Sxemani yig'ish

4 ta LED'ni Arduino'ga ulaysiz. Tugma — pattern o'zgartirish uchun. Ikkita rejim: "Wave", "Blink", "Fade", "Random".

### Kulminatsiya

Siz sahnaga chiqasiz. Tomoshabinlar kutmoqda. Tugmani bosasiz — birinchi pattern yonadi. Olqishlar! Pattern'lar almashadi, tomoshabinlar raqsga tushadi. **Dance Challenge** boshlanadi — siz tomoshabinlar so'ragan pattern'ni topishingiz kerak.

3 ta challenge muvaffaqiyatli bajarildi. **StarFest saqlab qolindi!** Siz — galaktika miqyosidagi yulduzsiz.

---

## 🚪 5-DUNYO: SECRET DOOR — "Agentning so'nggi topshirig'i"

### Voqea

Maxfiy agent **Kodi** dushman shtabiga kirib borgan. Eng muhim hujjatlar temir eshik ortida saqlanmoqda. Eshikni ochish uchun — **5 bosqichli maxfiy kod** kerak. Kod har safar o'zgaradi. Shtabda bironta ham kompyuter yo'q — faqat sizning maxfiy qurilmangiz (Arduino) va eshikni ochadigan tugma.

### Siz kimsiz?

Siz **Agent Kodi** — maxfiy xizmatning eng yaxshi agenti. Sizning qurolingiz — Arduino, bir tugma, LED va buzzer. Bu oddiy qurilma orqali siz eng murakkab kodni ham yecha olasiz.

### Sxemani yig'ish

Tugma → pin 2, LED → pin 13, Buzzer → pin 6. Kod yozasiz — tugma bosilish ketma-ketligini eslab qoladi va tekshiradi.

### Kulminatsiya

Eshik oldida turibsiz. Tugmani bossiz... LED qisqa yonadi — ketma-ketlikning birinchi qismi to'g'ri. Yana bossiz — ikkinchi. Uchinchi... To'rtinchi... Beshinchi! LED yonadi, buzzer chalinadi. **Eshik ochildi!**

Hujjatlar qo'lga kiritildi. **Missiya bajarildi, agent.**

---

## 🏃 6-DUNYO: SPEED RUNNER — "Tunnel qochuvi"

### Voqea

**Siz yerdan 100 metr pastda, yer osti laboratoriyasida qamalgansiz.** Laboratoriya xavfsizlik tizimi ishdan chiqqan — eshiklar bloklangan, koridorlar to'siqlar bilan to'ldirilgan. Kislorod 30 daqiqaga yetadi. Bitta yo'l bor — **noma'lum tunnel orqali qochish**.

### Siz kimsiz?

Siz **Nova** — laboratoriyada ishlovchi muhandis. Siz Arduino asosida avariya tizimini yasagansiz. Potensiometr — tezlikni boshqaradi. Tugma — sakrash. Sizning yagona imkoniyatingiz — bu qurilma orqali tunnelni bosib o'tish.

### Sxemani yig'ish

Potensiometr → A0, tugma → pin 2. Serial orqali ma'lumotlarni kompyuterga uzatasiz.

### Kulminatsiya

Tunnelga kirasiz. Potensiometrni burasiz — qancha ko'p burasangiz, tezlik shuncha oshadi. To'siqlar paydo bo'ladi — tugmani bosib sakraysiz. Tezlikni boshqarib, to'siqlardan qochib, oldinga intilasiz.

1000 metr... Chiroq ko'rindi. **Chiqish eshigi!** Siz erkinsiz.

---

## 🎵 7-DUNYO: LIGHT THEREMIN — "Yorug'lik simfoniyasi"

### Voqea

Kosmik kemada **aloqa tizimi ishdan chiqqan** va faqat g'alati bir usul bilan ishlaydi — **yorug'lik orqali**. Chastota modulyatsiyasi. Signalni faqat ma'lum bir tovush chastotasiga sozlasangiz, Yer bilan aloqa o'rnatiladi. Ammo hech kim bu chastotani qanday hosil qilishni bilmaydi.

### Siz kimsiz?

Siz **Sonar** — kemaning bosh muhandisi. Siz LDR (yorug'lik sensori) va buzzer yordamida **yorug'lik bilan boshqariladigan musiqa asbobi** — Theremin yasadingiz.

### Sxemani yig'ish

LDR → A0, Buzzer → pin 6, LED → pin 13. Qo'lingizni LDR ustida harakatlantirib, chastotani o'zgartirasiz.

### Kulminatsiya

Qo'lingizni LDR ustiga tutasiz — past ovoz, qorong'i. Qo'lingizni olib, yorug'lik tushiramiz — ovoz balandlashadi, LED yonadi. **1500 Hz!** Signal ushlandi! **Aloqa o'rnatildi!**

"Yer, bu Kometa-7. Biz xavfsizmiz. Takrorlaymiz — xavfsizmiz."

---

## 🌱 8-DUNYO: TEMPERATURE GARDEN — "Oxirgi bog'"

### Voqea

Yadro qishidan so'ng, yer yuzida faqat bitta jonli bog' qolgan — **Temp Garden**. Bu bog'ni isitish tizimi qadimiy texnologiya bilan ishlaydi. Agar harorat 20-30°C oralig'ida saqlanmasa, **bog' abadiy quriydi va yer yuzidagi oxirgi o'simliklar yo'qoladi**.

### Siz kimsiz?

Siz **Flora** — botanik va muhandis. LM35 harorat sensori va LEDlar yordamida bog'ning haroratini kuzatasiz. Harorat pasaysa — ko'k LED, normal bo'lsa — yashil, ko'tarilsa — qizil.

### Sxemani yig'ish

LM35 → A0, 3xLED → pin 13,12,11. Haroratni o'lchaysiz va LEDlar orqali ko'rsatasiz.

### Kulminatsiya

Harorat 22°C — yashil LED yonadi. Bog'dagi o'simliklar **gullay boshlaydi**. Gul barglari ochiladi, kapalaklar uchadi. 30 soniya davomida haroratni ushlab turasiz — bog' to'liq tiklanganini e'lon qiladi.

**Yer yuzidagi so'nggi bog' saqlab qolindi. Rahmat, Flora.**

---

## 📡 9-DUNYO: DISTANCE RADAR — "Ko'rinmas dushman"

### Voqea

Harbiy baza atrofida noma'lum ob'ektlar paydo bo'lmoqda. Radar tizimi ishlamayapti. Kim ular? Qayerdan kelgan? Qanchalik yaqin? Hech kim bilmaydi. Baza komandiri: "Bizga **radar kerak**, va u bugun kerak!"

### Siz kimsiz?

Siz **Radar** — baza muhandisi. HC-SR04 ultrasonic sensor va 4 ta LED yordamida qo'lbola radar yasaysiz. Sensor tovush to'lqinlari orqali masofani o'lchaydi — xuddi ko'rshapalak kabi!

### Sxemani yig'ish

Ultrasonic sensor → trig=9, echo=8. 4xLED → pin 13,12,11,10. Qancha yaqin bo'lsa, shuncha ko'p LED yonadi.

### Kulminatsiya

Radarni ishga tushirasiz. Ekranda **radar chizig'i aylanadi**. Birinchi nishon topildi! Ikkinchi... Uchinchi... 5 ta nishon aniqlandi. Ular — **biologik namunalar yig'uvchi avtomatik zondlar**. Hech qanday tahdid yo'q. Baza xavfsiz.

Sizning radaringiz bazani qutqardi.

---

## ⚡ 10-DUNYO: REACTION CHAMPION — "Turnir"

### Voqea

Butun maktabda eng nufuzli musobaqa — **REACTION CHAMPIONSHIP**. Kim eng tez reaksiya qiladi? G'olibga — "Eng tezkor" unvoni va butun yil davomida bepul ovqat. Ammo hakamlar tizimi buzilgan. Yangi reaksiya o'lchagich kerak.

### Siz kimsiz?

Siz **Quick** — maktabning texnik klubi rahbari. Arduino, ikkita tugma, LED va buzzer yordamida **reaksiya o'lchagich** yasaysiz.

### Sxemani yig'ish

2 tugma → pin 2 va 3, LED → pin 13, buzzer → pin 6.

### Kulminatsiya

Musobaqa boshlanadi. LED yonadi — "🔥 PRESS NOW!" Ikkala o'yinchi tugmalarni bosishga harakat qiladi. Kim birinchi bossa — u g'alaba qozonadi. 5 raund. Eng tezkor aniqlanadi.

**Sizning qurilmangiz — maktabning eng mashhur ixtirosi.**

---

## 🦾 11-DUNYO: ROBOT ARM — "Zaharlı quti"

### Voqea

Laboratoriyada **radioaktiv material tushib ketgan**. Uni qo'l bilan olish mumkin emas. Robot qo'l kerak. Ammo zavod roboti ishlamaydi — boshqaruv tizimi yo'q. Siz uni noldan yasashingiz kerak.

### Siz kimsiz?

Siz **Mech** — robototexnik. Servo, potensiometr va ultrasonic sensor yordamida robot qo'lini yasaysiz.

### Sxemani yig'ish

Servo → pin 9, POT → A0, tugma → pin 2. Potensiometr bilan asosni aylantirasiz.

### Kulminatsiya

Potensiometrni burasiz — robot qo'l aylanadi. Nishonga yetganda tugmani bosasiz — ushlaysiz! Birinchi nishon yig'ildi. Ikkinchi. Uchinchi. Radioaktiv material xavfsiz konteynerga joylandi.

**Laboratoriya qutqarildi. Siz — qahramon muhandis.**

---

## 🎹 12-DUNYO: PIANO PLAYER — "Notalar afsonasi"

### Voqea

Qadimiy musobaqa — **Notalar Afsonasi**. Har yili shaharning eng yaxshi musiqachisi maxsus pianinoda eng murakkab kuy chalishi kerak. Bu yilgi kuy — "Twinkle Twinkle". Musobaqaga bir soat qoldi, ammo pianino **yo'q**. U buzilgan.

### Siz kimsiz?

Siz **Melody** — musiqachi va ixtirochi. 4 ta tugma va buzzer yordamida **raqamli pianino** yasaysiz.

### Sxemani yig'ish

4 tugma → pin 2-5 (INPUT_PULLUP), buzzer → pin 6. Har bir tugma — bir nota: C, D, E, F.

### Kulminatsiya

Sahnaga chiqasiz. Tomoshabinlar jim. Tugmalarni bossiz — notalar yangraydi. "Twin-kle, twin-kle, lit-tle star..." Notalar ketma-ketligi ekranda ko'rsatiladi. Siz xatosiz chalasiz.

**Olqishlar! Siz — Notalar Afsonasisiz!**

---

## 🌿 13-DUNYO: SMART GREENHOUSE — "Oziq-ovqat inqirozi"

### Voqea

Koloniya **oziq-ovqat yetishmasligi** bilan yuzlashmoqda. Issiqxonadagi o'simliklar nobud bo'lmoqda. Sababi — harorat va namlik noto'g'ri. Kimdir bu jarayonni kuzatib turishi kerak, ammo odamlar band. **Avtomatik tizim kerak.**

### Siz kimsiz?

Siz **Agri** — koloniya agronomi. LM35 va soil moisture sensor yordamida aqlli issiqxona tizimini yasaysiz.

### Sxemani yig'ish

LM35 → A0, Moisture → A1, LED → pin 13.

### Kulminatsiya

Sensorlar ishlaydi. Harorat 28°C dan oshdi — LED yonadi, ogohlantirish berasiz. Namlik pasaydi — sug'orish tizimini ishga tushirasiz. 60 soniya davomida o'simliklar **sog'lom o'sadi**.

**Oziq-ovqat ta'minoti tiklangan. Koloniya saqlab qolindi.**

---

## 🚗 14-DUNYO: PARKING ASSISTANT — "Birinchi haydovchilik"

### Voqea

Bugun **birinchi haydovchilik imtihoniningiz**. Ammo eng qiyin qism — **parallel parking**. Siz doim devorga urib qo'yasiz. Instruktor: "Bugun parking qila olmasang, imtihondan o'tmaysan." Sizga yordamchi tizim kerak.

### Siz kimsiz?

Siz o'zingiz — **yangi haydovchi**. HC-SR04 ultrasonic sensor, LED va buzzer yordamida **parking assistent** yasaysiz.

### Sxemani yig'ish

Ultrasonic → trig=9 echo=8, LED → 13, buzzer→6.

### Kulminatsiya

Mashinaga o'tirasiz. Qurilmani ishga tushirasiz. Orqaga burilasiz — sensor masofani o'lchaydi. **20 cm dan kam — signal chalinadi**. 10 cm — LED yonadi. 5 cm — tez-tez signal. **To'xtang!**

Mashina mukammal park qilindi. Instruktor tabassum qiladi. **Imtihon topshirildi.**

---

## ☄️ 15-DUNYO: METEOR SHOWER — "Kosmik qalqon"

### Voqea

Kosmik stansiyaga **meteoritlar oqimi** yaqinlashmoqda. Stansiyaning mudofaa tizimi ishdan chiqqan. Qalqonni qo'lda boshqarish kerak — potensiometr bilan yo'naltirish, tugma bilan otish. Agar meteoritlar stansiyaga yetib borsa — **uning tugashi**.

### Siz kimsiz?

Siz **Cosmo** — stansiya kapitani. Sizning qo'lingizda — stansiyani qutqara oladigan yagona boshqaruv paneli.

### Sxemani yig'ish

Potensiometr → A0, tugma → pin 2, buzzer → pin 6.

### Kulminatsiya

Meteoritlar yaqinlashmoqda. Potensiometrni burasiz — qalqon harakatlanadi. Tugmani bosasiz — zarba berasiz. 500 metr masofani bosib o'tishingiz kerak.

Meteoritlardan muvaffaqiyatli qochdingiz. **Stansiya xavfsiz.**

---

## 🔒 16-DUNYO: SECURITY SYSTEM — "Tungi qo'riqchi"

### Voqea

Muzeyda **katta o'g'rilik sodir bo'lishi mumkin**. Politsiya ma'lumotiga ko'ra, bugun tunda kimdir "Moviy Olmos"ni o'g'irlamoqchi. Muzeyda qo'riqchi yo'q. Xavfsizlik tizimi eskirgan. Sizni chaqirishdi.

### Siz kimsiz?

Siz **Guardian** — xavfsizlik bo'yicha mutaxassis. PIR motion sensor, buzzer va LED yordamida **harakat detektori** yasaysiz.

### Sxemani yig'ish

PIR → pin 2, buzzer → pin 6, LED → pin 13.

### Kulminatsiya

Tun. Muzey jim. Sizning qurilmangiz ishlayapti. Ekranda muzey plani — 6 xona. To'satdan... **Harakat bor!** PIR signal yubordi. Buzzer chalinadi. LED yonadi. Ekranda qaysi xonada harakat borligi ko'rsatiladi.

10 ta urinish. Hammasi muvaffaqiyatli aniqlandi. Olmos **xavfsiz**.

**Siz — eng yaxshi qo'riqchisiz.**

---

## 🎵 17-DUNYO: MUSIC VISUALIZER — "Ovoz ranglari"

### Voqea

Klubda DJ bor, lekin **vizual effektlar yo'q**. Tomoshabinlar zerikmoqda. Mush'kul — kimdir musiqani ko'rinadigan qiladigan qurilma yasashi kerak. **Ovozni rangga aylantiradigan** qurilma.

### Siz kimsiz?

Siz **Spectra** — vizual ijodkor. Potensiometr, 4 LED va buzzer yordamida **musiqa vizualizatori** yasaysiz.

### Sxemani yig'ish

Potensiometr → A0, 4xLED → pin 9-12, buzzer → pin 6.

### Kulminatsiya

Musiqa boshlanadi. Potensiometrni burasiz — **chastota o'zgaradi**. Ekranda 32 bar'li equalizer harakatlanadi, oscilloscope to'lqinlanadi, ranglar almashadi.

1800 Hz chastotaga yetasiz — **butun klub portlaydi**. Tomoshabinlar aqldan ozadi. Siz — eng zo'r vizual ijodkor.

---

## 📶 18-DUNYO: IoT DASHBOARD — "WiFi qutqaruvi" (ESP8266)

### Voqea

Zilzila sodir bo'ldi. Aloqa minoralari quladi. Internet yo'q. Telefon tarmog'i ishlamaydi. Favqulodda xizmatlar bir-biri bilan bog'lana olmayapti. Faqat bitta usul bor — **ESP8266 orqali Firebase'ga ulanish** va ma'lumotlarni bulut orqali uzatish.

### Siz kimsiz?

Siz **Link** — favqulodda vaziyatlar bo'yicha mutaxassis. ESP8266, sensorlar va Firebase yordamida **avariya monitoring tizimini** yasaysiz.

### Sxemani yig'ish

ESP8266, POT → A0, tugma → D1, ultrasonic → trig=D2 echo=D3, LM35 → A0.

### Kulminatsiya

ESP8266 WiFi-ga ulanadi. Firebase'ga ma'lumot yuborish boshlandi. Dashboard'da 4 ta sensor ko'rsatkichi jonlandi. Favqulodda xizmatlar vaziyatni kuzatmoqda.

**Aloqa tiklandi. Shahar qutqarildi.**

---

## 🌍 19-DUNYO: REMOTE SENSOR — "Global kuzatuv" (ESP32)

### Voqea

Olimlar **global isish** bo'yicha ma'lumot to'plamoqda, ammo sensorlar faqat bir joyda o'rnatilgan. Dunyo bo'ylab ma'lumot kerak. Sizni dunyoning eng chekka nuqtasiga — **Antarktida stansiyasiga** yuborishdi.

### Siz kimsiz?

Siz **Polar** — iqlimshunos olim. ESP32, harorat, yorug'lik va masofa sensorlari yordamida **global sensor stansiyasi** qurasiz.

### Sxemani yig'ish

ESP32, LM35 → A0, LDR → A1, LED → pin 13.

### Kulminatsiya

ESP32 ni yoqasiz. WiFi-ga ulanadi. Firebase'ga ma'lumot keta boshlaydi. Ekranda dunyo xaritasi ochiladi — sizning stansiyangiz Antarktida da ko'rinadi. Harorat, yorug'lik, masofa — barcha ma'lumotlar **real time** sinxronlanadi.

60 soniya davomida ma'lumotlar uzluksiz keladi. **Global monitoring tarmog'ining birinchi stansiyasi ishga tushdi.**

---

## 🏠 20-DUNYO: SMART HOME — "Kelajak uyi" (ESP32 + Firebase) ⭐

### Voqea

Bir paytlar oddiy uy edi. Endi — bu **aqlli uy**. Esp32, sensorlar, aktuatorlar va Firebase yordamida uyni internet orqali boshqarish mumkin. Ammo tizim endi o'rnatilgan va **sozlash kerak**. Chiroqlar, isitish, eshiklar, signalizatsiya — hammasini muvozanatga keltirish kerak. Agar energiya sarfi juda yuqori bo'lsa — tizim o'chadi. Juda past bo'lsa — uy aholisi qiynaladi.

### Siz kimsiz?

Siz **Home** — aqlli uy arxitektori. Bu sizning eng katta loyihangiz. Barcha bilimlaringizni birlashtirishingiz kerak.

### Sxemani yig'ish

ESP32, LED → pin 13, tugma → pin 2, POT → A0, LM35 → A1. Firebase ikki tomonlama aloqa — ma'lumot yuborish va qabul qilish.

### Kulminatsiya

Tizimni ishga tushirasiz. Uy plani ekranda — 5 xona. Chiroqlar, konditsioner, eshiklar — hammasi ishlayapti. Energiya sarfi 30% — yashil zonada. Harorat 24°C — ideal.

Firebase orqali uyni boshqarasiz. LED ni internet orqali yoqasiz. ESP32 buyruqni qabul qiladi va bajaradi. **Bu — kelajak**. Siz uni **bugun yaratdingiz**.

Energiya sarfi optimal. Harorat mukammal. **Aqlli uy to'liq ishga tushdi.**

**Siz — STEMVERSE chempionisiz! 🏆**

---

## 📖 XULOSA: Qahramon yo'li

```
BOSH:       Siz oddiy o'quvchi edingiz...
↓
1-5:        Asoslarni o'rgandingiz
↓
6-10:       Sensorlar bilan ishlashni o'rgandingiz
↓
11-17:      Murakkab tizimlarni yig'ishni o'rgandingiz
↓
18-20:      Internet + bulut texnologiyalarini o'rgandingiz
↓
YAKUN:      Siz — STEMVERSE muhandisisiz!
```

Har bir darsda:
1. **Muammo** yuz beradi — dunyo sizga muhtoj
2. Siz **sxema yig'asiz** — qurilmani qurollanasiz
3. Siz **kod yozasiz** — qurilmani jonlantirasiz
4. **Kulminatsiya** — sizning qurilmangiz muammoni hal qiladi
5. **Siz qahramonsiz** — dunyo saqlab qolindi

> **STEMVERSE**: Learning by being a hero. 🦸
