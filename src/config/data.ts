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
      timeLimit: '06:40-22:30 (Sabtu dan Minggu 23:30）',
      photo: 'dorm',
      count: 4,
      tags: ['Asrama putri', 'lantai 6', 'Mesin penjual otomatis tersedia di lantai pertama'],
      brief:
        'Tipe asrama meliputi kamar 3 orang, 4 orang, dan 5 orang. Setiap asrama dilengkapi dengan tempat tidur dan meja (tempat tidur berukuran 0,9mX1,9m), kamar mandi mandiri, balkon mandiri, dan AC. (Akan ada "santo pelindung" yang malas dari asrama di lantai bawah di setiap asrama, jadi berhati-hatilah saat naik dan turun tangga!) \n\nPaling dekat dengan kafetaria, sangat nyaman, dan bibi asrama sangat baik😄',
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
      timeLimit: '06:40-22:30 (23:30 pada hari Sabtu dan Minggu)',
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
      timeLimit: '06:40-22:30 (23:30 pada hari Sabtu dan Minggu)',
      photo: 'Artificial-Intelligence-Center-Indonesia',
      count: 3,
      tags: ['Asrama putri', 'lantai 6', 'Mesin penjual otomatis tersedia di lantai pertama'],
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
      timeLimit: '06:40-22:30 (23:30 pada hari Sabtu dan Minggu)',
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
      timeLimit: '06:40-22:30 (23:30 pada hari Sabtu dan Minggu)',
      photo: 'Badr-Interactive',
      count: 2,
      tags: ['Asrama putra', 'lantai 6', 'Mesin penjual otomatis tersedia di lantai pertama', 'Meituan Disukai'],
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
      timeLimit: '06:40-22:30 (23:30 pada hari Sabtu dan Minggu)',
      photo: 'Madrasah-Technonatura',
      count: 3,
      tags: ['Asrama putra', 'lantai 6', 'Mesin penjual otomatis tersedia di lantai pertama', 'Meituan Disukai'],
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
      timeLimit: '06:40-22:30 (23:30 pada hari Sabtu dan Minggu)',
      photo: 'Kode-Creative-Hub',
      count: 3,
      tags: ['Asrama putra', 'lantai 6', 'Mesin penjual otomatis tersedia di lantai pertama', 'Meituan Disukai'],
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
      timeLimit: '08:00-22:00',
      photo: 'Infection-studios',
      count: 2,
      tags: ['Motion Graphics', 'Kreatif'],
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
      timeLimit: '08:00-22:00',
      photo: 'PPMULTINDO',
      count: 3,
      tags: ['Bilik keamanan'],
      brief: 'Dari pintu masuk utama sekolah bisa ke Sunshine Online Plaza atau naik bus Bagus banget😄',
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
      timeLimit: '08:00-22:00',
      photo: 'INF-Creative',
      count: 2,
      tags: ['Motion Graphics', 'Kreatif'],
      brief: 'Merupakan perusahaan yang bergerak di Industri Kreatif  pada bidang Motion Graphics & Animation, didirikan pada tahun 2014. Kami bekerja dengan penuh dedikasi dan menghasilkan karya terbaik untuk Anda. Kami menyebut diri kami sebagai "Infected ones". \n\nInf Creative melayani pembuatan motion grapics & animation dengan kualitas terbaik. Cocok untuk kebutuhan visual perusahaan dan bisnis guna meningkatkan awareness & branding',
    },
  },
];

const buildNameMap = new Map();

build_data.forEach((obj) => {
  buildNameMap.set(obj.name, 1);
});

const search_build = (keyword: string) => {
  return build_data.filter((item) => {
    // 使用正则表达式进行模糊搜索
    const regex = new RegExp(keyword, 'gi');
    return regex.test(item.name);
  });
};

export { build_data, buildNameMap, search_build };
