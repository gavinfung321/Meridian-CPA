export type Language = "en" | "zh";

export const translations = {
  en: {
    nav: {
      about: "About Us",
      services: "Services",
      auditCycle: "Audit Cycle",
      ourTeam: "Our Team",
      faq: "FAQ",
      bookConsult: "Book",
      login: "Login",
      dashboard: "Dashboard",
      menuOpen: "Open menu",
      menuClose: "Close menu",
    },
    hero: {
      title: "Hong Kong Compliance & Advisory, Simplified.",
      subtitle: "Expert audit, tax, and corporate services designed to keep your business secure and agile.",
      btn: "Book a Consultation",
    },
    welcome: {
      title: "Welcome to Meridian CPA & Advisory",
      p1: "Meridian CPA & Advisory is a trusted Hong Kong accounting firm delivering expert audit, tax, and business advisory services. Beyond basic compliance, we serve as strategic partners dedicated to protecting your financial integrity and driving sustainable growth.",
      p2: "We pair deep local regulatory knowledge with international accounting standards to support businesses of all sizes. Our team of certified accountants offers clear, actionable insights to help you navigate complex financial landscapes with confidence.",
      btn: "More about Us",
      proofs: [
        { label: "AFRC Registered", detail: "Registered practice under the Accounting and Financial Reporting Council." },
        { label: "TCSP Licensed", detail: "Trust or Company Service Provider licence for corporate support." },
        { label: "HKICPA Practising", detail: "Practising certified public accountants under the Hong Kong Institute of CPAs." },
      ],
    },
    offer: {
      title: "What We Offer",
      services: [
        {
          name: "Compliance (Audit & Tax)",
          outcome: "Statutory audit and tax filings ready for Companies Registry and IRD.",
        },
        {
          name: "Profits Tax Return & Advisory",
          outcome: "Timely Profits Tax Return preparation with clear advisory on positions.",
        },
        {
          name: "HKFRS / SME-FRS Bookkeeping",
          outcome: "Books maintained to the reporting framework your entity requires.",
        },
        {
          name: "Company Secretarial",
          outcome: "Annual returns, AGMs, and company records kept filing-ready.",
        },
        {
          name: "Cloud Accounting (Xero)",
          outcome: "Live ledgers and cleaner month-end closes on Xero.",
        },
      ],
      btn: "Book a Consultation",
    },
    clients: {
      title: "Hear From Our Clients",
      subtitle: "We believe that our clients' experiences speak volumes about the quality of our services. Here's what some of them have to say:",
      testimonials: [
        {
          quote: '"Meridian CPA handled our transition to Xero cloud accounting seamlessly. Their team is exceptionally responsive and saved us countless hours of manual bookkeeping."',
          author: "— Kenji L., Tech Startup Founder",
          photo: "/images/clients/kenji-l.png",
        },
        {
          quote: '"Their statutory audit service is thorough, professional, and completed well ahead of the IRD deadlines. Highly recommended for any local SME."',
          author: "— Mrs. Wong, Trading Company Director",
          photo: "/images/clients/mrs-wong.png",
        },
        {
          quote: '"Setting up our Hong Kong subsidiary was effortless thanks to their corporate secretarial team. They handle all our annual filings perfectly."',
          author: "— Marcus S., Overseas Investor",
          photo: "/images/clients/marcus-s.png",
        },
      ],
      callout: "Let us help you navigate your compliance journey with confidence and peace of mind. Contact Meridian CPA today.",
    },
    footer: {
      tagline: "Deep expertise, decisive financial clarity",
      license: "AFRC Registered Practice | TCSP Licensed",
      rights: "Meridian CPA & Advisory\n© 2026 All Rights Reserved",
      backToTop: "Back to top",
      linkedin: "LinkedIn",
      facebook: "Facebook",
      instagram: "Instagram",
      x: "X",
    },
    people: {
      label: "OUR LEADERSHIP TEAM",
      title: "The Partners",
      subtitle: "HKICPA Practising CPAs with deep expertise across audit, tax, and cross-border advisory.",
      authority: "Engagement partner involved on every engagement.",
      readBio: "Read bio",
      hideBio: "Hide bio",
      partners: [
        {
          name: "Andrew Lam",
          title: "Managing Partner",
          specialty: "International Liaison & Practice Director",
          bio: "Andrew leads the firm's strategic direction with over 20 years of experience in statutory audit and international corporate structuring. He serves as the primary liaison for multinational clients operating across the Greater Bay Area.",
          initials: "AL",
          photo: "/images/partners/andrew-lam.png",
        },
        {
          name: "Cecilia Yam",
          title: "Director",
          specialty: "Risk Management & Compliance",
          bio: "Cecilia heads the firm's risk management practice, overseeing quality control across all audit engagements. She holds specialist qualifications in AFRC regulatory compliance and internal audit frameworks.",
          initials: "CY",
          photo: "/images/partners/cecilia-yam.png",
        },
        {
          name: "Ringo Chiu",
          title: "Director — Tax Services",
          specialty: "IRD Corporate Tax Division",
          bio: "Ringo leads the tax advisory team with deep expertise in Hong Kong Profits Tax and cross-border tax structuring. He manages the firm's relationship with IRD and advises clients on complex tax investigations.",
          initials: "RC",
          photo: "/images/partners/ringo-chiu.png",
        },
        {
          name: "Wing Chan",
          title: "Director",
          specialty: "China & Cross-Border Practice",
          bio: "Wing spearheads the firm's Greater China advisory practice, supporting inbound and outbound investment structures between Hong Kong, Mainland China, and Southeast Asia. She is fluent in Cantonese, Mandarin, and English.",
          initials: "WC",
          photo: "/images/partners/wing-chan.png",
        },
      ],
    },
    timeline: {
      label: "OUR PROCESS",
      title: "The Audit Lifecycle",
      subtitle: "A structured, transparent engagement from day one to signed report.",
      steps: [
        {
          number: "01",
          title: "Engagement & Scope",
          description: "We define the audit mandate, understand your business context, and agree on timelines and key deliverables with management.",
        },
        {
          number: "02",
          title: "Planning & Risk Assessment",
          description: "We identify material areas, assess inherent and control risks, and design audit procedures tailored to your industry.",
        },
        {
          number: "03",
          title: "Fieldwork & Evidence",
          description: "On-site or remote sampling, substantive testing, and documentation of evidence in compliance with HKSA standards.",
        },
        {
          number: "04",
          title: "Findings & Review",
          description: "We present findings to management, discuss any control gaps, and address queries before finalising our conclusions.",
        },
        {
          number: "05",
          title: "Report & Signing",
          description: "We issue the signed statutory audit report and financial statements, ready for submission to Companies Registry and IRD.",
        },
        {
          number: "06",
          title: "Post-Audit Advisory",
          description: "Strategic recommendations, lessons learned, and year-round support to strengthen controls for the next cycle.",
        },
      ],
    },
    whyUs: {
      title: "Why Meridian",
      subtitle: "Audits and advisory that stay clear, controlled, and free of last-minute surprises.",
      imageAlt: "Meridian CPA professionals in a Hong Kong office overlooking the harbour",
      reasons: [
        {
          title: "Risk-based focus",
          detail: "Focus where material misstatement risk is highest.",
        },
        {
          title: "Independence",
          detail: "Ethical walls, rotation, and documented confirmations.",
        },
        {
          title: "HKSA alignment",
          detail: "Procedures designed and recorded to HKICPA standards.",
        },
        {
          title: "Clear communication",
          detail: "Plain-language findings at every stage.",
        },
      ],
    },
    faq: {
      label: "FAQ",
      title: "Common questions",
      subtitle: "Clear answers about statutory audits and accounting services in Hong Kong.",
      items: [
        {
          question: "Do Hong Kong companies need a statutory audit?",
          answer: "Most Hong Kong limited companies require an annual statutory audit under the Companies Ordinance. Exemptions may apply in limited cases. We can review your situation and confirm what applies — book a consultation to discuss.",
        },
        {
          question: "How long does a typical audit take?",
          answer: "A well-prepared SME audit often completes within 4–8 weeks from engagement to signed report, depending on complexity and document readiness. We agree timelines up front so you can plan filings with confidence.",
        },
        {
          question: "What documents should we prepare?",
          answer: "Typically: bank statements, ledgers, invoices, contracts, fixed-asset schedules, and prior-year financials. We send a tailored checklist after engagement so your team knows exactly what to gather.",
        },
        {
          question: "Can you handle tax filing with the audit?",
          answer: "Yes. We can coordinate your statutory audit with Profits Tax Return preparation and filing, so compliance stays aligned and deadlines are met without juggling multiple advisors.",
        },
        {
          question: "Do you work with startups, SMEs, and overseas owners?",
          answer: "Yes. We support local SMEs, startups, and overseas investors with Hong Kong entities — including bilingual communication and clear reporting for remote directors.",
        },
        {
          question: "How do we get started / book a consultation?",
          answer: "Use Book a Consultation on this page to open our short form, or message us on WhatsApp / email / phone with a brief on your company and year-end. We will schedule a short consultation to scope next steps.",
        },
      ],
    },
    contact: {
      label: "CONTACT",
      title: "Get in touch",
      subtitle: "Ready to discuss your audit or compliance needs? Speak with our team — we are here to help.",
      response: "We usually reply within one business day.",
      addressLabel: "Office",
      emailLabel: "Email",
      phoneLabel: "Phone",
      btn: "Book a Consultation",
      whatsapp: "WhatsApp us",
      email: "info@meridiancpa.com.hk",
      phone: "+852 2815 1234",
      address: [
        "Suite 1801, 18/F, Chinachem Tower",
        "34-37 Connaught Road Central",
        "Central, Hong Kong",
      ],
      form: {
        title: "Book a Consultation",
        name: "Name",
        email: "Email",
        phone: "Phone (optional)",
        message: "Message",
        submit: "Send request",
        cancel: "Cancel",
        success: "Thanks — your email app should open with your request. We will reply shortly.",
        successClose: "Close",
      },
    },
    booking: {
      label: "UPCOMING SESSIONS",
      title: "Book a Session",
      subtitle: "Join our specialized 1-on-1 consultations or group workshops to stay ahead on compliance and planning.",
      filters: {
        allTypes: "All Types",
        taxPlanning: "Tax Planning",
        auditCompliance: "Audit & Compliance",
        payrollMpf: "Payroll & MPF",
        advisory: "Advisory",
        allLocations: "All Locations",
        centralOffice: "Central Office",
        onlineZoom: "Online / Zoom",
        clientSite: "Client Site",
      },
      card: {
        spotsLeft: "spots left",
        booked: "booked",
        privateSession: "Private Session",
        min: "min",
        bookConsultation: "Book Consultation",
        reserveSpot: "Reserve Spot",
        registerNow: "Register Now",
        bookAuditReview: "Book Audit Review",
      },
      sessions: {
        taxPlanning: {
          title: "1-on-1 Tax Planning & Advisory (Private Session)",
          tags: ["Tax", "1-on-1"],
        },
        ptrClinic: {
          title: "HK Profits Tax Return (PTR) Q&A Clinic",
          tags: ["Compliance", "Group Workshop"],
        },
        mpfMasterclass: {
          title: "MPF & Hong Kong Payroll Compliance Masterclass",
          tags: ["Payroll", "Workshop"],
        },
        auditReadiness: {
          title: "Audit Readiness & Document Review",
          tags: ["Audit", "1-on-1"],
        },
        gbaStructuring: {
          title: "Cross-Border Tax & GBA Structuring Workshop",
          tags: ["Advisory", "Seminar"],
        },
      },
      locations: {
        centralZoom: "Central Office / Zoom",
        boardroomHybrid: "Boardroom / Hybrid",
        onlineWebinar: "Online Webinar",
        centralOffice: "Central Office",
        hybrid: "Hybrid",
      }
    },
    aboutPage: {
      title: "More about Us",
      body: "This page is a placeholder. Firm story, credentials, and practice details will be added here.",
      back: "Back to home",
    },
  },
  zh: {
    nav: {
      about: "關於我們",
      services: "服務",
      auditCycle: "審計週期",
      ourTeam: "我們的團隊",
      faq: "常見問題",
      bookConsult: "預約",
      login: "登入",
      dashboard: "控制台",
      menuOpen: "開啟選單",
      menuClose: "關閉選單",
    },
    hero: {
      title: "香港合規與諮詢，化繁為簡。",
      subtitle: "專業審計、稅務及企業服務，助您穩健經營、靈活應對。",
      btn: "預約諮詢",
    },
    welcome: {
      title: "歡迎來到 Meridian CPA & Advisory",
      p1: "Meridian CPA & Advisory 是您值得信賴的香港會計師事務所，提供專業的審計、稅務和商業諮詢服務。除了基本的合規性，我們更是您致力於維護財務誠信與推動可持續增長的策略夥伴。",
      p2: "我們將深厚的本地法規知識與國際會計準則相結合，為各種規模的企業提供支持。我們的執業會計師團隊提供清晰、具可操作性的見解，助您信心十足地應對複雜的財務局勢。",
      btn: "了解更多",
      proofs: [
        { label: "會計及財務匯報局註冊", detail: "於會計及財務匯報局註冊的執業事務所。" },
        { label: "TCSP 持牌", detail: "持有信託或公司服務提供者牌照，支援企業合規。" },
        { label: "香港會計師公會執業", detail: "香港會計師公會執業會計師。" },
      ],
    },
    offer: {
      title: "服務範圍",
      services: [
        {
          name: "合規服務 (審計與稅務)",
          outcome: "法定審計及稅務申報，配合公司註冊處及稅務局要求。",
        },
        {
          name: "利得稅申報及諮詢",
          outcome: "準時準備利得稅報稅表，並就稅務立場提供清晰建議。",
        },
        {
          name: "香港財務報告準則 / 中小企業財務報告準則簿記",
          outcome: "按適用報告框架妥善備存賬冊。",
        },
        {
          name: "公司秘書服務",
          outcome: "周年申報、股東大會及公司紀錄保持可提交狀態。",
        },
        {
          name: "雲端會計 (Xero)",
          outcome: "以 Xero 維持實時賬目，簡化月結。",
        },
      ],
      btn: "預約諮詢",
    },
    clients: {
      title: "客戶見證",
      subtitle: "我們深信客戶的親身體驗最能展現我們的服務品質。以下是部分客戶的真誠分享：",
      testimonials: [
        {
          quote: "「Meridian CPA 協助我們無縫過渡到 Xero 雲端會計。他們的團隊回覆極快，為我們節省了無數的手動簿記時間。」",
          author: "— Kenji L.，科技初創企業創辦人",
          photo: "/images/clients/kenji-l.png",
        },
        {
          quote: "「審計服務嚴謹且專業，並在稅務局截止日期前妥善完成。極力推薦給本地中小企業。」",
          author: "— 王太太，貿易公司董事",
          photo: "/images/clients/mrs-wong.png",
        },
        {
          quote: "「非常感謝他們的秘書團隊，讓我們成立香港子公司變得輕鬆簡單。他們完美處理了我們所有的年度申報。」",
          author: "— Marcus S.，海外投資者",
          photo: "/images/clients/marcus-s.png",
        },
      ],
      callout: "讓我們協助您信心十足、無憂無慮地步入合規之旅。今天就聯絡 Meridian CPA。",
    },
    footer: {
      tagline: "深厚專業，精準的財務洞察",
      license: "會計及財務匯報局註冊事務所 | TCSP 持牌",
      rights: "Meridian CPA & Advisory\n© 2026 版權所有",
      backToTop: "返回頂部",
      linkedin: "LinkedIn",
      facebook: "Facebook",
      instagram: "Instagram",
      x: "X",
    },
    people: {
      label: "我們的領導團隊",
      title: "合夥人",
      subtitle: "持牌香港執業會計師，在審計、稅務及跨境諮詢方面擁有深厚專業。",
      authority: "每宗業務均有合夥人參與。",
      readBio: "閱讀簡介",
      hideBio: "收起簡介",
      partners: [
        {
          name: "林偉明",
          title: "管理合夥人",
          specialty: "國際聯絡及業務總監",
          bio: "林先生擁有超過20年法定審計及國際企業架構經驗，主導事務所的策略方向，並擔任在大灣區業務的跨國客戶的首要聯絡人。",
          initials: "林",
          photo: "/images/partners/andrew-lam.png",
        },
        {
          name: "任慧芬",
          title: "董事",
          specialty: "風險管理及合規",
          bio: "任女士領導事務所的風險管理實務，監督所有審計業務的質量控制，並持有AFRC合規及內部審計框架的專業資格。",
          initials: "任",
          photo: "/images/partners/cecilia-yam.png",
        },
        {
          name: "趙榮光",
          title: "董事 — 稅務服務",
          specialty: "稅務局企業稅務部門",
          bio: "趙先生領導稅務諮詢團隊，在香港利得稅及跨境稅務架構方面擁有深厚專業，並代表客戶處理複雜的稅務調查事宜。",
          initials: "趙",
          photo: "/images/partners/ringo-chiu.png",
        },
        {
          name: "陳詠珊",
          title: "董事",
          specialty: "中國及跨境業務",
          bio: "陳女士主導事務所的大中華諮詢業務，為香港、中國內地及東南亞之間的入境及外出投資架構提供支援，通曉廣東話、普通話及英語。",
          initials: "陳",
          photo: "/images/partners/wing-chan.png",
        },
      ],
    },
    timeline: {
      label: "我們的流程",
      title: "審計全週期",
      subtitle: "從第一天到簽署報告，結構清晰、透明有序的審計服務。",
      steps: [
        {
          number: "01",
          title: "委任及範圍",
          description: "界定審計委任範圍，了解您的業務背景，並與管理層就時間表及主要交付物達成共識。",
        },
        {
          number: "02",
          title: "規劃及風險評估",
          description: "識別重大領域，評估固有及控制風險，並根據您的行業設計針對性的審計程序。",
        },
        {
          number: "03",
          title: "實地工作及取證",
          description: "按照香港審計準則，進行現場或遙距抽樣、實質性測試及審計憑證文件記錄。",
        },
        {
          number: "04",
          title: "發現事項及審閱",
          description: "向管理層呈報發現事項，討論任何內控缺口，並在定稿前解答相關疑問。",
        },
        {
          number: "05",
          title: "報告及簽署",
          description: "發出已簽署的法定審計報告及財務報表，可提交公司註冊處及稅務局。",
        },
        {
          number: "06",
          title: "審計後諮詢",
          description: "提供策略建議、經驗總結及全年支援，以加強內控措施，為下一個審計週期做好準備。",
        },
      ],
    },
    whyUs: {
      title: "為何選擇 Meridian",
      subtitle: "審計與諮詢保持清晰可控，避免臨門一腳的意外。",
      imageAlt: "Meridian CPA 專業團隊於香港辦公室，背景為維港景致",
      reasons: [
        {
          title: "風險為本",
          detail: "將資源集中於最可能出現重大失實陳述的領域。",
        },
        {
          title: "獨立及客觀",
          detail: "嚴格道德隔離、合夥人輪換及書面獨立性確認。",
        },
        {
          title: "遵守香港審計準則",
          detail: "所有程序均按香港會計師公會審計準則設計及記錄。",
        },
        {
          title: "清晰溝通",
          detail: "每階段以淺白語言傳達發現事項，報告階段絕無意外。",
        },
      ],
    },
    faq: {
      label: "常見問題",
      title: "客戶常問",
      subtitle: "關於香港法定審計及會計服務的清晰解答。",
      items: [
        {
          question: "香港公司是否需要法定審計？",
          answer: "大多數香港有限公司根據《公司條例》須進行年度法定審計，少數情況或可豁免。我們可協助評估您的情況——歡迎預約諮詢了解詳情。",
        },
        {
          question: "一般審計需要多久？",
          answer: "準備齊全的中小企業審計，通常由委任至簽署報告約需4至8週，視乎複雜程度及文件完備情況。我們會事先商定時間表，方便您安排申報。",
        },
        {
          question: "需要準備哪些文件？",
          answer: "一般包括銀行月結單、賬冊、發票、合約、固定資產清單及上年度財務報表。委任後我們會提供針對性清單，讓團隊清楚準備項目。",
        },
        {
          question: "審計可否一併處理稅務申報？",
          answer: "可以。我們可將法定審計與利得稅報稅表的準備及提交一併協調，讓合規工作更順暢，並準時達標。",
        },
        {
          question: "是否服務初創、中小企及海外東主？",
          answer: "是。我們服務本地中小企、初創企業及持有香港公司的海外投資者，並提供雙語溝通及清晰報告，方便遙距董事了解情況。",
        },
        {
          question: "如何開始／預約諮詢？",
          answer: "請在本頁使用「預約諮詢」開啟表格，或透過 WhatsApp／電郵／電話簡述公司及年結情況。我們會安排簡短諮詢，釐清範圍及下一步。",
        },
      ],
    },
    contact: {
      label: "聯絡我們",
      title: "與我們對話",
      subtitle: "準備討論審計或合規需要？歡迎聯絡我們的團隊——我們樂意協助。",
      response: "我們通常於一個工作天內回覆。",
      addressLabel: "辦事處",
      emailLabel: "電郵",
      phoneLabel: "電話",
      btn: "預約諮詢",
      whatsapp: "WhatsApp 聯絡",
      email: "info@meridiancpa.com.hk",
      phone: "+852 2815 1234",
      address: [
        "香港中環干諾道中34-37號",
        "華懋大廈18樓1801室",
      ],
      form: {
        title: "預約諮詢",
        name: "姓名",
        email: "電郵",
        phone: "電話（選填）",
        message: "訊息",
        submit: "送出申請",
        cancel: "取消",
        success: "多謝 — 您的電郵程式應已開啟申請內容。我們會盡快回覆。",
        successClose: "關閉",
      },
    },
    booking: {
      label: "即將舉行的諮詢與活動",
      title: "預約諮詢",
      subtitle: "參加我們專屬的一對一諮詢或小組工作坊，掌握最新的合規及規劃資訊。",
      filters: {
        allTypes: "所有類型",
        taxPlanning: "稅務規劃",
        auditCompliance: "審計與合規",
        payrollMpf: "薪酬與強積金",
        advisory: "顧問服務",
        allLocations: "所有地點",
        centralOffice: "中環辦公室",
        onlineZoom: "網上 / Zoom",
        clientSite: "客戶地點",
      },
      card: {
        spotsLeft: "個名額",
        booked: "已預約",
        privateSession: "私人諮詢",
        min: "分鐘",
        bookConsultation: "預約諮詢",
        reserveSpot: "預留名額",
        registerNow: "立即登記",
        bookAuditReview: "預約審計評估",
      },
      sessions: {
        taxPlanning: {
          title: "一對一稅務規劃及顧問 (私人諮詢)",
          tags: ["稅務", "一對一"],
        },
        ptrClinic: {
          title: "香港利得稅 (PTR) 答疑診所",
          tags: ["合規", "小組工作坊"],
        },
        mpfMasterclass: {
          title: "強積金及香港薪酬合規大師班",
          tags: ["薪酬", "工作坊"],
        },
        auditReadiness: {
          title: "審計準備與文件審閱",
          tags: ["審計", "一對一"],
        },
        gbaStructuring: {
          title: "跨境稅務及大灣區架構工作坊",
          tags: ["顧問", "研討會"],
        },
      },
      locations: {
        centralZoom: "中環辦公室 / Zoom",
        boardroomHybrid: "會議室 / 混合模式",
        onlineWebinar: "網上研討會",
        centralOffice: "中環辦公室",
        hybrid: "混合模式",
      }
    },
    aboutPage: {
      title: "關於我們",
      body: "此頁為預留內容。事務所簡介、資歷與執業詳情將於稍後補充。",
      back: "返回主頁",
    },
  },
};
