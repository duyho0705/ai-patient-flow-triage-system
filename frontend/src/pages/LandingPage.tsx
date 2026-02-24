import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  CheckCircle,
  LineChart,
  FileText,
  Leaf,
  ChevronRight,
  Star,
  Menu,
  X,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  ArrowRight,
  BriefcaseMedical
} from 'lucide-react'
import { LoginModal } from '@/pages/Login'

export function LandingPage() {
  const location = useLocation()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<{ pathname?: string; search?: string } | undefined>(undefined)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (location.state?.openLogin) {
      setIsLoginOpen(true)
      if (location.state?.from) {
        setRedirectAfterLogin(location.state.from)
      }
      window.history.replaceState({}, document.title)
    }
  }, [location])

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false)
          setRedirectAfterLogin(undefined)
        }}
        redirectTo={redirectAfterLogin ?? location.state?.from}
      />

      {/* Header */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#f6f8f7]/80 backdrop-blur-md border-b border-[#4ade80]/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <BriefcaseMedical className="h-8 w-8 text-[#4ade80]" strokeWidth={2.5} />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Sống Khỏe</h1>
          </button>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm font-bold text-slate-600 hover:text-[#4ade80] transition-colors">Trang chủ</button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-bold text-slate-600 hover:text-[#4ade80] transition-colors">Dịch vụ</button>
            <button onClick={() => document.getElementById('why-us')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-bold text-slate-600 hover:text-[#4ade80] transition-colors">Về chúng tôi</button>
            <button onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-bold text-slate-600 hover:text-[#4ade80] transition-colors">Tin tức</button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="hidden sm:flex items-center justify-center rounded-full bg-[#4ade80] px-8 py-2.5 text-sm font-bold text-slate-900 hover:brightness-105 transition-all shadow-lg shadow-[#4ade80]/20 active:scale-95"
            >
              Đăng nhập ngay
            </button>
            <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
            >
              <div className="px-6 py-6 space-y-4">
                <button onClick={() => { setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block w-full text-left text-sm font-semibold text-slate-600">Trang chủ</button>
                <button onClick={() => { setIsMenuOpen(false); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="block w-full text-left text-sm font-semibold text-slate-600">Dịch vụ</button>
                <button onClick={() => { setIsMenuOpen(false); document.getElementById('why-us')?.scrollIntoView({ behavior: 'smooth' }); }} className="block w-full text-left text-sm font-semibold text-slate-600">Về chúng tôi</button>
                <button onClick={() => { setIsMenuOpen(false); document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }); }} className="block w-full text-left text-sm font-semibold text-slate-600">Tin tức</button>
                <button
                  onClick={() => { setIsMenuOpen(false); setIsLoginOpen(true); }}
                  className="w-full bg-[#4ade80] py-3 rounded-xl font-bold text-slate-900"
                >
                  Đăng nhập
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative z-10 flex flex-col gap-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4ade80]/10 text-[#2fb344] text-xs font-bold uppercase tracking-wider w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
                </span>
                Chăm sóc tận tâm 24/7
              </div>
              <h1 className="text-5xl lg:text-7xl font-black lg:leading-[1.2] leading-[1.2] tracking-tight text-slate-900">
                Sống trọn vẹn <br /><span className="text-[#4ade80]">mỗi ngày</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                Giải pháp quản lý sức khỏe toàn diện và cá nhân hóa, giúp bạn làm chủ cuộc sống và tận hưởng niềm vui bên gia đình dù đang chung sống với bệnh mãn tính.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="rounded-full bg-[#4ade80] px-10 py-4 text-base font-bold text-slate-900 hover:scale-105 transition-transform shadow-xl shadow-[#4ade80]/25"
                >
                  Bắt đầu lộ trình
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-full border border-slate-200 px-10 py-4 text-base font-bold hover:bg-slate-50 transition-colors text-slate-600"
                >
                  Tìm hiểu thêm
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-16 bg-[#4ade80]/45 blur-[150px] rounded-full opacity-70"></div>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl border-8 border-white">
                <img
                  className="w-full h-full object-cover"
                  alt="Doctor smiling"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAK7luSrMhYKbMw8o__LGG9tBC2o21hvjt5-P79suc-zhnNPbLVjvjnQoy3yyQF6vQQ0dfLM6EA81gS9cSWhTwZuOaiO7pcOQAFfnjT3GD0Y4SBM-hQJ01S4oHER_TALG2FsttsXEQ6RgQUwnTWs_5u02oiyjRtd1Tocmb3uVd8iSJbllztO9KgVi35j3Cuf_lx3dHKSZ_e71uiBCEia1q9edBLEj29ygF1piZUk6UwAY5kxf0-J8OngQQFuLxBinLZUwmq6yfqcY"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="bg-white py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">Dịch vụ chuyên biệt cho bạn</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Chúng tôi cung cấp hệ sinh thái hỗ trợ đầy đủ để bạn không bao giờ cảm thấy đơn độc trong hành trình sức khỏe của mình.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<LineChart className="size-8" />}
                title="Theo dõi cá nhân hóa"
                desc="Hệ thống giám sát chỉ số sức khỏe riêng biệt, giúp dự báo và ngăn ngừa các biến chứng kịp thời."
              />
              <FeatureCard
                icon={<FileText className="size-8" />}
                title="Tư vấn chuyên gia"
                desc="Kết nối trực tiếp với các bác sĩ đầu ngành, sẵn sàng giải đáp mọi thắc mắc và điều chỉnh phác đồ."
              />
              <FeatureCard
                icon={<Leaf className="size-8" />}
                title="Sức khỏe toàn diện"
                desc="Cân bằng giữa điều trị y tế, chế độ dinh dưỡng và sự ổn định tâm lý để nâng cao chất lượng sống."
              />
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section id="why-us" className="py-24 overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 relative">
                <div className="absolute -top-10 -left-10 size-40 bg-[#4ade80]/10 rounded-full blur-2xl"></div>
                <motion.div
                  whileHover={{ rotate: 0 }}
                  initial={{ rotate: 2 }}
                  className="relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 border-8 border-white"
                >
                  <img
                    className="w-full h-full object-cover aspect-video"
                    alt="Doctor caring for patient"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLOardkXjJn9IpEf-YJ1O_tddSrscciq2EIrXfTNJx5mXVnw0t0Sjh5EGyHRWdelmtxr37RgD9pkglHxyjDygiyUUaTvYN2pE8DMy-yJm4sbj23r850KYqqOrYm6fNuUVkt3rFT5igydw--FIXUyXhiccF_lmO8kHIm91kMajUD1_dh0SozBwOsX0HgpL9KkM7aajh9u4GIjYvpLD4_Rek0CEwx85OVyyVoA7nKzorjydweywsvVS-ZKaHrIwE-dFUW4YHFPt1dGY"
                  />
                </motion.div>
              </div>
              <div className="lg:w-1/2 space-y-8">
                <h2 className="text-4xl font-extrabold leading-tight">Tại sao chọn Sống Khỏe?</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Chúng tôi tin rằng công nghệ chỉ thực sự hữu ích khi được dẫn dắt bởi sự thấu cảm giữa người với người. Tại Sống Khỏe, bạn không chỉ là một mã bệnh nhân, bạn là một phần của gia đình chúng tôi.
                </p>
                <div className="space-y-4">
                  <WhyItem title="Kết nối con người" desc="Đội ngũ hỗ trợ luôn lắng nghe và thấu hiểu nhu cầu của bạn." />
                  <WhyItem title="Công nghệ thân thiện" desc="Ứng dụng dễ sử dụng ngay cả với người cao tuổi." />
                  <WhyItem title="Phác đồ linh hoạt" desc="Luôn cập nhật theo tình trạng thực tế của cơ thể bạn." />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="bg-white py-32 border-t border-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold">Câu chuyện từ khách hàng</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TestimonialCard
                name="Bác Minh"
                age="65 tuổi, Hà Nội"
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuBM7hrQWqNjE97jBiPIuuBXUt0iIkwRELqAbQ7g8paxNcOBnIDoLaQXRo8igz7fA1i_a8iI7CrGpjOyg7IcNzvZ0BdQGQWN-48i5o7JYgc39GA8EzIeTlFUeAYlwBi865t1Rak08MsOSJPhRWOD2U7oDe_UQsM7vTE9TnUqOu16LOgko1bLVWyc7PE_dmbr275kl-E2t-K8coitBCXp3wmU3bP3ZkmxY4IkKSEQ04MMvUVBRZi8H72Z-sLEx7ysPk6hsALhQ5ZDNmA"
                content="Từ khi tham gia lộ trình của Sống Khỏe, chỉ số đường huyết của tôi luôn ổn định. Tôi cảm thấy an tâm hơn rất nhiều."
              />
              <TestimonialCard
                name="Anh Hùng"
                age="48 tuổi, Đà Nẵng"
                featured
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuAAEQueKO_NMZYTa_SA44AqLjQL09IVJW2MVHpjNv2tAps6IANi-Cg_unFdj3Eh7rKskS63r0dlexjlRyqL_uyvdBuC33Wp8sddg2i-PGjUQRr9-A-XpFDBeOOfx-SY8U9FM05d49xeyandO5chegca9Ar_sPy-Fb4bL0lgZuozy9A112h8d-4lkQ4hTG6Ogc-8U-R-AbNitwoHZ08Nqu05rSciT-KS3y7wc_iMw-bxiDmm7_zEE0oUG1nrcLgxm3HMgrpvDEeb0rg"
                content="Dịch vụ tư vấn rất chuyên nghiệp. Tôi có thể liên hệ với bác sĩ bất cứ lúc nào qua ứng dụng. Rất tiện lợi."
              />
              <TestimonialCard
                name="Chị Lan"
                age="52 tuổi, TP.HCM"
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuB5qUmqY3-8gVATQmw1r-zoiA-FWxysh1F18WuKO4YloAzOpTqXptFhHSD28nOg14zHCuWfRWJYtngqmNtY6SZqVi1uMhKnOU34J9_t0o3oObFOtYwa9cg2FsX88bOoZuhjFvtmh1aT03LRQNfGciTBhKnHtQKOT_61ueGmU10sm9pTpuCtIR1vF40C8SVhdw3LPPygMr2H1kr2aesak8kn_spqIqECfXCqXwcHEusdQBpXBUzELBjiS5BGt8UP92_de6jE4ngxt08"
                content="Không chỉ là thuốc, Sống Khỏe còn dạy tôi cách ăn uống và tập luyện đúng cách. Sức khỏe của tôi cải thiện rõ rệt."
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-slate-900 text-white rounded-3xl p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[#4ade80]/10 opacity-30 pointer-events-none"></div>
              <div className="relative z-10 space-y-10">
                <h2 className="text-4xl lg:text-5xl font-black">Sẵn sàng để sống khỏe hơn?</h2>
                <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">Đừng để bệnh mãn tính giới hạn cuộc sống của bạn. Hãy để chúng tôi đồng hành cùng bạn ngay hôm nay.</p>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="rounded-full bg-[#4ade80] px-12 py-5 text-lg font-bold text-slate-900 hover:scale-105 transition-transform shadow-xl shadow-[#4ade80]/20 active:scale-95"
                >
                  Đăng ký tư vấn miễn phí
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-20 pb-10 font-medium">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2 lg:col-span-2 space-y-8">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <BriefcaseMedical className="h-7 w-7 text-[#4ade80]" strokeWidth={2.5} />
                <h2 className="text-xl font-extrabold tracking-tight">Sống Khỏe</h2>
              </button>
              <p className="text-slate-500 max-w-xs leading-relaxed">Hệ sinh thái chăm sóc sức khỏe cho người bệnh mãn tính hàng đầu Việt Nam.</p>
              <div className="flex gap-4">
                <SocialLink icon={<Facebook className="size-5" />} />
                <SocialLink icon={<Twitter className="size-5" />} />
                <SocialLink icon={<Instagram className="size-5" />} />
              </div>
            </div>
            <FooterColumn title="Dịch vụ" links={["Theo dõi tim mạch", "Quản lý tiểu đường", "Hỗ trợ xương khớp", "Tư vấn tâm lý"]} />
            <FooterColumn title="Công ty" links={["Về chúng tôi", "Đội ngũ bác sĩ", "Tuyển dụng", "Liên hệ"]} />
            <FooterColumn title="Pháp lý" links={["Chính sách bảo mật", "Điều khoản sử dụng", "Giấy phép hoạt động"]} />
          </div>
          <div className="border-t border-slate-100 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            <p>© 2024 Sống Khỏe. All rights reserved.</p>
            <div className="flex gap-8">
              <span className="flex items-center gap-2"><Phone className="size-3" /> Hotline: 1900 1234</span>
              <span className="flex items-center gap-2"><Mail className="size-3" /> Email: contact@songkhoe.vn</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}



function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:border-[#4ade80]/30 transition-all hover:shadow-2xl hover:shadow-[#4ade80]/10">
      <div className="size-16 rounded-2xl bg-[#eefcf3] text-[#4ade80] flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-black mb-4 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm font-medium group-hover:text-slate-800 transition-colors">
        {desc}
      </p>
    </div>
  )
}

function WhyItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-400/5 transition-all group">
      <div className="mt-1 bg-[#4ade80]/10 p-1 rounded-full group-hover:bg-[#4ade80] transition-colors">
        <CheckCircle className="size-5 text-[#4ade80] group-hover:text-white" />
      </div>
      <div>
        <h4 className="font-black text-slate-900 mb-1">{title}</h4>
        <p className="text-sm text-slate-600 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function TestimonialCard({ name, age, content, image, featured }: { name: string, age: string, content: string, image: string, featured?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white p-10 rounded-3xl shadow-sm border ${featured ? 'border-[#4ade80] border-2 ring-4 ring-[#4ade80]/5' : 'border-slate-100'} relative`}
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="size-14 rounded-full overflow-hidden border-2 border-white shadow-md">
          <img className="w-full h-full object-cover" src={image} alt={name} />
        </div>
        <div>
          <h4 className="font-bold text-slate-900">{name}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{age}</p>
        </div>
        <div className="ml-auto text-yellow-400 flex gap-0.5">
          {[...Array(5)].map((_, i) => <Star key={i} className="size-3 fill-current" />)}
        </div>
      </div>
      <p className="text-slate-600 italic leading-relaxed text-sm">"{content}"</p>
    </motion.div>
  )
}

function SocialLink({ icon }: { icon: React.ReactNode }) {
  return (
    <a href="#" className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#4ade80] hover:text-white transition-all">
      {icon}
    </a>
  )
}

function FooterColumn({ title, links }: { title: string, links: string[] }) {
  const scrollTo = (name: string) => {
    if (name === 'Về chúng tôi') document.getElementById('why-us')?.scrollIntoView({ behavior: 'smooth' })
    else if (name === 'Dịch vụ') document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      <h5 className="font-black text-slate-900 text-xs uppercase tracking-[0.2em]">{title}</h5>
      <ul className="space-y-4">
        {links.map(link => (
          <li key={link}>
            <button onClick={() => scrollTo(link)} className="text-slate-500 hover:text-[#4ade80] transition-colors text-sm text-left">{link}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
