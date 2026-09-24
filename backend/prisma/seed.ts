import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with the academic curriculum...');

  // 1. Create or update categories with harmonized colors
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'matematika' },
      update: {},
      create: { name: 'Matematika', slug: 'matematika', icon: '', color: '#0071e3', order: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'ipa' },
      update: {},
      create: { name: 'Ilmu Pengetahuan Alam', slug: 'ipa', icon: '', color: '#34c759', order: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'ips' },
      update: {},
      create: { name: 'Ilmu Pengetahuan Sosial', slug: 'ips', icon: '', color: '#ff9500', order: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'ppkn' },
      update: {},
      create: { name: 'Pendidikan Pancasila', slug: 'ppkn', icon: '', color: '#e63946', order: 4 },
    }),
  ]);

  console.log('Categories created.');

  // 2. Create users (Admin & Guru/Tutor)
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pancasila.edu' },
    update: {},
    create: { email: 'admin@pancasila.edu', password: hashedPassword, name: 'Administrator Portal', role: 'ADMIN' },
  });

  const tutor = await prisma.user.upsert({
    where: { email: 'tutor@pancasila.edu' },
    update: {},
    create: { email: 'tutor@pancasila.edu', password: hashedPassword, name: 'Guru Pancasila', role: 'TUTOR' },
  });

  console.log('Users verified.');

  // 3. Define professional academic materials
  const materials = [
    // === PENDIDIKAN PANCASILA (PPKn) ===
    {
      title: 'Perumusan dan Penetapan Pancasila sebagai Dasar Negara',
      slug: 'perumusan-pancasila-dasar-negara',
      description: 'Studi historis komprehensif mengenai pembentukan BPUPKI, usulan dasar negara oleh tiga tokoh bangsa, dan pengesahan konstitusional oleh PPKI.',
      categoryId: categories[3].id,
      authorId: tutor.id,
      difficulty: 'EASY',
      isPublished: true,
      content: `# Perumusan dan Penetapan Pancasila sebagai Dasar Negara

## Pembentukan BPUPKI (Dokuritsu Junbi Cosakai)
Sejarah lahirnya Pancasila sebagai dasar negara tidak dapat dipisahkan dari situasi politik akhir Perang Dunia II. Menghadapi kekalahan beruntun dari Sekutu, Jepang berusaha menarik simpati rakyat Indonesia dengan menjanjikan kemerdekaan. Janji ini diwujudkan dengan pembentukan **Badan Penyelidik Usaha-Usaha Persiapan Kemerdekaan Indonesia (BPUPKI)** pada tanggal 1 Maret 1945, yang kemudian diresmikan pada 29 April 1945 dipimpin oleh **dr. K.R.T. Radjiman Wedyodiningrat**.

## Usulan Dasar Negara oleh Para Tokoh Bangsa
BPUPKI melaksanakan sidang pertamanya pada **29 Mei - 1 Juni 1945** dengan agenda utama merumuskan dasar filsafat negara (*philosofische grondslag*). Terdapat tiga tokoh nasional yang secara berurutan menyampaikan gagasan tentang asas dasar negara:

### 1. Mr. Mohammad Yamin (29 Mei 1945)
Dalam pidatonya, beliau mengusulkan lima asas dasar secara lisan dan tertulis:
* Peri Kebangsaan
* Peri Kemanusiaan
* Peri Ketuhanan
* Peri Kerakyatan
* Kesejahteraan Rakyat

### 2. Prof. Dr. Mr. Soepomo (31 Mei 1945)
Beliau memaparkan teori negara integralistik (persatuan), di mana negara menyatu dengan seluruh rakyatnya tanpa memihak pada golongan tertentu. Asas yang diusulkan meliputi:
* Persatuan
* Kekeluargaan
* Keseimbangan Lahir dan Batin
* Musyawarah
* Keadilan Rakyat

### 3. Ir. Soekarno (1 Juni 1945)
Beliau menyampaikan pidato legendaris mengenai konsep dasar negara yang secara formal diberi nama **Pancasila** (atas saran seorang ahli bahasa):
* Kebangsaan Indonesia (Nasionalisme)
* Internasionalisme atau Peri Kemanusiaan
* Mufakat atau Demokrasi
* Kesejahteraan Sosial
* Ketuhanan yang Berkebudayaan

## Peran Panitia Sembilan dan Piagam Jakarta
Untuk menjembatani perbedaan pendapat antara golongan kebangsaan dan golongan keagamaan, dibentuklah **Panitia Sembilan** pada masa reses BPUPKI. Panitia ini dipimpin oleh Ir. Soekarno dengan anggota Drs. Moh. Hatta, Mr. A.A. Maramis, Abikoesno Tjokrosoejoso, Abdulkahar Muzakir, H. Agus Salim, Mr. Achmad Soebardjo, K.H. Wahid Hasjim, dan Mr. Muhammad Yamin.

Pada tanggal **22 Juni 1945**, Panitia Sembilan berhasil merumuskan draf rancangan dasar negara yang dikenal sebagai **Piagam Jakarta (Jakarta Charter)**. Perbedaan fundamental terletak pada rumusan sila pertama yang berbunyi: *"Ketuhanan dengan kewajiban menjalankan syariat Islam bagi pemeluk-pemeluknya"*.

## Penetapan Pancasila oleh PPKI
Pasca pembubaran BPUPKI, dibentuklah **Panitia Persiapan Kemerdekaan Indonesia (PPKI)** pada 7 Agustus 1945 dipimpin oleh Ir. Soekarno. Sehari setelah Proklamasi Kemerdekaan, tepatnya pada **18 Agustus 1945**, PPKI melaksanakan sidang penting. 

Demi menjaga keutuhan persatuan nasional bangsa Indonesia yang majemuk (terutama atas aspirasi masyarakat Indonesia bagian timur), sila pertama dalam Piagam Jakarta disepakati untuk diubah menjadi: **"Ketuhanan Yang Maha Esa"**. Pancasila kemudian ditetapkan secara sah sebagai dasar negara Republik Indonesia dalam Pembukaan UUD 1945.`,
    },
    {
      title: 'Kedudukan dan Fungsi Pancasila bagi Bangsa dan Negara',
      slug: 'kedudukan-fungsi-pancasila',
      description: 'Analisis yuridis dan sosiologis mengenai fungsi Pancasila sebagai pandangan hidup, dasar negara, kepribadian bangsa, dan sumber dari segala sumber hukum.',
      categoryId: categories[3].id,
      authorId: tutor.id,
      difficulty: 'MEDIUM',
      isPublished: true,
      content: `# Kedudukan dan Fungsi Pancasila bagi Bangsa dan Negara

## Pengantar Kedudukan Pancasila
Pancasila memegang posisi sentral dalam seluruh tata kehidupan berbangsa dan bernegara di Indonesia. Memahami kedudukan Pancasila bukan sekadar menghafal kelima silanya, melainkan menginternalisasi fungsinya dalam sistem hukum, politik, dan sosiologis negara kita.

## Fungsi Utama Pancasila
Secara teoretis dan konstitusional, terdapat lima fungsi utama Pancasila yang saling bertautan:

### 1. Pancasila sebagai Dasar Negara (*Philosofische Grondslag*)
Fungsi ini menegaskan bahwa Pancasila digunakan sebagai landasan dan dasar untuk mengatur penyelenggaraan aparatur negara. Konsekuensinya, seluruh undang-undang, peraturan pemerintah, dan kebijakan negara wajib bersumber dan tidak boleh bertentangan dengan nilai-nilai Pancasila. Hal ini ditegaskan secara yuridis formal dalam **Ketetapan MPR No. XVII/MPR/1998** dan **UU No. 12 Tahun 2011**.

### 2. Pancasila sebagai Pandangan Hidup Bangsa (*Weltanschauung*)
Sebagai pandangan hidup (*way of life*), Pancasila berfungsi sebagai pedoman, petunjuk arah, dan kristalisasi nilai-nilai luhur yang digunakan masyarakat Indonesia dalam memecahkan berbagai persoalan hidup sehari-hari. Pancasila menuntun perilaku moral, etika, dan sosial bangsa agar tetap selaras dengan kepribadian luhur nenek moyang.

### 3. Pancasila sebagai Kepribadian Bangsa Indonesia
Pancasila memberikan corak khas, keunikan, dan identitas pembeda bagi bangsa Indonesia dibandingkan dengan bangsa-bangsa lain di dunia. Sikap mental, perilaku sosial, budi pekerti, dan budaya gotong royong yang melekat erat pada rakyat Indonesia merupakan wujud nyata dari kepribadian Pancasila yang terus diwariskan lintas generasi.

### 4. Pancasila sebagai Perjanjian Luhur Rakyat
Fungsi ini merujuk pada sejarah kesepakatan konsensus nasional yang dicapai oleh para pendiri bangsa (*founding fathers*) dalam sidang PPKI tanggal 18 Agustus 1945. Pancasila merupakan kesepakatan bersama seluruh elemen bangsa yang bersifat final dan mengikat untuk selamanya, sehingga wajib dijaga dan dipertahankan dari segala ancaman ideologi luar.

### 5. Pancasila sebagai Sumber dari Segala Sumber Hukum Negara
Pancasila berkedudukan sebagai *Grundnorm* (norma dasar) dalam tata urutan perundang-undangan di Indonesia. Ini berarti Pancasila adalah sumber moral, cita-cita hukum, dan asas yang menjiwai pembentukan setiap produk hukum positif di Indonesia. UUD NRI 1945, Ketetapan MPR, Undang-Undang/Perppu, Peraturan Pemerintah, hingga Peraturan Daerah wajib tunduk pada nilai dasar Pancasila.`,
    },
    {
      title: 'Norma, Keadilan, dan Hukum dalam Kehidupan Bermasyarakat',
      slug: 'norma-keadilan-hukum-indonesia',
      description: 'Pelajaran esensial mengenai pengertian norma, pembagian empat jenis norma sosial di Indonesia, serta urgensi hukum dalam mewujudkan keadilan.',
      categoryId: categories[3].id,
      authorId: tutor.id,
      difficulty: 'EASY',
      isPublished: true,
      content: `# Norma, Keadilan, dan Hukum dalam Kehidupan Bermasyarakat

## Pengertian dan Hakikat Norma
Manusia adalah makhluk sosial (*zoon politikon*) yang selalu hidup berdampingan dengan orang lain. Untuk mencegah terjadinya benturan kepentingan, konflik, maupun ketidaktertiban di dalam masyarakat, diperlukan suatu aturan atau pedoman hidup yang disepakati bersama. Aturan atau pedoman tindakan tersebut dinamakan **Norma**. Norma berfungsi sebagai alat pengatur ketertiban, tolok ukur perilaku, dan benteng pelindung ketenteraman sosial.

## Empat Macam Norma dalam Masyarakat
Dalam kehidupan sosiologis masyarakat Indonesia, terdapat empat pilar norma yang mengikat dan menuntun perilaku kita:

### 1. Norma Agama
* **Sumber**: Wahyu luhur atau petunjuk langsung dari Tuhan Yang Maha Esa yang tercantum dalam kitab suci masing-masing agama.
* **Sanksi**: Tidak langsung diterima di dunia (berupa dosa dan balasan di akhirat kelak).
* **Contoh**: Melaksanakan ibadah tepat waktu, menjauhi larangan agama, dan menghormati keyakinan pemeluk agama lain.

### 2. Norma Kesusilaan
* **Sumber**: Bisikan kalbu, hati nurani, dan sanubari terdalam manusia.
* **Sanksi**: Bersifat internal (perasaan bersalah, penyesalan mendalam, gelisah, dan malu pada diri sendiri).
* **Contoh**: Selalu bersikap jujur, tidak mencontek saat ujian, dan menolong sesama yang sedang kesulitan secara tulus.

### 3. Norma Kesopanan
* **Sumber**: Tata pergaulan, adat istiadat, kebiasaan, dan kesepakatan sosial dalam suatu komunitas masyarakat lokal.
* **Sanksi**: Dikucilkan, dicemooh, mendapat teguran sosial, atau ditegur oleh lingkungan sekitar.
* **Contoh**: Menggunakan tangan kanan saat memberi sesuatu, bertutur kata santun kepada orang yang lebih tua, dan tidak meludah di sembarang tempat.

### 4. Norma Hukum
* **Sumber**: Badan atau lembaga resmi negara yang berwenang (seperti DPR dan Pemerintah) yang dituangkan dalam bentuk undang-undang tertulis.
* **Sanksi**: Bersifat tegas, memaksa, nyata, dan mengikat secara hukum (berupa denda, kurungan penjara, hingga hukuman mati).
* **Contoh**: Mematuhi rambu lalu lintas, membayar pajak tepat waktu, dan tidak melakukan tindakan kriminal.

## Urgensi Hukum dalam Mewujudkan Keadilan
Norma hukum memiliki keistimewaan tersendiri karena didukung oleh alat-alat kelengkapan negara seperti polisi, jaksa, dan hakim. Hukum diciptakan untuk menciptakan keadilan sosial bagi seluruh masyarakat. Keadilan terwujud apabila setiap warga negara mendapatkan hak-haknya secara seimbang, mematuhi kewajiban moralnya, dan diperlakukan sama di hadapan hukum tanpa membedakan status sosial (*equality before the law*).`,
    },
    {
      title: 'Kedaulatan Negara Kesatuan Republik Indonesia dan Struktur Lembaga Negara',
      slug: 'kedaulatan-struktur-lembaga-negara',
      description: 'Penjelasan mendalam tentang hakikat kedaulatan rakyat, teori kedaulatan, serta hubungan wewenang legislatif, eksekutif, dan yudikatif berdasarkan UUD NRI 1945.',
      categoryId: categories[3].id,
      authorId: tutor.id,
      difficulty: 'HIGH',
      isPublished: true,
      content: `# Kedaulatan Negara Kesatuan Republik Indonesia dan Struktur Lembaga Negara

## Hakikat dan Teori Kedaulatan
Kata "kedaulatan" berasal dari bahasa Arab *daulah* yang berarti kekuasaan tertinggi, atau bahasa Latin *supremus* yang berarti tertinggi. Kedaulatan adalah kekuasaan tertinggi dalam suatu negara untuk menentukan hukum dan mengelola roda pemerintahan. Secara teoretis, Jean Bodin membagi sifat kedaulatan menjadi empat:
1. **Asli**: Kekuasaan tidak berasal dari kekuasaan lain yang lebih tinggi.
2. **Permanen**: Kekuasaan tetap ada selama negara itu berdiri, meskipun pemerintahannya berganti.
3. **Tunggal (Bulat)**: Kekuasaan tidak dapat dibagi-bagi kepada badan lain.
4. **Tidak Terbatas**: Kekuasaan tidak dibatasi oleh kekuatan atau otoritas lain di luar negara.

## Macam-Macam Teori Kedaulatan
Dalam sejarah pemikiran tata negara, dikenal lima jenis kedaulatan:
* **Kedaulatan Tuhan**: Kekuasaan tertinggi bersumber dari Tuhan (diterapkan pada masa kerajaan kuno).
* **Kedaulatan Raja**: Raja memegang kekuasaan mutlak di atas hukum positif.
* **Kedaulatan Negara**: Negara adalah pencipta hukum dan memegang kekuasaan tertinggi mutlak.
* **Kedaulatan Hukum**: Hukum memegang kekuasaan tertinggi, di mana penguasa dan rakyat tunduk pada aturan hukum.
* **Kedaulatan Rakyat**: Rakyat adalah pemegang kekuasaan tertinggi (landasan sistem demokrasi).

## Kedaulatan Rakyat di Indonesia
Undang-Undang Dasar Negara Republik Indonesia Tahun 1945 secara tegas menyatakan prinsip kedaulatan rakyat dalam **Pasal 1 Ayat (2)** yang berbunyi: *"Kedaulatan berada di tangan rakyat dan dilaksanakan menurut Undang-Undang Dasar"*. Ini menunjukkan bahwa Indonesia menganut sistem demokrasi konstitusional, di mana kedaulatan rakyat dijalankan melalui aturan main hukum yang tertulis dalam UUD NRI 1945.

## Lembaga-Lembaga Negara Pelaksana Kedaulatan
Struktur ketatanegaraan Indonesia pasca Amandemen UUD NRI 1945 menganut prinsip pembagian kekuasaan (*distribution of power*) dengan mekanisme saling mengawasi dan mengimbangi (*checks and balances*). Lembaga negara dikelompokkan ke dalam tiga pilar utama:

### 1. Lembaga Legislatif (Pembuat Undang-Undang)
* **MPR (Majelis Permusyawaratan Rakyat)**: Terdiri atas anggota DPR dan DPD. Berwenang mengubah dan menetapkan UUD, serta melantik Presiden dan Wakil Presiden.
* **DPR (Dewan Perwakilan Rakyat)**: Memegang kekuasaan legislasi (membuat UU), menetapkan anggaran belanja negara (fungsi anggaran), dan mengawasi jalannya pemerintahan (fungsi pengawasan).
* **DPD (Dewan Perwakilan Daerah)**: Menyampaikan usulan dan pertimbangan terkait otonomi daerah dan hubungan pusat-daerah kepada DPR.

### 2. Lembaga Eksekutif (Pelaksana Undang-Undang)
* **Presiden & Wakil Presiden**: Memegang kekuasaan pemerintahan negara berdasarkan UUD. Presiden bertindak sebagai kepala negara sekaligus kepala pemerintahan dengan dibantu oleh menteri-menteri negara.

### 3. Lembaga Yudikatif (Kekuasaan Kehakiman / Peradilan)
* **MA (Mahkamah Agung)**: Lembaga peradilan tertinggi yang mengadili perkara pada tingkat kasasi dan menguji peraturan di bawah undang-undang.
* **MK (Mahkamah Konstitusi)**: Berwenang menguji undang-undang terhadap UUD NRI 1945, memutus sengketa kewenangan lembaga negara, memutus pembubaran partai politik, dan memutus hasil sengketa pemilu.
* **KY (Komisi Yudisial)**: Lembaga mandiri yang berwenang mengusulkan pengangkatan hakim agung dan menjaga kehormatan, keluhuran martabat, serta perilaku hakim.`,
    },
    {
      title: 'Gotong Royong dan Kolaborasi Sosial dalam Kehidupan Masyarakat Indonesia',
      slug: 'gotong-royong-kolaborasi-sosial',
      description: 'Memahami nilai kultural gotong royong sebagai intisari Pancasila, landasan kerja sama sosial, dan implementasinya di era kemerdekaan modern.',
      categoryId: categories[3].id,
      authorId: tutor.id,
      difficulty: 'EASY',
      isPublished: true,
      content: `# Gotong Royong dan Kolaborasi Sosial dalam Kehidupan Masyarakat Indonesia

## Tradisi Gotong Royong Nusantara
**Gotong Royong** adalah istilah asli Indonesia yang berasal dari kata *gotong* (mengangkat) dan *royong* (bersama-sama). Gotong royong merupakan sistem kerja sama, bahu-membahu, dan tolong-menolong tanpa pamrih yang telah mengakar kuat dalam denyut nadi kehidupan bermasyarakat di seluruh pelosok Nusantara selama berabad-abad. 

Bung Karno bahkan pernah menegaskan dalam sidang BPUPKI bahwa jika Pancasila yang diperas menjadi tiga sila (Trisila) diperas lagi menjadi satu sila (Ekasila), maka intisari utama dari seluruh jiwa kebangsaan Indonesia adalah **Gotong Royong**.

## Nilai-Nilai Luhur Gotong Royong
Praktik gotong royong bukan sekadar kerja fisik bersama, melainkan mengandung pilar nilai-nilai moral yang sangat dalam:
1. **Kebersamaan & Solidaritas**: Menumbuhkan rasa kepedulian antarsesama tetangga tanpa memandang perbedaan suku, agama, maupun tingkat ekonomi.
2. **Kekeluargaan**: Memperlakukan anggota masyarakat sekitar layaknya keluarga kandung sendiri yang wajib dibantu saat ditimpa kemalangan.
3. **Persatuan**: Menjembatani jurang pemisah sosial dan mengikis potensi gesekan antarkelompok demi terwujudnya kerukunan yang damai.
4. **Keadilan Sosial**: Menjamin bahwa beban berat pembangunan lingkungan dapat dipikul bersama secara merata agar terasa lebih ringan.

## Implementasi Gotong Royong Tradisional
Setiap suku dan daerah di Indonesia memiliki istilah lokal unik yang merujuk pada konsep gotong royong, di antaranya:
* **Gugur Gunung** (Jawa): Gotong royong melakukan pekerjaan besar demi kepentingan umum desa (seperti memperbaiki jembatan atau saluran irigasi).
* **Sambatan** (Yogyakarta/Jawa Tengah): Tradisi meminta bantuan tetangga sekitar untuk membantu mendirikan rumah atau memanen sawah tanpa upah uang, melainkan disuguhi makanan bersama.
* **Mapalus** (Minahasa): Sistem tolong-menolong dalam kegiatan pertanian dan perkebunan bergiliran.
* **Sikaroban** (Sumatera Utara): Kegiatan membuka lahan pertanian baru atau memanen secara berkelompok.

## Kolaborasi Sosial di Era Modern
Di era globalisasi dan digital saat ini, nilai gotong royong ditransformasikan ke dalam konsep **Kolaborasi Sosial**. Sebagai pelajar Pancasila, kolaborasi sosial dapat diwujudkan melalui:
* Bekerja sama dalam proyek kelompok belajar tanpa membeda-bedakan latar belakang teman.
* Menggalang aksi sosial kemanusiaan secara online untuk membantu korban bencana alam di berbagai wilayah Indonesia.
* Berkolaborasi menjaga kebersihan lingkungan sekolah dan mengampanyekan pemilahan sampah organik dan anorganik demi kelestarian alam.`,
    },

    // === IPS (SEJARAH/SOSIAL) ===
    {
      title: 'Sejarah Detik-Detik Proklamasi Kemerdekaan Indonesia',
      slug: 'sejarah-proklamasi-kemerdekaan',
      description: 'Menelusuri sejarah perjuangan bangsa dari kekalahan Jepang, Peristiwa Rengasdengklok, perumusan teks di rumah Maeda, hingga detik pembacaan Proklamasi.',
      categoryId: categories[2].id,
      authorId: tutor.id,
      difficulty: 'MEDIUM',
      isPublished: true,
      content: `# Sejarah Detik-Detik Proklamasi Kemerdekaan Indonesia

## Latar Belakang Jatuhnya Jepang
Kemerdekaan Indonesia diraih melalui perjuangan gigih yang memanfaatkan momentum runtuhnya kekuasaan militer Jepang di Asia. Setelah kota **Hiroshima** (6 Agustus 1945) dan **Nagasaki** (9 Agustus 1945) dijatuhi bom atom oleh Sekutu, kedaulatan militer Kekaisaran Jepang lumpuh total. Pada tanggal **14 Agustus 1945**, Jepang secara resmi menyerah tanpa syarat kepada Sekutu. Terjadilah kekosongan kekuasaan (*vacuum of power*) di Indonesia, di mana Jepang sudah kehilangan legitimasi kekuasaan, namun tentara Sekutu belum tiba di Nusantara.

## Peristiwa Rengasdengklok
Mendengar kabar menyerahnya Jepang dari siaran radio luar negeri, golongan muda (seperti Sukarni, Chaerul Saleh, dan Wikana) mendesak Ir. Soekarno dan Drs. Moh. Hatta untuk segera memproklamasikan kemerdekaan Indonesia tanpa campur tangan Jepang. Namun, golongan tua bersikap hati-hati demi menghindari pertumpahan darah dengan sisa-sisa tentara Jepang yang masih bersenjata lengkap.

Ketegangan ini memicu terjadinya **Peristiwa Rengasdengklok** pada tanggal **16 Agustus 1945**. Golongan muda membawa Soekarno dan Hatta ke daerah Rengasdengklok (Karawang) dengan tujuan mengamankan mereka dari tekanan politik Jepang dan memastikan proklamasi dilaksanakan secepatnya tanpa keterlibatan Panitia Persiapan Kemerdekaan Indonesia (PPKI) yang dianggap buatan Jepang. Setelah tercapai kesepakatan jaminan proklamasi dari Ahmad Soebardjo, Soekarno dan Hatta akhirnya dijemput kembali ke Jakarta malam itu juga.

## Penyusunan Teks Proklamasi di Rumah Laksamana Maeda
Pada malam hingga dini hari tanggal 16-17 Agustus 1945, Soekarno dan Hatta berkumpul di kediaman **Laksamana Tadashi Maeda** di Jalan Imam Bonjol No. 1, Jakarta (tempat yang dinilai aman karena status diplomatik Maeda). Naskah proklamasi dirumuskan bersama oleh:
* **Ir. Soekarno** bertindak sebagai penulis draf naskah.
* **Drs. Moh. Hatta** menyumbangkan ide kalimat kedua terkait pemindahan kekuasaan.
* **Mr. Ahmad Soebardjo** menyumbangkan ide kalimat pertama terkait pernyataan kemerdekaan.

Draf tulisan tangan Bung Karno tersebut kemudian disetujui oleh seluruh tokoh nasional yang hadir, ditandatangani oleh Soekarno dan Hatta atas nama bangsa Indonesia (atas usul Sukarni), lalu diketik dengan rapi oleh **Sayuti Melik** dengan beberapa perubahan redaksional kecil.

## Detik-Detik Pembacaan Proklamasi
Hari Jumat, **17 Agustus 1945** pukul **10.00 WIB**, bertempat di halaman rumah Ir. Soekarno di **Jalan Pegangsaan Timur No. 56, Jakarta**, upacara sakral dimulai. Ir. Soekarno didampingi oleh Drs. Moh. Hatta membacakan naskah Proklamasi Kemerdekaan Indonesia dengan suara lantang dan penuh khidmat. 

Acara dilanjutkan dengan pengibaran bendera pusaka **Merah Putih** yang telah dijahit langsung oleh Ibu **Fatmawati**, dikibarkan oleh pemuda **Latief Hendraningrat** dan **Suhud Sastro Kusumo**, diiringi lagu kebangsaan *Indonesia Raya* yang dinyanyikan spontan oleh seluruh rakyat yang hadir. Peristiwa bersejarah ini menandai lahirnya kedaulatan baru: Negara Kesatuan Republik Indonesia.`,
    },
  ];

  // Clean up and update materials to avoid stale duplicates
  console.log('Updating database materials...');
  await prisma.material.deleteMany({
    where: { slug: { in: materials.map(m => m.slug) } }
  });

  for (const mat of materials) {
    await prisma.material.create({ data: mat });
  }

  console.log('Academic materials populated.');

  // 4. Define highly challenging, curriculum-aligned Quizzes and Questions
  const quizzes = [
    {
      title: 'Kuis Perumusan dan Penetapan Pancasila',
      slug: 'kuis-perumusan-dasar-negara',
      description: 'Uji wawasan historismu tentang BPUPKI, usulan rumusan tokoh bangsa, pembentukan Panitia Sembilan, hingga sidang PPKI 18 Agustus 1945.',
      categoryId: categories[3].id,
      authorId: tutor.id,
      difficulty: 'EASY',
      isPublished: true,
      questions: [
        {
          content: 'Siapakah tokoh nasional yang mengusulkan konsep dasar negara dengan nama resmi "Pancasila" pada tanggal 1 Juni 1945?',
          hint: 'Tokoh ini merupakan Proklamator Indonesia dan Presiden pertama RI.',
          explanation: 'Ir. Soekarno menyampaikan usulan dasar negara pada tanggal 1 Juni 1945 dalam sidang pertama BPUPKI dan memberikan nama Pancasila atas saran dari rekannya yang ahli bahasa.',
          points: 1,
          options: [
            { content: 'Ir. Soekarno', isCorrect: true, order: 0 },
            { content: 'Mr. Mohammad Yamin', isCorrect: false, order: 1 },
            { content: 'Prof. Dr. Mr. Soepomo', isCorrect: false, order: 2 },
            { content: 'Drs. Mohammad Hatta', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Kapan draf rancangan dasar negara yang dikenal sebagai "Piagam Jakarta" (Jakarta Charter) berhasil dirumuskan oleh Panitia Sembilan?',
          hint: 'Peristiwa ini terjadi di bulan Juni, sebelum proklamasi kemerdekaan.',
          explanation: 'Piagam Jakarta dirumuskan oleh Panitia Sembilan pada tanggal 22 Juni 1945 di Jakarta.',
          points: 1,
          options: [
            { content: '22 Juni 1945', isCorrect: true, order: 0 },
            { content: '1 Juni 1945', isCorrect: false, order: 1 },
            { content: '29 Mei 1945', isCorrect: false, order: 2 },
            { content: '18 Agustus 1945', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Mengapa rumusan sila pertama Piagam Jakarta disepakati untuk diubah dalam sidang PPKI tanggal 18 Agustus 1945?',
          hint: 'Pertimbangan ini diambil demi menjaga persatuan bangsa Indonesia yang majemuk.',
          explanation: 'Sila pertama diubah menjadi "Ketuhanan Yang Maha Esa" demi menjaga persatuan bangsa Indonesia, merespon aspirasi tokoh Indonesia bagian timur yang non-Muslim agar negara tidak bercorak sektarian.',
          points: 1,
          options: [
            { content: 'Menjaga persatuan dan keutuhan bangsa yang majemuk', isCorrect: true, order: 0 },
            { content: 'Karena ditolak secara mutlak oleh golongan muda', isCorrect: false, order: 1 },
            { content: 'Atas desakan penuh dari pihak militer Jepang', isCorrect: false, order: 2 },
            { content: 'Karena rumusan tersebut dinilai terlalu panjang', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Siapakah tokoh yang dipercaya memimpin BPUPKI saat didirikan pada Maret 1945?',
          hint: 'Beliau adalah seorang tokoh kedokteran senior yang dihormati.',
          explanation: 'BPUPKI dipimpin oleh dr. K.R.T. Radjiman Wedyodiningrat sebagai ketua utama badan tersebut.',
          points: 1,
          options: [
            { content: 'dr. K.R.T. Radjiman Wedyodiningrat', isCorrect: true, order: 0 },
            { content: 'Ir. Soekarno', isCorrect: false, order: 1 },
            { content: 'Mr. Mohammad Yamin', isCorrect: false, order: 2 },
            { content: 'R.P. Soeroso', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Manakah di bawah ini yang merupakan salah satu usulan asas tertulis Mr. Mohammad Yamin pada tanggal 29 Mei 1945?',
          hint: 'Pikirkan tentang nilai kesejahteraan lahir dan batin masyarakat luas.',
          explanation: 'Mr. Mohammad Yamin mengusulkan lima asas dasar negara secara lisan dan tertulis, salah satunya adalah Kesejahteraan Rakyat.',
          points: 1,
          options: [
            { content: 'Kesejahteraan Rakyat', isCorrect: true, order: 0 },
            { content: 'Nasionalisme', isCorrect: false, order: 1 },
            { content: 'Internasionalisme', isCorrect: false, order: 2 },
            { content: 'Kekeluargaan', isCorrect: false, order: 3 }
          ]
        }
      ]
    },
    {
      title: 'Kuis Kedudukan dan Fungsi Pancasila',
      slug: 'kuis-kedudukan-fungsi-pancasila',
      description: 'Uji pemahaman teoritis tentang kedudukan yuridis formal Pancasila sebagai pandangan hidup dan sumber hukum tertinggi negara.',
      categoryId: categories[3].id,
      authorId: tutor.id,
      difficulty: 'MEDIUM',
      isPublished: true,
      questions: [
        {
          content: 'Apa arti kedudukan Pancasila sebagai "Sumber dari Segala Sumber Hukum" di Indonesia?',
          hint: 'Pikirkan tentang kedudukan seluruh undang-undang dan peraturan pemerintah.',
          explanation: 'Kedudukan Pancasila sebagai sumber dari segala sumber hukum berarti seluruh produk hukum dan perundang-undangan wajib bersumber dari Pancasila dan tidak boleh bertentangan dengannya.',
          points: 1,
          options: [
            { content: 'Seluruh peraturan perundang-undangan tidak boleh bertentangan dengan Pancasila', isCorrect: true, order: 0 },
            { content: 'Pancasila merupakan satu-satunya undang-undang dasar negara', isCorrect: false, order: 1 },
            { content: 'Seluruh sanksi hukum pidana diatur langsung oleh sila Pancasila', isCorrect: false, order: 2 },
            { content: 'Pancasila dapat diubah kapan saja melalui musyawarah adat', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Fungsi Pancasila yang memberikan ciri khas, corak unik, dan identitas pembeda bagi bangsa Indonesia dibanding bangsa lain disebut...',
          hint: 'Ini berkaitan erat dengan kepribadian luhur budi pekerti kita.',
          explanation: 'Fungsi ini disebut Pancasila sebagai Kepribadian Bangsa, yang melahirkan corak pembeda unik dalam perilaku sosial dan mental kita.',
          points: 1,
          options: [
            { content: 'Pancasila sebagai Kepribadian Bangsa', isCorrect: true, order: 0 },
            { content: 'Pancasila sebagai Perjanjian Luhur', isCorrect: false, order: 1 },
            { content: 'Pancasila sebagai Dasar Negara', isCorrect: false, order: 2 },
            { content: 'Pancasila sebagai Sumber Hukum', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Ketetapan MPR nomor berapa yang menegaskan kembali kedudukan Pancasila sebagai dasar negara Republik Indonesia?',
          hint: 'Ditetapkan pada masa awal reformasi politik nasional.',
          explanation: 'Ketetapan MPR No. XVII/MPR/1998 menegaskan kembali kedudukan Pancasila sebagai Dasar Negara.',
          points: 1,
          options: [
            { content: 'Ketetapan MPR No. XVII/MPR/1998', isCorrect: true, order: 0 },
            { content: 'Ketetapan MPRS No. XX/MPRS/1966', isCorrect: false, order: 1 },
            { content: 'Ketetapan MPR No. II/MPR/1978', isCorrect: false, order: 2 },
            { content: 'Ketetapan MPR No. I/MPR/2003', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Ketika Pancasila dijadikan petunjuk arah dan pedoman moral untuk menyelesaikan masalah sehari-hari, Pancasila menjalankan fungsinya sebagai...',
          hint: 'Ini adalah pedoman atau cara hidup bertindak.',
          explanation: 'Sebagai Pandangan Hidup Bangsa (Weltanschauung), Pancasila menjadi pedoman moral dan petunjuk arah tindakan sehari-hari masyarakat.',
          points: 1,
          options: [
            { content: 'Pandangan Hidup Bangsa', isCorrect: true, order: 0 },
            { content: 'Cita-Cita Luhur Bangsa', isCorrect: false, order: 1 },
            { content: 'Moral Pembangunan', isCorrect: false, order: 2 },
            { content: 'Perjanjian Agung Rakyat', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Siapa kelompok yang menyepakati secara konsensus Pancasila sebagai dasar negara pada tanggal 18 Agustus 1945?',
          hint: 'Badan kepanitiaan ini dibentuk untuk mempersiapkan kemerdekaan Indonesia.',
          explanation: 'PPKI (Panitia Persiapan Kemerdekaan Indonesia) merupakan badan perwakilan nasional yang mensahkan Pancasila sebagai perjanjian luhur rakyat.',
          points: 1,
          options: [
            { content: 'PPKI', isCorrect: true, order: 0 },
            { content: 'BPUPKI', isCorrect: false, order: 1 },
            { content: 'KNIP', isCorrect: false, order: 2 },
            { content: 'Panitia Delapan', isCorrect: false, order: 3 }
          ]
        }
      ]
    },
    {
      title: 'Kuis Norma Sosial dan Keadilan Hukum',
      slug: 'kuis-norma-sosial-keadilan',
      description: 'Asah pemahamanmu mengenai empat jenis norma sosial, sanksinya masing-masing, serta hubungannya dengan keadilan hukum.',
      categoryId: categories[3].id,
      authorId: tutor.id,
      difficulty: 'EASY',
      isPublished: true,
      questions: [
        {
          content: 'Manakah di bawah ini yang merupakan norma dengan sanksi tegas, mengikat, memaksa, dan dilakukan oleh aparat resmi negara?',
          hint: 'Pikirkan tentang undang-undang tertulis.',
          explanation: 'Norma Hukum dibuat oleh badan resmi negara dan memiliki sanksi tegas serta memaksa yang ditegakkan oleh aparat penegak hukum.',
          points: 1,
          options: [
            { content: 'Norma Hukum', isCorrect: true, order: 0 },
            { content: 'Norma Agama', isCorrect: false, order: 1 },
            { content: 'Norma Kesopanan', isCorrect: false, order: 2 },
            { content: 'Norma Kesusilaan', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Apabila seseorang mencontek saat ujian sekolah dan merasa sangat gelisah, menyesal, serta malu pada diri sendiri, ia telah melanggar norma...',
          hint: 'Ini adalah norma yang bersumber dari bisikan hati nurani terdalam.',
          explanation: 'Perasaan bersalah dan menyesal di hati sanubari merupakan tanda pelanggaran Norma Kesusilaan.',
          points: 1,
          options: [
            { content: 'Norma Kesusilaan', isCorrect: true, order: 0 },
            { content: 'Norma Kesopanan', isCorrect: false, order: 1 },
            { content: 'Norma Hukum', isCorrect: false, order: 2 },
            { content: 'Norma Kebiasaan', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Menerima benda dari orang lain dengan tangan kanan dan berbicara santun kepada orang yang lebih tua merupakan implementasi dari...',
          hint: 'Ini bersumber dari tata krama sosial dan pergaulan sehari-hari.',
          explanation: 'Perilaku sopan santun dan tata krama pergaulan masyarakat setempat bersumber dari Norma Kesopanan.',
          points: 1,
          options: [
            { content: 'Norma Kesopanan', isCorrect: true, order: 0 },
            { content: 'Norma Kesusilaan', isCorrect: false, order: 1 },
            { content: 'Norma Agama', isCorrect: false, order: 2 },
            { content: 'Norma Adat', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Apa sanksi yang diterima oleh seseorang yang melanggar norma agama?',
          hint: 'Sanksi ini bersifat spiritual dan tidak langsung diterima secara kasat mata di dunia.',
          explanation: 'Sanksi norma agama bersifat spiritual, tidak langsung di dunia, berupa dosa dan balasan di akhirat sesuai keyakinan.',
          points: 1,
          options: [
            { content: 'Mendapat dosa dan balasan di akhirat kelak', isCorrect: true, order: 0 },
            { content: 'Hukuman kurungan penjara seketika', isCorrect: false, order: 1 },
            { content: 'Dikucilkan oleh seluruh tetangga desa', isCorrect: false, order: 2 },
            { content: 'Denda uang tunai kepada pemuka adat', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Prinsip hukum yang menyatakan bahwa setiap warga negara memiliki derajat yang setara di hadapan hukum tanpa pandang bulu disebut...',
          hint: 'Pikirkan kesamaan hak dalam bahasa Inggris: "equality before the..."',
          explanation: 'Equality before the law (kesetaraan di hadapan hukum) menjamin keadilan sosial tanpa memandang status ekonomi atau jabatan.',
          points: 1,
          options: [
            { content: 'Equality before the law', isCorrect: true, order: 0 },
            { content: 'Asas praduga tak bersalah', isCorrect: false, order: 1 },
            { content: 'Restorative justice', isCorrect: false, order: 2 },
            { content: 'Supremasi hukum absolut', isCorrect: false, order: 3 }
          ]
        }
      ]
    },
    {
      title: 'Kuis Kedaulatan Negara dan Lembaga Negara',
      slug: 'kuis-kedaulatan-lembaga-negara',
      description: 'Uji pemahaman ketatanegaraanmu mengenai sifat kedaulatan, Pasal UUD NRI 1945, serta wewenang yudikatif dan legislatif.',
      categoryId: categories[3].id,
      authorId: tutor.id,
      difficulty: 'HIGH',
      isPublished: true,
      questions: [
        {
          content: 'Manakah di bawah ini yang merupakan pasal konstitusi penegas bahwa Indonesia menganut kedaulatan rakyat berlandaskan konstitusi?',
          hint: 'Tertuang dalam Bab 1 Pasal 1 tentang bentuk dan kedaulatan.',
          explanation: 'Pasal 1 Ayat (2) UUD NRI 1945 berbunyi: "Kedaulatan berada di tangan rakyat dan dilaksanakan menurut Undang-Undang Dasar".',
          points: 1,
          options: [
            { content: 'Pasal 1 Ayat (2) UUD NRI 1945', isCorrect: true, order: 0 },
            { content: 'Pasal 1 Ayat (1) UUD NRI 1945', isCorrect: false, order: 1 },
            { content: 'Pasal 2 Ayat (1) UUD NRI 1945', isCorrect: false, order: 2 },
            { content: 'Pasal 3 Ayat (3) UUD NRI 1945', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Sifat kedaulatan yang menyatakan bahwa kekuasaan tidak berasal dari kekuasaan lain yang lebih tinggi disebut...',
          hint: 'Ini bermakna murni dan orisinal.',
          explanation: 'Sifat kedaulatan Asli berarti kekuasaan tersebut murni dari negara itu sendiri dan tidak diturunkan dari otoritas lain yang lebih tinggi.',
          points: 1,
          options: [
            { content: 'Asli', isCorrect: true, order: 0 },
            { content: 'Permanen', isCorrect: false, order: 1 },
            { content: 'Tunggal', isCorrect: false, order: 2 },
            { content: 'Tidak Terbatas', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Lembaga yudikatif manakah yang berwenang menguji undang-undang (UU) terhadap Undang-Undang Dasar (UUD NRI 1945)?',
          hint: 'Lembaga ini mengawal tegaknya konstitusi di Indonesia.',
          explanation: 'Mahkamah Konstitusi (MK) memegang wewenang utama untuk menguji keabsahan Undang-Undang terhadap UUD NRI 1945.',
          points: 1,
          options: [
            { content: 'Mahkamah Konstitusi', isCorrect: true, order: 0 },
            { content: 'Mahkamah Agung', isCorrect: false, order: 1 },
            { content: 'Komisi Yudisial', isCorrect: false, order: 2 },
            { content: 'Majelis Permusyawaratan Rakyat', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Apakah salah satu wewenang utama Dewan Perwakilan Rakyat (DPR) di Indonesia?',
          hint: 'Pikirkan tentang fungsi legislasi pembentukan peraturan.',
          explanation: 'Salah satu wewenang konstitusional utama DPR adalah membentuk undang-undang bersama Presiden (fungsi legislasi).',
          points: 1,
          options: [
            { content: 'Membentuk undang-undang bersama Presiden', isCorrect: true, order: 0 },
            { content: 'Melantik Presiden dan Wakil Presiden', isCorrect: false, order: 1 },
            { content: 'Mengadili perkara kasasi hukum tertinggi', isCorrect: false, order: 2 },
            { content: 'Mengawasi jalannya kode etik hakim agung', isCorrect: false, order: 3 }
          ]
        },
        {
          content: 'Mekanisme saling mengawasi dan mengimbangi antar lembaga negara agar tidak terjadi pemusatan kekuasaan mutlak disebut...',
          hint: 'Istilah ketatanegaraan dalam bahasa Inggris: "checks and..."',
          explanation: 'Mekanisme checks and balances diterapkan pasca Amandemen UUD NRI 1945 untuk memastikan pembagian kekuasaan berjalan seimbang dan demokratis.',
          points: 1,
          options: [
            { content: 'Checks and balances', isCorrect: true, order: 0 },
            { content: 'Separation of power', isCorrect: false, order: 1 },
            { content: 'Rule of law', isCorrect: false, order: 2 },
            { content: 'Executive privilege', isCorrect: false, order: 3 }
          ]
        }
      ]
    }
  ];

  // Clean up and update quizzes to avoid duplicates and allow fresh seeding of new questions
  console.log('Cleaning old quizzes for updated questions...');
  await prisma.quiz.deleteMany({
    where: { slug: { in: quizzes.map(q => q.slug) } }
  });

  for (const quiz of quizzes) {
    await prisma.quiz.create({
      data: {
        title: quiz.title,
        slug: quiz.slug,
        description: quiz.description,
        categoryId: quiz.categoryId,
        authorId: quiz.authorId,
        difficulty: quiz.difficulty,
        isPublished: quiz.isPublished,
        questions: {
          create: quiz.questions.map((q, idx) => ({
            content: q.content,
            hint: q.hint,
            explanation: q.explanation,
            order: idx,
            points: q.points,
            options: {
              create: q.options.map(opt => ({
                content: opt.content,
                isCorrect: opt.isCorrect,
                order: opt.order
              }))
            }
          }))
        }
      }
    });
  }

  console.log('Academic quizzes and questions populated.');

  // 5. Create organic Gamification achievements
  const achievements = [
    { name: 'Pemula', description: 'Selesaikan 1 kuis', icon: '', points: 10, criteria: JSON.stringify({ type: 'QUIZZES_COMPLETED', count: 1 }) },
    { name: 'Pelajar', description: 'Selesaikan 5 kuis', icon: '', points: 50, criteria: JSON.stringify({ type: 'QUIZZES_COMPLETED', count: 5 }) },
    { name: 'Ahli', description: 'Selesaikan 10 kuis', icon: '', points: 100, criteria: JSON.stringify({ type: 'QUIZZES_COMPLETED', count: 10 }) },
    { name: 'Konsisten', description: 'Login 3 hari berturut-turut', icon: '', points: 30, criteria: JSON.stringify({ type: 'STREAK_DAYS', count: 3 }) },
    { name: 'Pembaca', description: 'Selesaikan 1 materi', icon: '', points: 10, criteria: JSON.stringify({ type: 'MATERIALS_COMPLETED', count: 1 }) },
  ];

  console.log('Updating achievements...');
  await prisma.achievement.deleteMany({
    where: { name: { in: achievements.map(a => a.name) } }
  });

  for (const achievement of achievements) {
    await prisma.achievement.create({ data: achievement });
  }

  console.log('Achievements populated.');

  // 6. Broadcast Welcome Announcement
  await prisma.announcement.upsert({
    where: { id: 'welcome-announcement' },
    update: {},
    create: {
      id: 'welcome-announcement',
      title: 'Selamat Datang di Portal Edukasi Pancasila',
      content: 'Portal ini adalah sarana belajar asyik dan interaktif untuk seluruh siswa Sekolah Menengah Pertama berprestasi di seluruh pelosok Nusantara. Selamat bereksplorasi!',
      priority: 1,
      isActive: true,
    },
  });

  console.log('\nDatabase seeding completed.\n');
  console.log('Sample accounts available:');
  console.log('   Admin: admin@pancasila.edu / admin123');
  console.log('   Tutor: tutor@pancasila.edu / admin123');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
