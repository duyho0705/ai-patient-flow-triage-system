import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  Activity, 
  ShieldCheck, 
  Menu, 
  X, 
  Play, 
  Star, 
  ChevronDown, 
  Facebook, 
  Twitter, 
  Instagram,
  BriefcaseMedical,
  Mail,
  LineChart,
  FileText
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
    <div className="min-h-screen bg-md-background text-md-on-background font-sans overflow-x-hidden selection:bg-md-primary/20">
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false)
          setRedirectAfterLogin(undefined)
        }}
        redirectTo={redirectAfterLogin ?? location.state?.from}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xl font-bold tracking-tight text-gray-900"
            >
              Acme Inc.
            </button>
          </div>

          {/* Nav Links - Centered */}
          <div className="hidden md:flex flex-grow justify-center gap-10">
            <NavLink label="Features" href="#features" />
            <NavLink label="Pricing" href="#pricing" />
            <NavLink label="About" href="#about" />
            <NavLink label="Contact" href="#contact" />
          </div>

          {/* Buttons - Right */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-6 py-2 text-sm font-medium rounded-full bg-[#EADDFF] text-[#21005D] hover:bg-[#D5C7F0] transition-colors active:scale-95"
            >
              Log In
            </button>
            <button
              className="px-6 py-2 text-sm font-medium rounded-full bg-[#6750A4] text-white hover:bg-[#5B4792] shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden ml-auto p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              className="absolute top-16 left-0 w-full bg-white border-b border-gray-100 md:hidden shadow-lg p-6 flex flex-col gap-5 rounded-b-3xl"
            >
              <MobileNavLink label="Features" href="#features" onClick={() => setIsMenuOpen(false)} />
              <MobileNavLink label="Pricing" href="#pricing" onClick={() => setIsMenuOpen(false)} />
              <MobileNavLink label="About" href="#about" onClick={() => setIsMenuOpen(false)} />
              <MobileNavLink label="Contact" href="#contact" onClick={() => setIsMenuOpen(false)} />
              <button
                onClick={() => { setIsMenuOpen(false); setIsLoginOpen(true); }}
                className="px-6 py-4 rounded-full bg-[#6750A4] text-white font-medium w-full mt-2"
              >
                Get Started
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-20 pb-20 bg-white">
        {/* Hero Section Container */}
        <div className="max-w-[1440px] mx-auto px-6">
          <section className="relative bg-[#F3EDF7] rounded-[48px] overflow-hidden min-h-[600px] flex items-center">
            {/* Organic Blur Shapes - Layered like the mockup */}
            <div className="hidden lg:block absolute right-[10%] top-1/2 -translate-y-1/2 w-[500px] h-[500px]">
              <div className="relative w-full h-full">
                {/* Lavender base circle */}
                <div className="absolute top-[10%] right-[10%] w-[320px] h-[320px] bg-[#E8DEF8] rounded-full opacity-60" />
                {/* Dark purple organic shape */}
                <div className="absolute top-[25%] left-[5%] w-[300px] h-[280px] bg-[#6750A4] rounded-[80px] rotate-[-15deg] opacity-70" />
                {/* Mauve/Neutral organic shape */}
                <div className="absolute bottom-[10%] right-[5%] w-[260px] h-[260px] bg-[#7D5260] rounded-[60px] rotate-[10deg] opacity-60 mix-blend-multiply" />
              </div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 p-12 lg:p-24 max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
                className="space-y-8"
              >
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EADDFF] text-[#21005D] text-sm font-medium">
                   <div className="size-1.5 rounded-full bg-[#6750A4]" />
                   Join 50,000+ teams already using Acme
                </div>

                <h1 className="text-6xl lg:text-8xl font-bold tracking-tight text-[#1C1B1F] leading-[1.05]">
                  Transform the way <br />
                  <span className="opacity-90">your team works</span>
                </h1>

                <p className="text-lg lg:text-xl text-[#49454F] max-w-xl leading-relaxed font-normal">
                   Acme Platform brings your team together with powerful tools designed to streamline workflows, boost productivity, and drive results.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button className="px-8 py-4 rounded-full bg-[#6750A4] text-white font-medium hover:bg-[#5B4792] shadow-sm hover:shadow-md transition-all active:scale-95 text-[15px]">
                    Start free trial
                  </button>
                  <button className="px-8 py-4 rounded-full border border-[#79747E] text-[#6750A4] font-medium flex items-center gap-2 hover:bg-[#6750A4]/5 transition-all active:scale-95 text-[15px]">
                    <Play size={18} fill="currentColor" />
                    Watch demo
                  </button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Stats Bar */}
          <section className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard value="500k+" label="Active Users" />
            <StatCard value="99.99%" label="Uptime SLA" />
            <StatCard value="24/7" label="Support Access" />
            <StatCard value="$10M+" label="Customer Savings" />
          </section>
        </div>

        {/* Features Section */}
        <section id="features" className="py-24 relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <span className="text-md-primary font-medium tracking-wide uppercase text-sm">Dịch vụ hàng đầu</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-md-on-background tracking-tight">
                Chăm sóc thông minh hơn
              </h2>
              <p className="text-lg text-md-on-surface-variant leading-relaxed font-normal">
                Chúng tôi cung cấp các công cụ thiết yếu để bạn và bác sĩ cùng nhau quản lý sức khỏe hiệu quả nhất.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <FeatureCard
                icon={<Activity size={28} />}
                title="Theo dõi Chỉ số"
                desc="Tự động hóa theo dõi Đường huyết, Huyết áp, SpO2 với biểu đồ xu hướng trực quan."
                color="bg-md-primary-container text-md-on-primary-container"
              />
              <FeatureCard
                icon={<BriefcaseMedical size={28} />}
                title="Quản lý Toa thuốc"
                desc="Nhắc nhở giờ uống thuốc, cảnh báo tương tác thuốc và theo dõi bệnh sử toa thuốc."
                color="bg-md-secondary-container text-md-on-secondary-container"
              />
              <FeatureCard
                icon={<Mail size={28} />}
                title="Chat với Bác sĩ"
                desc="Trao đổi trực tiếp, gửi file xét nghiệm và nhận tư vấn từ bác sĩ chuyên khoa mọi lúc."
                color="bg-md-tertiary-container text-md-on-tertiary-container"
              />
              <FeatureCard
                icon={<LineChart size={28} />}
                title="Phân tích Nguy cơ"
                desc="Hệ thống AI nhận diện sớm các dấu hiệu bất thường và cảnh báo biến chứng kịp thời."
                color="bg-md-tertiary-container text-md-on-tertiary-container text-opacity-80"
              />
              <FeatureCard
                icon={<ShieldCheck size={28} />}
                title="Bảo mật Hồ sơ"
                desc="Dữ liệu y tế của bạn được mã hóa và bảo vệ nghiêm ngặt theo tiêu chuẩn quốc tế."
                color="bg-md-primary-container text-md-on-primary-container"
              />
              <FeatureCard
                icon={<FileText size={28} />}
                title="Phác đồ Điều trị"
                desc="Cập nhật phác đồ điều trị cá nhân hóa từ hội đồng chuyên gia hàng đầu."
                color="bg-md-secondary-container text-md-on-secondary-container"
              />
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section id="why-us" className="py-24 bg-md-surface-container rounded-3xl mx-4 lg:mx-12 overflow-hidden relative">
          <div className="absolute inset-0 bg-md-primary/5 mix-blend-multiply opacity-50" />
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="lg:w-1/2 space-y-10">
              <div className="space-y-4">
                <span className="text-md-primary font-medium tracking-wide uppercase text-sm">Lợi ích vượt trội</span>
                <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-md-on-surface">
                  Tại sao chọn chúng tôi?
                </h2>
              </div>
              
              <div className="space-y-6">
                <WhyItem 
                  title="Tận tâm 24/7" 
                  desc="Đội ngũ hỗ trợ và bác sĩ luôn sẵn sàng lắng nghe mọi thắc mắc của bạn." 
                />
                <WhyItem 
                  title="Công nghệ hiện đại" 
                  desc="Giao diện dễ sử dụng, phù hợp cho cả người lớn tuổi với các thao tác tối giản." 
                />
                <WhyItem 
                  title="Kết nối liền mạch" 
                  desc="Hồ sơ liên thông giữa bệnh nhân, bác sĩ và phòng khám một cách tức thì." 
                />
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-elevation-2 group">
                <div className="absolute inset-0 bg-md-primary/20 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-500 z-10" />
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt="Quality Care"
                  src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=2000"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 p-6 rounded-3xl bg-md-surface shadow-xl z-20 hidden sm:block">
                 <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-md-primary/10 flex items-center justify-center text-md-primary">
                       <Star size={24} fill="currentColor" />
                    </div>
                    <div>
                       <p className="text-lg font-bold">9.8/10</p>
                       <p className="text-xs text-md-on-surface-variant font-medium uppercase tracking-wider">Đánh giá của bệnh nhân</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 bg-md-background">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <span className="text-md-primary font-medium tracking-wide text-sm uppercase">Phản hồi</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-md-on-background tracking-tight">Câu chuyện của họ</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <TestimonialCard
                name="Bác Minh"
                role="65 tuổi, Hà Nội"
                content="Từ khi sử dụng ứng dụng, tôi có thể tự theo dõi đường huyết và huyết áp tại nhà mà không cần phải ghi chép sổ tay. Bác sĩ của tôi cũng nhận được chỉ số hàng ngày, thật tiện lợi."
              />
              <TestimonialCard
                name="Chị Lan"
                role="Bệnh nhân tiểu đường"
                content="Ứng dụng nhắc tôi uống thuốc rất đúng giờ. Việc chat trực tiếp với bác sĩ khi có biến động về chỉ số giúp tôi cảm thấy an tâm hơn rất nhiều trong quá trình điều trị."
                featured
              />
              <TestimonialCard
                name="Anh Hùng"
                role="Con trai bệnh nhân"
                content="Sống Khỏe giúp tôi an tâm hơn khi không ở gần ba mẹ. Tôi có thể nhận được thông báo ngay lập tức nếu chỉ số sức khỏe của ba mẹ có chuyển biến xấu."
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-md-surface-container/30 py-24 mb-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-12 text-center">Câu hỏi thường gặp</h2>
            <div className="space-y-4">
              <AccordionItem 
                title="Ứng dụng có dễ sử dụng cho người già không?" 
                content="Chắc chắn rồi. Sống Khỏe được thiết kế với giao diện Material You tối giản, chữ lớn và các nút bấm rõ ràng, thân thiện nhất với người lớn tuổi." 
              />
              <AccordionItem 
                title="Làm sao để đăng ký khám bệnh?" 
                content="Bạn có thể dễ dàng đặt lịch tái khám trực tiếp qua ứng dụng. Hệ thống sẽ tự động nhắc lịch tái khám cho bạn khi đến hạn." 
              />
              <AccordionItem 
                title="Thông tin của tôi có được bảo mật không?" 
                content="Mọi thông tin y tế của bạn được mã hóa đầu cuối và tuân thủ các quy định nghiêm ngặt về bảo mật dữ liệu sức khỏe cá nhân." 
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden flex flex-col items-center justify-center text-center px-6">
           <div className="blur-blob size-[600px] bg-md-primary/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
           <div className="max-w-3xl mx-auto relative z-10 space-y-10">
              <h2 className="text-5xl lg:text-7xl font-bold tracking-tight text-md-on-surface">
                Sẵn sàng sống <br/> khỏa hơn?
              </h2>
              <p className="text-xl text-md-on-surface-variant max-w-2xl mx-auto font-normal">
                Gia nhập hàng ngàn người đã và đang cải thiện chất lượng sống mỗi ngày với Sống Khỏe.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                 <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="btn-primary h-16 px-12 text-lg shadow-elevation-3"
                 >
                   Đăng ký miễn phí
                 </button>
                 <button className="btn-outlined h-16 px-12 text-lg bg-white/50 backdrop-blur-sm shadow-elevation-1">
                   Liên hệ tư vấn
                 </button>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-md-surface-container py-20 mt-auto border-t border-md-outline/5">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-md-outline/10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-md-primary flex items-center justify-center text-white">
                  <Activity size={18} />
                </div>
                <h2 className="text-xl font-bold">Sống Khỏe</h2>
              </div>
              <p className="text-md-on-surface-variant text-sm font-normal leading-relaxed">
                Nâng tầm quản lý bệnh mãn tính tại Việt Nam thông qua công nghệ trí tuệ nhân tạo và cá nhân hóa chuyên sâu.
              </p>
              <div className="flex gap-4">
                <SocialLink icon={<Facebook size={18} />} />
                <SocialLink icon={<Twitter size={18} />} />
                <SocialLink icon={<Instagram size={18} />} />
              </div>
            </div>

            <FooterColumn title="Dịch vụ" links={["TIM MẠCH", "TIỂU ĐƯỜNG", "HUYẾT ÁP", "TÂM LÝ"]} />
            <FooterColumn title="Công ty" links={["VỀ CHÚNG TÔI", "ĐỘI NGŨ", "TUYỂN DỤNG", "BAO MẬT"]} />
            <FooterColumn title="Liên hệ" links={["HOTLINE: 1900 XXXX", "EMAIL: CS@SONGKHOE.VN", "HÀ NỘI, VIỆT NAM"]} />
          </div>

          <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-medium text-md-on-surface-variant">
            <p>© 2024 Sống Khỏe. All rights reserved.</p>
            <div className="flex gap-8">
              <span>Điều khoản</span>
              <span>Bảo mật</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
    >
      {label}
    </a>
  )
}

function MobileNavLink({ label, href, onClick }: { label: string; href: string, onClick: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-lg font-medium text-gray-900 hover:text-[#6750A4] px-2 transition-colors"
    >
      {label}
    </a>
  )
}

function StatCard({ value, label }: { value: string, label: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-[32px] bg-[#F3EDF7] transition-all hover:scale-[1.02] cursor-default">
      <span className="text-4xl lg:text-5xl font-bold text-[#6750A4] mb-2">{value}</span>
      <span className="text-sm font-medium text-[#49454F] uppercase tracking-wider">{label}</span>
    </div>
  )
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className="card-interactive group">
      <div className={`size-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${color}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-md-on-surface mb-3">{title}</h3>
      <p className="text-md-on-surface-variant text-sm leading-relaxed font-normal">
        {desc}
      </p>
    </div>
  )
}

function WhyItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex items-start gap-6 group">
      <div className="mt-1 size-8 rounded-full bg-md-primary/10 text-md-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
         <div className="size-2 rounded-full bg-current" />
      </div>
      <div>
        <h4 className="text-lg font-bold text-md-on-surface mb-1">{title}</h4>
        <p className="text-md-on-surface-variant text-sm leading-relaxed font-normal">{desc}</p>
      </div>
    </div>
  )
}

function TestimonialCard({ name, role, content, featured }: { name: string, role: string, content: string, featured?: boolean }) {
  return (
    <div className={`card ${featured ? 'md:scale-110 md:z-10 shadow-elevation-2 bg-md-primary-container text-md-on-primary-container ring-1 ring-md-primary/20' : 'bg-md-surface-container'}`}>
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} fill="white" className={featured ? 'text-white' : 'text-md-primary'} />
        ))}
      </div>
      <p className={`text-base italic flex-grow mb-8 leading-relaxed ${featured ? 'text-md-on-primary-container/90' : 'text-md-on-surface-variant'}`}>{content}</p>
      <div className="flex items-center gap-4 mt-auto">
        <div className={`size-12 rounded-full flex items-center justify-center font-bold text-lg ${featured ? 'bg-white/20' : 'bg-md-primary/10 text-md-primary'}`}>
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-sm tracking-tight">{name}</h4>
          <span className={`text-xs ${featured ? 'opacity-70' : 'text-md-on-surface-variant'}`}>{role}</span>
        </div>
      </div>
    </div>
  )
}

function AccordionItem({ title, content }: { title: string, content: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`rounded-2xl transition-all duration-300 ${isOpen ? 'bg-md-primary-container/10' : 'bg-transparent'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left focus-visible:outline-none focus-visible:bg-md-surface-variant/20 rounded-2xl"
      >
        <span className="font-bold text-md-on-surface px-2">{title}</span>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-md-primary' : ''}`}>
          <ChevronDown size={24} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-6 pt-1 text-md-on-surface-variant text-sm leading-relaxed border-t border-md-outline/5 mt-2 mx-4">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SocialLink({ icon }: { icon: React.ReactNode }) {
  return (
    <a href="#" className="size-10 rounded-full bg-md-primary/5 flex items-center justify-center text-md-on-surface-variant hover:bg-md-primary hover:text-white transition-all transform hover:rotate-12 active:scale-90">
       {icon}
    </a>
  )
}

function FooterColumn({ title, links }: { title: string, links: string[] }) {
  return (
    <div className="space-y-6">
      <h5 className="font-bold text-md-on-surface-variant text-xs uppercase tracking-widest">{title}</h5>
      <ul className="space-y-4">
        {links.map(link => (
          <li key={link}>
            <a href="#" className="text-sm font-medium text-md-on-surface hover:text-md-primary transition-colors">{link}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
