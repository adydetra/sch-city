export interface Build {
  name: string;
  type: 'dorm' | 'safe' | 'study' | 'sport' | 'library' | 'meeting' | 'public' | 'play' | 'food'; // prettier-ignore
  id?: number;
  position?: THREE.Vector3;
  element?: any;
  coordinate: {
    row: number;
    col: number;
  };
  info: {
    timeLimit?: string;
    photo?: string;
    tags?: string[];
    brief?: string;
    count?: number;
  };
}

const build_data: Build[] = [
  {
    name: 'Sandbox-Academia',
    type: 'dorm',
    coordinate: {
      row: 260,
      col: 561,
    },
    info: {
      // timeLimit: '06:40-22:30 (23:30 pada hari Sabtu dan Minggu)',
      photo: 'Sandbox-Academia',
      count: 3,
      tags: ['Game', 'Mentor', 'Game Developer', 'Unity'],
      brief:
        'Sandbox Academia adalah perusahaan di bidang game yang juga menawarkan layanan pendidikan melalui metode mentoring pribadi. Kami berfokus pada inovasi dalam pengembangan permainan yang kreatif dan mendidik, sambil menyediakan bimbingan yang dipersonalisasi untuk membantu individu mencapai potensi penuh mereka dalam industri game.',
    },
  },
  {
    name: 'SMP-Dian-Didaktika',
    type: 'dorm',
    coordinate: {
      row: 260,
      col: 561,
    },
    info: {
      // timeLimit: '06:40-22:30 (23:30 pada hari Sabtu dan Minggu)',
      photo: 'SMP-Dian-Didaktika',
      count: 2,
      tags: ['Sekolah', 'SMP'],
      brief:
        'SMP Islam Dian Didaktika dibuka pada tahun 1992. Lulusan pertama SMP Islam Dian Didaktika tahun 1995 memberikan prestasi yang membanggakan, dengan nilai terbaik di Rayonnya, dan Alhamdullilah prestasi itu dapat dipertahankan terus hingga kini.',
    },
  },
  {
    name: 'Artificial-Intelligence-Center-Indonesia',
    type: 'dorm',
    coordinate: {
      row: 228,
      col: 500,
    },
    info: {
      // timeLimit: '06:40-22:30 (23:30 pada hari Sabtu dan Minggu)',
      photo: 'Artificial-Intelligence-Center-Indonesia',
      count: 3,
      tags: ['AI', 'Universitas Indonesia'],
      brief:
        'Sebuah lembaga yang didirikan atas Kerjasama FMIPA Universitas Indonesia dengan UMG Idea Lab Indonesia yang bertujuan untuk mengembangkan sumber daya manusia dalam bidang artificial Intelligence untuk membangun kapabilitas bangsa menyambut revolusi industri 4.0 \n\n Menjadi pusat pembelajaran, penelitian, dan konsultansi bidang artificial intelligence pertama dan terkemuka di Indonesia untuk membangun sumber daya manusia yang berkualitas dan unggul dalam bidang artificial intelligence.',
    },
  },
  {
    name: 'SMP-IT-Al-Haraki',
    type: 'dorm',
    coordinate: {
      row: 150,
      col: 501,
    },
    info: {
      // timeLimit: '06:40-22:30 (23:30 pada hari Sabtu dan Minggu)',
      photo: 'SMP-IT-Al-Haraki',
      count: 2,
      tags: ['Sekolah', 'SMP'],
      brief:
        'Pada tahun pelajaran 2012/2013, SMPIT AL HARAKI mulai menyelenggarakan kegiatan belajar mengajar tingkat menengah dengan mengintegrasikan agama Islam kedalam kurikulum khas Al Haraki yang berbasis ICT (Information, Communication and Technology) yang dikelola secara efektif, efisien dan akuntabel sehingga dapat meningkatkan kualitas secara berkesinambungan dan mengembangkan nilai-nilai entrepreneurship dan life skill untuk menghadapi era globalisasi. \n\nSMPIT Al Haraki menerapkan sistem pandidikan terpadu (Integrated System) dengan masa belajar penuh waktu (Full Day School) mulai pukul 07.00 hingga pukul 15.30 untuk hari Senin s.d Kamis, khusus hari Jumat hingga pukul 14.30. Siswa mengikuti shalat zhuhur dan ashar berjamaah.  \n\nTujuan Pendidikan \n\nMewujudkan generasi cerdas secara intelektual, emosional, mental dan spiritual dengan pemahaman aqidah yang benar, mandiri dan bertanggung jawab dan memiliki keterampilan hidup dan dapat menghasilkan karya yang mencerminkan jiwa wirausaha sehingga diharapkan mampu bersaing di dunia global.  \n\nSiswa siswi terampil menggunakan ICT secara benar dan bertanggung jawab, mampu berkomunikasi aktif dalam bahasa Inggris, mampu presentasi dan pidato dalam bahasa Inggris.',
    },
  },
  {
    name: 'Badr-Interactive',
    type: 'dorm',
    coordinate: {
      row: 150,
      col: 501,
    },
    info: {
      // timeLimit: '06:40-22:30 (23:30 pada hari Sabtu dan Minggu)',
      photo: 'Badr-Interactive',
      count: 2,
      tags: ['Perangkat Lunak', 'Teknologi'],
      brief:
        'Badr Interactive adalah perusahaan pengembang perangkat lunak yang memiliki visi untuk menciptakan kebaikan bagi jutaan orang setiap hari melalui teknologi. Kami membantu para mitra membangun solusi teknologi yang disesuaikan.',
    },
  },
  {
    name: 'Madrasah-Technonatura',
    type: 'dorm',
    coordinate: {
      row: 150,
      col: 501,
    },
    info: {
      // timeLimit: '06:40-22:30 (23:30 pada hari Sabtu dan Minggu)',
      photo: 'Madrasah-Technonatura',
      count: 3,
      tags: ['Madrasah', 'Yayasan', 'Pendidikan'],
      brief:
        'Madrasah Internasional TechnoNatura berdiri di bawah payung Yayasan CREATE, atau Centre for Research on Education, Arts, Technology and Entrepreneurship, CREATE Foundation. \n\nPendiri Create Foundation adalah para insan sains dan teknologi yang menyadari pentingnya pendidikan yang progresif bagi anak bangsa untuk kemajuan bangsa di masa depan.  \n\nCREATE Foundation didirikan dengan menyandang cita-cita dari para pendirinya yaitu:  \n\nMewujudkan sistem dan iklim pendidikan yang demokratis dan berkualitas guna mewujudkan bangsa yang berakhlak mulia, kreatif, inovatif, berwawasan kebangsaan, cerdas, sehat, disiplin bertanggung jawab, terampil, serta menguasai ilmu pengetahuan dan teknologi.  \n\nMewujudkan kehidupan sosial budaya yang berkepribadian, kreatif, ekspresif, dinamis dan berdaya tahan terhadap pengaruh globalisasi.  \n\nMeningkatkan pengamalan ajaran agama dalam kehidupan sehari-hari untuk mewujudkan kualitas keimanan dan ketakwaan pada Tuhan Yang Maha Esa dalam kehidupan dan mantabnya persaudaraan antara umat beragama yang berakhlak mulia, toleran, rukun dan damai.  \n\nMeningkatkan kualitas sumber daya manusia yang produktif, mandiri, maju, berdaya saing, berwawasan lingkungan dan berkelanjutan dalam rangka memberdayakan masyarakat dan seluruh kekuatan ekonomi nasional terutama pengusaha kecil, menengah dan koperasi.  \n\nSaat ini Technonatura terdaftar sebagai salah satu institusi pendidikan Madrasah formal dibawah Kemenag  berdomisili di kota Depok, Jawa Barat dengan pusat kegiatan administrasi Technonatura berdomisili di Jalan RTM raya no 16, Cimanggis, Kelapadua. Depok, Jawa Barat.',
    },
  },
  {
    name: 'Kode-Creative-Hub',
    type: 'dorm',
    coordinate: {
      row: 150,
      col: 501,
    },
    info: {
      // timeLimit: '06:40-22:30 (23:30 pada hari Sabtu dan Minggu)',
      photo: 'Kode-Creative-Hub',
      count: 3,
      tags: ['Binus', 'Startup'],
      brief:
        'Kode Creative Hub adalah tempat berkumpulnya komunitas bisnis dan startup Anda. Kami menyediakan tempat yang strategis untuk menyelenggarakan acara, pelatihan, kelas, dan ruang rapat.',
    },
  },
  {
    name: 'Infection-studios',
    type: 'safe',
    coordinate: {
      row: 640,
      col: 374,
    },
    info: {
      // timeLimit: '08:00-22:00',
      photo: 'Infection-studios',
      count: 2,
      tags: ['Motion Graphics', 'Kreatif', 'Animation'],
      brief: 'Merupakan perusahaan yang bergerak di Industri Kreatif pada bidang Motion Graphics & Animation, didirikan pada tahun 2014. \n\nKami bekerja dengan penuh dedikasi dan menghasilkan karya terbaik untuk Anda. Kami menyebut diri kami sebagai "Infected ones".',
    },
  },
  {
    name: 'PPMULTINDO',
    type: 'safe',
    coordinate: {
      row: 640,
      col: 374,
    },
    info: {
      // timeLimit: '08:00-22:00',
      photo: 'PPMULTINDO',
      count: 3,
      tags: ['Multimedia', 'Teknologi Informasi', 'Edukasi'],
      brief: 'PPMultindo adalah asosiasi atau perkumpulan profesi bidang multimedia dan teknologi informasi yang berdiri pada tanggal 17 Februari 2021 dengan SK Kemenkumham No. AHU-0003691.AH.01.07.TAHUN 2021. \n\nTujuan Pendirian PPMultindo adalah menumbuh kembangkan profesi pada bidang multimedia, animasi  dan Teknologi Informasi di Indonesia.  Selain itu untuk mengedukasi masyarakat pada bidang multimedia dan teknologi informasi demi menunjang Pembangunan Sumber Daya Manusia Negara Kesatuan Republik Indonesia',
    },
  },
  {
    name: 'INF-Creative',
    type: 'safe',
    coordinate: {
      row: 640,
      col: 374,
    },
    info: {
      // timeLimit: '08:00-22:00',
      photo: 'INF-Creative',
      count: 2,
      tags: ['Motion Graphics', 'Kreatif'],
      brief: 'Merupakan perusahaan yang bergerak di Industri Kreatif  pada bidang Motion Graphics & Animation, didirikan pada tahun 2014. Kami bekerja dengan penuh dedikasi dan menghasilkan karya terbaik untuk Anda. Kami menyebut diri kami sebagai "Infected ones". \n\nInf Creative melayani pembuatan motion grapics & animation dengan kualitas terbaik. Cocok untuk kebutuhan visual perusahaan dan bisnis guna meningkatkan awareness & branding',
    },
  },
  {
    name: 'UI',
    type: 'safe',
    coordinate: {
      row: 640,
      col: 374,
    },
    info: {
      // timeLimit: '08:00-22:00',
      photo: 'UI',
      count: 2,
      tags: ['Universitas', 'Pendidikan'],
      brief: 'UI merupakan institusi pendidikan tinggi tertua di Indonesia. Beberapa perguruan tinggi negeri terkemuka di Indonesia seperti Institut Teknologi Bandung, Universitas Airlangga, Institut Pertanian Bogor, Universitas Hasanuddin, Universitas Negeri Jakarta, dan Politeknik Negeri Jakarta pada awalnya merupakan bagian dari UI hingga kemudian memisahkan diri menjadi institusi tersendiri.',
    },
  },
  {
    name: 'Polimedia',
    type: 'safe',
    coordinate: {
      row: 640,
      col: 374,
    },
    info: {
      // timeLimit: '08:00-22:00',
      photo: 'Polimedia',
      count: 3,
      tags: ['Universitas', 'Kreatif', 'Pendidikan'],
      brief: 'Polimedia merupakan lembaga pendidikan tinggi vokasi pertama dan satu-satunya yang dirancang secara khusus untuk menyediakan berbagai program studi yang relevan dengan dunia industri kreatif.',
    },
  },
  {
    name: 'SLB',
    type: 'safe',
    coordinate: {
      row: 640,
      col: 374,
    },
    info: {
      // timeLimit: '08:00-22:00',
      photo: 'SLB',
      count: 2,
      tags: ['Sekolah', 'Negeri', 'Ratujaya'],
      brief: 'SLB Negeri Depok adalah sebuah sekolah luar biasa negeri yang terletak di Ratujaya, Kec. Cipayung tepatnya di Perumahan Permata Regency Blok A3. SLB Negeri Depok berdiri pada tahun 2012. Kepala sekolah sekarang adalah Lia Cornelia Dewi S.Pd. Status Sekolah ini adalah Sekolah Standar Nasional.',
    },
  },
  {
    name: 'STT-Nurul-Fikri',
    type: 'safe',
    coordinate: {
      row: 640,
      col: 374,
    },
    info: {
      // timeLimit: '08:00-22:00',
      photo: 'STT-Nurul-Fikri',
      count: 3,
      tags: ['Pendidikan', 'Perguruan Tinggi'],
      brief: 'Sejarah Perjalanan Berdirinya Sekolah Tinggi Teknologi Terpadu Nurul Fikri Sekolah Tinggi Teknologi Terpadu Nurul Fikri (populer disebut STT-NF) merupakan perguruan tinggi yang memadukan keilmuan praktis di bidang teknologi informasi dengan pengembangan kepribadian islami, kompeten dan berkarakter. Pada tahun 2012, STT-NF resmi berdiri berdasarkan SK Menteri Pendidikan dan Kebudayaan Nomor 269/E/O/2012.',
    },
  },
  {
    name: 'Dinas-Kominfo',
    type: 'safe',
    coordinate: {
      row: 640,
      col: 374,
    },
    info: {
      // timeLimit: '08:00-22:00',
      photo: 'Dinas-Kominfo',
      count: 2,
      tags: ['Dinas', 'Komunikasi', 'Informatika'],
      brief: 'Dinas Komunikasi dan Informatika mempunyai tugas membantu Bupati menyelenggarakan urusan pemerintahan bidang komunikasi dan informatika, bidang statistik dan bidang persandian. Dinas Komunikasi dan Informatika menyelenggarakan fungsi : Perumusan kebijakan bidang komunikasi dan informatika, statistik, dan persandian.',
    },
  },
  {
    name: 'Dinas-Pendidikan',
    type: 'safe',
    coordinate: {
      row: 640,
      col: 374,
    },
    info: {
      // timeLimit: '08:00-22:00',
      photo: 'Dinas-Pendidikan',
      count: 2,
      tags: ['Dinas', 'Pendidikan', 'Daerah'],
      brief: 'Dinas Pendidikan merupakan unsur pelaksana Pemerintah Daerah yang dipimpin oleh seorang kepala dinas yang berada dibawah dan bertanggung jawab kepada Wali Kota melalui Sekretaris Daerah.',
    },
  },
  {
    name: 'Bappeda',
    type: 'safe',
    coordinate: {
      row: 640,
      col: 374,
    },
    info: {
      // timeLimit: '08:00-22:00',
      photo: 'Bappeda',
      count: 2,
      tags: ['Daerah', 'Penelitian'],
      brief: 'Badan Perencanaan Pembangunan Daerah \n\nBappeda mempunyai tugas melaksanakan penyusunan perencanaan pembangunan Daerah, pelaksanaan perencanaan pembangunan Daerah, pengendalian, monitoring dan evaluasi pelaksanaan perencanaan pembangunan Daerah serta menyelenggarakan tugas penelitian dan pengembangan.',
    },
  },
  {
    name: 'Kominfo',
    type: 'safe',
    coordinate: {
      row: 640,
      col: 374,
    },
    info: {
      // timeLimit: '08:00-22:00',
      photo: 'Kominfo',
      count: 2,
      tags: ['Kementerian', 'Informatika', 'Informasi'],
      brief: 'Kementerian Komunikasi dan Informatika (Kemenkominfo atau Kominfo) adalah Kementerian yang mengurusi bidang komunikasi dan informatika. Kementerian Komunikasi dan Informatika sebelumnya bernama Kementerian Negara Komunikasi dan Informasi (2001–2005) dan Departemen Komunikasi dan Informatika (2005–2009).',
    },
  },
  {
    name: 'Depok-Creative-Center',
    type: 'safe',
    coordinate: {
      row: 640,
      col: 374,
    },
    info: {
      // timeLimit: '08:00-22:00',
      photo: 'Depok-Creative-Center',
      count: 2,
      tags: ['Kreatif', 'Inovatif'],
      brief: 'Pusat perkotaan yang dinamis dan penuh semangat yang berfungsi sebagai tempat berkembangnya ekspresi artistik dan solusi inovatif.',
    },
  },
];

const buildNameMap = new Map();

build_data.forEach((obj) => {
  buildNameMap.set(obj.name, 1);
});

function search_build(keyword: string) {
  return build_data.filter((item) => {
    // 使用正则表达式进行模糊搜索
    const regex = new RegExp(keyword, 'gi');
    return regex.test(item.name);
  });
}

export { build_data, buildNameMap, search_build };
