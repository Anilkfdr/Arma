import { Link } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { Logo } from '../components/Logo';

const FEATURES = [
  {
    title: 'Oda durumu tek bakışta',
    body: 'Her odanın bugünkü hâli: boş, dolu, bugün giriş, bugün çıkış ya da arızalı. Temizlik bekleyen odalar ayrıca işaretlenir.',
    icon: 'rooms',
  },
  {
    title: 'Çakışmayan rezervasyon',
    body: 'Tarih aralığı ve kişi sayısına göre yalnızca uygun odalar listelenir. Aynı oda aynı geceye iki kez verilemez; bu kural veritabanında korunur.',
    icon: 'calendar',
  },
  {
    title: 'Otel bazında yetki',
    body: 'Her çalışan yalnızca bağlı olduğu otelin kayıtlarını görür. Sınır ekranda gizlenerek değil, sunucudaki erişim kurallarıyla uygulanır.',
    icon: 'shield',
  },
  {
    title: 'Merkez ofis görünümü',
    body: 'Yetkili merkez ofis kullanıcısı otelleri tek tek açabilir veya doluluk, giriş ve çıkışları toplu özette birlikte izleyebilir.',
    icon: 'layers',
  },
] as const;

type StepState = 'hazir' | 'sirada' | 'plan';

const DAY_FLOW: { title: string; body: string; state: StepState }[] = [
  { title: 'Rezervasyon', body: 'Misafirin hangi tarihlerde, kaç kişi geleceği kaydedilir.', state: 'hazir' },
  { title: 'Oda ataması', body: 'Tarihlere ve kişi sayısına uygun boş oda seçilir.', state: 'hazir' },
  { title: 'Giriş (check-in)', body: 'Misafir otele geldiğinde kimlik ve konaklama bilgileri tamamlanır.', state: 'sirada' },
  {
    title: 'Misafir hesabı (folyo)',
    body: 'Oda ücreti ve konaklama boyunca yapılan ek harcamalar misafirin hesabına işlenir.',
    state: 'plan',
  },
  {
    title: 'Gece kapanışı',
    body: 'Günün kayıtları kontrol edilip kapatılır; otelin iş günü bir sonraki güne geçer.',
    state: 'plan',
  },
  { title: 'Ödeme ve çıkış', body: 'Hesap kapatılır, fatura kesilir, oda temizliğe açılır.', state: 'plan' },
  { title: 'Raporlar', body: 'Doluluk, gelir ve departman raporları yönetime sunulur.', state: 'plan' },
];

const STEP_LABEL: Record<StepState, string> = {
  hazir: 'Prototipte',
  sirada: 'Sırada',
  plan: 'Planlanıyor',
};

const ROADMAP = [
  { title: 'Ön büro', body: 'Rezervasyon, oda planı, giriş-çıkış', state: 'Başladı' },
  { title: 'Kat hizmetleri', body: 'Temizlik ve oda kontrol akışı', state: 'Planlanıyor' },
  { title: 'Folyo ve ön kasa', body: 'Misafir hesabı, tahsilat, fatura', state: 'Planlanıyor' },
  { title: 'Gece kapanışı', body: 'İş günü ve günlük kontroller', state: 'Planlanıyor' },
  { title: 'Acente ve kontrat', body: 'Kontenjan, fiyat ve satış kısıtları', state: 'Planlanıyor' },
  { title: 'Muhasebe', body: 'Cari hesaplar ve mali kayıtlar', state: 'Planlanıyor' },
  { title: 'Stok ve satın alma', body: 'Depo, talep, sipariş, maliyet', state: 'Planlanıyor' },
  { title: 'Masaüstü uygulaması', body: 'Bilgisayara kurulan sürüm', state: 'Planlanıyor' },
];

// Önizleme kartındaki kurgusal oda panosu (gerçek veri değildir).
const PREVIEW_ROOMS: { no: string; kind: 'dolu' | 'bos' | 'giris' | 'cikis' | 'ooo' }[] = [
  { no: '101', kind: 'cikis' },
  { no: '102', kind: 'bos' },
  { no: '103', kind: 'bos' },
  { no: '104', kind: 'bos' },
  { no: '105', kind: 'bos' },
  { no: '106', kind: 'ooo' },
  { no: '107', kind: 'dolu' },
  { no: '108', kind: 'bos' },
  { no: '201', kind: 'dolu' },
  { no: '202', kind: 'dolu' },
  { no: '203', kind: 'dolu' },
  { no: '204', kind: 'giris' },
  { no: '205', kind: 'bos' },
  { no: '206', kind: 'bos' },
  { no: '301', kind: 'cikis' },
  { no: '302', kind: 'bos' },
];

function FeatureIcon({ name }: { name: (typeof FEATURES)[number]['icon'] }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (name) {
    case 'rooms':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4M8 15l2.5 2.5L16 13" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'layers':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <path d="M12 3l9 5-9 5-9-5 9-5z" />
          <path d="M3 13l9 5 9-5" />
        </svg>
      );
  }
}

export function Landing() {
  const { status } = useAuth();
  const appHref = status === 'signedIn' ? '/uygulama' : '/giris';

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="container landing-nav__inner">
          <Link to="/" className="landing-nav__brand" aria-label="Arma ana sayfa">
            <Logo className="landing-nav__logo" />
          </Link>
          <nav className="landing-nav__links" aria-label="Sayfa bölümleri">
            <a href="#ozellikler">Prototipte neler var</a>
            <a href="#akis">Otel günü</a>
            <a href="#yol-haritasi">Yol haritası</a>
          </nav>
          <Link to={appHref} className="btn btn--primary">
            Uygulamaya Git
          </Link>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero__arches" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="container hero__grid">
            <div className="hero__copy">
              <p className="eyebrow">Otel yönetim yazılımı · İlk prototip</p>
              <h1>
                Resepsiyondan merkez ofise,
                <br />
                <span className="hero__accent">otelin günü tek sistemde.</span>
              </h1>
              <p className="hero__lead">
                Arma; rezervasyonları, oda durumunu ve birden çok otelin yönetimini bir araya getirmek için
                geliştirilen bir otel yönetim yazılımı. Şu anda erken prototip aşamasında ve yalnızca kurgusal iki
                otel üzerinde çalışıyor.
              </p>
              <div className="hero__actions">
                <Link to={appHref} className="btn btn--primary btn--lg">
                  Uygulamaya Git
                  <span aria-hidden="true">→</span>
                </Link>
                <a href="#ozellikler" className="btn btn--quiet btn--lg">
                  Prototipte neler var?
                </a>
              </div>
              <p className="hero__note">
                Uygulama yalnızca çalışan hesaplarıyla açılır; hesaplar yönetici tarafından oluşturulur.
              </p>
            </div>

            <figure className="preview" aria-label="Prototip oda panosundan örnek görünüm">
              <div className="preview__window">
                <div className="preview__bar">
                  <span className="preview__dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="preview__title">Arma Sahil Oteli · Bugün</span>
                </div>
                <div className="preview__body">
                  <div className="preview__stats">
                    <div>
                      <span className="preview__num">%57</span>
                      <span className="preview__lbl">Bu gece doluluk</span>
                    </div>
                    <div>
                      <span className="preview__num">3</span>
                      <span className="preview__lbl">Bugün giriş</span>
                    </div>
                    <div>
                      <span className="preview__num">2</span>
                      <span className="preview__lbl">Bugün çıkış</span>
                    </div>
                  </div>
                  <div className="preview__rooms">
                    {PREVIEW_ROOMS.map((room) => (
                      <span key={room.no} className={`preview__room preview__room--${room.kind}`}>
                        {room.no}
                      </span>
                    ))}
                  </div>
                  <div className="preview__legend" aria-hidden="true">
                    <span className="lg lg--dolu">Dolu</span>
                    <span className="lg lg--giris">Giriş</span>
                    <span className="lg lg--cikis">Çıkış</span>
                    <span className="lg lg--bos">Boş</span>
                    <span className="lg lg--ooo">Arızalı</span>
                  </div>
                </div>
              </div>
              <figcaption>Prototip ekranından sadeleştirilmiş görünüm · kurgusal veri</figcaption>
            </figure>
          </div>
        </section>

        <section id="ozellikler" className="section">
          <div className="container">
            <div className="section__head">
              <p className="eyebrow">Prototipte neler var</p>
              <h2>İlk sürüm, ön büronun temel işine odaklanıyor.</h2>
              <p>
                Bugün çalışan kısım küçük ama gerçek: veriler merkezi bir veritabanında tutuluyor, çalışanlar kendi
                hesaplarıyla giriş yapıyor ve her işlem yetkiye göre denetleniyor.
              </p>
            </div>
            <div className="feature-grid">
              {FEATURES.map((f) => (
                <article key={f.title} className="feature">
                  <span className="feature__icon">
                    <FeatureIcon name={f.icon} />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="akis" className="section section--sand">
          <div className="container">
            <div className="section__head">
              <p className="eyebrow">Bir otel günü</p>
              <h2>Rezervasyondan rapora kadar her adım birbirine bağlı.</h2>
              <p>
                Arma bu akışı adım adım kuruyor. Hangi adımın bugün çalıştığını, hangisinin sırada olduğunu açıkça
                gösteriyoruz.
              </p>
            </div>
            <ol className="flow">
              {DAY_FLOW.map((step, i) => (
                <li key={step.title} className={`flow__step flow__step--${step.state}`}>
                  <span className="flow__index">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                  <span className={`tag tag--${step.state}`}>{STEP_LABEL[step.state]}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section section--navy">
          <div className="container split">
            <div>
              <p className="eyebrow eyebrow--light">Çok otel, tek merkez</p>
              <h2>Her otelin verisi kendi sınırında kalır.</h2>
              <p>
                Kullanıcı ile otel arasındaki bağ açık bir üyelik kaydıdır: ön büro, otel yöneticisi, merkez ofis veya
                yalnızca görüntüleme. Erişim kuralları sunucuda çalışır. Adres çubuğunu değiştirmek ya da doğrudan
                istek göndermek başka bir otelin kaydını açmaz.
              </p>
            </div>
            <div className="org" aria-label="Merkez ofis ve oteller arasındaki yetki ilişkisi">
              <div className="org__node org__node--hq">
                <span className="org__role">Merkez ofis</span>
                <span className="org__desc">İki oteli ayrı ayrı ve toplu görür</span>
              </div>
              <div className="org__links" aria-hidden="true">
                <span />
                <span />
              </div>
              <div className="org__row">
                <div className="org__node">
                  <span className="org__role">Arma Sahil Oteli</span>
                  <span className="org__desc">Sahil ön büro ekibi yalnızca bunu görür</span>
                </div>
                <div className="org__node">
                  <span className="org__role">Arma Şehir Oteli</span>
                  <span className="org__desc">Şehir ön büro ekibi yalnızca bunu görür</span>
                </div>
              </div>
              <p className="org__note">Örnek oteller kurgusaldır.</p>
            </div>
          </div>
        </section>

        <section id="yol-haritasi" className="section">
          <div className="container">
            <div className="section__head">
              <p className="eyebrow">Yol haritası</p>
              <h2>Uzun vadeli hedef: otelin bütün departmanları.</h2>
              <p>
                Arma, ön bürodan muhasebeye kadar bir otelin kullandığı modüllerin tamamını kapsamayı hedefliyor. Bu
                bir takvim değil; sıralama, gerçek otel iş akışları öğrenildikçe netleşecek.
              </p>
            </div>
            <div className="roadmap">
              {ROADMAP.map((item) => (
                <div key={item.title} className={`roadmap__item ${item.state === 'Başladı' ? 'is-active' : ''}`}>
                  <span className={`tag ${item.state === 'Başladı' ? 'tag--hazir' : 'tag--plan'}`}>{item.state}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="container cta__inner">
            <div>
              <h2>Prototipi açın</h2>
              <p>Çalışan hesabınızla giriş yapın, yetkili olduğunuz otelin paneline geçin.</p>
            </div>
            <Link to={appHref} className="btn btn--light btn--lg">
              Uygulamaya Git <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container landing-footer__inner">
          <Logo className="landing-footer__logo" />
          <p>© 2026 Arma · Prototip sürüm. Ekranlardaki tüm otel ve misafir bilgileri kurgusaldır.</p>
        </div>
      </footer>
    </div>
  );
}
